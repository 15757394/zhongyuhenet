//if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
//  //alert(navigator.userAgent);  
//  window.location.href ="iPhone.html";
//} else if (/(Android)/i.test(navigator.userAgent)) {
//  //alert(navigator.userAgent); 
//  window.location.href ="Android.html";
//} else {
//  window.location.href ="pc.html";
//};

if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
   //alert(navigator.userAgent); 
   
   //add a new meta node of viewport in head node
	head = document.getElementsByTagName('head');
	viewport = document.createElement('meta');
	viewport.name = 'viewport';
	viewport.content = 'target-densitydpi=device-dpi, width=' + 360 + 'px, user-scalable=no';
	head.length > 0 && head[head.length - 1].appendChild(viewport);    
   
}

$(function(){
	if (window.console) {
		console.info(">>Join us? Email：developer@qietu.com");
	}		
	
	/*触屏*/
	$(".slider .inner").bind("swipeleft",function(){
		
	});
	
	$(".slider .inner").bind("swiperight",function(){
		
	});
	
	//导航
	$('.gh').click(function(){
		if($('.header_mobi').hasClass('selected')){
			$('.header_mobi').removeClass('selected');
		}										
		else{
			$('.header_mobi').addClass('selected')	
		}					
	})
	
	/*首页幻灯片*/
	//初始化
	var hh = $(window).height()-128;
	hh = hh > 700 ? hh : 700;
	$('.hslide').css('height', hh);
	
	$('.hslide .imgs li').click(function(){
		$('.hslide .imgs li').removeClass('selected');
		$(this).addClass('selected');
		
		$('.hslide .bgs li').removeClass('selected').eq($(this).index()).addClass('selected');
	})
	
	$.extend({
		homeSlideAutoChange:function(){
			if($('.hslide .imgs li.selected').next().size()>0){
				var next = $('.hslide .imgs li.selected').next();
			}
			else{
				var next = $('.hslide .imgs li:first');
			}
			
			$('.hslide .imgs li').removeClass('selected');
			next.addClass('selected');
			
			$('.hslide .bgs li').removeClass('selected').eq(next.index()).addClass('selected');
			
		}
	})
	_homeSlideAutoChange = setInterval("$.homeSlideAutoChange()",3000);
	
	/*单行滚动 singlerolling */
	$.extend({
		singlerolling:function(){
			$('.hnews ul').animate({'marginTop':-33},function(){
				$(this).css('marginTop',0).find('li:first').appendTo($(this));
			});
		}
	})
	setInterval("$(function(){$.singlerolling()})",3000);
	
	
	/*图片滚动*/
	$('.proimgs .list li').click(function(){
		$('.proimgs .list li').removeClass('selected');
		$(this).addClass('selected');
		
		var bigimg = $(this).find('a').attr('href');
		$('.proimgs .view img').attr('src', bigimg);
		
		return false;
	})
	
	/*头部js*/
	$('.header .info li').hover(function(){
		$(this).addClass('selected');
	},
	function(){
		$(this).removeClass('selected');
	})
	
	/*底部导航js*/
	$('.hnav dt').click(function(){
		if($(window).width()<1000){
			if($(this).parent().hasClass('selected')){
				$(this).parent().removeClass('selected');
			}
			else{
				$(this).parent().addClass('selected');
			}
		}
	})
	
})