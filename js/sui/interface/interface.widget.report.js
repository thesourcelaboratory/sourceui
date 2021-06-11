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

/**
 * INTERFACE - AUTH
 * @description Interface do autenticador do sistema
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */

sourceui.interface.widget.report = function($widget,setup){

	'use strict';

	var Report = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Plugin = sourceui.instances.interface.plugins;
	var Confirm = Plugin.confirm;
	var Dom = Interface.dom;
	var Notify = sourceui.instances.interface.plugins.notify;

	var History = [];

	var Console;

	Console = Debug.get('JS');

	Report.common = new Interface.widget.common($widget,setup);
	Report.widget = $widget;
	Report.area = $widget.children('.area');
	Report.variables = Report.area.children('.sui-variable');
	Report.wgtools = Report.widget.children('.toolbar').find('.tools');
	Report.view = Report.widget.closest('.sui-view');
	Report.pagelist = Report.widget.find('.sui-report-pagelist');
	Report.scroll = Report.view.children('.scroll-default, .scroll-all');
	Report.viewtools = Report.view.children('.toolbar').children('.tools.left');
	Report.document = Report.widget.find('.sui-report-document');
	Report.validations = Report.widget.find('.sui-validations rule');
	Report.templates = Report.widget.find('.sui-templates');
	Report.editors = Report.document.find('[data-edition*="text"],[data-edition*="graphic"]');
	Report.tinymceinlinetoolbar = Dom.body.children('#tinymceinlinetoolbar');

	Report.document.addClass('preventhistorystack');

	var ___cnsl = {
		log: function(){
			return;
			var a=[],l;
			$.each(arguments,function(k,v){
				if (v instanceof HTMLElement || v instanceof jQuery) l = v;
				else a.push(v);
			});
			console.groupCollapsed('🔵 '+a.join('  '),[l]);
			console.info(l);
			console.groupEnd();
		}
	};

	var Mouse = {
		axis: function(event,$ref){
			var roffset = $ref.offset();
			return [event.pageX - roffset.left, event.pageY - roffset.top];
		},
		distance: function calculateDistance(event,ref) {
			return Math.floor(Math.sqrt(Math.pow(event.pageX - ref[0], 2) + Math.pow(event.pageY - ref[1], 2)));
		}
	}

	var Variable = Report.variable = {
		init: function(){
			Report.variables.each(function(){
				var $var = $(this);
				$var.data('verifier',$.md5('var:'+$var.attr('name')+'='+$var.text()));
			});
		},
		get: function(name){
			var $var = Report.variables.filter('[name="'+name+'"]');
			var value = $var.text();
			value = ((value+'').indexOf('[') === 0) ? JSON.parse(value) : value;
			if ($var.length){
				if ($.md5('var:'+name+'='+value) === $var.data('verifier')) return value;
				else Console.error({ mode: 'VAR', title: 'Variable "'+name+'" is invalid'}).trace();
			}
			else Console.error({ mode: 'VAR', title: 'Variable "'+name+'" not found'}).trace();
		},
		getAll: function(){
			var $var = Report.variables;
			var values = {};
			if ($var.length){
				$var.each(function(){
					var $v = $(this);
					var name = $v.attr('name');
					var value = $v.text();
					if ($.md5('var:'+name+'='+value) === $v.data('verifier')){
						values[name] = ((value+'').indexOf('[') === 0) ? JSON.parse(value) : value;
					} else Console.error({ mode: 'VAR', title: 'Variable "'+name+'" is invalid'}).trace();
				});
			}
			return values;
		},
		set: function(name,value){
			var $var = Report.variables.filter('[name="'+name+'"]');
			if ($var.length){
				value = (typeof value == 'object') ? JSON.stringify(value) : value;
				$var.text(value);
				$var.data('verifier',$.md5('var:'+name+'='+value));
			}
			else  Console.error({ mode: 'VAR', title: 'Variable "'+name+'" not found'}).trace();
		}
	};
	Variable.init();

	var Graphic = {
		base64: function(url,callback,failback){
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				var reader = new FileReader();
				reader.onloadend = function() {
					callback(reader.result);
				}
				reader.readAsDataURL(xhr.response);
			};
			xhr.onerror = function(e){
				failback(e);
			}
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.send();
		},
		post: function(imgdata,imgname,callback,failback){
			$.post(
				Report.widget.data('imgdatauploader'),{
				imgname:imgname,
				dochash:Variable.get('docHash'),
				origin:Report.view.data('link-origin'),
				imgdata:imgdata
			},function(data){
				if (callback) callback(data);
				Console.info({ mode: 'AJAX', title: 'Graphic.post: imgdataUploader DONE', content: data}).trace();
			},"json")
			.fail(function(e,data){
				if (failback) failback(data);
				Console.error({ mode: 'AJAX', title: 'Graphic.post: imgdataUploader FAIL', content: data }).trace();
			});
		}
	};

	var Thumbnail = {
		current: {
			page:null,
			thumb:null,
			offset:{top:0,left:0},
			pageheader:null,
			pagefooter:null
		},
		changeid: function($page){
			var content = '';
			$page.find('.block').each(function(){
				var $this = $(this);
				content += $this.html() + $this.attr('style') + $this.css('color');
			});
			content += $page.attr('data-background') + $page.attr('data-visible') + $page.attr('data-layout');
			return $.md5(content);
		},
		spanwidth: function($elem){
			var orig = {display:$elem.css('display'),width:$elem.css('width')};
			$elem.css({display:'inline',width:'auto'});
			var width = Math.round($elem.width()/10);
			$elem.css({display:orig.display,width:orig.width});
			return width;
		},
		size: function($elem){
			var w=$elem.outerWidth(), h=$elem.innerHeight();
			return {width:Math.round(w/10), height:Math.round(h/10)};
		},
		dimensions: function($elem){
			var top=0, left=0, w=$elem.outerWidth(), h=$elem.innerHeight();
			var offset = $elem.offset();
			top = offset.top - Thumbnail.current.offset.top;
			left = offset.left - Thumbnail.current.offset.left;
			return {top:top/10, left:left/10, width:Math.round(w/10), height:Math.round(h/10)};
		},
		dom: {
			logo:function($mini,color){
				$mini.append($('<div class="circle"/>').css({'border-color':color}));
				$mini.append($('<div class="btg"/><div class="pactual"/>').css({'background-color':color}));
			},
			table:function($parent,$elem,type){
				var $part = $elem.find('caption, tbody'), $c;
				$part.each(function(){
					var $p = $(this), bgcolor, border;
					var dim = Thumbnail.size($p);
					if ($p.is('caption')){
						bgcolor = $p.css('background-color');
					} else {
						border = $p.find('tr:eq(0) td:eq(1)').css('background-color');
						border = !border || border == 'rgba(0, 0, 0, 0)' ? $p.find('th:eq(0)').css('background-color') : border;
						bgcolor = $p.find('tr:eq(1) td:eq(1)').css('background-color');
						bgcolor = !bgcolor || bgcolor == 'rgba(0, 0, 0, 0)' ? $p.find('tr:eq(0)').css('background-color') : bgcolor;
						$p.find('tr:eq(1) td[style*="background-color"]').each(function(){
							var $h = $(this);
							var dh = Thumbnail.dimensions($h);
							var $hg = $('<div class="floater flt-highlitecol"/>').css({top:dh.top,left:dh.left,width:dh.width,height:dim.height,background:$h.css('background-color')});
							$parent.after($hg);
						});
					}
					$c = $('<div class="content cnt-'+$p.tag()+' '+$p.attr('class')+'"/>');
					$c.css({width:dim.width,height:dim.height,'background-color':bgcolor,'border-color':border||bgcolor||''});
					$parent.append($c);
				});
			},
			floaters:function(f){
				var $thumb = Thumbnail.current.thumb;
				var $return = $('<pre>');
				var $elems = typeof f.elements == 'string' ? Thumbnail.current.page.find(f.elements) : f.elements;
				$elems.each(function(){
					var $e = $(this);
					var css = {};
					var dim = Thumbnail.dimensions($e);
					var classarray = ($e.attr('class')||'').split(' ');
					var classname = classarray[0] !== $e.attr('data-name') ? classarray[0]+' '+($e.attr('data-name') || '' ) : classarray[0] || $e.attr('data-name');
					if ($e.is('table')) {
						var $floater = $('<div class="floater flt-table '+classname+'"/>');
					} else {
						var $floater = $('<div class="floater flt-'+$e.tag()+' '+classname+'" />');
						var color = $e.css('color')||'inherit';
						if ($e.is('.logo')){
							Thumbnail.dom.logo($floater,color);
						} else if ($e.is('.cover')){
							css['background'] = $e.css('background');
						} else if (f.spanwidth && $e.is(f.spanwidth)){
							dim.width = Thumbnail.spanwidth($e);
							css['background-color'] = color;
						} else if ($e.is('a,b,u,i,span')){
							css['background-color'] = color;
							if (dim.height > 1) css.opacity = 0.15;
						}
						if ($e.is('[style*="background-image"]')){
							css['background-image'] = $e.css('background-image');
						} else if ($e.is('[src]')){
							css['background-image'] = 'url("'+$e.attr('src')+'")';
						}
					}
					$floater.css($.extend({top:dim.top,left:dim.left,width:dim.width,height:dim.height},css));
					$thumb.append($floater);
					$return.append($floater.clone());
					if (f.contents){
						$.each(f.contents,function(k,c){
							if ($e.is(k)){
								Thumbnail.dom.contents($floater, {
									elements:$e.find(c.elements),
									spanwidth:c.spanwidth,
								});
								return false;
							}
						});
					}
				});
				return $return;
			},
			contents:function($floater,c){
				var $elems = typeof c.elements == 'string' ? Thumbnail.current.page.find(c.elements) : c.elements;
				$elems.each(function(){
					var $e = $(this);
					var $c;
					var css = {};
					if ($e.is('table')) {
						Thumbnail.dom.table($floater,$e);
					} else {
						var dim = Thumbnail.size($e);
						var classarray = ($e.attr('class')||'').split(' ');
						var classname = classarray[0] !== $e.attr('data-name') ? classarray[0]+' '+($e.attr('data-name') || '' ) : classarray[0] || $e.attr('data-name');
						$c = $('<div class="content cnt-'+$e.tag()+' '+classname+'"/>');
						var color = $e.css('color')||'inherit';
						if (c.spanwidth && $e.is(c.spanwidth)){
							dim.width = Thumbnail.spanwidth($e);
							css['background-color'] = color;
						} else if ($e.is('a,b,u,i,span')){
							css['background-color'] = color;
							if (dim.height > 1) css.opacity = 0.2;
						} else if ($e.is('p')){
							css = $.extend(css,{'background-color':($e.text()===''?'transparent':$e.css('color')),height:dim.height-2});
						}
						if ($e.is('[style*="background-image"]')){
							css['background-image'] = $e.css('background-image');
						} else if ($e.is('[src]')){
							css['background-image'] = 'url("'+$e.attr('src')+'")';
						}
						$c.css($.extend({width:dim.width,height:dim.height},css));
						$floater.append($c);
					}
				});
			},
			fullcovered: function(){
				var $page = Thumbnail.current.page;
				var $thumb = Thumbnail.current.thumb;
				$thumb.removeClass('covered-default splited');
				$thumb.addClass('fullcovered');
				if ($page.css('background-image') != $thumb.css('background-image')) $thumb.css('background-image', $page.css('background-image'));
				Thumbnail.dom.floaters({
					elements:'.logo, .documentLabel, .documentSublabel, .info p, .reportName',
					spanwidth:'.documentLabel, .documentSublabel, p, .reportName',
				});
			},
			covereddefault: function(){
				Thumbnail.current.thumb.removeClass('fullcovered splited');
				Thumbnail.current.thumb.addClass('covered-default');
				Thumbnail.dom.floaters({
					elements:'.cover, .cover .logo, .cover .documentLabel, .cover .documentSublabel, .cover .info p, .cover .reportName:last, i.flag',
					spanwidth:'.documentLabel, .documentSublabel, p, .reportName',
				});
				Thumbnail.dom.floaters({
					elements:'.main .reportTitle, .main .reportSummary, .main .block[data-edition], .main .block a[href], .main .block span[data-mce-style], .main img',
					spanwidth:'.main .reportTitle',
					contents: {
						'.block[data-edition]':{
							elements:'h1,h2,h3,h4,h5,p,table',
							spanwidth:'h1,h2,h3,h4',
						}
					}
				});
			},
			splited : function(){
				Thumbnail.current.thumb.removeClass('fullcovered covered-default');
				Thumbnail.current.thumb.addClass('splited');
				if (Thumbnail.current.pageheader){
					Thumbnail.current.thumb.append(Thumbnail.current.pageheader.html());
				} else {
					Thumbnail.current.pageheader = Thumbnail.dom.floaters({
						elements:'.header, .header .autofilltitle, .header [data-autofill="documentType"], .header [data-autofill="documentDate"], .header [data-autofill="documentLabel"], .header [data-autofill="documentSublabel"]',
						spanwidth:'.autofilltitle, [data-autofill="documentDate"], [data-autofill="documentType"], [data-autofill="documentLabel"], [data-autofill="documentSublabel"]',
					});
				}
				Thumbnail.dom.floaters({
					elements:'.main .block[data-edition]:not(.company-profile), .main .block a[href], .main .block span[data-mce-style], .company-profile, .company-profile .ratios, .main img',
					spanwidth:'.main .reportTitle',
					contents: {
						'.block[data-edition]:not(.company-profile)':{
							elements:'h1,h2,h3,h4,h5,p,table',
							spanwidth:'h1,h2,h3,h4',
						},
						'.company-profile':{
							elements:'h1,h2,h3,h4,.infos',
							spanwidth:'h1,h2,h3,h4,.infos',
						},
						'.ratios':{
							elements:'h5,table',
						},
					}
				});
				if (Thumbnail.current.pagefooter){
					Thumbnail.current.thumb.append(Thumbnail.current.pagefooter.html());
				} else {
					Thumbnail.current.pagefooter = Thumbnail.dom.floaters({
						elements:'.footer, .footer .reportName, .footer .cell.right',
						spanwidth:'.reportName, .right',
					});
				}
			}
		},
		parse : function($page,$thumb){
			$thumb.html('');
			Thumbnail.current.page = $page;
			Thumbnail.current.thumb = $thumb;
			Thumbnail.current.offset = $page.offset();
			if ($page.is('.fullcovered')) Thumbnail.dom.fullcovered();
			if ($page.is('.covered-default')) Thumbnail.dom.covereddefault();
			if ($page.is('.splited')) Thumbnail.dom.splited();
		},
	};

	var pageContentChangeId = function($page){
		var content = '';
		$page.find('.block').each(function(){
			content += $(this).html();
		});
		content += $page.attr('data-background');
		content += $page.attr('data-visivle');
		content += $page.attr('data-layout');
		return $.md5(content);
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var historyStack = {
		online: false,
		pointer: -1,
		stack: [],
		push: function(setup){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var sliced = historyStack.stack.slice(0,historyStack.pointer+1);
			sliced = sliced.slice(-20);
			historyStack.stack = sliced || [];
			historyStack.pointer = historyStack.stack.length;
			historyStack.pile(setup);
			return setup;
		},
		replace: function(setup){
			if (Report.document.hasClass('preventhistorystack')) return false;
			historyStack.stack[historyStack.pointer] = {
				pile:[setup]
			};
			return setup;
		},
		pile: function(setup){
			if (Report.document.hasClass('preventhistorystack')) return false;
			historyStack.stack[historyStack.pointer] = historyStack.stack[historyStack.pointer] || [];
			historyStack.stack[historyStack.pointer].piles = historyStack.stack[historyStack.pointer].piles || [];
			historyStack.stack[historyStack.pointer].piles.push(setup);
			return setup;
		},
		forward: function(){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var stack = historyStack.go(historyStack.pointer+1);
			if (stack){
				var firstpile = stack.piles[0];
				if (firstpile){
					var $scrollelement = firstpile.do.page || firstpile.do.reference || firstpile.do.fieldwrap || firstpile.do.edition;
					var notification = (firstpile.do.label || 'History got forward')+' ('+(historyStack.pointer+1)+')';
					Report.scroll.scrollTo($.isNumeric(firstpile.do.scrolltop)? firstpile.do.scrolltop : $scrollelement, 100, !$.isNumeric(firstpile.do.scrolltop) ? { offset:Dom.window.height()/3} : {} );
					$.tipster.notify(notification);
					historyStack.pointer++;
				}
			}
			else $.tipster.notify('No more forward stacks');
		},
		back: function(){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var stack = historyStack.go(historyStack.pointer);
			if (stack){
				var firstpile = stack.piles[0];
				if (firstpile){
					var $scrollelement = firstpile.undo.page || firstpile.undo.reference || firstpile.undo.fieldwrap || firstpile.undo.edition;
					var notification = (firstpile.undo.label || 'History got back')+' ('+historyStack.pointer+')';
					Report.scroll.scrollTo($.isNumeric(firstpile.undo.scrolltop)? firstpile.undo.scrolltop : $scrollelement, 100, !$.isNumeric(firstpile.undo.scrolltop) ? { offset:Dom.window.height()/3} : {} );
					$.tipster.notify(notification);
					historyStack.pointer--;
				}
			}
			else $.tipster.notify('No more back stacks');
		},
		go: function(pointer){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var stack = historyStack.stack[pointer];
			if (!stack) return;
			stack.piles = stack.piles || [];
			Report.document.addClass('preventhistorystack');
			$.each(stack.piles, function(kp,pile){
				if (pointer > historyStack.pointer){
					if (pile.do.action == 'addedition'){ 				pile.do.page.trigger('page:addedition',[pile.do.fieldwrap,pile.do.reference,pile.do.placement]); }
					else if (pile.do.action == 'removeedition'){ 		pile.do.edition.trigger('edition:remove'); }
					else if (pile.do.action == 'movededition'){ 		pile.do.reference[pile.do.placement](pile.do.fieldwrap); }
					else if (pile.do.action == 'positionedition'){ 		pile.do.edition.attr('data-position',pile.do.position); pile.do.fieldwrap.attr('style',pile.do.position); }
					else if (pile.do.action == 'addcontainer'){ 		Report.document.trigger('page:addcontainer',[pile.do.container,pile.do.reference,pile.do.placement]); }
					else if (pile.do.action == 'removecontainer'){		pile.do.container.trigger('container:remove'); }
					else if (pile.do.action == 'addpage'){ 				Report.document.trigger('document:addpage',[pile.do.page,pile.do.reference,pile.do.placement]); }
					else if (pile.do.action == 'removepage'){ 			pile.do.page.trigger('page:remove'); }
				}
				else if (pointer <= historyStack.pointer){
					if (pile.undo.action == 'addedition'){ 				pile.undo.page.trigger('page:addedition',[pile.undo.wrap,pile.undo.reference,pile.undo.placement]); }
					else if (pile.undo.action == 'removeedition'){ 		pile.undo.edition.trigger('edition:remove'); }
					else if (pile.undo.action == 'movededition'){ 		pile.undo.reference[pile.undo.placement](pile.undo.fieldwrap); }
					else if (pile.undo.action == 'positionedition'){ 	pile.undo.edition.attr('data-position',pile.undo.position); pile.undo.fieldwrap.attr('style',pile.undo.position); }
					else if (pile.undo.action == 'addcontainer'){		Report.document.trigger('page:addcontainer',[pile.undo.container,pile.undo.reference,pile.undo.placement]); }
					else if (pile.undo.action == 'removecontainer'){ 	pile.undo.container.trigger('container:remove'); }
					else if (pile.undo.action == 'addpage'){			Report.document.trigger('document:addpage',[pile.undo.page,pile.undo.reference,pile.undo.placement]); }
					else if (pile.undo.action == 'removepage'){ 		pile.undo.page.trigger('page:remove'); }

				}
			});
			Report.document.removeClass('preventhistorystack');
			return stack;
		},
	};
	/*
	if (!cancelDrop){
		$clone = $('<div class="fieldwrap '+edition+'" />').append($clone);
		if ($drop[key].is('.col')){
			if (!$drop[key].children('.fieldwrap').length){
				$page.trigger('page:addedition',[$clone,$drop[key],'append']);
			} else {
				$.tipster.notify('Spot has a box already');
			}
		} else if ($drop[key].is('.fieldwrap')){
			if (!$drop[key].parent().is('.col')){
				if (this.ev.y > $drop[key].offset().top + ($drop[key].height()/3)){
					$page.trigger('page:addedition',[$clone,$drop[key],'after']);
				} else {
					$page.trigger('page:addedition',[$clone,$drop[key],'before']);
				}
			} else {
				$.tipster.notify('Spot has a box already');
			}
		} else if ($drop[key].is('.cell')){
			$page.trigger('page:addedition',[$clone,$drop[key],'append']);
		} else {
			$page.trigger('page:addedition',[$clone]);
		}

		// autoclick dynamic insertion
		if (edition == 'dynamic'){
			$clone.find('[data-edition]').addClass('empty-content').trigger('edition:tools').click();
			$clone.children('.edition-actions').find('.pick a').click();
		} else if (edition == 'toc'){
			$clone.find('[data-edition]').trigger('edition:tools').click();
		} else {
			//$clone.find('[data-edition]').focus(); // comentado para verificar se esse é o bug do focus+placeholder
		}
		Report.document.trigger('document:boxcount');
	}
	*/
	Dom.document.on('directpaste', function(event,$clone,$page,$container){
		if ($container.length){
			var $col = $container.find('.col.selected, col.empty:eq(0)');
			if ($col.length){
				$col.removeClass('selected');
				if (!$col.children('.fieldwrap').length){
					$page.trigger('page:addedition',[$clone,$col,'append']);
				} else {
					$.tipster.notify('Spot has a box already');
				}
			}
		} else {
			$page.trigger('page:addedition',[$clone]);
		}
		$clone.children('[data-edition]').trigger('edition:uploadimgs');
		Report.document.trigger('document:boxcount');
		Report.document.trigger('document:change',[$page]);
	});
	Dom.document.on('keydown', function(event){
		if (event.keyCode == 18){
			Report.document.addClass('grab');
			Report.wgtools.filter('.bottom').find('.zoom-grab').addClass('active');
		}
	});
	Dom.document.on('keyup', function(event){
		if (event.ctrlKey){
			if (event.keyCode == 90 || event.keyCode == 89){
				var $activeFieldwrap = Report.document.find('.fieldwrap.focus, .fieldwrap.active');
				if (!$activeFieldwrap.length){
					var $activeEdition = $activeFieldwrap.find('[data-edition*="text"], [data-edition="graphic"]');
					if (!$activeEdition.length || !$edition.is('.contentchanged')){
							if (event.keyCode == 90) historyStack.back();
						else if (event.keyCode == 89) historyStack.forward();
					}
				}
			} else if (event.keyCode == 86){
				var $activeFieldwrap = Report.document.find('.fieldwrap.focus, .fieldwrap.active');
				if (!$activeFieldwrap.length){
					var $page = Report.document.find('.page.active');
					var $container = Report.document.find('.container.active');
					var content = {};
					var allItems = 0;
					var allDone = 0;
					if ($page.length){
						navigator.permissions.query({name: "clipboard-read"}).then(result => {
							if (result.state == "granted" || result.state == "prompt") {
								// ver se não vai precisar do readtext para ler texto
								navigator.clipboard.read().then(data => {
									for (const item of data) {
										for (const type of item.types) {
											if (type == 'image/png' || type == 'text/html' || type == 'text/plain'){
												allItems++;
											}
											item.getType(type).then(blob => {
												if (blob.type == 'image/png'){
													content.image = URL.createObjectURL(blob);
													allDone++;
												} else if (blob.type == 'text/html'){
													blob.text().then(html => {
														content.html = html;
														allDone++;
													});
												} else if (blob.type == 'text/plain' && !content.html){
													blob.text().then(text => {
														content.text = text;
														allDone++;
													});
												}
											});
										}
									}
									var intval = setInterval(function(){
										if (allItems === allDone){
											clearInterval(intval);
											if (content.image){
												var $clone = Report.templates.children('[data-edition="graphic"]').clone();
												$clone.find('p.graphicspot').append('<img src="'+content.image+'">');
												$clone = $('<div class="fieldwrap graphic" />').append($clone);
											} else if (content.html){
												var $clone = Report.templates.children('[data-edition="richtext"]').clone();
												$clone.append(content.html);
												$clone.find('h1,h2,h3,h4,h5,p,strong,span').css({'font-size':'', 'font-family':'', 'text-decoration':'', 'text-align':''});
												$clone = $('<div class="fieldwrap richtext" />').append($clone);
											} else if (content.text){
												var $clone = Report.templates.children('[data-edition="richtext"]').clone();
												$clone.append(content.text);
												$clone = $('<div class="fieldwrap richtext" />').append($clone);
											}
											Dom.document.trigger('directpaste',[$clone,$page,$container]);
										}
									},10);
									/*
									for (let i=0; i<data.items.length; i++) {
										console.log(data.items[i].type, data.items[i]);
										if (data.items[i].type == "image/png") {
											const blob = data.items[i].getType("image/png");
											content.image = URL.createObjectURL(blob);
										}
									}
									Dom.document.trigger('directpaste',[content,$page,$container]);
									*/
								});
							}
						});
					}
				}
			}
		}
		if (event.keyCode == 18){
			Report.document.removeClass('grab');
			Report.wgtools.filter('.bottom').find('.zoom-grab').removeClass('active');
		}
		if (event.keyCode == 46 || event.keyCode == 8){
			Report.document.find('.container td.col.selected').trigger('container:delcol');
		}
	});
	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var boxFitter = {
		breakBox: function($box,$edge){

			var $edition = $box.children('[data-edition]');

			if ($box.is('.container')){
				//$box.addClass('toolarge');
				boxFitter.moveBox($box,$edge);
				return false;
			}
			else if ($edition.is('[data-edition="graphic"]')){
				//$box.addClass('toolarge');
				boxFitter.moveBox($box,$edge);
				return false;
			}

			$edge = $edge || $box.parent();

			var bgID = $box.data('boxgroup');
			if (!bgID){
				bgID = $edition.data('belongstogroup');
				bgID = bgID || Math.unique(20);
				$box.attr('data-boxgroup',bgID);
				$edition.attr('data-belongstogroup',bgID);
			}

			var $boxNextAll = $box.nextAll();

			var edgeHeight = $edge.height();
			var boxPos = $box.position();
			var $contentNew = $('<pre></pre>');

			___cnsl.log('breakBox','edition',$edition.get(0));

			$edition.children().each(function(k,el){
				let $el = $(el);
				let elPos = $el.position();
				___cnsl.log('breakBox','overflowed:'+(boxPos.top + elPos.top + $el.outerHeight(true) > edgeHeight),el);
				if (boxPos.top + elPos.top + $el.outerHeight(true) > edgeHeight){
					if ($el.is('table') && $edition.is('.financial-data')){
						let $table = $el;
						let $tbodies = $table.children('tbody');
						let hasBreak = false;
						if ($tbodies.length){
							$tbodies.each(function(ky,tbody){
								var $tbody = $(tbody);
								let tbodyPos = $tbody.position();
								___cnsl.log('breakBox','tbody','overflowed:'+(boxPos.top + elPos.top + tbodyPos.top + $tbody.outerHeight(true) > edgeHeight),tbody);
								if (boxPos.top + elPos.top + tbodyPos.top + $tbody.outerHeight(true) > edgeHeight){
									$tbody.children('tr').each(function(ktr,tr){
										var $tr = $(tr);
										let trPos = $tr.position();
										let trHeight = $tr.outerHeight(true);
										___cnsl.log('breakBox','tbody','tr','overflowed:',(boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight),tr);
										if (boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight){
											$tr.children('td').each(function(ktd,td){
												$(td).width($(td).width());
											});
											if (ktr < 5){
												if ($tbody.prev('tbody').length){
													$tbody.prev('tbody').addClass('sourcemovedcontent movedafter');
													let $tableClone = $table.clone().addClass('wrappedmovedcontent');
													$contentNew.append($tableClone.html('').append($tbody.nextAll().addBack()));
												} else {
													$contentNew.append($table);
												}
												$contentNew.append($table.nextAll());
												hasBreak = true;
												return false;
											} else {
												$tr.prev().addClass('sourcemovedcontent movedafter');
												let $tableClone = $table.clone();
												$contentNew.append($tableClone.html($tbody.clone().html('').append($tr.nextAll().addBack()).addClass('wrappedmovedcontent')));
												$tableClone.append($tbody.nextAll('tbody'));
												$contentNew.append($table.nextAll());
												hasBreak = true;
												return false;
											}
										}
									});
								}
								if (hasBreak) return false;
							});
						} else {
							$el.children('tr').each(function(ktr,tr){
								var $tr = $(tr);
								let trPos = $tr.position();
								let trHeight = $tr.outerHeight(true);
								___cnsl.log('breakBox','tr','overflowed:'+(boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight)+', index:'+ktr,tr);
								if (boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight){
									$tr.children('td').each(function(ktd,td){
										$(td).width($(td).width());
									});
									if (ktr < 5){
										$contentNew.append($table);
										hasBreak = true;
										return false;
									} else {
										$tr.prev().addClass('sourcemovedcontent movedafter');
										let $tableClone = $table.clone();
										$contentNew.append($tableClone.html($tr.nextAll().addBack()).addClass('wrappedmovedcontent'));
										hasBreak = true;
										return false;
									}
								}
							});
						}
						if (hasBreak){
							$contentNew.append($el.nextAll());
							return false;
						}
					} else {
						$contentNew.append($el.nextAll().addBack());
						return false;
					}
				}
			});
			___cnsl.log('breakBox','contentNew',$contentNew.get(0));
			var contentNew = $contentNew.html();
			if (contentNew){
				var $cloneedition = $edition.clone().html('');
				$cloneedition.html(contentNew);

				var $clonewrap = $('<div class="fieldwrap '+$cloneedition.data('edition')+' active" data-boxgroup="'+bgID+'" />').append($cloneedition);

				var $page = $edge.closest('.page'), $clonepage;

				var pagelayout = $page.data('layout');
				if (pagelayout == 'covered-default') pagelayout = 'splited';

				var $nextpage = $page.next('.page[data-layout="'+pagelayout+'"]');

				if ($nextpage.length){
					if ($edge.is('.side')) {
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.cell.side'),'prepend']);
					} else if ($edge.is('.content')){
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.cell.content'),'prepend']);
					} else {
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.main > .row > .cell'),'prepend']);
					}
					___cnsl.log('breakBox','contentNew','prepend to next page',$nextpage.get(0));
				} else {
					$clonepage = Report.templates.children('.page[data-layout="'+pagelayout+'"]').clone();
					Report.document.trigger('document:addpage',[$clonepage,$page,'after']);
					if ($edge.is('.side')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.cell.side'),'prepend']);
					} else if ($edge.is('.content')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.cell.content'),'prepend']);
					} else {
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.main > .row > .cell'),'prepend']);
					}
					___cnsl.log('breakBox','contentNew','prepend to new page',$clonepage.get(0));
				}

				$clonewrap.after($boxNextAll);
				$page.trigger('page:active');
			}
			$box.removeClass('overflew toolarge unbroken');
		},
		unbreakBox: function($boxGroup,forcestrapolate){
			var hasStrapolated = false;
			if (!forcestrapolate){
				$boxGroup.each(function(kb,box){
					var $box = $(box);
					if (boxFitter.isExtrapolatedBox($box)){
						hasStrapolated = true;
						return false
					}
				});
			}
			if (hasStrapolated || forcestrapolate){
				var $contentAll = $('<pre></pre>');
				$boxGroup.each(function(kb,box){
					var $box = $(box);
					if ($box.hasClass('unbroken')) return null;
					___cnsl.log('unbreakBox',box);
					var $edition = $box.children('[data-edition]');
					var content, $content;
					if (($edition.attr('data-edition') || '').indexOf('text') > -1){
						content = tinymce.get($edition.attr('id')).getContent();
					} else {
						content = $edition.html();
					}
					if (content){
						var $sourcemovedcontent = $contentAll.find('.sourcemovedcontent:eq(0)');
						if ($sourcemovedcontent.length){
							$content = $('<pre>'+content+'</pre>');
							var $wrappedmovedcontent = $content.find('.wrappedmovedcontent:eq(0)');
							if ($sourcemovedcontent.is('.movedafter')) $sourcemovedcontent.after($wrappedmovedcontent.html() || content);
							else $sourcemovedcontent.html($wrappedmovedcontent.html() || content);
							$sourcemovedcontent.removeClass('sourcemovedcontent movedafter');
						} else {
							$contentAll.append(content);
						}
					}
					Report.widget.append($edition.siblings('.edition-action'));
				});
				var contentAll = $contentAll.html();
				if (contentAll){
					___cnsl.log('unbreakBox','contentAll',$contentAll.get(0));
					var $b = $boxGroup.filter(':eq(0)');
					var $e = $b.children('[data-edition]');
					if (($e.attr('data-edition') || '').indexOf('text') > -1){
						tinymce.get($e.attr('id')).setContent(contentAll);
					} else {
						$e.html(contentAll);
					}
					$b.addClass('unbroken');
					$boxGroup.filter(':gt(0)').remove();
					return true;
				}
			}
			return false
		},
		moveBox: function($box,$edge){

			var $boxesToPrepend;
			if ($box.hasClass('toolarge')){
				$boxesToPrepend = $box.nextAll();
			} else {
				$boxesToPrepend = $box.nextAll().addBack();
			}

			if ($boxesToPrepend.length){
				var $page = $edge.closest('.page'), $clonepage;

				var pagelayout = $page.data('layout');
				if (pagelayout == 'covered-default') pagelayout = 'splited';

				var $nextpage = $page.next('.page[data-layout="'+pagelayout+'"]');

				if ($nextpage.length){
					if ($edge.is('.side')) $nextpage.find('.cell.side').prepend($boxesToPrepend);
					else if ($edge.is('.content')) $nextpage.find('.cell.content').prepend($boxesToPrepend);
					else  $nextpage.find('.main > .row > .cell').prepend($boxesToPrepend);
					___cnsl.log('moveBox','prepend to next page',$nextpage.get(0));
				} else {
					$clonepage = Report.templates.children('.page[data-layout="'+pagelayout+'"]').clone();
					Report.document.trigger('document:addpage',[$clonepage,$page,'after']);
					if ($edge.is('.side')) $clonepage.find('.cell.side').prepend($boxesToPrepend);
					else if ($edge.is('.content')) $clonepage.find('.cell.content').prepend($boxesToPrepend);
					else  $clonepage.find('.main > .row > .cell').prepend($boxesToPrepend);
					___cnsl.log('moveBox','prepend to new page',$clonepage.get(0));
				}
			}

			boxFitter.isTooBigBox($box,$edge);
		},
		hasOverflow: function($edge){
			var el = $edge.get(0);
			var curOverf = el.style.overflow;
			if ( !curOverf || curOverf === "visible" ) el.style.overflow = "hidden";
			var isOverflowing = el.clientWidth+20 < el.scrollWidth || el.clientHeight+20 < el.scrollHeight;
			el.style.overflow = curOverf;
			return isOverflowing;
		},
		isTooBigBox: function($box,$edge){
			$edge = $edge || $box.parent();
			var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width(), edgeHeight = $edge.height();
			var ret;

			strapolateHeight = $box.outerHeight(true) > edgeHeight;
			if (strapolateHeight) ret = 2;

			if (ret){
				$box.addClass('toolarge');
				return ret;
			}
			$box.removeClass('toolarge');
			return false;
		},
		isExtrapolatedBox: function($box,$edge){
			$edge = $edge || $box.parent();
			if ($edge.is('.content')){
				var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.closest('.main').width(), edgeHeight = $edge.height();
			} else {
				var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width(), edgeHeight = $edge.height();
			}
			strapolateHeight = boxPos.top > edgeHeight;
			if (strapolateHeight) return 3;
			strapolateHeight = (boxPos.top + $box.outerHeight(true)) > edgeHeight;
			if (strapolateHeight) return 4;

			return false;
		},
		testPage: function($page,forceunbreak){

			$page = $page || Report.document.find('.page:eq(0)');

			if (!$page.length) return false;

			if (boxFitter.finished === true){
				//console.clear();
				boxFitter.finished = false;
			}

			___cnsl.log('testPage',$page.get(0));

			var $boxGroup = $page.find('[data-boxgroup]'), groupsIds = {};
			$boxGroup.each(function(kbg, bg){
				let $bg = $(bg);
				groupsIds[$bg.data('boxgroup')] = true;
			});
			$.each(groupsIds,function(kie,vie){
				boxFitter.unbreakBox($page.nextAll('.page').addBack().find('[data-boxgroup="'+kie+'"]'),forceunbreak||false);
			});

			var $edge = $page.find('.content, .side, .main > .row > .cell');
			$edge.each(function(ke,e){
				___cnsl.log('testPage','edge',e);
				var $e = $(e);
				if (boxFitter.hasOverflow($e)){
					var $boxes = $e.children('.fieldwrap, .container');
					$boxes.each(function(kb,b){
						var $b = $(b);
						var extrapolate = boxFitter.isExtrapolatedBox($b,$e);
						___cnsl.log('testPage','isExtrapolatedBox: ',extrapolate,extrapolate ? $b.get(0) : '');
						if (extrapolate){
							$b.addClass('overflew'); // tint as red
							$b.attr('data-extrapolate',extrapolate);
						}
						if (extrapolate === 3){
							// move all hidden objects to next page;
							///////////////////////////////////////////////
							Report.document.addClass('preventeventchange');
							boxFitter.moveBox($b,$e);
							Report.document.removeClass('preventeventchange');
							return false;
							///////////////////////////////////////////////
						} else if (extrapolate === 4){
							// break box and move all next boxes to next page;
							///////////////////////////////////////////////
							Report.document.addClass('preventeventchange');
							boxFitter.breakBox($b,$e);
							Report.document.removeClass('preventeventchange');
							return false;
							///////////////////////////////////////////////
						}
						if (!extrapolate){
							$b.removeClass('overflew');
							$b.removeAttr('data-extrapolate');
						}
					});
				} else {
					$e.find('.overflew, .toolarge').removeClass('overflew toolarge');
				}
			});

			var $nextPage = $page.next('.page');
			if ($nextPage.length) boxFitter.testPage($nextPage);
			else boxFitter.finished = true;
		}
	};
	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




	if (!Report.tinymceinlinetoolbar.length){
		Report.tinymceinlinetoolbar = $('<div id="tinymceinlinetoolbar"/>').appendTo(Dom.body);
	}
	setTimeout(function(){
		Report.tinymceinlinetoolbar.css({
			'left':Report.viewtools.offset().left + Report.viewtools.width() + 15
		});
	},500);

	Report.area.on('swiperight',function(event){
		event.stopImmediatePropagation();
		event.preventDefault();
	});




	// Widget Tools -----------------------------------------------------------------------------------------------------------------------------------------------
	Report.wgtools.filter('.top').find('li:eq(0)').on('click',function(){
		var rules = []
		Report.validations.each(function(){
			var $v = $(this);
			var rule = {
				name: $v.attr('name'),
				selector: $v.attr('selector'),
				valid: $v.attr('valid'),
				count: $v.attr('count'),
				min: $v.attr('min'),
				max: $v.attr('max'),
				desc: $.trim($v.text()),
			}
			rules.push(rule);
		});
		Report.document.trigger('document:openfloat',[Report.document, {
			form:'validations',
			rules:rules
		}]);
	});
	Report.wgtools.filter('.top').find('li:eq(1)').on('click',function(){
		var data = {}
		Report.variables.each(function(){
			var $v = $(this);
			data[$v.attr('name')] = $v.attr('value') || $v.text();
		});
		data.usecover = Report.document.find('.page.fullcovered').attr('data-visible');
		data.reportName = $.trim(Report.document.find('.page.covered-default .reportName .block, .page.covered-default .reportName').first().text());
		Report.document.trigger('document:openfloat',[Report.document, $.extend(data,{
			form:'metadata',
		})]);
	});
	Report.wgtools.filter('.top').find('li:gt(1)').pep({
		place: false,
		shouldEase: false,
		droppable: '.sui-report-document, .page, .content, .covered-default .side, .container .col, .fieldwrap, .pagedropper, .tools.top', // precisa olha isso aqui para contar a array certa dentro dos drops
		revert: true,
		start: function (ev, obj) {
			obj.$el.addClass('dragger');
		},
		drag: function(ev, obj){

			var $a = obj.$el.children('a');
			var $drop = this.activeDropRegions;
			var $target;

			Report.document.find('.pep-dropping').removeClass('pep-dropping');

			if ($a.hasClass('add-page')){
				$target = $drop[1];
				if ($target && $target.length && $target.is('.page, .pagedropper')) {
					$target.addClass('pep-dropping');
				}
			} else {
				$target = $drop[3] || $drop[2] || $drop[1];
				if ($target && $target.length && $target.is('.fieldwrap, .cell, .page, .col')){
					$target.addClass('pep-dropping');
				}
			}
		},
		stop: function (ev, obj) {

			var $a = obj.$el.children('a');
			var $drop = this.activeDropRegions;
			var key = $drop.length-1;

			var $clone;
			var $target;

			if ($drop[0].is('.tools.top')){
				$.tipster.notify('Adding elements canceled');
			} else if ($a.hasClass('add-page')){
				$target = $drop[1];
				if ($target && ($target.is('.fullcovered') || $target.parent().is('.fullcovered, .covered-default'))){
					$.tipster.notify('Adding pages not allowed here');
				} else {
					$clone = Report.templates.children('.page[data-layout="splited"]').clone();
					if ($target && $target.length) {
						if ($target.is('.page')){
							if (this.ev.y > $target.offset().top + ($target.height()/3)){
								Report.document.trigger('document:addpage',[$clone,$target,'after']);
							} else {
								Report.document.trigger('document:addpage',[$clone,$target,'before']);
							}
						} else if ($target.is('.pagedropper')) Report.document.trigger('document:addpage',[$clone,$target.parent(),'before']);
					}
					else Report.document.trigger('document:addpage',[$clone]);
				}
			} else if ($a.hasClass('add-move')){
				if (!$a.hasClass('empty')){
					var $allmoving = Report.document.find('.clipboardmoved');
					var $page = $drop[1];
					if ($allmoving.filter('.fieldwrap, .container').length){
						if ($page && $page.length && $page.is('.page')){
							$page.trigger('page:active');
							var $hascol = $drop[key].closest('.col');
							if ($hascol.length){
								if ($allmoving.filter('.container').length){
									var $ctn = $drop[key].closest('.container');
									if (this.ev.y > $ctn.offset().top + ($ctn.height()/3)){
										$ctn.after($allmoving);
									} else {
										$ctn.before($allmoving);
									}
								} else if (!$hascol.find('.fieldwrap').length){
									if ($allmoving.length === 1){
										$drop[key].append($allmoving);
									} else {
										$.tipster.notify('Only one box is allowed');
									}
								} else{
									$.tipster.notify('Cell must be empty');
								}
							} else if ($drop[key].is('.fieldwrap')){
								if (this.ev.y > $drop[key].offset().top + ($drop[key].height()/3)){
									$drop[key].after($allmoving);
								} else {
									$drop[key].before($allmoving);
								}
							} else if ($drop[key].is('.cell')){
								$drop[key].append($allmoving);
							} else {
								$page.find('.main > .row > .cell').append($allmoving);
							}
						}
					} else if ($allmoving.filter('.page').length){
						if ($page && $page.length && $page.is('.page')) $page.trigger('page:active').after($allmoving);
						else if ($page && $page.length && $page.is('.pagedropper')) $page.trigger('page:active').parent().before($allmoving);
					}
					$allmoving.removeClass('clipboardmoved');
					$a.addClass('empty').find('mark').text('0');
					Report.document.trigger('document:change',[$page]);
					Report.document.trigger('document:boxcount');
				}
			} else if ($a.hasClass('add-container')){
				var $page = $drop[1];
				if ($page && $page.length && $page.is('.page')){
					$page.trigger('page:active');
					$clone = Report.templates.children('.container').clone();
					if (!$clone.length){
						$.tipster.notify('There\'s no container template');
						return;
					}
					if ($drop[key].is('.col')){
						var $ctn = $drop[key].closest('.container');
						if (this.ev.y > $ctn.offset().top + ($ctn.height()/3)){
							$page.trigger('page:addcontainer',[$clone,$ctn,'after']);
						} else {
							$page.trigger('page:addcontainer',[$clone,$ctn,'before']);
						}
					} else if ($drop[key].is('.fieldwrap')){
						if (this.ev.y > $drop[key].offset().top + ($drop[key].height()/3)){
							$page.trigger('page:addcontainer',[$clone,$drop[key],'after']);
						} else {
							$page.trigger('page:addcontainer',[$clone,$drop[key],'before']);
						}
					} else if ($drop[key].is('.cell')){
						$page.trigger('page:addcontainer',[$clone,$drop[key],'append']);
					} else {
						$page.trigger('page:addcontainer',[$clone]);
					}
					$clone.trigger('container:dimension');
				}
			} else {
				var edition;
				var $page = $drop[1];
				if ($page && $page.length && $page.is('.page')){

					$page.trigger('click');

					if ($a.hasClass('add-richtext')) edition = 'richtext';
					else if ($a.hasClass('add-tinytext')) edition = 'tinytext';
					else if ($a.hasClass('add-text')) edition = 'text';
					else if ($a.hasClass('add-graphic')) edition = 'graphic';
					else if ($a.hasClass('add-dynamic')) edition = 'dynamic';
					else if ($a.hasClass('add-toc')) edition = 'toc';

					var cancelDrop = false;

					if (edition == 'toc' && Report.document.find('[data-edition="toc"]').length){
						$.tipster.notify('Table of Content was created already');
						cancelDrop = true;
					}

					$clone = Report.templates.children('[data-edition="'+edition+'"]').clone();
					if (!$clone.length){
						$.tipster.notify('There\'s no '+edition+' template');
						cancelDrop = true;;
					}

					if (!cancelDrop){
						$clone = $('<div class="fieldwrap '+edition+'" />').append($clone);
						if ($drop[key].is('.col')){
							if (!$drop[key].children('.fieldwrap').length){
								$page.trigger('page:addedition',[$clone,$drop[key],'append']);
							} else {
								$.tipster.notify('Spot has a box already');
							}
						} else if ($drop[key].is('.fieldwrap')){
							if (!$drop[key].parent().is('.col')){
								if (this.ev.y > $drop[key].offset().top + ($drop[key].height()/3)){
									$page.trigger('page:addedition',[$clone,$drop[key],'after']);
								} else {
									$page.trigger('page:addedition',[$clone,$drop[key],'before']);
								}
							} else {
								$.tipster.notify('Spot has a box already');
							}
						} else if ($drop[key].is('.cell')){
							$page.trigger('page:addedition',[$clone,$drop[key],'append']);
						} else {
							$page.trigger('page:addedition',[$clone]);
						}

						// autoclick dynamic insertion
						if (edition == 'dynamic'){
							$clone.find('[data-edition]').addClass('empty-content').trigger('edition:tools').click();
							$clone.children('.edition-actions').find('.pick a').click();
						} else if (edition == 'toc'){
							$clone.find('[data-edition]').trigger('edition:tools').click();
						} else {
							//$clone.find('[data-edition]').focus(); // comentado para verificar se esse é o bug do focus+placeholder
						}
						Report.document.trigger('document:boxcount');
					}
				}
			}
			$.each($drop||[],function(k,v){ v.removeClass('pep-dpa pep-dropping'); });
			obj.$el.removeClass('dragger');
		}
	});
	Report.wgtools.filter('.bottom').find('[class*="zoom"]').on('mousedown mouseup',function(event){
		event.stopPropagation();
	});
	Report.wgtools.filter('.bottom').find('.zoom-in').on('click',function(){
		if ($(this).isDisable()) return;
		Report.document.trigger('zoom:in');
	});
	Report.wgtools.filter('.bottom').find('.zoom-grab').on('click',function(){
		if ($(this).isDisable()) return;
		Report.document.trigger('zoom:grab');
	});
	Report.wgtools.filter('.bottom').find('.zoom-reset').on('click',function(){
		if ($(this).isDisable()) return;
		Report.document.trigger('zoom:reset');
	});
	Report.wgtools.filter('.bottom').find('.zoom-out').on('click',function(){
		if ($(this).isDisable()) return;
		Report.document.trigger('zoom:out');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





	// Page Tools -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var toolsPage = ''+
		'<ul class="page-actions nedt" contenteditable="false">'+
		'<li class="nedt label" contenteditable="false"></li>'+
		'<li data-action="edit" class="nedt edit" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit page properties"></a></li>'+
		'<li data-action="bgimg" class="nedt bgimg" contenteditable="false"><a class="icon-circle-pic" data-tip="Browse page background image"></a></li>'+
		'<li data-action="remove" class="nedt remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this page"></a></li>'+
		'</ul>';

	var $toolsPage = $(toolsPage);
	Report.widget.append($toolsPage);
	Report.document.on('page:tools','.page',function(event){
		var $this = $(this);
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsPage.find('li.label').text('Page '+($this.parent().children('.page:visible').index($this)+1));
		$toolsPage.find('li').each(function(){
			var $li = $(this).removeClass('disable deny allow');
			var a = $li.data('action');
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				$li.addClass('allow');
			}
		});
		$this.prepend($toolsPage);
		var height = $this.height();
		var offset = $this.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $toolsPage.addClass('up');
		else $toolsPage.removeClass('up');
	});
	$toolsPage.on('click',function(event){
		event.stopPropagation();
	});
	$toolsPage.on('click','.clone a',function(){
		var $page = $toolsPage.parent();
		var $clone = $page.clone();
		Report.document.trigger('document:addpage',[$clone,$page,'after']);
	});
	$toolsPage.on('click','.edit a',function(){
		var $page = $toolsPage.parent();
		if ($page.is('.fullcovered')){
			Report.document.trigger('document:openfloat',[$page, {
				form:'page',
				layout: 'fullcovered',
				prop: $page.attr('data-prop'),
				uselogo: $page.find('.block.logo').attr('data-visible'),
				useinfo: $page.find('.block.info').attr('data-visible'),
				usename: $page.find('.block.reportName').attr('data-visible'),
			}]);
		}
	});
	$toolsPage.on('click','.bgimg a',function(){
		var $a = $(this);
		var $page = $toolsPage.parent();
		if (!$page.attr('data-background')){
			var input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');
			input.onchange = function() {
				var file = this.files[0];
				var reader = new FileReader();
				reader.onload = function () {
					$page.css('background-image','url("'+reader.result+'")');
					$page.attr('data-background',reader.result);
					///////////////////////////////////////////
					Graphic.post(reader.result, null, function(data){
						var bgimg = document.createElement('img');
						bgimg.onload = function(){ $page.css('background-image','url("'+data.src+'")'); }
						bgimg.src = data.src;
						$page.attr('data-background',data.src);
						Report.document.trigger('document:change',[$page]);
						$.tipster.notify('Image auto uploaded');
					},function(){
						$.tipster.notify('Image upload not allowed');
					});
					///////////////////////////////////////////
				};
				reader.readAsDataURL(file);
			};
			input.click();
		} else {
			$page.removeAttr('data-background');
			$page.css('background-image','');
			Report.document.trigger('document:change',[$page]);
		}
	});

	$toolsPage.on('click','.remove a',function(){
		var $page = $toolsPage.parent();
		Report.widget.append($toolsPage);
		$page.trigger('page:remove');
		Report.document.trigger('document:numpage');
	});

	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




	// Container Tools ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var toolsContainer = ''+
		'<ul class="container-actions nedt" contenteditable="false">'+
		'<li class="nedt label" contenteditable="false">Container</li>'+
		//'<li data-action="edit" class="nedt edit" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit container properties"></a></li>'+
		'<li data-action="addcol" class="nedt addcol" contenteditable="false"><a class="text" data-tip="Add one column at end">+1C</a></li>'+
		'<li data-action="addline" class="nedt addline" contenteditable="false"><a class="text" data-tip="Add one line at end">+1L</a></li>'+
		'<li data-action="reset" class="nedt reset" contenteditable="false"><a class="icon-tab" data-tip="Reset container dimension"></a></li>'+
		'<li data-action="move" class="nedt move" contenteditable="false"><a class="icon-move-up-down" data-tip="Move box to clipboard"></a></li>'+
		'<li data-action="remove" class="nedt remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this box"></a></li>'+
		'</ul>';
	var $toolsContainer = $(toolsContainer);
	Report.widget.append($toolsContainer);
	$toolsContainer.on('mousedown click',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	Report.document.on('container:tools','.container',function(event){
		var $this = $(this);
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsContainer.find('li').each(function(){
			var $li = $(this).removeClass('disable deny allow');
			var a = $li.data('action');
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				$li.addClass('allow');
			}
		});
		$this.prepend($toolsContainer);
		var height = $this.height();
		var offset = $this.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $toolsContainer.addClass('up');
		else $toolsContainer.removeClass('up');
	});
	$toolsContainer.on('click','.edit a',function(){
		var $ctn = $toolsContainer.parent();
		Report.document.trigger('document:openfloat',[$ctn, {
			form:'container',
			lines: $ctn.children('.line').length,
			columns: $ctn.children('.line').children('.col').length,
		}]);
	});
	$toolsContainer.on('click','.addcol a',function(){
		var $ctn = $toolsContainer.parent();
		$ctn.trigger('container:addcolumn');
	});
	$toolsContainer.on('click','.addline a',function(){
		var $ctn = $toolsContainer.parent();
		$ctn.trigger('container:addline');
	});
	$toolsContainer.on('click','.reset a',function(){
		var $ctn = $toolsContainer.parent();
		$ctn.removeAttr('style');
		$ctn.find('.line > .col[style]').removeAttr('style');
	});
	$toolsContainer.on('click','.move a',function(){
		var $ctn = $toolsContainer.parent();
		var $page = $ctn.closest('.page',Report.document);
		$ctn.trigger('container:clipboardmoved');
		$page.trigger('page:active');
	});
	$toolsContainer.on('click','.remove a',function(){
		var $ctn = $toolsContainer.parent();
		Report.widget.append($toolsContainer);
		$ctn.trigger('container:remove');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





	// Edition Tools ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var toolsEdition = ''+
		'<ul class="edition-actions nedt" contenteditable="false">'+
		'<li class="nedt label" contenteditable="false"></li>'+
		'<li data-action="edit" class="nedt edit" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit box properties"></a></li>'+
		'<li data-action="pick" class="nedt pick" contenteditable="false"><a class="icon-picker-gd" data-tip="Pick box data"></a></li>'+
		'<li data-action="img" class="nedt img" contenteditable="false"><a class="icon-circle-pic" data-tip="Browse a local image"></a></li>'+
		'<li data-action="margin" class="nedt margin" contenteditable="false"><a class="icon-box-margin-y" data-tip="Toggle box extra margin"></a></li>'+
		'<li data-action="move" class="nedt move" contenteditable="false"><a class="icon-move-up-down" data-tip="Move box to clipboard"></a></li>'+
		'<li data-action="rearrange" class="nedt rearrange" contenteditable="false"><a class="icon-rearrange-line" data-tip="Rearrange auto breaks"></a></li>'+
		'<li data-action="remove" class="nedt remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this box"></a></li>'+
		'</ul>';

	var $toolsEdition = $(toolsEdition);
	Report.widget.append($toolsEdition);
	$toolsEdition.on('mousedown click',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	Report.document.on('edition:tools','[data-edition]',function(event){
		var $this = $(this);
		var $wrap = $this.parent();
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsEdition.find('li.label').text($this.attr('data-edition').charAt(0).toUpperCase() + $this.attr('data-edition').slice(1));
		$toolsEdition.find('li[data-action]').each(function(){
			var $li = $(this).removeClass('deny allow');
			var a = $li.data('action');
			if (a == 'margin'){
				if ($this.is('.extramargin')) $li.children('a').addClass('active');
				else $li.children('a').removeClass('active');
			}
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				if (a == 'rearrange'){
					$li.removeClass('allow deny');
					if ($wrap.is('[data-boxgroup]')) $li.addClass('allow');
					else $li.addClass('deny');
				} else {
					$li.addClass('allow');
				}
			}
		});

		if ($this.attr('data-edition') == 'graphic') {
			$toolsEdition.find('li.img').removeClass('deny').addClass('allow');
		} else {
			$toolsEdition.find('li.img').removeClass('allow').addClass('deny');
		}

		if ($this.attr('data-edition') == 'dynamic') {
			$toolsEdition.find('li.edit').removeClass('allow').addClass('deny');
		} else if ($this.attr('data-edition') == 'toc') {
			$toolsEdition.find('li.edit, li.pick').removeClass('allow').addClass('deny');
		} else {
			$toolsEdition.find('li.pick').removeClass('allow').addClass('deny');
		}

		$wrap.prepend($toolsEdition);
		var height = $wrap.height();
		var offset = $wrap.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $toolsEdition.addClass('up');
		else $toolsEdition.removeClass('up');
	});
	$toolsEdition.on('click','.clone a',function(){
		var $fieldwrap = $toolsEdition.parent();
		var $page = $fieldwrap.closest('.page');
		var $clone = $fieldwrap.clone();
		$page.trigger('page:addedition',[$clone,$fieldwrap,'after']);
	});
	$toolsEdition.on('click','.edit a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $toolsEdition.parent();
		var titles = [];
		$edit.find('h1,h2,h3,h4').addClass('title').each(function(){
			var $h = $(this);
			titles.push({
				counter: $h.find('.counter').text().split(':')[0]+':',
				indexer: $h.attr('data-indexer'),
				type: $h.tag(),
				text: $h.clone().find('.counter').remove().end().text(),
			});
		});
		Report.document.trigger('document:openfloat',[$edit, {
			form:'edition',
			type: $edit.attr('data-edition'),
			titles: titles.length ? titles : [{indexer:'',type:'',text:''}],
			legend: $edit.find('h5').text(),
			margin: $edit.hasClass('extramargin') ? 'S' : 'N',
		}]);
	});
	$toolsEdition.on('click','.img a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $page = $edit.closest('.page');
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.onchange = function() {
			var file = this.files[0];
			var reader = new FileReader();
			reader.onload = function () {
				var $spot = $edit.find('.graphicspot');
				if (!$spot.length){
					$spot = $('<p class="graphicspot yedt" contenteditable="true" />');
					var $h = $edit.find('h4');
					if ($h.length) $h.after($spot);
					else $edit.prepend($spot);
				}
				var $img = $('<img src="'+reader.result+'" class="browserdelement" />');
				$spot.find(':not(img)').remove();
				$spot.append($img);
				///////////////////////////////////////////
				Graphic.post(reader.result, null, function(data){
					$img.attr('src',data.src);
					Report.document.trigger('document:change',[$page]);
					$.tipster.notify('Image auto uploaded');
				},function(){
					$.tipster.notify('Image upload not allowed');
				});
				///////////////////////////////////////////
			};
			reader.readAsDataURL(file);
		};
		input.click();
	});
	$toolsEdition.on('click','.pick a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		if ($fieldwrap.is('[data-boxgroup]')) $edit = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] > [data-edition]');
		var $editionfirst = $edit.first();
		var keys = [];
		$edit.find('[data-key]').each(function(){
			keys.push($(this).attr('data-key'));
		});
		if ($editionfirst.attr('data-key')) keys.push($edit.attr('data-key'));
		Report.document.trigger('document:openfloat',[$editionfirst, {
			form:'dynamic',
			name: $edit.attr('data-name'),
			keys: keys,
			vars:Variable.getAll()
		}]);
	});
	$toolsEdition.on('click','.margin a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		var $page = $fieldwrap.closest('.page');
		if ($fieldwrap.is('[data-boxgroup]')) $edit = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] > [data-edition]');
		$edit.toggleClass('extramargin');
		$a.toggleClass('active');
		Report.document.trigger('document:change',[$page]);
	});
	$toolsEdition.on('click','.move a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $page = $edit.closest('.page',Report.document);
		$edit.trigger('edition:clipboardmoved');
		$page.trigger('page:active');
	});
	$toolsEdition.on('click','.rearrange a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		var $boxgroup = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
		var $page = $boxgroup.filter(':eq(0)').closest('.page');
		Report.widget.append($toolsEdition);
		boxFitter.testPage($page,true);
	});
	$toolsEdition.on('click','.remove a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		Report.widget.append($toolsEdition);
		$edit.trigger('edition:remove');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





	// PanZoom Events ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('zoom:change',function(event,zoom,newzoom,scrollMid){
		let ele = Report.scroll.get(0);

		if (zoom > 2.3) Report.wgtools.filter('.bottom').find('.zoom-in').disable();
		else Report.wgtools.filter('.bottom').find('.zoom-in').enable();
		if (zoom < 0.7) Report.wgtools.filter('.bottom').find('.zoom-out').disable();
		else Report.wgtools.filter('.bottom').find('.zoom-out').enable();

		Report.document.css({ 'transform':'scale('+newzoom+')', 'transform-origin': newzoom < 1 ? 'center top' : 'left top'});
		Report.document.attr('data-zoom',newzoom);

		ele.scrollTop = (ele.scrollTop * newzoom) / zoom;

		let wd = Math.floor((ele.scrollWidth - Report.scroll.width()) / 2);
		if ((ele.scrollLeft == 0 || scrollMid === true) && wd > 0){
			ele.scrollLeft = wd;
		}
	});
	Report.document.on('zoom:in',function(event){
		let ele = Report.scroll.get(0);
		var zoom = $.toNumber(Report.document.attr('data-zoom') || 1);
		var newzoom = $.toNumber(((zoom * 1) + (zoom >= 1 ? 0.2 : 0.1)).toFixed(2));
		let wd = Math.floor((ele.scrollWidth - Report.scroll.width()) / 2);
		var scrollMid = ele.scrollLeft === wd;
		Report.document.trigger('zoom:change',[zoom,newzoom,scrollMid]);
	});
	Report.document.on('zoom:reset',function(event){
		let ele = Report.scroll.get(0);
		var zoom = $.toNumber(Report.document.attr('data-zoom') || 1);
		Report.document.trigger('zoom:change',[zoom,1,false]);
	});
	Report.document.on('zoom:grab',function(event){
		Report.document.toggleClass('grab');
		Report.wgtools.filter('.bottom').find('.zoom-grab').toggleClass('active');
	});
	Report.document.on('zoom:out',function(event){
		let ele = Report.scroll.get(0);
		var zoom = $.toNumber(Report.document.attr('data-zoom') || 1);
		var newzoom = $.toNumber(((zoom * 1) - (zoom > 1 ? 0.2 : 0.1)).toFixed(2));
		let wd = Math.floor((ele.scrollWidth - Report.scroll.width()) / 2);
		var scrollMid = ele.scrollLeft === wd;
		Report.document.trigger('zoom:change',[zoom,newzoom,scrollMid]);
	});
	Report.scroll.on('wheel',function(event){
		if (event.altKey){
			event.stopPropagation();
			event.preventDefault();
			if (event.originalEvent.deltaY > 0) Report.wgtools.filter('.bottom').find('.zoom-out').trigger('click');
			else  Report.wgtools.filter('.bottom').find('.zoom-in').trigger('click');
		}
	});
	Report.scroll.on('mousedown',function(event){
		if (event.altKey || Report.document.hasClass('grab')){
			if (event.altKey) Report.document.removeClass('grab');
			Report.document.addClass('grabbing');
			let ele = Report.scroll.get(0);
			Report.document.data('zoompos',{
				left: ele.scrollLeft,
				top: ele.scrollTop,
				x: event.clientX,
				y: event.clientY,
			});
		}
	});
	Report.document.on('mousemove',function(event){
		if (Report.document.hasClass('grabbing')){
			let ele = Report.scroll.get(0);
			let pos = Report.document.data('zoompos');
			const dx = event.clientX - pos.x;
			const dy = event.clientY - pos.y;
			ele.scrollTop = pos.top - dy;
			ele.scrollLeft = pos.left - dx;
		}
	});
	Report.document.on('mouseup mouseleave',function(event){
		Report.document.removeClass('grabbing');
	});
	Report.document.on('dblclick',function(event){
		if (!event.altKey || Report.document.hasClass('grab')){
			Report.document.removeClass('grab');
			Report.document.removeClass('grabbing');
			Report.wgtools.filter('.bottom').find('.zoom-grab').removeClass('active');
		}
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





	// Container Events ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('mouseenter','.container',function(){
		var $this = $(this).addClass('hover');
		$this.trigger('container:resizable');
	});
	Report.document.on('mouseleave','.container',function(){
		var $this = $(this).removeClass('hover');
	});
	Report.document.on('click','.container',function(event){
		event.stopPropagation();
		var $this = $(this).trigger('container:active');
	});
	Report.document.on('click','.container .col',function(event){
		event.stopPropagation();
		var $this = $(this);
		$this.trigger('container:active');
		if ($this.is('.selected')) $this.removeClass('selected');
		else {
			Report.document.find('.container td.col.selected').removeClass('.selected');
			$this.addClass('selected');
		}
	});
	Report.document.on('container:delcol','.container .col',function(event){
		var $this = $(this);
		var colidx = $this.parent().find('.col').index($this);
		var $ctn = $this.closest('.container');
		if ($ctn.find('.line').length === 1){
			$ctn.trigger('container:delrange',[$this]);
		} else {
			Confirm.open({
				title: 'Container range deletion',
				desc: 'A single cell is selected to deletion and you have to decide what range should be dropped out.',
				button: [{
					label: 'Delete entire column',
					background: '#8594ab',
					callback: function () {
						var $cols = $();
						$ctn.find('.line').each(function(){
							$cols = $cols.add($(this).find('.col:eq('+colidx+')'));
						});
						$ctn.trigger('container:delrange',[$cols]);
						$.tipster.notify('Column was deleted');
					}
				},{
					label: 'Delete entire line',
					background: '#8594ab',
					callback: function () {
						$ctn.trigger('container:delrange',[$this.parent()]);
						$.tipster.notify('Line was deleted');
					}
				}]
			});
		}
	});
	Report.document.on('container:delrange','.container',function(event,$spots){
		var $this = $(this);
		var $page = $this.closest('.page',Report.document);
		Report.document.addClass('preventeventchange');
		$spots.find('[data-edition]').each(function(){
			$(this).trigger('edition:remove');
		});
		Report.document.removeClass('preventeventchange');
		$spots.remove();
		$this.find('.line:empty').remove();
		if (!$this.find('.line').length){
			Report.document.trigger('container:remove');
		} else {
			$this.trigger('container:dimension');
			Report.document.trigger('document:change',[$page]);
		}
	});
	Report.document.on('container:addcolumn','.container',function(event){
		var $ctn = $(this);
		$ctn.find('.col:last-of-type').css('width','').after('<td class="col"/>');
		$ctn.trigger('container:dimension');
		$ctn.trigger('container:resizable');
	});
	Report.document.on('container:addline','.container',function(event){
		var $ctn = $(this);
		var $line = $('<tr class="line"/>');
		var $lastline = $ctn.find('.line:last-of-type');
		var clen = $lastline.find('.col').length;
		for(var i = 0; i < clen; i++ ){
			$line.append('<td class="col"/>');
		}
		$lastline.after($line);
	});
	Report.document.on('container:dimension','.container',function(event){
		var $ctn = $(this);
		var $cols = $ctn.find('.line:eq(0) > .col');
		$cols.each(function(){
			var $c = $(this);
			$c.innerWidth($c.innerWidth());
		});
		$ctn.css('width',$ctn.outerWidth());
		$cols.find('.resize').height($ctn.outerHeight());
		$ctn.removeAttr('data-style').find('[data-style]').removeAttr('data-style');
	});
	Report.document.on('container:resizable','.container',function(event){
		var $ctn = $(this);
		var $page = $ctn.closest('.page',Report.document);
		var $cols = $ctn.find('.line:eq(0) > .col');
		var $nopep = $cols.filter(':not(.haspep)');
		if ($nopep.length){
			$nopep.prepend('<div class="resize" />');
			var $resizes = $nopep.find('.resize');
			var $pep = $resizes.pep({
				axis: 'x',
				shouldEase: false,
				place: false,
				useCSSTranslation: false,
				shouldPreventDefault: false,
				start:function(ev, obj){
					var $d = obj.$el;
					$ctn.trigger('container:active');
				},
				stop:function(ev, obj){
					var $d = obj.$el;
					var $col = $d.parent();
					var dpos = $d.position();
					if (!$ctn.is('[style*="width"]')){
						$ctn.css('width',$ctn.outerWidth());
					}
					if ($col.is(':last-of-type')){
						$col.prevAll('.col').each(function(){
							var $c = $(this);
							$c.innerWidth($c.innerWidth());
						});
						$ctn.css('width', $ctn.outerWidth() - ($col.innerWidth() - dpos.left));
						$col.css({ width: '' });
					} else {
						$col.innerWidth(dpos.left);
						$col.next().css({ width: '' });
						$col.siblings('.col').each(function(){
							var $c = $(this);
							$c.innerWidth($c.innerWidth());
						});
					}
					$resizes.height($ctn.outerHeight());
					$d.attr('style','');
					Report.document.trigger('document:change',[$page]);
				}
			});
			$nopep.addClass('haspep');
		}
		$cols.find('.resize').height($ctn.outerHeight());
		$ctn.removeAttr('data-style').find('[data-style]').removeAttr('data-style');
	});
	Report.document.on('container:remove','.container',function(){
		var $this = $(this);
		var $page = $this.closest('.page',Report.document);
		Report.document.addClass('preventeventchange');
		$this.find('[data-edition]').each(function(){
			$(this).trigger('edition:remove');
		});
		Report.document.removeClass('preventeventchange');
		$this.remove();
		Report.document.trigger('document:change',[$page]);
		$.tipster.notify('Container removed');
	});
	Report.document.on('container:active','.container',function(){
		var $this = $(this);
		var $page = $this.closest('.page',Report.document);
		if (!$page.is('.active')) $page.trigger('page:active');
		$this.removeClass('hover');
		Report.document.find('.fieldwrap.active').removeClass('active hover focus').find('[data-edition]').blur();
		$this.addClass('active');
		$this.trigger('container:tools');
		$this.find('.col').each(function(){
			var $c = $(this);
			if ($c.children(':not(.resize)').length) $c.removeClass('empty');
			else $c.addClass('empty');
		});
	});
	Report.document.on('container:unactive',function(){
		Report.document.find('.container .col.selected').removeClass('selected');
		Report.document.find('.container.active').removeClass('active');
	});
	Report.document.on('container:clipboardmoved','.container',function(){
		var $this = $(this);
		var $tool = Report.wgtools.find('.add-move');
		$this.toggleClass('clipboardmoved');
		var qtmoved = Report.document.find('.clipboardmoved').length;
		if (!qtmoved) $tool.addClass('empty').find('mark').text('0');
		else $tool.removeClass('empty').find('mark').text(qtmoved);
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



	// Edition Events ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('mouseenter','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent().addClass('hover');
	});
	Report.document.on('mouseleave','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent().removeClass('hover');
	});
	Report.document.on('focus','[data-edition]',function(event){
		var $this = $(this);
		var $wrap = $this.parent();
		$this.trigger('edition:active');
		$wrap.addClass('focus');
	});
	Report.document.on('blur','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent();
		$wrap.removeClass('hover focus');
		if ($this.hasClass('keyboarded')){
			var $autofill = $this.find('[data-autofill]');
			if ($this.data('autofill')){
				$autofill = $autofill.add($this);
			}
			$autofill.each(function(){
				var $e = $(this);
				var $autofill = Report.area.find('[data-autofill="'+$e.data('autofill')+'"]');
				$autofill.html($e.text());
				if ($e.text()) $autofill.removeClass('empty-content');
			});
			var $indexers = Report.document.find('[data-indexer]');
			$indexers.each(function(){
				var $i = $(this);
				var idx = $.trim($i.attr('data-indexer')).replace(/[ \,\_\-\/]/g,'.');
				var dots = (idx.match(/\./g)||[]).length;
				$i.find('bookmark').remove();
				$i.prepend('<bookmark content="'+$i.text()+'" level="'+dots+'" />');
			});
			$this.removeClass('keyboarded');
		}
	});
	Report.document.on('click','[data-edition]',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $wrap = $this.parent();
		if ($this.is('[data-edition="dynamic"], [data-edition="toc"]')){
			$this.trigger('edition:active');
		}
	});
	Report.document.on('dblclick','[data-edition]',function(event){
		event.stopPropagation();
	});
	Report.document.on('edition:resizable','[data-edition]',function(event){
		var $this = $(this);
		if (!$this.hasClass('has-resizable')){
			var $wrap = $this.parent();
			var $page = $this.closest('.page');
			if ($page.is('[data-structure*="resizable"]') || $this.data('resizable')){
				$wrap.prepend('<div class="resize dragleft"/>');
				$wrap.append('<div class="resize dragright"/>');
				var $pep = $wrap.find('.resize').pep({
					axis: 'x',
					shouldEase: false,
					place: false,
					useCSSTranslation: false,
					start:function(ev, obj){
						var $d = obj.$el;
						$this.trigger('edition:active');
					},
					stop:function(ev, obj){
						var $d = obj.$el;
						var dpos = $d.position();
						var wpos = $wrap.position();
						var wwid = $wrap.width();
						var oldposition = $this.attr('data-position');
						if ($d.hasClass('dragleft')) $wrap.css({ width:wwid-dpos.left, left:wpos.left+(dpos.left) });
 						if ($d.hasClass('dragright')) $wrap.css({ width:wwid+(dpos.left-wwid) });
						$this.attr('data-position','top:'+($wrap.css('top')||0)+'; left:'+($wrap.css('left')||0)+'; width:'+$wrap.width()+'px');
						$this.trigger('edition:input');
						/** HISTORY STACK *****************************************************************************************************************************************************/
						historyStack.push({
							do:   { action:'positionedition', edition:$this, fieldwrap:$wrap, position:$this.attr('data-position'), scrolltop:Report.scroll.scrollTop(), label:'Box positioned' },
							undo: { action:'positionedition', edition:$this, fieldwrap:$wrap, position:oldposition, scrolltop:Report.scroll.scrollTop(), label:'Box repositioned' }
						});
						/**********************************************************************************************************************************************************************/
						$d.attr('style','');
					}
				});
				$this.addClass('has-resizable');
			}
		}
	});
	Report.document.on('edition:draggable','[data-edition], .block',function(event){
		var $this = $(this);
		if (!$this.hasClass('has-draggable')){
			var $target = $this.is('[data-edition]') ? $this.parent() : $this;
			var $page = $this.closest('.page');
			if ($page.is('[data-structure*="draggable"]') || $this.data('draggable')){
				var $pep = $target.pep({
					shouldEase: false,
					useCSSTranslation: false,
					constrainTo: 'parent',
					elementsWithInteraction: $this.is('[data-edition]') ? '.resize, .block, li[data-action]' : 'input',
					stop:function(ev, obj){
						var oldposition = $this.attr('data-position');
						$this.attr('data-position','top:'+($target.css('top')||0)+'; left:'+($target.css('left')||0)+'; width:'+$target.width()+'px');
						$this.trigger('edition:input');
						/** HISTORY STACK *****************************************************************************************************************************************************/
						historyStack.push({
							do:   { action:'positionedition', edition:$this, fieldwrap:$target, position:$this.attr('data-position'), scrolltop:Report.scroll.scrollTop(), label:'Box positioned' },
							undo: { action:'positionedition', edition:$this, fieldwrap:$target, position:oldposition, scrolltop:Report.scroll.scrollTop(), label:'Box repositioned' }
						});
						/**********************************************************************************************************************************************************************/
						Report.document.trigger('document:change',[$page]);
					}
				});
				$this.addClass('has-draggable');
			}
		}
	});
	Report.document.on('edition:analystsdrag','.block.analysts',function(event){
		var $this = $(this);
		var $lines = $this.find('tr');
		$lines.filter(':not(.haspep)').pep({
			place: false,
			axis: 'y',
			shouldEase: false,
			droppable: $lines,
			revert: true,
			revertIf: function (ev, obj) {
				return !this.activeDropRegions.length || this.activeDropRegions.length == 1;
			},
			start: function (ev, obj) {
				obj.$el.addClass('dragger');
				$this.trigger('edition:active');
			},
			stop: function (ev, obj) {
				var closest = $.calcSort('y', obj.$el, this.activeDropRegions);
				if (closest.placement) {
					if (closest.placement == 'after') obj.$el.insertAfter(closest.element);
					else if (closest.placement == 'before') obj.$el.insertBefore(closest.element);
					var matrix = obj.matrixToArray(obj.matrixString());
					var x = -1 * matrix[4];
					var y = -1 * matrix[5];
					obj.moveToUsingTransforms(x, y);
					obj.$el.css({ position: 'relative' });
					$this.trigger('edition:input');
					$this.trigger('edition:change');
				}
				obj.$el.removeClass('dragger');
			}
		});
		$lines.addClass('haspep');
	});
	Report.document.on('edition:buildtoc','[data-edition="toc"]',function(event){
		var $this = $(this);
		var $wrap = $this.parent().removeClass('error');
		var $indexers = Report.document.find('[data-indexer]');
		var $allPages = Report.document.find('.page:visible');
		Report.document.find('[data-edition="toc"]:gt(0)').each(function(){
			var $toc = $(this);
			Report.widget.append($toc.siblings('.edition-actions'));
			$toc.parent().remove();
		});
		var content = '';
		if ($indexers.length){
			$indexers.each(function(){
				var $i = $(this);
				var $page = $i.closest('.page');
				var idx = $.trim($i.attr('data-indexer')).replace(/[ \,\_\-\/]/g,'.');
				var dots = (idx.match(/\./g)||[]).length;
				$i.attr('data-indexer',idx);
				content += '<div class="dots'+dots+'" data-idxkey="'+idx+'">'+
				(dots > 0 ? '<div class="key">'+idx.split('.').pop()+'</div>' : '')+
				'<div class="lk">'+$i.text()+'</div>'+
				'<div class="pg">Page '+($allPages.index($page)+1)+'</div>'+
				'</div>';
			});
			$this.html('<h2>Table of Content</h2>');
			$this.append(content);
		} else {
			$this.html('<h2>Table of Content is empty</h2><p>You should add indexers to content titles inside richtext boxes.</p>')
			$wrap.addClass('error');
		}
	});
	Report.document.on('click','.fieldwrap.active > [data-edition="toc"] .lk',function(event){
		var $a = $(this).parent();
		Report.scroll.scrollTo('[data-indexer="'+$a.data('idxkey')+'"]',150,{ offset:{top:-50} });
		event.preventDefault();
	});
	Report.document.on('edition:jscode','[data-edition]',function(event){
		var $this = $(this);
		$this.find('code[data-type="javascript"]').each(function(){
			var $code = $(this);
			var jscode = window.atob($code.text());
			var $js = $('<script data-widget-event="edition:jscode">'+jscode+'</script>');
			$this.append($js);
			$code.remove();
			$js.remove();
		});
	});
	Report.document.on('edition:cleanmce','[data-edition]',function(event){
		var $this = $(this);
		$this.removeClass('mce-content-body inited content-placeholder mce-edit-focus').removeAttr('id').removeAttr('contenteditable');
		$this.siblings('.edition-actions').remove();
	});
	Report.document.on('edition:wrapfield','[data-edition]',function(event){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		if (!$fieldwrap.is('.fieldwrap')){
			$this.wrap('<div class="fieldwrap '+$this.data('edition')+($this.data('indexer') ? ' indexed' : '')+'" '+($this.data('belongstogroup')?'data-boxgroup="'+$this.data('belongstogroup')+'"':'')+' />');
			$fieldwrap = $this.parent();
		} else {
			$fieldwrap.removeClass('focus active selected error');
		}
		if ($this.attr('data-position')){
			$fieldwrap.attr('style',$this.attr('data-position'));
		}
		if (!$this.hasClass('has-resizable')) $this.trigger('edition:resizable');
		if (!$this.hasClass('has-draggable')) $this.trigger('edition:draggable');
		$this.css('opacity',1);
	});
	Report.document.on('edition:uploadimgs','[data-edition]',function(){
		var $this = $(this);
		var $imgs = $this.find('img[src*="blob:"]:not(.uploading)');
		$imgs.each(function(){
			var $img = $(this).addClass('uploading');
			/////////////////////////////////////////////////
			Graphic.base64($img.attr('src'),function(base64){
				Graphic.post(base64, null, function(data){
					$img.attr('src',data.src);
					$img.removeClass('uploading');
					$.tipster.notify('Image auto uploaded');
				},function(){
					$.tipster.notify('Image upload not allowed');
				});
			},function(){
				$.tipster.notify('Image data not converted');
			});
			/////////////////////////////////////////////////
		});
		$imgs = $this.find('img[src*="data:"]:not(.uploading)');
		$imgs.each(function(){
			var $img = $(this).addClass('uploading');
			/////////////////////////////////////////////////
			Graphic.post($img.attr('src'), null, function(data){
				$img.attr('src',data.src);
				$img.removeClass('uploading');
				$.tipster.notify('Image auto uploaded');
			},function(){
				$.tipster.notify('Image upload not allowed');
			});
			/////////////////////////////////////////////////
		});
	});
	Report.document.on('edition:change','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page = $this.closest('.page');
		Report.document.trigger('field:input');
		if ($this.is('[data-edition*="text"]')){
			var $boxgroup = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
			$page = $boxgroup.length ? $boxgroup.filter(':eq(0)').closest('.page') : $page;
			Report.widget.append($this.siblings('.edition-actions'));
		} else if ($this.is('[data-edition*="graphic"]')){
			$this.trigger('edition:uploadimgs');
		}
		Report.document.trigger('document:change',[$page]);
	});
	Report.document.on('edition:nodechange','[data-edition]',function(event,node){
		var $this = $(this);
		var $node = $(node);
		var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
		$toolroot.addClass('adapted');
	});
	Report.document.on('edition:remove','[data-edition]',function(event){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page;
		if ($fieldwrap.data('boxgroup')){
			Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] [data-edition]').each(function(ke, e){
				var $e = $(e);
				Report.widget.append($e.siblings('.edition-actions'));
				$page = $page ? $page : $e.closest('.page');
				//if ($e.attr('id') && $e.is('.mce-content-body')) tinymce.remove('#'+$e.attr('id'));
				$e.parent().remove();
			});
		} else {
			$page = $this.closest('.page');
			Report.widget.append($this.siblings('.edition-actions'));
			//if ($this.attr('id') && $this.is('.mce-content-body')) tinymce.remove('#'+$this.attr('id'));
			$fieldwrap.remove();
		}
		if (!Report.document.hasClass('preventeventchange')){
			Report.document.trigger('document:change',[$page]);
			$.tipster.notify('Edition box removed');
			/** HISTORY STACK *****************************************************************************************************************************************************/
			historyStack.push({
				do: 	{ action:'removeedition', edition:$this, scrolltop:Report.scroll.scrollTop(), label:'Added box removed' },
				undo:   { action:'addedition', page:$page, fieldwrap:$fieldwrap, reference:$fieldwrap.prev(), placement:$fieldwrap.prev().length ? 'after' : 'prepend', scrolltop:Report.scroll.scrollTop(), label:'Box added again' },
			});
			/**********************************************************************************************************************************************************************/
		}
		Report.document.trigger('document:boxcount');
	});
	Report.document.on('edition:active','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page = $this.closest('.page',Report.document);
		$page.trigger('page:active');
		$fieldwrap.removeClass('hover');
		$fieldwrap.closest('.col').removeClass('selected');
		Report.document.find('.fieldwrap.active').removeClass('active');
		Report.document.find('.fieldlink').remove();
		$fieldwrap.addClass('active');
		$this.trigger('edition:tools');

		Report.document.find('.boxgroupconnector').remove();

		if ($fieldwrap.data('boxgroup')){
			var $lastbox;
			var $scrollable = $fieldwrap.closest('.scroll-all');
			var scrollTop = $scrollable.scrollTop() - $scrollable.offset().top;
			Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]').each(function(kb, box){
				var $box = $(box);
				$box.addClass('active');
				if ($lastbox){
					var $connector = $('<div class="boxgroupconnector"></div>');
					Report.document.append($connector);
					var postop = $lastbox.offset().top + $lastbox.height();
					$connector.css({
						top: scrollTop + postop,
						height: $box.offset().top - postop,
					});
				}
				$lastbox = $box;
			});
		}
	});

	Report.document.on('edition:clipboardmoved','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $edge = $fieldwrap.parent();
		var $tool = Report.wgtools.find('.add-move');
		if ($fieldwrap.is('[data-boxgroup]')){
			$fieldwrap = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
		}
		$fieldwrap.toggleClass('clipboardmoved');
		var qtmoved = Report.document.find('.clipboardmoved').length;
		if (!qtmoved) $tool.addClass('empty').find('mark').text('0');
		else $tool.removeClass('empty').find('mark').text(qtmoved);
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------






	// Page Events ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('page:addcontainer','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		$new.siblings('.container-actions').remove();
		$new.removeAttr('id');
		if ($ref){
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
			} else if (placement == 'append'){
				$new.appendTo($ref);
			} else if (placement == 'prepend'){
				$new.prependTo($ref);
			} else if (placement == 'replace'){
				$ref.replaceWith($new);
			}
		} else {
			$page.find('.main .cell:eq(0)').append($new);
		}
		$new.trigger('container:resizable');
		Report.document.trigger('document:change',[$page]);
		/** HISTORY STACK *****************************************************************************************************************************************************/
		historyStack.push({
			do:   { action:'addecontainer', page:$page, container:$new, reference:$ref, placement:placement, scrolltop:Report.scroll.scrollTop(), label:'Container added again' },
			undo: { action:'removecontainer', container:$new, scrolltop:Report.scroll.scrollTop(), label:'Added container removed' }
		});
		/**********************************************************************************************************************************************************************/
	});
	Report.document.on('page:addedition','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		var $edit = $new.children('[data-edition]');
		$new.find('.edition-actions').remove();
		$edit.removeAttr('id');
		if ($ref){
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
			} else if (placement == 'append'){
				$new.appendTo($ref);
			} else if (placement == 'prepend'){
				$new.prependTo($ref);
			} else if (placement == 'replace'){
				$ref.replaceWith($new);
			}
		} else {
			$page.find('.main .cell:eq(0)').append($new);
		}
		$edit.trigger('edition:cleanmce');
		$edit.trigger('edition:init');
		Report.document.trigger('document:change',[$page]);
		if ($new.is('[data-boxgroup]')) return;
		/** HISTORY STACK *****************************************************************************************************************************************************/
		historyStack.push({
			do:   { action:'addedition', page:$page, fieldwrap:$new, reference:$ref, placement:placement, scrolltop:Report.scroll.scrollTop(), label:'Box added again' },
			undo: { action:'removeedition', edition:$edit, scrolltop:Report.scroll.scrollTop(), label:'Added box removed' }
		});
		/**********************************************************************************************************************************************************************/
	});
	Report.document.on('page:scrollto','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		$(Report.document.closest('.scroll-default')).scrollTo($page,350,{ offset:{top:-50} });
	});
	Report.document.on('page:remove','.page',function(){
		var $this = $(this);
		var $next = $this.next('.page');
		Report.document.addClass('preventeventchange');
		$this.find('.main [data-edition]').each(function(){
			$(this).trigger('edition:remove');
		});
		Report.document.removeClass('preventeventchange');
		$this.remove();
		Report.document.trigger('document:change',[$next]);
		$.tipster.notify('Page removed');
		/** HISTORY STACK *****************************************************************************************************************************************************/
		historyStack.push({
			do: 	{ action:'removepage', page:$this, scrolltop:Report.scroll.scrollTop(), label:'Added page removed' },
			undo:   { action:'addpage', page:$this, reference:$this.prev('.page'), placement:$this.prev('.page').length ? 'after' : 'prepend', scrolltop:Report.scroll.scrollTop(), label:'Page added again' },
		});
		/**********************************************************************************************************************************************************************/
	});
	Report.document.on('page:active','.page',function(event){
		var $this = $(this);
		Report.document.trigger('page:unactive');
		$this.addClass('active');
		$this.trigger('page:tools');
	});
	Report.document.on('page:unactive',function(){
		Report.document.find('.page.active, .fieldwrap.active, .container.active, .col.selected').removeClass('active selected');
		Report.document.find('[data-mce-selected]').removeAttr('data-mce-selected');
		Report.document.find('.fieldlink').remove();
		Report.document.find('.boxgroupconnector').remove();
	});
	Report.document.on('page:thumbnail','.page',function(event){
		var $page = $(this);
		if ($page.hasClass('thumbing')){
			var $pagethumb = Report.pagelist.find('#'+$page.attr('data-thumbid'));
			//////////////////////////////////
			Thumbnail.parse($page,$pagethumb);
			//////////////////////////////////
			$page.removeClass('thumbing');
		}
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




	// Document Events --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('document:change',function(event,$page){
		/////////////////////////////////////////////////////////////////
		if (Report.document.hasClass('preventeventchange')) return false;
		/////////////////////////////////////////////////////////////////
		Report.document.find('[data-edition="toc"]:eq(0)').trigger('edition:buildtoc');
		if ($page) boxFitter.testPage($page);
		Report.document.trigger('document:validate');
		Report.widget.trigger('field:input');
		Report.document.find('.boxgroupconnector').remove();
		Report.document.trigger('document:pagelist');
	});
	Report.document.on('document:boxcount',function(event){
		var idx = 1;
		Report.document.find('[data-edition="graphic"]').each(function(){
			var $this = $(this);
			if ($this.find('h4').length){
				$this.attr('data-count',idx).find('.counter').html('Graphic '+idx+':');
			}
			idx++;
		});
	});
	Report.document.on('document:openfloat',function(event,$origin,json){
		var data = $origin.link();
		var id = $origin.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		data.id = id;
		data.json = $.extend(true, json, Report.view.link('json') || {});
		Network.link(data);
		$origin.attr('id',id);
	});
	Report.document.on('document:hasinited',function(){
		if (!Report.document.hasClass('loaded') && !Report.editors.filter(':not(.inited)').length){
			boxFitter.testPage();
			Report.document.addClass('loaded');
			Report.document.trigger('document:validate');
			setTimeout(function(){
				Report.document.trigger('document:pagelist',['forceChange']);
			},100);
		}
	});
	Report.document.on('document:validate',function(){
		var invalids = 0;
		Report.validations.each(function(){
			var $v = $(this);
			var $query = Report.widget.find($v.attr('selector'));
			var testCount = $v.attr('count') ?  parseInt($query.length) === parseInt($v.attr('count')) : null;
			var testMin = $v.attr('min') ?  parseInt($query.length) >= parseInt($v.attr('min')) : null;
			var testMax = $v.attr('max') ?  parseInt($query.length) <= parseInt($v.attr('max')) : null;
			if (testCount === false || testMin === false || testMax === false){
				$v.attr('valid','false');
				invalids++;
			} else {
				$v.attr('valid','true');
			}
		});
		var $vchecked = Report.widget.find('.validation-checked').removeClass('icon-close3');
		if (invalids === 0){
			Variable.set('isValid','S');
			Report.document.trigger('document:valid');
			$vchecked.addClass('icon-done').parent().css('background','#1c985f');
			$vchecked.find('b').remove();
		} else {
			Variable.set('isValid','N');
			Report.document.trigger('document:invalid');
			$vchecked.removeClass('icon-done').parent().css('background','#e24040');
			$vchecked.html('<b>!'+invalids+'</b>');
		}
	});
	Report.document.on('document:addpage',function(event,$new,$ref,placement){
		$new.find('.page-actions').remove();
		var didBoxBroken, $pageChange, $lastBoxgroupOnPrevPage, $firstBoxgroupOnNextPage, tipsterMsg;
		$new.removeAttr('id').css('opacity','0');
		//console.log($new,$ref,placement);
		if ($ref){
			$lastBoxgroupOnPrevPage = (placement == 'after') ? $ref.find('.content .fieldwrap[data-boxgroup]').last() : $ref.prev('.page').find('.content .fieldwrap[data-boxgroup]').last();
			$firstBoxgroupOnNextPage = (placement == 'after') ? $ref.next('.page').find('.content .fieldwrap[data-boxgroup]').first() : $ref.find('.content .fieldwrap[data-boxgroup]').first();
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
			} else {
				Report.document.append($new);
			}
		} else {
			Report.document.append($new);
			tipsterMsg = 'Page added at the end';
		}
		if ($lastBoxgroupOnPrevPage && $lastBoxgroupOnPrevPage.length && $lastBoxgroupOnPrevPage.attr('data-boxgroup') === $firstBoxgroupOnNextPage.attr('data-boxgroup')){
			boxFitter.unbreakBox(Report.document.find('.fieldwrap[data-boxgroup="'+$lastBoxgroupOnPrevPage.attr('data-boxgroup')+'"]'), true);
			$pageChange = (placement == 'after') ? $ref : $new.prev('.page');
			didBoxBroken = true;
		} else {
			$pageChange = $new;
		}
		$new.find('[data-edition]').trigger('edition:cleanmce');
		$new.trigger('edition:init');
		Report.document.trigger('document:change',[$pageChange]);
		Report.document.trigger('document:numpage');
		$new.trigger('page:active');
		$new.trigger('page:scrollto');
		$new.velocity({
			scale:[1,1.1],
			opacity:[1,0]
		},{
			easing: "ease-out",
			duration:200,
			complete: function(){
				if (!didBoxBroken){
					/** HISTORY STACK *****************************************************************************************************************************************************/
					historyStack.push({
						do:  	{ action:'addpage', page:$new, reference:$ref, placement:placement, scrolltop:Report.scroll.scrollTop(), label:'Page added again' },
						undo: 	{ action:'removepage', page:$new, scrolltop:Report.scroll.scrollTop(), label:'Added page removed' },
					});
					/**********************************************************************************************************************************************************************/
				}
				if (tipsterMsg) $.tipster.notify(tipsterMsg);
			}
		});
	});
	Report.document.on('document:numpage',function(event){
		var $pages = Report.document.children('.page:visible');
		$pages.each(function(){
			var $page = $(this);
			var pgindex = $pages.index($page) + 1;
			$page.find('[data-pagenumber] i').text(pgindex);
		});

	});
	Report.widget.on('click','.pagethumb',function(event){
		Report.pagelist.find('.selected').removeClass('selected');
		var $thumb = $(this).addClass('selected');
		var $page = Report.document.children('.page[data-thumbid="'+$thumb.attr('id')+'"]');
		Report.scroll.scrollTo($page,180,{ offset:{top:-40} });
		$page.trigger('page:active',['preventScrollThumb']);
	});
	Report.document.on('document:pagelist',function(event,forceChange){
		var $pages = Report.document.children('.page');
		Report.pagelist.find('.pagethumb').each(function(){
			var $thumb = $(this);
			if ($thumb.attr('id') && !$pages.filter('[data-thumbid="'+$thumb.attr('id')+'"]').length){
				$thumb.remove();
			}
		});
		$pages.filter(':not(:visible)').each(function(){
			var $page = $(this);
			var thumbid = $page.attr('data-thumbid');
			if (thumbid){
				var $pagethumb = Report.pagelist.find('#'+thumbid);
				$pagethumb.remove();
			}
		});
		var $pagesVisibles = $pages.filter(':visible');
		$pagesVisibles.filter(':visible').each(function(event){
			var $page = $(this);
			var thumbid = $page.attr('data-thumbid') || $.md5(Math.rand()).substring(0, 16);
			var $pagethumb = Report.pagelist.find('#'+thumbid);
			var pgindex = $pagesVisibles.index($page) + 1;
			if (!$pagethumb.length){
				$pagethumb = $('<div class="pagethumb" id="'+thumbid+'" data-page="'+pgindex+'" />');
				if (pgindex === 1) Report.pagelist.prepend($pagethumb);
				else Report.pagelist.find('.pagethumb:eq('+(pgindex-2)+')').after($pagethumb);
			} else {
				$pagethumb.attr('data-page',pgindex);
			}
			$page.addClass('thumbing');
			$page.attr('data-thumbid',thumbid);
			$pagethumb.css('background-image','');
			$pagethumb.show();
			var changeid = Thumbnail.changeid($page);
			if (forceChange || changeid !== $page.attr('data-changeid')){
				/////////////////////////////////////
				$page.trigger('page:thumbnail');
				/////////////////////////////////////
				$page.attr('data-changeid',changeid);
			}
		});
	});
	Report.document.on('click',function(event){
		Report.document.trigger('page:unactive');
		Report.document.trigger('container:unactive');
	});
	Report.document.on('click','.page',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $thumb = Report.pagelist.find('#'+$this.attr('data-thumbid'));
		Report.pagelist.find('.selected').removeClass('selected');
		$thumb.addClass('selected');
		if ($thumb.length) Report.pagelist.scrollTo($thumb,{ offset:{top:-15} });
		$this.trigger('page:active');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


	// MCE Setup --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var mceSetup = {
		menubar: false,
		inline: true,
		fixed_toolbar_container: '#tinymceinlinetoolbar',
		plugins: [
			'placeholder lists link image imagetools charmap',
			'noneditable preventdelete visualblocks',
			'textcolor colorpicker media table powerpaste'
		],
		noneditable_editable_class: 'yedt',
		noneditable_noneditable_class: 'nedt',
		fontsize_formats: "8px 9px 10px 11px 12px 14px 16px 18px 20px 22px",
		powerpaste_word_import: 'merge',
		powerpaste_html_import: 'merge',
		browser_spellcheck: true,
		textcolor_map: [
			"FCFCFC", "Snow White",
			"D2D2D2", "Silver",
			"B0B0B0", "Gray",
			"808080", "Cloudy",
			"101010", "Black",
			"a24242", "Wine",
			"Ef4949", "Red",
			"F56619", "Orange",
			"f1a027", "Yellow",
			"65ca76", "Regular green",
			"14943b", "Dark green",
			"194780", "BTG Dark",
			"3d98d8", "BTG Lite",
			"3371e6", "Ocean",
			"874ba7", "Purple",
			"d053af", "Pink",
		],
		setup: function (editor) {
			editor.addButton('browseimg', {
				text: null,
				icon: 'image',
				label: 'Browse',
				tooltip: "Browse local image",
				onclick: function () {
					var input = document.createElement('input');
					input.setAttribute('type', 'file');
					input.setAttribute('accept', 'image/*');
					input.onchange = function() {
						var file = this.files[0];
						var reader = new FileReader();
						reader.onload = function () {
							var img = document.createElement('img');
							img.src = reader.result;
							var $p = $('<p class="graphicspot"></p>');
							$p.append(img);
							var $target = $(editor.selection.getNode());
							var $field = $target.closest('[data-edition]');
							if (!$target.is('p')) $target = $target.closest('p',$field);
							if (!$target.is('p')) $target = $field.find('.graphicspot, p:eq(0)');
							if (!$target.is('p')){
								if ($field.children('header,h1,h2,h3,h4').length) $field.children('h1,h2,h3,h4').after($p);
								else if ($field.children('h5').length) $field.children('h5').before($p);
								$field.append($p);
							} else {
								if (!$target.find('img').length) $target.replaceWith($p);
								else $target.append($p.html()).addClass('graphicspot');
							}
						};
						reader.readAsDataURL(file);
					};
					input.click();
				}
			});
			var $ed = $(editor.getElement());
			editor.on('init', function (e) {
				$ed.addClass('inited').addClass('sui-restric-activity-control');
				Report.document.trigger('document:hasinited');
			});
			editor.on('click', function (e) {
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('keydown', function (e) {
				//if (e.ctrlKey && e.keyCode != 86 && e.keyCode != 88) return true;
				$ed.addClass('contentchanged');
				$ed.addClass('keyboarded');
				$ed.trigger('edition:input');
			});
			editor.on('input', function (e) {
				$ed.addClass('contentchanged');
			});
			editor.on('change', function (e) {
				$ed.addClass('contentchanged');
				$ed.trigger('edition:uploadimgs');
			});
			editor.on('blur', function (e) {
				if ($ed.hasClass('contentchanged')){
					setTimeout(function(){
						$ed.trigger('edition:change');
						$ed.removeClass('contentchanged');
					},10);
				}
			});
		}
	};
	var mceSetupText = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="text"]:not(.inited)',
		forced_root_block : false,
		toolbar: 'undo redo removeformat | bold italic underline',
		valid_elements: 'strong,em,span[style],a[href]',
		valid_styles: {
			'*': 'color,text-decoration,text-align'
		},
	});
	var mceSetupPlaintext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="plaintext"]:not(.inited)',
		forced_root_block : false,
		toolbar: 'undo redo removeformat',
		valid_elements: 'br',
		valid_styles: {
			'*': 'color'
		},
	});
	var mceSetupTinytext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="tinytext"]:not(.inited)',
		forced_root_block : 'p',
		toolbar: 'undo redo removeformat | bold italic underline | forecolor | alignleft aligncenter alignright',
		valid_elements: 'p[style],h1[style|class],h2[style|class],h3[style|class],h4[style|class],strong[style]/b[style],em,span[style|class],a[href],br',
		valid_styles: {
			'*': 'color,text-decoration,text-align,font-style'
		},
	});
	var mceSetupRichtext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="richtext"]:not(.inited)',
		placeholder:'Enter formatted text here...',
		forced_root_block : 'p',
		//table_appearance_options: false,
		//imagetools_toolbar: 'none',
		//paste_data_images: false,
		toolbar: [
			'undo redo removeformat | bold italic underline | styleselect | fontsizeselect forecolor backcolor cellcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent | link'
		],
		//automatic_uploads: true,
		//file_picker_types: 'image',
		//powerpaste_allow_local_images: true,
		//table_toolbar: '',
		//table_resize_bars: false,
		valid_elements: 'p[style|class],h1[style|class],h2[style|class],h3[style|class],h4[style|class],h5[style|class],a[href|target],strong[style],b[style],ul[style],ol[style],li[style],span[style],em,br,mark,bookmark[content|level]',
		valid_styles: {
			'h1': 'font-size,font-family,color,text-decoration,text-align',
			'h2': 'font-size,font-family,color,text-decoration,text-align',
			'h3': 'font-size,font-family,color,text-decoration,text-align',
			'h4': 'font-size,font-family,color,text-decoration,text-align',
			'h5': 'font-size,font-family,color,text-decoration,text-align',
			'p': 'font-size,font-family,color,text-decoration,text-align',
			'strong': 'font-size,font-family,color,text-decoration,text-align,background-color',
			'span': 'font-size,font-family,color,text-decoration,text-align,background-color',
		},
		style_formats: [
			{title: 'XLarge Title', block: 'h1'},
			{title: 'Large Title', block: 'h2'},
			{title: 'Regular Title', block: 'h3'},
			{title: 'Small Title', block: 'h4'},
			{title: 'Paragraph', block: 'p'},
			{title: 'Legend', block: 'h5'},
		],
		paste_preprocess : function(pl, o) {
			var $content = $('<div>'+o.content+'</div>');
			var $imgtable = $content.children('img,table');
			if ($imgtable.length){
				$.tipster.notify('Paste only formatted text');
				o.content = '';
			} else {
				$content.find('h1,h2,h3,h4,h5,p,strong,span').css({'font-size':'', 'font-family':'', 'text-decoration':'', 'text-align':''});
				o.content = $content.html();
			}
		},
	});
	var mceSetupGraphic = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="graphic"]:not(.inited)',
		placeholder:'Paste images, pictures and glyphs here...',
		forced_root_block : 'p',
		table_appearance_options: false,
		imagetools_toolbar: 'none',
		paste_data_images: true,
		toolbar: [
			'undo redo | link | table '
		],
		automatic_uploads: true,
		file_picker_types: 'image',
		powerpaste_allow_local_images: true,
		table_toolbar: '',
		table_resize_bars: false,
		valid_elements: 'p[class],h4[class],h5[class],img[style|src|class],table[style|border|cellpadding|cellspacing|class],colgroup[style],col[style,span],tbody,thead,tfoot,tr[style|height],th[style|colspan|rowspan|align],td[style|colspan|rowspan|align],a[href|target],strong[style|class],b[style|class],span[style|class],em,br,mark[class]',
		valid_styles: {
			'table': 'border,border-colapse,border-color,border-style,background-color,background,color,width,height,cellpadding,cellspacing',
			'tr': 'style,background-color,background,height',
			'th': 'rowspan,colspan,height,width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,white-space',
			'td': 'rowspan,colspan,height,width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,white-space',
			'img': 'width',
		},
		paste_preprocess : function(pl, o) {
			var $target = $(o.target.selection.getNode());
			var $field = $target.closest('[data-edition]');
			var hasp = $target.is('p') || $target.closest('p',$field).length;
			var hash = $target.is('h3,h5') || $target.closest('h3,h5',$field).length;
			var $content = $('<div>'+o.content+'</div>');
			var $td = $content.find('td[style*="border:none"], td[style*="border: none"]');
			if ($td.length) $td.css('border','');
			var $imgtable = $content.children('img,table');
			if ($imgtable.length){
				if (hasp){
					$imgtable.addClass('pastedelement').removeAttr('width').removeAttr('height');
					o.content = $content.html();
				} else {
					$.tipster.notify('Paste in middle only');
					o.content = '<p></p>';
				}
			} else {
				if (hash){
					o.content = $content.html();
				} else {
					$.tipster.notify('Paste graphics only');
					o.content = hasp ? '<p></p>' : '';
				}
			}
		},
	});


	Report.widget.on('edition:init','.sui-report-document, .page, [data-edition]',function(event){

		event.stopPropagation();
		event.stopImmediatePropagation();

		var $elem = $(this);
		var id = $elem.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		var $edits;
		var setup = {}
		var selector;

		if ($elem.is('[data-edition]')){
			if (!$elem.is('.inited')){
				$edits = $elem;
				selector = id;
				$elem.attr('id',id);
			}
		} else {
			$elem.attr('id',id);
			$edits = $elem.find('[data-edition]:not(.inited)');
			$elem.find('.block.logo, .block.info, .block.reportName').trigger('edition:draggable');
			$elem.find('.block.analysts').trigger('edition:analystsdrag');
		}

		if (!$edits.length) return;

		if ($edits.filter('[data-edition="text"]').length) setup.text = $.extend(true, {}, mceSetupText);
		if ($edits.filter('[data-edition="plaintext"]').length) setup.tinytext = $.extend(true, {}, mceSetupPlaintext);
		if ($edits.filter('[data-edition="tinytext"]').length) setup.tinytext = $.extend(true, {}, mceSetupTinytext);
		if ($edits.filter('[data-edition="richtext"]').length) setup.richtext = $.extend(true, {}, mceSetupRichtext);
		if ($edits.filter('[data-edition="graphic"]').length) setup.graphic = $.extend(true, {}, mceSetupGraphic);

		$edits.trigger('edition:wrapfield');
		$edits.trigger('edition:jscode');

		$.each(setup,function(k,v){
			v.selector = '#'+(selector || id+' '+v.selector);
			tinymce.init(v);
		});

		setTimeout(function(){
			Report.document.removeClass('preventhistorystack');
		},2000);

	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	Report.document.trigger('edition:init');

	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.wgdata = {};
	var wdata = {
		aux: {
			getClassAt: function($e,i){
				var cls = $e.attr('class');
				return $.trim(cls).replace(/\s+/g,' ').split(' ')[i];
			},
			parseAttr: function($s,$e,regex){
				var edata = $e.attr();
				$.each(edata,function(k,v){
					if (regex.test(k)){
						$s.attr(k.replace('data-','data:'),v);
					}
				});
			},
			strXQ: function(str){
				return $($.parseXML('<sourceui xmlns:data="data" xmlns:link="link" xmlns:event="event" xmlns:type="type" xmlns:prop="prop" xmlns:attr="attr" xmlns:class="class" xmlns:style="style" xmlns:label="label" xmlns:value="value">'+str+'</sourceui>').documentElement).children();
			},
			xqString: function ($sui) {
				var xmlData = $sui.get(0);
				var xmlString;
				if (window.ActiveXObject){
					xmlString = xmlData.xml;
				} else {
					xmlString = (new XMLSerializer()).serializeToString(xmlData);
				}
				return xmlString;
			}
		},
		suify : {
			fieldwrap: function($elem){
				var suiXml = '';
				$elem.children('[data-edition]').each(function(){
					var $this = $(this);
					var nodename = wdata.aux.getClassAt($this,0);
					if (/block|cell|row/.test(nodename)){
						var content = '';
						if ($this.attr('data-edition').indexOf('text') > -1){
							content = tinymce.get($this.attr('id')).getContent();
						} else if ($this.attr('data-edition').indexOf('graphic') > -1){
							content = $this.html();
						} else if ($this.attr('data-edition').indexOf('dynamic') > -1){
							content = $this.html();
						} else if ($this.attr('data-edition').indexOf('toc') > -1){
							content = $this.html();
						}
						var $sui = wdata.aux.strXQ('<'+nodename+'>'+(content?'<![CDATA['+content+']]>':'')+'</'+nodename+'>');
						wdata.aux.parseAttr($sui,$this,/data\-/);
						suiXml += wdata.aux.xqString($sui);
					}
				});
				return suiXml;
			},
			block: function($elem){
				var suiXml = $elem.html();
				var $sui = wdata.aux.strXQ('<block>'+(suiXml?'<![CDATA['+suiXml+']]>':'')+'</block>');
				if (!$elem.attr('data-name') && !$elem.attr('data-type') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			col: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
				});
				if ($elem.attr('style')) $elem.attr('data-style',$elem.attr('style'));
				var $sui = wdata.aux.strXQ('<col>'+suiXml+'</col>');
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			line: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('col')) suiXml += wdata.suify.col($this);
				});
				var $sui = wdata.aux.strXQ('<line>'+suiXml+'</line>');
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			container: function($elem){
				var suiXml = '';
				$elem.children().each(function(){ // tbody
					$(this).children().each(function(){
						var $this = $(this);
						if ($this.hasClass('line')) suiXml += wdata.suify.line($this);
					});
				});
				if ($elem.attr('style')) $elem.attr('data-style',$elem.attr('style'));
				var $sui = wdata.aux.strXQ('<container>'+suiXml+'</container>');
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			cell: function($elem){
				var suiXml = '';

				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else if ($elem.children('i,br,b,strong,span').length) suiXml = '<![CDATA['+$elem.html()+']]>';
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
						else if ($this.hasClass('container')) suiXml += wdata.suify.container($this);
					});
				}
				var $sui = wdata.aux.strXQ('<cell>'+suiXml+'</cell>');
				if (!$elem.attr('data-name') && !$elem.attr('data-type') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			row: function($elem){
				var suiXml = '';
				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else if ($elem.children('i,br,b,strong,span').length) suiXml = '<![CDATA['+$elem.html()+']]>';
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
				}
				var $sui = wdata.aux.strXQ('<row>'+suiXml+'</row>');
				if (!$elem.attr('data-name') && !$elem.attr('data-type') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			footer: function($elem, repetition){
				if (repetition){
					var $sui = wdata.aux.strXQ('<repetition type="footer"/>');
					wdata.aux.parseAttr($sui,$elem,/data\-/);
					return wdata.aux.xqString($sui);
				} else {
					var suiXml = '';
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
						else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
					return '<footer>'+suiXml+'</footer>';
				}
			},
			main: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
					else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					else if ($this.hasClass('container')) suiXml += wdata.suify.container($this);
				});
				return '<main>'+suiXml+'</main>';
			},
			header: function($elem,repetition){
				if (repetition){
					var $sui = wdata.aux.strXQ('<repetition type="header"/>');
					wdata.aux.parseAttr($sui,$elem,/data\-/);
					return wdata.aux.xqString($sui);
				} else {
					var suiXml = '';
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
						else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
					return '<header>'+suiXml+'</header>';
				}
			},
			cover: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
					else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
				});
				var $sui = wdata.aux.strXQ('<cover>'+suiXml+'</cover>');
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			page: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('cover')) suiXml += wdata.suify.cover($this);
					else if ($this.hasClass('header')) suiXml += wdata.suify.header($this,true);
					else if ($this.hasClass('main')) suiXml += wdata.suify.main($this);
					else if ($this.hasClass('footer')) suiXml += wdata.suify.footer($this,true);
				});
				if ($elem.is('.covered-default') && (!Report.wgdata.reportName || !Report.wgdata.reportTitle)){
					var isBeginingPage = $elem.parent().children('.page:visible').index($elem);
					if (isBeginingPage < 2){
						if (!Report.wgdata.reportName){
							var eid = $elem.find('.reportName [data-edition*="text"]:eq(0), .reportName[data-edition]:eq(0)').attr('id');
							if (eid) Report.wgdata.reportName = $('<pre>'+tinymce.get(eid).getContent()+'</pre>').text();
							else Report.wgdata.reportName = $elem.find('.reportName').text();
						}
						if (!Report.wgdata.reportTitle){
							var eid = $elem.find('.reportTitle [data-edition*="text"]:eq(0), .reportTitle[data-edition]:eq(0)').attr('id');
							if (eid) Report.wgdata.reportTitle = $('<pre>'+tinymce.get(eid).getContent()+'</pre>').text();
							else Report.wgdata.reportTitle = $elem.find('.reportTitle').text();
						}
					}
				}
				var $sui = wdata.aux.strXQ('<page>'+suiXml+'</page>');
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);

			},
			document: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('page')) suiXml += wdata.suify.page($this);
				});
				if (!Report.wgdata.analysts){
					$elem.find('.block.analysts [data-key]').each(function(){
						Report.wgdata.analysts = Report.wgdata.analysts || [];
						Report.wgdata.analysts.push($(this).data('key'));
					});
				}
				var $sui = wdata.aux.strXQ('<document>'+suiXml+'</document>');
				$sui.attr('paper',wdata.aux.getClassAt($elem,1));
				return wdata.aux.xqString($sui);
			},
			templates: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('header')) suiXml += wdata.suify.header($this);
					else if ($this.hasClass('footer')) suiXml += wdata.suify.footer($this);
					else if ($this.hasClass('page')) suiXml += wdata.suify.page($this);
					else if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
					else if ($this.hasClass('container')) suiXml += wdata.suify.container($this);
				});
				return '<templates>'+suiXml+'</templates>';
			},
			validations: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					var $rule = wdata.aux.strXQ('<rule/>').append($this.text());
					wdata.aux.parseAttr($rule,$this,/count|min|max|name|selector|valid/);
					suiXml += wdata.aux.xqString($rule);
				});
				return '<validation>'+suiXml+'</validation>';
			},
			variables: function($elem){
				var $var = wdata.aux.strXQ('<var>'+$elem.text()+'</var>');
				wdata.aux.parseAttr($var,$elem,/name|value|data\-/);
				var value = $.trim($var.attr('value')||$var.text());
				if ((value+'').indexOf('[') === 0) value = JSON.parse(value);
				Report.wgdata[$var.attr('name')||$var.attr('id')] = value;
				return wdata.aux.xqString($var);
			},
			getAll: function(){
				Report.wgdata.usedimages = [];
				Report.document.find('img:not([src*="blob:"]), img:not([src*="data:"])').each(function(){
					Report.wgdata.usedimages.push($(this).attr('src').split('/').pop());
				});
				Report.document.find('[style*="background-image"]').each(function(){
					var bg = $(this).css('background-image');
					if (bg.indexOf('blob:') === -1 && bg.indexOf('data:') === -1){
						Report.wgdata.usedimages.push($(this).css('background-image').match(/\"(.*)\"/)[1].split('/').pop());
					}
				});
				var suiXml = '';
				Report.area.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('sui-variable')) suiXml += wdata.suify.variables($this);
					if ($this.hasClass('sui-validations')) suiXml += wdata.suify.validations($this);
					else if ($this.hasClass('sui-templates')) suiXml += wdata.suify.templates($this);
					else if ($this.hasClass('sui-report-document')) suiXml += wdata.suify.document($this);
				});
				Report.wgdata.document = suiXml;
			},
		}
	}

	Report.widgetData = function () {
		Report.wgdata = {};
		wdata.suify.getAll();
	};

};