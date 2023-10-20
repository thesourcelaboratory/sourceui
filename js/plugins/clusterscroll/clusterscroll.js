/*!***************************************************
* tipster.js v1.0.1
* https://markjs.io/
* Copyright (c) 2014–2018, Julian Kühnel
* Released under the MIT license https://git.io/vwTVl
*****************************************************/

$(function () {
	'use strict';

	$.clusterscroll = {
		bind: function(options){
            var Interface = sourceui.interface;
            var Dom = Interface.dom;

			var $list = options.list || $(this);
			var $lines = options.lines || $list.find('.line');
			var $scroller = options.scroller ? options.scroller : $list.closest('.scroll-default');

			var totallines = $lines.length;
			var $clusters = $();

			for (var i=0; (i*100)<=totallines; i++){
				var $slice = $lines.slice((i*100), (i*100)+99);
				var $cluster = $slice.wrapAll('<div class="clusterscroll" />');
				console.log($cluster);
			}

			$scroller.on('scroll', function(){

			});
		},
		isvisible: function($cluster, $scroller){
			const rect = $cluster.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.bottom <= ($scroller.innerHeight())
			);
		}
	};

	$.fn.clusterscroll = function (options) {
		var $lists = $(this);
		$lists.each(function () {
			$.clusterscroll.bind.call(this, options || {});
		});
	};
});
