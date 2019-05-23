/*                                  _    __            ____
 ___  ___  _   _ _ __ ___ ___ _   _(_)  / _|_      __ | ___|
/ __|/ _ \| | | | '__/ __/ _ \ | | | | | |_\ \ /\ / / |___ \
\__ \ (_) | |_| | | | (_|  __/ |_| | | |  _|\ V  V /   ___) |
|___/\___/ \__,_|_|  \___\___|\__,_|_| |_|   \_/\_/   |____/

 * ---------------------------------------------------------
 * SourceUI Framework v5.0.1
 * Revision: 0001 by Marino Boscolo Neto
 * Date: 2015-08-12 17:10:05 +0300 (Wed, 18 aug 2015)
 * Dual licensed under the MIT and GPL licenses.
 * Copyright (c) 2006-2015 - SourceLab Tecnologia Ltda
 * --------------------------------------------------------- */

(function() {

	'use strict';

	$.swipeSetup = {
		minmove : 35,
		maxmove : 70,
		mintime : 25,
		maxtime : 550,
		holdtime : 600,
		isScrollable : function($e,orient){
			var overflow = $e.css('overflow') === 'touch';
			var overflowX = $e.css('overflow-x');
			var overflowY = $e.css('overflow-y');
			var scroll = overflow === 'auto' || overflow === 'scroll';
			var scrollX = overflowX === 'auto' || overflowX === 'scroll';
			var scrollY = overflowY === 'auto' || overflowY === 'scroll';
			if (orient === 'XY') return {
				X: scroll || scrollX,
				Y: scroll || scrollY
			};
			else if (orient === 'X') return scroll || scrollX;
			else if (orient === 'Y') return scroll || scrollY;
			return scroll || scrollX || scrollY;
		},
		// ------------------------------
		// SWIPE METHODS
		// ------------------------------
		onswipestart : function(event){
			var self = this, $self = $(self),
				$scroll = $(event.target).closest('.scroll-default'),
				$noswipe = $(event.target).closest('.noswipe');
			var touches = event.originalEvent.touches;
			if (touches.length == 1){
				var data = {
					target: touches[0].target,
					startX : touches[0].pageX,
					startY : touches[0].pageY,
					startTime : Date.now(),
					distance : 0,
					moveTime : 0,
					swipeble : !$noswipe.length && !$self.is('.noswipe'),
					scrollable : $.swipeSetup.isScrollable($scroll,'XY'),
					scrollTop : $scroll.scrollTop(),
					scrollLeft : $scroll.scrollLeft(),
				};
				data.hold = setTimeout(function(){
					$.event.simulate('hold', self, event);
				},$.swipeSetup.holdtime);
				$self.data('swipedata',data);
				if (data.swipeble){
					$.event.simulate('swipestart', self, event);
				}
			}
		},
		onswipemove : function(event){
			var self = this, $self = $(self);
			var data = $self.data('swipedata') || {};
			var touches = event.originalEvent.touches;
			if (data.hold) clearTimeout(data.hold);
			if (data.swipeble && touches.length == 1){
				data.target = touches[0].target;
				data.moveX = touches[0].pageX;
				data.moveY = touches[0].pageY;
				data.moveTime = Date.now() - data.startTime;
				data.distance = Math.sqrt( (data.startX-data.moveX)*(data.startX-data.moveX) + (data.startY-data.moveY)*(data.startY-data.moveY) );
				data.translate = (data.distance-$.swipeSetup.minmove)/3;
				data.distX = data.moveX - data.startX;
				data.distY = data.moveY - data.startY;
				data.direction = null;
				if (data.moveY == data.startY || (data.moveY - data.startY > 0 && data.moveY - data.startY < $.swipeSetup.minmove/2) || (data.startY - data.moveY > 0 && data.startY - data.moveY < $.swipeSetup.minmove/2)){
					data.orientation = 'horizontal';
					if (data.moveX > data.startX){
						data.direction = 'right';
					} else {
						data.direction = 'left';
					}
				} else if (data.moveX == data.startX || (data.moveX - data.startX > 0 && data.moveX - data.startX < $.swipeSetup.minmove/2) || (data.startX - data.moveX > 0 && data.startX - data.moveX < $.swipeSetup.minmove/2)){
					data.orientation = 'vertical';
					if (data.moveY > data.startY){
						data.direction = 'down';
					} else {
						data.direction = 'up';
					}
				}
				if (!data.reach && data.orientation && data.distance >= $.swipeSetup.minmove){
					if (data.orientation == 'horizontal' && (!data.scrollable.X || !data.scrollLeft)){
						data.reach = data.direction;
					} else if (data.orientation == 'vertical' && (!data.scrollable.Y || !data.scrollTop)){
						data.reach = data.direction;
					}
				}
				if (data.reach){
					$self.data('swipedata',data);
					event.swipedata = data;
					$.event.simulate('swipemove', self, event);
					$.event.simulate('swipemove'+data.reach, self, event);
					event.stopPropagation();
				}
			}
		},
		onswipeend : function(event){
			var self = this, $self = $(self);
			var data = $self.data('swipedata') || {};
			if (data.hold) clearTimeout(data.hold);
			if (data.swipeble && data.reach){
				if (data.distance > $.swipeSetup.maxmove){
					event.swipedata = data;
					$.event.simulate('swipe', self, event);
					$.event.simulate('swipe'+data.reach, self, event);
					event.stopPropagation();
				} else {
					$.event.simulate('swipecancel', self, event);
				}
			}
			$self.data('swipedata',{});
		},
	};

	// ------------------------------
	// SWIPE ESPECIAL EVENTS
	// ------------------------------
	$.event.special.swipestart = {
		setup: function() {
			var self = this, $self = $(self), attached = $self.data('swipeattached') || {};
			if (!attached.start){
				$self.on('touchstart', $.swipeSetup.onswipestart);
				attached.start = true;
			}
			$self.data('swipeattached',attached);
		}
	};
	$.event.special.swipemove = {
		setup: function() {
			var self = this, $self = $(self), attached = $self.data('swipeattached') || {};
			if (!attached.start){
				$self.on('touchstart', $.swipeSetup.onswipestart);
				attached.start = true;
			}
			if (!attached.move){
				$self.on('touchmove', $.swipeSetup.onswipemove);
				attached.move = true;
			}
			$self.data('swipeattached',attached);
		},
		add: function( handleObj ) {
			var self = this, $self = $(self);
			var old_handler = handleObj.handler;
			handleObj.handler = function(event) {
				event.swipe = $self.data('swipedata');
				old_handler.apply( this, arguments );
			};
		}
	};
	$.event.special.swipemoveright = {
		setup: function() {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipemoveleft = {
		setup: function() {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipemovedown = {
		setup: function() {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipemoveup = {
		setup: function() {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipe = {
		setup: function() {
			var self = this, $self = $(self), attached = $self.data('swipeattached') || {};
			if (!attached.start){
				$self.on('touchstart', $.swipeSetup.onswipestart);
				attached.start = true;
			}
			if (!attached.move){
				$self.on('touchmove', $.swipeSetup.onswipemove);
				attached.move = true;
			}
			if (!attached.end){
				$self.on('touchend touchcancel', $.swipeSetup.onswipeend);
				attached.end = true;
			}
			$self.data('swipeattached',attached);
			return false;
		}
	};
	$.event.special.swiperight = {
		setup: function() {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipeleft = {
		setup: function() {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipedown = {
		setup: function() {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipeup = {
		setup: function() {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipecancel = {

	};
	$.event.special.hold = {

	};

	// SUI Events <on>

	$.suiEvent = function(elem){
		if (elem instanceof Element){
			var Template = sourceui.templates.interface;
			var code = '';
			elem.findChild('on',function(){
				var e = this.attr('event');
				var va = this;
				var js = '';
				this.findChild(function(){
					var a = this.attr();
					if (this.nodeName === 'snippet'){
						code += Template.get('code',{ attr:{ type:'event', on:e, callback:'snippet' }, value:JSON.stringify(a) });
					} else if (this.nodeName === 'show' ||
							   this.nodeName === 'hide' ||
							   this.nodeName === 'enable' ||
							   this.nodeName === 'disable' ||
							   this.nodeName === 'ignore' ||
							   this.nodeName === 'consider' ||
							   this.nodeName === 'evaluate' ||
							   this.nodeName === 'clear' ||
							   this.nodeName === 'remove'){
						js += "\n";
						if (a.target){
							js += '$target = $("'+a.target+'");'+"\n";
							js += 'if (!$target.length) console.error("Target \''+a.target+'\' not found for \''+e+'\' event.");'+"\n";
						}
						if (a.origin){
							js += '$origin = $("'+a.origin+'");'+"\n";
							js += 'if (!$origin.length) console.error("Origin \''+a.origin+'\' not found for \''+e+'\' event.");'+"\n";
						} else {
							js += '$origin = $(this);'+"\n";
						}
						if (typeof a.when != 'undefined'){
							js += 'if ($origin.val() == "'+a.when+'") ';
						}
						if (this.nodeName === 'show') js += '$target.show();'+"\n";
						else if (this.nodeName === 'hide') js += '$target.hide();'+"\n";
						else if (this.nodeName === 'enable') js += '$target.disable(false);'+"\n";
						else if (this.nodeName === 'disable') js += '$target.disable(true);'+"\n";
						else if (this.nodeName === 'ignore') js += '$target.ignore();'+"\n";
						else if (this.nodeName === 'consider') js += '$target.consider();'+"\n";
						else if (this.nodeName === 'evaluate') js += '$target.val('+(this.value ? '"'+this.value+'"' : 'val')+');'+"\n";
						else if (this.nodeName === 'clear') js += '$target.val("");'+"\n";
						else if (this.nodeName === 'remove') js += '$target.remove();'+"\n";
					}
				}, function(){
					if (va.content()) code += Template.get('code',{ attr:{ type:'event', on:e }, value:va.content() });
				});
				if (js) code += Template.get('code',{ attr:{ type:'event', on:e }, value:"\n"+'var $target, $origin;'+js });
				this.parentNode.removeChild(this);
			});
			return code;
		} else if (elem instanceof jQuery){
			var $code = (elem.attr('type') === 'event') ? elem : elem.children('code');
			var text = $code.text();
			$code.remove();
			// precisa habilitar isso aqui pra remover a tag "code" do dom
			return text;
		}
	}
	$.suiBind = function(Element,off){
		Element.children('code').each(function(){
			var $v = $(this);
			if ($v.attr('type') == 'event'){
				var eventname = $v.attr('on');
				var value;
				if (off) Element.off(eventname);
				Element.on(eventname,function(event,val){
					var args = arguments;
					var $this = $(this);
					if ($v.attr('callback') === 'snippet'){

					} else if ($v.attr('callback') === 'show'){

					} else if ($v.attr('callback') === 'hide'){

					} else if ($v.attr('callback') === 'enable'){

					} else if ($v.attr('callback') === 'disable'){

					} else {
						eval($.suiEvent($v));
					}
				});

			}
		});
	}
	/*
	$.suiBind = function(Element,off){
		Element.children('code').each(function(){
			var $v = $(this);
			if ($v.attr('type') == 'event'){
				var eventname = $v.attr('on');
				var value;
				if (off) Element.off(eventname);

				Element.on(eventname,function(event,val){
					var args = arguments;
					var $this = $(this);
					if ($v.attr('callback') === 'snippet'){

					} else if ($v.attr('callback') === 'show'){

					} else if ($v.attr('callback') === 'hide'){

					} else if ($v.attr('callback') === 'enable'){

					} else if ($v.attr('callback') === 'disable'){

					} else {
						eval($.suiEvent($v));
					}
				});

			}
		});
	}
	*/

})();
