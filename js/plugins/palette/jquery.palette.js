// JavaScript Document

$(function(){
	$.fn.palette = function(options){
		var $this = this;
		var $color = window.tinycolor;
		var $palette = {};
		var $html = '';
		var calc = {
			hsv : {
				'dark-light' : function(c){
					var $tiny = $color(c),
						$ntiny = {},
						$hsv = $tiny.toHsv(),
						$nhsv = {};
					for (var i=(options.variations/2); i>=1; i--){
						$nhsv.h = $hsv.h;
						$nhsv.s = $hsv.s + ($hsv.s * (i * (options.variatePercent / 2.5)));
						$nhsv.s = $nhsv.s > 1 ? 1 : $nhsv.s;
						$nhsv.v = $hsv.v - ($hsv.v * (i * options.variatePercent));
						$nhsv.v = $nhsv.v < 0 ? 0 : $nhsv.v;
						$nhsv.a = options.alpha || $hsv.a;
						$ntiny = $color($nhsv);
						$palette[c].push($ntiny.toHexString());
					}
					$palette[c].push($tiny.toHexString());
					for (var i=1; i<=(options.variations/2); i++){
						$nhsv.h = $hsv.h;
						$nhsv.s = $hsv.s - ($hsv.s * (i * (options.variatePercent / ($tiny.isLight() ? 1 : 3))));
						$nhsv.s = $nhsv.s > 1 ? 1 : $nhsv.s;
						//$nhsv.s = $hsv.s;
						$nhsv.v = $hsv.v + ($hsv.v * (i * options.variatePercent));
						$nhsv.v = $nhsv.v > 1 ? 1 : $nhsv.v;
						$nhsv.a = options.alpha || $hsv.a;
						$ntiny = $color($nhsv);
						$palette[c].push($ntiny.toHexString());
					}
				}
			},
			rgb : {
				'dark-light' : function(c){
					var $tiny = $color(c),
						$ntiny = {},
						$rgb = $tiny.toRgb(),
						$nrgb = {};
					for (var i=(options.variations/2); i>=1; i--){
						$nrgb.r = $rgb.r - ($rgb.r * (i * options.variatePercent));
						$nrgb.g = $rgb.g - ($rgb.g * (i * options.variatePercent));
						$nrgb.b = $rgb.b - ($rgb.b * (i * options.variatePercent));
						$nrgb.a = options.alpha || $rgb.a;
						$ntiny = $color($nrgb);
						$palette[c].push($ntiny.toHexString());
					}
					$palette[c].push($tiny.toHexString());
					for (var i=1; i<=(options.variations/2); i++){
						$nrgb.r = $rgb.r + ($rgb.r * (i * options.variatePercent));
						$nrgb.g = $rgb.g + ($rgb.g * (i * options.variatePercent));
						$nrgb.b = $rgb.b + ($rgb.b * (i * options.variatePercent));
						$nrgb.a = options.alpha || $rgb.a;
						$ntiny = $color($nrgb);
						$palette[c].push($ntiny.toHexString());
					}
				}
			}
		}
		var defaults = {
			colors : 'general',
			alpha : 1,
			variations : 8,
			variatePercent : 0,
			variateTo : 'dark-light',
			algorithm : 'hsv',
		}
		options = $.extend(true, {}, defaults, options);
		options.selected = (options.selected) ? $color(options.selected).toHexString() : null;
		if ($color){
			if ($.isArray(options.colors)){
				$.each(options.colors,function(k,v){
					if ($.isArray(v)){
						$palette[k] = v;
					} else {
						$palette[v] = [] ;
					}
				});
			} else {
				switch(options.colors){
					case 'general':	$palette = {'#999':[],'#02C':[],'#0AA':[],'#080':[],'#FA0':[],'#F40':[],'#900':[],'#F3F':[],'#90F':[]}; break;
				}
			}
			if (options.variations > 0){
				$.each($palette||[],function(c,p){
					options.variatePercent = options.variatePercent || (1 / options.variations);
					calc[options.algorithm][options.variateTo](c);
				});
			}
			$.each($palette||[],function(c,p){
				$html += '<ul>';
				$.each(p||[],function(i,h){
					$html += '<li><div style="background-color:'+h+';" data-value="'+h+'" class="'+((h==options.selected)?'selected':'')+'"></div></li>';
				});
				$html += '</ul>';
			});
		}
		$this.html($html);
	}
});
