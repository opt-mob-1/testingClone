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
  
    $('#progressBar .bar').width(percentage + '%');
    $('.percentage').text(percentage + "%");
    
  }
  carouselInit();
})();
