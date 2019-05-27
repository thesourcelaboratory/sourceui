'use strict';

(function () {

    $.leafletSetup = {
        tile: 'mapbox',
        zoom: 14,
        minzoom: 1,
        maxzoom: 18,
        tiles: {
            mapbox: {
                layerid: 'mapbox.streets',
                tile: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={token}',
                attribution: 'Map data &copy; <a href="https://www.mapbox.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            },
            mapsurfer: {
                tile: 'https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png',
                attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; ' +
                    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            osm: {
                tile: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    'Imagery © <a href="https://www.openstreetmap.com/">OpenStreetMap</a>'
            },
            cartodb: {
                layerid: 'light_all',
                tile: 'https://{s}.basemaps.cartocdn.com/{layerid}/{z}/{x}/{y}.png',
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    'Imagery © <a href="http://cartodb.com/attributions">CartoDB</a>'
            }
        },
    };

    $.leaflet = function (e, s) {

        var Leaflet = this;
        var Network = sourceui.instances.network;
        var Template = sourceui.templates.interface;
        var Device = sourceui.instances.device;
        var Debug = Device.Debug;
        var Interface = sourceui.interface;
        var Dom = Interface.dom;
        var Element = e;
        var Setup = $.extend(true, {}, $.leafletSetup, s || {}, Element.data());
        var Target;
        var Stuffs = this.stuffs = {};

        if (Element.is('.sui-field.map')) {
            Target = Element.find('.value .map');
        } else if (Element.is('.sui-widget.map')) {
            Target = Element.find('.area .map');
        } else {
            Target = Element;
        }

        Setup.id = Target.attr('id') || 'leafletmap' + $.md5(Math.rand() + '~' + Date.now()).substring(0, 16);
        Target.attr('id', Setup.id);

        var Tile = Setup.tiles[Setup.tile];
        var Token = Network.apikeys ? Network.apikeys[Setup.tile] : '';

        var Map = this.map = L.map(Setup.id, Setup);

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
            if (cfg.points && L.heatLayer) {
                //cfg.points = cfg.points.map(function (p) { return [p[0], p[1]]; });
                if (cfg.options.gradient) cfg.options.gradient = JSON.parse(cfg.options.gradient);
                var heat = L.heatLayer(cfg.points, cfg.options).addTo(Map);
            }
        };

        if (Setup.lat && Setup.lon) {
            Map.setView([Setup.lat, Setup.lon], Setup.zoom);
        } else {
            Map.setView([0, 0], Setup.minzoom);
        }
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

        return this;
    }

    $.fn.leaflet = function (s, o) {
        var setup = s;
        var l;
        var r;
        this.each(function () {
            var $this = $(this);
            l = $this.data('_leafletclass');
            if (typeof s == 'object') {
                if (!l) {
                    l = new $.leaflet($this, setup);
                    $this.data('_leafletclass', l);
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
