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

var sourceui = { interface: { widget: {} }, instances: { interface: {} }, templates: {}, timediff: 0 };
/*
---------------------------
jQuery.deparam
---------------------------
Método jquery que transforma querystrings em objetos
	@i - string - required - querystring de entrada
---------------------------
*/
(function (h) {
	h.deparam = function (i, j) {
		if (typeof i != 'string') return i;
		var d = {},
			k = {
				"true": !0,
				"false": !1,
				"null": null
			};
		h.each(i.replace(/\+/g, " ").split("&"), function (i, l) {
			var m;
			var a = l.split("=");
			a = [a.shift(), a.join('=')];
			var c = decodeURIComponent(a[0]),
				g = d,
				f = 0,
				b = c.split("]["),
				e = b.length - 1;
			/\[/.test(b[0]) && /\]$/.test(b[e]) ? (b[e] = b[e].replace(/\]$/, ""), b = b.shift().split("[").concat(b), e = b.length - 1) : e = 0;
			if (2 === a.length) {
				if (a[1].indexOf('[') === 0) {
					a = a[1].slice(1, -1).split(',');
					d[c] = JSON.parse('["' + a.join('","') + '"]');
				} else if (a = decodeURIComponent(a[1]), j && (a = a && !isNaN(a) ? +a : "undefined" === a ? void 0 : void 0 !== k[a] ? k[a] : a), e) {
					for (; f <= e; f++) c = "" === b[f] ? g.length : b[f], m = g[c] = f < e ? g[c] || (b[f + 1] && isNaN(b[f + 1]) ? {} : []) : a, g = m;
				} else h.isArray(d[c]) ? d[c].push(a) : d[c] = void 0 !== d[c] ? [d[c], a] : a;
			} else c && (d[c] = j ? void 0 : "");
		});
		return d;
	};

})(jQuery);


/*
---------------------------
jQuery.fn.attr
---------------------------
Extensor do método jquery que integra a habilidade de retornar todos os atributos de um elemento
---------------------------
*/
(function (old) {
	$.fn.attr = function () {
		if (arguments.length === 0) {
			if (this.length === 0) {
				return {};
			}
			var obj = {};
			$.each(this[0].attributes, function () {
				if (this.specified) {
					obj[this.name] = this.value;
				}
			});
			return obj;
		}
		return old.apply(this, arguments);
	};
})($.fn.attr);


/*
---------------------------
jQuery.fn.switchClass
---------------------------
Extensor do método jquery que pertence bizarramente ao UI
---------------------------
*/
(function () {
	$.fn.switchClass = function (a, b) {
		this.addClass(b);
		this.removeClass(a);
		return this;
	};
})();


/*
---------------------------
jQuery.ache
---------------------------
Extensor do método de expressão de seltor de jquery que retorna todos os elementos que contenha a string dada como nome dos seus atributos
---------------------------
*/
(function () {
	$.ache = function (type, selector, topper) {
		var collection;
		if (!type) type = 'field';
		if (!selector) selector = '*';
		if (!topper) topper = [$(document)];
		$.each(topper, function (k, t) {
			if (t.length) {
				if (selector.indexOf('@') === 0) {
					if (type == 'field') collection = t.find('.sui-field[data-name="' + selector.substring(1) + '"]');
				} else {
					collection = t.find(selector);
				}
				if (collection && collection.length) return false;
			}
		});
		return collection;
	};
})();


/*
---------------------------
jQuery(':attrHas("string")')
---------------------------
Extensor do método de expressão de seltor de jquery que retorna todos os elementos que contenha a string dada como nome dos seus atributos
---------------------------
*/
(function () {
	$.extend($.expr[':'], {
		attrHas: function (el, _, b) {
			for (var i = 0, atts = el.attributes, n = atts.length; i < n; i++) {
				if (atts[i].nodeName.toLowerCase().indexOf(b[3].toLowerCase()) > -1) {
					return true;
				}
			}
			return false;
		}
	});
})();


/*
---------------------------
jQuery(':attrHas("string")')
---------------------------
Extensor do método de expressão de seltor de jquery que retorna todos os elementos que contenha a string dada como nome dos seus atributos
---------------------------
*/
(function () {
	$.extend($.expr[":"], {
		"containsNC": function (elem, i, match, array) {
			return (elem.textContent || elem.innerText || "").toLowerCase().allReplace({ 'ã': 'a', 'á': 'a', 'â': 'a' }).indexOf((match[3] || "").allReplace({ 'ã': 'a', 'á': 'a', 'â': 'a' }).toLowerCase()) >= 0;
		}
	});
})();



(function (old) {
	$.fn.val = function () {
		var args = arguments;
		if (args.length && this instanceof jQuery && this.length > 1) {
			this.each(function (k, v) {
				$.fn.val.apply($(v), args);
			});
			return;
		}
		var $this = $(this);
		if ($this.hasClass('sui-field')) {
			var customField = $this.data('customField');
			if (typeof customField == 'object') return customField.val.apply(this, arguments);
		} else {
			return old.apply(this, args);
		}
	};
})($.fn.val);
(function () {
	$.fn.caret = function (pos) {
		this.each(function (index, elem) {
			if (elem.setSelectionRange) {
				elem.setSelectionRange(pos, pos);
			} else if (elem.createTextRange) {
				var range = elem.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		});
		return this;
	};
})();

(function () {
	$.getSelector = function (elem) {
		var localname = (elem.localName) ? elem.localName : elem.tagName.toLowerCase();
		var elementid = (elem.id) ? '#' + elem.id : '';
		var classname = (elem.className) ? '.' + elem.className.replace(/\s+/g, '.') : '';
		var elementname = (elem.dataset.name) ? '[data-name="' + elem.dataset.name + '"]' : (elem.name) ? '[name="' + elem.name + '"]' : '';
		return (elementid) ? localname + elementid : (elementname) ? localname + elementname : localname + classname;
	};
	$.fn.getSelector = function () {
		var elem = this.get(0);
		return elem ? $.getSelector(elem) : '';
	};
})();

/*
---------------------------
jQuery.fn.tag
---------------------------
Método jquery que retorna o nome da tag de um elemento
---------------------------
*/
(function () {
	$.fn.tag = function () {
		return this.get(0).tagName.toLowerCase();
	};
})();
/*
---------------------------
jQuery.fn.mergeClass
---------------------------
Método jquery que retorna o nome da tag de um elemento
---------------------------
*/
(function () {
	$.fn.mergeClass = function ($target, cfg) {
		var cna, cnb, clist = [];
		cna = this.attr('class').split(/\s+/);
		cnb = $target.attr('class').split(/\s+/);
		if (cfg && cfg.ignoreInSource) {
			cna = cna.filter(function (v) {
				return v === '' || cfg.ignoreInSource.indexOf(v) > -1 ? false : true;
			});
		}
		if (cfg && cfg.ignoreInTarget) {
			cnb = cnb.filter(function (v) {
				return v === '' || cfg.ignoreInTarget.indexOf(v) > -1 ? false : true;
			});
		}
		clist = $.uniqueArray(cna, cnb);
		this.attr('class', clist.join(' '));
		return this;
	};
})();


/*
---------------------------
jQuery.fn.link
---------------------------
Extensor do método jquery que retorna todos os valores de data-link de um elemento e seus anscestrais ou seta a
propriedade data-link de um dado elemento.
---------------------------
*/

(function () {

	$.fn.link = function () {
		var $this = this;
		var selfData;
		args = arguments;
		if (arguments.length && arguments[0] == '_self') {
			selfData = true;
			args[0] = {};
		}
		if (typeof args[0] == 'object' || typeof args[0] == 'undefined' || !args.length || selfData) {
			var data = arguments[0] || {};
			$.each(this.data() || [], function (k, v) {
				if (k.indexOf("link") > -1) {
					var dk = k.replace("link", "").toLowerCase();
					var sel = $this.getSelector();
					data.nasted = data.nasted || {};
					data.nasted[sel] = data.nasted[sel] || {};
					if (data.nasted[sel][dk] !== v) {
						data.nasted[sel][dk] = v;
						if (dk == 'igonore') {
							data.ignore = data.ignore || {};
							$.each(v.split(",") || [], function (x, y) {
								data.ignore[y] = y;
							});
						}
						if (data.ignore && data.ignore[dk]) {
							if (typeof data[dk] !== 'undefined') {
								delete data[dk];
							}
						} else {
							if (dk == 'key') {
								data.key = data.key || [];
								if (v !== null && v !== '') data.key.push(v);
							} else if (dk == 'owner') {
								data.owner = data.owner || [];
								if (v !== null && v !== '') data.owner.push(v);
							} else if (dk == 'parentkey') {
								if (v !== null && v !== '' && !data.parentkey) data.parentkey = v;
							} else if (dk == 'seed') {
								data.seed = Number(data.seed) || 0;
								data.seed += Number(v) === v ? v : Number(v);
							} else if (dk == 'data') {
								data.data = data.data || {};
								if (typeof v == 'object') data.filter = $.extend(true, data.filter, v);
								else if (v.indexOf('{') > -1) data.data = $.extend(true, data.data, (JSON5) ? JSON5.parse(v) : JSON.parse(v) || {});
								else data.data = $.extend(true, data.data, $.deparam(v));
							} else if (dk == 'filter') {
								data.filter = data.filter || {};
								if (typeof v == 'object') data.filter = $.extend(true, data.filter, v);
								else if (v.indexOf('{') > -1) data.filter = $.extend(true, data.filter, (JSON5) ? JSON5.parse(v) : JSON.parse(v) || {});
								else data.filter = $.extend(true, data.filter, $.deparam(v));
							} else if (dk.indexOf('data-') > -1) {
								data.data = data.data || {};
								data.data[dk.substr(4)] = v;
							} else if (typeof data[dk] == 'undefined') {
								data[dk] = v;
							}
						}
					}
				}
			});
			if (!selfData && !data.origin) {
				var closest = this.parent().closest('*:attrHas("data-link")');
				if (closest.length) closest.link(data);
			}
			return data;
		} else if (typeof args[0] == 'string') {
			if (typeof args[1] == 'undefined') {
				var key = args[0];
				var data = $this.link('_self');
				return data[key];
			} else {
				return this.data('link' + args[0], args[1]);
			}
		}
	};
})();

/*
---------------------------
jQuery.fn.on (unevent)
---------------------------
Extensor do método jquery on para analisar se um evento foi disparado depois de um tempo
---------------------------
*/
(function ($) {
	var on = $.fn.on, timer;
	$.fn.on = function () {
		var args = Array.apply(null, arguments);
		var last = args[args.length - 1];

		if (isNaN(last) || (last === 1 && args.pop())) return on.apply(this, args);

		var delay = args.pop();
		var fn = args.pop();

		args.push(function () {
			var self = this, params = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(self, params);
			}, delay);
		});

		return on.apply(this, args);
	};
}(this.jQuery || this.Zepto));


/*
---------------------------
jQuery.fn.customScroll
---------------------------
Extensr do plugin de scroll que verifica os atributos data como argumentos de configuração para o plugin.
---------------------------
*/
(function () {
	$.fn.customScroll = function (options) {
		if ($('#suiBody').hasClass('mobile')) return;
		var $this = this;
		if (!options || typeof options == 'object') {
			options = options || {};
			options.useBothWheelAxes = true;
			options.swipePropagation = false;
			if (typeof options.wheelSpeed == 'undefined') options.wheelSpeed = 0.5;
			if (typeof options.wheelLength == 'undefined') options.wheelLength = $this.data('scroll-weellength') || 0;
			if (typeof options.suppressScrollX == 'undefined') options.suppressScrollX = (!options.x && options.y) || $this.data('scroll-y') === true || $this.css('overflow-x') == 'hidden';
			if (typeof options.suppressScrollY == 'undefined') options.suppressScrollY = (!options.y && options.x) || $this.data('scroll-x') === true || $this.css('overflow-y') == 'hidden';
		}
		$this.perfectScrollbar(options);
		return $this;
	};
})();


/*
---------------------------
jQuery.fn.customScroll
---------------------------
Extensr do plugin de scroll que verifica os atributos data como argumentos de configuração para o plugin.
---------------------------
*/
(function () {
	$.fn.drag = function (options) {
		var setup = options || {};
		if ((!options || options.engine == 'draggabilly' && $.isFunction($.fn.dragabilly))) {
			setup.containment = setup.containment || setup.constrainTo || null;
		}
	};
})();


/*
---------------------------
jQuery.timeago
---------------------------
---------------------------
*/
(function () {
	$.timeago = function (from, to, type) {
		var ago = 'nunca';
		var month = {
			'abbr': ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
			'name': ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
		};
		var week = {
			'abbr': ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
			'name': ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
		};
		if (from) {
			if (from instanceof Date) from = from.getTime() / 1000;
			else if (typeof from == 'string') from = $.toDate(from, 'Date').getTime() / 1000;
			if (to instanceof Date) to = Date.getTime() / 1000;
			else if (typeof to == 'string') to = $.toDate(to, 'Date').getTime() / 1000;
			from = parseInt(from);
			to = parseInt(to) || Math.round((Date.now() / 1000) + sourceui.timediff);
			type = type || false;
			var past = from < to;
			var diff = to - from;
			diff = diff < 0 ? -(diff) : diff;
			var round = past ? 'floor' : 'ceil';
			var sec = diff;
			var min = Math[round](diff / 60);
			var hou = Math[round](diff / 3600);
			var day = Math[round](diff / 86400);
			var wee = Math[round](diff / 604800);
			var mon = Math[round](diff / 2628002.88);
			var yea = Math[round](diff / 31557600);
			var term = (past) ? 'há ' : 'em ';
			var fromDateObject = new Date(from * 1000);
			var fromFormattedHour = (('0' + fromDateObject.getHours()).substr(-2)) + ':' + (('0' + fromDateObject.getMinutes()).substr(-2));
			var toDateObject = new Date(to * 1000);
			if (!type || type === "ago") {
				if (sec <= 60) ago = 'neste instante';
				else if (min == 1) ago = term + 'um minuto';
				else if (min <= 60) ago = term + min + ' minutos';
				else if (hou == 1) ago = term + 'uma hora';
				else if (hou <= 24) ago = term + hou + ' horas';
				else if (hou <= 24) ago = term + hou + ' horas';
				else if (type === 'ago') {
					if (day == 1) ago = (past) ? 'ontem às ' + fromFormattedHour : 'amanhã às ' + fromFormattedHour;
					else if (day <= 6) ago = term + day + ' dias';
					else if (wee == 1) ago = term + 'uma semana';
					else if (wee <= 4) ago = term + wee + ' semanas';
					else if (mon == 1) ago = term + 'um mês';
					else if (mon <= 12) ago = term + mon + ' meses';
					else if (yea == 1) ago = term + 'um ano';
					else ago = term + yea + ' anos';
				}
				else if (day >= 1) {
					if (day == 1) {
						ago = (past) ? 'ontem às ' + fromFormattedHour : 'amanhã às ' + fromFormattedHour;
					} else {
						if (day <= 7) {
							if (fromDateObject.getFullYear() === toDateObject.getFullYear()) {
								ago = ('0' + fromDateObject.getDate()).substr(-2) + ' ' + month.abbr[fromDateObject.getMonth()] + ' ' + fromFormattedHour;
							} else {
								ago = ('0' + fromDateObject.getDate()).substr(-2) + ' ' + month.abbr[fromDateObject.getMonth()] + '/' + fromDateObject.getFullYear() + ' ' + fromFormattedHour;
							}
						} else {
							if (fromDateObject.getFullYear() === toDateObject.getFullYear()) {
								ago = ('0' + fromDateObject.getDate()).substr(-2) + ' de ' + month.name[fromDateObject.getMonth()];
							} else {
								ago = ('0' + fromDateObject.getDate()).substr(-2) + ' de ' + month.name[fromDateObject.getMonth()] + ' de ' + fromDateObject.getFullYear();
							}
						}
					}
				}
			} else if (type == 'full') {
				ago = week.name[fromDateObject.getDay()] + ', ' + (('0' + fromDateObject.getDate()).substr(-2)) + ' de ' + month.name[fromDateObject.getMonth()] + ' de ' + fromDateObject.getFullYear() + ' as ' + fromFormattedHour;
			} else if (type == 'full-abbr') {
				ago = week.abbr[fromDateObject.getDay()] + ', ' + (('0' + fromDateObject.getDate()).substr(-2)) + ' ' + month.abbr[fromDateObject.getMonth()] + ' ' + fromDateObject.getFullYear() + ' ' + fromFormattedHour;
			} else if (type == 'diff-min') {
				ago = min;
			}
		}
		return ago;
	};
	$.timeagoHTML = function (from, to, type) {
		var to = to || Math.round((Date.now() / 1000) + sourceui.timediff);
		return '<abbr title="' + $.timeago(from, to, 'full') + '" data-stamp="' + from + '" class="timeago"><span>' + $.timeago(from, to, type) + '</span></abbr>';
	};

})();



(function () {
	$.toInt = function (value) {
		if (value === null || value === '') return value;
		if (!$.isNumeric(value)) return value;
		value = (Number(value) === parseInt(value)) ? parseInt(value) : value;
		return value;
	};
	$.toFloat = function (value, decimal) {
		decimal = decimal || 2;
		if (value === null || value === '') return value;
		var val = String(value);
		var ipt = val.indexOf('.');
		var ivg = val.indexOf(',');
		if (ipt > -1 && ivg > -1 && ivg > ipt) val = val.replace(/\./g, '').replace(/,/, '.').replace(/,/, '');
		else if (ipt > -1 && ivg > -1 && ipt > ivg) val = val.replace(/\,/g, '');
		else if (ipt == -1 && ivg > -1) val = val.replace(/\,/, '.');
		else if (ipt == -1 && ivg == -1) val = val + '.' + ('0'.repeat(decimal));
		val = parseFloat(val).toFixed(decimal);
		return val;
	};
	$.toDecimal = function (value, decimal) {
		return $.toFloat(value, decimal);
	};
	$.toNumeric = function (value) {
		if (value === null || value === '') return value;
		var val = ('' + value).replace(/[^0-9\-\.\+\,]/ig, '');
		return val;
	};
	$.toNumber = function (value) {
		if (!$.isNumeric(value)) return NaN;
		return Number($.toNumeric(value));
	};
	$.toMinMax = function (value, min, max) {
		if (value === null || value === '') return value;
		if (!$.isNumeric(value)) return null;
		var min = $.toNumber(min);
		var max = $.toNumber(max);
		var val = $.toNumber(value);
		val = (min && val <= min) ? min : val;
		val = (max && val >= max) ? max : val;
		return val;
	};
	$.toMoney = function (value, prefix, decimal) {
		if (value === null || value === '') return value;
		decimal = (typeof decimal == 'undefined') ? 2 : decimal;
		value = String($.toFloat(value, decimal));
		if (value.indexOf('.') === -1) {
			x1 = value;
			x2 = '0'.repeat(decimal);
		} else {
			x = value.split('.');
			x1 = x[0];
			x2 = (x[1] + '0'.repeat(decimal)).substring(0, decimal);
		}
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + '.' + '$2');
		}
		var pfx = { 'br': 'R$', 'real': 'R$', 'dollar': 'US$', 'us': 'US$', 'eur': '€', 'euro': '€' };
		if (prefix) prefix = (pfx[prefix] || prefix);
		return (prefix ? prefix + ' ' : '') + x1 + ',' + x2;
	};
})();

/*
---------------------------
jQuery(':attrHas("string")')
---------------------------
Extensor do método de expressão de seltor de jquery que retorna todos os elementos que contenha a string dada como nome dos seus atributos
---------------------------
*/

(function () {
	$.toHtml = function (value) {
		return $('<div/>').text(value).html();
	};
	$.toText = function (value) {
		return $('<div/>').html(value).text();
	};
	$.toJson = function (str) {
		var jstr = str.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
		return JSON.parse(jstr);
	};
	$.uniqueArray = function () {
		var arrArg = [];
		$.each(arguments, function () {
			arrArg = arrArg.concat(this);
		});
		return arrArg.filter(function (elem, pos, arr) {
			return arr.indexOf(elem) == pos;
		});
	};
	$.htmlspecialchars = function (str) {
		if (typeof str !== 'string') return str;
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return str.replace(/[&<>"']/g, function (m) { return map[m]; });
	};
	$.noUTF = function (str) {
		var wrong = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïðñòóôõöøùúûüý';
		var right = 'AAAAAAACEEEEIIIIDNOOOOOOUUUUYaaaaaaaceeeeiiiionoooooouuuuy';
		var re = new RegExp('[' + wrong + ']', 'ig');
		return str.replace(re, function (m) { return right.charAt(wrong.indexOf(m)); });
	};
	$.toLiteral = function (str) {
		str = str.replace(/ +/g, '-');
		str = $.noUTF(str);
		str = str.toLowerCase();
		str = str.replace(/[^a-z0-9\-]/ig, '');
		return str;
	};

})();




$(function () {

	$.fn.customField = function () {
		var autofocus = true;
		var args = arguments;
		var ret = [];
		if (typeof args[0] == 'string') {
			this.each(function () {
				var data = $.data(this, 'customField');
				if (data) {
					if (data.methods[args[0]]) {
						ret.push(data.methods[args[0]].apply(this, Array.prototype.slice.call(args, 1)));
					} else if (data.setup) {
						if (args[1]) data.setup[args[0]] = args[1];
						else ret.push(data.setup[args[0]]);
					}
				}
			});
			return ret.length ? ret : this;
		} else {
			return this.each(function () {
				var $f = $(this);
				if (!$.data(this, 'customField')) {
					var c = new sourceui.customField($f, arguments[0]);
					$.data(this, 'customField', c);
					if (!sourceui.instances.device.ismobile && autofocus && $f.data('autofocus') == 'true' || $f.data('autofocus') === true) {
						$f.find(':input').focus();
						autofocus = false;
					}
				}
			});
		}
	};
	$.fn.addon = function () {
		var $this = $(this);
		var addon = $this.data('customField').addon;
		return addon; /*  || whatever you wanted */
	};

	$.fn.isDisable = function (closest) {
		var $this = $(this);
		if ($this.is('.disable')) return true;
		if ($this.closest('.disable').length > 0) return true;
		return false;
	};
	$.fn.isIgnored = function () {
		var $this = $(this);
		if ($this.hasClass('ignored')) return true;
		if ($this.closest('.ignored').length > 0) return true;
		return false;
	};

	$.fn.disable = function (bool) {
		var $this = $(this);
		if (bool === false) return $this.enable();
		if ($this.hasClass('toolbar')) {
			$this.find('li').disable(bool);
		} else if ($this.hasClass('sui-widget')) {
			$this.find('.title').disable(bool);
			$this.find('.area').disable(bool);
		} else if ($this.hasClass('title')) {
			$this.find('.toolbar li').disable(bool);
		} else if ($this.hasClass('area')) {
			$this.find('.sui-fieldset').disable(bool);
			$this.find('.sui-buttonset').disable(bool);
		} else if ($this.hasClass('sui-fieldset')) {
			$this.find('.sui-field').disable(bool);
		} else if ($this.hasClass('sui-buttonset')) {
			$this.find('.sui-button').disable(bool);
		} else if ($this.hasClass('sui-field')) {
			$this.find('.button').disable(bool);
			$this.find('.input').prop('disabled', true);
		}
		if (bool === true) {
			$this.filter('.disable').addClass('already-disable');
		} else {
			$this.find('hasAttr:data-link').addClass('disable');
		}
		$this.addClass('disable');
		$this.trigger('disable');
		return this;
	};
	$.fn.enable = function (bool) {
		var $this = $(this);
		var $prevent = $this.find('.addons .disable');
		if (bool === false) return $this.disable();
		$this.removeClass('disable');
		$this.find('.input, :input').prop('disabled', false);
		$this.find('.disable' + (!bool ? ':not([data-event-enable]):not(.already-disable)' : '')).not($prevent).removeClass('disable');
		$this.trigger('enable');
		return this;
	};
	$.fn.readonly = function (bool) {
		var $this = $(this);
		var $fields;
		if ($this.is('.sui-widget, .area, .sui-fieldset')) {
			$fields = $this.find('.sui-field');
		} else if ($this.hasClass('sui-field')) {
			$fields = $this;
		}
		if (bool === true) {
			if ($fields.length) {
				$fields.addClass('readonly');
				$fields.find('.input, :input').prop('readonly', true);
				$fields.find('.button').disable();
			}
			$this.trigger('readonly');
		} else {
			if ($fields.length) {
				$fields.removeClass('readonly');
				$fields.find('.input, :input').prop('readonly', false);
				$fields.find('.button').enable();
			}
			$this.trigger('editable');
		}
		return this;
	};

	$.fn.ignore = function (bool) {
		var $this = $(this);
		if (bool === false) return $this.consider();
		$this.disable(); ///////////////
		$this.addClass('ignored');
		$this.find('hasAttr:data-link').addClass('ignored');
		if ($this.hasClass('sui-widget')) {
			$this.find('.title').ignore();
			$this.find('.area').ignore();
		} else if ($this.hasClass('title')) {
			$this.find('.toolbar li').addClass('ignored');
		} else if ($this.hasClass('area')) {
			$this.find('.sui-fieldset').ignore();
			$this.find('.sui-buttonset').ignore();
		} else if ($this.hasClass('sui-fieldset')) {
			$this.find('.sui-field').ignore();
		} else if ($this.hasClass('sui-buttonset')) {
			$this.find('.sui-button').ignore();
		} else if ($this.hasClass('sui-field')) {
			$buttons = $this.find('.button').addClass('ignored');
			$links = $this.find('hasAttr:data-link').addClass('ignored');
		}
		$this.trigger($this.is('.sui-field') ? 'field:ignore' : 'ignore');
		return this;
	};
	$.fn.ignored = function (bool) {
		return $.fn.ignore.apply(this, arguments);
	};
	$.fn.consider = function () {
		var $this = $(this);
		$this.removeClass('ignored disable');
		$this.find('.ignored').removeClass('ignored disable');
		$this.enable();
		$this.find('.sui-field').trigger('field:consider');
		$this.trigger($this.is('.sui-field') ? 'field:ignore' : 'ignore');
		return this;
	};



	$.fn.validate = function () {
		var $this = $(this);
		if ($this.hasClass('sui-field') && !$this.isDisable()) {
			return $this.data('customField').validate.test.all();
		}
	};


	$.fn.isOf = function () {
		var args = arguments;
		var elem = this[0];
		var curr = elem;
		var $this = this;
		var $sel = $();
		var $l = (args[1] instanceof jQuery) ? args[1] : $(args[1]);
		if (args[0] === 'first') {
			$sel = $($l[0]);
		} else if (args[0] === 'last') {
			$sel = $($l[$l.length - 1]);
		} else {
			$l.each(function (k, v) {
				if (this === curr) {
					var ks = 0;
					if (args[0] == 'prev') ks = k - 1;
					else if (args[0] == 'next') ks = k + 1;
					var $n = $($l[ks]);
					if ($n.length) {
						if (args[2] === true) {
							if ($n.isDisable() || $n.isIgnored() || !$n.is(':visible')) {
								curr = $l[ks];
							} else {
								$sel = $n;
								return false;
							}
						} else {
							$sel = $n;
							return false;
						}
					}
				}
			});
		}
		return $sel;
	};
	$.fn.prevOf = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('prev');
		return $.fn.isOf.apply(this, args);
	};
	$.fn.nextOf = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('next');
		return $.fn.isOf.apply(this, args);
	};
	$.fn.firstOf = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('first');
		return $.fn.isOf.apply(this, args);
	};
	$.fn.lastOf = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('last');
		return $.fn.isOf.apply(this, args);
	};

	$.fn.firstFound = function () {
		var $found = $();
		var $this = this;
		$.each(arguments, function (k, v) {
			var $f = $this.find(v);
			if ($f.length) {
				$found = $f;
				return false;
			}
		});
		return $found;
	};
	$.fn.findIn = function () {
		var $this = this;
		var $closest, $list, selector;
		if (arguments[1] instanceof jQuery) {
			selector = arguments[0];
			$closest = arguments[1];
		} else if (arguments[0] instanceof jQuery) {
			selector = arguments[1];
			$closest = arguments[0];
		} else {
			selector = arguments[0];
			$closest = $(arguments[1]);
		}
		if ($closest.length && selector) {
			$list = $closest.find(selector);
		}
		if (arguments[2]) {
			if (arguments[2] == 'only') return $list.length === 1 && $list[0] === $this[0] ? true : false;
			else if (arguments[2] == 'first') return $list.length ? $list.first() : $();
			else if (arguments[2] == 'last') return $list.length ? $list.last() : $();
		} else {
			return $list || $();
		}
	};
	$.fn.isOnly = function () {
		var args = Array.prototype.slice.call(arguments);
		args.push('only');
		return $.fn.findIn.apply(this, args);
	};
	$.fn.firstIn = function () {
		var args = Array.prototype.slice.call(arguments);
		args.push('first');
		return $.fn.findIn.apply(this, args);
	};
	$.fn.lastIn = function () {
		var args = Array.prototype.slice.call(arguments);
		args.push('last');
		return $.fn.findIn.apply(this, args);
	};


	$.holidays = {
		data: {},
		webservice: {
			nacional: '//dadosbr.github.io/feriados/nacionais.json',
			regional: {
				sp: '//dadosbr.github.io/feriados/estaduais/SP.json'
			}
		},
		get: function (r) {
			var src = r ? $.holidays.webservice.regional[r] : $.holidays.webservice.nacional;
			$.getJSON(src, function (data) {
				$.each(data || [], function (i, d) {
					if (d.date) {
						$.holidays.data[d.date + '/'] = {
							date: d.date,
							name: d.title
						};
					} else {
						$.each(d.variableDates || [], function (y, v) {
							$.holidays.data[v + '/' + y] = {
								date: v + '/' + y,
								name: d.title
							};
						});
					}
				});
			});
		}
	};
	/*
	$.datepicker.setDefaults({
		inline: true,
		dateFormat: "dd/mm/yy",
		dayNames: [  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado" ],
		dayNamesMin: [ "D", "S", "T", "Q", "Q", "S", "S" ],
		dayNamesShort: [ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab" ],
		monthNames: [ "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" ],
		monthNamesShort: [ "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez" ],
		altFieldTimeOnly: false,
		prevText: "",
		nextText: "",
		beforeShowDay: function(date){
			var stra = $.datepicker.formatDate('dd/mm/', date);
			var strb = $.datepicker.formatDate('dd/mm/yy', date);
			if ($.holidays.data){
				if ($.holidays.data[stra]) return [true, 'holiday', $.holidays.data[stra].name];
				if ($.holidays.data[strb]) return [true, 'holiday', $.holidays.data[strb].name];
			}
			return [true, ''];
		}
	});
	*/
	$.holidays.get();

});


$.levenshtein = function (a, b) {
	var tmp;
	if (a.length === 0) { return b.length; }
	if (b.length === 0) { return a.length; }
	if (a.length > b.length) { tmp = a; a = b; b = tmp; }

	var i, j, res, alen = a.length, blen = b.length, row = Array(alen);
	for (i = 0; i <= alen; i++) { row[i] = i; }

	for (i = 1; i <= blen; i++) {
		res = i;
		for (j = 1; j <= alen; j++) {
			tmp = row[j - 1];
			row[j - 1] = res;
			res = b[i - 1] === a[j - 1] ? tmp : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1));
		}
	}
	return (blen - res) / blen;
};

$.strPad = function (input, pad_length, pad_string, pad_type) {
	var output = input.toString();
	if (pad_string === undefined) { pad_string = '0'; }
	if (pad_type === undefined) { pad_type = 'STR_PAD_RIGHT'; }
	if (pad_type == 'STR_PAD_RIGHT' || pad_type == 'right') {
		while (output.length < pad_length) {
			output = output + pad_string;
		}
	} else if (pad_type == 'STR_PAD_LEFT' || pad_type == 'left') {
		while (output.length < pad_length) {
			output = pad_string + output;
		}
	} else if (pad_type == 'STR_PAD_BOTH' || pad_type == 'both') {
		var j = 0;
		while (output.length < pad_length) {
			if (j % 2) {
				output = output + pad_string;
			} else {
				output = pad_string + output;
			}
			j++;
		}
	}
	return output;
};

$.formatBytes = function (bytes, decimals) {
	if (bytes == 0) return '0 Byte';
	var k = 1000;
	var dm = decimals + 1 || 3;
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	var i = Math.floor(Math.log(bytes) / Math.log(k));
	return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
};
$.formatSpeed = function (bytes, decimals) {
	if (bytes == 0) return '0 bps';
	var k = 1000;
	var dm = decimals + 1 || 3;
	var sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps'];
	var i = Math.floor(Math.log(bytes) / Math.log(k));
	return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
};


$.colorfy = function (value, color) {
	if (typeof value == 'undefined') return '';
	if (color == 'auto' || !color) {
		var n = $.toNumber(value);
		if (!isNaN(n)) {
			if (n > 0) return '#2f8df1';
			else if (n < 0) return '#f12f2f';
			else return '#cccccc';
		}
		var c = {
			'#4F8DDA': /^presen|^realiz|^\d?$/gi,	// newblue
			'#224488': /^nov|^new/gi,	// darkblue
			'#e24040': /exclu|delet|remov|ignor|invali|inváli|negativ|^reprov|^revogad|^não |^no |^n$|^-?\d?$/gi,	// red
			'#5a5a5a': /^ativ|^activ|^sim|^s$|^yes|^y$|^\d$/gi, // dark
			'#F18D25': /ando$|endo$|indo$|^enviad|^ausen|^em /gi,	// orange
			'#BBBBBB': /^inativ|^inactiv|^cancel/gi,	// gray
			'#37a74a': /ado$|edo$|ido$|ído$|^inscri|^true$/gi,	// green

            /*
            '#4F8DDA' : /^nov|^new|^\d?$/gi,	// newblue
			'#e24040' : /exclu|delet|remov|ignor|negativ|^reprov|^revogad|^não|^no|^n$|^-?\d?$/gi,	// red
			'#1E92E0' : /^ativ|^activ|^sim|^yes|^y$|^\d$/gi,	// blue
			'#F18D25' : /ando$|endo$|indo$|^enviad|^em /gi,	// orange
			'#AAAAAA' : /^inativ|^inactiv|^cancelad/gi,	// green
			'#37a74a' : /ado$|edo$|ido$|ído$|^true$/gi,	// green
            */

			//'#D4A600' : "",	// yellow
			//'#6AB769' : "ado$|edo$|ido$|ído$|^true$",	// green
			//'#9C62D2' : "exclu|delet|remov|ignor|negativ",	// purple
			//'#E868D9' : "exclu|delet|remov|ignor|negativ"	// pink
			//'#666666' : "^false$"	// gray
		};
		var a = [];
		var ret;
		if (typeof value == 'object') {
			if (value instanceof jQuery) {
				a.push(value.text());
				a.push(value.attr('title'));
				a.push(value.attr('alt'));
				a.push(value.data('name'));
			} else if (value instanceof Element) {
				a.push(value.content());
				a.push(value.attr('value'));
				a.push(value.attr('label'));
			}
		} else if (typeof value == 'string') {
			a.push(value);
		} else if (typeof value == 'number') {
			a.push(value.toString());
		}
		$.each(a || [], function (ka, va) {
			if (ret) return false;
			if (va !== '' && va !== null) {
				$.each(c, function (kb, vb) {
					if (('' + va).search(vb) > -1) {
						ret = kb;
						return false;
					}
				});
			}
		});
		return ret || '#888888';
	}
	return color;
};

$.hex2rgb = function (hex, alpha, ret) {
	var c, a = [];
	if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
		c = hex.substring(1).split('');
		if (c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
		c = '0x' + c.join('');
		a = [(c >> 16) & 255, (c >> 8) & 255, c & 255];
		if (ret === true) return a;
		if (alpha) a.push(alpha);
		return alpha ? 'rgba(' + (a.join(',')) + ')' : 'rgb(' + (a.join(',')) + ')';
	}
	throw new Error('Bad Hex');
};
$.rgb2hex = function (r, g, b) {
	if (typeof r == 'object') {
		g = r[1];
		b = r[2];
		r = r[0];
	}
	var hex, h = [];
	hex = r.toString(16);
	h.push(hex.length == 1 ? "0" + hex : hex);
	hex = g.toString(16);
	h.push(hex.length == 1 ? "0" + hex : hex);
	hex = b.toString(16);
	h.push(hex.length == 1 ? "0" + hex : hex);
	return '#' + h.join('');
};

$.circleFavicon = function (link,size,text,color,font){

    var canvas = document.createElement("CANVAS");
    canvas.width  = size;
    canvas.height = size;
    var half = Math.round(size/2);
    var mins = Math.round(size/8);
    var fsize = size == 16 ? 6.5 : mins * 3;
    var context = canvas.getContext("2d");

    context.beginPath();
    context.fillStyle = color || "";
    context.arc(half, half, half, 0, 2 * Math.PI, false);
    context.fill();
    context.beginPath();
    context.font = fsize+"px "+(font || "maven, tahoma, arial");
    context.textAlign="center";
    context.fillStyle = "white";
    context.fillText(text, half, half+mins);
    context.fill();

	var original = canvas.toDataURL("image/png");

	context.beginPath();
	context.fillStyle = "#222";
	context.strokeStyle = "#eeeeee";
	context.lineWidth = 1;
    context.arc(size-(half/3.5), (half/3.5), half/3.5, 0, 2 * Math.PI, false);
	context.fill();
	context.stroke();

	var notified = canvas.toDataURL("image/png");

	var $link = $(link);
	$link.attr("href",original)
	$link.attr("data-original",original);
	$link.attr("data-notified",notified);

    $("head").append($link);
}

var Color = function (value) {

	var c;

	if (typeof value == 'string' && value.indexOf('#') === 0) {
		this.hex = value;
		this.rgb = $.hex2rgb(this.hex, false, true);
	} else if ($.isPlainObject(value)) {
		this.rgb = [value.r, value.g, value.b];
		this.hex = $.rgb2hex(this.rgb);
	} else if ($.isArray(value) && value.length === 3) {
		this.rgb = value;
		this.hex = $.rgb2hex(this.rgb);
	}

	this.r = this.rgb[0];
	this.g = this.rgb[1];
	this.b = this.rgb[2];

	/* Getting the Max and Min values for Chroma. */
	var max = Math.max.apply(Math, this.rgb);
	var min = Math.min.apply(Math, this.rgb);

	/* Variables for HSV value of hex color. */
	var chr = max - min;
	var hue = 0;
	var val = max;
	var sat = 0;

	if (val > 0) {
		/* Calculate Saturation only if Value isn't 0. */
		sat = chr / val;
		if (sat > 0) {
			if (this.r == max) {
				hue = 60 * (((this.g - min) - (this.b - min)) / chr);
				if (hue < 0) {
					hue += 360;
				}
			} else if (this.g == max) {
				hue = 120 + 60 * (((this.b - min) - (this.r - min)) / chr);
			} else if (this.b == max) {
				hue = 240 + 60 * (((this.r - min) - (this.g - min)) / chr);
			}
		}
	}

	this.chroma = chr;
	this.hue = hue;
	this.sat = sat;
	this.val = val;
	this.luma = 0.3 * this.r + 0.59 * this.g + 0.11 * this.b;
};
var css2obj = function (input) {
	var result = {},
		attributes = input ? input.split(';') : [];
	for (var i = 0; i < attributes.length; i++) {
		var entry = attributes[i].split(':');
		result[entry.splice(0, 1)[0]] = entry.join(':');
	}
	return result;
};

$.imgCover = function ($cover, options, imgColor) {
	var data = {};
	data.width = window.innerWidth;
	data.height = window.innerHeight;
	if (imgColor) {
		var colors = $.imgColor(imgColor);
		if (colors.x && colors.x.length) data.x_colors = colors.x;
		if (colors.y && colors.y.length) data.y_colors = colors.y;
	}
	data.cell_size = (sourceui.instances.device.ismobile) ? 60 : 90;
	data = $.extend(data, options);
	var pattern = Trianglify(data);
	var ccvs = pattern.png();
	var $img = $('<div/>').css({
		'background-image': 'url(' + ccvs + ')',
		'min-height': data.height,
		'opacity': 0
	});
	$cover.html($img);
	$img.velocity({ opacity: [0.7, 0] }, 1000);
};
$.imgColor = function (img, algo, factor) {
	var canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	canvas.getContext('2d').drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
	factor = factor || 10;
	var ix = 0, iy = 0, x = 0, y = 0, dv = 0,
		fx = canvas.width / factor,
		fy = canvas.height / factor,
		mx = canvas.width / 2,
		my = canvas.height / 2,
		data, colors = { x: [], y: [] }, _colors = [], _keys = {}, _key, _obj, ik, co;

	for (ix = 1; ix < factor; ix++) {
		dv = (ix % 2 === 0) ? my * 0.5 : my * 1.5;
		data = canvas.getContext('2d').getImageData(ix * fx, dv, 1, 1).data;
		key = data[0] + '-' + data[1] + '-' + data[2];
		if (!_keys[key]) {
			_colors.push(new Color([data[0], data[1], data[2]]));
			_keys[key] = true;
		}

	}
	_colors.sort(function (a, b) {
		//return (a.sat + b.sat) + (a.hue - b.hue);
		return a.val - b.val;
	});
	colors.x.push('#333333');
	for (ik = 0; ik < _colors.length; ik++) {
		co = _colors[ik];
		colors.x.push(co.hex);
	}
	colors.x.push('#FFFFFF');

	/*
	colors.x.push('#333333');
	for(ix=1; ix<factor; ix++){
		data = canvas.getContext('2d').getImageData(ix*fx, my, 1, 1).data;
		colors.x.push($.rgb2hex(data));
	}
	colors.x.push('#FFFFFF');
	console.log(colors.x.sort());
	colors.y = colors.x;
	*/
	/*
	for(ix=1; ix<factor; ix++){
		data = canvas.getContext('2d').getImageData(ix*fx, my*Math.rand(0.8,1.2), 1, 1).data;
		colors.x.push($.rgb2hex(data));
		console.log(ix*fx, my, $.rgb2hex(data));
	}
	for(iy=1; iy<factor; iy++){
		data = canvas.getContext('2d').getImageData(mx*Math.rand(0.8,1.2), iy*fy, 1, 1).data;
		colors.y.push($.rgb2hex(data));
	}
	*/

	/*
	if (algo == 'horizontal'){
		colors.x.push('#333333');
		for(ix=1; ix<factor; ix++){
			data = canvas.getContext('2d').getImageData(ix*fx, my, 1, 1).data;
			colors.x.push($.rgb2hex(data));
			console.log(ix*fx, my, $.rgb2hex(data));
		}
		colors.x.push('#FFFFFF');
	} else if (algo == 'cross'){
		colors.x.push('#333333');
		colors.y.push('#FFFFFF');
	} else if (algo == 'randcross'){
		colors.x.push('#333333');
		for(ix=1; ix<factor; ix++){
			data = canvas.getContext('2d').getImageData(ix*fx, my, 1, 1).data;
			colors.x.push($.rgb2hex(data));
			console.log(ix*fx, my, $.rgb2hex(data));
		}
		colors.x.push('#FFFFFF');
		colors.y.push('#333333');
		for(iy=1; iy<factor; iy++){
			data = canvas.getContext('2d').getImageData(mx, iy*fy, 1, 1).data;
			colors.y.push($.rgb2hex(data));
		}
		colors.y.push('#FFFFFF');
	} else if (algo == 'diagonal'){
		colors.x.push('#333333');
		for(ix=1; ix<factor; ix++){
			data = canvas.getContext('2d').getImageData(ix*fx, ix*fy, 1, 1).data;
			colors.x.push($.rgb2hex(data));
		}
		colors.x.push('#FFFFFF');
	}
	*/
	return colors;
};

$.imgResize = function (options) {
	var o = $.extend(true, {
		quality: 1.0,
		mime: 'image/jpeg',
	}, options);
	if (o.image instanceof File) {
		var reader = new FileReader();
		reader.onload = function (event) {
			o.image = event.target.result;
			$.imgResize(o);
		};
		reader.readAsDataURL(o.image);
		return false;
	}
	else if (o.image instanceof FileReader) o.src = o.image.result;
	else if (o.image instanceof jQuery) o.src = o.image.attr('src');
	else if (typeof o.image == 'string') o.src = o.image;
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext("2d");
	var img = new Image();
	img.onload = function () {
		var mw = o.width || o.size || o.height || 128;
		var mh = o.height || o.size || o.width || 128;
		var w = img.naturalWidth;
		var h = img.naturalHeight;
		if (w > h) {
			if (w > mw) { h *= mw / w; w = mw; }
		} else {
			if (h > mh) { w *= mh / h; h = mh; }
		}
		canvas.width = w;
		canvas.height = h;
		ctx.drawImage(img, 0, 0, w, h);
		if (o.complete) o.complete.apply(null, [canvas.toDataURL(o.mime, o.quality)]);
		//delete canvas;
		//delete img;
	};
	img.src = o.src;
};

$.cloneCanvas = function (oldCanvas) {
	var newCanvas = document.createElement('canvas');
	var context = newCanvas.getContext('2d');
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;
	context.drawImage(oldCanvas, 0, 0);
	return newCanvas;
};

$.nonull = function (obj){
	var propNames = Object.getOwnPropertyNames(obj);
	for (var i = 0; i < propNames.length; i++) {
		var propName = propNames[i];
		if (obj[propName] === null || obj[propName] === '' || obj[propName] === undefined) {
			delete obj[propName];
		} else if (typeof obj[propName] == 'object'){
			obj[propName] = $.nonull(obj[propName]);
		}
	}
	return obj;
}


Math.randlist = {};
Math.rand = function (a, b) {
	if (typeof a !== 'undefined' && typeof b !== 'undefined') return Math.floor(Math.random() * b) + a;
	var rd = Math.floor(Math.random() * (99999999 - 11111111 + 1)) + 11111111;
	if (Math.randlist[rd]) return Math.rand();
	Math.randlist[rd] = true;
	return rd;
};
Math.unique = function (a) {
	a = a || 8;
	var rd = Math.rand();
	var uid = $.md5('uid(' + a + '):' + rd);
	var ab = Math.rand(0, uid.length - a);
	uid = uid.substring(ab, ab + a);
	if (Math.randlist[uid]) return Math.unique();
	Math.randlist[uid] = true;
	return uid;
};



String.prototype.allReplace = function (obj) {
	var retStr = this;
	for (var x in obj) {
		retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
	}
	return retStr;
};

String.prototype.textOverflow = function (max) {
	var str = this.valueOf();
	return (str.length > (max || 18)) ? str.substring(0, max) + '&hellip;' : str;
};


String.prototype.isJSON = function () {
	var str = this;
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};
String.prototype.has = function (needle) {
	return this.indexOf(needle) > -1;
};
String.prototype.difference = function (b) {
	var a = this.valueOf();
	var i = 0;
	var j = 0;
	var result = "";

	while (j < b.length) {
		if (a[i] != b[j] || i == a.length)
			result += b[j];
		else
			i++;
		j++;
	}
	return result;
};

Object.key = function (o, v) {
	var keys = Object.keys(o);
	var vals = Object.values(o);
	return keys[vals.indexOf(v)];
};
