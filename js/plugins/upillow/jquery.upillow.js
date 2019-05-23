'use strict';

(function () {

    $.upillowSetup = {
        url:null,
        multiple:false,
        corsAllowed: false,
        acceptTypes: [],
        fileSizeLimit: '2M',
        fileQueueLimit: 20,
        fileParallelLimit: 4,
        autoUploadOnQueue: null,
        requestHeaders: {},
        dashboard:{
            totalFilesOnQueue:true,
            totalSizeOnQueue:true,
            totalSizeSent:true,
            uploadSpeed:true,
            uploadProgress:true,
        },
        statusBar:true,
        on: {}
    }

    var upillow = function(Input,setup){

        var Upillow = this;
        var Setup = $.extend(true,{},$.upillowSetup,setup||{},Input.data());
        Setup.url = Setup.url||(Setup.link?Setup.link.sui||null:null)||null;

        var Template = {
            container: '<div class="file-upillow '+(Setup.multiple ? 'multiple' : 'single')+'">'+
                '<div class="data"></div>'+
                '<ul class="filelist">'+
                    '<li class="empty">'+
                        '<div class="icon">'+
                            '<i class="icon-arrow-up"></i>'+
                        '</div>'+
                        '<div class="info">'+
                            '<div class="title">Não há arquivos para subir. <a>Clique aqui</a> para selecionar.</div>'+
                            '<div class="rules">'+(Setup.multiple ? 'Você pode subir no máximo <u>'+Setup.fileQueueLimit+' arquivos</u> por vez.' : 'Você deve subir <u>um arquivo</u> por vez. ')+' Cada arquivo deve ter no máximo <u>'+Setup.fileSizeLimit+'</u>.</div>'+
                        '</div>'+
                        '<div class="select">'+
                            '<a class="btn queue icon-cursor">Selecionar</a>'+
                        '</div>'+
                    '</li>'+
                '</ul>'+
                '<div class="status"></div>'+
                '<ul class="actions">'+
                    '<li><a class="btn queue icon-plus-circle">Adicionar</a></li>'+
                    '<li><a class="btn upload icon-arrow-up">Upload</a></li>'+
                    '<li><a class="btn cancel icon-stop2">Parar</a></li>'+
                    '<li><a class="btn delete icon-delete3">Limpar</a></li>'+
                '</ul>'+
            '</div>',

            dashboard: '<div class="dashboard">'+
                '<div class="count"><span>0</span></div>'+
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
                    '<a class="cancel icon-stop2"></a>'+
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
                if (Setup.dashboard === true) Setup.dashboard = $.upillowSetup.dashboard;
                else {
                    if (!Setup.dashboard.totalFilesOnQueue) $dashboard.find('.count').remove();
                    if (!Setup.dashboard.totalSizeOnQueue) $dashboard.find('.total').remove();
                    if (!Setup.dashboard.totalSizeSent) $dashboard.find('.sent').remove();
                    if (!Setup.dashboard.uploadSpeed) $dashboard.find('.speed').remove();
                    if (!Setup.dashboard.uploadProgress) $dashboard.find('.percent').remove();
                }
                $data.after($dashboard);
            }
            Input.replaceWith(Element);
        };
        Upillow.build();

        var Dom = {};
        Dom.data = Element.children('.data');
        Dom.dashboard = Element.children('.dashboard');
        Dom.filelist = Element.children('.filelist');
        Dom.status = Element.children('.status');
        Dom.actions = Element.children('.actions');
        Dom.input = Dom.data.find('input[type="file"]').clone();
        Dom.button = {
            queue: Dom.actions.find('.queue'),
            upload: Dom.actions.find('.upload'),
            cancel: Dom.actions.find('.cancel'),
            delete: Dom.actions.find('.delete')
        };
        Dom.dash = {
            count: Dom.dashboard.find('.count span'),
            total: Dom.dashboard.find('.total span'),
            sent: Dom.dashboard.find('.sent span'),
            speed: Dom.dashboard.find('.speed span'),
            percent: Dom.dashboard.find('.percent span')
        };
        Dom.dashUpdate = function(){
            if (Setup.dashboard){
                if (Setup.dashboard.totalFilesOnQueue) Dom.dash.count.text(Stat.count);
                if (Setup.dashboard.totalSizeOnQueue) Dom.dash.total.text(Stat.total !== null ? $.formatBytes(Stat.total) : '- -');
                if (Setup.dashboard.totalSizeSent) Dom.dash.sent.text(Stat.sent !== null ? $.formatBytes(Stat.sent) : '- -');
                if (Setup.dashboard.uploadSpeed) Dom.dash.speed.text(Stat.speed !== null ? $.formatSpeed(Stat.speed) : '- -' );
                if (Setup.dashboard.uploadProgress) Dom.dash.percent.text(Stat.percent !== null ? Math.floor(Stat.percent)+'%' : '- -');
            }
        };

        var Stat = {
            count:null, total:null, sent:null, speed:null, percent:null, initime:null,
            interval: 0,
            data: function(){
                return {
                    count: Stat.count,
                    total: Stat.total,
                    sent: Stat.sent,
                    speed: Stat.speed,
                    percent: Stat.percent,
                    initime: Stat.initime
                };
            },
            init: function(){
                Stat.sent = 0;
                Stat.speed = 0;
                Stat.percent = 0;
                Stat.initime = (new Date()).getTime();
            },
            calc: function(){
                var $list = Dom.filelist.find('.file').not('.error');
                Stat.count = $list.length;
                if (Stat.sent === null) return;
                var p = 0, l = 0, s = 0;
                $list.each(function(){
                    var id = this.id;
                    var list = List[id];
                    l += list.ldd||0;
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

        var List = {};

        var File = {
            status: function($file,status){
                $file.removeClass('error').find('.status').text(status);
            },
            error: function($file,error,res){
                var id = $file.attr('id');
                var list = List[id];
                var err = ($.type(error) == 'object') ? error.detail||error.desc : error
                $file.addClass('error').find('.status').text(err);
                Component.callback('fileerror', err, res, list.data);
            },
            queue: function($file){
                var id = $file.attr('id');
                var list = List[id];
                list.pct = 0;
                //$file.data('pct',0);
                Stat.total += list.data.size;
                $file.addClass('ready');
                File.status($file,'Pronto para subir');
                Component.callback('filequeue', list.data, Stat.data());
            },
            prepare: function($file){
                var id = $file.attr('id');
                var list = List[id];
                if (list.valid){
                    File.upload($file);
                    return true;
                }
                if (!Setup.url){
                    File.error($file,'Setup "url" é obrigatóro para realizar uploads.');
                    return false;
                }
                $file.removeClass('queue error done').addClass('prepare');
                var collection = { totalSize:0, fileList: {} };
                var id = list.data.id;
                collection.fileList[id] = list.data;
                collection.totalSize += list.data.size;
                var data = {
                    url: Setup.url,
                    data: Setup.data,
                    acceptTypes: Setup.acceptTypes,
                    fileSizeLimit: Setup.fileSizeLimit,
                    collection:collection
                };
                list.netup.on('test:error',function(r,e){
                    if ($.trim(r).indexOf('{') === 0){
                        var json = JSON.parse(r);
                        File.error($file,json[id]);
                        List[id].valid = false;
                    }
                    $file.removeClass('prepare');
                });
                list.netup.on('test:done',function(r){
                    if ($.trim(r).indexOf('{') === 0){
                        var json = JSON.parse(r);
                        File.status($file,json[id]);
                    }
                    List[id].valid = true;
                    $file.removeClass('prepare');
                    File.upload($file);
                });
                list.netup.test(data);
                File.status($file,'Verificando arquivo...');
                Component.callback('fileprepare', list.data, Stat.data());
            },
            upload: function($file,ignore){
                var id = $file.attr('id');
                var list = List[id];
                if (list.valid !== true){
                    File.error($file,'O arquivo não foi validado pelo servidor.');
                    return false;
                }
                var data = {
                    url: Setup.url,
                    data: Setup.data||{},
                    acceptTypes: Setup.acceptTypes,
                    requestHeaders: Setup.requestHeaders,
                    fileSizeLimit: Setup.fileSizeLimit,
                    file : list.file,
                    fdata: {
                        id : list.data.id,
                        file : list.data.file,
                        mime : list.data.mime,
                        type : list.data.type,
                        ext : list.data.ext,
                        name : list.data.name,
                        bytes : list.data.bytes,
                        size : list.data.size,
                    }
    			};
    			list.netup.on('uploading',function(p,l,t){
    				if (p < 0 || !p) p = 0;
    				else if (p > 100) p = 100;
    				$file.find('.progress .bar').css({width:p+'%'});
                    list.pct = p;
                    list.ldd = l;
    				//$file.data('pct',p);
    				//$file.data('ldd',l);
                    File.progress($file);
    			});
    			list.netup.on('abort',function(){
    				$file.find('.progress .bar').css({width:0});
                    list.pct = 0;
                    list.ldd = 0;
    				//$file.data('pct',0);
    				//$file.data('ldd',0);
                    File.status($file,'Upload cancelado');
    			});
    			list.netup.on('error',function(error,res){
    				$file.removeClass('ready process').addClass('error');
                    list.pct = 100;
                    list.ldd = 0;
    				//$file.data('pct',100);
    				//$file.data('ldd',0);
    				File.error($file,'Erro do servidor: '+error,res);
    			});
    			list.netup.on('complete',function(t,res){
    				$file.removeClass('ready process').addClass('done');
                    list.pct = 100;
                    list.ldd = t;
    				//$file.data('pct',100).data('ldd',t);
                    File.status($file,'Concluído');
                    File.complete($file,res);
    			});
    			list.netup.start(data);
    			$file.switchClass('ready','process');
                File.status($file,'Fazendo upload...');
                Element.removeClass('ready').addClass('process');
                Component.status('Fazendo upload de arquivos...');
                Component.callback('fileupload', list.data, Stat.data());
                if (!ignore){
                    if (!Stat.sent) Stat.init();
                    Component.interval();
                }
            },
            progress: function($file){
                var id = $file.attr('id');
                var list = List[id];
                Component.callback('fileprogress', list.pct, list.ldd, list.data);
            },
            cancel: function($file,ignore){
                var id = $file.attr('id');
                var list = List[id];
                if (!list) return;
                Component.callback('filecancel', list.data, Stat.data());
                $file.removeClass('error process').addClass('ready');
                if (list.netup && list.netup.state() === 1){
                    list.netup.stop();
                    File.status($file,'Upload cancelado.');
                    if (!ignore && !Dom.filelist.find('.file.process').length){
                        Component.cancel(true);
                    }
                }
                Component.progress();
            },
            delete: function($file,ignore){
                File.cancel($file);
                var id = $file.attr('id');
                var list = List[id];
                if (!list) return;
                if (!$file.is('.error')){
                    Stat.total -= list.data.size;
                }
                Component.callback('filedelete', list.data);
                $file.remove();
                delete List[id];
                if (!ignore && !Dom.filelist.find('.file').length){
                    Component.cancel(true);
                    Component.delete(true);
                }
                Component.progress();
            },
            complete: function($file, res){
                var id = $file.attr('id');
                var list = List[id];
                Component.callback('filecomplete', list.data, res);
                if (!Dom.filelist.find('.process,.ready').length){
                    Component.complete();
                }
                Component.progress();
    		}
        };

        var Component = {
            online: function(){
                return typeof navigator.onLine !== 'undefined' ? navigator.onLine : true;
            },
            netup: new $.fileUpload(),
            callback:function(){
                var event;
                var a = arguments;
                var args = Array.prototype.slice.call(arguments, 1);
                event = a[0];
                if ($.type(Setup.on[event]) === 'function'){
                    return Setup.on[event].apply(Upillow,args);
                }
                event = 'on'+a[0];
                if ($.type(Setup[event]) === 'function'){
                    return Setup[event].apply(Upillow,args);
                }
            },
            status: function(status){
                if (Setup.statusBar) Dom.status.text(status);
            },
            error: function(error,res){
                Element.addClass('error');
                Dom.status.text(error);
                Component.callback('error',error,res,Stat.data());
            },
            interval: function(){
                clearInterval(Stat.interval);
                Stat.interval = setInterval(function(){
                    Component.progress();
                },500);
                Component.progress();
            },
            progress: function(){
                Stat.calc();
                Dom.dashUpdate();
            },
            queue: function(files){
                var $list = Dom.filelist.children('.file');
                File.delete($list.filter('.done, .complete'));
                if (files.length){
                    Stat.count = files.length;
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
        					var $file = $(Template.file);
                            $file.attr('id',id);
                            $file.attr('data-name',data.name);
                            $file.find('.icon .fsi').addClass(data.ext).find('b').text(data.ext);
                            $file.find('.info .name').text(data.name);
                            $file.find('.info .size').text(data.bytes);
        					Dom.filelist.prepend($file);
        					if (st == 'queue'){
                                List[id] = {
                                    id: id,
                                    jq: $file,
                                    data: data,
                                    file: v,
                                    valid: null,
                                    netup: new $.fileUpload()
                                };
                                File.queue($file);
        					} else {
        						File.trigger('file:error',['O arquivo é muito grande.']);
        					}
        				}
        			});
                    Component.progress();
                    Component.status('Pronto para upload');
                    Component.callback('queue',Stat.data());
                }
            },
            prepare: function(){
                if (!Component.online()){
                    Component.error('A rede está offline');
                    return false;
                }
                if (!Setup.url){
                    Component.error('Setup "url" é obrigatóro para realizar uploads.', '');
                    return false;
                }
                Element.removeClass('queue error done').addClass('prepare');
                var collection = {
                    totalSize:0,
                    fileList:{}
                };
                var $list = Dom.filelist.find('.file');
                $list.each(function(){
                    var $file = $(this);
                    var id = $file.attr('id');
                    var list = List[id];
                    var id = list.data.id;
                    collection.fileList[id] = list.data;
                    collection.totalSize += list.data.size;
                });
                var data = {
                    url: Setup.url,
                    data: Setup.data,
                    requestHeaders: Setup.requestHeaders,
                    acceptTypes: Setup.acceptTypes,
                    fileSizeLimit: Setup.fileSizeLimit,
                    collection:collection
                };
                Component.netup.on('test:error',function(r,e){
                    if ($.trim(r).indexOf('[') === 0 || $.trim(r).indexOf('{') === 0){
                        var json = JSON.parse(r);
                        $.each(json||[],function(ka,va){
                            if (collection.fileList[ka]){
                                var $file = Dom.filelist.find('#'+ka);
                                File.error($file,va);
                                List[ka].valid = false;
                            } else {
                                $.each(List||[],function(k,v){
                                    v.valid = false;
                                });
                            }
                        });
                    } else {
                        $.each(List||[],function(k,v){
                            v.valid = false;
                        });
                    }
                    Element.removeClass('prepare');
                    Component.error('Erro no servidor: '+e, r);
                });
                Component.netup.on('test:done',function(r,s){
                    if ($.trim(r).indexOf('[') === 0 || $.trim(r).indexOf('{') === 0){
                        var json = JSON.parse(r);
                        $.each(json||[],function(ka,va){
                            if (collection.fileList[ka]){
                                var $file = Dom.filelist.find('#'+ka);
                                if (va.error || va.fatal || va.fail || va.bug){
                                    File.error($file,va);
                                    List[ka].valid = false;
                                } else {
                                    List[ka].valid = true;
                                }
                            } else {
                                $.each(List||[],function(k,v){
                                    v.valid = true;
                                });
                            }
                        });
                    } else if (r !== ''){
                        Component.error('O retorno precisa ser um JSON',r);
                        return false;
                    } else {
                        $.each(List||[],function(k,v){
                            v.valid = true;
                        });
                    }
                    Element.removeClass('prepare');
                    Component.upload();
                });
                Component.netup.test(data);
                Component.status('Validando arquivos...');
                Component.callback('prepare',Stat.data());
            },
            upload: function(){
                var $list = Dom.filelist.find('.file').not('.error');
                if (!$list.length){
                    Component.error($file,'Não há arquivos válidos para processar.');
                    return false;
                }
                $list.each(function(){
                    var $file = $(this);
                    var id = $file.attr('id');
                    var list = List[id];
                    if (list.file && list.netup){
                        if (list.netup.state() === 0) File.upload($file,true);
                    }
                });
                Stat.clear();
                Stat.init();
                Component.interval();
                Element.removeClass('error complete ready').addClass('process');
                Component.status('Fazendo upload de arquivos...');
                Component.callback('upload',Stat.data());
            },
            complete: function(){
                clearInterval(Stat.interval);
                Element.removeClass('process ready').addClass('complete');
                Component.status('Concluído!');
                Component.progress();
                Component.callback('complete',Stat.data());
            },
            delete: function(ignore){
                if (!ignore){
                    Dom.filelist.find('.file').each(function(){
                        File.delete($(this),true);
                    });
                }
                Stat.clear();
                clearInterval(Stat.interval);
                Element.removeClass('error process complete ready');
                Component.status('');
                Component.progress();
                Component.callback('delete',Stat.data());
            },
            cancel: function(ignore){
                if (!ignore){
                    Dom.filelist.find('.file').each(function(){
                        File.cancel($(this),true);
                    });
                }
                Stat.clear();
                clearInterval(Stat.interval);
                Element.removeClass('error process complete').addClass('ready');
                Component.status('Os uploads foram canelados.');
                Component.progress();
                Component.callback('cancel',Stat.data());
            }
        };

        Element.on('change','input[type="file"]',function(event){
            Component.queue(this.files);
            if (Setup.autoUploadOnQueue || (Setup.autoUploadOnQueue === null && !Setup.multiple)){
                Component.prepare();
            }
        });

        Dom.filelist.on('click','a.upload',function(event){
            File.prepare($(this).closest('.file'));
        });
        Dom.filelist.on('click','a.cancel',function(event){
            File.cancel($(this).closest('.file'));
        });
        Dom.filelist.on('click','a.delete',function(event){
            File.delete($(this).closest('.file'));
        });


        Dom.button.queue.on('click',function(){
            Dom.data.find('input[type="file"]').remove();
            Dom.input.clone().appendTo(Dom.data).click();
        });
        Dom.button.upload.on('click',function(){
            Component.prepare();
        });
        Dom.button.cancel.on('click',function(){
            Component.cancel();
        });
        Dom.button.delete.on('click',function(){
            Component.delete();
        });
        Dom.filelist.find('.empty .title a, .empty .select a').on('click',function(){
            Dom.button.queue.click();
        });
    }

    $.fileUpload = function(){

        var Upload = this;
        var Events = {};
        var config = {};
        var formdata = [];
        var fdx = 0;
        var ajax;
        var status = {state:0, loaded:0};
        var setup = {};

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
                var requestHeaders = $.extend(true,{},setup.requestHeaders||{});
                delete setup.requestHeaders;
                config.beforeSend = function(xhr){
                    $.each(requestHeaders,function(k,v){
                        xhr.setRequestHeader(k, v);
                    });
                    if (setup.data && setup.data.fdata){
                        xhr.setRequestHeader('X-Sui-Request-File', setup.data.fdata);
                    }
                    setup.requestKey = $.md5(JSON.stringify(requestHeaders));
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
                            textData : xhr.responseText || '',
                            responseLength : xhr.responseText ? xhr.responseText.length : 0,
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
            Events[event] = callback;
        };
        this.trigger = function(event,args){
            if (typeof Events[event] == 'function'){
                Events[event].apply(null,args);
            }
        };
        this.resume = function(){
            status.state = 1;
            if (formdata[fdx] || setup.precheck) ajax = Methods.send(formdata[fdx]);
            Upload.trigger('resume',[]);
        };
        this.test = function(s){
            setup = s;
            setup.process = 'upload';
            setup.precheck = 'test';
            Upload.resume();
            Upload.on('done',function(str,s,x){
                status.state = 8;
                Upload.trigger('test:done',[str,s,x]);
            });
            Upload.on('fail',function(xhr,s,e){
                Upload.trigger('test:error',[xhr.responseText,e,xhr]);
            });
        };
        this.start = function(s){
            setup = s;
            setup.process = 'upload';
            var fdata = new FormData();
            fdata.append('file',setup.file);
            formdata.push(fdata);
            if ($.type(setup.fdata) == 'object'){
                setup.data = setup.data || {};
                setup.data.fdata = JSON.stringify(setup.fdata);
            }
            Upload.resume();
            Upload.on('progress',function(event){
                setup.total = event.total;
                Upload.trigger('uploading',[event.loaded * 100 / event.total, event.loaded||0, event.total||0]);
            });
            Upload.on('done',function(d,s,x){
                status.state = 2;
                Upload.trigger('complete',[setup.total,d]);
            });
            Upload.on('fail',function(x,s,e){
                Upload.trigger('error',[e,x.responseText]);
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

    $.fn.upillow = function(s){
        var setup = s;
        this.each(function(){
            var $this = $(this);
            var u = new upillow($this,setup);
            $this.data('upillow',u);
        })
    }

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


})();
