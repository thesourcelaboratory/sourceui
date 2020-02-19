$(function(){

	$.fn.suiDialog = function(setup,cfg){

        var $dialog = $(this);
        var $container = $dialog.find('.container');
        var $content = $container.find('.content');
        var $actions = $container.find('.actions');

        var Methods = {
            open: function(param){
                $dialog.velocity({
                    opacity:[1,0]
                },{
                    display:'block',
                    duration:300
                });
                $container.velocity({
                    scale:[1,0.85],
                    opacity:[1,0]
                },{
                    display:'block',
                    duration:300,
                    complete:function(){
                        $dialog.trigger('dialog:open');
                    }
                });
            },
            close: function(){
                $dialog.velocity({
                    opacity:[0,1]
                },{
                    display:'none',
                    duration:300
                });
                $container.velocity({
                    scale:[0.85,1],
                    opacity:[0,1]
                },{
                    display:'none',
                    duration:300,
                    complete:function(){
                        $dialog.trigger('dialog:close');
                    }
                });
            }
        };

        if (!setup || typeof setup == 'object'){

            $dialog.on('dialog:select',function(event,val){
                if (setup.onselect){
                    setup.onselect.apply(this,[val]);
                }
            });
            var closeevent = 'click';

            if ($content.is('.viewer')){
                closeevent = 'mousedown';
            }

            $dialog.on(closeevent,function(event){
                Methods.close();
            });
            $container.on(closeevent,function(event){
                event.stopPropagation();
            });


            $actions.on('click','.close',function(event){
                event.stopPropagation();
                event.preventDefault();
                Methods.close();
            });

            if ($content.is('.selector')){
                $content.on('click','a[data-value]',function(){
                    var $this = $(this);
                    $dialog.trigger('dialog:select',[$this.data('value')]);
                });
            }

        } else if (typeof setup == 'string' && Methods[setup]){
            Methods[setup].call(null,cfg);
        }
    }
});