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
	Report.area = $widget.children('.area');
	Report.wgtools = Report.widget.children('.toolbar').find('.tools');
	Report.view = Report.widget.closest('.sui-view');
	Report.scroll = Report.view.children('.scroll-default');
	Report.viewtools = Report.view.children('.toolbar').children('.tools.left');
	Report.document = Report.widget.find('.sui-report-document');
	Report.validations = Report.widget.find('.sui-validations rule');
	Report.templates = Report.widget.find('.sui-templates');
	Report.editors = Report.document.find('[data-edition*="text"]');
	Report.tinymceinlinetoolbar = Dom.body.children('#tinymceinlinetoolbar');

	if (!Report.tinymceinlinetoolbar.length){
		Report.tinymceinlinetoolbar = $('<div id="tinymceinlinetoolbar"/>').appendTo(Dom.body);
	}
	Report.tinymceinlinetoolbar.css({
		'left':Report.viewtools.offset().left + Report.viewtools.width() + 15
	});

	// Widget Tools ------------------------------------------
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
	Report.wgtools.filter('.top').find('li:gt(0)').pep({
		place: false,
		shouldEase: false,
		droppable: '.sui-report-document, .page, .cell, .fieldwrap',
		revert: true,
		start: function (ev, obj) {
			obj.$el.addClass('dragger');
		},
		drag: function(ev, obj){
			var $drop = this.activeDropRegions;
			Report.document.find('.pep-dropping').removeClass('pep-dropping');
			if ($drop) $drop.pop().addClass('pep-dropping');
		},
		stop: function (ev, obj) {

			var $li = obj.$el;
			var $a = obj.$el.children('a');
			var $drop = this.activeDropRegions;
			var $clone;
			var $target;

			if ($a.hasClass('add-page')){
				$target = $drop[1];
				$clone = Report.templates.children('.page[data-layout="regular"]').clone();
				if ($target && $target.length && $target.is('.page')) Report.document.trigger('document:addpage',[$clone,$target,'after']);
				else Report.document.trigger('document:addpage',[$clone]);
			} else {
				var edition;
				var $page = $drop[1];
				if ($page && $page.length && $page.is('.page')){
					if ($a.hasClass('add-richtext')) edition = 'richtext';
					else if ($a.hasClass('add-tinytext')) edition = 'tinytext';
					else if ($a.hasClass('add-text')) edition = 'text';
					else if ($a.hasClass('add-dynamic')) edition = 'dynamic';
					$clone = $('<div class="fieldwrap" />').append(Report.templates.children('[data-edition="'+edition+'"]').clone());
					if ($drop[3] && $drop[3].length && $drop[3].is('.fieldwrap')){
						console.log(this.ev.y+' > '+$drop[3].offset().top+' + '+($drop[3].height()/3));
						if (this.ev.y > $drop[3].offset().top + ($drop[3].height()/3)){
							$page.trigger('page:addedition',[$clone,$drop[3],'after']);
						} else {
							$page.trigger('page:addedition',[$clone,$drop[3],'before']);
						}
					}
					else if ($drop[2] && $drop[2].length && $drop[2].is('.cell')) $page.trigger('page:addedition',[$clone,$drop[2],'append']);
					else $page.trigger('page:addedition',[$clone]);
					// autoclick dynamic insertion
					if (edition == 'dynamic'){
						$clone.find('[data-edition]').trigger('edition:tools').click();
						$clone.children('.edition-actions').find('.pick a').click();
					}
				}
			}
			$.each($drop||[],function(k,v){ v.removeClass('pep-dpa pep-dropping'); })
			obj.$el.removeClass('dragger');
		}
	});
	Report.wgtools.filter('.bottom').find('.zoom-in').on('click',function(){
		Report.document.trigger('panzoom:in');
	});
	Report.wgtools.filter('.bottom').find('.zoom-toggle').on('click',function(){
		var $this = $(this);
		if (Report.scroll.hasClass('unscrolled')){
			Report.document.trigger('panzoom:destroy');
		} else {
			Report.document.trigger('panzoom:init');
		}
	});
	Report.wgtools.filter('.bottom').find('.zoom-out').on('click',function(){
		Report.document.trigger('panzoom:out');
	});
	// -------------------------------------------------------

	// Page Tools --------------------------------------------
	var toolsPage = ''+
		'<ul class="page-actions noneditable" contenteditable="false">'+
		'<li class="noneditable label" contenteditable="false"></li>'+
		'<li data-action="clone" class="noneditable clone" contenteditable="false"><a class="icon-copy" data-tip="Clone this page"><i class="icon-plus"></i></a></li>'+
		'<li data-action="edit" class="noneditable edit" contenteditable="false"><a class="icon-edit-stroke" data-tip="Edit page properties"></a></li>'+
		'<li data-action="remove" class="noneditable remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this page"></a></li>'+
		'</ul>';

	var $toolsPage = $(toolsPage);
	Report.widget.append($toolsPage);
	//$toolsPage.find('[data-tip]').tip();
	Report.document.on('page:tools','.page',function(event){
		var $this = $(this);
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsPage.find('li.label').text('Page '+($this.parent().children('.page').index($this)+1));
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
	$toolsPage.on('click','.clone a',function(){
		var $page = $toolsPage.parent();
		var $clone = $page.clone();
		Report.document.trigger('document:addpage',[$clone,$page,'after']);
	});
	$toolsPage.on('click','.edit a',function(){
		var $page = $toolsPage.parent();
		Report.document.trigger('document:openfloat',[$page, {
			form:'page',
			layout: $page.data('layout')||'regular',
			index: $page.prevAll('.page').length + 1,
			total: $page.parent().children('.page').length,
			watermark:$page.data('watermark')||'yes',
		}]);
	});
	$toolsPage.on('click','.remove a',function(){
		var $page = $toolsPage.parent();
		Report.widget.append($toolsPage);
		$page.trigger('page:remove');
		Report.document.trigger('document:numpage');
	});

	// -------------------------------------------------------

	// Edition Tools -----------------------------------------
	var toolsEdition = ''+
		'<ul class="edition-actions noneditable" contenteditable="false">'+
		'<li class="noneditable label" contenteditable="false"></li>'+
		'<li data-action="clone" class="noneditable clone" contenteditable="false"><a class="icon-copy" data-tip="Clone this box"><i class="icon-plus"></i></a></li>'+
		'<li data-action="edit" class="noneditable edit" contenteditable="false"><a class="icon-edit-stroke" data-tip="Edit box properties"></a></li>'+
		'<li data-action="pick" class="noneditable pick" contenteditable="false"><a class="icon-picker-gd" data-tip="Pick box data"></a></li>'+
		'<li data-action="remove" class="noneditable remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this box"></a></li>'+
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
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				$li.addClass('allow');
			}
		});

		if ($this.attr('data-edition') == 'dynamic') $toolsEdition.find('li.edit').removeClass('allow').addClass('deny');
		else $toolsEdition.find('li.pick').removeClass('allow').addClass('deny');

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
		var $content = $('<code>'+tinymce.get($edit.attr('id')).getContent()+'</code>');
		Report.document.trigger('document:openfloat',[$edit, {
			form:'edition',
			type: $edit.attr('data-edition'),
			index: $fieldwrap.prevAll().length + 1,
			total: $fieldwrap.parent().children().length,
			header: $content.find('header').html(),
			footer: $content.find('footer').html(),
		}]);
	});
	$toolsEdition.on('click','.pick a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var keys = [];
		$edit.find('[data-key]').each(function(){
			keys.push($(this).attr('data-key'));
		});
		if ($edit.attr('data-key')) keys.push($edit.attr('data-key'));
		Report.document.trigger('document:openfloat',[$edit, {
			form:'dynamic',
			name: $edit.attr('data-name'),
			keys: keys,
		}]);
	});
	$toolsEdition.on('click','.remove a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		Report.widget.append($toolsEdition);
		$edit.trigger('edition:remove');
	});
	// -------------------------------------------------------

	// PanZoom Events ----------------------------------------
	Report.document.on('panzoom:init',function(event){
		var instance = Report.document.data('panzoom');
		if (!instance){
			var element = Report.document.get(0);
			instance = panzoom(element, {
				maxZoom: 2.4,
				minZoom: 0.6,
				bounds: true,
				boundsPadding: 0.1,
				beforeWheel: function(e) {
					// allow wheel-zoom only if altKey is down. Otherwise - ignore
					var shouldIgnore = !e.ctrlKey;
					if (shouldIgnore && Report.scroll.hasClass('unscrolled')){
						var transform = instance.getTransform();
					instance.moveTo(transform.x, transform.y - (e.deltaY * transform.scale));
					}
					return shouldIgnore;
				},
				beforeMouseDown: function(e) {
					// allow mouse-down panning only if altKey is down. Otherwise - ignore
					var shouldIgnore = !e.ctrlKey;
					return shouldIgnore;
				},
				filterKey: function(/* e, dx, dy, dz */) {
					return true;
				}
			});
			Report.document.data('panzoom',instance);
		}
		Report.scroll.addClass('unscrolled');
		var $toggle = Report.wgtools.filter('.bottom').find('.zoom-toggle');
		$toggle.parent().css('background-color','#26a9ff');
	});
	Report.document.on('panzoom:in',function(event){
		Report.document.trigger('panzoom:init');
		var instance = Report.document.data('panzoom');
		var transform = instance.getTransform();
		instance.zoomAbs(parseInt(Report.area.width()/2),0, transform.scale + 0.2);
	});
	Report.document.on('panzoom:out',function(event){
		Report.document.trigger('panzoom:init');
		var instance = Report.document.data('panzoom');
		var transform = instance.getTransform();
		instance.zoomAbs(parseInt(Report.area.width()/2),0, transform.scale - 0.2);
	});
	Report.document.on('panzoom:destroy',function(event){
		var instance = Report.document.data('panzoom');
		if (instance) instance.dispose();
		Report.document.css('transform','none');
		Report.document.removeData('panzoom');
		var $toggle = Report.wgtools.filter('.bottom').find('.zoom-toggle');
		$toggle.parent().attr('style','');
		Report.scroll.removeClass('unscrolled');
	});
	Report.document.on('wheel',function(event){
		if (event.ctrlKey && !Report.scroll.hasClass('unscrolled')){
			event.stopPropagation();
			event.preventDefault();
			if (event.originalEvent.deltaY > 0) Report.document.trigger('panzoom:out');
			else Report.document.trigger('panzoom:in');
		}
	});
	// -------------------------------------------------------

	// Edition Events -------------------------------------------
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
		$wrap.closest('.page',Report.document).trigger('page:active');
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
	Report.document.on('click','[data-edition]',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $wrap = $this.parent();
		if ($this.attr('data-edition') == 'dynamic'){
			$wrap.closest('.page',Report.document).trigger('page:active');
			$wrap.removeClass('hover');
			Report.document.find('.fieldwrap.active').removeClass('active');
			$wrap.addClass('active');
			$this.trigger('edition:tools');
		}
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
			$this.wrap('<div class="fieldwrap" />');
		} else {
			$fieldwrap.removeClass('focus active selected error');
		}
	});
	Report.document.on('edition:overflew','[data-edition]',function(event){
		var $this = $(this);
		var $wrap = $this.parent();
		var $main = $this.closest('.main, .page', Report.document);
		var $edge = $this.closest('.cell, .row', $main);
		var element = $edge.get(0);
		if ( (element.offsetHeight+20 < element.scrollHeight) || (element.offsetWidth+20 < element.scrollWidth)){
			$wrap.addClass('error overflew');
			$wrap.nextAll('.fieldwrap').addClass('error overflew')
		} else {
			$wrap.removeClass('error overflew');
			$wrap.siblings('.fieldwrap').removeClass('error overflew');
		}
	});
	Report.document.on('edition:change','[data-edition]',function(){
		Report.document.trigger('field:input');
		var $this = $(this);
		$this.trigger('edition:overflew');
		Report.document.trigger('document:change');
	});
	Report.document.on('edition:input','[data-edition]',function(){
		Report.document.trigger('field:input');
		var $this = $(this);
		$this.trigger('edition:overflew');
	});
	Report.document.on('edition:nodechange','[data-edition]',function(event,node){
		var $this = $(this);
		var $node = $(node);
		var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
		if ($node.is('table')){
			$toolroot.find('.mce-btn-group:eq(2) .mce-btn:eq(0), .mce-btn-group:eq(2) .mce-btn:eq(3), .mce-btn-group:eq(4), .mce-btn-group:eq(6), .mce-btn-group:gt(9)').hide();
			$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(2) .mce-btn:eq(4), .mce-btn-group:eq(7), .mce-btn-group:eq(8), .mce-btn-group:eq(9)').show();
		} else if ($node.is('img')){
			$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(4), .mce-btn-group:gt(5)').hide();
			$toolroot.find('.mce-btn-group:gt(9)').show();
		} else {
			if (!$node.is('[data-edition]')){
				$node = $node.closest('table, img', $this);
				if ($node.length){
					return $this.trigger('edition:nodechange',$node);
				}
			}
			$toolroot.find('.mce-btn-group:eq(2) .mce-btn:eq(4), .mce-btn-group:gt(6)').hide();
			$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(2) .mce-btn:eq(0), .mce-btn-group:eq(2) .mce-btn:eq(3), .mce-btn-group:eq(4), .mce-btn-group:eq(6)').show();
		}
		$toolroot.addClass('adapted');
	});
	Report.document.on('edition:remove','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		if ($this.attr('id')) tinymce.remove('#'+$this.attr('id'));
		$fieldwrap.remove();
		Report.document.trigger('document:change');
		$.tipster.notify('Edition box removed');
	});
	// -------------------------------------------------------

	// Page Events -------------------------------------------
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
			}
		} else {
			$page.find('.main .cell:eq(0)').append($new);
		}
		$edit.trigger('edition:cleanmce');
		$edit.trigger('edition:init');
		$edit.trigger('edition:change');
	});
	Report.document.on('page:scrollto','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		$(Report.document.closest('.scroll-default')).scrollTo($page,350,{ offset:{top:-50} });
	});
	Report.document.on('page:remove','.page',function(){
		var $this = $(this);
		$this.find('.mce-content-body').each(function(){
			var $ed = $(this);
			if ($ed.attr('id')) tinymce.remove('#'+$ed.attr('id'));
		});
		$this.remove();
		Report.document.trigger('document:change');
		$.tipster.notify('Page removed');
	});
	Report.document.on('page:active','.page',function(){
		var $this = $(this);
		Report.document.trigger('page:unactive');
		$this.addClass('active');
		$this.trigger('page:tools');
	});
	Report.document.on('page:unactive',function(){
		Report.document.find('.page.active,.fieldwrap.active').removeClass('active');
		Report.document.find('[data-mce-selected]').removeAttr('data-mce-selected');
	});
	// -------------------------------------------------------

	// Document Events ---------------------------------------
	Report.document.on('document:change',function(event,$origin,json){
		Report.document.trigger('document:validate');
		Report.widget.trigger('field:input');
	});
	Report.document.on('document:openfloat',function(event,$origin,json){
		var data = $origin.link();
		var id = $origin.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		data.id = id;
		data.json = json;
		Network.link(data);
		$origin.attr('id',id);
	});
	Report.document.on('document:hasinited',function(){
		if (!Report.document.hasClass('loaded') && !Report.editors.filter(':not(.inited)').length){
			Report.document.addClass('loaded');
			Report.document.trigger('document:validate');
		}
	});
	Report.document.on('document:validate',function(){
		var invalids = 0;
		Report.validations.each(function(){
			var $v = $(this);
			var $query = Report.document.find($v.attr('selector'),);
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
			Report.document.trigger('document:valid');
			$vchecked.addClass('icon-done').parent().css('background','#1c985f');
			$vchecked.html('');
		} else {
			Report.document.trigger('document:invalid');
			$vchecked.removeClass('icon-done').parent().css('background','#e24040');
			$vchecked.html('!'+invalids);
		}
	});
	Report.document.on('document:addpage',function(event,$new,$ref,placement){
		$new.find('.page-actions').remove();
		$new.removeAttr('id');
		if ($ref){
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
			}
		} else {
			Report.document.append($new);
		}
		$new.find('[data-edition]').trigger('edition:cleanmce');
		Report.document.trigger('document:numpage');
		$new.trigger('edition:init');
		$new.trigger('page:active');
		$new.trigger('page:scrollto');
		Report.document.trigger('document:change');
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
			var $ed = $(editor.getElement());
			editor.on('init', function (e) {
				$ed.addClass('inited').addClass('sui-restric-activity-control');
				Report.document.trigger('document:hasinited');
			});
			editor.on('click', function (e) {
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('keydown', function (e) {
				$ed.addClass('keyboarded');
			});
			editor.on('input', function (e) {
				$ed.trigger('edition:input');
			});
			editor.on('change', function (e) {
				$ed.trigger('edition:change');
			});
		}
	};
	var mceSetupText = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="text"]:not(.inited)',
		forced_root_block : false,
		toolbar: 'undo redo removeformat | bold italic underline',
		valid_elements: 'strong,em,span[style],a[href]',
		valid_styles: {
			'*': 'font-size,font-family,color,text-decoration,text-align'
		},
	});
	var mceSetupTinytext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="tinytext"]:not(.inited)',
		forced_root_block : 'p',
		toolbar: 'undo redo removeformat | bold italic underline | styleselect forecolor',
		valid_elements: 'br,h1[style],h2[style],p[style],strong[style],em,span[style]',
		valid_styles: {
			'*': 'font-size,font-family,color,text-decoration,text-align'
		},
		style_formats: [
			{title: 'h1', block: 'h1'},
			{title: 'h2', block: 'h2'},
			{title: 'h3', block: 'h3'},
			{title: 'h4', block: 'h4'},
			{title: 'Paragraph', block: 'p'},
		],
	});
	var mceSetupRichtext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="richtext"]:not(.inited)',
		placeholder:'Enter text, tables and images here...',
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
		valid_elements: 'header[style],footer[style],p[style],h1,h2,h3,h4,img[style|src],table[style],colgroup,col,tbody,thead,tfoot,tr[style],th,td[style],a[href|target],strong[style],span[style],em,br',
		valid_styles: {
			'header': 'font-size,font-family,color,text-decoration,text-align',
			'footer': 'font-size,font-family,color,text-decoration,text-align',
			'p': 'font-size,font-family,color,text-decoration,text-align',
			'table': 'border,border-colapse,border-color,background-color,background,color,width,height',
			'tr': 'background-color,background',
			'td': 'background-color,background,font-weight,color,text-decoration,text-align,vertical-align,border,border-color',
			'img': 'width',
			'strong': 'font-size,font-family,color,text-decoration,text-align,background-color',
			'span': 'font-size,font-family,color,text-decoration,text-align,background-color',
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
			var $td = $content.find('td[style*="border:none"], td[style*="border: none"]');
			if ($td.length) $td.css('border','');
			o.content = $content.html();
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
		}

		if (!$edits.length) return;

		if ($edits.filter('[data-edition="text"]').length) setup.text = $.extend(true, {}, mceSetupText);
		if ($edits.filter('[data-edition="tinytext"]').length) setup.tinytext = $.extend(true, {}, mceSetupTinytext);
		if ($edits.filter('[data-edition="richtext"]').length) setup.richtext = $.extend(true, {}, mceSetupRichtext);

		$edits.trigger('edition:wrapfield');

		$.each(setup,function(k,v){
			v.selector = '#'+(selector || id+' '+v.selector);
			tinymce.init(v);
		});
	});
	// -------------------------------------------------------

	Report.document.trigger('edition:init');

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
						} else if ($this.attr('data-edition').indexOf('dyn') > -1){
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
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			cell: function($elem){
				var suiXml = '';
				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
				}
				var $sui = wdata.aux.strXQ('<cell>'+suiXml+'</cell>');
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			row: function($elem){
				var suiXml = '';
				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
				}
				var $sui = wdata.aux.strXQ('<row>'+suiXml+'</row>');
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
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
				if (!Report.wgdata.name){
					var eid = $elem.find('.title[data-edition]:eq(0), .name[data-edition]:eq(0)').attr('id');
					if (eid) Report.wgdata.name = tinymce.get(eid).getContent();
				}
				return '<cover>'+suiXml+'</cover>';
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
				if (!Report.wgdata.subname && $elem.parent().children('.page').index($elem) === 0){
					var eid = $elem.find('.main [data-edition]:eq(0)').attr('id');
					if (eid){
						var $ec = $('<div>'+tinymce.get(eid).getContent()+'</div>');
						Report.wgdata.subname = $ec.find('header:eq(0)').text() || $ec.find('h1:eq(0)').text() || $ec.find('h2:eq(0)').text() || $ec.find('h3:eq(0)').text();
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
				wdata.aux.parseAttr($var,$elem,/name|data\-/);
				Report.wgdata[$var.attr('name')||$var.attr('id')] = $var.attr();
				return wdata.aux.xqString($var);
			},
			getAll: function(){
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
		wdata.suify.getAll();
	};

};