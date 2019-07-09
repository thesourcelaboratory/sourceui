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

sourceui.Activity = function () {

	var Activity = this; 							// recebe o próprio objeto
	var Device = sourceui.instances.device;
	var Network = sourceui.instances.network;		// objeto de conectividade
	var Active = {
		focus: $(),
		hover: $(),
		last: $(),
	};
	var scrl = {
		default: { axis: 'y', interrupt: true, offset: { top: -100 } },
		custom: { axis: 'y', interrupt: true }
	};

	if (Device.ismobile) return;

	var Dom = {
		document: $(document),
		body: $('#suiBody'),
		aside: $(),
		main: $()
	};

	Dom.body.on('mousedown', function (event) {
		if (event.ctrlKey) Dom.body.addClass('ctrl-click');
	});
	Dom.body.on('mouseup', function (event) {
		setTimeout(function () { Dom.body.removeClass('ctrl-click'); }, 200);
	});

	Dom.document.on('click', function (event) {

		Dom.document.trigger('activity:blur');

		var $temp;
		var $target = $(event.target);
		var $closest = $target.closest('.sui-aside, .sui-main');

		if ($closest.is('.sui-aside')) {
			$temp = $target.closest('.navtools, .blocklist, .block');
		} else if ($closest.is('.sui-main')) {
			$temp = $target.closest('.sui-field, .sui-widget, .sui-view, .sui-sector');
		}
		if ($temp) Dom.document.trigger('activity:focusin', [$temp]);


	});

	Dom.document.on('activity:hoverin', function (event, $target, sibling, selector) {

		Dom.document.trigger('activity:hout');

		var $list;
		var $temp;
		var lf;
		var $closest;
		var $focus = Active.focus;

		if (sibling == 'prev') lf = 'last';
		else if (sibling == 'next') lf = 'first';
		else if (sibling == 'up') lf = 'last';
		else if (sibling == 'down') lf = 'first';

		if (sibling) {
			if ($focus.data('type') == 'date' && $target.is('a')) {
				$closest = $target.closest('.years, .months, .days');
				if ($closest.is('.days')) {
					if (sibling == 'up' || sibling == 'down') {
						sibling = sibling == 'up' ? 'prev' : 'next';
						$list = $closest.find('li[data-weekday="' + $target.parent().data('weekday') + '"] a');
					} else if (sibling == 'next' || sibling == 'prev') {
						$list = $target.closest('ol').find('li a');
					}
					$temp = $target[sibling + 'Of']($list, true);
					if (!$temp.length) $temp = $target[lf + 'Of']($list, true);
				}
			} else if (selector) {
				$temp = $target[sibling](selector);
				if (!$temp.length) $temp = $(selector + ':visible:' + lf, $target.parent());
			} else {
				$temp = $target[sibling]();
				if (!$temp.length) $temp = $(':visible:' + lf, $target.parent());
			}
		}

		Active.hover = ($temp) ? $temp : $target;
		//console.log('hover',Active.hover);
		return $temp;

	});

	Dom.document.on('activity:hout', function (event) {
		if (Active.hover) {
			Active.hover.removeClass('hover');
		}
		Active.hover = $();
	});

	Dom.document.on('activity:hover', function (event, $target, sibling, selector) {

		var $temp = Dom.document.trigger('activity:hoverin', [$target, sibling, selector]);

		Active.hover.addClass('hover');
		Active.eventPrevent = true;

		var $scroll = Active.hover.closest('.scroll-default, .scroll-custom');
		if ($scroll.is('.scroll-default')) $scroll.stop(true).scrollTo(Active.hover, 150, scrl.default);
		else if ($scroll.is('.scroll-custom')) $scroll.stop(true).scrollTo(Active.hover, 0, scrl.custom);


	});



	Dom.document.on('activity:focusin', function (event, $target, sibling, selector) {

		var $list;
		var $temp;
		var lf = (sibling == 'prev' ? 'last' : 'first');


		if (sibling) {
			if ($target.is('.sui-field')) {
				$list = $target.closest('.sui-view, form').find('.sui-field');
				$temp = $target[sibling + 'Of']($list, true);
				if (!$temp.length) $temp = $target[lf + 'Of']($list, true);
			} else if ($target.is('.sui-widget')) {
				$list = $target.closest('.sui-view').find('.sui-widget');
				$temp = $target[sibling + 'Of']($list, true);
				if (!$temp.length) $temp = $target[lf + 'Of']($list, true);
			} else if ($target.is('a')) {
				$list = $target.closest('.sui-widget, .sui-view, .sui-sector, .navtools, .blocklist, .block');
				if ($list.length) $list = $list.find('a:visible');
				$temp = $target[sibling + 'Of']($list, true);
				if (!$temp.length) $temp = $target[lf + 'Of']($list, true);
			} else if ($target.is('li')) {
				$list = $target.closest('.sui-widget, .sui-view, .sui-sector, .navtools, .blocklist, .block');
				if ($list.length) $list = $list.find('li:visible');
				$temp = $target[sibling + 'Of']($list, true);
				if (!$temp.length) $temp = $target[lf + 'Of']($list, true);
			} else if (selector) {
				$temp = $target[sibling](selector);
				if (!$temp.length) $temp = $(selector + ':visible:' + lf, $target.parent());
			} else {
				$temp = $target[sibling]();
				if (!$temp.length) $temp = $(':visible:' + lf, $target.parent());
			}
			$target = $temp;
		}

		if (Active.focus[0] === $target[0]) return;

		Dom.document.trigger('activity:blur', [true]);

		Active.focus = $target;

		return $temp;
	});

	Dom.document.on('activity:focus', function (event, $target, sibling, selector) {

		Dom.document.trigger('activity:focusin', [$target, sibling, selector]);

		Dom.document.trigger('activity:focustab');
		Dom.document.trigger('activity:select');

		Active.focus.addClass('focus');
		Active.eventPrevent = true;

		var $scroll = Active.focus.closest('.scroll-default, .scroll-custom');
		if ($scroll.is('.scroll-default')) $scroll.stop(true).scrollTo(Active.focus, 200, scrl.default);
		else if ($scroll.is('.scroll-custom')) $scroll.stop(true).scrollTo(Active.focus, 200, scrl.custom);
		//else if ($scroll.is('.scroll-custom')) $scroll.scrollTop(Active.focus.offset().top);

	});

	Dom.document.on('activity:focustab', function (event) {
		var $tab;
		if (Active.focus) {
			if (Active.focus.is('.sui-view') || Active.focus.is('.sui-sector')) {
				$tab = Active.focus.data('tab');
				if ($tab) $tab.addClass('focus');
			}
		}
	});
	Dom.document.on('activity:select', function (event) {
		var $tab;
		if (Active.focus) {
			if (Active.focus.is('.sui-view') || Active.focus.is('.sui-sector')) {
				$tab = Active.focus.data('tab');
				if ($tab) $tab.trigger('click');
			} else if (Active.focus.is('.sui-field')) {
				Active.last.find(':input').blur();
				Active.focus.find(':input:eq(0)').focus();
			} else {
				var $closest = Active.focus.parent().closest('.sui-field, .sui-widget, .sui-view, .sui-sector, .navtools, .blocklist, .block');
				if ($closest.is('.blocklist')) Active.focus.trigger('click');
			}
		}
	});
	Dom.document.on('activity:blur', function (event, $fromin) {
		var $tab;
		if (Active.focus) {
			Active.focus.removeClass('focus');
			if (Active.focus.is('.sui-view') || Active.focus.is('.sui-sector')) {
				$tab = Active.focus.data('tab');
				if ($tab) $tab.removeClass('focus');
			}
			if (!Active.focus.is('.sui-field') && Active.last.is('.sui-field')) {
				//Active.last.find(':input').blur();
			}
			//if (!$fromin) console.trace('blur',Active.focus[0]);
			Active.last = Active.focus;
		}
		Active.focus = $();
	});


	Dom.document.on('keydown', function (event) {

		if (!Dom.aside.length) Dom.aside = $('#suiAsideLeft');
		if (!Dom.main.length) Dom.main = $('#suiMain');

		Active.eventPrevent = false;

		var $focus = Active.focus || $();
		var $hover = Active.hover || $();
		var $temp;
		var $closest = $focus.parent().closest('.sui-widget, .sui-view, .sui-sector, .sui-floatsector-container .navtools, .blocklist, .block, form');
		var $hoverst = $hover.parent().closest('.sui-droplist');

		////////////////////////////////////////////////////
		// NO SPECIAL
		////////////////////////////////////////////////////
		if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
			///////////////////////////
			// TAB
			///////////////////////////
			if (event.which === 9) {
				if (!$focus.length) Dom.document.trigger('activity:focus', [Dom.aside.children('.navtools')]);
				else if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
				else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
				else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.aside.children('.navtools')]);
				else if ($focus.is('.sui-field')) Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-field']);
				else if ($focus.is('.sui-widget')) Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-widget']);
				else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-view']);
				else if ($focus.is('.sui-sector')) Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-sector']);
				else if ($focus.is('.line')) Dom.document.trigger('activity:focus', [$focus, 'next', '.line']);
				else if ($focus.is('li')) Dom.document.trigger('activity:focus', [$focus, 'next', 'li']);
				else if ($focus.is('a')) Dom.document.trigger('activity:focus', [$focus, 'next', 'a']);
				else if ($focus.is('.sui-floatsector-container')) Dom.document.trigger('activity:focus', [$focus.children('.sui-sector')]);
			}
			///////////////////////////
			// ENTER
			///////////////////////////
			else if (event.which === 13) {
				if ($focus.length) {
					if ($focus.is('.focus')) {
						if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [$focus.children('li:first')]);
						else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [$focus.children('li:first')]);
						else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [$focus.find('ol li:first')]);
						else if ($focus.is('.sui-sector')) Dom.document.trigger('activity:focus', [$focus.find('.sui-view.selected:first')]);
						else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus.find('.sui-widget:first')]);
						else if ($focus.is('.sui-widget')) Dom.document.trigger('activity:focus', [$focus.firstFound('.line:first', '.sui-field:first')]);
						else if ($focus.is('.line, li, a') && !$focus.isDisable()) {
							if ($closest.is('.blocklist')) {
								$focus.trigger('click');
								Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
							} else if ($closest.is('.block')) {
								$focus.trigger('click');
								Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector.selected')]);
							} else if ($focus.is('.line')) {
								$focus.trigger('click');
							} else {
								$focus.trigger('click');
								Dom.document.trigger('activity:focus', [$focus]);
							}
						}
						else if ($focus.is('.sui-field')) {
							if ($closest.is('form')) $closest.find('.sui-button .submit').trigger('click');
							else if (!$focus.is('.drop, .search') && $closest.is('.filter')) $closest.closest('.sui-view').children('.toolbar').find('.filter a').trigger('click');
							else if (!$hover.length && !$focus.is('.textarea, .editor') && !$focus.is('[data-link-process="validate"]')) $focus.firstFound('.cell.button').trigger('click');
							else if ($hover.is('li, a')) $hover.trigger('click');
						}
						else if ($focus.is('.sui-floatsector-container')) Dom.document.trigger('activity:focus', [$focus.children('.sui-sector')]);
					} else {
						Dom.document.trigger('activity:focus', [$focus]);
					}
				}
			}
			///////////////////////////
			// SPACE
			///////////////////////////
			else if (event.which === 32) {
				if ($focus.length) {
					if ($focus.is('.focus')) {
						if ($focus.is('.line, li, a') && !$focus.isDisable()) {
							if ($closest.is('.blocklist')) {
								$focus.trigger('click');
								Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
							} else if ($closest.is('.block')) {
								$focus.trigger('click');
								Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector.selected')]);
							} else if ($focus.is('.line')) {
								$focus.trigger('click');
							} else {
								$focus.trigger('click');
								Dom.document.trigger('activity:focus', [$focus]);
							}
						}
						else if ($focus.is('.sui-field')) {
							if (!$hover.length && !$focus.is('.text, .number')) $focus.firstFound('.cell.button').trigger('click');
							else if ($hover.is('li, a')) $hover.trigger('click');
						}
						else if ($focus.is('.sui-floatsector-container')) Dom.document.trigger('activity:focus', [$focus.children('.sui-sector')]);
					} else {
						Dom.document.trigger('activity:focus', [$focus]);
					}
				}
			}
			///////////////////////////
			// ESC
			///////////////////////////
			else if (event.which === 27) {
				if ($focus.length) {
					if ($focus.is('.navtools, .blocklist, .block, .sui-sector')) Dom.document.trigger('activity:focus', [$()]);
					else if ($focus.is('.sui-field')) {
						if ($hoverst.is('.sui-droplist') || $hover.is('.sui-droplist')) $hover.trigger('droplist:close');
						else if ($closest.length) Dom.document.trigger('activity:focus', [$closest]);
					}
					else if ($closest.is('.sui-floatsector-container')) {
						$closest.trigger('click');
					}
					else {
						if ($closest.length) Dom.document.trigger('activity:focus', [$closest]);
					}
				}
			}
			///////////////////////////
			// LEFT
			///////////////////////////
			else if (event.which === 37) {
				if ($focus.length) {
					if ($focus.is('.focus')) {
						if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector:last-of-type')]);
						else if ($closest.is('.navtools')) Dom.document.trigger('activity:focus', [$focus, 'prev', 'li']);
						else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector.selected .sui-view:last')]);
						else if ($closest.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector.selected .sui-view:last')]);
						else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
						else if ($closest.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
						else if ($focus.is('.sui-sector:first-of-type')) Dom.document.trigger('activity:focus', [Dom.aside.children('.navtools')]);
						else if ($focus.is('.sui-sector')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-sector']);
						else if ($focus.is('.sui-view:first-of-type')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
						else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-view']);
						else if ($focus.is('.sui-field')) {
							if ($focus.data('type') == 'date') {
								if ($hover.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover.firstFound('.calendar .selected > a', '.calendar .today > a')]);
								else if ($hoverst.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover, 'prev']);
							}
						}
						else if ($closest.is('.sui-widget')) {
							if ($focus.closest('.toolbar').length) Dom.document.trigger('activity:focus', [$focus, 'prev', 'a']);
						}
					} else {
						Dom.document.trigger('activity:focus', [$focus]);
					}
				}
			}
			///////////////////////////
			// UP
			///////////////////////////
			else if (event.which === 38) {
				if ($focus.length) {
					if ($focus.is('.focus')) {
						if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
						else if ($closest.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
						else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.aside.children('.navtools')]);
						else if ($closest.is('.blocklist')) Dom.document.trigger('activity:focus', [$focus, 'prev', 'li']);
						else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.aside.children('.navtools')]);
						else if ($closest.is('.menu.block')) Dom.document.trigger('activity:focus', [$focus, 'prev', 'li']);
						else if ($focus.is('.sui-widget')) {
							if ($focus.isOnly('.sui-widget', $closest)) Dom.document.trigger('activity:focus', [$focus.closest('.sui-view')]);
							else Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-widget']);
						}
						else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus.closest('.sui-sector')]);
						else if ($focus.is('.sui-field')) {
							if ($focus.data('type') == 'drop' || $focus.data('type') == 'search') {
								if ($hover.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover.find('.options > ul > li:visible:last')]);
								else if ($hoverst.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover, 'prev', 'li']);
							} else if ($focus.data('type') == 'date') {
								if ($hover.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover.firstFound('.calendar .selected > a', '.calendar .today > a')]);
								else if ($hoverst.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover, 'up']);
							}
						}
						else if ($focus.is('.line')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.line']);
						else if ($focus.is('li')) Dom.document.trigger('activity:focus', [$focus, 'prev', 'li']);
					} else {
						Dom.document.trigger('activity:focus', [$focus]);
					}
				}
			}
			///////////////////////////
			// RIGHT
			///////////////////////////
			else if (event.which === 39) {
				if ($focus.length) {
					if ($focus.is('.focus')) {
						if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector:first-of-type')]);
						else if ($closest.is('.navtools')) Dom.document.trigger('activity:focus', [$focus, 'next', 'li']);
						else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
						else if ($closest.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
						else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector.selected .sui-view:first-of-type')]);
						else if ($closest.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.main.find('.sui-sector.selected .sui-view:first-of-type')]);
						else if ($focus.is('.sui-sector:last-of-type')) Dom.document.trigger('activity:focus', [Dom.aside.children('.navtools')]);
						else if ($focus.is('.sui-sector')) Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-sector']);
						else if ($focus.is('.sui-view:last-of-type')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
						else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-view']);
						else if ($focus.is('.sui-field')) {
							if ($focus.data('type') == 'date') {
								if ($hover.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover.firstFound('.calendar .selected > a', '.calendar .today > a')]);
								else if ($hoverst.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover, 'next']);
							}
						}
						else if ($closest.is('.sui-widget')) {
							if ($focus.closest('.toolbar').length) Dom.document.trigger('activity:focus', [$focus, 'next', 'a']);
						}
					} else {
						Dom.document.trigger('activity:focus', [$focus]);
					}
				}
			}
			///////////////////////////
			// DOWN
			///////////////////////////
			else if (event.which === 40) {
				if ($focus.length) {
					if ($focus.is('.focus')) {
						if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
						else if ($closest.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
						else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [$focus.children('li:first')]);
						else if ($closest.is('.blocklist')) Dom.document.trigger('activity:focus', [$focus, 'next', 'li']);
						else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [$focus.find('ol li:first')]);
						else if ($closest.is('.menu.block')) Dom.document.trigger('activity:focus', [$focus, 'next', 'li']);
						else if ($focus.is('.sui-sector')) Dom.document.trigger('activity:focus', [$focus.find('.sui-view.selected')]);
						else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus.find('.sui-widget:first')]);
						else if ($focus.is('.sui-widget')) {
							if ($focus.isOnly('.sui-widget', $closest)) Dom.document.trigger('activity:focus', [$focus.find('.line:first')]);
							else Dom.document.trigger('activity:focus', [$focus, 'next', '.sui-widget']);
						}
						else if ($focus.is('.sui-field')) {
							if ($focus.data('type') == 'drop' || $focus.data('type') == 'search') {
								if ($hover.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover.find('.options > ul > li:visible:first')]);
								else if ($hoverst.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover, 'next', 'li']);
							} else if ($focus.data('type') == 'date') {
								if ($hover.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover.firstFound('.calendar .selected > a', '.calendar .today > a')]);
								else if ($hoverst.is('.sui-droplist')) Dom.document.trigger('activity:hover', [$hover, 'down']);
							}
						}
						else if ($focus.is('.line')) Dom.document.trigger('activity:focus', [$focus, 'next', '.line']);
						else if ($focus.is('li')) Dom.document.trigger('activity:focus', [$focus, 'next', 'li']);
					} else {
						Dom.document.trigger('activity:focus', [$focus]);
					}
				}
			}
		}

		////////////////////////////////////////////////////
		// CTRL
		////////////////////////////////////////////////////
		else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
			///////////////////////////
			// SAVE
			///////////////////////////
			if (event.which === 83) {
				$temp = $focus.closest('.sui-sector');
				if ($temp.length) {
					$temp.find('.sui-view:visible [data-alias="save"]').trigger('click');
					Active.eventPrevent = true;
				}
			}
		}

		////////////////////////////////////////////////////
		// SHIFT
		////////////////////////////////////////////////////
		else if (!event.ctrlKey && event.shiftKey && !event.altKey) {
			///////////////////////////
			// TAB
			///////////////////////////
			if (event.which === 9) {
				if (!$focus.length) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
				else if ($focus.is('.menu.block')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .blocklist')]);
				else if ($focus.is('.blocklist')) Dom.document.trigger('activity:focus', [Dom.aside.find('.navtools')]);
				else if ($focus.is('.navtools')) Dom.document.trigger('activity:focus', [Dom.aside.find('.sui-nav.selected .block.selected')]);
				else if ($focus.is('.sui-field')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-field']);
				else if ($focus.is('.sui-widget')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-widget']);
				else if ($focus.is('.sui-view')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-view']);
				else if ($focus.is('.sui-sector')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.sui-sector']);
				else if ($focus.is('.line')) Dom.document.trigger('activity:focus', [$focus, 'prev', '.line']);
				else if ($focus.is('li')) Dom.document.trigger('activity:focus', [$focus, 'prev', 'li']);
				else if ($focus.is('a')) Dom.document.trigger('activity:focus', [$focus, 'prev', 'a']);
				else if ($focus.is('.sui-floatsector-container')) Dom.document.trigger('activity:focus', [$focus.children('.sui-sector')]);
			}
		}

		////////////////////////////////////////////////////
		// ALT
		////////////////////////////////////////////////////
		else if (!event.ctrlKey && !event.shiftKey && event.altKey) {
			///////////////////////////
			// NEW
			///////////////////////////
			if (event.which === 78) {
				$temp = $focus.closest('.sui-sector');
				if ($temp.length) {
					$temp.find('.sui-view:visible [data-alias="new"]').trigger('click');
					Active.eventPrevent = true;
				}
			}
			///////////////////////////
			// REFRESH
			///////////////////////////
			else if (event.which === 116) {
				$temp = $focus.closest('.sui-sector');
				if ($temp.length) {
					$temp.find('.sui-view:visible [data-alias="refresh"]').trigger('click');
					Active.eventPrevent = true;
				}
			}
		}

		////////////////////////////////////////////////////
		// CTRL + SHIFT
		////////////////////////////////////////////////////
		else if (event.ctrlKey && event.shiftKey && !event.altKey) {
			///////////////////////////
			// REFRESH PAGE TO HOME
			///////////////////////////
			if (event.which === 116) {
				Network.history.home();
				Device.Global.clear(function () {
					Network.cacheClear(function () {
						$('#suiBody').html('');
						Cookies.clear();
						window.location.reload(true);
					});
				});
				Active.eventPrevent = true;
			}
		}



		if (Active.eventPrevent) {
			event.stopPropagation();
			event.preventDefault();
			return false;
		}

	});


};
