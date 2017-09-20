'use strict';

// Grabbing data attributes set in variation view

var variationView = document.querySelector('.js-variation-view');
var variationProperty = variationView.dataset.property;
var variationNextPage = variationView.dataset.nextpage;
var variationPageNumber = variationView.dataset.pagenumber;
var funnellength = variationView.dataset.funnellength;
var redirectURL = variationView.dataset.redirecturl;

var linkQueryParameter = document.querySelectorAll('.js-nextpage-utm');
for (var i = 0; i < linkQueryParameter.length; i++) {
    var attrSelect = linkQueryParameter[i].getAttribute("href");
    // Grabs inputted utm_content value from Drupal Sample Content Type {{ field.utm_content }}
    var caseSensitiveUf = attrSelect.split('utm_content=')[1];
    // Builds url and appends dynamic image value selected
    linkQueryParameter[i].href = variationNextPage + '?utm_content=' + caseSensitiveUf;
}

if (variationPageNumber == funnellength) {
    variationNextPage = redirectURL;
}

if (variationPageNumber > funnellength) {
    window.location = redirectURL;
}

var link = document.querySelectorAll('.js-nextpage');
for (var i = 0; i < link.length; i++) {
    link[i].setAttribute("href", variationNextPage);
}

if (variationProperty) {
    Visit.property = variationProperty;
}