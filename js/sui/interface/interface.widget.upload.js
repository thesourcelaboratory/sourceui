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

sourceui.interface.widget.upload = function($widget,setup){

	'use strict';

	var Upload = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	var isPT = (Dom.html.attr('lang').indexOf('pt-') > -1);

	Upload.common = new Interface.widget.common($widget,setup);
	Upload.widget = $widget;
	Upload.code = this.widget.find('code[name="upload"]');

	var Cfg = ((JSON5)?JSON5.parse(this.code.text()):JSON.parse(this.code.text()))||{};

	var Input = Template.get('wg','upload','input',{accept: ' accept="'+Cfg.upload.accept+'"', selection: ' '+Cfg.upload.selection});
	var wlink = this.widget.link(Cfg.upload.link||{});
	delete Cfg.upload.link;

	Cfg.upload = $.extend(wlink,Cfg.upload);
	this.code.remove();

	this.dragzone = this.widget.find('.area');
	this.circpct = this.widget.find('.dash .percent');
	this.auxremain = this.widget.find('.dash .aux.remaining');
	this.auxspeed = this.widget.find('.dash .aux.speed');
	this.donut = this.widget.find('.donut');
	this.badge = this.widget.find('.badge.queue span');
	this.buttons = this.widget.find('a.button');
	this.filelist = this.widget.find('.filelist');
	this.queue = this.filelist.find('.queue');
	this.onlist = $();

	var aux = { remain:0, total:0, speed:0, lasttime:Date.now(), lastsize:0 };
	var dashData = { r:0, c:0, o:0, p:0 };

	Upload.auxRemain = function(){
		if (Upload.widget.is('.process')){
			Upload.auxremain.children('span').text($.formatBytes(aux.remain,2));
			Upload.auxremain.children('small').text($.formatBytes(aux.total,2)+' Total');
		} else {
			Upload.auxremain.children('span').text($.formatBytes(aux.total,2));
			Upload.auxremain.children('small').text('Total');
		}
	};
	Upload.auxSpeed = function(){
		Upload.auxspeed.children('span').text($.formatSpeed(aux.speed,2));
	};
	Upload.dashOffset = function(p){
		var o;
		var r = dashData.r = dashData.r || parseFloat(Upload.donut.attr('r'));
		var c = dashData.c = dashData.c || parseFloat(Upload.donut.attr('stroke-dasharray'));
		if (!c){
			c = Math.PI*(r*2);
			Upload.donut.attr('stroke-dasharray',c);
		}
		if (p > 0){
			if (p > 100) p = 100;
			o = ((100-p)/100)*c;
		} else {
			o = c;
		}
		dashData.p = p;
		dashData.o = dashData.o || c;
		Upload.donut.velocity("stop").velocity({ 'stroke-dashoffset': o, tween:[o,dashData.o] },{ duration: 500, easing: "linear",
			progress:function(e,c,r,s,t){
				p = Math.round(((dashData.c-t)/dashData.c) *100);
				if (dashData.p !== p){
					Upload.circpct.text(p+'%');
					dashData.p = p;
				}
			}
		});
		dashData.o = o;
	};
	Upload.pctInterval = function(){
		var p = 0, l = 0, s = 0;
		Upload.onlist.each(function(){
			var $file = $(this);
			l += $file.data('ldd')||0;
		});
		s = ((l - aux.lastsize) / ((Date.now() - aux.lasttime) / 1000));
		aux.speed = s||aux.speed;
		Upload.auxSpeed();
		aux.remain = l;
		Upload.auxRemain();
		p = (aux.remain / aux.total) * 100;
		Upload.dashOffset(p);
		if (p >= 100) Upload.widget.trigger('uploads:complete');
		aux.lasttime = Date.now();
		aux.lastsize = aux.remain;
	};

	Upload.dragzone.on('drop',function(event){
		event.preventDefault();
		Upload.widget.trigger('queue:change',[event.originalEvent.dataTransfer.files]);
	});
	Upload.dragzone.on('dragover',function(event){
		event.preventDefault();
	});
	Upload.dragzone.on('dragend',function(event){
		event.preventDefault();
	});
	Upload.widget.on('change','.input.file',function(){
		Upload.widget.trigger('queue:change',[this.files]);
	});
	Upload.widget.on('queue:change',function(event,$files){
		if (Upload.widget.is('.complete, .error, .done')){
			Upload.widget.trigger('queue:clear');
		}
		if ($files.length){
			if (Upload.widget.hasClass('queue')){
				Upload.widget.removeClass('done');
				Upload.widget.removeClass('error');
			}
			Upload.widget.addClass('ready');
			$.each($files||[],function(k,v){
				var id = $.md5(v.name+v.size);
				if (!Upload.queue.children('#'+id).length){
					var st = (Cfg.upload.maxfilesize && Cfg.upload.maxfilesize < v.size) ? 'error' : 'queue';
					var data = {
						id: id,
						name: v.name,
						mime : v.type,
						type : (v.type.has('image')) ? 'image' : 'file',
						ext : v.name.split('.').pop().toLowerCase(),
						size: v.size,
						bytes : $.formatBytes(v.size),
						status : st
					};
					var $file = $(Template.get('wg','upload','filelist','file',data));
					Upload.queue.prepend($file);
					if (st == 'queue'){
						Upload.onlist = Upload.onlist.add($file);
						$file.data('data',data).data('file',v);
						Upload.widget.trigger('queue:add',[$file]);
					} else {
						Upload.widget.trigger('queue:error',[$file,'maxfilesize',Cfg.upload.maxfilesize]);
						$file.find('.details').html('O arquivo é maior que o limite de  <b>'+$.formatBytes(Cfg.upload.maxfilesize)+'</b>.');
					}
				}
			});
			if (Upload.onlist.length) {
				Upload.widget.removeClass('drag');
				Upload.widget.addClass('queue dash list');
			} else {
				Upload.widget.addClass('error');
				Notify.open({
					type : 'error',
					name : isPT ? 'Upload de Arquivos' : 'File Upload',
					label : isPT ? 'Não há bons arquivos...' : 'There is no good files...',
					message : isPT ? 'Nenhum dos arquivos da lista está apto para upload' : 'None good files at the list to be uploaded',
				});
			}
		}
		Upload.badge.text(Upload.onlist.length);
	});
	Upload.widget.on('queue:add',function(event,$file){
		var fda = $file.data('data');
		$file.data('pct',0);
		$file.on('upload:start',function(){
			var data = $.extend({},Cfg.upload,{
				file : $file.data('file'),
				fdata : {
					id : fda.id,
					file : fda.file,
					mime : fda.mime,
					type : fda.type,
					ext : fda.ext,
					name : fda.name,
					bytes : fda.bytes,
					size : fda.size,
				},
			});
			var netup = new Network.upload(data);
			netup.on('uploading',function(p,l,t){
				if (p < 0 || !p) p = 0;
				else if (p > 100) p = 100;
				$file.find('.progress .bar').velocity('stop').velocity({width:p+'%'},1000,'linear');
				$file.data('pct',p);
				$file.data('ldd',l);
			});
			netup.on('abort',function(){
				$file.find('.progress .bar').velocity('stop').velocity({width:0},1000,'linear');
				$file.data('pct',0);
				$file.data('ldd',0);
			});
			netup.on('error',function(error){
				$file.switchClass('queue','error');
				$file.data('pct',100);
				$file.data('ldd',0);
				$file.find('.details').html('Um erro ocorreu no servidor: '+error);
				$file.trigger('upload:error');
			});
			netup.on('complete',function(t){
				$file.switchClass('queue','done');
				$file.data('pct',100).data('ldd',t).removeData('data').removeData('file');
			});
			netup.start();
			$file.data('netup',netup);
			$file.switchClass('queue','process');
		});
		$file.on('upload:stop',function(){
			var netup = $file.data('netup');
			if (netup && netup.state() === 1){
				$file.switchClass('process','queue');
				netup.stop();
			}
		});
		$file.on('upload:remove',function(){
			$file.velocity({scale:[0.95,1],opacity:[0,1]}, 200, function(){
				if ($file.is(':only-child')){
					Upload.widget.removeClass('ready dash list');
					Upload.widget.addClass('drag');
				}
				Upload.onlist = Upload.onlist.not($file[0]);
				Upload.badge.text(Upload.onlist.length);
				$file.remove();
				if (!$file.is('.error')){
					aux.total -= fda.size;
					Upload.auxRemain();
				}
			});
		});
		$file.on('upload:error',function(){
			if (!$file.is('.error')){
				$file.removeClass('queue').addClass('error');
				$file.removeData('data').removeData('file');
				aux.total -= fda.size;
				Upload.auxRemain();
			}
		});
		aux.total += fda.size;
		Upload.auxRemain();
	});
	Upload.widget.on('queue:clear',function(event,$file){
		Upload.onlist = $();
		Upload.queue.find('.file').each(function(){
			var $file = $(this);
			$file.trigger('upload:remove');
		});
		Upload.widget.removeClass('complete done error');
	});
	Upload.widget.on('uploads:prepare',function(event){
		Upload.widget.removeClass('queue error done');
		Upload.widget.addClass('prepare');
		var collection = { totalsize:0, maxfilesize:Cfg.upload.maxfilesize, accept:Cfg.upload.accept, filelist:{} };
		Upload.onlist.each(function(){
			var $file = $(this);
			var id = $file.attr('id');
			var data = $file.data('data');
			if (data){
				collection.filelist[id] = data;
				collection.totalsize += data.size;
			}
		});
		var setup = $.extend({collection:collection},Cfg.upload);
		var netup = new Network.upload(setup);
		netup.on('test:error',function(e){
			Upload.widget.addClass('queue error');
			Upload.widget.removeClass('prepare');
		});
		netup.on('test:done',function(r){
			Upload.widget.removeClass('prepare');
			Upload.widget.trigger('uploads:start');
		});
		netup.test();
	});
	Upload.widget.on('uploads:start',function(event){
		Upload.onlist.each(function(){
			var $file = $(this);
			if ($file.data('file')){
				var netup = $file.data('netup');
				if (!netup || netup.state() === 0) $file.trigger('upload:start');
			} else {
				Upload.onlist = Upload.onlist.not($file[0]);
			}
		});
		if (Upload.onlist.length){
			Upload.genpctInterval = setInterval(Upload.pctInterval, 500);
			Upload.widget.addClass('process');
			Upload.pctInterval();
		} else {
			Upload.widget.addClass('error');
			Notify.open({
				type : 'error',
				name : isPT ? 'Upload de Arquivos' : 'Upload files',
				label : isPT ? 'Não há bons arquivos...' : 'There is no good files',
				message : isPT ? 'Nenhum dos arquivos da lista está apto para ser recebido pelo servidor' : 'None good files to be received by the server at the list',
			});
		}
	});
	Upload.widget.on('uploads:stop',function(event){
		Upload.onlist.each(function(){
			$(this).trigger('upload:stop');
			Upload.dashOffset(0);
			clearInterval(Upload.genpctInterval);
			Upload.widget.removeClass('prepare process error done');
			Upload.widget.addClass('queue');
			aux.remain = 0;
			Upload.auxRemain();
		});
	});
	Upload.widget.on('uploads:complete',function(event){
		clearInterval(Upload.genpctInterval);
		setTimeout(function(){
			Upload.widget.addClass('done');
			Upload.widget.switchClass('process','complete');
			Upload.dashOffset(0);
			Upload.widget.closest('.sui-view').prev().one('view:open',function(){
				$(this).find('[data-alias="refresh"]').trigger('click');
			});
		},1000);
	});
	Upload.buttons.filter('a.add').on('click',function(){
		Upload.input = $(Input);
		Upload.filelist.find('.input.file').remove();
		Upload.filelist.append(Upload.input);
		Upload.input.click();
	});
	Upload.widget.on('click','a.queue, a.error, a.done',function(){
		var $file = $(this).closest('.file');
		$file.trigger('upload:remove');
	});
	Upload.widget.on('click','a.process',function(){
		var $file = $(this).closest('.file');
		$file.trigger('upload:stop');
	});
	Upload.widget.on('click','a.play',function(){
		Upload.widget.trigger('uploads:prepare');
	});
	Upload.widget.on('click','a.stop',function(){
		Upload.widget.trigger('uploads:stop');
	});
	Upload.widget.on('click','a.clear',function(){
		Upload.widget.trigger('queue:clear');
	});

	Upload.common.controller.on('click','li a',function(event){
		var $this = $(this);
		var evtenable = $this.data('event-enable');
		if ($this.isDisable()) { return; }
		     if ($this.hasClass('dash')) Upload.widget.toggleClass('dash');
		else if ($this.hasClass('list')) Upload.widget.toggleClass('list');
		else if ($this.hasClass('drag')) Upload.widget.toggleClass('drag');
	});

	this.widgetData = function(){
		return Upload.onlist;
	};

};
