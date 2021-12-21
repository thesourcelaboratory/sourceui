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

(function () {

	'use strict';

	$.swipeSetup = {
		minmove: 35,
		maxmove: 70,
		mintime: 25,
		maxtime: 550,
		holdtime: 600,
		isScrollable: function ($e, orient) {
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
		onswipestart: function (event) {
			var self = this, $self = $(self),
				$scroll = $(event.target).closest('.scroll-default'),
				$noswipe = $(event.target).closest('.noswipe');
			var touches = event.originalEvent.touches;
			if (touches.length == 1) {
				var data = {
					target: touches[0].target,
					startX: touches[0].pageX,
					startY: touches[0].pageY,
					startTime: Date.now(),
					distance: 0,
					moveTime: 0,
					swipeble: !$noswipe.length && !$self.is('.noswipe'),
					scrollable: $.swipeSetup.isScrollable($scroll, 'XY'),
					scrollTop: $scroll.scrollTop(),
					scrollLeft: $scroll.scrollLeft(),
				};
				data.hold = setTimeout(function () {
					$.event.simulate('hold', self, event);
				}, $.swipeSetup.holdtime);
				$self.data('swipedata', data);
				if (data.swipeble) {
					$.event.simulate('swipestart', self, event);
				}
			}
		},
		onswipemove: function (event) {
			var self = this, $self = $(self);
			var data = $self.data('swipedata') || {};
			var touches = event.originalEvent.touches;
			if (data.hold) clearTimeout(data.hold);
			if (data.swipeble && touches.length == 1) {
				data.target = touches[0].target;
				data.moveX = touches[0].pageX;
				data.moveY = touches[0].pageY;
				data.moveTime = Date.now() - data.startTime;
				data.distance = Math.sqrt((data.startX - data.moveX) * (data.startX - data.moveX) + (data.startY - data.moveY) * (data.startY - data.moveY));
				data.translate = (data.distance - $.swipeSetup.minmove) / 3;
				data.distX = data.moveX - data.startX;
				data.distY = data.moveY - data.startY;
				data.direction = null;
				if (data.moveY == data.startY || (data.moveY - data.startY > 0 && data.moveY - data.startY < $.swipeSetup.minmove / 2) || (data.startY - data.moveY > 0 && data.startY - data.moveY < $.swipeSetup.minmove / 2)) {
					data.orientation = 'horizontal';
					if (data.moveX > data.startX) {
						data.direction = 'right';
					} else {
						data.direction = 'left';
					}
				} else if (data.moveX == data.startX || (data.moveX - data.startX > 0 && data.moveX - data.startX < $.swipeSetup.minmove / 2) || (data.startX - data.moveX > 0 && data.startX - data.moveX < $.swipeSetup.minmove / 2)) {
					data.orientation = 'vertical';
					if (data.moveY > data.startY) {
						data.direction = 'down';
					} else {
						data.direction = 'up';
					}
				}
				if (!data.reach && data.orientation && data.distance >= $.swipeSetup.minmove) {
					if (data.orientation == 'horizontal' && (!data.scrollable.X || !data.scrollLeft)) {
						data.reach = data.direction;
					} else if (data.orientation == 'vertical' && (!data.scrollable.Y || !data.scrollTop)) {
						data.reach = data.direction;
					}
				}
				if (data.reach) {
					$self.data('swipedata', data);
					event.swipedata = data;
					$.event.simulate('swipemove', self, event);
					$.event.simulate('swipemove' + data.reach, self, event);
					event.stopPropagation();
				}
			}
		},
		onswipeend: function (event) {
			var self = this, $self = $(self);
			var data = $self.data('swipedata') || {};
			if (data.hold) clearTimeout(data.hold);
			if (data.swipeble && data.reach) {
				if (data.distance > $.swipeSetup.maxmove) {
					event.swipedata = data;
					$.event.simulate('swipe', self, event);
					$.event.simulate('swipe' + data.reach, self, event);
					event.stopPropagation();
				} else {
					$.event.simulate('swipecancel', self, event);
				}
			}
			$self.data('swipedata', {});
		},
	};

	// ------------------------------
	// SWIPE ESPECIAL EVENTS
	// ------------------------------
	$.event.special.swipestart = {
		setup: function () {
			var self = this, $self = $(self), attached = $self.data('swipeattached') || {};
			if (!attached.start) {
				$self.on('touchstart', $.swipeSetup.onswipestart);
				attached.start = true;
			}
			$self.data('swipeattached', attached);
		}
	};
	$.event.special.swipemove = {
		setup: function () {
			var self = this, $self = $(self), attached = $self.data('swipeattached') || {};
			if (!attached.start) {
				$self.on('touchstart', $.swipeSetup.onswipestart);
				attached.start = true;
			}
			if (!attached.move) {
				$self.on('touchmove', $.swipeSetup.onswipemove);
				attached.move = true;
			}
			$self.data('swipeattached', attached);
		},
		add: function (handleObj) {
			var self = this, $self = $(self);
			var old_handler = handleObj.handler;
			handleObj.handler = function (event) {
				event.swipe = $self.data('swipedata');
				old_handler.apply(this, arguments);
			};
		}
	};
	$.event.special.swipemoveright = {
		setup: function () {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipemoveleft = {
		setup: function () {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipemovedown = {
		setup: function () {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipemoveup = {
		setup: function () {
			$.event.special.swipemove.setup.call(this);
		}
	};
	$.event.special.swipe = {
		setup: function () {
			var self = this, $self = $(self), attached = $self.data('swipeattached') || {};
			if (!attached.start) {
				$self.on('touchstart', $.swipeSetup.onswipestart);
				attached.start = true;
			}
			if (!attached.move) {
				$self.on('touchmove', $.swipeSetup.onswipemove);
				attached.move = true;
			}
			if (!attached.end) {
				$self.on('touchend touchcancel', $.swipeSetup.onswipeend);
				attached.end = true;
			}
			$self.data('swipeattached', attached);
			return false;
		}
	};
	$.event.special.swiperight = {
		setup: function () {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipeleft = {
		setup: function () {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipedown = {
		setup: function () {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipeup = {
		setup: function () {
			$.event.special.swipe.setup.call(this);
		}
	};
	$.event.special.swipecancel = {

	};
	$.event.special.hold = {

	};

	// SUI Events <on>


})();
