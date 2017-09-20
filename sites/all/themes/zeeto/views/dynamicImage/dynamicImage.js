var $ = jQuery;

var dynamicImage = jQuery('.dynamicImage').has("img").length;
var parameters = parseQueryString(window.location.search);
var utm = parameters.utm_content;

if (dynamicImage == 0) {
  // Traversing to get image tag inside the dynamic image view
  var elementBundle = '<div class="view-content"><img src="/sites/all/themes/zeeto/images/default.png" width="500" height="500" alt="default" class="img-responsive"></div>';
  // Setting fallback for image with missing utm_content
  $(".dynamicImage").children().children('section:first').children().html(elementBundle);
}

if (utm === "" || utm === undefined) {
  // Traversing to get image tag inside the dynamic image view
  var elementBundle = '<div class="views-element-container contextual-region form-group"><div class="contextual-region view view-dynamic-images view-id-dynamic_images view-display-id-block_1 js-view-dom-id-53dbeeea43436fd336dcdca71a488d7f7ade661326f22c4c8705a8d32fadda75"><div class="view-content"><img src="/sites/all/themes/zeeto/images/default.png" width="500" height="500" alt="default" class="img-responsive"></div></div></div>';
  // Setting fallback for image with missing utm_content
  $(".dynamicImage").children().children('section:first').html(elementBundle);
}