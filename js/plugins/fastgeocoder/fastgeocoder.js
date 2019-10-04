var fastGeocoder = function(fgeoApi,fgeoApiKey){

    var fgeo = this;
    fgeo.api = {};

    this.providers = [
        'google',
        'locationiq',
        'here',
        'tomtom',
        'mapbox',
    ];

    var provuf = {
        'AC': 'Acre',
        'AL': 'Alagoas',
        'AM': 'Amazonas',
        'AP': 'Amapá',
        'BA': 'Bahia',
        'CE': 'Ceará',
        'DF': 'Distrito Federal',
        'ES': 'Espírito Santo',
        'GO': 'Goás',
        'MA': 'Maranhão',
        'MG': 'Minas Gerais',
        'MS': 'Mato Grosso do Sul',
        'MT': 'Mato Grosso',
        'PA': 'Pará',
        'PB': 'Paraíba',
        'PE': 'Pernambuco',
        'PI': 'Piauí',
        'PR': 'Paraná',
        'RJ': 'Rio de Janeiro',
        'RN': 'Rio Grande do Norte',
        'RO': 'Rondônia',
        'RR': 'Roráima',
        'RS': 'Rio Grande do Sul',
        'SC': 'Santa Catarina',
        'SE': 'Sergipe',
        'SP': 'São Paulo',
        'TO': 'Tocantins'
    };

    if (typeof fgeoApi == 'object' && !fgeoApiKey){
        fgeo.api = fgeoApi;
    } else if (typeof fgeoApi == 'string'){
        fgeo.api[fgeoApi] = fgeoApiKey;
    }

    var _getJSON = function(setup){
       $.ajax({
            method: setup.method || "GET",
            url: setup.url,
            data: setup.data,
            crossDomain: setup.crossDomain === false ? false : true,
            dataType: (setup.type == 'js' ? 'script' : setup.type) || 'json',
            cache: setup.cache === false ? false : true
        }).done(function (data, status, xhr) {
            if (setup.ondone) setup.ondone.call(setup.url, data, status, xhr);
        }).fail(function (xhr, status, error) {
            if (setup.onfail) setup.onfail.call(setup.url, error, status, xhr);
        }).always(function () {
            if (setup.onalways) setup.onalways.call(setup.url);
        });
    };

    var _normalizeQuery = function(query){
        var q = {};
        if (typeof query == 'object' && !query.normalized){
            q = {
                normalized: true,
                street: $.trim(query.street || query.addressname || query.logradouro || query.rua || ''),
                number: $.trim(query.number || query.streetnumber || query.numero || query.num || ''),
                block: $.trim(query.block || query.bairro || query.blockname || ''),
                city: $.trim(query.city || query.cidade || query.municipio || ''),
                state: $.trim(query.state || query.uf || query.estado || query.provincia || ''),
                zipcode: $.trim(query.zipcode || query.postalcode || query.cep || ''),
                country: $.trim(query.country || query.pais || ''),
                querystring: []
            };
            if (q.street){
                if (q.number) q.querystring.push(q.number);
                q.querystring.push(q.street);
            }
            if (q.city) q.querystring.push(q.city);
            if (q.state) q.querystring.push(q.state);
            if (q.zipcode) q.querystring.push(q.zipcode);
            if (q.country) q.querystring.push(q.country);
            if (q.querystring.length) q.querystring.join(', ')
        } else if (typeof query == 'object' && query.normalized){
            q = query;
        } else if (typeof query == 'string') {
            q = {
                normalized: true,
                querystring: query
            };
        }
        return q;
    };
    var _serialize = function(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&") || '';
    };

    this.google = {
        // -----------------------------------------------------------------
        getQS: function(query,options){
            options = $.extend({},options || {});
            options.address = query.querystring;
            options.key = fgeo.api.google;
            options.region = options.region || options.countrycodes || options.country || options.countrySet || null;
            return  _serialize(options);
        },
        // -----------------------------------------------------------------
        geocode: function(query,options,callback,failback){
            query = _normalizeQuery(query);
            if (!fgeo.api.google) return console.warn('A Google API key is required');
            if (typeof options == 'function'){ failback = callback; callback = options; options = {}; }
            _getJSON({
                url: 'https://maps.googleapis.com/maps/api/geocode/json?' + fgeo.google.getQS(query,options),
                ondone: function (pred) {
                    var results = pred.results;
                    if (results.length){
                        var geocode = results[0] && results[0].geometry ? results[0].geometry.location : [];
                        if (callback) callback.call(null, {lat: geocode.lat || null, lon: geocode.lng || null}, pred, 'Google');
                    } else {
                        if (failback) failback.call(null, pred.error_message || 'Google Geocode Error');
                        console.error('A Google API Error: '+(pred.error_message || 'Google Geocode Error'));
                    }
                },
                onfail: function (data) {
                    if (failback) failback.call(null, 'Google Geocode Fail');
                    console.error('Google Geocode Fail');
                },
            });
        },
        // -----------------------------------------------------------------
        getPlaces : function(query,options,callback,failback){
            query = _normalizeQuery(query);
            if (!fgeo.api.google) return console.warn('A Google API key is required');
            if (typeof options == 'function'){ failback = callback; callback = options; options = {}; }
            options.fields = 'formatted_address,name,geometry';
            options.inputtype = "textquery";
            options.input = query.querystring;
            _getJSON({
                url: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?' + fgeo.google.getQS(query,options),
                ondone: function (pred) {
                    var places = [];
                    var candidates = pred.candidates;
                    if (results.length){
                        for (i in candidates){
                            var place = {};
                            place.name = candidates[i].name || options.querystring;
                            if (candidates[i].formatted_address){
                                var addrA = candidates[i].formatted_address.split(',');
                                var addrB = addrA[1].split('-');
                                var addrC = addrA[2].split('-');
                                place.street = addrA[0] || null;
                                place.number = addrB[0] || null;
                                place.city = addrC[0] || null;
                                place.state = addrC[1] || null;
                                place.zipcode = addrA[3] || null;
                                place.country = addrA[4] || null;
                            }
                            if (candidates[i].geometry){
                                places.geocode = {
                                    lat: candidates[i].geometry.location.lat || null , lon: candidates[i].geometry.location.lng || null
                                };
                                places.viewport = {
                                    ne:{ lat: candidates[i].geometry.viewport.northeast.lat || null,  lon: candidates[i].geometry.viewport.northeast.lng || null},
                                    sw:{ lat: candidates[i].geometry.viewport.southwest.lat || null,  lon: candidates[i].geometry.viewport.southwest.lng || null}
                                }
                            }
                        }
                        if (callback) callback.call(null, places, pred, 'Google');
                    } else {
                        if (failback) failback.call(null, pred.error_message || 'Google Places Error');
                        console.error('A Google API Error: '+(pred.error_message || 'Google Places Error'));
                    }
                },
                onfail: function (data) {
                    if (failback) failback.call(null, 'Google Places Fail');
                    console.error('Google Places Fail');
                },
            });
        }
        // -----------------------------------------------------------------
    }
    this.locationiq = {
        // -----------------------------------------------------------------
        getQS: function(query,options){
            options = $.extend({},options || {});
            options.q = query.querystring;
            options.countrycodes = options.region || options.countrycodes || options.country || options.countrySet || null;
            options.key = fgeo.api.locationiq;
            options.format = 'json';
            options.addressdetails = 1;
            return  _serialize(options);
        },
        // -----------------------------------------------------------------
        geocode: function(query,options,callback,failback){
            query = _normalizeQuery(query);
            if (!fgeo.api.locationiq) console.warn('A LocationIQ API key is required');
            if (typeof options == 'function'){ failback = callback; callback = options; options = {}; }
            _getJSON({
                url: 'https://us1.locationiq.com/v1/search.php?'  + fgeo.locationiq.getQS(query,options),
                ondone: function (pred) {
                    if (pred && pred.length){
                        var geocode = pred[0] ? pred[0] : [];
                        if (callback) callback.call(null, {lat: parseFloat(geocode['lat']) || null, lon: parseFloat(geocode['lon']) || null}, pred, 'LocationIQ');
                    } else {
                        if (failback) failback.call(null, pred.error_message || 'LocationIQ Geocode Error');
                        console.error('A LocationIQ API Error: '+(pred.error_message || 'LocationIQ Geocode Error'));
                    }
                },
                onfail: function (data) {
                    if (failback) failback.call(null, 'LocationIQ Geocode Fail');
                    console.error('LocationIQ Geocode Fail');
                },
            });
        },
        // -----------------------------------------------------------------
        places: function(query,options,callback,failback){
        }
        // -----------------------------------------------------------------
    };
    this.here = {
        // -----------------------------------------------------------------
        getQS: function(query,options){
            options = $.extend({},options || {});
            options.country = options.region || options.countrycodes || options.country || options.countrySet || null;
            options.searchtext = query.querystring;
            options.app_id = fgeo.api.here.id;
            options.app_code = fgeo.api.here.code;
            return  _serialize(options);
        },
        // -----------------------------------------------------------------
        geocode: function(query,options,callback,failback){
            query = _normalizeQuery(query);
            if (!fgeo.api.here) console.warn('A Here API key is required');
            if (typeof options == 'function'){ failback = callback; callback = options; options = {}; }
            _getJSON({
                url: 'https://geocoder.api.here.com/6.2/geocode.json?'  + fgeo.here.getQS(query,options),
                ondone: function (pred) {
                    var result = (pred.Response && pred.Response.View && pred.Response.View[0]) ? pred.Response.View[0].Result : [];
                    if (result && result.length){
                        var location = result[0] ? result[0].Location : [];
                        if (callback) callback.call(null, {lat: location.DisplayPosition['Latitude'] || null, lon: location.DisplayPosition['Longitude'] || null}, pred, 'Here');
                    } else {
                        if (failback) failback.call(null, pred.error_message || 'Here Geocode Error');
                        console.error('A Here API Error: '+(pred.error_message || 'Here Geocode Error'));
                    }
                },
                onfail: function () {
                    if (failback) failback.call(null, 'Here Geocode Fail');
                    console.error('Here Geocode Fail: '+$(arguments[2].responseText).text());
                },
            });
        },
        // -----------------------------------------------------------------
        places: function(query,options,callback,failback){
        }
        // -----------------------------------------------------------------
    };
    this.tomtom = {
        // -----------------------------------------------------------------
        getQS: function(options){
            options = $.extend({},options || {});
            options.countrySet = options.region || options.countrycodes || options.country || options.countrySet || null;
            options.key = fgeo.api.tomtom;
            return  _serialize(options);
        },
        // -----------------------------------------------------------------
        geocode: function(query,options,callback,failback){
            if (!fgeo.api.tomtom) console.warn('A TomTom API key is required');
            if (typeof options == 'function'){ failback = callback; callback = options; options = {}; }
            _getJSON({
                url: 'https://api.tomtom.com/search/2/geocode/' + encodeURIComponent(_normalizeQuery(query).querystring) + '.json?' + fgeo.tomtom.getQS(options),
                ondone: function (pred) {
                    var results = pred.results;
                    if (results && results.length){
                        var geocode = results[0] ? results[0].position : [];
                        if (callback) callback.call(null, geocode, pred, 'TomTom');
                    } else {
                        if (failback) failback.call(null, pred.error_message || 'TomTom Geocode Error');
                        console.error('A TomTom API Error: '+(pred.error_message || 'TomTom Geocode Error'));
                    }
                },
                onfail: function (data) {
                    if (failback) failback.call(null, 'TomTom Geocode Fail');
                    console.error('TomTom Geocode Fail');
                },
            });
        },
        // -----------------------------------------------------------------
        places: function(query,options,callback,failback){
        }
        // -----------------------------------------------------------------
    };
    this.mapbox = {
        // -----------------------------------------------------------------
        getQS: function(options){
            options = $.extend({},options || {});
            options.country = options.region || options.countrycodes || options.country || options.countrySet || null;
            options.types = 'address';
            options.access_token = fgeo.api.mapbox;
            return  _serialize(options);
        },
        // -----------------------------------------------------------------
        geocode: function(query,options,callback,failback){
            if (!fgeo.api.mapbox) console.warn('A MapBox API key is required');
            if (typeof options == 'function'){ failback = callback; callback = options; options = {}; }
            _getJSON({
                url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(_normalizeQuery(query).querystring) + '.json?' + fgeo.mapbox.getQS(options),
                ondone: function (pred) {
                    var features = pred.features;
                    if (features && features.length){
                        var geocode = features[0] ? features[0].center : [];
                        if (callback) callback.call(null, {lat: geocode[1] || null, lon: geocode[0] || null}, pred, 'MapBox');
                    } else {
                        if (failback) failback.call(null, pred.error_message || 'MapBox Geocode Error');
                        console.error('A MapBox API Error: '+(pred.error_message || 'MapBox Geocode Error'));
                    }
                },
                onfail: function (data) {
                    if (failback) failback.call(null, 'MapBox Geocode Fail');
                    console.error('MapBox Geocode Fail');
                },
            });
        },
        // -----------------------------------------------------------------
        places: function(query,options,callback,failback){
        }
        // -----------------------------------------------------------------
    };


    this.geocode = function(query,options,callback,failback){
        var providers = fgeo.providers;
        if (typeof options == 'function'){
            failback = callback; callback = options; options = {};
        } else if (typeof options == 'object' && options.providers) {
            providers = options.providers;
        }
        console.log(providers);
        var idx = 0;
        function _geocode(provider,query,options,callback,failback){
            if (provider){
                if (fgeo.api[provider]){
                    fgeo[provider].geocode(query,options,callback,function(e){
                        idx++;
                        _geocode(providers[idx],query,options,callback,failback);
                    });
                } else {
                    idx++;
                    _geocode(providers[idx],query,options,callback,failback);
                }
            } else {
                if (failback) failback.call(null, 'All Services Failed');
            }
        }
        _geocode(providers[idx],query,options,callback,failback);
    }


    this.places = function(query,options,callback,failback){

    }

    return this;
}