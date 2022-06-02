/*!***************************************************
* tipster.js v1.0.1
* https://markjs.io/
* Copyright (c) 2014–2018, Julian Kühnel
* Released under the MIT license https://git.io/vwTVl
*****************************************************/

$(function () {
    'use strict';
    var tipsterTemplate = {
        default:
            '<dfn class="tipster tip default"><u></u></dfn>',
        notify:
            '<dfn class="tipster tip notify"><u></u></dfn>'
    };
    $.tipster = {

        alt: function (options) {

            var Network = sourceui.instances.network;
            var Template = sourceui.templates.interface;
            var Device = sourceui.instances.device;
            var Debug = Device.Debug;
            var Interface = sourceui.interface;
            var Dom = Interface.dom;

            var timeout;
            var $parent = $(this);
            var $granpa = $parent.closest('ul,ol,div'); //$parent.parent();
            var $tipster = $(tipsterTemplate.default);
            var $container = $('#suiTipster');
            var $u = $tipster.children('u');
            var name = $parent.data('tip-name') || options.name;
            var color = $parent.data('tip-color') || options.color;
            var desc = $parent.data('tip') || options.desc || options.text || options.content;
            var html = '';

            var events = {
                move: Device.ismobile ? 'touchstart' : 'mousemove',
                leave: Device.ismobile ? 'touchend' : 'mouseleave',
            };

            if (!name && !desc) return $parent;
            if (name && desc) html += '<span>' + name + '</span>';
            if (name && !desc) html += '<span>' + name + '</span>';
            if (desc) html += '<span>' + desc + '</span>';

            $tipster.append(html);
            $tipster.appendTo($parent);
            $tipster.data('parent', $parent);

            $parent.on(events.move, function () {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    $tipster.trigger('tip:show');
                    $tipster.trigger('tip:add');
                }, Device.ismobile ? 950 : 750);
            });
            $parent.on(events.leave, function () {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    $tipster.trigger('tip:hide');
                }, Device.ismobile ? 100 : 200);
            });

            $tipster.on('tip:add', function () {

                if (!Device.ismobile) {

                    $tipster.attr('class', 'tipster tip default').attr('style', '').appendTo($container).css({
                        display: 'block',
                    });
                    var w = {
                        w: $(window).width(),
                        h: $(window).height()
                    };
                    var g = {
                        w: $granpa.outerWidth(true),
                        h: $granpa.outerHeight(true),
                    }
                    var p = {
                        w: $parent.outerWidth(true),
                        h: $parent.outerHeight(true),
                        o: $parent.offset()
                    };
                    var t = {
                        w: $tipster.outerWidth(true),
                        h: $tipster.outerHeight(true),
                    };

                    var css = {};

                    $u.attr('style', '');

                    if (g.w > g.h) {
                        if (p.o.top <= w.h / 3) {
                            css.top = p.o.top + p.h + 10;
                            $u.css('top', -6);
                        } else {
                            css.top = p.o.top - t.h - 10;
                            $u.css('top', t.h - 6);
                        }
                        if (p.o.left + p.w / 2 - t.w / 2 < 0) {
                            css.left = 10;
                            $u.css('left', p.o.left + p.w / 2 - css.left - 5);
                        } else if (p.o.left + p.w / 2 + t.w / 2 > w.w) {
                            css.left = w.w - t.w - 10;
                            $u.css('left', p.o.left + p.w / 2 - css.left - 5);
                        } else {
                            css.left = p.o.left + p.w / 2 - t.w / 2;
                            $u.css('left', t.w / 2 - 5);
                        }
                    } else {
                        css.top = p.o.top + p.h / 2 - t.h / 2;
                        $u.css('top', t.h / 2 - 5);
                        if (p.o.left + p.w + t.w + 10 > w.w) {
                            css.left = p.o.left - t.w - 10;
                            $u.css('left', t.w - 7);
                        } else {
                            css.left = p.o.left + p.w + 10;
                            $u.css('left', -5);
                        }
                    }
                    $tipster.css(css);
                } else {
                    $tipster.appendTo($container);
                }
                if (color) {
                    $tipster.css('background-color', color);
                    $u.css('background-color', color);
                }
            });

            $tipster.on('tip:show', function () {
                if (!Dom.body.hasClass('tipsted')) {
                    $parent.addClass('tipstant');
                    Dom.body.addClass('tipsting');
                    $tipster.velocity({
                        opacity: [1, 0],
                    }, {
                            duration: 150,
                            display: 'block',
                            complete: function () {
                                Dom.body.switchClass('tipsting', 'tipsted');
                            }
                        });
                }
            });
            $tipster.on('tip:hide', function (event, prevent) {
                if (Dom.body.hasClass('tipsted')) {
                    if (!prevent) Dom.body.removeClass('tipsted');
                    $tipster.velocity({
                        opacity: 0,
                    }, {
                        duration: 150,
                        display: 'none',
                        complete: function () {
                            $tipster.appendTo($parent);
                            $parent.removeClass('tipstant');
                        }
                    });
                } else {
                    $tipster.appendTo($parent);
                    $parent.removeClass('tipstant');
                }
            });

            $parent.on('click', function () {
                clearTimeout(timeout);
                $tipster.trigger('tip:hide', [true]);
            });
            $container.off().on('click', function () {
                $tipster.trigger('tip:hide');
            });
        },

        notify: function (content, duration) {

            var Network = sourceui.instances.network;
            var Template = sourceui.templates.interface;
            var Device = sourceui.instances.device;
            var Debug = Device.Debug;
            var Interface = sourceui.interface;
            var Dom = Interface.dom;

            var $tipster = $(tipsterTemplate.notify);
            var $container = $('#suiTipster');
            $container.find('.tipster').remove();
            $tipster.html('<span>' + content + '</span>').appendTo($container);

            $tipster.velocity({
                opacity: [1, 0],
            }, {
                    duration: 150,
                    display: 'block',
                    complete: function () {
                        $tipster.velocity({
                            opacity: 0,
                            display: 'none'
                        }, {
							delay: duration||100,
							duration: 3000,
							easing: "easeInSine",
							complete: function () {
								$tipster.remove();
							}
						});
                    }
                });

        }
    };


    $.fn.tip = function (options) {
        var $tips = $(this);
        $tips.each(function () {
            $.tipster.alt.call(this, options || {})
        });
    };

    $(document).on('click',function(){
        $('#suiTipster').children().each(function () {
			$(this).trigger('tip:hide');
		});
    });
});
