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

sourceui.interface.widget.calendar = function($widget,setup){

	'use strict';

	var Calendar = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;
	var Notify = sourceui.instances.interface.plugins.notify;

	Calendar.common = new Interface.widget.common($widget,setup);
	Calendar.widget = $widget;
	Calendar.cal = Calendar.widget.find('.cal');
	Calendar.finder = Calendar.widget.children('.finder');
	Calendar.fields = Calendar.finder.find('.sui-field');
	Calendar.fields.customField();
	Calendar.buttons = Calendar.finder.find('.sui-button a');
	Calendar.area = Calendar.widget.children('.area');
	Calendar.list = Calendar.area.children('.days');
	Calendar.lines = Calendar.list.find('li');
	Calendar.line = Calendar.list.find('.schedule');

	var data = Calendar.cal.data();
	var scheds = Calendar.cal.find('code').text();
	data.toggle = true;
	data.navBar = true;
	Calendar.cal.calendar(data);
	if (scheds){
		scheds = JSON.parse(scheds) || {};
		Calendar.cal.calendar('setSchedules',scheds);
		if (Calendar.finder.length){
			Calendar.finder.insertAfter(Calendar.cal.find('.navigate'));
			if (Device.ismobile){
				Calendar.widget.on('seldate',function(event, $li){
					var $scheds = $li.find('.schedules').clone();
					if (!$scheds.length) $scheds = '<div class="empty">Não há apontamentos</div>'
					Calendar.cal.find('.modes > .details').html($scheds).prepend('<h2>'+moment($li.data('masked')).format('ll')+'</h2>');
				});
			}
		}
	}
	Calendar.linked = Calendar.widget.data('linkedwidget') ? $(Calendar.widget.data('linkedwidget')) : [];

	if (this.linked.length){
		if (this.linked.data('type') === 'events'){
			Calendar.cal.on('select',function(event,date,str,elem){
				var $dates = Calendar.linked.find('.area .eventgroup .date');
				var $empty = Calendar.linked.find('.area .empty').hide();
				var $title = Calendar.linked.find('.list-title');
				var $not = $dates.filter('[data-date!='+str+']').parent().hide();
				var $yes = $dates.filter('[data-date='+str+']').parent().show();
				if (!$yes.length) $empty.filter('.in-date').show();
				$title.text('Agendamentos para '+$.toDate(str,'br'));
			});
			Calendar.cal.on('unselect',function(event,str,elem){
				var $dates =  Calendar.linked.find('.area .eventgroup').show();
				var $empty = Calendar.linked.find('.area .empty').show();
				var $title = Calendar.linked.find('.list-title');
				$empty.filter('.in-date').hide();
				var D = $.toDate(str,'Date');
				$title.text('Agendamentos em '+$.monthNames('pt','short',D.getMonth())+'/'+D.getFullYear());
			});
			Calendar.cal.on('select:month',function(event,month){
				var data = Calendar.linked.children('.filter').link();
				data.filter = { month:month };
				data.target = Calendar.linked;
				data.placement = 'replace';
				data.onalways = function(){
					Calendar.linked = Calendar.widget.data('linkedwidget') ? $(Calendar.widget.data('linkedwidget')) : [];
				}
				Network.link(data);
			});
			Calendar.cal.find('.month > .week > li.selected').removeClass('selected').find('a').trigger('click');
		}
	}

	Calendar.common.controller.on('control', 'li a', function (event, $lines) {
		var $this = $(this);
		var data = { key: [], seed: 0 };
		if ($lines.length){
			if ($this.is(':attrHas("data-link")')) {
				$lines.each(function () {
					var $line = $(this);
					var d = $line.link('_self');
					if (d.sui) data.sui = d.sui;
					if (d.command) data.command = d.command;
					if (d.process) data.process = d.process;
					if (d.target) data.target = d.target;
					if (d.placement) data.placement = d.placement;
					if (d.key) data.key.push(d.key[0]);
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
				Network.link.call($this, data);
				event.stopImmediatePropagation();
				return;
			}
		}
	});

	this.widget.on('click', '.area .sui-calendar .schedule', function (event) {
		event.stopPropagation();
		var $this = $(this);
		if ($this.isDisable()) return;
		if (!Calendar.widget.hasClass('check')) {
			$this.trigger('pick');
		}
	});

	this.widget.on('pick', '.area .sui-calendar .schedule', function (event) {
		event.stopPropagation();
		var $this = $(this),
			$selected = $this.closest('.sui-view').find('.sui-widget.calendar > .area .selected');
		if ($this.isDisable()) return;
		$selected.removeClass('selected');
		$this.addClass('selected');
		Calendar.widget.trigger('pickline', [$this]);
	});
	this.widget.on('pickline', function (event, $line) {
		event.stopPropagation();
		if ($line.isDisable()) return;
		var link = $line.link();
		if (link.href || (link.command && link.sui && link.placement)) {
			Network.link.call($line, link);
		} else {
			Calendar.common.toggleTools.call($line, 'pickline');
			var $button = Calendar.common.controller.find('[data-event-enable*="pickline"]');
			var linetype = $line.data('type');
			if (linetype) $button = $button.filter('[data-type-enable*="' + linetype + '"]:eq(0)');
			else $button = $button.filter(':eq(0)');
			$button.trigger('control',[$line]);
		}
	});


	// FINDER -----------------------------
	/*
	var timeout = null;
	this.getFilters = function () {
		var $filters = Calendar.finder.find('.sui-filter.selected');
		var ftr = '';
		$filters.each(function () {
			var $f = $(this);
			ftr = $.extend(true, ftr, Calendar.deparam($f.data('name'), $f.data('value')));
		});
		return $.deparam(ftr);
	};
	this.deparam = function (name, value) {
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
			data[name] = value;
		}
		return data;
	}
	Calendar.buttons.on('click', function (event) {
		var $this = $(this);
		if ($this.parent().isDisable()) return;
		if ($this.hasClass('clear')) {
			if (Calendar.widget.hasClass('search')) {
				Calendar.fields.find('.input').val('');
				Calendar.buttons.filter('.clear').parent().disable();
				Calendar.widget.trigger('calendar:search');
			} else if (Calendar.widget.hasClass('filter')) {
				Calendar.finder.find('.sui-filter').parent().remove();
				Calendar.buttons.filter('.clear').parent().disable();
				Calendar.widget.trigger('calendar:filter');
			}
		} else if ($this.hasClass('search')) {
			Calendar.widget.removeClass('filter').addClass('search');
			Calendar.finder.find('.sui-field.search .input').focus();
		} else if ($this.hasClass('filter')) {
			if ($this.data('link-sui')) Calendar.widget.trigger('filter:floatform', [$this]);
			Calendar.widget.removeClass('search').addClass('filter');
			if (Calendar.finder.find('.sui-filter').length) Calendar.buttons.filter('.clear').parent().enable();
			else Calendar.buttons.filter('.clear').parent().disable();
		}
		event.stopImmediatePropagation();
	});
	Calendar.finder.on('click', '.sui-filter .close', function (event) {
		var $this = $(this);
		$this.closest('li').remove();
		Calendar.widget.trigger('calendar:filter');
		event.stopImmediatePropagation();
	});
	Calendar.finder.on('click', '.sui-filter a', function (event, $lines) {
		var $this = $(this);
		var $parent = $this.parent();
		$parent.closest('ul').find('[data-name="'+$parent.data('name')+'"]').not($parent).removeClass('selected');
		$parent.toggleClass('selected');
		Calendar.widget.trigger('calendar:filter');
		event.stopImmediatePropagation();
	});
	Calendar.finder.on('click', '.sui-filterset', function (event) {
		Calendar.buttons.filter('.filter').click();
	});
	Calendar.fields.filter('.search').on('field:input', function (event, $lines) {
		var $fd = $(this);
		var strictsearch = Calendar.finder.data('strictsearch');
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(function () {
			Calendar.widget.trigger('calendar:search');
		}, strictsearch ? 100 : 500);
		if ($fd.val() === '') {
			Calendar.buttons.filter('.clear').parent().disable();
		} else {
			Calendar.buttons.filter('.clear').parent().enable();
		}
	});
	Calendar.widget.on('calendar:filter', function (event) {
		Calendar.widget.trigger('remote:finder', [Calendar.getFilters()]);
	});
	Calendar.widget.on('calendar:search', function (event) {
		var $badge = Calendar.widget.find('.badge.total span');
		var $fd = Calendar.finder.find('.sui-field.search');
		var nm = $fd.data('name');
		var ftr = ftr + '&' + nm + '=' + $fd.val();
		var filt = $.deparam(ftr);
		var srch = (filt[nm] || '').replace(/(<([^>]+)>)/ig, '');
		var last = Calendar.finder.data('srch') || '';

		var strictsearch = Calendar.finder.data('strictsearch');

		Calendar.finder.data('srch', srch);
		var listlen = Calendar.list.data('length');
		var $show;
		if (strictsearch || typeof listlen === 'undefined' || srch.length >= last.length) {
			if (strictsearch || typeof listlen === 'undefined' || Calendar.line.length < listlen) {
				if (strictsearch) {
					$show = Calendar.line.find(strictsearch).filter(':containsNC("' + srch + '")');
					$show = $show.closest('.line');
				} else {
					$show = Calendar.line.filter(':containsNC("' + srch + '")');
				}
				if ($show.length || strictsearch) {
					if (srch) {
						Calendar.line.hide();
						$show.show();
						$badge.text($show.length);
					} else {
						Calendar.line.show();
						$badge.text(Calendar.list.data('total'));
					}
					if (strictsearch) {
						Calendar.list.prevAll('.empty').remove();
						if (!$show.length) Calendar.list.before('<div class="sn empty "><i class="icon-lens-blocked"></i>Não há Registros disponíveis contendo "<strong>' + srch + '</strong>".<br></div>');
					}
					return;
				}
			}
		}
		if (!strictsearch) Calendar.widget.trigger('remote:finder', [filt]);
	});
	Calendar.widget.on('remote:finder', function (event, filter) {
		var filt = filter || Calendar.getFilters();
		var $badge = Calendar.widget.find('.badge.total span');
		var setup = {
			render: '@calendar-schedules',
			cache: false,
			filter: filt,
			ondone: function (setup) {
				Calendar.cal.calendar('unsetSchedules');
				Calendar.cal.calendar('setSchedules',setup.response.parsedJSON||{});
				if (Calendar.widget.hasClass('filter')) {
					if (Calendar.finder.find('.sui-filter').length) {
						Calendar.buttons.filter('.clear').parent().enable();
					} else {
						Calendar.buttons.filter('.clear').parent().disable();
					}
				}

			}
		}
		Network.link.call(Calendar.finder, setup);
	});
	Calendar.widget.on('filter:floatform', function (event, $el) {
		var filt = Calendar.getFilters();
		var setup = {
			cancelnested: true,
			target: '@float-sector',
			cache: false,
			filter: filt
		}
		$.extend(setup, $el.link('_self'));
		Network.link.call($el, setup);
	});
	*/
	// ------------------------------------------

	this.init = function () {

		Calendar.area = Calendar.widget.children('.area');
		Calendar.list = Calendar.area.children('.days');
		Calendar.lines = Calendar.list.find('li');
		Calendar.line = Calendar.list.find('.schedule');

	}



	this.widgetData = function(){
		return {
			date : Calendar.cal.calendar('getDate') || null,
			month : Calendar.cal.calendar('getMonth')
		}
	};

};
