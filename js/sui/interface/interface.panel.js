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

sourceui.interface.panel = function () {

	'use strict';

	var Panel = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Instances = sourceui.instances;
	var Interface = Instances.interface;
	var Document = Interface.document;
	var Dom = sourceui.interface.dom;
	var Plugin = Interface.plugins;

	Dom.panel = this.panel = $('#suiAsideLeft, #suiAsideRight, #suiMain');
	Dom.main = this.main = $('#suiMain');
	Dom.asideLeft = this.asideLeft = $('#suiAsideLeft');
	Dom.navTools = this.navTools = this.asideLeft.find('.navtools');
	Dom.navLeft = this.navLeft = this.asideLeft.children('.sui-nav');
	Dom.blockList = this.blockList = Dom.navLeft.find('.area > .blocklist');
	Dom.leftCollapser = this.leftCollapser = this.main.find('.sui-tabs [data-alias="leftcollapser"]');
	Dom.asideRight = this.asideRight = $('#suiAsideRight');
	Dom.navRight = this.navRight = this.asideRight.children('.sui-nav');
	Dom.sectorTabs = this.sectorTabs = $('#suiTabsSector');
	Dom.context = this.context = $('#suiContext');
	Dom.contextmenu = this.context = $('#suiContextMenu');
	Dom.sectorsContainer = this.sectorsContainer = $('#suiSectorsContainer');
	Dom.floatSectorContainer = this.floatSectorContainer = $('#suiFloatSectorContainer');
	Dom.leftAndMain = this.leftAndMain = $([this.navLeft, this.main]).map(function () { return this.toArray(); });
	Dom.leftMainFloat = this.leftMainFloat = $([this.navLeft, this.main, this.floatSectorContainer]).map(function () { return this.toArray(); });

	Dom.document.on('panelready', function (event) {
		Dom.body.removeClass('loading sui-ajax').children('.sui-spinner:eq(0)').remove();
		Dom.panel.show();
	});


	Dom.main.on('click', function () {
		var $body = Dom.body;
		if (Device.ismobile) {
			$body.addClass('leftcollapsed');
		}
	});
	Dom.main.on('swiperight', function (event) {
		$('body').removeClass('leftcollapsed');
		event.stopPropagation();
	});
	Dom.asideLeft.on('click', '.logo', function (event) {
		if (Device.ismobile) Dom.asideLeft.trigger('swipeleft');
		Dom.sectorTabs.find('.unclosable').trigger('click');
	});
	Dom.asideLeft.on('swipeleft', function (event) {
		$('body').addClass('leftcollapsed');
		event.stopPropagation();
	});
	if (this.navTools.find('li.notifications.notified').length) {
		Plugin.notification.badge(0);
	}
	Dom.navTools.on('click', 'li', function (event) {
		var $this = $(this);
		var $navs = $this.removeClass('selected').closest('.navtools').siblings('nav');
		var $nav = $navs.filter('#' + $this.data('id'));
		if (!$this.hasClass('selected')) {
			$this.parent().children().removeClass('selected');
			$this.addClass('selected');
			$navs.removeClass('selected');
			$nav.addClass('selected');
			if ($this.data('notification') && !$this.hasClass('has-clicked')) {
				$this.addClass('has-clicked');
				sourceui.instances.socket.permission();
			}
			if ($this.hasClass('notified')) {
				Plugin.notification.shown();
			}
			var $qru = $nav.find('.qrcode-url .qrc');
			if ($qru.length) {
				var hist = $qru.data('url') || {};
				if (hist[window.location.href]){
					$qru.html(hist[window.location.href]);
				} else {
					$qru.html('');
					setTimeout(function(){
						$qru.qrcode({
							render: 'div',
							version: 40,
							ecLevel: 'M',
							text: window.location.href,
							fill: '#2d2d2d',
							size: 130,
						});
						hist[window.location.href] = $qru.html();
						$qru.data('url',hist);
					},50);
				}
			}
		}
		if (!Device.ismobile) $.CURR.navTool = $this;
		event.stopPropagation();
	});
	Dom.leftMainFloat.on('click', '[data-link]', function (event) { // :attrHas("data-link"):not(.selected)
		var $this = $(this);
		if ($this.isDisable()) return;
		var data = $.extend({},$this.data('link'));
		if ($.isPlainObject(data)){
			data.ignorenested = true;
			Network.link.call($this.parent(), data);
		}
	});
	//Dom.leftMainFloat.on('click', '.sui-link:not(.selected), .sui-link[data-link-tab="sector"][data-link-placement="replace"]', function (event, data) {
	Dom.leftMainFloat.on('click', '.sui-link', function (event, data) {
		var $this = $(this);
		if ($this.isDisable()) return;
		Network.link.call($this, $.extend({},data));
		Panel.blockList.children('li.selected').trigger('click');
		if ($.CURR.navTool) Dom.document.trigger('click');
	});
	Dom.navLeft.on('click', '.sui-link', function (event, data) { // :attrHas("data-link"):not(.selected)
		event.stopPropagation();
	});
	Dom.navLeft.on('click', '#authLogout, #authLogout2, #authLogout3', function (event) {
		var $this = $(this);
		if (!$this.is('[data-link-sui]')){
			Network.link.call($this, {
				cache: false
			});
		}
		$this.one('ajax:done',function(){
			Dom.body.find('.sui-header-top, .sui-header-bar, #suiAsideLeft, #suiMain').remove();
			setTimeout(function () { window.location.reload(true); }, 250);
		});
	});
	Dom.navLeft.on('click', '.sui-link:not(.selected)', function (event) { // :attrHas("data-link"):not(.selected)
		var $this = $(this);
		if ($this.isDisable()) return;
		if (($this.tag() == 'li' || $this.tag() == 'a') && !$this.is('[data-link-confirm]')) {
			Panel.navLeft.find('.sui-link.selected').removeClass('selected');
			$this.addClass('selected');
			if (Device.ismobile) {
				Dom.body.addClass('leftcollapsed');
			}
		}
		event.stopPropagation();
	});
	Dom.navLeft.on('click', '.sui-link.selected', function (event) { // :attrHas("data-link"):not(.selected)
		if (Device.ismobile) {
			Dom.body.addClass('leftcollapsed');
		}
	});
	Dom.blockList.on('click', 'li', function (event) {
		var $this = $(this);
		var $nav = $this.closest('.sui-nav');
		if ($('body').hasClass('leftcollapsed') && !Device.ismobile) {
			if ($this.hasClass('selected')) {
				$this.removeClass('selected');
				$nav.find('.block#' + $this.data('id')).removeClass('selected');
				$.CURR.navBlock = null;
			} else {
				$this.closest('.sui-nav').find('.block.selected').removeClass('selected');
				$this.siblings('li.selected').removeClass('selected');
				$this.addClass('selected');
				$nav.find('.block#' + $this.data('id')).addClass('selected');
				$.CURR.navBlock = $this;
			}
		} else {
			$nav.find('.block.selected').removeClass('selected');
			$this.siblings('li').removeClass('selected');
			$nav.find('.block#' + $this.data('id')).addClass('selected');
			$this.addClass('selected');
			$nav.find('.scroll-custom').customScroll('update');
		}
		event.stopPropagation();
	});
	Dom.navLeft.on('click', '.area > .block > .wrap > .group > .name', function (event) {
		var $group = $(this).parent();
		if ($group.hasClass('collapsed')) {
			$group.removeClass('collapsed').addClass('expanded');
		} else {
			$group.removeClass('expanded').addClass('collapsed');
		}
		Panel.navLeft.find('.scroll-custom').customScroll('update');
	});
	Dom.navLeft.on('click', '.group .item', function (event) {
		var $this = $(this);
		if ($this.closest('.sui-nav').data('alias') == 'notifications') {
			Plugin.notification.readed($this);
		}
	});
	Dom.leftCollapser.on('click', function (event) {
		$('body').toggleClass('leftcollapsed');
		event.stopPropagation();
	});
	Dom.sectorTabs.on('animeclose', 'li:not(.selected)', function (event) {
		var $this = $(this);
		var $sector = Panel.sectorsContainer.children('#' + $this.data('sector'));
		if (Device.ismobile) {
			$sector.hide().css('opacity', 0);
			$sector.velocity({
				scale: [1, 1.2],
				opacity: [1, 0],
				display: 'block'
			}, {
					duration: 220,
					complete: function () { $sector.css('transform', ''); }
				}, 'ease-out');
		}
		$this.trigger('click');
	});
	Dom.sectorTabs.on('click', 'li', function (event, animate, fake) {
		var $this = $(this);
		var $opener = $this.data('opener') || Panel.navLeft.find('.sui-link[data-link-sector="' + $this.data('sector') + '"]');
		var $sector = Panel.sectorsContainer.children('#' + $this.data('sector'));
		//////////////////////////////////////////
		if (!$sector.data('tab')) $sector.data('tab', $this);
		//////////////////////////////////////////
		Panel.sectorsContainer.children('.sui-sector.selected:not(.alwaysactive)').trigger('sector:hide').removeClass('selected');
		if (animate) {
			Panel.sectorsContainer.children('#' + $this.data('sector')).css('opacity', 0).addClass('selected').velocity({
				translateX: animate == 'next' ? [0, 50] : [0, -50],
				opacity: [1, 0]
			}, {
				duration: 220,
			}, 'ease-out');
		} else {
			$sector.addClass('selected');
		}
		$sector.trigger('sector:show');
		Panel.navLeft.find('.sui-link.selected').removeClass('selected');
		Panel.sectorTabs.children('li.selected').removeClass('selected');
		$this.addClass('selected');
		$opener.addClass('selected');
		///////////////////////////////////////////////
		// HISTORY
		///////////////////////////////////////////////
		if (!fake && $sector.data('history')) {
			Network.history.tab($sector);
		}
		///////////////////////////////////////////////
		Dom.document.click();
		event.stopPropagation();
	});
	Dom.sectorTabs.on('swipeleft', 'li', function (event) {
		if (Device.ismobile) {
			var $this = $(this);
			$this.next('li').trigger('click', ['next']);
			event.stopPropagation();
		}
	});
	Dom.sectorTabs.on('swiperight', 'li', function (event) {
		if (Device.ismobile) {
			var $this = $(this);
			$this.prev('li').trigger('click', ['prev']);
			event.stopPropagation();
		}
	});
	Dom.sectorTabs.on('click', 'li .close', function (event) {
		var $this = $(this),
			$tab = $this.parent();
		Panel.sectorsContainer.children('#' + $tab.data('sector')).trigger('sector:close');
		event.stopPropagation();
	});

	Dom.context.on('sector:close', '.sui-sector', function (event) {
		var $sector = $(this).removeClass('sui-prevent-close');
		var $views = Array.prototype.reverse.call($sector.find('#suiViewsContainer > .sui-view'));
		var isPrevented = false;
		$views.each(function () {
			var $view = $(this);
			if (!$sector.hasClass('sui-prevent-close')) {
				if ($view.hasClass('unsaved')){
					$view.trigger('view:close', ['sector:close']);
					isPrevented = true;
					return false;
				} else {
					$view.trigger('view:close', [true]);
				}
			} else {
				isPrevented = true;
				return false;
			}
		});
		if (!isPrevented) {
			if ($sector.hasClass('float')) {
				$sector.parent().trigger('click');
			} else {
				var $tab = Panel.sectorTabs.find('[data-sector="' + $sector.data('sector') + '"]');
				var $prev = $tab.prev();
				var $next = $tab.next();
				$sector.remove();
				if ($tab.length) {
					if ($tab.hasClass('selected')) {
						if ($next.length) {
							$next.trigger('animeclose');
						} else if ($prev.length) {
							$prev.trigger('animeclose');
						}
					}
					if (!$next.length && !$prev.length) {
						Panel.navLeft.find('.sui-link[data-link-sector="' + $tab.data('sector') + '"]').removeClass('selected');
					}
					$tab.remove();
				}
			}
		}
	});

	Dom.floatSectorContainer.trigger('sector:close');
	Dom.context.trigger('scope:context');

	$('#suiAuth').remove();
	Dom.document.find('.scroll-custom').customScroll();

	if (!Dom.blockList.children('li.selected').length) {
		Dom.blockList.find('li:eq(0)').trigger('click');
	}

	if (!Device.ismobile) {
		var $draggable = Dom.asideLeft.find('.sui-draggable').draggabilly({
			axis: 'x'
		});
		$draggable.on('dragStart', function () {
			Dom.body.addClass('drag-horizontal');
		});
		$draggable.on('dragEnd', function () {
			$draggable.trigger('move', [$draggable.offset().left]);
			Dom.body.removeClass('drag-horizontal');
		});
		$draggable.on('move', function (event, x) {
			var dw = $draggable.width();
			x = x + dw / 2;
			if (x < 180){
				$('body').addClass('leftcollapsed');
				Dom.blockList.children('li.selected').trigger('click');
				x = Dom.asideLeft.width() - dw;
				$draggable.css('left',x);
			} else {
				$('body').removeClass('leftcollapsed');
				if (!Dom.blockList.children('li.selected').length) {
					Dom.blockList.find('li:eq(0)').trigger('click');
				}
				Dom.asideLeft.width(x);
				Dom.main.css({
					'left': x + 'px',
					'width': 'calc(100% - ' + x + 'px)'
				});
			}
			Device.Global.set('drag-panel-position', {
				position: x
			});
			window.dispatchEvent(new Event('resize'));
		});
		var x = Device.Global.get('drag-panel-position') || {};
		if (Dom.asideLeft.data('collapsed') === true && !x.position){ // default collpsed left
			 x.position = 60;
		}
		$draggable.draggabilly('setPosition', x.position).trigger('move', [x.position]);
	}
};
