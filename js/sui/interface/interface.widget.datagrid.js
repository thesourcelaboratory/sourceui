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

sourceui.interface.widget.datagrid = function ($widget, setup) {

	'use strict';

	var Datagrid = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Plugin = sourceui.instances.interface.plugins;
	var Notify = Plugin.notify;
	var Dom = Interface.dom;

	var isPT = (Dom.html.attr('lang').indexOf('pt-') > -1);

	Datagrid.common = new Interface.widget.common($widget, setup);
	Datagrid.widget = $widget;
	Datagrid.view = Datagrid.widget.closest('.sui-view');
	Datagrid.finder = Datagrid.widget.children('.finder');
	Datagrid.fields = Datagrid.finder.find('.sui-field');
	Datagrid.fields.customField();
	Datagrid.buttons = Datagrid.finder.find('.sui-button a');
	Datagrid.header = Datagrid.widget.find('.area .header');
	Datagrid.area = Datagrid.widget.children('.area');
	Datagrid.list = Datagrid.area.children('.list');
	Datagrid.lines = Datagrid.list.find('.lines');
	Datagrid.line = Datagrid.list.find('.line');
	Datagrid.treeview = Datagrid.area.children('.treeview');
	Datagrid.nodes = Datagrid.treeview.find('.node');

	Datagrid.common.controller.on('click', 'li a', function (event, force) {
		var $this = $(this);
		if (!force && $this.isDisable()) return;
		var evtenable = $this.data('event-enable');
		if (evtenable && (evtenable.has('pickline') || evtenable.has('checklines'))) {
			var data = { key: [], numerickey: [], seed: 0 };
			var $lines = Datagrid.widget.find('.area > .list .line.selected, .area > .list .line.swiped, .area > .treeview .node.selected');
			if ($lines.length) {
				Datagrid.widget.trigger('alias:' + $this.data('alias'), [$lines]);
				if ($this.is(':attrHas("data-link")')) {
					$lines.each(function () {
						var $line = $(this);
						var numerickey = $line.find('.col.key small').text();
						var d = $line.link('_self');
						if (d.sui) data.sui = d.sui;
						if (d.command) data.command = d.command;
						if (d.process) data.process = d.process;
						if (d.target) data.target = d.target;
						if (d.placement) data.placement = d.placement;
						if (d.requestkeydata) data.requestkeydata = d.requestkeydata;
						if (d.key) data.key.push(d.key[0]);
						if (numerickey) data.numerickey.push(numerickey);
						$.each(['stack', 'code', 'date', 'str', 'seq', 'num', 'json'], function (k, v) {
							if (d[v]) {
								data[v] = data[v] ? data[v] : [];
								data[v].push(d[v]);
							}
						});
						data.seed += d.seed || 0;
					});
					var t = $this.link();
					t.seed += data.seed;
					t.key = data.key;
					$.extend(data, t);
					data.cancelnested = true;
					if (Datagrid.widget.hasClass('explorer') && evtenable.has('pickline')) {
						if ($lines.length === 1 && $lines.hasClass('folder')) {
							data.parentkey = data.key[0];
							delete data.key;
						}
					}
					Network.link.call($this, data);
					event.stopImmediatePropagation();
					return;
				}
			} else {
				Notify.open({
					type: 'alert',
					name: $this.text() || $this.attr('title') || $this.attr('alt') || 'Ação',
					label: Datagrid.widget.find('.title h3 span').text(),
					message: isPT ? 'Selecione pelo menos um registro.' : 'Select at least one register.'
				});
			}
			event.stopImmediatePropagation();
			return;
		} else if ($this.data('alias') == 'pickself') {
			var dval = $this.data('value');
			Datagrid.view.trigger('alias:pickself', [dval]);
		} else if ($this.hasClass('mode')) {
			if ($this.hasClass('table')) Datagrid.widget.removeClass('table list block grid thumb').addClass('table');
			else if ($this.hasClass('list')) Datagrid.widget.removeClass('table list block grid thumb').addClass('list');
			else if ($this.hasClass('block')) Datagrid.widget.removeClass('table list block grid thumb').addClass('block');
			else if ($this.hasClass('grid')) Datagrid.widget.removeClass('table list block grid thumb').addClass('grid');
			else if ($this.hasClass('thumb')) Datagrid.widget.removeClass('table list block grid thumb').addClass('thumb');
		} else if ($this.hasClass('check')) {
			Datagrid.widget.find('.area > .list .line.selected').trigger('uncheck', [Datagrid.widget]);
			Datagrid.widget.removeClass('sort checktoggle').toggleClass('check');
			if (Datagrid.widget.hasClass('check')) {
				Datagrid.widget.find('.title > .badge.checked').addClass('active').find('span').text('0');
				Datagrid.view.children('.toolbar[data-controller="@form"]').disable(true);
				Datagrid.view.find('.sui-widget[id!="' + Datagrid.widget.attr('id') + '"]').disable(true);
			} else {
				Datagrid.widget.find('.title > .badge.checked').removeClass('active').find('span').text('0');
				Datagrid.view.children('.toolbar[data-controller="@form"]').enable();
				Datagrid.view.find('.sui-widget[id!="' + Datagrid.widget.attr('id') + '"]').enable();
			}
			event.stopPropagation();
		} else if ($this.hasClass('checktoggle')) {
			if (Datagrid.widget.hasClass('checktoggle')) {
				Datagrid.widget.find('.area > .list .line.selected').trigger('uncheck', [Datagrid.widget]);
			} else {
				Datagrid.widget.find('.area > .list .line').trigger('check', [Datagrid.widget]);
			}
			Datagrid.widget.toggleClass('checktoggle');
			event.stopPropagation();
		} else if ($this.hasClass('reord')) {
			if (Datagrid.widget.hasClass('check')) Datagrid.widget.find('.toolbar a.check').trigger('click');
			Datagrid.common.toggleTools('pickline', 'disable');
			Datagrid.common.toggleTools('checklines', 'disable');
			Datagrid.widget.toggleClass('reord');
			var $list = Datagrid.widget.find('.area > .list');
			var $line = $list.find('.line');
			var axis = (Datagrid.widget.hasClass('table') || Datagrid.widget.hasClass('list')) ? 'y' : null;
			if (Datagrid.widget.hasClass('reord')) {
				$line.pep({
					place: false,
					axis: axis,
					shouldEase: false,
					droppable: $line,
					revert: true,
					revertIf: function (ev, obj) {
						return !this.activeDropRegions.length || this.activeDropRegions.length == 1;
					},
					start: function (ev, obj) {
						obj.$el.addClass('dragger');
					},
					stop: function (ev, obj) {
						var closest = Datagrid.common.calcSort(axis, obj.$el, this.activeDropRegions);
						if (closest.placement) {
							if (closest.placement == 'after') obj.$el.insertAfter(closest.element);
							else if (closest.placement == 'before') obj.$el.insertBefore(closest.element);
							var matrix = obj.matrixToArray(obj.matrixString());
							var x = -1 * matrix[4];
							var y = -1 * matrix[5];
							obj.moveToUsingTransforms(x, y);
							obj.$el.css({ position: 'relative' });
							var sequence = [];
							$list.find('.line').each(function(){
								var $this = $(this);
								sequence.push($this.data('link-key'));
							});
							$list.trigger('widget:reord',[sequence]);
						}
						obj.$el.removeClass('dragger');
					}
				});
				$line.data('plugin_pep').toggle(true);
			} else {
				var pep = $line.data('plugin_pep');
				if (pep) pep.toggle(false);
			}
			event.stopPropagation();
		} else if ($this.hasClass('sort')) {
			if (!$this.data('droplist')) $this.data('droplist', $this.find('.sui-droplist'));
			var $list = $this.data('droplist');
			$list.trigger('droplist:open');
			event.stopPropagation();
		}
	});
	Datagrid.common.controller.find('.sort .sui-droplist').on('droplist:open', function (event) {
		var $this = $(this);
		var $col = Datagrid.widget.find('.header .col.order');
		if ($col.length) {
			var $li = $this.find('.options li').attr('class', 'icon-0');
			$li = $li.filter('[data-name="' + $col.data('name') + '"]');
			if ($li.length) {
				if ($col.is('.asc')) $li.attr('class', 'selected icon-angle-down');
				else if ($col.is('.desc')) $li.attr('class', 'selected icon-angle-up');
			}
		}
	});
	Datagrid.common.controller.find('.sort .sui-droplist').on('click', '.options > ul > li', function (event) {
		var $item = $(this);
		var $col = Datagrid.widget.find('.header .col[data-name="' + $item.data('name') + '"]');
		if ($col.length) Datagrid.common.order.exec.call($col[0], $item);
	});
	this.widget.on('click', '.area > .list .line > .col.context', function (event) {
		var $this = $(this);
		if ($this.isDisable()) return;
		if (!$this.data('droplist')) $this.data('droplist', $this.children('.sui-droplist').data('parent', $this));
		var $list = $this.data('droplist');
		$list.trigger('droplist:open');
		event.stopPropagation();
	});
	this.widget.find('.col.context .sui-droplist').on('droplist:open', function (event) {
		var $this = $(this),
			$line = $this.data('parent').closest('.line');
		Datagrid.common.context.off(Datagrid.widget);
		Datagrid.common.context.on($line);
	});
	this.widget.find('.col.context .sui-droplist').on('droplist:close', function (event) {
		var $this = $(this),
			$line = $this.data('parent').closest('.line');
		Datagrid.common.context.off($line);
	});
	this.widget.find('.col.context .sui-droplist').on('click', '.options > ul > li', function (event) {
		var $this = $(this),
			$droplist = $this.closest('.sui-droplist'),
			$line = $droplist.data('parent').closest('.line'),
			clone = $this.data('clone'),
			haslink = $this.is(':attrHas("data-link")');
		if (clone) {
			var $clone = $(clone);
			$clone.trigger('click');
			if (!$clone.is('[data-link-confirm]')) $droplist.trigger('droplist:close');
		} else if (haslink) {
			var data = $.extend({},
				$line.parent().link(),
				$this.link('_self')
			);
			Network.link.call($line, Datagrid.common.line.linkData(data, $line));
			$droplist.trigger('droplist:close');
		}
		event.stopPropagation();
	});
	this.widget.on('contextmenu', '.area .header', function (event) {
		var $header = $(this);
		if (!$header.data('droplist')) $header.data('droplist', $header.children('.sui-droplist').data('parent', $header));
		var $droplist = $header.data('droplist');
		var $options = $droplist.find('.options li');
		$options.off('click');
		$options.on('click', function(){
			var $li = $(this);
			var $droplist = $li.closest('.sui-droplist');
			var $list = $droplist.data('parent').closest('.list');
			var $cols = $list.find('.col[data-index="'+$li.data('index')+'"]');
			if ($li.hasClass('icon-0')) {
				$li.removeClass('icon-0').addClass('icon-done');
				$cols.removeClass('invisible');
			} else {
				$li.addClass('icon-0').removeClass('icon-done');
				$cols.addClass('invisible');
			}
		});
		$header.find('.col').each(function(){
			var $col = $(this);
			if ($col.is(':visible')) $options.filter('[data-index="'+$col.data('index')+'"]').removeClass('icon-0').addClass('icon-done');
			else $options.filter('[data-index="'+$col.data('index')+'"]').removeClass('icon-done').addClass('icon-0');
		});
		$droplist.trigger('droplist:open', event);
		event.preventDefault();
		event.stopPropagation();
	});
	this.widget.on('click', '.area .header .col', function (event) {
		var $col = $(this);
		if (!$col.is('.image, .icon, .swiper, .pad, .check')){
			Datagrid.common.order.exec.call(this);
		}
		event.stopImmediatePropagation();
	});
	this.widget.on('click', '.area .paginator', function (event) {
		Datagrid.common.paginate.exec.call(this);
		event.stopImmediatePropagation();
	});
	this.widget.on('hold', '.area > .list .line', function (event) {
		var $this = $(this);
		if ($this.isDisable()) return;
		Datagrid.common.controller.find('a.check').trigger('click');
		if (Datagrid.widget.hasClass('check')) {
			$this.trigger('check');
		}
	});
	this.widget.on('swipeleft', '.area > .list .line:not(.swiped)', function (event) {
		var $this = $(this);
		if ($this.isDisable()) return;
		if (!Datagrid.widget.hasClass('check')) {
			$(this).find('.col.swiper').trigger('click');
		}
		event.stopPropagation();
	});
	this.widget.on('swiperight click', '.area > .list .line.swiped', function (event) {
		var $this = $(this);
		$(this).find('.col.swiper').trigger('click');
		event.stopImmediatePropagation();
	});
	this.widget.on('click', '.area > .list .line:not(.swiped) > .col.swiper', function (event) {
		var $this = $(this),
			$line = $this.parent(),
			$lines = $line.closest('.area').find('.line'),
			$swiped = $lines.filter('.swiped');
		if ($this.isDisable()) return;
		$lines.filter('.selected').removeClass('selected');
		Datagrid.common.swipe.close($swiped, { easing: 'ease-out' });
		Datagrid.common.swipe.open($line);
		event.stopPropagation();
	});
	this.widget.on('click', '.area > .list .line.swiped > .col.swiper', function (event) {
		var $this = $(this),
			$line = $this.parent();
		Datagrid.common.swipe.close($line);
		event.stopPropagation();
	});
	this.widget.on('click', '.area > .list .line > .col.swiper > .actions', function (event) {
		event.stopPropagation();
	});
	this.widget.on('click', '.area > .list .line > .col.swiper > .actions li', function (event) {
		//event.stopPropagation();
		var $this = $(this),
			$line = $this.closest('.line'),
			clone = $this.data('clone'),
			haslink = $this.is(':attrHas("data-link")');
		if ($this.isDisable()) return;
		if (clone) {
			var $clone = $(clone);
			$clone.trigger('click', [true]);
			if (!$clone.is('[data-link-confirm]')) Datagrid.common.swipe.close($line, { duration: 100 });
		} else if (haslink) {
			var data = $.extend({},
				$line.parent().link(),
				$this.link('_self'),
				{ cancelnested: true }
			);
			if (!data.confirm) Datagrid.common.swipe.close($line, { duration: 100 });
			Network.link.call($this, Datagrid.common.line.linkData(data, $line));
		}
	});
	this.widget.on('click', '.area > .list .line:not(.swiped), .area > .treeview .node', function (event) {
		event.stopPropagation();
		var $this = $(this),
			$swiped = $this.closest('.area').find('.swiped');
		if ($swiped.length) return Datagrid.common.swipe.close($swiped, { duration: 100 });
		if ($this.isDisable()) return;
		if (Datagrid.widget.hasClass('check')) {
			if ($this.hasClass('selected')) $this.trigger('uncheck');
			else $this.trigger('check');
		} else if (!Datagrid.widget.hasClass('check') && !Datagrid.widget.hasClass('sort')) {
			$this.trigger('pick');
		}
	});
	this.widget.on('check', '.area > .list .line', function (event) {
		var $this = $(this),
			$lines = $this.closest('.area').find('.line');
		if ($this.isDisable()) return;
		$this.addClass('selected');
		var $selected = $lines.filter('.selected');
		Datagrid.widget.trigger(($selected.length == 1) ? 'checksingle' : 'checkmulti', [$selected]);
		Datagrid.widget.trigger('checklines', [$selected]);
		Datagrid.widget.find('.title > .badge.checked').find('span').text($lines.filter('.selected').length);
	});
	this.widget.on('uncheck', '.area > .list .line', function (event) {
		var $this = $(this),
			$lines = $this.closest('.area').find('.line');
		if ($this.isDisable()) return;
		$this.removeClass('selected');
		var $selected = $lines.filter('.selected');
		if ($selected.length == 1) Datagrid.widget.trigger('checksingle', [$selected]);
		else if ($selected.length == 0) Datagrid.widget.trigger('checkclear');
		Datagrid.widget.trigger('unchecklines', [$selected]);
		Datagrid.widget.find('.title > .badge.checked').find('span').text($lines.filter('.selected').length);
	});
	this.widget.on('pick', '.area > .list .line:not(.swiped), .area > .treeview .node', function (event) {
		event.stopPropagation();
		var $this = $(this),
			$selected = $this.closest('.sui-view').find('.sui-widget.datagrid:not(.keepcheck):not(.keepchecked):not(.keepselect):not(.keepselected) > .area .selected, .sui-widget#'+Datagrid.widget.attr('id')+' > .area .selected');
		if ($this.isDisable()) return;
		$selected.removeClass('selected');
		$this.addClass('selected');
		Datagrid.widget.trigger('pickline', [$this]);
	});
	this.widget.on('checksingle', function (event, $lines) {
		Datagrid.common.toggleTools.call($lines, 'checksingle');
	});
	this.widget.on('checkmulti', function (event, $lines) {
		Datagrid.common.toggleTools.call($lines, 'checkmulti');
	});
	this.widget.on('checklines', function (event, $lines) {
		Datagrid.common.toggleTools.call($lines, 'checklines');
	});
	this.widget.on('checkclear', function (event, $lines) {
		Datagrid.common.toggleTools.call($lines, 'checkclear');
	});
	this.widget.on('unchecklines', function (event, $lines) {
		Datagrid.common.toggleTools.call($lines, 'unchecklines');
	});

	this.widget.on('pickline', function (event, $line) {
		event.stopPropagation();
		if ($line.isDisable()) return;
		if ($line.is('.localrecord')){
			$line.find('.col.swiper .actions li:eq(0)').trigger('click');
		} else {
			var link = $line.link();
			var numerickey = $line.find('.col.key small').text();
			if (numerickey) link.numerickey = numerickey;
			if (link.href || link.download || (link.command && link.sui && link.placement)) {
				Network.link.call($line, link);
			} else {
				Datagrid.common.toggleTools.call($line, 'pickline');
				var $button = Datagrid.common.controller.find('[data-event-enable*="pickline"]:visible');
				var linetype = $line.data('type');
				if (linetype) $button = $button.filter('[data-type-enable*="' + linetype + '"]:eq(0)');
				else $button = $button.filter(':eq(0)');
				if (!$button.is('[data-event-autoclick="false"]')){
					$button.trigger('click');
				}
			}
		}
	});
	this.view.on('click', function () {
		if (!Datagrid.widget.is('.keepcheck, .keepchecked, .keepselect, .keepselected')){
			Datagrid.widget.find('.area > .list .line.selected, .area > .treeview .node.selected').trigger('uncheck');
		}
	});

	this.init = function () {

		Datagrid.header = Datagrid.widget.find('.area .header');
		Datagrid.area = Datagrid.widget.children('.area');
		Datagrid.list = Datagrid.area.children('.list');
		Datagrid.lines = Datagrid.list.find('.lines');
		Datagrid.line = Datagrid.list.find('.line');

		if (Datagrid.widget.hasClass('mansory')) {
			if (Datagrid.widget.find('.images .line.image').length) {
				Datagrid.view.addClass('micro-spinner');
				var $l = Datagrid.lines.length ? Datagrid.lines : Datagrid.list;
				$l.imagesLoaded(function () {
					$l.masonry({
						itemSelector: '.images .line.image',
						percentPosition: true,
						columnWidth: '.sizer'
					});
					Datagrid.view.removeClass('micro-spinner');
					Datagrid.list.css('opacity', 1);
					Datagrid.lines.css('opacity', 1);
				}).progress(function (instance, image) {
					image.img.src = $(image.img).data('src');
				});
			} else {
				Datagrid.list.css('opacity', 1);
				Datagrid.lines.css('opacity', 1);
			}
		}

		// restore global data para ordem de colunas
		//-------------------------------------------
		var globalname = 'datagrid-order:' + Datagrid.widget.attr('id');
		var globaldata = Device.Global.get(globalname) || {};
		$.each(globaldata, function (k, v) {
			if (k !== 'key') {
				var $col = Datagrid.header.find(k);
				if ($col.length) Datagrid.common.order.exec.call($col, null, v);
			}
		});
		//-------------------------------------------

		if (!Device.ismobile) {

			// esquema para resize das colunas
			//-------------------------------------------
			globalname = 'drag-datagrid-header:' + Datagrid.widget.attr('id');
			var $draggable = Datagrid.header.find('.sui-draggable').draggabilly({
				axis: 'x'
			});
			$draggable.on('click', function (event) {
				event.stopPropagation();
			});
			$draggable.on('dragStart', function () {
				var $this = $(this);
				var $col = $this.parent();
				$col.data('initpos', $this.offset().left);
			});
			$draggable.on('dragEnd', function () {
				var $this = $(this);
				var $col = $this.parent();
				Datagrid.header.trigger('move', [$col, $this.offset().left]);
			});
			Datagrid.header.on('fixedsize', function (event) {
				Datagrid.header.children('.col').each(function () {
					var $col = $(this);
					var $drag = $col.children('.sui-draggable');
					var w = $col.outerWidth();
					$col.css({
						'width': w,
					});
					$drag = w - $drag.width() / 2;
				});
				Datagrid.header.addClass('fixedsize');
			});
			Datagrid.header.on('move', function (event, $col, left) {
				if (!Datagrid.header.hasClass('fixedsize')) Datagrid.header.trigger('fixedsize');
				var $next = $col.next('.col');
				var $dc = $col.children('.sui-draggable');
				var $dn = $next.children('.sui-draggable');
				var dw = $dc.width();
				var cs = $col.offset().left + 64;
				var ns = $next.offset().left + $next.outerWidth() - 64;
				if (left < cs) left = cs;
				else if (left > ns) left = ns;
				var pos = left - $col.data('initpos');
				var x = (pos + dw / 2);
				var wc = $col.outerWidth() + x;
				var wn = $next.outerWidth() - x;
				$col.css({
					'width': wc + 'px',
					'max-width': wc + 'px'
				});
				$next.css({
					'width': wn + 'px',
					'max-width': wn + 'px'
				});
				$dc.draggabilly('setPosition', wc - dw / 2, 0);
				$dn.draggabilly('setPosition', wn - dw / 2, 0);
				Datagrid.header.trigger('moved');
			});
			Datagrid.header.on('moved', function () {
				var data = {};
				Datagrid.header.children('.col').each(function () {
					var $col = $(this);
					if (!data[$.getSelector($col[0])]) {
						data[$.getSelector($col[0])] = $col.outerWidth();
					}
				});
				Device.Global.set(globalname, data);
			});
			Dom.window.on('resize', function () {
				Datagrid.header.trigger('fixedsize');
			});
			globaldata = Device.Global.get(globalname) || {};
			$.each(globaldata, function (k, v) {
				if (k !== 'key') {
					Datagrid.header.find(k).outerWidth(v);
				}
			});
			//-------------------------------------------
		}
	}
	Datagrid.nodes.on('node:connect', function (event) {
		event.stopPropagation();
		var $this = $(this);
		var $trace = $this.children('.trace');
		var ldata = {}, css = {};
		if ($this.hasClass('collapsed')) {
			css.display = 'none';
		} else {
			var $label = $this.children('.label');
			var $ul = $this.children('ul');
			var $last = $ul.children('li:last');
			ldata.top = $label.position().top;
			ldata.height = $label.outerHeight();
			ldata.size = parseInt($trace.css('width'));
			ldata.lasttop = $last.position().top;
			ldata.lastheight = $last.children('.label').outerHeight();
			ldata.newtop = parseInt(ldata.top + (ldata.height / 2) - (ldata.size / 2));
			ldata.newbottom = parseInt(ldata.lasttop + ldata.size);
			css.display = 'block';
			if ($ul.length) {
				css.top = ldata.newtop + 'px';
				css.height = ldata.newbottom + 'px';
			} else {
				css.display = 'none';
			}
		}
		$trace.css(css);
	});

	Datagrid.widget.on('click', '.fold > .label > .connector', function (event) {
		event.stopPropagation();
		var $node = $(this).closest('.node');
		$node.toggleClass('collapsed')
		$node.trigger('node:connect');
		$node.parents('.node').trigger('node:connect');
	});

	Datagrid.widgetData = function () {
		Datagrid.wgdata = { selectedLines:[] };
		Datagrid.valid = true;
		if (Datagrid.widget.is('.check')){
			var $selecteds = Datagrid.widget.find('.line.selected');
			if ($selecteds.length){
				$selecteds.each(function(){
					var $line = $(this);
					var value = $line.attr('data-link-key') || $line.attr('data-key') || $line.attr('data-id') || $line.attr('id') || false;
					if (value !== false) Datagrid.wgdata.selectedLines.push(value);
				});
			} else {
				Datagrid.valid = false;
			}
		}
		return Datagrid.valid;
	};


	if (Datagrid.widget.is('.excel')){
		Datagrid.widget.on('click','.line .col', function(){
			var $cell = $(this);
			if (!$cell.is('.focus')){
				var $changed = Datagrid.widget.find('.line .col.haschange');
				if ($changed.length){
					$changed.removeClass('haschange').data('editioninitval','');
					Datagrid.widget.trigger('datagrid:datachange',[$changed]);
				}
				Datagrid.widget.find('.line .col.focus').removeClass('focus editing').removeAttr('contenteditable');
				$cell.addClass('focus');
			}
		});
		Datagrid.widget.on('dblclick','.line .col.editable', function(){
			var $cell = $(this);
			if (!$cell.is('.editing')){
				Datagrid.widget.find('.line .col.editing').removeClass('focus editing');
				$cell.addClass('focus editing').attr('contenteditable','true').focus().select();
				document.execCommand('selectAll',false,null);
				$cell.data('editioninitval', $cell.html());
			}
		});
		Dom.document.on('keydown', function(event){
			var $focus = Datagrid.widget.find('.line .col.focus');
			if ($focus.length){
				if ($focus.is('.haschange') && event.key === 'Escape'){
					event.preventDefault();
					$focus.removeClass('haschange').html($focus.data('editioninitval'));
				} else if (event.key === 'Enter'){
					if ($focus.is('.haschange')) {
						event.preventDefault();
						$focus.removeClass('haschange').data('editioninitval','');
						Datagrid.widget.trigger('datagrid:datachange',[$focus]);
					}
					var $targ = $focus.closest('.line').next('.line').find('.col[data-index="'+$focus.data('index')+'"]');
					if ($targ.length){
						$targ.trigger('click');
						//Datagrid.area.scrollTo($targ);
					}
				} else if (event.key === 'Tab'){
					event.preventDefault();
					var $targ = $focus.nextAll('.col[data-index="'+($focus.data('index')+1)+'"]');
					if ($targ.length){
						$targ.trigger('click');
						$targ.trigger('cell:scroll',['right']);
					}
					return false;
				} else if (event.key.indexOf('Arrow') > -1){
					event.preventDefault();
					var $line = $focus.closest('.line'), $targ = $();
					if (event.key === 'ArrowRight') $targ = $line.find('.col[data-index="'+($focus.data('index')+1)+'"]');
					else if (event.key === 'ArrowLeft') $targ = $line.find('.col[data-index="'+($focus.data('index')-1)+'"]');
					else if (event.key === 'ArrowUp') $targ = $line.prev('.line').find('.col[data-index="'+$focus.data('index')+'"]');
					else if (event.key === 'ArrowDown') $targ = $line.next('.line').find('.col[data-index="'+$focus.data('index')+'"]');
					if ($targ.length){
						$targ.trigger('click');
						$targ.trigger('cell:scroll',[event.key]);
					}
				} else if ($focus.is('.editable') && !$focus.is('.editing')) {
					if (event.key === 'F2'){
						event.preventDefault();
						$focus.trigger('dblclick');
					} else if ((event.which >= 48 && event.which <= 57) || (event.which >= 65 && event.which <= 90) || (event.which >= 96 && event.which <= 105)){
						$focus.trigger('click').trigger('dblclick').html(event.key).addClass('haschange');
					}
				} else if ($focus.is('.editing')){
					if ((event.which >= 48 && event.which <= 57) || (event.which >= 65 && event.which <= 90) || (event.which >= 96 && event.which <= 105)){
						$focus.addClass('haschange');
					}
				}
			}
		});
		Datagrid.widget.on('cell:scroll','.line .col', function(event,direction){
			this.scrollIntoViewIfNeeded(false);
			//this.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

			/*
			direction = direction.toLowerCase();
			var $cell = $(this);
			var cellrect = $cell.get(0).getBoundingClientRect();
			var arearect = Datagrid.area.get(0).getBoundingClientRect();
			var isvisible = (
				cellrect.top >= arearect.top &&
				cellrect.left >= arearect.left &&
				cellrect.bottom <= arearect.bottom &&
				cellrect.right <= arearect.right
			);
			if (!isvisible){
				if (direction.indexOf('left') > -1) Datagrid.area.scrollLeft(cellrect.left - arearect.left);
				else if (direction.indexOf('right') > -1) Datagrid.area.scrollLeft(cellrect.left - arearect.left);
				else if (direction.indexOf('top') > -1) Datagrid.area.scrollLeft(cellrect.top - arearect.top);
				else if (direction.indexOf('down') > -1) Datagrid.area.scrollLeft(cellrect.top - arearect.top);
			}
			console.log(cellrect, arearect);
			*/
			/*
			setTimeout(function(){
				Datagrid.area.scrollTo($cell, 150);
			},100);
			*/
		});

	}

	setTimeout(function () {
		Datagrid.nodes.filter('.fold:not(.collapsed)').each(function () {
			$(this).trigger('node:connect');
		});

		/*
		$.clusterscroll.bind({
			list: Datagrid.list,
			line: Datagrid.line
		});
		*/

	}, 200);

	this.init();
};


$(function () {
	$.clusterscroll = {
		bind: function(options){

			var $list = options.list || $(this);
			var $lines = options.line || $list.find('.line');
			var $scroller = options.scroller ? options.scroller : $list.closest('.scroll-default');

			var totallines = $lines.length;
			var $clusters = $();

			for (var i=0; i<=totallines; i+=100){
				console.log(i, totallines);
				var $slice = $lines.slice(i, i+100);
				$slice.wrapAll('<div class="clusterscroll" style="display: table-row;" />');
			}

			$scroller.on('scroll', function(){

			});
		},
		isvisible: function($cluster, $scroller){
			const rect = $cluster.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.bottom <= ($scroller.innerHeight())
			);
		}
	};
});
