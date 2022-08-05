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

	var isPT = (Dom.html.attr('lang').indexOf('pt-') > -1);

    Handson.valid = true;
    Handson.invalid = {};
    Handson.common = new Interface.widget.common($widget, setup);
    Handson.widget = $widget;
    Handson.area = Handson.widget.children('.area');
    Handson.view = Handson.widget.closest('.sui-view');
    Handson.sector = Handson.view.closest('.sui-sector');
	Handson.height = null;
    Handson.sheet = Handson.widget.find('.sheet');
	Handson.cfg = {};
	Handson.kill = function () {
         if (Handson.hot && !Handson.killed) Handson.hot.destroy();
		Handson.killed = true;
    };
    Handson.refresh = function () {
        var sh = Handson.cfg.height || Handson.widget.is('.maximized') ? Handson.area.outerHeight() : Handson.sheet.find('.wtSpreader').outerHeight();
        Handson.sheet.height(sh);
        Handson.sheet.css('opacity', 1);
        if (Handson.hot) setTimeout(function(){
			Handson.hot.render();
		},50);
    };
	Handson.resize = function () {
		clearTimeout(Handson.resizeTimeout);
        Handson.resizeTimeout = setTimeout(function(){
			Handson.kill();
			Handson.draw(Handson.cfg);
		},166);
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



    Handson.widget.on('widget:emptyload',function(){
        Handson.common.toggleTools.call(Handson.widget,'emptyload');
    });
    Handson.widget.on('widget:dataload',function(){
        Handson.common.toggleTools.call(Handson.widget,'dataload');
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
        var code = $.trim(Handson.sheet.children('code').text());
        Handson.sheet.children('code').remove();
        //var cfg = JSONX.parse(code);
        var cfg = eval('('+code+');');
        if (cfg.renderers){
            $.each(cfg.renderers,function(k,v){
                Handsontable.renderers.registerRenderer(k, v);
            });
            delete cfg.renderers;
        }
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
		setTimeout(function(){ Handson.hot = Handson.draw(cfg); }, 100);
    });

    Handson.draw = function (cfg) {
        if (Handson.hot && !Handson.killed) Handson.hot.destroy();
		if (cfg.widgetDimensions){
			Handson.widgetDomensions = cfg.widgetDimensions;
			var parentheight = Handson.widget.parent().innerHeight();
			var widgetOffsetTop = Handson.widget.position().top + (Handson.widget.children('.title').height() || 0);
			var scrollHeight = Handson.widget.closest('.scroll-default').innerHeight();
			console.log(parentheight,widgetOffsetTop,scrollHeight);
			cfg.height = (widgetOffsetTop + 300 <= scrollHeight ? parentheight - widgetOffsetTop : 300)+'px';
			cfg.width = "100%";
			cfg.renderAllRows = cfg.columns && cfg.columns.length <= 100 ? true : false;
		}
		Handson.cfg = $.extend({},cfg);
		if (cfg.height) Handson.area.height(cfg.height);
        var sh = Handson.widget.is('.maximized') ? Handson.area.outerHeight() : null;
        var hot = Handson.hot = new Handsontable(Handson.sheet.get(0), $.extend(cfg, {
			observeDOMVisibility: false,
			observeChanges: false,
            height: cfg.height || sh,
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
						delete Handson.invalid[row];
                    }
                } else {
                    Handson.invalid[row] = Handson.invalid[row] || {};
                    Handson.invalid[row][prop] = value;
                    Handson.widget.trigger('widget:error',[hot, value, row, prop, source]);
                }
                Handson.valid = $.isEmptyObject(Handson.invalid);
            },
            afterLoadData: function(initialLoad){
                var data = this.getData();
                Handson.area.children('.empty').remove();
                if (!data.length){
                    if (initialLoad){
                        if (cfg.searchRequiredInfo) Handson.area.prepend('<div class="empty icon-lens-blocked">'+(isPT ? 'Você precisa realizar uma pesquisa para mostrar dados nessa grade.' : 'You will need to do a search to show data into the datagrid.')+'</div>');
                        else if (cfg.filterRequiredInfo) Handson.area.prepend('<div class="empty icon-funnel-blocked">'+(isPT ? 'Você precisa realizar uma pesquisa ou filtrar dados para que sejam mostrados nessa grade.' : 'You will need to do a search or filter data to show them into the datagrid')+'</div>');
                    } else {
                        Handson.area.prepend('<div class="empty icon-table-blocked">'+(isPT ? 'Não ha dados para serem mostrados nessa grade.' : 'There is no data to be shown into this datagrid')+'</div>');
                    }
                    Handson.widget.trigger('widget:emptyload');
                } else {
                    Handson.widget.trigger('widget:dataload',[data]);
                }
            },
			beforeRefreshDimensions: function () { return false; }
        }));
        //setTimeout(hot.render,10);
        Handson.sheet.data('hot', hot);
        Handson.widget.trigger('widget:init',[hot]);
		Handson.killed = false;
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
		var name = Handson.sheet.data('name');
		if (!name) return null;
        Handson.wgdata = { data: {}, modified: {}, validate: {}, info: {} };
        if (Handson.valid) {
            Handson.wgdata.data[name] = Handson.hot.getData();
        } else {
            Notify.open({
                type: 'error',
                name: isPT ? 'Validação' : 'Validation',
                label: isPT ? 'Algo não está certo' : 'Something got wrong',
                message: isPT ? 'Dados na planilha são inválidos' : 'Spreadsheet data was invalid',
            });
        }
        return Handson.valid;
    };

	Handson.view.on('view:hidden',function(){
		Handson.kill();
	});
	Handson.view.on('view:shown',function(){
		setTimeout(function(){ Handson.draw(Handson.cfg); }, 10);
	});

	$(window).on('resize',function(){
		Handson.resize();
	});
    Handson.test = function () {
        console.log(Handson);
    }
};
