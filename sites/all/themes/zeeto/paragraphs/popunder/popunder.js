'use strict';

var $ = jQuery;
var isMobile = Boolean(navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|PlayBook/i));
if (BrowserDetect.browser !== 'Explorer' && isMobile === false) {
  popUnder();
}

function popUnder() {
  $(".popunder").each(function () {
    var fieldUrl = document.querySelector('.js-popunder');
    var fieldUrl_value = fieldUrl.dataset.fieldurl;
    var $anchor = $(this);
    $anchor.attr("target", "_blank");
    $anchor.on("click", function () { 
      setTimeout(function () {
        window.location = fieldrUrl_value;
      }, 1000);
    });
  });
}