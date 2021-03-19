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

sourceui.interface.widget.report = function($widget,setup){

	'use strict';

	var Report = this;
	var Network = sourceui.instances.network;
	var Template = sourceui.templates.interface;
	var Device = sourceui.instances.device;
	var Debug = Device.Debug;
	var Interface = sourceui.interface;
	var Dom = Interface.dom;
	var Notify = sourceui.instances.interface.plugins.notify;

	var History = [];

	Report.common = new Interface.widget.common($widget,setup);
	Report.widget = $widget;
	Report.area = $widget.children('.area');
	Report.variables = Report.area.children('.sui-variable');
	Report.wgtools = Report.widget.children('.toolbar').find('.tools');
	Report.view = Report.widget.closest('.sui-view');
	Report.scroll = Report.view.children('.scroll-default, .scroll-all');
	Report.viewtools = Report.view.children('.toolbar').children('.tools.left');
	Report.document = Report.widget.find('.sui-report-document');
	Report.validations = Report.widget.find('.sui-validations rule');
	Report.templates = Report.widget.find('.sui-templates');
	Report.editors = Report.document.find('[data-edition*="text"]');
	Report.tinymceinlinetoolbar = Dom.body.children('#tinymceinlinetoolbar');


	Report.document.addClass('preventhistorystack');

	var ___cnsl = {
		log: function(){
			return;
			var a=[],l;
			$.each(arguments,function(k,v){
				if (v instanceof HTMLElement || v instanceof jQuery) l = v;
				else a.push(v);
			});
			console.groupCollapsed('🔵 '+a.join('  '),[l]);
			console.info(l);
			console.groupEnd();
		}
	};






	var historyStack = {
		online: false,
		pointer: -1,
		stack: [],
		push: function(setup){
			if (Report.document.hasClass('preventhistorystack')) return false;
			/*
			if (historyStack.stack.length > 0){
				var sliced = historyStack.stack.slice(0,historyStack.pointer);
				var sliced = sliced.slice(-20);
			} else {
				var sliced = historyStack.stack;
			}
			*/
			var sliced = historyStack.stack.slice(0,historyStack.pointer+1);
			sliced = sliced.slice(-20);
			historyStack.stack = sliced || [];
			historyStack.pointer = historyStack.stack.length;
			historyStack.pile(setup);
			//console.log('historyStack.push',historyStack.pointer,historyStack.stack,setup);
			return setup;
		},
		replace: function(setup){
			if (Report.document.hasClass('preventhistorystack')) return false;
			historyStack.stack[historyStack.pointer] = {
				pile:[setup]
			};
			return setup;
		},
		pile: function(setup){
			if (Report.document.hasClass('preventhistorystack')) return false;
			historyStack.stack[historyStack.pointer] = historyStack.stack[historyStack.pointer] || [];
			historyStack.stack[historyStack.pointer].piles = historyStack.stack[historyStack.pointer].piles || [];
			historyStack.stack[historyStack.pointer].piles.push(setup);
			return setup;
		},
		forward: function(){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var stack = historyStack.go(historyStack.pointer+1);
			if (stack){
				var firstpile = stack.piles[0];
				if (firstpile){
					var $scrollelement = firstpile.do.page || firstpile.do.reference || firstpile.do.fieldwrap || firstpile.do.edition;
					var notification = (firstpile.do.label || 'History got forward')+' ('+(historyStack.pointer+1)+')';
					Report.scroll.scrollTo($.isNumeric(firstpile.do.scrolltop)? firstpile.do.scrolltop : $scrollelement, 100, !$.isNumeric(firstpile.do.scrolltop) ? { offset:Dom.window.height()/3} : {} );
					$.tipster.notify(notification);
					historyStack.pointer++;
				}
			}
			else $.tipster.notify('No more forward stacks');
		},
		back: function(){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var stack = historyStack.go(historyStack.pointer);
			if (stack){
				var firstpile = stack.piles[0];
				if (firstpile){
					var $scrollelement = firstpile.undo.page || firstpile.undo.reference || firstpile.undo.fieldwrap || firstpile.undo.edition;
					var notification = (firstpile.undo.label || 'History got back')+' ('+historyStack.pointer+')';
					Report.scroll.scrollTo($.isNumeric(firstpile.undo.scrolltop)? firstpile.undo.scrolltop : $scrollelement, 100, !$.isNumeric(firstpile.undo.scrolltop) ? { offset:Dom.window.height()/3} : {} );
					$.tipster.notify(notification);
					historyStack.pointer--;
				}
			}
			else $.tipster.notify('No more back stacks');
		},
		go: function(pointer){
			if (Report.document.hasClass('preventhistorystack')) return false;
			var stack = historyStack.stack[pointer];
			//console.log('historyStack.go',pointer,stack);
			if (!stack) return;
			stack.piles = stack.piles || [];
			Report.document.addClass('preventhistorystack');
			$.each(stack.piles, function(kp,pile){
				if (pointer > historyStack.pointer){
					if (pile.do.action == 'addedition'){ 				pile.do.page.trigger('page:addedition',[pile.do.fieldwrap,pile.do.reference,pile.do.placement]); }
					else if (pile.do.action == 'removeedition'){ 		pile.do.edition.trigger('edition:remove'); }
					else if (pile.do.action == 'movededition'){ 		pile.do.reference[pile.do.placement](pile.do.fieldwrap); }
					else if (pile.do.action == 'positionedition'){ 		pile.do.edition.attr('data-position',pile.do.position); pile.do.fieldwrap.attr('style',pile.do.position); }
					else if (pile.do.action == 'addpage'){ 				Report.document.trigger('document:addpage',[pile.do.page,pile.do.reference,pile.do.placement]); }
					else if (pile.do.action == 'removepage'){ 			pile.do.page.trigger('page:remove'); }
				}
				else if (pointer <= historyStack.pointer){
					if (pile.undo.action == 'addedition'){ 				pile.undo.page.trigger('page:addedition',[pile.undo.wrap,pile.undo.reference,pile.undo.placement]); }
					else if (pile.undo.action == 'removeedition'){ 		pile.undo.edition.trigger('edition:remove'); }
					else if (pile.undo.action == 'movededition'){ 		pile.undo.reference[pile.undo.placement](pile.undo.fieldwrap); }
					else if (pile.undo.action == 'positionedition'){ 	pile.undo.edition.attr('data-position',pile.undo.position); pile.undo.fieldwrap.attr('style',pile.undo.position); }
					else if (pile.undo.action == 'addpage'){			Report.document.trigger('document:addpage',[pile.undo.page,pile.undo.reference,pile.undo.placement]); }
					else if (pile.undo.action == 'removepage'){ 		pile.undo.page.trigger('page:remove'); }

				}
			});
			Report.document.removeClass('preventhistorystack');
			return stack;
		},
	};
	Dom.document.on('keyup', function(event){
		if (event.ctrlKey){
			if (event.keyCode == 90){
				var $edition = Report.document.find('.fieldwrap.focus > [data-edition*="text"]');
				if (!$edition.length || !$edition.is('.contentchanged')) historyStack.back();
			} else if (event.keyCode == 89){
				var $edition = Report.document.find('.fieldwrap.focus > [data-edition*="text"]');
				if (!$edition.length || !$edition.is('.contentchanged')) historyStack.forward();
			}
		}
	});





	var boxFitter = {
		breakBox: function($box,$edge){

			var $edition = $box.children('[data-edition]');

			if ($box.parent().is('.flex')){
				$box = $box.parent();
				$box.addClass('toolarge');
				boxFitter.moveBox($box,$edge);
				return false;
			}
			else if ($edition.is('[data-edition*="text"]')){
				$box.addClass('toolarge');
				boxFitter.moveBox($box,$edge);
				return false;
			}

			$edge = $edge || $box.parent();

			var bgID = $box.data('boxgroup');
			if (!bgID){
				bgID = $edition.data('belongstogroup');
				bgID = bgID || Math.unique(20);
				$box.attr('data-boxgroup',bgID);
				$edition.attr('data-belongstogroup',bgID);
			}

			var $boxNextAll = $box.nextAll();

			var edgeHeight = $edge.height();
			var boxPos = $box.position();
			var $contentNew = $('<pre></pre>');

			___cnsl.log('breakBox','edition',$edition.get(0));

			$edition.children().each(function(k,el){
				let $el = $(el);
				let elPos = $el.position();
				___cnsl.log('breakBox','overflowed:'+(boxPos.top + elPos.top + $el.outerHeight(true) > edgeHeight),el);
				if (boxPos.top + elPos.top + $el.outerHeight(true) > edgeHeight){
					if ($el.is('table')){
						let $table = $el;
						let $tbodies = $table.children('tbody');
						let hasBreak = false;
						if ($tbodies.length){
							$tbodies.each(function(ky,tbody){
								var $tbody = $(tbody);
								let tbodyPos = $tbody.position();
								___cnsl.log('breakBox','tbody','overflowed:'+(boxPos.top + elPos.top + tbodyPos.top + $tbody.outerHeight(true) > edgeHeight),tbody);
								if (boxPos.top + elPos.top + tbodyPos.top + $tbody.outerHeight(true) > edgeHeight){
									$tbody.children('tr').each(function(ktr,tr){
										var $tr = $(tr);
										let trPos = $tr.position();
										let trHeight = $tr.outerHeight(true);
										___cnsl.log('breakBox','tbody','tr','overflowed:',(boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight),tr);
										if (boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight){
											$tr.children('td').each(function(ktd,td){
												$(td).width($(td).width());
											});
											if (ktr < 5){
												if ($tbody.prev('tbody').length){
													$tbody.prev('tbody').addClass('sourcemovedcontent movedafter');
													let $tableClone = $table.clone().addClass('wrappedmovedcontent');
													$contentNew.append($tableClone.html('').append($tbody.nextAll().addBack()));
												} else {
													$contentNew.append($table);
												}
												$contentNew.append($table.nextAll());
												hasBreak = true;
												return false;
											} else {
												$tr.prev().addClass('sourcemovedcontent movedafter');
												let $tableClone = $table.clone();
												$contentNew.append($tableClone.html($tbody.clone().html('').append($tr.nextAll().addBack()).addClass('wrappedmovedcontent')));
												$tableClone.append($tbody.nextAll('tbody'));
												$contentNew.append($table.nextAll());
												hasBreak = true;
												return false;
											}
										}
									});
								}
								if (hasBreak) return false;
							});
						} else {
							$el.children('tr').each(function(ktr,tr){
								var $tr = $(tr);
								let trPos = $tr.position();
								let trHeight = $tr.outerHeight(true);
								___cnsl.log('breakBox','tr','overflowed:'+(boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight)+', index:'+ktr,tr);
								if (boxPos.top + elPos.top + trPos.top + trHeight > edgeHeight){
									$tr.children('td').each(function(ktd,td){
										$(td).width($(td).width());
									});
									if (ktr < 5){
										$contentNew.append($table);
										hasBreak = true;
										return false;
									} else {
										$tr.prev().addClass('sourcemovedcontent movedafter');
										let $tableClone = $table.clone();
										$contentNew.append($tableClone.html($tr.nextAll().addBack()).addClass('wrappedmovedcontent'));
										hasBreak = true;
										return false;
									}
								}
							});
						}
						if (hasBreak){
							$contentNew.append($el.nextAll());
							return false;
						}
					} else {
						$contentNew.append($el.nextAll().addBack());
						return false;
					}
				}
			});
			___cnsl.log('breakBox','contentNew',$contentNew.get(0));
			var contentNew = $contentNew.html();
			if (contentNew){

				//var $cloneedition = Report.templates.children('[data-edition="'+$edition.data('edition')+'"]').clone();
				var $cloneedition = $edition.clone().html('');
				$cloneedition.html(contentNew);

				var $clonewrap = $('<div class="fieldwrap active" data-boxgroup="'+bgID+'" />').append($cloneedition);

				var $page = $edge.closest('.page'), $clonepage;

				var pagelayout = $page.data('layout');
				if (pagelayout == 'covered-default') pagelayout = 'splited';

				var $nextpage = $page.next('.page[data-layout="'+pagelayout+'"]');

				if ($nextpage.length){
					if ($edge.is('.side')) {
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.cell.side'),'prepend']);
					} else if ($edge.is('.content')){
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.cell.content'),'prepend']);
					} else {
						$nextpage.trigger('page:addedition',[$clonewrap,$nextpage.find('.main > .row > .cell'),'prepend']);
					}
					___cnsl.log('breakBox','contentNew','prepend to next page',$nextpage.get(0));
				} else {
					$clonepage = Report.templates.children('.page[data-layout="'+pagelayout+'"]').clone();
					Report.document.trigger('document:addpage',[$clonepage,$page,'after']);
					if ($edge.is('.side')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.cell.side'),'prepend']);
					} else if ($edge.is('.content')){
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.cell.content'),'prepend']);
					} else {
						$clonepage.trigger('page:addedition',[$clonewrap,$clonepage.find('.main > .row > .cell'),'prepend']);
					}
					___cnsl.log('breakBox','contentNew','prepend to new page',$clonepage.get(0));
				}

				$clonewrap.after($boxNextAll);
				$page.trigger('click');
			}
			$box.removeClass('overflew toolarge unbroken');
		},
		unbreakBox: function($boxGroup,forcestrapolate){
			var hasStrapolated = false;
			if (!forcestrapolate){
				$boxGroup.each(function(kb,box){
					var $box = $(box);
					if (boxFitter.isExtrapolatedBox($box)){
						hasStrapolated = true;
						return false
					}
				});
			}
			if (hasStrapolated || forcestrapolate){
				var $contentAll = $('<pre></pre>');
				$boxGroup.each(function(kb,box){
					var $box = $(box);
					if ($box.hasClass('unbroken')) return null;
					___cnsl.log('unbreakBox',box);
					var $edition = $box.children('[data-edition]');
					var content, $content;
					if (($edition.attr('data-edition') || '').indexOf('text') > -1){
						content = tinymce.get($edition.attr('id')).getContent();
					} else {
						content = $edition.html();
					}
					if (content){
						var $sourcemovedcontent = $contentAll.find('.sourcemovedcontent:eq(0)');
						if ($sourcemovedcontent.length){
							$content = $('<pre>'+content+'</pre>');
							var $wrappedmovedcontent = $content.find('.wrappedmovedcontent:eq(0)');
							if ($sourcemovedcontent.is('.movedafter')) $sourcemovedcontent.after($wrappedmovedcontent.html() || content);
							else $sourcemovedcontent.html($wrappedmovedcontent.html() || content);
							$sourcemovedcontent.removeClass('sourcemovedcontent movedafter');
						} else {
							$contentAll.append(content);
						}
					}
					Report.widget.append($edition.siblings('.edition-action'));
				});
				var contentAll = $contentAll.html();
				if (contentAll){
					___cnsl.log('unbreakBox','contentAll',$contentAll.get(0));
					var $b = $boxGroup.filter(':eq(0)');
					var $e = $b.children('[data-edition]');
					if (($e.attr('data-edition') || '').indexOf('text') > -1){
						tinymce.get($e.attr('id')).setContent(contentAll);
					} else {
						$e.html(contentAll);
					}
					$b.addClass('unbroken');
					$boxGroup.filter(':gt(0)').remove();
					return true;
				}
			}
			return false
		},
		moveBox: function($box,$edge){

			if ($box.parent().is('.flex')){
				$box = $box.parent();
			}

			var $boxesToPrepend;
			if ($box.hasClass('toolarge')){
				$boxesToPrepend = $box.nextAll();
			} else {
				$boxesToPrepend = $box.nextAll().addBack();
			}

			if ($boxesToPrepend.length){
				var $page = $edge.closest('.page'), $clonepage;

				var pagelayout = $page.data('layout');
				if (pagelayout == 'covered-default') pagelayout = 'splited';

				var $nextpage = $page.next('.page[data-layout="'+pagelayout+'"]');

				if ($nextpage.length){
					if ($edge.is('.side')) $nextpage.find('.cell.side').prepend($boxesToPrepend);
					else if ($edge.is('.content')) $nextpage.find('.cell.content').prepend($boxesToPrepend);
					else  $nextpage.find('.main > .row > .cell').prepend($boxesToPrepend);
					___cnsl.log('moveBox','prepend to next page',$nextpage.get(0));
				} else {
					$clonepage = Report.templates.children('.page[data-layout="'+pagelayout+'"]').clone();
					Report.document.trigger('document:addpage',[$clonepage,$page,'after']);
					if ($edge.is('.side')) $clonepage.find('.cell.side').prepend($boxesToPrepend);
					else if ($edge.is('.content')) $clonepage.find('.cell.content').prepend($boxesToPrepend);
					else  $clonepage.find('.main > .row > .cell').prepend($boxesToPrepend);
					___cnsl.log('moveBox','prepend to new page',$clonepage.get(0));
				}
			}

			boxFitter.isTooBigBox($box,$edge);
		},
		hasOverflow: function($edge){
			var el = $edge.get(0);
			var curOverf = el.style.overflow;
			if ( !curOverf || curOverf === "visible" ) el.style.overflow = "hidden";
			var isOverflowing = el.clientWidth+20 < el.scrollWidth || el.clientHeight+20 < el.scrollHeight;
			el.style.overflow = curOverf;
			return isOverflowing;
		},
		isTooBigBox: function($box,$edge){
			$edge = $edge || $box.parent();
			var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width(), edgeHeight = $edge.height();
			var ret;

			strapolateWidth = $box.outerWidth(true) > edgeWidth;
			if (strapolateWidth) ret = 1;

			strapolateHeight = $box.outerHeight(true) > edgeHeight;
			if (strapolateHeight) ret = 2;

			if (ret){
				$box.addClass('toolarge');
				return ret;
			}
			$box.removeClass('toolarge');
			return false;
		},
		isExtrapolatedBox: function($box,$edge){
			$edge = $edge || $box.parent();
			var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width(), edgeHeight = $edge.height();

			strapolateWidth = boxPos.left > edgeWidth;
			if (strapolateWidth) return 1;
			strapolateWidth = (boxPos.left + $box.outerWidth(true)) > edgeWidth;
			if (strapolateWidth) return 2;

			strapolateHeight = boxPos.top > edgeHeight;
			if (strapolateHeight) return 3;
			strapolateHeight = (boxPos.top + $box.outerHeight(true)) > edgeHeight;
			if (strapolateHeight) return 4;

			return false;
		},
		testPage: function($page,forceunbreak){

			$page = $page || Report.document.find('.page:eq(0)');

			if (!$page.length) return false;

			if (boxFitter.finished === true){
				//console.clear();
				boxFitter.finished = false;
			}

			___cnsl.log('testPage',$page.get(0));

			var $boxGroup = $page.find('[data-boxgroup]'), groupsIds = {};
			$boxGroup.each(function(kbg, bg){
				let $bg = $(bg);
				groupsIds[$bg.data('boxgroup')] = true;
			});
			$.each(groupsIds,function(kie,vie){
				boxFitter.unbreakBox($page.nextAll('.page').addBack().find('[data-boxgroup="'+kie+'"]'),forceunbreak||false);
			});

			var $edge = $page.find('.content, .side, .main > .row > .cell');
			$edge.each(function(ke,e){
				___cnsl.log('testPage','edge',e);
				var $e = $(e);
				if (boxFitter.hasOverflow($e)){
					var $boxes = $e.find('.fieldwrap');
					$boxes.each(function(kb,b){
						var $b = $(b);
						var extrapolate = boxFitter.isExtrapolatedBox($b,$e);
						___cnsl.log('testPage','isExtrapolatedBox: ',extrapolate,extrapolate ? $b.get(0) : '');
						if (extrapolate){
							$b.addClass('overflew'); // tint as red
						}
						if (extrapolate === 3){
							// move all hidden objects to next page;
							///////////////////////////////////////////////
							Report.document.addClass('preventeventchange');
							boxFitter.moveBox($b,$e);
							Report.document.removeClass('preventeventchange');
							return false;
							///////////////////////////////////////////////
						} else if (extrapolate === 4){
							// break box and move all next boxes to next page;
							///////////////////////////////////////////////
							Report.document.addClass('preventeventchange');
							boxFitter.breakBox($b,$e);
							Report.document.removeClass('preventeventchange');
							return false;
							///////////////////////////////////////////////
						}
						if (!extrapolate){
							$b.removeClass('overflew');
						}
					});
				} else {
					$e.find('.overflew, .toolarge').removeClass('overflew toolarge');
				}
			});

			var $nextPage = $page.next('.page');
			if ($nextPage.length) boxFitter.testPage($nextPage);
			else boxFitter.finished = true;
		}
	};





	if (!Report.tinymceinlinetoolbar.length){
		Report.tinymceinlinetoolbar = $('<div id="tinymceinlinetoolbar"/>').appendTo(Dom.body);
	}
	Report.tinymceinlinetoolbar.css({
		'left':Report.viewtools.offset().left + Report.viewtools.width() + 15
	});

	Report.area.on('swiperight',function(event){
		event.stopImmediatePropagation();
		event.preventDefault();
	});





	// Widget Tools ------------------------------------------
	Report.wgtools.filter('.top').find('li:eq(0)').on('click',function(){
		var rules = []
		Report.validations.each(function(){
			var $v = $(this);
			var rule = {
				name: $v.attr('name'),
				selector: $v.attr('selector'),
				valid: $v.attr('valid'),
				count: $v.attr('count'),
				min: $v.attr('min'),
				max: $v.attr('max'),
				desc: $.trim($v.text()),
			}
			rules.push(rule);
		});
		Report.document.trigger('document:openfloat',[Report.document, {
			form:'validations',
			rules:rules
		}]);
	});
	Report.wgtools.filter('.top').find('li:gt(0)').pep({
		place: false,
		shouldEase: false,
		droppable: '.sui-report-document, .page, .cell, .fieldwrap, .pagedropper',
		revert: true,
		start: function (ev, obj) {
			obj.$el.addClass('dragger');
		},
		drag: function(ev, obj){

			var $a = obj.$el.children('a');
			var $drop = this.activeDropRegions;
			var $target;

			Report.document.find('.pep-dropping').removeClass('pep-dropping');

			if ($a.hasClass('add-page')){
				$target = $drop[1];
				if ($target && $target.length && $target.is('.page, .pagedropper')) {
					$target.addClass('pep-dropping');
				}
			} else {
				$target = $drop[3] || $drop[2] || $drop[1];
				if ($target && $target.length && $target.is('.fieldwrap, .cell, .page')){
					$target.addClass('pep-dropping');
				}
			}
		},
		stop: function (ev, obj) {

			var $a = obj.$el.children('a');
			var $drop = this.activeDropRegions;
			var $clone;
			var $target;

			if ($a.hasClass('add-page')){
				$target = $drop[1];
				$clone = Report.templates.children('.page[data-layout="regular"]').clone();
				if ($target && $target.length) {
					if ($target.is('.page')) Report.document.trigger('document:addpage',[$clone,$target,'after']);
					else if ($target.is('.pagedropper')) Report.document.trigger('document:addpage',[$clone,$target.parent(),'before']);
				}
				else Report.document.trigger('document:addpage',[$clone]);
			} else if ($a.hasClass('add-move')){
				if (!$a.hasClass('empty')){
					var $allmoving = Report.document.find('.clipboardmoved');
					var $page = $drop[1];
					if ($allmoving.filter('.fieldwrap, .flex').length){
						if ($page && $page.length && $page.is('.page')){
							$page.trigger('click');
							if ($drop[3] && $drop[3].length && $drop[3].is('.fieldwrap')){
								if (this.ev.y > $drop[3].offset().top + ($drop[3].height()/3)){
									$drop[3].after($allmoving);
								} else {
									$drop[3].before($allmoving);
								}
							}
							else if ($drop[2] && $drop[2].length && $drop[2].is('.cell')) $drop[2].append($allmoving);
							else $page.find('.main > .row > .cell').append($allmoving);
						}
					} else if ($allmoving.filter('.page').length){
						if ($page && $page.length && $page.is('.page')) $page.trigger('click').after($allmoving);
						else if ($page && $page.length && $page.is('.pagedropper')) $page.trigger('click').parent().before($allmoving);
					}
					var $indexer = $allmoving.find('[data-indexer]');
					$indexer.trigger('edition:addindex',[$indexer.attr('data-indexer')]);
					$allmoving.removeClass('clipboardmoved');
					$a.addClass('empty').find('mark').text('0');
					Report.document.trigger('document:change',[$page]);
				}
			} else {
				var edition;
				var $page = $drop[1];
				if ($page && $page.length && $page.is('.page')){
					$page.trigger('click');
					if ($a.hasClass('add-richtext')) edition = 'richtext';
					else if ($a.hasClass('add-tinytext')) edition = 'tinytext';
					else if ($a.hasClass('add-text')) edition = 'text';
					else if ($a.hasClass('add-dynamic')) edition = 'dynamic';
					else if ($a.hasClass('add-indexing')) edition = 'indexing';
					$clone = $('<div class="fieldwrap" />').append(Report.templates.children('[data-edition="'+edition+'"]').clone());
					if ($drop[3] && $drop[3].length && $drop[3].is('.fieldwrap')){
						if (this.ev.y > $drop[3].offset().top + ($drop[3].height()/3)){
							$page.trigger('page:addedition',[$clone,$drop[3],'after']);
						} else {
							$page.trigger('page:addedition',[$clone,$drop[3],'before']);
						}
					}
					else if ($drop[2] && $drop[2].length && $drop[2].is('.cell')) $page.trigger('page:addedition',[$clone,$drop[2],'append']);
					else $page.trigger('page:addedition',[$clone]);
					// autoclick dynamic insertion
					if (edition == 'dynamic'){
						$clone.find('[data-edition]').addClass('empty-content').trigger('edition:tools').click();
						$clone.children('.edition-actions').find('.pick a').click();
					} else if (edition == 'indexing'){
						$clone.find('[data-edition]').trigger('edition:tools').click();
					} else {
						$clone.find('[data-edition]').focus();
					}
				}
			}
			$.each($drop||[],function(k,v){ v.removeClass('pep-dpa pep-dropping'); })
			obj.$el.removeClass('dragger');
		}
	});

	Report.wgtools.filter('.bottom').find('.zoom-in').on('click',function(){
		Report.document.trigger('panzoom:in');
	});
	Report.wgtools.filter('.bottom').find('.zoom-toggle').on('click',function(){
		var $this = $(this);
		if (Report.scroll.hasClass('unscrolled')){
			Report.document.trigger('panzoom:destroy');
		} else {
			Report.document.trigger('panzoom:init');
		}
	});
	Report.wgtools.filter('.bottom').find('.zoom-out').on('click',function(){
		Report.document.trigger('panzoom:out');
	});
	// -------------------------------------------------------





	// Page Tools --------------------------------------------
	var toolsPage = ''+
		'<ul class="page-actions noneditable" contenteditable="false">'+
		'<li class="noneditable label" contenteditable="false"></li>'+
		'<li data-action="edit" class="noneditable edit" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit page properties"></a></li>'+
		'<li data-action="bgimg" class="noneditable bgimg" contenteditable="false"><a class="icon-circle-pic" data-tip="Browse page background image"></a></li>'+
		'<li data-action="remove" class="noneditable remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this page"></a></li>'+
		'</ul>';

	var $toolsPage = $(toolsPage);
	Report.widget.append($toolsPage);
	Report.document.on('page:tools','.page',function(event){
		var $this = $(this);
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsPage.find('li.label').text('Page '+($this.parent().children('.page').index($this)+1));
		$toolsPage.find('li').each(function(){
			var $li = $(this).removeClass('disable deny allow');
			var a = $li.data('action');
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				if (a == 'bgimg' && !Report.view.attr('data-link-key')){
					$li.addClass('disable');
					$li.find('dfn span').text('Browse page background image (save the document first)');
				} else {
					$li.addClass('allow');
				}
			}
		});
		$this.prepend($toolsPage);
		var height = $this.height();
		var offset = $this.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $toolsPage.addClass('up');
		else $toolsPage.removeClass('up');
	});
	$toolsPage.on('click','.clone a',function(){
		var $page = $toolsPage.parent();
		var $clone = $page.clone();
		Report.document.trigger('document:addpage',[$clone,$page,'after']);
	});
	$toolsPage.on('click','.edit a',function(){
		var $page = $toolsPage.parent();
		Report.document.trigger('document:openfloat',[$page, {
			form:'page',
			layout: $page.data('layout')||'regular',
			index: $page.prevAll('.page').length + 1,
			total: $page.parent().children('.page').length,
			watermark:$page.data('watermark')||'yes',
		}]);
	});
	$toolsPage.on('click','.bgimg a',function(){
		var $a = $(this);
		if ($a.is('.disable') || $a.parent().is('.disable')) return false;
		var $page = $toolsPage.parent();
		if (!$page.attr('data-background')){
			var input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');
			input.onchange = function() {
				var file = this.files[0];
				var reader = new FileReader();
				reader.onload = function () {
					$page.css('background-image','url("'+reader.result+'")');
					$page.attr('data-background',reader.result);
					$.post(
						Report.widget.data('imgdatauploader'),{
						id:Report.view.data('link-key'),
						origin:Report.view.data('link-origin'),
						imgdata:reader.result
					},function(data){
						$page.css('background-image','url("'+data.src+'")');
						$page.attr('data-background',data.src);
						Report.document.trigger('document:change',[$page]);
						//console.log('imgdataUploader DONE',data);
					},"json")
					.fail(function(e,data){
						//console.error('imgdataUploader FAIL',data);
					});
				};
				reader.readAsDataURL(file);
			};
			input.click();
		} else {
			$page.removeAttr('data-background');
			$page.css('background-image','');
			Report.document.trigger('document:change',[$page]);
		}
	});

	$toolsPage.on('click','.remove a',function(){
		var $page = $toolsPage.parent();
		Report.widget.append($toolsPage);
		$page.trigger('page:remove');
		Report.document.trigger('document:numpage');
	});

	// -------------------------------------------------------




	// Edition Tools -----------------------------------------
	var toolsEdition = ''+
		'<ul class="edition-actions noneditable" contenteditable="false">'+
		'<li class="noneditable label" contenteditable="false"></li>'+
		'<li data-action="edit" class="noneditable edit" contenteditable="false"><a class="icon-wrench-cog" data-tip="Edit box properties"></a></li>'+
		'<li data-action="pick" class="noneditable pick" contenteditable="false"><a class="icon-picker-gd" data-tip="Pick box data"></a></li>'+
		'<li data-action="index" class="noneditable index" contenteditable="false"><a class="icon-list-1" data-tip="Set as indexed box"></a></li>'+
		'<li data-action="margin" class="noneditable margin" contenteditable="false"><a class="icon-box-margin-y" data-tip="Toggle box extra margin"></a></li>'+
		'<li data-action="move" class="noneditable move" contenteditable="false"><a class="icon-move-up-down" data-tip="Move box to clipboard"></a></li>'+
		'<li data-action="split" class="noneditable split" contenteditable="false"><a class="icon-split-vertical" data-tip="Split in two"></a></li>'+
		'<li data-action="rearrange" class="noneditable rearrange" contenteditable="false"><a class="icon-split-horizontal-box" data-tip="Rearrange auto breaks"></a></li>'+
		'<li data-action="remove" class="noneditable remove" contenteditable="false"><a class="icon-subtract"  data-tip="Remove this box"></a></li>'+
		'</ul>';

	var $toolsEdition = $(toolsEdition);
	Report.widget.append($toolsEdition);
	$toolsEdition.on('mousedown click',function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	Report.document.on('edition:tools','[data-edition]',function(event){
		var $this = $(this);
		var $wrap = $this.parent();
		var allowActions = $this.data('actions-allow') || '';
		var denyActions = $this.data('actions-deny') || '';
		$toolsEdition.find('li.label').text($this.attr('data-edition').charAt(0).toUpperCase() + $this.attr('data-edition').slice(1));
		$toolsEdition.find('li[data-action]').each(function(){
			var $li = $(this).removeClass('deny allow');
			var a = $li.data('action');
			if (a == 'margin'){
				if ($this.is('.extramargin')) $li.children('a').addClass('active');
				else $li.children('a').removeClass('active');
			}
			if (denyActions === 'all' || denyActions.indexOf(a) > -1 || (allowActions && allowActions.indexOf(a) === -1)){
				$li.addClass('deny');
			} else {
				if (a == 'index'){
					$li.removeClass('allow deny');
					if ($this.is('[data-edition*="text"]')) $li.addClass('allow');
					else $li.addClass('deny');
				} else if (a == 'rearrange'){
					$li.removeClass('allow deny');
					if ($wrap.is('[data-boxgroup]')) $li.addClass('allow');
					else $li.addClass('deny');
				} else {
					$li.addClass('allow');
				}
			}
		});

		if ($this.attr('data-edition') == 'dynamic') {
			$toolsEdition.find('li.edit, li.split, li.indexing').removeClass('allow').addClass('deny');
		} else if ($this.attr('data-edition') == 'indexing') {
			$toolsEdition.find('li.edit, li.split, li.pick').removeClass('allow').addClass('deny');
		} else {
			$toolsEdition.find('li.pick').removeClass('allow').addClass('deny');
		}

		$wrap.prepend($toolsEdition);
		var height = $wrap.height();
		var offset = $wrap.offset();
		var windowHeight = $(window).height();
		if (offset.top + height > windowHeight) $toolsEdition.addClass('up');
		else $toolsEdition.removeClass('up');
	});
	$toolsEdition.on('click','.clone a',function(){
		var $fieldwrap = $toolsEdition.parent();
		var $page = $fieldwrap.closest('.page');
		var $clone = $fieldwrap.clone();
		$page.trigger('page:addedition',[$clone,$fieldwrap,'after']);
	});
	$toolsEdition.on('click','.edit a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $toolsEdition.parent();
		var $content = $('<code>'+tinymce.get($edit.attr('id')).getContent()+'</code>');
		var $headercontent = $('<pre>'+$content.find('header,h1,h2,h3,h4').filter(':eq(0)').html()+'</pre>');
		$headercontent.find('mark').remove();
		Report.document.trigger('document:openfloat',[$edit, {
			form:'edition',
			type: $edit.attr('data-edition'),
			index: $edit.attr('data-indexer'),
			order: $fieldwrap.prevAll().length + 1,
			total: $fieldwrap.parent().children().length,
			header: $headercontent.text(),
			footer: $content.find('footer').html(),
			margin: $edit.hasClass('extramargin') ? 'S' : 'N',
		}]);
	});
	$toolsEdition.on('click','.pick a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		if ($fieldwrap.is('[data-boxgroup]')) $edit = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] > [data-edition]');
		var $editionfirst = $edit.first();
		var keys = [];
		$edit.find('[data-key]').each(function(){
			keys.push($(this).attr('data-key'));
		});
		if ($editionfirst.attr('data-key')) keys.push($edit.attr('data-key'));
		Report.document.trigger('document:openfloat',[$editionfirst, {
			form:'dynamic',
			name: $edit.attr('data-name'),
			keys: keys,
		}]);
	});
	$toolsEdition.on('click','.index a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		if ($edit.is('[data-indexer]')) $edit.trigger('edition:removeindex');
		else $edit.trigger('edition:addindex');
	});
	$toolsEdition.on('click','.margin a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		var $page = $fieldwrap.closest('.page');
		if ($fieldwrap.is('[data-boxgroup]')) $edit = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] > [data-edition]');
		$edit.toggleClass('extramargin');
		$a.toggleClass('active');
		Report.document.trigger('document:change',[$page]);
	});
	$toolsEdition.on('click','.move a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		$edit.trigger('edition:clipboardmoved');
	});
	$toolsEdition.on('click','.rearrange a',function(){
		var $a = $(this);
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		var $boxgroup = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
		var $page = $boxgroup.filter(':eq(0)').closest('.page');
		boxFitter.testPage($page,true);
	});
	$toolsEdition.on('click','.split a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $fieldwrap = $edit.parent();
		var $flex = $edit.closest('.flex');
		var $page = $fieldwrap.closest('.page');
		if ($flex.length === 0){
			$fieldwrap.wrapAll('<div class="flex"/>');
			$flex = $edit.closest('.flex');
		}
		var $clone = $('<div class="fieldwrap" />').append(Report.templates.children('[data-edition="'+$edit.data('edition')+'"]').clone());
		$page.trigger('page:addedition',[$clone,$fieldwrap,'after']);
		var qtdewrap = $flex.children('.fieldwrap').length;
		$flex.attr('class','flex childs-'+qtdewrap);
	});
	$toolsEdition.on('click','.remove a',function(){
		var $edit = $toolsEdition.siblings('[data-edition]');
		var $flex = $edit.closest('.flex');
		Report.widget.append($toolsEdition);
		$edit.trigger('edition:remove');
		if ($flex.length > 0){
			var $simblingwrap = $flex.children('.fieldwrap');
			if ($simblingwrap.length === 1){
				$flex.after($simblingwrap);
				$flex.remove();
			}
		}
	});
	// -------------------------------------------------------





	// PanZoom Events ----------------------------------------
	Report.document.on('panzoom:init',function(event){
		var instance = Report.document.data('panzoom');
		if (!instance){
			var element = Report.document.get(0);
			instance = panzoom(element, {
				maxZoom: 2.4,
				minZoom: 0.6,
				bounds: true,
				boundsPadding: 0.1,
				beforeWheel: function(e) {
					// allow wheel-zoom only if altKey is down. Otherwise - ignore
					var shouldIgnore = !e.ctrlKey;
					if (shouldIgnore && Report.scroll.hasClass('unscrolled')){
						var transform = instance.getTransform();
					instance.moveTo(transform.x, transform.y - (e.deltaY * transform.scale));
					}
					return shouldIgnore;
				},
				beforeMouseDown: function(e) {
					// allow mouse-down panning only if altKey is down. Otherwise - ignore
					var shouldIgnore = !e.ctrlKey;
					return shouldIgnore;
				},
				filterKey: function(/* e, dx, dy, dz */) {
					return true;
				}
			});
			Report.document.data('panzoom',instance);
		}
		Report.scroll.addClass('unscrolled');
		var $toggle = Report.wgtools.filter('.bottom').find('.zoom-toggle');
		$toggle.parent().css('background-color','#26a9ff');
	});
	Report.document.on('panzoom:in',function(event){
		Report.document.trigger('panzoom:init');
		var instance = Report.document.data('panzoom');
		var transform = instance.getTransform();
		instance.zoomAbs(parseInt(Report.area.width()/2),0, transform.scale + 0.2);
	});
	Report.document.on('panzoom:out',function(event){
		Report.document.trigger('panzoom:init');
		var instance = Report.document.data('panzoom');
		var transform = instance.getTransform();
		instance.zoomAbs(parseInt(Report.area.width()/2),0, transform.scale - 0.2);
	});
	Report.document.on('panzoom:destroy',function(event){
		var instance = Report.document.data('panzoom');
		if (instance) instance.dispose();
		Report.document.css('transform','none');
		Report.document.removeData('panzoom');
		var $toggle = Report.wgtools.filter('.bottom').find('.zoom-toggle');
		$toggle.parent().attr('style','');
		Report.scroll.removeClass('unscrolled');
	});
	Report.document.on('wheel',function(event){
		if (event.ctrlKey && !Report.scroll.hasClass('unscrolled')){
			event.stopPropagation();
			event.preventDefault();
			if (event.originalEvent.deltaY > 0) Report.document.trigger('panzoom:out');
			else Report.document.trigger('panzoom:in');
		}
	});
	// -------------------------------------------------------





	// Edition Events -------------------------------------------
	Report.document.on('mouseenter','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent().addClass('hover');
	});
	Report.document.on('mouseleave','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent().removeClass('hover');
	});
	Report.document.on('focus','[data-edition]',function(event){
		var $this = $(this);
		var $wrap = $this.parent();
		$this.trigger('edition:active');
		$wrap.addClass('focus');
	});
	Report.document.on('blur','[data-edition]',function(){
		var $this = $(this);
		var $wrap = $this.parent();
		$wrap.removeClass('hover focus');
		if ($this.hasClass('keyboarded')){
			var $autofill = $this.find('[data-autofill]');
			if ($this.data('autofill')){
				$autofill = $autofill.add($this);
			}
			$autofill.each(function(){
				var $e = $(this);
				var $autofill = Report.area.find('[data-autofill="'+$e.data('autofill')+'"]');
				$autofill.filter('[data-edition="text"]').text($e.text());
				$autofill.filter('[data-edition="tinytext"],[data-edition="richtext"]').html($e.html());
				if ($e.text()) $autofill.removeClass('empty-content');
			});
			$this.removeClass('keyboarded');
		}
	});
	Report.document.on('click','[data-edition]',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $wrap = $this.parent();
		if ($this.is('[data-edition="dynamic"], [data-edition="indexing"]')){
		//if ($this.attr('data-edition') == 'dynamic' || $this.attr('data-edition') == 'indexing'){
			$this.trigger('edition:active');
		}
	});
	Report.document.on('edition:resizable','[data-edition]',function(event){
		var $this = $(this);
		if (!$this.hasClass('has-resizable')){
			var $wrap = $this.parent();
			var $page = $this.closest('.page');
			if ($page.is('[data-structure*="resizable"]') || $this.data('resizable')){
				$wrap.prepend('<div class="resize dragleft"/>');
				$wrap.append('<div class="resize dragright"/>');
				var $pep = $wrap.find('.resize').pep({
					axis: 'x',
					shouldEase: false,
					place: false,
					useCSSTranslation: false,
					start:function(ev, obj){
						var $d = obj.$el;
						$this.trigger('edition:active');
					},
					stop:function(ev, obj){
						var $d = obj.$el;
						var dpos = $d.position();
						var wpos = $wrap.position();
						var wwid = $wrap.width();
						var oldposition = $this.attr('data-position');
						if ($d.hasClass('dragleft')) $wrap.css({ width:wwid-dpos.left, left:wpos.left+(dpos.left) });
 						if ($d.hasClass('dragright')) $wrap.css({ width:wwid+(dpos.left-wwid) });
						$this.attr('data-position','top:'+($wrap.css('top')||0)+'; left:'+($wrap.css('left')||0)+'; width:'+$wrap.width()+'px');
						$this.trigger('edition:input');
						/** HISTORY STACK *****************************************************************************************************************************************************/
						historyStack.push({
							do:   { action:'positionedition', edition:$this, fieldwrap:$wrap, position:$this.attr('data-position'), scrolltop:Report.scroll.scrollTop(), label:'Box positioned' },
							undo: { action:'positionedition', edition:$this, fieldwrap:$wrap, position:oldposition, scrolltop:Report.scroll.scrollTop(), label:'Box repositioned' }
						});
						/**********************************************************************************************************************************************************************/
						$d.attr('style','');
					}
				});
				$this.addClass('has-resizable');
			}
		}
	});
	Report.document.on('edition:draggable','[data-edition], .block.logo',function(event){
		var $this = $(this);
		if (!$this.hasClass('has-draggable')){
			var $target = $this.is('[data-edition]') ? $this.parent() : $this;
			var $page = $this.closest('.page');
			if ($page.is('[data-structure*="draggable"]') || $this.data('draggable')){
				var $pep = $target.pep({
					shouldEase: false,
					useCSSTranslation: false,
					constrainTo: 'parent',
					elementsWithInteraction: $this.is('[data-edition]') ? '.resize, .block, li[data-action]' : 'input',
					stop:function(ev, obj){
						var oldposition = $this.attr('data-position');
						$this.attr('data-position','top:'+($target.css('top')||0)+'; left:'+($target.css('left')||0)+'; width:'+$target.width()+'px');
						$this.trigger('edition:input');
						/** HISTORY STACK *****************************************************************************************************************************************************/
						historyStack.push({
							do:   { action:'positionedition', edition:$this, fieldwrap:$target, position:$this.attr('data-position'), scrolltop:Report.scroll.scrollTop(), label:'Box positioned' },
							undo: { action:'positionedition', edition:$this, fieldwrap:$target, position:oldposition, scrolltop:Report.scroll.scrollTop(), label:'Box repositioned' }
						});
						/**********************************************************************************************************************************************************************/
					}
				});
				$this.addClass('has-draggable');
			}
		}
	});
	Report.document.on('edition:analystsdrag','.block.analysts',function(event){
		var $this = $(this);
		var $lines = $this.find('tr');
		$lines.filter(':not(.peped)').pep({
			place: false,
			axis: 'y',
			shouldEase: false,
			droppable: $lines,
			revert: true,
			revertIf: function (ev, obj) {
				return !this.activeDropRegions.length || this.activeDropRegions.length == 1;
			},
			start: function (ev, obj) {
				obj.$el.addClass('dragger');
				$this.trigger('edition:active');
			},
			stop: function (ev, obj) {
				var closest = $.calcSort('y', obj.$el, this.activeDropRegions);
				if (closest.placement) {
					if (closest.placement == 'after') obj.$el.insertAfter(closest.element);
					else if (closest.placement == 'before') obj.$el.insertBefore(closest.element);
					var matrix = obj.matrixToArray(obj.matrixString());
					var x = -1 * matrix[4];
					var y = -1 * matrix[5];
					obj.moveToUsingTransforms(x, y);
					obj.$el.css({ position: 'relative' });
					$this.trigger('edition:input');
					$this.trigger('edition:change');
				}
				obj.$el.removeClass('dragger');
			}
		});
		$lines.addClass('peped');
	});
	Report.document.on('edition:addindex','[data-edition*="text"]',function(event,idxtype,nonexts){
		var $this = $(this);
		var editor = tinymce.get($this.attr('id'));
		var $wrap = $this.parent().addClass('indexed');
		var $content =  $('<pre>'+editor.getContent()+'</pre>');
		if (!$this.is('[data-indexer]') || idxtype){
			if (idxtype){
				$this.attr('data-indexer',idxtype);
			} else {
				var $elems = $this.children('table, img, p:not(:empty)');
				if ($elems.filter('table').length) $this.attr('data-indexer','table');
				else if ($content.find('img').length) $this.attr('data-indexer','image');
				else if ($content.find('p:not(:empty)').length) $this.attr('data-indexer','info');
				idxtype = $this.attr('data-indexer');
			}
		}
		$content.find('mark').remove();
		if (idxtype){
			var boxindex = Report.document.find('[data-indexer="'+idxtype+'"]').index($this) + 1;
			var $labelable = $content.children('header,h1,h2,h3,h4').filter(':eq(0)');
			if (!$labelable.length) $labelable = $('<h4>Custom Box Title</h4>').prependTo($content);

			if (idxtype == 'table') $labelable.prepend('<mark>Table '+boxindex+': </mark>');
			else if (idxtype == 'chart') $labelable.prepend('<mark>Chart '+boxindex+': </mark>');
			else if (idxtype == 'image') $labelable.prepend('<mark>Image '+boxindex+': </mark>');
			else $labelable.prepend('<mark>Info '+boxindex+': </mark>');
		}
		editor.setContent($content.html());
		if (idxtype && !nonexts){
			Report.document.find('[data-indexer="'+idxtype+'"]:gt('+(boxindex-1)+')').each(function(){
				$(this).trigger('edition:addindex',[idxtype,true]);
			});
		}
	});
	Report.document.on('edition:removeindex','[data-edition*="text"]',function(event){
		var $this = $(this);
		var $wrap = $this.parent().removeClass('indexed');
		var $content =  $('<pre>'+tinymce.get($this.attr('id')).getContent()+'</pre>');
		var idxtype = $this.attr('data-indexer');
		if (idxtype){
			var boxindex = Report.document.find('[data-indexer="'+idxtype+'"]').index($this);
			$content.find('header,h1,h2,h3,h4').filter(":contains('Custom Box Title')").remove();
			$content.find('mark').remove();
			$this.removeAttr('data-indexer');
			tinymce.get($this.attr('id')).setContent($content.html());
			Report.document.find('[data-indexer="'+idxtype+'"]').each(function(){
				var $e = $(this);
				$e.trigger('edition:addindex',[$e.attr('data-indexer'),true]);
			});
		}
	});
	Report.document.on('edition:createtoc','[data-edition="indexing"]',function(event){
		var $this = $(this);
		var $wrap = $this.parent().removeClass('error');
		var $indexers = Report.document.find('[data-indexer]');
		var $allPages = Report.document.find('.page');
		var html = '<table class="idxtoc" autosize="0" style="overflow: wrap">';
		$this.html('<p class="no-data"><h3>Table of Contents</h3>There\'s no indexed box in current document.</p>');
		$indexers.each(function(){
			var $idx = $(this);
			var editor = tinymce.get($idx.attr('id'));
			var $page = $idx.closest('.page');
			var $content =  $('<pre>'+editor.getContent()+'</pre>');
			var $labelable = $content.children('header,h1,h2,h3,h4,p').filter(':eq(0)');
			html += ''+
			'<tr>'+
			'<td class="boxlabel"><b class="bold">'+$labelable.text().substring(0,50)+'</b></td>'+
			'<td class="pagenum">Page '+($allPages.index($page)+1)+'</td>'+
			'</tr>';
		});
		html += '</table>';
		if ($indexers.length) {
			html = '<h2>Table of Content</h2>'+html;
		} else {
			html = '<b>Table of Content</b> is empty';
			$wrap.addClass('error');
		}
		$this.html(html);
	});
	Report.document.on('edition:jscode','[data-edition]',function(event){
		var $this = $(this);
		$this.find('code[data-type="javascript"]').each(function(){
			var $code = $(this);
			var jscode = window.atob($code.text());
			var $js = $('<script data-widget-event="edition:jscode">'+jscode+'</script>');
			$this.append($js);
			$code.remove();
			$js.remove();
		});
	});
	Report.document.on('edition:cleanmce','[data-edition]',function(event){
		var $this = $(this);
		$this.removeClass('mce-content-body inited content-placeholder mce-edit-focus').removeAttr('id').removeAttr('contenteditable');
		$this.siblings('.edition-actions').remove();
	});
	Report.document.on('edition:wrapfield','[data-edition]',function(event){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		if (!$fieldwrap.is('.fieldwrap')){
			$this.wrap('<div class="fieldwrap '+($this.data('indexer') ? 'indexed' : '')+'" '+($this.data('belongstogroup')?'data-boxgroup="'+$this.data('belongstogroup')+'"':'')+' />');
			$fieldwrap = $this.parent();
		} else {
			$fieldwrap.removeClass('focus active selected error');
		}
		if ($this.attr('data-position')){
			$fieldwrap.attr('style',$this.attr('data-position'));
		}
		if (!$this.hasClass('has-resizable')) $this.trigger('edition:resizable');
		if (!$this.hasClass('has-draggable')) $this.trigger('edition:draggable');
		$this.css('opacity',1);
	});

	Report.document.on('edition:change','[data-edition]',function(){
		var $this = $(this);
		var $page = $this.closest('.page');
		Report.document.trigger('field:input');
		Report.document.trigger('document:change',[$page]);
	});
	Report.document.on('edition:nodechange','[data-edition]',function(event,node){
		var $this = $(this);
		var $node = $(node);
		var $toolroot = $('#tinymceinlinetoolbar .mce-tinymce-inline:visible');
		if ($node.is('table')){
			$toolroot.find('.mce-btn-group:eq(2) .mce-btn:eq(0), .mce-btn-group:eq(2) .mce-btn:eq(3), .mce-btn-group:eq(4), .mce-btn-group:eq(6), .mce-btn-group:gt(9)').hide();
			$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(2) .mce-btn:eq(4), .mce-btn-group:eq(7), .mce-btn-group:eq(8), .mce-btn-group:eq(9)').show();
		} else if ($node.is('img')){
			$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(4), .mce-btn-group:gt(5)').hide();
			$toolroot.find('.mce-btn-group:gt(9)').show();
		} else {
			if (!$node.is('[data-edition]')){
				$node = $node.closest('table, img', $this);
				if ($node.length){
					return $this.trigger('edition:nodechange',$node);
				}
			}
			$toolroot.find('.mce-btn-group:eq(2) .mce-btn:eq(4), .mce-btn-group:gt(6)').hide();
			$toolroot.find('.mce-btn-group:eq(2), .mce-btn-group:eq(2) .mce-btn:eq(0), .mce-btn-group:eq(2) .mce-btn:eq(3), .mce-btn-group:eq(4), .mce-btn-group:eq(6)').show();
		}
		$toolroot.addClass('adapted');
	});
	Report.document.on('edition:remove','[data-edition]',function(event){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page;
		if ($fieldwrap.data('boxgroup')){
			Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"] [data-edition]').each(function(ke, e){
				var $e = $(e);
				Report.widget.append($e.siblings('.edition-actions'));
				$page = $page ? $page : $e.closest('.page');
				//if ($e.attr('id') && $e.is('.mce-content-body')) tinymce.remove('#'+$e.attr('id'));
				$e.parent().remove();
			});
		} else {
			$page = $this.closest('.page');
			Report.widget.append($this.siblings('.edition-actions'));
			//if ($this.attr('id') && $this.is('.mce-content-body')) tinymce.remove('#'+$this.attr('id'));
			$fieldwrap.remove();
		}
		if (!Report.document.hasClass('preventeventchange')){
			Report.document.trigger('document:change',[$page]);
			$.tipster.notify('Edition box removed');
			/** HISTORY STACK *****************************************************************************************************************************************************/
			historyStack.push({
				do: 	{ action:'removeedition', edition:$this, scrolltop:Report.scroll.scrollTop(), label:'Added box removed' },
				undo:   { action:'addedition', page:$page, fieldwrap:$fieldwrap, reference:$fieldwrap.prev(), placement:$fieldwrap.prev().length ? 'after' : 'prepend', scrolltop:Report.scroll.scrollTop(), label:'Box added again' },
			});
			/**********************************************************************************************************************************************************************/
		}
	});
	Report.document.on('edition:active','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $page = $this.closest('.page',Report.document);
		$page.trigger('page:active');
		$fieldwrap.removeClass('hover');
		Report.document.find('.fieldwrap.active').removeClass('active');
		Report.document.find('.fieldlink').remove();
		$fieldwrap.addClass('active');
		$this.trigger('edition:tools');

		Report.document.find('.boxgroupconnector').remove();

		if ($fieldwrap.data('boxgroup')){
			var $lastbox;
			var $scrollable = $fieldwrap.closest('.scroll-all');
			var scrollTop = $scrollable.scrollTop() - $scrollable.offset().top;
			Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]').each(function(kb, box){
				var $box = $(box);
				$box.addClass('active');
				if ($lastbox){
					var $connector = $('<div class="boxgroupconnector"></div>');
					Report.document.append($connector);
					var postop = $lastbox.offset().top + $lastbox.height();
					$connector.css({
						top: scrollTop + postop,
						height: $box.offset().top - postop,
					});
				}
				$lastbox = $box;
			});
		}
	});

	Report.document.on('edition:clipboardmoved','[data-edition]',function(){
		var $this = $(this);
		var $fieldwrap = $this.parent();
		var $edge = $fieldwrap.parent();
		var $tool = Report.wgtools.find('.add-move');
		if ($edge.is('.flex')){
			$fieldwrap = $edge;
		}
		else if ($fieldwrap.is('[data-boxgroup]')){
			$fieldwrap = Report.document.find('[data-boxgroup="'+$fieldwrap.data('boxgroup')+'"]');
		}
		$fieldwrap.toggleClass('clipboardmoved');
		var qtmoved = Report.document.find('.clipboardmoved').length;
		if (!qtmoved) $tool.addClass('empty').find('mark').text('0');
		else $tool.removeClass('empty').find('mark').text(qtmoved);
	});
	// -------------------------------------------------------






	// Page Events -------------------------------------------
	Report.document.on('page:addedition','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		var $edit = $new.children('[data-edition]');
		$new.find('.edition-actions').remove();
		$edit.removeAttr('id');
		if ($ref){
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
			} else if (placement == 'append'){
				$new.appendTo($ref);
			} else if (placement == 'prepend'){
				$new.prependTo($ref);
			}
		} else {
			$page.find('.main .cell:eq(0)').append($new);
		}
		$edit.trigger('edition:cleanmce');
		$edit.trigger('edition:init');
		Report.document.trigger('document:change',[$page]);
		if ($new.is('[data-boxgroup]')) return;
		/** HISTORY STACK *****************************************************************************************************************************************************/
		historyStack.push({
			do:   { action:'addedition', page:$page, fieldwrap:$new, reference:$ref, placement:placement, scrolltop:Report.scroll.scrollTop(), label:'Box added again' },
			undo: { action:'removeedition', edition:$edit, scrolltop:Report.scroll.scrollTop(), label:'Added box removed' }
		});
		/**********************************************************************************************************************************************************************/

	});
	Report.document.on('page:scrollto','.page',function(event,$new,$ref,placement){
		var $page = $(this);
		$(Report.document.closest('.scroll-default')).scrollTo($page,350,{ offset:{top:-50} });
	});
	Report.document.on('page:remove','.page',function(){
		var $this = $(this);
		var $next = $this.next('.page');
		Report.document.addClass('preventeventchange');
		$this.find('.main [data-edition]').each(function(){
			$(this).trigger('edition:remove');
		});
		Report.document.removeClass('preventeventchange');
		$this.remove();
		Report.document.trigger('document:change',[$next]);
		$.tipster.notify('Page removed');
		/** HISTORY STACK *****************************************************************************************************************************************************/
		historyStack.push({
			do: 	{ action:'removepage', page:$this, scrolltop:Report.scroll.scrollTop(), label:'Added page removed' },
			undo:   { action:'addpage', page:$this, reference:$this.prev('.page'), placement:$this.prev('.page').length ? 'after' : 'prepend', scrolltop:Report.scroll.scrollTop(), label:'Page added again' },
		});
		/**********************************************************************************************************************************************************************/
	});
	Report.document.on('page:active','.page',function(){
		var $this = $(this);
		Report.document.trigger('page:unactive');
		$this.addClass('active');
		$this.trigger('page:tools');
	});
	Report.document.on('page:unactive',function(){
		Report.document.find('.page.active,.fieldwrap.active').removeClass('active');
		Report.document.find('[data-mce-selected]').removeAttr('data-mce-selected');
		Report.document.find('.fieldlink').remove();
		Report.document.find('.boxgroupconnector').remove();
	});
	// -------------------------------------------------------




	// Document Events ---------------------------------------
	Report.document.on('document:change',function(event,$page){
		/////////////////////////////////////////////////////////////////
		if (Report.document.hasClass('preventeventchange')) return false;
		/////////////////////////////////////////////////////////////////
		if ($page) boxFitter.testPage($page);
		Report.document.trigger('document:validate');
		Report.widget.trigger('field:input');
		Report.document.find('.boxgroupconnector').remove();
		Report.document.find('[data-edition="indexing"]').trigger('edition:createtoc');
	});
	Report.document.on('document:openfloat',function(event,$origin,json){
		var data = $origin.link();
		var id = $origin.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		data.id = id;
		data.json = $.extend(true, json, Report.view.link('json') || {});
		Network.link(data);
		$origin.attr('id',id);
	});
	Report.document.on('document:hasinited',function(){
		if (!Report.document.hasClass('loaded') && !Report.editors.filter(':not(.inited)').length){
			boxFitter.testPage();
			Report.document.addClass('loaded');
			Report.document.trigger('document:validate');
		}
	});
	Report.document.on('document:validate',function(){
		var invalids = 0;
		Report.validations.each(function(){
			var $v = $(this);
			var $query = Report.document.find($v.attr('selector'),);
			var testCount = $v.attr('count') ?  parseInt($query.length) === parseInt($v.attr('count')) : null;
			var testMin = $v.attr('min') ?  parseInt($query.length) >= parseInt($v.attr('min')) : null;
			var testMax = $v.attr('max') ?  parseInt($query.length) <= parseInt($v.attr('max')) : null;
			if (testCount === false || testMin === false || testMax === false){
				$v.attr('valid','false');
				invalids++;
			} else {
				$v.attr('valid','true');
			}
		});
		var $vchecked = Report.widget.find('.validation-checked').removeClass('icon-close3');
		if (invalids === 0){
			Report.variables.filter('[name="isValid"]').text('S');
			Report.document.trigger('document:valid');
			$vchecked.addClass('icon-done').parent().css('background','#1c985f');
			$vchecked.find('b').remove();
		} else {
			Report.variables.filter('[name="isValid"]').text('N');
			Report.document.trigger('document:invalid');
			$vchecked.removeClass('icon-done').parent().css('background','#e24040');
			$vchecked.html('<b>!'+invalids+'</b>');
		}
	});
	Report.document.on('document:addpage',function(event,$new,$ref,placement){
		$new.find('.page-actions').remove();
		$new.removeAttr('id').css('opacity','0');
		if ($ref){
			if (placement == 'after'){
				$new.insertAfter($ref);
			} else if (placement == 'before'){
				$new.insertBefore($ref);
			}
		} else {
			Report.document.append($new);
		}
		$new.find('[data-edition]').trigger('edition:cleanmce');
		Report.document.trigger('document:numpage');
		$new.trigger('edition:init');
		$new.trigger('page:active');
		$new.trigger('page:scrollto');
		Report.document.trigger('document:change',[$new]);
		$new.velocity({
			scale:[1,1.1],
			opacity:[1,0]
		},{
			easing: "ease-out",
			duration:200,
			complete: function(){
				/** HISTORY STACK *****************************************************************************************************************************************************/
				historyStack.push({
					do:  	{ action:'addpage', page:$new, reference:$ref, placement:placement, scrolltop:Report.scroll.scrollTop(), label:'Page added again' },
					undo: 	{ action:'removepage', page:$new, scrolltop:Report.scroll.scrollTop(), label:'Added page removed' },
				});
				/**********************************************************************************************************************************************************************/
			}
		});
	});
	Report.document.on('document:numpage',function(event,$new,$ref,placement){
		var $pages = Report.document.children('.page');
		$pages.each(function(){
			var $page = $(this);
			$page.find('[data-pagenumber] i').text($pages.index($page) + 1);
		});
	});
	Report.document.on('click',function(event){
		Report.document.trigger('page:unactive');
	});
	Report.document.on('click','.page',function(event){
		event.stopPropagation();
		$(this).trigger('page:active');
	});
	// -------------------------------------------------------


	// MCE Setup ---------------------------------------------
	var mceSetup = {
		menubar: false,
		inline: true,
		fixed_toolbar_container: '#tinymceinlinetoolbar',
		plugins: [
			'placeholder lists link image imagetools charmap',
			'noneditable visualblocks',
			'textcolor colorpicker media table powerpaste'
		],
		noneditable_noneditable_class: 'noneditable',
		fontsize_formats: "8px 9px 10px 11px 12px 14px 16px 18px 20px 22px",
		powerpaste_word_import: 'merge',
		powerpaste_html_import: 'merge',
		browser_spellcheck: true,
		textcolor_map: [
			"FCFCFC", "Snow White",
			"D2D2D2", "Silver",
			"B0B0B0", "Gray",
			"808080", "Cloudy",
			"101010", "Black",
			"a24242", "Wine",
			"Ef4949", "Red",
			"F56619", "Orange",
			"f1a027", "Yellow",
			"65ca76", "Regular green",
			"14943b", "Dark green",
			"194780", "BTG Dark",
			"3d98d8", "BTG Lite",
			"3371e6", "Ocean",
			"874ba7", "Purple",
			"d053af", "Pink",
		],
		setup: function (editor) {
			editor.addButton('browseimg', {
				text: null,
				icon: 'image',
				label: 'Browse',
				tooltip: "Browse local image",
				onclick: function () {
					var input = document.createElement('input');
					input.setAttribute('type', 'file');
					input.setAttribute('accept', 'image/*');
					input.onchange = function() {
						var file = this.files[0];
						var reader = new FileReader();
						reader.onload = function () {
							var img = document.createElement('img');
							img.src = reader.result;
							var $content = $('<pre></pre>');
							$content.append(img);
							var $target = $(editor.selection.getNode());
							if (!$target.prev('h3,table,img').length && !$target.closest('p',Report.document).prev('h3,table,img').length && !$target.closest('p',Report.document).prev('h3,table,img').length) $content.prepend('<h3>Local Image Title</h3>');
							if (!$target.next('h5,table,img').length && !$target.closest('table',Report.document).next('h5,table,img').length && !$target.closest('table',Report.document).next('h5,table,img').length) $content.append('<h5>Local Image Footer/Source</h5>');
										editor.insertContent($content.html());
						};
						reader.readAsDataURL(file);
					};
					input.click();

				}
			});
			var $ed = $(editor.getElement());
			editor.on('init', function (e) {
				$ed.addClass('inited').addClass('sui-restric-activity-control');
				Report.document.trigger('document:hasinited');
			});
			editor.on('click', function (e) {
				$ed.trigger('edition:nodechange',[e.target]);
			});
			editor.on('keydown', function (e) {
				if (e.ctrlKey && e.keyCode != 86 && e.keyCode != 88) return true;
				$ed.addClass('contentchanged');
				$ed.addClass('keyboarded');
				$ed.trigger('edition:input');
			});
			editor.on('input', function (e) {
				$ed.addClass('contentchanged');
			});
			editor.on('change', function (e) {
				$ed.addClass('contentchanged');
			});
			editor.on('blur', function (e) {
				if ($ed.hasClass('contentchanged')){
					setTimeout(function(){
						$ed.trigger('edition:change');
						$ed.removeClass('contentchanged');
					},10);
				}
			});
		}
	};
	var mceSetupText = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="text"]:not(.inited)',
		forced_root_block : false,
		toolbar: 'undo redo removeformat | bold italic underline',
		valid_elements: 'strong,em,span[style],a[href]',
		valid_styles: {
			'*': 'color,text-decoration,text-align'
		},
	});
	var mceSetupTinytext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="tinytext"]:not(.inited)',
		forced_root_block : 'p',
		toolbar: 'undo redo removeformat | bold italic underline | forecolor | alignleft aligncenter alignright',
		valid_elements: 'p[style],h1[style|class],h2[style|class],h3[style|class],h4[style|class],strong[style]/b[style],em,span[style|class],a[href],br',
		valid_styles: {
			'*': 'color,text-decoration,text-align,font-style'
		},
	});
	var mceSetupRichtext = $.extend(true, {}, mceSetup, {
		selector: '[data-edition="richtext"]:not(.inited)',
		placeholder:'Enter text, tables and images here...',
		forced_root_block : 'p',
		table_appearance_options: false,
		imagetools_toolbar: 'none',
		paste_data_images: true,
		toolbar: [
			'undo redo removeformat | bold italic underline | styleselect fontsizeselect forecolor backcolor cellcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent | browseimg | link | table | tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | rotateleft rotateright | flipv fliph | editimage imageoptions'
		],
		automatic_uploads: true,
		file_picker_types: 'image',
		powerpaste_allow_local_images: true,
		table_toolbar: '',
		table_resize_bars: false,
		valid_elements: 'header[style|class],p[style|class],h1[style|class],h2[style|class],h3[style|class],h4[style|class],h5[style|class],img[style|src|class],table[style|border|cellpadding|cellspacing|class],colgroup[style],col[style,span],tbody,thead,tfoot,tr[style|height],th[style|colspan|rowspan|align],td[style|colspan|rowspan|align],a[href|target],strong[style],b[style],ul[style],ol[style],li[style],span[style],em,br,mark',
		valid_styles: {
			'header': 'font-size,font-family,color,text-decoration,text-align',
			'h5': 'font-size,font-family,color,text-decoration,text-align',
			'p': 'font-size,font-family,color,text-decoration,text-align',
			'table': 'border,border-colapse,border-color,border-style,background-color,background,color,width,height,cellpadding,cellspacing',
			'tr': 'style,background-color,background,height',
			'th': 'rowspan,colspan,height,width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,white-space',
			'td': 'rowspan,colspan,height,width,font-weight,text-align,background,background-color,padding-top,padding-bottom,padding-right,padding-left,color,font-size,font-style,text-decoration,font-family,vertical-align,border,border-top,border-left,border-right,border-bottom,border-color,border-image,white-space',
			'img': 'width',
			'strong': 'font-size,font-family,color,text-decoration,text-align,background-color',
			'span': 'font-size,font-family,color,text-decoration,text-align,background-color',
		},
		style_formats: [
			{title: 'Main Header', block: 'header'},
			{title: 'h1', block: 'h1'},
			{title: 'h2', block: 'h2'},
			{title: 'h3', block: 'h3'},
			{title: 'h4', block: 'h4'},
			{title: 'Paragraph', block: 'p'},
			{title: 'Footer/Source', block: 'h5'},
		],
		paste_preprocess : function(pl, o) {
			var $content = $('<div>'+o.content+'</div>');
			$content.find('p,h1,h2,h3,h4').removeAttr('style');
			var $td = $content.find('td[style*="border:none"], td[style*="border: none"]');
			if ($td.length) $td.css('border','');
			var $imgtable = $content.children('img,table');
			$imgtable.addClass('pastedelement');
			var $target = $(o.target.selection.getNode());
			if ($imgtable.length){
				if (!$target.prev('h3,table,img').length && !$target.closest('p',Report.document).prev('h3,table,img').length && !$target.closest('p',Report.document).prev('h3,table,img').length) $content.prepend('<h3>Clipboard Content Title</h3>');
				if (!$target.next('h5,table,img').length && !$target.closest('table',Report.document).next('h5,table,img').length && !$target.closest('table',Report.document).next('h5,table,img').length) $content.append('<h5>Clipboard Content Footer/Source</h5>');
				$imgtable.removeAttr('width').removeAttr('height');
			}
			o.content = $content.html();
		},
	});


	Report.widget.on('edition:init','.sui-report-document, .page, [data-edition]',function(event){

		event.stopPropagation();
		event.stopImmediatePropagation();

		var $elem = $(this);
		var id = $elem.attr('id') || 'sui' + $.md5(Math.rand()).substring(0, 16);
		var $edits;
		var setup = {}
		var selector;

		if ($elem.is('[data-edition]')){
			if (!$elem.is('.inited')){
				$edits = $elem;
				selector = id;
				$elem.attr('id',id);
			}
		} else {
			$elem.attr('id',id);
			$edits = $elem.find('[data-edition]:not(.inited)');
			$elem.find('.block.logo').trigger('edition:draggable');
			$elem.find('.block.analysts').trigger('edition:analystsdrag');
		}

		if (!$edits.length) return;

		if ($edits.filter('[data-edition="text"]').length) setup.text = $.extend(true, {}, mceSetupText);
		if ($edits.filter('[data-edition="tinytext"]').length) setup.tinytext = $.extend(true, {}, mceSetupTinytext);
		if ($edits.filter('[data-edition="richtext"]').length) setup.richtext = $.extend(true, {}, mceSetupRichtext);

		$edits.trigger('edition:wrapfield');
		$edits.trigger('edition:jscode');

		$.each(setup,function(k,v){
			v.selector = '#'+(selector || id+' '+v.selector);
			tinymce.init(v);
		});

		setTimeout(function(){
			Report.document.removeClass('preventhistorystack');
		},2000);

	});
	// -------------------------------------------------------

	Report.document.trigger('edition:init');

	Report.wgdata = {};

	var wdata = {
		aux: {
			getClassAt: function($e,i){
				var cls = $e.attr('class');
				return $.trim(cls).replace(/\s+/g,' ').split(' ')[i];
			},
			parseAttr: function($s,$e,regex){
				var edata = $e.attr();
				$.each(edata,function(k,v){
					if (regex.test(k)){
						$s.attr(k.replace('data-','data:'),v);
					}
				});
			},
			strXQ: function(str){
				return $($.parseXML('<sourceui xmlns:data="data" xmlns:link="link" xmlns:event="event" xmlns:type="type" xmlns:prop="prop" xmlns:attr="attr" xmlns:class="class" xmlns:style="style" xmlns:label="label" xmlns:value="value">'+str+'</sourceui>').documentElement).children();
			},
			xqString: function ($sui) {
				var xmlData = $sui.get(0);
				var xmlString;
				if (window.ActiveXObject){
					xmlString = xmlData.xml;
				} else {
					xmlString = (new XMLSerializer()).serializeToString(xmlData);
				}
				return xmlString;
			}
		},
		suify : {
			fieldwrap: function($elem){
				var suiXml = '';
				$elem.children('[data-edition]').each(function(){
					var $this = $(this);
					var nodename = wdata.aux.getClassAt($this,0);
					if (/block|cell|row/.test(nodename)){
						var content = '';
						if ($this.attr('data-edition').indexOf('text') > -1){
							content = tinymce.get($this.attr('id')).getContent();
						} else if ($this.attr('data-edition').indexOf('dynamic') > -1){
							content = $this.html();
						} else if ($this.attr('data-edition').indexOf('indexing') > -1){
							content = $this.html();
						}
						var $sui = wdata.aux.strXQ('<'+nodename+'>'+(content?'<![CDATA['+content+']]>':'')+'</'+nodename+'>');
						wdata.aux.parseAttr($sui,$this,/data\-/);
						suiXml += wdata.aux.xqString($sui);
					}
				});
				return suiXml;
			},
			block: function($elem){
				var suiXml = $elem.html();
				var $sui = wdata.aux.strXQ('<block>'+(suiXml?'<![CDATA['+suiXml+']]>':'')+'</block>');
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			flex: function($elem){
				var suiXml = '';
				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
				}
				var $sui = wdata.aux.strXQ('<flex>'+suiXml+'</flex>');
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			cell: function($elem){
				var suiXml = '';
				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
						else if ($this.hasClass('flex')) suiXml += wdata.suify.flex($this);
					});
				}
				var $sui = wdata.aux.strXQ('<cell>'+suiXml+'</cell>');
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			row: function($elem){
				var suiXml = '';
				if ($elem.attr('data-edition') || !$elem.children().length) suiXml = $elem.html();
				else {
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
				}
				var $sui = wdata.aux.strXQ('<row>'+suiXml+'</row>');
				if (!$elem.attr('data-name') && wdata.aux.getClassAt($elem,1)) $sui.attr('name',wdata.aux.getClassAt($elem,1));
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);
			},
			footer: function($elem, repetition){
				if (repetition){
					var $sui = wdata.aux.strXQ('<repetition type="footer"/>');
					wdata.aux.parseAttr($sui,$elem,/data\-/);
					return wdata.aux.xqString($sui);
				} else {
					var suiXml = '';
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
						else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
					return '<footer>'+suiXml+'</footer>';
				}
			},
			main: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
					else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
				});
				return '<main>'+suiXml+'</main>';
			},
			header: function($elem,repetition){
				if (repetition){
					var $sui = wdata.aux.strXQ('<repetition type="header"/>');
					wdata.aux.parseAttr($sui,$elem,/data\-/);
					return wdata.aux.xqString($sui);
				} else {
					var suiXml = '';
					$elem.children().each(function(){
						var $this = $(this);
						if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
						else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
						else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
					});
					return '<header>'+suiXml+'</header>';
				}
			},
			cover: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('row')) suiXml += wdata.suify.row($this);
					else if ($this.hasClass('cell')) suiXml += wdata.suify.cell($this);
					else if ($this.hasClass('fieldwrap')) suiXml += wdata.suify.fieldwrap($this);
				});
				return '<cover>'+suiXml+'</cover>';
			},
			page: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('cover')) suiXml += wdata.suify.cover($this);
					else if ($this.hasClass('header')) suiXml += wdata.suify.header($this,true);
					else if ($this.hasClass('main')) suiXml += wdata.suify.main($this);
					else if ($this.hasClass('footer')) suiXml += wdata.suify.footer($this,true);
				});
				if (!Report.wgdata.name || !Report.wgdata.subname || !Report.wgdata.preview){
					var isBeginingPage = $elem.parent().children('.page').index($elem);
					if (isBeginingPage < 2){
						if (!Report.wgdata.name){
							var eid = $elem.find('.title [data-edition*="text"]:eq(0), .name [data-edition*="text"]:eq(0), .title[data-edition]:eq(0), .name[data-edition]:eq(0) ').attr('id');
							if (eid) Report.wgdata.name = $('<pre>'+tinymce.get(eid).getContent()+'</pre>').text();
						}
						if (!Report.wgdata.subname){
							var $ec, eid = $elem.find('.main :not(.info):not(.title):not(.name) [data-edition*="text"]:not(.info):not(.title):not(.name)').attr('id');
							if (eid){
								$ec = $('<pre>'+tinymce.get(eid).getContent()+'</pre>');
								Report.wgdata.subname = $ec.find('header:eq(0)').text() || $ec.find('h1:eq(0)').text() || $ec.find('h2:eq(0)').text() || $ec.find('h3:eq(0)').text();
							}
						}
						if (!Report.wgdata.preview){
							$ec = $('<pre></pre>');
							$elem.find('.main :not(.info):not(.title):not(.name) [data-edition*="text"]:not(.info):not(.title):not(.name)').each(function(){
								eid = $(this).attr('id');
								if (eid) $ec.append(tinymce.get(eid).getContent());
							});
							Report.wgdata.preview = $ec.html();
						}
					}
				}
				var $sui = wdata.aux.strXQ('<page>'+suiXml+'</page>');
				wdata.aux.parseAttr($sui,$elem,/data\-/);
				return wdata.aux.xqString($sui);

			},
			document: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('page')) suiXml += wdata.suify.page($this);
				});
				if (!Report.wgdata.analysts){
					$elem.find('.block.analysts [data-key]').each(function(){
						Report.wgdata.analysts = Report.wgdata.analysts || [];
						Report.wgdata.analysts.push($(this).data('key'));
					});
				}
				var $sui = wdata.aux.strXQ('<document>'+suiXml+'</document>');
				$sui.attr('paper',wdata.aux.getClassAt($elem,1));
				return wdata.aux.xqString($sui);
			},
			templates: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('header')) suiXml += wdata.suify.header($this);
					else if ($this.hasClass('footer')) suiXml += wdata.suify.footer($this);
					else if ($this.hasClass('page')) suiXml += wdata.suify.page($this);
					else if ($this.hasClass('block')) suiXml += wdata.suify.block($this);
				});
				return '<templates>'+suiXml+'</templates>';
			},
			validations: function($elem){
				var suiXml = '';
				$elem.children().each(function(){
					var $this = $(this);
					var $rule = wdata.aux.strXQ('<rule/>').append($this.text());
					wdata.aux.parseAttr($rule,$this,/count|min|max|name|selector|valid/);
					suiXml += wdata.aux.xqString($rule);
				});
				return '<validation>'+suiXml+'</validation>';
			},
			variables: function($elem){
				var $var = wdata.aux.strXQ('<var>'+$elem.text()+'</var>');
				wdata.aux.parseAttr($var,$elem,/name|value|data\-/);
				Report.wgdata[$var.attr('name')||$var.attr('id')] = $var.attr('value')||$var.text()||$var.attr();
				return wdata.aux.xqString($var);
			},
			getAll: function(){
				var suiXml = '';
				Report.area.children().each(function(){
					var $this = $(this);
					if ($this.hasClass('sui-variable')) suiXml += wdata.suify.variables($this);
					if ($this.hasClass('sui-validations')) suiXml += wdata.suify.validations($this);
					else if ($this.hasClass('sui-templates')) suiXml += wdata.suify.templates($this);
					else if ($this.hasClass('sui-report-document')) suiXml += wdata.suify.document($this);
				});
				Report.wgdata.document = suiXml;
			},
		}
	}

	Report.widgetData = function () {
		Report.wgdata = {};
		wdata.suify.getAll();
	};

};