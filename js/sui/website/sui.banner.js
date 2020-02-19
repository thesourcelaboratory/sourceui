$(function(){

	$.fn.suiBanner = function(setup,cfg){
		var $banner = $(this);
		var $content = $banner.children('.content');
		var $displays = $banner.find('.displays li');
		var $indexes = $('<ul class="indexes"/>');
		var $image = $('<div class="visual image"/>');
		var $video = $('<video class="visual video" playsinline="" autoplay="" muted="" loop=""/>');
		/*
		<video class="video-content played" poster="videos/poster.jpg" id="bgvid" playsinline="" autoplay="" muted="" loop="" style="opacity: 1;">
                <source src="//sourcelab.ddns.net/sourceui/sites/sourcelab/portal/videos/bg.mp4" type="video/mp4">
                <source src="videos/bgz2.mp4" type="video/mp4">
            </video>
		*/
		var loaded = 0;
		var timeout;

		var $selected = $displays.filter('.selected');
		if (!$selected.length) $selected = $displays.filter(':eq(0)');

		$displays.each(function(){
			var $this = $(this);
			var id = 'suiban'+Math.random().toString(36).substr(2, 9);
			$this.attr('id',id);
			$indexes.append('<li data-display="'+id+'"/>');
		});

		$displays.on('display:timeout',function(){
			var $this = $(this);
			if ($displays.length > 1){
				timeout = setTimeout(function(){
					if ($('#suiBody').is('.scrolled, .outfocused')) {
						clearTimeout(timeout);
						$this.trigger('display:timeout');
						return false;
					}
					var $next = $this.next('li');
					if (!$next.length) $next = $displays.filter(':eq(0)');
					Methods.select($next.attr('id'));
				},$this.data('timeout') || 10000);
			}
		});
		$displays.on('mouseenter',function(){
			clearTimeout(timeout);
		});
		$displays.on('mouseleave',function(){
			var $this = $(this);
			$this.trigger('display:timeout');
		});

		if ($displays.length > 1){
			$content.append($indexes);
		}
		$indexes = $indexes.children('li');

		var Methods = {
			select: function(id,swipe){

				clearTimeout(timeout);
				var $olddsp = $displays.filter('.selected');
				var $newdsp = $displays.filter('#'+id);
				var $oldidx = $indexes.filter('.selected');
				var $newidx = $indexes.filter('[data-display="'+id+'"]');
				var $oldvis = $banner.children('.visual');

				if ($newdsp.data('video')){
					var $newvis = $video.clone();
					$newvis.append('<source src="'+$newdsp.data('video')+'" type="'+($newdsp.data('type')||'video/'+$newdsp.data('video').split('.').pop())+'">');
				} else if ($newdsp.data('image')){
					var $newvis = $image.clone().css('background-image','url(\''+$newdsp.data('image')+'\')');
				}
				swipe = swipe || ($oldidx.index() < $newidx.index() ? 'right' : 'left');
				$banner.append($newvis);
				if ($olddsp.length){
					$oldvis.velocity('stop').velocity({
						opacity:[0,1],
						translateX:swipe=='left'?[-75,0]:[75,0]
					},{
						display:'none',
						duration:500
					});
					$newvis.velocity('stop').velocity({
						opacity:[1,0],
						translateX:swipe=='left'?[0,75]:[0,-75]
					},{
						display:'block',
						duration:500,
						complete:function(){
							$oldvis.remove();
						}
					});
					$olddsp.velocity('stop').velocity({
						opacity:[0,1],
						translateX:swipe=='left'?[-200,0]:[200,0]
					},{
						display:'none',
						duration:500,
						complete:function(){
							$olddsp.removeClass('selected');
						}
					});
					$newdsp.addClass('selected').velocity('stop').velocity({
						opacity:[1,0],
						translateX:swipe=='left'?[0,200]:[0,-200]
					},{
						display:'flex',
						duration:500
					});
				} else {
					$newvis.show();
					$newdsp.addClass('selected');
				}
				$oldidx.removeClass('selected');
				$newidx.addClass('selected');
				$newdsp.trigger('display:timeout');
			},
		};


		$banner.on('banner:loaded',function(){
			loaded++;
			if (loaded === $displays.length){
				$banner.trigger('banner:start');
			}
		});

		$banner.on('banner:start',function(){
			$indexes.on('click',function(){
				var $this = $(this);
				Methods.select($this.data('display'));
			});
			if ($indexes.length > 1){
				$banner.on('swipeleft',function(){
					var $next = $indexes.filter('.selected').next('li');
					$next = $next.length ? $next : $indexes.filter(':first');
					Methods.select($next.data('display'),'left');
				});
				$banner.on('swiperight',function(){
					var $prev = $indexes.filter('.selected').prev('li');
					$prev = $prev.length ? $prev : $indexes.filter(':last');
					Methods.select($prev.data('display'),'right');
				});
			}
			Methods.select($indexes.filter(':eq(0)').data('display'));
		});

		$displays.each(function(){
			var $this = $(this);
			if ($this.data('image')){
				$('<img/>').attr('src', $this.data('image')).on('load', function() {
					$(this).remove(); // prevent memory leaks as @benweet suggested
					$banner.trigger('banner:loaded');
					//$('body').css('background-image', 'url(http://picture.de/image.png)');
				});
			} else {
				$banner.trigger('banner:loaded');
			}
		});
	}
});