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

if (!sourceui) var sourceui = { interface: { widget: {} }, instances: { interface: {} }, templates: {}, timediff: 0 };

sourceui.Device = function (c) {

	if (sourceui.instances.device) return {};

	var Device = this;

	var IDBGlobal = function () {
		var Global = this;
		var Ready = false;
		var DB;
		var now = new Date().getTime();
		var expire = 2592000 * 6; // 150 dias
		var globaldata = {};
		var Console = Device.Debug.get('IndexDB');
		if (typeof IDBStore == 'function') DB = new IDBStore({
			dbVersion: 1,
			storeName: 'suiGlobal',
			keyPath: 'key',
			autoIncrement: false,
			onStoreReady: function () {
				Global.getAll();
				Console.notice({
					mode: 'Status',
					title: 'IDBStore Global Data is ready',
				});
				if (Console.length == 3) Console.trace();
			}
		});
		this.failback = function (error) {
			Console.error({
				mode: 'Status',
				title: 'IDBStore Global Data error',
				content: error
			});
			if (Console.length == 2) Console.trace();
		};
		this.set = function (key, data, callback, failback) {
			data.key = key;
			if (DB) DB.put(data, function () {
				globaldata[key] = data;
				if (callback) callback(key);
			}, failback || this.failback);
		};
		this.get = function (key) {
			return globaldata[key] || {};
		};
		this.getAll = function (failback) {
			if (DB) DB.getAll(function (result) {
				Ready = true;
				$.each(result, function (k, v) {
					globaldata[v.key] = v;
				});
			}, failback || this.failback);
		};
		this.remove = function (key, callback, failback) {
			delete globaldata[key];
			if (DB) DB.remove(key, function (result) {
				if (result !== false && callback) callback(result);
			}, failback || this.failback);
		};
		this.clear = function (callback, failback) {
			globaldata = {};
			if (DB) DB.clear(function () {
				if (callback) callback();
			}, failback || this.failback);
		};
		this.ready = function () {
			return Ready;
		};
	};

	var Config = {
		_debug: null,
		_cache: null,
		_offline: null,
		set: function (type, cfg) {
			if (cfg === true || cfg === 'true') {
				Config['_' + type] = true;
			} else if (cfg === false || cfg === 'false') {
				Config['_' + type] = false;
			} else if (cfg === null || cfg === 'null') {
				Config['_' + type] = null;
			} else {
				Config['_' + type] = cfg;
			}
		},
		get: function (type) {
			return Config['_' + type];
		},
		debug: function (cfg) {
			if (cfg) Config.set('debug', cfg);
			else return Config.get('debug');
		},
		cache: function (cfg) {
			if (cfg) Config.set('cache', cfg);
			else return Config.get('cache');
		},
		offline: function (cfg) {
			if (cfg) Config.set('offline', cfg);
			else return Config.get('offline');
		},
		clear: function (type) {
			Config['_' + type] = null;
		}
	};

	if (c.debug) Config.debug(c.debug);
	if (c.cache) Config.cache(c.cache);
	if (c.offline) Config.offline(c.offline);

	var Agent = {
		data: {
			browser: {},
			engine: {},
			os: {},
			device: {},
			cpu: {}
		},
		get: function () {
			Agent.data.isapp = window.hasOwnProperty("cordova") || (document.location.protocol !== "http:" && document.location.protocol !== "https:");
			Agent.data.browser = $.ua.browser;
			Agent.data.engine = $.ua.engine;
			Agent.data.os = $.ua.os;
			if (!Agent.data.isapp) {
				Agent.data.device = $.ua.device;
				Agent.data.device.name = Agent.data.device.model;
				Agent.data.device.model = detectDevices(Agent.data.device.model) || Agent.data.device.model;
				Agent.data.device.type = Agent.data.device.type || 'computer';
			} else if (typeof window.device != undefined) {
				Agent.data.device = device;
				Agent.data.device.vendor = Agent.data.device.manufacturer;
				Agent.data.device.type = 'mobile';
			}
			Agent.data.cpu = $.ua.cpu;
			return $.ua;
		}
	};

	var Fingerprint = {
		hash: null,
		lier: false,
		ua: Agent.data,
		get: function () {
			if (window.Fingerprint2 && !Fingerprint.hash) {
				Fingerprint2.get({
					preprocessor: function (key, value) {
						if (Fingerprint.ua){
							if (key == "userAgent") {
								return (Fingerprint.ua.isapp ? 'APP' : 'PWA') + ' ' + Fingerprint.ua.browser.name + ' ' + Fingerprint.ua.engine.name;
							} else if (key == "platform") {
								return $.trim(
									value + ' ' +
									Fingerprint.ua.os.name + ' ' +
									Fingerprint.ua.os.version + ' ' +
									(Fingerprint.ua.cpu.architecture || 'intel') + ' ' +
									(Fingerprint.ua.device.type || '') + ' ' +
									(Fingerprint.ua.device.vendor || '') + ' ' +
									(Fingerprint.ua.device.model || Fingerprint.ua.device.name)
								);
							}
						}
						return value;
					},
					excludes: {
						canvas: true,
						webgl: true,
						pixelRatio:true,
						availableScreenResolution:true,
						enumerateDevices: true,
						fontsFlash: true,
						adBlock: true,
						plugins: true,
						audio: true,
					},
					screen: {
						detectScreenOrientation: false
					}
				}, function (components) {
					var values = components.map(function (component) { return component.value; });
					Fingerprint.hash = Fingerprint2.x64hash128(values.join(''), 31);
					Fingerprint.lier = values[17] || values[18] || values[19] || values[20];
					Fingerprint.resolution = values[5];
				});
				/*
				new Fingerprint2({
					excludeScreenResolution : true,
					excludeJsFonts : true,
					excludeFlashFonts : true,
				}).get(function(hash,comp){
					Fingerprint.hash = hash;
					Fingerprint.lier = comp[15].value || comp[16].value || comp[17].value || comp[18].value;
				});
				*/
			}
		}
	};

	var Timezone = {
		name: null,
		set: function (tz) {
			Timezone.name = tz || jstz.determine().name();
		},
		get: function () {
			return Timezone.name = jstz.determine().name();
		}
	};

	var Session = {
		set: function (hash) {
			Session.id = hash;
		},
		data: function () {
			return $.extend({}, {
				id: Session.id,
				timezone: Timezone.name,
				ismobile: Device.ismobile,
				isapp: Device.isapp,
				resolution: Fingerprint.resolution,
				fingerprint: Fingerprint.hash,
				lier: Fingerprint.lier,
			}, Agent.data);
		},
		get: function () {
			return $.extend({}, {
				id: Session.id,
				timezone: Timezone.get(),
				fingerprint: Fingerprint.get(),
				lier: Fingerprint.lier(),
			}, Agent.get());
		}
	};

	var Geolocation = {
		coords: {},
		get: function (callback, options) {
			if (navigator.geolocation) {
				if (options.fromCache && !$.isEmptyObject(Geolocation.coords)) {
					if (callback){
						callback(Geolocation.coords);
						callback = null;
					}
				}
				navigator.geolocation.getCurrentPosition(function (pos) {
					Geolocation.coords = {
						lat: pos.coords.latitude,
						lon: pos.coords.longitude,
						accuracy: pos.coords.accuracy,
						altitude: pos.coords.altitude,
						altitudeAccuracy: pos.coords.altitudeAccuracy,
						heading: pos.coords.heading,
						speed: pos.coords.speed
					};
					if (callback) callback(Geolocation.coords);
				}, function () {
					if (callback) callback(Geolocation.coords);
				}, options);
			}
		},
		last: function () {
			return Geolocation.coords;
		},
		watchid: null,
		watch: function (callback, options) {
			if (navigator.geolocation) {
				if (Geolocation.watchid) {
					navigator.geolocation.clearWatch(Geolocation.watchid);
				}
				Geolocation.watchid = navigator.geolocation.watchPosition(function (pos) {
					Geolocation.coords = {
						lat: pos.coords.latitude,
						lon: pos.coords.longitude,
						accuracy: pos.coords.accuracy,
						altitude: pos.coords.altitude,
						altitudeAccuracy: pos.coords.altitudeAccuracy,
						heading: pos.coords.heading,
						speed: pos.coords.speed
					};
					if (callback) callback(Geolocation.coords);
				}, function () {
					if (callback) callback(Geolocation.coords);
				}, options);
			}
		},
		unwatch: function () {
			if (Geolocation.watchid) {
				navigator.geolocation.clearWatch(Geolocation.watchid);
			}
		}
	};

	Agent.get();
	Fingerprint.get();
	Timezone.get();

	this.isdebug = Config.get('debug');
	this.iscache = Config.get('cache');
	this.isoffline = Config.get('offline');
	this.isapp = Fingerprint.ua.isapp ? true : false;
	//this.ismobile = (Agent.data.device.type == 'computer') ? false : true;
	this.ismobile = ((
		(Agent.data.device.type == 'computer' ? 0 : 1) +
		(Agent.data.os.name.indexOf('Win') > -1 || Agent.data.os.name.indexOf('Mac') > -1 || Agent.data.os.name.indexOf('Linu') > -1 || Agent.data.os.name.indexOf('Ubun') > -1 ? 0 : 1) +
		(window.innerWidth >= 800 ? 0 : 1) +
		(window.innerHeight >= 600 ? 0 : 1)
	) >= 3) ? true : false;

	this.orientation = function(){
		if (window.innerHeight < window.innerWidth) return 'landscape';
		else if(window.innerHeight > window.innerWidth) return 'portrait';
		else false;
	}

	var osname = Agent.data.os.name.toLowerCase();
	var browsername = Agent.data.browser.name.toLowerCase();
	var $body = $('#suiBody');
	$body.addClass(osname+' '+browsername);
	$body.attr('os',Agent.data.os.version);
	$body.attr('maj',Agent.data.browser.major);
	if (this.ismobile) {
		$body.addClass('mobile leftcollapsed rightcollapsed');
		window.navigator.standalone = window.navigator.standalone || (window.matchMedia('(display-mode: standalone)').matches);
		if (window.navigator.standalone) $body.addClass('standalone');
	}
	if (c.debug) $body.addClass('debug');

	this.debug = function (cfg) {
		return (cfg) ? Config.debug(cfg) : Config.debug();
	};
	this.cache = function (cfg) {
		return (cfg) ? Config.cache(cfg) : Config.cache();
	};
	this.offline = function (cfg) {
		return (cfg) ? Config.offline(cfg) : Config.offline();
	};

	this.agent = {
		get: function () {
			return Agent.data;
		},
	};
	this.fingerprint = {
		get: function () {
			Fingerprint.get();
			return Fingerprint.hash;
		},
		lier: function () {
			Fingerprint.get();
			return Fingerprint.lier;
		}
	};
	this.session = {
		id: function () {
			return Session.id;
		},
		data: function () {
			return Session.data();
		}
	};
	this.geolocation = {
		get: function () {
			return Geolocation.get.apply(null, arguments);
		},
		last: function () {
			return Geolocation.last();
		}
	};
	this.pwaworker = function(sw){
		Device.Debug.create('PWA', {
			mode: 'Worker',
			title: 'PWA service worker register state'
		});
		if ("serviceWorker" in navigator) {
			if (navigator.serviceWorker.controller) {
				Device.Debug.get('PWA').log({
					mode: 'Status',
					title: 'Active service worker found, no need to register',
				}).trace();
			} else {
				// Register the service worker
				navigator.serviceWorker
				.register("pwa.worker.js", {
					scope: "./"
				})
				.then(function (reg) {
					Device.Debug.get('PWA').notice({
						mode: 'Status',
						title: 'Service worker has been registered for scope: ' + reg.scope,
					}).trace();
				});
			}
		} else {
			Device.Debug.get('PWA').notice({
				mode: 'Compatibility',
				title: 'Service worker is not supported for the browser',
			}).trace();
		}
	}

	var Debug = function () {

		var debug = this;
		var profiles = {};
		var isEnable = Config.debug();
		var isChrome = Agent.data.browser.name == 'Chrome';

		var version = '1.0.86';

		if (isEnable)
		if (isChrome) console.log('%cSourceUI Debugger %c'+version, 'font-size:19px;font-weight:bold;color:#999999', 'font-size:9px;color:#CCC;');
		else console.log('SourceUI Debugger '+version);

		debug.profile = function (id, data) {
			var c = {
				'dump': '#009AA2',
				'error': '#c52c33',
				'fatal': '#b9173a',
				'fail': '#b9173a',
				'info': '#0066ff',
				'warn': '#a4866e', //dd7119
				'valid': '#0055BB',
				'notice': '#0C8446',
				'log': '#444444',
				'local': '#AAAAAA',
				'cache': '#AAAAAA',
				'bug': '#8e34a5'
			};
			var g = {
				'dump': 'group',
				'error': 'group',
				'fatal': 'group',
				'fail': 'group',
				'info': 'groupCollapsed',
				'warn': 'groupCollapsed',
				'valid': 'groupCollapsed',
				'notice': 'groupCollapsed',
				'log': 'groupCollapsed',
				'local': 'groupCollapsed',
				'cache': 'groupCollapsed',
			};

			var css = {
				id: {
					'background-color': '#666666',
					'color': '#FFFFFF',
					'padding': '2px 7px',
				},
				mode: {
					'background-color': '#000000',
					'color': '#FFFFFF',
					'padding': '2px 7px',
					'margin-right': '8px;'
				},
				title: {
					'color': '#000000',
					'margin-right': '8px;',
					'letter-spacing': '-1px;'
				},
				mark: {
					'background-color': '#777777',
					'color': '#FFFFFF',
					'padding': '1px 4px 0 4px',
					'font-size': '0.75em',
				},
				itemode: {
					'background-color': '#CCCCCC',
					'font-weight': 'bold',
					'color': '#FFFFFF',
					'padding': '2px 4px',
					'margin-right': '8px;'
				},
				item: {
					'color': '#333333',
				},
				content: {
					'color': '#333333',
					'font-size': '12px',
				}
			};

			var group = {};

			var profile = this;

			this.id = id;
			this.types = {};
			this.colours = {};
			this.length = 0;

			profile.has = function (type) {
				return profile.types[type] || false;
			};

			profile.css = function (css) {
				if (!isEnable) return '';
				var s = '';
				$.each(css || [], function (k, v) {
					s += k + ':' + v + ';';
				});
				return s;
			};

			profile.group = function (data) {
				if (!isEnable) return profile;
				group.collapsed = group.collapsed || data.collapsed || true;
				group.id = group.id || profile.id;
				group.mode = data.mode || group.mode;
				group.title = data.title || group.title;
				group.css = {
					id: $.extend({}, css.id),
					mode: $.extend({}, css.mode),
					title: $.extend({}, css.title),
				};
				group.symbol = [];
				$.each(data.list || data.items || [], function (k, v) {
					profile.item(v);
				});
				return profile;
			};

			profile.groupData = function (k, v) {
				if (typeof v != 'undefined') {
					group[k] = v;
					return profile;
				} else return group[k];
			};

			profile.item = function (item) {
				if (!isEnable) return profile;
				var content = '';
				item.css = $.extend({}, css.item);
				item.css['color'] = item.color || c[item.type] || '#333333';
				var corkey = item.css['color'];
				if (item.type == 'dump' || item.type == 'error' || item.type == 'fatal' || item.type == 'bug') {
					group.collapsed = false;
					group.css.id['background-color'] = item.css['color'];
				} else if (item.type == 'warn' || item.type == 'info' || item.type == 'notice') {
					group.css.id['background-color'] = item.css['color'];
				}
				if (item.type == 'error' || item.type == 'fatal' || item.type == 'warn' || item.type == 'bug') {
					group.css.title['color'] = '#601000';
				} else if (item.type == 'info' || item.type == 'dump') {
					group.css.title['color'] = '#100060;';
				}
				if (typeof item.content == 'object') {
					item.obj = true;
				} else {
					if (item.content && item.subtitle) {
						item.css['font-weight'] = bold;
					}
				}

				if (item.type == 'error' || item.type == 'fatal') {
					group.symbol.push('⛔');
				} else if (item.type == 'bug') {
					group.symbol.push('🐞');
				} else if (item.type == 'warn') {
					group.symbol.push('⚠️');
				} else if (item.type == 'dump') {
					group.symbol.push('🔵');
				}

				group.items = group.items || {};
				item.id = $.md5([Object.keys(group.items).length, group.title, item.type, item.mode, item.title, profile.length].join('|'));
				if (group.items[item.id]) return profile;
				group.items[item.id] = item;
				profile.types[item.type] = profile.types[item.type] || 0;
				profile.types[item.type]++;
				profile.colours[corkey] = profile.colours[corkey] || 0;
				profile.colours[corkey]++;
				profile.length++;
				return profile;
			};

			profile.show = function () {
				if (!isEnable) return profile;
				if (!isChrome){
					var csl;
					console[group.collapsed ? 'groupCollapsed' : 'group']('[' + group.id + '] [' + group.mode + '] ' + group.title + ' ' + group.symbol.join(''));
					$.each(group.items || [], function (k, v) {
						if (v.type == 'error' || v.type == 'fatal' || v.type == 'bug') csl = 'error';
						else if (v.type == 'warn') csl = 'warn';
						else csl = 'log';

						if (v.type == 'error' || v.type == 'fatal') v.symbol = '⛔';
						else if (v.type == 'bug') v.symbol = '🐞';
						else if (v.type == 'warn') v.symbol = '⚠️';
						else if (v.type == 'dump') v.symbol = '🔵';
						else v.symbol = '';

						if (v.message) {
							console.log(v.message.replace(/\n/g, "\r\n"));
						} else {
							if (v.title) {
								if (v.content) {
									if (v.mode) {
										console.groupCollapsed.apply(null, ['[' + v.mode + '] ' + v.title + ' ' + v.symbol]);
									} else {
										console.groupCollapsed.apply(null, [v.title]);
									}
								} else {
									if (v.mode) {
										console[csl].apply(null, ['[' + v.mode + '] ' + v.title + ' ' + v.symbol]);
									} else {
										console[csl].apply(null, [v.title]);
									}
								}
							}
							if (v.table) {
								console.table(v.table);
							}
							if (v.content) {
								console[csl](v.content);
							}
							if (v.title) {
								if (v.content) {
									console.groupEnd();
								}
							}
						}
					});
					console.groupEnd();
					return profile;
				}

				var title = [];
				var mark = [];

				title.push('%c' + group.id + '%c' + group.mode + (group.cache ? ' Cache' : '') + '%c' + group.title);
				title.push(profile.css(group.css.id));
				title.push(profile.css(group.css.mode));
				title.push(profile.css(group.css.title));

				var cssmark = $.extend({}, css.mark);
				$.each(profile.colours || [], function (k, v) {
					cssmark['background-color'] = $.hex2rgb(k, 0.65);
					title[0] += '%c' + v;
					title.push(profile.css(cssmark));
				});
				console[group.collapsed ? 'groupCollapsed' : 'group'].apply(null, title);
				$.each(group.items || [], function (k, v) {
					var _console = console.log;
					var cssmode = $.extend({}, css.itemode);
					var cssitem = v.css;
					var csscont = $.extend({}, css.content);
					if (v.message) {
						_console.apply(null, ['%c' + v.message.replace(/\n/g, "\r\n"), profile.css(cssitem)]);
					} else {
						csscont['color'] = v.css['color'];
						if (v.title) {
							if (v.content) {
								if (v.mode) {
									cssmode['background-color'] = $.hex2rgb(v.css['color'], 0.5);
									console.groupCollapsed.apply(null, ['%c' + v.mode + '%c' + v.title, profile.css(cssmode), profile.css(cssitem)]);
								} else {
									console.groupCollapsed.apply(null, ['%c' + v.title, profile.css(cssitem)]);
								}
							} else {
								if (v.mode) {
									cssmode['background-color'] = $.hex2rgb(v.css['color'], 0.5);
									_console.apply(null, ['%c' + v.mode + '%c' + v.title, profile.css(cssmode), profile.css(cssitem)]);
								} else {
									_console.apply(null, ['%c' + v.title, profile.css(cssitem)]);
								}
							}
						}
						if (v.table) {
							var table = '';
							$.each(v.table || [], function (k, v) {
								cssconv = { 'color': '#333333', 'font-weight': 'bold' };
								console.log('%c' + k + ': %c' + v, profile.css(csscont), profile.css(cssconv));
								//table += k+': '+v+"\n";
							});
							//console.log('%c'+table,profile.css(csscont));
						}
						if (v.content) {
							if (v.obj) {
								debug.expand(v.content);
								//console.log(v.content);
							} else {
								console.log.apply(null, ['%c' + decodeURIComponent(v.content).replace(/\n/g, "\r\n"), profile.css(csscont)]);
							}
						}
						if (v.title) {
							if (v.content) {
								console.groupEnd();
							}
						}
					}
				});
				console.groupEnd();
				profile.reset();
				return profile;
			};
			profile.reset = function () {
				group.items = {};
				profile.types = {};
				profile.colours = {};
				profile.length = group.items.length;
				return profile;
			};
			profile.trace = function () {
				profile.show();
				return profile.reset();
			};
			profile.add = function (type, title, content) {
				if (!isEnable) return profile;
				var d = {};
				if (title && !content) { content = title; title = null; }
				if (typeof content == 'object' && (content.content || content.title || content.type)) {
					d = content;
				} else {
					d.content = content;
					d.title = title;
				}
				d.type = type;
				profile.item(d);
				return profile;
			};




			profile.log = function (title, content) {
				return profile.add('log', title, content);
			};

			profile.error = function (title, content) {
				return profile.add('error', title, content);
			};

			profile.fatal = function (title, content) {
				return profile.add('fatal', title, content);
			};

			profile.fail = function (title, content) {
				return profile.add('fail', title, content);
			};

			profile.warn = function (title, content) {
				return profile.add('warn', title, content);
			};

			profile.notice = function (title, content) {
				return profile.add('notice', title, content);
			};

			profile.valid = function (title, content) {
				return profile.add('valid', title, content);
			};

			profile.info = function (title, content) {
				return profile.add('info', title, content);
			};

			if (data) profile.group(data);
			return profile;

		};

		debug.expand = function (item, depth) {
			var MAX_DEPTH = 100;
			depth = depth || 0;
			if (depth > MAX_DEPTH) {
				console.log(item);
				return;
			}
			if ($.isPlainObject(item)) {
				$.each(item, function (key, value) {
					if ($.isPlainObject(value)) {
						console.groupCollapsed('%c' + key + ' : %c' + (typeof value), 'color:#AAA; font-weight:normal;', 'color:#a84f4f');
						debug.expand(value, depth + 1);
						console.groupEnd();
					} else {
						console.log('%c' + key + ':', 'color:#AAA', value);
					}
				});
			} else {
				console.log(item);
			}
		};

		debug.get = function (id, data) {
			var profile, nid;
			if (data) {
				if (data.key) {
					nid = id + '-' + data.key;
					data.title = data.key;
					delete data.key;
					profile = profiles[nid] = profiles[nid] ? profiles[nid] : new debug.profile(id, data);
				} else {
					profile = profiles[id] || new debug.profile(id, data);
				}
				profile.group(data);
			} else {
				profile = profiles[id] || new debug.profile(id, data);
			}
			return profile;
		};

		debug.create = function (id, data) {
			var profile = profiles[id];
			if (!profile) profiles[id] = new debug.profile(id, data);
			return profiles[id];
		};

	};
	this.audio = {
		files: {},
		file: function (file, volume, autoplay) {
			var key = $.md5(file);
			var audio = Device.audio.files[key];
			if (!audio) {
				audio = new Audio(file);
				audio.volume = volume;
				if (autoplay) {
					audio.addEventListener('canplaythrough', function () {
						audio.play();
						Device.audio.files[key] = audio;
					}, false);
				}
			} else {
				audio.volume = volume;
				audio.play();
			}
			return audio;
		}
	};

	this.readyApp = function () {
		Agent.data.isapp = true;
		$('#suiBody').addClass('application');
	};

	this.framework = {
		name: 'SourceUI',
		longname: 'SourceUI Framework',
		version: 5,
		subversion: 1.8
	};

	this.Debug = new Debug();
	this.Debug.create('IndexDB', {
		mode: 'State',
		title: 'Index database engine state'
	});
	this.Global = new IDBGlobal();

};
