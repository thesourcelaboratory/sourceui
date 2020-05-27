/*                                  _    __            ____
 ___  ___  _   _ _ __ ___ ___ _   _(_)  / _|_      __ | ___|
/ __|/ _ \| | | | '__/ __/ _ \ | | | | | |_\ \ /\ / / |___ \
\__ \ (_) | |_| | | | (_|  __/ |_| | | |  _|\ V  V /   ___) |
|___/\___/ \__,_|_|  \___\___|\__,_|_| |_|   \_/\_/   |____/

 * ---------------------------------------------------------
 * SourceUI Framework v5.0.1
 * Revision: 0001 by Marino Boscolo Neto
 * Date: 2015-08-12 17:10:05 +0300 (Wed, 18 aug 2015)
 * Dual licensed under the MIT and GPL licenses.
 * Copyright (c) 2006-2015 - SourceLab Tecnologia Ltda
 * --------------------------------------------------------- */

'use strict';


sourceui.customField = function (element, setup) {

	var Field = this; 								// o próprio objeto
	var Parser = new sourceui.parserField();  		// o objeto parser para os campos
	var Interface = sourceui.instances.interface; 	// o objeto de interface globa Plugin.sector.float({
	var Network = sourceui.instances.network;		// objeto de conectividade
	var Device = sourceui.instances.device;			// objeto de conectividade
	var Plugin = Interface.plugins;
	var Notify = Plugin.notify;
	var Confirm = Plugin.confirm;
	var XML = Element;
	var Element = element; 							// o elemento como argumento de entrada
	var valueValid = null; 							// flag para o analizador se a estrutura do html é válida ou não
	var Group = {}; 									// coleção de objetos jquery para um grupo de campos de mesmo nível
	var Dom = {}; 								 	// coleção de objetos jquery para as partes que compõem um campo
	var Data = {};									// objeto contendo os atributos data do campo
	var JSONX = JSON5 || JSON;
	/*
	---------------------------
	protected Field.Bind()
	---------------------------
	Coleção de métodos para criação de eventos padrão do campo
	---------------------------
	*/

	var Promises = {
		visible: function () {
			return new Promise(function (resolve, reject) {
				if (!Element.is(':visible')) {
					var readyinterval = setInterval(function () {
						if (Element.is(':visible')) {
							resolve(true);
							clearInterval(readyinterval);
						}
					}, 100);
				} else {
					resolve(true);
				}
			});
		}
	};

	var Bind = {
		common: {
			buttons: {
				test: function () {
					Dom.buttons.all.each(function () {
						var $button = $(this),
							value = Field.val(),
							data = $button.data();
						if (value == '' && (data.alias == 'google' || data.alias == 'href' || data.alias == 'mailto' || data.alias == 'phone' || data.alias == 'location' || data.alias == 'look')) {
							$button.addClass('disable');
						} else {
							$button.removeClass('disable');
						}
					});
				},
				simple: function () {
					Dom.buttons.all.on('click', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $button = $(this),
							data = $button.data(),
							value = Field.val(),
							callback = function () { };
						if (data.alias == 'google') {
							if (value && Validate.test.all()) {
								Confirm.open({
									title: Dom.label.text(),
									desc: 'O que você gostaria de fazer com o termo informado <strong style="white-space:nowrap;">' + value + '</strong>?',
									button: [
										{ background: '#4F8DDA', label: 'Pesquisar no Google', href: 'https://www.google.com.br/search?q=' + encodeURI(value), target: '_blank' },
										{ background: '#4F8DDA', label: 'Copiar', clipboard: value },
										//{background:'#4F8DDA',label:'Pesquisar no Google',callback:function(){window.open('https://www.google.com.br/search?q='+encodeURI(value));}},
									]
								});
							}
						} else if (data.alias == 'href') {
							value = ($.isArray(value)) ? value.join(' ') : value;
							if (value && Validate.test.all()) {
								Confirm.open({
									title: Dom.label.text(),
									desc: 'O que você gostaria de fazer com o link <strong style="white-space:nowrap;">' + value + '</strong>?',
									button: [
										{ background: '#4F8DDA', label: 'Abrir no Navegador', href: encodeURI(value), target: '_blank' },
										//{background:'#4F8DDA',label:'Copiar URL',callback:function(){window.open(encodeURI(value));}},
									]
								});
							}
						} else if (data.alias == 'mailto') {
							value = ($.isArray(value)) ? value.join(' ') : value;
							if (value && Validate.test.all()) {
								Confirm.open({
									title: Dom.label.text(),
									desc: 'O que você gostaria de fazer com endereço de e-mail <strong style="white-space:nowrap;">' + value + '</strong>?',
									button: [
										{ background: '#4F8DDA', label: 'Enviar uma mensagem', href: 'mailto:' + encodeURI(value) },
										{ background: '#4F8DDA', label: 'Copiar', clipboard: value },
										//{background:'#4F8DDA',label:'Copiar endereço',callback:function(){window.open('mail://'+encodeURI(value));}},
									]
								});
							}
						} else if (data.alias == 'phone') {
							value = ($.isArray(value)) ? value.join(' ') : value;
							if (value && Validate.test.all()) {
								Confirm.open({
									title: Dom.label.text(),
									desc: 'O que você gostaria de fazer com o número de telefone <strong style="white-space:nowrap;">' + value + '</strong>?',
									button: [
										{ background: '#4F8DDA', label: 'Fazer uma chamada ', href: 'tel:' + encodeURI(value) },
										{ background: '#4F8DDA', label: 'Copiar', clipboard: value },
										//{background:'#4F8DDA',label:'Copiar numero',callback:function(){alert(value);}},
									]
								});
							}
						} else if (data.alias == 'location') {
							if (value && valueValid) {
								Confirm.open({
									title: Dom.label.text(),
									desc: 'O que você gostaria de fazer com a localização <strong style="white-space:nowrap;">' + value + '</strong>?',
									button: [
										{ background: '#4F8DDA', label: 'Abrir no Google Maps', href: 'comgooglemaps://?search=' + encodeURI(value) },
										{ background: '#4F8DDA', label: 'Abrir em Mapas', href: 'maps://?q=' + encodeURI(value) },
										{ background: '#4F8DDA', label: 'Copiar', clipboard: value },
										//{background:'#4F8DDA',label:'Abrir no Google Maps',callback:function(){window.open('https://www.google.com.br/maps/search/'+encodeURI(value));}},
										//{background:'#4F8DDA',label:'Copiar endereço',callback:function(){window.open('https://www.google.com.br/maps/search/'+encodeURI(value));}},
									]
								});
							}
						}
						event.stopPropagation();
					});
					Element.on('field:input', function () {
						Bind.common.buttons.test();
					});
					Bind.common.buttons.test();
					if (Dom.buttons.all.filter(':has(.sui-droplist)').length) Bind.common.droplist.inbutton();
				},
				password: function () {
					Dom.buttons.all.filter('[data-alias="look"]').on('click', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $button = $(this);
						if (Element.hasClass('password')) {
							if (Dom.input.css('webkitTextSecurity')) {
							} else if (Dom.input.hasClass('password')) {
								Dom.input.attr('type', 'text');
							}
							Element.switchClass('password', 'text');
							$button.switchClass('icon-eye2', 'icon-eye-blocked');
						} else {
							if (Dom.input.css('webkitTextSecurity')) {
							} else {
								Dom.input.attr('type', 'password');
							}
							Element.switchClass('text', 'password');
							$button.switchClass('icon-eye-blocked', 'icon-eye2');
						}
						event.stopPropagation();
					});
					Element.on('field:input', function () {
						Bind.common.buttons.test();
					});
					Bind.common.buttons.test();
				},
				spin: function () {
					Dom.buttons.all.on('click', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
					});
					Dom.buttons.all.filter('[data-alias="minus"]').on('click', function () {
						var value = parseInt(Field.val()) || 0;
						if (typeof value == 'number') value -= Data.step || 1;
						Field.val(value);
						Element.trigger('field:change');
					});
					Dom.buttons.all.filter('[data-alias="plus"]').on('click', function () {
						var value = parseInt(Field.val()) || 0;
						if (typeof value == 'number') value += Data.step || 1;
						Field.val(value);
						Element.trigger('field:change');
					});
					Element.on('field:min', function () {
						Dom.buttons.all.removeClass('disable').filter('[data-alias="minus"]').addClass('disable');
					});
					Element.on('field:max', function () {
						Dom.buttons.all.removeClass('disable').filter('[data-alias="plus"]').addClass('disable');
					});
					Element.on('field:ok field:error', function () {
						Dom.buttons.all.removeClass('disable');
					});
				},
				droplist: function () {
					Dom.buttons.all.filter('[data-alias="droplist"]').on('click', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $this = $(this);
						if (!Element.hasClass('droplisted')) {
							Dom.droplist.trigger('droplist:open');
						} else {
							Dom.droplist.trigger('droplist:close');
						}
						$(document).trigger('activity:focusin', [Element]);
						event.stopPropagation();
					});
				}
			},
			label: function () {
				Dom.label.on('click', function (event) {
					if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
					var $input;
					if (Group.element.length) $input = Group.element.find('.sui-field:eq(0) .input[type!="hidden"]');
					else $input = Dom.wrap.find('.input[type!="hidden"]:eq(0)');
					if ($input.length && $input.is(':visible')) $input.focus();
					else Element.trigger('field:focus');
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.notify.on('click', function (event) {
					$(document).trigger('click');
					Element.trigger('field:focus');
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
			},
			cell: function () {
				Bind.common.label();
				Dom.wrap.find('.cell.value, .cell.prefix, .cell.sufix, .cell.lang, .cell.search').on('click', function (event) {
					var $input = Dom.wrap.find('.input[type!="hidden"]:eq(0)');
					var $search = Dom.wrap.find('input.search:eq(0)');
					if ($input.length) $input.focus();
					else if ($search.length) $search.focus();
					else Element.trigger('field:focus');
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.wrap.find('.cell.button').on('click', function (event) {
					Element.trigger('field:focus');
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.wrap.find('.cell').on('click', '.option', function (event) {
					var $dropbutton = Dom.buttons.all.filter('[data-alias="droplist"]');
					if ($dropbutton.length && Data.mode == 'single') $dropbutton.trigger('click');
					if (Device.ismobile) Dom.droplistsearch.focus();
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.wrap.find('.cell').on('click', '.placeholder', function (event) {
					var $dropbutton = Dom.buttons.all.filter('[data-alias="droplist"]');
					if ($dropbutton.length) $dropbutton.trigger('click');
					if (Device.ismobile) Dom.droplistsearch.focus();
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.wrap.find('.cell').on('click', '.option > .remove', function (event) {
					$(document).trigger('click');
					Element.trigger('field:focus');
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
			},
			input: function () {
				if (Device.ismobile) {
					Element.find(':input').on('focusin', function () {
						$('#suiBody').addClass('keyboarded');
					}).on('focusout', function () {
						$('#suiBody').removeClass('keyboarded');
					});
				}
				Dom.search.on('click', function (event) {
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.search.on('focus', function (event) {
					Element.trigger('field:focus');
				});
				Dom.input.on('click', function (event) {
					$(document).trigger('activity:focusin', [Element]);
					event.stopPropagation();
				});
				Dom.input.on('focus', function () {
					$(document).trigger('click');
					Element.trigger('field:focus');
					$(document).trigger('activity:focusin', [Element]);
				});
				Dom.input.on('input', function () {
					Element.trigger('field:input');
				});
				Dom.input.on('change', function () {
					Element.trigger('field:change');
					if (Element.hasClass('keyboard')){
						Element.trigger('field:keyboard');
						Element.removeClass('keyboard');
					}
				});
				Dom.input.on('keypress', function (event) {
					Element.addClass('keyboard');
					if (event.which === 8) Element.trigger('field:backspace');
					else if (event.which === 9) Element.trigger('field:tab');
					else if (event.which === 13) Element.trigger('field:enter');
					else if (event.which === 27) Element.trigger('field:esc');
					else if (event.which === 46) Element.trigger('field:delete');
				});
				if (Dom.input.css('webkitTextSecurity')) {
				} else if (Dom.input.hasClass('password')) {
					Dom.input.attr('type', 'password');
				}
			},
			text: function () {
				Mask.set();
				Bind.common.input();
				Bind.common.cell();
				Validate.required().limit().size().same().remote().mask();
				Element.trigger('field:loaded');
			},
			search: function () {
				Bind.common.input();
				Bind.common.buttons.droplist();
				Validate.required();
				var xhr,
					tempSetup = {};
				Dom.search.on('click', function (event) {

				});
				Dom.search.add(Dom.input).on('input', function (event) {
					Element.trigger('field:search', [this.value]);
				});
				Dom.droplistsearch.on('input', function (event) {
					Element.trigger('field:search', [this.value]);
				});
				Element.on('field:search', function (event, value) {
					var $items = Dom.droplist.find('.options li');
					if (value != '') {
						if (!Device.ismobile && !Element.hasClass('droplisted')) Dom.droplist.trigger('droplist:open');
						$items.hide();
						$items.filter(':containsNC("' + value + '")').show();
						Dom.listoptions.unmark().mark(value);
					} else {
						//if (!Device.ismobile) Dom.droplist.trigger('droplist:close');
						Dom.listoptions.unmark();
						$items.show();
					}
					Dom.listoptions.scrollTop(0);
				});
				Element.trigger('field:loaded');
			},
			droplist: {
				all: function () {
					Validate.required();
					Element.trigger('field:loaded');
				},
				options: function () {
					Bind.common.droplist.all();
					Dom.droplist.off().on('click', '.options > ul > li', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $item = $(this),
							$droplist = $item.closest('.sui-droplist'),
							$options = $droplist.children('.options');
						if (Data.mode == 'multiple') {
							if ($item.hasClass('selected')) {
								$item.removeClass('selected');
								$droplist.trigger('droplist:unselect', [$item]);
							} else {
								$item.addClass('selected');
								$droplist.trigger('droplist:select', [$item]);
							}
						} else {
							if (!$item.hasClass('selected')) {
								$options.find('li.selected').removeClass('selected');
								$item.addClass('selected');
								$droplist.trigger('droplist:select', [$item]);
							}
						}
						//Element.closest('.scroll-custom').perfectScrollbar('update');
					});

				},
				inbutton: function () {
					Bind.common.droplist.options();
					Dom.buttons.all.filter(':has(.sui-droplist)').on('click', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $button = $(this),
							$list = $button.find('.sui-droplist');
						if (!$list.data('toggler')) $list.data('toggler', $button);
						if (!$button.hasClass('listopened')) {
							$button.addClass('listopened'); $list.trigger('droplist:open');
						} else {
							$button.removeClass('listopened'); $list.trigger('droplist:close');
						}
					});
					Dom.buttons.all.find('.sui-droplist').on('droplist:select', function (event, $item) {
						var $cell = $item.closest('.cell'),
							$input = $cell.find('.input'),
							$label = $cell.find('span'),
							value = $item.data('value');
						$input.val(value);
						if ($label.length) $label.replaceWith('<span>' + value + '</span>');
						else $cell.prepend('<span>' + value + '</span>');
						$(this).trigger('field:input').trigger('droplist:close');
					});
					Element.trigger('field:loaded');
				},
				select: function () {
					Bind.common.cell();
					Bind.common.droplist.options();
					if (Data.mode == 'multiple') {
						Dom.value.on('click', function (event) {
							var $dropbutton = Dom.buttons.all.filter('[data-alias="droplist"]');
							$dropbutton.trigger('click');

						});
						Dom.value.on('click', '.option', function (event) {
							var $item = $(this);
							if ($item.is('.picked')) Element.trigger('field:optionunpicked', [$item]);
							else Element.trigger('field:optionpicked', [$item]);
							$(document).trigger('activity:focusin', [Element]);
							event.stopPropagation();
						});
						Element.on('field:optionpicked', function (event, $item) {
							$item.addClass('picked');
						});
						Element.on('field:optionunpicked', function (event, $item) {
							$item.removeClass('picked');
						});
					}
					Dom.value.on('click', '.option .remove', function (event, fake) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $this = $(this);
						var $option = $this.parent();
						var $item = Dom.droplist.find('.options li[data-value="' + $option.find('.input').val() + '"]').removeClass('selected');
						$option.remove();
						Element.trigger('field:optionremoved', [$item]);
						if (Dom.value.find('.option').length == 0) Field.val('');
						if (Data.mode == 'multiple') Dom.badge.text(Dom.options.find('.option').length);
						if (!fake) Element.trigger('field:change');
					});
					Dom.droplist.on('droplist:select', function (event, $item) {
						var $droplist = $(this).unmark();
						var $doument = $(document);
						Value.seed('+', $item.data('seed'));
						Field.val($item);
						if (Data.mode == 'single') $doument.trigger('droplist:close');
						if (Data.mode == 'multiple'){
							Dom.badge.text(Dom.options.find('.option').length);
							if ($item.siblings(':not(.selected)').length === 0){
								$doument.trigger('droplist:close');
							}
						}
						Element.trigger('field:change', [$item.data('value')]);
					});
					Dom.droplist.on('droplist:unselect', function (event, $item) {
						var $droplist = $(this).unmark();
						Dom.value.find('.input[value="' + $item.data('value') + '"]').nextAll('.remove').trigger('click');
						if (Data.mode == 'single' && $droplist.data('toggler')) $droplist.data('toggler').trigger('click');

					});
					Element.on('field:optionremoved', function (event, $item) {
						Value.seed('-', $item.data('seed'));
					});
					Element.trigger('field:loaded');
				},
				search: function () {
					Bind.common.droplist.select();
					Dom.search.on('focus', function (event) {
						if ($.CURR.droplist && $.CURR.droplist[0] !== Dom.droplist[0]) {
							$(document).trigger('droplist:close');
						}
					});
					Dom.droplist.on('droplist:select', function (event, $item) {
						if (Data.mode == 'multiple') {
							Dom.search.val('').focus();
							Element.trigger('field:search', ['']);
						} else {
							$(this).trigger('droplist:close');
						}
					});
					Element.on('field:optionremoved', function (event, $item) {
						Dom.search.val('');
						Element.trigger('field:search', ['']);
					});
					Element.trigger('field:loaded');
				},
				toolbars: function () {
					var $tools = $list.find('.tools'),
						$reload = $tools.find('.reload'),
						$search = $tools.find('.search > input.search');
					$search.on('input', function () {
						var $items = Dom.droplist.find('.options li');
						var $this = $(this),
							value = $this.val();
						if (value.length > 0) {
							$items.hide();
							$items.filter(':containsNC("' + value + '")').show();
						} else {
							$items.show();
						}
						//Dom.droplist.find('.scroll-custom').perfectScrollbar('update');
					});
					$reload.on('click', function () {
						var $this = $(this);
						var setup = {
							target: '@field-list',
							render: '@field-listitems',
							cache: false,
							field: Element
						};
						Network.link.call($this, setup);
					});
				},
				datepicker: function () {
					Bind.common.droplist.all();
					var $calendar = Dom.droplist.find('.calendar');
					var value = Caller[Data.type].getval();
					if (Data.type == 'date') {
						if (Data.mode == 'simple') {
							Field.addon = $calendar.calendar({ toggle: true, modeTabs: true, date: value });
							$calendar.on('select', function (event, date) {
								Element.val(date);
								Element.trigger('field:change', [true]);
								Dom.droplist.trigger('droplist:close');
							});
							$calendar.on('unselect', function (event) {
								Element.val('');
								Element.trigger('field:change', [true]);
							});
							Element.on('field:change', function (event, fake) {
								if (!fake) $calendar.calendar('setDate', Element.val());
							});
						} else if (Data.mode == 'full') {
							Field.addon = $calendar.calendar({ toggle: true, modeTabs: true, date: value });
							$calendar.on('select', function (event, date) {
								Element.val(date);
								Element.trigger('field:change', [true]);
								Dom.droplist.trigger('droplist:close');
							});
							$calendar.on('unselect', function (event) {
								Element.val('');
								Element.trigger('field:change', [true]);
							});
							Dom.value.on('click', '.option .remove', function (event) {
								Element.val('');
								$calendar.calendar('setDate', '');
							});
						} else if (Data.mode == 'range') {
							Field.addon = $calendar.calendar({ modeTabs: true, range: value });
							$calendar.on('select', function (event, ini, end) {
								Element.val([ini, end]);
								Element.trigger('field:change', [true]);
							});
							Element.on('field:change', function (event, fake) {
								var val = Element.val(), v = [];
								if (!fake) $calendar.calendar('setRange', val);
								v[0] = val[0] ? $.toDate(val[0], 'obj').getTime() : 0;
								v[1] = val[1] ? $.toDate(val[1], 'obj').getTime() : 0;
								if (v[0] > v[1]) Element.trigger('field:error', ['daterange', 'Intervalo inválido']);
							});
						}
					} else if (Data.type == 'time') {
						if (Data.mode == 'simple') {
							Field.addon = $calendar.calendar({ mode: 'time', modeTabs: true, time: value });
							$calendar.on('select', function (event, date) {
								Element.val(date);
								Element.trigger('field:change', [true]);
							});
							Element.on('field:change', function (event, fake) {
								if (!fake) $calendar.calendar('setTime', Element.val());
							});
						} else if (Data.mode == 'full') {
							Field.addon = $calendar.calendar({ mode: 'time', modeTabs: true, fulltime: true, time: value });
							$calendar.on('select', function (event, date) {
								Element.val(date);
								Element.trigger('field:change', [true]);
							});
							Element.on('field:change', function (event, fake) {
								if (!fake) $calendar.calendar('setTime', Element.val());
							});
						}
					} else if (Data.type == 'datetime') {
						if (Data.mode == 'simple') {
							Field.addon = $calendar.calendar({ mode: 'datetime', modeTabs: true, date: value });
							$calendar.on('select', function (event, date) {
								Element.val(date);
								Element.trigger('field:change', [true]);
							});
							Element.on('field:change', function (event, fake) {
								if (!fake) $calendar.calendar('setDate', Element.val());
							});
						} else if (Data.mode == 'full') {
							Field.addon = $calendar.calendar({ mode: 'datetime', modeTabs: true, date: value });
							$calendar.on('select', function (event, date) {
								Element.val(date);
								Element.trigger('field:change', [true]);
							});
							Dom.value.on('click', '.option .literaldate', function (event, fake) {
								$calendar.find('.modetabs > .date').trigger('click');
							});
							Dom.value.on('click', '.option .literaltime', function (event, fake) {
								$calendar.find('.modetabs > .time').trigger('click');
							});
							Dom.value.on('click', '.option .remove', function (event) {
								Element.val('');
								$calendar.calendar('setDate', '');
								Element.trigger('field:change', [true]);
							});
						}
					}
				},
				clockpicker: function () {
					var $clock = Dom.droplist.find('.clock');
					$clock.clockpicker({
						defaultTime: Dom.input.val(),
						onSelect: function (time) {
							var value = $.extractTime(time), ival = Dom.input.val(), itime = $.extractTime(ival);
							value = (Data.mode == 'datetime') ? ($.extractDate(ival) || '00/00/0000') + ' ' + value : value;
							Dom.input.val(value);
							if (itime !== time) Element.trigger('field:input');
						},
					});
					Element.on('field:change', function () {
						$clock.clockpicker('setTime', Dom.input.val() || '00:00:00');
					});
					Element.trigger('field:loaded');
				},
				spectrum: function () {
					var $spectrum = Dom.droplist.find('.spectrum');
					var $picker = Dom.wrap.find('.button.picker .color');
					$spectrum.spectrum({
						color: Dom.input.val(),
						flat: true,
						preferredFormat: "hex",
						showInput: false,
						showAlpha: true,
						showButtons: false,
						move: function (color) {
							Dom.input.val(color);
							$picker.css('background-color', color.toRgbString());
							Element.trigger('field:input');
						},
						change: function (color) {
							Dom.input.val(color);
							$picker.css('background-color', color.toRgbString());
							Element.trigger('field:change');
						}
					});
					Dom.droplist.on('droplist:open', function () {
						setTimeout(function () { $spectrum.spectrum('reflow'); }, 1);
					});
					Element.on('field:input', function () {
						var val = Dom.input.val();
						if (val){
							$spectrum.spectrum('set', Dom.input.val());
							$picker.css('background-color', $spectrum.spectrum('get').toRgbString());
						} else {
							$picker.css('background-color', 'transparent');
						}
					});
					Element.trigger('field:loaded');
				},
				palette: function () {
					var $palette = Dom.droplist.find('.palette');
					var $picker = Dom.wrap.find('.button.picker .color');
					$palette.palette($.extend(Data.vars || {}, { selected: Dom.input.val() }));
					$picker.css('background-color', Dom.input.val() || 'transparent');
					$palette.on('click', 'ul > li > div', function () {
						var $this = $(this);
						var value = $this.data('value');
						Dom.input.val(value);
						$picker.css('background-color', value);
						$palette.find('ul > li > div.selected').removeClass('selected');
						$this.addClass('selected');
						Element.trigger('field:input').trigger('field:change');
					});
					Element.trigger('field:loaded');
				}
			},
			picker: {
				single: function () {
					Validate.required();
					Dom.buttons.all.filter('[data-alias="browse"]').on('click', function (event) {
						/* ja existe essa parada
						if (Data.vars){
							$.each(Data.vars.filter||[],function(k,v){
								var $fd;
								if (v.indexOf('#')===0) $fd = Element.closest('.sui-sector').find(v);
								else if (v.indexOf('@')===0) $fd = Element.closest('.sui-sector').find('[data-name="'+v.substring(1)+'"]');
								console.log(k,v,$fd);
								if ($fd && $fd.is('.sui-field')) Data.vars.filter[k] = $fd.val();
							});
						}
						*/
						var linkdata = $.extend(true, {}, Data.vars, { filter: { picked: Element.val() } });
						Plugin.sector.float({
							caller: Element,
							title: 'Seletor',
							size: linkdata.sectorsize || 'large',
							link: linkdata,
							on: {
								'alias:pick': {
									bind: Element,
									fn: function (regs) {
										$(regs).each(function () {
											var val = {};
											var $this = $(this);
											var ldata = $this.data();
											if (ldata.linkKey) val.key = ldata.linkKey;
											if (ldata.linkSeed) val.seed = ldata.linkSeed;
											if (ldata.type) val.type = ldata.type;
											if ($this.is('.line')) {
												$this.children('.col').each(function () {
													var $col = $(this);
													if ($col.hasClass('visualidentifier')) {
														if ($col.hasClass('fsimage')) val.fsimage = $col.find('img').attr('src') || $("<div/>").append($col.find('i').clone().switchClass('m', 'p')).html();
														else if ($col.hasClass('image')) val.image = $col.children('.img').css('background-image') || $col.css('background-image');
														else if ($col.hasClass('icon')) val.icon = $col.children('.icon').attr('class') || $col.attr('class');
													} else {
														if ($col.hasClass('name')) val.name = $col.html();
														else if ($col.hasClass('info') && $col.hasClass('important')) val.info = $col.html();
														else if ($col.hasClass('important') && $col.is(':visible') && this.nodeName != 'MARK') val.info = $col.html();
													}
												});
											} else if ($this.is('.node')) {
												var $label = $this.children('.label');
												val.fsimage = $label.find('img').attr('src') || $("<div/>").append($label.find('.fsimage i').clone().switchClass('m', 'p')).html() || null;
												val.image = $label.children('.image').css('background-image') || null;
												val.icon = $label.children('.icon').attr('class');
												val.name = $label.children('.name').html();
											}
											Field.val(val);
											Element.find('.cell.value').velocity({ opacity: [1, 0.5], scale: [1, 1.2] }, { duration: 200 });
										});
										Element.trigger('field:change');
									}
								},
								'alias:pickself': {
									bind: Element,
									fn: function (val) {
										Field.val(val);
										Element.trigger('field:change');
									}
								}
							}
						});
						event.stopPropagation();
					});
					Dom.wrap.find('.cell').on('click', '.option, .placeholder', function (event) {
						var $dropbutton = Dom.buttons.all.filter('[data-alias="browse"]');
						if ($dropbutton.length) $dropbutton.trigger('click');
						Element.trigger('field:focus');
						event.stopPropagation();
					});
					Dom.value.on('click', '.option .remove', function (event, fake) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $this = $(this);
						var $option = $this.parent();
						Value.seed('-', $option.data('seed'));
						$option.remove();
						if (Dom.value.find('.option').length == 0) Field.val('');
						if (Data.mode == 'multiple') Dom.badge.text(Dom.options.find('.option').length);
						if (!fake) Element.trigger('field:change');
						$(document).trigger('activity:focusin', [Element]);
						event.stopPropagation();
					});
					Element.trigger('field:loaded');
				}
			},
			switch: {
				simple: function () {
					Bind.common.label();
					var $button = Dom.box.find('.cell.button');
					var buttonWidth = $button.outerWidth() / 2;
					var closureWidth = $button.parent().width() / 2;
					var xMovement = false;
					var $y = Dom.box.find('.yes');
					var $n = Dom.box.find('.not');
					Dom.box.on('click', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $yn, $track = Dom.box.children('.track'), $button = Dom.box.children('.button');
						Element.toggleClass('not');
						if (Element.hasClass('not')) $yn = $n;
						else $yn = $y;
						Dom.input.val($yn.data('value'));
						$track.css('background-color', $yn.css('background-color') || 'inherit');
						$button.css('border-color', $yn.css('background-color') || 'inherit');
						Element.trigger('field:focus').trigger('field:input').trigger('field:change');
						$(document).trigger('activity:focusin', [Element]);
						event.stopPropagation();
					});
					Dom.box.on('swipeleft', function (event) {
						if (!Element.hasClass('not')) {
							Dom.box.trigger('click');
						}
					});
					Dom.box.on('swiperight', function (event) {
						if (Element.hasClass('not')) {
							Dom.box.trigger('click');
						}
					});
					Element.trigger('field:loaded');
				}
			},
			slider: {
				simple: function () {
					Validate.required();
					$.each(Dom.wrap.find('.nouislider'), function () {
						var $this = $(this).show();
						var config = $.extend(Data.vars, JSONX.parse($this.text()));
						config.start = ($.type(config.start) == 'string') ? JSONX.parse(config.start) : config.start;
						if (!config.connect) {
							if ($.type(config.start) !== 'array' || config.start.length === 1) config.connect = [true, false];
							else if (config.start.length === 2) config.connect = [false, true, false];
						}
						//config.tooltips = true;
						if (!config.format) {
							config.format = {
								to: function (value) {
									return (config.unit) ? Math.round(value) + ' ' + config.unit : Math.round(value);
								},
								from: function (value) {
									return (config.unit) ? value.replace(' ' + config.unit) : value;
								}
							};
						}
						$this.html('');
						var nouislider = noUiSlider.create(this, config);
						if (!config.tooltips) {
							this.noUiSlider.on('update', function (values, handle) {
								if (values.length === 1) $this.parent().children('.sufix').text(values[0]);
								if (values.length === 2) {
									$this.parent().children('.prefix').text(values[0]);
									$this.parent().children('.sufix').text(values[1]);
								}
							});
						}
						Element.data('nouislider', nouislider);
					});
					Element.trigger('field:loaded');
				},
			},
			file: {
				single: function () {
					Validate.required();
					var $input = Dom.wrap.children('.input');
					var $filelist = Dom.queue.children('.files');
					var $instruction = $filelist.children('.instruction');
					var $browse = Dom.tools.find('.browse');
					Bind.common.label();
					Data.vars.general = Data.vars.general || {};
					Data.vars.upload = Element.link(Data.vars.upload || {});
					Data.vars.crop = Data.vars.crop || {};
					if (Data.vars.upload.accept) $input.attr('accept', Data.vars.upload.accept);
					if (Data.vars.upload.minfilesize) Data.vars.upload.minfilesize = $.toNumber(Data.vars.upload.minfilesize);
					if (Data.vars.upload.maxfilesize) Data.vars.upload.maxfilesize = $.toNumber(Data.vars.upload.maxfilesize);
					if (Data.vars.upload.minwidth) Data.vars.upload.minwidth = $.toNumber(Data.vars.upload.minwidth);
					if (Data.vars.upload.minheight) Data.vars.upload.minheight = $.toNumber(Data.vars.upload.minheight);

					Dom.wrap.on('click', function (event) {
						Element.trigger('field:focus');
						event.stopPropagation();
					});
					Dom.tools.find('.browse').on('click', function () {
						var $clone = $input.clone();
						$input.remove();
						Dom.wrap.prepend($clone);
						$input = $clone;
						$input.click();
					});
					Dom.wrap.on('change', '.input.file', function () {
						Element.val(this.files[0]);
						this.value = null;
					});
					$filelist.on('click', '.file.remote', function (event) {
						if (Validate.is.disable(event)) { event.stopImmediatePropagation(); return false; }
						var $file = $(this);
						if ($file.hasClass('image')) {
							var $imgedit = $('#suiImageEdit');
							var $cover = $file.find('.cover');
							Plugin.imgEditor.open({
								source: $file,
								asset: 'view',
								assets: Data.vars.assets || (Data.mode == 'avatar' ? ['view', 'remove'] : null),
								crop: Data.vars.crop,
								caption: !!Data.vars.caption,
								oncaption: function(caption){
									Element.trigger('image:caption', [$file,caption]);
								},
								onremove: function (image) {
									Element.trigger('file:unlink', [$file]);
								}
							});
						} else if ($file.hasClass('video')) {

						} else if ($file.data('href')) {
							Network.link({ href: $file.data('href'), popup: true });
						}
					});
					$filelist.on('click', '.file.remote .button.remove', function (event) {
						event.stopPropagation();
						var $file = $(this).parent();
						var label = Dom.label.text().replace('*', '');
						Confirm.open({
							title: 'Remover ' + label,
							desc: 'Você está prestes a remover o arquivo <strong>' + label + '</strong> do servidor.<br>' +
								'Se você continuar, esta ação <strong style="white-space:nowrap;">não poderá ser desfeita</strong>.',
							button: [
								{
									background: '#E85348', label: 'Remover o arquivo', callback: function () {
										Element.trigger('file:unlink', [$file]);
									}
								}
							]
						});
					});
					Element.on('file:unlink', function (event, $file) {
						var fda = $file.data();
						var data = $.extend({}, {
							process: 'unlink'
						}, Data.vars.unlink);
						data.fdata = fda.fdata ? fda.fdata : fda;
						Element.disable(true);
						Dom.wrap.addClass('ajax-courtain');
						data.ondone = function () {
							Element.trigger('field:fileremove', [$file]);
							$instruction.velocity({ opacity: [1, 0], scale: [1, 0.5] }, { duration: 250, display: 'block' });
							$file.remove();
							Element.trigger('field:change');
						};
						data.onfail = function () {
							Element.trigger('field:error', ['remove', 'Erro ao remover']);
							$file.trigger('tools:on');
						};
						data.onalways = function () {
							Element.disable(false);
							Dom.wrap.removeClass('ajax-courtain');
						};
						Network.link.call($file, data);
						$file.trigger('tools:off');
						return;
					});
					Element.on('image:caption', function (event, $file, caption) {
						var fda = $file.data();
						var data = $.extend({},
							Data.vars.caption, {
								str: caption
							});
						data.fdata = fda.fdata ? fda.fdata : fda;
						Element.disable(true);
						Dom.wrap.addClass('ajax-courtain');
						data.ondone = function () {
							Element.trigger('field:imagecaption', [$file]);
							Element.trigger('field:change');
							$file.find('.caption').text(caption);
						};
						data.onfail = function () {
							Element.trigger('field:error', ['remove', 'Erro ao legendar']);
							$file.trigger('tools:on');
						};
						data.onalways = function () {
							Element.disable(false);
							Dom.wrap.removeClass('ajax-courtain');
						};
						Network.link.call($file, data);
						$file.trigger('tools:off');
						return;
					});
					Element.on('image:checkload', function () {
						var $image = Element.find('.image > img:eq(0)');
						if ($image.length) {
							$('<img/>')
								.on('load', function () {
									if (Data.vars.trianglifycover) {
										var $cover = Element.closest('.sui-view').children('.sui-cover');
										$.imgCover($cover, Data.vars.trianglifycover, this);
									}
								})
								.on('error', function () {

								})
								.attr('src', $image.attr('src'));
						}
					});
					Element.trigger('image:checkload');
					Element.on('queue:add', function (event, $file) {
						var $upload = $file.find('.button.upload');
						var $crop = $file.find('.button.crop');
						var $remove = $file.find('.button.remove');
						$file.addClass('queue');
						var $oldfile = Dom.queue.children('.files').find('.file:not(.queue)');
						$browse.velocity({ opacity: [0, 1], scale: [0.5, 1] }, { duration: 250, display: 'none' });
						$instruction.velocity({ opacity: [0, 1], scale: [0.5, 1] }, { duration: 250, display: 'none' });
						$oldfile.hide();
						$file.velocity({ opacity: [1, 0], scale: [1, 1.3] }, { duration: 250, display: 'block' });
						var fda = $file.data('data');
						$file.data('pct', 0);
						$file.on('dash:prepare', function () {
							var $circle = $file.find('.circle');
							var $prepare = $circle.find('.prepare').css('opacity', 1).show();
							$circle.velocity({ opacity: [1, 0] }, { duration: 500, display: 'block' });
						});
						$file.on('dash:start', function () {
							var $prepare = $file.find('.prepare');
							$file.find('.donut').css('opacity', 1);
							$prepare.velocity({ opacity: [0, 1] }, { duration: 500, display: 'none' });
						});
						$file.on('dash:progress', function () {
							var $donut = $file.find('.donut');
							var dashData = $file.data('dash');
							var o;
							var r = dashData.r = dashData.r || parseFloat($donut.attr('r'));
							var c = dashData.c = dashData.c || parseFloat($donut.attr('stroke-dasharray'));
							var p = $file.data('pct');
							if (!c) {
								c = Math.PI * (r * 2);
								$donut.attr('stroke-dasharray', c);
							}
							if (p > 0) {
								if (p > 100) p = 100;
								o = ((100 - p) / 100) * c;
							} else {
								o = c;
							}
							dashData.o = dashData.o || c;
							$donut.velocity("stop").velocity({ 'stroke-dashoffset': o, tween: [o, dashData.o] }, { duration: 500, easing: "linear" });
							dashData.o = o;
							$file.data('dash', dashData);
						});
						$file.on('dash:stop', function () {
							var $donut = $file.find('.donut');
							var dashData = $file.data('dash');
							var $circle = $file.find('.circle');
							$circle.velocity({ opacity: [0, 1] }, 500, function () {
								$file.removeClass('process');
								$circle.attr('style', '');
							});
							$donut.velocity("stop").velocity({ 'stroke-dashoffset': [dashData.c, dashData.o] }, { duration: 500, easing: "linear" });
						});
						$file.on('dash:done', function () {
							var $circle = $file.find('.circle');
							$circle.velocity({ opacity: [0, 1], scale: [1.25, 1], }, 500, function () {
								$file.removeClass('process');
								$file.switchClass('local', 'remote');
								$circle.attr('style', '');
							});
						});
						$file.on('tools:on', function (event, tool) {
							var vdata1 = { opacity: [1, 0], scale: [1, 0.5] }, vdata2 = { duration: 250, display: 'block' };
							if (tool) {
								if (tool == 'upload') $upload.velocity(vdata1, vdata2);
								else if (tool == 'crop') $crop.velocity(vdata1, vdata2);
								else if (tool == 'remove') $remove.velocity(vdata1, vdata2);
							} else {
								$([$upload, $crop, $remove]).velocity(vdata1, vdata2);
							}
						});
						$file.on('tools:off', function (event, tool) {
							var vdata1 = { opacity: [0, 1], scale: [0.5, 1] }, vdata2 = { duration: 250, display: 'none' };
							if (tool) {
								if (tool == 'upload') $upload.velocity(vdata1, vdata2);
								else if (tool == 'crop') $crop.velocity(vdata1, vdata2);
								else if (tool == 'remove') $remove.velocity(vdata1, vdata2);
							} else {
								$([$upload, $crop, $remove]).velocity(vdata1, vdata2);
							}
						});

						$file.on('upload:start', function () {
							$file.switchClass('prepare', 'progress').trigger('dash:start');
							$file.data('dash', { r: 0, c: 0, o: 0 });
							var data = $.extend({}, Data.vars.upload, {
								file: $file.data('file'),
								fdata: {
									id: fda.id,
									file: fda.file,
									mime: fda.mime,
									type: fda.type,
									ext: fda.ext,
									name: fda.name,
									bytes: fda.bytes,
									size: fda.size,
									crop: fda.crop,
								},
							});
							var netup = new Network.upload(data);
							netup.on('uploading', function (p, l, t) {
								if (p < 0 || !p) p = 0;
								else if (p > 100) p = 100;
								$file.data('pct', p).trigger('dash:progress');
							});
							netup.on('abort', function () {
								$file.switchClass('progress', 'queue');
								$file.data('pct', 0).trigger('dash:stop');
								$file.trigger('upload:stop');
							});
							netup.on('error', function (error) {
								$file.switchClass('progress', 'error');
								$file.data('pct', 0).trigger('dash:stop');
								$file.trigger('upload:error');
							});
							netup.on('complete', function (t) {
								$file.switchClass('progress', 'done');
								$file.data('pct', 100).trigger('dash:progress').removeData('data').removeData('file');
								$file.trigger('dash:done').trigger('upload:done');
							});
							netup.start();
							$file.data('netup', netup);
						});
						$file.on('upload:stop', function () {
							$file.trigger('tools:on');
						});
						$file.on('upload:error', function () {
							Element.trigger('field:error', ['fileupload', 'Erro ao subir arquivo']);
							$file.trigger('upload:clear');
						});
						$file.on('upload:done', function () {
							$browse.velocity({ opacity: [1, 0], scale: [1, 0.5] }, { duration: 250, display: 'block' });
							Element.trigger('image:checkload');
							$file.trigger('tools:on');
							$oldfile.remove();
							Element.trigger('field:fileupload');
							Element.trigger('field:change');
						});
						$file.on('upload:crop', function () {
							if (Data.mode == 'avatar' || Data.vars.general.autoupload) {
								$upload.trigger('click');
							}
						});
						$file.on('upload:clear', function () {
							$file.remove();
							if ($oldfile.length) {
								$oldfile.velocity({ opacity: [1, 0], scale: [1, 0.5] }, { duration: 250, display: 'block' });
							} else {
								$instruction.velocity({ opacity: [1, 0], scale: [1, 0.5] }, { duration: 250, display: 'block' });
							}
							$browse.velocity({ opacity: [1, 0], scale: [1, 0.5] }, { duration: 250, display: 'block' });
						});
						$file.on('upload:prepare', function (event) {
							$file.switchClass('queue error', 'process prepare').trigger('dash:prepare');
							var collection = { totalsize: fda.size, maxfilesize: Data.vars.upload.maxfilesize, accept: Data.vars.upload.accept, filelist: {} };
							collection.filelist[fda.id] = fda;
							var setup = $.extend({ collection: collection }, Data.vars.upload);
							if (!setup.sui){
								setTimeout(function(){
									$file.trigger('upload:clear');
									Element.trigger('field:error',['suimissed', 'SUI não definido']);
								},300);
							} else {
								var netup = new Network.upload(setup);
								netup.on('test:error', function (e) {
									$file.trigger('upload:clear');
									Element.trigger('field:error', ['uploadprepare', 'Upload inválido']);
								});
								netup.on('test:done', function (r) {
									$file.trigger('upload:start');
								});
								netup.test();
							}
						});
						$file.on('click', '.cover', function () {
							var netup = $file.data('netup');
							if (netup && netup.state() === 1) {
								netup.stop();
							}
						});
						$upload.on('click', function () {
							$file.trigger('tools:off');
							$file.trigger('upload:prepare');
						});
						$crop.on('click', function () {
							var $imgedit = $('#suiImageEdit');
							var $cover = $file.find('.cover');
							Plugin.imgEditor.open({
								source: $file,
								asset: 'crop',
								assets: ['crop'],
								crop: Data.vars.crop,
								caption: Data.vars.caption,
								canvas: {
									width: $cover.width(),
									height: $cover.height()
								},
								onopen: function () {
									$file.addClass('crop');
								},
								oncaption: function(caption){
									Element.trigger('image:caption', [$file,caption]);
								},
								oncrop: function (data, canvas) {
									if (canvas) {
										var d = $file.data('data');
										d.crop = data;
										$file.data('data', d);
										$.imgResize({
											image: canvas.toDataURL(),
											size: 128,
											mime: d.mime,
											quality: 1,
											complete: function (src) {
												$file.find('.cover').css('background-image', 'url(' + src + ')');
												$file.trigger('upload:crop');
											}
										});
									}
								},
								oncancel: function () {
									$file.trigger('upload:clear');
								}
							});
						});
						$remove.on('click', function (event) {
							$file.trigger('upload:clear');
							event.stopPropagation();
						});
						if (Data.mode == 'avatar' || Data.vars.general.autocrop) {
							$crop.trigger('click');
						} else if (Data.vars.general.autoupload) {
							$upload.trigger('click');
						} else {
							$([$upload, $crop, $remove]).velocity({ opacity: [1, 0], scale: [1, 0.5] }, { duration: 250, display: 'block' });
						}
					});
					Element.trigger('field:loaded');
					setTimeout(function(){
						$filelist.find('.file.video video').trigger('videofit');
					},300);
				}
			},
			code: {
				editor: function () {
					Validate.required();
					Bind.common.label();
					Data.vars = Data.vars.code || Data.vars;
					var id = 'code' + $.md5(Math.rand() + '~' + Date.now()).substring(0, 16);
					Dom.input.attr('id', id);
					var data = $.extend({
						lineNumbers: true,
						lineWrapping: true,
						mode: "xml",
						htmlMode: true,
						fixedGutter: false,
						extraKeys: {
							'Ctrl-B': function (cm) {
								var s = cm.getSelection();
								cm.replaceSelection('<b>' + s + '</b>');
							}
						}
					}, Data.vars || {});
					//setTimeout(function () {
						var editor = CodeMirror.fromTextArea(document.getElementById(id), data);
						editor.on('paste',function(event){
							//console.log(event);
						});
						editor.on('change', function () {
							Element.trigger('field:input').trigger('field:change');
						});
						editor.on('focus', function () {
							$(document).trigger('click');
							Element.trigger('field:focus');
							$(document).trigger('activity:focusin', [Element]);
						});
						editor.on('blur', function () {
							Element.trigger('field:blur');
						});
						editor.on('cursorActivity', function () {
							/*
							// teste para pegar o elemento pai no cursor

							// https://stackoverflow.com/questions/26576054/codemirror-get-the-current-word-under-the-cursor
						    var A1 = editor.getCursor().line;
						    var A2 = editor.getCursor().ch;
						    var B1 = editor.findWordAt({line: A1, ch: A2}).anchor.ch;
						    var B2 = editor.findWordAt({line: A1, ch: A2}).head.ch;
						    console.log(editor.getRange({line: A1,ch: B1}, {line: A1,ch: B2}));

						    // https://stackoverflow.com/questions/19627246/find-parent-element-of-a-token-in-codemirror
						    var cur = editor.getCursor()
							var token = editor.getTokenAt(cur);
							var inner = CodeMirror.innerMode(editor.getMode(), token.state);
							var cx = inner.state.context
							console.log(cx);
							*/
						});
						Element.on('click', '.CodeMirror', function (event) {
							event.stopPropagation();
						});
						Element.on('field:resize', function () {
							editor.setSize(1, 1);
							editor.setSize(Dom.value.width(), Dom.value.height());
							editor.refresh();
						});
						$(window).on('resize', function () {
							Element.trigger('field:resize');
						});
						Element.closest('.sui-widget').on('widget:resize', function () {
							Element.trigger('field:resize');
						});
						Element.trigger('field:resize').data('editor', editor);
						Element.trigger('field:loaded');
					//}, 100);
				}
			},
			ace: {
				editor: function () {
					Validate.required();
					Bind.common.label();
					Data.vars = Data.vars.ace || Data.vars;
					var id = 'ace' + $.md5(Math.rand() + '~' + Date.now()).substring(0, 16);
					Dom.value.attr('id', id);
					Dom.value.text(Dom.input.val());
					var editor = ace.edit(id);
					var session = editor.getSession();
					$.each(Data.vars || [], function (k, v) {
						if (k != 'theme' && k != 'mode' && k !== 'useWorker' && k !== 'showPrintMargin') {
							editor.setOption(k, v);
						}
					});
					editor.setOption("showPrintMargin", Data.vars.showPrintMargin || false);
					editor.setTheme(Data.vars.theme || "ace/theme/chrome");
					session.setMode(Data.vars.mode || "ace/mode/text");
					session.setUseWorker(Data.vars.useWorker || false);
					Element.data('editor', editor);
					editor.on("change", function () {
						Element.trigger('field:input').trigger('field:change');
					});
					Dom.wrap.on('click', function (event) {
						Element.trigger('field:focus');

					});
					editor.on("blur", function (event) {
						Element.trigger('field:blur');
					});
					Element.trigger('field:loaded');
				}
			},
			mce: {
				docroot:null,
				editor: function () {
					Dom.wrap.addClass('courtain');
					Validate.required();
					Bind.common.label();
					Data.vars = Data.vars.mce || Data.vars;
					if (Data.vars.browse) {
						if (Data.vars.image) Data.vars.browse.image = Data.vars.image;
					}
					var id = 'mce' + $.md5(Math.rand()).substring(0, 16);
					Dom.input.attr('id', id);
					var tools = {
						MD: [
							'undo redo | ' +
							'styleselect | ' +
							'forecolor backcolor | ' +
							'bold italic underline strikethrough removeformat | ' +
							'alignleft aligncenter alignright alignjustify | ' +
							'table bullist numlist | link suiimage '
						],
						SM: [
							'undo redo | ' +
							'styleselect | ' +
							'bold italic | ' +
							'alignleft aligncenter alignright alignjustify | ' +
							'bullist numlist | suiLink suiimage'
						],
						XS: [
							'undo redo | ' +
							'styleselect | ' +
							'bold italic | ' +
							'alignleft aligncenter alignright alignjustify | ' +
							'bullist numlist | suiLink suiimage'
						]
					};
					var plugins = {
						MD: [
							'table contextmenu paste link anchor textcolor lists colorpicker image imagetools suiimage stickytoolbar autoresize'
						],
						SM: [
							'table contextmenu paste imagetools stickytoolbar autoresize'
						],
						XS: [
							'table contextmenu paste imagetools stickytoolbar autoresize'
						]
					};

					var data = $.extend(true, {
						selector: '#' + id,
						branding: false,
						entity_encoding : "raw",
						skin: 'sourceui',
						resize: false,
						menubar: false,
						statusbar: false,
						contextmenu: "cut copy paste",
						toolbar: tools.MD,
						plugins: plugins.MD,
						language: "pt_BR",
						content_css: 'css/mce-default-content.css?'+(Data.vars.cache || new Date().getTime()),
						autoresize_min_height: 150,
						paste_data_images: true,
						paste_as_text:true,
						table_class_list: [
							{ title: 'Nenhum', value: '' },
							{ title: 'Container de Mídia', value: 'image-container' },
							{ title: 'Grade de Dados', value: 'datagrid' }
						],
						textcolor_map: $.extend([
							"000000", "Preto",
							"808080", "Cinza",
							"AFAFAF", "Prata",
							"E04242", "Vermelho",
							"F18D25", "Amarelo",
							"37a74a", "Verde",
							"418fda", "Azul",
							"304681", "Marinho",
						],Data.vars.colormap || []),
						valid_children:
						 	"body[p|ol|ul|div|table]" +
							",div[p|img|video]" +
							",p[a|span|b|strong|i|em|u|sup|sub|img|video|hr|#text]" +
							",span[a|b|strong|i|em|u|sup|sub|#text]" +
							",a[span|b|strong|i|em|u|sup|sub|img|#text]" +
							",b[span|a|i|em|u|sup|sub|img|#text|label]" +
							",strong[span|a|i|em|u|sup|sub|#text]" +
							",i[span|a|b|u|sup|sub|#text]" +
							",em[span|a|b|u|sup|sub|#text]" +
							",sup[span|a|i|em|b|u|sub|#text]" +
							",sub[span|a|i|em|b|u|sub|#text]" +
							",table[tr]" +
							",tr[th|td]" +
							",th[#text]" +
							",td[span|a|b|strong|i|u|sup|sub|img|#text]" +
							",li[span|a|b|strong|i|u|sup|sub|img|ol|ul|#text]" +
							",ol[li]" +
							",ul[li]",
						forced_root_block : 'p',
						setup: function (editor) {
							editor.on('init', function (event) {
								Element.trigger('field:fix').trigger('field:loaded');
							});
							editor.on('change', function (event) {
								Element.trigger('field:fix').trigger('field:input').trigger('field:change');
							});
							editor.on('click', function (event) {
								Element.trigger('field:focus');
							});
							editor.on('blur', function (event) {
								Element.trigger('field:blur');
							});
							editor.addButton('suiLink', {
								icon: 'x icon-link',
								//image: 'http://p.yusukekamiyamane.com/icons/search/fugue/icons/calendar-blue.png',
								tooltip: "Insere um Link",
								onclick: function () {
									editor.insertContent('<mark>suiLink clickado!</mark>');
								},
								onpostrender: function () {
									var btn = this;
									editor.on('NodeChange', function (e) {
										btn.disabled(e.element.nodeName.toLowerCase() === 'mark');
									});
								}
							});
						},
					}, Data.vars);
					tinymce.init(data);
					Bind.common.mce.docroot = $('#'+id).tinymce();
					Element.on('field:loaded',function(){
						Dom.wrap.removeClass('courtain');
						Element.addClass('loaded');
					});
					Element.on('field:fix',function(event){
						Bind.common.mce.sanitize();
					});
				},
				sanitize: function(noempty){
					var $el = Bind.common.mce.docroot.$('body > *');
					$el.each(function(k,v){
						var $e = $(this);
						if ($e.is('.responsive-wrap')){
							var $children = $e.find('p, img');
							if (!$children.length){
								$e.replaceWith('<p>'+$e.html()+'</p>')
							}
						}
						if (noempty && !$e.is('.responsive-wrap') && $e.text() === ''){
							$e.remove();
						}
					});
				},
			},
			locale: {
				api: null,
				provuf: {
					'AC': 'Acre',
					'AL': 'Alagoas',
					'AM': 'Amazonas',
					'AP': 'Amapá',
					'BA': 'Bahia',
					'CE': 'Ceará',
					'DF': 'Distrito Federal',
					'ES': 'Espírito Santo',
					'GO': 'Goás',
					'MA': 'Maranhão',
					'MG': 'Minas Gerais',
					'MS': 'Mato Grosso do Sul',
					'MT': 'Mato Grosso',
					'PA': 'Pará',
					'PB': 'Paraíba',
					'PE': 'Pernambuco',
					'PI': 'Piauí',
					'PR': 'Paraná',
					'RJ': 'Rio de Janeiro',
					'RN': 'Rio Grande do Norte',
					'RO': 'Rondônia',
					'RR': 'Roráima',
					'RS': 'Rio Grande do Sul',
					'SC': 'Santa Catarina',
					'SE': 'Sergipe',
					'SP': 'São Paulo',
					'TO': 'Tocantins'
				},

				findAddressFromString: function (str, callback) {
					if (Network.apikeys.tomtom) {
						Network.getJSON('https://api.tomtom.com/search/2/search/' + str + '.json?key=' + Network.apikeys.tomtom, {
							ondone: function (pred) {
								var results = {};
								var predictions = pred.results;
								if (predictions) {
									for (var i = 0; i < predictions.length; i++) {
										var data = {};
										if (predictions[i].type) {
											var address = predictions[i].address || {};
											var geocode = predictions[i].position || {};
											var poi = predictions[i].poi || {};
											var id = predictions[i].score + '.' + $.md5(address.streetName + address.municipality + address.municipalitySubdivision + address.country + poi.name);
											if (poi.name) data.poi = poi.name;
											if (address.streetName) data.logradouro = address.streetName;
											if (address.streetNumber) data.numero = address.streetNumber;
											if (address.municipalitySubdivision) data.bairro = $.trim((address.municipalitySubdivision || '').split(",")[0]);
											if (address.municipality) data.cidade = address.municipality;
											if (address.extendedPostalCode) data.cep = $.trim((address.extendedPostalCode || '').split(",")[0]);
											if (address.countrySubdivision) data.estado = address.countrySubdivision;
											if (address.countrySubdivision) data.uf = Object.key(Bind.common.locale.provuf, data.estado);
											if (address.country) data.pais = address.country;
											if (geocode) data.geocode = geocode;
											results[id] = $.extend(data, results[id] || {});
										}
									}
								}
								if (callback) callback.call(null, results);
								Dom.wrap.removeClass('ajax-courtain');
							},
							onfail: function (data) {
								Element.trigger('field:error', ['Serviço offline']);
							},
						});
						return true;
					}
				},
				findAddressFromCEP: function (cep, callback) {
					Dom.wrap.addClass('ajax-courtain');
					Network.getJSON('https://viacep.com.br/ws/' + cep.replace(/\D+/g, '') + '/json/', {
						ondone: function (results) {
							results.cidade = results.localidade;
							results.estado = Bind.common.locale.provuf[results.uf] || results.uf;
							if (callback) callback.call(null, results);
							Dom.wrap.removeClass('ajax-courtain');
						},
						onfail: function (data) {
							Element.trigger('field:error', ['Serviço offline']);
						},
					});
				},
				findCEPFromAddress: function (setup, callback) {
					Dom.wrap.addClass('ajax-courtain');
					Network.getJSON('https://viacep.com.br/ws/' + setup.uf + '/' + setup.cidade + '/' + setup.logradouro + '/json/', {
						ondone: function (res) {
							var results = {};
							if (res.length > 1) {
								if (setup.bairro) {
									for (var i = 0; i < res.length; i++) {
										if ($.levenshtein(setup.bairro, res[i].bairro) > 0.7) {
											results.cep = res[i].cep;
											break;
										}
									}
								}
							}
							if (!results.cep && res[0]) results.cep = res[0].cep;
							if (callback) callback.call(null, results);
							Dom.wrap.removeClass('ajax-courtain');
						},
						onfail: function (data) {
							Element.trigger('field:error', ['Serviço offline']);
						},
					});
				},
				places: function () {
					var predicTimeout;
					var lastInput = '';
					Element.on('field:enter', function (event, val) {
						var $this = $(this);
						var val = $this.val().toLowerCase();
						clearTimeout(predicTimeout);
						Bind.common.locale.findAddressFromString(val, function (results) {
							Element.trigger('field:predicted', [results]);
						});
					});
					Element.on('field:input', function () {
						var $this = $(this);
						var val = $this.val().toLowerCase();
						var max = Math.max(lastInput.length, val.length);
						var min = Math.min(lastInput.length, val.length);
						clearTimeout(predicTimeout);
						if (val.length > 3 && max - min == 1) {
							predicTimeout = setTimeout(function () {
								Element.trigger('field:enter');
							}, 750);
						}
						lastInput = val;
					});
					Element.on('field:predicted', function (event, results) {
						var $options = Dom.droplist.find('.options');
						var $ul = $options.find('ul');
						var html = '';
						$ul.find('li').remove();
						if (!$.isEmptyObject(results)) {
							$options.find('.empty').hide();
							$.each(results, function (k, v) {
								html = '<li>';
								if (v.poi) html += '<strong>' + v.poi + '</strong><br />';
								if (v.logradouro) html += '<b>' + v.logradouro + (v.numero ? ', ' + v.numero : '') + '</b><br />';
								if (v.poi || v.logradouro) {
									html += '<small>';
									if (v.bairro) html += v.bairro + ' - ';
									if (v.cidade) html += v.cidade + ' - ';
									if (v.uf) {
										html += v.uf;
										if (v.cep) html += ' - ' + v.cep;
									} else if (v.cidade) {
										html += v.cidade;
										if (v.cep) html += ' - ' + v.cep;
									}
									html += '</small>';
								} else {
									if (v.estado) {
										html += '<b>' + v.estado + '</b><br />';
										html += '<small>';
										if (v.bairro) html += v.bairro + ' - ';
										if (v.cidade) html += v.cidade + ' - ';
										if (v.uf) html += v.uf;
										html += '</small>';
									} else if (v.cidade) {
										html += '<b>' + v.cidade + '</b><br />';
										html += '<small>';
										if (v.cidade) html += v.cidade + ' - ';
										if (v.uf) html += v.uf;
										html += '</small>';
									}
								}
								html += '</li>';
								$(html).appendTo($ul).data('value', v);
							});
						} else {
							$options.find('.empty').show();
						}
					});
					Dom.droplist.on('droplist:select', function (event, $item) {
						var data = $item.data('value');
						if (!data.cep) {
							Bind.common.locale.findCEPFromAddress(data, function (res) {
								var datares = $.extend({}, $.nonull(data), $.nonull(res));
								Element.trigger('field:select', [datares]);
							});
						} else if (data.cep && data.bairro == data.cidade) {
							Bind.common.locale.findAddressFromCEP(data.cep, function (res) {
								var datares = $.extend({},$.nonull(data), $.nonull(res));
								Element.trigger('field:select', [datares]);
							});
						} else {
							Element.trigger('field:select', [data]);
						}
					});
					Element.trigger('field:loaded');
				},
				cep: function () {
					Element.on('field:change', function () {
						var $this = $(this);
						var val = $this.val();
						if (val.length === 9) {
							Bind.common.locale.findAddressFromCEP(val, function (results) {
								Element.trigger('field:select', [results]);
							});
						}
					});
					Element.trigger('field:loaded');
				}
			},
			map: {
				coordinates: function () {
					Validate.required();
					Bind.common.label();
					Dom.map = Dom.value.children('.map');
					var coord = Dom.map.data('_leafletcoord') || { lat: Dom.map.data('lat'), lon: Dom.map.data('lon') };
					Dom.map.data('_leafletcoord', coord);

					var map, setup = {
						tile: 'mapbox',
						layerid: 'mapbox.light',
						zoom: 15,
						gestureHandling: true
					};
					if (coord.lat && coord.lon) {
						setup.lat = parseFloat(coord.lat);
						setup.lon = parseFloat(coord.lon);
					} else {
						setup.zoom = 1;
					}
					Promises.visible().then(function (r) {
						var Leaf = Element.leaflet(setup);
						var Map = Leaf.map;
						var Latlon = new L.LatLng(coord.lat || 0, coord.lon || 0);
						var Marker;

						Element.on('field:mappam', function (event) {
							if (coord.lat !== '' && coord.lon !== '') {
								Map.setView([coord.lat, coord.lon], 15);
							}
						});
						Element.on('field:addmarker', function (event, newcoord) {
							if (newcoord) {
								coord.lat = newcoord.lat;
								coord.lon = newcoord.lng;
								Element.trigger('field:input').trigger('field:change');
							}
							Marker = L.marker([coord.lat, coord.lon], { draggable: 'true', icon: Leaf.icon('black') }).addTo(Map);
							Marker.on('dragend', function (event) {
								var marker = event.target;
								var pos = marker.getLatLng();
								coord.lat = pos.lat;
								coord.lon = pos.lng;
								Latlon = new L.LatLng(coord.lat, coord.lon);
								marker.setLatLng(Latlon);
								Map.panTo(Latlon);
								Caller.map.setval(coord);
								Element.trigger('field:input').trigger('field:change');
							});
							Element.trigger('field:mappam');
						});
						Element.on('field:movemarker', function (event, newcoord) {
							if (newcoord) {
								coord.lat = newcoord.lat;
								coord.lon = newcoord.lng;
								Element.trigger('field:input').trigger('field:change');
							}
							Latlon = new L.LatLng(coord.lat, coord.lon);
							Marker.setLatLng(Latlon);
							Element.trigger('field:mappam');
						});
						Element.on('field:delmarker', function () {
							coord.lat = '';
							coord.lon = '';
							Map.removeLayer(Marker);
							Marker = null;
							Latlon = new L.LatLng(0, 0);
							Element.trigger('field:input').trigger('field:change');
						});
						Element.on('field:markerupdate', function (event, changed) {
							if (coord.lat !== '' && coord.lon !== '') {
								if (Marker) {
									Element.trigger('field:movemarker');
								} else {
									Element.trigger('field:addmarker');
								}
							} else {
								if (Marker) Element.trigger('field:delmarker');
							}
							if (changed) {
								Element.trigger('field:input').trigger('field:change');
							}
						});

						Element.trigger('field:markerupdate');

						var Toolbar = Element.leaflet('toolbar', {
							position: 'bottomleft',
							tools: [
								Marker ? {
									class: { type: 'del-marker', icon: 'icon-location-off' }
								} : {
										class: { type: 'add-marker', icon: 'icon-locate-pin' }
									}, {
									class: { type: 'center', icon: 'icon-arrows' }
								}
							]
						});
						Toolbar.on('click', '.center', function () {
							Element.trigger('field:mappam');
						});
						Toolbar.on('click', '.add-marker:not(.disable)', function (event) {
							event.stopPropagation();
							if (!Marker) {
								var $this = $(this);
								Element.addClass('marker-adding');
								$this.disable();
							}
						});
						Toolbar.on('click', '.del-marker:not(.disable)', function (event) {
							event.stopPropagation();
							if (Marker) {
								var $this = $(this);
								Element.trigger('field:delmarker');
								$this.switchClass('del-marker', 'add-marker')
									.switchClass('icon-location-off', 'icon-locate-pin')
									.enable();
							}
						});
						Map.on('click', function (e) {
							if (Element.hasClass('marker-adding')) {
								Element.removeClass('marker-adding').trigger('field:addmarker', [e.latlng]);
								Toolbar.find('.add-marker')
									.switchClass('add-marker', 'del-marker')
									.switchClass('icon-locate-pin', 'icon-location-off')
									.enable();
							}
						});
						Element.trigger('field:loaded');
					});
				}
			},
			button: {
				single: function () {
					Validate.required();
					Dom.buttons.all.on('click', function (event) {
						var $this = $(this);
						if ($this.hasClass('selected')) {
							$this.trigger('option:unselect');
						} else {
							$this.parent().find('.cell.button.selected').trigger('option:unselect');
							$this.trigger('option:select');
						}
						$(document).trigger('click');
						Element.trigger('field:input').trigger('field:change').trigger('field:focus');
						$(document).trigger('activity:focusin', [Element]);
						event.stopPropagation();
					});
					Dom.buttons.all.on('option:select', function () {
						var $this = $(this);
						$this.addClass('selected').find('.input').prop('checked', true);
					});
					Dom.buttons.all.on('option:unselect', function () {
						var $this = $(this);
						$this.removeClass('selected').find('.input').prop('checked', false);
					});
					Element.trigger('field:loaded');
				},
				multiple: function () {
					Validate.required();
					Dom.buttons.all.on('click', function (event) {
						var $this = $(this);
						if ($this.hasClass('selected')) {
							$this.trigger('option:unselect');
						} else {
							$this.trigger('option:select');
						}
						$(document).trigger('click');
						Element.trigger('field:input').trigger('field:change').trigger('field:focus');
						$(document).trigger('activity:focusin', [Element]);
						event.stopPropagation();

					});
					Dom.buttons.all.on('option:select', function () {
						var $this = $(this);
						$this.addClass('selected').find('.input').prop('checked', true);
					});
					Dom.buttons.all.on('option:unselect', function () {
						var $this = $(this);
						$this.removeClass('selected').find('.input').prop('checked', false);
					});
					Element.trigger('field:loaded');
				}
			}
		},
		input: {
			custom: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
		},
		text: {
			simple: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			url: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
				Validate.mask();
			},
			email: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
				Validate.mask();
			},
			textarea: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			password: function () {
				Bind.common.buttons.password();
				Bind.common.text();
			},
		},
		number: {
			simple: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			integer: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			float: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			decimal: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			money: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			spin: function (data) {
				Bind.common.buttons.spin();
				Bind.common.text();
			},
			phone: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			dddphone: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			cell: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			dddcell: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			cpf: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			cnpj: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			cpfcnpj: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			cep: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			boleto: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
			creditcard: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
			},
		},
		drop: {
			single: function () {
				Bind.common.buttons.droplist();
				Bind.common.droplist.select();
			},
			multiple: function () {
				Bind.common.buttons.droplist();
				Bind.common.droplist.select();
			}
		},
		search: {
			single: function () {
				Bind.common.search();
				Bind.common.droplist.search();
			},
			multiple: function () {
				Bind.common.search();
				Bind.common.droplist.search();
			},
			suggest: function () {
				Bind.common.search();
				Bind.common.droplist.search();
			},
		},
		date: {
			simple: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			},
			full: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			},
			range: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			},
		},
		datetime: {
			simple: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			},
			full: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			},
		},
		time: {
			simple: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			},
			full: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.datepicker();
			}
		},
		picker: {
			single: function () {
				Bind.common.label();
				Bind.common.picker.single();
			}
		},
		color: {
			spectrum: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.spectrum();
			},
			palette: function () {
				Bind.common.text();
				Bind.common.buttons.droplist();
				Bind.common.droplist.palette();
			}
		},
		switch: {
			simple: function () {
				Bind.common.switch.simple();
			},
			toggle: function () {
				Bind.common.switch.simple();
				/*
				setTimeout(function(){Field.val('S')},5000);
				setTimeout(function(){Field.val(false)},8000);
				setTimeout(function(){Field.val(true)},11000);
				setTimeout(function(){Field.val('Z')},14000);
				*/
			},
		},
		slider: {
			simple: function () {
				Bind.common.slider.simple();
			},
		},
		file: {
			single: function () {
				Bind.common.file.single();
			},
			multiple: function () {
				Bind.common.file.single();
			},
		},
		image: {
			single: function () {
				Bind.common.file.single();
			},
			multiple: function () {
				Bind.common.file.single();
			},
		},
		ace: {
			editor: function () {
				Bind.common.ace.editor();
			},
		},
		code: {
			editor: function () {
				Bind.common.code.editor();
			},
		},
		mce: {
			editor: function () {
				Bind.common.mce.editor();
			},
		},
		button: {
			single: function () {
				Bind.common.button.single();
			},
			multiple: function () {
				Bind.common.button.multiple();
			},
		},
		box: {
			single: function () {
				Bind.common.label();
				Bind.common.button.single();
			},
			multiple: function () {
				Bind.common.label();
				Bind.common.button.multiple();
			},
		},
		locale: {
			places: function () {
				Bind.common.search();
				Bind.common.droplist.search();
				Bind.common.locale.places();
			},
			cep: function () {
				Bind.common.buttons.simple();
				Bind.common.text();
				Bind.common.locale.cep();
			}
		},
		map: {
			coordinates: function () {
				Bind.common.map.coordinates();
			}
		}
	};

	var Caller = {
		switch: {
			setval: function (val) {
				var $y = Dom.wrap.find('.cell.yes');
				var $n = Dom.wrap.find('.cell.not');
				if ((val === true || $y.data('value') == val) && Element.hasClass('not')) {
					Dom.box.trigger('click');
					return true;
				} else if ((val === false || $n.data('value') == val) && !Element.hasClass('not')) {
					Dom.box.trigger('click');
					return true;
				}
				return false;
			}
		},
		code: {
			setval: function (val) {
				var editor = Element.data('editor');
				editor.setValue(val);
				return true;
			},
			getval: function () {
				var editor = Element.data('editor');
				return editor.getValue();
			}
		},
		ace: {
			setval: function (val) {
				var editor = Element.data('editor');
				editor.setValue(val);
				return true;
			},
			getval: function () {
				var editor = Element.data('editor');
				return editor.getValue();
			}
		},
		mce: {
			setval: function (val) {
				var editor = tinyMCE.get(Dom.input.attr('id'));
				editor.setContent(val);
				return true;
			},
			getval: function () {
				Bind.common.mce.sanitize(true);
				var editor = tinyMCE.get(Dom.input.attr('id'));
				return editor.getContent();
			}
		},
		button: {
			setval: function (val) {
				Dom.wrap.find('.cell.button.selected').trigger('click');
				val = (typeof val == 'object') ? val : { 0: val };
				Dom.wrap.find('.cell.button').each(function () {
					var $btn = $(this), $input = $btn.find('.input');
					$.each(val || [], function (k, v) {
						if ($input.val() == v) $btn.trigger('click');
					});
				});
				return true;
			},
			getval: function () {
				var value = [];
				Dom.wrap.find('.cell.button.selected').each(function (k, v) {
					var $btn = $(this), $input = $btn.find('.input');
					if (Data.mode == 'single') {
						value = $input.val();
						return false;
					} else {
						value[k] = $input.val();
					}
				});
				if ($.isArray(value)) return (Data.mode == 'single') ? '' : value;
				else return value || '';
			}
		},
		box: {
			setval: function (val) {
				return Caller.button.setval(val);
			},
			getval: function () {
				return Caller.button.getval();
			}
		},
		date: {
			setval: function (val) {
				if (Data.mode == 'simple') {
					Dom.input.val($.toDate(val, 'd/m/Y'));
				} else if (Data.mode == 'full') {
					if (val !== '') {
						var html = Parser.methods.getTemplate('input', 'fulldate', { value: $.toDate(val, 'Y-m-d'), label: $.toFullDate(val, 'br', 'unpreposited') });
						var $html = $(html);
						Element.addClass('selected');
						Dom.options.html($html);
					} else {
						Element.removeClass('selected');
						Dom.options.html('');
					}
					Dom.input = Dom.value.find('.input');
				} else if (Data.mode == 'range') {
					Dom.input.filter('.ini').val($.toDate(val[0] || '', 'd/m/Y'));
					Dom.input.filter('.end').val($.toDate(val[1] || '', 'd/m/Y'));
				}
				return true;
			},
			getval: function () {
				if (Data.mode == 'simple' || Data.mode == 'full') {
					return $.toDate(Dom.input.val(), 'Y-m-d');
				} else if (Data.mode == 'range') {
					return [
						$.toDate(Dom.input.filter('.ini').val(), 'Y-m-d'),
						$.toDate(Dom.input.filter('.end').val(), 'Y-m-d')
					];
				}
			},
			min: function (date) {
				Field.addon.setMin(date);
			},
			max: function (date) {
				Field.addon.setMax(date);
			},
		},
		time: {
			setval: function (val) {
				if (Data.mode == 'simple') {
					Dom.input.val($.extractTime(val, 'short'));
				} else if (Data.mode == 'full') {
					Dom.input.val($.extractTime(val, 'full'));
				}
				return true;
			},
			getval: function () {
				if (Data.mode == 'simple') {
					return $.extractTime(Dom.input.val(), 'short');
				} else if (Data.mode == 'full') {
					return $.extractTime(Dom.input.val(), 'full');
				}
			}
		},
		datetime: {
			setval: function (val) {
				if (Data.mode == 'simple') {
					Dom.input.val($.toDate(val, 'd/m/Y H:i'));
				} else if (Data.mode == 'full') {
					if (val !== '') {
						var html = Parser.methods.getTemplate('input', 'fulldate', { value: $.toDate(val, 'Y-m-d'), label: $.toFullDatetimeHTML(val, 'br', 'unpreposited') });
						var $html = $(html);
						Element.addClass('selected');
						Dom.options.html($html);
					} else {
						Element.removeClass('selected');
						Dom.options.html('');
					}
					Dom.input = Dom.value.find('.input');
				}
				return true;
			},
			getval: function () {
				if (Data.mode == 'simple') {
					return $.toDate(Dom.input.val(), 'Y-m-d H:i');
				} else if (Data.mode == 'full') {
					return $.toDate(Dom.input.val(), 'Y-m-d H:i:s');
				}
			}
		},
		picker: {
			setval: function (v) {
				if ($.isPlainObject(v)) {
					var htmlOptions = '';
					var html = { visual: '', info: '' };
					var type = 'default';
					var value = '';
					var seed = '';
					if (!v.key) return false;
					html.visual += (v.fsimage) ? (v.fsimage.indexOf('<') == -1 ? '<div class="image"><img src="' + v.fsimage + '"/></div>' : '<div class="icon">' + v.fsimage + '</div>') : '';
					html.visual += (v.image) ? '<div class="image"><img src="' + (v.image.replace('url(', '').replace(')', '').replace(/\"/gi, "")) + '"/></div>' : '';
					html.visual += (v.icon) ? '<div class="icon ' + (v.icon.indexOf('icon-') > -1 ? v.icon : 'icon-' + v.icon) + '"></div>' : '';
					html.info += (v.name) ? '<div class="name">' + v.name + '</div>' : '';
					html.info += (v.info) ? '<div class="info">' + v.info + '</div>' : '';
					html.visual = html.visual ? '<div class="visual">' + html.visual + '</div>' : '';
					html.info = html.info ? '<div class="info">' + html.info + '</div>' : '';
					htmlOptions += (html.visual || html.info) ? Parser.methods.getTemplate('input', 'picker', {
						type: v.type || 'default',
						value: v.key || '',
						seed: v.seed || '',
						label: '<div class="picked">' + html.visual + html.info + '</div>'
					}) : '';
					if (Data.mode == 'single') Dom.options.html(htmlOptions);
					else if (Data.mode == 'multi') Dom.options.append(htmlOptions);
					Element.addClass('selected');
					Value.seed('+', v.seed);
				} else if (v === '') {
					Dom.options.find('.option').each(function () {
						var $this = $(this);
						Value.seed('-', $this.data('seed'));
						$this.remove();
					});
					Element.removeClass('selected');
				}
				return true;
			},
			getval: function () {
				var $input = Dom.options.find('.input');
				var value = [];
				$input.each(function () {
					value.push(this.value);
				});
				if (value.length === 0) return (Data.mode == 'single') ? '' : [];
				else if (value.length === 1) return (Data.mode == 'single') ? value[0] : value;
				return value;
			}
		},
		slider: {
			setval: function (val) {
				var nouislider = Element.data('nouislider');
				return nouislider.set(val);
			},
			getval: function () {
				var nouislider = Element.data('nouislider');
				return nouislider.get();
			}
		},
		file: {
			setValAsImage: function(data){
				var file = this;
				var $filelist = Dom.queue.children('.files');
				var reader = new FileReader();
				var temp = {}
				reader.onload = function (event) {
					temp.image = event.target.result;
					loadImage(
						temp.image,
						function (canvas, meta) {
							data.exif = meta.exif ? meta.exif.getAll() : null;
							data.iptc = meta.iptc ? meta.iptc.getAll() : null;
							temp.image = canvas.toDataURL(data.mime, 0.6);
							temp.maxw = parseInt((Device.ismobile ? 2.8 : 1.4) * $filelist.find('.file, .instruction').width() || $filelist.width());
							temp.maxh = parseInt((Device.ismobile ? 2.8 : 1.4) * $filelist.find('.file, .instruction').height() || $filelist.height());
							temp.canvas = loadImage.scale(
								canvas, {
									maxWidth: temp.maxw,
									maxHeight: temp.maxh,
								}
							);
							temp.cover = canvas.toDataURL(data.mime, 0.6);
							temp.replacers = {style:{bgimage:'background-image:url(\''+temp.cover+'\');'},source:{image:temp.image}};
							temp.html = Parser.methods.getTemplate('row', 'file', $.extend(true,{},data,temp.replacers));
							var $html = $(temp.html);
							$html.data('file', file).hide();
							$html.find('img')
								.on('load', function () {
									data.naturalWidth = this.naturalWidth;
									data.naturalHeight = this.naturalHeight;
									$html.data('data', data).addClass('queue');
									Element.trigger('queue:add', [$html]);
									$(this).data('loaded', true);
								})
								.on('error', function (error) {
									console.error(error);
									Element.trigger('field:error', ['imageload', 'Imagem não carregada', error]);
								});
							$filelist.append($html);
						}, {
							orientation: true,
							maxWidth: data.maxw?data.maxw/2:1024,
							maxHeight: data.maxh?data.maxh/2:1024,
						}
					);
				}
				reader.onerror = function (event) {
					Element.trigger('field:error', ['filereader', 'Imagem não lida']);
				};
				reader.readAsDataURL(file);
			},
			setValAsVideo: function(data){
				var file = this;
				var temp = {}
				var $filelist = Dom.queue.children('.files');
				temp.video = URL.createObjectURL(file);
				temp.replacers = {source:{video:temp.video}};
				temp.html = Parser.methods.getTemplate('row', 'file', $.extend(true,{},data,temp.replacers));
				var $html = $(temp.html);
				var $video = $html.find('video');
				var i = 0;
				$video
					.on('loadeddata', function(){
						this.currentTime = this.duration ? parseInt(this.duration/4) : 5;
					})
					.on('seeked', function(){
						var $this = $(this);
						var video = $this.get(0);
						var canvas = document.createElement('canvas');
						canvas.height = video.videoHeight;
						canvas.width = video.videoWidth;
						var ctx = canvas.getContext('2d');
						ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
						$html.find('.cover').css('background-image','url(\''+canvas.toDataURL()+'\')');
						delete data.cover;
						delete data.image;
						data.naturalWidth = this.videoWidth;
						data.naturalHeight = this.videoHeight;
						$html.data('data', data).addClass('queue');
						Element.trigger('queue:add', [$html]);
						$(this).data('loaded', true);

					})
					.on('error', function (error) {
						Element.trigger('field:error', ['imageload', 'Imagem não carregada', error]);
					});
				$html.data('file', file);
				$filelist.append($html);
			},
			setval: function (v) {
				var $filelist = Dom.queue.children('.files');
				if (v instanceof File) {
					if (Data.vars.upload.maxfilesize && v.size > Data.vars.upload.maxfilesize) {
						Element.trigger('field:error', ['filesize', 'Arquivo muito grande']);
						Notify.open({
							type: 'fail',
							name: Dom.label.text(),
							label: 'Ops... seu arquivo é muito grande (' + $.formatBytes(v.size) + ')',
							message: 'Apenas arquivos ' + Data.vars.upload.accept + ' com até ' + $.formatBytes(Data.vars.upload.maxfilesize) + ' são aceitos.'
						});
						return false;
					} else {
						if (Data.type == 'image' || Data.mode == 'image') Data.fieldtype = 'image';
						else if (Data.type == 'avatar' || Data.mode == 'avatar') Data.fieldtype = 'image';
						else if (Data.type == 'video' || Data.mode == 'video') Data.fieldtype = 'video';
						else if (Data.type == 'audio' || Data.mode == 'audio') Data.fieldtype = 'audio';
						else if (Data.type == 'document' || Data.mode == 'document') Data.fieldtype = 'document';
						else if (Data.type == 'multimedia' || Data.mode == 'multimedia') Data.fieldtype = v.type.split('/')[0];
						else Data.fieldtype = 'file';
						var id = $.md5(v.name + v.size);
						var data = {
							id: id,
							file: v.name,
							mime: v.type,
							type: Data.fieldtype,
							ext: v.name.split('.').pop().toLowerCase(),
							local: v.local || 'local',
							name: v.name,
							size: v.size,
							bytes: $.formatBytes(v.size),
							maxw: Data.vars.upload.maxwidth,
							maxh: Data.vars.upload.maxheight,
						};
						var $hasfile = $filelist.find('#' + id);
						if ($hasfile.length > 0) Element.trigger('field:fileunlink', [$hasfile]);
						if (Data.fieldtype.search(/image|video/g) > -1){
							if (data.mime.indexOf('image') > -1){
								Caller.file.setValAsImage.apply(v,[data]);
							} else if (data.mime.indexOf('video') > -1){
								Caller.file.setValAsVideo.apply(v,[data]);
							} else {
								Element.trigger('field:error', ['filereader', 'Tipo inesperado']);
							}
							/*
							$.imgOrientation({
								image:v,
								complete: function(orientation){
									data.orientation = orientation;
									var reader = new FileReader();
									reader.onload = function (event) {
										data.image = event.target.result;
										$.imgResize({
											image: data.image,
											size: 256,
											mime: data.mime,
											quality: 1,
											orientation: data.orientation,
											complete: function (src) {
												data.cover = src;
												var html = Parser.methods.getTemplate('row', 'file', data);
												var $html = $(html);
												$html.data('file', v).hide();
												$filelist.append($html);
												$html.find('img')
													.on('load', function () {
														delete data.cover;
														delete data.image;
														data.naturalWidth = this.naturalWidth;
														data.naturalHeight = this.naturalHeight;
														$html.data('data', data).addClass('queue');
														Element.trigger('queue:add', [$html]);
														$(this).data('loaded', true);
													})
													.on('error', function (error) {
														Element.trigger('field:error', ['imageload', 'Imagem não carregada', error]);
													});
											}
										});
									};
									reader.onerror = function (event) {
										Element.trigger('field:error', ['filereader', 'Imagem não lida']);
									};
									reader.readAsDataURL(v);
								}
							});
							*/
						} else {
							var html = Parser.methods.getTemplate('row', 'file', data);
							var $html = $(html);
							$html.data('file', v).hide();
							$filelist.append($html);
							$html.data('data', data).addClass('queue');
							Element.trigger('queue:add', [$html]);
						}
					}
				} else if ($.type(v) == 'object' && !$.isPlainObject(v)) {
					if (v.attr && v.attr('id')) {
						var $file = $filelist.find('#' + v.attr('id'));
						$file;
						var data = v.attr();
						data.local = 'remote';
						if (Data.fieldtype.indexOf('image') > -1) {
							data.image = v.content() || v.image;
						}
						var html = Parser.methods.getTemplate('row', 'file', data);
						$filelist.append(html);
						$file.hide();
						setTimeout(function () { $file.remove(); }, 100);
					}
				}
				return v;
			},
			getval: function () {
				var value = [];
				Element.find('.files > .file').each(function () {
					value.push($(this).data());
				});
				return value[0] || {};
			}
		},
		image: {
			setval: function (val) {
				return Caller.file.setval(val);
			},
			getval: function () {
				return Caller.file.getval();
			}
		},
		map: {
			setval: function (val) {
				if (Data.mode == 'coordinates') {
					var coord = Dom.map.data('_leafletcoord');
					var changed = false;
					if ($.isPlainObject(val) && val.lat && (val.lon || val.lng)) {
						coord.lat = val.lat;
						coord.lon = val.lon || val.lng;
						if (coord.lat !== val.lat || coord.lon !== (val.lon || val.lng)) changed = true;
					} else if ($.isArray(val) && val.length === 2) {
						coord.lat = val[0];
						coord.lon = val[1];
						if (coord.lat !== val[0] || coord.lon !== val[1]) changed = true;
					} else if (val === '' || val === null || val === []) {
						coord.lat = '';
						coord.lon = '';
						if (coord.lat !== '' || coord.lon !== '') changed = true;
					}
					Element.trigger('field:markerupdate', [changed]);
				}
				return val;
			},
			getval: function () {
				var value = {};
				if (Data.mode == 'coordinates') {
					value = $.extend({}, Dom.map.data('_leafletcoord') || {});
				}
				return value;
			}
		}
	};


	var Validate = this.validate = {
		is: {
			disable: function (event) {
				var $target = (event && event.target) ? $(event.target) : Element;
				return $target.isDisable('.sui-field');
			},
			valid: function () {
				return valueValid;
			}
		},
		test: {
			required: function (val) {
				var vdata = Element.data('validate') || {};
				if (!vdata.required) return valueValid = true;
				var value = val || Field.val();
				if (Data.required && (
					typeof value == 'undefined' ||
					value === null ||
					value === '' ||
					($.isArray(value) && value.length === 0) ||
					($.isPlainObject(value) && $.isEmptyObject(value))
				)){
					Element.trigger('field:error', ['required', 'Campo obrigatório']);
				}
				else Element.trigger('field:valid');
				return valueValid;
			},
			limit: function (val) {
				var vdata = Element.data('validate') || {};
				if (!vdata.limit) return true;
				var value = val || Dom.input.val();
				value = $.toNumber(value);
				if (!isNaN(Data.min) && value !== null && value !== '' && value < Data.min) Element.trigger('field:error', ['min', Data.min + ' é o valor mínimo']);
				else if (!isNaN(Data.max) && value !== null && value !== '' && value > Data.max) Element.trigger('field:error', ['max', Data.max + ' é o valor máximo']);
				else {
					Element.trigger('field:valid');
					if (!isNaN(Data.min) && value !== null && value !== '' && value === Data.min) Element.trigger('field:min');
					else if (!isNaN(Data.max) && value !== null && value !== '' && value === Data.max) Element.trigger('field:max');
					else Element.trigger('field:ok');
				}
				return valueValid;
			},
			size: function (val) {
				var vdata = Element.data('validate') || {};
				if (!vdata.size) return valueValid = true;
				var value = val || Dom.input.val();
				value = String(value);
				if (!isNaN(Data.len) && value.length !== Data.len) Element.trigger('field:error', ['len', Data.len + ' caractere(s) exatos']);
				else if (!isNaN(Data.minlen) && value.length > 0 && value.length < Data.minlen) Element.trigger('field:error', ['minlen', Data.minlen + ' caractere(s) no mínimo']);
				else if (!isNaN(Data.maxlen) && value.length > 0 && value.length > Data.maxlen) Element.trigger('field:error', ['maxlen', Data.maxlen + ' caractere(s) no máximo']);
				else {
					Element.trigger('field:valid');
					if (!isNaN(Data.len) && value.length === Data.len) Element.trigger('field:len');
					else if (!isNaN(Data.minlen) && value.length === Data.minlen) Element.trigger('field:minlen');
					else if (!isNaN(Data.maxlen) && value.length === Data.maxlen) Element.trigger('field:maxlen');
				}
				return valueValid;
			},
			same: function () {
				var vdata = Group.element.data('validate') || {};
				if (!vdata.same) return valueValid = true;
				if (Group.element.length) {
					var lastval = false;
					Group.fields.each(function (k, v) {
						var $fd = $(this);
						var fdval = $fd.val();
						if (fdval !== '' && lastval !== false && lastval !== fdval) {
							$fd.trigger('field:error', ['same', 'Dados não são idênticos']);
							return false;
						}
						lastval = fdval;
					});
					if (valueValid) Element.trigger('field:valid');
				}
				return valueValid;
			},
			pattern: function (val) {
				var value = val || Dom.input.val();
				if (Data.pattern instanceof RegExp) {
					if (Data.pattern && value !== '') {
						valueValid = Data.pattern.test(value);
						if (!valueValid) Element.trigger('field:error', ['pattern', Data.patternError || 'Dado inválido']);
						else Element.trigger('field:valid');
					}
				} else if ($.jMaskPatterns[Data.pattern] || $.jMaskValidates[Data.pattern]) {
					valueValid = Element.valida(Data.pattern);
					if (!valueValid) Element.trigger('field:error', ['pattern', $.jMaskPatternsErrors[Data.pattern] || 'Dado inválido']);
					else Element.trigger('field:valid');
				}
				return valueValid;
			},
			remote: function (val) {
				var vdata = Element.data('validate') || {};
				if (!vdata.remote) return true;
				var value = val || Dom.input.val();
				if (value !== '' && value !== null){
					var d = {};
					d.cache = false;
					d.validate = {};
					d.validate[Element.data('name')] = $.extend({ id: Element.attr('id') }, Element.data('validate'));
					d.data = {};
					d.data[Element.data('name')] = Element.val();
					valueValid = null;
					Network.link.call(Element, d);
				}
				return valueValid;
			},
			all: function (val) {
				if (valueValid !== false) Validate.test.required(val);
				if (valueValid !== false) Validate.test.limit(val);
				if (valueValid !== false) Validate.test.size(val);
				if (valueValid !== false) Validate.test.same(val);
				if (valueValid !== false) Validate.test.pattern(val);
				return valueValid;
			}
		},
		required: function () {
			if (Data.required) {
				Element.on('field:enter field:change', function (event, key) {
					if (Validate.test.required()) Field.notify.remove();
				});
				var vdata = Element.data('validate') || {};
				vdata.required = true;
				Element.data('validate', vdata);
			}
			return Validate;
		},
		/*
		url : function(){
			Data.pattern = new RegExp("^(http|https|ftp|ftps|file)\://[a-zA-Z0-9\-\+\.\_]+\.[a-zA-Z0-9]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$");
			Data.patternError = 'URL inválida';
			Element.on('field:enter',function(){
				if (Validate.test.pattern()) Field.notify.remove();
			});
			var vdata = Element.data('validate') || {};
			vdata.url = true;
			Element.data('validate',vdata);
			return Validate;
		},
		email : function(){
			Data.pattern = new RegExp("[a-zA-Z0-9\-\+\.\_]+\@[a-zA-Z0-9\-\+\.\_]+\.[a-zA-Z0-9]{2,3}$");
			Data.patternError = 'E-mail inválido';
			Element.on('field:enter',function(){
				if (Validate.test.pattern()) Field.notify.remove();
			});
			var vdata = Element.data('validate') || {};
			vdata.email = true;
			Element.data('validate',vdata);
			return Validate;
		},
		phone : function(){
			Data.pattern =  new RegExp(".((10)|([1-9][1-9]).)\\s[0-9]{4,5}-[0-9]{4}|[0-9]{4,5}-[0-9]{4}");
			Data.patternError = 'Número inválido';
			Element.on('field:enter',function(){
				if (Validate.test.pattern()) Field.notify.remove();
			});
			var vdata = Element.data('validate') || {};
			vdata.phone = true;
			Element.data('validate',vdata);
			return Validate;
		},
		*/
		mask: function () {
			if (Data.mask) {
				var validationevent = Element.data('validationevent') || 'field:enter field:change';
				Data.pattern = Data.mask;
				Element.on(validationevent, function () {
					if (Validate.test.pattern()) Field.notify.remove();
				});
				var vdata = Element.data('validate') || {};
				vdata[Data.mask] = true;
				Element.data('validate', vdata);
				Element.addClass('validations');
			}
			return Validate;
		},
		limit: function () {
			if (!isNaN(Data.min) || !isNaN(Data.max)) {
				Element.on('field:enter field:change', function () {
					if (Validate.test.limit()) Field.notify.remove();
				});
				var vdata = Element.data('validate') || {};
				vdata.limit = { min: Data.min, max: Data.max };
				Element.data('validate', vdata);
				Element.addClass('validations');
			}
			return Validate;
		},
		size: function () {
			if (!isNaN(Data.len) || !isNaN(Data.minlen) || !isNaN(Data.maxlen)) {
				Element.on('field:enter field:change', function () {
					if (Validate.test.size()) Field.notify.remove();
				});
				var vdata = Element.data('validate') || {};
				vdata.size = { len: Data.len, minlen: Data.minlen, maxlen: Data.maxlen };
				Element.data('validate', vdata);
				Element.addClass('validations');
			}
			return Validate;
		},
		same: function () {
			if (Group.element.length) {
				Group.fields.on('field:enter field:change', function () {
					var $this = $(this);
					if (Validate.test.same()) Field.notify.remove();
				});
				var vdata = Group.element.data('validate') || {};
				vdata.same = true;
				Group.element.data('validate', vdata);
				Group.element.addClass('validations');
			}
			return Validate;
		},
		remote: function () {
			var data = Element.link();
			if (data.sui && data.process == 'validate') {
				Element.on('field:enter field:change', function (event) {
					if (Validate.test.remote()) Field.notify.remove();
				});
				var vdata = Element.data('validate') || {};
				vdata.remote = true;
				Element.data('validate', vdata);
				Element.addClass('validations');
			}
			return Validate;
		},
	};
	var Mask = {
		set: function (mask, options) {
			Data.mask = mask || Data.mask;
			Data.maskoptions = options || Data.maskoptions;
			Dom.input.mascara(Data.mask, Data.maskoptions);
		}
	};

	var Value = {
		set: function (val) {
			Data.setval = Data.setval || 'change';
			if (typeof Value[Data.setval] == 'function') {
				if (Value[Data.setval](val)) {
					Element.trigger('field:input');
				} else {
					if (!Element.hasClass('error')) Element.trigger('field:error', ['setval', 'Valor inválido']);
				}
			}
		},
		seed: function (op, seed) {
			if (!$.isNumeric(seed)) return null;
			var es = Element.data('seed') || 0;
			if (op == 'add' || op == 'sum' || op == '+') {
				es += $.toNumber(seed);
			} else if (op == 'del' || op == 'substract' || op == '-') {
				es -= $.toNumber(seed);
			}
			Element.attr('data-seed', es);
			Element.data('seed', es);
		},
		change: function (val) {
			if (val instanceof jQuery) {
				var v = val.data('value');
				if (!$.isPlainObject(v)) {
					v = v || val.val() || '';
					Dom.input.val(v);
				}
				//Element.trigger('field:select',[v]);
			} else {
				Dom.input.val(val || '');
			}
			return true;
		},
		replace: function (val) {
			return Value.append(val, true);
		},
		append: function (val, repl) {
			var $item, value;
			if (Data.type == 'drop' || Data.type == 'search') {
				if (val instanceof jQuery) {
					$item = val;
					value = val.data('value');
				} else if (val !== '' && val !== null) {
					$item = Dom.droplist.find('.options li[data-value="' + val + '"]');
					value = val;
				} else {
					value = val;
				}
				if (value === '' || value === null) {
					Element.removeClass('selected');
					Dom.droplist.find('.options li.selected').removeClass('selected');
					Dom.options.find('.option').remove();
				} else if ($item && $item.length) {
					Element.addClass('selected');
					if (Data.mode == 'single') Dom.options.find('.option').remove();
					var replaces = {
						icon: $item.data('icon'),
						label: $item.find('.name').text() || $item.html() || value,
						value: value
					};
					if (Data.type == 'search' && Data.mode == 'multiple') {
						Dom.options.find('.search').before(Parser.methods.getTemplate('input', 'option', replaces));
					} else {
						Dom.options.append(Parser.methods.getTemplate('input', 'option', replaces));
					}
				}
				Dom.options.parent('.scroll-custom').scrollTop(99999999).customScroll('update');
				Dom.droplist.find('.scroll-custom').customScroll('update');
				/*
				if (val instanceof jQuery){
					$item = val;
					value = val.data('value');
				} else if (typeof val === 'string'){
					$item = Dom.droplist.find('.options li[data-value="'+val+'"]');
					value = val;
				} else {
					value = val;
				}
				if (value === '' || value === null){
					Element.removeClass('selected');
					Dom.options.find('.option').remove();
				} else if ($item && $item.length) {
					Element.addClass('selected');
					if (Data.mode == 'single') Dom.options.find('.option').remove();
					var replaces = {
						icon : $item.data('icon'),
						label : $item.find('.name').text() || $item.html() || value,
						value : value
					};
					if (Data.type == 'search' && Data.mode == 'multiple'){
						Dom.options.find('.search').before(Parser.methods.getTemplate('input','option',replaces));
					} else {
						Dom.options.append(Parser.methods.getTemplate('input','option',replaces));
					}
				}
				Dom.options.parent('.scroll-custom').scrollTop(99999999).customScroll('update');
				Dom.droplist.find('.scroll-custom').customScroll('update');
				*/
			}
			return true;
		},
		caller: function (val) {
			if (Caller[Data.type] && typeof Caller[Data.type].setval == 'function') {
				return Caller[Data.type].setval(val);
			} else {
				Element.trigger('field:error', ['setval', 'Método inválido']);
			}
		},
	};

	this.val = function () {
		var arg = arguments;
		if (arguments.length) {
			if ($.isNumeric(arg[0])) {
				Value.set($.toMinMax(arg[0], Data.min, Data.max));
			} else if (typeof arg[0] == 'object') {
				if (arg[0] instanceof jQuery) {
					Value.set(arg[0]);
				} else {
					Value.set(arg[0].value || arg[0]);
				}
			} else {
				Value.set(arg[0]);
			}
			return Element;
		} else if (Data.getval != 'caller') {
			var value;
			Dom.wrap.find(':not(.addons) .input').each(function (k, v) {
				var $input = $(this), key = $input.attr('name') || k;
				var val = $input.val();
				if (Data.convertval == 'float') val = $.toFloat(val);
				else if (Data.convertval == 'decimal') val = $.toDecimal(val);
				else if (Data.convertval == 'integer') val = $.toInt(val);
				else if (Data.convertval == 'number') val = $.toNumber(val);
				else if (Data.convertval == 'numeric') val = $.toNumeric(val);
				else if (Data.convertval == 'date') val = $.toDate(val, 'us');
				else if (Data.convertval == 'dateus') val = $.toDate(val, 'us');
				else if (Data.convertval == 'datebr') val = $.toDate(val, 'br');
				else if (Data.convertval == 'htmlencode') val = $.toHtml(val);
				else if (Data.convertval == 'htmldecode') val = $.toText(val);
				else if (Data.convertval == 'hash') val = $.md5(val);
				if (typeof key == 'string') {
					if (key.indexOf('[') > -1) {
						key = $.deparam(key + '=' + val);
						value = $.extend(true, {}, value, key);
					} else {
						value = value || {};
						value[key] = val;
					}
				} else {
					value = value || [];
					value.push(val);
				}
			});
			switch (Data.getval) {
				case 'single': return (value && typeof value[0] != 'undefined') ? value[0] : ''; break;
				case 'multiple': return value; break;
				default: return (typeof value[0] != 'undefined') ? value[0] : '';
			}
		} else if (Data.getval == 'caller') {
			if (Caller[Data.type] && Caller[Data.type].getval) {
				return Caller[Data.type].getval();
			} else console.error('There is no value caller function for "' + Data.type + '" fields.');
		}
	};

	this.notify = {
		add: function () {
			var arg = arguments, notify;
			if (typeof arg[0] == 'string' && !arg[1]) {
				notify = { type: 'error', message: arg[0] };
			} else if (typeof arg[0] == 'string' && typeof arg[1] == 'string') {
				notify = { type: arg[0], message: arg[1] };
			} else if (typeof arg[0] == 'object') {
				notify = arg[0];
			}
			if (Group.element.length) {
				Group.notify.html(notify.message);
				Group.fields.addClass(notify.type);
			} else {
				Dom.notify.html(notify.message);
				Element.addClass(notify.type);
			}
		},
		remove: function () {
			if (Group.element.length) {
				Group.notify.html('');
				Group.fields.removeClass('error alert info notice');
			} else {
				Dom.notify.html('');
				Element.removeClass('error alert info notice');
			}
		}
	};

	this.vars = function (v) {
		Data.vars = Data.vars || {};
		if (!v) {
			Element.children('var').each(function () {
				var $v = $(this);
				if ($v.attr('type') == 'json') {
					var kname = $v.attr('name') || 'parameter';
					var jobj = JSONX.parse($v.text()) || {};
					if ($v.attr('name')) Data.vars[kname] = jobj;
					else Data.vars = jobj;
				} else {
					Data.vars[$v.attr('name') || 'parameter'] = $v.attr('value') || $v.text();
				}
				//$v.remove();
			});
		} else if (typeof v == 'string') {
			return Data.vars[v] || null;
		} else if (typeof v == 'object') {
			Data.vars = $.extend({}, Data.vars, v);
			Element.trigger('field:changevars');
		}
		return Data.vars;
	};

	this.events = function () {
		var _snippet = function ($v, $this, search) {
			var term = search || '';
			var key = $this.val();
			var link = $this.link();
			var data = { snippet: {} };
			var snippet = $.parseJSON($v.text() || {});
			$.each(snippet, function (k, v) {
				if (k.indexOf('link:') === -1 && k != 'field') {
					if (v.indexOf('@') > -1 || v.indexOf('#') > -1) {
						data.snippet[k] = $.ache('field', v, [Element.closest('.sui-view'), $(document)]).val();
					} else {
						data.snippet[k] = v;
					}
				}
			});
			data.snippet.term = data.snippet.term || term;
			data.cache = false;
			data.origin = link.origin;
			data.sui = snippet['link:sui'];
			data.seed = Number(snippet['link:seed']);
			data.action = snippet['link:action'];
			data.command = snippet['link:command'];
			data.placement = snippet['link:placement'];
			data.group = snippet['link:group'];
			data.geolocation = snippet['link:geolocation'];
			data.field = snippet.field || snippet.fields || $this;
			data.seed += link.seed || 0;
			data.cancelnested = true;
			data.ondone = function (s) {
				Dom.listoptions.removeClass('default');
				Dom.listoptions.unmark();
				if (term !== '') {
					Dom.listoptions.mark(term);
				}
			};
			return Network.link.call($this, data);
		};
		Element.children('code').each(function () {
			var $v = $(this);
			if ($v.attr('type') == 'event') {
				var xhr;
				var mto;
				var eventname = 'field:' + $v.attr('on');
				var value;
				//Element.off(eventname).on(eventname,function(event,val){
				Element.on(eventname, function (event, val) {
					var args = arguments;
					var $this = $(this);
					if ($v.attr('callback') === 'snippet') {
						if (eventname === 'field:search') {
							value = val;
							var $items = Dom.droplist.find('.options li');
							if (value.length) {
								if (!Device.ismobile && !Element.hasClass('droplisted')) Dom.droplist.trigger('droplist:open');
								if (Dom.listoptions.hasClass('default') || $items.length === 0 || $items.length > 10) {
									clearTimeout(mto);
									if (xhr) Network.abort(xhr);
									mto = setTimeout(function () {
										xhr = _snippet($v, $this, value);
									}, 300);
								} else {
									$items.hide();
									$items.filter(':containsNC("' + value + '")').show();
									Dom.listoptions.unmark().mark(value);
								}
							} else {
								$items.show();
								Dom.listoptions.unmark();
								if (Dom.listdefaultoptions.length) {
									Dom.listoptions.find('ul').html(Dom.listdefaultoptions);
									Dom.listoptions.addClass('default');
								} else {
									Dom.droplist.find('.options ul').html('');
								}
							}
						} else {
							xhr = _snippet($v, $this);
						}
					} else if ($v.attr('callback') === 'show') {

					} else if ($v.attr('callback') === 'hide') {

					} else if ($v.attr('callback') === 'enable') {

					} else if ($v.attr('callback') === 'disable') {

					} else {
						eval($.suiEvent($v));
					}
				});

			}
			//$v.remove();
		});
		return Data.vars;
	};

	this.snip = function (sui) {
		var html = {
			options: '',
			files: ''
		};
		if (typeof sui == 'object') {
			if (typeof sui.find !== 'undefined') {
				if (typeof sui.attr('value') == 'string') html.value = sui.attr('value');
				Parser.fetch.list(Data, sui);
				Parser.fetch.file(Data, sui);
				if (Parser.setup.list.options) {
					html.options = Parser.methods.getParts('options');
				}
				// falta colocar o do file
			} else {
				html = sui;
			}
		}
		if (html.options) {
			var $ul = Dom.listoptions.children('ul').html(html.options);
			var $li = $ul.find('li.selected');
			if ($li.length && (html.value === '' || html.value === undefined)) {
				Field.val($li.data('value'));
			}
		}
		// falta colocar o do file

		if (html.value !== undefined) {
			Field.val(html.value);
		}

		return html;
	};

	if (Element instanceof jQuery) {
		if (Element.hasClass('sui-field')) {
			Data = Element.data();
			// Restrições ao Mobile
			if (Device.ismobile) {
				if (Data.type == 'mce') {
					Element.switchClass('mce', 'code');
					Element.data('type', 'code');
					Data.type = 'code';
				}
			}

			Data.min = $.toNumber(Data.min);
			Data.max = $.toNumber(Data.max);
			Data.len = $.toNumber(Data.len);
			Data.minlen = $.toNumber(Data.minlen);
			Data.maxlen = $.toNumber(Data.maxlen);
			Group.element = Element.closest('.sui-fieldgroup');
			Group.label = Group.element.find('.label');
			Group.notify = Group.element.find('.notify');
			Group.fields = Group.element.find('.sui-field');
			Dom.label = Element.children('.label').add(Group.label);
			Dom.notify = Element.find('.notify');
			Dom.wrap = Element.children('.wrap');
			Dom.badge = Dom.wrap.children('.badge');
			Dom.box = Dom.wrap.children('.box');
			Dom.sliders = Dom.wrap.find('.table > .row');
			Dom.value = Dom.wrap.find('.cell.value');
			Dom.options = Dom.value.find('.options');
			Dom.input = Dom.value.find('.input');
			Dom.search = Dom.wrap.find('.cell .search');
			Dom.buttons = {
				before: Dom.input.prevAll('.cell.button'),
				after: Dom.input.nextAll('.cell.button'),
				all: Dom.wrap.children('.table,.box').find('.cell.button'),
			};
			Dom.tools = Dom.wrap.children('.tools');
			Dom.queue = Dom.wrap.children('.queue');
			Dom.addons = Dom.wrap.children('.addons');
			Dom.droplist = Dom.wrap.find('.addons > .sui-droplist, .button > .sui-droplist');
			Dom.droplistlayer = Dom.wrap.find('.addons > .droplistlayer, .button > .droplistlayer');
			Dom.droplisttail = Dom.droplist.find('.tail');
			Dom.droplistsearch = Dom.droplist.find('input.search');
			Dom.listtools = Dom.droplist.children('.tools');
			Dom.listoptions = Dom.droplist.children('.options');
			Dom.listdefaultoptions = Dom.listoptions.find('ul').html();

			Parser.setup = Data;

			Field.vars();
			Field.events();


			Element.on('field:loaded', function () {
				Element.trigger('field:initval');
			});
			Element.on('field:initval', function () {
				var data = Element.data();
				data.initval = Field.val();
				data.inittxt = Dom.value.find('.option').map(function () { return $(this).text(); }).get().join(', ');
			});
			/*
			Element.on('field:loaded',function(){
				var data = Element.data();
				data.initval = Element.isDisable()||Element.isIgnored()?'':Field.val();
				data.inittxt = Element.isDisable()||Element.isIgnored()?'':Dom.value.find('.option:eq(0)').text();
			});
			*/
			Element.on('field:error', function (event, type, message) {
				valueValid = false;
				Field.notify.add(message);
				Element.removeClass('invalid valid').addClass('invalid');
			});
			Element.on('field:focus field:input', function (event) {
				valueValid = null;
				Field.notify.remove();
			});
			Element.on('field:change', function (event) {
				Element.removeClass('invalid valid')
			});
			Element.on('field:valid', function (event, type, message) {
				valueValid = true;
				Field.notify.remove();
				if (message) Field.notify.add('info', message);
				Element.removeClass('invalid valid').addClass('valid');
			});


			switch (Data.type) {
				case 'input': Data.mode && Bind.input[Data.mode] ? Bind.input[Data.mode]() : Bind.input.custom(); break;
				case 'text': Data.mode && Bind.text[Data.mode] ? Bind.text[Data.mode]() : Bind.text.simple(); break;
				case 'number': Data.mode && Bind.number[Data.mode] ? Bind.number[Data.mode]() : Bind.number.simple(); break;
				case 'drop': Data.mode && Bind.drop[Data.mode] ? Bind.drop[Data.mode]() : Bind.drop.single(); break;
				case 'search': Data.mode && Bind.search[Data.mode] ? Bind.search[Data.mode]() : Bind.search.single(); break;
				case 'date': Data.mode && Bind.date[Data.mode] ? Bind.date[Data.mode]() : Bind.date.single(); break;
				case 'datetime': Data.mode && Bind.datetime[Data.mode] ? Bind.datetime[Data.mode]() : Bind.datetime.short(); break;
				case 'time': Data.mode && Bind.time[Data.mode] ? Bind.time[Data.mode]() : Bind.time.short(); break;
				case 'picker': Data.mode && Bind.picker[Data.mode] ? Bind.picker[Data.mode]() : Bind.picker.single(); break;
				case 'color': Data.mode && Bind.color[Data.mode] ? Bind.color[Data.mode]() : Bind.color.spectrum(); break;
				case 'switch': Data.mode && Bind.switch[Data.mode] ? Bind.switch[Data.mode]() : Bind.switch.simple(); break;
				case 'slider': Data.orient && Bind.slider[Data.orient] ? Bind.slider[Data.orient]() : Bind.slider.simple(); break;
				case 'file': Data.mode && Bind.file[Data.mode] ? Bind.file[Data.mode]() : Bind.file.single(); break;
				case 'image': Data.mode && Bind.image[Data.mode] ? Bind.image[Data.mode]() : Bind.image.single(); break;
				case 'ace': Data.mode && Bind.ace[Data.mode] ? Bind.ace[Data.mode]() : Bind.ace.editor(); break;
				case 'code': Data.mode && Bind.code[Data.mode] ? Bind.code[Data.mode]() : Bind.code.editor(); break;
				case 'mce': Data.mode && Bind.mce[Data.mode] ? Bind.mce[Data.mode]() : Bind.mce.editor(); break;
				case 'button': Data.mode && Bind.button[Data.mode] ? Bind.button[Data.mode]() : Bind.button.single(); break;
				case 'box': Data.mode && Bind.button[Data.mode] ? Bind.button[Data.mode]() : Bind.button.single(); break;
				case 'locale': Data.mode && Bind.locale[Data.mode] ? Bind.locale[Data.mode]() : Bind.locale.search(); break;
				case 'map': Data.mode && Bind.map[Data.mode] ? Bind.map[Data.mode]() : Bind.map.coordinates(); break;
				//case 'matrix': 	return Data.mode 	&& Bind.matrix[Data.mode] 	? Bind.matrix[Data.mode]() 		: Bind.matrix.security();		break;
			}

			if (Element.isDisable()) {
				Element.disable(); // desabilitar elemento quando o parente for disable
			}
		}
	}


	var _caller = Caller[Data.type] || {};
	var Methods = this.methods = {
		min: _caller.min
	};



};

$(window)
	.on('resize', function (event) {
		$('.sui-field.editor').trigger('field:resize');
	});
