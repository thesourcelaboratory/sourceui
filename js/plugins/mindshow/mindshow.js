// JavaScript Document

var screentimeout = null;

function startsaver(){
	$(".courtain").addClass("hidden");
	clearTimeout(screentimeout)
	screentimeout = setTimeout(function(){
		$(".courtain").removeClass("hidden");
	},60000 * 30);	
}

function nextSlide(){
	var $active = $(".slide.active");
	var $next = $active.next(".slide");
	if (!$next.length) return;
	$active
		.removeClass("active")
		.addClass("left");
	$next
		.addClass("active")
		.removeClass("right");
	window.location.hash = '#'+(parseInt(window.location.hash.replace("#",""))+1);
}
function prevSlide(){
	var $active = $(".slide.active");
	var $prev = $active.prev(".slide");
	if (!$prev.length) return;
	$active
		.removeClass("active")
		.addClass("right")
	$prev
		.addClass("active")
		.removeClass("left");
	window.location.hash = '#'+(parseInt(window.location.hash.replace("#",""))-1);
}
function lastSlide(){
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


$(function(){
	if (window.location.hash){
		console.log(".slide:lt("+window.location.hash.replace("#","")+")");
		$(".slide").removeClass("active left right");
		$(".slide:lt("+window.location.hash.replace("#","")+")").addClass("left");
		$(".slide:gt("+window.location.hash.replace("#","")+")").addClass("right");
		$(".slide:eq("+window.location.hash.replace("#","")+")").addClass("active");
	} else {
		window.location.hash = '#0';		
	}
	//startsaver();
	$(document)
	.on("mousemove",function(){
		startsaver();
	})
	.on("keydown",function(event){
		startsaver();
		//console.log(event.which);
		if(event.which == 39){
			nextSlide();	
		} else if(event.which == 37){
			prevSlide();
		} else if(event.which == 35){
			lastSlide();
		}
	})
});