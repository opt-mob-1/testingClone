'use strict';

var $ = jQuery;

(function () {

  // Grabs redirect URL
  var fieldUrl = document.querySelector('.js-modal');
  var fieldUrl_value = fieldUrl.dataset.redirecturl;

  // Loops through each element with class modal
  $('.modal').each(function () {
    var $modal = $(this);
    // When you click that element
    $modal.on("click", function () {
      // if there is a URL in the redirecturl, then redirect there
      $modal.show();
      if (fieldUrl_value) {
        setTimeout(function () {
          window.location = fieldrUrl_value;
        }, 1000);
        // } else {

        //   setTimeout(function () {
        //     window.location = variationNextPage;
        //   }, 1000);
        // }
      }
    }); //end on click
  }); //end each
})(); //end self-invoking function