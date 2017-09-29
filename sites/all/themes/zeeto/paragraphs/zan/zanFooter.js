var zan = window.zan;

// Grabbing data attributes set in variation view
var zanPlacement = document.querySelector('.js-zan');
var zanPlacementId = zanPlacement.dataset.placementid;

// Checking for event visitorReady to fire,
// Load ZAN if visitorReady
window.addEventListener('visitorReady', function (e) {
  var visitorAttributes = {
    visitorId: Visitor.id,
    firstName: Visitor.attributes.visitorAttributes.firstName,
    lastName: Visitor.attributes.visitorAttributes.lastName,
    email: Visitor.attributes.email,
    address: Visitor.attributes.visitorAttributes.address.street1,
    address2: Visitor.attributes.visitorAttributes.address.street2,
    city: Visitor.attributes.visitorAttributes.address.city,
    state: Visitor.attributes.visitorAttributes.address.stateInitials,
    zipCode: Visitor.attributes.visitorAttributes.address.postal,
    country: Visitor.attributes.visitorAttributes.address.country,
    phone: Visitor.attributes.visitorAttributes.phone,
    gender: Visitor.attributes.visitorAttributes.gender,
    dob: Visitor.attributes.visitorAttributes.dob // 'yyyy-MM-dd'
  };

  var publisherAttributes = {
    //   c1: 'yourCustomAttribute',
    //   c2: 'yourCustomAttribute',
    //   c3: 'yourCustomAttribute',
    //   c4: 'yourCustomAttribute',
    c5: Visit.visitId,
    utm_source: Visit.acquisition.utmSource,
    utm_campaign: Visit.acquisition.utmCampaign,
    utm_medium: Visit.acquisition.utmMedium,
    utm_term: Visit.acquisition.utmTerm,
    utm_content: Visit.acquisition.utmContent,
    ga_client_id: Visitor.gaClientId,
    ga_user_id: Visitor.gaUserId
  };


  zan.push({
    name: 'zeeto.init',
    data: {
      visitorAttributes: visitorAttributes,
      publisherAttributes: publisherAttributes
    }
  });
}, false);


// Checking for event visitorUndefined to fire
window.addEventListener('visitorUndefined', function (e) {
  Visit.zTrkMacroEvent('zan','visitorerror', zanPlacementId, false);
  window.location = variationNextPage;
}, false);

zan.on('zeeto.placementReady', function() {
  setTimeout(function() {
    zan.push({ name: 'zeeto.start' });
  }, 2500);
  Visit.zTrkMacroEvent('zan','load', zanPlacementId);
});

// Redirect after ZAN
zan.on('zeeto.placementEnd', function(data) {
  // Define what happens once a visitor completes the placement. Examples are redirect, load content, further registration, etc.
  Visit.zTrkMacroEvent('zan','complete', zanPlacementId, false);
  window.location = variationNextPage;
});