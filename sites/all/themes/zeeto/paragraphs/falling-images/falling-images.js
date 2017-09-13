
var $ = jQuery;

(function () {

  var falling_image = document.querySelector('.js-fallingImages');
  var falling_image1_value = falling_image.dataset.fallingimage1;
  var falling_image2_value = falling_image.dataset.fallingimage2;
  var falling_image3_value = falling_image.dataset.fallingimage3;
  var falling_image4_value = falling_image.dataset.fallingimage4;
  var falling_image_cycle_value = falling_image.dataset.fallingimagecycle;
  var falling_image_speed_value = falling_image.dataset.fallingimagespeed;
  // refactor variable so it points to default link?
  var falling_image_link_value = falling_image.dataset.fallingimagelink;
  var falling_image_class_value = falling_image.dataset.fallingimageclass;
  var falling_image_append_value = falling_image.dataset.fallingimageappend;
  // Grabbing variationPageNumber and variationPageType set in variationView.js

  // var parameters = parseQueryString(window.location.search);
  // var uf = parameters.utm_content;

  // if (uf === undefined || uf === '') {
  //   uf = 'bundle';
  // }

  // let it fall! plugin for falling or "raining/snowing" images
  $.fn.letItFall = function (options) {
    var count = 0;
    // default settings
    var settings = $.extend({
      numElements: 1
    }, options);
    var variationNextPage;
    var uf;

    return this.each(function () {
      $(this).addClass('fallingimageContainer');

      // creates the randomized images that fall
      function doLetItFall() {

        for (var i = 0; i <= settings.numElements; i++) {

          var $element = $('<a href=' + variationNextPage + '?uf=' + uf + ' class=' + falling_image_class_value + 'popunder>'),
              $elementImg = $('<img />'),
              $imgSrc = [falling_image1_value, falling_image2_value, falling_image3_value, falling_image4_value],
              $images = $imgSrc.length,
              $elementWrapper = $('.fallingimageContainer'),
              $width = $elementWrapper.width(),
              $randNum = function $randNum(num) {
            var theNum = Math.floor(Math.random() * num);
            return theNum;
          },
              $leftPos = $randNum($width) + 'px',
              $imgSize = $randNum(100) + 'px',
              $fallSpeed = ['normal', 'slow-fall', 'med-fall', 'fast-fall'],
              // top to bottom
          $elementSpeed = ['slow', 'medium', 'fast'],
              // left to right
          getSizeAndSpeed = function getSizeAndSpeed(getIndex) {
            var $index = Math.floor(Math.random() * getIndex);
            return $index;
          };
          $elementImg.attr({ 'src': '/' + $imgSrc[$randNum($images)], 'width': $imgSize, 'height': $imgSize }).addClass('fallingimage').addClass($elementSpeed[getSizeAndSpeed(3)]);
          $element.addClass('fallingimage').addClass($fallSpeed[getSizeAndSpeed(4)]).append($elementImg).css({ 'width': $imgSize, 'height': $imgSize, 'left': $leftPos });
          $element.appendTo($elementWrapper);
        }
        count++;
      }

      doLetItFall();

      // do it some more for intermittent image-falling effect
      var numTimes = setInterval(function () {
        doLetItFall();
        if (count >= 5) {
          clearInterval(numTimes);
        }
      }, falling_image_speed_value);
    });
  };

  $(falling_image_append_value).letItFall({
    numElements: falling_image_cycle_value // number of elements per cycle
  });
})();