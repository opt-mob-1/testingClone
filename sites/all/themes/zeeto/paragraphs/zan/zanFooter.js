var zan = window.zan;

var Visitor = {
  "gaClientId": "706503667.1490549244",
  "gaUserId": "706503667.1490549244",
  "creationDate": "2017-08-12 13:34:45",
  "email": "asd",
  "deleted": "false",
  "returning": "false",
  "visitorAttributes" : {
    "creationDate" : "2017-08-12 13:34:45",
    "firstName" : "John",
    "lastName" : "Doe",
    "address" : {
      "street1": "925 B Street",
      "street2": "5th floor",
      "city": "San Diego",
      "stateInitials": "CA",
      "country": "US",
      "postal": "92101"
    },
    "phone" : "6197854567",
    "age" : "24",
    "dob" : "1994-08-12",
    "gender" : "FEMALE"
  }
};

var visitorAttributes = {
  firstName: Visitor.visitorAttributes.firstName,
  lastName: Visitor.visitorAttributes.lastName,
  email: Visitor.email,
  address: Visitor.visitorAttributes.address.street1,
  address2: Visitor.visitorAttributes.address.street2,
  city: Visitor.visitorAttributes.address.city,
  state: Visitor.visitorAttributes.address.stateInitials,
  zipCode: Visitor.visitorAttributes.address.postal,
  country: Visitor.visitorAttributes.address.country,
  phone: Visitor.visitorAttributes.phone,
  gender: Visitor.visitorAttributes.gender,
  dob: Visitor.visitorAttributes.dob // 'yyyy-MM-dd'
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
  data:  {
    visitorAttributes: visitorAttributes,
    publisherAttributes: publisherAttributes
  }
});

zan.on('zeeto.placementReady', function() {
  zan.push({ name: 'zeeto.start' });
  Visit.zTrkMacroEvent('zan','load','placementId');
});

zan.on('zeeto.placementEnd', function(data) {
  // Define what happens once a visitor completes the placement. Examples are redirect, load content, further registration, etc.
  Visit.zTrkMacroEvent('zan','complete','placementId');
  window.location = variationNextPage;
});

