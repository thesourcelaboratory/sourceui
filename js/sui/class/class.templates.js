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

'use strict';

/*
---------------------------
String.prototype.clearKeys
---------------------------
Remove das strings de template os valores-chave para referência de substituição "@{valor}"
---------------------------
*/
String.prototype.clearKeys = function(){
	return this.replace(new RegExp("@\{(.*?)\}",'g'),'');
};

var _elementFoundAttr = null;
Element.prototype.findAttr = function(attr,str,callback,recursive){
	if (recursive && _elementFoundId) return;
	if (!recursive) _elementFoundId = null;
	if (this.childNodes.length){
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType != 1) continue;
			if (node.attr(attr) == str || node.attr('attr:'+attr) == str){
				callback.call(node);
				_elementFoundId = true;
			} else if (!_elementFoundId) {
				node.findAttr(attr,str,callback,true);
			}
		}
	}
};
Element.prototype.findChildAttr = function(attr,str,callback,failback){
	var found = false;
	if (this.childNodes.length){
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType != 1) continue;
			if (node.attr(attr) == str || node.attr('attr:'+attr) == str){
				callback.call(node);
				found = true;
			}
		}
	}
	if (!found && failback) failback();
};

var _elementFoundId = null;
Element.prototype.findId = function(str,callback,recursive){
	if (recursive && _elementFoundId) return;
	if (!recursive) _elementFoundId = null;
	if (this.childNodes.length){
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType != 1) continue;
			if (node.attr('id') == str || node.attr('attr:id') == str){
				callback.call(node);
				_elementFoundId = true;
				break;
			} else if (!_elementFoundId) {
				node.findId(str,callback,true);
			}
		}
	}
};
Element.prototype.findChildId = function(str,callback,failback){
	var found = false;
	if (this.childNodes.length){
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType != 1) continue;
			if (node.attr('id') == str || node.attr('attr:id') == str){
				callback.call(node);
				found = true;
				break;
			}
		}
	}
	if (!found && failback) failback();
};

if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
if (!Element.prototype.closest){
    Element.prototype.closest = function(s) {
        var el = this;
        var ancestor = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (ancestor.matches(s)) return ancestor;
            ancestor = ancestor.parentElement;
        } while (ancestor !== null);
        return null;
    };
}

/*
---------------------------
Element.prototype.has
---------------------------
Encontra um único elemento em um documento xml, utilizando uma string como chave de pesquisa.
A pesquisa é feita pelo nome do elemento ou id apenas.
	@str - string - required - chave de pesquisa por nome do elemento ou id
---------------------------
*/
Element.prototype.countChild = function(str){
	var qt = 0;
	if (this.childNodes.length){
		var found = false;
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType != 1) continue;
			if (!str || str == node.nodeName) qt++;
		}
	}
	return qt;
}
/*
---------------------------
Element.prototype.has
---------------------------
Encontra um único elemento em um documento xml, utilizando uma string como chave de pesquisa.
A pesquisa é feita pelo nome do elemento ou id apenas.
	@str - string - required - chave de pesquisa por nome do elemento ou id
---------------------------
*/
Element.prototype.has = function(str){
	var node = this.getElementsByTagName(str);
	if (node.length) return true;
	return false;
}
/*
---------------------------
Element.prototype.find
---------------------------
Encontra um único elemento em um documento xml, utilizando uma string como chave de pesquisa.
A pesquisa é feita pelo nome do elemento ou id apenas.
	@str - string - required - chave de pesquisa por nome do elemento ou id
	@callback - função que é executada se o elemento for encontrado.
	@failback - função que é executada quando o elemento não é encontrado.
---------------------------
*/
Element.prototype.find = function(str,callback,failback){
	var node = this.getElementsByTagName(str);
	if (node.length) callback.call(node[0]);
	else if (failback) failback();
}
/*
---------------------------
Element.prototype.findAll
---------------------------
Encontra um ou mais elementos em um documento xml, utilizando uma string como chave de pesquisa.
A pesquisa é feita pelo nome do elemento ou id apenas.
	@str - string - required - chave de pesquisa por nome do elemento ou id
	@callback - função que é executada se o elemento for encontrado.
	@failback - função que é executada quando o elemento não é encontrado.
---------------------------
*/
Element.prototype.findAll = function(str,callback,failback){
	var node = (str.indexOf('#') === 0) ? this.getElementsById(str.substring(1)) : this.getElementsByTagName(str);
	if (node.length){
		for (var i=0; i < node.length; i++){
			callback.call(node[i]);
		}
	} else {
		if (failback) failback();
	}
}
/*
---------------------------
Element.prototype.findAll
---------------------------
Encontra todos os elementos filhoes de um elemento em um documento xml, utilizando uma string como chave de pesquisa.
A pesquisa é feita pelo nome do elemento ou id apenas.
	@str - string - required - chave de pesquisa por nome do elemento ou id
	@callback - função que é executada se o elemento for encontrado.
	@failback - função que é executada quando o elemento não é encontrado.
---------------------------
*/
Element.prototype.findChild = function(str,callback,failback){
	if (typeof str == 'function'){
		failback = callback; callback = str; str = null;
	}
	if (this.childNodes.length){
		var found = false;
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType != 1) continue;
			if (!str || str == node.nodeName) { callback.call(node); found = true; }
		}
		if (!found && failback) failback();
	} else if (failback) failback();
}

/*
---------------------------
Element.prototype.content
---------------------------
Retorna o conteúdo em formato texto de um elemento em um documento xml.
O elemento pode ser um texto HTML, se o elemento contiver nodes cdata.
---------------------------
*/
Element.prototype.content = function(){
	var content = '', contrim = '', ctnt = '';
	if (typeof this.textContent != 'undefined'){
		ctnt = this.textContent;
		contrim = ctnt.trim() || '';
		content = (contrim.length > 0) ? this.textContent : '';
	} else {
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType == 3 || node.nodeType == 4){
				ctnt = node.nodeValue;
				if (ctnt.trim().length > 0) content += node.nodeValue;
			}
		}
		contrim = content.trim();
	}
	if (contrim === '') content = '';
	else if (contrim === 'true' || contrim === true) content = true;
	else if (contrim === 'false' || contrim === false) content = false;
	else if (contrim === 'null' || contrim === null) content = null;
	else if (!isNaN(contrim) && contrim.indexOf('0') !== 0) content = +contrim;
	return content;
}

/*
---------------------------
Element.prototype.cdata
---------------------------
Retorna o conteúdo em formato texto de um elemento em um documento xml que tenha o node CDATA.
---------------------------
*/
Element.prototype.textcdata = function(){
	var content = '', ctnt = '';
	if (this.childNodes.length){
		for (var i=0; i < this.childNodes.length; i++){
			var node = this.childNodes[i];
			if (node.nodeType == 4 || node.nodeType == 3){
				ctnt = node.nodeValue;
				if (ctnt.trim().length > 0) content += node.nodeValue;
			}
		}
	}
	return content;
}
/*
---------------------------
Element.prototype.attr
---------------------------
Retorna todos ou um único atributo de um elemento em um documento xml.
	@attr - string - nome do atributo cujo valor precisa ser retornado
---------------------------
*/
Element.prototype.attr = function(attr,value){
	var attrlist = null;
	if (typeof attr == 'string') {
		if (typeof value === 'undefined' && this.attributes[attr]){
			return $.htmlspecialchars(this.attributes[attr].nodeValue);
		} else if (typeof value !== 'undefined') {
			if (attr.indexOf(':') > -1){
				var ns = attr.split(':');
				this.setAttributeNS('xmlns:'+ns[0],attr,value);
			} else {
				this.setAttribute(attr, value);
			}
		}
	} else if (attr === true){
		attrlist = attrlist || {};
		var c = this.content();
		if (c) attrlist.content = c;
		for(var i=0;i<this.attributes.length;i++){
			var a = this.attributes.item(i);
			attrlist = attrlist || {};
			if (a.prefix == 'link'){
				attrlist['link'] = attrlist['link'] || {};
				attrlist['link'][a.localName] = a.nodeValue;
				attrlist['data'] = attrlist['data'] || {};
				attrlist['data']['link'] = attrlist['data']['link'] || {};
				attrlist['data']['link'][a.localName] = a.nodeValue;
				if (a.localName == 'href'){
					attrlist['attr'] = attrlist['attr']||{};
					attrlist['attr']['title'] = $.htmlspecialchars(a.nodeValue);
				}
			} else if (a.prefix == 'prop'){
				if (a.nodeValue === a.localName || a.nodeValue === 'true' || a.nodeValue === true){
					if (a.localName == 'ignored' || a.localName == 'disable' || a.localName == 'disabled' || a.localName == 'readonly' || a.localName == 'selected' || a.localName == 'active'){
						attrlist['class'] = attrlist['class'] || {};
						attrlist['class']['prop'] = a.localName;
					}
				}
			} else if (a.prefix == 'event'){
				attrlist['data'] = attrlist['data'] || {};
				attrlist['data']['event'] = attrlist['data']['event'] || {};
				attrlist['data']['event'][a.localName] = a.nodeValue;
			} else if (a.prefix == 'type'){
				attrlist['data'] = attrlist['data'] || {};
				attrlist['data']['type'] = attrlist['data']['type'] || {};
				attrlist['data']['type'][a.localName] = a.nodeValue;
			} else if (a.prefix == 'date'){
				attrlist['data'] = attrlist['data'] || {};
				attrlist['data']['date'] = attrlist['data']['date'] || {};
				attrlist['data']['date'][a.localName] = a.nodeValue;
			} else if (a.prefix == 'time'){
				attrlist['data'] = attrlist['data'] || {};
				attrlist['data']['time'] = attrlist['data']['time'] || {};
				attrlist['data']['time'][a.localName] = a.nodeValue;
			} else if (a.prefix == 'action'){
				attrlist['action'] = attrlist['action'] || {};
				if (a.localName == 'exec'){
					attrlist['action']['exec'] = a.nodeValue.indexOf('sui') > -1 ? a.nodeValue : 'sui-'+a.nodeValue;
				} else {
					attrlist[a.prefix][a.localName] = a.nodeValue;
				}
			} else if (a.prefix){
				attrlist[a.prefix] = attrlist[a.prefix] || {};
				attrlist[a.prefix][a.localName] = $.htmlspecialchars(a.nodeValue);
			} else {
				attrlist[a.localName] = $.htmlspecialchars(a.nodeValue);
			}
		}
	} else {
		attrlist = attrlist || {};
		for(var i=0;i<this.attributes.length;i++){
			var a = this.attributes.item(i);
			attrlist[a.nodeName] = $.htmlspecialchars(a.nodeValue);
		}
	}
	return attrlist ;
}
Element.prototype.getAttr = function(ignoreCSS){
	var sui = this;
	var attr = {};
	for(var i=0;i<sui.attributes.length;i++){
		var a = sui.attributes.item(i);
		var v = a.nodeValue.trim();
		if (v === '') v = '';
		else if (v == 'true' || v === true) v = true;
		else if (v === 'false' || v === false) v = false;
		else if (v === 'null' || v === null) v = null;
		else if (!isNaN(v) && v.indexOf('0') !== 0) v = +v;
		if (a.prefix){
			attr[a.prefix] = attr[a.prefix] || {};
			if (!ignoreCSS && (a.prefix == 'style' || a.prefix == 'css')){
					 if (a.localName == 'size'){ attr['style'][a.localName] = 'font-size:'+v+';'; }
				else if (a.localName == 'case'){ attr['style'][a.localName] = 'text-transform:'+v+';'; }
				else if (a.localName == 'bold'){ attr['style'][a.localName] = 'font-weight:'+v+';'; }
				else if (a.localName == 'align'){ attr['style'][a.localName] = 'text-align:'+v+';'; }
				else if (a.localName == 'decoration'){ attr['style'][a.localName] = 'text-decoration:'+v+';'; }
				else if (a.localName == 'bordercolor'){ attr['style'][a.localName] = 'border-color:'+v+';'; }
				else if (a.localName == 'background'){ attr['style'][a.localName] = a.localName+':'+$.colorfy(sui,v); }
				else if (a.localName == 'color'){ attr['style'][a.localName] = a.localName+':'+$.colorfy(sui,v)+';'; }
				else attr['style'][a.localName] = a.localName+':'+v+';';
			} else if (a.prefix == 'prop' && (a.localName == 'ignored' || a.localName == 'disable' || a.localName == 'disabled' || a.localName == 'readonly' || a.localName == 'selected' || a.localName == 'active')){
				if (v === a.localName || v === true){
					attr['class'] = attr['class'] || {};
					attr['class']['prop'] = a.localName;
				}
			} else {
				attr[a.prefix][a.localName] = v;
			}
		} else {
			attr[a.localName] = v;
		}
	}
	return attr;
}
/*
---------------------------
Element.prototype.toHTML
---------------------------
Retorna a string html dos templates com as chaves de substituição já processadas.
	@[a,b,c,..., [obj]] - parâmetros de entrada
		- a,b,c - strings que pesquisam o template que precisa ser retornado
		- obj - objeto que representa os valores que precisam ser substituidos na string html do template
---------------------------
*/
Element.prototype.toHTML = function(){
	var data = this.attr(true),
		args = [],
		callback;
	if (arguments.length){
		for(var i=0;i<arguments.length;i++){
			if (typeof arguments[i] == 'object'){
				data = $.extend( true, {}, data || {}, arguments[i] );
			} else if (typeof arguments[i] == 'function'){
				callback = arguments[i];
			} else {
				args.push(arguments[i]);
			}
		}
		if (data) args.push(data);
		if (callback) return callback.apply(null,args);
	}
	return '';
}



/*
---------------------------
Template
---------------------------
Classe para criação de templates para serem utilizados nos parsers do sourceui.
O contrutor recebe um objeto com a lib (coleção) de templates.
Os templates da lib serão a base para o processamento dos htmls, em fução da substituição das chaves por seus respectivos valores.
---------------------------
*/

sourceui.Template = function(lib){
	var Template = this;
	this.lib = lib;
	/*
	---------------------------
	Template.get()
	---------------------------
	Método auxiliar utilizado para pegar os templates das libs, substituindo os valores da string assinalados como @{chave}
		@data - argument - required - argumento de entrada do método
			@data.type - string - required - primeira chave de pesquisa nas libs
			@data.name - string - not required - segunda chave de pesquisa nas libs
			@data.data - object - not required - objeto tipo chave/valor que será utilizado para substituição das strings assinaladas nos templates
	---------------------------
	*/
	this.get = function(){
		var str,
			lib = Template.lib,
			data = {};
		if (arguments.length){
			for(var i=0; i<arguments.length; i++){
				if (!str && typeof arguments[i] == 'string'){
					if (lib[arguments[i]]){
						if (typeof lib[arguments[i]] == 'string'){
							str = lib[arguments[i]];
						} else if (typeof lib[arguments[i]] == 'object') {
							lib	= lib[arguments[i]];
						}
					} else {
						//throw new Exception("Invalid template argument",arguments[i]);
						//console.error('$template.get','lib '+arguments[i]+' not found');
						return '';
					}
				} else if (str && $.isArray(arguments[i])){
					var s = '', f = arguments[i+1], d;
					$.each(arguments[i]||[],function(k,v){
						if (typeof f == 'function') d = f(k,v); else d = v;
						if (typeof d == 'object') s += Template.replace(str,d);
					});
					return s;
				} else if (str && typeof arguments[i] == 'function'){
					return arguments[i]();
				} else if (str && typeof arguments[i] == 'object'){
					data = arguments[i];
				}
			}
			if (str){
				str = Template.replace(str,data);
			} else {
				 ///// ERROR - template not found /////
			}
		}
		return str;
	}
	/*
	---------------------------
	Template.replace()
	---------------------------
	Método auxiliar utilizado para substituir os valores da string assinalados como @{chave}
		@str - argument - required - string do template que sera analizada
		@data.data - object - not required - objeto tipo chave/valor que será utilizado para substituição das strings assinaladas nos templates
	---------------------------
	*/
	this.replace = function(str,data){
		var groups = {}
		$.each(data||[],function(ka,va){
			if (typeof va != 'object' && typeof va != 'undefined' && va !== null && str.indexOf('@{'+ka+'}')){
				if (ka == 'style' && va && typeof va == 'string') va = ' style="'+va+'"';
				if (va && typeof va == 'string' && va[va.length-1] == '$') va = va.replace(/\$/g,'&dollar;');
				var rp = "@\{"+ka+"\}";
				var regex = new RegExp(rp,'g');
				str = str.replace(regex,va);
				return true;
			}
			$.each(va||[],function(kb,vb){
				vb = (vb && typeof vb == 'string' && vb[vb.length-1] == '$') ? vb.replace(/\$/g,'&dollar;') : vb;
				if (ka == 'image'){
					ka = 'style';
					if (typeof vb != 'object' && typeof vb != 'undefined' && vb !== null){
						kb = 'background-image';
						vb = (vb.indexOf("background-") == -1) ? 'url('+vb+')' : vb;
					}
				}
				if (str.indexOf("@{"+ka+"}") > -1){
					if (typeof vb != 'object' && typeof vb != 'undefined' && vb !== null){
							 if (ka == 'class' && kb == 'icon' && vb.indexOf("icon-") == -1) vb = ' icon-'+vb;
						else if (ka == 'class' && kb == 'subicon' && vb.indexOf("icon-") == -1) vb = ' icon-'+vb;
						else if (ka == 'class' && kb == 'scroll' && vb.indexOf("scroll-") == -1) vb = ' scroll-'+vb;
							 if (ka == 'attr') groups[ka] = (groups[ka] || '')+' '+kb+'="'+(vb+'').replace(/"/g,'&quot;')+'"';
						else if (ka == 'data') groups[ka] = (groups[ka] || '')+' data-'+kb+'="'+vb+'"';
						else if (ka == 'style'){
							if (kb == 'image') groups[ka] = (groups[ka] || '')+'background-image:url('+vb+');';
							else if (kb == 'background'){
								if (vb.indexOf("#") > -1 || vb.indexOf("rgb") > -1 || vb.indexOf("rgba") > -1 || vb.indexOf("var(") > -1) groups[ka] = (groups[ka] || '')+'background:'+vb+';';
								else groups[ka] = (groups[ka] || '')+'background-image:url('+vb+');';
							}
							else if (kb == 'bold'){
								if (vb=='bold'||vb===true||vb==='true') groups[ka] = (groups[ka] || '')+'font-weigth:bold;';
								else if (vb=='normal'||vb===false||vb==='false') groups[ka] = (groups[ka] || '')+'font-weigth:normal;';
								else groups[ka] = (groups[ka] || '')+'font-weigth:'+vb+';';
							}
							else if (kb == 'size') groups[ka] = (groups[ka] || '')+'font-size:'+vb+';';
							else if (kb == 'case') groups[ka] = (groups[ka] || '')+'text-transform:'+vb+';';
							else if (kb == 'align') groups[ka] = (groups[ka] || '')+'text-align:'+vb+';';
							else if (kb == 'decoration') groups[ka] = (groups[ka] || '')+'text-decoration:'+vb+';';
							else if (kb == 'bordercolor') groups[ka] = (groups[ka] || '')+'border-color:'+vb+';';
							else groups[ka] = (groups[ka] || '')+kb+':'+vb+';';
						}
						else if (ka == 'class') groups[ka] = (groups[ka] || '')+((vb)?' '+vb:'');
						else if (ka == 'async') groups[ka] = (groups[ka] || '')+' data-async-'+kb+'="'+vb+'"';
					} else {
						$.each(vb||[],function(kc,vc){
							groups[ka] = groups[ka] || '';
							if (ka == 'data') groups[ka] += ' data-'+kb+'-'+kc+'="'+(vc+'').replace(/"/g,'&quot;')+'"';
						});
					}
				}
				if (typeof vb != 'object' && typeof vb != 'undefined' && vb !== null && str.indexOf("@{"+ka+":") > -1){
						 if (ka == 'class' && kb == 'icon' && vb.indexOf("icon-") == -1) vb = 'icon-'+vb;
					else if (ka == 'class' && kb == 'subicon' && vb.indexOf("icon-") == -1) vb = 'icon-'+vb;
					else if (ka == 'link' && kb == 'icon' && vb.indexOf("icon-") == -1) vb = 'icon-'+vb;
					else if (ka == 'class' && kb == 'scroll' && vb.indexOf("scroll-") == -1) vb = 'scroll-'+vb;
					var rp = "@\{"+ka+"\:"+kb+"\}";
					var regex = new RegExp(rp,'g');
					str = str.replace(regex,vb);
				}
			});
		});
		$.each(groups||[],function(kg,vg){
			if (str.indexOf('@{'+kg+'}')){
				var rp = "@\{"+kg+"\}";
					 if (kg == 'attr') vg = (vg)?' '+vg:'';
				else if (kg == 'data') vg = (vg)?' '+vg:'';
				else if (kg == 'style') vg = (vg)?' style="'+vg+'"':'';
				else if (kg == 'class') vg = (vg)?' class="'+vg+'"':'';
				else if (kg == 'async') vg = (vg)?' '+vg:'';
				var regex = new RegExp(rp,'g');
				str = str.replace(regex,vg);
			}
		});
		str = str.replace(/@\{((?!child:)[\s\S])+?\}/g, '');
		/*
		str = str.replace(/(\s+")|("\s+)/g, '"');
		str = str.replace(/[a-z\-]+="\s*?"/g,' ');
		str = str.replace(/\s+/g,' ');
		*/
		return str;
	}
}
