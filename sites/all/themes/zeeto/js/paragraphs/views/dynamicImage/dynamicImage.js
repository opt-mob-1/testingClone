'use strict';

var $ = jQuery;

var dynamicImage = jQuery('.dynamicImage').has("img").length;
var parameters = parseQueryString(window.location.search);
var utm = parameters.utm_content;

if (dynamicImage == 0) {
  // Traversing to get image tag inside the dynamic image view
  var elementBundle = '<div class="dynamicImage"><div class="view-content"><div class="views-view-grid horizontal cols-1 clearfix"><div class="views-row clearfix row-1"><div class="views-col col-1" style="width: 100%;"><div class="views-field views-field-field-product-image"><div class="field-content"><img src="/sites/all/themes/getitfree/images/products.png" alt="Sample Bundle" class="img-responsive"></div></div><div class="views-field views-field-title"><span class="field-content"><h1>Order In Progress</h1><p>Free Shipping</p><p class="highlight">$0.00 - No Cost</p><p>Complete our survey to qualify</p></span></div></div></div></div></div></div>';
  // Setting fallback for image with missing utm_content
  $(".dynamicImageContainer").children('div:first').html(elementBundle);
}

if (utm === "") {
  // Traversing to get image tag inside the dynamic image view
  var elementBundle = '<div class="views-element-container contextual-region form-group"><div class="contextual-region view"><div class="view-content"><div class="views-view-grid horizontal cols-1 clearfix"><div style="width: 100%;"><div class="views-field views-field-field-product-image"><div class="field-content"><img src="/sites/all/themes/getitfree/images/products.png" alt="Sample Bundle" class="img-responsive"></div></div></div></div></div></div>';
  // Setting fallback for image with missing utm_content
  $(".dynamicImage").children().children().children('section:first').html(elementBundle);
}