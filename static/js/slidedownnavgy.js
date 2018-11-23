/*!
 * Company: uelike.com
 * Developer: luoye.org
 * Date: 2013-7-1
 
 * Includes jquery
 */

$(function() {
  
    var h = window.page || "";
    
    $("#navactive").length && $("#navmore").css({
        left: $("#navactive").position().left,
        width: $("#navactive").width()
    }).show();
    
    $("#headerbody > ul > li:not(#navmore)").hover(function() {
        if($(this).hasClass("navmore")){ 
		   $(("#div_01"), this).stop().css({
              display: "block"
          });
		  var div = $(this);
		  var ul = div.find('ul');
		  var divHeight = 0;
		  if (ul!=null)
		  {
			 divHeight = ul.height();
			 divHeight = parseInt(divHeight) + 20; 
		  }
		  else
		  {
			  divHeight = 10;
		  }

          $(("#div_01"), this).stop().css({
              display: "block",
              height: 0
          }).animate({
              height: divHeight
          })
		  
         //$("div ul", this).css("left", $(this).position().left - $("div ul", this).width() / 2 + $(this).width() / 2 + 22); 
        };
        
       // $("#navmove").stop().animate({
       //     left: $(this).position().left,
       //     width: $(this).width()
      //  },
     //   400)
    },
	
    function() {
        $("#navmove").stop().animate({
            left: $("#navactive").length ? $("#navactive").position().left: -500,
            width: "64px"
        },
        400);
        $(this).hasClass("navmore") && $("div", this).stop().animate({
            height: 0
        })
    });
    
 //   $(window).resize(function(a) {
//        $("#header ul li ul").each(function(a, b) {
//            var d = $(this).parent().parent().position().left + 25 - 36 * $("li", this).length;
//            $(this).css("left", parseInt(d))
//        });
//        $("#navmove").css({
//            left: $("#navactive").position().left
//        })
//    });
    
   // $(window).scroll(function(a) {
//        350 <= $(window).scrollTop() ? $("#cnav").css({
//            position: "fixed",
//            top: 95
//        }) : $("#cnav").css({
//            position: "relative",
//            top: 0
//        });
//        95 <= $(window).scrollTop() ? $("a#gotop").show() : $("a#gotop").hide()
//    });
//    $(window).resize();
  
});