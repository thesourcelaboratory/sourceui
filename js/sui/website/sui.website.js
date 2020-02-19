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

$(function(){


	var Device = sourceui.instances.device;
	var Debug = Device.Debug;

	var online = typeof navigator.onLine !== 'undefined' ? navigator.onLine : true;

	Debug.create('Network', {
		mode: 'State',
		title: 'Current network state'
	});

	if (online) {
		$('#suiBody').removeClass('offline');
		Debug.get('Network').notice({
			mode: 'Status',
			title: 'Network is online and idle',
		});
	} else {
		$('#suiBody').addClass('offline');
		Debug.get('Network').error({
			mode: 'Status',
			title: 'Network is offline',
		});
	}
	Debug.get('Network').trace();

	function replaceElementTag(targetSelector, newTagString) {
		$(targetSelector).each(function(){
			var newElem = $(newTagString, {html: $(this).html()});
			$.each(this.attributes, function() {
				newElem.attr(this.name, this.value);
			});
			$(this).replaceWith(newElem);
		});
	}

	$('.ignored').ignore(true);

	$('a[target="_popup"]').attr('target','_new').on('click',function(event){
		event.preventDefault();
		event.stopPropagation();
		var $this = $(this);
		window.open($this.attr('href'), 'popup', 'centerscreen,resizable,scrollbars,status');
	});
	$('button[data-href], .sui-button[data-href]').on('click',function(event){
		event.preventDefault();
		event.stopPropagation();
		var $this = $(this);
		if ($this.data('target') === 'popup') window.open($this.data('href'), 'popup', 'centerscreen,resizable,scrollbars,status');
		else window.open($this.data('href'));
	});

	$('#suiNav > .hamburger').on('click',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $nav = $('#suiNav');
		if ($this.hasClass('is-active')){
			$nav.trigger('hamburger:inactive');
		} else {
			$nav.trigger('hamburger:active');
		}
	});
	$('#suiNav').on('hamburger:active',function(event){
		var $nav = $(this);
		var $hamburger = $nav.children('.hamburger');
		var $public = $('#suiNav > .sui-navigation > .sui-menu.public');
		var $authenticated = $('#suiNav > .sui-navigation > .sui-menu.authenticated li.selected');
		$authenticated.removeClass('selected');
		$hamburger.addClass('is-active');
		$public.addClass('selected');
	});
	$('#suiNav').on('hamburger:inactive',function(event){
		var $nav = $(this);
		var $hamburger = $nav.children('.hamburger');
		var $public = $('#suiNav > .sui-navigation > .sui-menu.public');
		var $authenticated = $('#suiNav > .sui-navigation > .sui-menu.authenticated li.selected');
		$authenticated.removeClass('selected');
		$hamburger.removeClass('is-active');
		$public.removeClass('selected');
	});

	$('#suiNav > .sui-navigation > .sui-menu li.parent a').on('click',function(event){
		event.stopPropagation();
		var $nav = $('#suiNav');
		var $this = $(this);
		var $li = $this.parent();
		var href = $this.attr('href');
		var expand = (href && event.offsetX + parseInt($this.css('padding-left')) > $this.outerWidth() - 36 || !href) ? true : false;
		$nav.trigger('hamburger:inactive');
		if (expand){
			$li.siblings('.selected').removeClass('selected');
			if ($li.is('.selected')){
				$li.removeClass('selected');
			} else {
				$li.addClass('selected');
			}
			event.preventDefault();
			return false;
		} else {
			if ($li.is('.selected')){
				$li.removeClass('selected');
				event.preventDefault();
				return false;
			}
		}
	});

	$(".sui-videostage video").on("play", function (e) {
		var $this = $(this);
		var $stage = $this.closest('.sui-videostage');
		$stage.removeClass('stop pause');
		$stage.addClass('play');
	});
	$(".sui-videostage video").on("pause", function (e) {
		var $this = $(this);
		var $stage = $this.closest('.sui-videostage');
		$stage.removeClass('stop play');
		$stage.addClass('pause');
	});
	$(".sui-videostage video").on("stop", function (e) {
		var $this = $(this);
		var $stage = $this.closest('.sui-videostage');
		$stage.removeClass('pause play');
		$stage.addClass('stop');
	});


	$('.sui-gallery').suiViewer();

	$('.sui-faq').on('click','.item > .question',function(){
		var $this = $(this);
		var $item = $this.parent();
		var $answer = $this.siblings('.answer');
		var $faq = $this.closest('.sui-faq');
		var $opened = $faq.find('.item.opened');
		if ($opened.get(0) !== $item.get(0)){
			$opened.children('.question').trigger('click');
		}
		if ($item.is('.opened')){
			$answer.slideUp(200);
			$item.removeClass('opened');
		} else {
			$answer.slideDown(200);
			$item.addClass('opened');
		}
	});



	var scrolldata = {};
	var $window = $(window);
	var $body = $('#suiBody');
	scrolldata.windowsHeight = $window.height();

	var scrolledTest = function(){
		scrolldata.scrollTop = $window.scrollTop();
		if (scrolldata.scrollTop > scrolldata.windowsHeight/5 && scrolldata.class != 'scrolled'){
			scrolldata.class = 'scrolled';
			$body.addClass(scrolldata.class);
		} else if (scrolldata.scrollTop <= scrolldata.windowsHeight/5 && scrolldata.class == 'scrolled'){
			scrolldata.class = '';
			$body.removeClass('scrolled');
		}
	}


	$window.on('scroll',scrolledTest);
	scrolledTest();

	$window.on('blur',function(){
		$body.addClass('outfocused');
	});
	$window.on('focus',function(){
		$body.removeClass('outfocused');
	});

	$body.on('click',function(){
		$('#suiNav').trigger('hamburger:inactive');
		$('#suiNav > .sui-navigation > .sui-menu.public').removeClass('selected');
	});


	var suiTraceParser = function(s){
		var $trace = $body.find('trace');
		var $items = $trace.children('item');
		if (s){
			var Console = Debug.get('Network', {
				mode: 'AJAX',
				key: s.url
			});
		} else {
			var Console = Debug.get('Network', {
				mode: 'WEBSITE',
				key: window.location.href
			});
		}
		if ($items.length){
			$items.each(function(){
				var $item = $(this);
				var data = { type: $item.attr('type'), color: $item.attr('color') };
				$item.children().each(function(){
					var $this = $(this);
					data[$this.prop('nodeName').toLowerCase()] = $this.text();
				});
				data.mode = data.mode || 'Server';
				Console.item(data);
			});
			Console.trace();
		}
		$trace.remove();
	};

	suiTraceParser();

	$(document).ajaxComplete(function( event, xhr, settings ) {
		suiTraceParser(settings);
	});


});
