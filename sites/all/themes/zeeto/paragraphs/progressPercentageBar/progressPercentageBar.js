/**
 *
 * @file Progress Bar / Desktop / Slides
 * @author Dan Carr, Julie Jackson
 * @summary Progress bar for Match Page
 * requires bootstrap, slides
 * @version 1.0
 *
 */
(function () {

  function carouselInit() {
    var progress = $('#progress');
    var bar= document.querySelector('#progressBar');
    var percentage = bar.dataset.percentage;
    //var redirectTime = bar.dataset.redirecttime;

    //var fallbackPage = bar.dataset.redirectpage;

    //var val = 0;
    //var incrementTime = redirectTime / 100;
    // var interval = setInterval(function () {
    //   val = val + 1;
    //   $('#progressBar .bar').width(val + '%');
    //   $('.percentage').text(val + "%");
    //
    //   if (val == 100) {
    //     clearInterval(interval);
    //     //setTimeout(function() { location.href = next_url; });
    //     var oTimer = setInterval(function () {
    //       clearInterval(oTimer);
    //
    //       // after matchType is complete redirect to next page
    //       if (fallbackPage){
    //         variationNextPage = fallbackPage;
    //         redirectPage(variationNextPage);
    //       } else {
    //         redirectPage(variationNextPage);
    //       }
    //     });
    //   }
    // }, incrementTime);
  
    $('#progressBar .bar').width(percentage + '%');
    $('.percentage').text(percentage + "%");
    
  }

  // function redirectPage(variationNextPage) {
  //   setTimeout(function () {
  //     window.location = variationNextPage;
  //   }, 200);
  // }
  carouselInit();
})();
