// JavaScript Document

var screentimeout = null;
var behindtimeout = null;

function startsaver(){
	var $courtain = $(".courtain");
	$courtain.addClass("hidden");
	clearTimeout(behindtimeout);
	behindtimeout = setTimeout(function(){
		$courtain.addClass("behind");
	},800);
	clearTimeout(screentimeout);
	screentimeout = setTimeout(function(){
		$courtain.removeClass("hidden");
		$courtain.removeClass("behind");
	},60000 * 30);
}

function nextSlide(){
	var $courtain = $(".courtain");
	if (!$courtain.hasClass('hidden')){
		return startsaver();
	}
	var $active = $(".slide.active");
	if ($active.is('.all-hidden')){
		return showLayers();
	}
	var $next = $active.next(".slide");
	if (!$next.length) return;
	var color = $next.css('background-color');
	$('body').css('background-color',color ? color : 'inherit');
	$active
		.removeClass("active")
		.addClass("left");
	$next
		.addClass("active")
		.removeClass("right");
	window.location.hash = '#'+(parseInt(window.location.hash.replace("#",""))+1);
}
function prevSlide(){
	var $courtain = $(".courtain");
	if (!$courtain.hasClass('hidden')){
		return startsaver();
	}
	var $active = $(".slide.active");
	var $prev = $active.prev(".slide");
	if (!$prev.length) return;
	var color = $prev.css('background-color');
	$('body').css('background-color',color ? color : 'inherit');
	$active
		.removeClass("active")
		.addClass("right")
	$prev
		.addClass("active")
		.removeClass("left");
	window.location.hash = '#'+(parseInt(window.location.hash.replace("#",""))-1);
}
function lastSlide(){
	var $courtain = $(".courtain");
	if (!$courtain.hasClass('hidden')){
		return startsaver();
	}
	var $all = $(".slide:not(:last)");
	var $last = $(".slide").last();
	if (!$last.length) return;
	$all
		.removeClass("active")
		.removeClass("right")
		.addClass("left")
	$last
		.addClass("active")
		.removeClass("right");
	window.location.hash = '#'+($all.length);
}

function hideLayers(){
	var $courtain = $(".courtain");
	if (!$courtain.hasClass('hidden')){
		return startsaver();
	}
	var $active = $(".slide.active");
	if (!$active.hasClass('layers-hidden')){
		$active.addClass('layers-hidden');
	}
}
function showLayers(){
	var $courtain = $(".courtain");
	if (!$courtain.hasClass('hidden')){
		return startsaver();
	}
	var $active = $(".slide.active");
	if ($active.hasClass('layers-hidden') || $active.hasClass('all-hidden')){
		$active.removeClass('layers-hidden').removeClass('all-hidden');
	}
}
function toggleLayers(){
	var $courtain = $(".courtain");
	if (!$courtain.hasClass('hidden')){
		return startsaver();
	}
	var $active = $(".slide.active");
	if ($active.hasClass('layers-hidden')){
		$active.removeClass('layers-hidden');
	} else if (!$active.hasClass('layers-hidden')){
		$active.addClass('layers-hidden');
	}
}


$(function(){
	if (window.location.hash){
		console.log(".slide:lt("+window.location.hash.replace("#","")+")");
		$(".slide").removeClass("active left right");
		$(".slide:lt("+window.location.hash.replace("#","")+")").addClass("left");
		$(".slide:gt("+window.location.hash.replace("#","")+")").addClass("right");
		$(".slide:eq("+window.location.hash.replace("#","")+")").addClass("active");
		var color = $(".slide.active").css('background-color');
		$('body').css('background-color',color ? color : 'inherit');
	} else {
		window.location.hash = '#0';
	}
	//startsaver();
	$(document)
	.on("mousemove",function(){
		startsaver();
	})
	.on("keydown",function(event){
		//console.log(event.which);
		if(event.which == 39){
			nextSlide();
		} else if(event.which == 37){
			prevSlide();
		} else if(event.which == 35){
			lastSlide();
		}

		else if(event.which == 40 || event.which == 38){ // esc
			toggleLayers();
		}
		/*
		else if(event.which == 40){ // esc
			hideLayers();
		}
		else if(event.which == 38){ // enter
			showLayers();
		}
		*/
	})
	.on("swiperight",function(event){
		prevSlide();
	})
	.on("swipeleft",function(event){
		nextSlide();
	})
	.on("swipeup",function(event){
		toggleLayers();
	})
	.on("swipedown",function(event){
		toggleLayers();
	});
	$(window).on('hashchange',function(event){
		//console.log(event);
	});
});