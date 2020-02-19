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

sourceui.templates.fields = new sourceui.Template({
	fieldgroup: {
		simple:
			'<div class="sui-fieldgroup @{class}" id="@{id}" data-required="@{required}"@{data}@{async}>' +
			'@{child:label}' +
			'<div class="fields">' +
			'@{child:fields}' +
			'</div>' +
			'</div>',
	},
	field: {
		simple:
			'<div class="sui-field @{class}" id="@{id}"@{data}@{async}>' +
			'@{child:vars}' +
			'@{child:label}' +
			'@{child:wrap}' +
			'@{child:code}' +
			'</div>',
		code:
			'<pre class="sui-field @{class}" id="@{id}"@{data}@{async}>' +
			'@{child:vars}' +
			'@{child:label}' +
			'@{child:wrap}' +
			'@{child:code}' +
			'</pre>',
	},
	vars:
		'<var type="@{type}" name="@{name}">@{value}</var>',
	code:
		'<code@{attr}>@{value}</code>',
	label:
		//'<label class="label">@{label}@{reqflag}<small class="notify"></small></label>',
		'<label class="label">@{label}@{reqflag}<br /><small class="notify"></small></label>',
	help:
		'<mark class="help">?</mark>',
	wrap: {
		simple:
			'<div class="wrap" style="@{style:background}@{style:color}@{style:bold}@{style:size}@{style:width}@{style:max-width}@{style:height}">' +
			'@{child:table}' +
			'@{child:box}' +
			'@{child:addon}' +
			'<mark class="badge">@{qtselected}</mark>' +
			'<mark class="help">@{texthelp}</mark>' +
			'</div>',
	},
	js:
		'<script>@{script}</script>',
	table: {
		simple:
			'<div class="table">' +
			'@{child:buttonbefore}' +
			'@{child:lang}' +
			'@{child:prefix}' +
			'@{child:cell}' +
			'@{child:sufix}' +
			'@{child:buttonafter}' +
			'</div>',
		daterange:
			'<div class="table">' +
			'<div class="cell value" data-placeholder="@{placeholder}" style="@{style:width}@{style:max-width}@{style:height}@{style:background}">' +
			'<input class="input date ini" name="from" type="text" lang="pt-br" placeholder="99/99/9999" value="@{value:from}" />' +
			'</div>' +
			'<div class="cell prefix">até</div>' +
			'<div class="cell value" data-placeholder="@{placeholder}" style="@{style:width}@{style:max-width}@{style:height}@{style:background}">' +
			'<input class="input date end" name="to" type="text" lang="pt-br" placeholder="99/99/9999" value="@{value:to}" />' +
			'</div>' +
			'@{child:buttonafter}' +
			'</div>',
		rows:
			'<div class="table @{class}">' +
			'@{child:rows}' +
			'</div>',
		filetools:
			'<div class="table tools">' +
			'<div class="cell button browse needsclick @{icon}"><span>@{label}</span></div>' +
			'</div>',
		matrix:
			'<table class="table" border="0" cellspacing="0" cellpadding="0">' +
			'<tr class="header">' +
			'<th class="intersect" scope="col"></th>' +
			'<th scope="col" data-name="tot">Total</th>' +
			'<th scope="col" data-name="ace">Acessar</th>' +
			'<th scope="col" data-name="ver">Ver</th>' +
			'<th scope="col" data-name="imp">Imprimir</th>' +
			'<th scope="col" data-name="adc">Adicionar</th>' +
			'<th scope="col" data-name="edt">Editar</th>' +
			'<th scope="col" data-name="rem">Remover</th>' +
			'<th scope="col" data-name="aud">Auditar</th>' +
			'</tr>' +
			'<tr class="row" data-name="asd1">' +
			'<th scope="row">Exemplos de Estrutura 1</th>' +
			'<td class="true icon-any" data-name="tot"></td>' +
			'<td class="null icon-any" data-name="ace"></td>' +
			'<td class="null icon-any" data-name="ver"></td>' +
			'<td class="null icon-any" data-name="imp"></td>' +
			'<td class="null icon-any" data-name="adc"></td>' +
			'<td class="null icon-any" data-name="edt"></td>' +
			'<td class="null icon-any" data-name="rem"></td>' +
			'<td class="null icon-any" data-name="aud"></td>' +
			'</tr>' +
			'<tr class="row" data-name="asd2">' +
			'<th scope="row">Exemplos de Estrutura 2</th>' +
			'<td class="null icon-any" data-name="tot"></td>' +
			'<td class="true icon-any" data-name="ace"></td>' +
			'<td class="true icon-any" data-name="ver"></td>' +
			'<td class="true icon-any" data-name="imp"></td>' +
			'<td class="false icon-any" data-name="adc"></td>' +
			'<td class="false icon-any" data-name="edt"></td>' +
			'<td class="false icon-any" data-name="rem"></td>' +
			'<td class="null icon-any" data-name="aud"></td>' +
			'</tr>' +
			'</table>',
	},
	row: {
		simple:
			'<div class="row @{name}">@{child:cell}</div>',
		file:
			'<div class="file @{extension} @{type} @{local} @{ext}" data-extension="@{extension}" data-id="@{id}" data-type="@{type}" data-bytes="@{bytes}" data-mime="@{mime}" data-file="@{file}" data-size="@{bites}" data-name="@{name}" data-href="@{href}" id="@{id}">' +
			'<video controls preload="auto" width="100%" height="100%" poster="@{cover}">' +
			'<source src="@{href}">' +
			'</video>' +
			'<img src="@{image}" crossorigin="@{crossorigin}" />' +
			'<div class="cover" style="background-image:url(@{cover})">' +
			'<div class="circle">' +
			'<svg class="knob" width="100%" height="100%" viewbox="0 0 100 100">' +
			'<circle class="donut" cx="50" cy="50" r="45" fill="transparent" stroke-width="10" stroke="rgba(255,255,255,0.9)" stroke-dasharray="284.743" stroke-dashoffset="284.743"/>' +
			'<circle class="prepare" cx="50" cy="50" r="45" fill="transparent" stroke-width="10" stroke="rgba(255,255,255,0.9)" stroke-dasharray="70" stroke-dashoffset="244"></circle>' +
			'</svg>' +
			'</div>' +
			'</div>' +
			'<div class="icon"><i class="sui-fs @{ext} g"><b>@{ext}</b></i></div>' +
			'<div class="type">@{extension}<mark></mark></div>' +
			'<div class="button remove icon-garbage"></div>' +
			'<div class="button upload icon-upload3"></div>' +
			'<div class="button crop icon-crop"></div>' +
			'<div class="data">' +
			'<div class="name">@{name}</div>' +
			'<div class="size">@{bytes}</div>' +
			'</div>' +
			'</div>',
		radio:
			'<div class="cell button @{checked} @{selected}">' +
			'<div class="check"></div>' +
			'<p class="desc">@{label}</p>' +
			'<input class="input radio" type="radio" value="@{value}" @{prop}/>' +
			'</div>',
		check:
			'<div class="cell button @{checked} @{selected}">' +
			'<div class="check"></div>' +
			'<div class="desc">@{label}</div>' +
			'<input class="input checkbox" type="checkbox" value="@{value}" @{prop}/>' +
			'</div>',
	},
	cell: {
		button: {
			simple:
				'<div class="cell button @{icon} @{type}" data-alias="@{alias}">@{value}@{label}@{child:droplist}</div>',
			complexdrop:
				'<div class="cell button complex list @{icon}" data-alias="droplist"><div class="icon-chevron-down"></div>@{label}@{child:droplist}</div>',
			complextime:
				'<div class="cell button complex time @{icon}" data-alias="droplist"><div class="icon-clock"></div></div>',
			complexcolor:
				'<div class="cell button complex picker @{icon}" data-alias="droplist"><div class="alpha"><div class="color" style="background:@{color};"></div></div></div>',
		},
		simple:
			'<div class="cell">@{child:content}</div>',
		lang:
			'<div class="cell lang"><small>@{label}</small></div>',
		prefix:
			'<div class="cell prefix @{icon}" style="@{style:bold}@{style:size}@{style:case}">@{label}</div>',
		sufix:
			'<div class="cell sufix @{icon}"" style="@{style:bold}@{style:size}@{style:case}">@{label}</div>',
		value:
			'<div class="cell value @{icon}" style="@{style:width}@{style:max-width}@{style:height}@{style:background}@{style:color}">' +
			'@{child:input}' +
			'</div>',
		options:
			'<div class="cell value @{icon}" style="@{style:width}@{style:max-width}@{style:height}@{style:background}@{style:color}">' +
			'<div class="placeholder">@{placeholder}</div>' +
			'<div class="area @{inscroll}">' +
			'<div class="options">' +
			'@{child:input}' +
			'</div>' +
			'</div>' +
			'</div>',
		search:
			'<div class="cell search" style="@{style:width}@{style:max-width}@{style:height}@{style:background}@{style:color}">' +
			'<input class="search" type="search" placeholder="@{placeholder}" />' +
			'</div>',
		multisearch:
			'<div class="cell value @{icon}" style="@{style:width}@{style:max-width}@{style:height}@{style:background}@{style:color}">' +
			'<div class="area @{inscroll}">' +
			'<div class="options">' +
			'@{child:input}' +
			'<input class="search" type="search" placeholder="@{placeholder}" />' +
			'</div>' +
			'</div>' +
			'</div>',
		'switch':
			'<div class="cell track" style="@{selected:background}"></div>' +
			'<div class="cell value">' +
			'<input class="input" type="hidden" value="@{value}" />' +
			'</div>' +
			'<div class="cell yes" data-value="@{yes:value}" style="@{yes:background}@{yes:color}"><span>@{yes:label}</span></div>' +
			'<div class="cell not" data-value="@{not:value}" style="@{not:background}@{not:color}"><span>@{not:label}</span></div>' +
			'<div class="closure">' +
			'<div class="cell button" style="@{selected:bordercolor}"></div>' +
			'</div>',
		slider:
			'<div class="cell value @{class}" data-prefix="@{prefix}" data-sufix="@{sufix}">' +
			'<div class="flex">' +
			'<span class="prefix">@{prefix}</span>' +
			'<div class="nouislider">@{config}</div>' +
			'<span class="sufix">@{sufix}</span>' +
			'</div>' +
			'</div>',
		files:
			'<div class="cell files">' +
			'<div class="instruction @{instructionicon}" style="@{instructionimage}"></div>' +
			'@{child:files}' +
			'</div>',
		map:
			'<div class="cell value" style="@{style:width}@{style:max-width}@{style:height}@{style:background}@{style:color}">' +
			'<div class="map"@{data}></div>' +
			'</div>',


	},
	input: {
		html:
			'<div class="input" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" @{prop}>@{value}</div>',
		hidden:
			'<input class="input hidden @{size}" type="hidden" lang="@{lang}" value="@{value}"@{prop}/>',
		text:
			'<input class="input text @{size}" type="text" lang="@{lang}" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}" pattern="@{pattern}" spellcheck="@{spellcheck}" autocomplete="@{autocomplete}" autocorrect="@{autocorrect}" autocapitalize="@{autocapitalize}"@{prop}/>',
		search:
			'<input class="input search @{size}" type="search" lang="@{lang}" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}"@{prop}/>',
		url:
			'<input class="input url @{size}" type="url" lang="@{lang}" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}" spellcheck="@{spellcheck}" autocomplete="@{autocomplete}" autocorrect="@{autocorrect}" autocapitalize="@{autocapitalize}"@{prop}/>',
		email:
			'<input class="input email @{size}" type="email" lang="@{lang}" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}" spellcheck="@{spellcheck}" autocomplete="@{autocomplete}" autocorrect="@{autocorrect}" autocapitalize="@{autocapitalize}"@{prop}/>',
		tel:
			'<input class="input tel @{size}" type="tel" lang="@{lang}" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}"@{prop}/>',
		textarea:
			'<textarea class="input text @{size}" lang="@{lang}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}" spellcheck="@{spellcheck}" autocorrect="@{autocorrect}" autocomplete="@{autocomplete}" autocapitalize="@{autocapitalize}"@{prop}>@{value}</textarea>',
		password:
			'<input class="input password @{size}" type="text" lang="@{lang}" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}" spellcheck="@{spellcheck}" autocomplete="@{autocomplete}" autocorrect="@{autocorrect}" autocapitalize="@{autocapitalize}"@{prop}/>',
		number:
			'<input class="input number @{size}" type="number" lang="@{lang}" lang="pt-br" value="@{value}" style="@{style:color}@{style:bold}@{style:align}@{style:case}@{style:size}@{style:background}@{style:letter-spacing}" placeholder="@{placeholder}" pattern="@{pattern}"@{prop}/>',
		option:
			'<div class="option @{icon}"><input class="input hidden" type="hidden" value="@{value}"@{prop}/>@{label}<span class="remove icon-cancel-circle"></span></div>',
		picker:
			'<div class="option @{type}" data-seed="@{seed}" data-key="@{value}"><input class="input hidden" type="hidden" value="@{value}"@{prop}/>@{label}<span class="remove icon-cancel-circle"></span></div>',
		fulldate:
			'<div class="option"><input class="input hidden" type="hidden" value="@{value}"@{prop}/>@{label}<span class="remove icon-cancel-circle"></span></div>',
		file:
			'<input class="input file" type="file"@{accept}@{multiple}@{prop}/>',
	},
	box: {
		simple:
			'<div class="box" style="@{style:width}@{style:max-width}@{style:height}@{style:background}">@{child:cell}</div>',
	},
	addon: {
		simple:
			'<div class="addons">' +
			'<div class="droplistlayer"></div>' +
			'@{child:droplist}' +
			'</div>',
	},
	droplist: {
		list: {
			simple:
				'<div class="sui-droplist @{listpos}">' +
				'<div class="close"></div>' +
				'<div class="tail">@{label}</div>' +
				'@{child:toolstop}' +
				'<div class="options default scroll-custom">' +
				'<ul>@{child:options}</ul>' +
				'</div>' +
				'@{child:toolsbottom}' +
				'</div>',
			plugin:
				'<div class="sui-droplist plugin @{listpos}">' +
				'<div class="close"></div>' +
				'<div class="tail">@{label}</div>' +
				'@{child:toolstop}' +
				'<div class="options">' +
				'@{child:options}' +
				'</div>' +
				'@{child:toolsbottom}' +
				'</div>',
		},
		option: {
			empty:
				'<div class="empty">@{label}</div>',
			simple:
				'<li class="@{selected} @{icon}" data-icon="@{icon}" data-value="@{value}"@{seed}>@{label}</li>',
			calendar:
				'<div class="calendar"></div>',
			datetime:
				'<div class="table"><div class="calendar"></div><div class="clock"></div></div>',
			time:
				'<div class="table"><div class="clock"></div></div>',
			spectrum:
				'<div class="spectrum"></div>',
			palette:
				'<div class="palette"></div>',
		},
		tools: {
			top: {
				search:
					'<ul class="tools top">' +
					'<li class="search icon-lens">' +
					'<input class="search" type="search" placeholder="@{placeholder}" />' +
					'</li>' +
					'<li class="button reload icon-restart"></li>' +
					'</ul>'
			},
			bottom: {
				default:
					'<ul class="tools bottom">' +
					'<li class="apply icon-checkmark"></li>' +
					'<li class="close icon-close"></li>' +
					'</ul>'
			}
		}
	}
});
sourceui.parserField = function (element, setup) {

	var Field = this;
	var Device = sourceui.instances.device;
	var Template = sourceui.templates.fields;
	var JSONX = JSON5 || JSON;

	Field.setup = setup || {};


	this.fetch = {
		list: function (fd, field) {
			fd.list = {};
			if (fd.type == 'drop') {
				fd.selectval = fd.value !== '' && fd.value !== null ? (fd.value + '').split(",") : [];
			}
			field.findChild('list', function () {
				var suiList = this;
				fd.list = suiList.getAttr();
				fd.list.options = [];
				fd.list.selected = [];
				suiList.findChild('option', function () {
					var suiOption = this;
					var option = suiOption.getAttr();
					option.label = option.label || suiOption.content();
					option.value = option.hasOwnProperty('value') ? option.value : suiOption.content() || '';
					if (option.selected || (fd.selectval && fd.selectval.indexOf(option.value) > -1)) fd.list.selected.push(option);
					fd.list.options.push(option);
				});
			});
		},
		file: function (fd, field) {
			field.findChild('file', function () {
				fd.filelist = fd.filelist || [];
				var suiFile = this;
				var file = suiFile.getAttr();
				file.value = file.value || suiFile.content();
				file.cover = (file.type == 'image') ? file.cover || file.value || '' : '';
				file.image = (file.type == 'image') ? file.value || file.cover || '' : '';
				fd.filelist.push(file);
			});
		},
	};

	var XML = {
		fetchField: function (field) {
			var fd = field.getAttr();
			var parseJSON = function () {
				fd.json = fd.json || {};
				var strJSON;
				var suiJson = this;
				var json = suiJson.getAttr();
				var nm = json.name;
				if (json.name) {
					fd.json[nm] = fd.json[nm] || {};
					delete json.name;
				}
				if (json.link) {
					json = $.extend({}, json, json.link);
					delete json.link;
				}
				suiJson.findChild('filter',function () {
					var ca = this.attr();
					json['filter'] = json['filter'] || {};
					json['filter'][ca.name] = ca.value;
					this.parentNode.removeChild(this);
				});
				suiJson.findChild('data',function () {
					var ca = this.attr();
					json['data'] = json['data'] || {};
					json['data'][ca.name] = ca.value;
					this.parentNode.removeChild(this);
				});
				suiJson.findChild(function () {
					strJSON = JSONX.stringify($.extend(true, JSONX.parse(this.content() || '{}'), json)) || '';
						if (nm) fd.json[nm][this.tagName.toLowerCase()] = strJSON;
						else fd.json[this.tagName.toLowerCase()] = strJSON;
				}, function () {
					strJSON = JSONX.stringify($.extend(true, JSONX.parse(suiJson.content() || '{}'), json)) || '';
					if (nm) fd.json[nm] = strJSON;
					else fd.json = strJSON;
				});
				suiJson.parentNode.removeChild(suiJson);
			};
			var parseValue = function () {
				var suiValue = this;
				var svalue = suiValue.getAttr();
				suiValue.findChild(function () {
					var subval = this;
					svalue[subval.nodeName] = subval.content();
				}, function () {
					svalue.value = svalue.value || suiValue.content();
				});
				if (fd.valuesas == 'array') fd.valuelist.push(svalue);
				else if (svalue.name) fd.valuelist[svalue.name] = svalue;
				else fd.value = svalue.value;
				if (svalue.selected) fd.value = (svalue.value === null || svalue.value === 'null') ? '' : svalue.value;
				suiValue.parentNode.removeChild(suiValue);
			};
			fd.valuelist = (fd.valuesas == 'array') ? [] : {};

			fd.events = $.suiEvent(field);

			field.findChild('json', parseJSON);
			field.findChild('setup', parseJSON);
			field.findChild('value', parseValue);

			fd.value = fd.value || field.textcdata();

			Field.fetch.list(fd, field);
			Field.fetch.file(fd, field);

			fd.buttons = { before: [], after: [] };
			field.findChild('button', function () {
				var suiButton = this;
				var button = suiButton.getAttr();
				button.options = [];
				suiButton.findChild('option', function () {
					var suiOption = this;
					var option = suiOption.getAttr();
					option.label = option.label || suiOption.content();
					option.value = option.hasOwnProperty('value') ? option.value : suiOption.content() || '';
					if (option.selected) {
						button.value = option.value;
						button.label = option.label;
					}
					button.icon = 'icon-chevron-down';
					button.options.push(option);
				});
				button.place = button.place || 'after';
				button.icon = button.icon && button.icon.indexOf('icon-') > -1 ? button.icon : button.icon ? 'icon-' + button.icon : null;
				button.label = button.label ? '<span>' + button.label + '</span>' : '';
				if (fd.buttons[button.place]) fd.buttons[button.place].push(button);
			});
			fd.id = fd.id || 'u' + Math.unique();
			fd.name = fd.name || 'Field[' + fd.id + ']';
			fd.type = fd.type || 'custom';
			fd.mode = fd.mode || 'simple';
			fd.prop = fd.prop || { disable: fd.disable || false, readonly: fd.readonly || false, ignored: fd.ignored || false, };
			fd.class = fd.class || {};
			fd.content = field.content() || '';

			if (fd.prop.disabled) fd.prop.disable = fd.prop.disabled;
			if (typeof fd.icon == 'string') fd.icon = fd.icon && fd.icon.indexOf('icon-') > -1 ? fd.icon : fd.icon ? 'icon-' + fd.icon : null;
			else if (typeof fd.icon == 'object') $.each(fd.icon, function (k, v) { fd.icon[k] = (k == 'icon' && v.indexOf('icon-') == -1) ? 'icon-' + v : v; });
			fd.reqflag = fd.reqflag && fd.required ? fd.reqflag : (fd.required ? ' *' : '');
			if (fd.lang) {
				if (fd.lang == 'ptbr' || fd.lang == 'pt-br' || fd.lang == 'por') { fd.langbox = 'por'; fd.lang = 'pt-br'; }
				else if (fd.lang == 'eng' || fd.lang == 'ing') { fd.langbox = 'eng'; fd.lang = 'en-en'; }
				else if (fd.lang.indexOf('en') === 0) { fd.langbox = 'eng'; }
				else if (fd.lang == 'esp' || fd.lang.indexOf('es') === 0) { fd.langbox = 'esp'; fd.lang = 'es-es'; }
				else if (fd.lang.indexOf('es') === 0) { fd.langbox = 'esp'; }
				else fd.langbox = fd.lang;
			}
			fd.class = Object.values(fd.class).concat([
				fd.type,
				fd.mode,
				fd.orient,
				fd.prop.disable ? 'disable' : '',
				fd.prop.readonly ? 'readonly' : '',
				fd.prop.ignored ? 'ignored' : '',
				fd.sufix ? 'sufix' : ''
			]).join(' ');
			return fd;
		},
		fetchChipper: function (field) {
			return XML.fetchField(field);
		},
	}
	var HTML = {
		common: {
			fieldgroup: function () {
				var setup = $.extend({}, Field.setup.fieldgroup),
					htmlGroup = Template.get('fieldgroup', 'simple', {
						id: setup.id,
						orient: setup.orient,
						class: setup.class,
						required: setup.required,
						child: {
							label: setup.label ? Template.get('label', {
								label: setup.label,
								reqflag: setup.reqflag,
							}) : ''
						}
					}),
					htmlField = '';
				$.each(setup.fieldlist || [], function (k, v) {
					Field.setup = v;
					Field.setup.class += ' grouped'
					htmlField += Field.methods.getTemplate();
				});
				Field.setup = setup;
				return Template.replace(htmlGroup, { child: { fields: htmlField } });
			},
			field: function (tpl) {
				var setup = Field.setup;
				tpl.field = tpl.field || 'simple';
				tpl.wrap = tpl.wrap || 'simple';
				var vars = '';
				var code = '';
				if (typeof setup.json == 'object') {
					$.each(setup.json, function (k, v) {
						v = (typeof v == 'string') ? v : JSON.stringify(v);
						vars += Template.get('vars', { type: 'json', name: k, value: v });
					});
				} else if (typeof setup.json == 'string') {
					vars += Template.get('vars', { type: 'json', value: setup.json });
				}
				if (!setup.label) setup.class += ' no-label';
				return Template.get('field', tpl.field, {
					id: setup.id,
					class: setup.class + (setup.list && setup.list.selected && setup.list.selected.length > 0 ? ' selected' : ''),
					data: $.extend(setup.data || {}, {
						name: setup.name,
						type: setup.type,
						mode: setup.mode,
						orient: setup.orient,
						required: setup.required,
						autofocus: setup.autofocus,
						validationevent: setup.validationevent,
						min: setup.min,
						max: setup.max,
						minlen: setup.minlen,
						maxlen: setup.maxlen,
						len: setup.len,
						step: setup.step,
						mask: setup.mask,
						maskoptions: setup.maskoptions,
						setval: setup.setval || 'change',
						getval: setup.getval || 'single',
						convertval: setup.convertval,
						link: setup.link
					}),
					async: setup.async,
					child: {
						vars: vars,
						label: setup.label ? Template.get('label', {
							label: setup.label,
							reqflag: setup.reqflag,
						}) : '',
						wrap: Template.get('wrap', tpl.wrap, {
							style: setup.style,
							qtselected: setup.list.selected ? setup.list.selected.length : '',
							texthelp: setup.help,
							child: {
								table: HTML.common.table(tpl),
								box: HTML.common.box(tpl),
								addon: HTML.common.addon(tpl),
							}
						}),
						code: setup.events || '',
						js: setup.js ? Template.get('js', {
							script: setup.js
						}) : ''
					}
				});
			},
			buttons: {
				any: function (k, v) {
					if (v.alias && !v.icon && !v.label) {
						if (v.alias == 'look') v.icon = 'icon-eye2';
						else if (v.alias == 'google') v.icon = 'icon-google';
						else if (v.alias == 'href') v.icon = 'icon-link';
						else if (v.alias == 'mailto') v.icon = 'icon-draft';
						else if (v.alias == 'phone') v.icon = 'icon-phone2';
						else if (v.alias == 'location') v.icon = 'icon-map';
						else if (v.alias == 'image') v.icon = 'icon-photo';
						else if (v.alias == 'attach') v.icon = 'icon-tool';
						else if (v.alias == 'picker') v.icon = 'icon-gallery6';
						else v.icon = 'icon-dots-small';
					}
					return {
						icon: v.icon,
						alias: v.alias,
						label: v.label,
						value: v.value ? Template.get('input', 'hidden', { value: v.value }) : '',
						color: v.color || '',
						type: v.type || (v.options.length ? 'hasdrop' : ''),
						child: {
							droplist: (v.options.length) ? Template.get('droplist', 'list', 'simple', {
								type: 'single',
								child: {
									toolstop: '',
									options: Template.get('droplist', 'option', 'simple', v.options, function (ka, va) {
										return {
											selected: (va.selected ? 'selected' : ''),
											value: va.value,
											label: va.label
										}
									}),
									toolsbottom: Template.get('droplist', 'tools', 'bottom', 'default'),
								}
							}) : '',
						}
					}
				},
				before: function (tpl) {
					var setup = Field.setup;
					return Template.get('cell', 'button', (tpl.button || 'simple'), setup.buttons.before, HTML.common.buttons.any);
				},
				after: function (tpl) {
					var setup = Field.setup;
					return Template.get('cell', 'button', (tpl.button || 'simple'), setup.buttons.after, HTML.common.buttons.any);
				}
			},
			slider: function () {
				var setup = Field.setup;
				var html = '';
				var config = $.extend({
					start: Number(setup.value) || 0,
					step: Number(setup.step) || 1,
					orientation: setup.orient,
					tooltips: setup.tooltips ? true : false,
					unit: setup.unit || null,
					range: {
						min: Number(setup.min || 1),
						max: Number(setup.max || 100)
					}
				}, setup.json);
				if ($.type(setup.valuelist) == 'object' && !$.isEmptyObject(setup.valuelist)) {
					$.each(setup.valuelist, function (k, v) {
						var tmp;
						var cfg = $.extend(config, {
							start: JSONX.parse(v.value) || v.value,
							step: v.step || config.step,
							range: (tmp = JSONX.parse(v.range || null)) ? { min: tmp[0], max: tmp[1] } : config.range,
							unit: v.unit
						});
						html += Template.get('row', 'simple', {
							name: v.name,
							child: {
								cell: Template.get('cell', 'slider', {
									config: JSONX.stringify(cfg),
									prefix: v.prefix || v.label || v.name,
									sufix: v.sufix
								})
							}
						});
					});
				} else if ($.type(setup.valuelist) == 'array' && setup.valuelist.length) {
					$.each(setup.valuelist, function (k, v) {
						var cfg = $.extend(config, {
							start: v,
						});
						html += Template.get('row', 'simple', {
							child: {
								cell: Template.get('cell', 'slider', {
									config: JSONX.stringify(cfg),
								})
							}
						});
					});
				} else if (typeof setup.value != 'undefined') {
					var cfg = $.extend(config, {
						start: setup.value
					});
					html += Template.get('row', 'simple', {
						child: {
							cell: Template.get('cell', 'slider', {
								config: JSONX.stringify(cfg),
							})
						}
					});
				}
				return html;
				/*
				console.log(list);
				return (($.type(list) == 'object' && $.isEmptyObject(list)) || ($.type(list) == 'array' && !list.length)) ? '' : Template.get('row','simple',list,function(k,v){
					console.log(k,v);
					var name = v.name;
						 if (v.name && setup.mode == 'range') v.name = { from : v.name+'[from]', to : v.name+'[to]' }
					else if (!v.name && setup.mode == 'range') v.name = { from : 'from', to : 'to' }
					else if (v.name && setup.mode == 'simple') v.name = { from : v.name }
					else if (!v.name && setup.mode == 'simple') v.name = { from : 'from' }
					if (typeof v.value != 'object'){
						if (v.name && setup.mode == 'range') v.value = { from : 0, to : Number(v.value) || 0 }
						else v.value = { from : Number(v.value) }
					}

					return {
						name : name,
						child : {
							cell : Template.get('cell','simple',{
								child : { content : v.label }
							})+
							Template.get('cell','slider',{
								name : v.name.from,
								value : v.value.from,
								prefix : v.prefix,
								sufix : v.sufix || '%'
							})
						}
					}
				});
				*/
			},
			radio: function () {
				var setup = Field.setup;
				var list = setup.list;
				return (!list.options.length) ? '' : Template.get('row', 'radio', list.options, function (k, v) {
					return {
						selected: (v.selected) ? 'selected' : '',
						prop: (v.selected) ? 'checked' : '',
						label: v.label,
						value: v.value,
					}
				});
			},
			check: function () {
				var setup = Field.setup;
				var list = setup.list;
				return (!list.options.length) ? '' : Template.get('row', 'check', list.options, function (k, v) {
					return {
						selected: (v.selected) ? 'selected' : '',
						prop: (v.selected) ? 'checked' : '',
						label: v.label,
						value: v.value,
					}
				});
			},
			table: function (tpl) {
				var setup = Field.setup;
				if (tpl.table === null) return '';
				tpl.table = tpl.table || 'simple';
				if (tpl.table == 'simple')
					return Template.get('table', 'simple', {
						style: setup.style,
						child: {
							buttonbefore: HTML.common.buttons.before(tpl),
							lang: (setup.langbox) ? Template.get('cell', 'lang', { label: setup.langbox }) : '',
							prefix: (setup.prefix || setup.prefixicon) ? Template.get('cell', 'prefix', { label: setup.prefix, icon: setup.prefixicon, style: setup.style }) : '',
							cell: HTML.common.cell(tpl),
							sufix: (setup.sufix || setup.sufixicon) ? Template.get('cell', 'sufix', { label: setup.sufix, icon: setup.sufixicon, style: setup.style }) : '',
							buttonafter: HTML.common.buttons.after(tpl),
						}
					});
				else if (tpl.table == 'rows')
					return Template.get('table', 'rows', {
						style: setup.style,
						child: {
							rows: HTML.common.row(tpl),
						}
					});
				else if (tpl.table == 'file')
					return Template.get('input', 'file', { accept: setup.accept ? ' accept="' + setup.accept + '"' : '', multiple: setup.mode == 'multiple' ? ' multiple' : '' }) +
						Template.get('table', 'filetools', { icon: setup.icon.icon, label: setup.icon.label }) +
						Template.get('table', 'rows', {
							class: 'queue',
							child: {
								rows: HTML.common.cell(tpl),
							}
						});
				else
					return Template.get('table', tpl.table, {
						value: setup.value,
						style: setup.style,
						child: {
							buttonbefore: HTML.common.buttons.before(tpl),
							prefix: (setup.prefix || setup.prefixicon) ? Template.get('cell', 'prefix', { label: setup.prefix, icon: setup.prefixicon, style: setup.style }) : '',
							sufix: (setup.sufix || setup.sufixicon) ? Template.get('cell', 'sufix', { label: setup.sufix, icon: setup.sufixicon, style: setup.style }) : '',
							buttonafter: HTML.common.buttons.after(tpl),
						}
					});
				return '';
			},
			row: function (tpl) {
				var setup = Field.setup;
				if (tpl.row == 'slider') {
					return HTML.common.slider();
				} else if (tpl.row == 'radio') {
					return HTML.common.radio();
				} else if (tpl.row == 'check') {
					return HTML.common.check();
				}
			},
			cell: function (tpl) {
				var setup = Field.setup;
				if (typeof tpl.cell == 'object') {
					var html = '';
					$.each(tpl.cell, function (i, c) {
						html += HTML.common.cell({ cell: c, input: tpl.input });
					});
					return html;
				}
				tpl.cell = tpl.cell || 'value';
				if (tpl.cell == 'search')
					return Template.get('cell', 'search', {
						icon: setup.icon,
						style: setup.style,
						placeholder: setup.placeholder,
					});
				else if (tpl.cell == 'switch')
					return Template.get('cell', tpl.cell, {
						yes: setup.valuelist.yes,
						not: setup.valuelist.not,
						selected: setup.valuelist.selected,
						style: setup.style,
						value: setup.value,
					});
				else if (tpl.cell == 'files')
					return Template.get('cell', tpl.cell, {
						instructionicon: setup.instructionicon.indexOf('.') > -1 ? '' : setup.instructionicon,
						instructionimage: setup.instructionicon.indexOf('.') > -1 ? 'background-image:url(' + setup.instructionicon + ');' : '',
						cursoricon: setup.cursoricon || '',
						child: {
							files: (!setup.filelist) ? '' : Template.get('row', 'file', setup.filelist, function (k, v) {
								return {
									id: v.id,
									file: v.value,
									mime: v.mime,
									type: v.type,
									ext: v.extension || v.ext,
									extension: v.extension || v.ext,
									local: v.local ? v.local : 'remote',
									cover: v.cover,
									image: v.image,
									href: v.href,
									name: v.name,
									bytes: $.formatBytes(v.size),
									size: v.size,
									crossorigin: v.crossorigin
								}
							})
						},
					});
				else if (tpl.cell == 'map')
					return Template.get('cell', tpl.cell, {
						data: {
							lat: setup.valuelist.lat.value,
							lon: setup.valuelist.lon.value,
						},
						style: setup.style
					});
				else {
					return Template.get('cell', tpl.cell, {
						icon: setup.icon,
						style: setup.style,
						placeholder: setup.placeholder,
						inscroll: setup.inscroll ? ' scroll-custom' : '',
						child: {
							input: HTML.common.input(tpl)
						}
					});
				}
				return '';
			},
			input: function (tpl) {
				var setup = Field.setup;
				var prop = '';
				if (setup.prop.disable === 'disable' || setup.prop.disable === 'true' || setup.prop.disable === true) prop += ' disabled="disabled"';
				if (setup.prop.readonly === 'readonly' || setup.prop.readonly === 'true' || setup.prop.readonly === true) prop += ' readonly="readonly"';
				if (tpl.input == 'option') {
					var html = '';
					var list = setup.list;
					if (list && list.selected && list.selected.length) {
						$.each(list.selected, function (i, s) {
							html += Template.get('input', 'option', {
								value: $.htmlspecialchars(s.value),
								icon: s.icon,
								placeholder: '',
								label: s.label.indexOf('<') > -1 ? s.label : '<span>' + s.label + '</span>',
								prop: prop
							});
						});
					}
					return html;
				} else if (tpl.input == 'fulldate') {
					return ($.isDate(setup.value)) ? Template.get('input', 'fulldate', {
						value: setup.value,
						label: $.toFullDate(setup.value, 'br', 'unpreposited'),
						prop: prop
					}) : '';
				} else if (tpl.input == 'fulldatetime') {
					return ($.isDate(setup.value)) ? Template.get('input', 'fulldate', {
						value: setup.value,
						label: $.toFullDatetimeHTML(setup.value, 'br', 'unpreposited'),
						prop: prop
					}) : '';
				} else if (tpl.input == 'picker') {
					var htmlOptions = '';
					$.each(setup.valuelist || [], function (k, v) {
						var html = { visual: '', info: '' };
						var type = 'default';
						var value = '';
						html.visual += (v.fsimage) ? (v.fsimage.indexOf('<') == -1 ? '<div class="image"><img src="' + v.fsimage + '"/></div>' : '<div class="icon">' + v.fsimage + '</div>') : '';
						html.visual += (v.image) ? '<div class="image"><img src="' + (v.image.replace('url(', '').replace(')', '').replace(/\"/gi, "")) + '"/></div>' : '';
						html.visual += (v.avatar) ? '<div class="image"><img src="' + (v.avatar.replace('url(', '').replace(')', '').replace(/\"/gi, "")) + '"/></div>' : '';
						html.visual += (v.icon) ? '<div class="icon ' + (v.icon.indexOf('icon-') > -1 ? v.icon : 'icon-' + v.icon) + '"></div>' : '';
						html.info += (v.name) ? '<div class="name">' + v.name + '</div>' : '';
						html.info += (v.info) ? '<div class="info">' + v.info + '</div>' : '';
						html.visual = html.visual ? '<div class="visual">' + html.visual + '</div>' : '';
						html.info = html.info ? '<div class="info">' + html.info + '</div>' : '';
						htmlOptions += (html.visual || html.info) ? Template.get('input', 'picker', {
							type: v.type || 'default',
							value: v.key || '',
							seed: v.seed || '',
							label: '<div class="picked">' + html.visual + html.info + '</div>',
							prop: prop
						}) : '';
					});
					return htmlOptions;
				} else if (tpl.input == 'html') {
					return (setup.content && typeof setup.value != 'undefined' && ('' + setup.value).indexOf('<') === -1 ? Template.get('input', 'hidden', {
						value: setup.value,
						placeholder: setup.placeholder,
						pattern: setup.pattern,
						style: setup.style,
						lang: setup.lang,
						spellcheck: setup.spellcheck || 'true',
						autocorrect: setup.autocorrect || 'on',
						autocomplete: setup.autocomplete || 'off',
						autocapitalize: setup.autocapitalize || 'off',
						prop: prop
					}) : '')
						+ Template.get('input', tpl.input, {
							value: setup.content || setup.value,
							placeholder: setup.placeholder,
							pattern: setup.pattern,
							style: setup.style,
							lang: setup.lang,
							spellcheck: setup.spellcheck || 'true',
							autocorrect: setup.autocorrect || 'on',
							autocomplete: setup.autocomplete || 'off',
							autocapitalize: setup.autocapitalize || 'off',
							prop: prop
						});
				}
				if (typeof tpl.input == 'string')
					return Template.get('input', tpl.input, {
						value: $.htmlspecialchars(setup.value),
						placeholder: setup.placeholder,
						pattern: setup.pattern,
						style: setup.style,
						size: setup.size,
						lang: setup.lang,
						spellcheck: setup.spellcheck || 'true',
						autocorrect: setup.autocorrect || 'on',
						autocomplete: setup.autocomplete || 'off',
						autocapitalize: setup.autocapitalize || 'off',
						prop: prop
					});
				return '';
			},
			addon: function (tpl) {
				var setup = Field.setup;
				if (typeof tpl.addon == 'string')
					return Template.get('addon', tpl.addon, {
						child: {
							droplist: HTML.common.droplist(tpl)
						}
					});
				return '';
			},
			droplist: function (tpl) {
				var setup = Field.setup;
				var list = setup.list;
				tpl.droplist = tpl.droplist || 'simple';
				return (!list) ? '' : Template.get('droplist', 'list', tpl.droplist, {
					listpos: setup.listpos || '',
					label: (setup.label || setup.placeholder || setup.name || '') + setup.reqflag,
					child: {
						toolstop: (list.toolstop) ? Template.get('droplist', 'tools', 'top', list.toolstop, { placeholder: setup.placeholder }) : '',
						options: HTML.common.options(tpl),
						toolsbottom: (list.toolsbottom) ? Template.get('droplist', 'tools', 'bottom', list.toolsbottom) : ''
					}
				});
			},
			options: function (tpl) {
				var setup = Field.setup;
				var list = setup.list;
				tpl.options = tpl.options || 'simple';
				if (tpl.options == 'simple')
					return (!list || !list.options || !list.options.length)
						? Template.get('droplist', 'option', 'empty', { label: 'Nenhuma opção disponível' })
						: Template.get('droplist', 'option', 'simple', list.options, function (ka, va) {
							return {
								selected: va.selected ? 'selected' : '',
								icon: va.icon,
								value: va.value,
								seed: ' data-seed="' + va.seed + '"',
								label: /<[a-z][\s\S]*>/i.test(va.label) ? va.label : '<span>' + va.label + '</span>'
							}
						});
				else
					return Template.get('droplist', 'option', tpl.options);
			},
			box: function (tpl) {
				var setup = Field.setup;
				if (typeof tpl.box == 'string')
					return Template.get('box', tpl.box, {
						style: setup.style,
						child: {
							cell: HTML.common.cell(tpl),
						}
					});
				return '';
			}
		},
		input: {
			custom: function () {
				Field.setup.maskoptions = Field.setup.maskoptions ? Field.setup.maskoptions.replace(/\"/gi, "&quot;") : null;
				return HTML.common.field({ input: Field.setup.input || 'text' });
			}
		},
		static: {
			simple: function () {
				return HTML.common.field({ input: 'html' });
			},
		},
		hidden: {
			simple: function () {
				return HTML.common.field({ input: 'hidden' });
			},
		},
		text: {
			simple: function () {
				return HTML.common.field({ input: 'text' });
			},
			search: function () {
				Field.setup.sufixicon = 'icon-lens';
				return HTML.common.field({ input: 'search' });
			},
			url: function () {
				Field.setup.spellcheck = 'false';
				Field.setup.autocorrect = 'off';
				Field.setup.mask = Field.setup.mask || 'url';
				if (Field.setup.button !== false) if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-link', alias: 'href', options: [] }];
				return HTML.common.field({ input: 'url' });
			},
			email: function () {
				Field.setup.spellcheck = 'false';
				Field.setup.autocorrect = 'off';
				Field.setup.mask = Field.setup.mask || 'email';
				if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-draft', alias: 'mailto', options: [] }];
				return HTML.common.field({ input: 'email' });
			},
			textarea: function () {
				Field.setup.value = Field.setup.value || Field.setup.content;
				Field.setup.class += ' noswipe';
				return HTML.common.field({ input: 'textarea' });
			},
			user: function () {
				Field.setup.spellcheck = 'false';
				Field.setup.autocorrect = 'off';
				return HTML.common.field({ input: 'text' });
			},
			password: function () {
				Field.setup.spellcheck = 'false';
				Field.setup.autocorrect = 'off';
				Field.setup.convertval = Field.setup.convertval || 'hash'
				return HTML.common.field({ input: 'password' });
			},
		},
		number: {
			simple: function () {
				return HTML.common.field({ input: 'tel' });
			},
			integer: function () {
				Field.setup.convertval = Field.setup.convertval || 'integer';
				Field.setup.placeholder = Field.setup.placeholder || '&#177;000';
				Field.setup.mask = Field.setup.mask || 'integer';
				return HTML.common.field({ input: 'tel' });
			},
			float: function () {
				Field.setup.convertval = Field.setup.convertval || 'float';
				Field.setup.placeholder = Field.setup.placeholde || '&#177;0,00';
				Field.setup.mask = Field.setup.mask || 'float';
				Field.setup.value = $.toFloat(Field.setup.value);
				return HTML.common.field({ input: 'tel' });
			},
			decimal: function () {
				Field.setup.convertval = Field.setup.convertval || 'decimal';
				Field.setup.placeholder = Field.setup.placeholde || '&#177;0,00';
				Field.setup.mask = Field.setup.mask || 'decimal';
				Field.setup.value = $.toDecimal(Field.setup.value);
				return HTML.common.field({ input: 'tel' });
			},
			money: function () {
				Field.setup.prefix = Field.setup.prefix || 'R$';
				Field.setup.convertval = Field.setup.convertval || 'decimal';
				Field.setup.placeholder = Field.setup.placeholde || '&#177;0,00';
				Field.setup.mask = Field.setup.mask || 'decimal';
				Field.setup.value = $.toDecimal(Field.setup.value);
				return HTML.common.field({ input: 'tel' });
			},
			phone: function () {
				Field.setup.placeholder = Field.setup.placeholder || '0000-0000';
				Field.setup.mask = Field.setup.mask || 'phone';
				if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-phone-pad', alias: 'phone', options: [] }];
				return HTML.common.field({ input: 'tel' });
			},
			dddphone: function () {
				Field.setup.placeholder = Field.setup.placeholder || '(00) 0000-0000';
				Field.setup.mask = Field.setup.mask || 'ddd-phone';
				if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-phone-pad', alias: 'phone', options: [] }];
				return HTML.common.field({ input: 'tel' });
			},
			cell: function () {
				Field.setup.placeholder = Field.setup.placeholder || '00000-0000';
				Field.setup.mask = Field.setup.mask || 'cell';
				if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-phone-pad', alias: 'phone', options: [] }];
				return HTML.common.field({ input: 'tel' });
			},
			dddcell: function () {
				Field.setup.placeholder = Field.setup.placeholder || '(00) 00000-0000';
				Field.setup.mask = Field.setup.mask || 'ddd-cell';
				if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-phone-pad', alias: 'phone', options: [] }];
				return HTML.common.field({ input: 'tel' });
			},
			cpf: function () {
				Field.setup.placeholder = Field.setup.placeholder || '000.000.000-00';
				Field.setup.mask = Field.setup.mask || 'cpf';
				return HTML.common.field({ input: 'tel' });
			},
			cnpj: function () {
				Field.setup.placeholder = Field.setup.placeholder || '00.000.000/0000-00';
				Field.setup.mask = Field.setup.mask || 'cnpj';
				return HTML.common.field({ input: 'tel' });
			},
			cpfcnpj: function () {
				Field.setup.placeholder = Field.setup.placeholder || 'Número com 11 ou 14 digitos';
				Field.setup.mask = Field.setup.mask || 'cpfcnpj';
				return HTML.common.field({ input: 'tel' });
			},
			cep: function () {
				Field.setup.placeholder = Field.setup.placeholder || '00000-000';
				if (Field.setup.button !== false) Field.setup.buttons.after = [{ icon: 'icon-location3', alias: 'location', options: [] }];
				Field.setup.mask = Field.setup.mask || 'cep';
				return HTML.common.field({ input: 'tel' });
			},
			spin: function (data) {
				Field.setup.convertval = Field.setup.convertval || 'integer';
				Field.setup.mask = Field.setup.mask || 'integer';
				Field.setup.buttons.before = [{ icon: ((Field.setup.value == Field.setup.min) ? 'disable ' : '') + 'icon-minus3', alias: 'minus', options: [] }];
				Field.setup.buttons.after = [{ icon: ((Field.setup.value == Field.setup.max) ? 'disable ' : '') + 'icon-plus', alias: 'plus', options: [] }];
				return HTML.common.field({ input: 'text' });
			},
			boleto: function () {
				Field.setup.placeholder = Field.setup.placeholder || 'Código de Barra ou Linha Digitável';
				Field.setup.mask = Field.setup.mask || 'boleto';
				Field.setup.minlen = Field.setup.minlen || 47;
				Field.setup.validationevent = 'field:input';
				return HTML.common.field({ input: 'tel' });
			},
			creditcard: function () {
				Field.setup.placeholder = Field.setup.placeholder || '0000 0000 0000 0000';
				Field.setup.mask = Field.setup.mask || 'creditcard';
				Field.setup.minlen = Field.setup.minlen || 19;
				return HTML.common.field({ input: 'tel' });
			},
		},
		drop: {
			single: function () {
				Field.setup.setval = 'replace';
				Field.setup.list.class = 'single';
				Field.setup.placeholder = Field.setup.placeholder || 'Selecione...';
				Field.setup.buttons.after = [{ icon: 'icon-chevron-d', alias: 'droplist', options: [] }];
				return HTML.common.field({ cell: 'options', input: 'option', addon: 'simple' });
			},
			multiple: function () {
				Field.setup.setval = 'append';
				Field.setup.getval = 'multiple';
				Field.setup.list.class = 'multiple';
				Field.setup.listpos = Field.setup.listpos || 'right';
				Field.setup.inscroll = true;
				Field.setup.placeholder = Field.setup.placeholder || 'Selecione...';
				Field.setup.buttons.after = [{ icon: 'icon-chevron-d', alias: 'droplist', options: [] }];
				return HTML.common.field({ cell: 'options', input: 'option', addon: 'simple' });
			}
		},
		search: {
			single: function () {
				Field.setup.setval = 'replace';
				Field.setup.list.class = 'single';
				Field.setup.list.toolstop = 'search';
				Field.setup.class += ' sufix';
				Field.setup.placeholder = Field.setup.placeholder || 'Pesquise para selecionar...';
				Field.setup.buttons.after = [{ icon: 'icon-chevron-d', alias: 'droplist', options: [] }];
				return HTML.common.field({ cell: ['options', 'search'], input: 'option', addon: 'simple' });
			},
			multiple: function () {
				Field.setup.getval = 'multiple';
				Field.setup.setval = 'append';
				Field.setup.list.class = 'multiple';
				Field.setup.class += ' sufix';
				Field.setup.inscroll = true;
				Field.setup.placeholder = Field.setup.placeholder || 'Pesquise para selecionar...';
				Field.setup.buttons.after = [{ icon: 'icon-chevron-d', alias: 'droplist', options: [] }];
				return HTML.common.field({ cell: 'multisearch', input: 'option', addon: 'simple' });
			},
			suggest: function () {
				Field.setup.list.class = 'single';
				Field.setup.placeholder = Field.setup.placeholder || 'Pesquise...';
				return HTML.common.field({ input: 'text', addon: 'simple' });
			}
		},
		date: {
			simple: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.placeholder = '99/99/9999';
				Field.setup.mask = 'date';
				Field.setup.list.class = 'plugin';
				Field.setup.value = $.toDate(Field.setup.value, 'd/m/Y');
				Field.setup.buttons.after = [{ icon: 'icon-insert-invitation', alias: 'droplist', options: [] }];
				return HTML.common.field({ input: 'tel', addon: 'simple', droplist: 'plugin', options: 'calendar' });
			},
			full: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.list.class = 'plugin';
				Field.setup.value = $.toDate(Field.setup.value, 'Y-m-d');
				Field.setup.class += $.isDate(Field.setup.value) ? ' selected' : '';
				Field.setup.buttons.after = [{ icon: 'icon-insert-invitation', alias: 'droplist', options: [] }];
				return HTML.common.field({ cell: 'options', input: 'fulldate', addon: 'simple', droplist: 'plugin', options: 'calendar' });
			},
			range: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				if ($.isArray(Field.setup.value)) {
					Field.setup.value = { from: $.toDate(Field.setup.value[0], 'd/m/Y'), to: $.toDate(Field.setup.value[1], 'd/m/Y') };
				} else if (Field.setup.value.indexOf(',') > -1) {
					Field.setup.value = { from: $.toDate(Field.setup.value.split(',')[0], 'd/m/Y'), to: $.toDate(Field.setup.value.split(',')[1], 'd/m/Y') };
				} else if ($.isPlainObject(Field.setup.valuelist)) {
					Field.setup.value = Field.setup.valuelist;
				}
				Field.setup.mask = 'date';
				Field.setup.list.class = 'plugin';
				Field.setup.buttons.after = [{ icon: 'icon-insert-invitation', alias: 'droplist', options: [] }];
				return HTML.common.field({ input: 'tel', table: 'daterange', addon: 'simple', droplist: 'plugin', options: 'calendar' });
			},
		},
		datetime: {
			simple: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.placeholder = '99/99/9999 99:99';
				Field.setup.mask = 'datetime-short';
				Field.setup.list.class = 'plugin';
				Field.setup.value = $.toDate(Field.setup.value, 'd/m/Y H:i');
				Field.setup.buttons.after = [{ icon: 'icon-insert-invitation', alias: 'droplist', options: [] }];
				return HTML.common.field({ input: 'tel', addon: 'simple', droplist: 'plugin', options: 'calendar', button: 'complextime' });
			},
			full: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.list.class = 'plugin';
				Field.setup.value = $.toDate(Field.setup.value, 'Y-m-d H:i');
				Field.setup.class += $.isDate(Field.setup.value) ? ' selected' : '';
				Field.setup.buttons.after = [{ icon: 'icon-insert-invitation', alias: 'droplist', options: [] }];
				return HTML.common.field({ cell: 'options', input: 'fulldatetime', addon: 'simple', droplist: 'plugin', options: 'calendar', button: 'complextime' });
			},
		},
		time: {
			simple: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.placeholder = '99:99';
				Field.setup.mask = 'time-short';
				Field.setup.list.class = 'plugin';
				Field.setup.value = $.toDate(Field.setup.value, 'H:i');
				Field.setup.buttons.after = [{ icon: 'icon-clock', alias: 'droplist', options: [] }];
				return HTML.common.field({ input: 'tel', addon: 'simple', droplist: 'plugin', options: 'calendar' });
			},
			full: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.placeholder = '99:99:99';
				Field.setup.mask = 'time';
				Field.setup.list.class = 'plugin';
				Field.setup.value = $.toDate(Field.setup.value, 'H:i:s');
				Field.setup.buttons.after = [{ icon: 'icon-clock', alias: 'droplist', options: [] }];
				return HTML.common.field({ input: 'tel', addon: 'simple', droplist: 'plugin', options: 'calendar' });
			}
		},
		picker: {
			single: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.placeholder = Field.setup.placeholder || 'Clique para escolher';
				Field.setup.class += Field.setup.valuelist && Field.setup.valuelist.length ? ' selected' : '';
				Field.setup.buttons.after = [{ icon: 'icon-picker-gd', alias: 'browse', options: [] }];
				return HTML.common.field({ cell: 'options', input: 'picker' });
			},
		},
		color: {
			spectrum: function () {
				Field.setup.placeholder = 'Selecione uma cor';
				Field.setup.list.class = 'plugin';
				Field.setup.buttons.after = [{ alias: 'droplist', color: Field.setup.value, options: [] }];
				return HTML.common.field({ input: 'text', addon: 'simple', droplist: 'plugin', options: 'spectrum', button: 'complexcolor' });
			},
			palette: function () {
				Field.setup.list.class = 'plugin';
				Field.setup.buttons.after = [{ icon: 'icon-chevron-down', alias: 'droplist', color: Field.setup.value, options: [] }];
				return HTML.common.field({ input: 'text', addon: 'simple', droplist: 'plugin', options: 'palette', button: 'complexcolor' });
			}
		},
		switch: {
			simple: function () {
				Field.setup.setval = 'caller';
				Field.setup.valuelist.yes = $.extend({}, Field.setup.valuelist.yes, Field.setup.valuelist.yes.style || {}) || { style: {} };
				Field.setup.valuelist.not = $.extend({}, Field.setup.valuelist.not, Field.setup.valuelist.not.style || {}) || { style: {} };
				if (Field.setup.valuelist.not.value === Field.setup.value) {
					Field.setup.valuelist.selected = { background: Field.setup.valuelist.not.background || '', bordercolor: (Field.setup.valuelist.not.background) ? Field.setup.valuelist.not.background.replace('background:', 'border-color:') : '' };
					Field.setup.class += ' not';
				} else {
					Field.setup.valuelist.selected = { background: Field.setup.valuelist.yes.background || '', bordercolor: (Field.setup.valuelist.yes.background) ? Field.setup.valuelist.yes.background.replace('background:', 'border-color:') : '' };
				}
				Field.setup.class += ' noswipe';
				return HTML.common.field({ table: null, box: 'simple', cell: 'switch' });
			},
		},
		slider: {
			simple: function () {
				Field.setup.getval = 'caller';
				Field.setup.setval = 'caller';
				Field.setup.class += ' noswipe';
				Field.setup.orient = Field.setup.orient || 'horizontal';
				return HTML.common.field({ table: 'rows', row: 'slider' });
			}
		},
		file: {
			single: function () {
				var json = (typeof Field.setup.json == 'object') ? Field.setup.json : JSONX.parse(Field.setup.json || '{}');
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.icon = (Field.setup.icon) ? Field.setup.icon : { icon: 'icon-attachment3', label: 'Selecionar arquivo' }
				Field.setup.instructionicon = (json.general) ? json.general.emptycover || 'icon-file' : '';
				return HTML.common.field({ table: 'file', cell: 'files' });
			},
		},
		image: {
			single: function () {
				var general = (Field.setup.json && typeof Field.setup.json.general == 'string') ? JSONX.parse(Field.setup.json.general || '{}') : Field.setup.json.general;
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' file';
				Field.setup.accept = Field.setup.accept || 'image/*';
				Field.setup.icon = (Field.setup.icon) ? Field.setup.icon : { icon: 'icon-circle', label: 'Selecionar imagem' }
				Field.setup.instructionicon = (general) ? general.emptycover || 'icon-image3' : '';
				return HTML.common.field({ table: 'file', cell: 'files' });
			},
			avatar: function () {
				var general = (Field.setup.json && typeof Field.setup.json.general == 'string') ? JSONX.parse(Field.setup.json.general || '{}') : Field.setup.json.general;
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' file';
				Field.setup.accept = Field.setup.accept || '.jpg, .jpeg, .png';
				Field.setup.icon = (Field.setup.icon) ? Field.setup.icon : { icon: 'icon-circle' }
				Field.setup.instructionicon = (general) ? general.emptycover || 'icon-image3' : '';
				return HTML.common.field({ table: 'file', cell: 'files' });
			},
		},
		ace: {
			editor: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' noswipe';
				Field.setup.value = Field.setup.value || Field.setup.content;
				return HTML.common.field({ input: 'textarea' });
			},
		},
		code: {
			editor: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' noswipe';
				Field.setup.value = Field.setup.value || Field.setup.content;
				return HTML.common.field({ field: 'code', input: 'textarea' });
			},
		},
		mce: {
			editor: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' noswipe';
				Field.setup.value = Field.setup.value || Field.setup.content;
				return HTML.common.field({ input: 'textarea' });
			},
		},
		froala: {
			editor: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' noswipe';
				Field.setup.value = Field.setup.value || Field.setup.content;
				return HTML.common.field({ input: 'textarea' });
			},
		},
		button: {
			single: function () {
				Field.setup.getval = 'caller';
				Field.setup.setval = 'caller';
				Field.setup.valuesas = 'array';
				Field.setup.orient = Field.setup.orient || 'vertical';
				return HTML.common.field({ table: 'rows', row: 'radio' });
			},
			multiple: function () {
				Field.setup.getval = 'caller';
				Field.setup.setval = 'caller';
				return HTML.common.field({ table: 'rows', row: 'check' });
			},
		},
		box: {
			single: function () {
				Field.setup.getval = 'caller';
				Field.setup.setval = 'caller';
				return HTML.common.field({ table: 'rows', row: 'radio' });
			},
			multiple: function () {
				Field.setup.getval = 'caller';
				Field.setup.setval = 'caller';
				return HTML.common.field({ table: 'rows', row: 'check' });
			},
		},
		matrix: {
			security: function () {
				return HTML.common.field({ table: 'matrix' });
			},
		},
		locale: {
			places: function () {
				Field.setup.list.class = 'single';
				Field.setup.placeholder = Field.setup.placeholder || 'Digite um endereço, um lugar, um ponto de interesse, um CEP...';
				Field.setup.sufixicon = 'icon-locate-pin';
				return HTML.common.field({ input: 'text', addon: 'simple' });
			},
			cep: function () {
				Field.setup.placeholder = Field.setup.placeholder || '00000-000';
				Field.setup.sufixicon = 'icon-locate-pin';
				Field.setup.mask = Field.setup.mask || 'cep';
				return HTML.common.field({ input: 'tel' });
			}
		},
		map: {
			coordinates: function () {
				Field.setup.setval = 'caller';
				Field.setup.getval = 'caller';
				Field.setup.class += ' noswipe';
				return HTML.common.field({ cell: 'map' });
			}
		}
	};

	this.element = element;

	this.methods = {
		fetchJQ: function () { },
		fetchSui: function () {
			var sui = Field.element;
			var attr = sui.attr();
			var setup = {}
			if (sui.nodeName == 'fieldgroup') {
				setup.fieldgroup = sui.getAttr();
				setup.fieldgroup.class = [
					setup.fieldgroup.class,
					setup.fieldgroup.prop,
					setup.fieldgroup.orient
				].join(' ');
				setup.fieldgroup.fieldlist = [];
				sui.findChild('field', function () {
					setup.fieldgroup.fieldlist.push(XML.fetchField(this));
				})
			} else if (sui.nodeName == 'field') {
				setup = XML.fetchField(sui);
			}
			return Field.setup = setup;
		},
		getTemplate: function () {
			if (arguments.length) return Template.get.apply(null, arguments);
			var setup = Field.setup;
			if (setup.fieldgroup) return HTML.common.fieldgroup();
			switch (Field.setup.type) {
				case 'input': return setup.mode && HTML.input[Field.setup.mode] ? HTML.input[Field.setup.mode]() : HTML.input.custom(); break;
				case 'static': return setup.mode && HTML.static[Field.setup.mode] ? HTML.static[Field.setup.mode]() : HTML.static.simple(); break;
				case 'hidden': return setup.mode && HTML.hidden[Field.setup.mode] ? HTML.hidden[Field.setup.mode]() : HTML.hidden.simple(); break;
				case 'text': return setup.mode && HTML.text[Field.setup.mode] ? HTML.text[Field.setup.mode]() : HTML.text.simple(); break;
				case 'number': return setup.mode && HTML.number[Field.setup.mode] ? HTML.number[Field.setup.mode]() : HTML.number.simple(); break;
				case 'drop': return setup.mode && HTML.drop[Field.setup.mode] ? HTML.drop[Field.setup.mode]() : HTML.drop.single(); break;
				case 'search': return setup.mode && HTML.search[Field.setup.mode] ? HTML.search[Field.setup.mode]() : HTML.search.single(); break;
				case 'date': return setup.mode && HTML.date[Field.setup.mode] ? HTML.date[Field.setup.mode]() : HTML.date.simple(); break;
				case 'datetime': return setup.mode && HTML.datetime[Field.setup.mode] ? HTML.datetime[Field.setup.mode]() : HTML.datetime.simple(); break;
				case 'time': return setup.mode && HTML.time[Field.setup.mode] ? HTML.time[Field.setup.mode]() : HTML.time.simple(); break;
				case 'color': return setup.mode && HTML.color[Field.setup.mode] ? HTML.color[Field.setup.mode]() : HTML.color.spectrum(); break;
				case 'switch': return setup.mode && HTML.switch[Field.setup.mode] ? HTML.switch[Field.setup.mode]() : HTML.switch.simple(); break;
				case 'slider': return setup.mode && HTML.slider[Field.setup.mode] ? HTML.slider[Field.setup.mode]() : HTML.slider.simple(); break;
				case 'file': return setup.mode && HTML.file[Field.setup.mode] ? HTML.file[Field.setup.mode]() : HTML.file.single(); break;
				case 'image': return setup.mode && HTML.image[Field.setup.mode] ? HTML.image[Field.setup.mode]() : HTML.image.single(); break;
				case 'picker': return setup.mode && HTML.picker[Field.setup.mode] ? HTML.picker[Field.setup.mode]() : HTML.picker.single(); break;
				case 'ace': return setup.mode && HTML.ace[Field.setup.mode] ? HTML.ace[Field.setup.mode]() : HTML.ace.editor(); break;
				case 'code': return setup.mode && HTML.code[Field.setup.mode] ? HTML.code[Field.setup.mode]() : HTML.code.editor(); break;
				case 'mce': return setup.mode && HTML.mce[Field.setup.mode] ? HTML.mce[Field.setup.mode]() : HTML.mce.editor(); break;
				case 'froala': return setup.mode && HTML.froala[Field.setup.mode] ? HTML.froala[Field.setup.mode]() : HTML.froala.editor(); break;
				case 'button': return setup.mode && HTML.button[Field.setup.mode] ? HTML.button[Field.setup.mode]() : HTML.button.single(); break;
				case 'box': return setup.mode && HTML.box[Field.setup.mode] ? HTML.box[Field.setup.mode]() : HTML.box.single(); break;
				case 'matrix': return setup.mode && HTML.matrix[Field.setup.mode] ? HTML.matrix[Field.setup.mode]() : HTML.matrix.security(); break;
				case 'locale': return setup.mode && HTML.locale[Field.setup.mode] ? HTML.locale[Field.setup.mode]() : HTML.locale.search(); break;
				case 'map': return setup.mode && HTML.map[Field.setup.mode] ? HTML.map[Field.setup.mode]() : HTML.map.coordinates(); break;
			}
		},
		getParts: function (part) {
			if (part == 'options') {
				return HTML.common.options({});
				/*
				switch (Field.setup.type){
					case 'drop': return HTML.common.options({}); break;
					case 'search': return HTML.common.options({}); break;
				}
				*/
			} else if (part == 'file') {
				switch (Field.setup.type) {
					case 'file': return HTML.common.options({}); break;
				}
			}
			return '';
		}
	}
	if (this.element) {
		if (this.element instanceof Element) {
			this.methods.fetchSui();
		}
	}
}
