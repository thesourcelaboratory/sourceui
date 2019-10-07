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

sourceui.interface.widget.spreadsheet = function ($widget, setup) {

    'use strict';

    var Handson = this;
    var Network = sourceui.instances.network;
    var Template = sourceui.templates.interface;
    var Device = sourceui.instances.device;
    var Debug = Device.Debug;
    var Plugin = sourceui.instances.interface.plugins;
    var Notify = Plugin.notify;
    var Interface = sourceui.interface;
    var Dom = Interface.dom;
    var JSONX = JSON5 || JSON;

    Handson.valid = true;
    Handson.invalid = {};
    Handson.common = new Interface.widget.common($widget, setup);
    Handson.widget = $widget;
    Handson.area = Handson.widget.children('.area');
    Handson.sheet = Handson.widget.find('.sheet');
    Handson.refresh = function () {
        var sh = Handson.widget.is('.maximized') ? Handson.area.outerHeight() : Handson.sheet.find('.wtSpreader').outerHeight();
        Handson.sheet.height(sh);
        Handson.sheet.css('opacity', 1);
        if (Handson.hot) Handson.hot.refreshDimensions();
    };

    var validators = {};
    validators['required'] = function(value, callback){
        var bool = true;
        if (value === '' || value === null) {
            bool = false;
        }
        callback(bool);
    };
    // change the datepicker

    class calendarEditor extends Handsontable.editors.TextEditor {
        constructor(hotInstance) {
            super(hotInstance);
        }
        prepare(row, col, prop, td, originalValue, cellProperties) {
            // Invoke the original method...
            super.prepare(row, col, prop, td, originalValue, cellProperties);
            // ...and then do some stuff specific to your CustomEditor
            this.customEditorSpecificProperty = 'foo';
            console.log(row, col, prop, td, originalValue, cellProperties);
        }
        getValue() {
            return calendar.getDate(); // returns currently selected date, for example "2013/09/15"
        }

        setValue() {
            calendar.highlightDate(newValue); // highlights given date on calendar
        }
    }

    Handsontable.validators.registerValidator('required', validators[name]);
    $.each($.jMaskPatterns,function(name,pattern){
        validators[name] = function(value, callback){
            var bool = true;
            if (value !== '' && value !== null) {
                if (!pattern.test(value)) {
                    bool = false;
                }
            }
            callback(bool);
        };
        Handsontable.validators.registerValidator(name, validators[name]);
        var namereq = name+'.required';
        validators[namereq] = function(value, callback){
            var bool = true;
            if (value !== '' && value !== null) {
                if (!pattern.test(value)) {
                    bool = false;
                }
            } else {
                bool = false;
            }
            callback(bool);
        };
        Handsontable.validators.registerValidator(namereq, validators[namereq]);
    });
    $.each($.jMaskValidates,function(name,fn){
        validators[name] = function(value, callback){
            var bool = true;
            if (value) {
                if (!fn(value)) {
                    bool = false;
                }
            }
            callback(bool);
        }
        Handsontable.validators.registerValidator(name, validators[name]);
    });


    var Promises = {
        visible: function () {
            return new Promise(function (resolve, reject) {
                if (!Handson.widget.is(':visible')) {
                    var readyinterval = setInterval(function () {
                        if (Handson.widget.is(':visible')) {
                            resolve(true);
                            clearInterval(readyinterval);
                        }
                    }, 100);
                } else {
                    resolve(true);
                }
            });
        }
    };

    Promises.visible().then(function (r) {
        var code = Handson.sheet.children('code').text();
        var cfg = JSONX.parse(code);
        if (cfg.columns && !cfg.colHeaders){
            var hasinlineheader = false;
            $.each(cfg.columns,function(k,v){
                if (v.header) hasinlineheader = true;
                if (v.required) cfg.columns[k].allowEmpty = false;
                if (hasinlineheader){
                    cfg.colHeaders = cfg.colHeaders || new Array(cfg.columns.length);
                    cfg.colHeaders[k] =  v.header || '';
                }
                delete cfg.columns[k].header;
                delete cfg.columns[k].required;
            })
        }
        cfg.afterInit = function () {
            Handson.refresh();
        }
        Handson.hot = Handson.draw(cfg);
    });

    Handson.draw = function (cfg) {
        if (Handson.hot) Handson.hot.destroy();
        var sh = Handson.widget.is('.maximized') ? Handson.area.outerHeight() : null;
        var hot = Handson.hot = new Handsontable(Handson.sheet.get(0), $.extend(cfg, {
            height: sh,
            afterChange: function (changes, source) {
                if (source != 'loadData') {
                    Handson.widget.trigger('field:input');
                }
            },
            afterValidate: function (isValid, value, row, prop, source) {
                if (isValid){
                    if (Handson.invalid[row]){
                        delete Handson.invalid[row][prop];
                    }
                    if ($.isEmptyObject(Handson.invalid[row])){
                        Handson.widget.trigger('widget:validrow',[hot, row]);
                    }
                } else {
                    Handson.invalid[row] = Handson.invalid[row] || {};
                    Handson.invalid[row][prop] = value;
                    Handson.widget.trigger('widget:error',[hot, value, row, prop, source]);
                }
                Handson.valid = $.isEmptyObject(Handson.invalid);
            },
        }));
        Handson.sheet.data('hot', hot);
        Handson.widget.trigger('widget:init',[hot]);
        return hot;
    }


    Handson.common.controller.on('click', 'li a', function (event, force) {
        var $this = $(this);
        var data = $this.data();
        if (data.alias === 'addrow') {
            var sel = Handson.hot.getSelected();
            sel = sel ? sel[0][2] + 1 : 0;
            Handson.hot.alter('insert_row', sel, 1);
            Handson.refresh();
        } else if (data.alias === 'delrows') {
            var sel = Handson.hot.getSelected();
            if (sel) {
                for (var i = sel[0][0]; i <= sel[0][2]; i++) {
                    Handson.hot.alter('remove_row', sel[0][0], 1);
                }
                Handson.refresh();
            }
        }
    });

    Handson.widgetData = function () {
        Handson.wgdata = { data: {}, modified: {}, validate: {}, info: {} };
        if (Handson.valid) {
            Handson.wgdata.data[Handson.sheet.data('name')] = Handson.hot.getData();
        } else {
            Notify.open({
                type: 'error',
                name: 'Validação',
                label: 'Oh... algo não está bom',
                message: 'Dados na planilha são inválidos',
            });
        }
        return Handson.valid;
    };

    Handson.test = function () {
        console.log(Handson);
    }
};
