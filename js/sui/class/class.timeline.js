(function ($) {

	$.timeline = function (jq,o){

		this.defaults = {
			lang : 'pt',
			mode : 'horizontal',
			collapsed : true,
			json : {},
		};

		var Timeline = this;
		var Element = jq instanceof jQuery ? jq : $(jq);
		var Data = { setup:{} };

		var jQ = {
			mark : $('<mark></mark>'),
			label : $('<label></label>'),
			line : $('<div class="line"></div>'),
			years : $('<div class="years"></div>'),
			year : $('<div class="year"></div>'),
			months : $('<div class="months"></div>'),
			month : $('<div class="month"></div>'),
			decas : $('<div class="decas"></div>'),
			deca : $('<div class="deca"></div>'),
			days : $('<div class="days"></div>'),
			day : $('<div class="day"><a></a></div>'),
		};

		/**
		----------------------------------------
		@ BUILDER METHODS
		----------------------------------------
		**/
		var Build = {

			// CALENDAR ----------------
			timeline : function(){

				Element.attr('class','sui-timeline noswipe '+Data.setup.mode).customScroll({x:true});
				if (Data.setup.mode && Build[Data.setup.mode]) Build[Data.setup.mode]();
				else Build.horizontal();

			},

			// HORIZONTAL ----------------
			horizontal : function(){

				var $years = jQ.years.clone();
				var $year = {};
				var $months = {};
				var $month = {};
				//var $decas = {};
				var $days = {};

				Data.nodes = {};
				Data.min = Data.now;
				Data.max = Data.now;

				$.each(Data.setup.json||[],function(k,v){
					var Dob = v.date = $.toDate(k,'Date');
					var year = Dob.getFullYear();
					var month = Dob.getMonth();
					var day = Dob.getDate();
					var stamp = Dob.getTime();
					if (stamp < Data.min.getTime()) Data.min = Dob;
					if (stamp > Data.max.getTime()) Data.max = Dob;
					Data.nodes[year] = Data.nodes[year] || {};
					Data.nodes[year][month] = Data.nodes[year][month] || {};
					Data.nodes[year][month][day] = Data.nodes[year][month][day] || [];
					Data.nodes[year][month][day].push(v);
				});

				var ny = Data.now.getFullYear();
				var nm = Data.now.getMonth();
				var nd = Data.now.getDate();
				var miny = Data.min.getFullYear();
				var minm = Data.min.getMonth();
				var maxy = Data.max.getFullYear();
				var maxm = Data.max.getMonth();

				Data.nodes[ny] = Data.nodes[ny] || {};
				Data.nodes[ny][nm] = Data.nodes[ny][nm] || {};
				Data.nodes[ny][nm][nd] = Data.nodes[ny][nm][nd] || [];
				Data.nodes[ny][nm][nd].push(true);

				Data.curr = new Date(Data.min.getFullYear(), Data.min.getMonth(), 15, 0, 0, 0, 0);

				for (var idx = 0; idx <= 1000; idx++){
					var cy = Data.curr.getFullYear();
					var cm = Data.curr.getMonth();
					var _isIni = (cy === miny && cm === minm) ? true : false;
					var _isEnd = (cy === maxy && cm === maxm) ? true : false;
					if (!$year[cy]){
						$year[cy] = jQ.year.clone();
						$year[cy].append(jQ.label.clone().text(cy));
						$year[cy].attr('data-year',cy);
						$years.append($year[cy]);
					}
					if (!$months[cy]){
						$months[cy] = jQ.months.clone();
						$year[cy].append($months[cy]);
					}
					$month[cy] = $month[cy] || {};
					if (!$month[cy][cm]){
						$month[cy][cm] = jQ.month.clone();
						$month[cy][cm].attr('data-month',cm);
						$month[cy][cm].attr('data-dim',_dim(cy,cm));
						$month[cy][cm].append(jQ.label.clone().text(Data.monthNames.short[cm]));
						$month[cy][cm].append(jQ.line.clone());
						$months[cy].append($month[cy][cm]);
					}
					if (_isIni){
						$month[cy][cm].addClass('ini');
					}
					if (_isEnd){
						$month[cy][cm].addClass('end');
					}
					if (Data.nodes[cy] && Data.nodes[cy][cm]){
						$year[cy].addClass('contain');
						$month[cy][cm].addClass('contain');
						$days[cy] = $days[cy] || {};
						if (!$days[cy][cm]){
							$days[cy][cm] = jQ.days.clone();
							$month[cy][cm].append($days[cy][cm]);
						}
						var $day = {};
						$.each(Data.nodes[cy][cm],function(cd,ar){
							$day[cd] = jQ.day.clone();
							$day[cd].attr('data-day',cd);
							$day[cd].data('date',new Date(cy,cm,cd,0,0,0,0));
							if (ar.length){
								var ttl = 0;
								$.each(ar,function(ka,va){
									if (va === true){
										$day[cd].addClass('today');
										return true;
									}
									$day[cd].data('nodes',ar);
									ttl++;
								});
							}
							var $a = $day[cd].children('a');
							$a.append(jQ.mark.clone().text(ttl||''));
							$a.append(jQ.label.clone().html(cd+'<small>'+Data.monthNames.short[cm]+'</small>'));
							$days[cy][cm].append($day[cd]);
						});
					}
					if (_isEnd) break;
					Data.curr.setMonth(cm + 1);
				}

				jQ.root = $years;
				Element.html(jQ.root);
				Element.append(jQ.modal);

				var $cmon = jQ.root.find('.month.contain');
				$cmon.each(function(){

					var $month =  $(this);
					var dim = $month.data('dim');
					var $days = $month.find('.day');
					var qtDays = $days.length;
					var dayWidth = $days.filter(':first').width()||0;
					var minDayWidth = (dayWidth/20);
					var minMonthWidth = (minDayWidth * (dim - qtDays)) + (dayWidth * qtDays);
					$month.css('min-width',minMonthWidth+'px');
					var monthWidth = $month.width();
					$month.css('width',monthWidth+'px');
					var emptyDayWidth = (monthWidth - (dayWidth * qtDays)) / dim;
					var dayPointer = 1;
					$days.each(function(k,v){
						var $day = $(this);
						var dayNumber = $day.data('day');
						var dayMargin = (dayNumber - dayPointer) * emptyDayWidth;
						$day.css('margin-left',dayMargin+'px');
						dayPointer = dayNumber;
					});

					/*
					var $month =  $(this);
					var dim = $month.data('dim');
					var $days = $month.find('.day');
					var dwid = $days.filter(':first').width()||0;
					var minwid = $days.length * (dwid * 2);
					var pcptr = 0;
					if (minwid) $month.css('min-width',minwid+'px');
					var dperc = (dwid * 100) / Math.max(minwid,$month.width())||0;
					console.log('month',$month.data('month'));
					$days.each(function(k,v){
						var $day = $(this);
						var dwid = $day.width();
						var vday = $day.data('day');
						var perc = (vday * 100) / dim;
						var marg = perc-pcptr;
						var xmarg = marg - (dperc * (($days.length-1-k)/2)); //acertar essa conta fdp
						console.log('marg',marg,xmarg,dperc);
						if (xmarg > 0){
							$day.css('margin-left',xmarg+'%');
						}
						if (xmarg + dperc > 100){
							$day.css('margin-left',(100-dperc)+'%');
						}
						if ($day.is(':first-child') && $month.hasClass('ini')){
							$month.children('.line').css('left',(xmarg+dperc/2)+'%');
						}
						if ($day.is(':last-child') && $month.hasClass('end')){
							$month.children('.line').css('right',(100-perc+dperc)+'%');

						}
						pcptr = perc + dperc/2;
					});
					*/

					/*
					var $month =  $(this);
					var dim = $month.data('dim');
					var $cday = $month.find('.day');
					var pct = 0;
					var mnw = 0;

					$cday.each(function(k,v){
						var $day = $(this);
						var mwidth = $month.width();
						var $days =  $day.parent();
						var dwid = $day.width();
						var vday = $day.data('day');
						var perc = (vday * 100) / dim;
						var marg = (perc - pct);
						if (minw > mwidth){
							mwidth = minw;
							$month.css('min-width',minw+'px');
						}
						var fact = (marg * mwidth) / 100;
						if (fact > dwid) $day.css('margin-left','calc('+marg+'% - '+dwid+'px)');
						if ($day.is(':first-child') && $month.hasClass('ini')){
							$month.children('.line').css('left','calc('+marg+'% - '+(dwid/2)+'px)');
						}
						if ($day.is(':last-child') && $month.hasClass('end')){
							$month.children('.line').css('right','calc('+(100 - perc)+'% - '+(dwid)+'px)');
						}
						mnw += (fact > 0) ? fact + dwid : dwid;
						pct = perc;
					});
					if (mnw > $month.width()) $month.css('min-width',mnw+'px');
					*/
				});

				Element.addClass('built');
			},

		};
		/**
		----------------------------------------
		**/



		/**
		----------------------------------------
		@ PUBLIC METHODS
		----------------------------------------
		**/
		this.setOptions = function(o){
			_setNow();
			$.extend(true, Data.setup, o||{});
			Data.monthNames = $.extend($.monthNames(),Data.setup.monthNames||{})[Data.setup.lang] || $.monthNames('eng');
			Build.timeline();
			return Timeline;
		};
		this.setOption = function(a,b){
			var o = {}; o[a] = b;
			return Timeline.setOptions(o);
		};
		this.setJSON = function(d){
			return Timeline.setOption('json',d);
		};
		/**
		----------------------------------------
		**/


		/**
		----------------------------------------
		@ PRIVATE METHODS
		----------------------------------------
		**/
		var _setNow = function(){
			Data.now = new Date();
			clearTimeout(Data.nowtimeout);
			Data.nowtimeout = setTimeout(_setNow,33333);
		};

		var setNodes = function(){
		};

		var _monthDiff = function (d1, d2) {
		    var months;
		    months = (d2.getFullYear() - d1.getFullYear()) * 12;
		    months -= d1.getMonth() + 1;
		    months += d2.getMonth();
		    return months <= 0 ? 0 : months;
		};

		var _bind = function(){

			var $modal = $('#suiTimelineModal');
			var $mtitle = $modal.find('.header > .title');
			var $mcont = $modal.find('.content');
			jQ.root.on('click',function(event){
				event.stopPropagation();
			});
			jQ.root.on('click','.day > a',function(event){
				$mtitle.html('');
				$mcont.html('');
				var $a = $(this);
				var $d = $a.parent();
				var $view = $d.closest('.sui-view');
				if (!$('body').is('.mobile')){
					var aos = $a.offset();
					var cl = Math.ceil(aos.left + ($a.width() / 2) - ($modal.width() / 2));
					var cr = cl + $modal.width();
					var ct = aos.top - $modal.height();
					var nr = cr >= $(window).width() ? 16 : 'inherit';
					var nl = nr == 'inherit' ? (cl <= 0 ? 16 : cl) : 'inherit';
					var nt = ct <= 0 ? 'inherit' : ct;
					var nb =  nt == 'inherit' ? 0 : 'inherit';
					$modal.show();
					$modal.css({
						'left' : nl,
						'right' : nr,
						'top' : nt,
						'bottom' : nb,
					});
				}
				var lastnode = {};
				var html = '';
				$.each($d.data('nodes')||[],function(k,v){
					var str = '', inf = '', dff = '', det = '', all = '';
					var node = {
						who: v['Pessoa']||v['Usuário']||v['User']||v['user']||v['us']||v['person']||v['pes']||v['who'],
						what: v['Ação']||v['action']||v['act']||v['what'],
						when: v['Data']||v['date']||v['when']||v['em'],
						device: v['Dispositivo']||v['device']||v['dev'],
						session: v['Sessão']||v['session']||v['sid'],
						latlon: v['Geolocalização']||v['geoloc']||v['geolocation']||v['latlon']||v['latlng'],
						file: v['Arquivo']||v['file']||v['fle'],
						ip: v['IP']||v['ip']||v['Ip']||v['address']||v['add'],
						diff: v['diff']||v['difference']||v['data']||v['info']||v['Divergência']
					};
					if (!node.when) return true;
					str += '<strong>'+(node.what||'Ação Obscura')+'</strong> ';
					lastnode.what = node.what;
					str += '<br /><span>por <b>'+(node.who||'Indefinido')+'</b></span>';
					lastnode.who = node.who;
					inf = '<div class="table title"><div class="cell when"><b>'+$.toTime(node.when)+'</b></div><div class="cell what">'+str+'</div><div class="cell expander icon-down"></div></div>';
					str = null;
					if (node.diff){
						dff = '<h4>Diferenças</h4><div class="table difference">';
						$.each(node.diff,function(ka,va){
							dff += '<div class="row"><div class="cell label">'+va.label+'</div><div class="cell"><div class="old">'+va.old+'</div><div class="new">'+va.new+'</div></div></div>';
						});
						dff += '</div>';
					}
					det = '<h4>Dados Locais</h4><div class="table detail">'+
						((node.when)?'<div class="row"><div class="cell"><b>Quando</b></div><div class="cell">'+$.timeagoHTML(node.when,null,'ago')+'</div></div>':'')+
						((node.device)?'<div class="row"><div class="cell"><b>Dispositivo</b></div><div class="cell">'+(node.device||'-')+'</div></div>':'')+
						((node.ip)?'<div class="row"><div class="cell"><b>Endereço IP</b></div><div class="cell">'+(node.ip||'-')+'</div></div>':'')+
						((node.session)?'<div class="row"><div class="cell"><b>Sessão</b></div><div class="cell">'+(node.session||'-')+'</div></div>':'')+
						((node.file)?'<div class="row"><div class="cell"><b>Arquivo</b></div><div class="cell">'+(node.file||'-')+'</div></div>':'')+
						((node.latlon)?'<div class="row"><div class="cell"><b>Geolocalização</b></div><div class="cell">'+(node.latlon||'-')+'</div></div>':'')+
					'</div>';
					html += '<div class="node">'+inf+'<div class="more">'+dff+det+'</div></div>';
				});
				$mtitle.text($.toFullDate($d.data('date'),'pt','unpreposited'));
				$mcont.html(html||'<div class="empty">Não há histórico</div>');
				if (!$modal.is('.active')){
					$modal.find('.window').velocity({ scale:[1,0.88] },200);
					$modal.velocity({
						opacity:[1,0]
					},{
						duration: 200,
						display:'block',
					});
					$modal.addClass('active');
				}
				$modal.data('timeline',Element);
				Element.find('.day.selected').removeClass('selected');
				$d.addClass('selected');
				event.stopPropagation();
			});
			Element.on('scroll',function(){
				$modal.trigger('modal:close');
			});
			Element.scrollLeft(99999);
		};

		var _init = function(o){
			Data.touch = 'ontouchstart' in window;
			Data.setup = Timeline.defaults;
			Element.children('code').each(function(){
				var json = $.trim($(this).text());
				if (json) Data.setup.json = $.extend(Data.setup.json,JSON.parse(json));
			});
			Timeline.setOptions(o);
			_bind();
		};

		var _dim = function(year,month) {
			month += 1;
			return month === 2 ? (year & 3) || (!(year % 25) && year & 15) ? 28 : 29 : 30 + (month + (month >> 3) & 1);
		}

		/**
		----------------------------------------
		**/
		setTimeout(function(){_init(o);},100);
	};


	/**
	JQUERY WRAPER
	**/
	$.fn.timeline = function(o,a,b){
		var $e = $(this);
		var Timeline = $e.data('Timeline');
		if (!Timeline){
			Timeline = new $.timeline($e,o);
			$e.data('Timeline',Timeline);
		} else if (Timeline){
			if ($.type(o) == 'string'){
				if ($.type(Timeline[o]) == 'function') return Timeline[o].call(null,a,b);
				else if ($.isPlainObject(o)) return Timeline.setOptions(o);
				else if ($.type(o) == 'string' && a) return Timeline.setOptions({o : a});
				else console.warn('Timeline method "'+o+'"" not found');
			}
		} else {
			console.error('Timeline was not found');
			return false;
		}
		return Timeline;
	};

}(jQuery));

$(function(){

	var $m = $('#suiTimelineModal');
	if ($m.length){
		$m.html('<div class="window">'+
						'<ul class="header">'+
							'<li class="nav prev icon-left"></li>'+
							'<li class="title">Log</li>'+
							'<li class="nav next icon-right"></li>'+
						'</ul>'+
						'<div class="content scroll-custom">'+
						'</div>'+
						'<ul class="footer">'+
							'<li><a class="button close">Fechar</a></li>'+
						'</ul>'+
					'</div>');
		$m.on('click',function(event){
			event.stopPropagation();
		});
		$m.on('modal:close',function(){
			if ($m.is('.active')){
				$m.find('.window').velocity({ scale:[0.88,1] },200);
				$m.velocity({
					opacity:[0,1]
				},{
					duration: 200,
					display:'none'
				});
				$m.removeClass('active');
			}
			var $tl = $m.data('timeline');
			if ($tl && $tl.length) $tl.find('.day.selected').removeClass('selected');
		});
		$m.on('click','.header .nav:not(.disable)',function(){
			var $this = $(this);
			var $tl = $m.data('timeline');
			var $days = $tl.find('.day');
			var $day = $days.filter('.selected');
			var idx = $days.index($day);
			if ($this.is('.prev')) $days.filter(':eq('+(idx-1)+')').children('a').trigger('click');
			else if ($this.is('.next')) $days.filter(':eq('+(idx+1)+')').children('a').trigger('click');
		});
		$m.find('.close').on('click',function(){
			$m.trigger('modal:close');
		});
		$m.on('click','.title',function(){
			var $this = $(this);
			var $node = $this.parent();
			if ($node.hasClass('expanded')){
				$node.find('.more').velocity({opacity:[0,1]}, { duration: 250, display:'none' });
				$node.removeClass('expanded');
			} else {
				$node.find('.more').velocity({opacity:[1,0]}, { duration: 250, display:'block' });
				$node.addClass('expanded');
			}
			//$this.remove();
		});
	}

	$(document).on('click',function(){
		$m.trigger('modal:close');
	});
});
