(function ($) {

	$.calendar = function (jq, o) {

		this.defaults = {
			lang: 'pt',
			mode: 'date',
			modeTabs: false,
			navBar: true,
			weekStart: 0,
			disable: false,
			fixedHeight: true,
			min: false,
			max: false,
			datetime: false,
			date: false,
			time: false,
			range: false,
			month: false,
			multi: false,
			toggle: false,
			outMonthVisible: true,
			outMonthAllowed: false,
			weekendAllowed: true,
			holidayAllowed: true,
			swipeNavigation: true,
			schedules: {}
		};

		var Calendar = this;
		var Element = jq instanceof jQuery ? jq : $(jq);
		var Data = { setup: {} };

		var jQ = {
			calendar: $('<div class="sui-calendar"/>'),
			modetabs: $('<ul class="modetabs">' +
				'<li class="date">' +
				'<a></a>' +
				'</li>' +
				'<li class="time">' +
				'<a>' +
				'<b class="hours">--</b>' +
				'<b class="minutes">--</b>' +
				'<b class="seconds">--</b>' +
				'</a>' +
				'</li>' +
				'</ul>'),
			modes: $('<div class="modes">' +
				'<div class="date"></div>' +
				'<div class="time"></div>' +
				'</div>'),
		};

		/**
		----------------------------------------
		@ BUILDER METHODS
		----------------------------------------
		**/
		var Build = {

			// CALENDAR ----------------
			calendar: function () {

				jQ.calendar.attr('class', 'sui-calendar ' + Data.setup.mode);
				if (Data.setup.mode == 'datetime') jQ.calendar.addClass('date');

				if (Data.setup.mode == 'date' || Data.setup.mode == 'datetime') {
					if (Data.date) {
						if (Data.setup.buildEmptyDate == 'months') Build.months();
						else if (Data.setup.buildEmptyDate == 'years') Build.years();
						else if (Data.setup.buildEmptyDate == 'drops') Build.drops();
						else Build.days(); // default
					} else {
						if (Data.setup.build == 'months') Build.months();
						else if (Data.setup.build == 'years') Build.years();
						else if (Data.setup.build == 'drops') Build.drops();
						else Build.days(); // default
					}
				}
				if (Data.setup.built != 'drops' && (Data.setup.mode == 'datetime' || Data.setup.mode == 'time')) {
					Build.time();
				}
			},

			// YEARS ---------------------
			years: function () {

				var Ref = Data.current;

				var fy = 1;
				var direction = 'init';
				var $date = jQ.modes.children('.date');
				var $old = $date.children('.days, .months, .years');
				var $years = $('<div class="years' + (Data.setup.swipeNavigation ? ' swiper' : '') + '"/>');
				var $ol = $('<ol/>');
				var year = Ref.getFullYear();
				var min = Math.floor(year / 20.0) * 20;
				var max = Math.ceil(year / 20.0) * 20;

				if ($old.hasClass('years')) {
					var oldData = $old.data('Data');
					if (oldData.stamp < Ref.getTime()) direction = 'next';
					else if (oldData.stamp > Ref.getTime()) direction = 'prev';
				} else if ($old.length) {
					direction = 'center';
				}

				for (var idx = min; idx <= max; idx++) {
					var Dob = new Date(idx, 5, 15, 0, 0, 0, 0);
					var stamp = Dob.getTime();
					var classes = [];
					if (Dob.getFullYear() === Data.now.getFullYear() && Dob.getMonth() === Data.now.getMonth()) {
						classes.push('today');
					}
					if ((Data.min && Data.min.getTime() > stamp) || (Data.max && Data.max.getTime() < stamp)) {
						classes.push('disable');
					}
					var $li = $('<li ' +
						'class="' + (classes.join(' ')) + '" ' +
						'data-idx="' + idx + '" ' +
						'><a><u>' + idx + '</u></a>' +
						'</li>');
					$li.appendTo($ol).data('Date', Dob);
					if (idx > 0 && (idx + 1) % 5 === 0) {
						$years.append($ol);
						$ol = $('<ol/>');
					}
				}

				$old.remove();
				$years.data('Data', {
					year: Ref.getFullYear(),
					stamp: Ref.getTime(),
				});
				$years.addClass('from-' + direction);
				$date.attr('class', 'date years').append($years);
				$date.children('.navigate').find('.title .root').text(min + ' - ' + max);
				$years.on('animationend', function () {
					$years.removeClass('from-' + direction);
				});

			},

			// MONTHS -------------------
			months: function () {

				var Ref = Data.current;

				var tm = 1;
				var direction = 'init';
				var $date = jQ.modes.children('.date');
				var $old = $date.children('.days, .months, .years');
				var $months = $('<div class="months' + (Data.setup.swipeNavigation ? ' swiper' : '') + '"/>');
				var $ol = $('<ol class="trimonth" data-tri="' + tm + '"/>');

				if ($old.hasClass('months')) {
					var oldData = $old.data('Data');
					if (oldData.stamp < Ref.getTime()) direction = 'next';
					else if (oldData.stamp > Ref.getTime()) direction = 'prev';
				} else if ($old.length) {
					direction = 'center';
				}

				for (var idx = 0; idx < 12; idx++) {
					var Dob = new Date(Ref.getFullYear(), idx, 15, 0, 0, 0, 0);
					var stamp = Dob.getTime();
					var classes = [];
					if (Dob.getFullYear() === Data.now.getFullYear() && Dob.getMonth() === Data.now.getMonth()) {
						classes.push('today');
					}
					if ((Data.min && Data.min.getTime() > stamp) || (Data.max && Data.max.getTime() < stamp)) {
						classes.push('disable');
					}
					var $li = $('<li ' +
						'class="' + (classes.join(' ')) + '" ' +
						'data-idx="' + idx + '" ' +
						'data-year="' + Ref.getFullYear() + '" ' +
						'data-month="' + Ref.getMonth() + '" ' +
						'><a><u>' + Data.monthNames.short[idx] + '</u></a>' +
						'</li>');
					$li.appendTo($ol).data('Date', Dob);
					if (idx > 0 && (idx + 1) % 3 === 0) {
						$months.append($ol);
						tm++;
						$ol = $('<ol class="trimonth data-tri="' + tm + '"/>');
					}
				}

				$old.remove();
				$months.data('Data', {
					year: Ref.getFullYear(),
					stamp: Ref.getTime(),
				});
				$months.addClass('from-' + direction);
				$date.attr('class', 'date months').append($months);
				$date.children('.navigate').find('.title .year').text(Ref.getFullYear());
				$months.on('animationend', function () {
					$months.removeClass('from-' + direction);
				});

			},

			// DAYS -------------------
			days: function () {

				var Ref = Data.current;
				var Prev = new Date(Ref.getFullYear(), Ref.getMonth() - 1, 15, 0, 0, 0, 0);
				var Next = new Date(Ref.getFullYear(), Ref.getMonth() + 1, 15, 0, 0, 0, 0);

				Prev.daysInMonth = Calendar.daysInMonth(Prev.getFullYear(), Prev.getMonth() + 1);
				Ref.firstMDate = new Date(Ref.getFullYear(), Ref.getMonth(), 1, 0, 0, 0, 0);
				Ref.firstWDay = Ref.firstMDate.getDay();
				Ref.daysInMonth = Calendar.daysInMonth(Ref.getFullYear(), Ref.getMonth() + 1);
				Ref.lastMDate = new Date(Ref.getFullYear(), Ref.getMonth(), Ref.daysInMonth, 0, 0, 0, 0);
				Ref.lastWDay = Ref.lastMDate.getDay();

				var wn = 1;
				var direction = 'init';
				var $date = jQ.modes.children('.date');
				var $old = $date.children('.days, .months, .years');
				var $days = $('<div class="days' + (Data.setup.swipeNavigation ? ' swiper' : '') + '"/>');
				var $ol = $('<ol class="week" data-week="' + wn + '"/>');
				var subDays = Data.setup.fixedHeight && Ref.firstWDay === 0 ? Ref.firstWDay + 7 : Ref.firstWDay;
				var minDays = Data.setup.fixedHeight && Ref.firstWDay === 0 ? 1 - (Ref.firstWDay + 7) : 1 - Ref.firstWDay;
				var maxDays = Data.setup.fixedHeight ? (Data.setup.fixedHeight && Ref.firstWDay === 0 ? 35 : 42) : Ref.daysInMonth + (6 - Ref.lastWDay);

				if ($old.is(':visible')) {
					if ($old.hasClass('days')) {
						var oldData = $old.data('Data');
						if (oldData.stamp < Ref.getTime()) direction = 'next';
						else if (oldData.stamp > Ref.getTime()) direction = 'prev';
					} else if ($old.length) {
						direction = 'center';
					}
				}

				for (var idx = minDays; idx <= maxDays; idx++) {
					var i = idx + subDays;
					var classes = [];
					var inmonth = false;
					var dyx;
					var Dob;
					var $scheds = null;
					if (idx > 0 && idx <= Ref.daysInMonth) {
						dyx = idx;
						Dob = new Date(Ref.getFullYear(), Ref.getMonth(), dyx, 0, 0, 0, 0);
						classes.push('in-month');
					} else {
						if (idx <= 0) {
							dyx = Prev.daysInMonth + idx;
							Dob = new Date(Prev.getFullYear(), Prev.getMonth(), dyx, 0, 0, 0, 0);
							classes.push('out-month', 'prev-month');
						} else if (idx > Ref.daysInMonth) {
							dyx = (idx) - Ref.daysInMonth;
							Dob = new Date(Next.getFullYear(), Next.getMonth(), dyx, 0, 0, 0, 0);
							classes.push('out-month', 'next-month');
						}
					}
					var weekday = Dob.getDay();
					var year = Dob.getFullYear();
					var month = Dob.getMonth();
					var day = Dob.getDate();
					var date = Dob.toISOString().substring(0, 10);
					var stamp = Dob.getTime();
					var schedules = Data.setup.schedules[date];

					if (weekday === 0 || weekday === 6) {
						classes.push('weekend');
					}
					if (weekday === 0) {
						classes.push('sunday');
					}
					if (schedules) {
						$scheds = $('<div class="schedules"/>');
						if ($.isArray(schedules)) {
							$.each(schedules || [], function (ka, va) {
								if (va.holiday) classes.push('holiday');
								$scheds.append(_jQSchedule(date, va));
							});
						} else if ($.isPlainObject(schedules)) {
							$.each(schedules || [], function (ka, va) {
								$.each(va || [], function (kb, vb) {
									if (vb.holiday) classes.push('holiday');
									$scheds.append(_jQSchedule(date, vb));
								});
							});
						}
					}
					var a = 'a';
					if (!Data.setup.outMonthAllowed && $.inArray('in-month', classes) == -1) {
						classes.push('disable');
						a = 'span';
					}
					if (!Data.setup.weekendAllowed && $.inArray('weekend', classes) > -1) {
						classes.push('disable');
						a = 'span';
					}
					if (!Data.setup.holidayAllowed && $.inArray('holiday', classes) > -1) {
						classes.push('disable');
						a = 'span';
					}
					if ((Data.min && Data.min.getTime() > stamp) || (Data.max && Data.max.getTime() < stamp)) {
						classes.push('disable');
						a = 'span';
					}
					if (_sameDate(Data.now, Dob)) {
						classes.push('today');
					}
					if (schedules) {
						classes.push('scheduled');
					}
					if (Data.setup.range && $.isArray(Data.date)) {
						if (Data.date.length == 1 && Data.date[0] != '') {
							if (_sameDate(Data.date[0], Dob)) classes.push('range-start range');
							else if (stamp < Data.date[0].getTime()) classes.push('disable range-disable');
						} else if (Data.date.length == 2 && Data.date[0] != '' && Data.date[1] != '') {
							if (stamp >= Data.date[0].getTime() && stamp <= Data.date[1].getTime()) classes.push('range');
							if (_sameDate(Data.date[1], Dob)) classes.push('range-end');
						}
					} else if (Data.setup.multi && $.isArray(Data.date)) {
						$.each(Data.now, function (k, v) {
							if (_sameDate(v, Dob)) classes.push('selected');
						});
					} else if (Data.date && Data.date.getFullYear() === year && Data.date.getMonth() === month && Data.date.getDate() === day) {
						classes.push('selected');
					}
					var $li = $('<li ' +
						'class="' + (classes.join(' ')) + '" ' +
						'data-idx="' + idx + '" ' +
						'data-weekday="' + weekday + '" ' +
						'data-year="' + year + '" ' +
						'data-month="' + month + '" ' +
						'data-day="' + day + '" ' +
						'data-masked="' + date + '" ' +
						'><' + a + ' class="day"><u>' + day + '</u></' + a + '>' +
						'</li>');
					if ($scheds) {
						$li.append($scheds);
						$scheds = null;
					}
					$li.appendTo($ol).data('Date', Dob);
					if (i > 0 && i % 7 === 0) {
						$days.append($ol);
						wn++;
						$ol = $('<ol class="week" data-week="' + wn + '"/>');
					}
				}

				if (!Data.setup.outMonthVisible) $days.addClass('outmounth-hidden');
				if (!Data.setup.outMonthAllowed) $days.addClass('outmounth-denied');
				if (!Data.setup.weekendAllowed) $days.addClass('weekend-denied');
				if (!Data.setup.holidayAllowed) $days.addClass('holiday-denied');



				$old.remove();
				$days.data('Data', {
					month: Ref.getMonth(),
					year: Ref.getFullYear(),
					stamp: Ref.getTime(),
				});
				$days.addClass('from-' + direction);
				$date.attr('class', 'date days').append($days);
				$days.on('animationend', function () {
					$days.removeClass('from-' + direction);
				});

				var $weekname = $date.children('.weekname');
				if (!$weekname.length) {
					$weekname = $('<ol class="weekname"/>');
					$.each(Data.weekNames.abbr, function (k, v) {
						$weekname.append(
							'<li class="' + (k === 0 || k === 6 ? 'weekend ' : '') + (k === 0 ? 'sunday' : '') + '" data-weekday="' + k + '">' +
							'<b class="abbr">' + v + '</b>' +
							'<b class="short">' + Data.weekNames.short[k] + '</b>' +
							'<b class="full">' + Data.weekNames.full[k] + '</b>' +
							'</li>');
					});
					$weekname.prependTo($date);
				}
				var $navigate = $date.children('.navigate');
				if (!$navigate.length) {
					$navigate = $('<ul class="navigate">' +
						'<li class="arrow prev"><a><u></u></a></li>' +
						'<li class="title">' +
						'<a class="root"></a>' +
						'<a class="year"></a>' +
						'<a class="month"></a>' +
						'</li>' +
						'<li class="arrow next"><a><u></u></a></li>' +
						'</ul>').prependTo($date);
				}
				$navigate.find('.title .month').text(Data.monthNames.full[Ref.getMonth()] + ' ' + Ref.getFullYear());

				_modeTabLabel();



			},


			// TIME -------------------
			time: function () {

				jQ.calendar.addClass(Data.setup.fulltime ? 'full' : 'short');

				var Ref = Data.current;
				Data.clock = {
					view: Data.setup.timeview || 'hours',
					dialRadius: 130,
					outerRadius: 106,
					innerRadius: 76,
					tickRadius: 18,
					lineRadius: 58
				};

				var $time = jQ.modes.children('.time');
				var $old = $time.children('.clock');
				var $clock = $('<div class="clock"/>');
				var $canvas = $('<div class="canvas">' +
					'<svg class="svg">' +
					'<g transform="translate(130,130)">' +
					'<line x1="0" y1="0" x2="0" y2="-' + Data.clock.lineRadius + '"></line>' +
					'<circle class="bearing" cx="0" cy="0" r="4"></circle>' +
					'</g>' +
					'</svg>' +
					'</div>');
				var $hours = $('<div class="hours"/>');
				var $ampm = $('<ul class="ampm"><li class="am">AM<a></a></li><li class="pm">PM<a></a></li></ul>');
				var $minutes = $('<div class="minutes"/>');
				var $seconds = $('<div class="seconds"/>');
				var $tick = $('<div class="tick"/>');

				Data.clock.dom = $clock;
				Data.clock.svgline = $canvas.find('.svg line');
				Data.clock.axis = { hours: [], minutes: [], seconds: [] };

				var i, $t, radian, radius, inner, Dob, css, sx, sy;

				// HOURS --------------------
				if (!Data.setup.ampm) {
					for (i = 0; i < 24; i += 1) {
						inner = i > 0 && i < 13;
						radian = i / 6 * Math.PI;
						radius = inner ? Data.clock.innerRadius : Data.clock.outerRadius;
						sx = Data.clock.dialRadius + Math.sin(radian) * radius - Data.clock.tickRadius;
						sy = Data.clock.dialRadius - Math.cos(radian) * radius - Data.clock.tickRadius;
						Data.clock.axis.hours[i] = { x: (sx - Data.clock.dialRadius) + Data.clock.tickRadius, y: sy - (Data.clock.dialRadius - Data.clock.tickRadius) };
						Dob = new Date(0, 0, 0, i, 0, 0, 0);
						$t = $tick.clone().attr('data-value', i).data('Time', Dob);
						$t.addClass(inner ? 'inner' : 'outer');
						$t.css({ left: sx, top: sy });
						if (Data.date && i === Data.date.getHours()) {
							$t.addClass('selected');
						}
						$t.html(i === 0 ? '00' : i);
						$hours.append($t);
					}
				}
				// --------------------------
				// MINUTES ------------------
				for (i = 0; i < 60; i += 1) {
					radian = i / 30 * Math.PI;
					sx = Data.clock.dialRadius + Math.sin(radian) * Data.clock.outerRadius - Data.clock.tickRadius;
					sy = Data.clock.dialRadius - Math.cos(radian) * Data.clock.outerRadius - Data.clock.tickRadius;
					Data.clock.axis.minutes[i] = { x: (sx - Data.clock.dialRadius) + Data.clock.tickRadius, y: sy - (Data.clock.dialRadius - Data.clock.tickRadius) };
					if (i % 5 === 0) {
						Dob = new Date(0, 0, 0, 0, i, 0, 0);
						$t = $tick.clone().attr('data-value', i).data('Time', Dob);
						$t.css({ left: sx, top: sy });
						if (Data.date && i === Data.date.getMinutes()) {
							$t.addClass('selected');
						}
						$t.html($.leadZero(i));
						$minutes.append($t);
					}
				}
				// --------------------------
				// SECONDS ------------------
				if (Data.setup.fulltime) {
					for (i = 0; i < 60; i += 1) {
						radian = i / 30 * Math.PI;
						sx = Data.clock.dialRadius + Math.sin(radian) * Data.clock.outerRadius - Data.clock.tickRadius;
						sy = Data.clock.dialRadius - Math.cos(radian) * Data.clock.outerRadius - Data.clock.tickRadius;
						Data.clock.axis.seconds[i] = { x: (sx - Data.clock.dialRadius) + Data.clock.tickRadius, y: sy - (Data.clock.dialRadius - Data.clock.tickRadius) };
						if (i % 5 === 0) {
							Dob = new Date(0, 0, 0, 0, i, 0, 0);
							$t = $tick.clone().attr('data-value', i).data('Time', Dob);
							$t.css({ left: sx, top: sy });
							if (Data.date && i === Data.date.getSeconds()) {
								$t.addClass('selected');
							}
							$t.html($.leadZero(i));
							$seconds.append($t);
						}
					}
				}

				$old.remove();
				$clock.append($canvas);
				$clock.append($hours).append($minutes).append($seconds);
				$time.attr('class', 'time').append($clock);
				_timeView(Data.clock.view);

				$time.on('animationend', '.clock div', function () {
					var $this = $(this);
					$this.removeClass('small-zero large-zero');
				});
				// --------------------------

				_modeTabLabel();
			}
		};
		/**
		----------------------------------------
		**/



		/**
		----------------------------------------
		@ PUBLIC METHODS
		----------------------------------------
		**/
		this.setOptions = function (o) {
			_setNow();
			$.extend(true, Data.setup, o || {});
			Data.monthNames = $.extend($.monthNames(), Data.setup.monthNames || {})[Data.setup.lang] || $.monthNames('eng');
			Data.weekNames = $.extend($.weekNames(), Data.setup.weekNames || {})[Data.setup.lang] || $.weekNames('eng');
			Data.setup.weekStartsOnMonday = Data.setup.weekStart === "Mon" || Data.setup.weekStart === 1 || Data.setup.weekStart === "1";
			if (Data.setup.datetime !== false) { _setDate(Data.setup.datetime); Data.setup.datetime = false; }
			else if (Data.setup.date !== false) { _setDate(Data.setup.date); Data.setup.date = false; }
			else if (Data.setup.time !== false) { _setTime(Data.setup.time); Data.setup.time = false; }
			else if (Data.setup.month !== false) { _setCurrent(Data.setup.month); Data.setup.month = false; }
			else if (Data.setup.range !== false) { _setRange(Data.setup.range); Data.setup.range = true; }
			if (Data.setup.min !== false || Data.setup.max !== false) {
				_setMinMax(Data.setup.min, Data.setup.max);
				Data.setup.min = false;
				Data.setup.max = false;
			}
			_setCurrent();
			Build.calendar();
			return Calendar;
		};
		this.setOption = function (a, b) {
			var o = {}; o[a] = b;
			return Calendar.setOptions(o);
		};
		this.setDate = function (d) {
			return Calendar.setOption('date', d);
		};
		this.setMin = function (d) {
			return Calendar.setOption('min', d);
		};
		this.setMax = function (d) {
			return Calendar.setOption('min', d);
		};
		this.setRange = function (d) {
			return Calendar.setOption('range', d);
		};
		this.setTime = function (d) {
			_setTime(d);
			_timeHand();
			return Calendar;
		};
		this.setSchedules = function (s) {
			var $day, $s;
			if ($.isPlainObject(s)) {
				$.each(s || [], function (ka, va) {
					if ($.isDate(ka) && va) {
						Data.setup.schedules[ka] = va;
						$day = jQ.calendar.find('.days li[data-masked="' + ka + '"]').addClass('scheduled');
						$s = $('<div class="schedules"/>');
						if ($.isArray(va)) {
							$.each(va || [], function (kb, vb) {
								if (vb.holiday) $day.addClass('holiday');
								$s.append(_jQSchedule(ka, vb));
							});
						} else if ($.isPlainObject(va)) {
							$.each(va || [], function (kb, vb) {
								$.each(vb || [], function (kc, vc) {
									if (vc.holiday) $day.addClass('holiday');
									$s.append(_jQSchedule(ka, vc));
								});
							});
						}
						$day.find('.schedules').remove();
						$day.append($s);
					}
				});
			}
		};
		// ---------------------------
		this.format = function (format, date, time) {
			if (date && date instanceof Date) {
				if (typeof moment == 'function' && format) {
					var D = moment(date);
					if (format == 'moment') return D;
					return D.format($.parseDateFormat(format));
				}
				return date;
			}
			return null;
		};
		this.getRange = function (format) {
			var range = [];
			if ($.isArray(Data.date)) $.each(Data.date, function (k, v) { range[k] = Calendar.format(format || 'us', v); });
			return range;
		};
		this.getRangeObject = function (format) {
			var range = [];
			if ($.isArray(Data.date)) $.each(Data.date, function (k, v) { range[k] = Calendar.format(null, v); });
			return range;
		};
		this.getDate = function (format) {
			return Calendar.format(format || 'us', Data.date);
		};
		this.getTime = function (format) {
			return Calendar.format(format || 'short', Data.date);
		};
		this.getDateObject = function () {
			return Calendar.format(null, Data.date);
		};
		this.getDateMoment = function () {
			return Calendar.format('moment', Data.date);
		};
		this.getDatetime = function (format) {
			return Calendar.format(format || 'us', Data.date, true);
		};
		this.getTime = function (format) {
			return Calendar.format('time', Data.date, true);
		};
		this.getMonth = function () {
			return Calendar.format('month', Data.current);
		};
		this.getCurrent = function (format) {
			if (format == 'Date' || format == 'obj' || format == {}) return Date.current;
			return Calendar.format(format, Data.current);
		};
		this.getCurrentObject = function () {
			return Calendar.format(Data.current);
		};
		this.getCurrentMoment = function () {
			return Calendar.format('moment', Data.current);
		};
		// ---------------------------
		this.daysInMonth = function (year, month) {
			return month === 2 ? (year & 3) || (!(year % 25) && year & 15) ? 28 : 29 : 30 + (month + (month >> 3) & 1);
		};
		/**
		----------------------------------------
		**/


		/**
		----------------------------------------
		@ PRIVATE METHODS
		----------------------------------------
		**/
		var _setNow = function () {
			Data.now = new Date();
			clearTimeout(Data.nowtimeout);
			Data.nowtimeout = setTimeout(_setNow, 33333);
		};
		var _sameDate = function (a, b) {
			if ($.type(a) == 'string' || $.type(a) == 'number') a = $.toDate(a, 'obj');
			if ($.type(b) == 'string' || $.type(b) == 'number') b = $.toDate(b, 'obj');
			return (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()) ? true : false;
		};
		var _setDate = function (d) {
			if ($.type(d) == 'string') d = $.toDate(d, 'obj');
			if (d && d instanceof Date) {
				if (Data.date) {
					if (Data.setup.mode.indexOf('date') > -1) {
						Data.date.setFullYear(d.getFullYear());
						Data.date.setMonth(d.getMonth());
						Data.date.setDate(d.getDate());
					}
					if (Data.setup.mode.indexOf('time') > -1) {
						Data.date.setHours(d.getHours());
						Data.date.setMinutes(d.getMinutes());
						Data.date.setSeconds(d.getSeconds());
					}
				} else Data.date = d;
			} else Data.date = null;
			_setCurrent(Data.date || Data.now);
		};
		var _setRange = function (d) {
			d = d || [];
			if ($.type(d[1]) == 'string' || $.type(d[1]) == 'number') d[1] = $.toDate(d[1], 'obj');
			if ($.type(d[0]) == 'string' || $.type(d[0]) == 'number') d[0] = $.toDate(d[0], 'obj');
			if (d[1] && !(d[1] instanceof Date)) delete d[1];
			if (d[0] && !(d[0] instanceof Date)) delete d[0];
			Data.date = d;
			_setCurrent(d[0] || d[1] || Data.now);
		};
		var _setTime = function (d) {
			if (!d || d === '') d = '00:00:00';
			if ($.type(d) == 'string') d = $.toDate('0000-01-01 ' + $.toTime(d, 'full'), 'obj');
			Data.date = (d && d instanceof Date) ? d : null;
			_setCurrent(Data.date || Data.now);
		};
		var _setMinMax = function (min, max) {
			if ($.type(min) == 'string' || $.type(min) == 'number') min = $.toDate(min, 'obj');
			if ($.type(max) == 'string' || $.type(max) == 'number') max = $.toDate(max, 'obj');
			Data.min = (min && !(min instanceof Date)) ? false : min;
			Data.max = (max && !(max instanceof Date)) ? false : max;
			if (Data.min) _setCurrent(Data.min || Data.now);
		};
		var _setCurrent = function (d) {
			if (!d) {
				if ($.isArray(Data.date) && Data.date[0]) d = Data.date[0];
				else if (Data.date) d = Data.date;
				else if (Data.now) d = Data.now;
			}
			if ($.type(d) == 'string') d = $.toDate(d.length == 7 ? d + '-15' : d, 'obj');
			Data.current = new Date(d && d instanceof Date ? d.getTime() : Data.now.getTime());
		};
		var _jQSchedule = function (date, info) {
			return '<div class="schedule" data-date="' + date + '"' + (info.color ? ' style="background:' + info.color + ';"' : '') + '>' +
				'<div class="title">' + info.title + '</div>' +
				'<div class="info"><span class="time">' + info.time + '</span> <span class="calendar">' + info.calendar + '</span></div>' +
				'</div>';
		};


		var _timeView = function (view) {
			Data.clock.view = view;
			var $time = jQ.modes.children('.time');
			var $view = $time.find('.' + view);
			var $cur = jQ.modetabs.find('.time > a > b.' + view)
			var $old = $cur.siblings('.active');
			$cur.addClass('active');
			$old.removeClass('active');
			if ($old.length && $cur.index() > $old.index()) {
				$view.addClass('large-zero');
			} else if ($old.length && $cur.index() < $old.index()) {
				$view.addClass('small-zero');
			}
			$time.attr('class', 'time ' + view);
			_timeHand();
		};
		var _timeHand = function (x, y, roundBy5, dragging) {

			if (!Data.date) {
				jQ.modes.children('.time').addClass('disable');
				return;
			} else {
				jQ.modes.children('.time').removeClass('disable');
			}

			var sv = {
				hours: Data.date.getHours(),
				minutes: Data.date.getMinutes(),
				seconds: Data.date.getSeconds()
			};

			x = (typeof x == 'undefined') ? Data.clock.axis[Data.clock.view][sv[Data.clock.view]].x : x;
			y = (typeof y == 'undefined') ? Data.clock.axis[Data.clock.view][sv[Data.clock.view]].y : y;

			var radian = Math.atan2(x, - y),
				isHours = Data.clock.view === 'hours',
				unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
				z = Math.sqrt(x * x + y * y),
				inner = isHours && z < (Data.clock.outerRadius + Data.clock.innerRadius) / 2,
				radius = inner ? Data.clock.innerRadius : Data.clock.outerRadius,
				value;

			if (Data.setup.ampm) radius = Data.clock.outerRadius;
			if (radian < 0) radian = Math.PI * 2 + radian;
			value = Math.round(radian / unit);
			radian = value * unit;
			if (!Data.setup.ampm) {
				if (isHours) {
					if (value === 12) value = 0;
					value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
				} else {
					if (roundBy5) value *= 5;
					if (value === 60) value = 0;
				}
			}

			var cx = Math.sin(radian) * (isHours && !Data.setup.ampm ? Data.clock.lineRadius : Data.clock.outerRadius),
				cy = - Math.cos(radian) * (isHours && !Data.setup.ampm ? Data.clock.lineRadius : Data.clock.outerRadius);
			Data.clock.svgline.attr('x2', cx);
			Data.clock.svgline.attr('y2', cy);

			var $ticks = Data.clock.dom.children('.' + Data.clock.view).find('.tick');
			var $sel = $ticks.filter('.selected');
			if (!$sel.length || $sel.data('value') !== value) {
				var $t = $ticks.filter('[data-value="' + value + '"]');
				$sel.removeClass('selected');
				$t.addClass('selected');
			}
			if (sv[Data.clock.view] !== value) {
				if (Data.clock.view === 'hours') Data.date.setHours(value);
				else if (Data.clock.view === 'minutes') Data.date.setMinutes(value);
				else if (Data.clock.view === 'seconds') Data.date.setSeconds(value);
				jQ.calendar.trigger('select:' + Data.clock.view, value).trigger('select', [Data.date, Calendar.getTime(), $t]);
			}
			_modeTabLabel();

		};
		var _modeTabLabel = function () {
			var $date = jQ.modetabs.find('.date');
			var $time = jQ.modetabs.find('.time');
			var $a;
			if (!Data.setup.modeTabs) return;
			if (Data.setup.mode.indexOf('date') > -1) {
				$a = $date.children('a');
				if (Data.setup.range) {
					if ($.isArray(Data.date)) {
						if (Data.date.length === 1) $a.removeClass('none').text($.toFullDate(Data.date[0], 'br', 'short'));
						else if (Data.date.length === 2) $a.removeClass('none').text($.toFullDate(Data.date[0], 'br', 'short') + ' - ' + $.toFullDate(Data.date[1], 'br', 'short'));
						else $a.addClass('none').text('Nenhum intervalo selecionado');
					} else {
						$a.addClass('none').text('Nenhum intervalo selecionado');
					}
				} else if (Data.setup.multi) {
					$a.removeClass('none').text((Data.date ? Data.date.length : 0) + ' datas selecionadas');
				} else {
					if (Data.date) $a.removeClass('none').text($.toFullDate(Data.date, 'br', (Data.setup.mode == 'datetime' ? 'unpreposited' : 'full')));
					else $a.addClass('none').text('Nenhuma data selecionada');
				}
			}
			if (Data.setup.mode.indexOf('time') > -1) {
				$a = $time.children('a');
				if (Data.date) {
					$a.children('.hours').text($.leadZero(Data.date.getHours()));
					$a.children('.minutes').text($.leadZero(Data.date.getMinutes()));
					$a.children('.seconds').text($.leadZero(Data.date.getSeconds()));
				} else {
					$a.children('b').text('--');
				}
			}
		};

		var _bindDate = function () {
			jQ.calendar.on('click', '.navigate > li.title > a', function (event) {
				var $a = $(this);
				if ($a.hasClass('month')) {
					Build.months();
				} else if ($a.hasClass('year')) {
					Build.years();
				}
			});
			jQ.calendar.on('click', '.navigate > li.arrow > a', function (event) {
				var $a = $(this);
				var $li = $a.parent();
				var $date = $li.parent().parent();
				var direction = 0;
				if (Data.setup.disable || $li.hasClass('disable')) return false;
				if ($li.hasClass('prev')) direction = -1;
				else if ($li.hasClass('next')) direction = 1;
				if ($date.hasClass('days')) {
					Data.current.setMonth(Data.current.getMonth() + direction);
					Build.days();
					jQ.calendar.trigger('select:month', Calendar.getMonth());
				} else if ($date.hasClass('months')) {
					Data.current.setFullYear(Data.current.getFullYear() + direction);
					Build.months();
					jQ.calendar.trigger('select:year', Data.current.getFullYear());
				} else if ($date.hasClass('years')) {
					Data.current.setFullYear(Data.current.getFullYear() + (direction * 20));
					Build.years();
				}
				jQ.calendar.trigger('navigate', Data.current);
			});
			jQ.calendar.on('click', '.years > ol > li > a', function (event) {
				var $a = $(this);
				var $li = $a.parent();
				Data.current = $li.data('Date');
				Build.months();
				jQ.calendar.trigger('select:years', [Data.current.getFullYear()]);
			});
			jQ.calendar.on('click', '.months > ol > li > a', function (event) {
				var $a = $(this);
				var $li = $a.parent();
				Data.current = $li.data('Date');
				Build.days();
				jQ.calendar.trigger('select:month', [Calendar.getMonth()]);
			});
			jQ.calendar.on('click', '.days > ol > li > a', function (event) {
				var $a = $(this);
				var $li = $a.parent();
				var $days = $li.closest('.days');
				var $sel = $days.find('.selected');
				if (Data.setup.disable || $li.hasClass('disable') || $li.closest('.disable').length) return false;
				if (Data.setup.range) {
					if ($.isArray(Data.date) && Data.date.length == 1) {
						jQ.calendar.trigger('rangeend', [$li]);
						return true;
					}
					jQ.calendar.trigger('rangeini', [$li]);
					return true;
				} else if (Data.setup.toggle) {
					if ($li.hasClass('selected')) {
						jQ.calendar.trigger('unseldate', [$li]);
						return true;
					}
				}
				if ($sel.length && !Data.setup.multi && !$li.hasClass('selected')) {
					$sel.removeClass('selected');
				}
				jQ.calendar.trigger('seldate', [$li]);
			});
			jQ.calendar.on('tap', '.days > ol > li > a', function (event) {
				console.log(event);
			});
			jQ.calendar.on('rangeini', function (event, $li) {
				var data = $li.data();
				var $days = $li.closest('.days');
				var $lis = $days.find('li');
				$lis.filter('.range').removeClass('range');
				$lis.removeClass('range-start range-ini range-end');
				$li.addClass('range-start range');
				$li.prevAll('li').addClass('disable range-disable').parent().prevAll('ol').children('li').addClass('disable range-disable');
				Data.date = [data.Date];
				_modeTabLabel();
				jQ.calendar.trigger('range:start', [data.Date, $.toDate(data.Date, 'us'), $li]);
			});
			jQ.calendar.on('rangeend', function (event, $li) {
				var data = $li.data();
				var $days = $li.closest('.days');
				var $lis = $days.find('li');
				$lis.filter('.range-start').removeClass('range-start').addClass('range-ini');
				Data.date[1] = data.Date;
				$lis.each(function () {
					var $l = $(this);
					var d = $l.data();
					var time = d.Date.getTime();
					if (time >= Data.date[0].getTime() && time <= Data.date[1].getTime()) {
						$l.addClass('range');
					}
					if (time === Data.date[1].getTime()) {
						$l.addClass('range-end');
						return true;
					}
				});
				$days.find('.range-disable').removeClass('disable range-disable');
				_modeTabLabel();
				jQ.calendar.trigger('range:end', [data.Date, $.toDate(data.Date, 'us'), $li]);
				jQ.calendar.trigger('select', Data.date, Calendar.getRange());
			});
			jQ.calendar.on('seldate', function (event, $li) {
				$li.addClass('selected');
				var D = $li.data('Date');
				if (Data.setup.mode === 'datetime' && Data.date) {
					Data.date.setFullYear(D.getFullYear());
					Data.date.setMonth(D.getMonth());
					Data.date.setDate(D.getDate());
				} else Data.date = D;
				_modeTabLabel();
				jQ.calendar.trigger('select', [Data.date, Calendar.getDate(), $li]);
			});
			jQ.calendar.on('unseldate', function (event, $li) {
				$li.removeClass('selected');
				var str = Calendar.getDate();
				delete Data.date;
				_modeTabLabel();
				jQ.calendar.trigger('unselect', [str, $li]);
			});
			jQ.calendar.on('swiperight', '.swiper', function (event) {
				if (Data.setup.swipeNavigation) jQ.calendar.find('.navigate > li.arrow.prev > a').trigger('click');
				event.stopPropagation();
			});
			jQ.calendar.on('swipeleft', '.swiper', function (event) {
				if (Data.setup.swipeNavigation) jQ.calendar.find('.navigate > li.arrow.next > a').trigger('click');
				event.stopPropagation();
			});
		};
		var _bindTime = function () {
			jQ.calendar.on((Data.touch ? 'touchstart' : 'mousedown'), '.modes > .time > .clock', function (e) {
				var offset = Data.clock.dom.offset(),
					x0 = Data.clock.x0 = offset.left + Data.clock.dialRadius,
					y0 = Data.clock.y0 = offset.top + Data.clock.dialRadius,
					dx = Data.clock.dx = (Data.touch ? e.originalEvent.touches[0] : e).pageX - x0,
					dy = Data.clock.dy = (Data.touch ? e.originalEvent.touches[0] : e).pageY - y0,
					z = Math.sqrt(dx * dx + dy * dy);
				Data.clock.moved = false;
				Data.clock.point = 'start';
				Data.clock.space = true;
				if (z < Data.clock.outerRadius - (Data.clock.tickRadius * 2.5) || z > Data.clock.outerRadius + Data.clock.tickRadius) return;
				e.preventDefault();
				_timeHand(dx, dy, ! true, true);
			});
			jQ.calendar.on((Data.touch ? 'touchmove' : 'mousemove'), '.modes > .time > .clock', function (e) {
				if (Data.clock.point !== 'start') return;
				e.preventDefault();
				var x = (Data.touch ? e.originalEvent.touches[0] : e).pageX - Data.clock.x0,
					y = (Data.touch ? e.originalEvent.touches[0] : e).pageY - Data.clock.y0;
				if (!Data.clock.moved && x === Data.clock.dx && y === Data.clock.dy) return;
				Data.clock.moved = true;
				_timeHand(x, y, false, true);
			});
			jQ.calendar.on((Data.touch ? 'touchend' : 'mouseup'), '.modes > .time > .clock', function (e) {
				e.preventDefault();
				var x = (Data.touch ? e.originalEvent.changedTouches[0] : e).pageX - Data.clock.x0,
					y = (Data.touch ? e.originalEvent.changedTouches[0] : e).pageY - Data.clock.y0;
				if ((Data.clock.space || Data.clock.moved) && x === Data.clock.dx && y === Data.clock.dy) {
					_timeHand(x, y);
				}
				Data.clock.point = 'end';
			});
			jQ.modetabs.find('.time').on('click', 'a > b', function () {
				var $b = $(this);
				if ($b.hasClass('hours')) _timeView('hours');
				else if ($b.hasClass('minutes')) _timeView('minutes');
				else if ($b.hasClass('seconds')) _timeView('seconds');
			});
			/*
			jQ.calendar.on('select:hours',function(){
				 jQ.modetabs.find('.time > a > b.m').trigger('click');
			});
			jQ.calendar.on('select:minutes',function(){
				 if (Data.setup.fulltime) jQ.modetabs.find('.time > a > b.s').trigger('click');
			});
			*/
		};
		var _bindEvents = function () {
			if (Data.setup.mode.indexOf('date') > -1) _bindDate();
			if (Data.setup.mode.indexOf('time') > -1) _bindTime();
			jQ.modetabs.on('click', 'li', function () {
				var $li = $(this);
				if (!jQ.calendar.hasClass($li.attr('class'))) {
					jQ.calendar.removeClass('date time').addClass($li.attr('class'));
				}
			});
		};

		var _init = function (o) {
			Data.touch = 'ontouchstart' in window;
			Data.setup = Calendar.defaults;
			Element.children('code').each(function () {
				var json = $.trim($(this).text());
				if (json) Data.setup.schedules = $.extend(Data.setup.schedules, JSON.parse($(this).text()));
			});
			Calendar.setOptions(o);
			if (Data.setup.modeTabs) jQ.calendar.append(jQ.modetabs);
			jQ.calendar.append(jQ.modes);
			Element.html(jQ.calendar);
			Element.addClass('has-sui-calendar');
			_bindEvents();
		};

		/**
		----------------------------------------
		**/
		_init(o);
	};


	/**
	JQUERY WRAPER
	**/
	$.fn.calendar = function (o, a, b) {
		var $e = $(this);
		var Calendar = $e.data('Calendar');
		if (!Calendar) {
			Calendar = new $.calendar($e, o);
			$e.data('Calendar', Calendar);
		} else if (Calendar) {
			if ($.type(o) == 'string') {
				if ($.type(Calendar[o]) == 'function') return Calendar[o].call(null, a, b);
				else if ($.isPlainObject(o)) return Calendar.setOptions(o);
				else if ($.type(o) == 'string' && a) return Calendar.setOptions({ o: a });
				else console.warn('Calendar method "' + o + '"" not found');
			}
		} else {
			console.error('Calendar was not found');
			return false;
		}
		return Calendar;
	};


	$.leadZero = function (num) {
		return (num === 0 || num === '0' ? '00' : (num < 10 ? '0' : '') + num);
	};
	$.parseDateFormat = function (format) {
		if (!format) return '';
		else if (format == 'pt' || format == 'br' || format == 'pt-br' || format == 'd/m/Y') return 'DD/MM/YYYY';
		else if (format == 'en' || format == 'us' || format == 'eng' || format == 'Y-m-d') return 'YYYY-MM-DD';
		else if (format == 'datetime' || format == 'Y-m-d H:i:s') return 'YYYY-MM-DD HH:mm:ss';
		else if (format == 'Y-m-d H:i') return 'YYYY-MM-DD HH:mm';
		else if (format == 'd/m/Y H:i:s') return 'DD/MM/YYYY HH:mm:ss';
		else if (format == 'd/m/Y H:i') return 'DD/MM/YYYY HH:mm';
		else if (format.indexOf('datetime') > -1 && format.indexOf('br') > -1) return 'DD/MM/YYYY HH:mm:ss';
		else if (format.indexOf('datetime') > -1 && format.indexOf('us') > -1) return 'YYYY-MM-DD HH:mm:ss';
		else if (format == 'month' || format == 'Y-m') return 'YYYY-MM';
		else if (format == 'time' || format == 'H:i:s') return 'HH:mm:ss';
		else if (format == 'time-short' || format == 'H:i') return 'HH:mm';
		return format;
	};
	$.isDate = function (date, format) {
		if (typeof moment != 'function' || typeof date == 'undefined' || date === '') return '';
		var M = moment(date, $.parseDateFormat(format));
		return M.isValid();
	};
	$.toDate = function (date, format) {
		var M;
		if (typeof moment != 'function' || typeof date == 'undefined' || date === '') return '';
		if (date instanceof moment) M = moment;
		else if (date instanceof Date) M = moment(date);
		else if ($.type(date) === 'string') {
			if (date.length == 6 && date.indexOf(':') === 2) M = moment(date, 'HH:mm');
			else if (date.length == 8 && date.indexOf(':') === 2) M = moment(date, 'HH:mm:ss');
			else if (date.length == 10 && date.indexOf('/') === 2) M = moment(date, 'DD/MM/YYYY');
			else if (date.length == 10 && date.indexOf('-') === 4) M = moment(date, 'YYYY-MM-DD');
			else if (date.length == 10 && Number(date) === parseInt(date)) M = moment.unix(date);
			else if (date.length == 19 && date.indexOf('/') === 2) M = moment(date, 'DD/MM/YYYY HH:mm:ss');
			else if (date.length == 19 && date.indexOf('-') === 4) M = moment(date, 'YYYY-MM-DD HH:mm:ss');
			else if (date.length == 16 && date.indexOf('/') === 2) M = moment(date, 'DD/MM/YYYY HH:mm');
			else if (date.length == 16 && date.indexOf('-') === 4) M = moment(date, 'YYYY-MM-DD HH:mm');
			else if (date.length == 28 && date.indexOf('/') === 2 && date.indexOf('.') > -1) M = moment(date.substring(-9), 'DD/MM/YYYY HH:mm:ss');
			else if (date.length == 28 && date.indexOf('-') === 4 && date.indexOf('.') > -1) M = moment(date.substring(-9), 'YYYY-MM-DD HH:mm:ss');
		} else if ($.type(date) === 'number') {
			M = moment(date);
		}
		if (M && M.isValid()) {
			if (format == 'obj' || format == 'Date' || $.isEmptyObject(format)) return M.toDate();
			else if (format == 'array' || $.isArray(format)) return M.toArray();
			else if (format == 'iso') return M.toISOString();
			else if (format == 'moment') return M;
			else return M.format($.parseDateFormat(format || 'us'));
		}
		return '';
	};
	$.toTime = function (time, format) {
		var M;
		if (typeof time == 'undefined' || time === '') return '';
		else if (time instanceof Date) return $.leadZero(time.getHours()) + ':' + $.leadZero(time.getMinutes()) + (format == 'full' ? ':' + $.leadZero(time.getSeconds()) : '');
		else if ($.type(time) === 'string') {
			if (time.length == 19 && time.indexOf(':') === 13) return $.toDate(time, (format == 'full' ? 'HH:mm:ss' : 'HH:mm'));
			else if (time.length == 16 && time.indexOf(':') === 13) return $.toDate(time, (format == 'full' ? 'HH:mm:[00]' : 'HH:mm'));
			else if (time.length == 8 && time.indexOf(':') === 2) return $.toDate('2000-01-01 ' + time, (format == 'full' ? 'HH:mm:ss' : 'HH:mm'));
			else if (time.length == 5 && time.indexOf(':') === 2) return $.toDate('2000-01-01 ' + time, (format == 'full' ? 'HH:mm:[00]' : 'HH:mm'));
		} else if ($.type(time) === 'number') {
			return $.toDate(time, (format == 'full' ? 'HH:mm:ss' : 'HH:mm'));
		}
		return '';
	};
	$.toFullDate = function (str, lang, type) {
		if (str === '') return '';
		var date = (str instanceof Date) ? str : $.toDate(str, 'obj');
		if (lang == 'br' || lang == 'pt') {
			if (type == 'short') return $.weekNames('pt', 'short', date.getDay()) + ', ' + date.getDate() + ' ' + $.monthNames('pt', 'short', date.getMonth()) + ' ' + date.getFullYear();
			else if (type == 'unpreposited') return $.weekNames('pt', 'full', date.getDay()) + ', ' + date.getDate() + ' ' + $.monthNames('pt', 'full', date.getMonth()) + ' ' + date.getFullYear();
			else return $.weekNames('pt', 'full', date.getDay()) + ', ' + date.getDate() + ' de ' + $.monthNames('pt', 'full', date.getMonth()) + ' de ' + date.getFullYear();
		} else if (lang == 'en' || lang == 'eng') {
			if (type == 'short') return $.weekNames('eng', 'short', date.getDay()) + ', ' + $.monthNames('eng', 'short', date.getMonth()) + ' ' + date.getDate() + ' ' + date.getFullYear();
			else if (type == 'unpreposited') return $.weekNames('eng', 'full', date.getDay()) + ', ' + $.monthNames('eng', 'full', date.getMonth()) + ' ' + date.getDate() + ' ' + date.getFullYear();
			else return $.weekNames('eng', 'full', date.getDay()) + ', ' + $.monthNames('eng', 'full', date.getMonth()) + ' ' + date.getDate() + ' ' + date.getFullYear();
		}
		return $.weekNames(lang, type, date.getDay()) + ', ' + date.getDate() + ' de ' + $.monthNames(lang, type, date.getMonth()) + ' de ' + date.getFullYear();
	};
	$.toFullDatetime = function (str, lang, type, html) {
		if (!str) return '';
		var date = (str instanceof Date) ? str : $.toDate(str, 'obj');
		if (date) {
			var d = $.toFullDate(date, lang, type);
			var hh = date.getHours(), mm = date.getMinutes(), ss = date.getSeconds();
			var t = (mm === 0 && ss === 0) ? hh + 'hs' : $.leadZero(hh) + ':' + $.leadZero(mm) + (type == 'long' ? ':' + $.leadZero(ss) : '');
			if (!html) return d + (type == 'short' ? '' : (lang == 'pt' || lang == 'br' ? ' as' : ' at')) + ' ' + t;
			else return '<span class="literaldate">' + d + '</span> <span class="literaltime">' + (type == 'short' ? '' : (lang == 'pt' || lang == 'br' ? ' as ' : ' at ')) + t + '</span>';
		}
		return '';
	};
	$.toFullDatetimeHTML = function (str, lang, type) {
		return $.toFullDatetime(str, lang, type, true);
	};
	$.monthNames = function (lang, type, n) {
		var monthNames = { pt: { abbr: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], short: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"], full: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] }, eng: { abbr: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], short: ["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] } };
		if (type && lang && typeof n != 'undefined') return (monthNames[lang] && monthNames[lang][type] && monthNames[lang][type][n]) ? monthNames[lang][type][n] || null : null;
		else if (type && lang) return (monthNames[lang] && monthNames[lang][type]) ? monthNames[lang][type] || [] : [];
		else if (lang) return (monthNames[lang]) ? monthNames[lang] || [] : [];
		return monthNames;
	};
	$.weekNames = function (lang, type, n) {
		var weekNames = { pt: { abbr: ["D", "S", "T", "Q", "Q", "S", "S"], short: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"], full: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] }, eng: { abbr: ["S", "M", "T", "W", "T", "F", "S"], short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] } };
		if (type && lang && typeof n != 'undefined') return (weekNames[lang] && weekNames[lang][type] && weekNames[lang][type][n]) ? weekNames[lang][type][n] || null : null;
		else if (type && lang) return (weekNames[lang] && weekNames[lang][type]) ? weekNames[lang][type] || [] : [];
		else if (lang) return (weekNames[lang]) ? weekNames[lang] || {} : {};
		return weekNames;
	};
	$.extractDate = function (str, format) {
		if (format == 'br' || format == 'pt') return $.toDate(str, 'd/m/Y');
		return $.toDate(str, 'Y-m-d');
	};
	$.extractTime = function (str, format) {
		return $.toTime(str, format || 'short');
	};
}(jQuery));
