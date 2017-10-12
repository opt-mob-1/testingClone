'use strict';

// Grabbing data attributes set in variation view
var variationView = document.querySelector('.js-variation-view');

// Sets redirect if variation does not exist
if (variationView == null) {
  window.location = '/a/ZEET00?utm_content=zeet00&utm_source=zeet00&utm_medium=zeet00&utm_campaign=zeet00';
}
var variationProperty = variationView.dataset.property || 'SCA';
var variationPropertyId = variationView.dataset.propertyid || 6;
var variationNextPage = variationView.dataset.nextpage;

// if variation next page is undefined, redirect to fallback
if (variationNextPage == undefined) {
  variationNextPage = '/a/ZEET00?utm_content=zeet00&utm_source=zeet00&utm_medium=zeet00&utm_campaign=zeet00';
}
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

var buildDestinationURL = function buildDestinationURL() {
  var dateOfBirth = {};
  if (Visitor.attributes.visitorAttributes.dateOfBirth) {
    dateOfBirth = Visitor.attributes.visitorAttributes.dateOfBirth.split("-");
    dateOfBirth.month = dateOfBirth[1];
    dateOfBirth.day = dateOfBirth[2];
    dateOfBirth.year = dateOfBirth[0];
  } else {
    dateOfBirth.month = null;
    dateOfBirth.day = null;
    dateOfBirth.year = null;
  }
  var street1 = encodeURIComponent(Visitor.attributes.visitorAttributes.address.street1);
  var city = encodeURIComponent(Visitor.attributes.visitorAttributes.address.city);
  var fname = encodeURIComponent(Visitor.attributes.visitorAttributes.firstName);
  var lname = encodeURIComponent(Visitor.attributes.visitorAttributes.lastName);

  var queryParams = 'AffID=' + Visit.acquisition.utmSource + '&subid=' + '&tmg_email=' + Visitor.attributes.email + '&tmg_firstname=' + fname + '&tmg_lastname=' + lname + '&tmg_gender=' + Visitor.attributes.visitorAttributes.gender + '&tmg_dob=' + dateOfBirth.month + '%2F' + dateOfBirth.day + '%2F' + dateOfBirth.year + '&tmg_address=' + street1 + '&tmg_city=' + city + '&tmg_state=' + Visitor.attributes.visitorAttributes.address.stateInitials + '&tmg_zip=' + Visitor.attributes.visitorAttributes.address.postal + '&tmg_phone=' + Visitor.attributes.visitorAttributes.phone + '&redirecturl=';
  var destinationURL = redirectURL + '?' + queryParams;
  return destinationURL;
};

function endOfFunnel() {
  var destinationURL = buildDestinationURL();
  Visit.zTrkMacroEvent('funnel', 'complete', '', false);
  window.location = destinationURL;
}

var link = document.querySelectorAll('.js-nextpage');
for (var i = 0; i < link.length; i++) {
  link[i].setAttribute("href", variationNextPage);
}

// Checking for event visitReady to fire
window.addEventListener('visitReady', function (e) {
  if (variationProperty) {
    Visit.property = variationProperty;
  }
  if (variationPropertyId) {
    Visit.propertyId = variationPropertyId;
  }
}, false);

// Checking for event visitorReady to fire
window.addEventListener('visitorReady', function (e) {
  if (variationPageNumber > funnellength) {
    endOfFunnel();
  }
  if (variationPageNumber == funnellength) {
    variationNextPage = buildDestinationURL();
  }
}, false);