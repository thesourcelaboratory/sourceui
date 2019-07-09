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

	var Leaflet = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;
	var JSONX = JSON5 || JSON;

	Leaflet.common = new Interface.widget.common($widget,setup);
	Leaflet.widget = $widget;
	Leaflet.code = Leaflet.widget.find('code[type="map"]').text();
	Leaflet.cfg = JSONX.parse(Leaflet.code);

	var Promises = {
		visible : function(){
			return new Promise(function(resolve, reject){
				if (!Leaflet.widget.is(':visible')){
					var readyinterval = setInterval(function(){
						if (Leaflet.widget.is(':visible')){
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

		var Leaf = Leaflet.widget.leaflet(Leaflet.cfg);
		var Map = Leaf.map;
		var Toolbar, Heatmap, Stuffs = {};

		$.each(Leaflet.cfg.toolbars || [], function(k,cfg){
            Toolbar = Leaf.toolbar(cfg);
        });


		Leaflet.widget.on('marker:add',function(event,cfg){
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
		Leaflet.widget.on('marker:remove',function(event,marker){
			if (typeof marker != 'object' && marker !== null) marker = Stuffs[marker] || Stuffs['marker:'+marker];
			if (marker){
				Map.removeLayer(marker);
				delete Stuffs[marker];
			}
		});
		Leaflet.widget.on('map:fitstuffs',function(event){
			var stuffkeys = Object.keys(Stuffs);
			var stuffvals = Object.values(Stuffs);
			var stf = stuffkeys.length;
			if (stf > 0){
				if (stf == 1){
					Map.setView(stuffvals[0].getLatLng(), Leaflet.cfg.zoom || 15);
				} else {
					Map.fitBounds(L.featureGroup(stuffvals).getBounds(), {padding: [20,20]});
				}
			}
		});

		//console.log(Leaflet.cfg);

		Toolbar.on('click','.center',function(){
			Leaflet.widget.trigger('map:fitstuffs');
		});

		$.each(Leaflet.cfg.markers || [], function(k,cfg){
			Leaflet.widget.trigger('marker:add',[cfg]);
        });

		if (Leaflet.cfg.heatmap){
			Heatmap = Leaf.heatmap(Leaflet.cfg.heatmap);
		}

		if (Leaflet.cfg.fitStuffs) Leaflet.widget.trigger('map:fitstuffs');
		if (Leaflet.cfg.grayScale) Leaflet.widget.addClass('grayscale');

	});
};
