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
                Handson.valid = isValid;
            },
        }));
        Handson.sheet.data('hot', hot);
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
