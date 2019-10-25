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

sourceui.interface.widget.map = function($widget,setup){

	'use strict';

	var Wap = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;
	var JSONX = JSON5 || JSON;

	Wap.common = new Interface.widget.common($widget,setup);
	Wap.widget = $widget;
	Wap.code = Wap.widget.find('code[type="map"]').text();
	Wap.cfg = JSONX.parse(Wap.code);

	var Promises = {
		visible : function(){
			return new Promise(function(resolve, reject){
				if (!Wap.widget.is(':visible')){
					var readyinterval = setInterval(function(){
						if (Wap.widget.is(':visible')){
							resolve(true);
							clearInterval(readyinterval);
						}
					},1000);
				} else {
					resolve(true);
				}
			});
		}
	};

	Promises.visible().then(function(r){
		if (Wap.cfg.tile == 'google'){
			if (google && typeof google.maps == 'object'){
				Wap.cfg.api = 'google';
				if (Wap.cfg.layerid == 'mapbox.light'){
					Wap.cfg.mapstyle = 'lightgray';
				}
				delete Wap.cfg.layerid;
			} else if (typeof $.leaflet == 'function'){
				Wap.cfg.api = 'leaflet';
				Wap.cfg.tile = 'mapbox';
				Wap.cfg.layerid = 'mapbox.light';
			}
		} else {
			if (typeof $.leaflet == 'function'){
				Wap.cfg.api = 'leaflet';
			} else if (google && typeof google.maps == 'object'){
				Wap.cfg.api = 'google';
				Wap.cfg.tile = 'google';
				if (Wap.cfg.layerid == 'mapbox.light'){
					Wap.cfg.mapstyle = 'lightgray';
				}
				delete Wap.cfg.layerid;
			}
		}
		if (Wap.cfg.api == 'google') _initGoogleMaps();
		else if (Wap.cfg.api == 'leaflet') _initLeaflet();
		else console.error('No API loaded for maps widget');
	});

	function _initGoogleMaps(){
		var Google = Wap.widget.googlemaps(Wap.cfg);
		var Map = Google.map;
		var Toolbar, Heatmap, Stuffs = {};

		if (Wap.cfg.heatmap){
			Heatmap = Google.heatmap(Wap.cfg.heatmap);
		}
	}

	function _initLeaflet(){

		var Leaf = Wap.widget.leaflet(Wap.cfg);
		var Map = Leaf.map;
		var Toolbar, Heatmap, Stuffs = {};

		$.each(Wap.cfg.toolbars || [], function(k,cfg){
            Toolbar = Leaf.toolbar(cfg);
        });


		Wap.widget.on('marker:add',function(event,cfg){
			if (cfg.lat && cfg.lon){
				cfg.lat = parseFloat(cfg.lat).toFixed(6);
				cfg.lon = parseFloat(cfg.lon).toFixed(6);
				if (cfg.color) cfg.icon = Leaf.icon(cfg.color);
				var id = 'marker:'+(cfg.id || $.md5(Object.keys(Stuffs).length+','+cfg.lat+','+cfg.lon));
				var marker = L.marker([cfg.lat,cfg.lon],cfg).addTo(Map);
				if (cfg.popup) marker.bindPopup(decodeURIComponent(cfg.popup));
				$.each(cfg.on || [], function(k,v){
					marker.on(k,v);
				});
				Stuffs[id] = marker;
			}
		});
		Wap.widget.on('marker:remove',function(event,marker){
			if (typeof marker != 'object' && marker !== null) marker = Stuffs[marker] || Stuffs['marker:'+marker];
			if (marker){
				Map.removeLayer(marker);
				delete Stuffs[marker];
			}
		});
		Wap.widget.on('map:fitstuffs',function(event){
			var stuffkeys = Object.keys(Stuffs);
			var stuffvals = Object.values(Stuffs);
			var stf = stuffkeys.length;
			if (stf > 0){
				if (stf == 1){
					Map.setView(stuffvals[0].getLatLng(), Wap.cfg.zoom || 15);
				} else {
					Map.fitBounds(L.featureGroup(stuffvals).getBounds(), {padding: [20,20]});
				}
			}
		});

		Toolbar.on('click','.center',function(){
			Wap.widget.trigger('map:fitstuffs');
		});

		$.each(Wap.cfg.markers || [], function(k,cfg){
			Wap.widget.trigger('marker:add',[cfg]);
        });

		if (Wap.cfg.heatmap){
			Heatmap = Leaf.heatmap(Wap.cfg.heatmap);
		}

		if (Wap.cfg.fitStuffs) Wap.widget.trigger('map:fitstuffs');
		if (Wap.cfg.grayScale) Wap.widget.addClass('grayscale');

	}
};
