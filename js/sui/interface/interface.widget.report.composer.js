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

var Composer = function(Report){

	var ___cnsl = {
		active: true,
		stack: function(where){
			___cnsl.green('initStack',where);
		},
		log: function(){
			if (!___cnsl.active) return;
			var a=[],l,ball;
			if (this === 'green') ball =  '🟢';
			else if (this === 'yellow') ball =  '🟡';
			else if (this === 'red') ball =  '🔴';
			else if (this === 'blue') ball =  '🔵';
			else if (this === 'purple') ball =  '🟣';
			else if (this === 'ok') ball =  '🤍';
			else ball =  '⚪️';
			$.each(arguments,function(k,v){
				if (v instanceof HTMLElement || v instanceof jQuery || typeof v === 'object') l = v;
				else a.push(v);
			});
			console.groupCollapsed(ball+' '+a.join('  '),l?[l]:'');
			console.info(l);
			console.groupEnd();
		},
		green: function(){
			___cnsl.log.apply('green',arguments);
		},
		yellow: function(){
			___cnsl.log.apply('yellow',arguments);
		},
		red: function(){
			___cnsl.log.apply('red',arguments);
		},
		blue: function(){
			___cnsl.log.apply('blue',arguments);
		},
		purple: function(){
			___cnsl.log.apply('purple',arguments);
		},
		ok: function(){
			___cnsl.log.apply('ok',arguments);
		}
	};

	// boxFitter -> organizer

	this.box = {

		ancestors: function($origin){
			var data;
			if ($origin && $origin.is('.fieldwrap')){
				data.origin = 'box';
				data.edge = $origin.closest('.content, .boxstack, .side');
				data.page = $boxedge.closest('.page');
			} else if ($origin && $origin.is('.content, .boxstack, .side')){
				origin = 'edge';
				data.edge = $origin;
				data.page = $boxedge.closest('.page');
			} else {
				origin = 'page';
				data.page = $origin || Report.document.find('.page:eq(0), .page.breaker-before');
			}
			return data;
		},

		edgeSelector: function($edge){
			var data = {};
			if ($edge.is('.content')) { data.type = 'content'; data.selector = '.content'; }
			else if ($edge.is('.boxstack')) { data.type = 'boxstack'; data.selector = '.boxstack, .content'; }
			else if  ($edge.is('.side')) { data.type = 'side'; data.selector = '.side'; }
			return data;
		},

		joinAB: function($a, $b){
			var $contentA = $a.contents();
			var $contentB = $b.contents();
			var $lastA = $contentA[$contentA.length-1];
			var $firstB = $contentB[0];
			var $elemA = $($lastA);
			var $elemB = $($firstB);
			if (($lastA.nodeType !== 3 || $firstB.nodeType !== 3) && ($elemA.attr('data-joiner') || $elemB.attr('data-joiner') )){
				$elemA.html($elemA.html()+' '+$firstB.html());
				$elemA.append($firstB.nextAll());
			} else {
				$a.append($b.html());
			}
			return $a;
		},

	};

	this.organizer = {

		joinToLast: function($box, $edge, $page, edgesel){
			if (!$edge || !$page){
				var ancestors = Composer.box.ancestors($box);
				$edge = ancestors.edge.first();
				$page = ancestors.page.first();
			}
			edgesel = edgesel || Composer.box.edgeSelector($edge);
			var $nextpage = $page.next('.page');
			if (!$nextpage.is('.breaker-before')){
				var $nextedge = $nextpage.find(edgesel.selector);
				var $nextedit = $nextedge.find('[data-edition]:eq(0)');
				if ($nextedit.length && $nextedit.attr('data-organize') !== 'locked'){
					var $nextbox = $nextedit.parent();
					var $edit = $box.children();
					if ($edit.attr('data-organize') === 'locked'){
						$box.after($nextbox);
					} else if ($edit.attr('data-edition') === $nextedit.attr('data-edition')){
						Composer.box.joinAB($edit, $nextedit);
						var gap = Composer.organizer.hasGap($edge,$box);
						if (gap){
							Composer.organizer.joinToLast($box, $edge, $page, edgesel);
						}
					}
				}
			}
		},

		hasGap: function($edge,$lastbox){

			var paddingTolerance = 16; // is the box minumus height.
			var $box = $lastbox || $edge.find('.fieldwrap, .container').last();

			var edgeHeight = $edge.height();

			if ($box.length){
				if ($edge.is('.content') && $edge.children('.boxstack').length) return false;
				if ($edge.is('.content, .boxstack')){
					var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.closest('.main').width();
				} else {
					var boxPos = $box.position(), strapolateWidth, strapolateHeight, edgeWidth = $edge.width();
				}
				var gap = edgeHeight - (boxPos.top + $box.outerHeight(true));
				if (gap > 0){
					if (gap > paddingTolerance) return gap;
					return false;
				}
				return null;
			}
			return edgeHeight;
		},

		normalize: function($origin){

			if (Report.document.hasClass('normalizing')) return false;
			Report.document.addClass('normalizing');

			var ancestors = Composer.box.ancestors($origin);
			var $page = ancestors.page.first();

			var $edges;
			if (origin == 'box' || origin == 'edge'){
				$edges = ancestors.edge;
			} else {
				$edges = $page.find('.content, .boxstack, .side');
			}

			$edges.each(function(){

				var $edge = $(this);
				var edgesel = Composer.box.edgeSelector($edge);

				//////////////////////////////////
				var $lastbox = $edge.children('.fieldwrap, .container').last();
				var gap = Composer.organizer.hasGap($edge,$lastbox);
				if (gap){
					Composer.organizer.joinToLast($lastbox, $edge, $page, edgesel);
				}
				//////////////////////////////////
				if (Composer.organizer.hasOverflow($edge)){

				}
				//////////////////////////////////
			});



			$page.each(function(){

				var $page = $(this);
				var $pagerange = $page.nextUntil('.breaker-before').addBack();

				___cnsl.purple('normalizeBoxes','pages range till breaker: '+$pagerange.length, $pagerange);

				var $edgerange;
				if (origin == 'box' || origin == 'edge'){
					if ($boxedge.is('.content')) $edgerange = $pagerange.find('.content');
					else if ($boxedge.is('.side')) $edgerange = $pagerange.find('.side');
					else if ($boxedge.is('.boxstack')) {
						$edgerange = $().add($boxedge);
						$edgerange = $edgerange.add($pagerange.filter(':gt(0)').find('.content'));
					}
				} else {
					$edgerange = $pagerange.find('.content, .boxstack, .side');
				}

				var edx = 0;
				var $lastpage = $();
				$edgerange.each(function(){

					if ($extrapolatedEdge) return false;

					var $edge = $(this), edgetype, edgesel;

					if (___cnsl.active){
						var $page = $edge.closest('.page');
						if ($lastpage.get(0) !== $page.get(0)){
							$lastpage = $page;
							___cnsl.blue('normalizeBoxes', 'page('+$page.attr('data-pagenumber')+')' ,$page.get(0));
						}
					}

					if ($edge.is('.content')) { edgetype = 'content'; edgesel = '.content'; }
					else if ($edge.is('.boxstack')) { edgetype = 'boxstack'; edgesel = '.boxstack, .content'; }
					else if  ($edge.is('.side')) { edgetype = 'side'; edgesel = '.side'; }

					var cnsl = ___cnsl.active ? 'page('+$page.attr('data-pagenumber')+') edge('+edgetype+') ' : '';

					___cnsl.log('normalizeBoxes', cnsl ,$edge.get(0));

					//////////////////////////////////
					var $lastbox = $edge.children('.fieldwrap, .container').last();
					var gap = boxFitter.hasGap($edge,$lastbox);
					if (gap){
						___cnsl.log('normalizeBoxes', cnsl, 'has gap: '+(gap ? gap+'px' : 'true'),$edge.get(0));
						if ($lastbox.is('[data-boxgroup]')) {
							boxFitter.joinBox(boxFitter.groupBellow($lastbox));
						}
						var $nextboxes = $edgerange.filter(edgesel).filter(':gt('+edx+')').children('.fieldwrap, .container');
						if ($nextboxes.length){
							$edge.append($nextboxes);
							___cnsl.yellow('normalizeBoxes', cnsl, 'gap boxes appended: '+$nextboxes.length,$nextboxes);
						}
					}
					//////////////////////////////////
					if (boxFitter.hasOverflow($edge)){
						var $boxes = $edge.children('.fieldwrap, .container');
						___cnsl.red('normalizeBoxes', cnsl, 'has overflow: true',$edge.get(0));
						$boxes.each(function(kb,b){
							var $box = $(b);
							var extrapolate = boxFitter.isExtrapolatedBox($box,$edge);
							if (extrapolate){
								___cnsl.red('normalizeBoxes', cnsl, 'estrapolated box: true ('+extrapolate+')',$box.get(0));
								$box.addClass('overflew'); // tint as red
								$box.attr('data-extrapolate',extrapolate);
								$extrapolatedEdge = $edge; ////////////////////////////////////////////////////////////////////////////////////////
							} else {
								___cnsl.log('normalizeBoxes', cnsl, 'has estrapolated box: false',$box.get(0));
							}
							if (extrapolate === 3){
								// move all hidden objects to next page;
								///////////////////////////////////////////////
								Report.document.addClass('preventeventchange');
								boxFitter.moveBox($box,$edge);
								Report.document.removeClass('preventeventchange');
								return false;
								///////////////////////////////////////////////
							} else if (extrapolate === 4){
								// break box and move all next boxes to next page;
								///////////////////////////////////////////////
								Report.document.addClass('preventeventchange');
								boxFitter.breakBox($box,$edge);
								Report.document.removeClass('preventeventchange');
								return false;
								///////////////////////////////////////////////
							}
							if (!extrapolate){
								$box.removeClass('overflew toolarge');
								$box.removeAttr('data-extrapolate');
							}
						});
					} else {
						___cnsl.ok('normalizeBoxes', cnsl, ' has no normalizations');
					}
					edx++;
				});
				pdx++;
			});
			if (!nomceinit) Report.document.trigger('edition:init');

			Report.document.removeClass('rearranging');

			//////////////////////////////////////////////////////////////////////
			// hack to normalize all pages before breaking boxes
			if ($extrapolatedEdge){
				___cnsl.log('normalizeBoxes', 'hack to restart at estrapolated edge', $extrapolatedEdge.get(0));
				boxFitter.normalizeBoxes($extrapolatedEdge.closest('.page').next('.page').find('[class="'+$extrapolatedEdge.attr('class')+'"]'), nomceinit);
			}
			//////////////////////////////////////////////////////////////////////

			Report.document.trigger('document:pagelist');

		}
	}

};