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

sourceui.interface.widget.chart = function($widget,setup){

	'use strict';

	var Chart = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;

	var High;

	Chart.common = new Interface.widget.common($widget,setup);
	Chart.widget = $widget;
	Chart.parent = Chart.widget.find('.area');

	var Promises = {
		visible : function(){
			return new Promise(function(resolve, reject){
				if (!Chart.widget.is(':visible')){
					var readyinterval = setInterval(function(){
						if (Chart.widget.is(':visible')){
							resolve(true);
							clearInterval(readyinterval);
						}
					},1000);
				} else {
					resolve(true);
				}
			});
		}
	};

	Chart.init = function($chart){
		$chart.each(function () {
			var $this = $(this);
			var data = $this.text();
			$this.text('');
			eval('data = ' + data);
			data = $.extend(true, {
				tooltip: {
					borderRadius: 0
				},
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: 0,
					plotShadow: false,
					margin: [0, 0, 0, 0],

				},
				title: false,
				tip: {
					number: true,
					series: true,
				},
			}, data);
			data = $.extend(true, data, {
				tooltip: data.tip ? {
					useHTML: true,
					shadow: false,
					backgroundColor: 'rgba(255,255,255,0.9)',
					delayForDisplay: 150,
					hideDelay: 150,
					formatter: function () {
						var value = this.y, html = '';
						if (data.tip.percent) value = $.toFloat(this.y, data.tip.decimal || 1) + '%';
						else if (data.tip.money) value = $.toMoney(this.y, '');
						else if (data.tip.int) value = $.toInt(this.y);
						else if (data.tip.number) value = $.toNumber(this.y);
						if (data.tip.prefix) value = data.tip.prefix + ' ' + value;
						if (data.tip.series) html += '<small style="color:#999" style="font-size:0.8em;">' + this.series.name + '</small><br/>';
						if (data.tip.labels) html += data.tip.labels[this.point.index] || '';
						else if (this.point.name) html += this.point.name;
						else if (this.x) html += this.x;
						html += ' <strong style="color:' + (data.tip.color === false ? '#333' : data.tip.color || this.point.color) + '">' + value + '</strong>';
						return '<div style="font-size:11px; letter-spacing:-0.5px;">' + html + '</div>';
					}
				} : {},
				title: data.title === false ? { text: "" } : data.title,
				subTitle: data.title === false ? { text: "" } : data.subTitle,
				credits: data.title === false ? { enabled: false } : data.credits,
				lang: { noData: "Não ha dados para serem vistos no gráfico" },
				noData: { style: { fontWeight: "500", fontSize: "11px", color: "#DDD" }}
			});
			if (Chart.widget.hasClass('fit') && !Device.ismobile) {
				data.chart.height = $this.closest('.column, .line, .area').height();
			} else {
				if (data.chart.height) $this.closest('.column, .line, .area').css('minHeight', data.chart.height);
			}
			//setTimeout(function () {
				High = Highcharts.chart($this.get(0), data);
				//$this.highcharts(data);
			//}, 1);
		});
	}

	Promises.visible().then(function(r){

		if (Chart.widget.hasClass('fit')) Chart.common.fit();

        Chart.init(Chart.widget.find('[data-chart-type]'));
    });


	Chart.widget.on('widget:resize',function(){
		setTimeout(function () {
			High.reflow();
		},200);
	});

};