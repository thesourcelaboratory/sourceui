$(function(){

	var Device = sourceui.instances.device;
	var Debug = Device.Debug;

	$.fn.suiBanner = function(setup,cfg){
		var $banner = $(this);
		var $content = $banner.children('.content');
		var $visualstack = $('<div class="visualstack"/>').insertAfter($content);
		var $progress = $('<div class="progress"></div>');
		var $displays = $banner.find('.displays li');
		var $indexes = $('<ul class="indexes"/>');
		var $image = $('<div class="visual image"/>');
		var $video = $('<video class="visual video" playsinline="" autoplay="" muted="" loop=""/>');

		var $prog, $bar;
		/*
		<video class="video-content played" poster="videos/poster.jpg" id="bgvid" playsinline="" autoplay="" muted="" loop="" style="opacity: 1;">
                <source src="//sourcelab.ddns.net/sourceui/sites/sourcelab/portal/videos/bg.mp4" type="video/mp4">
                <source src="videos/bgz2.mp4" type="video/mp4">
            </video>
		*/
		var loaded = 0;
		var progress = 0;
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


		if ($displays.length > 1){
			$content.append($indexes);
		}
		$indexes = $indexes.children('li');

		var Methods = {
			zindex: 10,
			select: function(id,swipe){

				clearTimeout(timeout);

				var $olddsp = $displays.filter('.selected');
				var $newdsp = $displays.filter('#'+id);

				var $oldidx = $indexes.filter('.selected');
				var $newidx = $indexes.filter('[data-display="'+id+'"]');

				var $oldvis = $visualstack.children('[data-display="'+$olddsp.attr('id')+'"]');
				var $newvis = $visualstack.children('[data-display="'+id+'"]').css('z-index',Methods.zindex++);

				swipe = swipe || ($oldidx.index() < $newidx.index() ? 'left' : 'right');

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
						duration:500
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
					$newvis.velocity('stop').velocity({
						opacity:[1,0],
					},{
						display:'block',
						duration:500,
					});
					$newdsp.velocity('stop').velocity({
						opacity:[1,0],
					},{
						display:'flex',
						duration:500,
						complete:function(){
							$newdsp.addClass('selected');
						}
					});

				}
				$oldidx.removeClass('selected');
				$newidx.addClass('selected');
				$newdsp.trigger('display:timeout');
			},
		};


		$banner.on('banner:loaded',function(){
			loaded++;
			progress = Math.ceil(loaded * 100 / $displays.length);
			var start = false;
			if (progress >= 100) start = true;
			$bar.velocity('stop').velocity({
				width:progress+'%'
			},{
				duration:500,
				complete:function(){
					if (start){
						$prog.velocity({
							opacity:0,
							scale:[0.75,1],
						},{
							duration:300,
							complete:function(){
								$prog.remove();
							}
						});
						Methods.select($indexes.filter(':eq(0)').data('display'));
					}
				}
			});
		});

		$banner.on('banner:start',function(){
			$indexes.on('click',function(){
				var $this = $(this);
				if ($this.is('.selected')) return false;
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
		});

		$banner.on('banner:prepare',function(){
			$visualstack.html('');
			if ($prog) $prog.remove();
			$prog = $progress.clone().insertAfter($visualstack);
			progress = 0;
			$bar = $('<div class="bar"/>').appendTo($prog);
			$indexes.removeClass('selected');
			$displays.css('display','none').removeClass('selected');
			$displays.each(function(){
				var $this = $(this);
				var background = {};
				if (Device.orientation() == 'landscape'){
					background.video = $this.data('video-landscape') || $this.data('video') || (!$this.data('image-landscape') && $this.data('video-portrait') ? $this.data('video-portrait') : '');
					background.image = $this.data('image-landscape') || $this.data('image-portrait') || $this.data('image');
				} else {
					background.video = $this.data('video-portrait') || $this.data('video') || (!$this.data('image-portrait') && $this.data('video-landscape') ? $this.data('video-landscape') : '');
					background.image = $this.data('image-portrait') || $this.data('image-landscape') || $this.data('image');
				}

				var $newvis;

				if (background.video){
					$this.data('mediatype','video');
					$newvis = $video.clone();
					$newvis.append('<source src="'+background.video+'">');
					$newvis.on('loadeddata', function() {
						$this.trigger('banner:loaded');
					});
				} else if (background.image){
					$this.data('mediatype','image');
					$newvis = $image.clone().css('background-image','url(\''+background.image+'\')');
					$('<img/>').attr('src', background.image).on('load', function() {
						$(this).remove(); // prevent memory leaks as @benweet suggested
						$this.trigger('banner:loaded');
					});
				} else {
					$this.trigger('banner:loaded');
				}
				if ($newvis) {
					$newvis.attr('data-display',$this.attr('id'));
					$visualstack.append($newvis);
				}
			});
		});

		$banner.trigger('banner:start');
		$banner.trigger('banner:prepare');
		$(window).on('resize orientationchange',function(){
			$banner.trigger('banner:prepare');
		});

		$(window).on('blur',function(){
			clearTimeout(timeout);
		});
		$(window).on('focus',function(){
			$displays.filter('.selected').trigger('display:timeout');
		});

		$displays.on('mouseenter',function(){
			clearTimeout(timeout);
		});
		$displays.on('mouseleave',function(){
			$displays.filter('.selected').trigger('display:timeout');
		});


	}
});