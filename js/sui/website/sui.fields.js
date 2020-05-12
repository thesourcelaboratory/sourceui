$(function(){

	$.fn.suiFieldPicker = function(setup,cfg){
		var $input = $(this);
		var $a = $input.siblings('a');
		var $i = $a.siblings('i');
		var $b =  $a.siblings('b');
		var $triggers = $a.add($b).add($i);
		var $label = $a.parent();
		var $field = $label.parent();
		var $dialog = $(
			'<div class="sui-dialog">'+
			'<div class="container sn">'+
					'<div class="title">'+$label.children('b').text()+'</div>'+
					'<div class="content datagrid">'+
					'</div>'+
					'<div class="actions">'+
						'<div class="group">'+
							'<button class="close">Fechar</button>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'
		);
		var $datagrid = $dialog.find('.container > .content.datagrid');
		$field.append($dialog);
		$dialog.suiDialog();
		$input.on('change',function(){
			var $this = $(this);
			var value = $this.val();
			if (value === '') $a.html('');
		});
		$datagrid.on('click','.line', function(){
			var $this = $(this);
			var value = $this.data('key') || $this.data('value');
			$input.val(value);
			$a.html($this.html());
			$dialog.suiDialog('close');
		});


		$triggers.on('click',function(){

			if ($input.is(':disabled')) return false;
			var data = $.extend({},setup.data||{});
			var $fieldvals;
			if ($.type(setup.fieldvalues) == 'string'){
				$fieldvals = $(setup.fieldvalues);
			} else if (setup.fieldvalues instanceof jQuery){
				$fieldvals = setup.fieldvalues;
			}
			if ($fieldvals && $fieldvals.length){
				$fieldvals.each(function(k,v){
					var $this = $(this);
					var value = $this.val();
					if (setup.noEmptyFieldval && (value === '' || value === null)){
						$this.trigger('invalid',['Dado necessário']);
						data = {};
						return false;
					} else {
						data[$this.attr('name')] = value;
					}
				});
			}
			if (setup.noEmptyData && $.isEmptyObject(data)){
				$input.trigger('invalid',['Requer dados extras']);
				return false;
			}

			$dialog.suiDialog('open',$input);

			data[$input.attr('name')] = $input.val();
			setup.url = setup.url || setup.href || setup.link || setup.src;
			if (setup.url){
				$datagrid.load(setup.url, data, function(response, status, xhr){
					if ( status == "error" ) {
						$input.trigger('invalid',['Erro no servidor']);
					}
					if (setup.onDialogLoad) setup.onDialogLoad.call($dialog,response);
					$dialog.trigger('dialog:load');
				});
			} else {
				$input.trigger('invalid',['URL requerida']);
			}
		});

	}

	var filledinput = function(event){
		var $this = $(this);
		var $label = $this.closest('label');
		var val = $this.val();
		if (val === '' || val === null){
			if ($this.prop('tagName') == 'SELECT' && $this.attr('value')){
				$this.val($this.attr('value'));
				$label.addClass('filled');
			} else {
				$label.removeClass('filled');
			}
		}
		else $label.addClass('filled');
	};

	$('input, textarea, select, .sui-input').each(filledinput);
	$('input, textarea, select, .sui-input').on('change',filledinput);

	$(':input[data-mask], .sui-input[data-mask]').mascara();
	$(':input, .sui-input').on('invalid',function(event,type){
		var $this = $(this);
		var $suifield = $this.closest('.sui-field');
		var $mark = $this.siblings('mark');
		if (!$mark.length) $mark = $('<mark/>').appendTo($this.parent());
		$mark.text(type ? $.jMaskPatternsErrors[type] || type : 'Campo inválido');
		$this.addClass('error');
		$suifield.addClass('error');
	});
	$(':input, .sui-input').on('focus change input valid',function(){
		var $this = $(this);
		var $suifield = $this.closest('.sui-field');
		var $mark = $this.siblings('mark');
		var $form = $this.closest('form');
		if (!$mark.length) $mark.remove();
		$this.removeClass('error');
		$suifield.removeClass('error');
		$form.removeClass('invalid');
		$suifield.find(':input.error').trigger('valid');
	});
	$(':input[data-geolocation], .sui-input[data-geolocation]').on('change keypress',function(event){
		var $this = $(this);
		if (event.which === 13){
			event.preventDefault();
			$this.trigger('change');
			return false;
		}
		var $form = $this.closest('.sui-formgroup, form');
		var $targets = $form.find(':input[name*="Logradouro"], :input[name*="Endereco"], :input[name*="Bairro"], :input[name*="Cidade"], :input[name*="Municipio"], :input[name*="Estado"], :input[name*="Uf"]');
		var $fields = $targets.closest('.sui-field');
		var val = $this.val();
		if (val.length === 9){
			if ($this.data('geotested') === val) return true;
			var $loading = $('<div class="sui-loading"/>').appendTo($fields);
			if ($this.data('geolocation') == 'findAddressFromCEP'){
				$this.data('geotested',val);
				setTimeout(function(){
					suiGeolocation.findAddressFromCEP(val,{
						ondone: function(data){
							$targets.filter('[name*="Logradouro"], [name*="Endereco"]').val(data.logradouro).trigger('change');
							$targets.filter('[name*="Bairro"]').val(data.bairro).trigger('change');
							$targets.filter('[name*="Cidade"], [name*="Municipio"]').val(data.cidade).trigger('change');
							$targets.filter('[name*="Estado"]').val(data.estado).trigger('change');
							$targets.filter('[name*="Uf"]').val(data.uf).trigger('change');
							$loading.remove();
						}
					});
				},100);
			}
		}
	});
	$(':input[data-same], .sui-input[data-same]').on('blur',function(event){
		var $this = $(this);
		var $form = $this.closest('.sui-formgroup, form');
		var $fields = $form.find(':input[data-same="'+$this.data('same')+'"], .sui-input[data-same="'+$this.data('same')+'"]');
		var isSame = true;
		if ($fields.get(0) !== $this.get(0)){
			var val = $this.val();
			$fields.each(function(){
				var $fd = $(this);
				if ($fd.val() !== val){
					isSame = false;
				}
			});
		}
		if (!isSame){
			$fields.trigger('invalid',['Dados não conferem']);
		} else {
			$fields.trigger('valid');
		}
	});
	$('form').on('submit',function(event){
		var $form = $(this);
		var $fields = $form.find(':input');
		var valid = true;
		$fields.each(function(){
			var $field = $(this);
			if ($field.closest('.disable, .ignored').length || $field.is(':disabled, .disable, .ignored')){
				return true;
			}
			var val = $field.val();
			if (val === '' || val === null || typeof val == 'undefined'){
				if ($field.prop('required')){
					valid = false;
					$field.trigger('invalid');
				}
			} else {
				if ($field.attr('type') == 'password'){
					var pval = $field.val();
					$field.after('<input type="hidden" name="'+$field.attr('name')+'" value="'+$.md5(pval)+pval.length+'"/>');
					$field.removeAttr('name');
				}
				if (!$field.valida()){
					valid = false;
				}

			}
		});
		$form.removeClass('invalid');
		if (!valid) $form.addClass('invalid');
		else {
			$form.append('<div class="sui-loading"/>').find('input[type="submit"]').attr('value','Enviando dados...').prop('disabled',true);
		}
		return valid;
	});

});