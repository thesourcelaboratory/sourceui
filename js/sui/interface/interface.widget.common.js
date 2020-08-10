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

sourceui.interface.widget.common = function ($widget, setup) {

	'use strict';

	var Common = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Plugin = sourceui.instances.interface.plugins;
	var Notify = Plugin.notify;
	var Dom = Interface.dom;

	Common.widget = $widget;
	Common.controller = Common.widget.data('controller');
	Common.area = Common.widget.children('.area');
	Common.buttons = this.widget.find('.sui-buttonset .sui-button');
	Common.toolbar = this.widget.find('.title .toolbar');
	//Common.code = this.widget.children('code');
	Common.finder = this.widget.children('.finder');

	/*

	// interface.document.js:288 (é redundante)

	Common.code.each(function () {
		var $code = $(this);
		var attr = $code.attr();
		if (attr.type == 'event' && attr.on) {
			Common.widget.on(attr.on, function (event, args) {
				eval($.suiEvent($code));
			});
		}
	});
	*/


	if (!this.controller) {
		this.controller = this.toolbar;
	}
	Common.toggleTools = function (action, toggle, controller) {
		var $source = this;
		controller = controller || Common.controller;

		if (toggle == 'enable'){
			var $tools = controller.find('[data-event-enable*="' + action + '"]');
			$tools = $tools.add(Common.buttons.filter('[data-event-enable*="' + action + '"]'));
		} else if (toggle == 'disable'){
			var $tools = controller.find('[data-event-disable*="' + action + '"]');
			$tools = $tools.add(Common.buttons.filter('[data-event-disable*="' + action + '"]'));
		} else {
			var $tools = controller.find('[data-event-enable*="' + action + '"], [data-event-disable*="' + action + '"]');
			$tools = $tools.add(Common.buttons.filter('[data-event-enable*="' + action + '"], [data-event-disable*="' + action + '"]'));
		}
		$tools.each(function () {
			var $tool = $(this);
			var typetog;
			var prevent;
			var $typed;
			if ($tool.is('[data-type-enable]')) {
				typetog = $tool.data('type-enable');
				if ($source && $source instanceof jQuery) {
					$typed = $source.filter('[data-type="' + typetog + '"]');
					if ($typed.length < $source.length) prevent = 'enable';
				}
			}
			if ($tool.is('[data-type-disable]')) {
				typetog = $tool.data('type-disable');
				if ($source && $source instanceof jQuery) {
					$typed = $source.filter('[data-type="' + typetog + '"]');
					if ($typed.length < $source.length) prevent = 'disable';
				}
			}
			if (toggle) {
				if (toggle == 'enable' && prevent !== 'enable') {
					$tool.parent().disable(false);
				} else if (toggle == 'disable' && prevent !== 'disable') {
					$tool.parent().disable(true);
				}
			} else {
				if ($tool.is('[data-event-enable*="' + action + '"]') && prevent !== 'enable') {
					$tool.parent().disable(false);
				} else if ($tool.is('[data-event-disable*="' + action + '"]') && prevent !== 'disable') {
					$tool.parent().disable(true);
				}
			}
		});
	};
	Common.widget.children('.helper').on('click', '.close', function () {
		Common.widget.toggleClass('helper');
	});
	Common.controller.on('click', 'li a', function (event) {
		var $this = $(this);
		if ($this.isDisable()) return;
		if ($this.data('alias') == 'print') {
			window.print();
		} else if ($this.hasClass('helper')) {
			Common.widget.toggleClass('helper');
		} else if ($this.hasClass('filter')) {
			Common.widget.toggleClass('filter');
		} else if ($this.hasClass('colapse')) {
			Common.widget.toggleClass('colapse');
		} else if ($this.hasClass('areatoggle')) {
			var $title = $this.closest('.title');
			Common.widget.removeClass('a1 a2 a3 a4 a5 a6 a7 a8');
			Common.widget.addClass('areatoggle a' + ($this.parent().index() + 1));
			$title.find('h3 span').text($this.data('title'));
		} else if ($this.hasClass('maximize')) {
			var $view = Common.widget.closest('.sui-view');
			var $scroll = $view.find('.sui-content.scroll-default');
			var nowScroll = $scroll.scrollTop();
			var lastScroll = Common.widget.data('lastScroll');
			Common.widget.toggleClass('maximized');
			Common.widget.data('lastScroll', Common.widget.find());
			Common.widget.closest('.sui-view').toggleClass('maximized').closest('.sui-sector').toggleClass('maximized');
			if (lastScroll) $scroll.scrollTop(lastScroll);
			Common.widget.data('lastScroll', nowScroll || 0);
			Common.widget.trigger('widget:resize');
		} else if ($this.hasClass('fullscreen')) {
			if (Dom.body.hasClass('fullscreen')){
				var $ghost = $('#ghost'+Common.widget.attr('id'));
				var $widget = Dom.fullscreenContainer.children('.sui-widget');
				$ghost.replaceWith($widget);
				Common.widget.trigger('widget:resize');
				Dom.body.removeClass('fullscreen');
			} else {
				Dom.body.addClass('fullscreen');
				$('<div id="ghost'+Common.widget.attr('id')+'" />').insertAfter(Common.widget);
				Dom.fullscreenContainer.html('')
				Dom.fullscreenContainer.append(Common.widget);
				Common.widget.trigger('widget:resize');
			}
		} else if ($this.hasClass('sourcecode')) {
			var $mce = Common.widget.find('.sui-field.mce');
			var $cdm = Common.widget.find('.sui-field.code');
			if (Common.widget.hasClass('codesourced')) {
				$mce.val($cdm.val()).consider();
				$cdm.ignore();
				Common.widget.removeClass('codesourced');
			} else {
				$mce.ignore();
				$cdm.val($mce.val()).consider();
				Common.widget.addClass('codesourced');
			}
			Common.widget.trigger('widget:resize');
		} else if ($this.data('alias') == 'upload') {
			var link = $this.link();
			Plugin.gridupload(Common.widget, link);
		}
	});
	Common.calcSort = function (axis, dragger, droppers) {
		var a = {},
			o = dragger,
			mini = 10000000000,
			closest = {};
		a.alias = o.find('.key').text();
		a.top = o.position().top;
		a.left = o.position().left;
		a.width = o.width();
		a.height = o.height();
		a.x = a.left + (a.width / 2);
		a.y = a.top + (a.height / 2);
		$.each(droppers || [], function (i, p) {
			if (p.hasClass('dragger')) {
				return true;
			}
			var b = {};
			b.top = p.position().top;
			b.left = p.position().left;
			b.width = p.width();
			b.height = p.height();
			b.x = b.left + (b.width / 2);
			b.y = b.top + (b.height / 2);
			b.xs = b.x - a.x;
			b.xs = b.xs * b.xs;
			b.ys = b.y - a.y;
			b.ys = b.ys * b.ys;
			b.z = Math.sqrt(b.xs + b.ys);
			if (b.z <= mini) {
				mini = b.z;
				if (axis) {
					closest.placement = (a.y > b.y) ? 'after' : 'before';
				} else {
					closest.placement = (a.x > b.x) ? 'after' : 'before';
				}
				closest.element = p;
			}
		});
		return closest;
	};
	Common.order = {
		exec: function ($li, o) {
			var $col = $(this);
			var $list = $col.closest('.linegroup, .list');
			var data = {
				col: $col,
				header: $col.parent(),
				list: $list,
				area: $list.parent(),
				idx: $col.data('index'),
				filter: {
					limitStart: 0,
					limitLength: parseInt($list.data('length')) || 20,
					limitTotal: parseInt($list.data('total')) || 0,
					sortBy: null,
					sortOrd: null
				}
			};
			if (data.filter.limitStart + data.filter.limitLength < data.filter.limitTotal) {
				Common.order.remote.call(data, $li, o);
			} else {
				Common.order.local.call(data, $li, o);
			}
		},
		remote: function ($li, o) {
			var data = this;
			var orderType = (data.col.hasClass('asc')) ? 'desc' : ((data.col.hasClass('desc')) ? null : 'asc');
			if (o === orderType) return;
			if (o) orderType = o;
			var setup = {
				target: '@widget-area',
				render: '@datagrid-list',
				//cache : true,
				filter: data.filter,
				ondone: function () {
					if ($li && $li.length) {
						$li.attr('class', 'icon-0').siblings('li').attr('class', 'icon-0');
						if (orderType == 'asc') $li.attr('class', 'selected icon-angle-down');
						else if (orderType == 'desc') $li.attr('class', 'selected icon-angle-up');
					}
				}
			};
			if (orderType) {
				setup.filter.sortBy = data.col.data('name') || data.col.data('index');
				setup.filter.sortOrd = orderType;
			}
			if (data.area.length && data.area.link().sui) {
				Network.link.call(data.col, setup);
			}
		},
		local: function ($li, o) {
			var data = this;
			data.col.siblings('.col').removeClass('order asc desc');
			data.col.addClass('order');
			if (o) {
				data.col.addClass(o);
			} else {
				if (data.col.hasClass('asc')) {
					data.col.switchClass('asc', 'desc');
				} else if (data.col.hasClass('desc')) {
					data.col.removeClass('desc');
					Common.order.exec.call(data.col.siblings('.seq'));
					if ($li && $li.length) $li.attr('class', 'icon-0');
					return;
				} else {
					data.col.addClass('asc');
				}
			}
			data.lines = data.list.find('.lines');
			data.lines = (!data.lines.length) ? data.area.find('.list') : data.lines;
			if (data.lines.length) {
				data.lines.each(function () {
					var $line = $(this);
					var $items = $line.children('.line');
					var ords = [];
					$items.children('.col').removeClass('order asc desc');
					$items.each(function () {
						var ln = $(this),
							sl = ln.children('[data-index="' + data.idx + '"]'),
							ord = {
								value: sl.data('original') || sl.text(),
								element: ln
							};
						ords.push(ord);
					});
					ords.sort(function (a, b) {
						if (data.col.hasClass('asc')) {
							if (!isNaN(a.value) && !isNaN(b.value)) { return parseFloat(a.value) - parseFloat(b.value); }
							if (a.value < b.value) { return -1; }
							if (a.value > b.value) { return 1; }
						} else {
							if (!isNaN(a.value) && !isNaN(b.value)) { return parseFloat(b.value) - parseFloat(a.value); }
							if (a.value > b.value) { return -1; }
							if (a.value < b.value) { return 1; }
						}
						return 0;
					});
					if (Common.widget.hasClass('mansory')) {
						$line.masonry('destroy');
					}
					$items.remove();
					$.each(ords || [], function (i, o) {
						o.element.children('[data-index="' + data.idx + '"]').addClass('order');
						$line.append(o.element);
					});
					if (Common.widget.hasClass('mansory')) {
						$line.masonry({
							itemSelector: '.images .line.image',
							percentPosition: true,
							columnWidth: '.sizer'
						});
					}
					var globalname = 'datagrid-order:' + Common.widget.attr('id');
					var colname = $.getSelector(data.col[0]).replace(/\.order|\.asc|\.desc/g, '');
					var globaldata = {};
					globaldata[colname] = data.col.hasClass('asc') ? 'asc' : 'desc';
					Device.Global.set(globalname, globaldata);
				});
			}
			data.list.children('.paginator').appendTo(data.list);
			if ($li && $li.length) {
				$li.attr('class', 'icon-0').siblings('li').attr('class', 'icon-0');
				if (data.col.is('.asc')) $li.attr('class', 'selected icon-angle-down');
				else if (data.col.is('.desc')) $li.attr('class', 'selected icon-angle-up');
			}

		}

	};
	Common.paginate = {
		exec: function () {
			var $link = $(this),
				$list = $link.closest('.list'),
				$lines = $link.closest('.lines'),
				data = {
					link: $link,
					list: $list,
					lines: $lines,
					area: $list.parent(),
					filter: {
						limitStart: parseInt($list.data('start')) || 0,
						limitLength: parseInt($list.data('length')) || 20,
						limitTotal: parseInt($list.data('total')),
						sortBy: $list.data('by'),
						sortOrd: $list.data('ord')
					}
				};
			if (data.list.data('paginator') == 'buttonDown') {
				data.filter.limitStart += data.filter.limitLength;
				Common.paginate.buttonDown.call(data);
			}
		},
		buttonDown: function () {
			var data = this;
			var setup = {
				target: '@widget-paginator',
				render: '@datagrid-line',
				filter: data.filter,
			};
			setup.ondone = function () {
				data.list.data('start', data.filter.limitStart);
				data.list.attr('data-start', data.filter.limitStart);
				if (!data.list.children('.paginator').length) {
					data.list.removeAttr('data-paginator');
				}
			};
			Network.link.call(data.link, setup);
		}
	};
	Common.swipe = {
		open: function ($item) {
			if (!$item.length) { return; }
			$item.addClass('swiped');
			var $swiper = $item.find('.swiper');
			var $actions = $swiper.find('.actions');
			if (!$actions.length) return;
			var agent = Device.agent.get() || {};
			if (agent.browser && (agent.browser.name||'').toLowerCase() == 'edge'){
				var width = -$actions.width();
				$actions.velocity({
					opacity: [1,0],
					left: [width,0]
				},{
					duration: 220,
					easing: 'ease-out'
				});
			} else {
				var width = $actions.outerWidth();
				if (!Device.ismobile) {
					$actions.css('left', $swiper.outerWidth() + $swiper.next('.pad').outerWidth());
				}
				$item.velocity({
					translateX: -width
				}, {
						duration: 220,
						easing: 'ease-out'
				});
			}
			$item.trigger('checkswipe');
		},
		close: function ($item, options) {
			if ($item.hasClass('sui-widget')) { $item = $item.find('.area > .list .line.swiped, .area > .list .file.swiped, .area > .list .folder.swiped'); }
			if (!$item.length) { return; }
			var $swiper = $item.find('.swiper');
			var $actions = $swiper.find('.actions');
			if (!$actions.length) return;
			var agent = Device.agent.get() || {};
			if (agent.browser && (agent.browser.name||'').toLowerCase() == 'edge'){
				var width = -$actions.width();
				$actions.velocity({
					opacity: 0,
					left: 0
				},$.extend({
					duration: 220,
					complete: function () {
						$item.removeClass('swiped');
					},
					easing: 'ease-in'
				}, options));
			} else {
				$item.velocity({
					translateX: 0,
				}, $.extend({
					duration: 220,
					complete: function () {
						$item.removeClass('swiped');
					},
					easing: 'ease-in'
				}, options));
			}
			$item.trigger('uncheckswipe');
		}
	};
	Common.context = {
		on: function ($item) {
			if (!$item.length) { return; }
			$item.addClass('contexted');
			$item.trigger('check');
		},
		off: function ($item, ease) {
			if ($item.hasClass('sui-widget')) { $item = $item.find('.area > .list .line.contexted, .area > .list .file.contexted, .area > .list .folder.contexted'); }
			if (!$item.length) { return; }
			$item.removeClass('contexted');
			$item.trigger('uncheck');
		}
	};
	Common.line = {
		linkData: function (data, $line) {
			var lata = $line.link('_self');
			if (data.seed) data.seed += $.toInt($line.closest('[data-link-origin][data-link-seed]').data('link-seed')) || 0;
			if (lata.key || lata.parentkey) {
				if (lata.key) data.key = $.isArray(lata.key) ? lata.key[0] : lata.key;
				if (lata.parentkey) data.parentkey = lata.parentkey;
				data.seed = (data.seed) ? data.seed + (lata.seed || 0) || 0 : lata.seed || 0;
				delete lata.key;
				delete lata.parentkey;
				delete lata.seed;
			}
			data.cancelnested = true;
			return $.extend(data, lata);
		}
	};


	var Finder = {
		timeout: null,
		sector: Common.widget.closest('.sui-sector'),
		widget: Common.widget,
		element: Common.widget.find('.finder'),
		getFilters: function () {
			var $filters = Common.widget.find('.sui-filter.selected');
			var filt = '';
			$filters.each(function () {
				var $f = $(this);
				filt = $.extend(true, filt, Finder.deparam($f.data('name'), $f.data('value')));
			});
			return filt ? $.deparam(filt) : {};
		},
		deparam: function (name, value) {
			var data = {}, qs;
			if (name.indexOf('[]') > -1) {
				name = name.substring(0, name.length - 2);
				if (value !== '' && value !== null) {
					data[name] = data[name] || [];
					data[name].push(value);
				}
			} else if (name.indexOf('[') > -1) {
				qs = '';
				if ($.isArray(value) || $.isPlainObject(value)) {
					$.each(value, function (k, v) {
						qs += '&' + name + '[' + k + ']=' + v;
					});
				} else {
					qs += '&' + name + '=' + encodeURIComponent(value);
				}
				if (qs) data = $.deparam(qs);
			} else {
				if (name) data[name] = value;
			}
			return data;
		},
		clearEnable: function(enable){
			if (enable === true || Finder.element.find('.sui-filter').length){
				Finder.buttons.filter('.clear').parent().enable();
			} else if (enable === false || !Finder.element.find('.sui-filter').length) {
				Finder.buttons.filter('.clear').parent().disable();
			}
		},
		init: function(){

			var globalname = 'widget-filters:' + Finder.widget.attr('id');

			Finder.filter = Finder.element.find('.sui-filter');
			Finder.fields = Finder.element.find('.sui-field');
			Finder.buttons = Finder.element.find('.sui-button a');
			Finder.ul = Finder.element.find('.sui-filterset ul');

			Finder.fields.customField();

			Finder.fields.on('field:focus',function(){
				Finder.element.addClass('focus');
			});
			Finder.fields.on('field:blur',function(){
				Finder.element.removeClass('focus');
			});

			Finder.element.on('submit',function(event){
				event.stopImmediatePropagation();
				event.preventDefault();
				if (Device.ismobile){
					Finder.fields.filter('.search').find('.input').blur();
					Finder.buttons.filter('.search').click();
				} else {
					Finder.buttons.filter('.search').trigger('click');
					Finder.fields.filter('.search').find('.input').focus();
				}
			});

			Finder.buttons.on('click', function (event) {
				var $this = $(this);
				if ($this.parent().isDisable()) return;
				if ($this.hasClass('clear')) {
					var $filt = Finder.element.find('.sui-filter');
					var $issel = $filt.filter('.selected');
					$filt.parent().remove();
					Finder.fields.find('.input').val('');
					if ($issel.length) Finder.widget.trigger('widget:filter');
					else Finder.widget.trigger('filter:change');
					Finder.clearEnable();
				} else if ($this.hasClass('search')) {
					Finder.widget.trigger('widget:search');
				} else if ($this.hasClass('filter')) {
					if ($this.data('link-sui')) Finder.widget.trigger('filter:floatform', [$this]);
				}
				event.stopImmediatePropagation();
			});
			Finder.element.on('click', '.sui-filter .close', function (event) {
				event.stopImmediatePropagation();
				var $this = $(this);
				var $filt = $this.closest('.sui-filter');
				if ($filt.is('.unclosable')) return false;
				var $li = $this.closest('li');
				var $issel = $filt.filter('.selected');
				$li.remove();
				if ($issel.length) Finder.widget.trigger('widget:filter');
				else Finder.widget.trigger('filter:change');
				Finder.clearEnable();
			});
			Finder.element.on('click', '.sui-filter a', function (event, $lines) {
				var $this = $(this);
				var $filt = $this.parent();
				if ($filt.is('.undeselectable')) return false;
				$filt.closest('ul').find('[data-name="'+$filt.data('name')+'"]').not($filt).removeClass('selected');
				$filt.toggleClass('selected');
				Finder.widget.trigger('widget:filter');
			});
			Finder.widget.on('widget:filter', function (event) {
				Finder.widget.trigger('remote:finder', [Finder.getFilters()]);
				Finder.widget.trigger('filter:change');
			});
			Finder.widget.on('filter:change', function (event) {
				Device.Global.set(globalname, { html: Finder.ul.html() });
				var fparam = $.param(Finder.getFilters());
				var sparam = Finder.sector.attr('data-history');
				var fhpath;
				if (sparam){
					if (fparam){
						fhpath = sparam.split('?')[0]+'?'+fparam;
					} else {
						fhpath = sparam.split('?')[0];
					}
					Finder.sector.attr('data-history',fhpath);
				}
				Network.history.replace(fhpath);
			});
			Finder.widget.on('widget:search', function (event) {
				var $ul = Finder.ul;
				var $fd = Finder.element.find('.sui-field.search');
				var value = $('<div>'+$fd.val()+'</div>').text();

				if (value){
					$fd.val('');
					Finder.clearEnable(true);
					$ul.find('[data-name="search"][data-value="'+value+'"]').closest('li').remove();
					$(Template.get('wg', 'form', 'filter', {
						label: { name: 'Pesquisa', value: value, content: '' },
						data: { name: 'search', value: value }
					})).appendTo($ul).find('a').trigger('click');
				}

			});
			Finder.widget.on('remote:finder', function (event, filter) {
				var filt = filter || Finder.getFilters() || {};
				var setup = {};
				if (Finder.widget.is('.datagrid')){
					setup = {
						target: '@widget-area',
						render: '@datagrid-list',
						placement: 'inner',
						cache: false,
						filter: filt,
						ondone: function (setup) {
							var $badge = Finder.widget.find('.badge.total span');
							$badge.text(Common.area.find('.list').data('total') || Common.area.find('.line').length);
						}
					}
				} else if (Finder.widget.is('.calendar')){
					setup = {
						render: '@calendar-schedules',
						cache: false,
						filter: filt,
						ondone: function (setup) {
							var $cal = Finder.widget.find('.cal');
							$cal.calendar('unsetSchedules');
							$cal.calendar('setSchedules',setup.response.parsedJSON||{});
						}
					}
				} else if (Finder.widget.is('.spreadsheet')){
					setup = {
						render: '@sheet-data',
						cache: false,
						filter: filt,
						ondone: function (setup) {
							var hot = Finder.widget.find('.sheet').data('hot');
							hot.loadData(setup.response.parsedJSON);
						}
					}
				}
				Network.link.call(Finder.element, setup);
			});
			Finder.widget.on('filter:floatform', function (event, $el) {
				var filt = Finder.getFilters();
				var setup = {
					cancelnested: true,
					target: '@float-sector',
					cache: false,
					filter: filt
				}
				$.extend(setup, $el.link('_self'));
				Network.link.call($el, setup);
			});

			var globaldata = Device.Global.get(globalname) || {};
			if (globaldata.html){
				Finder.ul.html(globaldata.html.replace(' selected"','"'));
				/*
				var sparam = Finder.sector.attr('data-history');
				var fparam = $.deparam(sparam.split('?')[1]);
				console.log(sparam);
				*/
			}

			Finder.clearEnable();
		}
	}

	if (Common.finder.length) Finder.init();

};
