var $ = jQuery;
// function that grabs query parameter
function getAllUrlParams(url) {
  
  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  
  // we'll store the parameters here
  var obj = {};
  
  // if query string exists
  if (queryString) {
    
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];
    
    // split our query string into its component parts
    var arr = queryString.split('&');
    
    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');
      
      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function (v) {
        paramNum = v.slice(1, -1);
        return '';
      });
      
      // set parameter value (use 'true' if empty)
      var paramValue = typeof a[1] === 'undefined' ? true : a[1];
      
      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
     // paramValue = paramValue.toLowerCase();
      
      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }
  
  return obj;
}

/* Sticky Footer */
var winHeight = function(){
  var offset = 181 + 45,
    winHeight = $(window).height(),
    windowHeightOffset = winHeight - offset;
  
  $('.js-milestone').css('min-height', windowHeightOffset + 'px');
};

$( document ).ready(function() {
  winHeight();
});

$(window).resize(function(){
  //mainContentHeight();
  winHeight();
});

/* Parses Query Parameters in URL */
var parseQueryString = function parseQueryString(queryString) {
  var params = {},
    queries,
    temp,
    i,
    l;
  
  if (!queryString.length) {
    return params;
  }
  
  // Remove first leading '?' then split into key/value pairs
  queries = queryString.substring(1).split("&");
  
  // Convert the array of strings into an object
  for (i = 0, l = queries.length; i < l; i++) {
    temp = queries[i].split('=');
    params[temp[0]] = temp[1];
  }
  
  return params;
};

// Cookies utility Functions
/**
 * Manipulate Cookies. This method is partially taken
 * from http://quirksmode.org/js/cookies.html.
 * @memberOf Window
 */
window.cookies = (function () {
  var decode, getCookie;
  
  // gets a cookie (or all cookies if key is left null)
  getCookie = function (key) {
    var results = key ? null : {},
      ca = document.cookie.split('; '),
      cookie,
      name,
      parts,
      value;
    
    for (var i = 0; i < ca.length; i++) {
      cookie = ca[i];
      parts = cookie.split('=');
      name = parts.shift();
      value = parts.join('=');
      if (key && key === name) {
        return decode(value);
      }
      if (!key) {
        results[name] = decode(value);
      }
    }
    
    return results;
  };
  
  // decodes a cookie's value
  decode = function (value) {
    if (0 === value.indexOf('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return value;
  };
  
  return {
    /**
     * Sets a cookie
     * expires in minutes
     */
    set: function (key, value, options) {
      var cookieString,
        minutes,
        t;
      
      options = options || {};
      
      if ('number' === typeof options.expires) {
        minutes = options.expires;
        t = options.expires = new Date();
        t.setMinutes(t.getMinutes() + minutes);
      }
      
      cookieString = encodeURIComponent(key) + '=' + encodeURIComponent(value) + '; path=/';
      if (options.expires) {
        cookieString += '; expires=' + options.expires.toUTCString();
      }
      
      document.cookie = cookieString;
      
      return true;
    },
    /**
     * Gets a cookie.
     */
    get: function (key) {
      return getCookie(key);
    },
    /**
     * Gets all cookies.
     */
    all: function () {
      return getCookie();
    },
    /**
     * Expires a cookie.
     */
    remove: function (key) {
      return this.set(key, '', -1);
    }
  };
})();