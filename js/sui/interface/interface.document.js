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
 * INTERFACE - DOCUMENT
 * @description Interface global do documento
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */

sourceui.interface.document = function () {

	'use strict';

	var Document = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Interface = sourceui.interface;
	var Dom = Interface.dom = {};


	Dom.window = this.window = $(window);
	Dom.document = this.element = $(document);
	Dom.head = this.head = $('head');
	Dom.body = this.body = $('#suiBody');
	Dom.userguide = $('#suiUserguide');
	Dom.notifyBadge = this.notifyBadge = $('#suiNotifyBadge');
	Dom.notifyContainer = this.notifyContainer = $('#suiNotifyContainer');
	Dom.confirmContainer = this.confirmContainer = $('#suiConfirmContainer');
	Dom.floatSectorContainer = this.floatSectorContainer = $('#suiFloatSectorContainer');
	Dom.context = this.context = $();

	Document.timetick = function ($scope) {
		var $abbr = $scope ? $scope.find('abbr.timeago') : $('abbr.timeago');
		$abbr.each(function () {
			var $this = $(this);
			var stamp = parseInt(moment($this.data('stamp') * 1000).unix());
			if (stamp) {
				var timeago = $.timeago(stamp);
				$this.html('<span>' + timeago + '</span>');
			}
		});
	};

	Document.element.on('scope:context', '#suiFloatSectorContainer, #suiContext', function () {
		var context = $(this);
		context.on('click', '.viewnav > .prev', function (event) {
			var $this = $(this);
			if ($this.hasClass('disable')) return;
			var $sector = $this.closest('.sui-sector');
			var $sel = $sector.find('.sui-tabs-view > ol > li.selected');
			var $prev = $sel.prev('li');
			$prev.trigger('click');
		});
		context.on('click', '.viewnav > .next', function (event) {
			var $this = $(this);
			if ($this.hasClass('disable')) return;
			var $sector = $this.closest('.sui-sector');
			var $sel = $sector.find('.sui-tabs-view > ol > li.selected');
			var $next = $sel.next('li');
			$next.trigger('click');
		});
		context.on('click', '#suiTabsView > ol > li', function (event) {
			event.stopPropagation();
			var $this = $(this);
			var $sector = $this.closest('.sui-sector');
			var $target = $sector.find('#' + $this.data('view'));
			if ($target.is('.covered')) {
				$this.closest('.sui-sector-title').addClass('covered');
			} else {
				$this.closest('.sui-sector-title').removeClass('covered');
			}
			Dom.document.click();
		});
		context.on('click', '#suiTabsView > ol > li:not(.selected)', function (event, fake) {
			var $this = $(this);
			var $sector = $this.closest('.sui-sector');
			var $target = $sector.find('#' + $this.data('view'));
			var $views = $sector.find('#suiViewsContainer');
			var $prevsel = $this.prev('.selected:not(.alwaysactive)');
			var $nextsel = $this.next('.selected:not(.alwaysactive)');
			var $viewnav = $sector.find('.viewnav:not(.custom)');
			var $hastool = $target.children('.toolbar');
			//////////////////////////////////////////
			if (!$target.data('tab')) $target.data('tab', $this);
			//////////////////////////////////////////
			if ($this.is(':only-child')) {
				$viewnav.filter(':eq(0)').addClass('disable');
				$viewnav.filter(':eq(1)').addClass('disable');
			} else if ($this.is(':first-child')) {
				$viewnav.filter(':eq(0)').addClass('disable');
				$viewnav.filter(':eq(1)').removeClass('disable');
			} else if ($this.is(':last-child')) {
				$viewnav.filter(':eq(0)').removeClass('disable');
				$viewnav.filter(':eq(1)').addClass('disable');
			} else {
				$viewnav.filter(':eq(0)').removeClass('disable');
				$viewnav.filter(':eq(1)').removeClass('disable');
			}
			if ($prevsel.length) {
				var $prevview = $views.children('#' + $prevsel.data('view'));
				$prevview.removeClass('selected');
				$target.addClass('selected');
				if (Device.ismobile) {
					$target.css('opacity', 0);
					$target.velocity({
						translateX: [0, 100],
						opacity: [1, 0]
					}, 220, 'ease-out', function () { $target.css('transform', '').trigger('view:open'); }); // HACKY - retirar o transform para que o fundo transparente fique por cima das barras
					$this.velocity({
						translateX: [0, 60],
						opacity: [1, 0]
					}, 220, 'ease-out');
				} else {
					$target.trigger('view:open');
				}
			} else if ($nextsel.length) {
				var $nextview = $views.children('#' + $nextsel.data('view'));
				$nextview.removeClass('selected');
				$target.addClass('selected');
				if (Device.ismobile) {
					$target.css('opacity', 0);
					$target.velocity({
						translateX: [0, -100],
						opacity: [1, 0]
					}, 220, 'ease-out', function () { $target.css('transform', '').trigger('view:open'); }); // HACKY - retirar o transform para que o fundo transparente fique por cima das barras
					$this.velocity({
						translateX: [0, -60],
						opacity: [1, 0]
					}, 220, 'ease-out');
				} else {
					$target.trigger('view:open');
				}
			} else {
				$views.children('.sui-view.selected:not(.alwaysactive)').removeClass('selected');
				$target.addClass('selected').trigger('view:open');
			}
			if ($hastool.length) {
				$sector.children('.sui-sector-title').removeClass('sui-topper-bar');
				$hastool.addClass('sui-topper-bar');
			} else {
				$sector.children('.sui-sector-title').addClass('sui-topper-bar');
			}
			$this.addClass('selected');
			$this.siblings('.selected').removeClass('selected');
			///////////////////////////////////////////////
			// HISTORY
			///////////////////////////////////////////////
			if (!fake && $sector.data('history')) {
				Network.history.tab($sector, $target);
			}
			///////////////////////////////////////////////
		});
		context.on('click', '.sui-tabs-view > ol > li .close', function (event) {
			var $this = $(this);
			var $tab = $this.parent();
			$tab.closest('.sui-sector').find('#' + $tab.data('view')).trigger('view:close');
			event.stopPropagation();
		});
		context.on('click swipedown', '.sui-tabs-view > ol > li', function () {
			var $this = $(this);
			var $toolbar = $this.closest('.sui-sector').find('#' + $this.data('view') + ' > .toolbar');
			var data = $toolbar.data('scrollhide');
			if (data && data.top !== 0) {
				$toolbar.velocity({
					translateY: 0
				}, 150);
				data.direction = 'up';
			}
		});
		/*
		context.on('click','.sui-buttonset .sui-button > a',function(event,data){
			var $this = $(this);
			if (!$this.isDisable()){
				Network.link.call($this,$.isPlainObject(data)?data:null);
				//Panel.navLeft.find('.area > .blocklist > li.selected').trigger('click');
			}
		});
		*/
	});


	Document.element.on('parseui', function (event, setup) {
		var ui = setup.response.parsedSNIP || setup.response.parsedJQ || $(setup.response.parsedHTML);
		ui.find('.disable').disable();
		ui.find('.ignored').ignored();
		if (ui.is('#suiAuthContainer')) {
			if (sourceui.interface.auth) ui.data('Interface', new sourceui.interface.auth(ui, setup));
		} else if (ui.filter('#suiMain').length == 1) {
			if (sourceui.interface.panel) ui.data('Interface', new sourceui.interface.panel(ui, setup));
		} else if (ui.hasClass('sui-sector')) {
			if (sourceui.interface.sector) ui.data('Interface', new sourceui.interface.sector(ui, setup));
			ui.children('.sui-views-container').children('.sui-view').each(function () {
				var $view = $(this);
				$view.data('Interface', new sourceui.interface.view($view, setup));
			});
		} else if (ui.hasClass('sui-view')) {
			if (sourceui.interface.view) ui.data('Interface', new sourceui.interface.view(ui, setup));
		} else if (ui.hasClass('sui-widget')) {
			if (sourceui.interface.widget && sourceui.interface.widget[ui.data('type')]) ui.data('Interface', new sourceui.interface.widget[ui.data('type')](ui, setup));
		} else if (ui.hasClass('sui-fieldset')) {
			ui.find('.sui-field').customField();
		} else if (ui.filter('.sui-field').length) {
			ui.filter('.sui-field').customField();
		}
		ui.find('.sui-widget').each(function () {
			var $widget = $(this);
			if (sourceui.interface.widget[$widget.data('type')]) $widget.data('Interface', new sourceui.interface.widget[$widget.data('type')]($widget, setup));
		});
		if (setup.render == '@datagrid-list') {
			if (setup.widget) {
				setup.widget.data('Interface').init();
			}
		}
		ui.find('[data-tip]').tip();
		ui.find('.scroll-custom').customScroll();
		ui.find('[data-chart-type]').each(function () {
			var $this = $(this);
			var data = $this.text();
			$this.text('');
			eval('data = ' + data);
			data = $.extend(true, {
				tooltip: {
					borderRadius: 0
				},
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: 0,
					plotShadow: false,
					margin: [0, 0, 0, 0],

				},
				title: false,
				tip: {
					number: true,
					series: true,
				},
			}, data);
			data = $.extend(true, data, {
				tooltip: data.tip ? {
					useHTML: true,
					shadow: false,
					backgroundColor: 'rgba(255,255,255,0.9)',
					delayForDisplay: 150,
					hideDelay: 150,
					formatter: function () {
						var value = this.y, html = '';
						if (data.tip.percent) value = $.toFloat(this.y, data.tip.decimal || 1) + '%';
						else if (data.tip.money) value = $.toMoney(this.y, '');
						else if (data.tip.int) value = $.toInt(this.y);
						else if (data.tip.number) value = $.toNumber(this.y);
						if (data.tip.prefix) value = data.tip.prefix + ' ' + value;
						if (data.tip.series) html += '<small style="color:#999" style="font-size:0.8em;">' + this.series.name + '</small><br/>';
						if (data.tip.labels) html += data.tip.labels[this.point.index] || '';
						else if (this.point.name) html += this.point.name;
						else if (this.x) html += this.x;
						html += ' <strong style="color:' + (data.tip.color === false ? '#333' : data.tip.color || this.point.color) + '">' + value + '</strong>';
						return '<div style="font-size:11px; letter-spacing:-0.5px;">' + html + '</div>';
					}
				} : {},
				title: data.title === false ? { text: "" } : data.title,
				subTitle: data.title === false ? { text: "" } : data.subTitle,
				credits: data.title === false ? { enabled: false } : data.credits,
				lang: { noData: "Não ha dados para serem vistos no gráfico" },
				noData: { style: { fontWeight: "500", fontSize: "11px", color: "#DDD" }}
			});
			if (data.chart.height) $this.closest('.column, .line, .area').css('minHeight', data.chart.height);
			setTimeout(function () {
				$this.highcharts(data);
			}, 1);
		});
		ui.find('a > code').each(function () {
			var $a = $(this).parent();
			$.suiBind($a);
		});
		ui.find('.sui-widget > code').each(function () {
			var $wg = $(this).parent();
			$.suiBind($wg);
		});
		ui.find('[data-link-clipboard]').each(function () {
			var cb = new ClipboardJS(this, {
				text: function (trigger) {
					return $(trigger).data('link-clipboard');
				}
			});
			cb.on('success', function (e) {
				if ($.tipster.notify) $.tipster.notify('Dado copiado');

			});
			cb.on('error', function (e) {
				if ($.tipster.notify) $.tipster.notify('Dado não copiado');
			});
		});
		if (!Device.ismobile) {
			ui.find('.sui-layout.table.mansory .cell').each(function () {
				var $cell = $(this);
				setTimeout(function () {
					var maxh = 0;
					$cell.children().each(function () {
						var $this = $(this);
						var h = $this.position().top + $this.outerHeight();
						if (h > maxh) maxh = h;
					});
					$cell.height(maxh);
				}, 10);
			});
		}
		var $cover = ui.find('picture.sui-cover');
		if ($cover.length){
			setTimeout(function(){
				var $profile = ui.find('.sui-widget.profile:last, .sui-widget.overcover');
				if ($profile.length){
					var height = 0;
					$profile.each(function(){
						var $p = $(this);
						height += $p.offset().top + $p.height() - $cover.offset().top;
					});
					if (height > 0) $cover.height(height + 16);
				}
			},100);
		}
		Document.timetick(ui);
	});


	$.CURR = {};

	Document.element
		.on('click', function (event) {

			var Device = sourceui.instances.device;

			var $target = $(event.target);

			if ($.CURR.droplist) {
				if ($target.length && ($target.is('.sui-droplist-container') || !$target.closest('.sui-droplist').length)) {
					$.CURR.droplist.trigger('droplist:close');
				}
			}
			if ($.CURR.customField) {
				if ($target.length && !$target.closest('.sui-field').length) {
					$.CURR.customField.blur();
					$.CURR.customField.trigger('field:blur');
				}
			}
			if ($.CURR.navTool) {
				if (!Device.ismobile && !$.CURR.confirm && $target.length && !$target.closest('.sui-nav').length) {
					Dom.navTools.find('.navigation').trigger('click');
					$.CURR.navTool = null;
				}
			}
			if ($.CURR.navBlock) {
				if (!Device.ismobile && !$.CURR.confirm && $target.length && !$target.closest('.sui-nav').length) {
					$.CURR.navBlock.trigger('click');
				}
			}
			if ($.CURR.confirm) {
				if ($target.length && $target.is('.sui-confirm')) {
					sourceui.instances.interface.plugins.confirm.close();
				}
			}
			if ($.CURR.FloatSector) {
				if ($target.length && $target.is('.sui-floatsector-container')) {
					$.CURR.FloatSector.children('.close').trigger('click');
				}
			}
		})
		.on('droplist:add', function (event, $drop) {
			var $body = $('#suiBody');
			var $droplistContainer = $('#suiDroplistContainer');
			var $parent = $drop.parent();
			var $controller = $parent.closest('.sui-field');
			if (!$controller.length) $controller = $parent;
			$droplistContainer.append($drop).data('parent', $parent).data('ctrler', $controller);
			$drop.on('click', function (event) {
				event.stopPropagation();
			});
		})
		.on('droplist:remove', function () {
			var $body = $('#suiBody');
			var $droplistContainer = $('#suiDroplistContainer');
			var $drop = $droplistContainer.children('.sui-droplist');
			if ($drop.length) {
				var $parent = $droplistContainer.data('parent');
				if ($parent && $parent.length) {
					$parent.append($drop);
					var $controller = $droplistContainer.data('ctrler');
					var $toggler = $drop.data('toggler');
					if ($toggler && $toggler.length) $toggler.removeClass('listopened');
					if ($controller && $controller.length) $controller.removeClass('droplisted');
				}
				else $droplistContainer.html('');
			}
			$droplistContainer.removeData('parent');
			$droplistContainer.removeData('ctrler');
		})
		.on('droplist:open', '.sui-droplist', function (event) {
			var $body = $('#suiBody');
			var $droplistContainer = $('#suiDroplistContainer').attr('class', 'sui-droplist-container');
			var $drop = $droplistContainer.children('.sui-droplist');
			if (!$drop.length || $drop[0] !== this) {
				$drop = $(this);
				Document.element.trigger('droplist:remove');
				Document.element.trigger('droplist:add', [$drop]);
			}
			var isVisible = $droplistContainer.is(':visible');
			var coord = {};
			var $parent = $droplistContainer.data('parent');
			var $controller = $droplistContainer.data('ctrler');
			if ($controller.is('.sui-field')) {
				var $wrap = $parent.closest('.wrap');
				$wrap.css('height', $wrap.outerHeight());
				if (!sourceui.instances.device.ismobile) {
					coord.width = $wrap.outerWidth();
					coord.height = $controller.outerHeight();
					coord.offset = $parent.offset();
				}
				$droplistContainer.addClass('field ' + $controller.data('type') + ' ' + $controller.data('mode'));
			} else {
				if (!sourceui.instances.device.ismobile) {
					coord.width = $parent.outerWidth();
					coord.height = $controller.outerHeight();
					coord.offset = $parent.offset();
					coord.offset.top += coord.height;
				}
			}
			if (!sourceui.instances.device.ismobile) {
				var transformOrigin;
				if (!isVisible) {
					$droplistContainer.css('opacity', 1).show();
					$drop.css('opacity', 0).show();
				}
				coord.listw = $drop.outerWidth();
				coord.listh = $drop.outerHeight();
				if (coord.offset.left + coord.listw > Document.window.innerWidth()) {
					coord.offset.left = Document.window.innerWidth() - coord.listw;
				}
				if (coord.offset.top + coord.listh >= Document.window.innerHeight()) {
					coord.offset.top -= coord.height + coord.listh + 2;
					transformOrigin = 'bottom';
				} else {
					transformOrigin = 'top';
				}
				$drop.css({
					'top': coord.offset.top,
					'left': coord.offset.left,
					'transform': 'scaleY(0.75)',
					'min-width': (($controller.is('.sui-field')) ? coord.width || $drop.css('min-width') || 'inherit' : $drop.css('min-width'))
				});
				$drop.css('transform-origin', transformOrigin);
				$drop.velocity({
					scaleY: [1, 0.75],
					opacity: [1, 0]
				}, {
						duration: 200,
						complete: function () { $.CURR.droplist = $drop; }
					});
			} else {
				if (!isVisible) {
					$droplistContainer.css('opacity', 0);
					$droplistContainer.velocity({
						opacity: [1, 0]
					}, {
							duration: 250,
							display: 'block'
						});
					$drop.css('transform', 'translateY(50)');
					$drop.velocity({
						translateY: [0, 100]
					}, {
							duration: 250,
							display: 'block',
							complete: function () { $.CURR.droplist = $drop; }
						});
				}
			}
			$body.addClass('droplisted');
			$controller.addClass('droplisted');
			Document.element.trigger('activity:hoverin', [$drop]);
		})
		.on('droplist:close', function (event) {
			$.CURR.droplist = null;
			var $body = $('#suiBody');
			if (!$body.is('.droplisted')) return;
			var $droplistContainer = $('#suiDroplistContainer');
			var $drop = $droplistContainer.children('.sui-droplist');
			var $controller = $droplistContainer.data('ctrler');
			var $parent = $droplistContainer.data('parent');

			if (!sourceui.instances.device.ismobile) {
				if ($controller.is('.sui-field')) {
					var $wrap = $parent.closest('.wrap');
					$wrap.css('height', 'initial');
				}
			}

			if (!$parent.length) {
				$droplistContainer.attr('class', 'sui-droplist-container').html('');
				$droplistContainer.data('parent', null);
			} else {
				var $controller = $droplistContainer.data('ctrler');
				$body.removeClass('droplisted');
				$controller.removeClass('droplisted');
			}
			var isVisible = $droplistContainer.is(':visible');
			if (!sourceui.instances.device.ismobile) {
				$droplistContainer.hide();
			} else {
				if (isVisible) {
					$drop.velocity({
						translateY: [100, 0]
					}, 250);
					$droplistContainer.velocity({
						opacity: [0, 1]
					}, {
							duration: 250,
							display: 'none'
						});
				}
			}
			Document.element.trigger('activity:hout');
			event.stopPropagation();
		})
		.on('field:focus', '.sui-field', function (event) {
			if ($.CURR.customField) {
				if ($.CURR.customField[0] === this) return;
				else $.CURR.customField.trigger('field:blur');
			}
			$.CURR.customField = $(this);
			$.CURR.customField.addClass('focus').closest('.sui-fieldgroup').addClass('focus');
			event.stopPropagation();
		})
		.on('field:blur', '.sui-field', function (event) {
			if ($.CURR.customField) {
				if ($.CURR.customField[0] === this) {
					var customField = $.CURR.customField;
					$.CURR.customField = null;
				}
			}
			$(this).removeClass('focus').closest('.sui-fieldgroup').removeClass('focus');
			event.stopPropagation();
		});

	Dom.window.on('resize', function () {
		$('#suiTipster').children().each(function () {
			$(this).trigger('tip:hide');
		});
	});

	$('.sui-droplist-container').on('click', function () {
		if (sourceui.instances.device.ismobile) Document.element.click();
	});


	Dom.floatSectorContainer.trigger('scope:context');

	setInterval(Document.timetick, 60000);

	Dom.body.addClass('sui-ajax').addClass('loading').prepend($(Template.get('spinner')));

	Dom.document.on('panelready', function () {
		Network.history.following = false;
	});

};
