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

sourceui.interface.widget.wizard = function ($widget, setup) {

	'use strict';

	var Wizard = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	Wizard.valid = true;
	Wizard.widget = $widget;
	Wizard.common = new Interface.widget.common($widget, setup);
	Wizard.fields = Wizard.widget.find('.sui-field');
	Wizard.buttons = Wizard.widget.find('.sui-buttonset .sui-button a');
	Wizard.fields.customField();
	Wizard.widget.on('field:input', function (event, $lines) {
		var $field = $(event.target).addClass('modified');
		Wizard.common.toggleTools('field:input');
	});
	Wizard.widget.on('field:change', function (event, $lines) {
		var $field = $(event.target).addClass('modified');
		Wizard.common.toggleTools('field:change');
	});
	Wizard.buttons.on('click', function (event) {
		var $a = $(this);
		if ($a.data('alias') == 'submit') {
			$a.data('linkCache', false);
			Wizard.widgetData();
			if (Wizard.valid === true) {
				Network.link.call($a, Wizard.wgdata);
				event.stopImmediatePropagation();
			} else {
				Wizard.widget.closest('.sui-view').trigger('form:invalid');
			}
		} else if ($a.data('alias') == 'close' || $a.data('alias') == 'cancel') {
			Dom.floatSectorContainer.find('.sui-sector .close').click();
		}
	});

	Wizard.widgetData = function () {
		Wizard.wgdata = { data: {}, validate: {} };
		Wizard.valid = true;
		Wizard.fields.filter(':not(.disable):not(.ignored)').each(function () {
			var $field = $(this);
			var status = $field.validate();
			if (status === true) {
				Wizard.wgdata.data[$field.data('name')] = $field.val();
				var vdata = $field.data('validate');
				if (vdata) Wizard.wgdata.validate[$field.data('name')] = $.extend({ id: $field.attr('id') }, vdata);
			} else if (status !== true) {
				Wizard.valid = status;
				return true;
			}
		});
		return Wizard.valid;
	};

};