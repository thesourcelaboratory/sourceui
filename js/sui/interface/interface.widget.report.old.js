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
	var Dom = Interface.dom;
	var Notify = sourceui.instances.interface.plugins.notify;

	var History = [];

	Report.common = new Interface.widget.common($widget,setup);
	Report.widget = $widget;
	Report.view = Report.widget.closest('.sui-view');
	Report.viewtools = Report.view.children('.toolbar').children('.tools.left');
	Report.document = Report.widget.find('.sui-report-document');
	Report.editors = Report.document.find('[data-edition*="text"]');
	Report.tinymceinlinetoolbar = Dom.body.children('#tinymceinlinetoolbar');

	if (!Report.tinymceinlinetoolbar.length){
		Report.tinymceinlinetoolbar = $('<div id="tinymceinlinetoolbar"/>').appendTo(Dom.body);
	}
	Report.tinymceinlinetoolbar.css({
		'left':Report.viewtools.offset().left + Report.viewtools.width() + 15
	});


	// Page Tools --------------------------------------------
	var toolsPage = ''+
		'<ul class="page-actions noneditable" contenteditable="false">'+
		'<li data-action="clone" class="noneditable clone icon-copy" contenteditable="false"></li>'+
		'<li data-action="edit" class="noneditable edit icon-edit-stroke" contenteditable="false"></li>'+
		'<li data-action="remove" class="noneditable remove icon-subtract" contenteditable="false"></li>'+
		'</ul>';

	var $toolsPage = $(toolsPage);
	Report.widget.append($toolsPage);
	Report.document.on('page:tools','.page',function(event){
		var $this = $(this);
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsPage.find('li').each(function(){
			var $li = $(this).removeClass('deny allow');
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
	$toolsPage.on('click','.clone',function(){
		var $this = $(this);
		var $page = $toolsPage.parent();
		Report.document.trigger('document:addpage',[$page.clone(),$page,'after']);
	});
	// -------------------------------------------------------

	// Edition Tools -----------------------------------------
	var toolsEdition = ''+
		'<ul class="edition-actions noneditable" contenteditable="false">'+
		'<li data-action="select" class="noneditable select icon-picker-grid" contenteditable="false"></li>'+
		'<li data-action="clone" class="noneditable clone icon-copy" contenteditable="false"></li>'+
		'<li data-action="edit" class="noneditable edit icon-edit-stroke" contenteditable="false"></li>'+
		'<li data-action="remove" class="noneditable remove icon-subtract" contenteditable="false"></li>'+
		'</ul>';

	var $toolsEdition = $(toolsEdition);
	Report.widget.append($toolsEdition);
	$toolsEdition.on('mousedown click',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	$toolsEdition.on('click','.clone',function(){
		var $this = $(this);
		var $editor = $toolsEdition.siblings('[data-edition]');
		if ($editor.length){
			var c = tinymce.get($editor.attr('id')).getContent();
			console.log(c);
		}
	});
	Report.document.on('edition:tools','[data-edition]',function(event){
		var $this = $(this);
		var $wrap = $this.parent();
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsEdition.find('li').each(function(){
			var $li = $(this).removeClass('deny allow');
			var a = $li.data('action');
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				$li.addClass('allow');
			}
		});
		$wrap.prepend($toolsEdition);
		var height = $wrap.height();
		var offset = $wrap.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $toolsEdition.addClass('up');
		else $toolsEdition.removeClass('up');
	});
	// -------------------------------------------------------


	// Page Events -------------------------------------------
	Report.document.on('page:active','.page',function(){
		var $this = $(this);
		Report.document.trigger('page:unactive');
		$this.addClass('active');
		$this.trigger('page:tools');
	});
	Report.document.on('page:unactive',function(){
		Report.document.find('.page.active,.fieldwrap.active').removeClass('active');
		Report.document.find('[data-mce-selected]').removeAttr('data-mce-selected');
		Report.widget.append($toolsPage);
	});
	// -------------------------------------------------------


	// Document Events ---------------------------------------
	Report.document.on('document:init',function(){
		if (!Device.ismobile){
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
				$wrap.closest('.page').trigger('page:active');
				$wrap.removeClass('hover');
				Report.document.find('.fieldwrap.active').removeClass('active');
				$wrap.addClass('focus active');
				$this.trigger('edition:tools');
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
						Report.document.find('[data-autofill="'+$e.data('autofill')+'"]').html($e.html());
					});
					$this.removeClass('keyboarded');
				}
			});
		}
		Report.document.on('click','[data-edition]',function(event){
			event.stopPropagation();
		});
		Report.document.on('edition:input','[data-edition]',function(){
			// form save button;
			var $this = $(this);
			var $wrap = $this.parent();
			var $main = $this.closest('.main, .page', Report.document);
			var $edge = $this.closest('.cell, .row', $main);
			var element = $edge.get(0);
			var outline = 3*parseInt($wrap.css('outline-width'));
			if ( (element.offsetHeight+outline < element.scrollHeight) || (element.offsetWidth+outline < element.scrollWidth)){
				$wrap.addClass('error overflew');
				$wrap.nextAll('.fieldwrap').addClass('error overflew')
			} else {
				$wrap.removeClass('error overflew');
				$wrap.nextAll('.fieldwrap').removeClass('error overflew');
			}
		});
		Report.document.on('edition:nodechange','[data-edition]',function(event,node){
			var $this = $(this);
			var $node = $(node);
			var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
			if ($node.is('table')){
				$toolroot.find('.mce-btn-group:eq(2) .mce-btn:eq(0), .mce-btn-group:eq(2) .mce-btn:eq(3), .mce-btn-group:eq(4), .mce-btn-group:eq(6)').hide();
				$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(2) .mce-btn:eq(4), .mce-btn-group:eq(7), .mce-btn-group:eq(8), .mce-btn-group:eq(9)').show();
			} else if ($node.is('img')){
				$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(4), .mce-btn-group:gt(5)').hide();
				$toolroot.find('.mce-btn-group:gt(9)').show();
			} else {
				$node = $node.closest('table, img', $this);
				if ($node.length){
					$this.trigger('edition:nodechange',$node.get(0));
				} else {
					$toolroot.find('.mce-btn-group:eq(2) .mce-btn:eq(4), .mce-btn-group:gt(6)').hide();
					$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(2) .mce-btn:eq(0), .mce-btn-group:eq(2) .mce-btn:eq(3), .mce-btn-group:eq(4), .mce-btn-group:eq(6)').show();
				}
			}
		});
		Report.document.addClass('loaded');
	});
	Report.document.on('document:hasinited',function(){
		if (!Report.editors.filter(':not(.inited)').length){
			Report.document.trigger('document:init');
		}
	});
	Report.document.on('document:addpage',function(event,$new,$ref,placement){
		if ($ref){
			if (placement == 'after'){
				$new.find('.page-actions').remove();
				$new.insertAfter($ref);
				$new.find('[data-edition]').trigger('edition:init');
			}
			Report.document.trigger('document:numpage');
		}
		$(Report.document.closest('.scroll-default')).scrollTo($new,150,{ offset:{top:-50} });
		$new.trigger('page:active');

	});
	Report.document.on('document:numpage',function(event,$new,$ref,placement){
		var $pages = Report.document.children('.page');
		$pages.each(function(){
			var $page = $(this);
			$page.find('[data-pagenumber] i').text($pages.index($page) + 1);
		});
	});
	Report.document.on('click',function(event){
		Report.document.trigger('page:unactive');
	});
	Report.document.on('click','.page',function(event){
		event.stopPropagation();
		$(this).trigger('page:active');
	});
	// -------------------------------------------------------


	// MCE Setup ---------------------------------------------
	var mceSetup = {
		menubar: false,
		inline: true,
		fixed_toolbar_container: '#tinymceinlinetoolbar',
		plugins: [
			'placeholder lists link image imagetools charmap',
			'noneditable visualblocks',
			'textcolor colorpicker media table powerpaste'
		],
		noneditable_noneditable_class: 'noneditable',
		fontsize_formats: "8px 9px 10px 11px 12px 14px 16px 18px 20px 22px",
		powerpaste_word_import: 'merge',
		powerpaste_html_import: 'merge',
		browser_spellcheck: true,
		textcolor_map: [
			"FCFCFC", "Snow White",
			"B4B4B4", "Silver",
			"808080", "Grey",
			"000000", "Black",
			"6a2525", "Wine",
			"E04242", "Red",
			"F56619", "Orange",
			"f1a027", "Yellow",
			"33c74c", "Regular green",
			"14943b", "Dark green",
			"194780", "BTG Dark",
			"3d98d8", "BTG Lite",
			"3371e6", "Ocean",
			"6b298e", "Purple",
			"c4319d", "Pink",
		]
	};

	Report.document.on('edition:init','[data-edition]',function(event,selector){
		var $this = $(this).wrapAll('<div class="fieldwrap"/>');
		var $wrap = $this.parent();
		var id = 'mce' + $.md5(Math.rand()).substring(0, 16);
		var type = $this.data('edition');
		var setup = {};
		$this.attr('id', id);
		if (type == 'text'){
			setup = $.extend(true, setup, mceSetup, {
				selector: '#'+id,
				forced_root_block : false,
				toolbar: 'undo redo removeformat | italic underline',
				valid_elements: 'strong,em,span[style],a[href]',
				valid_styles: {
					'*': 'font-size,font-family,color,text-decoration,text-align'
				},
			});
		} else if (type == 'tinytext'){
			setup = $.extend(true, setup, mceSetup, {
				selector: '#'+id,
				forced_root_block : 'p',
				toolbar: 'undo redo | bold italic underline | removeformat',
				valid_elements: 'br,h1[style],h2[style],p,strong,em,span[style]',
				valid_styles: {
					'*': 'font-size,font-family,color,text-decoration,text-align'
				},
			});
		} else if (type == 'richtext'){
			setup = $.extend(true, setup, mceSetup, {
				selector: '#'+id,
				placeholder:'Richtext, tables or images placement',
				forced_root_block : 'p',
				table_appearance_options: false,
				imagetools_toolbar: 'none',
				paste_data_images: true,
				toolbar: [
					'undo redo removeformat | bold italic underline | styleselect fontsizeselect forecolor backcolor cellcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent | link | table | tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | rotateleft rotateright | flipv fliph | editimage imageoptions'
				],
				images_dataimg_filter: function(img) {
					return img.hasAttribute('internal-blob');
				},
				powerpaste_allow_local_images: true,
				table_toolbar: '',
				table_resize_bars: false,
				valid_elements: 'header,footer,p,h1,h2,h3,h4,img[style|src],table[style],colgroup,col,tbody,thead,tfoot,tr[style],th,td[style],a[href|target],strong[style],span[style],em,br',
				valid_styles: {
					'table': 'border,border-colapse,border-color,background-color,background,color,width,height',
					'tr': 'background-color,background',
					'td': 'background-color,background,font-size,font-weight,font-style,color,text-decoration,text-align,vertical-align,border,border-color',
					'img': 'width',
					'*': 'font-size,font-family,color,text-decoration,text-align',
				},
				style_formats: [
					{title: 'Main Header', block: 'header'},
					{title: 'h1', block: 'h1'},
					{title: 'h2', block: 'h2'},
					{title: 'h3', block: 'h3'},
					{title: 'h4', block: 'h4'},
					{title: 'Paragraph', block: 'p'},
					{title: 'Footer', block: 'footer'},
				],
				paste_preprocess : function(pl, o) {
					var $content = $('<div>'+o.content+'</div>');
					var $td = $content.find('td[style*="background"]');
					if ($td.length){
						$td.css({
							'border':'solid 1px #fcfcfc',
							'border-color':'#fcfcfc !important'
						});
						var $table = $content.find('table').css({
							'border-collapse':'collapse',
							'border':'solid 1px #fcfcfc'
						});
					}
					o.content = $content.html();
				},
			});
		}
		/*else if (type == 'table'){
			setup = $.extend(true, setup, mceSetup, {
				selector: '#'+id,
				placeholder:'[Paste/create a table here]',
				forced_root_block : 'p',
				table_appearance_options: false,
				toolbar: 'undo redo removeformat | bold italic underline | styleselect fontsizeselect forecolor cellcolor | alignleft aligncenter alignright alignfull | link | table | tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
				table_toolbar: '',
				table_resize_bars: false,
				valid_elements: 'header,footer,p,h1,h2,h3,h4,img[style|src],table[style],colgroup,col,tbody,thead,tfoot,tr[style],th,td[style],a[href|target],strong[style],span[style],em,br',
				valid_styles: {
					'table': 'border,border-colapse,background-color,background,color,width,height',
					'tr': 'background-color,background',
					'td': 'background-color,background,font-size,font-weight,font-style,color,text-decoration,text-align,vertical-align,border,border-color',
					'img': 'width',
					'*': 'font-size,font-family,color,text-decoration,text-align',
				},
				style_formats: [
					{title: 'Main Header', block: 'header'},
					{title: 'h1', block: 'h1'},
					{title: 'h2', block: 'h2'},
					{title: 'h3', block: 'h3'},
					{title: 'h4', block: 'h4'},
					{title: 'Paragraph', block: 'p'},
					{title: 'Footer', block: 'footer'},
				],
				paste_preprocess : function(pl, o) {
					var $content = $('<div>'+o.content+'</div>');
					var $td = $content.find('td[style*="background"]');
					if ($td.length){
						$td.css({
							'border':'solid 1px #fcfcfc',
							'border-color':'#fcfcfc !important'
						});
						var $table = $content.find('table').css({
							'border-collapse':'collapse',
							'border':'solid 1px #fcfcfc'
						});
					}
					o.content = $content.html();
				},
			});
			setup.plugins[1] += 'table';
		}*/
		setup.setup = function (editor) {
			editor.on('init', function (e) {
				$this.addClass('inited').addClass('sui-restric-activity-control');
				Report.document.trigger('document:hasinited');
			});
			editor.on('nodechange', function (e) {
				$this.trigger('edition:nodechange',[editor.selection.getNode()]);
			});
			editor.on('keydown', function (e) {
				$this.addClass('keyboarded');
			});
			editor.on('input', function (e) {
				$this.trigger('edition:input');
			});
			editor.on('change', function (e) {
				$this.trigger('edition:input');
			});
			/*
			editor.on('focus', function (e) {
				$this.addClass('focus');
			});
			editor.on('blur', function (e) {
				$this.removeClass('focus');
			});
			*/
			/*
			editor.on('keydown', function (e) {
				var node = editor.selection.getNode();
				var range = editor.selection.getRng();
				if (range.startOffset === 0 && e.keyCode === 8) {
					e.preventDefault();
					editor.selection.select(node.nextSibling);
					editor.selection.getRng(0).collapse(0);
					node.parentNode.removeChild(node);
       				return false;
				}
			});
			*/
		};
		tinymce.init(setup);
	});
	// -------------------------------------------------------


	Report.document.find('[data-edition]').trigger('edition:init');
	//Report.document.trigger('edition:init');

	/*
	Report.document.panzoom({
		disablePan: false,
		minScale: 1,
		increment: 0.5,
		duration: 200,
		easing: "ease-in-out",
		contain: 'automatic',
		$zoomIn: Report.widget.find('.toolbar .zoom-in'),
		$zoomOut: Report.widget.find('.toolbar .zoom-out'),
	});
	Report.document.closest('.scroll-default').on('mousewheel.focal', function (e) {
		if(event.ctrlKey == true){
			e.preventDefault();
			var delta = e.delta || e.originalEvent.wheelDelta;
			var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
			Report.document.panzoom('zoom', zoomOut, {
				increment: 0.25,
				animate: false,
				focal: e
			});
		}
	});
	*/
};