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

/**
 * INTERFACE - AUTH
 * @description Interface do autenticador do sistema
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */

sourceui.interface.plugins = function () {

	'use strict';

	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	var isPT = ($('html').attr('lang').indexOf('pt-') > -1);

	Dom.userguide.on('click', '.button a', function () {
		var $a = $(this);
		var $li = $a.parent();
		var $gd = $li.closest('.guide');
		if ($li.is('.next')) {
			Userguide.open($gd.next('.guide'));
		} else if ($li.data('href')) {
			Network.link({
				href: $li.data('href')
			});
		} else if ($li.is('.exit')) {
			Userguide.close();
		} else if ($li.is('.finish')) {
			Userguide.close(true);
		}
	});
	var Userguide = this.userguide = {
		load: function (gd) {
			var $userguide = Dom.userguide.html('');
			var $covers = $('<div class="covers"><div class="cover left"/><div class="cover top"/><div class="cover main"/></div>').appendTo($userguide).children('.cover');
			var $guides = $('<div class="guides"/>').appendTo($userguide);
			$.each(gd, function (kg, g) {
				var html = '', htmg = '', htmf = '';
				htmg += '<div class="guide ' + (g.type || '') + ' ' + (g.target || '') + ' ' + (g.name || '') + ' ' + (g.direction || '') + ' ' + (g.anchor || '') + '">';
				$.each(g.frames, function (kf, f) {
					htmg += '<div class="frame" data-frame="' + kf + '">';
					htmg += '<div class="content">' + f.content + '</div>';
					htmg += '<ul class="buttongroup">';
					$.each(f.buttons || [], function (kb, b) {
						htmg += '<li class="button ' + b.action + '"><a' + (b.href ? ' href="' + b.href + '" target="_blank"' : '') + '>' + b.label + '</a></li>';
					});
					htmg += '</ul>';
					htmg += '</div>';
					htmf += '<li data-frame="' + kf + '"/>';
				});
				htmg += '<ul class="buttongroup">';
				$.each(g.buttons || [], function (kb, b) {
					htmg += '<li class="button ' + b.action + '"><a' + (b.href ? ' href="' + b.href + '" target="_blank"' : '') + '>' + b.label + '</a></li>';
				});
				htmg += '</ul>';
				htmg += '<ul class="index" data-frames="' + g.frames.length + '">' + htmf + '<ul>';
				htmg += '</div>';
				var $gd = $(htmg).appendTo($guides);
				if (g.target == 'panel') {
					if (g.name == 'intro') {
						var $content = $gd.find('.frame:first .content');
						$content.prepend('<h1 class="greetings" style="line-height:1px;"></h1>');
						$content.prepend($('#suiAsideLeft .sui-nav.credentials .avatar').clone());
						$gd.data('greetings', ['OLÁ', '你好嗨', 'HELLO', '안녕', 'HOLA', 'हैलो हाय', 'HALLO', 'שלום היי', 'CIAO', 'こんにちは', 'SALUT', 'ПРИВЕТ', 'HEJ', 'สวัสดี']);
					}
				}
			});
		},
		close: function () {
			var $userguide = Dom.userguide;
			var $covers = $userguide.find('.covers > .cover');
			var $guides = $userguide.find('.guides > .guide');
			$covers.velocity({ opacity: [0, 1] }, { duration: 300 });
			$guides.velocity({ opacity: [0, 1], scale: [0.75, 1] }, {
				duration: 250, complete: function () {
					$userguide.html('');
				}
			});
		},
		open: function (selector) {
			var $userguide = Dom.userguide;
			var $covers = $userguide.find('.covers > .cover');
			var $guides = $userguide.find('.guides > .guide');
			var $current = $guides.filter('.active');
			var $target = $guides.filter(selector);
			var $asideleft = Dom.asideLeft;
			var $blocklist = $asideleft.find('.blocklist');
			var $menublock = $asideleft.find('.menu.block');
			var logoheight = $asideleft.children('.logo').height();
			var htopheight = $('#suiBody > .sui-header-top').height();
			var hbarheight = $('#suiBody > .sui-header-bar').height();
			var headerheight = htopheight + hbarheight;
			var asidewidth = $('#suiAsideLeft').width();
			var docheight = $(document).height();
			var docwidth = $(document).width();
			var sectorwidth = $('#suiSectorsContainer').width();
			var isalreadyactive = false;
			var defaults = {
				top: { left: 0, top: 0, height: headerheight, width: '100%', opacity: 1 },
				left: { left: 0, top: headerheight, height: docheight - headerheight, width: asidewidth, opacity: 1 },
				main: { left: asidewidth, top: headerheight, height: docheight - headerheight, width: sectorwidth, opacity: 1 }
			};
			var coords = {};
			var callback;
			var transitions = {};

			if ($target.is('.active')) isalreadyactive = true;

			if ($current.is('.bubble')) {
				if ($current.is('.left')) transitions.out = { opacity: [0, 1], translateX: [-200, 0] };
				else if ($current.is('.right')) transitions.out = { opacity: [0, 1], translateX: [200, 0] };
				else if ($current.is('.up')) transitions.out = { opacity: [0, 1], translateY: [-200, 0] };
				else if ($current.is('.down')) transitions.out = { opacity: [0, 1], translateY: [200, 0] };
				else transitions.out = { opacity: [0, 1], scale: [0.5, 1] };
			}
			else transitions.out = { opacity: [0, 1], scale: [0.5, 1] };

			if ($target.is('.bubble')) {
				if ($target.is('.left')) transitions.in = { opacity: [1, 0], translateX: [0, 200] };
				else if ($target.is('.right')) transitions.in = { opacity: [1, 0], translateX: [0, -200] };
				else if ($target.is('.up')) transitions.in = { opacity: [1, 0], translateY: [0, 200] };
				else if ($target.is('.down')) transitions.in = { opacity: [1, 0], translateY: [0, -200] };
				else transitions.in = { opacity: [1, 0], scale: [1, 1.5] };
			}
			else transitions.in = { opacity: [1, 0], scale: [1, 1.5] };

			if (isalreadyactive) {
				$current.removeClass('active');
			} else {
				$current.velocity(transitions.out, {
					duration: 300,
					complete: function () {
						$current.removeClass('active');
					}
				});

			}

			if ($target.is('.intro')) {
				coords.top = $.extend(defaults.top, { opacity: [1, 0] });
				coords.left = $.extend(defaults.left, { opacity: [1, 0] });
				coords.main = $.extend(defaults.main, { opacity: [1, 0] });
				callback = function () {
					var $avatar = $target.find('.frame:first .content .avatar');
					var $greets = $target.find('.frame:first .content .greetings');
					$target.addClass('active').velocity({ opacity: [1, 0] }, {
						duration: 300,
						delay: 300,
						complete: function () {
							var idx = 0;
							var greetings = $target.data('greetings');
							setInterval(function () {
								if (!greetings[idx]) idx = 0;
								$greets.html(greetings[idx]);
								idx++;
							}, 555);
						}
					});
					$avatar.velocity({
						scale: [1, 1.5],
					}, {
							duration: 600,
							delay: 300,
							easing: "easeOutSine"
						});
				};
			} else if ($target.is('.blocklist')) {
				coords.top = defaults.top;
				coords.left = $.extend(defaults.left, { left: $blocklist.width(), width: asidewidth - $blocklist.width() });
				coords.main = defaults.main;
				coords.targ = { left: $blocklist.width() + 40, top: headerheight };
				$blocklist.one('click', function () {
					Userguide.open($target.next('.guide'));
				});
			} else if ($target.is('.mainmenu')) {
				coords.top = defaults.top;
				coords.left = $.extend(defaults.left, { left: asidewidth, width: 0 });
				coords.main = defaults.main;
				coords.targ = { left: asidewidth + 40, top: headerheight + 40 };
				$menublock.one('click', function () {
					Dom.document.one('parseui', function () {
						Userguide.open($target.next('.guide'));
					});
				});
			} else if ($target.is('.sector')) {
				coords.top = $.extend(defaults.top, { left: asidewidth, height: htopheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { opacity: 0, top: htopheight, height: docheight - htopheight });
				coords.targ = { left: 'auto', right: (docwidth - asidewidth) / 2, top: '35%', width: 600, marginRight: -300 };
				$covers.filter('.main').one('click', function () {
					Userguide.open($target.next('.guide'));
				});
			} else if ($target.is('.sectortabs')) {
				var $what;
				coords.top = $.extend(defaults.top, { left: asidewidth, height: htopheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { top: headerheight, height: docheight - headerheight });
				coords.targ = { left: asidewidth + 40, top: headerheight + 40 };
				$covers.filter('.main').one('click', function () {
					$what = $('#suiSectorsContainer .sui-sector.selected .sui-sector-title');
					if ($what.length && $guides.filter('.viewtabs')) Userguide.open($guides.filter('.viewtabs'));
					else {
						$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .toolbar');
						if ($what.length && $guides.filter('.toolbar')) Userguide.open($guides.filter('.toolbar'));
						else {
							$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget');
							if ($what.filter('.datagrid').length && $guides.filter('.datagrid')) Userguide.open($guides.filter('.datagrid'));
							else if ($what.filter('.form').length && $guides.filter('.form')) Userguide.open($guides.filter('.form'));
							else if ($guides.filter('.widgets').length) Userguide.open($guides.filter('.widgets'));
							else Userguide.close();
						}
					}
				});
			} else if ($target.is('.viewtabs')) {
				var sectith = $('#suiSectorsContainer .sui-sector.selected .sui-sector-title').height();
				coords.top = $.extend(defaults.top, { left: asidewidth, height: headerheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { top: headerheight + sectith, height: docheight - headerheight + sectith });
				coords.targ = { left: 'auto', right: 40, top: headerheight + sectith + 40 };
				$covers.filter('.main').one('click', function () {
					$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .toolbar');
					if ($what.length && $guides.filter('.toolbar')) Userguide.open($guides.filter('.toolbar'));
					else {
						$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget');
						if ($what.filter('.datagrid').length && $guides.filter('.datagrid')) Userguide.open($guides.filter('.datagrid'));
						else if ($what.filter('.form').length && $guides.filter('.form')) Userguide.open($guides.filter('.form'));
						else if ($guides.filter('.widgets').length) Userguide.open($guides.filter('.widgets'));
						else Userguide.close();
					}
				});
			} else if ($target.is('.toolbar')) {
				var sectith = $('#suiSectorsContainer .sui-sector.selected .sui-sector-title').height();
				var toolbarh = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .toolbar').height();
				coords.top = $.extend(defaults.top, { left: asidewidth, height: headerheight + sectith });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { top: headerheight + sectith + toolbarh, height: docheight - headerheight + sectith + toolbarh });
				coords.targ = { left: asidewidth + 40, top: headerheight + sectith + toolbarh + 40 };
				$covers.filter('.main').one('click', function () {
					$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget');
					if ($what.filter('.datagrid').length && $guides.filter('.datagrid')) Userguide.open($guides.filter('.datagrid'));
					else if ($what.filter('.form').length && $guides.filter('.form')) Userguide.open($guides.filter('.form'));
					else if ($guides.filter('.widgets').length) Userguide.open($guides.filter('.widgets'));
					else Userguide.close();
				});
			} else if ($target.is('.datagrid')) {
				$target.find('.content .action').remove();
				var $widget = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget.datagrid');
				if ($widget.find('.line').length) $target.find('.content').append('<p class="action">Clique em um registro</p>');
				else $target.find('.content').append('<p class="action">Adicione um registro</p>');
				coords.top = $.extend(defaults.top, { left: asidewidth, height: headerheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { opacity: 0, display: 'none', top: headerheight, height: docheight - headerheight });
				coords.targ = { left: 10, width: asidewidth - 20, top: headerheight + 120 };
				Dom.document.one('parseui', function () {
					$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget:eq(0)');
					if ($what.filter('.form').length && $guides.filter('.form')) Userguide.open($guides.filter('.form'));
					else if ($what.filter('.profile').length && $guides.filter('.profile')) Userguide.open($guides.filter('.profile'));
					else if ($what.filter('.datagrid').length && $guides.filter('.datagrid')) Userguide.open($guides.filter('.datagrid'));
					else if ($what.lenght && $guides.filter('.widgets').length) Userguide.open($guides.filter('.widgets'));
					else Userguide.close();
				});
			} else if ($target.is('.form')) {
				$target.find('.content .action').remove();
				var $widget = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget.form');
				if ($widget.find('.sui-field').length) $target.find('.content').append('<p class="action">Altere alguns dados</p>');
				else $target.find('.content').append('<p class="action">Tome alguma ação</p>');
				coords.top = $.extend(defaults.top, { left: asidewidth, height: headerheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { opacity: 0, display: 'none', top: headerheight, height: docheight - headerheight });
				coords.targ = { left: 10, width: asidewidth - 20, top: headerheight + 180 };
				Dom.document.one('parseui', function () {
					$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget:eq(0)');
					if ($what.filter('.profile').length && $guides.filter('.profile')) Userguide.open($guides.filter('.profile'));
					else if ($guides.filter('.overview').length) Userguide.open($guides.filter('.overview'));
					else if ($guides.filter('.navtools').length) Userguide.open($guides.filter('.navtools'));
					else if ($guides.filter('.finish').length) Userguide.open($guides.filter('.finish'));
					else Userguide.close();
				});
			} else if ($target.is('.profile')) {
				$target.find('.content .action').remove();
				var $widget = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget.profile');
				$target.find('.content').append('<p class="action">Tome alguma ação</p>');
				coords.top = $.extend(defaults.top, { left: asidewidth, height: headerheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { opacity: 0, display: 'none', top: headerheight, height: docheight - headerheight });
				coords.targ = { left: 10, width: asidewidth - 20, top: headerheight + 180 };
				Dom.document.one('parseui', function () {
					$what = $('#suiSectorsContainer .sui-sector.selected .sui-view.selected .sui-widget:eq(0)');
					if ($what.filter('.form').length && $guides.filter('.form')) Userguide.open($guides.filter('.form'));
					else if ($guides.filter('.widgets').length) Userguide.open($guides.filter('.widgets'));
					else if ($guides.filter('.overview').length) Userguide.open($guides.filter('.overview'));
					else if ($guides.filter('.navtools').length) Userguide.open($guides.filter('.navtools'));
					else if ($guides.filter('.finish').length) Userguide.open($guides.filter('.finish'));
					else Userguide.close();
				});
			} else if ($target.is('.widgets')) {
				coords.top = $.extend(defaults.top, { left: asidewidth, height: headerheight });
				coords.left = $.extend(defaults.left, { top: 0, height: docheight });
				coords.main = $.extend(defaults.main, { opacity: 0.5, display: 'block', top: headerheight, height: docheight - headerheight });
				coords.targ = { left: 'auto', right: (docwidth - asidewidth) / 2, top: '35%', width: 600, marginRight: -300 };
				$covers.filter('.main').one('click', function () {
					if ($guides.filter('.overview').length) Userguide.open($guides.filter('.overview'));
					else if ($guides.filter('.navtools').length) Userguide.open($guides.filter('.navtools'));
					else if ($guides.filter('.finish').length) Userguide.open($guides.filter('.finish'));
					else Userguide.close();
				});
			} else if ($target.is('.overview')) {
				var content = $target.data('guidecontent');
				if (content) {
					$target.removeClass('no-pointer').find('.content').html(content);
					coords.top = $.extend(defaults.top, { left: asidewidth, height: htopheight });
					coords.left = $.extend(defaults.left, { top: 0, height: docheight });
					coords.main = $.extend(defaults.main, { opacity: 0, display: 'block', top: htopheight, height: docheight - htopheight });
					coords.targ = { left: 10, width: asidewidth - 20, top: htopheight + 120 };
					$covers.filter('.main').one('click', function () {
						if ($guides.filter('.navtools').length) Userguide.open($guides.filter('.navtools'));
						else if ($guides.filter('.finish').length) Userguide.open($guides.filter('.finish'));
						else Userguide.close();
					});
				} else {
					content = $target.find('.content').html();
					$target.addClass('no-pointer').find('.content').html('<p class="action">Clique no Logotipo</p>');
					$target.data('guidecontent', content);
					coords.top = $.extend(defaults.top, { left: asidewidth });
					coords.left = $.extend(defaults.left, { top: logoheight, height: docheight - logoheight });
					coords.main = defaults.main;
					coords.targ = { left: asidewidth + 20, top: 20 };
					Dom.asideLeft.find('.logo').one('click', function () {
						Userguide.open($guides.filter('.overview'));
					});
				}
			} else if ($target.is('.navtools')) {
				coords.top = $.extend(defaults.top, { opacity: 0 });
				coords.left = $.extend(defaults.left, { top: htopheight, height: docheight - htopheight });
				coords.main = $.extend(defaults.main, { top: htopheight, height: docheight - htopheight });
				coords.targ = { left: 'auto', right: 40, top: htopheight + 40 };
				$covers.filter('.top').one('click', function () {
					if ($guides.filter('.finish').length) Userguide.open($guides.filter('.finish'));
					else Userguide.close();
				});
			} else if ($target.is('.finish')) {
				coords.top = defaults.top;
				coords.left = defaults.left;
				coords.main = defaults.main;
				coords.targ = { left: (docwidth) / 2, width: 680, marginLeft: -340 };
			}
			var velocfg = {};
			if (coords.top.display) velocfg.top = { display: coords.top.display };
			if (coords.left.display) velocfg.left = { display: coords.left.display };
			if (coords.main.display) velocfg.main = { display: coords.main.display };
			$covers.filter('.top').velocity(coords.top, $.extend(velocfg.top || {}, { duration: 300 }));
			$covers.filter('.left').velocity(coords.left, $.extend(velocfg.left || {}, { duration: 300 }));
			$covers.filter('.main').velocity(coords.main, $.extend(velocfg.main || {}, { duration: 300 }));
			$target.css(coords.targ || {});
			if (!callback) {
				$target.addClass('active').velocity(transitions.in, { duration: 300, easing: "easeOutSine" });
			} else {
				callback();
			}

		}
	};

	var Notification = this.notification = {

		clear: function () {
			$('#suiAsideLeft nav[data-alias="notifications"] .block ol').html('');
			Notification.badge();
		},
		empty: function () {
			var $notif = $('#suiAsideLeft nav[data-alias="notifications"] .notif');
			$notif.prevAll('.empty').remove();
			$notif.before(
				'<div class="sui-tip empty icon-info" style="background-color:#FFFFFF20">' +
				'<strong>Tudo em Ordem</strong><br />Não ha notificações aqui para você.' +
				'</div>'
			);
		},
		add: function (html) {
			var $li = $(html);
			var $ol = $('#suiAsideLeft nav[data-alias="notifications"] .block ol');
			$ol.prepend($li);
			$ol.closest('nav').find('.empty').remove();
			Notification.badge();
			if (window.location.href.indexOf($li.attr('id')) > -1) {
				$li.trigger('click');
			}
		},
		badge: function () {
			var $navtool = $('#suiAsideLeft .navtools > .notifications');
			var number = $('#suiAsideLeft nav[data-alias="notifications"] .block ol li.new').length;
			//if (!$navtool.is('.selected')) {
				var $mark = $navtool.find('mark');
				if (number > 0) {
					var $leftcollapser = $('#suiMain > .sui-tabs [data-alias="leftcollapser"]');
					$leftcollapser.addClass('notified');
					$navtool.addClass('notified');
					$mark.text(number);
					$('head link[data-notified]').each(function(){ var $e=$(this); $e.attr('href',$e.data('notified')); });
				}
			//}
		},
		permitip: function () {
			var Socket = sourceui.instances.socket;
			var $notif = $('#suiAsideLeft nav[data-alias="notifications"] .notif');
			$notif.before(
				'<div class="sui-tip warning">' +
				'<h3>Permissão pendente</h3><br/>Seu navegador ainda não tem permissão para receber notificações em segundo plano.' +
				'<div class="sui-buttonset">' +
				'<ul class="group">' +
				'<li><div class="sui-button"><a class="icon-checkmark5">Solicitar Permissão</a></div></li>' +
				'</ul>' +
				'</div>' +
				'</div>'
			);
			$notif.prev('.sui-tip').find('.sui-button > a').on('click', function () {
				Socket.permission();
			});
		},
		shown: function () {
			var Socket = sourceui.instances.socket;
			$('#suiAsideLeft .navtools > .notifications').removeClass('notified').find('mark').text('');
			$('#suiMain > .sui-tabs [data-alias="leftcollapser"]').removeClass('notified');
			$('head link[data-notified]').each(function(){ var $e=$(this); $e.attr('href',$e.data('original')); });
			if (Socket) Socket.emit('list:shown', 'notification');
		},
		readed: function ($li) {
			var Socket = sourceui.instances.socket;
			if ($li) {
				var readed = $li.hasClass('readed');
				if (!readed) {
					$li.removeClass('new shown').addClass('readed');
					if (Socket) Socket.emit('message:read', 'notification', $li.attr('id'));
				}
			}
		},
	};

	var Notify = this.notify = {
		timeout: null,
		close: function ($cur) {
			if ($cur) {
				if (typeof $cur == 'string') $cur = Dom.notifyContainer.find('ol li[data-id="' + $cur + '"]');
				else if (!$cur.is('li')) $cur = Dom.notifyContainer.find('ol li[data-id="' + $cur.attr('id') + '"]');
				var $nxt = ($cur.is(':first')) ? $cur.next() : $cur.prev();
				if ($nxt.length) {
					var $ntfs = Dom.notifyContainer.children('div').children('section');
					Notify.navTo($nxt, true, function () {
						$cur.remove();
						$ntfs.filter('#' + $cur.data('id')).remove();
					});
					return true;
				}
			}
			Dom.notifyContainer.velocity({ opacity: [0, 1], translateY: [75, 0] }, {
				duration: 220, complete: function () {
					Dom.notifyContainer.removeClass('active');
					Dom.notifyContainer.html('');
				}, display: 'none'
			}, 'easeOutQuad');
		},
		navTo: function ($nxt, animate, callback) {
			if (typeof $nxt == 'string') $nxt = Dom.notifyContainer.find('ol li[data-id="' + $nxt + '"]');
			else if (!$nxt.is('li')) $nxt = Dom.notifyContainer.find('ol li[data-id="' + $nxt.attr('id') + '"]');
			if ($nxt.length && !$nxt.is('.current')) {
				clearTimeout(Notify.timeout);
				var $ntfs = Dom.notifyContainer.children('div').children('section');
				var $cur = $nxt.siblings('.current');
				var isBefore = $cur.prevAll().filter('[data-id="' + $nxt.data('id') + '"]').length ? true : false;
				if (animate !== false) {
					if (isBefore) {
						$ntfs.filter('#' + $cur.data('id')).velocity('stop').velocity({ opacity: [0, 1], translateX: [150, 0] }, { duration: 220, display: 'none' }, 'easeOutQuad');
						$ntfs.filter('#' + $nxt.data('id')).velocity('stop').velocity({ opacity: [1, 0], translateX: [0, -150] }, { duration: 222, display: 'block' }, 'easeOutQuad');
					} else {
						$ntfs.filter('#' + $cur.data('id')).velocity('stop').velocity({ opacity: [0, 1], translateX: [-150, 0] }, { duration: 220, display: 'none' }, 'easeOutQuad');
						$ntfs.filter('#' + $nxt.data('id')).velocity('stop').velocity({ opacity: [1, 0], translateX: [0, 150] }, { duration: 222, display: 'block' }, 'easeOutQuad');
					}
				} else {
					$ntfs.filter('#' + $cur.data('id')).hide().css({ opacity: 0, transform: 'translateX(0)' });
					$ntfs.filter('#' + $nxt.data('id')).show().css({ opacity: 1, transform: 'translateX(0)' });
				}
				if (callback) callback.call(this);
				$cur.removeClass('current');
				$nxt.addClass('current');
			}
		},
		add: function (notify) {
			var htmlNotify = Template.get('notify', 'container', {
				debug: Debug ? 'debug' : '',
				type: notify.type || '',
				position: notify.position || '',
				level: notify.level || '',
				icon: notify.icon ? (notify.icon.indexOf('icon-') > -1 ? notify.icon : 'icon-' + notify.icon) : '',
				image: notify.image,
				color: 'background-color:' + notify.color + ';',
				showimage: notify.image ? 'block' : 'none',
				id: notify.id || '',
				name: notify.name ? '<h2>' + notify.name + '</h2>' : '',
				message: decodeURIComponent(notify.message) || '',
				label: notify.label || '',
			});
			var $notify = $(htmlNotify);
			var $div = Dom.notifyContainer.children('div');
			var $ol = Dom.notifyContainer.children('ol');
			if (!$div.length) $div = $('<div/>').prependTo(Dom.notifyContainer);
			if (!$ol.length) $ol = $('<ol/>').appendTo(Dom.notifyContainer);
			$div.append($notify);
			var $li = $('<li data-id="' + notify.id + '"><div><a style="background:' + $notify.css('background') + ';"/></div></li>');
			$ol.append($li);
			$notify.on('swipedown',function(event){
				$div.find('section:first .close').click();
			});
			$notify.find('.close').on('click', function (event) {
				Notify.close($notify);
			});
			$li.on('click', function () {
				Notify.navTo($li);
			});
			var isActive = Dom.notifyContainer.is('.active');
			if (!isActive) {
				Notify.navTo($notify, false);
				Dom.notifyContainer.velocity('stop').velocity({ opacity: [1, 0], translateY: [0, 75] }, { duration: 220, complete: function () { Dom.notifyContainer.addClass('active'); }, display: 'block' }, 'easeOutQuad');
			} else {
				Notify.navTo($notify, isActive);
			}
		},
		open: function (notify) {
			if (notify.type == 'log') notify.icon = notify.icon || 'info';
			else if (notify.type == 'info') notify.icon = notify.icon || 'info';
			else if (notify.type == 'alarm') notify.icon = notify.icon || 'notify';
			else if (notify.type == 'valid') notify.icon = notify.icon || 'check';
			else if (notify.type == 'warn') notify.icon = notify.icon || 'alert';
			else if (notify.type == 'error') notify.icon = notify.icon || 'stop-cross';
			else if (notify.type == 'fail') notify.icon = notify.icon || 'bug22';
			else if (notify.type == 'fatal') notify.icon = notify.icon || 'bug22';
			else if (notify.type == 'bug') notify.icon = notify.icon || 'bug22';
			if (notify.type == 'error') notify.title = notify.title || 'Ops...';
			else if (notify.type == 'fail') notify.title = notify.title || 'Foi mal...';
			else if (notify.type == 'fatal') notify.title = notify.title || 'Oh não...';
			notify.type = notify.type || 'normal';
			notify.id = $.md5(Date.now + Math.random() + notify.type + notify.name + notify.label + notify.message);
			notify.duration = notify.duration || 8000;
			notify.timeout = null;
			Notify.add(notify);
			Notify.timeout = setTimeout(function () {
				Notify.close();
			}, notify.duration);
			$('#suiTipster').html('');
		}
	};

	var Notifyx = this.notifyx = {
		list: [],
		exec: function () {
			if (Notify.list.length) {
				var notify = Notify.list[0];
				var htmlNotify = Template.get('notify', 'container', {
					debug: Debug ? 'debug' : '',
					type: notify.type || '',
					position: notify.position || '',
					level: notify.level || '',
					icon: notify.icon ? (notify.icon.indexOf('icon-') > -1 ? notify.icon : 'icon-' + notify.icon) : '',
					image: notify.image,
					color: 'background-color:' + notify.color + ';',
					showimage: notify.image ? 'block' : 'none',
					id: notify.id || '',
					name: notify.name ? '<h2>' + notify.name + '</h2>' : '',
					message: decodeURIComponent(notify.message) || '',
					label: notify.label || '',
				});
				var $notify = notify.jq = $(htmlNotify);
				var npos;
				Dom.notifyContainer.append($notify);
				if (notify.position == 'top-right') {
					npos = { opacity: [1, 0], translateX: [0, 50] };
				} else {
					npos = { opacity: [1, 0], translateY: [0, 50] };
				}
				$notify.css({ opacity: 0 });
				$notify.velocity(npos, {
					duration: 220,
					complete: function () {
						notify.timeout = setTimeout(function () {
							Notify.close();
						}, notify.duration);
					}
				}, 'easeOutQuad');
				$notify.find('.close').on('click', function (event) {
					Notify.close();
				});
				if (notify.position == 'top-right') {
					$notify.on('swiperight', function (event) {
						$notify.find('.close').trigger('click');
						event.stopPropagation();
					});
				} else {
					$notify.on('swipebottom', function (event) {
						$notify.find('.close').trigger('click');
						event.stopPropagation();
					});
				}
				if (notify.type == 'error' || notify.type == 'fail' || notify.type == 'fatal') {
					Device.audio.file('./audio/error.mp3', 0.3, true);
				}
			}
		},
		close: function () {
			var notify = Notify.list[0];
			var $notify = notify.jq;
			var npos;
			if (notify && notify.timeout) clearTimeout(notify.timeout);
			if (Notify.list.length - 1 > 1) {
				Dom.notifyBadge.text('+' + (Notify.list.length - 2)).velocity({ scale: 1.8 }, 150).velocity({ scale: 1 }, 150);
			} else {
				Dom.notifyBadge.velocity({ scale: 0 }, 100);
			}
			if (notify.position == 'top-right') {
				npos = { opacity: 0, translateX: 50 };
			} else {
				npos = { opacity: 0, translateY: 50 };
			}
			$notify.velocity(npos, {
				duration: 200,
				complete: function () {
					$notify.remove();
					Notify.list.shift();
					Notify.exec();
				}
			}, 'easeInQuad');
		},
		open: function (notify) {
			if (notify.type == 'log') notify.icon = notify.icon || 'info';
			else if (notify.type == 'info') notify.icon = notify.icon || 'info';
			else if (notify.type == 'alarm') notify.icon = notify.icon || 'notify';
			else if (notify.type == 'valid') notify.icon = notify.icon || 'check';
			else if (notify.type == 'warn') notify.icon = notify.icon || 'alert';
			else if (notify.type == 'error') notify.icon = notify.icon || 'stop-cross';
			else if (notify.type == 'fail') notify.icon = notify.icon || 'bug22';
			else if (notify.type == 'fatal') notify.icon = notify.icon || 'bug22';
			else if (notify.type == 'bug') notify.icon = notify.icon || 'bug22';
			if (notify.type == 'error') notify.title = notify.title || 'Ops...';
			else if (notify.type == 'fail') notify.title = notify.title || 'Foi mal...';
			else if (notify.type == 'fatal') notify.title = notify.title || 'Oh não...';
			notify.type = notify.type || 'normal';
			notify.id = $.md5(notify.type + notify.name + notify.label + notify.message);
			notify.duration = notify.duration || 800000;
			notify.timeout = null;
			$.each(Notify.list || [], function (i, n) {
				if (n.id == notify.id) notify.ignore = true;
			});
			if (!notify.ignore) {
				if (Notify.list.length === 0) {
					Notify.list.push(notify);
					Notify.exec();
				} else {
					Notify.list.push(notify);
				}
				if (Notify.list.length > 1) {
					if (Dom.notifyBadge.is(':visible')) {
						Dom.notifyBadge.text('+' + (Notify.list.length - 1)).velocity({ scale: 1.8 }, 150).velocity({ scale: 1 }, 150);
					} else {
						Dom.notifyBadge.text('+' + (Notify.list.length - 1)).show().velocity({ scale: [1.8, 0] }, 300).velocity({ scale: 1 }, 150);
					}
				}
			}
		}
	};


	var Confirm = this.confirm = {
		open: function (confirm) {
			if (Dom.confirmContainer.is('.opened')) {
				console.warn('Confirm screen is already opened');
				return;
			}
			confirm.desc = confirm.desc || confirm.description || confirm.message;
			confirm.type = confirm.type || 'normal';
			confirm.icon = confirm.icon || 'faq7';
			confirm.id = $.md5(confirm.type + confirm.title + confirm.label + confirm.desc);
			var htmlButton = '';
			confirm.buttonlink = confirm.buttonlink ? ($.isArray(confirm.buttonlink)) ? confirm.buttonlink : [confirm.buttonlink] : [];
			var htmlConfirm = Template.get('confirm', 'container', {
				type: confirm.type || '',
				icon: confirm.icon ? (confirm.icon.indexOf('icon-') > -1 ? confirm.icon : 'icon-' + confirm.icon) : '',
				id: confirm.id || '',
				title: confirm.title || '',
				desc: confirm.desc || 'Confirmar ação?',
				hilite: confirm.hilite || '',
			});
			var $confirm = $(htmlConfirm).hide();
			var $content = $confirm.find('.content');
			var $button;
			var buttons = {};
			if ($.isPlainObject(confirm.buttonlink)) confirm.buttonlink = [confirm.buttonlink];
			$.each(confirm.buttonlink || [], function (k, v) {
				if (v.data('link-sui')) {
					var cs = { background: '#E85348' };
					var bg = cs.background;
				} else {
					var cs = css2obj(v.is('a') ? v.parent().attr('style') : v.attr('style'));
					var bg = confirm.buttonscolor || cs['background-color'] || cs['background'] || v.parent().css('background') || v.parent().css('background-color') || v.css('background') || v.css('background-color') || '';
					bg = (bg.indexOf('rgba(0, 0, 0, 0)') > -1) ? cs['color'] || v.css('color') : bg;
				}
				buttons['lnk' + k] = {
					type: 'link',
					label: (v.attr('title') || v.attr('alt') || v.data('linkTitle') || v.text() || 'Prosseguir').replace('...', ''),
					color: (cs['background-color'] || cs['background']) ? '#FFF' : v.css('color'),
					background: bg,
					callback: function () {
						v.data('link-ignoreconfirm', true).trigger('click', [true]).removeData('link-ignoreconfirm');
					}
				};
			});
			if ($.isPlainObject(confirm.button)) confirm.button = [confirm.button];
			$.each(confirm.button || [], function (k, v) {
				if (v.link) {
					v.callback = function () {
						if (confirm.trigger) {
							v.link.ignoresector = true;
							v.link.ignoreconfirm = true;
							Network.link.call(confirm.trigger, v.link);
						}
					};
				}
				buttons['btn' + k] = v;
			});
			if (confirm.type == 'normal') {
				buttons.cancel = {
					type: 'cancel',
					label: 'Cancelar',
				};
			}
			$.each(buttons || [], function (k, v) {
				htmlButton = Template.get('confirm', 'button', {
					class: { type: v.type || 'button' },
					attr: { href: v.href, target: v.target },
					style: { background: v.background, color: v.color },
					label: { button: v.label || v.name || v.title }
				});
				$button = $(htmlButton);
				$confirm.find('.buttons').append($button);
				if (v.clipboard) {
					var cb = new ClipboardJS($button[0], {
						text: function (trigger) {
							if ($.tipster.notify) $.tipster.notify('Dado copiado');
							return v.clipboard;
						}
					});
					cb.on('success', function (e) {
						$confirm.addClass('disable');
						Confirm.close();
						e.clearSelection();
					});
					cb.on('error', function (e) {
						Notify.open({
							type: 'error',
							name: isPT ? 'Copiar' : 'Copy',
							message: isPT ? 'Dados não foram copiados para a memória' : 'Data were not copied to clipboard',
						});
					});
				} else {
					$button.find('a').on('click', function (event) {
						if ($confirm.hasClass('.disable')) return;
						if (v.callback) v.callback.call(this);
						$confirm.addClass('disable');
						Confirm.close();
					});
				}
			});
			Dom.confirmContainer.html($confirm);
			Dom.confirmContainer.addClass('opened');
			$confirm.velocity({
				opacity: [1, 0]
			}, {
					duration: 200,
					display: 'block',
					complete: function () {
						Dom.body.addClass('confirmed');
					}
				});
			if (Device.ismobile) {
				$content.velocity({
					translateY: [0, 50]
				}, {
						duration: 200,
					}, 'easeOutQuad');
			}
			$.CURR.confirm = true;
			Device.audio.file('./audio/confirm.mp3', 0.3, true);
			$confirm.off('confirm:close');
			if (confirm.onclose){
				$confirm.one('confirm:close', confirm.onclose);
			}
		},
		close: function () {
			$.CURR.confirm = null;
			var $confirm = Dom.confirmContainer.find('.sui-confirm');
			$confirm.velocity((Device.ismobile) ? {
				opacity: [0, 1],
				translateY: [50, 0]
			} : {
					opacity: [0, 1]
				}, {
					duration: 200,
					complete: function () {
						$confirm.remove();
					}
				}, 'easeOutQuad');
			Dom.body.removeClass('confirmed');
			Dom.confirmContainer.removeClass('opened');
			$confirm.trigger('confirm:close');
		}
	};

	$.imgEditor = {
		data: {},
		asset: 'crop',
		assets: { 'view': true, 'desc': false, 'filter': false, 'crop': true },
		actions: { 'download': true, 'resetpos': true, 'remove': true },
		source: false,
		canvas: { width: null, height: null },
		onopen: function () { },
		onload: function () { },
		ondone: function () { },
		oncancel: function () { },
		onclose: function () { },
		onrotate: function () { },
		onfilter: function () { },
		oncrop: function () { },
		onremove: function () { },
		loaded: {}
	};

	var imgEditor = this.imgEditor = {
		dom: {},
		imagedata: {},
		defaults: function (setup) {
			var editor = imgEditor;
			setup = setup || {};
			editor.data = setup.data || $.imgEditor.data;
			editor.editions = setup.editions || $.imgEditor.editions;
			editor.caption = setup.caption || $.imgEditor.caption;
			editor.canvas = setup.canvas || $.imgEditor.canvas;
			editor.asset = setup.asset || $.imgEditor.asset;
			editor.assets = setup.assets || $.imgEditor.assets;
			editor.actions = setup.actions || $.imgEditor.actions;
			editor.source = setup.source || $.imgEditor.source;
			editor.image = setup.image || $.imgEditor.image;
			editor.crop = setup.crop || $.imgEditor.crop;
			editor.onopen = setup.onopen || $.imgEditor.onopen;
			editor.onload = setup.onload || $.imgEditor.onload;
			editor.ondone = setup.ondone || $.imgEditor.ondone;
			editor.oncancel = setup.oncancel || $.imgEditor.oncancel;
			editor.onclose = setup.onclose || $.imgEditor.onclose;
			editor.onrotate = setup.onrotate || $.imgEditor.onrotate;
			editor.onfilter = setup.onfilter || $.imgEditor.onfilter;
			editor.oncrop = setup.oncrop || $.imgEditor.oncrop;
			editor.oncaption = setup.oncaption || $.imgEditor.oncaption;
			editor.onremove = setup.onremove || $.imgEditor.onremove;
			editor.loaded = setup.loaded || $.imgEditor.loaded;
		},
		load: {
			view: function () {
				var editor = imgEditor;
				if (editor.loaded.view) return;
				var $edition = editor.dom.editions.filter('.view');
				var $stage = $edition.children('.stage');
				var $buttons = $edition.find('.buttons > li > a');
				if (editor.imagelite){
					var $image = $('<img src="'+editor.imagelite+'"/>');
					$image.one('load', function () {
						$image.trigger('prepared');
						$image.attr('src',editor.image.attr('src'));
					});
				} else {
					var $image = editor.image.clone();
					$image.on('load', function () {
						$image.trigger('prepared');
					});
				}
				$image.on('prepared', function () {
					$image.appendTo($stage);
					var stg = {
						width: $stage.width(),
						height: $stage.height()
					};
					var ratio = $image.width() / $image.height();
					if (!ratio || ratio >= 1) {
						$image.css('width', stg.width + 'px');
						$image.css('margin', Math.floor((stg.height - $image.height()) / 2) + 'px 0');
					} else {
						$image.css('height', stg.height + 'px');
						$image.css('margin', '0 ' + Math.floor((stg.width - $image.width()) / 2) + 'px');
					}
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
					$buttons.filter('.download').on('click', function () {
						download(editor.image.attr('src'));
					});
					$buttons.filter('.reset').on('click', function () {
						$image.panzoom("reset");
					});
					$buttons.filter('.remove').on('click', function () {
						Confirm.open({
							title: isPT ? 'Remover Imagem' : 'Remove Image',
							desc: isPT ? 'Você está prestes a remover a imagem selecionada.' : 'You are about to remove selected image',
							hilite: isPT ? 'Essa ação não pode ser desfeita.' : 'This action can\'t be undone.',
							button: {
								label: isPT ? 'Prosseguir' : 'Proceed',
								background: '#ce3d3d',
								callback: function () {
									editor.close();
									editor.onremove.call(undefined, editor.source);
								}
							}
						});
					});
				});
				editor.loaded.view = $image;
			},
			desc: function () {
				var editor = imgEditor;
				if (editor.loaded.desc) return;
				editor.loaded.desc = true;
			},
			filter: function () {
				var editor = imgEditor;
				if (editor.loaded.filter) return;
				editor.loaded.filter = true;
			},
			crop: function () {
				var editor = imgEditor;
				if (editor.loaded.crop) return;
				var $edition = editor.dom.editions.filter('.crop');
				var $stage = $edition.children('.stage');
				var $buttons = $edition.find('.buttons > li > a');
				var size = {
					width: $stage.width(),
					height: $stage.height()
				};
				var $image = editor.image.clone().css({
					'opacity': 0,
					'width': size.width + 'px',
					'height': size.height + 'px'
				});
				$image.on('load', function () {
					if (editor.crop && typeof editor.crop.aspectRatio == 'string'){
						var aspr = editor.crop.aspectRatio.split('/');
						var aspectRatio = parseInt(aspr[0]) / parseInt(aspr[1]);
					}
					$image.appendTo($stage);
					$image.cropper({
						data: editor.data.crop,
						aspectRatio: aspectRatio || 1 / 1,
						viewMode: 1,
						dragMode: 'move',
						autoCropArea: Device.ismobile ? 0.85 : 0.65,
						restore: false,
						guides: false,
						highlight: false,
						cropBoxMovable: false,
						cropBoxResizable: false,
						minContainerWidth: size.width,
						minContainerHeight: size.heght
					});
					var $ruler = $('<div class="angleruler"/>');
					var $rotccw = $('<a class="rotate ccw icon-rotate-ccw"/>');
					var $rotcw = $('<a class="rotate cw icon-rotate-cw"/>');
					var rotate = 0;
					var pinchreach = false;
					$image.on('built.cropper', function () {
						$stage.find('.cropper-modal').append($ruler);
						$stage.append($rotccw);
						$stage.append($rotcw);
						$rotccw.on('click', function () {
							$image.cropper('rotate', -90);
						});
						$rotcw.on('click', function () {
							$image.cropper('rotate', 90);
						});
					});
					$stage.on('pinchstart', function (event) {
						rotate = $image.cropper('getImageData').rotate;
					});
					$stage.on('pinchmove', function (event) {
						if (!pinchreach) {
							if (event.pinch.rotation > 10) {
								pinchreach = -10;
							} else if (event.pinch.rotation < -10) {
								pinchreach = 10;
							}
						}
						if (pinchreach) {
							$ruler.velocity({ 'opacity': 1, 'rotateZ': ((event.pinch.rotation + pinchreach) + rotate) + 'deg' }, { duration: 1, display: 'block' });
							$image.cropper('rotateTo', (event.pinch.rotation + pinchreach) + rotate);
						}
					});
					$stage.on('pinch', function (event) {
						$ruler.velocity({ 'opacity': 0 }, { duration: 200, display: 'none' });
						pinchreach = false;
					});
					$buttons.filter('.done').one('click', function () {
						var cropdata = $image.cropper('getData');
						var cropcanvas = $image.cropper('getCroppedCanvas', editor.canvas);
						editor.oncrop.call(undefined, cropdata, cropcanvas);
						editor.close();
					});
				});
				editor.loaded.crop = $image;
			},
			close: function () {
				var editor = imgEditor;
				if (editor.loaded.close) return;
				editor.loaded.close = true;
			},
		},
		data: function (type) {
			var editor = imgEditor;
			if (!type || type == 'filter') {
				editor.imagedata[type] = editor.loaded.filter.data('filter');
			} else if (!type || type == 'desc') {
				editor.imagedata[type] = editor.loaded.desc.data('description');
			} else if (!type || type == 'crop') {
				editor.imagedata[type] = editor.loaded.crop.cropper('getData');
			}
			return type ? editor.imagedata[type] : editor.imagedata;
		},
		unload: {
			view: function () {
				var editor = imgEditor;
				if (!editor.loaded.view) return;
				editor.loaded.view.panzoom('destroy');
				editor.loaded.view.parent().html('');
				editor.loaded.view = null;
			},
			desc: function () {
				var editor = imgEditor;
				if (!editor.loaded.desc) return;
				editor.loaded.desc = null;
			},
			filter: function () {
				var editor = imgEditor;
				if (!editor.loaded.filter) return;
				editor.loaded.filter = null;
			},
			crop: function () {
				var editor = imgEditor;
				if (!editor.loaded.crop) return;
				editor.loaded.crop.cropper('destroy');
				editor.loaded.crop.parent().html('');
				editor.loaded.crop = null;
			}
		},
		open: function (setup) {
			var editor = imgEditor;
			editor.imagedata = {};
			editor.defaults(setup);
			editor.source = setup.source || false;
			editor.source = (typeof (editor.source) == 'string') ? $(editor.source) : editor.source;

			if (editor.source.hasClass('sui-field')) {
				editor.file = (!editor.file || editor.file.length === 0) ? editor.source.find('.image:eq(0)') : editor.file;
				editor.image = editor.file.find('.crop > img');
				if (!editor.image.length) {
					console.error('Image source from field ' + editor.source.data('name') + ' is required for edition.');
					return;
				}
				$.extend(true, editor.data, editor.file.data('file'));
			}
			var closest = editor.source.closest('.sui-field');
			if (closest.length) {
				if (editor.source.hasClass('file')) {
					editor.file = editor.source;
					editor.image = editor.file.find('img');
					editor.imagelite = editor.file.find('.cover').css('background-image');
					editor.imagelite = editor.imagelite ? editor.imagelite.substring(5,editor.imagelite.length-3) : null;
					if (!editor.image.length) {
						console.error('Image source from field ' + editor.source.data('name') + ' is required for edition.');
						return;
					}
				} else if (editor.source.get(0).tagName == 'IMG') {
					editor.file = closest.find('.image:eq(0)');
					editor.image = editor.source;
				}
				editor.source = closest;
				$.extend(true, editor.data, editor.file.data('file'));
			} else if (editor.source.get(0).tagName !== 'IMG') {
				closest = editor.source.closest('.sui-widget.datagrid');
				if (closest.length) {
					if (editor.source.hasClass('line')) {
						editor.file = editor.source;
						editor.image = $('<img src="' + editor.file.data('src') + '"/>');
					}
				}
			} else {
				console.error('Source is required for image edition.');
				return;
			}

			editor.dom.element = $('#suiImgEditor');
			editor.dom.element.data('crop', {});

			if ($.isArray(editor.assets)) {
				var assets = {};
				$.each(editor.assets, function (k, v) {
					assets[v] = true;
				});
				editor.assets = assets;
			}
			if ($.isArray(editor.actions)) {
				var actions = {};
				$.each(editor.actions, function (k, v) {
					actions[v] = true;
				});
				editor.actions = actions;
			}
			var htmlAssets = '';
			var htmlEdition = '';
			var htmlCaption = ''
			var htmlButtons = '';
			var $assets = {};
			if (editor.assets.view) {
				if (editor.caption) htmlButtons += Template.get('imgeditor', 'button', { class: { cell: 'iconed', type: 'done disable', icon: 'disk' }, alt: 'Salvar Legenda' });
				htmlButtons += Template.get('imgeditor', 'button', { class: { type: 'cancel' }, label: { name: 'Fechar' } });
				if (editor.actions.download) htmlButtons += Template.get('imgeditor', 'button', { class: { cell: 'iconed', type: 'download', icon: 'arrow-down2' }, alt: 'Fazer Download' });
				if (editor.actions.resetpos) htmlButtons += Template.get('imgeditor', 'button', { class: { cell: 'iconed', type: 'reset', icon: 'arrows130' }, alt: 'Resetar Posição' });
				if (editor.actions.remove) htmlButtons += Template.get('imgeditor', 'button', { class: { cell: 'iconed', type: 'remove', icon: 'garbage' }, alt: 'Remover Imagem' });
				htmlAssets += Template.get('imgeditor', 'asset', { class: { type: 'view', icon: 'icon-circle' }, alt: 'Vizualizador de Imagem' });
				htmlEdition += Template.get('imgeditor', 'edition', { class: { type: 'view' }, child: { buttons: htmlButtons } });
			}
			if (editor.assets.desc) {
				htmlButtons = Template.get('imgeditor', 'button', { class: { type: 'cancel' }, label: { name: 'Cancelar' } });
				htmlButtons += Template.get('imgeditor', 'button', { class: { type: 'done' }, label: { name: 'OK' } });
				htmlAssets += Template.get('imgeditor', 'asset', { class: { type: 'desc', icon: 'icon-tag' } });
				htmlEdition += Template.get('imgeditor', 'edition', { class: { type: 'desc' }, child: { buttons: htmlButtons } });
			}
			if (editor.assets.filter) {
				htmlButtons = Template.get('imgeditor', 'button', { class: { type: 'cancel' }, label: { name: 'Cancelar' } });
				htmlButtons += Template.get('imgeditor', 'button', { class: { type: 'done' }, label: { name: 'OK' } });
				htmlAssets += Template.get('imgeditor', 'asset', { class: { type: 'filter', icon: 'icon-invert_colors' } });
				htmlEdition += Template.get('imgeditor', 'edition', { class: { type: 'filter' }, child: { buttons: htmlButtons } });
			}
			if (editor.assets.crop) {
				htmlButtons = Template.get('imgeditor', 'button', { class: { type: 'done' }, label: { name: 'OK' } });
				htmlButtons += Template.get('imgeditor', 'button', { class: { type: 'cancel' }, label: { name: 'Cancelar' } });
				htmlAssets += Template.get('imgeditor', 'asset', { class: { type: 'crop', icon: 'icon-crop-rotate' }, alt: 'Recortar Imagem' });
				htmlEdition += Template.get('imgeditor', 'edition', { class: { type: 'crop' }, child: { buttons: htmlButtons } });
			}
			if (editor.caption){
				htmlCaption += Template.get('imgeditor', 'caption', { content: editor.file.find('.caption').text() } );
			}

			htmlAssets += Template.get('imgeditor', 'asset', { class: { type: 'close', icon: 'icon-close' } });

			editor.dom.element.attr('class', 'sui-image-editor').html(Template.get('imgeditor', 'container', { child: { assets: htmlAssets, edition: htmlEdition, caption: htmlCaption } }));
			editor.dom.window = editor.dom.element.find('.window');
			editor.dom.assets = editor.dom.element.find('.assets > li > a');
			editor.dom.buttons = editor.dom.element.find('.buttons > li > a');
			editor.dom.edition = editor.dom.element.find('.edition');
			editor.dom.caption = editor.dom.element.find('.caption');
			editor.dom.editions = editor.dom.edition.children('div');

			var title = {
				'view': 'Visualizar',
				'desc': 'Descrever',
				'filter': 'Filtros',
				'crop': 'Dimencionar',
			};

			editor.dom.assets.on('click', function () {
				var type = $(this).data('type');
				if (title[type]) {
					editor.dom.element.find('.assets .title').text(title[type]);
					editor.dom.element.attr('class', 'sui-image-editor ' + type);
				}
				editor.load[type]();
			});

			editor.dom.element.on('click', function (event) {
				if (event.target === this) {
					event.stopPropagation();
					var editor = imgEditor;
					editor.oncancel.call(undefined, editor.image);
					editor.close();
				}
			});
			editor.dom.assets.filter('.close').off().on('click', function () {
				var editor = imgEditor;
				editor.oncancel.call(undefined, editor.image);
				editor.close();
			});
			editor.dom.buttons.filter('.cancel').off().on('click', function () {
				var editor = imgEditor;
				editor.oncancel.call(undefined, editor.image);
				editor.close();
			});
			if (editor.caption){
				editor.dom.caption.on('input', function(){
					var ctext = editor.dom.caption.text();
					editor.dom.caption.addClass('edited');
					if (ctext == ''){
						editor.dom.caption.removeClass('has-text');
					} else {
						editor.dom.caption.addClass('has-text');
					}
					editor.dom.buttons.filter('.done').enable();
				});
				editor.dom.buttons.filter('.done').on('click', function (event) {
					var $this = $(this);
					if ($this.is('disable')) return;
					if (editor.dom.caption.hasClass('edited')){
						editor.oncaption.call(undefined, $.trim(editor.dom.caption.text()));
						editor.close();
					}
				});
				if (editor.dom.caption.text() == ''){
					editor.dom.caption.text(editor.dom.caption.attr('placeholder'));
				} else {
					editor.dom.caption.addClass('has-text');
				}
			}

			editor.dom.element.velocity('stop').velocity({
				opacity: [1, 0]
			}, {
					duration: 220,
					display: 'block',
					complete: function () {
						editor.dom.assets.filter('.' + editor.asset).trigger('click');
						editor.onopen.call(undefined, editor.image);
					}
				});
			editor.dom.window.velocity('stop').velocity({
				scale: [1, 0.85]
			}, {
					duration: 220,
					display: 'block'
				});

		},
		close: function () {
			var editor = imgEditor;
			editor.dom.element.velocity('stop').velocity({
				opacity: [0, 1],
			}, {
					duration: 220,
					display: 'none',
					complete: function () {
						editor.unload.view();
						editor.unload.desc();
						editor.unload.filter();
						editor.unload.crop();
						editor.dom.element.attr('class', 'sui-image-editor').html('');
						editor.onclose.call(undefined, editor.image);
						editor.defaults();
					}
				});
			editor.dom.window.velocity('stop').velocity({
				scale: [0.85, 1]
			}, {
					duration: 220,
					display: 'block'
				});
		}
	};

	var Sector = this.sector = {
		default: function (setup) {
			var htmlSector = Template.get('sector', 'container', {
				class: { icon: setup.icon, transparent: setup.transparent ? 'transparent' : '', float: setup.float ? 'float selected' : '', unclosable: setup.unclosable === true || setup.unclosable === 'true' || setup.closable === false || setup.closable === 'false' ? 'unclosable' : '' },
				attr: { id: setup.sector },
				style: setup.sectorstyle,
				data: { sector: setup.sector },
				label: { name: setup.label || setup.title || setup.name },
				image: { logo: setup.logo ? 'url(' + setup.logo + ');' : '' }
			});
			if (setup.title && setup.title != 'false') {
				var htmlTitle = Template.get('sector', 'title', {
					class: { icon: setup.icon },
					data: { sector: setup.sector },
					label: { title: setup.title || setup.label || setup.name }
				});
				htmlTitle = htmlTitle.replace('@{child:prev}', Template.get('sector', 'viewnav', { class: { direction: 'prev', disable: 'disable', icon: 'icon-chevron-r' } }));
				htmlTitle = htmlTitle.replace('@{child:next}', Template.get('sector', 'viewnav', { class: { direction: 'next', disable: 'disable', icon: 'icon-chevron-l' } }));
				htmlSector = htmlSector.replace('@{child:title}', htmlTitle);
			}
			var $sector = $(htmlSector.replace('@{child:title}', '').replace('@{child:views}', ''));
			$sector.data('Interface', new sourceui.interface.sector());
			return $sector;
		},
		float: function (setup) {
			var $container, $sector, $close;
			setup.link.sector = setup.link.sector || setup.id;
			setup.link.icon = setup.link.icon || setup.icon;
			setup.link.title = setup.link.title || setup.title;
			setup.link.label = setup.link.label || setup.label;
			setup.link.float = 'float';
			setup.link.ignoresector = true;
			$container = Dom.floatSectorContainer.attr('class', 'sui-floatsector-container ' + setup.size);
			$sector = $(Sector.default(setup.link)).appendTo($container);
			$close = $sector.children('.close');
			setup.link.target = $sector.find('#suiViewsContainer');
			setup.link.placement = 'append';
			setup.link.sector = $sector;
			setup.link.cancelnested = true;
			setup.link.caller = setup.caller;
			$sector.data('floatcaller', setup.caller);
			$container.velocity({ opacity: [1, 0] }, { display: 'block', duration: 180 });
			$sector.velocity({ scale: [1, 0.97] }, { display: 'block', duration: 180, complete: function () {
				Network.link.call(null, setup.link);
			}});
			$.each(setup.on || [], function (e, d) {
				$sector.on(e, d.bind, function (event, a, b, c) {
					d.fn(a, b, c);
					$container.trigger('click');
				});
			});
			$close.one('click', function (event) {
				event.stopPropagation();
				if ($sector.is('.unclosable') || setup.unclosable === true) return false;
				$container.trigger('sector:close');
				Dom.document.trigger('activity:focusin', [setup.caller]);
			});
			$.CURR.FloatSector = $sector;
		},
		close: function () {

		}
	};

	var GriduploadSetup = {
		url: null,
		multiple: false,
		cors: false,
		accept: [],
		maxfilesize: '2M',
		on: {}
	};

	var Gridupload = this.gridupload = function ($widget, s) {
		var Setup = $.extend(true, GriduploadSetup, s || {});
		var $area = $widget.children('.area');
		var $list = $area.children('.list');
		var $lines = $list.find('.lines:eq(0)');
		var $input = $('<input class="input file" type="file" name="files" multiple/>');
		var isexplorer = $widget.is('.explorer');
		$input.attr('accept', Setup.accept);
		$area.siblings('input').remove();
		$widget.append($input);
		$widget.off('upload:queue upload:added upload:prepare upload:start upload:filedone upload:error upload:fileerror upload:done');
		if (!isexplorer){
			var $list = $(''+
			'<div class="sui-widgetupload">'+
				'<div class="list">'+
					'<div class="header"></div>'+
				'</div>'+
			'</div>').appendTo($area);
		}
		$widget.on('upload:queue', function (event, files) {
			if (!$list.is(':visible')){
				$list.velocity({
					opacity: [1,0],
				}, {
					duration: 250,
					display: "block"
				});
			}
			$.each(files || [], function (k, v) {
				$list.find('.line.progress.error').remove();
				var id = $.md5(v.name);
				var $exist = $list.find('#' + id);
				var data = {
					id: id,
					name: v.name,
					mime: v.type,
					type: (v.type.has('image')) ? 'image' : 'file',
					ext: v.name.split('.').pop().toLowerCase(),
					size: v.size,
					bytes: $.formatBytes(v.size),
					touch: Date.now()
				};
				var $file = $('<div id="' + data.id + '" class="line ' + data.type + ' progress prepare" data-type="image" data-id="' + data.id + '" data-title="' + data.name + '">' +
					'<div class="col pad"></div>' +
					'<div class="col check icon-check"></div>' +
					'<div data-index="0" class="col seq">X</div>' +
					'<div data-index="1" class="col  fsimage visualidentifier important"><u class="sui-fs '+(isexplorer ? 'g' : 'm')+' ' + data.ext + '"><b>' + data.ext + '</b></u></div>' +
					'<div data-index="2" class="col  name important">' + data.name + '</div>' +
					'<mark data-index="3" class="col  rounded important  ext"><span>' + data.ext + '</span></mark>' +
					'<div data-index="4" class="col  info   type">' + data.type + '</div>' +
					'<div data-index="5" class="col  info   size">' + data.bytes + '</div>' +
					'<div class="col pad"></div>' +
					'<div class="progress-upload icon-warning courtain"><div class="progress-bar"><div class="progress-pct"></div></div></div>' +
					'</div>');
				$file.data('data', data).data('file', v).css('opacity', 0);
				if ($exist.length) {
					$exist.replaceWith($file);
				} else {
					$file.insertAfter($lines.length ? $lines.find('.header') : $list.find('.header'));
					$list.find('.empty').remove();
				}
				if (isexplorer && data.type == 'image') {
					$.imgResize({
						image: v,
						size: 256,
						mime: data.mime,
						quality: 1,
						complete: function (src) {
							$file.find('.fsimage').html('<img src="' + src + '"/>');
						}
					});
				}
				$file.velocity({
					opacity: [1, 0],
				}, {
						duration: 250,
						complete: function () {
							$file.addClass('added');
							$widget.trigger('upload:added');
						}
					});
			});
		});
		$widget.on('upload:added', function (event) {
			var $files = $list.find('.line.progress:not(.error)');
			if ($files.length === $files.filter('.added').length) {
				$widget.trigger('upload:prepare');
			}
		});
		$widget.on('upload:prepare', function (event) {
			var $files = $list.find('.line.progress.prepare:not(.error)');
			var collection = { totalsize: 0, maxfilesize: Setup.maxfilesize, accept: Setup.accept, filelist: {} };
			$files.each(function () {
				var $file = $(this);
				var id = $file.attr('id');
				var data = $file.data('data');
				if (data) {
					collection.filelist[id] = data;
					collection.totalsize += data.size;
				}
			});
			var netup = new Network.upload($.extend({ collection: collection }, Setup));
			netup.on('test:error', function (e) {
				$files.find('.progress-upload').removeClass('courtain');
				$files.removeClass('prepare');
				$files.addClass('error');
				$widget.trigger('upload:error');
			});
			netup.on('test:done', function (r) {
				$files.removeClass('prepare');
				$files.addClass('uploading');
				$widget.trigger('upload:start');
			});
			netup.test();
		});
		$widget.on('upload:start', function (event) {
			var $files = $list.find('.line.progress:not(.error)');
			$widget.data('totalfiles', $files.length);
			$files.each(function () {
				var $file = $(this);
				var $progress = $file.find('.progress-upload');
				var fda = $file.data('data');
				var data = $.extend({}, Setup, {
					file: $file.data('file'),
					fdata: {
						id: fda.id,
						file: fda.file,
						mime: fda.mime,
						type: fda.type,
						ext: fda.ext,
						name: fda.name,
						bytes: fda.bytes,
						size: fda.size,
					},
				});
				var netup = new Network.upload(data);
				netup.on('uploading', function (p, l, t) {
					if (p < 0 || !p) p = 0;
					else if (p > 100) p = 100;
					$file.find('.progress-pct').velocity('stop').velocity({ width: p + '%' }, 500, 'linear');
				});
				netup.on('error', function (error) {
					$file.removeClass('uploading');
					$file.addClass('error');
					$file.trigger('upload:fileerror', [$file]);
				});
				netup.on('complete', function (t) {
					$file.removeClass('uploading');
					$file.addClass('done');
					$file.trigger('upload:filedone', [$file]);
				});
				netup.start();
				$progress.removeClass('courtain');
			});
		});
		$widget.on('upload:filedone', function (event, $file) {
			var $files = $list.find('.line.progress.done');
			var $progress = $file.find('.progress-upload');
			$progress.velocity({
				opacity: [0, 1]
			}, {
					duration: 300,
					complete: function () {
						$progress.remove();
						var data = $widget.data();
						if (data.totalfiles === $files.length) {
							$widget.trigger('upload:done');
						}
					}
				});
		});
		$widget.on('upload:done', function (event, $file) {
			var $progress = $area.find('.sui-upload-progress');
			$progress.velocity({
				opaciti:[0,1]
			},{
				duration: 250,
				complete:function(){
					$progress.remove();
				}
			});
			Notify.open({
				type: 'valid',
				name: isPT ? 'Upload de arquivos' : 'File upload',
				message: isPT ? 'O processo foi concluído com sucesso' : 'The process was finished successfully',
			});
			var $refresh = $widget.data('Interface').common.controller.find('[data-alias="refresh"]');
			if (!$refresh.length) $refresh = $widget.closest('.sui-view').children('.toolbar').find('[data-alias="refresh"]');
			if (!$refresh.length) $refresh = $widget.find('[data-alias="refresh"]');
			$refresh.trigger('click');
		});

		$input.on('change', function (event) {
			$widget.trigger('upload:queue', [this.files]);
		});
		$input.click();

	};

};
