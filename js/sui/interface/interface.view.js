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

sourceui.interface.view = function ($view, setup) {

	'use strict';

	var View = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Plugin = sourceui.instances.interface.plugins;
	var Notify = Plugin.notify;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	View.element = $view || setup.response.parsedJQ;
	View.sector = View.element.closest('.sui-sector');
	View.scrolltabs = View.sector.find('#suiTabsView');
	View.tabsview = View.sector.find('#suiTabsView ol');
	Dom.document.trigger('activity:focusin', [View.element]);
	View.controller = View.element.children('[data-alias="controller"]');
	View.toolbar = View.element.children('.toolbar');
	View.puller = View.element.prevAll('.puller');
	View.pullerspin = View.puller.find('.spin');

	if (View.controller.length) {

		// generic buttons
		View.controller.on('click', 'li a', function (event) {
			var $a = $(this), data = $a.data(), link = $a.link();
			if ($a.isDisable()) return;
			if (data.alias == 'droplist') {
				if (!$a.data('droplist')) {
					var $droplist = $a.find('.sui-droplist');
					$droplist.on('click', 'li[data-link-sui]', function () {
						var $li = $(this);
						var ldata = $li.link('_self');
						ldata.trigger = $li;
						Network.link.call($a, ldata);
						$droplist.trigger('droplist:close');
					});
					$a.data('droplist', $droplist);
				}
				$a.data('droplist').trigger('droplist:open');
				event.stopPropagation();
			}
		});

		var ctdata = View.controller.data('controller');
		if (ctdata == '@form') {
			View.widgets = View.element.find('.sui-widget');
			View.widgets.on('field:input', function () {
				var $widget = $(this);
				$widget.data('Interface').common.toggleTools('field:input', 'enable', View.controller);
			});
			View.element.on('form:valid', function (event, $a, wgdata) {
				Network.link.call($a, wgdata);
				$a.filter('[data-alias="save"]').parent().disable();
			});
			View.element.on('form:invalid', function (event) {
				Notify.open({
					type: 'error',
					name: 'Validação',
					label: 'Ops... algo errado não está certo, Batman',
					message: 'Dados do formulário são invalidos',
				});
			});
			View.controller.on('click', 'li a', function (event) {
				var $a = $(this), data = $a.data(), link = $a.link();
				if ($a.isDisable()) return;
				if (data.alias == 'save' || data.alias == 'exec' || data.alias == 'process') {
					$a.data('linkCache', false);
					var valid = true;
					var wgdata = {};
					View.widgets.each(function () {
						var $widget = $(this);
						var scope = $widget.data('Interface');
						if (typeof scope == 'object' && typeof scope.widgetData == 'function') {
							scope.widgetData();
							if (scope.valid !== true) {
								valid = scope.valid;
								return true;
							} else {
								wgdata = $.extend(true, wgdata, scope.wgdata);
							}
						}
					});
					if (valid === true) {
						View.element.trigger('form:valid', [$a, wgdata]);
					} else if (valid === false) {
						View.element.trigger('form:invalid');
					}
				} else if (data.alias == 'filter') {
					var wgdata = {};
					View.widgets.each(function () {
						var $widget = $(this);
						var scope = $widget.data('Interface');
						if (typeof scope == 'object' && typeof scope.widgetData == 'function') {
							scope.widgetData();
							wgdata = $.extend(true, wgdata, scope.wgdata);
							var htmlFilter = '';
							if (data.target) {
								var $target = $(data.target);
								if ($target.length) {
									var $ul = $target.find('.sui-filterset ul');
									$ul.children('li:not(.empty)').remove();
								} else {
									console.warn('O target ' + data.target + ' não pode ser encontrado.');
									return false;
								}
							}
							$.each(wgdata.data, function (k, v) {
								if ((v || v === 0) && wgdata.info[k]) {
									if ($ul) {
										$ul.append(Template.get('wg', 'form', 'filter', {
											class: { selected: 'selected' },
											label: { name: wgdata.info[k].label, value: wgdata.info[k].text || ($.isArray(v) ? v.join(',') : v), content: '' },
											data: { name: k }
										}));
										$ul.find('[data-name="' + k + '"]').data('value', v);
									}
								}
							});
							$target.trigger('datagrid:filter');
							$('#suiFloatSectorContainer').click();
						}
					});
				} else if (data.alias == 'wizard') {
					Interface.document.new.floatSector({
						caller: View.element,
						title: 'Seletor',
						size: link.sectorsize || 'large',
						link: link,
						on: {
							'alias:finish': {
								bind: View.element,
								fn: function (regs) {
									alert('finish')
								}
							}
						}
					});
					event.stopPropagation();
				} else if (data.alias == 'clear') {
					View.widgets.filter('.form, .wizard').find('.sui-field').val('');
				} else if (data.alias == 'refresh') {
					$a.data('linkCache', false);
					Network.link.call($a, data);
				} else if (data.alias == 'external') {
					$a.data('linkCache', false);
					Network.link.call($a, data);
				} else if (data.alias == 'cancel') {
					View.element.closest('.sui-sector').children('.sui-sector-title').find('.viewnav > .prev').trigger('click');
					View.element.trigger('view:close');
				} else if (data.alias == 'minimize') {
					View.element.find('.sui-widget.maximized:eq(0) .title a.maximize').trigger('click');
				} else if (link && link.sui) {
					Network.link.call($a);
				} else if (data.alias != 'droplist' && data.alias != 'action') {
					console.warn('O controlador foi marcado como ' + View.controller.data('controller') + '.' + "\n" + 'A ação requer um botão com um atributo alias conhecido pelo controlador.');
				}
				event.stopImmediatePropagation();
				return;
			});
		} else if (ctdata == '@profile') {
			View.controller.on('click', 'li a', function (event) {
				var $a = $(this), data = $a.data(), link = $a.link();
				if ($a.isDisable()) return;
				if (data.alias == 'refresh') {
					$a.data('linkCache', false);
					Network.link.call($a, data);
				} else if (link && link.sui) {
					Network.link.call($a);
				}
				event.stopImmediatePropagation();
			});
		} else if (ctdata == '@upillow') {

		} else if (ctdata == '@upload') {
			View.widget = View.element.find('.sui-widget.upload');
			View.widget.on('uploads:complete', function () {
				View.widget.data('Interface').common.toggleTools('uploads:complete', 'enable', View.controller);
			});
			View.widget.on('queue:change queue:clear', function () {
				View.widget.data('Interface').common.toggleTools('queue:clear', 'disable', View.controller);
				View.widget.data('Interface').common.toggleTools('queue:change', 'disable', View.controller);
			});
			View.controller.on('click', 'li a', function (event) {
				var $a = $(this), data = $a.data();
				if ($a.isDisable()) return;
				if (data.alias == 'pick') {
					var scope = View.widget.data('Interface');
					if (typeof scope == 'object' && typeof scope.widgetData == 'function') {
						View.widget.trigger('alias:pick', [scope.widgetData()]);
					}
				}
				return;
			});
		} else if (ctdata == '@calendar') {
			View.widget = View.element.find('.sui-widget.calendar');
			View.controller.on('click', 'li a', function (event) {
				var $a = $(this), data = $a.data();
				if ($a.isDisable()) return;
				var scope = View.widget.data('Interface');
				var swd = scope.widgetData();
				if (data.alias == 'new' || data.alias == 'refresh') {
					Network.link.call($a, { filter: swd.date ? { date: swd.date } : { month: swd.month } });
				}
				event.stopImmediatePropagation();
				return;
			});
		} else {
			var $controled = View.element.find(this.controller.data('controller'));
			var $ctrl = this.controller.add($controled.find('.title .toolbar'));
			$controled.data('controller', $ctrl);
		}
	}
	View.element.children('.sui-cover').each(function () {
		var $cover = $(this);
		var $code = $cover.children('code');
		if ($code.length) {
			if ($code.attr('type') == 'trianglify') {
				$.imgCover($cover, JSON.parse($code.text()));
			}
		}
	});
	if (View.tabsview.length) {
		if (View.scrolltabs.hasClass('scroll-custom')) View.scrolltabs.removeClass('scroll-custom').customScroll({ suppressScrollX: false });
		var $newtab = View.element.find('#suiTabToAppend');
		var $tab;
		if ($newtab.length) {
			var $oldtab = [];
			if (setup.target && setup.target.is('.sui-view')) {
				$oldtab = View.tabsview.find('[data-view="' + setup.target.attr('id') + '"]');
			} else {
				$oldtab = View.tabsview.find('[data-view="' + View.element.attr('id') + '"]');
			}
			if ($oldtab.length) {
				if (setup.placement.indexOf('replace') > -1) {
					if ($oldtab.data('view') !== $newtab.data('view')) {
						$oldtab.replaceWith($newtab.removeAttr('id'));
						$tab = $newtab.trigger('click');
					} else {
						$oldtab.html($newtab.html());
						$tab = $oldtab.trigger('click');
					}
				} else if (setup.targetstring == '@view-prev') {
					$oldtab.before($newtab.removeAttr('id'));
					$tab = $newtab.trigger('click');
				} else if (setup.targetstring == '@view-next') {
					$oldtab.after($newtab.removeAttr('id'));
					$tab = $newtab.trigger('click');
				} else if (setup.targetstring == '@view-first') {
					View.tabsview.prepend($newtab.removeAttr('id'));
					$tab = $newtab.trigger('click');
				} else if (setup.targetstring == '@view-last') {
					View.tabsview.append($newtab.removeAttr('id'));
					$tab = $newtab.trigger('click');
				}
			} else {
				View.tabsview.append($newtab.removeAttr('id'));
				$tab = $newtab.trigger('click');
			}
		}
		setTimeout(function () {
			View.scrolltabs.scrollLeft(9999).customScroll('update');
		}, 10);
	}
	/*
	var $viewtab = View.element.find('#suiTabToAppend');
	if ($viewtab.length){
		var $tab = $viewtab.clone(),
			$sector = (setup.sector && setup.sector.length) ? setup.sector : setup.target.closest('.sui-sector'),
			$tabgrp = $sector.find('#suiTabsView ol'),
			$hastab = [];
		if (setup.placement == 'replace'){
			if (setup.target && $tab.data('view') !== setup.target.attr('id')){
				$hastab = ($tabgrp.length) ? $tabgrp.find('[data-view="'+setup.target.attr('id')+'"]') : [];
			}
		}
		if (!$hastab.length){
			$hastab = ($tabgrp.length) ? $tabgrp.find('[data-view="'+$tab.data('view')+'"]') : [];
		}
		if ($hastab.length){
			$hastab.replaceWith($tab.removeAttr('id'));
			$tab.trigger('click');
		} else if ($tabgrp.length) {
			if (setup.targetstring == '@view-prev' || setup.placement == 'prepend'){
				$tab.removeAttr('id').prependTo($tabgrp).trigger('click');
			} else {
				$tab.removeAttr('id').appendTo($tabgrp).trigger('click');
			}
		}
	}
	*/
	View.element.on('view:close', function (event, force) {
		var $view = $(this);
		var $tab = View.sector.find('#suiTabsView [data-view="' + View.element.attr('id') + '"]');
		var $prev = $tab.prev();
		if (!force) {
			var $prevall = $view.prevAll('.sui-view');
			var $nextall = $view.nextAll('.sui-view');
			if (!$prevall.length) {
				View.sector.trigger('sector:close');
			} else if ($nextall.length) {
				$nextall.each(function () {
					$(this).trigger('view:close', [true]);
				});
			}
		}
		// ###########################################################
		// algoritmo de teste para ver se existe um registro em edição
		// usar o $.each para testar uma view por vez
		// ###########################################################
		View.element.find('.ace_editor').each(function () {
			var editor = $(this).data('editor');
			if (typeof editor == 'object') {
				editor.destroy();
			}
		});
		View.element.find('.mce-tinymce').each(function () {
			var editor = $(this).next('textarea');
			if (editor.length && editor.attr('id')) {
				tinymce.execCommand('mceRemoveControl', true, editor.attr('id'));
			}
		});
		View.element.find('.sheet').each(function () {
			var hot = $(this).data('hot');
			if (typeof hot == 'object') {
				hot.destroy();
			}
		});
		View.element.remove();
		$tab.remove();
		$prev.trigger('click');
		if ($prev.is(':last-child')) {
			View.scrolltabs.scrollLeft(9999).customScroll('update');
		}
		event.stopPropagation();
	});

	View.element.on('swipestart', function (event) {
		View.puller.css({ 'opacity': 0 });
		View.pullerspin.velocity('stop', true);
	});
	View.element.on('swipemovedown', function (event) {
		var rz = (event.swipedata.translate * 4) % 360;
		var op = (event.swipedata.translate / 90) * (event.swipedata.translate / 90);
		View.puller.show().css('transform', 'translateY(' + event.swipedata.translate + 'px)');
		View.pullerspin.css('transform', 'rotateZ(' + rz + 'deg)');
		if (event.swipedata.translate <= 90) {
			View.puller.css({ 'opacity': op });
		} else {
			View.puller.css({ 'opacity': '1' });
		}
	});
	View.element.on('swipedown', function (event) {
		if (event.swipedata.translate > 90) {
			var rz = (event.swipedata.translate * 4) % 360;
			View.pullerspin
				.velocity({ 'rotateZ': ['360deg', rz] }, { duration: 150, easing: "linear" })
				.velocity({ 'rotateZ': ['360deg', '0deg'] }, { duration: 500, easing: "linear", loop: true });
			var $refresh = View.element.children('.toolbar').find('.refresh > a');
			if ($refresh.length) {
				View.puller.velocity({ translateY: [40, event.swipedata.translate] }, 300, function () {
					Network.link.call($refresh, {
						onalways: function (setup) {
							if (setup.response.parsedJQ && setup.response.parsedJQ.is('.sui-view')) {
								View.puller.hide();
								View.pullerspin.velocity('stop', true);
							}
						}
					});
				});
			} else {
				View.puller.trigger('fadeout', [event.swipedata.translate]);
			}
		} else {
			View.puller.trigger('fadeout', [event.swipedata.translate]);
		}
		/*
		if (event.swipedata.translate > 90){
			var $refresh = View.element.children('.toolbar').find('.refresh > a');
			if ($refresh.length){
				View.element.velocity({translateY:[50,event.swipedata.translate]},300,function(){
					Network.link.call($refresh,{
						onalways:function(setup){
							if (setup.response.parsedJQ && setup.response.parsedJQ.is('.sui-view')){
								View.pullerspin.removeClass('rotate');
								View.puller.hide();
							}
						}
					});
				});
			} else {
				View.element.velocity({translateY:[0,event.swipedata.translate]},300);
				View.puller.trigger('fadeout');
			}
		} else {
			View.element.velocity({translateY:[0,event.swipedata.translate]},300);
			View.puller.trigger('fadeout');
		}
		*/
	});
	View.puller.on('fadeout', function (event, translate) {
		View.puller.velocity('stop', true).velocity({ opacity: 0, translateY: [0, translate] }, 250, function () {
			View.puller.hide();
			View.pullerspin.velocity('stop', true);
		});
	});
	// ###########################################################
	// hide and show toolbars on scroll
	// ###########################################################
	View.scrolls = View.element.find('.sui-content.scroll-default');
	View.scrdata = {
		paginator: $(),
		scrollmax: 0
	};
	if (setup.placement && setup.placement.indexOf('replace') > -1 && setup.target && setup.target.is('.sui-view')) {
		var scrollTop = View.element.data('scrollTop');
		if (scrollTop) {
			View.scrdata.paginator = View.scrolls.find('.sui-widget.datagrid:last .paginator:not(.clicked):last');
			View.scrdata.paginator.attr('data-link-cache', 'false');
			View.scrdata.paginator.attr('data-link-followscroll', 'true');
			View.scrolls.scrollTop(scrollTop);
		}
	}
	if (Device.ismobile && View.element.hasClass('covered')) {
		View.scrdata.tbcolor = View.toolbar.css('background-color').substring(5).replace(/\s/g, '');
		View.scrdata.tbcolor = View.scrdata.tbcolor.substring(0, View.scrdata.tbcolor.length - 1).split(',').map(function (v) { return Number(v); });
	}
	View.scrolls.on('scrollstop', { latency: 200 }, function (event) {
		var $scr = $(this);
		View.element.data('scrollTop', $scr.scrollTop());
		if ($scr.scrollTop() < 50) View.toolbar.removeClass('shadowed');
	});
	View.scrolls.on("scrollstart", function (event) {
		var $scr = $(this);
		View.scrdata.paginator = $scr.find('.sui-widget.datagrid:last .paginator:not(.clicked):last');
		View.scrdata.scrollmax = $scr.prop("scrollHeight") - $scr.outerHeight();
		View.toolbar.addClass('shadowed');
		Dom.document.trigger('droplist:close');
	});
	View.scrolls.on("scroll", function (event) {
		var $scr = $(this);
		View.scrdata.scrolltop = $scr.scrollTop();
		if (View.scrdata.tbcolor) {
			var tbcolor = [];
			if (View.scrdata.scrolltop === 0) {
				tbcolor = [View.scrdata.tbcolor[0], View.scrdata.tbcolor[1], View.scrdata.tbcolor[2], View.scrdata.tbcolor[3]];
			} else {
				var tbport = View.scrdata.scrolltop / (Dom.document.height() / 1.75);
				if (tbport <= 1) {
					tbcolor = [
						parseInt(View.scrdata.tbcolor[0] + View.scrdata.tbcolor[0] * tbport * 1.75),
						parseInt(View.scrdata.tbcolor[0] + View.scrdata.tbcolor[0] * tbport * 1.75),
						parseInt(View.scrdata.tbcolor[0] + View.scrdata.tbcolor[0] * tbport * 1.75),
						View.scrdata.tbcolor[3] + ((0.9 - View.scrdata.tbcolor[3]) * tbport)
					];
				}
			}
			if (tbcolor.length) View.toolbar.css('background-color', 'rgba(' + tbcolor[0] + ',' + tbcolor[1] + ',' + tbcolor[2] + ',' + tbcolor[3] + ')');
		}
		if (View.scrdata.paginator.length && !View.scrdata.paginator.hasClass('clicked')) {
			if (View.scrdata.scrollmax && View.scrdata.scrollmax - View.scrdata.scrolltop < 250) {
				View.scrdata.paginator.addClass('clicked').trigger('click');
			}
		}

	});
	/*
	View.scrolls.on("scrollstart", function(event) {
		var $scr = $(this);
		var $toolbar = $scr.prev('.toolbar');
		var maxheight = -($toolbar.outerHeight()-1);
		if (event.direction == 'down' && !$toolbar.hasClass('scrollhide')){
			$toolbar.addClass('scrollhide');
		} else if (event.direction == 'up' && $toolbar.hasClass('scrollhide')){
			$toolbar.removeClass('scrollhide');
		}
	});
	*/
	//View.scrolls.on("scroll", function(event) {
	/*
	var $scr = $(this);
	var $toolbar = $scr.prev('.toolbar');
	var scrollTop = $scr.scrollTop();
	//var scrollMax =  $scr.prop("scrollHeight") - $scr.outerHeight();
	if (View.element.is('.covered')){
		if (scrollTop >= 100 && !$toolbar.hasClass('dark')){
			$toolbar.addClass('dark');
		} else if (scrollTop < 100 && $toolbar.hasClass('dark')){
			$toolbar.removeClass('dark');
		}
	}
	*/
	/*
	if (scrollTop >= scrollMax && !$toolbar.hasClass('scrollhide')){
		$toolbar.addClass('scrollhide');
	} else if (scrollTop <= 0 && $toolbar.hasClass('scrollhide')){
		$toolbar.removeClass('scrollhide');
	}
	*/
	//});
	// ###########################################################

	var Footer = {
		status: function (view, setup) {
			if (!view || !view.length) return;
			var $footer = view.find('.sui-layout.footer');
			var $sector = view.closest('.sui-sector');
			var metric = setup.metric.result();
			if ($footer.length) {
				if (setup.iscache) {
					$footer.find('#footCache strong').text('C');
					$footer.find('#footCache mark').removeClass('blue green yellow red').addClass('blue');
				} else if (setup.fromcache) {
					$footer.find('#footCache strong').text('U');
					$footer.find('#footCache mark').removeClass('blue green yellow red').addClass('yellow');
				} else if (setup.hascache) {
					$footer.find('#footCache strong').text('S');
					$footer.find('#footCache mark').removeClass('blue green yellow red').addClass('yellow');
				} else {
					if (setup.cache) {
						$footer.find('#footCache strong').text('S');
						$footer.find('#footCache mark').removeClass('blue green yellow red').addClass('blue');
					} else {
						$footer.find('#footCache strong').text('S');
						$footer.find('#footCache mark').removeClass('blue green yellow red').addClass('green');
					}
				}
				var footname = $sector.find('.sui-sector-title .tabs li[data-view="' + view.attr('id') + '"] strong').text() || $sector.find('.sui-sector-title .name').text();
				if (footname) $footer.find('#footName').text(footname);
				$footer.find('#footStat').html('<strong id="footBytes">' + $.formatBytes(metric.bytesTotal) + '</strong> processados em <strong id="footTime">' + metric.totalTime + 'ms</strong>');
			}
		}
	};

	var moreTools = function ($toolbar) {
		if (!$toolbar.length || $toolbar.data('more')) return;
		var $place = $toolbar.children('.tools.left:last');
		var $ols = $toolbar.find('.tools > ol');
		var $indrop = $();
		var totalWidth = 30;
		var maxWidth = $toolbar.outerWidth();
		$ols.each(function () {
			var $ol = $(this);
			var outerWidth = $ol.outerWidth();
			if (totalWidth + outerWidth > maxWidth) {
				$indrop = $indrop.add($ol);
			} else {
				totalWidth += outerWidth;
			}
		});
		if (!$indrop.length) return;
		if ($ols.length === $indrop.length) {
			totalWidth = 0;
			$ols.filter(':eq(0)').addClass('has-more').find('li').each(function () {
				var $li = $(this);
				var outerWidth = $li.outerWidth();
				if (totalWidth + outerWidth > maxWidth) {
					$li.addClass('in-more');
				} else {
					totalWidth += outerWidth;
				}
			});
		} else {
			$indrop.addClass('has-more').find('li').addClass('in-more');
		}
		var $more = $(Template.get('toolbar', 'more'));
		if ($place.length) $place.after($more);
		else $place = $toolbar.find('.tools.right:first').before($more);

		this.createDrop = function () {
			var label = $toolbar.prev('.label').text() || $toolbar.parent().data('name');
			var htmlDrop = Template.get('droplist', 'list', 'simple', {
				label: label ? label + ' - Opções' : 'Opções',
				child: { toolstop: '', options: '', toolsbottom: '' }
			});
			var $drop = $(htmlDrop);
			$drop.find('.options ul').remove();
			$indrop.each(function () {
				var $ol = $(this);
				var $dropitems = $();
				var $ul = $('<ul/>');
				$ols.find('li.in-more').each(function () {
					var $li = $(this);
					var $a = $li.children('a');
					var icon = $a.data('icon') || $li.data('icon');
					var style = $li.attr('style') || '';
					if (style && style.indexOf('background:') > -1) {
						style = style.replace('background:', 'color:');
						style = ' style="' + style + '"'
					}
					var $item = $(Template.get('droplist', 'option', 'simple', {
						icon: icon.indexOf('icon-') > -1 ? icon : 'icon-' + icon,
						label: $a.text() || $a.attr('alt') || $a.attr('title') || $a.data('alias'),
						class: $a.attr('data-link-confirm') ? 'confirm' : '',
						style: style
					})).data('linkedtool', $a);
					$dropitems = $dropitems.add($item);
				});
				$ul.append($dropitems);
				$drop.find('.options').append($ul);
			});
			$more.append($drop);
			$drop.on('click', '.options li', function () {
				var $li = $(this);
				if ($li.isDisable()) return false;
				$li.data('linkedtool').trigger('click');
			});
			$drop.on('droplist:open', function () {
				$drop.find('.options li').each(function () {
					var $li = $(this);
					var $a = $li.data('linkedtool');
					if ($a.isDisable()) $li.disable(true);
					else $li.disable(false);
				});
			});
			$more.on('click', function (event) {
				$drop.trigger('droplist:open');
				event.stopPropagation();
			});

		};

		this.createDrop();
	};


	Footer.status(View.element, setup);
	View.more = new moreTools(View.toolbar);
};
