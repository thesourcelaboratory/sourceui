$(function(){

	$.fn.suiViewer = function(setup,cfg){

		var $viewer = $(this);
		var $links = $viewer.find('a');
		var $dialog = $(
			'<div class="sui-dialog dark">'+
			'<div class="container sn">'+
					'<div class="title"></div>'+
					'<div class="content viewer">'+
						'<a class="step prev icon-chevron-r"></a>'+
						'<a class="step next icon-chevron-l"></a>'+
						'<div class="caption"></div>'+
					'</div>'+
					'<div class="actions">'+
						'<div class="group">'+
							'<button class="reset icon-arrows">Resetar</button>'+
							'<button class="download icon-arrow-down">Baixar</button>'+
						'</div>'+
						'<div class="group">'+
							'<button class="close">Fechar</button>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div>'
		);

		var Methods = {
			pamzoom: function($image){
				$image.panzoom({
					panOnlyWhenZoomed: true,
					minScale: 1,
					increment: 0.5,
					contain: 'automatic'
				});
				$image.parent().on('mousewheel.focal', function (e) {
					e.preventDefault();
					var delta = e.delta || e.originalEvent.wheelDelta;
					var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
					$image.panzoom('zoom', zoomOut, {
						increment: 0.25,
						animate: false,
						focal: e
					});
				});
				$viewer.removeClass('animating');
			},
			loadImage: function($link,animate){

				$viewer.addClass('animating');

				var href = $link.attr('href');
				var $oldimg = $dialog.find('.content img');
				var $title = $dialog.find('.container .title');
				var $content = $dialog.find('.content');

				var $image = $('<img/>');
				$content.append($image);
				$content.find('.caption').html($link.find('figcaption').html() || '');
				$title.text('Imagem '+($link.index() + 1)+' de '+$links.length);

				$image.css('display','none').attr('src', href).on('load', function(){
					if ($oldimg.length){
						$oldimg.velocity({
							translateX:(animate == 'right' ? [-80,0] : [80,0]),
							opacity:[0,1]
						},{
							duration:150,
							complete:function(){
								$oldimg.remove();
								$image.velocity({
									translateX:(animate == 'right' ? [0,80] : [0,-80]),
									opacity:[1,0]
								},{
									display:'inline-block',
									duration:150,
									complete:function(){
										Methods.pamzoom($image);
									}
								});
							}
						});
					} else {
						$image.velocity({
							opacity:[1,0]
						},{
							display:'inline-block',
							duration:150,
							complete:function(){
								Methods.pamzoom($image);
							}
						});
					}
				});
			}
		};

		$viewer.append($dialog);
		$dialog.suiDialog();
		var $title = $dialog.find('.container .title');
		var $actions = $dialog.find('.actions button');
		var $steps = $dialog.find('.step');

		$actions.filter('.reset').on('click',function(){
			$dialog.find('.content img').panzoom("reset");
		});
		$actions.filter('.download').on('click', function () {
			download($dialog.find('.content img').attr('src'));
		});
		$steps.filter('.prev').on('click',function(){
			if ($viewer.hasClass('animating')) return false;
			var $selected = $links.filter('.selected');
			var $prev = $selected.prev('a');
			if (!$prev.length) $prev = $links.last();
			Methods.loadImage($prev,'left');
			$selected.removeClass('selected');
			$prev.addClass('selected');
		});
		$steps.filter('.next').on('click',function(){
			if ($viewer.hasClass('animating')) return false;
			var $selected = $links.filter('.selected');
			var $next = $selected.next('a');
			console.log($next);
			if (!$next.length) $next = $links.first();
			Methods.loadImage($next,'right');
			$selected.removeClass('selected');
			$next.addClass('selected');
		});

		$links.on('click',function(event){
			event.preventDefault();
			var $link = $(this);
			$links.removeClass('selected');
			$link.addClass('selected');
			$dialog.suiDialog('open',$link);
			var $image = $dialog.find('.content img');
			if ($image.attr('src') != $link.attr('href')){
				$image.remove();
				$title.text('Imagem '+($link.index() + 1)+' de '+$links.length);
				$dialog.one('dialog:open',function(){
					Methods.loadImage($link);
				});
			}
			return false;
		});
    }
});