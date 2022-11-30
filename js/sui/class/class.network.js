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
window.unescape = window.unescape || window.decodeURI; // hack para o deprected

sourceui.Network = function () {

	'use strict';

	/*
	window.applicationCache.addEventListener("error", function() {
		alert("Error fetching manifest: a good chance we are offline");
	});
	*/

	var Network = this;
	var Server = {};
	var Template = sourceui.templates.interface;	// biblioteca de templates
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Instances = sourceui.instances;
	var Interface = Instances.interface;
	var Document = Interface.document;
	var Dom = sourceui.interface.dom;
	var Plugin = Interface.plugins;
	var Parser = Instances.parser;				// objeto de conectividade
	var Notify;
	var Confirm;
	var History = {};
	var ActiveRequests = {};

	var isPT = ($('html').attr('lang').indexOf('pt-') > -1);


	this.online = typeof navigator.onLine !== 'undefined' ? navigator.onLine : true;

	Debug.create('IndexDB', {
		mode: 'State',
		title: 'Index database engine state'
	});
	Debug.create('Network', {
		mode: 'State',
		title: 'Current network state'
	});
	Debug.create('Geolocation', {
		mode: 'State',
		title: 'Current geolocation'
	});
	Debug.create('Socket', {
		mode: 'State',
		title: 'Current server gateway state'
	});
	Debug.create('Service', {
		mode: 'State',
		title: 'Current service state'
	});
	Debug.create('JS', {
		mode: 'Local',
		title: 'Javascript Local Output'
	});

	if (this.online) {
		$('#suiBody').removeClass('offline');
		Debug.get('Network').notice({
			mode: 'Status',
			title: 'Network is online and idle',
		});
	} else {
		$('#suiBody').addClass('offline');
		Debug.get('Network').error({
			mode: 'Status',
			title: 'Network is offline',
		});
	}
	Debug.get('Network').trace();

	window.addEventListener("offline", function () {
		$('#suiBody').addClass('offline');
		Network.online = false;
		Debug.get('Network').error({
			mode: 'Status',
			title: 'Internet is offline',
		}).trace();
	}, false);
	window.addEventListener("online", function () {
		$('#suiBody').removeClass('offline');
		Network.online = true;
		Debug.get('Network').notice({
			mode: 'Status',
			title: 'Internet is online',
		}).trace();
	}, false);

	class Metric {
		constructor() {
			var Metric = this;
			this.data = {};
			this.res = {};
			/*
			---------------------------
			Metric.add()
			---------------------------
			Método utilizado para criar os pontos das métricas.
			Os pontos analíticos de entrada são:
			- requestStartTime - valor timestamp do momento em que a requisição é solicitada
			- requestEndTime - valor timestamp do momento em que a requisição é realizada
			- responseStartTime - valor timestamp do momento em que a resposta ao servidor é obtida
			- responseEndTime - valor timestamp do momento em que a resposta ao servidor é baixada
			- processStartTime - valor timestamp do momento em que a resposta começa a ser processada pelo jquery
			- processEndTime - valor timestamp do momento em que a resposta é totalmente processada pelo jquery
			- parseStartTime - valor timestamp do momento em que a resposta processada começa a ser analizada pelo parser
			- parseEndTime - valor timestamp do momento em que a resposta processada é finalizada pelo parser e fica disponível no documento
				@setup - object - required - objeto de setup da requisição
				@t - string - required - ponto analítico que recebe o timestamp
			---------------------------
			*/
			this.add = function (t, v) {
				Metric.data[t] = v || new Date().getTime();
			};
			/*
			---------------------------
			Ajax.metric.calc()
			---------------------------
			Método utilizado para calcular os pontos das métricas ao final da requisição.
			Os valores calculados substituem os pontos analíticos de base. Um outro ponto analítico é criado:
			- totalTime - ponto analítico contendo o tempo total gasto pela requisição
				@setup - object - required - objeto de setup da requisição
			---------------------------
			*/
			this.calc = function () {
				var m = Metric.data;
				var nm = {
					requestTime: (m.requestEndTime) ? m.requestEndTime - m.requestStartTime : 0,
					responseTime: (m.responseEndTime) ? m.responseEndTime - m.responseStartTime : 0,
					processTime: (m.processEndTime) ? m.processEndTime - m.processStartTime : 0,
					parseTime: (m.parseEndTime) ? m.parseEndTime - m.parseStartTime : 0,
					//totalTime : (m.parseEndTime) ? m.parseEndTime - m.requestStartTime : 0, // calcula o tempo final
					bytesTotal: m.bytesTotal // calcula o tempo final
				};
				nm.totalTime = nm.requestTime + nm.responseTime + nm.processTime + nm.parseTime;
				nm.responseSpeed = (nm.bytesTotal / 1000) / (nm.responseTime / 1000);
				return Metric.res = nm; // substitui os pontos analíticos por valores calculados
			};
			this.result = function () {
				return Metric.res;
			};
		}
	}

	class IDBCache {
		constructor() {
			var Cache = this;
			var Ready = false;
			var DB;
			var now = new Date().getTime();
			var expire = 2592000; // 30 dias
			var caches = {};
			var Console = Debug.get('IndexDB');
			if (typeof IDBStore == 'function')
				DB = new IDBStore({
					dbVersion: 1,
					storeName: 'suiCache',
					keyPath: 'requestKey',
					autoIncrement: false,
					onStoreReady: function () {
						//Cache.clear();
						Ready = true;
						Console.notice({
							mode: 'Status',
							title: 'IDBStore Cache is ready',
						});
						if (Console.length == 3)
							Console.trace();
						Cache.getAll();
					}
				});
			this.failback = function (error) {
				Console.error({
					mode: 'Status',
					title: 'IDBStore Cache error',
					content: error
				});
				if (Console.length == 2)
					Console.trace();
			};
			this.set = function (setup, callback, failback) {
				if (!setup.requestKey || !setup.response || setup.error) return;
				var key = setup.requestKey;
				var s;
				if (caches[key]) {
					caches[key].response = {
						responseKey: setup.response.responseKey,
						status: setup.response.status,
						textData: setup.response.textData,
						cacheData: setup.response.cacheData || {},
					};
					s = caches[key];
				}
				else {
					s = {
						requestKey: setup.requestKey,
						key: setup.key,
						name: setup.name,
						origin: setup.origin,
						tab: setup.tab,
						sui: setup.sui,
						response: {
							responseKey: setup.response.responseKey,
							status: setup.response.status,
							textData: setup.response.textData,
							cacheData: setup.response.cacheData || {},
						}
					};
					caches[key] = s;
				}
				if (DB)
					DB.put(s, function () {
						caches[key].response.parsedJQ = setup.response.parsedJQ;
						if (callback)
							callback(key);
					}, failback || this.failback);
			};
			this.get = function (setup) {
				var key = setup.requestKey;
				var cache = caches[key];
				if (cache) {
					$.extend(true, setup, cache);
					return setup;
				}
				return null;
			};
			this.getAll = function (failback) {
				if (DB)
					DB.getAll(function (result) {
						$.each(result, function (k, v) {
							caches[v.requestKey] = v;
						});
					}, failback || this.failback);
			};
			this.remove = function (setup, callback, failback) {
				var key = setup.requestKey;
				delete caches[key];
				if (DB)
					DB.remove(key, function (result) {
						if (result !== false && callback)
							callback(result);
					}, failback || this.failback);
			};
			this.clear = function (callback, failback) {
				caches = {};
				if (DB)
					DB.clear(function () {
						if (callback)
							callback();
					}, failback || this.failback);
			};
			this.ready = function () {
				return Ready;
			};
		}
	}

	class IDBLocal {
		constructor() {
			var Local = this;
			var Ready = false;
			var DB;
			var now = new Date().getTime();
			var expire = 2592000; // 30 dias
			var localdata = {};
			var Console = Debug.get('IndexDB');
			var Basepath = $('head > base').attr('href') || window.location.protocol + '//' + window.location.host + window.location.pathname;
			if (typeof IDBStore == 'function')
				DB = new IDBStore({
					dbVersion: 1,
					storeName: 'suiLocal',
					keyPath: 'apppath',
					autoIncrement: false,
					onStoreReady: function () {
						Local.getLocal();
						Console.notice({
							mode: 'Status',
							title: 'IDBStore Local Data is ready',
						});
						if (Console.length == 3)
							Console.trace();
					}
				});
			this.failback = function (error) {
				Console.error({
					mode: 'Status',
					title: 'IDBStore Local Data error',
					content: error
				});
				if (Console.length == 2)
					Console.trace();
			};
			this.set = function (data, callback, failback) {
				if (!data.session) return;
				data.apppath = Basepath;
				//Local.remove();
				localdata = data;
				if (DB)
					DB.put(localdata, callback, failback || this.failback);
				else if (callback)
					callback(localdata.id);
			};
			this.get = function (key) {
				return localdata || {};
			};
			this.getLocal = function (failback) {
				if (DB)
					DB.getAll(function (result) {
						Ready = true;
						var apppath = Basepath;
						$.each(result, function (k, v) {
							if (apppath === v.apppath) {
								localdata = v;
								return false;
							}
						});
					}, failback || this.failback);
			};
			this.remove = function (setup, callback, failback) {
				var apppath = Basepath;
				localdata = {};
				if (DB)
					DB.remove(apppath, function (result) {
						if (result !== false && callback)
							callback(result);
					}, failback || this.failback);
			};
			this.clear = function (callback, failback) {
				localdata = {};
				if (DB)
					DB.clear(function () {
						if (callback)
							callback();
					}, failback || this.failback);
			};
			this.ready = function () {
				return Ready;
			};
		}
	}


	var Local = new IDBLocal();
	var Cache = new IDBCache();

	// expondo o método de clear cache
	// --------------------------------
	this.cacheClear = Cache.clear;
	this.localClear = Local.clear;
	this.localGet = Local.get;
	// --------------------------------
	class Ajax {
		constructor(setup) {
			var Ajax = this;
			setup.suisrc = (Server.name.indexOf('sourcelab.ddns.net') > -1 || Server.name.indexOf('sourcedev.com.br') > -1) ? setup.sui : Server.name + setup.sui;
			var Console = Debug.get('Network', {
				mode: (Server.cors ? 'CORS ' : '') + Server.protocol.toUpperCase(),
				key: setup.suisrc
			});
			if (setup.geolocation === false) {
				Console.warn({
					mode: 'GEO',
					title: 'Device Geolocation position not found'
				});
			}
			else if (typeof setup.geolocation == 'object') {
				if (setup.geolocation) {
					Console.info({
						mode: 'GEO',
						title: 'Device Geolocation was found!',
						content: 'https://www.openstreetmap.org/#map=18/' + setup.geolocation.lat + '/' + setup.geolocation.lon
					});
				}
			}
			this.abort = function (silent) {
				if (setup.xhr) {
					if (setup.process) {
						Notify.open({
							type: 'warn',
							name: isPT ? 'Por favor aguarde...' : 'Hang on...',
							label: setup.suiname,
							message: isPT ? 'O processo está em andamento e precisa ser concluído pelo servidor.' : 'The process is getting finished by the server.',
						});
					}
					else {
						setup.xhr.abort();
						if (!silent) {
							Ajax.loading.stop(true);
							Console.warn({
								type: 'XHR',
								title: 'Connection aborted'
							}).show();
							Notify.open({
								type: 'warn',
								name: isPT ? 'Alerta de Rede' : 'Network warning',
								label: setup.suiname,
								message: isPT ? 'A requisição foi cancelada' : 'Request was aborted',
							});
						}
					}
				}
			};
			/*
			---------------------------
			Ajax.snip()
			---------------------------
			Método para inserção de strings html no DOM via cahe.
				@setup - object - required - objeto de setup da requisição ajax.
			---------------------------
			*/
			/*
			this.snip = function(s){
				var setup = s;
				console.log(setup.response, setup.field);
				if (setup.response.parsedSNIP){
					var snip = setup.response.parsedSNIP;
					$.each(snip||[],function(k,v){
						if (setup.field && setup.field.length){
							var $field = setup.field.filter( v.selector ? v.selector : ( v.name ? '[data-name="'+v.name+'"]' : '#'+v.id ) );
							if ($field.length){
								var Field = $field.data('customField');
								Field.snip(v.html);
							}
						} else {
							var $target = v.target;
							if ($target.length){
								if (setup.placement.indexOf('append') > -1){
									$target.append(v.html);
								} else if (setup.placement.indexOf('prepend') > -1){
									$target.prepend(v.html);
								} else if (setup.placement.indexOf('inner') > -1){
									$target.html(v.html);
								} else if (setup.placement.indexOf('replace') > -1){
									$target.replaceWith(v.html);
								}
							}
						}
					});
				}
			};
			*/
			/*
			---------------------------
			Ajax.exists()
			---------------------------
			Método para testar se o que foi parseado existe no DOM.
				@setup - object - required - objeto de setup da requisição ajax.
			---------------------------
			*/
			this.exists = function (s) {
				if (setup.response.parsedHTML) {
					var sdata = Device.session.data();
					if (sdata.device.vendor == 'Apple') {
						setup.response.parsedHTML = setup.response.parsedHTML.replace(/(?!\$\(|\$\.|\$\d)\$/g, 'S');
					}
				}
				if (setup.render) return false;
				if (s) setup = s;
				if (setup.response.parsedHTML){
					setup.response.parsedJQ = $(setup.response.parsedHTML);
					var $exists;
					var jqid = setup.response.parsedJQ.attr('id');
					var tgid = setup.target ? setup.target.attr('id') : null;
					if (jqid === tgid)
						$exists = setup.target;
					else
						$exists = setup.target ? setup.target.find('#' + jqid) : $('#' + jqid);
					if ($exists.length) {
						setup.placement = setup.placement ? setup.placement.replace(/append|prepend/g, 'replace') : setup.placement;
						//setup.placement = (setup.placement.indexOf('replace') > -1) ? setup.placement : 'replace';
						//setup.placement = 'replace'; // priciso vir aqui depois pra olha se tem algum pau quando o replace funciona em uma view que já existe
						setup.target = $exists;
						return true;
					}
				}
				return false;
			};
			/*
			---------------------------
			Ajax.html()
			---------------------------
			Método para inserção de strings html no DOM.
				@setup - object - required - objeto de setup da requisição ajax.
			---------------------------
			*/
			this.html = function (s) {
				if (s){
					setup = s;
				}
				if (setup.target && setup.target.length && setup.response.parsedHTML) {
					setup.response.parsedJQ = setup.response.parsedJQ || $(setup.response.parsedHTML);
					var $viewsToClose;
					if (setup.placement) {
						if (setup.placement.indexOf('close-next-views') > -1) {
							$viewsToClose = Array.prototype.reverse.call(setup.view.nextAll());
						}
						else if (setup.placement.indexOf('close-prev-views') > -1) {
							$viewsToClose = Array.prototype.reverse.call(setup.view.prevAll());
						}
						else if (setup.placement.indexOf('close-all-views') > -1 || setup.placement.indexOf('close-views') > -1) {
							$viewsToClose = setup.view.siblings();
						}
						else if (setup.placement.indexOf('close-self-view') > -1) {
							$viewsToClose = Array.prototype.reverse.call(setup.view.nextAll());
							setup.view.trigger('view:close');
						}
						if ($viewsToClose) {
							$viewsToClose.each(function () {
								if (!setup.exists || (setup.target[0] !== this)) {
									$(this).trigger('view:close');
								}
							});
						}
						if (setup.exists) {
							setup.placement.replace(/prepend|append|inner/gi, 'replace');
						}
						if (setup.placement.indexOf('append') > -1) {
							setup.target.append(setup.response.parsedJQ);
						}
						else if (setup.placement.indexOf('prepend') > -1) {
							setup.target.prepend(setup.response.parsedJQ);
						}
						else if (setup.placement.indexOf('inner') > -1) {
							setup.target.html(setup.response.parsedJQ);
						}
						else if (setup.placement.indexOf('replace') > -1) {
							if (setup.target.is('.sui-view')) {
								setup.target.trigger('view:hidden');
							}
							if (setup.exists) {
								if (!setup.target.attr('data-link-key') || setup.target.attr('data-link-key') === setup.response.parsedJQ.attr('data-link-key')) {
									setup.target.replaceWith(setup.response.parsedJQ
										.data('scrollTop', setup.target.data('scrollTop'))
										.attr('data-history', setup.target.attr('data-history'))
										.mergeClass(setup.target, { ignoreInTarget: ['covered', 'ignored', 'removed', 'disable', 'done'] }));
								}
								else {
									setup.target.replaceWith(setup.response.parsedJQ
										.mergeClass(setup.target, { ignoreInTarget: ['covered', 'ignored', 'removed', 'disable', 'done'] }));
								}
							}
							else
								setup.target.replaceWith(setup.response.parsedJQ);
						}
					}
					else {
						setup.target.html(setup.response.parsedJQ);
					}
				}
				else if (setup.field && setup.field.length && setup.response.parsedHTML) {
					setup.response.parsedJQ = setup.response.parsedJQ || $(setup.response.parsedHTML);
					var $wrap = setup.response.parsedJQ.wrap('<div/>');
					var $topper = setup.widget || setup.view || setup.sector || $(document);
					$.each(setup.field, function (k, f) {
						var $field = (typeof f == 'object') ? f : (f.indexOf('#') === 0 ? $topper.find(f) : $topper.find('.sui-field[data-name="' + f + '"]'));
						if ($field.length) {
							var fid = $field.attr('id');
							var selector = (fid) ? '#' + fid : '[' + ($field.data('name') ? 'data-name="' + $field.data('name') + '"' : '') + ']';
							var $rend = $wrap.find(selector);
							if ($rend.length) {
								$field.replaceWith($rend);
							}
						}
					});
				}
				else if (setup.placement == 'close-self-view') {
					if (setup.view.length) {
						// ###########################################################
						// não testar aqui o fechamento aqui.
						// testar no close da sui.interface.js (555)
						// ###########################################################
						var $nextAll = Array.prototype.reverse.call(setup.view.nextAll());
						$nextAll.each(function () {
							$(this).trigger('view:close');
						});
						setup.view.trigger('view:close');
					}
				}
			};
			this.loading = {
				/*
				---------------------------
				Ajax.loading.start()
				---------------------------
				Método utilizado para acionar a animação no momento em que a requisição é efetuada.
					@setup - object - required - objeto de setup da requisição
				---------------------------
				*/
				start: function (force) {

					if (setup.loading == 'nostart' && !force) return;

					if (setup.command == 'reload' && Device.ismobile)
						return;
					if (!setup.loadborder) {
						if (!setup.target) {
							if (setup.element && setup.element.length)
								setup.loadborder = setup.element.closest('.sui-views-container, form');
						}
						else {
							setup.loadborder = setup.target;
						}
					}
					if (!setup.iscache && setup.loadborder && setup.loadborder.length) {
						/*
						if (setup.sector && setup.sector.length){
							setup.loadborder = setup.loadborder.hasClass('sui-view') || setup.loadborder.hasClass('sui-views-container') ? setup.sector : setup.loadborder;
							$('#suiTabsSector').find('[data-sector="'+setup.sector.data('sector')+'"]').addClass('ajax-courtain');
						}
						*/
						if (setup.fromcache)
							return;
						if (setup.field && setup.field.length) {
							setup.field.each(function () {
								var $f = $(this);
								$f.data('wasDisable', $f.isDisable()).disable();
								if ($f.hasClass('input'))
									$f = $f.closest('.table');
								else if ($f.hasClass('sui-field'))
									$f = $f.find('.wrap');
								$f.addClass('ajax-courtain');
							});
						}
						else if (setup.element && setup.element.length) {
							if (setup.element.hasClass('input'))
								setup.element.closest('.table').addClass('ajax-courtain');
							else
								setup.element.addClass('ajax-courtain');
						}
						if (setup.element && setup.element.hasClass('sui-field'))
							return; // se for campo, não tem spinner
						var $spinner = $(Template.get('spinner'));
						$spinner.find('.container').on('click', function () {
							Ajax.abort();
						});
						setup.loadborder.addClass('sui-ajax').prepend($spinner);
						setup.preloadTimeout = setTimeout(function () {
							setup.loadborder.addClass('loading');
							$spinner.addClass('fade-in');
						}, 250); // a animação só será acionada em x milissegundos após o inicio da requisição.
					}
				},
				/*
				---------------------------
				Ajax.loading.stop()
				---------------------------
				Método utilizado para parar a animação no momento em que o parser conclui a analise da resposta processada.
					@setup - object - required - objeto de setup da requisição
				---------------------------
				*/
				stop: function (force) {
					//if (setup.preloadTimeout) clearTimeout(setup.preloadTimeout); // cancela o timeout da animação se ela ainda não foi acionada.
					/*
					if (setup.sector && setup.sector.length){
						$('#suiTabsSector').find('[data-sector="'+setup.sector.data('sector')+'"]').removeClass('ajax-courtain');
					}
					*/
					if (setup.loading == 'nostop' && !force) return;

					if (setup.command == 'reload' && Device.ismobile)
						return;
					if (setup.fromcache)
						return;
					if (setup.field && setup.field.length) {
						setup.field.each(function () {
							var $f = $(this);
							if (!$f.data('wasDisable'))
								$f.enable();
							if ($f.hasClass('input'))
								$f = $f.closest('.table');
							else if ($f.hasClass('sui-field'))
								$f = $f.find('.wrap');
							$f.removeClass('ajax-courtain');
							$f.removeData('wasDisable');
						});
					}
					else if (setup.element && setup.element.length) {
						if (setup.element.hasClass('input'))
							setup.element.closest('.table').removeClass('ajax-courtain');
						else
							setup.element.removeClass('ajax-courtain');
					}
					if (setup.loadborder && setup.loadborder.hasClass('sui-ajax')) {
						clearTimeout(setup.preloadTimeout);
						var $spinner = setup.loadborder.removeClass('loading sui-ajax').children('.sui-spinner:eq(0)').remove();
					}
				},
				/*
				---------------------------
				Ajax.loading.offline()
				---------------------------
				Método utilizado para preencher a area do target com uma camanda de informação offline.
					@setup - object - required - objeto de setup da requisição
				---------------------------
				*/
				offline: function () {
					if (!setup.target) {
						if (setup.element && setup.element.length)
							setup.loadborder = setup.element.closest('.sui-views-container, form');
					}
					else if (setup.target) {
						setup.loadborder = setup.target.closest('.sui-views-container, form');
					}
					if (setup.loadborder) {
						var $offline = $(Template.get('offline',isPT ? 'pt-br' : 'en-us')).css('opacity', 0);
						setup.loadborder.prepend($offline);
						$offline.velocity({ opacity: [1, 0] }, 300);
						$offline.find('.button').on('click', function () {
							$offline.velocity({ opacity: [0, 1] }, 300, function () {
								$offline.remove();
							});
						});
					}
				}
			};
			/*
			---------------------------
			Ajax.closePart()
			---------------------------
			Método utilizado para fechar viewsa ou sectors.
				@target - object,string,array,null - required - destino que precisa ser nivelado
			---------------------------
			*/
			this.closePart = function () {
				var close = setup.close;
				var collection;
				if ($.type(close) == 'object' && close instanceof jQuery)
					collection = close;
				else if ($.type(close) == 'string') {
					if (close.indexOf('@') > -1) {
						if (close == '@view-self') {
							collection = (setup.view && setup.view.length) ? setup.view : (setup.element && setup.element.length) ? setup.element.closest('.sui-view') : null;
						}
						else if (close == '@view-caller') {
							collection = (setup.view && setup.view.length) ? setup.view : (setup.element && setup.element.length) ? setup.element.closest('.sui-view') : null;
						}
						else if (close == '@view-next') {
							collection = (setup.view && setup.view.next('.sui-view').length) ? setup.view.next('.sui-view') : (setup.element && setup.element.length) ? setup.element.closest('.sui-view').next('.sui-view') : null;
						}
						else if (close == '@view-prev') {
							collection = (setup.view && setup.view.prev('.sui-view').length) ? setup.view.prev('.sui-view') : (setup.element && setup.element.length) ? setup.element.closest('.sui-view').prev('.sui-view') : null;
						}
						else if (close == '@sector-caller') {
							collection = (setup.sector && setup.sector.length) ? setup.sector : (setup.element && setup.element.length) ? setup.element.closest('.sui-sector') : null;
						}
						else if (close == '@sector-self') {
							collection = (setup.sector && setup.sector.length) ? setup.sector : (setup.element && setup.element.length) ? setup.element.closest('.sui-sector') : null;
						}
					}
					else {
						collection = $(close);
					}
				}
				else if ($.type(close) == 'array')
					collection = $(close).map(function () { return this.toArray(); });
				return collection;
			};
			/*
			---------------------------
			Ajax.target()
			---------------------------
			Método utilizado para nivelar os destinos em um único objeto jquery para a requisição, se houverem.
				@target - object,string,array,null - required - destino que precisa ser nivelado
			---------------------------
			*/
			this.target = function () {
				var target = setup.target;
				var collection;
				if ($.type(target) == 'object' && target instanceof jQuery)
					collection = target;
				else if ($.type(target) == 'string') {
					if (target.indexOf('@') > -1) {
						setup.targetstring = target;
						if (target == '@sectors-container') {
							collection = $('#suiSectorsContainer');
							setup.placement = setup.placement || 'append';
						}
						else if (target == '@sector') {
							collection = (setup.sector && setup.sector.length) ? setup.sector : (setup.element && setup.element.length) ? setup.element.closest('.sui-sector') : null;
							setup.placement = setup.placement || 'append';
						}
						else if (target == '@views-container') {
							collection = (setup.view && setup.view.length) ? setup.view.parent() : (setup.element && setup.element.length) ? setup.element.closest('.sui-views-container') : (setup.sector ? setup.sector.find('#suiViewsContainer') : null);
							setup.placement = setup.placement || 'append';
						}
						else if (target == '@view-next') {
							collection = (setup.view && setup.view.length) ? setup.view.parent() : (setup.element && setup.element.length) ? setup.element.closest('.sui-views-container') : (setup.sector ? setup.sector.find('#suiViewsContainer') : null);
							setup.placement = setup.placement || '@close-next-view-and-append';
						}
						else if (target == '@view-prev') {
							collection = (setup.view && setup.view.prev('.sui-view').length) ? setup.view.prev('.sui-view') : (setup.element && setup.element.length) ? setup.element.closest('.sui-view').prev('.sui-view') : null;
							setup.placement = setup.placement || '@close-next-view-and-replace';
						}
						else if (target == '@view-self') {
							collection = (setup.view && setup.view.length) ? setup.view : (setup.element && setup.element.length) ? setup.element.closest('.sui-view') : null;
							setup.placement = setup.placement || 'replace';
						}
						else if (target == '@widget-area') {
							collection = (setup.widget && setup.widget.length) ? setup.widget.find('.area') : (setup.element && setup.element.length) ? setup.element.closest('.sui-widget').find('.area') : null;
							setup.placement = setup.placement || 'inner';
						}
						else if (target == '@widget-paginator') {
							collection = (setup.widget && setup.widget.length) ? setup.widget.find('.paginator') : (setup.element && setup.element.length) ? setup.element.closest('.sui-widget').find('.paginator') : null;
							setup.placement = setup.placement || 'replace';
						}
						else if (target == '@field-droplist') {
							collection = (setup.field && setup.field.length) ? setup.field.find('.addons .sui-droplist') : (setup.element && setup.element.length) ? setup.element.closest('.sui-field').find('.addons .sui-droplist') : null;
							setup.placement = setup.placement || 'update';
						}
						else if (target == '@sector-caller') {
							collection = (setup.sector && setup.sector.length) ? setup.sector : (setup.element && setup.element.length) ? setup.element.closest('.sui-sector').data('floatcaller') : null;
							collection = (collection) ? collection.data('floatcaller') : null;
							collection = (collection) ? collection.closest('.sui-sector') : null;
							setup.placement = setup.placement || 'replace';
						}
						else if (target == '@view-caller') {
							collection = (setup.sector && setup.sector.length) ? setup.sector : (setup.element && setup.element.length) ? setup.element.closest('.sui-sector').data('floatcaller') : null;
							collection = (collection) ? collection.data('floatcaller') : null;
							collection = (collection) ? collection.closest('.sui-view') : null;
							setup.placement = setup.placement || 'replace';
						}
						else if (target == '@widget-caller') {
							collection = (setup.sector && setup.sector.length) ? setup.sector : (setup.element && setup.element.length) ? setup.element.closest('.sui-sector').data('floatcaller') : null;
							collection = (collection) ? collection.data('floatcaller') : null;
							collection = (collection) ? collection.closest('.sui-widget') : null;
							setup.placement = setup.placement || 'replace';
						}
					}
					else {
						collection = $(target);
						if (collection.length == 1) {
							setup.widget = collection.closest('.sui-widget');
							setup.view = collection.closest('.sui-view');
							setup.sector = collection.closest('.sui-sector');
						}
					}
				}
				else if ($.type(target) == 'array')
					collection = $(target).map(function () { return this.toArray(); });
				if (collection && collection.length) {
					if (!setup.targetSelector) {
						collection.each(function () {
							setup.targetSelector = setup.targetSelector || [];
							setup.targetSelector.push($.getSelector(this));
						});
						setup.targetSelector = setup.targetSelector.length > 1 ? setup.targetSelector : setup.targetSelector[0];
					}
				}
				if (collection && !collection.length && setup.target) {
					Console.warn({
						mode: 'jQuery',
						title: 'Target defined in link:target attribute was not found.',
						content: { target: setup.target, origin: setup.element }
					});
				}
				return collection;
			};
			/*
			---------------------------
			Ajax.field()
			---------------------------
			Método utilizado para nivelar os destinos em um único objeto jquery para a requisição, se houverem.
				@target - object,string,array,null - required - destino que precisa ser nivelado
			---------------------------
			*/
			this.field = function () {
				var field = setup.field;
				var collection;
				if ($.type(field) == 'object' && field instanceof jQuery) {
					collection = field;
				}
				else if ($.type(field) == 'string') {
					field = $.trim(field);
					if (field == '@field-next') {
						collection = (setup.element && setup.element.hasClass('sui-field')) ? setup.element.next() : (setup.view && setup.view.length) ? setup.view.find('.sui-field:focus:last').next() : null;
						setup.placement = setup.placement || '@replace';
					}
					else if (field == '@field-prev') {
						collection = (setup.element && setup.element.hasClass('sui-field')) ? setup.element.prev() : (setup.view && setup.view.length) ? setup.view.find('.sui-field:focus:last').prev() : null;
						setup.placement = setup.placement || '@replace';
					}
					else if (field == '@field-self') {
						collection = (setup.element && setup.element.hasClass('sui-field')) ? setup.element : (setup.view && setup.view.length) ? setup.view.find('.sui-field:focus:eq(0)') : null;
						setup.placement = setup.placement || '@replace';
					}
					else if (field.indexOf(',') > -1) {
						var coll = [];
						$.each(field.split(',') || [], function (k, f) {
							var collect = [];
							f = $.trim(f);
							collect = $.ache('field', f, [setup.view, setup.sector, $(document)]);
							if (collect.length)
								coll.push(collect);
						});
						collection = $(coll).map(function () { return this.toArray(); });
					}
					else {
						collection = $.ache('field', field, [setup.view, setup.sector, $(document)]);
						if (collection.length == 1) {
							setup.widget = collection.closest('.sui-widget');
							setup.view = collection.closest('.sui-view');
							setup.sector = collection.closest('.sui-sector');
						}
					}
				}
				else if ($.type(field) == 'array') {
					collection = $(field).map(function () { return this.toArray(); });
				}
				if (collection && collection.length) {
					collection.filter(':last').each(function () {
						setup.fieldSelector = $.getSelector(this);
					});
				}
				return collection;
			};
			/*
			---------------------------
			Ajax.exec()
			---------------------------
			Método utilizado para executar requisições em um servidor.
				@setup - object - required - objeto de setup da requisição
			---------------------------
			*/
			this.exec = function () {
				var config = {};
				setup.timestamp = Date.now();
				setup.metric = new Metric();
				setup.timeout = setup.timeout || 60000; // fetch do target
				setup.target = Ajax.target();
				setup.field = Ajax.field();
				config.dataType = "text";
				config.cache = (setup.cache === 'false' || setup.cache === false) ? false : true;
				setup.cache = config.cache;
				config.type = "POST";
				config.data = setup.data;
				config.url = Server.url + setup.sui;
				//////////////////////////////////////////////
				// CORS REQUEST
				//////////////////////////////////////////////
				if (Server.cors) {
					config.crossDomain = true;
					config.xhrFields = {
						withCredentials: true
					};
				}
				//////////////////////////////////////////////
				config.xhr = function () {
					var xhr = $.ajaxSettings.xhr();
					xhr.addEventListener('readystatechange', function (event) {
						if (xhr.readyState == 1) {
							setup.metric.add('requestEndTime');
							setup.metric.add('responseStartTime');
						}
						else if (xhr.readyState == 4) {
							setup.metric.add('responseEndTime');
							setup.metric.add('processStartTime');
						}
					}, false);
					xhr.addEventListener('progress', function (event) {
						if (event.lengthComputable) {
						}
					}, false);
					return xhr;
				};
				config.beforeSend = function (xhr) {
					if (setup.key && !setup.key.length)
						delete setup.key;
					setup.seed = setup.seed || 0;
					if (setup.mergedseed) {
						var seeds = $.extend({}, setup.mergedseed);
						setup.mergedseed = {};
						if (setup.sui) {
							setup.mergedseed.sui = {};
							setup.mergedseed.sui[setup.sui] = seeds.sui[setup.sui];
						}
						if (setup.command) {
							setup.mergedseed.command = {};
							setup.mergedseed.command[setup.command] = seeds.command[setup.command];
						}
						if (setup.process) {
							setup.mergedseed.process = {};
							setup.mergedseed.process[setup.process] = seeds.process[setup.process];
						}
						if (setup.parentkey) {
							setup.mergedseed.parentkey = {};
							setup.mergedseed.parentkey[setup.parentkey] = seeds.parentkey[setup.parentkey];
						}
						if (setup.key) {
							setup.mergedseed.key = {};
							if ($.isArray(setup.key)) {
								$.each(setup.key, function (k, v) {
									setup.mergedseed.key[v] = seeds.key[v];
								});
							}
							else
								setup.mergedseed.key[setup.key] = seeds.key[setup.key];
						}
					}
					//////////////////////////////////////////////
					// FILTER SORT
					//////////////////////////////////////////////
					if (setup.command == 'list') {
						var globalname = 'request-filter-sort:' + setup.sui;
						var globaldata = Device.Global.get(globalname) || null;
						setup.filter = (setup.filter) ? $.extend(true, globaldata, setup.filter) : globaldata;
						delete setup.filter.key;
					}
					//////////////////////////////////////////////
					$.each(setup.filter||[], function(k,v){
						if (typeof v != 'string') return false;
						var $t;
						var $orig = setup.caller || setup.element;
						if ($orig) $orig = $orig.closest('.sui-fieldset, .sui-widget, .sui-view, .sui-sector');
						if (v.indexOf('#') > -1) {
							$t = $(v);
						} else if (v.indexOf('@') > -1 && v.indexOf('@')+3 < v.length && v.indexOf('.') === -1) {
							$t = $.ache('field', v, [($orig.length ? $orig : setup.view || setup.sector), $(document)]);
						}
						if ($t && $t.length){
							if ($t.is('.sui-field')) setup.filter[k] = $t.val();
							else if ($t.data('value'))  setup.filter[k] = $t.data('value');
							else setup.filter[k] = $t.text();
						}
					});
					//////////////////////////////////////////////
					var headerData = {
						seed: setup.seed,
						origin: setup.origin,
						sui: setup.sui,
						system: setup.system,
						action: setup.action,
						command: setup.command,
						process: setup.process,
						parentkey: setup.parentkey,
						cache: setup.cache,
						owner: setup.owner,
						id: setup.id,
						key: setup.key,
						name: setup.name,
						stack: setup.stack,
						code: setup.code,
						date: setup.date,
						email: setup.email,
						addr: setup.addr,
						str: setup.str,
						seq: setup.seq,
						num: setup.num,
						json: setup.json,
						group: setup.group,
						session: Device.session.id(),
						fingerprint: Device.fingerprint.get(),
						target: setup.targetSelector,
						render: setup.render,
						field: setup.fieldSelector,
						timeout: setup.timeout
					};
					var getData = setup.gdata;
					var postData = {
						modified: setup.modified,
						validate: setup.validate
					};
					var requestKey = {
						sui: setup.sui,
						system: setup.system,
						action: setup.action,
						command: setup.command,
						process: setup.process,
						parentkey: setup.parentkey,
						owner: setup.owner,
						key: setup.key,
						id: setup.id,
						group: setup.group,
						session: Device.session.id(),
					};
					// ==========================================================================
					// AJAX REQUEST HEADER PAYLOAD
					// ==========================================================================
					setup.requestKey = $.md5(JSON.stringify(requestKey));
					var requestHeaderPayload = {
						key: setup.requestKey,
						data: headerData,
						get: getData,
						post: postData,
						local: Local.get(),
						agent: Device.session.data(),
					};
					if (setup.mergedseed)
						requestHeaderPayload.seeds = setup.mergedseed;
					if (setup.filter)
						requestHeaderPayload.filter = setup.filter;
					if (setup.snippet)
						requestHeaderPayload.snippet = setup.snippet;
					if (setup.geolocation)
						requestHeaderPayload.geolocation = setup.geolocation;
					// ==========================================================================
					//////////////////////////////////////////////
					// CACHE GETTER
					//////////////////////////////////////////////
					if (Device.cache()) {
						setup.hascache = false;
						setup.fromcache = false;
						var cache = Cache.get(setup);
						if (cache) {
							setup.hascache = true;
							if (setup.cache !== false) {
								setup.fromcache = cache.response.responseKey;
								requestHeaderPayload.cache = setup.fromcache;
								//xhr.setRequestHeader('X-Sui-Request-Cache', setup.fromcache);
								cache.iscache = true;
								Console.groupData('cache', true).log({
									mode: 'Cache',
									color: '#ADAAA9',
									title: 'UI retrieved from CACHE (' + cache.response.responseKey + ')'
								});
								if (cache.target) {
									if (Parser.load(cache)) {
										Ajax.html();
									}
									setup.metric.calc();
									cache.target.trigger('parse');
									if (Dom.context)
										Dom.context.trigger('parseui', [cache]);
									else
										Dom.body.trigger('parseui', [cache]);
									if (!cache.response.error && setup.element && cache.response.parsedJQ) {
										setup.element.trigger('ajax:cache', [setup.response.parsedJQ]);
									}
								}
							}
							else {
								Console.groupData('cache', false);
							}
						}
						else {
							Console.groupData('cache', false);
						}
					}
					else {
						Console.groupData('cache', false);
					}
					//////////////////////////////////////////////
					//////////////////////////////////////////////
					// HISTORY
					//////////////////////////////////////////////
					var historyPath = [], hist, hkey;
					if (setup.sector && setup.sector.length) {
						hist = setup.sector.attr('data-history');
						if (hist)
							historyPath.push(hist);
					}
					if (setup.view && setup.view.length) {
						hist = setup.view.attr('data-history');
						if (hist)
							historyPath.push(hist);
					}
					if (setup.widget && setup.widget.length) {
						hist = setup.widget.attr('data-history');
						if (hist)
							historyPath.push(hist);
					}
					if (historyPath.length) {
						if ((setup.command && setup.command != 'list') || setup.action) {
							if (setup.key) {
								hkey = ($.isArray(setup.key)) ? setup.key : [setup.key];
								hkey = hkey.join(',');
							}
							if ((setup.targetstring == '@views-container' && setup.placement == 'close-next-views-and-append') ||
								(setup.targetstring == '@view-next' && setup.placement == 'replace')) {
								if (hkey) {
									historyPath.push(setup.command + ':' + hkey);
								}
							}
						}
						setup.history = historyPath.join('/');
						requestHeaderPayload.history = {
							path: historyPath,
							hash: setup.history
						};
						/*
						xhr.setRequestHeader('X-Sui-Request-History', btoa(JSON.stringify({
							path:historyPath,
							hash:setup.history
						})));
						*/
					}
					//////////////////////////////////////////////
					// AJAX REQUEST HEADER ASSIGNMENT ===========================================
					xhr.setRequestHeader('X-Sui-Request-Engine', setup.engine || 'default');
					//xhr.setRequestHeader('X-Sui-Request-Payload', btoa(JSON.stringify(requestHeaderPayload)));
					xhr.setRequestHeader('X-Sui-Request-Payload', btoa(unescape(encodeURIComponent(JSON.stringify(requestHeaderPayload)))));
					// ==========================================================================
					if (setup.timeout <= 60000) {
						setup.slowtimeout = setTimeout(function () {
							Notify.open({
								type: 'warn',
								name: isPT ? 'Está bem lento...' : 'Very very slow...',
								label: setup.suiname,
								message: isPT ? 'Tentaremos concluir essa tarefa a tempo.<br/>Verifique a conexão de internet logo em seguida.' : 'We gonna try to get things finished on server.<br/>Check your internet connection quality before you keep going forward.',
							});
						}, 25000);
					}
					Ajax.loading.start();
					setup.metric.add('requestStartTime');
				};
				setup.xhr = $.ajax(config)
					.done(function (data, status, xhr) {

						clearTimeout(setup.slowtimeout);
						var timestamp = xhr.getResponseHeader('X-Sui-Response-Timestamp');
						sourceui.timediff = timestamp ? Math.round((Date.now() / 1000) - timestamp) : sourceui.timediff;
						Ajax.loading.stop();
						////////////////////
						// objeto de resposta do servidor
						////////////////////
						setup.response = $.extend(setup.response, {
							error: false,
							xhr: xhr,
							key: setup.requestKey,
							localData: xhr.getResponseHeader('X-Sui-Response-Local'),
							responseKey: xhr.getResponseHeader('X-Sui-Response-Key'),
							//mergedSeed : xhr.getResponseHeader('X-Sui-Response-Seeds'),
							responseLength: data.length,
							dataKey: null,
							textData: data,
							status: status,
							parsedHTML: null,
							parsedJQ: null,
						});
						//var localData = xhr.getResponseHeader('X-Sui-Response-Local');
						var localData = setup.response.localData;
						if (localData) {
							localData = JSON.parse(localData);
							if (localData.session) {
								Local.set(localData);
							} else {
								Local.remove();
							}
						}
						////////////////////
						if (Device.cache() && setup.fromcache === setup.response.responseKey) {
							setup.fromcache = false;
							Parser.load(setup);
							setup.metric.add('processEndTime');
							setup.metric.add('bytesTotal', parseInt(setup.response.responseLength));
							setup.metric.calc();
							if (typeof setup.ondone == 'function')
								setup.ondone.call(Ajax, setup);
						} else {
							setup.metric.add('processEndTime');
							setup.hasparsed = Parser.load(setup);
							setup.exists = Ajax.exists();
							// CSS =======================
							if (setup.response.parsedCSS) {
								var $css = $(setup.response.parsedCSS);
								var id = $css.attr('id');
								$('#suiHead > #' + id).remove();
								$css.appendTo($('#suiHead'));
							}
							// ===========================
							if (setup.hasparsed) {
								setup.iscache = false;
								Ajax.html();
							}
							setup.metric.calc();
							if (!setup.response.error) {
								Dom.document.trigger('parseui', [setup]);
								if (setup.followscroll && setup.view) {
									var scrolltop = setup.view.data('scrollTop');
									var $scrollers = setup.view.find('.sui-content.scroll-default');
									$scrollers.each(function () {
										var $scr = $(this);
										if ($scr.scrollTop() < scrolltop) {
											$scr.scrollTop(scrolltop);
											var $paginator = $scr.find('.paginator:not(.clicked):last');
											$paginator.attr('data-link-cache', 'false');
											$paginator.attr('data-link-followscroll', 'true');
											$paginator.trigger('click');
										}
									});
								}
								if (Device.cache()) {
									if (((setup.target || setup.field) && setup.cache !== false) || setup.hascache) {
										Cache.set(setup);
										Console.log({
											mode: 'Cache',
											color: '#ADAAA9',
											title: 'UI CACHE was saved in local database (' + setup.response.responseKey + ')',
										});
									}
								}
								if (typeof setup.ondone == 'function') setup.ondone.call(Ajax, setup);
								if (setup.element) setup.element.trigger('ajax:done',[setup.response.parsedJQ]);
							} else {
								if (typeof setup.onfail == 'function') setup.onfail.call(Ajax, xhr, status, error);
								if (setup.element) setup.element.trigger('ajax:fail');
								Console.error({
									type: 'Response',
									title: 'Connection error',
									content: setup.response.error
								});
								Cache.remove(setup);
								return false;
							}
							// JS ========================
							if (setup.response.parsedJS) {
								var $js = $(setup.response.parsedJS);
								$js.appendTo($('#suiHead')).remove();
							}
							// ===========================
						}
						//////////////////////////////////////////////
						// FILTER SORT
						//////////////////////////////////////////////
						if (setup.command == 'list') {
							var globalname = 'request-filter-sort:' + setup.sui;
							var globaldata = {};
							if (setup.filter.sortBy)
								globaldata.sortBy = setup.filter.sortBy;
							if (setup.filter.sortOrd)
								globaldata.sortOrd = setup.filter.sortOrd;
							Device.Global.set(globalname, globaldata);
						}
						//////////////////////////////////////////////
						if (!setup.response.error && setup.element && setup.response.parsedJQ) {
							setup.element.trigger('ajax:done', [setup.response.parsedJQ]);
						}
						//////////////////////////////////////////////
						// HISTORY
						//////////////////////////////////////////////
						var historyData = xhr.getResponseHeader('X-Sui-Response-History');
						if (historyData == 'follow') {
							if (Server.hash) {
								if (!Dom.body.hasClass('sui-ajax'))
									Dom.body.addClass('sui-ajax').addClass('loading').prepend($(Template.get('spinner')));
								Network.history.follow(Server.hash.split('/'), Dom.body);
							}
							else {
								Dom.document.trigger('panelready');
							}
						}
						//////////////////////////////////////////////
					})
					.fail(function (xhr, status, error) {
						clearTimeout(setup.slowtimeout);
						Ajax.loading.stop(true);
						setup.metric.add('processEndTime');
						setup.metric.add('bytesTotal', 0);
						setup.metric.calc();
						if (Network.online) {
							if (status == 'abort' || status == 'canceled'){
								if (typeof setup.oncancel == 'function') setup.oncancel.call(Ajax, xhr, status, error);
								return;
							}
							setup.response = {
								error: error,
								status: status,
								xhr: xhr,
								key: setup.requestKey,
								responseKey: xhr.getResponseHeader('X-Sui-Response-Key'),
								textData: xhr.responseText,
							};
							Parser.load(setup);
							if (!Console.has('bug') && !Console.has('error') && !Console.has('fatal') && !Console.has('fail')) {
								Console.error({
									mode: 'XHR',
									title: 'Request failure',
									content: error
								});
								Notify.open({
									type: 'error',
									name: isPT ? 'Falha de Requisição' : 'Request error',
									label: setup.suiname,
									message: error,
								});
							}
							Cache.remove(setup);
						}
						else {
							if (!setup.fromcache) {
								Ajax.loading.offline(setup);
							}
						}
						if (typeof setup.onfail == 'function')
							setup.onfail.call(Ajax, xhr, status, error);
						if (setup.element)
							setup.element.trigger('ajax:fail');
					})
					.always(function (data, status, xhr) {
						delete ActiveRequests[setup.rid];
						clearTimeout(setup.obtimeout);
						clearTimeout(setup.slowtimeout);
						Ajax.loading.stop();
						Console.log({
							mode: 'Ajax',
							color: '#ADAAA9',
							title: 'Async Connection (' + status + ')',
							content: {
								'Setup Object': setup,
								'Metrics': setup.metric.result()
							}
						});
						Console.trace();
						if (typeof setup.onalways == 'function')
							setup.onalways.call(Ajax, setup, data, status, xhr);
						if (setup.element && setup.response && setup.response.parsedJQ)
							setup.element.trigger('ajax:always', [setup.response.parsedJQ]);
					});
				setup.obtimeout = setTimeout(function () {
					clearTimeout(setup.slowtimeout);
					if (!setup.response) {
						Ajax.abort();
					}
				}, setup.timeout);
				if (setup.close) {
					var $close = Ajax.closePart(setup);
					$close.trigger('close');
				}
				return setup.xhr;
			};
		}
	}

	class Upload {
		constructor(setup) {
			var Upload = this;
			var Events = {};
			var config = {};
			var isvalid = true;
			var formdata = [];
			var fdx = 0;
			var ajax;
			if (setup.collection) {
				setup.precheck = 'test';
				setup.data = setup.collection;
			}
			setup.sui = setup.sui || setup.url;
			setup.timeout = setup.timeout || 120000
			setup.metric = new Metric();
			//setup.suisrc = Server.name+setup.sui;
			setup.suisrc = (Server.name.indexOf('sourcelab.ddns.net') > -1 || Server.name.indexOf('sourcedev.com.br') > -1) ? setup.sui : Server.name + setup.sui;
			//setup.suisrc = (Server ? Server.replace(window.location.protocol+'//','') : window.location.hostname+window.location.pathname)+setup.sui;
			if (setup.precheck == 'test')
				setup.suisrc += ' (PRECHECK)';
			else if (setup.fdata)
				setup.suisrc += ' (' + (setup.fdata.name || setup.fdata.type) + ')';
			var Console = Debug.get('Network', {
				mode: (Server.cors ? 'CORS Upload' : '') + Server.protocol.toUpperCase(),
				key: setup.suisrc
			});
			setup.state = 0;
			setup.loaded = 0;
			var Methods = {
				readFile: function () {
					var reader = new FileReader();
					reader.onload = function (event) {
						Methods.splitData(new Uint8Array(event.target.result));
					};
					reader.readAsArrayBuffer(setup.file);
				},
				splitData: function (dataArray) {
					var fdata, blob;
					var parts = 1;
					var chunkSize = setup.chunk; //1*1000*1024;
					setup.total = dataArray.length;
					for (var i = 0; i < setup.total; i += chunkSize) {
						blob = new Blob([dataArray.subarray(i, i + chunkSize)]);
						fdata = new FormData();
						if (setup.total >= chunkSize) {
							//fdata.append('file', blob, setup.file.name + '.part' + (i/chunkSize));
							fdata.append('file', blob, setup.file.name + '.part');
						}
						else {
							fdata.append('file', setup.file, setup.file.name);
						}
						formdata.push(fdata);
					}
					Upload.trigger('read', []);
				},
				send: function (fdata) {
					//////////////////////////////////////////////
					// CORS REQUEST
					//////////////////////////////////////////////
					if (Server.cors) {
						config.crossDomain = true;
						config.xhrFields = {
							withCredentials: true
						};
					}
					//////////////////////////////////////////////
					config.url = setup.sui;
					config.type = 'post';
					config.cache = false;
					if (fdata) {
						config.processData = false;
						config.contentType = false;
						$.each(setup.data || [], function (k, v) { fdata.append(k, v); });
						config.data = fdata;
					} else {
						config.data = setup.data;
					}
					config.xhr = function () {
						var xhr = $.ajaxSettings.xhr();
						xhr.addEventListener('readystatechange', function (event) {
							if (xhr.readyState == 1) {
								setup.metric.add('requestEndTime');
								setup.metric.add('responseStartTime');
							}
							else if (xhr.readyState == 4) {
								setup.metric.add('responseEndTime');
								setup.metric.add('processStartTime');
							}
						}, false);
						xhr.upload.addEventListener('progress', function (event) {
							if (event.lengthComputable) {
								Upload.trigger('progress', [event]);
							}
						}, false);
						return xhr;
					};
					config.beforeSend = function (xhr) {
						setup.seed = setup.seed || 0;
						setup.hash = $.md5(setup.seed).substr(0, 26) + setup.seed.toString(16);
						var headerData = {
							seed: setup.seed,
							origin: setup.origin,
							sui: setup.sui,
							system: setup.system,
							precheck: setup.precheck,
							command: setup.command,
							process: setup.process,
							parentkey: setup.parentkey,
							owner: setup.owner,
							key: setup.key,
							accept: setup.accept,
							maxfilesize: setup.maxfilesize,
							name: setup.name,
							hash: setup.hash,
							session: Device.session.id(),
							fingerprint: Device.fingerprint.get(),
							target: setup.targetSelector,
							render: setup.render,
							validate: setup.validate,
							timeout: setup.timeout
						};
						var requestKey = {
							sui: setup.sui,
							system: setup.system,
							action: setup.action,
							command: setup.command,
							process: setup.process,
							parentkey: setup.parentkey,
							owner: setup.owner,
							key: setup.key,
							precheck: setup.precheck,
							accept: setup.accept,
							maxfilesize: setup.maxfilesize,
							session: Device.session.id(),
						};
						setup.metric = new Metric(); // criação das métricas
						setup.metric.add('requestStartTime');
						// ==========================================================================
						// AJAX REQUEST HEADER PAYLOAD
						// ==========================================================================
						setup.requestKey = $.md5(JSON.stringify(requestKey));
						var requestHeaderPayload = {
							key: setup.requestKey,
							data: headerData,
							local: Local.get(),
							agent: Device.session.data(),
						};
						if (setup.filter)
							requestHeaderPayload.filter = setup.filter;
						if (setup.fdata)
							requestHeaderPayload.file = setup.fdata;
						if (setup.collection)
							requestHeaderPayload.collection = setup.collection;
						if (setup.geolocation)
							requestHeaderPayload.geolocation = setup.geolocation;
						// ==========================================================================
						// AJAX REQUEST HEADER ASSIGNMENT ===========================================
						xhr.setRequestHeader('X-Sui-Request-Engine', setup.engine || 'default');
						//xhr.setRequestHeader('X-Sui-Request-Payload', btoa(JSON.stringify(requestHeaderPayload)));
						xhr.setRequestHeader('X-Sui-Request-Payload', btoa(unescape(encodeURIComponent(JSON.stringify(requestHeaderPayload)))));
						// ==========================================================================
					};
					/////////////////////////////////////
					var ajaxXHR = $.ajax(config)
						.done(function (data, status, xhr) {
							setup.response = {
								error: false,
								xhr: xhr,
								key: setup.requestKey,
								localData: xhr.getResponseHeader('X-Sui-Response-Local'),
								responseKey: xhr.getResponseHeader('X-Sui-Response-Key'),
								responseLength: data.length,
								dataKey: null,
								textData: data,
								status: status,
								parsedHTML: null,
								parsedJQ: null,
								traces: []
							};
							//var localData = xhr.getResponseHeader('X-Sui-Response-Local');
							var localData = setup.response.localData;
							if (localData) {
								localData = JSON.parse(localData);
								if (localData.session) {
									Local.set(localData);
								}
								else {
									Local.clear();
								}
							}
							setup.metric.add('processEndTime');
							setup.metric.add('parseStartTime');
							Parser.load(setup);
							setup.metric.add('parseEndTime');
							setup.metric.add('bytesTotal', parseInt(setup.response.responseLength));
							setup.metric.calc();
							if (setup.response.error) {
								Console.error({
									type: 'XHR',
									title: 'Request failure (' + setup.response.error + ')',
									content: setup.response.error
								});
							}
							if (fdata || setup.precheck)
								Upload.trigger('done', [data, status, xhr]);
						})
						.fail(function (xhr, status, error) {
							if (status == 'abort') {
								Upload.trigger('abort', [xhr, status, error]);
								Console.warn({
									type: 'XHR',
									title: 'Request aborted',
								});
								return;
							}
							else if (status == 'canceled') {
								Upload.trigger('canceled', [xhr, status, error]);
								Console.warn({
									type: 'XHR',
									title: 'Request canceled',
								});
								return;
							}
							setup.response = {
								error: error,
								status: status,
								xhr: xhr,
								key: setup.requestKey,
								responseKey: xhr.getResponseHeader('X-Sui-Response-Key'),
								textData: xhr.responseText,
								traces: []
							};
							Parser.load(setup);
							if (!Console.has('fatal') && !Console.has('fail')) {
								Console.error({
									type: 'XHR',
									title: 'Upload failure (' + error + ')',
									content: error
								});
								/*
								Notify.open({
									type: 'error',
									name: 'Falha de Requisição',
									label: setup.suiname,
									message: error,
								});
								*/
							}
							Upload.trigger('fail', [xhr, status, error]);
						})
						.always(function (data, status, xhr) {
							clearTimeout(setup.obtimeout);
							Console.log({
								mode: 'Local',
								color: '#ADAAA9',
								title: 'Setup Object (' + status + ')',
								table: setup.metric.result(),
								content: setup || 'NULL'
							});
							Console.trace();
							if (typeof setup.onalways == 'function')
								setup.onalways.call(Ajax, data, status, xhr);
						});
					/////////////////////////////////////
					setup.obtimeout = setTimeout(function () {
						if (!setup.response) {
							Notify.open({
								type: 'warn',
								name: isPT ? 'O upload não foi concluído' : 'Upload could not be finished',
								label: setup.sui,
								message: isPT ? 'O tempo limite da conexão foi alcançado ('+setup.timeout+'ms).' : 'Connection timeout was reached ('+setup.timeout+'ms).',
							});
							Upload.stop();
						}
					}, setup.timeout);
					/////////////////////////////////////
					return ajaxXHR;
					/////////////////////////////////////
				}
			};
			this.on = function (event, callback) {
				Events[event] = Events[event] || [];
				Events[event].push(callback);
			};
			this.trigger = function (event, args) {
				$.each(Events[event] || [], function (k, v) {
					if (typeof v == 'function') {
						v.apply(null, args);
					}
				});
			};
			this.test = function () {
				setup.process = setup.process || 'upload';
				setup.precheck = 'test';
				setup.data = setup.collection || {};
				Upload.resume();
				Upload.on('done', function (data, status, xhr) {
					setup.state = 2;
					Upload.trigger('test:done', [data, status, xhr]);
				});
				Upload.on('fail', function (xhr, status, error) {
					Upload.trigger('test:error', [error, status, xhr]);
				});
			};
			this.start = function () {
				setup.process = setup.process || 'upload';
				if (setup.chunk) {
					Methods.readFile();
					Upload.on('read', function () {
						Upload.resume();
					});
					Upload.on('progress', function (event) {
						Upload.trigger('uploading', [(setup.loaded + event.loaded) * 100 / setup.total, event.loaded, event.total]);
					});
					Upload.on('done', function () {
						fdx++;
						setup.tries = 1;
						setup.loaded += setup.chunk;
						if (formdata[fdx]) {
							if (setup.state == 1)
								ajax = Methods.send(formdata[fdx]);
						}
						else {
							setup.state = 2;
							setup.process = 'complete';
							ajax = Methods.send();
							Upload.trigger('complete', []);
						}
					});
					Upload.on('fail', function (xhr, status, error) {
						Upload.trigger('error', [xhr, status, error]);
					});
					Upload.on('canceled', function (xhr, status, error) {
						setup.tries = setup.tries || 1;
						setTimeout(function () {
							if (setup.tries == 4) {
								Upload.trigger('fail', [xhr, status, error]);
							}
							else {
								setup.tries++;
								Upload.resume();
							}
						}, 5000);
					});
				}
				else {
					var fdata = new FormData();
					fdata.append('file', setup.file);
					formdata.push(fdata);
					Upload.resume();
					Upload.on('progress', function (event) {
						setup.total = event.total;
						Upload.trigger('uploading', [event.loaded * 100 / event.total, event.loaded || 0, event.total || 0]);
					});
					Upload.on('done', function () {
						setup.state = 2;
						Upload.trigger('complete', [setup.total]);
					});
					Upload.on('fail', function (xhr, status, error) {
						Upload.trigger('error', [error]);
					});
				}
			};
			this.resume = function () {
				setup.state = 1;
				if (formdata[fdx] || setup.precheck) ajax = Methods.send(formdata[fdx]);
				Upload.trigger('resume', []);
			};
			this.stop = function () {
				if (ajax) ajax.abort();
				setup.state = 0;
			};
			this.state = function () {
				return setup.state;
			};
		}
	}


	this.socket = function (s) {
		var Socket = this;
		var setup = {
			protocol: window.location.protocol === 'https:' ? 'https' : 'http',
			host: window.location.hostname,
		};
		if (typeof s == 'string') {
			if (s.indexOf("://") > -1) {
				setup.protocol = s.substring(0, s.indexOf("://")) || setup.protocol;
				if (s.lastIndexOf(":") > s.length - 8) {
					setup.host = s.substring(s.indexOf("://") + 3, s.lastIndexOf(":"));
					setup.port = s.substring(s.lastIndexOf(":") + 1);
				} else {
					setup.host = s.substring(s.indexOf("://"));
				}
			} else if (s.indexOf("//") === 0) {
				if (s.lastIndexOf(":") > s.length - 8) {
					setup.host = s.substring(s.indexOf("://") + 3, s.lastIndexOf(":"));
					setup.port = s.substring(s.lastIndexOf(":") + 1);
				} else {
					setup.host = s.substring(s.indexOf("://"));
				}
			} else if (s.lastIndexOf(":") > s.length - 8) {
				setup.host = s.substring(0, s.lastIndexOf(":"));
				setup.port = s.substring(s.lastIndexOf(":") + 1);
			} else {
				setup.host = s;
			}
		} else if (typeof s == 'object') {
			$.extend(setup, s);
		} else if (s === false) {
			return false;
		}



		setup.secure = setup.protocol == 'https' ? true : false;
		setup.port = setup.port ? setup.port : (setup.secure ? 3000 : 3001);
		setup.url = setup.protocol + '://' + setup.host + ':' + setup.port;


		var socketio;
		var online = false;
		var localdata = $.extend(Local.get(), { fingerprint: Device.fingerprint.get(), secure: setup.secure });
		var devicedata = Device.session.data().device;
		var $block = $('#suiAsideLeft nav[data-alias="notifications"] .block .notif');


		// ------------------------------------
		if (devicedata && devicedata.vendor != 'Apple' && "firebase" in window && Server.protocol == 'https') {
			Socket.firebaseMessaging = firebase.messaging();
		} else if ('Notification' in window) {
			Socket.browserMessaging = true;
		} else {
			Socket.browserMessaging = false;
			$block.prevAll('.name').addClass('icon-forbidden2');
			$block.before(
				'<div class="sui-tip warning icon-alert">' +
				'<strong>Não há suporte à notificações</strong><br/>Seu navegador não é compatível com esse recurso.' +
				'</div>'
			);
		}
		// ------------------------------------
		this.activewindow = true;
		this.permission = function () {
			const sdata = Device.session.data();
			if (Socket.firebaseMessaging) {
				Socket.firebaseMessaging
					.requestPermission()
					.then(function () {
						return Socket.firebaseMessaging.getToken();
					})
					.then(function (fbtoken) {
						if (fbtoken) {
							$block.prevAll('.name').addClass('icon-firebase');
							if (fbtoken !== localdata.fbtoken) {
								localdata.fbtoken = fbtoken;
								Local.set(localdata);
								Socket.emit('firebase:token', $.extend(localdata, {
									fbtoken: fbtoken
								}));
								$block.prev('.sui-tip:not(.empty)').remove();
								Debug.get('Socket', { mode: 'Permission', title: 'Notification permission', color: '#FF4400' })
								.valid({ mode: 'FBToken', type: 'Status', title: 'The notification permission was granted by the user. Firebase token sent to server.', content: fbtoken })
								.trace();
							}
						} else if (Notification.permission === 'default' || !Notification.permission) {
							Plugin.notification.permitip();
						}
					})
					.catch(function (err) {
						$block.prevAll('.name').addClass('icon-forbidden2');
						$block.prev('.sui-tip:not(.empty)').remove();
						Plugin.notification.permitip();
						Debug.get('Socket', { mode: 'Permission', title: 'Notification permission' })
							.warn({ type: 'Status', title: 'Unable to get permission to notification.\n' + err })
							.trace();
					});
			} else {
				if (Notification && Notification.permission !== 'denied') {
					Notification.requestPermission(function (permission) {
						// If the user accepts, let's create a notification
						if (permission === "granted") {
							$block.prevAll('.name').addClass('icon-html53');
						}
					});
				} else {
					$block.prev('.sui-tip:not(.empty)').remove();
					$block.prevAll('.name').addClass('icon-forbidden2');
				}
			}
		};
		this.localNotification = function (payload) {
			var data = payload.data
			if (data && !Socket.activewindow && Notification.permission == 'granted') {
				var icon = typeof data.icon != 'string' ? (data.genericon ? data.genericon : null) : data.icon;
				var notification = new Notification(data.title, {
					renotify: data.unify ? true : false,
					tag: data.id,
					body: $('<div>' + (data.description || data.label) + '</div>').text(),
					icon: icon,
					image: data.image
				});
				notification.onclick = function (event) {
					window.focus();
					$('#' + data.id).trigger('click');
					this.close();
				};
				if (notification.show) notification.show();
			}
		};
		this.open = function () {
			online = true;

			socketio = io.connect(setup.url, { secure: true });
			socketio.on('connect', function () {
				online = true;
				socketio.emit('connected', localdata);
				Debug.get('Socket', { mode: 'Online' }).notice({ mode: 'Status', title: 'Server ' + setup.url + ' is connected', content: localdata }).trace();
			});
			socketio.on('error', function (error) {
				Debug.get('Socket', { mode: 'Response' }).error({ mode: 'Status', title: 'Socket response error', content: error }).trace();
			});
			socketio.on('connect_error', function (error) {
				if (online) {
					online = false;
					Debug.get('Socket', { mode: 'Offline' }).error({ mode: 'Status', title: 'Server ' + setup.url + ' is NOT connected.', content: error }).trace();
				}
			});
			socketio.on('disconnect', function () {
				if (online) {
					online = false;
					Debug.get('Socket', { mode: 'Offline' }).warn({ mode: 'Status', title: 'Server ' + setup.url + ' disconnected' }).trace();
				}
			});
			socketio.on('logout', function (data) {
				$('#suiAsideLeft, #suiMain').remove();
				var l = Local.get();
				Cookies.clear();
				Local.clear();
				Confirm.open({
					type: 'logout',
					title: 'Sessão Encerrada',
					desc: 'Você foi desconectado do servidor e precisa realizar <strong>um novo login</strong>.',
					hilite: 'Sua sessão atual foi encerrada.',
					button: [{
						label: 'Recarregar',
						background: '#c35043',
						callback: function () {
							setTimeout(function () { window.location.reload(true); }, 300);
						}
					}]
				});
			});
			socketio.on('message:receive', function (data) {
				if (data.data) {
					if (data.data.category == 'notification') {
						Socket.localNotification(data);
						Plugin.notification.add(Socket.html(data.data));
					}
					Debug.get('Socket', { mode: 'Catch', title: setup.host + ' ' + 'message:receive' })
						.log({ mode: 'Event', title: 'A "' + data.data.category + '" message was received from de server.', content: data })
						.trace();
				}
			});
			socketio.on('list:refresh', function (data) {
				if ($.isEmptyObject(data.messages)) {
					Plugin.notification.empty();
				} else {
					if (data.category == 'notification') {
						Object.keys(data.messages).reverse().reduce((r, k) => (r[k] = data.messages[k], r), {});
						Plugin.notification.clear();
						$.each(data.messages, function (k,v) {
							if (this.status == 'new'){
								Socket.localNotification({data:v});
							}
							Plugin.notification.add(Socket.html(this));
						});
					}
					Debug.get('Socket', { mode: 'Catch', title: setup.host + ' ' + 'list:refresh' })
						.log({ mode: 'Event', title: 'A "' + data.category + '" list was refreshed from de server.', content: data })
						.trace();
				}
			});
		};
		this.html = function (data) {
			var htmlLabels = '';
			if (data.icon && !Array.isArray(data.icon)) data.icon = [data.icon, '', ''];
			if (data.subicon && !Array.isArray(data.subicon)) data.subicon = [data.subicon, '', ''];
			if (data.icon) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'icon ' + data.icon[0], content: '', style: 'background-color:' + data.icon[1] + '; color:' + data.icon[2] + ';' });
			if (data.subicon) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'subicon ' + data.subicon[0], content: '', style: 'background-color:' + data.subicon[1] + '; color:' + data.subicon[2] + ';' });
			if (data.minicon) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'minicon ' + data.minicon, content: '' });
			if (data.image) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'image', content: '', style: 'background-image:url(' + data.image + ');' });
			if (data.avatar) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'avatar', content: '', style: 'background-image:url(' + data.avatar + ');' });
			if (data.abbr) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'abbr', style: 'background-color:'+data.abbr[1]+';', content: data.abbr[0] });
			if (data.title) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'title', content: data.title });
			if (data.label) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'label', content: data.label });
			if (data.description) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'description', content: data.description });
			if (data.sendtime) htmlLabels += Template.get('panel', 'aside', 'nav', 'label', { class: 'datetime', content: $.timeagoHTML(data.sendtime) });

			if (data.link){
				if (data.link['@clone']) {
					data.link = $(data.link['@clone']).link(data.link);
					data.link.placement = 'replace';
					delete data.link['@clone'];
				}
				if (data.link.filter){
					data.link.filter = (typeof data.link.filter != 'string') ? JSON.stringify(data.link.filter) : data.link.filter;
				}
			}
			return Template.get('panel', 'aside', 'nav', 'item', {
				attr: { id: data.id },
				data: { status: data.status, link: data.link },
				hasicon: data.icon ? 'has-icon' : '',
				hassubicon: data.subicon ? 'has-subicon' : '',
				hasabbr: data.abbr ? 'has-abbr' : '',
				hasimage: data.image ? 'has-image' : '',
				hasavatar: data.avatar ? 'has-avatar' : '',
				class: { icon: data.icon, status: data.status },
				child: { labels: htmlLabels, subitems:'' }
			});
		};
		this.emit = function (event, data, id) {
			if (online) {
				socketio.emit(event, localdata, data, id);
				Debug.get('Socket', { mode: 'Emit', title: setup.host + ' ' + event })
					.log({ mode: 'Event', title: 'Socket client succesfully emitted an event "' + event + '"" to server', content: data })
					.trace();
			} else {
				Debug.get('Socket', { mode: 'Emit', title: setup.host + ' ' + event })
					.error({ mode: 'Status', title: 'Server client ' + setup.host + 'is offline', content: data })
					.trace();
			}
		};
		$(window).on('blur', function () {
			Socket.activewindow = false;
		});
		$(window).on('focus', function () {
			Socket.activewindow = true;
		});
		this.open();
		return this;
	};

	this.restart = function(setup){
		setup = $.isPlainObject(setup) ? setup : {};
		setup = $.extend(Network.startnetworkcall,setup);
		$('.sui-view:first-of-type, .sui-view:only-child').trigger('view:close');
		$('.sui-header-top, .sui-header-bar, #suiAsideLeft, #suiMain').remove();
		Dom.body.prepend('<div class="sui-auth" id="suiAuth"/>');
		if (setup.system){
			Network.history.system(setup.system);
			Dom.body.attr('data-system',setup.system.key);
			Dom.head.find('title').text(setup.system.name+' - '+Dom.head.find('title').attr('data-orig'));
			$.circleFavicon('<link rel="shortcut icon" />', 16, setup.system.abbr, setup.system.color);
			$.circleFavicon('<link rel="apple-touch-icon" sizes="180x180" />', 180, setup.system.abbr, setup.system.color);
			$.circleFavicon('<link rel="icon" type="image/png" sizes="32x32" />', 32, setup.system.abbr, setup.system.color);
			$.circleFavicon('<link rel="icon" type="image/png" sizes="16x16" />', 16, setup.system.abbr, setup.system.color);
			delete setup.system;
		}
		Network.link(setup);
	}

	this.link = function (setup) {

		setup = $.isPlainObject(setup) ? setup : {};

		Network.startnetworkcall = Network.startnetworkcall || $.extend({},setup);

		if (this instanceof jQuery) {

			// triggerclick -------------
			if (setup.triggerclick || this.data('link-triggerclick')) {
				setup = $.extend(setup, this.link('_self')) || {};
				var $tgt = $(setup.triggerclick || this.data('link-triggerclick'));
				delete setup.triggerclick;
				$tgt.closest('.scroll-default').scrollTo($tgt,{
					axis:'y',
					duration:200,
					onAfter:function(){
						$tgt.click();
					}
				});
				return true;
			}
			// --------------------------

			setup.element = setup.element || this;
			if (!setup.cancelnested) {
				setup = this.link(setup);
			}
		}

		if (Dom.body.hasClass('ctrl-click')) setup.cache = false;

		setup.name = setup.name || setup.label || setup.title || setup.sui;

		// system link --------------
		if (setup.system){
			if (!Device.isapp){
				return Network.restart({system:setup.system});
			} else if (setup.system.uk) {
				setup.href = "./"+setup.system.uk;
				setup.target = "_self";
			}
		}
		// --------------------------

		// geolocation --------------
		if (setup.geolocation === true || setup.geolocation === 'true' || setup.geolocation === 'last') {
			if (!setup.field) {
				var ajx = new Ajax(setup);
				setup.target = ajx.target();
				setup.field = ajx.field();
				ajx.loading.start();
			}
			Device.geolocation.get(function (pos) {
				if (pos) setup.geolocation = pos;
				else setup.geolocation = false;
				if (ajx) ajx.loading.stop();
				Network.link($.extend({},setup));
			}, {
				fromCache: (setup.geolocation === 'last'),
				enableHighAccuracy: true,
				timeout: 5000
			});
			return false;
		}
		// --------------------------

		/*
		// geolocation --------------
		if (setup.geolocation === true) {
			var ajx = new Ajax(setup);
			setup.target = ajx.target(setup);
			ajx.loading.start();
			Device.geolocation.get(function (pos) {
				if (pos) setup.geolocation = pos;
				else setup.geolocation = false;
				ajx.loading.stop();
				Network.link(setup);
			}, {
					enableHighAccuracy: true,
					timeout: 5000
				});
			return false;
		} else if (setup.geolocation === 'last') {
			setup.geolocation = Device.geolocation.last();
		}
		// --------------------------
		*/

		if (setup.wgdata){
			var $wg = $(setup.wgdata);
			var wgdata = {};
			$wg.each(function () {
				var $widget = $(this);
				var scope = $widget.data('Interface');
				if (typeof scope == 'object' && typeof scope.widgetData == 'function') {
					scope.widgetData();
					wgdata = $.extend(true, wgdata, scope.wgdata);
				}
			});
			setup.data = $.extend(true, setup.data||{}, wgdata);
		}

		// download -----------------
		if (setup.download) {
			var dwld;
			if (typeof setup.download == 'object') dwld = download(setup.download.url, setup.download.name, setup.download.mime);
			else dwld = download(setup.download);
			if (dwld) $.tipster.notify(isPT ? 'Aguarde, baixando arquivo...' : 'Wait, dowloading file...');
			return dwld;

		}
		// --------------------------

		// clipboard -----------------
		if (setup.clipboard) {
			return true;
		}
		// --------------------------

		// floatsector --------------
		if (setup.target === '@float-sector' || setup.target === '@floatsector') {
			Plugin.sector.float({
				//caller: (setup.view) ? setup.view : setup.element.closest('.sui-view'),
				caller: setup.element || setup.widget || setup.view,
				title: 'Seletor',
				size: setup.sectorsize || 'large',
				unclosable: setup.sectorclose === false || setup.sectorclose === 'false' || setup.unclosable === true || setup.unclosable === 'true' ? true : false,
				link: $.extend({},setup)
			});
			return true;
		}

		// external -----------------
		if (setup.href) {
			if (setup.href.indexOf('mailto:') > -1 && setup.element) {
				var $iframe = $('<iframe src="' + setup.href + '">');
				$iframe.appendTo(setup.element.closest('.sui-widget')).css("display", "none");
			} else if (setup.popup) {
				setup.id = $.md5(setup.href);
				if (setup.data) {
					for (var i in setup.data) {
						if (setup.data[i] === null || setup.data[i] === undefined || setup.data[i] === '') {
							delete setup.data[i];
						}
					}
					setup.href += '?' + $.param(setup.data);
				}
				window.open(setup.href, setup.id, setup.popup === true ? 'resizable,scrollbars,status' : setup.popup);
			} else {
				if (setup.target == '_self'){
					window.location.href = setup.href;
				} else {
					window.open(setup.href);
				}
			}
			return true;
		}
		// --------------------------

		// --------------------------
		if (setup.sector && !setup.ignoresector) {
			var $sector = typeof setup.sector == 'string' ? $('#' + setup.sector) : setup.sector;
			var $tab = Dom.sectorTabs.children('[data-sector="' + setup.sector + '"]');
			if ($sector.length) {
				if (setup.tab && $tab.length) {
					$tab.trigger('click');
					if (!setup.placement || setup.placement.indexOf('replace') === -1){
						$sector.find('#suiTabsView ol li:first').trigger('click');
						return false;
					}
				}
			}

			var $sctr = Plugin.sector.default(setup);
			if ($sector.length) {
				$sector.replaceWith($sctr);
				$sector = $sctr;
			} else {
				$sector = $sctr.appendTo(Dom.sectorsContainer);
			}
			if (setup.tab) {
				var htmlTab = Template.get('sector', 'tab', {
					class: { icon: setup.icon, unclosable: setup.unclosable === true || setup.unclosable === 'true' || setup.closable === false || setup.closable === 'false' ? 'unclosable' : '' },
					data: { sector: setup.sector },
					label: { name: setup.label || setup.title || setup.name }
				});
				if (!$tab.length) {
					$tab = $(htmlTab).appendTo(Dom.sectorTabs).trigger('click');
					if (!Device.ismobile) {
						$tab.velocity({
							scaleX: [1, 0.75],
							opacity: [1, 0.3]
						}, 250);
					}
				} else {
					var $ntb = $(htmlTab);
					$tab.trigger('click').children('.label').replaceWith($ntb.children('.label'));
				}
				if (setup.element) {
					$tab.data('opener', setup.element);
				}
			}
			setup.target = $sector.find('#suiViewsContainer');
			setup.placement = 'append';
			setup.sector = $sector;
			$sector.trigger('add');
			if (setup.pushstate) {
				$sector.attr('data-history', setup.pushstate);
			}
		}

		if (setup.element) {
			setup.widget = (setup.widget) ? setup.widget : setup.element.closest('.sui-widget');
			setup.view = (setup.view) ? setup.view : setup.element.closest('.sui-view');
			setup.sector = (setup.sector) ? setup.sector : setup.view.closest('.sui-sector');
		}

		if (setup.confirm && !setup.ignoreconfirm) {
			if (setup.confirm == '@delete-selected-lines') {
				var qtde = setup.view.find('.sui-widget.datagrid .line.selected, .sui-widget.datagrid .line.swiped').length;
				var name = isPT ? (qtde == 1 ? qtde + ' registro selecionado' : qtde + ' registros selecionados') : (qtde == 1 ? qtde + ' selected record' : qtde + ' selected records');
				Confirm.open({
					trigger: setup.element,
					title: isPT ? 'Remover Registros' : 'Remove Records',
					desc: isPT ? 'Você está prestes a remover <strong>' + name + '</strong>.' : 'You are about to remove <strong>' + name + '</strong>',
					hilite: isPT ? 'Essa ação não pode ser desfeita.' : 'This action can\'t be undone.',
					buttonlink: setup.trigger || setup.element
				});
			} else if (setup.confirm == '@delete-register') {
				var name = setup.sector.find('#suiTabsView [data-view="' + setup.view.attr('id') + '"] div strong').text() || setup.view.find('.sui-field.text:eq(0)').val();
				Confirm.open({
					trigger: setup.element,
					title: isPT ? 'Remover Registro' : 'Remove Register',
					desc: isPT ? 'Você está prestes a remover <strong>' + name + '</strong>' : 'You are about to remove <strong>' + name + '</strong>',
					//hilite : 'Essa ação não pode ser desfeita.',
					buttonlink: setup.trigger || setup.element
				});
			} else if (setup.confirm == '@remove-register') {
				var name = setup.sector.find('#suiTabsView [data-view="' + setup.view.attr('id') + '"] div strong').text() || setup.view.find('.sui-field.text:eq(0)').val();
				Confirm.open({
					trigger: setup.element,
					title: isPT ? 'Remover Base' : 'Remove Base',
					desc: isPT ? 'Você está prestes a remover todos os registros da Base de <strong>' + name + '</strong>' : 'You are about to remove all base records from <strong>' + name + '</strong>',
					hilite: isPT ? 'Você poderá restaurar essa ação.' : 'You can recover this action',
					buttonlink: setup.trigger || setup.element
				});
			} else {
				if (typeof setup.confirm == 'object') {
					Confirm.open({
						trigger: setup.trigger || setup.element,
						title: setup.confirm.title,
						desc: setup.confirm.desc || setup.confirm.description,
						hilite: setup.confirm.hilite,
						buttonscolor: setup.confirm.buttonscolor,
						buttonlink: (!setup.confirm.button) ? setup.element : null,
						button: setup.confirm.button
					});
				} else {
					Confirm.open({
						trigger: setup.trigger || setup.element,
						title: setup.title,
						desc: setup.confirm,
						buttonlink: setup.element
					});
				}
			}
			//console.log('Network confirm',setup);
			// o setor perde os ids no segundo click do trigger
			return true;
		}

		setup.sui = setup.sui || setup.url;
		setup.system = Dom.body.attr('data-system');

		// chave para identificar a conexão
		setup.rid = $.md5(JSON.stringify({
			sui: setup.sui,
			system: setup.system,
			action: setup.action,
			command: setup.command,
			process: setup.process,
			parentkey: setup.parentkey,
			owner: setup.owner,
			key: setup.key,
			stack: setup.stack,
			str: setup.str,
		}));
		////////////////////////////////////

		if (setup.sui) {
			////////////////////////////////////
			// PROMISE DE indexDB
			////////////////////////////////////
			var promiseDB = function () {
				return new Promise(function (resolve, reject) {
					if (!Local.ready() || !Cache.ready()) {
						var readyhops = 0;
						var readyinterval = setInterval(function () {
							if (readyhops == 100) {
								Trace.error('IDB ajax waiting timeout').show();
								clearInterval(readyinterval);
							}
							if ((Local.ready() && Cache.ready())) {
								resolve(true);
								clearInterval(readyinterval);
							}
							readyhops++;
						}, 50);
					} else {
						resolve(true);
					}
				});
			};
			////////////////////////////////////
			promiseDB().then(function (r) {
				if (ActiveRequests[setup.rid]) {
					$.tipster.notify(isPT ? 'Aguarde, a requisição ainda está ativa...' : 'Wait, the request is still active...');
				} else {
					if (setup.recaptcha){
						if (typeof grecaptcha != 'undefined'){
							var $meta = $('meta[name="grecaptcha-key"]');
							var grecaptchaKey = $meta.attr('content');
							if (grecaptchaKey){
								grecaptcha.ready(function() {
									grecaptcha.execute(grecaptchaKey, {action: setup.recaptcha}).then((token) => {
										$.tipster.notify(isPT ? 'Validando reCaptcha' : 'Validating reCaptcha');
										setup.data = setup.data||{};
										setup.data.recaptcha_token = token;
										/////////////////////////////////////////////////////////
										ActiveRequests[setup.rid] = new Ajax(setup);
										ActiveRequests[setup.rid].exec();
										/////////////////////////////////////////////////////////
									});
								});
							} else {
								console.warn('There is no Google reCaprcha public key into a meta element');
							}
						} else {
							console.warn('There is no Google reCaprcha script into header element');
						}
					} else {
						/////////////////////////////////////////////////////////
						ActiveRequests[setup.rid] = new Ajax(setup);
						ActiveRequests[setup.rid].exec();
						/////////////////////////////////////////////////////////
					}
				}
			});
			/*
			promiseDB().then(function (r) {
				if (ActiveRequests[setup.rid]) {
					ActiveRequests[setup.rid].abort(true);
				}
				ActiveRequests[setup.rid] = new Ajax(setup);
				ActiveRequests[setup.rid].exec();
			});
			*/
		} else {
			console.warn('There is no file to link');
		}
		return setup.rid;
	};

	this.abort = function (rid) {
		if (rid) {
			if (ActiveRequests[rid]) {
				ActiveRequests[rid].abort(true);
			}
		} else {
			$.each(ActiveRequests || [], function (ajax) {
				ajax.abort(true);
			});
		}
	}

	this.service = function (server) {
		var Console = Debug.get('Service');
		Server = {};
		if (server) {
			Server.url = server;
			if (window.location.href) {
				if (server.indexOf('//*.') === -1) {
					if (window.location.href.indexOf(server) === -1) {
						Server.url = server;
						Server.cors = true;
					}
				} else {
					var srv = [server.replace('//*.', '//'), server.replace('//*.', '//www.')];
					if (window.location.href.indexOf(srv[0]) === -1 && window.location.href.indexOf(srv[1]) === -1) {
						Console.fatal({
							mode: 'CORS',
							title: 'Cross Domain Request Error',
							content: 'The Service URL contain an invalid wildcard.'
						});
						Console.trace();
					}
				}
				//if (!Server.url) Server.url = window.location.href;
			}
		}
		if (window.location.href) Server.href = window.location.href;
		if (Server.href) {
			if (!Server.url) Server.url = Server.href;
			Server.protocol = Server.url.substring(0, 5);
			if (Server.protocol === 'http:') Server.protocol = 'http';
			else if (Server.protocol === 'https') Server.protocol = 'https';
			else Server.protocol = window.location.protocol === 'https:' ? 'https' : 'http';
			Server.hash = Server.href.indexOf("#") > -1;
			if (Server.hash) Server.hash = Server.href.substring(Server.href.indexOf("#"));
		} else {
			Server.protocol = 'https';
		}
		Server.name = Server.url.replace('http://', '').replace('https://', '').replace('//', '');
		if (Server.hash) Server.name = Server.name.replace(Server.hash, '');
		Server.url = Server.protocol + '://' + Server.name;
		Dom = sourceui.interface.dom;
		Parser = Instances.parser;
		Interface = Instances.interface;
		Plugin = Interface.plugins;
		Notify = Plugin.notify;
		Confirm = Plugin.confirm;
	};

	this.upload = function (setup) {
		return new Upload(setup);
	};

	this.download = function (setup) {
		return new Download(setup);
	};

	this.history = {
		last: '',
		stack: {},
		following: false,
		_follow: function(){
			var args = arguments;
			setTimeout(function(){
				Network.history.exec.apply(Network.history,args);
			},200);
		},
		follow: function (path, $elem) {
			if (!path.length) {
				Dom.document.trigger('panelready');
				return;
			}
			if (!$elem || !$elem.length){ // atenção aqui
				$elem = $('#suiSectorsContainer .sui-view.selected');
			}
			Network.history.following = true;
			var current = path.shift();
			var spath, klist, filter = {};
			var ksel = [];
			var $k, $c=$(), $mb;
			if (current.indexOf(':') > -1) {
				spath = current.split(':');
				if (spath[1]) {
					klist = spath[1].split('|'); // o pipe é o divisor de valores
					for (var j = 0; j < klist.length; j++) {
						if (klist[j]) ksel.push('[data-link-key="' + klist[j] + '"]:eq(0)');
					}
					$k = $elem.find(ksel.join(','));
					if ($k && $k.length) {
						$k.each(function () {
							var $this = $(this);
							$this.addClass('select selected');
							if ($this.data('link-command') == spath[0]) $c = $this;
						});
						if (!$c.length) $c = $k.data('link-command') == spath[0] ? $k : $k.find('.swiper [data-link-command="' + spath[0] + '"]:eq(0)');
						if (!$c.length) $c = $k.find('.swiper [data-link-command="' + spath[0] + '"]:eq(0)');
						if (!$c.length) $c = $k.closest('.sui-widget').find('.toolbar [data-link-command="' + spath[0] + '"]:eq(0)');
						if (!$c.length) $c = $elem.find('.toolbar [data-alias="' + spath[0] + '"]:eq(0)');
					} else {
						Dom.document.trigger('panelready');
						return;
					}
				}
			} else {
				if (current.indexOf('?') > -1) {
					var splcur = current.split('?');
					current = splcur[0];
					filter = $.deparam(splcur[1]);
				}
				$c = $elem.find('[data-history*="' + current + '"]:eq(0)');
				if (!$c.length) $c = $elem.find('[data-link-pushstate*="' + current + '"]:eq(0)');
				if ($c.length) {
					$mb = $c.closest('.menu.block');
					if ($mb.length) $mb.prevAll('.blocklist').children('li[data-id="' + $mb.data('id') + '"]').click();
				}
			}
			if ($c && $c.length) {
				if ($c.is('a, .sui-link, .sui-button, li, .schedule')) {
					$c.enable();
					$c.closest('.disable').enable();
					$c.trigger('click', [{ filter: filter }]);
					$c.one('ajax:done ajax:cache', function (event, $jq) {
						var $this = $(this);
						if (filter && $jq){
							var $filterset = $jq.find('.sui-widget .sui-filterset');
							var $filts = $filterset.find('.sui-filter');
							var $widget = $filterset.closest('.sui-widget');
							$.each(filter, function(k,v){
								$filts.filter('[data-name="'+k+'"]').addClass('selected');
							});
							$widget.trigger('filter:change');
						}
						Network.history.follow(path, $jq);
						$c.off('ajax:done ajax:cache');
					});
					$c.one('ajax:fail', function (event, $jq) {
						Dom.document.trigger('panelready');
					});
				} else {
					Network.history.follow(path, $c);
				}
			} else {
				Dom.document.trigger('panelready');
			}
		},
		go: function (history) {
			var $elem = $('#suiMain');
			var $tabview, $tabsector;
			if (history) {
				var splited = history.split('/');
				var filter = {};
				for (var i = 0; i < splited.length; i++) {
					if (splited[i].indexOf('?') > -1) {
						var splcur = splited[i].split('?');
						splited[i] = splcur[0];
						filter = $.deparam(splcur[1]);
					}
					$elem = $elem.find('[data-history="' + splited[i] + '"]:eq(0)');
					if (!$elem.length) break;
					if (i === 0 && splited.length === 1) {
						if ($elem.is('.sui-sector')) $tabsector = $elem.data('tab');
						$tabview = $elem.find('.sui-view:first').data('tab');
					} else {
						if ($elem.is('.sui-sector')) $tabsector = $elem.data('tab');
						else if ($elem.is('.sui-view')) $tabview = $elem.data('tab');
					}
					if ($tabsector) $tabsector.trigger('click', [false, true]);
					if ($tabview) $tabview.trigger('click', [true]);
				}
			} else {
				window.location.reload(true);
			}
		},
		tab: function ($sector, $view) {
			var hpath = [];
			var hist = '';
			var $this;
			if ($sector) {
				hpath.push($sector.attr('data-history'));
				if ($view) {
					$sector.find('.sui-view').each(function () {
						$this = $(this);
						hist = $this.attr('data-history');
						if (hist) hpath.push(hist);
						if (this === $view[0]) return false;
					});
				} else {
					$sector.find('.sui-view').each(function () {
						$this = $(this);
						hist = $this.attr('data-history');
						if (hist) hpath.push(hist);
						if ($this.is('.selected')) return false;
					});
				}
			}
			Network.history.push(hpath.join('/'));
		},
		system: function (system) {
			if (Network.history.following) return;
			window.history.pushState({}, '', './'+system.uk+'/');
		},
		home: function () {
			if (Network.history.following) return;
			window.history.pushState({}, '', './');
		},
		push: function (history) {
			if (!history || Network.history.following) return;
			if (Network.history.getHash() !== history) {
				var splited = {
					hist: history.split('/'),
					last: Network.history.last.split('/')
				};
				if (splited.hist[0] === splited.last[0]) {
					if (splited.hist.length === splited.last.length) {
						window.history.replaceState({}, '', history);
					} else {
						window.history.pushState({}, '', history);
					}
				} else {
					window.history.pushState({}, '', history);
				}
				Network.history.last = history;
			}
		},
		replace: function (history) {
			if (!history || Network.history.following) return;
			window.history.replaceState({}, '', history);
		},
		unfilter: function () {
			var hash = Network.history.getHash();
			var unfilthash = hash;
			var splited = hash.split('/');
			for (var i = 0; i < splited.length; i++) {
				if (splited[i].indexOf('?') > -1) {
					var splcur = splited[i].split('?');
					unfilthash = unfilthash.replace(splcur[1],'');
				}
			}
			if (hash !== unfilthash){
				Network.history.replace(unfilthash);
			}
		},
		getHash: function () {
			var hash, hashash = window.location.href.indexOf("#!");
			return (hashash > -1) ? window.location.href.substring(window.location.href.indexOf("#!")) : '';
		}
	};
	$(window).on('popstate', function (event) {
		var hash = Network.history.getHash();
		if (hash) Network.history.go(hash);
		else $('#suiAsideLeft > .logo').trigger('click');
		//console.log('popstate', hash);
	});
	$(window).on('hashchange', function () {
		//console.log('hashchange', location.hash);
	});

	/*
	---------------------------
	Network.get*()
	---------------------------
	Método publuco da classe Network para buscar de forma assíncrona arquivos no servidor.
	@file - @string - URL do arquivo para ser carregado
	@callback - função executada no êxito
	@failback - função executada no erro
	---------------------------
	*/
	var Async = {
		queue: function (s) {
			var setup = s;
			var Queue = this;
			this.list = {};
			this.total = 0;
			this.complete = 0;
			this.error = 0;
			this.percent = 0;
			this.addFile = function (file) {
				file.id = Async.makeID(file);
				Queue.list[file.id] = file;
				Queue.total++;
			};
			this.finish = function (id, complete) {
				delete Queue.list[id];
				if (complete) Queue.complete++;
				else Queue.error++;
				Queue.percent = Queue.total / (Queue.complete + Queue.error);
				if (Object.keys(Queue.list).length === 0) {
					if (Queue.complete === Queue.total) {
						if (setup.oncomplete) setup.oncomplete.call(Queue);
					} else {
						if (setup.onerror) setup.onerror.call(Queue);
					}
				} else {
					if (setup.onprogress) setup.onprogress.call(Queue, Queue.percent);
				}
			};
		},
		filelist: {},
		makeID: function (file) {
			return (file.id) ? file.id : file.id = $.md5(file.url + file.type + file.method + JSON.stringify(file.data));
		},
		getFile: function (setup) {
			setup.id = Async.makeID(setup);
			if (Async.filelist[setup.id]) {
				var file = Async.filelist[setup.id];
				if ($.isEmptyObject(file)) {
					if (setup.onfail) setup.onfail.call(setup.url, file.error, file.status, file.xhr);
				} else {
					if (setup.ondone) setup.ondone.call(setup.url, file.data, file.status, file.xhr);
				}
			} else {
				Async.filelist[setup.id] = {};
				if (setup.type == 'css') {
					$('<link/>', {
						rel: 'stylesheet',
						type: 'text/css',
						href: setup.url
					}).appendTo('head');
					Async.filelist[setup.id] = { file: setup.url };
					if (setup.queue) setup.queue.finish(setup.id, true);
					if (setup.ondone) setup.ondone.call.call(file);
				} else {
					$.ajax({
						method: setup.method || "GET",
						url: setup.url,
						data: setup.data,
						crossDomain: setup.crossDomain === false ? false : true,
						dataType: (setup.type == 'js' ? 'script' : setup.type) || 'script',
						cache: setup.cache === false ? false : true
					}).done(function (data, status, xhr) {
						Async.filelist[setup.id] = { xhr: xhr, data: data, status: status };
						if (setup.queue) setup.queue.finish(setup.id, true);
						if (setup.ondone) setup.ondone.call(setup.url, data, status, xhr);
					}).fail(function (xhr, status, error) {
						Async.filelist[setup.id] = { xhr: xhr, error: error, status: status };
						if (setup.queue) setup.queue.finish(setup.id, false);
						if (setup.onfail) setup.onfail.call(setup.url, error, status, xhr);
					}).always(function () {
						if (setup.onalways) setup.onalways.call(setup.url);
					});
				}
			}
		},
		get: function (type, url, data, ondone, onfail, onalways) {
			if ($.type(data) == 'function') {
				onalways = onfail;
				onfail = ondone;
				ondone = data;
				data = null;
			} else if ($.type(data) == 'object') {
				onalways = data.onalways || data.always;
				onfail = data.onfail || data.fail;
				ondone = data.ondone || data.done;
				data = null;
			}
			Async.getFile({
				url: url,
				type: type,
				data: data,
				ondone: ondone,
				onfail: onfail,
				onalways: onalways
			});
		},
		getScript: function (url, data, callback, failback, everback) {
			Async.get('script', url, data, callback, failback, everback);
		},
		getJSON: function (url, data, callback, failback, everback) {
			Async.get('json', url, data, callback, failback, everback);
		},
		getCSS: function (url, data, callback) {
			Async.get('css', url, data, callback);
		},
		getFiles: function (files, options) {
			var setup = {};
			setup.queue = new Async.queue($.type(options) == 'function' ? { oncomplete: options } : options);
			$.each(files, function (k, v) {
				var file = {};
				file.url = ($.type(v) == 'object') ? v.url : v;
				file.data = ($.type(v) == 'object') ? v.data : null;
				var type = file.url.split('.').pop();
				if (type === 'js') type = 'script';
				else if (type !== 'json' && type !== 'css') type = null;
				file.type = ($.type(v) == 'object') ? v.type : type || 'script';
				file.method = ($.type(v) == 'object') ? v.method : 'GET';
				file.cache = ($.type(v) == 'object') ? (v.cache === false ? false : true) : true;
				file.crossDomain = ($.type(v) == 'object') ? (v.crossDomain === false ? false : true) : true;
				setup.queue.addFile(file);
				Async.getFile($.extend(file, setup));
			});
		}
	};

	this.getScript = Async.getScript;
	this.getJSON = Async.getJSON;
	this.getCSS = Async.getCSS;
	this.getFiles = Async.getFiles;
};





/**
*
* jquery.binarytransport.js
*
* @description. jQuery ajax transport for making binary data type requests.
* @version 1.0
* @author Henry Algus <henryalgus@gmail.com>
*
*/

// use this transport for "binary" data type
$.ajaxTransport("+binary", function (options, originalOptions, jqXHR) {
	// check for conditions and support for blob / arraybuffer response type
	if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
		return {
			// create new XMLHttpRequest
			send: function (headers, callback) {
				// setup all variables
				var xhr = new XMLHttpRequest(),
					url = options.url,
					type = options.type,
					async = options.async || true,
					// blob or arraybuffer. Default is blob
					dataType = options.responseType || "blob",
					data = options.data || null,
					username = options.username || null,
					password = options.password || null;

				xhr.addEventListener('load', function () {
					var data = {};
					data[options.dataType] = xhr.response;
					// make callback and send data
					callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
				});

				xhr.open(type, url, async, username, password);

				// setup custom headers
				for (var i in headers) {
					xhr.setRequestHeader(i, headers[i]);
				}

				xhr.responseType = dataType;
				xhr.send(data);
			},
			abort: function () { }
		};
	}
});
