'use strict';


/**
 * Main function
 * @namespace PathJS force path session start
 * Updated by Code Wranglers. 8/22/17
 */

var $ = jQuery;

var main = function () {

    var doc = document,
        head = doc.getElementsByTagName('head')[0],
        noop = function noop() {};

    /**
     * Returns true if argument is an array.
     * @memberOf PathJS
     *
     * @param {object} array Accepts an object to test if its an array.
     *
     * @returns {boolean}
     */
    function isArray(array) {
        return Object.prototype.toString.call(array) === "[object Array]";
    }

    /**
     * Converts a string with underscore to Camel Cased string
     * @memberOf Visitor
     *
     * @param {string} string Accepts a string
     *
     * @returns {string}
     */
    function toCamelCase(value) {
        return value.replace(/(\_\w)/g, function (m) {
            return m[1].toUpperCase();
        });
    }

    /**
     * Returns age in years.
     * @memberOf Visitor
     *
     * @param {object} string Accepts an DateOfBirth string
     *
     * @returns string
     */
    function calculateAge(birthday) {
        // birthday is a string
        var birthDate = new Date(birthday);
        var ageDifMs = Date.now() - birthDate.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    }

    /**
    * Builds visitor data for the API call
    * @memberOf Visitor
    *
    * @param {object} data A data object
    *
    * @returns {string} payload
    */
    function buildRequestData(data) {
        var value = {};
        var addressAttr = ['address', 'city', 'state', 'zip'];
        var primaryAttr = ['email', 'gaClientId', 'gaUserId', 'visitorAttributes', 'customAttributes', 'completedForm', 'deleted', 'creationDate', 'modifyDate'];
        var visitorAttr = ['firstName', 'lastName', 'gaClientId', 'gaUserId', 'dateOfBirth', 'mobilePhone', 'gender'];
        value['visitorAttributes'] = {};
        value['visitorAttributes']['address'] = {};
        value['customAttributes'] = {};
        for (var attribute in data) {
            var sanitizedAttribute = attribute.includes('_') ? toCamelCase(attribute) : attribute;
            if (addressAttr.includes(sanitizedAttribute)) {
                sanitizedAttribute = sanitizedAttribute == 'state' ? 'stateInitials' : sanitizedAttribute;
                sanitizedAttribute = sanitizedAttribute == 'address' ? 'street1' : sanitizedAttribute;
                value['visitorAttributes']['address'][sanitizedAttribute] = data[attribute];
            } else if (primaryAttr.includes(sanitizedAttribute)) {
                value[sanitizedAttribute] = data[attribute];
            } else if (visitorAttr.includes(sanitizedAttribute)) {
                if (sanitizedAttribute == 'mobilePhone') {
                    value['visitorAttributes']['phone'] = data[attribute];
                } else if (sanitizedAttribute == 'gender') {
                    value['visitorAttributes'][sanitizedAttribute] = data[attribute] == 'M' ? 'MALE' : 'FEMALE';
                } else {
                    value['visitorAttributes'][sanitizedAttribute] = data[attribute];
                    if (sanitizedAttribute == 'dateOfBirth') {
                        var dateOfBirth = data[attribute].split("-");
                        value['visitorAttributes'][sanitizedAttribute] = dateOfBirth[2] + '-' + dateOfBirth[1] + '-' + dateOfBirth[0];
                        value['visitorAttributes']['age'] = calculateAge(dateOfBirth[1] + '-' + dateOfBirth[0] + '-' + dateOfBirth[2]);
                    }
                }
            } else {
                value['customAttributes'][sanitizedAttribute] = data[attribute];
            }
        }
        return value;
    }

    /**
     * Handle the response.
     * @memberOf Visitor
     *
     * @param {object} Visitor
     * @param {object} response
     * @param {function} callback
     */
    function handleResponse(Visitor, response, callback) {
        if (response && response['_id']) {
            Visitor.id = response['_id'];
            Visitor.cookies.set('apiVisitorId', response['_id'], { expires: 90 });
            Visitor.setAttributes(response);
        }

      if (response && response['visitorId']) {
        Visitor.id = response['visitorId'];
        Visitor.cookies.set('apiVisitorId', response['visitorId'], { expires: 90 });
        Visitor.setAttributes(response);
      }

        if (callback) {
            callback(response);
        }
    }

    /**
     * Fetch a visitor.
     * @memberOf Visitor
     * @param {function} callback
     */
    Visitor.prototype.fetch = function (callback) {
        var self = this;
        $.ajax({
            method: "GET",
            url: '/getVisitor/' + self.id
        }).done(function (data) {

            handleResponse(self, data.visitor[0], function () {
                if (data._id) {
                    // self.setAttributes(data);
                    callback(false, self);
                } else {
                    callback(true);
                }
            });
        });
    };

    /**
     * * Fetch a visitor.
     * * @memberOf Visitor
     * * @param {function} callback
     * */
    Visitor.prototype.fetchByEmail = function (email, callback) {
        var self = this;
        $.ajax({
            method: "GET",
            url: '/getVisitorByEmail/' + email
        }).done(function (data) {
            if (data.status == 'SUCCESS') {
                handleResponse(self, data.visitor[0], function () {
                    callback(false, data);
                });
            } else {
                handleResponse(self, data, function () {
                    callback(false, data);
                });
            }
        });
    };

    /**
     * Save a visitor.
     * @memberOf Visitor
     *
     * @param {object} attributes An object of properties to be sent to Visitor API.
     * @param {function} callback
     */
    Visitor.prototype.save = function (attributes, callback) {
        var self = this;
        callback = callback || noop;

        if ('object' !== (typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes))) {
            throw new Error('Invalid attributes given.');
        }

        if (callback && 'function' !== typeof callback) {
            throw new Error('Invalid callback given.');
        }

        var visitorDataObject = buildRequestData(this.sanitize(attributes));
        var creationDate = new Date();
        // Javascript's month is between 0 to 11
        var currentMonth = creationDate.getUTCMonth() + 1;
        visitorDataObject['creationDate'] = creationDate.getUTCFullYear() + '-' + currentMonth + '-' + creationDate.getUTCDate() + 'T' + creationDate.getUTCHours() + ':' + creationDate.getUTCMinutes() + ':' + creationDate.getUTCSeconds();
        visitorDataObject['modifyDate'] = creationDate.getUTCFullYear() + '-' + currentMonth + '-' + creationDate.getUTCDate() + 'T' + creationDate.getUTCHours() + ':' + creationDate.getUTCMinutes() + ':' + creationDate.getUTCSeconds();
        visitorDataObject['completedForm'] = 'false';
        visitorDataObject['deleted'] = 'false';
        var visitorData = JSON.stringify(visitorDataObject);


        $.ajax({
            method: "POST",
            url: '/postVisitor',
            data: visitorData
        }).done(function (data) {
            console.log(data);
            console.log('asdasdas');
            if (data.status == 'SUCCESS') {
                handleResponse(self, data, function () {
                    if (visitorDataObject) {
                        self.setAttributes(visitorDataObject);
                        callback(false, self);
                    } else {

                        callback(response.errors instanceof Array || {});
                    }
                });
            } else {
                throw new Error('Invalid post request');
            }
        });
    };

    /**
     * Update a visitor.
     * @memberOf Visitor
     *
     * @param {object} attributes An object of properties to be update on the Visitor API.
     * @param {function} callback
     */
    Visitor.prototype.update = function (attributes, callback) {
        var self = this;
        callback = callback || noop;

        if ('object' !== (typeof attributes === 'undefined' ? 'undefined' : _typeof(attributes))) {
            throw new Error('Invalid attributes given.');
        }

        if (callback && 'function' !== typeof callback) {
            throw new Error('Invalid callback given.');
        }

        var visitorDataObject = buildRequestData(this.sanitize(attributes));
        var creationDate = new Date();
        // Javascript's month is between 0 to 11
        var currentMonth = creationDate.getUTCMonth() + 1;
        visitorDataObject['modifyDate'] = creationDate.getFullYear().toString() + '-' + currentMonth + '-' + creationDate.getDate().toString() + 'T' + creationDate.getHours().toString() + ':' + creationDate.getMinutes().toString() + ':' + creationDate.getSeconds().toString();
        var visitorData = JSON.stringify(visitorDataObject);
        // this.path.queue(function () {

        $.ajax({
            method: "PUT",
            url: '/updateVisitor/' + self.id,
            data: visitorData
        }).done(function (data) {
            if (data.status == 'SUCCESS') {
                handleResponse(self, data, function () {
                    if (visitorDataObject) {
                        self.setAttributes(visitorDataObject);
                        callback(false, self);
                    } else {

                        callback(response.errors instanceof Array || {});
                    }
                });
            }
        });
        //  });
    };

    /**
     * Sanitize visitor attributes
     * @param  {object} attributes raw visitor attributes collected from input
     * @return {object} sanitized visitor attributes
     */
    Visitor.prototype.sanitize = function (attributes) {
        /**
         * Checks if key is type string, runs replace, if type is object, recursively call itself
         * @param  {object} obj user parameters object
         * @return {object} cleansed user object
         */
        var clean = function clean(obj) {
            var key;
            for (key in obj) {
                // use hasOwnProperty to avoid checking against prototype parameters
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'string') {
                        // if type is string, run replace
                        obj[key] = obj[key].replace(/([+]).{0}/g, ' ').replace(/([;?<>^*%!=&\\|]).{0}/g, '');
                    } else if (_typeof(obj[key]) === 'object' && obj[key] !== null) {
                        // if type is object, recursively call clean method
                        obj[key] = clean(obj[key]);
                    }
                }
            }
            return obj;
        };
        // call clean method for user attributes object
        return clean(attributes);
    };

    /**
     * Get a visitor.
     * @memberOf Visitor
     *
     * @param {object} attribute Visitor attributes like dob, zip code, email, etc.
     * @param def
     *
     * @returns {*}
     */
    Visitor.prototype.get = function (attribute, def) {
        def = def || '';

        return this.attributes[attribute] ? this.attributes[attribute] : def;
    };

    /**
     * Sets visitor's attributes.
     * @memberOf Visitor
     *
     * @param {object} attributes
     */
    Visitor.prototype.setAttributes = function (attributes) {
        if (typeof attributes.visitorAttributes != "undefined" && typeof attributes.visitorAttributes.dateOfBirth != "undefined" && typeof attributes.visitorAttributes.dateOfBirth == "Date") {
            var DateOfBirth = function DateOfBirth(date) {
                this.day = date.getUTCDate();
                this.month = parseInt(date.getUTCMonth()) + 1;
                this.year = date.getUTCFullYear();
                this.date = date;
            };

            DateOfBirth.prototype.toString = function (separator) {
                separator = separator || '-';

                return this.year + separator + this.month + separator + this.day;
            };

            attributes.visitorAttributes.dateOfBirth = new DateOfBirth(new Date(attributes.visitorAttributes.dateOfBirth * 1000));
        }

        this.attributes = attributes || {};
    };

    /**
     * The Visitor constructor.
     * @class Visitor
     * @namespace Visitor
     *
     * @param {object} options
     *
     * @constructor
     */
    function Visitor(options) {
        this.id = undefined;
        this.attributes = {};
    }

    /**
     * Initializes the visitor path object.
     * @memberOf Visitor
     *
     * @param callback
     */
    Visitor.prototype.start = function (callback) {
        var apiVisitorId = this.cookies.get('apiVisitorId');
        var visitorReadyEvent = new Event('visitorReady');
      var visitorUndefinedEvent = new Event('visitorUndefined');
        if (apiVisitorId) {
            this.id = apiVisitorId;
        }
        // if this.session.id exists, bypass api post call
        if (this.id) {
            this.fetch(function (error, response) {
              window.dispatchEvent(visitorReadyEvent);
            });
            return;
        } else {
          window.dispatchEvent(visitorUndefinedEvent);
        }
    };

    /**
     * Manipulate Cookies. This method is partially taken
     * from http://quirksmode.org/js/cookies.html.
     * @memberOf Visitor
     */
    Visitor.prototype.cookies = function () {
        var decode, getCookie;

        // gets a cookie (or all cookies if key is left null)
        getCookie = function getCookie(key) {
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
        decode = function decode(value) {
            if (0 === value.indexOf('"')) {
                value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
            return value;
        };

        return {
            /**
             * Sets a cookie.
             */
            set: function set(key, value, options) {
                var cookieString, days, t;

                options = options || {};

                if ('number' === typeof options.expires) {
                    days = options.expires;
                    t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
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
            get: function get(key) {
                return getCookie(key);
            },
            /**
             * Gets all cookies.
             */
            all: function all() {
                return getCookie();
            },
            /**
             * Expires a cookie.
             */
            remove: function remove(key) {
                return this.set(key, '', -1);
            }
        };
    }();

    window.Visitor = Visitor;
}.call(undefined);



// Initialize the Visit Object
window.Visitor = new window.Visitor();
Visitor.start();

