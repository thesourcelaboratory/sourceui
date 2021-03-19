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
	Wap.view = Wap.widget.closest('.sui-view');
	Wap.sector = Wap.view.closest('.sui-sector');
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
		var Heatmap, Stuffs = {};

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
		Wap.widget.on('polyline:add',function(event,cfg){
			var points = []
			if (cfg.pointgroup){
				var id = 'polyline:'+(cfg.id || $.md5(Object.keys(Stuffs).length+','+points.length+','+cfg.pointgroup[0].lat+','+cfg.pointgroup[0].lon));
				var polyline = new L.polyline(cfg.pointgroup,cfg).addTo(Map);
				if (cfg.popup) polyline.bindPopup(decodeURIComponent(cfg.popup));
				$.each(cfg.on || [], function(k,v){
					polyline.on(k,v);
				});
				Stuffs[id] = polyline;
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
			var fitpad = Wap.cfg.fitPadding || 20;
			var stuffkeys = Object.keys(Stuffs);
			var stuffvals = Object.values(Stuffs);
			var stf = stuffkeys.length;
			if (stf > 0){
				Map.fitBounds(L.featureGroup(stuffvals).getBounds(), {padding: [fitpad,fitpad], animate:false});
			} else if (Wap.cfg.lat && Wap.cfg.lon){
				Map.setView([Wap.cfg.lat, Wap.cfg.lon], Wap.cfg.zoom);
			} else {
				Toolbar.find('.center').addClass('disable');
			}
		});
		Wap.widget.on('widget:resize',function(){
			setTimeout(function(){
				Map.invalidateSize();
			},300);
		});
		Dom.window.on('resize',function(){
			setTimeout(function(){
				Map.invalidateSize();
			},100);
		});

		Wap.sector.on('sector:hide',function(){
			if (Heatmap) Map.removeLayer(Heatmap);
		});
		Wap.sector.on('sector:show',function(){
			Map.invalidateSize();
			setTimeout(function(){
				Heatmap = Leaf.heatmap(Wap.cfg.heatmap);
			},1000);
		});
		Wap.sector.on('sector:close',function(){
			Map.off();
			Map.remove();
		});

		Toolbar.on('click','.center:not(.disable)',function(event){
			event.stopPropagation();
			Wap.widget.trigger('map:fitstuffs');
		});

		$.each(Wap.cfg.markers || [], function(k,cfg){
			Wap.widget.trigger('marker:add',[cfg]);
		});

		$.each(Wap.cfg.polylines || [], function(k,cfg){
			Wap.widget.trigger('polyline:add',[cfg]);
		});

		if (Wap.cfg.heatmap){
			setTimeout(function(){
				Heatmap = Leaf.heatmap(Wap.cfg.heatmap);
			},100);
		}

		if (Wap.cfg.fitStuffs) Wap.widget.trigger('map:fitstuffs');
		if (Wap.cfg.grayScale) Wap.widget.addClass('grayscale');

	}
};
