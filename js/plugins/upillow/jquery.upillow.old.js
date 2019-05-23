$.hashCode = $.hashCode || function(str) {
    str = $.type('str') == 'object' ? JSON.stringify(str) : str;
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
};

$.formatBytes = $.formatBytes || function(bytes,decimals){
   if(bytes === 0) return '0 Byte';
   var k = 1000;
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
};
$.formatSpeed = $.formatSpeed || function(bytes,decimals){
   if(bytes === 0) return '0 bps';
   var k = 1000;
   var dm = decimals + 1 || 3;
   var sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
};

$.upillowSetup = {
    url:null,
    acceptTypes:[],
    fileSizeLimit: '2M',
    fileQueueLimit: 10,
    fileParallelLimit: 4,
    autoUploadOnSelect: false,
    requestHeaders: {},
    dashboard:{
        totalFilesOnQueue:true,
        totalSizeOnQueue:true,
        totalSizeSent:true,
        uploadSpeed:true,
        uploadProgress:true,
    },
    on: {
        filequeue:null,
        filebeforeupload:null,
        fileprogress:null,
        filedone:null,
        fileerror:null,
        ready:null,
        beforeupload:null,
        progress:null,
        done:null,
        error:null,
    },
    corsAllowed: false,
}
$.upillow = function(Input,setup){

    var Upillow = this;
    var Setup = $.extend(true,$.upillowSetup,setup||{},Input.data());

    var Template = {
        container: '<div class="file-upillow">'+
            '<div class="data"></div>'+
            '<ul class="filelist">'+
                '<li class="empty">'+
                    '<div class="icon">'+
                        '<i class="icon-arrow-up"></i>'+
                    '</div>'+
                    '<div class="info">'+
                        '<div class="title">Não há arquivos para subir. <a>Clique aqui</a> para selecionar.</div>'+
                        '<div class="rules">Você pode subir até <u>10 imagens</u> por vez. Cada <span>imagem</span> deve ter no máximo <u>20M</u>.</div>'+
                    '</div>'+
                '</li>'+
            '</ul>'+
            '<div class="status"></div>'+
            '<ul class="actions">'+
                '<li><a class="add icon-plus-circle">Adicionar</a></li>'+
                '<li><a class="upload icon-arrow-up">Upload</a></li>'+
                '<li><a class="stop icon-stop2">Parar</a></li>'+
                '<li><a class="delete icon-delete3">Limpar</a></li>'+
            '</ul>'+
        '</div>',

        dashboard: '<div class="dashboard">'+
            '<div class="qtde"><span>0</span></div>'+
            '<div class="total"><small>Total</small><span>- -</span></div>'+
            '<div class="sent"><small>Enviado</small><span>- -</span></div>'+
            '<div class="speed"><small>Velocidade</small><span>- -</span></div>'+
            '<div class="percent"><span>- -</span></div>'+
        '</div>',

        file: '<li class="file" data-name="name.file">'+
            '<div class="icon">'+
                '<i class="fsi m"><b></b></i>'+
            '</div>'+
            '<div class="info">'+
                '<div class="label">'+
                    '<div class="name"></div>'+
                    '<div class="data">'+
                        '<div class="status"></div>'+
                        '<div class="size"></div>'+
                    '</div>'+
                '</div>'+
                '<div class="progress"><div class="bar"></div></div>'+
            '</div>'+
            '<div class="buttons">'+
                '<a class="upload icon-arrow-up"></a>'+
                '<a class="stop icon-stop2"></a>'+
                '<a class="delete icon-delete3"></a>'+
            '</div>'+
        '</li>'
    }

    var Element = $(Template.container);

    Upillow.build = function(){
        if (Input.data('upillow')) Upillow.destroy();
        var $data = Element.children('.data');
        var $input = Input.clone();
        var acceptObj = Setup.acceptTypes ? Setup.acceptTypes.map(function(str){ return str ? $.trim(str.replace(/[^a-zA-Z0-9\.\-\/]/g,'')) : ''; }) : [];
        var acceptAttr = Input.attr('accept') ? Input.attr('accept').split(',').map(function(str){ return  str ? $.trim(str.replace(/[^a-zA-Z0-9\.\-\/]/g,'')) : ''; }) : [];
        Setup.acceptTypes = $.extend(true,acceptObj,acceptAttr).map(function(str){ return str.length > 0 && str.length < 5 && str.indexOf('.') === -1 ? '.'+str : str; });
        $input.attr('accept',Setup.acceptTypes.join(', '));
        Setup.multiple = typeof Setup.multiple !== 'undefined' ? Setup.multiple : Input.prop('multiple');
        $input.prop('multiple',Setup.multiple?true:false);
        $data.append($input);
        if (Setup.dashboard){
            var $dashboard = $(Template.dashboard);
            if (Setup.totalFilesOnQueue) $dashboard.find('.qtde').remove();
            if (Setup.totalSizeOnQueue) $dashboard.find('.total').remove();
            if (Setup.totalSizeSent) $dashboard.find('.sent').remove();
            if (Setup.uploadSpeed) $dashboard.find('.speed').remove();
            if (Setup.uploadProgress) $dashboard.find('.percent').remove();
            $data.after($dashboard);
        }
        Input.replaceWith(Element);
    };
    Upillow.build();

    var Dom = {};
    Dom.onlist = $();
    Dom.data = Element.children('.data');
    Dom.dashboard = Element.children('.dashboard');
    Dom.filelist = Element.children('.filelist');
    Dom.status = Element.children('.status');
    Dom.actions = Element.children('.actions');
    Dom.input = Dom.data.find('input[type="file"]').clone();
    Dom.button = {
        add: Dom.actions.find('.add'),
        upload: Dom.actions.find('.upload'),
        stop: Dom.actions.find('.stop'),
        delete: Dom.actions.find('.delete')
    };
    Dom.dash = {
        qtde: Dom.dashboard.find('.qtde span'),
        total: Dom.dashboard.find('.total span'),
        sent: Dom.dashboard.find('.sent span'),
        speed: Dom.dashboard.find('.speed span'),
        percent: Dom.dashboard.find('.percent span')
    };
    Dom.dashUpdate = function(){
        if (Setup.dashboard){
            if (Setup.dashboard.totalFilesOnQueue) Dom.dash.qtde.text(Stat.qtde);
            if (Setup.dashboard.totalSizeOnQueue) Dom.dash.total.text(Stat.total !== null ? $.formatBytes(Stat.total) : '- -');
            if (Setup.dashboard.totalSizeSent) Dom.dash.sent.text(Stat.sent !== null ? $.formatBytes(Stat.sent) : '- -');
            if (Setup.dashboard.uploadSpeed) Dom.dash.speed.text(Stat.speed !== null ? $.formatSpeed(Stat.speed) : '- -' );
            if (Setup.dashboard.uploadProgress) Dom.dash.percent.text(Stat.percent !== null ? Math.floor(Stat.percent)+'%' : '- -');
        }
    };

    var Stat = {
        qtde:null, total:null, sent:null, speed:null, percent:null, initime:null,
        interval: 0,
        init: function(){
            Stat.sent = 0;
            Stat.speed = 0;
            Stat.percent = 0;
            Stat.initime = (new Date()).getTime();
        },
        calc: function(){
            Stat.qtde = Dom.onlist.length;
            if (Stat.sent === null) return;
            var p = 0, l = 0, s = 0;
            Dom.onlist.each(function(){
                l += $(this).data('ldd')||0;
            });
            Stat.sent = l;
            s = Stat.initime !== null ? (Stat.sent / (((new Date()).getTime() - Stat.initime) / 1000)) : 0;
            Stat.speed = isNaN(s) ? 0 : s;
            p = (Stat.sent / Stat.total) * 100;
            Stat.percent = p >= 100 ? 100 : p;
        },
        clear: function(){
            Stat.sent = null;
            Stat.speed = null;
            Stat.percent = null;
            Stat.initime = null;
        }
    };

    Element.on('status',function(event,status){
        Dom.status.text(status);
    });
    Element.on('error',function(event,error){
        Element.addClass('error');
        Dom.status.text(error);
    });
    Element.on('change','input[type="file"]',function(event){
        Element.trigger('queue',[this.files]);
    });
    Element.on('interval',function(){
        clearInterval(Stat.interval);
        Stat.interval = setInterval(function(){
            Element.trigger('progress');
        },500);
        Element.trigger('progress');
    });
    Element.on('progress',function(event){
        Stat.calc();
        Dom.dashUpdate();
    });
    Element.on('queue',function(event,files){
        Dom.filelist.children('.done, .complete').trigger('file:delete');
        if (Element.is('.complete, .error, .done')){
			Element.trigger('queue:clear');
		}
        if (files.length){
			if (Element.hasClass('queue')){
				Element.removeClass('done');
				Element.removeClass('error');
			}
			Element.addClass('ready');
			$.each(files||[],function(k,v){
				var id = 'file'+$.hashCode(v.name+v.size);
                var $exists = Dom.filelist.children('#'+id);
                if (!$exists.length){
					var st = (Setup.fileSizeLimit && Setup.fileSizeLimit < v.size) ? 'error' : 'queue';
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
					var File = $(Template.file);
                    File.attr('id',id);
                    File.attr('data-name',data.name);
                    File.find('.icon .fsi').addClass(data.ext).find('b').text(data.ext);
                    File.find('.info .name').text(data.name);
                    File.find('.info .size').text(data.bytes);
					Dom.filelist.prepend(File);
					if (st == 'queue'){
						Dom.onlist = Dom.onlist.add(File);
						File.data('data',data).data('file',v);
						Element.trigger('add',[File]);
					} else {
						File.trigger('file:error',['O arquivo é muito grande.']);
					}
				}
			});
            Element.trigger('progress');
            Element.trigger('status','Pronto para upload');
		}
    });
    Element.on('add',function(event,File){
        var fda = File.data('data');
        File.data('pct',0);
        File.on('file:prepare',function(event,ignore){
            if (!Setup.url){
                File.trigger('file:error',['Setup "url" é obrigatóro para realizar uploads.']);
                return false;
            }
            File.removeClass('queue error done').addClass('prepare');
            var collection = {
                totalSize:0,
                fileList:{}
            };
            var data = File.data('data');
            var id = data.id;
            if (data){
                collection.fileList[id] = data;
                collection.totalSize += data.size;
            }
            var data = {
                url: Setup.url,
                data: Setup.data,
                acceptTypes: Setup.acceptTypes,
                fileSizeLimit: Setup.fileSizeLimit,
                collection:collection
            };
            var netup = new $.fileUpload(data);
            netup.on('test:error',function(r,e){
                if ($.trim(r).indexOf('{') === 0){
                    var json = JSON.parse(r);
                    File.trigger('file:error',[json[id]]);
                }
                File.removeClass('prepare');
            });
            netup.on('test:done',function(r){
                File.removeClass('prepare');
                Element.trigger('file:upload');
            });
            netup.test();
            File.trigger('file:status','Testando arquivo...');
        })
        File.on('file:upload',function(event,ignore){
			var data = {
                url: Setup.url,
                data: Setup.data,
                acceptTypes: Setup.acceptTypes,
                fileSizeLimit: Setup.fileSizeLimit,
                file : File.data('file'),
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
			};
			var netup = new $.fileUpload(data);
			netup.on('uploading',function(p,l,t){
				if (p < 0 || !p) p = 0;
				else if (p > 100) p = 100;
				File.find('.progress .bar').css({width:p+'%'});
				File.data('pct',p);
				File.data('ldd',l);
			});
			netup.on('abort',function(){
				File.find('.progress .bar').css({width:0});
				File.data('pct',0);
				File.data('ldd',0);
                File.trigger('file:status',['Cancelado!']);
			});
			netup.on('error',function(error){
				File.removeClass('ready process').addClass('error');
				File.data('pct',100);
				File.data('ldd',0);
				File.trigger('file:error',['Erro: '+error]);
				File.trigger('file:fail');
			});
			netup.on('complete',function(t){
				File.removeClass('ready process').addClass('done');
				File.data('pct',100).data('ldd',t).removeData('data').removeData('file');
                File.trigger('file:status',['Concluído!']);
                File.trigger('file:complete');
			});
			netup.start();
			File.data('netup',netup);
			File.switchClass('ready','process');
            File.trigger('file:status',['Fazendo upload...']);
            Element.removeClass('ready').addClass('process');
            Element.trigger('status','Fazendo upload de arquivos...');
            if (!ignore){
                if (!Stat.sent) Stat.init();
                Element.trigger('interval');
            }
		});
		File.on('file:delete',function(event,ignore){
            File.trigger('file:stop');
            if (!File.is('.error')){
                Stat.total -= fda.size;
            }
            File.remove();
            Dom.onlist = Dom.onlist.not(File[0]);
            if (!ignore && !Dom.onlist.length){
                Element.trigger('stop',[true]);
                Element.trigger('delete',[true]);
            }
            Element.trigger('progress');
		});
        File.on('file:stop',function(event,ignore){
            File.removeClass('error process').addClass('ready');
            var netup = File.data('netup');
            if (netup && netup.state() === 1){
                netup.stop();
                File.trigger('file:status',['Upload cancelado.']);
                if (!ignore && !Dom.onlist.filter('.process').length){
                    console.log(Dom.onlist.filter('.process'));
                    Element.trigger('stop',[true]);
                }
            }
            Element.trigger('progress');
        });
        File.on('file:fail',function(){
			if (!File.is('.error')){
				File.removeClass('ready').addClass('error');
				File.removeData('data').removeData('file');
				Stat.total -= fda.size;
			}
            Element.trigger('progress');
		});
        File.on('file:complete',function(){
            if (!Dom.onlist.filter('.process .ready').length){
                Element.trigger('complete');
            }
            Element.trigger('progress');
		});
		Stat.total += fda.size;
        File.addClass('ready');
        File.trigger('file:status',['Pronto para subir']);
    });
    Element.on('prepare',function(event){
        if (!Setup.url){
            Element.trigger('error',['Setup "url" é obrigatóro para realizar uploads.']);
            return false;
        }
        Element.removeClass('queue error done').addClass('prepare');
        var collection = {
            totalSize:0,
            fileList:{}
        };
        Dom.onlist.each(function(){
            var $file = $(this);
            var data = $file.data('data');
            var id = data.id;
            if (data){
                collection.fileList[id] = data;
                collection.totalSize += data.size;
            }
        });
        var data = {
            url: Setup.url,
            data: Setup.data,
            acceptTypes: Setup.acceptTypes,
            fileSizeLimit: Setup.fileSizeLimit,
            collection:collection
        };
        var netup = new $.fileUpload(data);
        netup.on('test:error',function(r,e){
            if ($.trim(r).indexOf('{') === 0){
                var json = JSON.parse(r);
                $.each(json||[],function(k,v){
                    if (collection.fileList[k]){
                        var $file = Dom.onlist.filter('#'+k);
                        $file.trigger('file:error',[v]);
                    }
                });
            }
            Element.removeClass('prepare');
            Element.trigger('error',['Erro no servidor: '+e]);
        });
        netup.on('test:done',function(r){
            Element.removeClass('prepare');
            Element.trigger('start');
        });
        netup.test();
        Element.trigger('status','Testando servidor...');
    });
    Element.on('start',function(event){
        Dom.onlist.each(function(){
            var File = $(this);
            if (File.data('file')){
                var netup = File.data('netup');
                if (!netup || netup.state() === 0) File.trigger('file:upload',[true]);
            } else {
                Dom.onlist = Dom.onlist.not(File[0]);
            }
        });
        if (Dom.onlist.length){
            Stat.clear();
            Stat.init();
            Element.trigger('interval');
            Element.removeClass('error complete ready').addClass('process');
        } else {
            Element.trigger('error',['Nenhum dos arquivos da lista está apto para ser recebido pelo servidor']);
        }
        Element.trigger('status','Fazendo upload de arquivos...');
    });
    Element.on('complete',function(event){
        clearInterval(Stat.interval);
        Element.removeClass('process ready').addClass('complete');
        Element.trigger('status','Concluído!');
        Element.trigger('progress');
    });
    Element.on('delete',function(event,ignore){
        if (!ignore){
            Dom.onlist.each(function(){
                 $(this).trigger('file:delete',[true]);
            });
        }
        Stat.clear();
        clearInterval(Stat.interval);
        Element.removeClass('error process complete ready');
        Element.trigger('status','');
        Element.trigger('progress');
    });
    Element.on('stop',function(event,ignore){
        if (!ignore){
            Dom.onlist.each(function(){
                 $(this).trigger('file:stop',[true]);
            });
        }
        Stat.clear();
        clearInterval(Stat.interval);
        Element.removeClass('error process complete').addClass('ready');
        Element.trigger('status','Os uploads foram canelados.');
        Element.trigger('progress');
    });


    Dom.filelist.on('file:error','.file',function(event,error){
        var File = $(this);
        File.addClass('error').find('.status').text(error);
    });
    Dom.filelist.on('file:status','.file',function(event,status){
        var File = $(this);
        File.find('.status').text(status);
    });
    Dom.filelist.on('click','a.upload',function(event){
        var File = $(this);
        File.trigger('file:prepare');
    });
    Dom.filelist.on('click','a.stop',function(event){
        var File = $(this);
        File.trigger('file:stop');
    });
    Dom.filelist.on('click','a.delete',function(event){
        var File = $(this);
        File.trigger('file:delete');
    });


    Dom.button.add.on('click',function(){
        Dom.data.find('input[type="file"]').remove();
        Dom.input.clone().appendTo(Dom.data).click();
    });
    Dom.button.upload.on('click',function(){
        Element.trigger('prepare');
    });
    Dom.button.stop.on('click',function(){
        Element.trigger('stop');
    });
    Dom.button.delete.on('click',function(){
        Element.trigger('delete');
    });
    Dom.filelist.find('.empty .title a').on('click',function(){
        Dom.button.add.click();
    });
}

$.fileUpload = function(setup){

    var Upload = this;
    var Events = {};
    var config = {};
    var formdata = [];
    var fdx = 0;
    var ajax;
    var status = {state:0, loaded:0};

    if (setup.collection) {
        setup.precheck = 'test';
    }

    var Methods = {
        send : function(fdata){
            if (setup.corsAllowed){
                config.crossDomain = true;
                config.xhrFields = {
                    withCredentials: true
                };
            }
            config.url = setup.url;
            config.type = 'post';
            config.cache = false;
            if (fdata){
                config.processData = false;
                config.contentType = false;
                $.each(setup.data||[],function(k,v){ fdata.append(k,v); });
                config.data = fdata;
            } else {
                config.data = setup;
            }
            config.xhr = function(){
                var xhr = $.ajaxSettings.xhr();
                xhr.addEventListener('readystatechange', function (event) {
                    Upload.trigger('readystatechange',[event]);
                }, false);
                xhr.upload.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        Upload.trigger('progress',[event]);
                    }
                }, false);
                return xhr;
            };
            config.beforeSend = function(xhr){
                setup.requestHeader = setup.requestHeader || {};
                $.each(setup.requestHeader,function(k,v){
                    xhr.setRequestHeader(k, v);
                });
                setup.requestKey = $.md5(JSON.stringify(setup.requestHeader));
                xhr.setRequestHeader('X-Upillow-Request-Key', setup.requestKey);
                Upload.trigger('beforeSend',[xhr]);
            };
            return $.ajax(config)
                .done(function(data,status,xhr){
                    setup.response = {
                        xhr : xhr,
                        key : setup.requestKey,
                        headers: xhr.getAllResponseHeaders(),
                        responseLength : data.length,
                        textData : data,
                        status : status,
                    };
                    if (fdata || setup.precheck) Upload.trigger('done',[data,status,xhr]);
                })
                .fail(function(xhr,status,error){
                    if (status == 'abort'){
                        Upload.trigger('abort',[xhr,status,error]);
                        return;
                    } else if (status == 'canceled'){
                        Upload.trigger('canceled',[xhr,status,error]);
                        return;
                    }
                    setup.response = {
                        error : error,
                        xhr : xhr,
                        key : setup.requestKey,
                        headers: xhr.getAllResponseHeaders(),
                        textData : xhr.responseText,
                        responseLength : xhr.responseText.length,
                        status : status,
                    };
                    Upload.trigger('fail',[xhr,status,error]);
                })
                .always(function(data,status,xhr){
                    Upload.trigger('aways',[data,status,xhr]);
                });
        }
    };

    this.on = function(event,callback){
        Events[event] = Events[event] || [];
        Events[event].push(callback);
    };
    this.trigger = function(event,args){
        $.each(Events[event]||[], function(k,v){
            if (typeof v == 'function'){
                v.apply(null,args);
            }
        });
    };
    this.resume = function(){
        status.state = 1;
        if (formdata[fdx] || setup.precheck) ajax = Methods.send(formdata[fdx]);
        Upload.trigger('resume',[]);
    };
    this.test = function(){
        setup.process = 'upload';
        setup.precheck = 'test';
        Upload.resume();
        Upload.on('done',function(str,status,xhr){
            status.state = 2;
            Upload.trigger('test:done',[str,status,xhr]);
        });
        Upload.on('fail',function(xhr,status,error){
            Upload.trigger('test:error',[xhr.responseText,error,xhr]);
        });
    };
    this.start = function(){
        setup.process = 'upload';
        var fdata = new FormData();
        fdata.append('file',setup.file);
        formdata.push(fdata);
        Upload.resume();
        Upload.on('progress',function(event){
            setup.total = event.total;
            Upload.trigger('uploading',[event.loaded * 100 / event.total, event.loaded||0, event.total||0]);
        });
        Upload.on('done',function(){
            status.state = 2;
            Upload.trigger('complete',[setup.total]);
        });
        Upload.on('fail',function(xhr,status,error){
            Upload.trigger('error',[error]);
        });
    }
    this.stop = function(){
        if (ajax) ajax.abort();
        status.state = 0;
    }
    this.state = function(){
        return status.state;
    }
};

$.ajaxTransport("+binary", function(options, originalOptions, jqXHR) {
	if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
		return {
			send: function(headers, callback) {
				var xhr = new XMLHttpRequest(),
					url = options.url,
					type = options.type,
					async = options.async || true,
					dataType = options.responseType || "blob",
					data = options.data || null,
					username = options.username || null,
					password = options.password || null;

				xhr.addEventListener('load', function() {
					var data = {};
					data[options.dataType] = xhr.response;
					callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
				});
				xhr.open(type, url, async, username, password);
				for (var i in headers) {
					xhr.setRequestHeader(i, headers[i]);
				}
				xhr.responseType = dataType;
				xhr.send(data);
			},
			abort: function() {}
		};
	}
});


$.fn.upillow = function(s){
    var setup = s;
    this.each(function(){
        var $this = $(this);
        var upillow = new $.upillow($this,setup);
        $this.data('upillow',upillow);
    })
}
