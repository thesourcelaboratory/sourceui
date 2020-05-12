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

sourceui.interface.widget.form = function ($widget, setup) {

	'use strict';

	var Form = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;
	var Notify = sourceui.instances.interface.plugins.notify;

	Form.valid = true;
	Form.widget = $widget;
	Form.common = new Interface.widget.common($widget, setup);
	Form.fields = this.widget.find('.sui-field');
	Form.fields.customField();

	// MAIN WIDGET EVENTS ----------------------------------
	Form.widget.on('field:input', function (event, $lines) {
		var $field = $(event.target).addClass('modified');
		Form.common.toggleTools('field:input');
		Form.widget.trigger('widget:input',[$field]);
		Form.hasValue($field);
	});
	Form.widget.on('field:change', function (event, $lines) {
		var $field = $(event.target).addClass('modified');
		Form.common.toggleTools('field:change');
		Form.widget.trigger('widget:change',[$field]);
		Form.hasValue($field);
	});
	Form.widget.on('field:keyboard', function (event, $lines) {
		var $field = $(event.target).addClass('modified');
		Form.common.toggleTools('field:keyboard');
		Form.widget.trigger('widget:keyboard',[$field]);
		Form.hasValue($field);
	});
	// ------------------------------------------------------

	Form.hasValue = function($field){
		$field.each(function(){
			var $this = $(this);
			if ($this.is('.mce, .code')) return true;
			var v = $this.val();
			if (v === '' || v == null || (v && (v.length === 0 || $.isEmptyObject(v)))){
				$this.removeClass('valued');
			} else {
				$this.addClass('valued');
			}
		});
	}

	Form.fdname = function (name) {
		if (name.indexOf('[]') > -1) {
			return name.substring(0, name.length - 2);
		} else if (name.indexOf('[') > -1) {
			return name.substring(0, name.indexOf('['));
		}
		return name;
	}
	Form.deparam = function (name, value) {
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
	Form.diff = function (fd) {

		var ro = '', rn = '';
		var o = fd.inittxt || fd.initval;
		var n = fd.text || fd.value;

		if ($.isArray(o)) ro = o.join(', ')
		else if ($.isPlainObject(o)) ro = Object.values(o).join(', ');
		else ro = o;

		if ($.isArray(n)) rn = n.join(', ')
		else if ($.isPlainObject(n)) rn = Object.values(n).join(', ');
		else rn = n;

		ro = (ro === undefined) ? '' : ro;
		rn = (rn === undefined) ? '' : rn;

		if (ro.length > 100 || rn.length > 100) {
			rn = ro.difference(rn).textOverflow(100);
			ro = rn.difference(ro).textOverflow(100);
		}
		return { label: encodeURIComponent(fd.label), old: encodeURIComponent(ro), new: encodeURIComponent(rn) };
	}
	Form.widgetData = function () {
		Form.wgdata = { data: {}, modified: {}, validate: {}, info: {} };
		Form.valid = true;
		Form.fields = this.widget.find('.sui-field');
		Form.fields.each(function () {
			var $field = $(this);
			if ($field.isDisable()) return true; // continue;
			var status = $field.validate();
			if (status === true) {
				var fd = {
					name: $field.data('name'),
					value: $field.val(),
					text: $field.find('.value .option').map(function () { return $(this).text(); }).get().join(', ') || $field.filter('.date, .datetime').find('input').val(),
					initval: $field.data('initval'),
					inittxt: $field.data('inittxt'),
					label: $field.children('.label').text().replace(' *', '') || $field.data('name'),
				}
				// data
				Form.wgdata.data = $.extend(true, Form.wgdata.data, Form.deparam(fd.name, fd.value));

				//modified
				if ($field.hasClass('modified') && fd.initval != fd.value) {
					$.extend(Form.wgdata.modified, Form.deparam(fd.name, Form.diff(fd)));
				}

				//validate
				var vdata = $field.data('validate');
				if (vdata) Form.wgdata.validate[Form.fdname(fd.name)] = $.extend({ id: $field.attr('id') }, vdata);

				//info
				Form.wgdata.info[Form.fdname(fd.name)] = { label: fd.label, text: fd.text };

			} else if (status !== true) {
				Form.valid = status;
				return true;
			}
		});

		if (Form.valid) {
			Form.wgdata.ondone = function () {
				Form.fields.trigger('field:initval');
			};
		}
		return Form.valid;
	};
	Form.hasValue(Form.fields);
};
