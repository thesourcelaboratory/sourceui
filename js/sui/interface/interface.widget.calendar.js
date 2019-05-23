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
	var data = Calendar.cal.data();
	data.toggle = true;
	data.navBar = true;
	Calendar.cal.calendar(data);
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
	this.widgetData = function(){
		return {
			date : Calendar.cal.calendar('getDate') || null,
			month : Calendar.cal.calendar('getMonth')
		}
	};

};
