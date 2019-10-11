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

	/*
	setTimeout(function(){
		if (!Device.ismobile && Calendar.widget.height() < Calendar.widget.parent().height()-1){
			Calendar.widget.height(Calendar.widget.parent().height()-1);
		}
	},1);
	*/

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
				Calendar.widget.on('unseldate',function(event, $li){
					Calendar.cal.find('.modes > .details').html('');
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

	Calendar.common.controller.on('click', 'li a', function (event, force) {
		var $this = $(this);
		if (!force && $this.isDisable()) return;
		var evtenable = $this.data('event-enable');
		if (evtenable && (evtenable.has('pickline') || evtenable.has('checklines'))) {
			var data = { key: [], seed: 0 };
			var $lines = Calendar.widget.find('.area .modes > .details > .schedule.selected, .area .modes > .days .schedule.selected');
			if ($lines.length) {
				Calendar.widget.trigger('alias:' + $this.data('alias'), [$lines]);
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
			} else {
				Notify.open({
					type: 'alert',
					name: $this.text() || $this.attr('title') || $this.attr('alt') || 'Ação',
					label: Datagrid.widget.find('.title h3 span').text(),
					message: 'Selecione pelo menos um registro.'
				});
			}
			event.stopImmediatePropagation();
			return;
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
