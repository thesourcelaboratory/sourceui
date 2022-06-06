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
	Report.editors = Report.document.find('[data-edition*="text"],[data-edition*="figure"]');
	Report.tinymceinlinetoolbar = Dom.body.children('#tinymceinlinetoolbar');
	Report.scaler = $('<mark class="sui-scaler"></mark>').appendTo(Report.document);


	Report.figuretypes = {
		figure:{ '1':'Figure', '2':'Figura', '7':'Figura'},
		chart:{ '1':'Chart', '2':'Gráfico', '7':'Gráfico'},
		image:{ '1':'Image', '2':'Imagem', '7':'Imagen'},
		table:{ '1':'Table', '2':'Tabela', '7':'Tabla'},
	};

	Report.locker = function(locked){
		if (documentLocker){
			if (!documentLocker.reportId){
				return Console.error({ mode: 'LOCKER', title: 'ReportId is required'}).trace();
			}
			if (!documentLocker.cgeId){
				return Console.error({ mode: 'LOCKER', title: 'CgeID is required'}).trace();
			}
			documentLocker.lock = locked;
			var Socket = sourceui.instances.socket;
			Socket.emit('report:locked', documentLocker);
		}
	}

	Report.view.on('view:close',function(){
		Report.locker(false);
	});
	Report.document.addClass('preventhistorystack');

	var ___cnsl = {
		active: false,
		stack: function(where){
			___cnsl.green('initStack',where);
		},
		log: function(){
			if (!___cnsl.active) return;
			var a=[],l,ball;
			if (this === 'green') ball =  '🟢';
			else if (this === 'yellow') ball =  '🟡';
			else if (this === 'red') ball =  '🔴';
			else if (this === 'blue') ball =  '🔵';
			else if (this === 'purple') ball =  '🟣';
			else if (this === 'ok') ball =  '🤍';
			else ball =  '⚪️';
			$.each(arguments,function(k,v){
				if (v instanceof HTMLElement || v instanceof jQuery || typeof v === 'object') l = v;
				else a.push(v);
			});
			console.groupCollapsed(ball+' '+a.join('  '),l?[l]:'');
			console.info(l);
			console.groupEnd();
		},
		green: function(){
			___cnsl.log.apply('green',arguments);
		},
		yellow: function(){
			___cnsl.log.apply('yellow',arguments);
		},
		red: function(){
			___cnsl.log.apply('red',arguments);
		},
		blue: function(){
			___cnsl.log.apply('blue',arguments);
		},
		purple: function(){
			___cnsl.log.apply('purple',arguments);
		},
		ok: function(){
			___cnsl.log.apply('ok',arguments);
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
			var verifier = $.md5('var:'+name+'='+value);
			value = ((value+'').indexOf('[') === 0) ? JSON.parse(value) : value;
			if ($var.length){
				if (verifier === $var.data('verifier')) return value;
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
		set: function(name,value,appendType){
			var $var = Report.variables.filter('[name="'+name+'"]');
			if ($var.length){
				value = (typeof value == 'object') ? JSON.stringify(value) : value;
				if (appendType == 'html') $var.html(value);
				else $var.text(value);
				$var.data('verifier',$.md5('var:'+name+'='+value));
			}
			else  Console.error({ mode: 'VAR', title: 'Variable "'+name+'" not found'}).trace();
		}
	};
	Variable.init();

	var Figure = {
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
				Console.info({ mode: 'AJAX', title: 'Figure.post: imgdataUploader DONE', content: data}).trace();
			},"json")
			.fail(function(e,data){
				if (failback) failback(data);
				Console.error({ mode: 'AJAX', title: 'Figure.post: imgdataUploader FAIL', content: data }).trace();
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
			var hasdisplay = ($elem.attr('display')||'').indexOf('display') > -1
			var haswidth = ($elem.attr('style')||'').indexOf('width') > -1
			var orig = {
				display: hasdisplay ? $elem.css('display') : '',
				width: haswidth ? $elem.css('width') : ''
			};
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
					$c.css({width:dim.width,height:dim.height,zoom:$elem.css('zoom')||1,'background-color':bgcolor,'border-color':border||bgcolor||''});
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
					var error = $e.closest('.error, .overflew, .toolarge').length ? ' error' : ''
					if ($e.is('table')) {
						var $floater = $('<div class="floater flt-table '+classname+error+'"/>');
					} else {
						var $floater = $('<div class="floater flt-'+$e.tag()+' '+classname+error+'" />');
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
							if (error) css['opacity'] = 0.6;
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
							elements:'h1,h2,h3,h4,h5,p,table,li',
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
					elements:'.main .block[data-edition]:not(.financial-data), .main .block a[href], .main .block span[data-mce-style], .financial-data, .financial-data .ratios, .main img',
					spanwidth:'.main .reportTitle',
					contents: {
						'.block[data-edition]:not(.financial-data)':{
							elements:'h1,h2,h3,h4,h5,p,table,li',
							spanwidth:'h1,h2,h3,h4',
						},
						'.financial-data':{
							elements:'h1,h2,h3,h4,table',
							spanwidth:'h1,h2,h3,h4,table',
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
			},
			breaker : function(){
				if (Thumbnail.current.page.is('.breaker-before')) {
					Thumbnail.current.thumb.addClass('breaker');
				} else {
					Thumbnail.current.thumb.removeClass('breaker');
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
			Thumbnail.dom.breaker();
		},
	};

	var caret = {
		cleanup: function($edit){
			var $todel = $edit.parent().find('[data-mce-caret], .mce-visual-caret, .caret-autobreak');
			$todel.remove();
		},
		offset: function($edit){
			var $caret = caret.save($edit, 'position');
			var offset = $caret.offset();
			$caret.remove();
			return offset;
		},
		position: function($edit){
			var $caret = caret.save($edit, 'position');
			var position = $caret.offset();
			if ($edit){
				var eposition = $edit.offset();
				position.top = position.top - eposition.top || 0;
				position.left = position.left - eposition.left || 0;
			}
			$caret.remove();
			return position;
		},
		data: function($edit){
			var data = {
				edit: $edit,
				edge: $edit.closest('.content, .side, .boxstack, .main > .row > .cell'),
				page: $edit.closest('.page'),
			};
			data.selection = document.getSelection();
			data.range = data.selection ? data.selection.getRangeAt(0) : null;
			data.clientRects = data.range ? data.range.getClientRects() : {};
			data.editRects = data.edit.length ? data.edit.get(0).getBoundingClientRect() : {};
			data.edgeRects = data.edge.length ? data.edge.get(0).getBoundingClientRect() : {};
			data.containerLength = data.range ? $(data.range.startContainer).text().length : 0;
			data.containerPosition = data.range ? data.range.startOffset : 0;
			return data;
		},
		isOverflew: function($edit){
			var data = caret.data($edit);
			if (data.clientRects && data.clientRects[0]){
				var calc = (data.clientRects[0].top + data.clientRects[0].height - data.edgeRects.top);
				var boolTop = calc >= data.edge.height();
				if (boolTop) {
					___cnsl.red('caret','isOverflew:true ('+data.clientRects[0].top+' + '+data.clientRects[0].height+' - '+data.edgeRects.top+') >= '+data.edge.height()+'',$edit.get(0));
					return true;
				}
			}
			return false;
		},
		isAtBegining: function($edit){
			var data = caret.data($edit);
			var $rangstart = $(data.range.startContainer);
			var $paragraph = data.range.startContainer && $rangstart.is('p,h1,h2,h3,h4,h5,img,td') ? $rangstart : $rangstart.closest('p,h1,h2,h3,h4,h5,img,td');
			if (data.clientRects && data.clientRects[0]){
				var boolTop = (data.clientRects[0].top - data.editRects.top) <= data.clientRects[0].height;
				var boolLeft = data.clientRects[0].left - data.editRects.left <= data.clientRects[0].width;
				if (boolTop && boolLeft) return true;
			} else if ($edit.text().length === 0 || (data.range.startContainer && data.range.startOffset === 0 && $edit.children().get(0) === $paragraph.get(0))){
				return true;
			}
			return false;
		},
		isAtEnd: function($edit){
			var data = caret.data($edit);
			var $rangstart = $(data.range.startContainer);
			var $paragraph = data.range.startContainer && $rangstart.is('p,h1,h2,h3,h4,h5,img,td') ? $rangstart : $rangstart.closest('p,h1,h2,h3,h4,h5,img,td');
			if (data.clientRects && data.clientRects[0]){
				var boolTop = data.clientRects[0].top + (data.clientRects[0].height + 10) - data.editRects.top >= data.edit.height();
				var boolLeft = data.containerLength === data.containerPosition;
				if (boolTop && boolLeft) return true;
			} else if ($edit.text().length === 0 || (data.range.startContainer && data.range.startOffset === $paragraph.text().length && $edit.children(':last').get(0) === $paragraph.get(0))){
				return true;
			}
			return false;
		},
		hasSelection: function($edit){
			let $fieldwrap = $edit && $edit.length ? $edit.parent() : Report.document.find('.caret-autobreak').closest('.fieldwrap');
			if ($fieldwrap.length){
				let $edition = $fieldwrap.children('[data-edition]');
				var ed = tinymce.get($edition.attr('id'));
				var text = ed.selection.getContent({format : 'text'});
				return text.length ? true : false;
			}
		},
		save: function($edit, place){
			let $fieldwrap = $edit && $edit.length ? $edit.parent() : Report.document.find('.fieldwrap.active');
			let $edition = $fieldwrap.children('[data-edition]');
			if ($fieldwrap.length){
				let tinyeditor = tinymce.get($edition.attr('id'));
				tinyeditor.selection.setContent('<span class="caret-autobreak '+place+'"></span>');
			}
			return $edition.find('.caret-autobreak');
		},
		focus: function($edit){
			let $fieldwrap = $edit && $edit.length ? $edit.parent() : Report.document.find('.caret-autobreak').closest('.fieldwrap');
			if ($fieldwrap.length){
				let $edition = $fieldwrap.children('[data-edition]');
				let $caret = $edition.find('.caret-autobreak');
				if ($caret.length){
					var ed = tinymce.get($edition.attr('id'));
					if (ed){
						ed.focus();
						ed.selection.select($caret.get(0));
					}
					$caret.remove();
					$.event.trigger({ type : 'keypress' });
				}
			}
		}
	};

	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
		if (!Report.document.is(':visible')) return;
		if (event.ctrlKey){
			// CTRL Z OU Y =================================
			if (event.keyCode == 90 || event.keyCode == 89){
				var node = document.getSelection().anchorNode;
				var element = (node && node.nodeType == 3 ? node.parentNode : node);
				if (element){
					var $edition = $(element).closest('[data-edition],[contenteditable="true"]');
					if ($edition.length){
						return true; // escape historystack
					}
				}
				if (event.keyCode == 90) Report.document.trigger('historyworker:back');
				else if (event.keyCode == 89) Report.document.trigger('historyworker:forward');
				event.preventDefault();
				return false;
			}
		}
	});
	Dom.document.on('keyup', function(event){
		if (!Report.document.is(':visible')) return;
		if (event.ctrlKey){
			// normalize boxes =============================
			if (event.altKey && event.keyCode == 78){
				$.tipster.notify('Normalizing. Wait...');
				setTimeout(function(){
					boxFitter.normalizeBoxes();
					$.tipster.notify('All boxes were normalized');
				},150);
			}
			// CTRL Z OU Y =================================
			else if (event.keyCode == 90 || event.keyCode == 89){
				/*
				var $activeFieldwrap = Report.document.find('[data-edition].mce-edit-focus');
				if (!$activeFieldwrap.length){
					var $activeEdition = $activeFieldwrap.find('[data-edition*="text"], [data-edition="figure"]');
					if (!$activeEdition.length || !$edition.is('.contentchanged')){
							if (event.keyCode == 90) Report.document.trigger('historyworker:back');
						else if (event.keyCode == 89) Report.document.trigger('historyworker:forward');
					}
				}

				event.preventDefault();
				if (event.keyCode == 90) Report.document.trigger('historyworker:back');
				else if (event.keyCode == 89) Report.document.trigger('historyworker:forward');
				return false;
				*/
			}
			// CTRL V =======================================
			else if (event.keyCode == 86){
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
												var $clone = Report.templates.children('[data-edition="figure"]').clone();
												$clone.find('.figurespot').append('<img class="localsource" src="'+content.image+'">');
												$clone = $('<div class="fieldwrap figure" />').append($clone);
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
								});
							} else {
								$.tipster.notify('Clipboard read permission is denied. Verify browser settings.');
							}
						});
					}
				}
			}
		}
		if (event.keyCode == 18){
			//Report.document.removeClass('grab');
			//Report.wgtools.filter('.bottom').find('.zoom-grab').removeClass('active');
		}
		if (event.keyCode == 46 || event.keyCode == 8){
			Report.document.find('.container td.col.selected').trigger('container:delcol');
		}
	});
	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var boxFitter = {
		boxgroupID: function($box,id){
			var $edition = $box.children('[data-edition]');
			var bgID = id || $box.data('boxgroup');
			bgID = bgID || $edition.data('belongstogroup');
			bgID = bgID || Math.unique(20);
			$box.attr('data-boxgroup',bgID);
			$edition.attr('data-belongstogroup',bgID);
			return bgID;
		},
		groupPrev: function($box){
			var $page = $box.closest('.page');
			var $edge = $page.find('.content, .side, .boxstack, .main > .row > .cell');
			var $fieldwrap = ($box.is('[data-edition]')) ? $box.parent() : $box;
			var $edition = $fieldwrap.children('[data-edition]');
			var prevSelector = '.fieldwrap.'+$edition.attr('data-edition');
			var $prevwrap = $fieldwrap.prev(prevSelector);
			if (!$prevwrap.length) $prevwrap = $page.prev('.page').find('[class="'+$edge.attr('class')+'"] '+prevSelector+':last-child');
			if ($prevwrap.length && $fieldwrap.children('[data-edition]').data('name') === $prevwrap.children('[data-edition]').data('name')){
				var bgID = boxFitter.boxgroupID($fieldwrap);
				boxFitter.boxgroupID($prevwrap,bgID);
			}
			return $prevwrap;
		},
		groupNext: function($box){
			var $page = $box.closest('.page');
			var $edge = $page.find('.content, .side, .boxstack, .main > .row > .cell');
			var $fieldwrap = ($box.is('[data-edition]')) ? $box.parent() : $box;
			var $edition = $fieldwrap.children('[data-edition]');
			var nextSelector = '.fieldwrap.'+$edition.attr('data-edition');
			var $nextwrap = $fieldwrap.next(nextSelector);
			if (!$nextwrap.length) $nextwrap = $page.next('.page').find('[class="'+$edge.attr('class')+'"] '+nextSelector+':first-child');
			if ($nextwrap.length && $fieldwrap.children('[data-edition]').data('name') === $nextwrap.children('[data-edition]').data('name')){
				var bgID = boxFitter.boxgroupID($fieldwrap);
				boxFitter.boxgroupID($nextwrap,bgID);
			}
			return $fieldwrap;
		},
		flowText: function($edition){
			var $edge = $edition.closest('.content, .side, .boxstack');
			var $fieldwrap = $edition.parent();
			var $fieldsnext = $fieldwrap.nextAll('.fieldwrap');
			var $contentNew = boxFitter.breakBox($fieldwrap,$edge,true);
			if ($contentNew.length){
				var contentNew = $contentNew.html();
				if (contentNew){
					///////////////////////////////////////////////////////////////////////////////////////////////
					var $page = $edition.closest('.page');
					var $edge = $edition.closest('.cell');
					var $next = $page.next('.page').find('.cell.'+$edge.data('type')+' > *').first();
					if ($next.is('.fieldwrap.'+$edition.attr('data-edition'))){
						let $nextdit = $next.children('[data-edition]');
						if ($edition.data('belongstogroup') === $nextdit.data('belongstogroup')){
							$next.after($fieldsnext);
							return $next.children('[data-edition]').prepend(contentNew);
						}
					}
					boxFitter.appendBroken($edition,$edge,$contentNew,$fieldsnext);
					///////////////////////////////////////////////////////////////////////////////////////////////
				}
			}
		},
		appendBroken: function($edition,$edge,$contentNew,$boxNextAll){

			var contentNew = $contentNew.html();
			var $fieldwrap = $edition.parent();

			if (contentNew){

				$fieldwrap.removeClass('overflew toolarge');

				var $cloneedition = $edition.clone().html('');
				$cloneedition.html(contentNew);

				var $clonewrap = $('<div class="'+$fieldwrap.attr('class')+'" data-boxgroup="'+$fieldwrap.attr('data-boxgroup')+'" />').append($cloneedition);

				var $page = $edge.closest('.page'), $clonepage;

				var pagelayout = $page.data('layout');
				if (pagelayout == 'covered-default') pagelayout = 'splited';

				var $nextpage = $page.next('.page[data-layout="'+pagelayout+'"]:not(.breaker-before)');

				if ($nextpage.length){
					if ($edge.is('.side')) {
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.cell.side'),'prepend']);
					} else if ($edge.is('.content')){
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.cell.content'),'prepend']);
					} else if ($edge.is('.boxstack')){
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.boxstack, .cell.content'),'prepend']);
					} else {
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.main > .row > .cell'),'prepend']);
					}
					___cnsl.log('appendBroken','contentNew','prepend to next page',$nextpage.get(0));
				} else {
					$clonepage = Report.templates.children('.page[data-layout="'+pagelayout+'"]').clone();
					Report.document.trigger('document:addpage',[$clonepage,$page,'after']);
					if ($edge.is('.side')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.cell.side'),'prepend']);
					} else if ($edge.is('.content')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.cell.content'),'prepend']);
					} else if ($edge.is('.boxstack')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.boxstack, .cell.content'),'prepend']);
					} else {
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.main > .row > .cell'),'prepend']);
					}
					___cnsl.log('appendBroken','contentNew','prepend to new page',$clonepage.get(0));
				}
				if ($boxNextAll) $clonewrap.after($boxNextAll);
				//$page.trigger('page:active');
				return $clonewrap;
			}

		},
		breakBox: function($box,$edge,returnBroken){

			boxFitter.boxgroupID($box);
			$box = boxFitter.groupBellow($box);

			if (!$box.length){
				___cnsl.red('breakBox','groupBellow','No grouped box',$box);
				return $();
			}

			var $edition = $box.children('[data-edition]');
			$edge = $edge || $box.parent();


			if ($edition.is('.front-pages')){
				return false;
			}
			else if ($box.is('.container')){
				if (!boxFitter.isTooBigBox($box,$edge)) boxFitter.moveBox($box,$edge);
				return false;
			}
			else if ($edition.is('[data-edition="figure"]')){
				if (!boxFitter.isTooBigBox($box,$edge)) boxFitter.moveBox($box,$edge);
				return false;
			}
			else if ($edition.is('.financial-data')){
				if (!boxFitter.isTooBigBox($box,$edge)) boxFitter.moveBox($box,$edge);
				return false;
			}

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

			////////////////////////////////////////////////////////////////////////////////////////
			var $mayfuckedges = $edition.find('img');
			var hasfucked = false;
			$mayfuckedges.each(function(){
				var $mfe = $(this);
				if ($mfe.outerHeight(true) >= edgeHeight){
					hasfucked = true;
					___cnsl.red('breakBox','imagetoolarge:'+($mfe.outerHeight(true) >= edgeHeight),$mfe.get(0));
					return false;
				}
			});
			if (hasfucked){
				$.tipster.notify('Image is too large');
				return false;
			}
			////////////////////////////////////////////////////////////////////////////////////////

			___cnsl.log('breakBox','edition',$edition.get(0));

			$edition.children().each(function(k,el){
				let $el = $(el);
				if (!$el.is('img') && ($el.is(':empty') || $el.html() === '<br>')) {
					$el.remove();
					return true;
				}
				let elPos = $el.position();
				let overflowed = (boxPos.top + elPos.top) + $el.outerHeight(true) > edgeHeight;
				___cnsl[overflowed ? 'red' : 'log']('breakBox','overflowed:'+overflowed+' ('+boxPos.top+' + '+elPos.top+') + '+$el.outerHeight(true)+' > '+edgeHeight,el);
				if (overflowed){
					if ($el.is('table') && $edition.is('.analysts')){
						let $table = $el;
						let $tbodies = $table.children('tbody');
						let hasBreak = false;
						if ($tbodies.length){
							$tbodies.each(function(ky,tbody){
								var $tbody = $(tbody);
								let tbodyPos = $tbody.position();
								let calc = (boxPos.top + elPos.top + tbodyPos.top + $tbody.outerHeight(true));
								___cnsl.log('breakBox','tbody','overflowed:'+(calc > edgeHeight),tbody);
								if (calc > edgeHeight){
									$tbody.children('tr').each(function(ktr,tr){
										var $tr = $(tr);
										let trPos = $tr.position();
										let trHeight = $tr.outerHeight(true);
										let calc = (boxPos.top + elPos.top + trPos.top + trHeight);
										___cnsl.log('breakBox','tbody','tr','overflowed:',(calc > edgeHeight),tr);
										if (calc > edgeHeight){
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
								let calc = (boxPos.top + elPos.top + trPos.top + trHeight);
								___cnsl.log('breakBox','tr','overflowed:'+(calc > edgeHeight)+', index:'+ktr,tr);
								if (calc > edgeHeight){
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
					}
					if ($edition.data('edition') == 'richtext' && $el.is('ul, ol')){
						let hasBreak = false;
						let $nextall = $el.nextAll();
						$el.children('li').each(function(kli,li){
							let $li = $(li);
							let liPos = $li.position();
							let liHeight = $li.outerHeight(true);
							let calc = (boxPos.top + elPos.top + liPos.top + liHeight);
							___cnsl.log('breakBox','li','overflowed:'+(calc > edgeHeight)+', index:'+kli,li);
							if (calc > edgeHeight){
								if (kli === 1){
									$contentNew.append($el);
									hasBreak = true;
									return false;
								} else {
									let $elClone = $el.clone();
									$contentNew.append($elClone.html($li.nextAll().addBack()));
									hasBreak = true;
									return false;
								}
							}
						});
						if (hasBreak){
							$contentNew.append($nextall);
							return false;
						}
					} else {
						if (($edition.data('edition') == 'richtext' || $edition.data('name') == 'global-disclaimer') && $el.is('p')){
							let $econ = $el.contents();
							$el.html('');
							let $cl = $el.clone();
							$.each($econ, function(ie, ve) {
								if (this.nodeType == 3){
									let $wwab;
									let words = this.nodeValue.split(' ');
									$.each(words,function(iw,vw){
										$wwab = $('<span class="wordwrap-autobreak">').text(vw+' ');
										$el.append($wwab);
									});
								} else {
									$el.append(ve);
								}
							});
							$el.children().each(function(){
								let $sp = $(this);
								let spPos = $sp.position();
								let calc = (boxPos.top + elPos.top + spPos.top) + $sp.outerHeight(true);
								___cnsl.log('breakBox','wordwrap:'+(calc > edgeHeight)+' ('+boxPos.top+' + '+elPos.top+' + '+spPos.top+') + '+$sp.outerHeight(true)+' > '+edgeHeight+' ',$sp.text(),$sp.get(0));
								if (calc > edgeHeight){
									$cl.append($sp.nextAll().addBack());
									return false;
								}
							});

							$cl.find('.wordwrap-autobreak:last').text($.trim($cl.find('.wordwrap-autobreak:last').text()));
							$cl.find('.wordwrap-autobreak').contents().unwrap();
							$cl.get(0).normalize();
							if ($cl.text() !== '' || $cl.children('img,table,figure').length) $contentNew.append($cl);

							$el.find('.wordwrap-autobreak:first').text($el.find('.wordwrap-autobreak:first').text());
							$el.find('.wordwrap-autobreak').contents().unwrap();
							$el.get(0).normalize();
							$contentNew.append($el.nextAll());
							if (false === ($el.text() !== '' || $el.children('img,table,figure').length > 0)) $el.remove();
						} else {
							if ($el.is(':first-child')){
								boxFitter.moveBox($box,$edge);
							} else {
								$contentNew.append($el.nextAll().addBack());
							}
						}
						return false;
					}
				}
			});
			___cnsl.log('breakBox','contentNew',$contentNew.get(0));

			/////////////////////////////////////
			if (returnBroken) return $contentNew;
			else var $broken = boxFitter.appendBroken($edition,$edge,$contentNew,$boxNextAll);
			/////////////////////////////////////

			// anti ghostbox schema /////////////
			var contentText = $edition.text().trim();
			if (contentText === ''){
				if ($edition.find('img').length === 0){
					$edition.parent().remove();
				}
			}
			/*
			var ed = tinymce.get($edition.attr('id'));
			if (ed){
				var cnt = ed.getContent();
				if (cnt === '' || cnt === '<br>' || cnt === '<p></p>'){
					$edition.parent().remove();
				}
			}
			*/
			$edition.parent().removeClass('overflew toolarge');
			return $broken;
		},
		groupBellow: function($box){
			// join grouped boxes ------------------------
			if ($box.data('boxgroup')){
				var $boxGroup = $();
				var $foundgroup = Report.document.find('.cell > [data-boxgroup="'+$box.data('boxgroup')+'"], .boxstack > [data-boxgroup="'+$box.data('boxgroup')+'"]');
				var idx = 0;
				if ($foundgroup.length > 1) {
					$foundgroup.each(function(){
						if (this === $box.get(0)){
							$boxGroup = $boxGroup.add($foundgroup.filter(':eq('+idx+')'));
							$boxGroup = $boxGroup.add($foundgroup.filter(':gt('+idx+')'));
							return false;
						}
						idx++;
					});
					$box = $boxGroup.length > 1 ? boxFitter.joinBox($boxGroup,true) : $box;
				} else {
					$box = boxFitter.ungroupBox($box);
				}
			}
			return $box;
		},
		ungroupBox: function($box){
			$box.removeAttr('data-boxgroup').removeAttr('data-extrapolate').removeData('boxgroup').removeData('extrapolate');
			$box.children('[data-edition]').removeAttr('data-belongstogroup').removeData('belongstogroup');
			return $box;
		},
		joinBox: function($boxGroup){

			var $contentAll = $('<pre></pre>');

			($boxGroup||$()).each(function(kb,box){

				var $box = $(box);
				___cnsl.yellow('joinBox',box);
				var $edition = $box.children('[data-edition]');
				var $contentChild = $edition.children();

				var content, $content;
				content = $edition.html();
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
			});
			// UL-OL hack to join
			var $allul = $contentAll.find('ul,ol').each(function(){
				var $ul = $(this);
				var $ulnext = $ul.next();
				if ($ulnext.is('ul,ol')){
					$ul.append($ulnext.children());
				}
			});
			$allul.filter(':empty').remove();

			var contentAll = $contentAll.html();
			if (contentAll){
				___cnsl.log('joinBox','contentAll',$contentAll.get(0));
				var $b = $boxGroup.filter(':eq(0)');
				var $e = $b.children('[data-edition]');
				$e.html(contentAll);
				$boxGroup.filter(':gt(0)').remove();
				return $b;
			}
			return false
		},
		moveBox: function($box,$edge){

			$box = boxFitter.groupBellow($box);

			var $boxesToPrepend;
			if ($box.hasClass('toolarge')){
				$boxesToPrepend = $box.nextAll();
			} else {
				$boxesToPrepend = $box.nextAll().addBack();
				$box.removeClass('overflew');
			}

			if ($boxesToPrepend.length){
				var $page = $edge.closest('.page'), $clonepage;

				var pagelayout = $page.data('layout');
				if (pagelayout == 'covered-default') pagelayout = 'splited';

				var $nextpage = $page.next('.page[data-layout="'+pagelayout+'"]:not(.breaker-before)');

				if ($nextpage.length){
					if ($edge.is('.side')) $nextpage.find('.cell.side').prepend($boxesToPrepend);
					else if ($edge.is('.content')) $nextpage.find('.cell.content').prepend($boxesToPrepend);
					else if ($edge.is('.boxstack')) $nextpage.find('.boxstack, .cell.content').prepend($boxesToPrepend);
					else  $nextpage.find('.main > .row > .cell').prepend($boxesToPrepend);
					___cnsl.log('moveBox','prepend to next page',$nextpage.get(0));
				} else {
					$clonepage = Report.templates.children('.page[data-layout="'+pagelayout+'"]').clone();
					Report.document.trigger('document:addpage',[$clonepage,$page,'after']);
					if ($edge.is('.side')) $clonepage.find('.cell.side').prepend($boxesToPrepend);
					else if ($edge.is('.content')) $clonepage.find('.cell.content').prepend($boxesToPrepend);
					else if ($edge.is('.boxstack')) $clonepage.find('.boxstack, .cell.content').prepend($boxesToPrepend);
					else  $clonepage.find('.main > .row > .cell').prepend($boxesToPrepend);
					___cnsl.log('moveBox','prepend to new page',$clonepage.get(0));
				}
			}

		},
		hasOverflow: function($edge){
			var el = $edge.get(0);
			var curOverf = el.style.overflow;
			if ( !curOverf || curOverf === "visible" ) el.style.overflow = "hidden";
			var isOverflowing = el.clientWidth+20 < el.scrollWidth || el.clientHeight+20 < el.scrollHeight;
			el.style.overflow = curOverf;
			return isOverflowing;
		},
		documentOverflow: function(){
			var hasany = false;
			var $edgerange = Report.document.find('.content, .boxstack, .side');
			$edgerange.each(function(){
				var $edge = $(this);
				if (boxFitter.hasOverflow($edge)){
					hasany = $edge.closest('.page');
					return false;
				}
			});
			return hasany;
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

			var paddingTolerance = 8; // is the P padding at end of box, that always overflow the height.

			$edge = $edge || $box.parent();
			if ($edge.is('.content, .boxstack')){
				var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.closest('.main').width(), edgeHeight = $edge.height() + paddingTolerance;
			} else {
				var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width(), edgeHeight = $edge.height() + paddingTolerance;
			}

			strapolateHeight = boxPos.top + paddingTolerance > edgeHeight;
			if (strapolateHeight) {
				return 3;
			}
			strapolateHeight = (boxPos.top + $box.outerHeight(true)) > edgeHeight;
			if (strapolateHeight) {
				return 4;
			}

			return false;
		},
		hasGap: function($edge,$lastbox){

			var paddingTolerance = 16; // is the box minumus height.
			var $box = $lastbox || $edge.find('.fieldwrap, .container').last();

			var edgeHeight = $edge.height();

			if ($box.length){
				if ($edge.is('.content') && $edge.children('.boxstack').length) return false;
				if ($edge.is('.content, .boxstack')){
					var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.closest('.main').width();
				} else {
					var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width();
				}
				var gap = edgeHeight - (boxPos.top + $box.outerHeight(true));
				if (gap > 0){
					if (gap > paddingTolerance) return gap;
					return false;
				}
				return null;
			}
			return edgeHeight;
		},
		normalizeBoxes: function($origin, nomceinit){

			var $extrapolatedEdge;

			if (Report.document.hasClass('rearranging')) return false;
			Report.document.addClass('rearranging');

			___cnsl.stack('normalizeBoxes');

			var $pages, $boxedge, origin;
			if ($origin && $origin.is('.fieldwrap')){
				origin = 'box';
				$boxedge = $origin.closest('.content, .boxstack, .side');
				$pages = $boxedge.closest('.page');
				if ($origin.is('[data-boxgroup]')) {
					boxFitter.joinBox(boxFitter.groupBellow($origin));
				}
			} else if ($origin && $origin.is('.content, .boxstack, .side')){
				origin = 'edge';
				$boxedge = $origin;
				$pages = $boxedge.closest('.page');
			} else {
				origin = 'page';
				$pages = $origin || Report.document.find('.page:eq(0), .page.breaker-before');
			}

			___cnsl.log('normalizeBoxes','origin: '+origin, $origin);
			var pdx = 0;
			$pages.each(function(){

				if ($extrapolatedEdge) return false;

				var $page = $(this);
				var $pagerange = $page.nextUntil('.breaker-before').addBack();

				___cnsl.purple('normalizeBoxes','pages range till breaker: '+$pagerange.length, $pagerange);

				var $edgerange;
				if (origin == 'box' || origin == 'edge'){
					if ($boxedge.is('.content')) $edgerange = $pagerange.find('.content');
					else if ($boxedge.is('.side')) $edgerange = $pagerange.find('.side');
					else if ($boxedge.is('.boxstack')) {
						$edgerange = $().add($boxedge);
						$edgerange = $edgerange.add($pagerange.filter(':gt(0)').find('.content'));
					}
				} else {
					$edgerange = $pagerange.find('.content, .boxstack, .side');
				}

				var edx = 0;
				var $lastpage = $();
				$edgerange.each(function(){

					if ($extrapolatedEdge) return false;

					var $edge = $(this), edgetype, edgesel;

					if (___cnsl.active){
						var $page = $edge.closest('.page');
						if ($lastpage.get(0) !== $page.get(0)){
							$lastpage = $page;
							___cnsl.blue('normalizeBoxes', 'page('+$page.attr('data-pagenumber')+')' ,$page.get(0));
						}
					}

					if ($edge.is('.content')) { edgetype = 'content'; edgesel = '.content'; }
					else if ($edge.is('.boxstack')) { edgetype = 'boxstack'; edgesel = '.boxstack, .content'; }
					else if  ($edge.is('.side')) { edgetype = 'side'; edgesel = '.side'; }

					var cnsl = ___cnsl.active ? 'page('+$page.attr('data-pagenumber')+') edge('+edgetype+') ' : '';

					___cnsl.log('normalizeBoxes', cnsl ,$edge.get(0));

					//////////////////////////////////
					var $lastbox = $edge.children('.fieldwrap, .container').last();
					var gap = boxFitter.hasGap($edge,$lastbox);
					if (gap){
						___cnsl.log('normalizeBoxes', cnsl, 'has gap: '+(gap ? gap+'px' : 'true'),$edge.get(0));
						if ($lastbox.is('[data-boxgroup]')) {
							boxFitter.joinBox(boxFitter.groupBellow($lastbox));
						}
						var $nextboxes = $edgerange.filter(edgesel).filter(':gt('+edx+')').children('.fieldwrap, .container');
						if ($nextboxes.length){
							$edge.append($nextboxes);
							___cnsl.yellow('normalizeBoxes', cnsl, 'gap boxes appended: '+$nextboxes.length,$nextboxes);
						}
					}
					//////////////////////////////////
					if (boxFitter.hasOverflow($edge)){
						var $boxes = $edge.children('.fieldwrap, .container');
						___cnsl.red('normalizeBoxes', cnsl, 'has overflow: true',$edge.get(0));
						$boxes.each(function(kb,b){
							var $box = $(b);
							var extrapolate = boxFitter.isExtrapolatedBox($box,$edge);
							if (extrapolate){
								___cnsl.red('normalizeBoxes', cnsl, 'estrapolated box: true ('+extrapolate+')',$box.get(0));
								$box.addClass('overflew'); // tint as red
								$box.attr('data-extrapolate',extrapolate);
								$extrapolatedEdge = $edge; ////////////////////////////////////////////////////////////////////////////////////////
							} else {
								___cnsl.log('normalizeBoxes', cnsl, 'has estrapolated box: false',$box.get(0));
							}
							if (extrapolate === 3){
								// move all hidden objects to next page;
								///////////////////////////////////////////////
								Report.document.addClass('preventeventchange');
								boxFitter.moveBox($box,$edge);
								Report.document.removeClass('preventeventchange');
								return false;
								///////////////////////////////////////////////
							} else if (extrapolate === 4){
								// break box and move all next boxes to next page;
								///////////////////////////////////////////////
								Report.document.addClass('preventeventchange');
								boxFitter.breakBox($box,$edge);
								Report.document.removeClass('preventeventchange');
								return false;
								///////////////////////////////////////////////
							}
							if (!extrapolate){
								$box.removeClass('overflew toolarge');
								$box.removeAttr('data-extrapolate');
							}
						});
					} else {
						___cnsl.ok('normalizeBoxes', cnsl, ' has no normalizations');
					}
					edx++;
				});
				pdx++;
			});
			if (!nomceinit) Report.document.trigger('edition:init');

			Report.document.removeClass('rearranging');

			//////////////////////////////////////////////////////////////////////
			// hack to normalize all pages before breaking boxes
			if ($extrapolatedEdge){
				___cnsl.log('normalizeBoxes', 'hack to restart at estrapolated edge', $extrapolatedEdge.get(0));
				boxFitter.normalizeBoxes($extrapolatedEdge.closest('.page').next('.page').find('[class="'+$extrapolatedEdge.attr('class')+'"]'), nomceinit);
			}
			//////////////////////////////////////////////////////////////////////

			Report.document.trigger('document:pagelist');

		}

	};
	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	if (!Report.tinymceinlinetoolbar.length){
		Report.tinymceinlinetoolbar = $('<div id="tinymceinlinetoolbar"/>').appendTo(Dom.body);
	}

	/*
	setTimeout(function(){
		Report.tinymceinlinetoolbar.css({
			'left':Report.viewtools.offset().left + Report.viewtools.width() + 15
		});
	},500);
	*/

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
			data[$v.attr('name')] = $v.attr('value') || $v.html();
		});
		if (data.reportSummary) data.reportSummary = btoa(encodeURIComponent(data.reportSummary));
		data.usecover = Report.document.find('.page.fullcovered').attr('data-visible');
		data.reportName = $.trim(Report.document.find('.page.covered-default .block.reportName, .page.covered-default .cell.reportName .block').first().text());
		Report.document.trigger('document:openfloat',[Report.document, $.extend(data,{
			form:'metadata',
		})]);
	});
	var pepObject = {
		place: false,
		shouldEase: false,
		droppable: '.sui-report-document, .page, .content, .covered-default .side, .boxstack, .container .col, .fieldwrap, .pagedropper, .tools.top', // precisa olha isso aqui para contar a array certa dentro dos drops
		revert: true,
		useBoundingClientRect:true,
		startThreshold:[5,5],
		callIfNotStarted:['rest'],
		start: function (ev, obj) {
			obj.$el.addClass('dragger');
			Report.document.find('[data-edition].mce-edit-focus').blur();
		},
		drag: function(ev, obj){

			var $a = obj.$el.children('a');
			var $drop = this.activeDropRegions;
			var $target;

			Report.document.find('.pep-dropping').removeClass('pep-dropping');

			if ($a.hasClass('add-page')){
				$target = $drop[1];
				if ($target && $target.length && $target.is('.page')) {
					$target.addClass('pep-dropping');
				}
			} else if ($a.hasClass('add-breaker')){
				$target = $drop[1];
				if ($target && $target.length && $target.is('.pagedropper')) {
					$target.addClass('pep-dropping');
				}
			} else if ($a.hasClass('add-move')){
				$target = $drop[4] || $drop[3] || $drop[2] || $drop[1];
				if ($target && $target.length && $target.is('.page, .fieldwrap, .cell, .boxstack, .page, .col')) {
					$target.addClass('pep-dropping');
				}
			} else {
				$target = $drop[4] || $drop[3] || $drop[2] || $drop[1];
				if ($target && $target.length && $target.is('.fieldwrap, .cell, .boxstack, .page, .col')){
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

			if (!$drop[0]) return;

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
						} else {
							$.tipster.notify('Drop before/after existing page');
						}
					} else {
						Report.document.trigger('document:addpage',[$clone]);
					}
				}
			} else if ($a.hasClass('add-breaker')){
				$target = $drop[1];
				if ($target && $target.length && $target.is('.pagedropper')) {
					var $targpg = $target.parent();
					if (!$targpg.hasClass('breaker-before')){
						$targpg.trigger('page:addbreaker');
						$.tipster.notify('Session breaker added');
					}
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
								if (!$drop[key].parent().is('.reserved')){
									var $ref = $drop[key];
									var boxPos = $ref.offset();
									if (boxPos.top + 24 > this.ev.y) $allmoving.insertBefore($ref);
									else if (boxPos.top + $ref.outerHeight(true) - 24 < this.ev.y) $allmoving.insertAfter($ref);
									else {
										var $refed = $ref.children('[data-edition]');
										$refed.trigger('edition:split',[this.ev.y]);
										$refed.parent().after($allmoving);
									}
								} else {
									$.tipster.notify('No more boxes allowed');
								}
							} else if ($drop[key].is('.cell')){
								$drop[key].append($allmoving);
							} else if ($drop[key].is('.boxstack')){
								$drop[key].append($allmoving);
							} else {
								$page.find('.main > .row > .content').append($allmoving);
							}
						}
					} else if ($allmoving.filter('.page').length){
						if ($page && $page.length && $page.is('.page')) $page.trigger('page:active').after($allmoving);
						else if ($page && $page.length && $page.is('.pagedropper')) $page.trigger('page:active').parent().before($allmoving);
						$allmoving.velocity({
							scale:[1,1.1],
							opacity:[1,0]
						},{
							easing: "ease-out",
							duration:200,
							complete: function(){
								Report.document.trigger('document:numpage');
								$.tipster.notify('Page was relocated');
							}
						});
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
						if (!$drop[key].parent().is('.reserved')){
							$page.trigger('page:addcontainer',[$clone,$drop[key],'split',this.ev.y]);
						} else {
							$.tipster.notify('No more boxes allowed');
						}
					} else if ($drop[key].is('.cell')){
						$page.trigger('page:addcontainer',[$clone,$drop[key],'append']);
					} else if ($drop[key].is('.boxstack')){
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
					else if ($a.hasClass('add-figure')) edition = 'figure';
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
						cancelDrop = true;
					}

					if (!cancelDrop){
						$clone = $('<div class="fieldwrap '+edition+'" />').append($clone);
						if ($drop[key].is('.col')){
							/*
							//CAM - stack de boxes dentro de uma col
							if (!$drop[key].children('.fieldwrap').length){
								$page.trigger('page:addedition',[$clone,$drop[key],'append']);
							} else {
								$.tipster.notify('Spot has a box already');
							}
							*/
							$page.trigger('page:addedition',[$clone,$drop[key],'append']);
						} else if ($drop[key].is('.fieldwrap')){
							if (!$drop[key].parent().is('.reserved')){
								$page.trigger('page:addedition',[$clone,$drop[key],'after']);
								if (!$drop[key].parent().is('.col')){
									var boxPos = $drop[key].offset();
									if (boxPos.top + 24 > this.ev.y) $page.trigger('page:addedition',[$clone,$drop[key],'before']);
									else if (boxPos.top + $drop[key].outerHeight(true) - 24 < this.ev.y) $page.trigger('page:addedition',[$clone,$drop[key],'after']);
									else {
										$page.trigger('page:addedition',[$clone,$drop[key],'split',this.ev.y]);
									}
								} else {
									$page.trigger('page:addedition',[$clone,$drop[key],'after']);
									//$.tipster.notify('Spot already has a box');
								}
							} else {
								$.tipster.notify('No more boxes allowed');
							}
						} else if ($drop[key].is('.cell')){
							$page.trigger('page:addedition',[$clone,$drop[key],'append']);
						} else if ($drop[key].is('.boxstack')){
							$page.trigger('page:addedition',[$clone,$drop[key],'append']);
						} else {
							$page.trigger('page:addedition',[$clone]);
						}

						// autoclick dynamic insertion
						if (edition == 'dynamic'){
							$clone.find('[data-edition]').addClass('empty-content').trigger('edition:tools').click();
							$clone.children('.edition-actions').find('.pick a').click();
						} else if (edition == 'figure'){
							$clone.find('[data-edition]').attr('data-indexlabel', 'figure');
						} else if (edition == 'toc'){
							$clone.find('[data-edition]').trigger('edition:tools').click();
						} else {
							//$clone.find('[data-edition]').focus(); // comentado para verificar se esse é o bug do focus+placeholder
						}
						Report.document.trigger('document:boxcount');

						// Para sempre manter as frontpages por ultimo na lista de DOM
						var $reduced = $clone.closest('.reduced');
						if ($reduced.length){
							$reduced.find('.front-pages').parent().appendTo($reduced);
						}

						if ($page.hasClass('draggable-resizable')){
							$.tipster.notify('Use the "'+edition+'" label on yellow bar to drag this box over the page', 3000);
							$clone.find('[data-edition]').attr('data-position','top:'+$clone.position().top+'px; left:'+$clone.position().left+'px; width:'+$clone.outerWidth()+'px');
						}
					}
				}
			}
			$.each($drop||[],function(k,v){ v.removeClass('pep-dpa pep-dropping'); });
			obj.$el.removeClass('dragger');
		}
	};
	var $wgtooltop = Report.wgtools.filter('.top').find('li:gt(1)');
	$wgtooltop.pep(pepObject);

	$wgtooltop.filter(':last').on('dblclick',function(){
		Report.document.trigger('document:clipboardclean');
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
	Report.document.on('mousewheel', function(event){
		if (event.ctrlKey){
			if (event.originalEvent.wheelDelta < 0) {
				Report.wgtools.filter('.bottom').find('.zoom-out').click();
			} else {
				Report.wgtools.filter('.bottom').find('.zoom-in').click();
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





	// Page Tools -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var toolsPage = ''+
		'<ul class="page-actions nedt" contenteditable="false">'+
		'<li class="nedt label" contenteditable="false"></li>'+
		'<li data-action="edit" class="nedt edit" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit page properties"></a></li>'+
		'<li data-action="bgimg" class="nedt bgimg" contenteditable="false"><a class="icon-circle-pic" data-tip="Browse page background image"></a></li>'+
		'<li data-action="move" class="nedt move" contenteditable="false"><a class="icon-move-up-down" data-tip="Move box to relocate"></a></li>'+
		'<li data-action="remove" class="nedt remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this page"></a></li>'+
		'</ul>';

	var $toolsPage = $(toolsPage);
	Report.document.on('page:tools','.page',function(event){
		var $this = $(this);
		var $tools = $this.children('.page-actions');
		if (!$tools.length){
			$tools = $toolsPage.clone();
			var allowActions = $this.data('actions-allow') || '';
			var denyActions = $this.data('actions-deny') || '';
			$tools.find('li.label').text('Page '+($this.parent().children('.page:visible').index($this)+1));
			$tools.find('li').each(function(){
				var $li = $(this).removeClass('disable deny allow');
				var a = $li.data('action');
				if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
					$li.addClass('deny');
				} else {
					$li.addClass('allow');
				}
			});
			$this.prepend($tools);
			$tools.find('[data-tip]').tip();
		}
		var height = $this.height();
		var offset = $this.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $tools.addClass('up');
		else $tools.removeClass('up');
	});
	Report.document.on('click','.page-actions',function(event){
		event.stopPropagation();
	});
	Report.document.on('click','.page-actions .clone a',function(){
		var $this = $(this);
		var $page = $this.closest('.page');
		var $clone = $page.clone();
		Report.document.trigger('document:addpage',[$clone,$page,'after']);
	});
	Report.document.on('click','.page-actions .edit a',function(){
		var $this = $(this);
		var $page = $this.closest('.page');
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
	Report.document.on('click','.page-actions .bgimg a',function(){
		var $this = $(this);
		var $page = $this.closest('.page');
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
					Figure.post(reader.result, null, function(data){
						var bgimg = document.createElement('img');
						bgimg.onload = function(){ $page.css('background-image','url("'+data.src+'")'); }
						bgimg.src = data.src;
						$page.attr('data-background',data.src);
						Report.document.trigger('document:change',[$page]);
						$.tipster.notify('Image auto uploaded');
						$page.removeClass('ajax-courtain');
					},function(){
						$.tipster.notify('Image upload not allowed');
						$page.removeClass('ajax-courtain');
					});
					///////////////////////////////////////////
				};
				$page.addClass('ajax-courtain');
				reader.readAsDataURL(file);
			};
			input.click();
		} else {
			$page.removeAttr('data-background');
			$page.css('background-image','');
			Report.document.trigger('document:change',[$page]);
		}
	});
	Report.document.on('click','.page-actions .move a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.page');
		$ctn.trigger('page:clipboardmoved');
	});

	Report.document.on('click','.page-actions .remove a',function(){
		var $this = $(this);
		var $page = $this.closest('.page');
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
		'<li data-action="move" class="nedt move" contenteditable="false"><a class="icon-move-up-down" data-tip="Move box to relocate"></a></li>'+
		'<li data-action="remove" class="nedt remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this box"></a></li>'+
		'</ul>';
	var $toolsContainer = $(toolsContainer);
	Report.document.on('mousedown click','.container-actions',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	Report.document.on('container:tools','.container',function(event){
		var $this = $(this);
		var $tools = $this.children('.container-actions');
		if (!$tools.length){
			$tools = $toolsContainer.clone();
			var allowActions = $this.data('actions-allow') || '';
			var denyActions = $this.data('actions-deny') || '';
			$tools.find('li').each(function(){
				var $li = $(this).removeClass('disable deny allow');
				var a = $li.data('action');
				if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
					$li.addClass('deny');
				} else {
					$li.addClass('allow');
				}
			});
			$this.prepend($tools);
			$tools.find('[data-tip]').tip();
		}
		var height = $this.height();
		var offset = $this.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $tools.addClass('up');
		else $tools.removeClass('up');
	});
	Report.document.on('click','.container-actions .edit a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.container');
		Report.document.trigger('document:openfloat',[$ctn, {
			form:'container',
			lines: $ctn.children('.line').length,
			columns: $ctn.children('.line').children('.col').length,
		}]);
	});
	Report.document.on('click','.container-actions .addcol a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.container');
		$ctn.trigger('container:addcolumn');
	});
	Report.document.on('click','.container-actions .addline a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.container');
		$ctn.trigger('container:addline');
	});
	Report.document.on('click','.container-actions .reset a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.container');
		$ctn.removeAttr('style');
		$ctn.find('.line > .col').removeAttr('style');
		$ctn.trigger('container:dimension');
	});
	Report.document.on('click','.container-actions .move a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.container');
		var $page = $ctn.closest('.page',Report.document);
		$ctn.trigger('container:clipboardmoved');
		$page.trigger('page:active');
	});
	Report.document.on('click','.container-actions .remove a',function(){
		var $this = $(this);
		var $ctn = $this.closest('.container');
		$ctn.trigger('container:remove');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





	// Edition Tools ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	var toolsEdition = ''+
		'<ul class="edition-actions nedt" contenteditable="false">'+
		'<li class="nedt label" contenteditable="false"></li>'+
		'<li data-action="prop" class="nedt prop" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit box properties"></a></li>'+
		'<li data-action="pick" class="nedt pick" contenteditable="false"><a class="icon-picker-gd" data-tip="Pick box data"></a></li>'+
		'<li data-action="img" class="nedt img" contenteditable="false"><a class="icon-circle-pic" data-tip="Browse a local image"></a></li>'+
		//'<li data-action="margin" class="nedt margin" contenteditable="false"><a class="icon-box-margin-y" data-tip="Toggle box extra margin"></a></li>'+
		'<li data-action="wide" class="nedt wide" contenteditable="false"><a class="icon-box-wide-right" data-tip="Toggle wide width"></a></li>'+
		'<li data-action="editable" class="nedt editable" contenteditable="false"><a class="icon-edit-content" data-tip="Toggle box content editable"></a></li>'+
		'<li data-action="clone" class="nedt clone" contenteditable="false"><a class="icon-copy" data-tip="Clone this box as next"></a></li>'+
		'<li data-action="move" class="nedt move" contenteditable="false"><a class="icon-move-up-down" data-tip="Move box to relocate"></a></li>'+
		'<li data-action="split" class="nedt split" contenteditable="false"><a class="icon-split-horizontal" data-tip="Split box at cursor"></a></li>'+
		'<li data-action="normalize" class="nedt normalize" contenteditable="false"><a class="icon-wavearrow" data-tip="Normalize box stack"></a></li>'+
		'<li data-action="refresh" class="nedt refresh" contenteditable="false"><a class="icon-rearrange-content" data-tip="Refresh active content"></a></li>'+
		'<li data-action="remove" class="nedt remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this box"></a></li>'+
		'</ul>';

	var $toolsEdition = $(toolsEdition);
	Report.document.on('mousedown click','.edition-actions',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	Report.document.on('edition:tools','[data-edition]',function(event){
		var $this = $(this);
		var $tools = $this.siblings('.edition-actions');
		var $wrap = $this.parent();
		if (!$tools.length){
			$tools = $toolsEdition.clone();
			var allowActions = $this.data('actions-allow') || '';
			var denyActions = $this.data('actions-deny') || '';
			$tools.find('li.label').text($this.attr('data-edition').charAt(0).toUpperCase() + $this.attr('data-edition').slice(1));
			$tools.find('li[data-action]').each(function(){
				var $li = $(this).removeClass('deny allow');
				var a = $li.data('action');
				if (a == 'margin'){
					if ($this.is('[data-extramargin]')) $li.children('a').addClass('active');
					else $li.children('a').removeClass('active');
				} else if (a == 'editable'){
					if ($this.attr('contenteditable') == "true") $li.children('a').addClass('active');
					else $li.children('a').removeClass('active');
				}
				if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
					$li.addClass('deny');
				} else {
					$li.addClass('allow');
				}
			});

			if ($this.attr('data-edition') == 'figure') {
				$tools.find('li.img').removeClass('deny').addClass('allow');
				$tools.find('li.split').removeClass('allow').addClass('deny');
			} else if ($this.attr('data-edition') == 'dynamic') {
				$tools.find('li.split, li.img').removeClass('allow').addClass('deny');
			} else if ($this.attr('data-edition') !== 'richtext') {
				$tools.find('li.split').removeClass('allow').addClass('deny');
			} else {
				$tools.find('li.img').removeClass('allow').addClass('deny');
			}

			if ($this.attr('data-edition') == 'dynamic') {
				$tools.find('li.prop, li.refresh, li.wide').removeClass('allow').addClass('deny');
				if ($this.data('name') == 'global-disclaimer'){
					$tools.find('li.refresh, li.remove').removeClass('deny').addClass('allow');
					$tools.find('li.split').removeClass('allow').addClass('deny');
				} else if (($this.data('name')||'').indexOf('front-pages') > -1){
					$tools.find('li.refresh').removeClass('deny').addClass('allow');
					$tools.find('li.split, li.remove').removeClass('allow').addClass('deny');
				} else if (($this.data('name')||'').indexOf('back-pages') > -1){
					$tools.find('li.refresh, li.remove').removeClass('deny').addClass('allow');
					$tools.find('li.split').removeClass('allow').addClass('deny');
				}
			} else if ($this.attr('data-edition') == 'toc') {
				$tools.find('li.prop, li.pick, li.editable, li.refresh, li.wide, li.split').removeClass('allow').addClass('deny');
			} else {
				$tools.find('li.pick, li.editable, li.refresh').removeClass('allow').addClass('deny');
			}


			$wrap.prepend($tools);
			$tools.find('[data-tip]').tip();
		}
		var height = $wrap.height();
		var offset = $wrap.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $tools.addClass('up');
		else $tools.removeClass('up');
	});
	Report.document.on('click','.edition-actions .prop a',function(){
		var $this = $(this);
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
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
			background: $edit.attr('data-background'),
			margin: $edit.attr('data-extramargin') || 'N',
			editable: $edit.attr('contenteditable'),
		}]);
	});
	Report.document.on('click','.edition-actions .img a',function(){
		var $this = $(this);
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		var $page = $fieldwrap.closest('.page');
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.onchange = function() {
			var file = this.files[0];
			var reader = new FileReader();
			reader.onload = function () {
				var $spot = $edit.find('.figurespot');
				if (!$spot.length){
					$spot = $('<div class="figurespot yedt" contenteditable="true" />');
					var $h = $edit.find('h4');
					if ($h.length) $h.after($spot);
					else $edit.prepend($spot);
				}
				var $img = $('<img src="'+reader.result+'" class="browserdelement" />');
				$spot.find(':not(img):not(.tablewrap),.tablewrap:empty').remove();
				$spot.contents().filter(function(){ return this.nodeType == 3; }).remove(); //delete text
				$spot.append($img);
				///////////////////////////////////////////
				if ($img.is('[src*="image/svg"]')){
					var svg = $img.attr('src').split(',')[1];
					svg = decodeURIComponent(escape(atob(svg)));
					if (svg){
						setTimeout(function(){
							$.svgString2Image(svg, $img.width()*5, $img.height()*5, 'png', function (pngData) {
								// pngData is base64 png string
								Figure.post(pngData, null, function(data){
									$img.attr('src',data.src);
									Report.document.trigger('document:change',[$page]);
									$.tipster.notify('Image auto converted and uploaded');
									$edit.removeClass('ajax-courtain');
								},function(){
									$.tipster.notify('Image upload not allowed');
									$img.addClass('error');
								});
							});
						},150);
					}
				} else {
					Figure.post(reader.result, null, function(data){
						$img.attr('src',data.src);
						Report.document.trigger('document:change',[$page]);
						$.tipster.notify('Image auto uploaded');
						$edit.removeClass('ajax-courtain');
					},function(){
						$.tipster.notify('Image upload not allowed');
						$img.addClass('error');
					});
				}
				///////////////////////////////////////////
			};
			reader.readAsDataURL(file);
			$edit.addClass('ajax-courtain');
		};
		input.click();
	});
	Report.document.on('click','.edition-actions .pick a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		if ($fieldwrap.is('[data-boxgroup]')) $edit = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] > [data-edition]');
		var $editionfirst = $edit.first();
		var keys = [];
		$edit.find('[data-key]').each(function(){
			keys.push($(this).attr('data-key'));
		});
		if ($editionfirst.attr('data-key')) keys.push($edit.attr('data-key'));
		Report.document.trigger('document:openfloat',[$editionfirst, {
			form:'dynamic',
			name: $editionfirst.attr('data-name'),
			keys: keys,
			vars:Variable.getAll()
		}]);
	});
	Report.document.on('click','.edition-actions .margin a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		var $page = $fieldwrap.closest('.page');
		if (!$edit.attr('data-extramargin')){
			$edit.attr('data-extramargin','S');
			$this.addClass('active');
		} else {
			$edit.removeAttr('data-extramargin');
			$this.removeClass('active');
		}
		Report.document.trigger('document:change',[$page]);
	});
	Report.document.on('click','.edition-actions .wide a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		Report.scaler.removeClass('active');
		if (!$fieldwrap.is('.wide')){
			$edit.attr('data-wide','S');
			$fieldwrap.addClass('wide');
		} else {
			$edit.removeAttr('data-wide');
			$fieldwrap.removeClass('wide');
		}
	});
	Report.document.on('click','.edition-actions .editable a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		var $page = $fieldwrap.closest('.page');
		$edit.attr('contenteditable',$edit.attr('contenteditable') == 'true' ? 'false' : 'true');
		$this.toggleClass('active');
	});
	Report.document.on('click','.edition-actions .clone a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $page = $fieldwrap.closest('.page');
		var $clone = $fieldwrap.clone();
		$page.trigger('page:addedition',[$clone,$fieldwrap,'after']);
		$clone.children('[data-edition]').focus();
		Report.document.trigger('document:boxcount');
	});
	Report.document.on('click','.edition-actions .move a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		var $page = $fieldwrap.closest('.page',Report.document);
		$edit.trigger('edition:clipboardmoved');
		$page.trigger('page:active');
	});
	Report.document.on('click','.edition-actions .split a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		$edit.trigger('edition:split',[caret.offset($edit).top]);
		$edit.trigger('edition:active');
		$.tipster.notify('Box splitted');
	});
	Report.document.on('click','.edition-actions .normalize a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		boxFitter.normalizeBoxes($fieldwrap);
		$edit.trigger('edition:active');
		$.tipster.notify('Box normalized');
	});
	Report.document.on('click','.edition-actions .refresh a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
		$edit.trigger('edition:activecontentrefresh');
	});
	Report.document.on('click','.edition-actions .remove a',function(){
		var $this = $(this);
		if ($this.closest('.disable').length) return;
		var $fieldwrap = $this.closest('.fieldwrap');
		var $edit = $fieldwrap.children('[data-edition]');
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

		//Report.document.css({ 'transform':'scale('+newzoom+')', 'transform-origin': newzoom < 1 ? 'center top' : 'left top'});
		Report.document.css({ 'zoom':newzoom});
		Report.document.attr('data-zoom',newzoom);

		ele.scrollTop = (ele.scrollTop * newzoom) / zoom;

		let wd = Math.floor((ele.scrollWidth - Report.scroll.width()) / 2);
		if ((ele.scrollLeft == 0 || scrollMid === true) && wd > 0){
			ele.scrollLeft = wd;
		}

		var $wgtooltop = Report.wgtools.filter('.top').find('li:gt(1)');
		$.pep.unbind( $wgtooltop );
		pepObject.zoom = newzoom;
		$wgtooltop.pep(pepObject);

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
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


	// Element Scaler ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('edition:elementscaler','[data-edition]',function(event, $elem){
		Report.scaler.data('element', $elem);
		var isimg = $elem.is('img');
		if (isimg && ($elem.attr('style')||'').indexOf('height') > -1){
			$elem.removeAttr('style');
			$elem.removeAttr('data-mce-style');
		}
		var $editor = $(this);
		var $table = $elem.children('table');
		var editoroffset = $editor.offset();
		var editorwidth = $editor.innerWidth();
		var scalerwidth = Report.scaler.width();
		var scrolloffset = Report.scroll.offset();
		var elemwidth = (isimg?$elem:$table).outerWidth(true);
		var elemoffset = $elem.offset();
		var zoom;
		var inipos;
		var initialcss = {};
		var constrainTo;
		initialcss = {
			top: elemoffset.top + Report.scroll.scrollTop() - scrolloffset.top,
			left: (elemoffset.left + $elem.width()) - scalerwidth - scrolloffset.left,
		};
		constrainTo = [initialcss.top, (elemoffset.left + editorwidth) - scalerwidth - scrolloffset.left, initialcss.top, editoroffset.left - scrolloffset.left];
		Report.scaler.css(initialcss);
		$.pep.unbind( Report.scaler );
		var $pep = Report.scaler.pep({
			axis: 'x',
			shouldEase: false,
			place: false,
			useCSSTranslation: false,
			constrainTo: constrainTo,
			start:function(ev, obj){
				inipos = elemoffset.left;
			},
			//drag:function(ev, obj){
			//},
			stop:function(ev, obj){
				$elem.removeAttr('data-mce-style');
				var endpos = obj.$el.offset().left;
				var basewidth;
				basewidth = editorwidth - ((inipos - endpos) + editorwidth - scalerwidth);
				var newcss = { width: basewidth };
				if (!isimg){
					zoom = basewidth/elemwidth;
					$table.css({ zoom: zoom }).attr('data-zoom',zoom);
				}
				$elem.css(newcss);
				setTimeout(function(){
					(isimg?$elem:$table).attr('data-mce-selected','1');
					Report.scaler.addClass('active');
				},30);
				$editor.trigger('edition:change');
				$elem.addClass('scaled');
			}
		});
		/*
		if (editorwidth > elemwidth) zoom = 1;
		else zoom = editorwidth/elemwidth;
		initialcss = {
			top: (elemoffset.top * zoom) + Report.scroll.scrollTop() - scrolloffset.top,
			left: ((elemoffset.left + $elem.outerWidth(true)) * zoom) - scalerwidth - scrolloffset.left,
		};
		constrainTo = [initialcss.top, ((elemoffset.left * zoom) + editorwidth) - scalerwidth - scrolloffset.left, initialcss.top, editoroffset.left - scrolloffset.left];
		*/
	});
	Report.scaler.on('click',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	Report.scaler.on('dblclick',function(event){
		var $elem = Report.scaler.data('element');
		$elem.css('width','').removeClass('scaled');
		setTimeout(function(){ Report.scaler.removeClass('active'); }, 30);
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
		Report.document.trigger('historyworker:statehold',['container:delrange']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
		Report.document.trigger('historyworker:stateadd',['container:delrange']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('container:addcolumn','.container',function(event){
		Report.document.trigger('historyworker:statehold',['container:addcolumn']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $ctn = $(this);
		$ctn.find('.col:last-of-type').css('width','').after('<td class="col"/>');
		$ctn.trigger('container:dimension');
		$ctn.trigger('container:resizable');
		Report.document.trigger('historyworker:stateadd',['container:addcolumn']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('container:addline','.container',function(event){
		Report.document.trigger('historyworker:statehold',['container:addline']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $ctn = $(this);
		var $line = $('<tr class="line"/>');
		var $lastline = $ctn.find('.line:last-of-type');
		var clen = $lastline.find('.col').length;
		for(var i = 0; i < clen; i++ ){
			$line.append('<td class="col"/>');
		}
		$lastline.after($line);
		Report.document.trigger('historyworker:stateadd',['container:addline']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('container:dimension','.container',function(event){
		var $ctn = $(this);
		var $cols = $ctn.find('.line > .col');
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
		var $main = $ctn.closest('.main',Report.document);
		var $page = $main.closest('.page',Report.document);
		var $cols = $ctn.find('.line:eq(0) > .col');
		var $nopep = $cols.filter(':not(.haspep)');
		var mainwidth = $main.innerWidth();
		if ($nopep.length){
			$nopep.prepend('<a class="resize" />');
			var $resizes = $nopep.find('.resize');
			var $pep = $resizes.pep({
				axis: 'x',
				shouldEase: false,
				place: false,
				useCSSTranslation: false,
				shouldPreventDefault: true,
				start:function(ev, obj){
					var $d = obj.$el;
					$ctn.trigger('container:active');
					Report.document.trigger('historyworker:statehold',['container:resizable']); /*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
				},
				stop:function(ev, obj){
					var $d = obj.$el;
					var $col = $d.parent();
					var $colthisnext = $().add($col).add($col.next('.col'));
					var dpos = $d.position();
					$colthisnext.find('img:not(.scaled)').css({width:'', height:''});
					if (!$ctn.is('[style*="width"]')){
						$ctn.css('width',$ctn.outerWidth());
					}
					if ($col.is(':last-of-type')){
						$col.prevAll('.col').each(function(){
							var $c = $(this);
							$c.innerWidth($c.innerWidth());
						});
						var basewidth = ($ctn.outerWidth() - ($col.innerWidth() - dpos.left));
						basewidth = (basewidth > mainwidth) ? mainwidth + (parseInt($ctn.css('border-width')) * 4) : basewidth;
						$ctn.css('width', basewidth);
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
					$ctn.find('.line:gt(0) > .col').removeAttr('style').each(function(){
						var $c = $(this);
						$c.innerWidth($c.innerWidth());
					});
					Report.document.trigger('document:change',[$page]);
					Report.document.trigger('historyworker:stateadd',['container:resizable']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
				}
			});
			$nopep.addClass('haspep');
		}
		$cols.find('.resize').height($ctn.outerHeight());
		$ctn.removeAttr('data-style').find('[data-style]').removeAttr('data-style');
	});
	Report.document.on('container:remove','.container',function(){
		Report.document.trigger('historyworker:statehold',['container:remove']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $this = $(this);
		var $page = $this.closest('.page',Report.document);
		var $preved = $this.prev('.fieldwrap').children('[data-edition]');
		var $nexted = $this.next('.fieldwrap').children('[data-edition]');
		Report.document.addClass('preventeventchange');
		$this.find('[data-edition]').each(function(){
			$(this).trigger('edition:remove');
		});
		Report.document.removeClass('preventeventchange');
		$this.remove();
		if ($preved.data('edition') === $nexted.data('edition')){
			$preved.trigger('edition:join',[$nexted]);
		}
		Report.document.trigger('document:change',[$page]);
		$.tipster.notify('Container removed');
		Report.document.trigger('historyworker:stateadd',['container:remove']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('container:clipboardmoved','.container',function(){
		Report.document.trigger('historyworker:statehold',['container:clipboardmoved']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $moved = Report.document.find('.clipboardmoved');
		if ($moved.length === 0 || $moved.filter('.page').length == 0){
			var $this = $(this);
			var $tool = Report.wgtools.find('.add-move');
			$this.addClass('clipboardmoved');
			$tool.removeClass('empty').find('mark').text($moved.length + 1);
		} else {
			$.tipster.notify('Relocate must be empty or not containing pages');
		}
		Report.document.trigger('historyworker:stateadd',['container:clipboardmoved']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('container:active','.container',function(){
		var $this = $(this);
		var $page = $this.closest('.page',Report.document);
		if (!$page.is('.active')) $page.trigger('page:active');
		$this.removeClass('hover');
		Report.document.find('.fieldwrap.active').removeClass('active hover focus').find('[data-edition]').blur();
		Report.document.addClass('has-active');
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
		Report.document.removeClass('has-active');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



	// Edition Events ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('input','[data-edition="dynamic"]',function(){
		var $this = $(this);
		var $edition = $this.data('belongstogroup') ? Report.document.find('[data-belongstogroup="'+$this.data('belongstogroup')+'"]') : $this;
		$edition.attr('data-activecontentchanged','changed');
		$this.addClass('activecontentinputed');
	});
	Report.document.on('blur','[data-edition="dynamic"]',function(){
		var $this = $(this);
		if ($this.hasClass('activecontentinputed')){
			$this.trigger('edition:change');
			$this.removeClass('activecontentinputed')
		}
	});
	Report.document.on('blur','[data-edition].reportSummary',function(){
		Variable.set('reportSummary',tinymce.get(this.id).getContent(), 'html');
	});


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
		$wrap.removeClass('hover active focus');
		Report.document.removeClass('has-active');
		Report.scaler.removeClass('active');
		if ($this.hasClass('keyboarded') || $this.hasClass('contentchanged')){
			var $autofill = $this.find('[data-autofill]');
			if ($this.data('autofill')){
				$autofill = $autofill.add($this);
			}
			$autofill.each(function(){
				var $e = $(this);
				var content = $e.html();
				var $autofill = Report.area.find('[data-autofill="'+$e.data('autofill')+'"]');
				$autofill.each(function(){
					var $af = $(this);
					if ($af.is('.sui-variable')) Variable.set($af.attr('name'),content,'html');
					else $af.html(content);
				});
				if ($e.text()) {
					$wrap.removeClass('empty');
					$autofill.removeClass('empty-content');
				}
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
	/*
	Report.document.on('blur','[data-autofill="sectorName"][contenteditable="true"]',function(){
		var $this = $(this);
		if ($this.data('autofill')){
			Report.area.find('[data-autofill="'+$this.data('autofill')+'"]').html($this.text());
			Report.document.trigger('field:input');
		}
	});
	*/
	Report.document.on('blur','span[contenteditable="true"], [data-autofill][contenteditable="true"]',function(){
		var $source = $(this);
		var $parent = $source.parent();
		var autofill = $source.data('autofill') || $parent.data('autofill');
		if (autofill){
			var $targets, sourcetext;
			if (autofill == 'reportNameFragment') {
				sourcetext = $parent.text();
				$targets = Report.area.find('[data-autofill="reportName"]');
			} else {
				sourcetext = $source.text();
				$targets = Report.area.find('[data-autofill="'+autofill+'"] span, span[data-autofill="'+autofill+'"]');
			}
			var haschange = false;
			$targets.each(function(){
				var $target = $(this);
				if ($target.text() != sourcetext){
					$target.text(sourcetext);
					haschange = true;
				}
			});
			if (haschange) Report.document.trigger('document:change');
		}
	});
	Report.document.on('click','[data-edition]',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $wrap = $this.parent();
		if ($this.is('[data-edition="dynamic"], [data-edition="toc"]')){
			$this.trigger('edition:active');
		} else {
			var $target = $(event.target);
			if (!$target.is('img,.pastedelement td')){
				Report.scaler.removeClass('active');
			}
		}
	});
	/*
	Report.document.on('mousedown','[data-edition]',function(event){
		var $this = $(this);
		if ($this.is('[data-edition="dynamic"], [data-edition="toc"]')){
			$this.trigger('edition:active');
		}
	});
	*/
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
						Report.document.trigger('historyworker:statehold',['edition:resizable']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
						$d.attr('style','');
						Report.document.trigger('historyworker:stateadd',['edition:resizable']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
					start:function(ev, obj){
						Report.document.trigger('historyworker:statehold',['edition:draggable']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
					},
					stop:function(ev, obj){
						var oldposition = $this.attr('data-position');
						$this.attr('data-position','top:'+($target.css('top')||0)+'; left:'+($target.css('left')||0)+'; width:'+$target.width()+'px');
						Report.document.trigger('document:change',[$page]);
						Report.document.trigger('historyworker:stateadd',['edition:draggable']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
			shouldPreventDefault: false,
			revert: true,
			revertIf: function (ev, obj) {
				return !this.activeDropRegions.length || this.activeDropRegions.length == 1;
			},
			start: function (ev, obj) {
				Report.document.trigger('historyworker:statehold',['edition:analystsdrag']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
				obj.$el.addClass('dragger');
				$this.trigger('edition:active');
			},
			stop: function (ev, obj) {
				if (obj.$el.hasClass('dragger')){
					var closest = $.calcSort('y', obj.$el, this.activeDropRegions);
					if (closest.placement) {
						if (closest.placement == 'after') obj.$el.insertAfter(closest.element);
						else if (closest.placement == 'before') obj.$el.insertBefore(closest.element);
						var matrix = obj.matrixToArray(obj.matrixString());
						var x = -1 * matrix[4];
						var y = -1 * matrix[5];
						obj.moveToUsingTransforms(x, y);
						obj.$el.css({ position: 'relative' });
						$this.trigger('edition:change');
						Report.document.trigger('historyworker:stateadd',['edition:analystsdrag']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
					}
					$this.trigger('edition:active');
				}
				obj.$el.removeClass('dragger');
				Report.document.trigger('historyworker:stateclear');/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
		var eid = $this.attr('id');
		if (eid){
			var mce = tinymce.get(eid);
			if (mce) mce.remove();
		}
		$this.removeClass('mce-content-body inited content-placeholder mce-edit-focus');
		$this.removeAttr('id')
		$this.removeAttr('contenteditable');
	});
	Report.document.on('edition:wrapfield','[data-edition]',function(event){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		if (!$fieldwrap.is('.fieldwrap')){
			$this.wrap('<div class="fieldwrap '+$this.data('edition')+($this.data('indexer') ? ' indexed' : '')+($this.data('wide') ? ' wide' : '')+'" '+($this.data('belongstogroup')?'data-boxgroup="'+$this.data('belongstogroup')+'"':'')+' />');
			$fieldwrap = $this.parent();
		} else {
			$fieldwrap.removeClass('focus active selected error');
		}
		if ($this.attr('data-position')){
			$fieldwrap.attr('style',$this.attr('data-position'));
		}
		if (!$this.hasClass('has-resizable')) $this.trigger('edition:resizable');
		if (!$this.hasClass('has-draggable')) $this.trigger('edition:draggable');
	});
	Report.document.on('edition:uploadimgs','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent();
		setTimeout(function(){
			var $imgsBlob = $this.find('img.localsource[src*="blob:"]:not(.uploading)');
			$imgsBlob.each(function(){
				var $img = $(this).addClass('uploading');
				$img.width($img.width());
				$img.height($img.height());
				/////////////////////////////////////////////////
				Figure.base64($img.attr('src'),function(base64){
					Figure.post(base64, null, function(data){
						$img.attr('src',data.src);
						$img.removeClass('error');
						$img.removeClass('uploading');
						$img.removeClass('localsource');
						$img.addClass('uploaded');
						$.tipster.notify('Image uploaded');
						if ($this.find('img.localsource').length === 0) $this.removeClass('ajax-courtain');
						$wrap.removeClass('error');
						Report.document.trigger('document:change');
					},function(){
						$img.addClass('localsource error');
						$.tipster.notify('Image upload not allowed');
						$this.removeClass('ajax-courtain')
						$img.removeClass('uploading');
						$wrap.addClass('error');
					});
				},function(){
					$img.addClass('localsource error');
					$.tipster.notify('Image data not converted');
					$this.removeClass('ajax-courtain');
					$img.removeClass('uploading');
					$wrap.addClass('error');
				});
				/////////////////////////////////////////////////
			});
			var $imgsData = $this.find('img.localsource[src*="data:"]:not(.uploading)');
			$imgsData.each(function(){
				var $img = $(this).addClass('uploading');
				$img.width($img.width());
				$img.height($img.height());
				/////////////////////////////////////////////////
				Figure.post($img.attr('src'), null, function(data){
					$img.attr('src',data.src);
					$img.removeClass('error');
					$img.removeClass('uploading');
					$img.removeClass('localsource');
					$img.addClass('uploaded');
					$.tipster.notify('Image uploaded');
					if ($this.find('img.localsource').length === 0) {
						$this.removeClass('ajax-courtain');
						$wrap.removeClass('error');
						Report.document.trigger('document:change');
					}
				},function(){
					$img.addClass('localsource error');
					$.tipster.notify('Image upload not allowed');
					$this.removeClass('ajax-courtain');
					$img.removeClass('uploading');
					$wrap.addClass('error');
				});
				/////////////////////////////////////////////////
			});
		},100);
	});
	Report.document.on('edition:tablefit','[data-edition]',function(){
		var $this = $(this);
		var $table = $this.find('table.pastedelement');
		var $wrap = $table.parent();
		if ($wrap.is('.tablewrap')){
			if ($table.attr('data-zoom')){
				$table.css({'zoom':$wrap.attr('data-zoom')});
			} else {
				var wt = $table.outerWidth(), we = $wrap.innerWidth(), zoom;
				if (we > wt) {
					zoom = 1;
					$table.css({'min-width':we});
				} else {
					zoom = we/wt;
				}
				$table.css({'zoom':zoom});
			}
			$table.addClass('fitted');
		}
	});
	Report.document.on('edition:contenthash','[data-edition]',function(){
		var $this = $(this);
		var contenthash = $.md5(($this.html()||'').trim());
		$this.attr('data-contenthash',contenthash).data('contenthash',contenthash);
	});
	Report.document.on('edition:change','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page = $this.closest('.page');
		Report.document.trigger('field:input');
		if ($this.is('[data-edition*="text"]')){
			var $boxgroup = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
			$page = $boxgroup.length ? $boxgroup.filter(':eq(0)').closest('.page') : $page;
		}
		Report.document.trigger('document:change',[$page]);
	});
	Report.document.on('edition:nodechange','[data-edition]',function(event,node){
		var $this = $(this);
		var $node = $(node);
		var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
		$toolroot.addClass('adapted');
	});

	Report.document.on('edition:activecontentrefresh','[data-edition]',function(event){
		Report.document.trigger('historyworker:statehold',['edition:activecontentrefresh']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $edit = $(this);
		var $wrap = $edit.parent();
		var $tool = $wrap.find('ul.edition-actions li').addClass('disable');
		var id = $edit.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		$edit = $edit.data('belongstogroup') ? Report.document.find('[data-belongstogroup="'+$edit.data('belongstogroup')+'"]') : $edit;
		$edit.attr('id',id);
		$edit.addClass('ajax-courtain');
		Report.viewtools.disable().addClass('ajax-courtain');
		Network.link({
			id: id,
			sui: Report.widget.data('activecontent'),
			key: Report.view.data('link-key'),
			command: 'contentrefresh',
			json: {
				languageId: Variable.get('languageId'),
				companyId: Variable.get('companyId'),
				boxname: $edit.attr('data-name'),
			},
			ondone: function(){
				$edit.removeClass('ajax-courtain');
				$tool.removeClass('disable');
				Report.viewtools.enable().removeClass('ajax-courtain');
				Report.document.trigger('historyworker:stateadd',['edition:activecontentrefresh']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
			},
			onfail: function(){
				$edit.removeClass('ajax-courtain');
				$tool.removeClass('disable');
				Report.viewtools.enable().removeClass('ajax-courtain');
				Report.document.trigger('historyworker:stateclear');/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
			},
			oncancel: function(){
				$edit.removeClass('ajax-courtain');
				$tool.removeClass('disable');
				Report.viewtools.enable().removeClass('ajax-courtain');
				Report.document.trigger('historyworker:stateclear');/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
			}
		});
	});
	Report.document.on('edition:remove','[data-edition]',function(event){
		Report.document.trigger('historyworker:statehold',['edition:remove']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page, $reference;
		var editiontype = $this.data('edition');
		var $preved = (editiontype === 'dynamic' || editiontype === 'figure') ? $fieldwrap.prev('.fieldwrap').children('[data-edition]') : '';
		var $nexted = (editiontype === 'dynamic' || editiontype === 'figure') ? $fieldwrap.next('.fieldwrap').children('[data-edition]') : '';
		if ($fieldwrap.is('.dynamic[data-boxgroup]')){
			Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] [data-edition]').each(function(ke, e){
				var $e = $(e);
				if (!$reference) $reference = $e.parent().prev();
				$page = $page ? $page : $e.closest('.page');
				$e.parent().remove();
			});
		} else {
			$reference = $fieldwrap.prev();
			$page = $this.closest('.page');
			$fieldwrap.remove();
		}
		if ($preved.length && $nexted.length && $preved.data('edition') === $nexted.data('edition') && $preved.data('name') === $nexted.data('name')){
			$preved.trigger('edition:join',[$nexted]);
		}
		if (!Report.document.hasClass('preventeventchange')){
			Report.document.trigger('document:change',[$page]);
			$.tipster.notify('Edition box removed');
		}
		Report.document.trigger('document:boxcount');
		Report.document.trigger('historyworker:stateadd',['edition:remove']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('edition:clipboardmoved','[data-edition]',function(){
		Report.document.trigger('historyworker:statehold',['edition:clipboardmoved']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $moved = Report.document.find('.clipboardmoved');
		if ($moved.length === 0 || $moved.filter('.page').length == 0){
			var $this = $(this);
			var $fieldwrap = $this.parent();
			var $tool = Report.wgtools.find('.add-move');
			if ($fieldwrap.is('.dynamic[data-boxgroup]')){
				$fieldwrap = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
			}
			$fieldwrap.toggleClass('clipboardmoved');
			$tool.removeClass('empty').find('mark').text($moved.length + 1);
		} else {
			$.tipster.notify('Relocate must be empty or not containing pages');
		}
		Report.document.trigger('historyworker:stateadd',['edition:clipboardmoved']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('edition:split','[data-edition]',function(event,y){
		Report.document.trigger('historyworker:statehold',['edition:split']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var boxgroup = $this.attr('data-belongstogroup');
		var zoom = $.toNumber(Report.document.attr('data-zoom') || 1);
		$this.removeAttr('data-belongstogroup').removeData('belongstogroup');
		$fieldwrap.removeAttr('data-boxgroup').removeData('boxgroup');
		var $clone = $this.clone();
		var $page = $this.closest('.page');
		var boxPos = $this.offset();
		$clone.html('');
		$this.children().each(function(){
			var $el = $(this);
			let elPos = $el.position();
			if ((boxPos.top + elPos.top + $el.outerHeight(true)) * zoom > y * zoom){
				let $econ = $el.contents();
				$el.html('');
				let $cl = $el.clone();
				$.each($econ, function(ie, ve) {
					if (this.nodeType == 3){
						let $wwab;
						let words = this.nodeValue.split(' ');
						$.each(words,function(iw,vw){
							$wwab = $('<span class="wordwrap-split">').text(vw+' ');
							$el.append($wwab);
						});
					} else {
						$el.append(ve);
					}
				});
				$el.children().each(function(){
					let $sp = $(this);
					let spPos = $sp.position();
					if ((boxPos.top + elPos.top + spPos.top + $sp.outerHeight(true)) * zoom > y * zoom){
						$cl.append($sp.nextAll().addBack());
						return false;
					}
				});
				$cl.find('.wordwrap-split').contents().unwrap();
				$cl.get(0).normalize();
				if (!$cl.is(':empty')) $clone.append($cl);

				$el.find('.wordwrap-split').contents().unwrap();
				$el.get(0).normalize();
				$clone.append($el.nextAll());

				var $clonewrap = $('<div class="'+$fieldwrap.attr('class').replace(/pep-dpa|pep-dropping/g,'')+' active xxxxxxxx" />').append($clone);

				$page.trigger('page:addedition',[$clonewrap,$fieldwrap,'after']);

				if (boxgroup){
					$clonewrap.nextAll('[data-belongstogroup="'+boxgroup+'"]').removeAttr('data-belongstogroup').removeData('belongstogroup').parent().removeAttr('data-boxgroup').removeData('boxgroup');
					$page.nextAll('.page').find('[data-belongstogroup="'+boxgroup+'"]').removeAttr('data-belongstogroup').removeData('belongstogroup').parent().removeAttr('data-boxgroup').removeData('boxgroup');
				}
				return false;
			}
		});
		Report.document.trigger('historyworker:stateadd',['edition:split']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('edition:join','[data-edition]',function(event,$next){
		Report.document.trigger('historyworker:statehold',['edition:join']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $this = $(this);
		$this.append($next.children());
		$next.trigger('edition:remove');
		Report.document.trigger('historyworker:stateadd',['edition:join']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('edition:active','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		if ($fieldwrap.is('.active')) return;
		var $page = $this.closest('.page',Report.document);
		$page.trigger('page:active');
		$fieldwrap.removeClass('hover');
		$fieldwrap.closest('.col').removeClass('selected');
		Report.document.find('.fieldwrap.active').removeClass('active');
		Report.document.addClass('has-active');
		$fieldwrap.addClass('active');
		$this.trigger('edition:tools');
		Report.tinymceinlinetoolbar.css({
			'left':Report.viewtools.offset().left + Report.viewtools.width() + 15
		});
	});
	Report.document.on('click','[data-edition] span.counter',function(event){
		var $this = $(this);
		var $field = $this.closest('[data-edition]');
		var $page = $field.closest('.page');
		var indexlabel = ($field.attr('data-indexlabel')+'').toLowerCase();
		if (indexlabel == 'figure') $field.attr('data-indexlabel','chart');
		else if (indexlabel == 'chart') $field.attr('data-indexlabel','image');
		else if (indexlabel == 'image') $field.attr('data-indexlabel','table');
		else if (indexlabel == 'table') $field.attr('data-indexlabel','figure');
		Report.document.trigger('document:boxcount');
	});
	Report.document.on('mousedown','[data-edition] img',function(event){
		var $this = $(this);
		$this.closest('[data-edition]').trigger('edition:active');
		event.preventDefault();
	});
	Report.document.on('mouseup','[data-edition] img, [data-edition] .tablewrap',function(event){
		var $this = $(this);
		Report.scaler.addClass('active');
		$this.closest('[data-edition]').trigger('edition:elementscaler', [$this]);
	});
	Report.document.on('click','[data-edition] img, [data-edition] table',function(event){
		Report.scaler.addClass('active');
	});

	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------






	// Page Events ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('page:addcontainer','.page',function(event,$new,$ref,placement,y){
		Report.document.trigger('historyworker:statehold',['page:addcontainer']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
			} else if (placement == 'split'){
				var boxPos = $ref.offset();
				var zoom = $.toNumber(Report.document.attr('data-zoom') || 1);
				if (boxPos.top + (24 * zoom) > y) $new.insertBefore($ref);
				else if (boxPos.top + $ref.outerHeight(true) - (24 * zoom) < y) $new.insertAfter($ref);
				else if ($ref.is('.fieldwrap, [data-edition]')){
					var $refed = ($ref.is('.fieldwrap')) ? $ref.children('[data-edition]') : $ref;
					$refed.trigger('edition:split',[y]);
					$refed.parent().after($new);
				} else {
					$new.insertAfter($ref);
				}
			}
		} else {
			$page.find('.main .cell:eq(0)').append($new);
		}
		$new.trigger('container:resizable');
		Report.document.trigger('document:change',[$page]);
		Report.document.trigger('historyworker:stateadd',['page:addcontainer']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('page:addedition','.page',function(event,$new,$ref,placement,y,nomceinit){
		Report.document.trigger('historyworker:statehold',['page:addedition']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $page = $(this);
		var $edit = $new.children('[data-edition]');
		$edit.removeAttr('id');
		if ($ref && $ref.length){
			if ($ref.hasClass('content')){
				var $stack = $ref.children('.boxstack');
				$ref = $stack.length ? $stack : $ref;
			}
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
			} else if (placement == 'split'){
				var boxPos = $ref.offset();
				var zoom = $.toNumber(Report.document.attr('data-zoom') || 1);
				if (boxPos.top + (24 * zoom) > y) $new.insertBefore($ref);
				else if (boxPos.top + $ref.outerHeight(true) - (24 * zoom) < y) $new.insertAfter($ref);
				else if ($ref.is('.fieldwrap, [data-edition]')){
					var $refed = ($ref.is('.fieldwrap')) ? $ref.children('[data-edition]') : $ref;
					$refed.trigger('edition:split',[y]);
					$refed.parent().after($new);
				} else {
					$new.insertAfter($ref);
				}
			}
			if ($ref.is('.wide')) $new.addClass('wide');
		} else {
			$page.find('.main .cell:eq(0)').append($new);
		}
		$edit.trigger('edition:cleanmce');
		if (!nomceinit){
			$edit.trigger('edition:init');
		}
		Report.document.trigger('document:change',[$page]);
		Report.document.trigger('historyworker:stateadd',['page:addedition',500]);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('page:remove','.page',function(){
		Report.document.trigger('historyworker:statehold',['page:remove']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
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
		Report.document.trigger('historyworker:stateadd',['page:remove']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('page:scrollto','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		$(Report.document.closest('.scroll-default')).scrollTo($page,350,{ offset:{top:-50} });
	});
	Report.document.on('page:active','.page',function(event){
		var $this = $(this);
		Report.document.trigger('page:unactive');
		$this.addClass('active');
		$this.trigger('page:tools');
		var $thumb = Report.pagelist.find('#'+$this.attr('data-thumbid'));
		if ($thumb.length) {
			Report.pagelist.find('.selected').removeClass('selected');
			$thumb.addClass('selected');
			Report.pagelist.scrollTo($thumb,{ offset:{top:-15} });
		}
	});
	Report.document.on('page:unactive',function(){
		Report.document.find('.page.active, .fieldwrap.active, .container.active, .col.selected').removeClass('active selected');
		Report.document.find('[data-mce-selected]').removeAttr('data-mce-selected');
		Report.document.removeClass('has-active');
	});
	Report.document.on('page:thumbnail','.page',function(event){
		var $page = $(this);
		if ($page.hasClass('thumbing')){
			var $pagethumb = Report.pagelist.find('#'+$page.attr('data-thumbid'));
			//////////////////////////////////
			setTimeout(function(){Thumbnail.parse($page,$pagethumb);},1234);
			//////////////////////////////////
			$page.removeClass('thumbing');
		}
	});
	Report.document.on('page:clipboardmoved','.page',function(){
		var $moved = Report.document.find('.clipboardmoved');
		if ($moved.length === 0 || $moved.filter('.page').length > 0){
			var $this = $(this);
			var $tool = Report.wgtools.find('.add-move');
			$this.addClass('clipboardmoved');
			$tool.removeClass('empty').find('mark').text($moved.length + 1);
		} else {
			$.tipster.notify('Relocate must be empty or containing pages');
		}
	});

	Report.document.on('page:addbreaker','.page',function(event){
		Report.document.trigger('historyworker:statehold',['page:addbreaker']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $page = $(this);
		$page.addClass('breaker-before').attr('data-breaker','breaker-before');
		Report.document.trigger('historyworker:stateadd',['page:addbreaker']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('page:delbreaker','.page',function(event){
		Report.document.trigger('historyworker:statehold',['page:delbreaker']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		var $page = $(this);
		$page.removeClass('breaker-before breaker-undeletable').removeAttr('data-breaker');
		Report.document.trigger('historyworker:stateadd',['page:delbreaker']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
	});
	Report.document.on('click','.page > .breakermark > .delete',function(event){
		event.preventDefault();
		event.stopPropagation();
		var $page = $(this).closest('.page');
		$page.trigger('page:delbreaker');
		$.tipster.notify('Session breaker was removed');
	});
	Report.document.on('click','.page',function(event){
		event.stopPropagation();
		var $this = $(this);
		$this.trigger('page:active');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




	// Document Events --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('document:change',function(event,$page){
		//Report.document.trigger('document:reducedfit');
		/////////////////////////////////////////////////////////////////
		if (Report.document.hasClass('preventeventchange')) return false;
		/////////////////////////////////////////////////////////////////
		Report.document.find('[data-edition="toc"]:eq(0)').trigger('edition:buildtoc');
		if ($page) boxFitter.normalizeBoxes($page);
		Report.document.trigger('document:validate');
		Report.widget.trigger('field:input');
		Report.document.trigger('document:pagelist');
		setTimeout(function(){ Report.document.trigger('document:disclaimerrefpage'); },350);
	});
	Report.document.on('document:disclaimerrefpage',function(event){
		var $page = Report.document.find('.block.global-disclaimer:eq(0)').closest('.page');
		var pgnum = $page.find('.footer .right i').text();
		Report.document.find('.disclaimer-ref-page').each(function(){
			var $this = $(this);
			$this.text(pgnum);
		});
	});
	Report.document.on('document:boxcount',function(event){
		var idx = {};
		var lang = Variable.get('languageId');
		var types = Report.figuretypes;
		Report.document.find('[data-edition="figure"]').each(function(){
			var $this = $(this);
			var $h4 = $this.find('h4');
			if ($h4.length){
				var label = $this.attr('data-indexlabel') || 'figure';
				$this.attr('data-indexlabel',label);
				idx[label] = idx[label] ? idx[label]+1 : 1;
				var $counter = $h4.find('.counter');
				var litlabel = (types[label] ? (types[label][lang] || types[label]['1']) : label);
				$this.attr('data-count',idx[label]);
				$counter.html(litlabel+' '+idx[label]+':');
			}
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
		if (!Report.document.hasClass('loaded')){
			Report.document.addClass('loaded');
			Report.document.trigger('document:validate');
			//Report.document.trigger('document:reducedfit');
			setTimeout(function(){
				Report.document.trigger('document:pagelist',['forceChange']);
				Report.document.trigger('document:disclaimerrefpage');
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
	Report.document.on('document:reducedfit',function(){
		/*
		var $frontpages = Report.document.find('.block.front-pages');
		var $fieldwrap = $frontpages.parent();
		if ($fieldwrap.length){
			var boxh = $fieldwrap.outerHeight(true);
			var $content = $fieldwrap.closest('.content');
			$content.css('height','100%');
			$content.height($content.height() - boxh);
			setTimeout(function(){
				$fieldwrap.css({
					'position':'absolute',
					'bottom':-(boxh+8)
				});
			},10);
			var $lastbox = $content.find('.fieldwrap:not(.dynamic):last');
			var lasboxh = $lastbox.position().top + $lastbox.height();
			$frontpages.attr('data-margintop',($content.height() + 16) - lasboxh );
		}
		*/
	});
	Report.document.on('document:addpage',function(event,$new,$ref,placement){
		Report.document.trigger('historyworker:statehold',['document:addpage']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
		$new.find('.page-actions').remove();
		var didBoxBroken, $pageChange, $lastBoxgroupOnPrevPage, $firstBoxgroupOnNextPage, tipsterMsg;
		$new.removeAttr('id').css('opacity','0');
		if ($ref){
			$lastBoxgroupOnPrevPage = (placement == 'after') ? $ref.find('.content .fieldwrap[data-boxgroup]').last() : $ref.prev('.page').find('.content .fieldwrap[data-boxgroup]').last();
			$firstBoxgroupOnNextPage = (placement == 'after') ? $ref.next('.page').find('.content .fieldwrap[data-boxgroup]').first() : $ref.find('.content .fieldwrap[data-boxgroup]').first();
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
				if ($ref.attr('data-breaker')){
					$new.attr('class', $new.attr('class') + ' ' + $ref.attr('data-breaker'));
					$ref.removeClass('breaker-before breaker-undeletable').removeAttr('data-breaker');
				}
			} else {
				Report.document.append($new);
			}
		} else {
			Report.document.append($new);
			tipsterMsg = 'Page added at the end';
		}
		if ($lastBoxgroupOnPrevPage && $lastBoxgroupOnPrevPage.length && $lastBoxgroupOnPrevPage.attr('data-boxgroup') === $firstBoxgroupOnNextPage.attr('data-boxgroup')){
			boxFitter.joinBox(Report.document.find('.fieldwrap[data-boxgroup="'+$lastBoxgroupOnPrevPage.attr('data-boxgroup')+'"]'));
			$pageChange = (placement == 'after') ? $ref : $new.prev('.page');
			didBoxBroken = true;
		} else {
			$pageChange = $new;
		}
		$new.find('[data-edition]').trigger('edition:cleanmce');
		$new.trigger('edition:init');
		//Report.document.trigger('document:change',[$pageChange]);
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
				if (tipsterMsg) $.tipster.notify(tipsterMsg);
				Report.document.trigger('historyworker:stateadd',['document:addpage']);/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
			}
		});
	});
	Report.document.on('document:numpage',function(event){
		var $pages = Report.document.children('.page:visible');
		$pages.each(function(){
			var $page = $(this);
			var pgindex = $pages.index($page) + 1;
			$page.find('[data-pagenumber] i').text(pgindex);
			$page.find('.page-actions li.label').text('Page '+pgindex);
			$page.attr('data-pagenumber', pgindex).data('pagenumber',pgindex);
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
	Report.document.on('document:clipboardclean',function(){
		var $moved = Report.document.find('.clipboardmoved');
		if ($moved.length > 0){
			$moved.removeClass('clipboardmoved');
			Report.wgtools.find('.add-move').addClass('empty').find('mark').text('0');
			$.tipster.notify('Relocate is clean');
		} else {
			$.tipster.notify('Relocate is already empty');
		}
	});
	Report.document.on('click',function(event){
		Report.document.trigger('page:unactive');
		Report.document.trigger('container:unactive');
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	// History Events ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	Report.document.on('historyworker:stateclear',function(event){
		Report.document.removeData('historystateholdcontent');
		___cnsl.yellow('historyworker:stateclear');
	});
	Report.document.on('historyworker:statehold',function(event, origin){
		var holdcontent = Report.document.data('historystateholdcontent');
		if (Report.document.is('.preventhistorystack, .preventeventchange') || holdcontent) return false;
		Report.document.data('historystateholdcontent', {origin:origin, state:Report.pagesState()});
		___cnsl.log('historyworker:statehold',origin);
	});
	Report.document.on('historyworker:stateadd',function(event, origin, timeout){
		var holdcontent = Report.document.data('historystateholdcontent') || {};
		if (Report.document.is('.preventhistorystack, .preventeventchange') || holdcontent.origin !== origin) return false;
		var content = {
			stateold: holdcontent.state,
			statenew: Report.pagesState()
		};
		setTimeout(function(){
			historyWorker.postMessage({
				command:'add',
				dochash:Variable.get('docHash'),
				content:content,
				scroll:Report.scroll.scrollTop()
			});
			Report.document.removeData('historystateholdcontent');
			___cnsl.green('historyworker:stateadd',origin);
		},timeout||10);
	});
	/*
	Report.document.on('historyworker:add',function(event){
		if (Report.document.hasClass('preventhistorystack')) return false;
		var content = Report.documentHTML();
		var latest = Report.document.data('historylatestaddition');
		if (content != latest){
			historyWorker.postMessage({
				command:'add',
				dochash:Variable.get('docHash'),
				content:content,
				scroll:Report.scroll.scrollTop()
			});
			Report.document.data('historystateholdcontent','');
			Report.document.data('historylatestaddition',content);
		}
		console.trace('historyworker:add', content != latest);
	});
	*/
	Report.document.on('historyworker:back',function(event){
		historyWorker.postMessage({
			command:'back',
			dochash:Variable.get('docHash')
		});
	});
	Report.document.on('historyworker:forward',function(event){
		historyWorker.postMessage({
			command:'forward',
			dochash:Variable.get('docHash')
		});
	});
	Report.document.on('historyworker:clear',function(event,data){
		historyWorker.postMessage({
			command:'clear',
			dochash:Variable.get('docHash')
		});
		Report.document.removeData('historystateholdcontent');
		___cnsl.yellow('historyworker:clear');
	});
	/*
	Report.document.on('historyworker:redraw',function(event,data){
		if (data.content){
			Report.document.find('[data-edition]').trigger('edition:cleanmce');
			Report.document.html(data.content);
			Report.document.find('[data-edition]').trigger('edition:cleanmce');
			Report.document.trigger('edition:init',[true]);
			Report.document = Report.widget.find('.sui-report-document');
			Report.editors = Report.document.find('[data-edition*="text"],[data-edition*="figure"]');
		}
	});
	*/
	Report.document.on('historyworker:redraw',function(event,refstate){
		if (refstate){
			var curstate = Report.pagesState();
			$.each(curstate, function(k,v){
				if (!refstate[k]){
					$('#'+k).trigger('page:remove');
				};
			});
			var lastid;
			$.each(refstate, function(k,v){
				if (curstate[k]){
					var $page = $('#'+k);
					if (refstate[k].hash !== curstate[k].hash){
						var $content = $(refstate[k].html);
						$content.find('.caret-autobreak').remove();
						$page.html($content.html());
						var $edit = $page.find('[data-edition]');
						$edit.trigger('edition:cleanmce');
						$edit.trigger('edition:init');
						Report.document.trigger('document:boxcount');
						$edit.trigger('edition:resizable');
						$page.find('.block.logo, .block.info, .block.reportName').trigger('edition:draggable');
						$page.find('.block.analysts').trigger('edition:analystsdrag');
					}
				} else {
					Report.document.trigger('document:addpage', [$(v.html), $('#'+lastid),'after']);
				}
				lastid = k;
			});
		}
	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	// MCE Setup --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	//let allowedRegEX = /[^\x00-\xFF€]/g;
	let allowedRegEX = false;
	var mceSetup = {
		menubar: false,
		inline: true,
		object_resizing : false,
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
		powerpaste_keep_unsupported_src: true,
		browser_spellcheck: true,
		relative_urls : false,
		remove_script_host : false,
		textcolor_map: [
			"FCFCFC", "Snow White",
			"D2D2D2", "Silver",
			"BFBFBF", "Gray",
			"7F7F7F", "Shadow",
			"404040", "Dark Gray",
			"3F3F3F", "Cloudy",
			"181818", "Night",
			"000000", "Black",

			"F55F73", "Lite Red",
			"D22D4B", "Red",
			"8C0019", "Blood",
			"600112", "Wine",
			"96371E", "Dark Orange",
			"F0642D", "Orange",
			"f09c2d", "Dark Yellow",
			"C6922D", "Yellow",

			"00965E", "Lite Green",
			"006848", "Green",
			"021748", "Blue 1",
			"213767", "Blue 2",
			"415787", "Blue 3",
			"27528C", "Blue 4",
			"0D4CA2", "Blue 5",
			"08336C", "Blue 6",

			"0D4CA2", "Blue 12",
			"1B5CB2", "Blue 13",
			"2A6CC2", "Blue 14",
			"3A7BD2", "Blue 15",
			"4A8BE2", "Blue 16",
			"73ACE4", "Blue 17",
			"86B2EB", "Blue 18",
			"A1C8ED", "Blue 19",

			"061145", "Blue 22",
			"091A67", "Blue 23",
			"182977", "Blue 24",
			"6570A4", "Blue 25",
			"b25be1", "Lite Pink",
			"d053af", "Pink",
			"874ba7", "Purple",
		],
		paste_preprocess : function(pl, o) {
			o.content = allowedRegEX ? o.content.replace(allowedRegEX, "") : o.content;
		},
		setup: function (editor) {
			var $ed = $(editor.getElement());
			var $page = $ed.closest('.page');
			/*
			editor.on('BeforeAddUndo', function(e) {
				return false;
			});
			*/
			editor.on('init', function (e) {
				$ed.addClass('inited');
			});
			editor.on('focus', function(e){
				$ed.removeClass('contentchanged');
				$ed.attr('contenteditable',true);
			});
			editor.on('click', function (e) {
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('mousedown', function (e) {
				$ed.attr('contenteditable',true);
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('input', function (e) {
				$ed.addClass('contentchanged');
			});
			editor.on('undo', function (e) {
				$.tipster.notify('Undo edition');
			});
			editor.on('redo', function (e) {
				$.tipster.notify('Redo edition');
			});
			editor.on('blur', function (e) {
				editor.undoManager.clear();
				if ($ed.hasClass('contentchanged')){
					var contenthash = $ed.attr('data-contenthash');
					$ed.trigger('edition:contenthash');
					if (contenthash !== $ed.attr('data-contenthash')){
						$ed.trigger('edition:change');
						$ed.removeClass('contentchanged');
						$ed.attr('contenteditable',false);
						Report.document.trigger('historyworker:clear');/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
					}
				}
			});
		}
	};
	var mceSetupText = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="text"]:not(.inited)',
		forced_root_block : false,
		toolbar: 'undo redo | forecolor | bold italic underline | removeformat',
		valid_elements: 'p,strong[style],em,span[style],a[href],br',
		valid_styles: {
			'*': 'color,text-decoration,text-align'
		},
	});
	var mceSetupPlaintext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="plaintext"]:not(.inited)',
		forced_root_block : false,
		toolbar: 'undo redo | removeformat',
		valid_elements: 'span[style],br',
		valid_styles: {
			'*': 'color'
		},
	});
	var mceSetupTinytext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="tinytext"]:not(.inited)',
		forced_root_block : 'p',
		toolbar: 'undo redo | removeformat | bold italic underline | forecolor | alignleft aligncenter alignjustify alignright',
		valid_elements: 'p[style],h1[style|class],h2[style|class],h3[style|class],h4[style|class],strong[style]/b[style],em,span[style|class],a[href],br',
		valid_styles: {
			'*': 'color,text-decoration,text-align,font-style'
		},
	});
	var mceSetupRichtext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="richtext"]:not(.inited)',
		placeholder:'Enter formatted text here...',
		forced_root_block : 'p',
		object_resizing : false,
		table_appearance_options: false,
		imagetools_toolbar: 'none',
		paste_data_images: false,
		toolbar: [
			'removeformat | bold italic underline | styleselect | fontsizeselect forecolor backcolor cellcolor | alignleft aligncenter alignjustify alignright | numlist bullist outdent indent | link | table | editimage imageoptions '
		],
		automatic_uploads: false,
		file_picker_types: 'image',
		powerpaste_allow_local_images: true,
		table_toolbar: '',
		table_resize_bars: false,
		valid_elements: 'p[style|class],h1[style|class],h2[style|class],h3[style|class],h4[style|class],h5[style|class],figure[style|class],img[style|src|class],table[style|border|cellpadding|cellspacing|class],colgroup[style],col[style,span],tbody,thead,tfoot,tr[style|height],th[style|colspan|rowspan|align],td[style|colspan|rowspan|align],a[href|target],strong[style],b[style],ul[style],ol[style],li[style],span[style|class],em,br,mark,bookmark[content|level]',
		valid_styles: {
			'h1': 'font-size,font-family,color,text-decoration,text-align',
			'h2': 'font-size,font-family,color,text-decoration,text-align',
			'h3': 'font-size,font-family,color,text-decoration,text-align',
			'h4': 'font-size,font-family,color,text-decoration,text-align',
			'h5': 'font-size,font-family,color,text-decoration,text-align',
			'p': 'font-size,font-family,color,text-decoration,text-align',
			'figure': 'width',
			'table': 'zoom,border,border-colapse,border-color,border-style,background-color,background,color,width,height,cellpadding,cellspacing',
			'tr': 'style,background-color,background,height',
			'th': 'rowspan,colspan,height,width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,white-space',
			'td': 'rowspan,colspan,height,width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,white-space',
			'img': 'zoom,width',
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
			var $content = $('<div>'+(allowedRegEX ? o.content.replace(allowedRegEX, "") : o.content)+'</div>');
			var $imgtable = $content.children('img,table');
			var $imglocal = $imgtable.filter('img[src*="blob:"],img[src*="data:"]');
			var $tablocal = $imgtable.filter('table').addClass('nedt');
			$imgtable.addClass('pastedelement');
			$imglocal.addClass('localsource');
			$tablocal = $tablocal.wrap('<figure class="tablewrap"/>');
			$content.find('h1,h2,h3,h4,h5,p,strong,span').css({'font-size':'', 'font-family':'', 'text-decoration':'', 'text-align':''});
			o.content = $content.html();
			if ($imglocal.length){
				var $target = $(o.target.selection.getNode());
				var $field = $target.closest('[data-edition]');
				$field.addClass('ajax-courtain');
			}
		},
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
							var $p = $('<div class="figurespot yedt" contenteditable="true" />');
							$p.append(img);
							var $target = $(editor.selection.getNode());
							var $field = $target.closest('[data-edition]');
							if (!$target.is('p,.figurespot')) $target = $target.closest('p,.figurespot',$field);
							if (!$target.is('p,.figurespot')) $target = $field.find('.figurespot, p:eq(0)');
							if (!$target.is('p,.figurespot')){
								if ($field.children('header,h1,h2,h3,h4').length) $field.children('h1,h2,h3,h4').after($p);
								else if ($field.children('h5').length) $field.children('h5').before($p);
								$field.append($p);
							} else {
								if (!$target.find('img').length) $target.replaceWith($p);
								else $target.append($p.html()).addClass('figurespot');
							}
						};
						reader.readAsDataURL(file);
					};
					input.click();
				}
			});
			var $ed = $(editor.getElement());
			var $page = $ed.closest('.page');
			var isEditorBoxstack = $ed.closest('.boxstack').length ? true : false;
			/*
			editor.on('BeforeAddUndo', function(e) {
				return false;
			});
			*/
			editor.on('init', function (e) {
				$ed.addClass('inited');
				$ed.trigger('edition:tablefit');
			});
			editor.on('focus', function(e){
				$ed.removeClass('contentchanged');
				$ed.attr('contenteditable',true);
			});
			editor.on('click', function (e) {
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('mousedown', function (e) {
				$ed.attr('contenteditable',true);
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('undo', function (e) {
				$.tipster.notify('Undo edition');
			});
			editor.on('redo', function (e) {
				$.tipster.notify('Redo edition');
			});
			editor.on('keyup', function (e) {
				if (e.ctrlKey || e.shiftKey){
					if (e.key == 'Delete' && caret.isAtEnd($ed) && !caret.hasSelection($ed)){
						if (isEditorBoxstack || !editor.getContent()) { $.tipster.notify('Unable joining bullets'); return false; }
						Report.document.addClass('preventeventchange');
						caret.save($ed,'end');
						boxFitter.normalizeBoxes(boxFitter.groupNext($ed));
						caret.focus();
						e.preventDefault();
						Report.document.removeClass('preventeventchange');
						editor.undoManager.clear();
					} else if (e.key == 'Backspace' && caret.isAtBegining($ed) && !caret.hasSelection($ed)){
						if (isEditorBoxstack || !editor.getContent()) { $.tipster.notify('Unable joining bullets'); return false; }
						Report.document.addClass('preventeventchange');
						caret.save($ed,'begining');
						boxFitter.normalizeBoxes(boxFitter.groupPrev($ed));
						caret.focus();
						e.preventDefault();
						Report.document.removeClass('preventeventchange');
						editor.undoManager.clear();
					}
				} else if (e.key == 'Escape'){
					//caret.save($ed);
					Report.document.trigger('page:unactive');
					boxFitter.normalizeBoxes($ed.parent());
					//caret.focus($ed);
				} else if (e.key != 'Control' && e.key != 'Shift' && e.key != 'Alt') {
					$ed.addClass('contentchanged');
					$ed.addClass('keyboarded');
					if (caret.isOverflew($ed)){
						Report.document.addClass('preventeventchange');
						caret.save($ed);
						boxFitter.flowText($ed);
						caret.focus();
						Report.document.removeClass('preventeventchange');
					}
				}
			});
			editor.on('paste', function (e) {
				$ed.addClass('contentchanged');
				$ed.trigger('edition:uploadimgs');
				$ed.trigger('edition:tablefit');
			});
			editor.on('change', function (e) {
				$ed.addClass('contentchanged');
				$ed.trigger('edition:uploadimgs');
				$ed.trigger('edition:tablefit');
			});
			editor.on('blur', function (e) {
				caret.cleanup($ed);
				editor.undoManager.clear();
				if ($ed.hasClass('contentchanged') && !Report.document.hasClass('preventeventchange')){
					if (editor.getContent() == '') editor.setContent('<p></p>');
					var contenthash = $ed.attr('data-contenthash');
					$ed.trigger('edition:contenthash');
					if (contenthash !== $ed.attr('data-contenthash')){
						$ed.trigger('edition:change');
						$ed.removeClass('contentchanged');
						$ed.attr('contenteditable',false);
						caret.cleanup($ed);
						Report.document.trigger('historyworker:clear');/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
					}
				}
			});
			editor.on('NodeChange', function(e) {
				var $elem = e.element ? $(e.element) : $();
				var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
				if ($elem.is('img')){
					$toolroot.find('[aria-label="Edit image"], [aria-label="Image options"]').show();
				} else {
					$toolroot.find('[aria-label="Edit image"], [aria-label="Image options"]').hide();
				}
			});
		}
	});
	var mceSetupFigure = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="figure"]:not(.inited)',
		placeholder:'Paste images, pictures and glyphs here...',
		forced_root_block : 'p',
		object_resizing : false,
		table_appearance_options: false,
		imagetools_toolbar: 'none',
		paste_data_images: true,
		toolbar: 'undo redo | forecolor | bold italic underline | removeformat | link | table ',
		automatic_uploads: false,
		file_picker_types: 'image',
		powerpaste_allow_local_images: true,
		table_toolbar: '',
		table_resize_bars: false,
		valid_elements: 'div[class],p[class],h4[class],h5[class],figure[style|class],img[style|src|class],table[style|border|cellpadding|cellspacing|class],colgroup[style],col[style,span],tbody,thead,tfoot,tr[style|height],th[style|colspan|rowspan|align],td[style|colspan|rowspan|align],a[href|target],strong[style|class],b[style|class],span[style|class],em,br,mark[class]',
		valid_styles: {
			'figure': 'width',
			'table': 'zoom,border,border-colapse,border-color,border-style,background-color,background,color,width,height,cellpadding,cellspacing',
			'tr': 'style,background-color,background,height',
			'th': 'rowspan,colspan,height,width,min-width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,border-width,border-style,white-space',
			'td': 'rowspan,colspan,height,width,min-width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,border-width,border-style,white-space',
			'img': 'zoom,width',
			'strong': 'font-size,font-family,color,text-decoration,text-align,background-color',
			'span': 'font-size,font-family,color,text-decoration,text-align,background-color',
		},
		paste_preprocess : function(pl, o) {
			var $target = $(o.target.selection.getNode());
			var $field = $target.closest('[data-edition]');
			var haspot = $target.is('.figurespot') || $target.closest('.figurespot',$field).length;
			var hash = $target.is('h3,h5') || $target.closest('h3,h5',$field).length;
			var $content = $('<div>'+(allowedRegEX ? o.content.replace(allowedRegEX, "") : o.content)+'</div>');
			var $td = $content.find('td[style*="border:none"], td[style*="border: none"]');
			if ($td.length) $td.css('border','');
			var $imgtable = $content.children('img,table');
			var $imglocal = $imgtable.filter('img[src*="blob:"],img[src*="data:"]');
			var $tablocal = $imgtable.filter('table').addClass('nedt');
			$tablocal = $tablocal.wrap('<figure class="tablewrap"/>');
			$imglocal.addClass('localsource');
			if ($imgtable.length){
				if (haspot){
					var $p = $target.is('.figurespot') ? $target : $target.closest('.figurespot',$field);
					$p.find(':not(img):not(.tablewrap),.tablewrap:empty').remove();
					$p.contents().filter(function(){ return this.nodeType == 3; }).remove(); //delete text
					$imgtable.addClass('pastedelement')
					$imglocal.removeAttr('width').removeAttr('height');
					o.content = $content.html();
				} else {
					$.tipster.notify('Paste only into the spot');
					o.content = hash ? '' : '<p></p>';
				}
				if ($imglocal.length){
					$field.addClass('ajax-courtain');
				}
			} else {
				o.content = $content.html();
			}
			o.content.replace('windowtext', 'black');
		},
		setup: function (editor) {
			var $ed = $(editor.getElement());
			var $page = $ed.closest('.page');
			/*
			editor.on('BeforeAddUndo', function(e) {
				return false;
			});
			*/
			editor.on('init', function (e) {
				$ed.addClass('inited');
				$ed.trigger('edition:tablefit');
			});
			editor.on('focus', function(e){
				$ed.attr('contenteditable',true);
			});
			editor.on('mousedown', function (e) {
				$ed.attr('contenteditable',true);
			});
			editor.on('click', function (e) {
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('input', function (e) {
				$ed.addClass('contentchanged');
			});
			editor.on('undo', function (e) {
				$.tipster.notify('Undo edition');
			});
			editor.on('redo', function (e) {
				$.tipster.notify('Redo edition');
			});
			editor.on('keydown', function (e) {
				if (e.key == 'Enter'){
					var $caret = caret.save($ed,'begining');
					if ($caret.closest('.figurespot').length){
						e.preventDefault();
						var $p = $('<p></p>');
						$p.insertAfter($ed.find('.figurespot')).append($caret);
						caret.focus();
						$p.append('<br>');
					} else if ($caret.closest('h4').length){
						e.preventDefault();
						var $p = $('<p></p>');
						$p.insertAfter($ed.find('h4')).append($caret);
						caret.focus();
						$p.append('<br>');
					} else if ($caret.closest('h5').length){
						e.preventDefault();
						caret.focus();
					} else {
						caret.focus();
					}editor
				}
			});
			editor.on('keyup', function (e) {
				var $p = $ed.find('.figurespot');
				if ((e.ctrlKey && e.key != 'Control' && e.key != 'c' && e.key != 'v' && e.key != 'x' && e.key != 'z') || (e.key != 'Enter' && e.key != 'Backspace' && e.key != 'Delete' && e.key != 'Escape' && e.key != 'Tab')){
					$p.children(':not(img):not(.tablewrap),.tablewrap:empty').remove();
					$p.contents().filter(function(){ return this.nodeType == 3; }).remove(); //delete text
				} else if (e.key == 'Delete'){
					$ed.find('.pastedelement[data-mce-selected="1"]').replaceWith('<span class="caret-autobreak"></span>');
					caret.focus($ed);
				}
			});
			editor.on('paste', function (e) {
				$ed.addClass('contentchanged');
				$ed.trigger('edition:uploadimgs');
				$ed.trigger('edition:tablefit');
			});
			editor.on('change', function (e) {
				$ed.addClass('contentchanged');
				$ed.trigger('edition:uploadimgs');
				$ed.trigger('edition:tablefit');
			});
			editor.on('blur', function (e) {
				caret.cleanup($ed);
				editor.undoManager.clear();
				if ($ed.hasClass('contentchanged') && !Report.document.hasClass('preventeventchange')){
					var contenthash = $ed.attr('data-contenthash');
					$ed.trigger('edition:contenthash');
					if (contenthash !== $ed.attr('data-contenthash')){
						$ed.trigger('edition:change');
						$ed.removeClass('contentchanged');
						$ed.attr('contenteditable',false);
						caret.cleanup($ed);
						Report.document.trigger('historyworker:clear');/*\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/*/
					}
				}
				$ed.find('.pastedelement').removeAttr('data-mce-selected');
			});
			editor.on('NodeChange', function(e) {
				var $elem = e.element ? $(e.element) : $();
				var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
				if ($elem.is('img')){
					$toolroot.find('[aria-label="Edit image"], [aria-label="Image options"]').show();
				} else {
					$toolroot.find('[aria-label="Edit image"], [aria-label="Image options"]').hide();
				}
			});
		}
	});


	Report.widget.on('edition:init','.sui-report-document, .page, [data-edition]',function(event,firstload){

		event.stopPropagation();
		event.stopImmediatePropagation();

		var $elem = $(this);
		var id = $elem.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		var $edits = $();
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
		if ($edits.filter('[data-edition="figure"]').length) setup.figure = $.extend(true, {}, mceSetupFigure);

		$edits.trigger('edition:wrapfield');
		$edits.trigger('edition:jscode');


		/*
		$edits.attr('contenteditable','true').one('focus',function(){
			var $e = $(this);
			var eid = $e.attr('id') || 'box'+$.md5(Math.rand()).substring(0, 16);
			$e.attr('id',eid);
			var v = $.extend(true, {},setup[$e.attr('data-edition')]||{});
			v.selector = '#'+eid;
			tinymce.init(v);
			setTimeout(function(){$e.trigger('focus');},300);
			$e.addClass('binded')
		});
		*/

		$.each(setup,function(k,v){
			v.selector = '#'+(selector || id+' '+v.selector);
			tinymce.init(v);
		});

		var initFN = function(){
			Report.document.removeClass('preventhistorystack');
			Report.document.trigger('document:hasinited');
			if (Report.viewtools.find('.save > a').data('link-process') == 'insert'){
				boxFitter.normalizeBoxes(Report.document.children('.page.breaker-disclaimer'));
			} else {
				var $page = boxFitter.documentOverflow();
				if ($page) boxFitter.normalizeBoxes($page);
			}
			Report.document.trigger('document:numpage');
		};

		if ($elem.is('.sui-report-document') && firstload){
			var timeinc = 0;
			var timeout = 5000;
			var imagesloaded = 0;
			var $images = Report.document.find('img');
			if ($images.length){
				var itv = setInterval(function(){
					$images.each(function(){
						timeinc += 150;
						if (this.naturalHeight !== 0) imagesloaded++;
						if (imagesloaded == $images.length || timeinc >= timeout){
							clearInterval(itv);
							initFN();
						}
					});
				},150);
			} else {
				setTimeout(initFN,150);
			}
		}

	});
	// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	Report.document.trigger('edition:init',[true]);
	Report.document.trigger('historyworker:clear');

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
							var tinymcedit = tinymce.get($this.attr('id'))
							content = tinymcedit ? tinymcedit.getContent() : $this.html();
							//content = $this.html();
						} else if ($this.attr('data-edition').indexOf('figure') > -1){
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
				if ($elem.attr('colspan')) $sui.attr('colspan', $elem.attr('colspan'));
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
				if ($elem.attr('colspan')) $sui.attr('colspan', $elem.attr('colspan'));
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
			stacker: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					else if ($this.hasClass('container')) suiXml += wdata.suify.container($this);
				});
				var $sui = wdata.aux.strXQ('<stacker>'+suiXml+'</stacker>');
				if (!$elem.attr('data-type') && wdata.aux.getClassAt($elem,1)) $sui.attr('data-type',wdata.aux.getClassAt($elem,1));
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
						else if ($this.hasClass('stacker')) suiXml += wdata.suify.stacker($this);
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
				var h = $elem.height();
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
					else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					else if ($this.hasClass('container')) suiXml += wdata.suify.container($this);
				});
				return '<main data:height="'+h+'px">'+suiXml+'</main>';
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
				$elem.children('.bleed').children().each(function(){
					var $this = $(this);
					if ($this.hasClass('cover')) suiXml += wdata.suify.cover($this);
					else if ($this.hasClass('header')) suiXml += wdata.suify.header($this,true);
					else if ($this.hasClass('main')) suiXml += wdata.suify.main($this);
					else if ($this.hasClass('footer')) suiXml += wdata.suify.footer($this, $this.find('.wide').length ? false : true);
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
				$sui.attr('lang',$elem.attr('lang'));
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
				var $var = wdata.aux.strXQ('<var>'+$elem.html().toEntities()+'</var>');
				wdata.aux.parseAttr($var,$elem,/name|value|data\-/);
				var value = $.trim($var.attr('value')||$var.html());
				if ((value+'').indexOf('[') === 0) value = JSON.parse(value);
				Report.wgdata[$var.attr('name')||$var.attr('id')] = value;
				return wdata.aux.xqString($var);
			},
			getAll: function(){
				Report.wgdata.usedimages = [];
				Report.document.find('img:not([src*="blob:"]), img:not([src*="data:"])').each(function(){
					var $img = $(this);
					if ($img.attr('src')) Report.wgdata.usedimages.push($img.attr('src').split('/').pop());
				});
				Report.document.find('[style*="background-image"]').each(function(){
					var $bgi = $(this);
					var bg = $bgi.css('background-image');
					if (bg.indexOf('blob:') === -1 && bg.indexOf('data:') === -1){
						Report.wgdata.usedimages.push($bgi.css('background-image').match(/\"(.*)\"/)[1].split('/').pop());
					}
				});
				Report.document.find('.covered-default .main .content [data-edition="richtext"]').each(function(){
					Report.wgdata.firstPage = (Report.wgdata.firstPage||'')+this.innerHTML.trim();
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
		return Report.wgdata;
	};

	Report.documentHTML = function(){
		var $document = Report.document.clone();
		$document.removeClass('loaded');
		$document.find('.haspep, .pep-dpa, .pep-dropping, .pep-active, .pep-ease').removeClass('haspep pep-dpa pep-dropping pep-active pep-ease');
		$document.find('.active, .focus').removeClass('active focus');
		return $document.html();
	}
	Report.pagesState = function(){
		var pagesstate = {};
		var $pages = Report.document.children('.page');
		$pages.each(function(){
			var $page = $(this);
			var pid = $page.attr('id');
			if (!pid) {
				pid = Math.unique(12);
				$page.attr('id', pid);
			}
			var content = '';
			$page.find('[contenteditable], .block, .container').each(function(){
				content += this.innerHTML+this.getAttribute("style");
			});
			if ($page.hasClass('draggable-resizable')){
				$page.find('.fieldwrap').each(function(){
					content += this.getAttribute("style");
				});
			}
			var hash = $.md5(content);
			var html = $page.get(0).outerHTML.replace(/pep-dpa|pep-dropping|pep-active|pep-start|haspep|has-draggable|has-resizable/g,'');
			pagesstate[pid] = {
				hash: hash,
				html: html,
			}
		});
		return pagesstate;
	}

	if (sourceui.instances.socket){
		var documentLocker = {
			reportId: Report.view.data('erld'),
			cgeId: Report.view.data('asie')
		}
	}

	Report.locker(true);

};