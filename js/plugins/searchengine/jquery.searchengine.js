$(function(){

    $.fn.searchEngine = function(engine,key,context){

        var Search = this;

        var api = {engine:engine, key:key, context:context};

        var $body = $('body');
        var $section = $(this);
        var $content = $section.find('.content');
        var $form = $section.find('form');
        var $input = $form.find(':input');
        var $button = $form.find('button');
        var $results = $section.find('.results');

        if ($body.is('.mobile')) $input.attr('placeholder','Pesquise palavras ou termos')

        Search.searches = {};
        Search.request = function(term,callback){
            if (api.engine === 'google'){
                $.ajax({
                    method:'get',
                    dataType:'json',
                    url:'https://www.googleapis.com/customsearch/v1',
                    data:{
                        key: api.key,
                        cx: api.context,
                        q : term,
                        count: 20
                    },
                }).done(function(json,status,xhr) {
                    if (callback) callback(json);
                });
            }
        };
        Search.parse = function(result,html){
            if (result.items && result.items.length){
                html = '<div class="found">'+
                            '<h4 class="kind">Foram encontradas <b>'+result.items.length+' ocorrências</b> para <b>'+result.queries.request[0].searchTerms+'</b></h4>'+
                            '<ol>'+html+'</ol>'+
                        '</div>';
            } else {
                if (result && result.spelling){
                    html = '<li class="spelling">Você quis dizer <a data-spelling="'+result.spelling.correctedQuery+'">'+result.spelling.htmlCorrectedQuery+'</a></li>'+html;
                }
                html = '<div class="found">'+
                            '<h4 class="kind">Não ha resultados para <b>'+result.queries.request[0].searchTerms+'</b></h4>'+
                            '<ol>'+html+'</ol>'+
                        '</div>';
            }
            $results.html(html);
            Search.finishLoading();
        };

        Search.finishLoading = function(callback){
            setTimeout(function(){
                $section.find('.sui-loading').remove();
                if (callback) callback();
            },100);
        };

        $form.on('submit',function(event){
            event.preventDefault();
            var term = $input.val();
		    if (term && term !== ''){
                var result = Search.searches[term];
                var html = '';
                if (result){
                    $.each(Search.searches[term].items,function(k,v){
                        html += '<li>'+
                                    '<h4 class="title"><a href="'+v.link+'">'+v.htmlTitle+'</a></h4>'+
                                    '<p class="link">'+v.htmlFormattedUrl+'</p>'+
                                    '<p class="snippet">'+v.htmlText+'</p>'+
                                '</li>';
                    });
                    Search.parse(result,html);
                } else {
                    Search.request(term,function(result){
                        Search.searches[term] = result;
                        $.each(result.items||[],function(k,v){
                            v.htmlText = v.htmlSnippet.replace(/\<br\>/g,"");
                            html += '<li>'
                                        +'<h4 class="title"><a href="'+v.link+'">'+v.htmlTitle+'</a></h4>'
                                        +'<p class="link">'+v.htmlFormattedUrl+'</p>'
                                        +'<p class="snippet">'+v.htmlText+'</p>'
                                    +'</li>'
                        });
                        Search.parse(result,html);
                    });
                }
            } else {
                Search.finishLoading(function(){
                    $results.html('');
                });

            }
        });

        $section.on('click','a[data-spelling]',function(){
            var $a = $(this);
            $input.val($a.data('spelling'));
            $button.click();
        });

        $('#suiNav').on('click', '.searchengine a',function(event){
            var $a = $(this);
            var $li = $a.parent();
            $li.toggleClass('selected');
            $body.click();
            event.preventDefault();
            event.stopPropagation();
            if ($body.is('.searched')){
                $section.slideUp(function() {
                    $body.removeClass('searched');
                });
            } else {
                $("html, body").animate({ scrollTop: 0 });
                $section.slideDown(function() {
                    $body.addClass('searched');
                });
            }
        });
    }
});