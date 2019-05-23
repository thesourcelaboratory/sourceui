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



sourceui.interface.widget.events = function($widget,setup){

	'use strict';

	var Events = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	Events.common = new Interface.widget.common($widget,setup);
	Events.widget = $widget;
	Events.filter = Events.widget.children('.filter');
	Events.fields = Events.filter.find('.sui-field');
	Events.fields.customField();

	var timeout = null;
	Events.filter.on('field:input',function(event,$lines){
		if (Device.ismobile){
			var $field = $(event.target).addClass('modified');
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(function(){
				Events.filter.find('.sui-buttonset .search').trigger('click');
			},500);
		}
	});
	Events.filter.find('.sui-buttonset .search').on('click',function(){
		var data = '';
		Events.filter.find('.sui-field').each(function(){
			var $fd = $(this);
			data = data+'&'+$fd.data('name')+'='+$fd.val();
		});
		var setup = {
			target : '@widget-area',
			render : '@event-list',
			cache : false,
			filter : $.deparam(data)
		};
		Network.link.call(Events.filter,setup);
	});

};