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

sourceui.templates.interface = new sourceui.Template({
	drag:
		'<div class="sui-draggable sn"></div>',
	code:
		'<code@{attr}>@{value}</code>',
	variable:
		'<var class="sui-variable" name="@{name}"@{data}>@{value}</var>',
	empty:
		'<div class="sn empty @{class:type}">@{child:html}</div>',
	chart:
		'<div class="chart" data-chart-type="@{data:type}">@{data:json}</div>',
	datasheet:
		'<div class="noswipe sheet" data-name="@{data:name}"><code>@{data:json}</code></div>',
	/*
	spinner :
		'<div class="sui-spinner">'+
		'<svg class="container" width="12%" viewBox="0 0 52 52">'+
		'<circle class="path" cx="26px" cy="26px" r="20px" fill="none" stroke-width="5px"/>'+
		'</svg>'+
		'</div>',
	*/
	'spinner':
		'<div class="sui-spinner">' +
		'<svg class="container" width="12%" viewBox="0 0 52 52">' +
		'<circle class="path" cx="26px" cy="26px" r="20px" fill="none" stroke-dasharray="31" stroke-width="6px"/>' +
		'</svg>' +
		'</div>',
	'offline': {
		"pt-br":
			'<div class="sui-offline icon-network-offline">' +
			'<h2>Sem internet</h2>' +
			'<p><b>Esta ação precisa de uma conexão com a internet.</b><br>Pode ser que registros não sejam os mais atuais.</p>' +
			'<a class="button">Ok, entendi</a>' +
			'</div>',
		"en-us":
			'<div class="sui-offline icon-network-offline">' +
			'<h2>No internet</h2>' +
			'<p><b>This action needs an idle internet connection.</b><br>Some information might be out of date.</p>' +
			'<a class="button">Ok, got it</a>' +
			'</div>',
	},
	'no-almanac' : {
		"pt-br":
			'<div class="sui-offline icon-network-offline no-almanac">' +
			'<h2>Sem Almanaque de Dados</h2>' +
			'<p><b>Esta ação precisa de um almanaque de dados para uso no modo offline.</b><br>Quando uma conexão com a internet for possível, navegue até aqui para gerar um almanaque automaticamente.</p>' +
			'<a class="button">Ok, entendi</a>' +
			'</div>',
		"en-us":
			'<div class="sui-offline icon-network-offline no-almanac">' +
			'<h2>No Data Almanac</h2>' +
			'<p><b>This action needs a data almanac to use offline mode.</b><br>When an internet connection is possible, navigate here to automatically generate an almanac.</p>' +
			'<a class="button">Ok, got it</a>' +
			'</div>',
	},
	'status-warning' : {
		"pt-br":
			'<div class="sui-offline icon-network-offline status-warning">' +
			'<h2>Modo Offline</h2>' +
			'<p><b>Essa ferramenta pode ser usada sem uma conxão com a internet.</b><br>Porém, ela precisa ser <b>reiniciada em modo offline</b> para garantir que todas as dependencias estejam disponíveis.</p>' +
			'<a class="button refresh">Ok, reiniciar agora</a>' +
			'<a class="button">Talvez depois</a>' +
			'</div>',
		"en-us":
			'<div class="sui-offline icon-network-offline status-warning">' +
			'<h2>Offline Mode</h2>' +
			'<p><b>This application can be used without an internet connection.</b><br>However, it needs to be <b>restarted in offline mode</b> to ensure that all dependencies are available.</p>' +
			'<a class="button refresh">Ok, restart now</a>' +
			'<a class="button">Maybe later</a>' +
			'</div>',
	},
	imgeditor: {
		container:
			'<div class="window">' +
			'<ul class="assets">' +
			'<li class="title">MyName</li>' +
			'@{child:assets}' +
			'</ul>' +
			'<div class="edition">' +
			'@{child:edition}' +
			'</div>' +
			'@{child:caption}' +
			'</div>',
		asset:
			'<li><a data-type="@{class:type}"@{class}></a></li>',
		edition:
			'<div@{class}>' +
			'<div class="stage"></div>' +
			'<ul class="buttons">' +
			'@{child:buttons}' +
			'</ul>' +
			'</div>',
		caption:
			'<div class="caption" contentEditable="true" data-placeholder="Insira uma descrição para a imagem">@{content}</div>',
		button:
			'<li class="@{class:cell}"><a class="button @{class:type} @{class:icon}">@{label:name}</a></li>'
	},
	floatbox: {
		container:
			'<div class="sui-floatbox @{class:placement}"@{style}@{attr}>' +
			'@{child:items}' +
			'</div>',
		item:
			'<div class="item"@{style}@{attr}>' +
			'<small class="top">@{label:top}@{label:name}</small>' +
			'<span>@{label:value}</span>' +
			'<big>@{label:big}</big>' +
			'<small class="bottom">@{label:bottom}</small>' +
			'</div>'
	},
	toolbar: {
		container:
			'<div class="toolbar @{class:position} @{class:prop}"@{data}@{style}><h3 class="title">@{label:title}</h3>@{child:tools}</div>',
		tool:
			'<div class="tools @{class:position} @{class:prop}"@{data}>@{child:groups}</div>',
		group:
			'<ol@{class}@{data}>@{child:buttons}</ol><u></u>',
		button:
			'<li class="sn @{class:prop} @{class:float} @{data:alias} @{class:subicon}"@{style} data-tip="@{tip:text}"><a class="@{action:exec} @{class:icon} @{class:type} @{class:option}"@{data}@{attr}>@{label:name}@{child:list}@{child:code}</a></li>',
		more:
			'<div class="more icon-more-vert"></div>'

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
		},
		option: {
			empty:
				'<div class="empty sn">@{label}</div>',
			simple:
				'<li class="sn @{selected} @{icon}" data-value="@{value}"@{data}@{style}>@{label}</li>'
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
	},
	auth: {
		container:
			'<div class="container" id="suiAuthContainer">' +
			'<div class="modal">' +
			'@{child:logo}'+
			'@{child:screen}'+
			'@{child:system}'+
			'@{child:forms}' +
			'</div>' +
			'<div class="footer">' +
			'<ul class="left">' +
			'@{child:footleft}' +
			'</ul>' +
			'<ul class="right">' +
			'@{child:footright}' +
			'</ul>' +
			'</div>' +
			'</div>',
		logo:
			'<div class="logo @{class}" style="@{image}">'+
				'<div class="avatar" style="@{avatar}"></div>'+
				'<div class="abbr" style="background-color:@{color}">@{abbr}</div>'+
				'<div class="name" style="@{size}">'+
					'<div class="trend" style="@{trend}">@{trendname}</div>'+
					'<div class="text">@{name}</div>'+
				'</div>'+
			'</div>',
		screen:
			'<div class="screen"@{style}>'+
				'@{child:screen}' +
			'</div>',
		system:
			'<div class="system"@{style}>'+
				'@{child:system}' +
			'</div>',
		form:
			'<form class="form @{class:type} @{class:selected}">' +
			'<ul>' +
			'<li class="title">@{title}</li>' +
			'<li class="desc">@{description}</li>' +
			'<li class="fields">' +
			'@{child:fields}' +
			'@{child:options}' +
			'</li>' +
			'</ul>' +
			'</form>',
		options:
			'<li class="options">' +
			'<ul>' +
			'@{child:options}' +
			'</ul>' +
			'</li>',
		option:
			'<li><a@{class}@{data}@{attr}>@{label}</a></li>'
	},

	panel: {
		main: {
			container:
				'<main class="sui-main" id="suiMain">' +
				'@{child:header}' +
				'@{child:tabs}' +
				'@{child:context}' +
				'</main>',
		},
		header: {
			top:
				'<div class="sui-header-top"></div>',
			logo:
				'<div data-tip="Inicio" class="logo @{class}" style="@{image}">'+
				'<div class="avatar" style="@{avatar}"></div>'+
				'<div class="abbr" style="background-color:@{color}">@{abbr}</div>'+
				'<div class="name" style="@{size}">@{name}</div>'+
				'</div>',
			main:
				'<header class="header" style="color:@{style:color};background-color:@{style:background-color};">' +
				'<div class="table">' +
				'@{child:logo}' +
				'<div>' +
				'<ol class="screen">' +
				'<li class="name">@{label:screen}</li>' +
				'<li class="label">@{label:system}</li>' +
				'<li class="offline">@{label:offline}</li>' +
				'</ol>' +
				'</div>' +
				'<div>' +
				'@{child:tools}' +
				'</div>' +
				'</div>' +
				'</header>',
		},
		tab: {
			container:
				'<div class="sui-tabs">' +
				'@{child:groupsleft}' +
				'<div class="group center">' +
				'<ul class="sector" id="suiTabsSector"></ul>' +
				'</div>' +
				'@{child:groupsright}' +
				'</div>',
			group:
				'<div class="group @{class:place}">' +
				'<ul>' +
				'@{child:items}' +
				'</ul>' +
				'</div>',
			item:
				'<li class="@{class:icon} @{class:prop}"@{data}></li>',
			bar:
				'<div class="sui-header-bar"></div>'
		},
		aside: {
			left:
				'<aside class="sui-aside left" id="suiAsideLeft"@{data}>' +
				'@{child:headerlogo}' +
				'@{child:navtools}' +
				'@{child:navs}' +
				'<div class="sui-draggable"></div>' +
				'</aside>',
			right:
				'<aside class="sui-aside right" id="suiAsideRight"@{data}>' +
				'@{child:navtools}' +
				'@{child:navs}' +
				'</aside>',
			navtools: {
				container:
					'<ul class="navtools">' +
					'@{child:items}' +
					'</ul>',
				item:
					'<li class="@{class:icon} @{class:selected} @{class:notified} @{class:prop} @{data:alias}"@{data}@{attr}>' +
					'<mark>@{label:badge}@{label:texticon}</mark>' +
					'<span@{style}@{async}>@{label:name}</span>' +
					'</li>',
			},
			nav: {
				container:
					'<nav class="sui-nav @{class:scroll} @{class:selected} @{data:alias}" data-label="@{label:name}" data-alias="@{data:alias}" id="@{data:id}">' +
					'<div class="area">' +
					'<ol class="blocklist @{class:qtblock}">' +
					'@{child:blockitems}' +
					'</ol>' +
					'@{child:blocks}' +
					'</div>' +
					'</nav>',
				blockitem:
					'<li@{data} class="@{class:icon} @{class:selected}">' +
					'<strong class="name">@{label:name}</strong>' +
					'<small class="description">@{label:description}</small>' +
					'</li>',
				block:
					'<div class="menu block @{class:selected}"@{data} id="@{data:id}">' +
					'<div class="wrap @{class:scroll}">' +
					'<div class="name">@{label:name}</div>' +
					'@{child:groups}' +
					'</div>' +
					'</div>',
				group:
					'<div class="menu group @{class:collapser} @{class:apparence}"@{data}>' +
					'<div class="name @{class:collapser}">@{label:name}<span class="gen icon right icon-chevron-up"></span></div>' +
					'<ol>' +
					'@{child:items}' +
					'</ol>' +
					'</div>',
				item:
					'<li @{attr}class="sn menu sui-link item @{hasicon} @{hasabbr} @{hassubicon} @{hasavatar} @{hasimage} @{class:icon} @{link:icon} @{class:status} @{class:prop}"@{data}>' +
					'@{child:labels}' +
					'@{child:subitems}' +
					'</li>',
				subitem:
					'<a @{attr}class="sn sui-link subitem"@{data}>' +
					'@{label}' +
					'</a>',
				label:
					'<div class="@{class}" @{style}>@{content}</div>',

			}
		},
		context:
			'<div class="sui-context" id="suiContext" data-axis="x">' +
			'<div class="sui-sectors-container" id="suiSectorsContainer">' +
			'</div>' +
			'</div>',
	},

	notify: {
		container:
			'<section class="sn sui-notify @{debug} @{type} @{level} @{position}" id="@{id}" style="@{color}">' +
			'<div class="table">' +
			'<div class="cell icon @{icon}"></div>' +
			'<div class="cell image"><div style="background-image:url(\'@{image}\'); display:@{showimage}"></div></div>' +
			'<div class="cell text">' +
			'<div class="name">@{name}</div>' +
			'<div class="label">@{label}</div>' +
			'<div class="message">@{message}</div>' +
			'<div class="actions">@{actions}</div>' +
			'</div>' +
			'</div>' +
			'<span class="close icon-close"></span>' +
			'</section>',
		action:
			'<li>' +
			'<span>@{action}</span>' +
			'</li>'
	},
	confirm: {
		container:
			'<section class="sn sui-confirm @{type}" id="@{id}">' +
			'<div class="content">' +
			'<div class="text">' +
			'<div class="title">@{title}</div>' +
			'<div class="desc">@{desc}</div>' +
			'<div class="hilite">@{hilite}</div>' +
			'</div>' +
			'<ul class="buttons"></ul>' +
			'</div>' +
			'</section>',
		button:
			'<li>' +
			'<div@{style}><a class="button @{class:type}"@{attr}>@{label:button}</a></div>' +
			'</li>'
	},
	/*
	---------------------------
	Template.libw.sector
	---------------------------
	Templates utilizados para criação dos sectors (setores primários), que vão dentro do container principal (main).
	---------------------------
	*/
	sector: {
		container:
			'<section class="sui-sector @{class:transparent} @{class:float} @{class:unclosable}" id="@{attr:id}" data-sector="@{data:sector}"@{style}>' +
			'<div class="picker"></div>' +
			'<div class="label @{class:icon}" style="@{image:logo}"><span>@{label:name}</span></div>' +
			'@{child:title}' +
			'<div class="sui-views-container" id="suiViewsContainer">' +
			'<div class="puller"><div class="spin"></div></div>' +
			'@{child:views}' +
			'</div>' +
			'<div class="close">Fechar</div>' +
			'</section>',
		tab:
			'<li data-sector="@{data:sector}" class="@{class:unclosable}">' +
			'<span class="@{class:icon} label"><u>@{label:name}</u></span>' +
			'<span class="close icon-close3"></span>' +
			'</li>'
		,
		viewnav:
			'<div class="viewnav @{class:custom} @{class:disable}"><span class="@{class:direction} @{class:icon}"@{data}></span></div>',
		title:
			'<div class="sui-sector-title @{class:hidden}" data-sector="@{data:sector}">' +
			'<div class="name @{class:icon}">@{label:title}</div>' +
			'@{child:prev}' +
			'<div class="tabs sui-tabs-view scroll-custom sn" id="suiTabsView">' +
			'<ol></ol>' +
			'</div>' +
			'@{child:next}' +
			'<div class="close"></div>' +
			'<div class="space"></div>' +
			'</div>'
	},
	/*
	---------------------------
	Template.libw.view
	---------------------------
	Templates utilizados para criação das views (setores secundários), que vão dentro dos sectors (setores primários).
	---------------------------
	*/
	view: {
		/*
		tab :
			'<li id="suiTabToAppend" data-view="@{custom:view}">'+
				'<div class="@{class:icon}">'+
					'<small class="key icon-key3">@{label:key}</small>'+
					'<strong class="name">@{label:name}<br/><small>command</small></strong>'+
					'<mark class="livestate"></mark>'+
				'</div>'+
				'<span class="close icon-close3"></span>'+
			'</li>',
		*/
		tab: {
			container:
				'<li id="suiTabToAppend" data-view="@{custom:view}">' +
				'<div class="label @{class:icon} @{class:hasvisual}">' +
				'@{child:title}' +
				'</div>' +
				'<span class="close icon-close3"></span>' +
				'</li>',
			key:
				'<div class="visual">' +
				'<small class="key icon-key3">@{label:key}</small>' +
				'</div>',
			text:
				'<div class="text">' +
				'<strong>@{label:name}</strong>' +
				'<small>@{label:subname}</small>' +
				'<mark class="livestate"></mark>' +
				'</div>',
		},
		container:
			'<section class="sui-view @{class:scroll} @{class:selected} @{class:covered} @{class:prop} @{class:type}" @{style} id="@{attr:id}"@{data}>' +
			'@{child:content}' +
			'</section>',
		cover:
			'<picture class="sui-cover"@{style}><div class="image @{bg}" style="background-image:url(\'@{image}\');"></div>@{child:json}</picture>'
	},
	/*
	---------------------------
	Template.libw.content
	---------------------------
	Template utilizado para criação do container de conteúdo (setor terciário), que vai dentro das views (setores secundários).
	---------------------------
	*/
	content: '<div class="sui-content @{class:scroll} @{class:prop}"@{style}>@{child:content}</div>',
	/*
	---------------------------
	Template.libw.content
	---------------------------
	Template utilizado para criação do container de conteúdo (setor terciário), que vai dentro das views (setores secundários).
	---------------------------
	*/
	layout: {
		normal:
			'<div class="sui-layout @{class:type} @{class:scroll} @{class:prop}"@{style}@{data}>@{child:content}</div>',
		footer:
			'<div class="sui-layout footer"@{style}>' +
			'<ul class="left">' +
			'<li><span class="cache" id="footCache"><strong>x</strong><mark></mark></span></li>' +
			'<li>' +
			'<h3 id="footName">@{label:name}</h3>' +
			'<small id="footStat" class="icon-av-timer">--</small>' +
			'</li>' +
			'</ul>' +
			'<ul class="right">' +
			'<li><small>@{label:framework} @{label:version}</small><div><small><strong>@{label:madewith}</strong></small></div></li>' +
			'<li><a class="button icon-sourceui" href="http://sourceui.com" target="_blank"></a></li>' +
			'<li><a class="button icon-sourcelab" href="http://sourcelab.com.br" target="_blank"></a></li>' +
			'</ul>' +
			'</div>',

	},
	/*
	---------------------------
	Template.libw.widget
	---------------------------
	Templates utilizados para criação dos wideget genéricos (setor quartenário), que vão dentro dos contents (setores terciários).
	---------------------------
	*/
	widget: {
		container:
			'<div id="@{attr:id}" class="sui-widget @{class:type} @{class:mode} @{class:block} @{class:prop}" data-type="@{class:type}"@{data}@{style}>@{child:content}</div>',
		title: {
			container:
				'<div class="title @{class:prop}"@{style}>' +
				'@{child:icon}' +
				'@{child:badge}' +
				'@{child:label}' +
				'@{child:toolbar}' +
				'</div>',
			badge:
				'<div class="badge @{class:type} @{class:state}"><span@{style}>@{value:number}</span></div>',
			icon:
				'<i class="icon @{icon:name}"></i>',
			label:
				'<h3 class="label"><span>@{label:name}</span><small>@{label:description}</small></h3>',
		},
		helper:
			'<div class="helper">@{child:helper}<a class="close icon-close"></a></div>',
		finder:
			'<form class="finder"@{data}>@{child:finder}</form>',
		area:
			'<section class="area @{scroll} @{paginator} @{class:type} @{class:selected} @{class:has}"@{data}@{style}>@{child:area}</section>',
		tip:
			'<div id="@{id}" class="sui-tip @{class:icon} @{class:type} @{class:size} @{class:prop}"@{style}@{attr}>@{child:tip}</div>',
		button:
			'<a id="@{id}" class="button @{class:type} @{class:size} @{class:prop}"@{style}@{attr}>@{child:content}</a>',
		footer:
			'<div class="footer @{type} icon-dots-small"></div>'
	},
	/*
	---------------------------
	Template.libw.widgetDatagrid
	---------------------------
	Templates utilizados para criação dos wideget de datagrid, que vai dentro do setor "area" dos widgets.
	---------------------------
	*/
	wg: {
		datagrid: {
			linegroup:
				'<div class="linegroup @{class:type}"><h3><span>@{label:count}</span>@{label:name}</h3><div class="lines @{class:type}"><div class="sizer"></div>@{child:lines}</div></div>',
			list:
				'<div class="list @{class:type} @{class:scroll} @{class:prop} @{class:grouped}" data-action-pickline="@{action:pickline}" data-action-checklines="@{action:checklines}" data-paginator="@{default:paginator}"@{data}@{style}><div class="sizer"></div>@{child:content}</div>',
			header: {
				container:
					'<div class="sn header @{class:prop}"@{data}>' +
					'<div class="col pad"></div>' +
					'<div class="col check"></div>' +
					'<div data-index="0" class="col seq icon-some"></div>' +
					'@{child:column}' +
					'<div class="col sort"></div>' +
					'<div class="col context"></div>' +
					'<div class="col swiper"></div>' +
					'<div class="col pad"></div>' +
					'</div>',
				column:
					'<div data-index="@{value:index}" class="col sui-link @{class:order} @{class:type} @{class:is} icon-some"@{style}@{data}>@{label:name}@{drag}</div>'
			},
			line: {
				container:
					'<div class="line @{data:type} @{class:prop}"@{attr}@{data}@{style}>' +
					'<div class="col pad"></div>' +
					'<div class="col check icon-check"></div>' +
					'<div data-index="0" class="col seq">@{value:seq}</div>' +
					'@{child:column}' +
					'<div class="col sort icon-deslok"></div>' +
					'<div class="col context icon-dots-small-vert">@{child:context}</div>' +
					'<div class="col swiper icon-dots-small sn">@{child:swiper}</div>' +
					'<div class="col pad"></div>' +
					'</div>',
				column:
					'<@{value:tag} data-index="@{value:index}" data-original="@{prop:original}" class="col @{class:order} @{class:type} @{class:is} @{class:icon} @{class:info}"@{style}@{async}@{data}>@{label:content}</@{value:tag}>',
				description:
					'<@{value:tag} data-index="@{value:index}" class="col @{class:order} @{class:type} @{class:is} @{class:icon} @{class:info}"@{style}@{async}><div class="fixflow">@{label:content}</div></@{value:tag}>',
				image:
					'<@{value:tag} data-index="@{value:index}" data-original="@{prop:original}" class="col @{class:order} @{class:type} @{class:is}"@{data}><div class="img"@{style}@{async}></div></@{value:tag}>',
				thumb:
					'<@{value:tag} data-index="@{value:index}" data-original="@{prop:original}" class="col @{class:order} @{class:type} @{class:is}"@{data}><div class="thumb"@{style}@{async}></div></@{value:tag}>',
				icon:
					'<@{value:tag} data-index="@{value:index}" data-original="@{prop:original}" class="col @{class:order} @{class:type} @{class:is}"@{data}><i class="icon @{class:icon}"@{style}></i></@{value:tag}>',
				abbr:
					'<@{value:tag} data-index="@{value:index}" data-original="@{prop:original}" class="col @{class:order} @{class:type} @{class:is}"@{data}><div class="abbr"@{style}@{async}>@{label:content}</div></@{value:tag}>',
				ordinary:
					'<@{value:tag} data-index="@{value:index}" data-original="@{prop:original}" class="col @{class:order} @{class:type} @{class:is}"@{data}><div class="ordinary"@{style}@{async}>@{label:content}</div></@{value:tag}>',

				flex: {
					container:
						'<div class="flexer">@{child:items}</div>',
					item:
						'<div class="item @{class:type}"@{style}><small>@{label:title}</small>@{content}<small>@{label:name}</small></div>'
				},
				join: {
					container:
						'<div class="joiner">@{child:items}</div>',
					abbr:
						'<div class="abbr"@{style}>' +
						'<p class="ghost" style="background-color:@{ghost:color};background-image:@{ghost:image}"></p>' +
						'<span>@{content}</span>' +
						'</div>',
					image:
						'<div class="image"@{style}>' +
						'<p class="ghost" style="background-color:@{ghost:color};background-image:@{ghost:image}"></p>' +
						'</div>',
					icon:
						'<div class="icon @{class:icon}"@{style}>' +
						'<p class="ghost" style="background-color:@{ghost:color};background-image:@{ghost:image}"></p>' +
						'</div>'
				},
				swiper: {
					container:
						'<div class="actions">' +
						'<ul>@{child:actions}</ul>' +
						'</div>',
					action:
						'<li class="@{class:icon} @{class:type}"@{style}@{data}>@{label:name}</li>'
				}
			},
			paginator: {
				buttonDown:
					'<a class="sui-link paginator buttondown icon-move-vertical"><strong>+@{label:more}</strong></a>'
			},
			treeview: {
				container:
					'<div class="treeview @{class:type}"@{style}@{data}>' +
					'@{child:content}' +
					'<div>',
				label:
					'<div class="label"@{style}>' +
					'<i class="connector"></i>' +
					'<i class="icon @{class:icon}"></i>' +
					'<div class="name">@{child:content}</div>' +
					'</div>',

				node:
					'<li class="node @{class:fold} @{class:collpased} @{class:selected} @{class:prop}"@{style}@{data}>' +
					'<div class="trace"></div>' +
					'@{child:content}' +
					'</li>'

			}
		},
		upillow: {
			input:
				'<input class="input file" type="file"@{url}@{name}@{accept}@{selection}/>',
		},
		upload: {
			input:
				'<input class="input file" type="file"@{accept}@{selection}/>',
			dragzone: {
				container:
					'<div class="dragzone icon-cloud-upload">' +
					'<h2>Arraste e solte alguns arquivos aqui dentro</h2>' +
					'<p>-- ou --</p>' +
					'<a class="button add">Clique para escolher</a>' +
					'</div>'
			},
			dashboard: {
				container:
					'<div class="dashboard">' +
					'<h3>Progresso Geral</h3>' +
					'<div class="dash">' +
					'<div class="circle icon-cloud-upload">' +
					'<svg class="knob" width="100%" height="100%" viewbox="0 0 100 100">' +
					'<circle class="donut" cx="50" cy="50" r="45" fill="transparent" stroke-width="10" stroke="rgba(38,33,32,0.775)" stroke-dasharray="284.743" stroke-dashoffset="284.743"/>' +
					'<circle class="prepare" cx="50" cy="50" r="45" fill="transparent" stroke-width="10" stroke="rgba(38,33,32,0.775)" stroke-dasharray="70" stroke-dashoffset="244"></circle>' +
					'</svg>' +
					'<div class="aux remaining"><span></span><small></small></div>' +
					'<div class="percent">0%</div>' +
					'<div class="aux speed"><span>0 bps</span><small>Velocidade</small></div>' +
					'</div>' +
					'</div>' +
					'<div class="buttons">' +
					'<a class="button add more">Adicionar à fila</a>' +
					'<a class="button play">Fazer Uploads</a>' +
					'<a class="button stop">Cancelar Uploads</a>' +
					'<a class="button clear all">Limpar Fila</a>' +
					'</div>' +
					'</div>'
			},
			filelist: {
				container:
					'<div class="noswipe filelist">' +
					'<div class="scroll">' +
					'<h3>Fila de Arquivos</h3>' +
					'<div class="queue"></div>' +
					'<div class="buttons">' +
					'<a class="button add more">Adicionar à fila</a>' +
					'<a class="button play">Fazer Uploads</a>' +
					'<a class="button stop">Cancelar Uploads</a>' +
					'<a class="button clear all">Limpar Fila</a>' +
					'</div>' +
					'</div>' +
					'</div>',
				file:
					'<div class="file @{type} @{status}" id="@{id}">' +
					'<div class="resume">' +
					'<div class="icon"><i class="sui-fs @{ext} m"><b>@{ext}</b></i></div>' +
					'<div class="desc">' +
					'<div class="data">' +
					'<div class="info">' +
					'<div class="name">@{name}</div>' +
					'<div class="type">@{mime}</div>' +
					'</div>' +
					'<div class="size">@{bytes}</div>' +
					'</div>' +
					'<div class="progress">' +
					'<div class="bar"></div>' +
					'</div>' +
					'</div>' +
					'<div class="status">' +
					'<a class="queue icon-cross"></a>' +
					'<a class="process icon-spin-alt"></a>' +
					'<a class="done icon-checkmark2"></a>' +
					'<a class="error icon-warning2"></a>' +
					'</div>' +
					'</div>' +
					'<div class="details">' +
					'</div>' +
					'</div>'
			}
		},
		summary: {
			info:
				'<div class="information @{class:size}"@{style}>' +
				'<div class="visual">' +
				'<div class="abbr">@{label:abbr}</div>' +
				'<div class="key icon-key">@{label:key}</div>' +
				'<div class="icon @{class:icon}"></div>' +
				'</div>' +
				'<div class="text">' +
				'<h3>@{label:title}</h3>' +
				'@{child:info}' +
				'</div>' +
				'</div>',
			counter: {
				icon:
					'<div class="counter @{class:icon} @{class:size} @{class:hilited}">' +
					'<div class="title">@{label:title}</div>' +
					'@{child:badges}' +
					'<div class="name">@{label:name}</div>' +
					'</div>',
				badge:
					'<marker class="badge @{class:type}"@{style}>@{value:badge}</marker>',
			},
			events: {
				title:
					'<h3 class="list-title">@{title}</h3>',
				group:
					'<div class="eventgroup @{class:all}">' +
					'<div class="date sui-link"@{data}>' +
					'<div class="week">@{label:week}</div>' +
					'<div class="day">@{label:day}</div>' +
					'<div class="month">@{label:month}</div>' +
					'<div class="year">@{label:year}</div>' +
					'</div>' +
					'<div class="events">' +
					'@{child:event}' +
					'</div>' +
					'</div>',
				event:
					'<div class="event @{class:all}"@{style}@{data}>' +
					'<div class="name">' +
					'<div class="title">@{label:title}</div>' +
					'<div class="type"><b>@{label:time}</b> <span>@{label:name}</span></div>' +
					'<div class="desc">@{label:description}</div>' +
					'</div>' +
					'<div class="info">' +
					'<div class="cal">@{label:calendar}</div>' +
					'<div class="owner">@{label:owner}</div>' +
					'</div>' +
					'<div class="status">@{label:status}</div>' +
					'</div>'
			},
			finance: {
				account:
					'<div class="account">' +
					'<div class="name @{class:icon}"><strong>@{label:name}</strong><br/><div>@{label:title}</div></div>' +
					'<div class="balance">' +
					'<div class="currency">@{value:currency}</div>' +
					'<div class="mainvalue">@{value:balance}</div>' +
					'<div class="percent">@{value:percent}</div>' +
					'</div>' +
					'<div class="chart" data-chart-type="@{data:type}">@{data:json}</div>' +
					'</div>',
			}
		},
		profile: {
			identifier:
				'<div class="identifier">@{child:content}</div>',
			avatar:
				'<div class="avatar" @{style}></div>',
			abbr:
				'<div class="abbr"@{style}>@{label}</div>',
			icon:
				'<div class="icon @{name}"@{style}></div>',
			label:
				'<div class="label"@{style}@{attr}>' +
				'<div class="name">@{name}</div>' +
				'<div class="title">@{title}</div>' +
				'<div class="description">@{content}</div>' +
				'</div>',
		},
		custom: {
			line:
				'<div class="line"@{style}>' +
				'<div class="label @{class:icon}" style="text-align:@{label:align}">' +
				'@{label:name}' +
				'<div class="description">@{label:description}</div>' +
				'</div>' +
				'<div class="flex">' +
				'@{child:content}' +
				'</div>' +
				'</div>',
			column:
				'<div class="column @{class:type} @{class:prop}"@{style}@{data}>' +
				'<div class="label @{class:icon}" style="text-align:@{label:align}">' +
				'@{label:name}' +
				'<div class="description">@{label:description}</div>' +
				'</div>' +
				'<div class="content">' +
				'@{child:content}' +
				'</div>' +
				'<div class="legend" style="text-align:@{label:align}">' +
				'@{label:legend}' +
				'</div>' +
				'</div>',
		},
		calendar:
			'<div class="cal @{class:type}"@{data}>' +
			'<code type="json">' +
			'@{child:json}' +
			'</code>' +
			'</div>',

		events: {
			title:
				'<h3 class="list-title">@{title}</h3>',
			group:
				'<div class="eventgroup @{class:all}">' +
				'<div class="date"@{data}>' +
				'<div class="week">@{label:week}</div>' +
				'<div class="day">@{label:day}</div>' +
				'<div class="month">@{label:month}</div>' +
				'<div class="year">@{label:year}</div>' +
				'</div>' +
				'<div class="events">' +
				'@{child:event}' +
				'</div>' +
				'</div>',
			event:
				'<div class="event @{class:all}"@{style}@{data}>' +
				'<div class="name">' +
				'<div class="title">@{label:title}</div>' +
				'<div class="type"><b>@{label:time}</b> <span>@{label:name}</span></div>' +
				'<div class="desc">@{label:description}</div>' +
				'</div>' +
				'<div class="info">' +
				'<div class="cal">@{label:calendar}</div>' +
				'<div class="owner">@{label:owner}</div>' +
				'</div>' +
				'<div class="status">@{label:status}</div>' +
				'</div>'
		},
		form: {
			stage:
				'<div class="sui-stage">@{child:sets}</div>',
			filterset:
				'<div class="sui-filterset @{class:orient} @{class:mode} @{class:align} @{class:prop}"@{data}>' +
				'<ul>@{child:filters}</ul>' +
				'</div>',
			filter:
				'<li>' +
				'<div class="sui-filter @{class:selected} @{class:prop}"@{style}@{data}>' +
				'<a><label>@{label:name}</label><strong>@{label:value}</strong>@{label:content}</a>' +
				'<span class="close icon-cross"></span>' +
				'@{child:list}' +
				'</div>' +
				'</li>',
			fieldset:
				'<div class="sui-fieldset @{class:orient} @{class:prop}"@{data}@{attr}>' +
				'<h3 class="name">@{label:name}</h3>' +
				'@{child:fields}' +
				'</div>',
			buttonset:
				'<div class="sui-buttonset @{class:orient} @{class:mode} @{class:align} @{class:size} @{class:prop}"@{data}@{style}>' +
				'<ul class="group">@{child:buttons}</ul>' +
				'</div>',
			button:
				'<li><div class="sui-button @{class:prop}"@{style}><a class="@{class:icon} @{class:type} @{class:link}"@{attr}@{data}><span>@{label:name}</span></a></div></li>'
		},
		report: {
			document:
				'<div class="sui-report-pagelist scroll-custom"></div>'+
				'<div class="sui-report-replacer">'+
					'<div class="toggler icon-arrow-right2"></div>'+
					'<div class="form">'+
						'<div class="find">'+
							'<div class="field">'+
								'<input class="strfind" type="text" placeholder="Find..."/>'+
								'<a class="clear icon-close2" data-tip="Clear Term"></a>'+
								'<a class="case" data-tip="Match Case">Aa</a>'+
								'<a class="word" data-tip="Match Whole Word">ab</a>'+
							'</div>'+
							'<span class="result">No results</span>'+
							'<a class="prev icon-lite-up" data-tip="Previous Match"></a>'+
							'<a class="next icon-lite-down" data-tip="Next Match"></a>'+
							'<a class="close icon-close3" data-tip="Close"></a>'+
						'</div>'+
						'<div class="repl">'+
							'<div class="field">'+
								'<input class="strrepl" type="text" placeholder="Replace..."/>'+
								'<a class="clear icon-close2" data-tip="Clear Term"></a>'+
							'</div>'+
							'<a class="once" data-tip="Replace Current Match">Curr</a>'+
							'<a class="all" data-tip="Replace All Matches">All</a>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="sui-report-foundmap"></div>'+
				'<div id="@{id}" class="sui-report-document @{paper} @{class}" lang="@{lang}" data-class="@{class}">@{child:content}</div>',
			comments:
				'<div class="sui-comments"><code>@{child:content}</code></div>',
			validations:
				'<div class="sui-validations">@{child:content}</div>',
			templates:
				'<div class="sui-templates">@{child:content}</div>',
			header:
				'<div class="header"@{style}@{data}>@{child:content}</div>',
			footer:
				'<div class="footer"@{style}@{data}>@{child:content}</div>',
			page:
				'<div class="page @{data:layout} @{data:structure} @{data:breaker} @{data:prop} @{data:visible}"@{data}@{style}><div class="breakermark"><a class="delete icon-subtract"></a></div><div class="pagedropper"></div><div class="bleed">@{child:content}</div></div>',
			main:
				'<div class="main"@{data}@{style}>@{child:content}</div>',
			notes:
				'<div class="notes"@{style}@{data}>@{child:content}</div>',
			cover:
				'<div class="cover @{data:prop} @{data:type} @{type}"@{data}@{style}>@{child:content}</div>',
			row:
				'<div class="row @{name} @{type}"@{data}@{style}>@{child:content}</div>',
			cell:
				'<div class="cell @{name} @{type}"@{data}@{style}>@{child:content}</div>',
			stacker:
				'<div class="stacker @{type}"@{data}@{style}>@{child:content}</div>',
			block:
				'<div class="block @{name} @{type} @{data:prop} @{data:visible}"@{data}@{style}>@{child:content}</div>',
			col:
				'<td class="col"@{data}@{style}>@{child:content}</td>',
			line:
				'<tr class="line"@{data}@{style}>@{child:content}</tr>',
			container:
				'<table cellspacing="0" class="container @{data:type}"@{data}@{style}><tbody>@{child:content}</tbody></table>',
			stack:
				'<div class="stack @{name} @{type}"@{data}@{style}>@{child:content}</div>',
		},
		map: {
			map:
				'<div class="noswipe map"@{attr}@{style}></div>',
		},
		log: {
			timeline:
				'<div class="history">' +
				'<h3>@{label:title}</h3>' +
				'<div class="timeline">' +
				'@{child:code}' +
				'</div>' +
				'</div>',
		},
		wizard: {
			stack:
				'<div class="stack"@{data}@{attr}@{style}>' +
				'@{child:content}' +
				'</div>',
			title:
				'<h3 class="title"@{style}>' +
				'@{text}' +
				'</h3>',
			description:
				'<div class="description"@{style}>' +
				'@{text}' +
				'</div>',
			list:
				'<div class="list>@{child:items}</div>',
			item: {
				container:
					'<div class="item @{data:type}"@{data}>' +
					'<div class="col check icon-check"></div>' +
					'@{child:column}' +
					'</div>',
				column:
					'<@{value:tag} data-index="@{value:index}" class="col @{class:type} @{class:order} @{class:is} @{class:icon} @{class:info}"@{style}@{async}>@{label:content}</@{value:tag}>',
				description:
					'<@{value:tag} data-index="@{value:index}" class="col @{class:type} @{class:order} @{class:is} @{class:icon} @{class:info}"@{style}@{async}><div class="fixflow">@{label:content}</div></@{value:tag}>',
			},
		},
		timeline: {
			timeline:
				'<div class="timeline" @{style}>' +
				'@{child:content}' +
				'</div>',
			post:
				'<div class="post" @{style}>' +
				'<div class="content">' +
				'@{child:content}' +
				'</div>' +
				'</div>',
			icon:
				'<div class="icon @{name}"@{style}></div>',
			abbr:
				'<div class="abbr"@{style}>@{label}</div>',
			avatar:
				'<div class="avatar" @{style}></div>',
			title:
				'<div class="title">@{content}</div>',
			moment:
				'<div class="moment">@{content}</div>',
			image:
				'<div class="image"@{style}>' +
				'<img src="@{src}"/>' +
				'</div>',
			opengraph:
				'<a class="link"@{style} href="@{href}">' +
				'<img src="@{src}"/>' +
				'<span class="description">@{desc}</span>' +
				'</a>',
			description:
				'<div class="description">@{content}</div>',


		}
	}
});


sourceui.Parser = function () {

	var Parser = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var TemplateFields = sourceui.templates.fields;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Instances = sourceui.instances;
	var Interface = Instances.interface;
	var Document = Interface.document;
	var Dom = sourceui.interface.dom;
	var Plugins = Interface.plugins;
	var Notify = Plugins.notify;
	var Confirm = Plugins.confirm;
	var Userguide = Plugins.userguide;
	var Session = Device.session.data();

	var isPT = (Dom.html.attr('lang').indexOf('pt-') > -1);

	var Console;

	var setup;
	var root;

	this.isValid = true; // testar isso aqui

	var $body = $('#suiBody');
	var JSONX = JSON5 || JSON;

	var Render = {

		file: function (sui) {
			sui.findChild('file', function () {
				var id = this.attr('id');
				var $file;
				if (id) {
					$file = $('#' + id);
					$file.closest('.sui-field').val(this);
				}
			});
			sui.findChild('async', function () {
				Components.libs.async(this);
			});
			sui.findChild('notify', function () {
				Components.libs.notify(this);
			});
		},

		snippet: function (sui) {
			var snip = {};
			var haschip = false;
			var jql = [];
			sui.findChild('snip', function () {
				haschip = true;
				var suiSnip = this;
				var target = this.attr('target');
				if (target === 'field' && setup.field) {
					var value = this.attr('value');
					var selector = this.attr('selector');
					var name = this.attr('name');
					var id = this.attr('id');
					var $field = setup.field.filter(selector ? selector : (name ? '[data-name="' + name + '"]' : '#' + id));
					if ($field.length) {
						var customfield = $field.data('customField');
						if (customfield) {
							customfield.snip(suiSnip);
						}
					} else {
						console.warn('Field '+name+' not found to snip');
					}
				} else if (target) {
					var $t;
					var $jq = $();
					var $keep;
					if (target.indexOf('#') > -1) {
						$t = $(target);
						if ($t.is('.sui-fieldset')){
							$keep = $t.find('h3.name');
						}
						else if ($t.is('.sui-field')){
							var customfield = $t.data('customField');
							if (customfield) {
								return customfield.snip(suiSnip);
							}
						}
					} else if (target.indexOf('@') > -1) {
						$t = $.ache('field', target, [(setup.view || setup.sector), $(document)]).val();
					}
					if ($t.length) {
						var $jq = $(Render.full(suiSnip));
						if (setup.placement.indexOf('append') > -1) {
							$t.append($jq);
						} else if (setup.placement.indexOf('prepend') > -1) {
							$t.prepend($jq);
						} else if (setup.placement.indexOf('inner') > -1) {
							if ($keep){
								$t.children().not($keep).remove();
								$t.append($jq);
							} else{
								$t.html($jq);
							}
						} else if (setup.placement.indexOf('replace') > -1) {
							$t.replaceWith($jq);
						}
						jql.push($jq);
					}
				}
			});
			return $($.map(jql, function (el) { return el.get(); }));
		},

		parts: function (sui) {
			var str = '',
				render = setup.render;
			if (render == '@calendar-schedules') {
				//str = JSON.parse(sui.content() || '[]');
				str = sui.content();
				str = JSON.parse(str);
				//str = '';
			} else if (render == '@sheet-data') {
				sui.find('datasheet',function(){
					str = JSONX.parse((this.content() || '[]').trim());
				}, function(){
					str = JSONX.parse((sui.content() || '[]').trim());
				});
			} else if (render == '@download-data') {
				console.log(sui);
				sui.find('download',function(){
					var content = this.content();
					download(content, this.attr('filename'), this.attr('header') || null);
				}, function(){
					console.error('THERE IS NO DOWNLOAD ELEMENT AT SOURCEUI OUTPUT');
				});
			} else if (render == '@datagrid-list') {
				sui.findChild(function () {
					if (this.nodeName == 'list'){
						str = Components.libs.widget.datagrid.list(this);
					} else {
						this.find('area',function(){
							this.findChild(function(){
								if (this.nodeName == 'list'){
									str += Components.libs.widget.datagrid.list(this);
								} else if (this.nodeName == 'tip'){
									str += Components.libs.tip(this);
								}
							});
						});
					}
				});
			} else if (render == '@datagrid-line') {
				sui.find('list', function () {
					if (!this.attr('default:paginator')) return false; //escapa todas as listas que não forem de datagrid
					var suiList = this,
						lineseq = setup.filter.limitStart,
						headerData = {},
						orderData = {};
					orderData.by = suiList.attr('data:by') || '';
					orderData.ord = suiList.attr('data:ord') || '';
					suiList.find('header', function () {
						Components.libs.widget.datagrid.header(this, headerData, orderData);
					});
					suiList.findAll('line', function () {
						lineseq++;
						str += Components.libs.widget.datagrid.line(this, lineseq, headerData);
					});
					str += Components.libs.widget.datagrid.paginator(suiList);
				});
			} else if (render == '@event-list') {
				sui.findChild(function () {
					if (this.nodeName == 'title') str += Components.libs.widget.events.title(this);
					else if (this.nodeName == 'eventgroup') str += Components.libs.widget.events.group(this);
					else if (this.nodeName == 'empty') str += this.toHTML('empty', { child: { html: this.content() || 'Não há agendamentos' } }, Template.get);
				});
			} else if (render == '@field-dropitems') {
				if (setup.field && setup.field.length) {
					var $field = setup.field;
					var id = $field.attr('id');
					if (id) {
						sui.findId(id, function () {
							var suiField = this;
							var Field = new sourceui.parserField(suiField);
							str = Field.methods.getParts('dropitems');
						});
					}
				}
			} else {
				if (setup.field && setup.field.length) {
					sui.findChild(function () {
						if (this.nodeName == 'field') {
							var suiField = this;
							var Field = new sourceui.parserField(suiField);
							str += Field.methods.getTemplate();
						}
					});
					// aqui é o seguinte... precisa achar um jeito de substituir a lista ou o valor dos campos.
					// usar o setup.field pode ser uma solução para renderizar varios campos de uma única vez.

				}
			}
			return str;
		},

		full: function (sui) {
			var str = '';
			sui.findChild(function () {
				var s = Components.get(this);
				if (s && s.indexOf("@{child:content}") != -1) {
					str += Template.replace(s, {
						child: { content: Render.full(this) }
					});
				} else {
					str += s || '';
				}
			});
			return str;
		},

		trace: function (sui) {
			if (!Device.debug() || (setup.fromcache && !setup.response.error)) return '';
			sui.findChild('item', function () {
				var suiItem = this;
				var data = { type: suiItem.attr('type'), color: suiItem.attr('color') };
				suiItem.findChild(function () {
					data[this.nodeName] = this.content();
				});
				data.mode = data.mode || 'Server';
				Console.item(data);
			});
		},

		css: function (sui) {
			var id = sui.attr('id');
			return '<style id="' + id + '">' + sui.content() + '</style>';
		},

		js: function (sui) {
			if (sui instanceof Element) return '<script>' + sui.content() + '</script>';
			else if (typeof sui === 'string') return '<script>' + sui + '</script>';
		},

	};

	var Components = {
		get: function (sui) {
			var nn = sui.nodeName,
				tp = sui.getAttribute('class:type'),
				pn = sui.parentNode.nodeName;
			if (Components.libs[nn]) {
				if (typeof Components.libs[nn] == 'function') return Components.libs[nn](sui);
				else if (typeof Components.libs[nn][nn] == 'function') return Components.libs[nn][nn](sui);
				else if (typeof Components.libs[nn]['full'] == 'function') return Components.libs[nn]['full'](sui);
				if (Components.libs[nn][tp]) {
					if (typeof Components.libs[nn][tp] == 'function') return Components.libs[nn][tp](sui);
					else if (typeof Components.libs[nn][tp]['full'] == 'function') return Components.libs[nn][tp]['full'](sui);
				}
			} else if (Components.libs[pn]) {
				if (Components.libs[pn][nn]) {
					if (typeof Components.libs[pn][nn] == 'function') return Components.libs[pn][nn](sui);
					else if (typeof Components.libs[pn][nn]['full'] == 'function') return Components.libs[pn][nn]['full'](sui);
					if (Components.libs[pn][nn][tp]) {
						if (typeof Components.libs[pn][nn][tp] == 'function') return Components.libs[pn][nn][tp](sui);
						else if (typeof Components.libs[pn][nn][tp]['full'] == 'function') return Components.libs[pn][nn][tp]['full'](sui);
					}
				}
			}
			return '';
		},
		libs: {
			userguide: function (sui) {
				if (sui.nodeName != 'userguide') return '';
				var gdata = [];
				sui.findChild('guide', function () {
					var gd = this.attr();
					gd.frames = [];
					gd.buttons = [];
					this.findChild('frame', function () {
						var fr = this.attr() || {};
						fr.content = this.content();
						fr.buttons = [];
						this.findChild('button', function () {
							var bt = this.attr() || {};
							fr.buttons.push(bt);
						});
						gd.frames.push(fr);
					});
					this.findChild('button', function () {
						var bt = this.attr() || {};
						gd.buttons.push(bt);
					});
					gdata.push(gd);
				});
				Dom.document.one('parseui', function () {
					setTimeout(function () {
						Userguide.load(gdata);
						Userguide.open('.intro');
					}, 2250);
				});

			},
			notification: function (sui) {
				if (sui.nodeName != 'notification') return '';
				var htmlItem = '';
				sui.findChild('item', function () {
					htmlItem += Components.libs.panel.navitem(this);
				});
				return htmlItem;
			},
			eventhandler: function (sui, elem) {
				if (sui.nodeName != 'eventhandler') return '';
				var attr = sui.attr();
				var data = sui.attr();
				if (data.target) {
					if (data.target.indexOf('@') > -1) {
						if (elem && elem.data('view') && data.target.indexOf('@tool-') > -1) {
							data.jq = $('#' + elem.data('view') + ' [data-alias="' + data.target.substring(6) + '"]');
						} else if (data.target == '@float-sector') {
							data.jq = $('#suiFloatSectorContainer');
						} else if (data.target.indexOf('@viewtab-') > -1) {
							var $sector = setup.sector && setup.sector.lenght ? setup.sector : $('#suiSectorsContainer > .sui-sector.selected');
							var $view = setup.view && setup.view.lenght ? setup.view : $sector.find('#suiViewsContainer > .sui-view.selected');
							if (data.target == '@viewtab-prev') {
								data.jq = $sector.find('#suiTabsView [data-view="' + $view.attr('id') + '"]').prev();
							} else if (data.target == '@viewtab-prevall') {
								data.jq = $sector.find('#suiTabsView [data-view="' + $view.attr('id') + '"]').prevAll();
							} else if (data.target == '@viewtab-next') {
								data.jq = $sector.find('#suiTabsView [data-view="' + $view.attr('id') + '"]').next();
							} else if (data.target == '@viewtab-nextall') {
								data.jq = $sector.find('#suiTabsView [data-view="' + $view.attr('id') + '"]').nextAll();
							} else if (data.target == '@viewtab-first' || data.target == '@viewtab-1') {
								data.jq = $sector.find('#suiTabsView > ol > li:eq(0)');
							} else if (data.target == '@viewtab-second' || data.target == '@viewtab-2') {
								data.jq = $sector.find('#suiTabsView > ol > li:eq(1)');
							} else if (data.target == '@viewtab-third' || data.target == '@viewtab-3') {
								data.jq = $sector.find('#suiTabsView > ol > li:eq(2)');
							} else if (data.target == '@viewtab-fourth' || data.target == '@viewtab-4') {
								data.jq = $sector.find('#suiTabsView > ol > li:eq(3)');
							}
						}
					} else {
						if (elem && elem.data('view')){
							data.jq = $('#' + elem.data('view')).find($.toText(data.target));
						} else {
							data.jq = $($.toText(data.target));
						}
					}
				} else if (data.selector) {
					data.jq = $($.toText(data.selector));
				}

				if (data.jq) {
					data.jq.each(function () {
						var $jq = $(this);
						if (data.trigger) {
							if (data.arguments) $jq.trigger(data.trigger,JSON.parse($('<div>'+data.arguments+'</div>').html()));
							else $jq.trigger(data.trigger);
						} else {
							var hb = $jq.data('handlebound') || {};
							var id = $.md5(JSONX.stringify(attr));
							if (!hb[id]) {
								var bind = data.on || data.one;
								if (bind) {
									var evnt;
									if (data.on) evnt = 'on';
									else if (data.one) evnt = 'one';
									$jq[evnt](bind, function () {
										sui.findChild('eventhandler', function () {
											Components.libs.eventhandler(this, $jq);
											delete hb[id];
										});
									});
									hb[id] = bind;
									$jq.data('handlebound', hb);
								}
							}
						}
					});
				}
			},
			ajax: function (sui) {
				if (sui.nodeName != 'ajax') return '';
				var data = sui.attr(true);
				setup.ondone = function () {
					Network.link(data.link);
				};
			},
			info: function (sui) {
				if (sui.nodeName != 'info') return '';
				var attr = sui.attr();
				if (attr.for == 'upload-file' && attr.selector) {
					var $file = (setup.widget) ? setup.widget.find(attr.selector) : $(attr.selector);
					if (attr.type == 'error' || attr.type == 'warn') {
						$file.find('.details').html(sui.content());
						$file.trigger('upload:error');
					} else if (attr.data) {
						$file.data(attr.data, sui.content());
					}
				}
			},
			async: function (sui) {
				if (sui.nodeName != 'async') return '';
				var $async;
				var data = {
					type: sui.attr('type'),
					name: sui.attr('name'),
					key: sui.attr('key'),
					id: sui.attr('id'),
					field: sui.attr('field'),
					value: sui.attr('value')
				};
				if (data.name && data.key) {
					$async = $('[data-async-name="' + data.name + '"][data-async-key="' + data.key + '"]');
				} else if (data.id) {
					$async = $('#' + data.id);
				} else if (data.field) {
					$async = $('.sui-field[data-name="' + data.field + '"]');
				}
				if ($async && $async.length) {
					if (data.type == 'image') {
						if ($async.tag() == 'img') {
							$async.attr('src', data.value);
						} else if ($async.tag() == 'picture') {
							$async.find('img').attr('src', data.value);
							$async.find('source').attr('srcset', data.value);
						} else if ($async.is('.sui-field')) {
							$async.val(data.value);
						} else {
							$async.css('background-image', 'url("' + $.trim(data.value) + '")');
						}
					} else {
						if ($async.is('.sui-field')) {
							$async.val(data.value);
						} else {
							$async.html(data.value);
						}
					}
				}
			},
			notify: function (sui) {
				if (sui.nodeName != 'notify') return '';
				var cfg = {
					type: sui.attr('type'),
					icon: sui.attr('icon'),
					color: sui.attr('color'),
					position: sui.attr('position'),
					duration: sui.attr('duration'),
					name: isPT ? 'Desconhecido' : 'Unknown',
					message: isPT ? 'Ocorreu um erro desconhecido.' : 'An unknown error was occurred.'
				};
				sui.findChild('name', function () { cfg.name = this.content(); });
				sui.findChild('label', function () { cfg.label = this.content(); });
				sui.findChild('message', function () { cfg.message = this.content(); });
				Notify.open(cfg);
				return '';
			},
			validate: function (sui) {
				var haserror = false;
				sui.findChild('ok', function () {
					var $e = this;
					var fd = $e.attr('field');
					var $fd = $();
					var fds = fd.replace(/\s*,\s*/g, ",").split(',');
					$.each(fds, function (k, v) {
						if (v.indexOf('@') > -1) {
							if (setup.view) $fd = setup.view.find('.sui-field[data-name="' + v.substring(1) + '"]');
							else if (setup.sector) $fd = setup.sector.find('.sui-field[data-name="' + v.substring(1) + '"]');
						} else {
							$fd = v.indexOf('#') > -1 ? $(v) : $('#' + v);
						}
						if ($fd.length) {
							$fd.trigger('field:valid', ['remote', $e.content()]);
						}
					});
				});
				sui.findChild('error', function () {
					var $e = this;
					var fd = $e.attr('field');
					var $fd = $();
					var fds = fd.replace(/\s*,\s*/g, ",").split(',');
					$.each(fds, function (k, v) {
						if (v.indexOf('@') > -1) {
							if (setup.view) $fd = setup.view.find('.sui-field[data-name="' + v.substring(1) + '"]');
							if (!$fd.length && setup.sector) $fd = setup.sector.find('.sui-field[data-name="' + v.substring(1) + '"]:last');
							if (!$fd.length && setup.element) $fd = setup.element.closest('.sui-view').find('.sui-field[data-name="' + v.substring(1) + '"]');
						} else {
							$fd = v.indexOf('#') > -1 ? $(v) : $('#' + v);
						}
						if ($fd.length) {
							$fd.trigger('field:error', ['remote', $e.content()]);
							haserror = true;
						} else {
							console.warn('Not possible to find element "' + v.substring(1) + '" to notify filed error');
						}
					});
				});
				if (haserror) {
					Notify.open({
						type: 'error',
						name: isPT ? 'Validação' : 'Validation',
						label: isPT ? 'Algo não está certo' : 'Something got wrong',
						message: isPT ? 'Os dados do formulário são invalidos' : 'Some form data is invalid',
					});
				}

			},
			confirmg: function (sui) {
				var cfg = sui.attr() || {};
				if (!cfg.title) sui.findChild('title', function () { cfg.title = this.content(); });
				if (!cfg.desc) sui.findChild('desc', function () { cfg.desc = this.content(); });
				if (!cfg.desc) sui.findChild('description', function () { cfg.desc = this.content(); });
				if (!cfg.hilite) sui.findChild('hilite', function () { cfg.hilite = this.content(); });
				if (!cfg.pattern) sui.findChild('pattern', function () { cfg.pattern = this.content(); });
				return cfg;
			},
			confirm: function (sui) {
				var cfg = Components.libs.confirmg(sui);
				if (cfg.pattern == 'session-invalid') {
					cfg.type = cfg.type || 'alert';
					cfg.title = cfg.title || (isPT ? 'Sessão inválida' : 'Invalid Session');
					cfg.desc = cfg.desc || (isPT ? 'Você precisa ter uma sessão autenticada válida para acessar essa área do sistema.<br/><br/>Uma nova autenticação é requerida.' : 'You need a valid authenticated session to access this system area.<br/><br/>A new login is required.');
					cfg.button = {
						label: isPT ? 'Recarregar' : 'Reload',
						background: '#c35043',
						callback: function () {
							setTimeout(function () { window.location.reload(true); }, 300);
						}
					};
					Cookies.clear();
					Network.localClear();
					$('#suiAsideLeft, #suiMain').remove();
				} else {
					sui.findChild('buttonlink', function () { cfg.buttonlink = $(this.content()); });
					sui.findChild('button', function () { cfg.button = $.parseJSON(this.content()); });
				}
				Confirm.open(cfg);
				return '';
			},
			code: function (sui) {
				var a = sui.getAttr();
				var c = {};
				var n = a.name;
				var t = a.type;
				var cn;
				if (n) c[n] = {};
				delete a.name;
				delete a.type;
				sui.findChild(function () {
					var attr = this.getAttr() || {};
					var content = this.content() || attr.value || '';
					if (n) c[n][this.tagName.toLowerCase()] = content;
					else c[this.tagName.toLowerCase()] = content;
				}, function () {
					cn = sui.content();
					if (n) c[n] = cn || ($.isEmptyObject(a) ? '' : a);
					else c = cn || ($.isEmptyObject(a) ? '' : a);
				});
				if (c) {
					var v = (typeof c == 'string') ? c : JSON.stringify(c);
					return sui.toHTML('code', { attr: { name: n, type: t }, value: v }, Template.get);
				}
				return '';

			},
			chart: function (sui) {
				if (sui.nodeName != 'chart') return '';
				return sui.toHTML('chart', {
					data: {
						type: sui.attr('data:type'),
						json: sui.content()
					}
				}, Template.get);
			},
			datasheet: function (sui) {
				if (sui.nodeName != 'datasheet') return '';
				return sui.toHTML('datasheet', {
					data: {
						name: sui.attr('data:name'),
						json: sui.content()
					}
				}, Template.get);
			},
			tip: function (sui) {
				if (sui.nodeName != 'tip') return '';
				var content;
				sui.findChild('description', function () {
					content = this.content();
					sui.findChild('buttonset', function () {
						content += Components.libs.widget.form.buttonset(this);
					});
					sui.findChild('button', function () {
						content += this.toHTML('widget', 'button', { child: { content: this.content() } }, Template.get);
					});
				}, function () {
					content = sui.content();
				});
				return sui.toHTML('widget', 'tip', { child: { tip: content } }, Template.get);
			},
			floatbox: function (sui) {
				if (sui.nodeName != 'floatbox') return '';
				var htmlItem = '';
				sui.findChild('item', function () {
					var suiItem = this;
					htmlItem += suiItem.toHTML('floatbox', 'item', Template.get);
				}, function () {
					htmlItem = sui.toHTML('floatbox', 'item', Template.get);
				});
				return sui.toHTML('floatbox', 'container', { child: { items: htmlItem } }, Template.get);
			},
			logo : function(sui){
				var attr = sui.attr(), fsize, lsize,msize, htmlLogo = '';
				sui.findChild('logo', function () {
					attr = $.extend(attr,this.attr());
				});
				attr.image = attr['image:logo'] || attr.image;
				fsize = attr.name ? sui.nodeName == 'auth' ? (4.5 - (attr.name.length/12)) : (2.6 - (attr.name.length/14))  : null;
				lsize = attr.name ? (0.1 - (attr.name.length/600)) : null;
				msize = sui.nodeName == 'auth' ? 2 : 1;
				htmlLogo = sui.toHTML('auth', 'logo', $.extend(attr,{
					class: attr.avatar || attr.abbr || attr.name ? 'dynamic' : 'static',
					trend: attr.trend || attr.image ? 'background-image: url(\'' + $.trim(attr.trend || attr.image) + '\');' : '',
					trendname: attr.trendname,
					image: attr.image ? 'background-image: url(\'' + $.trim(attr.image) + '\');' : '',
					avatar: attr.avatar ? 'background-image: url(\'' + $.trim(attr.avatar) + '\');' : '',
					size: attr.size ? 'font-size:'+attr.size+';' : 'font-size:'+(fsize ? fsize > msize ? fsize+'em' : msize+'em' : 'inherith')+';letter-spacing:'+(lsize ? lsize > 0.01 ? '-'+lsize+'em' : '-0.01em' : 'inherith')+';'
				}), Template.get);
				return htmlLogo || '';
			},
			auth: function (sui) {
				if (sui.nodeName != 'auth') return '';
				setup.target = setup.target || $('#suiAuth'); // força o target
				var attr = sui.attr(),
				htmlLogo = Components.libs.logo(sui);
				var htmlAuth = sui.toHTML('auth', 'container', attr, Template.get);
				var htmlForm = '';
				var htmlScreen = '';
				var htmlSystem = '';
				sui.findChild('screen', function () {
					htmlScreen = this.toHTML('auth', 'screen', { child: { screen: this.content() } }, Template.get);
				});
				sui.findChild('system', function () {
					htmlSystem = this.toHTML('auth', 'system', { child: { system: this.content() } }, Template.get);
				});
				sui.findChild('form', function () {
					var suiForm = this,
						attr = suiForm.attr(),
						data = {
							title: attr['label:title'],
							class: { active: attr['class:active'] }
						},
						tempForm = '',
						htmlField = '',
						htmlOptions = '';
					suiForm.findChild(function () {
						if (this.nodeName == 'description') data.description = this.content();
						else if (this.nodeName == 'fieldset') {
							var suiFieldset = this;
							suiFieldset.findChild(function () {
								if (this.nodeName == 'field') htmlField += Components.libs.widget.form.field(this);
								else if (this.nodeName == 'buttonset') htmlField += Components.libs.widget.form.buttonset(this);
							});
						} else if (this.nodeName == 'options') {
							var suiOptions = this,
								htmlOpt = '';
							suiOptions.findChild('option', function () {
								var suiOpt = this,
									attr = suiOpt.attr(true);
								htmlOpt += suiOptions.toHTML('auth', 'option', { class: attr.class, data: attr.data, attr: attr.attr, label: suiOpt.content() }, Template.get);
							});
							htmlOptions = suiOptions.toHTML('auth', 'options', { child: { options: htmlOpt } }, Template.get);
						}
					});
					tempForm = suiForm.toHTML('auth', 'form', data, Template.get);
					htmlForm += Template.replace(tempForm, { child: { fields: htmlField, options: htmlOptions } });
				});
				var htmlFoot = { left: '', right: '' };
				sui.findChild('footer', function () {
					this.findChild('options', function () {
						this.findChild('option', function () {
							var attr = this.attr();
							htmlFoot[attr.side || 'left'] += this.toHTML('auth', 'option', { class: attr.class, data: attr.data, attr: attr.attr, label: this.content() }, Template.get);
						});
					});
				});
				htmlAuth = Template.replace(htmlAuth, { child: { logo: htmlLogo, screen: htmlScreen, system: htmlSystem, forms: htmlForm, footleft: htmlFoot.left, footright: htmlFoot.right } });
				return htmlAuth;
			},
			panel: {
				panel: function (sui) {
					if (sui.nodeName != 'panel') return '';
					setup.target = setup.target || $('#suiBody'); // força o target
					setup.placement = setup.placement || 'prepend'; // força o placement
					var ui = {}, html = {};
					var attr;
					sui.findChild(function () {
						if (this.nodeName == 'header') ui.header = this;
						else if (this.nodeName == 'tabs') ui.tabs = this;
						else if (this.nodeName == 'sidemenu') {
							ui.aside = {};
							var attr = this.attr('class:place');
							if (attr == 'left' || !attr) ui.aside.left = this;
							else if (attr == 'right') ui.aside.right = this;
						}
					});
					html.body = sui.toHTML('panel', 'header', 'top', Template.get);
					if (ui.tabs) html.body += sui.toHTML('panel', 'tab', 'bar', Template.get);
					if (ui.aside) html.aside = { left: {}, right: {} };
					if (ui.aside && ui.aside.left) Components.libs.panel.aside('left', html, ui);
					Components.libs.panel.main(html, ui);
					if (ui.aside && ui.aside.right) Components.libs.panel.aside('right', html, ui);
					return html.body;
				},
				main: function (html, ui) {
					html.main = Template.get('panel', 'main', 'container');
					if (ui.header) {
						html.header = {};
						var data = { child: { logo: Components.libs.logo(ui.header) } };
						html.header.container = ui.header.toHTML('panel', 'header', 'main', data, Template.get);
						html.header.tools = '';
						ui.header.findChild('tools', function () {
							html.header.tool = this.toHTML('panel', 'header', 'tools', Template.get);
							html.header.toolitems = '';
							this.findChild('tool', function () {
								html.header.toolitems += this.toHTML('panel', 'header', 'toolitem', Template.get);
							});
							html.header.tools += Template.replace(html.header.tool, { child: { items: html.header.toolitems } });
						});
						html.header.container = Template.replace(html.header.container, { child: { tools: html.header.tools } });
					}
					if (ui.tabs) {
						html.tabs = {};
						html.tabs.right = '';
						html.tabs.container = ui.tabs.toHTML('panel', 'tab', 'container', Template.get);
						html.tabs.groups = { left: '', right: '' };
						ui.tabs.findChild('group', function () {
							var side = this.attr('class:place') || 'left';
							html.tabs.group = this.toHTML('panel', 'tab', 'group', data, Template.get);
							html.tabs.items = '';
							this.findChild('item', function () {
								html.tabs.items += this.toHTML('panel', 'tab', 'item', Template.get);
							});
							html.tabs.groups[side] += Template.replace(html.tabs.group, { child: { items: html.tabs.items } });
						});
						html.tabs.container = Template.replace(html.tabs.container, { child: { groupsleft: html.tabs.groups.left, groupsright: html.tabs.groups.right } });
					}
					html.body += Template.replace(html.main, {
						child: {
							header: html.header.container,
							tabs: html.tabs.container,
							context: Template.get('panel', 'context')
						}
					});
				},
				aside: function (aside, html, ui) {
					var aui = ui.aside[aside];
					var ahtml = html.aside[aside];
					var qtblock = 0;
					ahtml.content = aui.toHTML('panel', 'aside', 'left', Template.get);
					if (aside == 'left') ahtml.logo = Components.libs.logo(ui.header);
					ahtml.navs = '';
					ahtml.navtoolsitems = '';
					ahtml.navlistitems = '';
					aui.findChild('nav', function () {
						var suiNav = this;
						suiNav.attr('data:tip', suiNav.attr('data:tip') || suiNav.attr('label:name'));
						ahtml.navtoolsitems += suiNav.toHTML('panel', 'aside', 'navtools', 'item', Template.get);
						ahtml.blockitems = '';
						ahtml.blocks = '';
						suiNav.findChild(function () {
							ahtml.groups = '';
							ahtml.items = '';
							if (this.nodeName == 'block') {
								qtblock++;
								var suiBlock = this;
								if (suiBlock.attr('class:icon')) {
									suiBlock.attr('data:tip-name', suiBlock.attr('label:name'));
									suiBlock.attr('data:tip', suiBlock.attr('label:description'));
									ahtml.blockitems += suiBlock.toHTML('panel', 'aside', 'nav', 'blockitem', Template.get);
									suiBlock.removeAttribute('data:tip-name');
									suiBlock.removeAttribute('data:tip');
								}
								ahtml.block = suiBlock.toHTML('panel', 'aside', 'nav', 'block', Template.get);
								suiBlock.findChild(function () {
									if (this.nodeName == 'group') {
										var suiGroup = this;
										ahtml.group = suiGroup.toHTML('panel', 'aside', 'nav', 'group', Template.get);
										ahtml.items = '';
										suiGroup.findChild('item', function () {
											var htmlItem = Components.libs.panel.navitem(this);
											var htmlSubitems = '';
											this.findChild('subitem', function () {
												htmlSubitems += Components.libs.panel.navsubitem(this);
											});
											ahtml.items += Template.replace(htmlItem, { child: { subitems: htmlSubitems } });
										});
										suiGroup.findChild('empty', function () {
											ahtml.items += this.toHTML('empty', { child: { html: this.content() } }, Template.get);
										});
										suiGroup.findChild('html', function () {
											ahtml.items += Components.libs.html(this);
										});
										ahtml.groups += Template.replace(ahtml.group, { child: { items: ahtml.items } });
									} else if (this.nodeName == 'html') {
										ahtml.groups += Components.libs.html(this);
									}
								});
								ahtml.blocks += Template.replace(ahtml.block, { child: { groups: ahtml.groups } });
							} else if (this.nodeName == 'html') {
								ahtml.blocks += Components.libs.html(this);
							}
						});
						if (qtblock === 1) suiNav.attr('class:qtblock','only-one');
						ahtml.nav = suiNav.toHTML('panel', 'aside', 'nav', 'container', Template.get);
						ahtml.navs += Template.replace(ahtml.nav, { child: { blocks: ahtml.blocks, blockitems: ahtml.blockitems } });
					});
					ahtml.navtools = Template.get('panel', 'aside', 'navtools', 'container', { child: { items: ahtml.navtoolsitems } });
					ahtml.content = Template.replace(ahtml.content, {
						child: {
							headerlogo: ahtml.logo,
							navtools: ahtml.navtools,
							navs: ahtml.navs
						}
					});
					html.body += ahtml.content;
				},
				navitem: function (sui) {
					var htlmLabels = '';
					var suiItem = sui;
					var description = '';
					var abbr = suiItem.attr('label:abbr');
					var image = suiItem.attr('image:cover') || suiItem.attr('style:image');
					var avatar = suiItem.attr('image:avatar') || suiItem.attr('image:logo');
					var minicon = suiItem.attr('icon:small') || suiItem.attr('icon:minicon') || suiItem.attr('link:minicon');
					var title = suiItem.attr('label:title') || suiItem.attr('link:name') || suiItem.attr('link:title');
					var label = (suiItem.attr('time:ago')) ? suiItem.content() || suiItem.attr('label:label') || suiItem.attr('label:name') : '';
					var desc = (suiItem.attr('time:ago')) ? $.timeagoHTML(suiItem.attr('time:ago')) : suiItem.attr('label:description') || suiItem.attr('label:desc') || suiItem.content();
					suiItem.attr('hasabbr', abbr ? 'has-abbr' : '');
					suiItem.attr('hasimage', image ? 'has-image' : '');
					suiItem.attr('hasavatar', avatar ? 'has-avatar' : '');
					var bg = suiItem.attr('label:background') || suiItem.attr('label:bgcolor');
					var cl = suiItem.attr('label:color');
					if (abbr) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'abbr', content: abbr, style: (bg?'background-color:'+bg+';':'')+(cl?'color:'+cl+';':'') }, Template.get);
					if (image) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'image', content: '', style: 'background-image:url(\'' + $.trim(image) + '\');' }, Template.get);
					if (avatar) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'avatar', content: '', style: 'background-image:url(\'' + $.trim(avatar) + '\');' }, Template.get);
					if (minicon) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'minicon ' + minicon, content: '', style: (bg?'background-color:'+bg+';':'')+(cl?'color:'+cl+';':'') }, Template.get);
					if (title) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'title', content: title }, Template.get);
					if (label) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'label', content: label }, Template.get);
					if (desc) htlmLabels += suiItem.toHTML('panel', 'aside', 'nav', 'label', { class: 'description', content: desc }, Template.get);
					return suiItem.toHTML('panel', 'aside', 'nav', 'item', { child: { labels: htlmLabels } }, Template.get);
				},
				navsubitem: function (sui) {
					var htlmLabels = '';
					var suiItem = sui;
					var label = suiItem.content() || suiItem.attr('label:label') || suiItem.attr('label:name') || suiItem.attr('link:name') || suiItem.attr('link:title');
					return suiItem.toHTML('panel', 'aside', 'nav', 'subitem', { label: label }, Template.get);
				}
			},
			common: {
				droplist: function (sui) {
					var htmlOption = '';
					if (sui.nodeName == 'list') {
						sui.findChild('option', function () {
							var suiOption = this;
							var attr = suiOption.attr() || {};
							htmlOption += suiOption.toHTML('droplist', 'option', 'simple', {
								selected: attr.selected === 'true' || attr.selected === true || attr.selected === 'selected' ? 'selected' : '',
								icon: attr.icon ? (attr.icon.indexOf('icon-') > -1 ? attr.icon : 'icon-' + attr.icon) : '',
								value: attr.value || suiOption.content(),
								label: suiOption.content() || attr.value
							}, Template.get);
						}, function () {
							htmlOption = sui.toHTML('droplist', 'option', 'empty', { label: 'Não ha opções para escolher.' }, Template.get);
						});
					} else if (sui.nodeName == 'context') {
						sui.findChild('item', function () {
							var suiOption = this;
							var attr = suiOption.attr() || {};
							htmlOption += suiOption.toHTML('droplist', 'option', 'simple', {
								icon: attr.icon ? (attr.icon.indexOf('icon-') > -1 ? attr.icon : 'icon-' + attr.icon) : '',
								label: attr['label:name'] || suiOption.content() || attr.value
							}, Template.get);
						});
					} else if (sui.nodeName == 'header') {
						sui.findChild('column', function () {
							var suiColumn = this;
							var attr = suiColumn.attr();
							var hd = {
								icon: 'icon-0',
								value: attr['data:name'],
								label: attr['label:name'] || suiColumn.content()
							};
							if (hd.label) {
								htmlOption += suiColumn.toHTML('droplist', 'option', 'simple', hd, Template.get);
							}
						});
					}
					var attr = sui.attr() || {};
					return Template.get('droplist', 'list', attr.type || 'simple', {
						listpos: attr.listpos || '',
						label: attr.label || 'Selecione...',
						child: {
							toolstop: (attr.toolstop) ? Template.get('droplist', 'tools', 'top', attr.toolstop, { placeholder: 'Pesquise uma opção...' }) : '',
							options: htmlOption,
							toolsbottom: (attr.toolsbottom) ? Template.get('droplist', 'tools', 'bottom', attr.toolsbottom) : ''
						}
					});
				},
				button: function (sui) {
					var suiButton = sui,
						htmlList = '',
						htmlCode = '',
						jConfirm;
					suiButton.findChild('list', function () {
						suiButton.attr('class:hasdrop', 'hasdroplist');
						htmlList = Components.libs.common.droplist(this);
					}, function () {
						if (suiButton.attr('class:type') == 'sort') {
							sui.closest('widget').find('header', function () {
								suiButton.attr('class:hasdrop', 'hasdroplist');
								htmlList = Components.libs.common.droplist(this);
							});
						} else {
							suiButton.findChild('confirm', function () {
								jConfirm = Components.libs.confirmg(this);
								//jConfirm = this.attr();
								this.findChild('button', function () {
									jConfirm.button = jConfirm.button || [];
									var lk = {}, at = {};
									$.each(this.attr(), function (k, v) {
										if (k.indexOf('link:') > -1) lk[k.replace('link:', '')] = v;
										else at[k] = v;
									});
									at.link = lk;
									jConfirm.button.push(at);
								});
							});
							htmlCode = $.suiEvent(suiButton);
						}
					});
					var attr = suiButton.attr();
					if (attr['class:icon']) suiButton.attr('data:icon', attr['class:icon']);
					if (attr['label:name'] && !attr['attr:title']) suiButton.attr('attr:alt', attr['label:name']);
					if (attr['data:tip']){
						suiButton.attr('tip:text',attr['data:tip']);
						suiButton.removeAttribute('data:tip');
					}
					if (jConfirm) suiButton.attr('link:confirm', JSON.stringify(jConfirm));
					if (sui.parentNode.nodeName == 'group') {
						var labelName = suiButton.content() && !suiButton.attr('label:name') && !suiButton.attr('class:icon') ? suiButton.content() : (suiButton.attr('label:name') ? '<span>' + suiButton.attr('label:name') + '</span>' : '');
						return suiButton.toHTML('toolbar', 'button', {
							label: { name: labelName },
							child: { list: htmlList, code: htmlCode }
						}, Template.get);
					} else {
						return suiButton.toHTML('wg', 'form', 'button', {
							label: { name: suiButton.content() || suiButton.attr('label:name') || '' },
							class: { type: suiButton.attr('class:type') },
							child: { list: htmlList }
						}, Template.get);
					}
				},
				toolbar: function (sui) {
					if (sui.nodeName != 'toolbar') return '';
					var htmlBar = sui.toHTML('toolbar', 'container', Template.get),
						htmlTool = '';
					sui.findChild(function () {
						if (this.nodeName == 'tools'){
							var suiTool = this,
								tempTool = suiTool.toHTML('toolbar', 'tool', Template.get),
								htmlGroup = '';
							suiTool.findChild('group', function () {
								var suiGroup = this,
									tempGroup = suiGroup.toHTML('toolbar', 'group', Template.get),
									htmlButton = '';
								suiGroup.findChild('button', function () {
									htmlButton += Components.libs.common.button(this);
								});
								htmlGroup += Template.replace(tempGroup, { child: { buttons: htmlButton } });
							});
							htmlTool += Template.replace(tempTool, { child: { groups: htmlGroup } });
						} else if (this.nodeName == 'html'){
							htmlTool += Components.libs.html(this);
						}
					});
					return Template.replace(htmlBar, { child: { tools: htmlTool } });
				},
				widget: function (sui) {
					if (sui.nodeName != 'widget') return '';
					var wgid = sui.attr('attr:id');
					var wgClass = [];
					if (wgid) {
						var wgDom = $('#' + wgid);
						if (wgDom.length) {
							wgClass = wgDom.attr('class').replace(/disable|enable|readonly|selecte|active/,'').replace(/\s\s+/g, ' ').split(" ");
						}
					}
					var htmlWidget = sui.toHTML('widget', 'container', (wgClass.length ? { class: { mode: wgClass[2], block: wgClass.slice(3).join(" ") } } : null), Template.get),
						htmlChild = '';
					sui.findChild('title', function () {
						var suiTitle = this,
							tempTitle = suiTitle.toHTML('widget', 'title', 'container', Template.get),
							htmlIcon = '',
							htmlBadge = '',
							htmlLabel = '';
						suiTitle.findChild('icon', function () {
							var suiIcon = this;
							var icon = suiIcon.attr('name') || suiIcon.content();
							htmlIcon += suiIcon.toHTML('widget', 'title', 'icon', { icon: { name: icon.indexOf('icon-') > -1 ? icon : 'icon-' + icon } }, Template.get);
						}, function () {
							var icon = suiTitle.attr('class:icon') || suiTitle.attr('icon:icon');
							if (icon) htmlIcon += suiTitle.toHTML('widget', 'title', 'icon', { icon: { name: icon.indexOf('icon-') > -1 ? icon : 'icon-' + icon } }, Template.get);
						});
						suiTitle.findChild('badge', function () {
							var suiBadge = this;
							htmlBadge += suiBadge.toHTML('widget', 'title', 'badge', Template.get);
						}, function () {
							var badg = suiTitle.attr('value:badge');
							if (badg) htmlBadge += suiTitle.toHTML('widget', 'title', 'badge', { value: { number: badg } }, Template.get);
						});
						suiTitle.findChild('label', function () {
							var suiLabel = this;
							htmlLabel += suiLabel.toHTML('widget', 'title', 'label', { label: { name: suiLabel.attr('name') || suiLabel.content() } }, Template.get);
						}, function () {
							var lanam = suiTitle.attr('label:name') || suiTitle.attr('label:title');
							var lades = suiTitle.attr('label:description') || suiTitle.attr('label:desc') || suiTitle.attr('label:subname') || suiTitle.attr('label:subtitle');
							if (lanam || lades) htmlLabel += suiTitle.toHTML('widget', 'title', 'label', { label: { name: lanam || '', description: lades || '' } }, Template.get);
						});
						tempTitle = Template.replace(tempTitle, {
							child: {
								icon: htmlIcon,
								badge: htmlBadge,
								label: htmlLabel,
							}
						});
						suiTitle.find('toolbar', function () {
							var suiBar = this;
							tempTitle = Template.replace(tempTitle, { child: { toolbar: Components.libs.common.toolbar(suiBar, 'widget') } });
						}, function () {
							tempTitle = Template.replace(tempTitle, { child: { toolbar: '' } });
						});
						htmlChild += tempTitle;
					});

					sui.findChild('toolbar', function () {
						var suiBar = this;
						htmlChild += Components.libs.common.toolbar(suiBar, 'widget');
					});
					sui.findChild('helper', function () {
						var suiHelper = this;
						htmlChild += suiHelper.toHTML('widget', 'helper', { child: { helper: suiHelper.content() } }, Template.get);
					});
					sui.findChild('finder', function () {
						var suiFinder = this;
						htmlChild += suiFinder.toHTML('widget', 'finder', { child: { finder: Components.libs.common.finder(suiFinder) } }, Template.get);
					});
					sui.findChild('tip', function () {
						var suiTip = this;
						htmlChild += Components.libs.tip(suiTip);
					});
					sui.findChild('html', function () {
						var suiTip = this;
						htmlChild += Components.libs.html(suiTip);
					});
					htmlChild += '@{child:area}';
					/*
					sui.findChild('area',function(){
						var suiArea = this;
						htmlChild += suiArea.toHTML('widget','area',Template.get);
					});
					*/
					sui.findChild('floatbox', function () {
						var suiBox = this;
						htmlChild += Components.libs.floatbox(suiBox);
					});
					sui.findChild('on', function () {
						var suiOn = this;
						var attr = suiOn.attr();
						var content = ''
						suiOn.findChild(function () {
							if (this.nodeName == 'linkdata'){
								var linkdata = this.getAttr();
								linkdata = linkdata.link || linkdata;
								content += 'var linkdata = '+JSONX.stringify(linkdata)+";\n";
							} else if (this.nodeName == 'script'){
								content += this.content();
							}
						},function(){
							content += suiOn.content();
						});
						htmlChild += sui.toHTML('code', { attr: { type:'event', on:'widget:'+attr.event}, value: content }, Template.get);
					});
					return Template.replace(htmlWidget, { child: { content: htmlChild } });
				},
				finder: function (sui) {
					var htmlSets = '';
					var htmlBtn = '';
					sui.findChild(function () {
							 if (this.nodeName == 'filterset') htmlSets += Components.libs.widget.form.filterset(this);
						else if (this.nodeName == 'fieldset') htmlSets += Components.libs.widget.form.fieldset(this);
						else if (this.nodeName == 'buttonset') htmlBtn += Components.libs.widget.form.buttonset(this);
					});
					return Template.replace(sui.toHTML('wg', 'form', 'stage', {child:{sets:htmlSets}} ,Template.get))+htmlBtn;
				}
			},
			sector: {
				sector: function (sui) {
					if (sui.nodeName != 'sector') return '';
					var attr = sui.attr();
					var htmlSector = sui.toHTML('sector', 'container', { data: { sector: attr['data:sector'] || attr['attr:id'] } }, Template.get);
					var htmlChild = '';
					sui.findChild('tab', function () {
						var suiChild = this;
						htmlChild = suiChild.toHTML('sector', 'tab', {
							class: { icon: attr['class:icon'], unclosable: sui.attr('class:unclosable') || attr['class:unclosable'] ? 'unclosable' : '' },
							data: { sector: attr['data:sector'] || attr['attr:id'] },
							label: { name: attr['label:label'] || attr['label:name'] || attr['label:title'] }
						}, Template.get);
					});
					sui.findChild('title', function () {
						var suiChild = this;
						htmlChild += suiChild.toHTML('sector', 'title', {
							class: { icon: sui.attr('class:icon') || suiChild.attr('class:icon') || attr['class:icon'], hidden: suiChild.attr('class:hidden') },
							data: { sector: sui.attr('data:sector') || attr['data:sector'] || attr['attr:id'] },
							label: { title: sui.attr('label:title') || sui.attr('label:name') || attr['label:title'] || attr['label:name'] }
						}, Template.get);
						suiChild.findChild('viewnav', function () {
							var suiNav = this;
							var data = {
								custom: suiNav.attr('class:custom') == 'true' || suiNav.attr('class:custom') === 'custom' || suiNav.attr('class:custom') === true ? 'custom' : '',
							};
							this.findChild('prev', function () {
								htmlChild = Template.replace(htmlChild, { child: { prev: this.toHTML('sector', 'viewnav', { class: { direction: 'prev', custom: data.custom, icon: 'icon-left' } }, Template.get) } });
							});
							this.findChild('next', function () {
								htmlChild = Template.replace(htmlChild, { child: { next: this.toHTML('sector', 'viewnav', { class: { direction: 'next', custom: data.custom, icon: 'icon-right' } }, Template.get) } });
							});
						});
					});
					htmlSector = Template.replace(htmlSector, { child: { title: htmlChild } });
					sui.findChild('views', function () {
						var suiChild = this;
						htmlSector = Template.replace(htmlSector, {
							child: {
								views: Render.full(suiChild)
							}
						});
					});
					return htmlSector;
				},
			},

			view: {
				view: function (sui) {
					if (sui.nodeName != 'view') return '';
					var attr = sui.attr();
					if (!attr['data:name']) {
						sui.findChild('tab', function () {
							sui.attr('data:name', this.attr('label:name'));
						});
					}
					sui.findChild('cover', function () {
						sui.attr('class:covered', 'covered');
					}, function () {
						sui.removeAttribute('class:covered');
					});
					return sui.toHTML('view', 'container', Template.get);
				},
				cover: function (sui) {
					if (sui.nodeName != 'cover') return '';
					var code = '';
					var image = sui.attr('image');
					sui.findChild('json', function () {
						var suiJson = this;
						code = Components.libs.code(suiJson);
					});
					return sui.toHTML('view', 'cover', { child: { json: code }, image: image, bg: (image ? 'bg' : '') }, Template.get);
				},
				tab: function (sui) {
					if (sui.nodeName != 'tab') return '';
					var viewId = sui.parentNode.attr('attr:id'), childTitle = '';
					if (sui.attr('label:key')) {
						childTitle += sui.toHTML('view', 'tab', 'key', Template.get);
					}
					childTitle += sui.toHTML('view', 'tab', 'text', Template.get);
					return sui.toHTML('view', 'tab', 'container', { custom: { view: viewId }, child: { title: childTitle } }, Template.get);
				},
				toolbar: function (sui) {
					if (sui.nodeName != 'toolbar') return '';
					return Components.libs.common.toolbar(sui, 'view');
				},
			},
			content: function (sui) {
				if (sui.nodeName != 'content') return '';
				return sui.toHTML('content', Template.get);
			},
			layout: function (sui) {
				var madewith = {
					'br':'Feito com <span style="font-size:1.35em">&#9829;</span> pela SourceLab',
					'en':'Coded with <span style="font-size:1.35em">&#9829;</span> by SourceLab'
				}
				if (sui.nodeName != 'layout') return '';
				if (sui.attr('class:type') == 'footer') {
					var label = {
						name: sui.attr('label:name') || '--',
						madewith: sui.attr('label:madewith') || madewith[sui.attr('label:madewithlang')||'br'],
						framework: sui.attr('label:framework') || Device.framework.name,
						version: sui.attr('label:version') || Device.framework.version + '.' + Device.framework.subversion,
					};
					return sui.toHTML('layout', 'footer', { label: label }, Template.get);
				}
				return sui.toHTML('layout', 'normal', Template.get);
			},
			html: function (sui) {
				if (sui.nodeName != 'html') return '';
				return '<!-- SourceUI Parsed HTML -->' + "\n" + sui.content() + "\n" + '<!-- Parsed end -->';
			},
			widget: {
				datagrid: {
					header: function (sui, headerData, orderData) {
						if (sui.nodeName != 'header') return '';
						var suiHeader = sui,
							colidx = 0,
							htmlHeader = suiHeader.toHTML('wg', 'datagrid', 'header', 'container', Template.get),
							htmlColumn = '';
						headerData.totalheadercols = suiHeader.countChild('column');
						suiHeader.findChild('column', function () {
							colidx++;
							var classOrd = '';
							if (this.attr('data:name') == orderData.by) {
								classOrd = 'order ' + orderData.ord;
							} else {
								classOrd = '';
							}
							var suiColumn = this,
								attr = suiColumn.attr(),
								hd = headerData[colidx] = {
									value: { index: colidx },
									class: { type: attr['class:type'] || '', is: attr['class:is'] || '', order: classOrd || attr['class:order'] || '' },
									attr: { title: attr['label:name'] || suiColumn.content() },
									label: { name: attr['label:name'] || suiColumn.content() }
								};
							if (hd.class.type != 'key' && hd.class.type != 'icon' && hd.class.type != 'image') {
								hd.drag = Template.get('drag');
							}
							htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'header', 'column', hd, Template.get);
						});
						return Template.replace(htmlHeader, { child: { column: htmlColumn } });
					},
					line: function (sui, lineseq, headerData) {
						if (sui.nodeName != 'line') return '';
						if (!headerData.error) {
							var suiLine = sui,
								colidx = 0,
								htmlLine = suiLine.toHTML('wg', 'datagrid', 'line', 'container', { value: { seq: lineseq } }, Template.get),
								htmlColumn = '',
								htmlSwiper = '',
								htmlContext = '';
							headerData.totallinecols = headerData.totallinecols || suiLine.countChild('column');
							if (headerData.totalheadercols === headerData.totallinecols) {
								suiLine.findChild('column', function () {
									colidx++;
									var suiColumn = this,
										attr = suiColumn.attr(),
										hd = headerData[colidx],
										data = {
											value: { tag: 'div', index: colidx },
											style: {},
											class: hd.class ? { type: hd.class.type+' '+suiColumn.attr('class:type'), is: hd.class.is, order: hd.class.order } : {},
											label: { content: suiColumn.content() },
											prop: { color: suiColumn.attr('prop:color'), prefix: suiColumn.attr('prop:prefix'), original: suiColumn.attr('prop:original') }
										};
									//console.log(suiColumn,suiColumn.content(),$(suiColumn).text());
									if (hd.class) {
										if (hd.class.type == 'key') { data.label.content = '<small class="icon-key3">' + data.label.content + '</small>'; }
										else if (hd.class.type == 'image') { data.style['background-image'] = 'url(\'' + $.trim(data.label.content) + '\')'; data.label.content = ''; }
										else if (hd.class.type == 'thumb') { data.style['background-image'] = 'url(\'' + $.trim(data.label.content) + '\')'; data.label.content = ''; }
										else if (hd.class.type == 'icon') { data.class.icon = data.label.content; data.label.content = ''; if (data.prop.color) { data.style['background-color'] = data.style.color = data.prop.color; } }
										else if (hd.class.type == 'abbr') { data.style['background-color'] = data.prop.color || '#00000088'; }
										else if (hd.class.type == 'ordinary') { data.style['background-color'] = data.prop.color || '#FFF'; }
										else if (hd.class.type == 'rounded') { data.value.tag = 'mark'; data.label.content = '<span' + ((data.prop.color) ? ' style="background:' + $.colorfy(data.label.content, data.prop.color) + '"' : '') + '>' + data.label.content + '</span>'; }
										else if (hd.class.type == 'filled') { data.value.tag = 'mark'; data.style.background = $.colorfy(data.label.content, data.prop.color); }
										else if (hd.class.type == 'number') { data.style.color = $.colorfy(data.label.content, data.prop.color); }
										else if (hd.class.type == 'money') { data.style.color = $.colorfy(data.label.content, data.prop.color); data.label.content = $.toMoney(data.label.content, data.prop.prefix); }

										if (hd.class.type == 'description') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'description', data, Template.get);
										else if (hd.class.type == 'image') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'image', data, Template.get);
										else if (hd.class.type == 'thumb') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'thumb', data, Template.get);
										else if (hd.class.type == 'icon') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'icon', data, Template.get);
										else if (hd.class.type == 'abbr') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'abbr', data, Template.get);
										else if (hd.class.type == 'ordinary') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'ordinary', data, Template.get);
										else if (hd.class.type == 'flex') {
											var htmlItem = '';
											suiColumn.findChild('flex', function () {
												var suiFlex = this;
												htmlItem += suiFlex.toHTML('wg', 'datagrid', 'line', 'flex', 'item', { content: suiFlex.content() }, Template.get);
											});
											data.label.content = Template.get('wg', 'datagrid', 'line', 'flex', 'container', { child: { items: htmlItem } });
											htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'column', data, Template.get);
										}
										else if (hd.class.type == 'join') {
											var htmlItem = '', jast = {};
											suiColumn.findChild(function () {
												var suiItem = this, jdata = { class: {}, style: {}, label: { content: suiItem.content() }, prop: { color: suiItem.attr('prop:color') } };
												if (jast.color) jdata.ghost = { color: jast.color };
												else if (jast.image) jdata.ghost = { image: jast.image };
												if (this.nodeName == 'abbr') {
													jdata.style['background-color'] = jdata.prop.color || '#898787';
													jdata.content = jdata.label.content;
													jast = { color: jdata.style['background-color'] };
												} else if (this.nodeName == 'image') {
													jdata.style['background-image'] = 'url(\'' + $.trim(jdata.label.content) + '\')'; jdata.label.content = '';
													jast = { image: jdata.style['background-image'] };
												} else if (this.nodeName == 'icon') {
													jdata.class.icon = jdata.label.content; jdata.label.content = '';
													if (jdata.prop.color) {
														jdata.style['background-color'] = jdata.prop.color;
														jast = { color: jdata.style['background-color'] };
													} else {
														jast = {};
													}
												}
												htmlItem += suiItem.toHTML('wg', 'datagrid', 'line', 'join', this.nodeName, jdata, Template.get);
											});
											data.label.content = Template.get('wg', 'datagrid', 'line', 'join', 'container', { child: { items: htmlItem } });
											htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'column', data, Template.get);
										}
										else htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'column', data, Template.get);
									} else {
										htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'column', data, Template.get);
									}
								});
								suiLine.findChild('swiper', function () {
									var suiSwiper = this;
									htmlSwiper += suiSwiper.toHTML('wg', 'datagrid', 'line', 'swiper', 'action', Template.get);
								});
								htmlSwiper = (htmlSwiper) ? suiLine.toHTML('wg', 'datagrid', 'line', 'swiper', 'container', { child: { actions: htmlSwiper } }, Template.get) : '';
								suiLine.findChild('context', function () {
									htmlContext = Components.libs.common.droplist(this);
								});
								return Template.replace(htmlLine, { child: { column: htmlColumn, context: htmlContext, swiper: htmlSwiper } });
							} else {
								headerData.error = true;
								Console.error({
									mode: 'Parser',
									title: 'Datagrid header',
									content: 'Header columns count (' + headerData.totalheadercols + ') does not match lines columns count (' + headerData.totallinecols + ')'
								});
							}
						}
						return '';
					},
					paginator: function (sui) {
						if (sui.nodeName != 'list') return '';
						var suiList = sui,
							htmlPag = '',
							limit = {
								start: parseInt(sui.attr('data:start')) || 0,
								len: parseInt(sui.attr('data:length')) || 0,
								total: parseInt(sui.attr('data:total')) || 0
							};
						if (limit.total && limit.len) {
							if (sui.attr('default:paginator') == 'buttonDown') {
								var more = 0;
								if (limit.total > limit.len) {
									more = (limit.start + limit.len + limit.len < limit.total) ? limit.len : limit.total - (limit.start + limit.len);
								}
								if (more > 0) htmlPag = suiList.toHTML('wg', 'datagrid', 'paginator', 'buttonDown', { label: { more: more } }, Template.get);
							}
						}
						return htmlPag;
					},
					treeview: function (sui) {
						var suiTree = sui,
							htmlTree = '',
							htmlNodes = '',
							htmlEmpty = '';
						htmlTree = suiTree.toHTML('wg', 'datagrid', 'treeview', 'container', Template.get);
						suiTree.findChild('node', function () {
							htmlNodes += Components.libs.widget.datagrid.treenode(this);
						}, function () {
							suiTree.findChild('empty', function () {
								htmlEmpty += this.toHTML('empty', { child: { html: this.content() } }, Template.get);
							}, function () {
								htmlEmpty += suiTree.toHTML('empty', { child: { html: 'Não há registros' } }, Template.get);
							});
						});
						return Template.replace(htmlTree, { child: { content: htmlEmpty || '<ul>' + htmlNodes + '</ul>' } });
					},
					treenode: function (sui) {
						var suiNode = sui,
							htmlContent = '';
						suiNode.findChild(function () {
							if (this.nodeName == 'label') htmlContent += this.toHTML('wg', 'datagrid', 'treeview', 'label', { child: { content: this.content() } }, Template.get);
							if (this.nodeName == 'children') {
								var suiChild = this;
								suiNode.attr('class:fold', 'fold');
								htmlContent += '<ul>';
								suiChild.findChild('node', function () {
									htmlContent += Components.libs.widget.datagrid.treenode(this);
								});
								htmlContent += '</ul>';
							}
						});
						return suiNode.toHTML('wg', 'datagrid', 'treeview', 'node', { child: { content: htmlContent } }, Template.get);
					},
					list: function (sui) {
						var suiList = sui,
							limit = {
								start: parseInt(sui.attr('data:start')) || 0,
								len: parseInt(sui.attr('data:length')) || 0,
								total: parseInt(sui.attr('data:total')) || 0
							},
							headerData = {},
							orderData = {},
							lineseq = 0;
						var htmlHeader = '';
						var htmlLine = '';
						orderData.by = suiList.attr('data:by') || '';
						orderData.ord = suiList.attr('data:ord') || '';
						suiList.findChild(function () {
							if (this.nodeName == 'header') {
								htmlHeader = Components.libs.widget.datagrid.header(this, headerData, orderData);
							} else if (this.nodeName == 'line') {
								lineseq++;
								htmlLine += Components.libs.widget.datagrid.line(this, lineseq, headerData);
							} else if (this.nodeName == 'linegroup') {
								suiList.attr('class:grouped','grouped');
								var suiGroup = this,
									htmlChild = '';
								suiGroup.findChild('header', function () {
									headerData = {};
									htmlChild += Components.libs.widget.datagrid.header(this, headerData, orderData);
								});
								suiGroup.findChild('line', function () {
									lineseq++;
									htmlChild += Components.libs.widget.datagrid.line(this, lineseq, headerData);
								}, function () {
									suiList.findChild('empty', function () {
										htmlChild += this.toHTML('empty', { child: { html: this.content() } }, Template.get);
									}, function () {
										htmlChild += suiList.toHTML('empty', { child: { html: 'Não há registros' } }, Template.get);
									});
								});
								htmlLine += suiGroup.toHTML('wg', 'datagrid', 'linegroup', { child: { lines: htmlChild } }, Template.get);
							} else if (this.nodeName == 'empty') {
								htmlLine += this.toHTML('empty', { child: { html: this.content() } }, Template.get);
							}
						}, function () {
							htmlLine += suiList.toHTML('empty', { child: { html: 'Lista em branco' } }, Template.get);
						});
						var htmlList = suiList.toHTML('wg', 'datagrid', 'list', { 'default': { paginator: (suiList.attr('default:paginator') && limit.start + limit.len < limit.total ? suiList.attr('default:paginator') : '') } }, Template.get);
						var htmlPag = Components.libs.widget.datagrid.paginator(suiList);
						return Template.replace(htmlList, { child: { content: htmlHeader + htmlLine + htmlPag } });
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							if (this.has('swiper')) this.attr('class:has', 'has-swiper');
							if (this.has('context')) this.attr('class:has', 'has-context');
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var htmlList = '';
							this.findChild(function () {
								if (this.nodeName == 'treeview') htmlList += Components.libs.widget.datagrid.treeview(this);
								else if (this.nodeName == 'tip') htmlList += Components.libs.tip(this);
								else if (this.nodeName == 'fieldset') htmlList += Components.libs.widget.form.fieldset(this);
								else if (this.nodeName == 'list') htmlList += Components.libs.widget.datagrid.list(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				upillow: {
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui);
						var htmlArea = '';
						sui.findChild('setup', function () {
							htmlArea += Components.libs.code(this);
						});
						sui.findChild('area', function () {
							var htmlContent = '';
							htmlArea += this.toHTML('widget', 'area', Template.get);
							this.findChild(function () {
								if (this.nodeName == 'tip') htmlContent += Components.libs.tip(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlContent } });
						});
						htmlArea += $.suiEvent(sui);
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				upload: {
					dragzone: function (sui) {
						return sui.toHTML('wg', 'upload', 'dragzone', 'container', Template.get);
					},
					dashboard: function (sui) {
						return sui.toHTML('wg', 'upload', 'dashboard', 'container', Template.get);
					},
					filelist: function (sui) {
						return sui.toHTML('wg', 'upload', 'filelist', 'container', Template.get);
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui);
						var htmlArea = '';
						sui.findChild('setup', function () {
							htmlArea += Components.libs.code(this);
						});
						sui.findChild('area', function () {
							var htmlContent = '';
							htmlArea += this.toHTML('widget', 'area', Template.get);
							this.findChild(function () {
								if (this.nodeName == 'tip') htmlContent += Components.libs.tip(this);
								else if (this.nodeName == 'html') htmlContent += Components.libs.html(this);
								else if (this.nodeName == 'dragzone') htmlContent += Components.libs.widget.upload.dragzone(this);
								else if (this.nodeName == 'dashboard') htmlContent += Components.libs.widget.upload.dashboard(this);
								else if (this.nodeName == 'filelist') htmlContent += Components.libs.widget.upload.filelist(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlContent } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				summary: {
					info: function (sui) {
						var suiInfo = sui;
						var classIcon = suiInfo.attr('data:icon') || suiInfo.attr('class:icon');
						var htmlInfo = suiInfo.toHTML('wg', 'summary', 'info', {
							class: { icon: classIcon },
							label: { title: suiInfo.attr('label:title') || '', name: suiInfo.attr('label:name') || '' },
							child: { info: suiInfo.content() || '' }
						}, Template.get);
						return htmlInfo;
					},
					counter: function (sui) {
						var suiCounter = sui;
						var valueBadge = suiCounter.attr('value:badge');

						var htmlBadges = '';
						if (valueBadge) {
							htmlBadges += suiCounter.toHTML('wg', 'summary', 'counter', 'badge', {
								value: { badge: valueBadge }
							}, Template.get);
						} else {
							suiCounter.findChild('badge', function () {
								valueBadge = valueBadge || 0;
								var num = this.content() || this.attr('value:badge');
								if (num !== '' && num !== null) {
									htmlBadges += this.toHTML('wg', 'summary', 'counter', 'badge', {
										value: { badge: num }
									}, Template.get);
								}
								valueBadge += num;
							});
						}

						var classIcon = sui.attr('data:icon') || sui.attr('class:icon');
						var classNumber = valueBadge > 0 ? 'positive' : 'negative';
						var classHilited = classIcon && classNumber == 'positive' ? 'hilited' : '';
						var htmlCounter = suiCounter.toHTML('wg', 'summary', 'counter', 'icon', {
							class: { icon: classIcon, hilited: classHilited, number: classNumber },
							label: { title: sui.attr('label:title') || '', name: sui.attr('label:name') || '' }
						}, Template.get);

						return Template.replace(htmlCounter, { child: { badges: htmlBadges } });
					},
					finance: function (sui) {
						var suiFinance = sui,
							htmlFinance = '';
						suiFinance.findChild('account', function () {
							var suiAccount = this;
							var data = { label: { name: suiAccount.attr('label:name') }, class: { icon: suiAccount.attr('class:icon') } };
							suiAccount.findChild(function () {
								var suiChild = this;
								if (this.nodeName == 'balance') {
									data.value = { currency: suiChild.attr('value:currency'), balance: suiChild.attr('value:balance'), percent: suiChild.attr('value:percent') };
									data.label.title = suiChild.attr('label:title');
								} else if (this.nodeName == 'chart') {
									data.data = { type: suiChild.attr('data:type'), json: suiChild.content() };
									data.data.json = '"chart": { "type" : "' + (data.data.type || 'area') + '"},' + data.data.json;
									data.data.json = '{' + data.data.json + '}';
								}
							});
							htmlFinance += suiFinance.toHTML('wg', 'summary', 'finance', 'account', data, Template.get);
						});
						return htmlFinance;
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlList = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'html') htmlList += Components.libs.html(this);
								else if (this.nodeName == 'counter') htmlList += Components.libs.widget.summary.counter(this);
								else if (this.nodeName == 'eventgroup') htmlList += Components.libs.widget.events.group(this);
								else if (this.nodeName == 'finances') htmlList += Components.libs.widget.summary.finance(this);
								else if (this.nodeName == 'information') htmlList += Components.libs.widget.summary.info(this);
								else if (this.nodeName == 'buttonset') htmlList += Components.libs.widget.form.buttonset(this);
								else if (this.nodeName == 'fieldset') htmlList += Components.libs.widget.form.fieldset(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}

				},
				schedule: {
					list: function (sui) {
						var htmlDays = '';
						var days = {};
						sui.findChild(function () {
							if (this.nodeName == 'line') {
								var date = this.attr('data:date');
								days[date] = days[date] || [];
								days[date].push(this);
							}
						});
						if (!$.isEmptyObject(days)) {
							$.each(days, function (date, line) {
								var htmlLines = '';
								var $mmt = moment(date);
								var data = $.extend({
									date: date,
									wday: $mmt.format('ddd'),
									month: $mmt.format('MMM'),
									year: $mmt.format('YYYY')
								}, sui.attr('data'));
								$.each(line, function (k, suiLine) {
									var htmlColumn = '';
									suiLine.findChild('column', function () {
										var suiColumn = this,
											attr = suiColumn.attr(),
											data = {
												style: {},
												class: attr.class ? { type: attr.class.type, is: attr.class.is } : {},
												label: { content: suiColumn.content() },
												prop: { color: suiColumn.attr('prop:color'), prefix: suiColumn.attr('prop:prefix'), original: suiColumn.attr('prop:original') }
											};
										if (attr.class) {
											if (attr.class.type == 'image') { data.style['background-image'] = 'url(\'' + $.trim(data.label.content) + '\')'; data.label.content = ''; }
											else if (attr.class.type == 'icon') { data.class.icon = data.label.content; data.label.content = ''; if (data.prop.color) { data.style['background-color'] = data.style.color = data.prop.color; } }
											else if (attr.class.type == 'abbr') { data.style['background-color'] = data.prop.color || '#898787'; }
											else if (attr.class.type == 'rounded') { data.value.tag = 'mark'; data.label.content = '<span' + ((data.prop.color) ? ' style="background:' + $.colorfy(data.label.content, data.prop.color) + '"' : '') + '>' + data.label.content + '</span>'; }
											else if (attr.class.type == 'filled') { data.value.tag = 'mark'; data.style.background = $.colorfy(data.label.content, data.prop.color); }
											else if (attr.class.type == 'number') { data.style.color = $.colorfy(data.label.content, data.prop.color); }
											else if (attr.class.type == 'money') { data.style.color = $.colorfy(data.label.content, data.prop.color); data.label.content = $.toMoney(data.label.content, data.prop.prefix); }

											if (attr.class.type == 'description') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'description', data, Template.get);
											else if (attr.class.type == 'image') htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'image', data, Template.get);
											else htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'column', data, Template.get);
										} else {
											htmlColumn += suiColumn.toHTML('wg', 'datagrid', 'line', 'column', data, Template.get);
										}
									});
									htmlLines += suiLine.toHTML('wg', 'datagrid', 'line', 'container', { child: { column: htmlColumn } }, Template.get);
								});
								htmlDays += sui.toHTML('wg', 'schedule', 'eventday', { child: { content: htmlLines }, data: data }, Template.get);
							});
						}
						return sui.toHTML('wg', 'datagrid', 'list', { child: { content: htmlDays } }, Template.get);
					},
					filters: function () {

					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui);
						var htmlArea = '';
						var htmlSide = '';
						sui.findChild(function () {
							if (this.nodeName == 'area') {
								htmlArea += this.toHTML('widget', 'area', Template.get);
								var htmlChild = '';
								this.findChild(function () {
									if (this.nodeName == 'html') htmlChild += Components.libs.html(this);
									else if (this.nodeName == 'list') htmlChild += Components.libs.widget.schedule.list(this);
								});
								htmlArea = Template.replace(htmlArea, { child: { area: htmlChild } });
							} else if (this.nodeName == 'sidenav') {
								htmlSide += this.toHTML('widget', 'sidenav', Template.get);
								var htmlChild = '';
								this.findChild(function () {
									if (this.nodeName == 'calendar') htmlChild += this.toHTML('wg', 'schedule', 'sidenav', 'calendar', Template.get);
									else if (this.nodeName == 'filters') htmlChild += Components.libs.widget.schedule.filters(this);
								});
								htmlSide = Template.replace(htmlSide, { child: { area: htmlChild } });
							}
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea + htmlSide } });
					}
				},
				calendar: {
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlList = '';
							suiArea.findChild(function () {
								var suiChild = this;
								if (this.nodeName == 'html') htmlList += Components.libs.html(this);
								else if (suiChild.nodeName == 'calendar') {
									var json = '';
									suiChild.findChild('schedules', function () {
										json = this.content();
									});
									htmlList += suiChild.toHTML('wg', 'calendar', { child: { json: json } }, Template.get);
								} else if (this.nodeName == 'fieldset') htmlList += Components.libs.widget.form.fieldset(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				events: {
					title: function (sui) {
						return sui.toHTML('wg', 'summary', 'events', 'title', { title: sui.content() }, Template.get);
					},
					group: function (sui) {
						var suiEventgroup = sui,
							htmlEventgroup = suiEventgroup.toHTML('wg', 'summary', 'events', 'group', Template.get),
							htmlEvent = '';
						suiEventgroup.findChild('event', function () {
							var suiEvent = this;
							htmlEvent += suiEvent.toHTML('wg', 'summary', 'events', 'event', Template.get);
						}, function () {
							suiEventgroup.findChild('empty', function () {
								htmlEvent += this.toHTML('empty', { child: { html: this.content() || 'Nada agendado para a data' } }, Template.get);
							}, function () {
								htmlEvent += suiEventgroup.toHTML('empty', { child: { html: 'Nada agendado para a data' } }, Template.get);
							});

						});
						return Template.replace(htmlEventgroup, { child: { event: htmlEvent } });
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlList = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'html') htmlList += Components.libs.html(this);
								else if (this.nodeName == 'title') htmlList += Components.libs.widget.events.title(this);
								else if (this.nodeName == 'eventgroup') htmlList += Components.libs.widget.events.group(this);
								else if (this.nodeName == 'empty') htmlList += this.toHTML('empty', { child: { html: this.content() || 'Não há agendamentos' } }, Template.get);
								else if (this.nodeName == 'fieldset') htmlList += Components.libs.widget.form.fieldset(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				form: {
					filter: function (sui) {
						var suiFilter = sui,
							htmlFilter = '',
							htmlList = '';
						suiFilter.findChild('list', function () {
							suiFilter.attr('class:hasdrop', 'hasdroplist');
							htmlList += Components.libs.common.droplist(this);
							htmlFilter += suiFilter.toHTML('wg', 'form', 'filter', { label: { value: sui.attr('data:placeholder') || 'Selecione...' } }, Template.get);
						}, function(){
							htmlFilter += suiFilter.toHTML('wg', 'form', 'filter', { label: { value: sui.attr('label:value') || suiFilter.content() } }, Template.get);
						});
						return Template.replace(htmlFilter, { child: { list: htmlList } });
					},
					filterset: function (sui) {
						var suiFilterset = sui,
							htmlFilter = '',
							htmlFilterset = suiFilterset.toHTML('wg', 'form', 'filterset', Template.get);
						suiFilterset.findChild('filter', function () {
							htmlFilter += Components.libs.widget.form.filter(this);
							/*
							var suiFilter = this;
							htmlFilter += suiFilter.toHTML('wg', 'form', 'filter', { label: { content: suiFilter.content() } }, Template.get);
							*/
						});
						return Template.replace(htmlFilterset, { child: { filters: htmlFilter } });
					},
					fieldset: function (sui) {
						var suiFieldset = sui,
							htmlField = '',
							htmlFieldset = suiFieldset.toHTML('wg', 'form', 'fieldset', Template.get);
						suiFieldset.findChild(function () {
							if (this.nodeName == 'field') htmlField += Components.libs.widget.form.field(this);
							else if (this.nodeName == 'fieldgroup') htmlField += Components.libs.widget.form.field(this);
							else if (this.nodeName == 'buttonset') htmlField += Components.libs.widget.form.buttonset(this);
							else if (this.nodeName == 'tip') htmlField += Components.libs.tip(this);
						});
						return Template.replace(htmlFieldset, { child: { fields: htmlField } });
					},
					field: function (sui) {
						var suiField = sui;
						var Field = new sourceui.parserField(suiField);
						var html = Field.methods.getTemplate();
						return html || '';
					},
					buttonset: function (sui) {
						var suiButtonset = sui,
							htmlButton = '',
							htmlButtonset = suiButtonset.toHTML('wg', 'form', 'buttonset', Template.get);
						suiButtonset.findChild(function () {
							htmlButton += Components.libs.widget.form.button(this);
						});
						return Template.replace(htmlButtonset, { child: { buttons: htmlButton } });
					},
					button: function (sui) {
						return Components.libs.common.button(sui);
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlList = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'html') htmlList += Components.libs.html(this);
								else if (this.nodeName == 'fieldset') htmlList += Components.libs.widget.form.fieldset(this);
								else if (this.nodeName == 'field') htmlList += Components.libs.widget.form.field(this);
								else if (this.nodeName == 'fieldgroup') htmlList += Components.libs.widget.form.field(this);
								else if (this.nodeName == 'buttonset') htmlList += Components.libs.widget.form.buttonset(this);
								else if (this.nodeName == 'button') htmlList += Components.libs.widget.form.button(this);
								else if (this.nodeName == 'tip') htmlList += Components.libs.tip(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				report: {
					/*
					stack : function(sui){
						var htmlContent = sui.content();
						return sui.toHTML('wg', 'report', 'stack', { child: { content: htmlContent }}, Template.get);
					},
					*/
					block : function(sui){
						var htmlContent = '';
						htmlContent = sui.content();
						if (sui.attr('name') && !sui.attr('data:name')) sui.attr('data:name',sui.attr('name'));
						else if (!sui.attr('name') && sui.attr('data:name')) sui.attr('name',sui.attr('data:name'));
						if (sui.attr('type') && !sui.attr('data:type')) sui.attr('data:type',sui.attr('type'));
						else if (!sui.attr('type') && sui.attr('data:type')) sui.attr('type',sui.attr('data:type'));
						if (!sui.attr('data:edition') && sui.attr('data:position')) sui.attr('style',sui.attr('data:position'));
						if (sui.attr('data:background')) sui.attr('style','background:'+sui.attr('data:background')+'; '+sui.attr('style'));
						if (sui.attr('data:bordercolor')||sui.attr('data:borderwidth')) sui.attr('style','border: solid '+(sui.attr('data:borderwidth')||'2px')+'px '+(sui.attr('data:bordercolor')||'#333333')+'; '+sui.attr('style'));
						return sui.toHTML('wg', 'report', 'block', { child: { content: htmlContent }},  Template.get);
					},
					col : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'block') htmlContent += Components.libs.widget.report.block(this);
						});
						if (sui.attr('data:style')) sui.attr('style',sui.attr('data:style'));
						return sui.toHTML('wg', 'report', 'col', { child: { content: htmlContent }},  Template.get);
					},
					line : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'col') htmlContent += Components.libs.widget.report.col(this);
						});
						return sui.toHTML('wg', 'report', 'line', { child: { content: htmlContent }},  Template.get);
					},
					container : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'line') htmlContent += Components.libs.widget.report.line(this);
						});
						if (sui.attr('data:style')) sui.attr('style',sui.attr('data:style'));
						return sui.toHTML('wg', 'report', 'container', { child: { content: htmlContent }},  Template.get);
					},
					stacker : function(sui){
						var htmlContent = '';
						if (sui.attr('type') && !sui.attr('data:type')) sui.attr('data:type',sui.attr('type'));
						else if (!sui.attr('type') && sui.attr('data:type')) sui.attr('type',sui.attr('data:type'));
						sui.findChild(function () {
							if (this.nodeName == 'block') htmlContent += Components.libs.widget.report.block(this);
							else if (this.nodeName == 'container') htmlContent += Components.libs.widget.report.container(this);
						}, function(){
							htmlContent = sui.content();
						});
						return sui.toHTML('wg', 'report', 'stacker', { child: { content: htmlContent }},  Template.get);
					},
					cell : function(sui){
						var htmlContent = '';
						if (sui.attr('name') && !sui.attr('data:name')) sui.attr('data:name',sui.attr('name'));
						else if (!sui.attr('name') && sui.attr('data:name')) sui.attr('name',sui.attr('data:name'));
						if (sui.attr('type') && !sui.attr('data:type')) sui.attr('data:type',sui.attr('type'));
						else if (!sui.attr('type') && sui.attr('data:type')) sui.attr('type',sui.attr('data:type'));
						sui.findChild(function () {
							if (this.nodeName == 'block') htmlContent += Components.libs.widget.report.block(this);
							else if (this.nodeName == 'container') htmlContent += Components.libs.widget.report.container(this);
							else if (this.nodeName == 'stacker') htmlContent += Components.libs.widget.report.stacker(this);
						}, function(){
							htmlContent = sui.content();
						});
						return sui.toHTML('wg', 'report', 'cell', { child: { content: htmlContent }},  Template.get);
					},
					row : function(sui){
						var htmlContent = '';
						if (sui.attr('name') && !sui.attr('data:name')) sui.attr('data:name',sui.attr('name'));
						else if (!sui.attr('name') && sui.attr('data:name')) sui.attr('name',sui.attr('data:name'));
						if (sui.attr('type') && !sui.attr('data:type')) sui.attr('data:type',sui.attr('type'));
						else if (!sui.attr('type') && sui.attr('data:type')) sui.attr('type',sui.attr('data:type'));
						sui.findChild(function () {
							if (this.nodeName == 'cell') htmlContent += Components.libs.widget.report.cell(this);
						}, function(){
							htmlContent = sui.content();
						});
						return sui.toHTML('wg', 'report', 'row', { child: { content: htmlContent }},  Template.get);
					},
					header : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'row') htmlContent += Components.libs.widget.report.row(this);
							else if (this.nodeName == 'cell') htmlContent += Components.libs.widget.report.cell(this);
						});
						return sui.toHTML('wg', 'report', 'header', { child: { content: htmlContent }},  Template.get);
					},
					footer : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'row') htmlContent += Components.libs.widget.report.row(this);
							else if (this.nodeName == 'cell') htmlContent += Components.libs.widget.report.cell(this);
						});
						return sui.toHTML('wg', 'report', 'footer', { child: { content: htmlContent }},  Template.get);
					},
					cover : function(sui){
						var htmlContent = '';
						if (sui.attr('data:background')) sui.attr('style:background-image','url(\''+sui.attr('data:background')+'\')');
						sui.findChild(function () {
							if (this.nodeName == 'row') htmlContent += Components.libs.widget.report.row(this);
							else if (this.nodeName == 'cell') htmlContent += Components.libs.widget.report.cell(this);
						});
						return sui.toHTML('wg', 'report', 'cover', { child: { content: htmlContent }},  Template.get);
					},
					main : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'row') htmlContent += Components.libs.widget.report.row(this);
							else if (this.nodeName == 'cell') htmlContent += Components.libs.widget.report.cell(this);
							else if (this.nodeName == 'block') htmlContent += Components.libs.widget.report.block(this);
							else if (this.nodeName == 'container') htmlContent += Components.libs.widget.report.container(this);
							else if (this.nodeName == 'stacker') htmlContent += Components.libs.widget.report.stacker(this);
						});
						return sui.toHTML('wg', 'report', 'main', { child: { content: htmlContent }},  Template.get);
					},
					notes : function(sui){
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'block') htmlContent += Components.libs.widget.report.block(this);
						});
						return sui.toHTML('wg', 'report', 'notes', { child: { content: htmlContent }},  Template.get);
					},
					page : function(sui, pgnum, headers, footers){
						var htmlContent = '';
						if (sui.attr('data:background')) sui.attr('style:background-image','url(\''+sui.attr('data:background')+'\')');
						sui.findChild(function () {
							if (this.nodeName == 'cover') htmlContent += Components.libs.widget.report.cover(this);
							else if (this.nodeName == 'repetition' && this.attr('type') == 'header') {
								var repid = this.attr('id') || 'default';
								var content = headers[repid];
								htmlContent += headers[repid];
							}
							else if (this.nodeName == 'header') htmlContent += Components.libs.widget.report.header(this);
							else if (this.nodeName == 'main') htmlContent += Components.libs.widget.report.main(this);
							else if (this.nodeName == 'notes') htmlContent += Components.libs.widget.report.notes(this);
							else if (this.nodeName == 'repetition' && this.attr('type') == 'footer') {
								var repid = this.attr('id') || 'default';
								var content = footers[repid];
								htmlContent += content.replace('{pgnum}','<i>'+pgnum+'</i>');
							}
							else if (this.nodeName == 'footer') htmlContent += Components.libs.widget.report.footer(this);

						});
						return sui.toHTML('wg', 'report', 'page', { child: { content: htmlContent }},  Template.get);
					},
					document : function(sui, pgnum, headers, footers){
						var htmlContent = '';
						var htmlTemplates = '';
						sui.findChild(function () {
							if (this.nodeName == 'page'){
								htmlContent += Components.libs.widget.report.page(this, pgnum, headers, footers);
								pgnum++;
							}
						});
						return sui.toHTML('wg', 'report', 'document', { child: { content: htmlContent }},  Template.get);
					},
					comments : function(sui){
						var htmlContent = sui.content();
						return sui.toHTML('wg', 'report', 'comments', { child: { content: htmlContent }},  Template.get);
					},
					templates : function(sui, pgnum, headers, footers){
						var htmlContent = '';
						sui.findChild(function () {
							var key = this.attr('id') || this.attr('type') || 'default';
							if (this.nodeName == 'header'){
								htmlContent += headers[key] = Components.libs.widget.report.header(this);
							}
							else if (this.nodeName == 'footer'){
								htmlContent += footers[key] = Components.libs.widget.report.footer(this);
							}
							else if (this.nodeName == 'page'){
								htmlContent += Components.libs.widget.report.page(this, pgnum, headers, footers);
							}
							else if (this.nodeName == 'block'){
								htmlContent += Components.libs.widget.report.block(this);
							}
							else if (this.nodeName == 'container'){
								htmlContent += Components.libs.widget.report.container(this);
							}
						});
						return sui.toHTML('wg', 'report', 'templates', { child: { content: htmlContent }},  Template.get);
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						var headers = {}, footers = {}
						var pgnum = 1;
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlList = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'var') htmlList += this.toHTML('variable', { value: this.attr('value')||this.content() },  Template.get);
								else if (this.nodeName == 'validation') htmlList += this.toHTML('wg', 'report', 'validations', { child: { content: $(this).html() }},  Template.get);
								else if (this.nodeName == 'templates') htmlList += Components.libs.widget.report.templates(this, pgnum, headers, footers);
								else if (this.nodeName == 'document') htmlList += Components.libs.widget.report.document(this, pgnum, headers, footers);
								else if (this.nodeName == 'comments') htmlList += Components.libs.widget.report.comments(this);
								else if (this.nodeName == 'tip') htmlList += Components.libs.tip(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				log: {
					timeline: function (sui, title) {
						var suiTimeline = sui;
						var htmlTimeline = suiTimeline.toHTML('wg', 'log', 'timeline', {
							label: { title: title || suiTimeline.attr('label:title') || 'Linha do Tempo' },
						}, Template.get);
						var code = Components.libs.code(suiTimeline);
						return Template.replace(htmlTimeline, { child: { code: code } });
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlTitle = '';
							var htmlList = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'title') htmlTitle += this.content();
								else if (this.nodeName == 'json') htmlList += Components.libs.widget.log.timeline(this, htmlTitle);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlList } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				wizard: {
					title: function (sui) {
						var suiTitle = sui;
						return suiTitle.toHTML('wg', 'wizard', 'title', {
							text: suiTitle.content() || suiTitle.attr('label:title'),
						}, Template.get);
					},
					description: function (sui) {
						var suiDesc = sui;
						return suiDesc.toHTML('wg', 'wizard', 'description', {
							text: suiDesc.content() || suiDesc.attr('label:description'),
						}, Template.get);
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							htmlArea += this.toHTML('widget', 'area', Template.get);
							var suiArea = this;
							var htmlStack = '';
							suiArea.findChild('html', function () {
								htmlStack += Components.libs.html(this);
							});
							suiArea.findChild('stack', function () {
								htmlStack += this.toHTML('wg', 'wizard', 'stack', Template.get);
								var suiStack = this;
								var htmlList = '';
								suiStack.findChild(function () {
									if (this.nodeName == 'html') htmlList += Components.libs.html(this);
									else if (this.nodeName == 'fieldset') htmlList += Components.libs.widget.form.fieldset(this);
									else if (this.nodeName == 'field') htmlList += Components.libs.widget.form.field(this);
									else if (this.nodeName == 'fieldgroup') htmlList += Components.libs.widget.form.field(this);
									else if (this.nodeName == 'buttonset') htmlList += Components.libs.widget.form.buttonset(this);
									else if (this.nodeName == 'button') htmlList += Components.libs.widget.form.button(this);
									else if (this.nodeName == 'tip') htmlList += Components.libs.tip(this);
									else if (this.nodeName == 'title') htmlList += Components.libs.widget.wizard.title(this);
									else if (this.nodeName == 'description') htmlList += Components.libs.widget.wizard.description(this);
								});
								htmlStack = Template.replace(htmlStack, { child: { content: htmlList } });
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlStack } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				profile: {
					identifier: function (sui) {
						var htmlHtml = sui.toHTML('wg', 'profile', 'identifier', Template.get);
						var htmlChild = '';
						sui.findChild(function () {

							if (this.nodeName == 'avatar') {
								var src = this.attr('src');
								var data = src ? { style: { "background-image": 'url(\'' + $.trim(src) + '\')' } } : {};
								htmlChild += this.toHTML('wg', 'profile', 'avatar', data, Template.get);
							}
							else if (this.nodeName == 'label') htmlChild += this.toHTML('wg', 'profile', 'label', Template.get);
							else if (this.nodeName == 'abbr') htmlChild += this.toHTML('wg', 'profile', 'abbr', Template.get);
							else if (this.nodeName == 'icon') htmlChild += this.toHTML('wg', 'profile', 'icon', Template.get);
						});
						return htmlHtml = Template.replace(htmlHtml, { child: { content: htmlChild } });
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							var suiArea = this;
							htmlArea += suiArea.toHTML('widget', 'area', Template.get);
							var htmlHtml = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'html') htmlHtml += Components.libs.html(this);
								else if (this.nodeName == 'identifier') htmlHtml += Components.libs.widget.profile.identifier(this);
								else if (this.nodeName == 'line') htmlHtml += Components.libs.widget.custom.line(this);
								else if (this.nodeName == 'html') htmlHtml += Components.libs.html(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlHtml } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				map: {
					map: function (sui) {
						var suiMap = sui;
						var mdata = suiMap.getAttr().data || {};
						suiMap.findChild(function () {
							if (this.nodeName == 'toolbar') Components.libs.widget.map.toolbar(this, mdata);
							else if (this.nodeName == 'marker') Components.libs.widget.map.marker(this, mdata);
							else if (this.nodeName == 'polyline') Components.libs.widget.map.polyline(this, mdata);
							else if (this.nodeName == 'heatmap') Components.libs.widget.map.heatmap(this, mdata);
						});
						var v = JSONX.stringify(mdata);
						return sui.toHTML('wg', 'map', 'map', Template.get) + sui.toHTML('code', { attr: { name: 'leaflet', type: 'map' }, value: v }, Template.get);
					},
					toolbar: function (sui, mdata) {
						mdata.toolbars = mdata.toolbars || [];
						var toolbar = sui.getAttr().data || {};
						sui.findChild('button', function () {
							toolbar.buttons = toolbar.buttons || [];
							var button = this.getAttr() || {};
							toolbar.buttons.push(button);
						});
						mdata.toolbars.push(toolbar);
					},
					marker: function (sui, mdata) {
						mdata.markers = mdata.markers || [];
						var marker = sui.getAttr().data || {};
						sui.findChild('popup', function () {
							marker.popup = $.trim(encodeURIComponent(this.content()));
						});
						mdata.markers.push(marker);
					},
					polyline: function (sui, mdata) {
						mdata.polylines = mdata.polylines || [];
						var polyline = sui.getAttr().data || {};
						sui.findChild('popup', function () {
							polyline.popup = $.trim(encodeURIComponent(this.content()));
						});
						sui.findChild('pointgroup', function () {
							polyline.pointgroup = JSONX.parse($.trim(this.content()));
						});
						mdata.polylines.push(polyline);
					},
					heatmap: function (sui, mdata) {
						mdata.heatmap = { options: sui.getAttr().data };
						sui.findChild('point', function () {
							mdata.heatmap.points = mdata.heatmap.points || [];
							var point = this.getAttr() || {};
							mdata.heatmap.points.push([point.lat, point.lon, point.value]);
						});
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							var suiArea = this;
							htmlArea += suiArea.toHTML('widget', 'area', Template.get);
							var htmlHtml = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'map') htmlHtml += Components.libs.widget.map.map(this);
								else if (this.nodeName == 'html') htmlHtml += Components.libs.html(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlHtml } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				spreadsheet: {
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							var suiArea = this;
							htmlArea += suiArea.toHTML('widget', 'area', Template.get);
							var htmlHtml = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'html') htmlHtml += Components.libs.html(this);
								else if (this.nodeName == 'datasheet') htmlHtml += Components.libs.datasheet(this);
								else if (this.nodeName == 'chart') htmlHtml += Components.libs.chart(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlHtml } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				timeline: {
					timeline: function (sui) {
						var suiTimeline = sui;
						var htmlContent = '';
						suiTimeline.findChild(function () {
							if (this.nodeName == 'post') htmlContent += Components.libs.widget.timeline.post(this);
						});
						return sui.toHTML('wg', 'timeline', 'timeline', { child: { content: htmlContent } }, Template.get);
					},
					post: function (sui) {
						var suiPost = sui;
						var htmlContent = '';
						suiPost.findChild(function () {
							if (this.nodeName == 'icon') htmlContent += this.toHTML('wg', 'timeline', 'icon', Template.get);
							else if (this.nodeName == 'abbr') htmlContent += this.toHTML('wg', 'timeline', 'abbr', { label: this.attr('label') || this.content() }, Template.get);
							else if (this.nodeName == 'avatar') htmlContent += this.toHTML('wg', 'timeline', 'avatar', Template.get);
							else if (this.nodeName == 'title') htmlContent += this.toHTML('wg', 'timeline', 'title', { content: this.attr('label') || this.content() }, Template.get);
							else if (this.nodeName == 'moment') htmlContent += this.toHTML('wg', 'timeline', 'moment', { content: this.attr('label') || this.content() }, Template.get);
							else if (this.nodeName == 'image') htmlContent += this.toHTML('wg', 'timeline', 'image', { src: this.attr('style:background') || this.attr('style:background-image') || this.content() }, Template.get);
							else if (this.nodeName == 'opengraph') htmlContent += this.toHTML('wg', 'opengraph', 'image', {
								src: this.attr('src') || this.attr('style:background') || this.attr('style:background-image'),
								href: this.attr('href') || this.attr('link:href'),
								desc: this.attr('desc') || this.content()
							}, Template.get);
							else if (this.nodeName == 'description') htmlContent += this.toHTML('wg', 'timeline', 'description', { content: this.attr('label') || this.content() }, Template.get);
						});
						return sui.toHTML('wg', 'timeline', 'post', { child: { content: htmlContent } }, Template.get);
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							var suiArea = this;
							htmlArea += suiArea.toHTML('widget', 'area', Template.get);
							var htmlTimeline = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'timeline') htmlTimeline += Components.libs.widget.timeline.timeline(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlTimeline } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				custom: {
					column: function (sui) {
						var htmlCol = sui.toHTML('wg', 'custom', 'column', Template.get);
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'html') htmlContent += Components.libs.html(this);
							else if (this.nodeName == 'chart') htmlContent += Components.libs.chart(this);
						}, function () {
							htmlContent = sui.content();
						});
						return Template.replace(htmlCol, { child: { content: htmlContent } });
					},
					line: function (sui) {
						var htmlLine = sui.toHTML('wg', 'custom', 'line', Template.get);
						var htmlContent = '';
						sui.findChild(function () {
							if (this.nodeName == 'column') htmlContent += Components.libs.widget.custom.column(this);
							else if (this.nodeName == 'html') htmlContent += Components.libs.html(this);
							else if (this.nodeName == 'chart') htmlContent += Components.libs.chart(this);
						}, function () {
							htmlContent = sui.content();
						});
						return Template.replace(htmlLine, { child: { content: htmlContent } });
					},
					full: function (sui) {
						var htmlWidget = Components.libs.common.widget(sui),
							htmlArea = '';
						sui.findChild('area', function () {
							var suiArea = this;
							htmlArea += suiArea.toHTML('widget', 'area', Template.get);
							var htmlHtml = '';
							suiArea.findChild(function () {
								if (this.nodeName == 'html') htmlHtml += Components.libs.html(this);
								else if (this.nodeName == 'line') htmlHtml += Components.libs.widget.custom.line(this);
								else if (this.nodeName == 'chart') htmlHtml += Components.libs.chart(this);
							});
							htmlArea = Template.replace(htmlArea, { child: { area: htmlHtml } });
						});
						return Template.replace(htmlWidget, { child: { area: htmlArea } });
					}
				},
				free: {
					full: function (sui) {
						return Components.libs.common.widget.custom.full(sui);
					}
				}
			},
			fieldset: function (sui) {
				return Components.libs.widget.form.fieldset(sui);
			},
			field: function (sui) {
				return Components.libs.widget.form.field(sui);
			}
		}
	};

	this.load = function (s) {
		setup = s;
		Console = Debug.get('Network', {
			key: setup.suisrc
		});
		setup.metric.add('parseStartTime');
		root = null;
		var xmlIndex = -1;
		var dataTrim = $.trim(setup.response.textData);
		var data;
		if (dataTrim) {
			xmlIndex = dataTrim.substring(0, 10).indexOf('<?xml');
			if (xmlIndex > -1) {

				//data = setup.response.parsedXML = $.parseXML(dataTrim);

				if (dataTrim.indexOf('@[setup.') > -1){
					var found = dataTrim.match(/@\[setup\..+\]/g);
					$.each(found, function(k,v){
						var slicev = v.slice(0,-1);
						var propkey = slicev.split('.').slice(1);
						var newpropv = '';
						if (propkey.length === 1) newpropv = setup[propkey[0]];
						else if (propkey.length === 2) newpropv = setup[propkey[0]][propkey[1]];
						else if (propkey.length === 3) newpropv = setup[propkey[0]][propkey[1]][propkey[2]];
						else if (propkey.length === 4) newpropv = setup[propkey[0]][propkey[1]][propkey[2]][propkey[3]];
						dataTrim = dataTrim.replace(v, newpropv);
						console.log('REPLACEMENT IN PARSER FOR SETUP VALUES:', v, propkey, newpropv);
					});
				}

				var parser = new DOMParser();
				var doc = parser.parseFromString(dataTrim, "application/xml");
				var parsererror;
				data = setup.response.parsedXML = doc;
				parsererror = data.getElementsByTagName("parsererror")[0];

				if (parsererror){
					Console.error({
						mode: 'Parser',
						title: 'Browser parser failure',
						content: $(parsererror).text()
					});
				} else {

					root = data.getElementsByTagName("interface")[0]; // se o xml é um arquivo de interface

					if (root) {
						if (setup.render) {
							var part = Render.parts(root); // testa se o parser vai processar uma parte específica do arquivo de interface
							if ($.isPlainObject(part) || $.isArray(part)){
								setup.response.parsedJSON = part;
							} else {
								setup.response.parsedHTML = part;
							}
						} else if (setup.snippet) {
							setup.response.parsedSNIP = Render.snippet(root); 	// testa se o parser vai processar de uma forma pré determinada o arquivo de interface
						} else if (setup.file) {
							setup.response.parsedSNIP = Render.file(root); 		// testa se o parser vai processar de uma forma pré determinada o arquivo de interface
						} else {
							setup.response.parsedHTML = Render.full(root); 		// ou se vai processar o arquivo todo
						}
						if (setup.response.parsedHTML){
							setup.response.parsedJQ = $(setup.response.parsedHTML);
						}
						root = data.getElementsByTagName("stylesheet")[0]; // se o xml é um arquivo de javascript
						if (root) setup.response.parsedCSS = Render.css(root);
						root = data.getElementsByTagName("javascript")[0]; // se o xml é um arquivo de javascript
						if (root) setup.response.parsedJS = Render.js(root);
						root = data.getElementsByTagName("trace")[0]; // se o xml tem os traces de debug
						if (root) Render.trace(root);
					} else {
						root = data.getElementsByTagName("trace")[0]; // se o xml tem os traces de debug
						if (root) Render.trace(root);
						setup.metric.add('parseEndTime');
						setup.metric.add('bytesTotal', setup.response.textData ? setup.response.textData.length : 0);
						return false;
					}
				}
			} else {
				Console.error({
					mode: 'Parser',
					title: 'XML response failure',
					content: $.trim(setup.response.textData)
				});
				Notify.open({
					type: 'fatal',
					name: isPT ? 'Erro inesperado de parser' : 'Unexpected parser error',
					message: isPT ? 'Uma falha ocorreu ao processar o arquivo de resposta' : 'A fail occurred when a response got processed'
				});
				setup.metric.add('parseEndTime');
				setup.metric.add('bytesTotal', setup.response.textData ? setup.response.textData.length : 0);
				return false;
			}
			setup.metric.add('parseEndTime');
			setup.metric.add('bytesTotal', setup.response.textData ? setup.response.textData.length : 0);
			return true;
		}
		setup.metric.add('parseEndTime');
		setup.metric.add('bytesTotal', setup.response.textData ? setup.response.textData.length : 0);
		return false;
	};

	this.upillow = function (text, c) {
		Console = c;
		var response = {};
		root = null;
		var xmlIndex = -1;
		var dataTrim = $.trim(text);
		var data;
		if (dataTrim) {
			xmlIndex = dataTrim.substring(0, 10).indexOf('<?xml');
			if (xmlIndex > -1) {
				data = setup.response.parsedXML = $.parseXML(dataTrim);
				root = data.getElementsByTagName("interface")[0];
				if (root) {
					response.parsedHTML = Render.full(root);
					response.parsedJQ = $(response.parsedHTML);
				}
				root = data.getElementsByTagName("trace")[0];
				if (root) Render.trace(root);
			}
		}
		return response;
	};

	this.socket = function (s) {
		var xmlIndex = -1;
		var dataTrim = $.trim(s.xml);
		var data;
		if (dataTrim) {
			xmlIndex = dataTrim.substring(0, 10).indexOf('<?xml');
			if (xmlIndex > -1) {
				data = s.parsedXml = $.parseXML(dataTrim);
				root = data.getElementsByTagName("interface")[0]; // se o xml é um arquivo de interface
				if (root) {
					s.parsedHTML = Render.full(root);
					s.parsedJQ = $(s.parsedHTML);
				}
			} else {
				return false;
			}
		}
		return true;
	};

};
