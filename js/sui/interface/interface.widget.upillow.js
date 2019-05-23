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

sourceui.interface.widget.upillow = function($widget,setup){

	'use strict';

	var Upillow = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Parser = sourceui.instances.parser;
	var Notify = sourceui.instances.interface.plugins.notify;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	Upillow.common = new Interface.widget.common($widget,setup);
	Upillow.widget = $widget;
	Upillow.code = this.widget.children('code');
	Upillow.area = this.widget.children('section.area');

	var Cfg;

	Upillow.code.each(function(){
		var $code = $(this);
		if ($code.attr('type') !== 'event'){
			Cfg = ((JSON5)?JSON5.parse($code.text()):JSON.parse($code.text()))||{};
			return true;
		}
	});

	var Input = Template.get('wg','upillow','input',{
		name: ' name="'+(Cfg.fieldName?Cfg.fieldName:'file')+'"',
		url: Cfg.url?' data-url="'+Cfg.url+'"':'',
		accept: Cfg.accept?' accept="'+Cfg.accept+'"':'',
		selection: Cfg.selection?' '+Cfg.selection:''
	});

	Cfg.link = this.widget.link(Cfg.link||{});
	delete Cfg.link.nasted;

	var requestData = $.extend(true,Cfg.link,{
		session : Device.session.id(),
		fingerprint : Device.fingerprint.get(),
	});

	var Console = Debug.create('Upillow',{
		mode : 'FILE',
		title : Cfg.link.sui,
	});

	Cfg.requestHeaders = {
		'X-Sui-Request-Engine': 'php',
		'X-Sui-Request-Seeds': (setup.mergedseed) ? JSON.stringify(setup.mergedseed) : null,
		'X-Sui-Request-Key' : $.md5('uplw:'+Upillow.code.text()),
		'X-Sui-Request-Agent': JSON.stringify(Device.session.data()),
		'X-Sui-Request-Data' : JSON.stringify(requestData),
		'X-Sui-Request-Local': JSON.stringify(Network.localGet()),
	}

	var Trace = function(r,mode){
		var res = (r) ? JSON.parse(r) : {};
		var haserror = false;
		$.each(res||[],function(ka,va){
			if (va.type){
				haserror = (va.type == 'error' || va.type == 'fatal' || va.type == 'fail' || va.type == 'bug') ? true : haserror;
				va.mode = va.mode || mode || 'VALIDATE';
				Console.add(va.type,va);
			}
		});
		Console.trace();
		if (r && !haserror){

		}
	}

	Cfg.on = {
		complete: function(){
			Upillow.widget.trigger('upload:complete');
			Notify.open({
				type : 'valid',
				name : 'Upload de arquivos',
				message : 'O processo foi concluído com sucesso',
			});
		},
		filecomplete: function(t,r){
			Trace(r);
		},
		error: function(e,r){
			Trace(r);
			Notify.open({
				type : 'error',
				name : 'Upload de arquivos',
				message : 'Erros ocorreram durante a execução do processo',
			});
		},
		fileerror: function(e,r){
			Trace(r);
			Notify.open({
				type : 'error',
				name : 'Upload de arquivos',
				message : 'Alguns arquivos não puderam ser transmitidos para o servidor',
			});
		},
	}

	$(Input).appendTo(Upillow.area).upillow(Cfg);

	this.widgetData = function(){
		return Upillow.onlist;
	};

};
