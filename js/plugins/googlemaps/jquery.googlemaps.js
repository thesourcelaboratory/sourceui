'use strict';

(function () {

    $.googlemapsSetup = {
        zoom: 14,
        minzoom: 1,
        maxzoom: 18,
    };
    $.googlemapsStyles = {
        lightgray : [
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#f5f5f5"
                }
              ]
            },
            {
              "elementType": "labels.icon",
              "stylers": [
                {
                  "visibility": "off"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#f5f5f5"
                }
              ]
            },
            {
              "featureType": "administrative.land_parcel",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#bdbdbd"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#eeeeee"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e5e5e5"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#ffffff"
                }
              ]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#757575"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#dadada"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#616161"
                }
              ]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            },
            {
              "featureType": "transit.line",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#e5e5e5"
                }
              ]
            },
            {
              "featureType": "transit.station",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#eeeeee"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#c9c9c9"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9e9e9e"
                }
              ]
            }
          ]
    };

    $.googlemaps = function (e, s) {

        var Google = this;
        var Network = sourceui.instances.network;
        var Template = sourceui.templates.interface;
        var Device = sourceui.instances.device;
        var Debug = Device.Debug;
        var Interface = sourceui.interface;
        var Dom = Interface.dom;
        var Element = e;
        var Setup = $.extend(true, {}, $.googlemapsSetup, s || {}, Element.data());
        var Target;
        var Stuffs = this.stuffs = {};
        var JSONX = JSON5 || JSON;

        if (Element.is('.sui-field.map')) {
            Target = Element.find('.value .map');
        } else if (Element.is('.sui-widget.map')) {
            Target = Element.find('.area .map');
        } else {
            Target = Element;
        }

        Setup.id = Target.attr('id') || 'googlemaps' + $.md5(Math.rand() + '~' + Date.now()).substring(0, 16);
        Target.attr('id', Setup.id);

        Setup.center = new google.maps.LatLng(Setup.lat, Setup.lon);
        Setup.streetViewControl = Setup.streetView || false;
        Setup.mapTypeControl = Setup.mapTypes || false;
        if (Setup.mapstyle && $.googlemapsStyles[Setup.mapstyle]) Setup.styles = $.googlemapsStyles[Setup.mapstyle];

        var Map = this.map = new google.maps.Map(Target.get(0), Setup);
        Target.data('map',Map);

        this.icon = function (color) {
            //var iconurl = '../../../core/js/plugins/leaflet/markers/default-'+color+'.png';
            //var iconurl = 'https://cdn.jsdelivr.net/gh/thesourcelaboratory/sourceui/js/plugins/leaflet/markers/default-' + color + '.png';
            var iconurl = 'https://thesourcelaboratory.github.io/sourceui/js/plugins/leaflet/markers/default-' + color + '.png';
            //var iconurl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+color+'.png';
            return new L.Icon({
                iconUrl: iconurl,
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
        };
        this.toolbar = function (cfg) {
            var $toolbar;
            L.Control.Toolbar = L.Control.extend({
                onAdd: function (Map) {
                    $toolbar = $(L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom'));
                    $.each(cfg.tool || cfg.tools || cfg.buttons || [], function (kt, t) {
                        var data = [];
                        $.each(t.data || [], function (kd, d) {
                            data.push('data-' + kd + '="' + d + '"');
                        });
                        $.each(t.link || [], function (kd, d) {
                            data.push('data-link-' + kd + '="' + d + '"');
                        });
                        t.attr = t.attr || {};
                        t.class = t.class || {};
                        var $t = $('<a class="leaflet-control-tool ' + t.class.type + ' ' + (t.class.icon || '') + '" id="' + t.attr.id + '" ' + data.join(" ") + ' />');
                        $t.css({
                            width: t.width || '30px',
                            height: t.height || '30px',
                            lineHeight: t.height ? t.height - 2 : '28px',
                            background: t.background,
                            color: t.color
                        })
                        $toolbar.append($t);
                    });
                    return $toolbar.get(0);
                },
                onRemove: function (Map) {
                    // Nothing to do here
                }
            });
            L.control.toolbar = function (opts) {
                return new L.Control.Toolbar(opts);
            }
            L.control.toolbar($.extend({ position: 'bottomleft' }, cfg || {})).addTo(Map);
            return $toolbar;
        };
        this.heatmap = function (cfg) {
            var stp = {};
            if (Map && cfg.points && google.maps.visualization) {

                stp.map = Map;
                stp.data = [];

                $.each(cfg.points || [],function(k,v){
                    if (v.length === 3){
                        stp.data.push({
                            location: new google.maps.LatLng(v[0],v[1]),
                            weight: v[2]
                        })
                    } else {
                        stp.data.push(new google.maps.LatLng(v[0],v[1]));
                    }
                });

                if (cfg.options){
                    if (typeof cfg.options.gradient == 'string') cfg.options.gradient = JSONX.parse(cfg.options.gradient);
                    $.each(cfg.options.gradient || [],function(k,v){
                        stp.gradient = stp.gradient || [];
                        stp.gradient.push(v);
                    });
                    if (cfg.options.minOpacity) stp.opacity = Number(cfg.options.minOpacity) * 1.5;
                    if (cfg.options.radius) stp.radius = parseInt(cfg.options.radius) * 2;
                    if (cfg.options.maxIntensity) stp.maxIntensity = cfg.options.maxIntensity;
                    if (cfg.options.dissipating) stp.dissipating = cfg.options.dissipating;
                }

                                console.log(cfg,stp);

                var heat = new google.maps.visualization.HeatmapLayer(stp);

                //cfg.points = cfg.points.map(function (p) { return [p[0], p[1]]; });
                //if (cfg.options.gradient) cfg.options.gradient = JSON.parse(cfg.options.gradient);
                //var heat = L.heatLayer(cfg.points, cfg.options).addTo(Map);
            }
        };
        /*
        if (Tile) {
            var tileURL = Tile.tile
                .replace('{layerid}', Setup.layerid || Tile.layerid)
                .replace('{token}', Token || '');
            L.tileLayer(tileURL, {
                maxZoom: Setup.maxzoom,
                attribution: Tile.attribution,
                id: Setup.layerid || Tile.layerid,
            }).addTo(Map);
        }
        */
        return this;
    }

    $.fn.googlemaps = function (s, o) {
        var setup = s;
        var l;
        var r;
        this.each(function () {
            var $this = $(this);
            l = $this.data('googlemapsclass');
            if (typeof s == 'object') {
                if (!l) {
                    l = new $.googlemaps($this, setup);
                    $this.data('googlemapsclass', l);
                }
            } else if (typeof s == 'string') {
                if (typeof l[s] == 'function') {
                    r = l[s](o);
                }
            }
        });
        return r || l;
    }

})();
