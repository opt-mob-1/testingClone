var $ = jQuery;

var main = (function () {

    var doc = document,
        head = doc.getElementsByTagName('head')[0],
        noop = function () {
        };


    /**
     * Returns age in years.
     * @memberOf Visit
     *
     * @param {object} string Accepts an DateOfBirth string
     *
     * @returns string
     */
    function calculateAge(birthday) { // birthday is a string
        var birthDate = new Date(birthday);
        var ageDifMs = Date.now() - birthDate.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    }

    /**
     * Converts a string with underscore to Camel Cased string
     * @memberOf Visit
     *
     * @param {string} string Accepts a string
     *
     * @returns {string}
     */
    function snakeToCamelCase(value) {
        return (value.includes('_')) ? value.replace(/(\_\w)/g, function(m){return m[1].toUpperCase();}) : (value.substring(0,1) + value.substring(1,2).toUpperCase() + value.substring(2));
    }

    /**
     * Returns random visitId.
     * @memberOf Visit
     *
     * @returns string
     */
    function generateVisitId() { // birthday is a string
        var array = new Uint32Array(3);
        window.crypto.getRandomValues(array);
        var generatedId ='';
        for (var i = 0; i < array.length; i++) {
            generatedId += array[i] + "-";
        }
        generatedId += Date.now().toString();
        return generatedId;
    }

    /**
     * Save a visit.
     * @memberOf Visit
     *
     * @param {object} attributes An object of properties to be sent to Visit API.
     * @param {function} callback
     */
    Visit.prototype.save = function (callback, macroEvent = false) {
        var self = this;

        callback = callback || noop;

        if (callback && 'function' !== typeof callback) {
            throw new Error('Invalid callback given.');
        }

        this.cookies.set('visitId', this.visitId, {expires: 30});
        this.setEndTime();
        if( macroEvent ){
            this.macroEvent = macroEvent;
        }

        if (this.cookies.get('apiVisitorId')) {
            this.visitorId = this.cookies.get('apiVisitorId');
        }


        var visitData = JSON.stringify(this);
        $.ajax({
            method: "POST",
            url: '/postVisit',
            data: visitData
        })
            .done(function( data ) {
                console.log(data);
                if(data.status == 'SUCCESS'){
                    // handleResponse(self, data, function () {
                    //     callback(false, self);
                    // });
                }
                else {
                    throw new Error('Invalid post request');
                }
            });
    };

    /**
     * Sanitize visit attributes
     * @param  {object} attributes raw visit attributes collected from input
     * @return {object} sanitized visit attributes
     */
    Visit.prototype.sanitize = function (attributes) {
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
                    if (typeof(obj[key]) === 'string') {
                        // if type is string, run replace
                        obj[key] = obj[key].replace(/([+]).{0}/g, ' ').replace(/([;?<>^*%!=&\\|]).{0}/g, '');
                    } else if (typeof(obj[key]) === 'object' && obj[key] !== null) {
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
     * Get a visit.
     * @memberOf Visit
     *
     * @param {object} attribute Visit attributes like dob, zip code, email, etc.
     * @param def
     *
     * @returns {*}
     */
    Visit.prototype.get = function (attribute, def) {
        def = def || '';

        return this.attributes[attribute] ? this.attributes[attribute] : def;
    };

    /**
     * Sets visit's attributes.
     * @memberOf Visit
     *
     * @param {object} attributes
     */
    Visit.prototype.setAttributes = function (attributes) {
        if ((typeof attributes.visitAttributes != "undefined") && (typeof attributes.visitAttributes.dateOfBirth != "undefined") && typeof attributes.visitAttributes.dateOfBirth == "Date") {
            function DateOfBirth(date) {
                this.day = date.getUTCDate();
                this.month = parseInt(date.getUTCMonth()) + 1;
                this.year = date.getUTCFullYear();
                this.date = date;
            }

            DateOfBirth.prototype.toString = function (separator) {
                separator = separator || '-';

                return this.year + separator + this.month + separator + this.day;
            };

            attributes.visitAttributes.dateOfBirth = new DateOfBirth(new Date(attributes.visitAttributes.dateOfBirth * 1000));
        }

        this.attributes = attributes || {};
    };

    /**
     * Sets visit's startTime.
     * @memberOf Visit
     *
     * @param {string} startTime
     */
    Visit.prototype.setStartTime = function () {
        this.startTime = getCurrentTimeUTC();
    };

    /**
     * Sets visit's milestone.
     * @memberOf Visit
     *
     */
    Visit.prototype.setMilestone = function () {
        var milestoneSelector= document.querySelector('.js-milestone');
        if ( milestoneSelector ) {
            this.milestone = milestoneSelector.dataset.milestone;
        }
    };


    /**
     * Sets visit's endTime.
     * @memberOf Visit
     *
     * @param {string} endTime
     */
    Visit.prototype.setEndTime = function () {
        this.endTime = getCurrentTimeUTC();
    };

    /**
     *
     * Sets visit's endTime.
     * @memberOf Visit
     *
     * @param {string} endTime
     * {
            "eventName" : "firstNameInput",
            "sequence": "1",
            "start": "2017-08-19T12:08:23",
            "end": "2017-08-19T12:08:24"
        },
     */
    Visit.prototype.setMicroEvent = function (inputName) {
        var microEventObject = {};
        microEventObject.eventName = inputName;
        microEventObject.startTime = getCurrentTimeUTC();
        this.microEvent = microEventObject;
    };

    /**
     * Sets visit's macroEvent.
     * @memberOf Visit
     *
     * @param {string} value
     */
    Visit.prototype.setMacroEvent = function (value) {
        this.macroEvent = value;
    };

    /**
     * The Visit constructor.
     * @class Visit
     * @namespace Visit
     *
     * @param {object} options
     *
     * @constructor
     */
    function Visit(options) {
        this.visitId = undefined;
        this.visitorId = undefined;
        this.milestone = undefined;
        this.startTime = undefined;
        this.endTime = undefined;
        this.acquisition = undefined;
        this.macroEvent = undefined;
        this.technology = undefined;
        //this.microEvent = undefined;
    }

    /**
     * Initializes the visit path object.
     * @memberOf Visit
     *
     * @param callback
     */
    Visit.prototype.start = function (callback) {
        var self = this;
        var visitId = this.cookies.get('visitId');
        if ( visitId ) {
            this.visitId = visitId;
        } else {
            this.visitId = generateVisitId();
        }

        if (this.cookies.get('apiVisitorId')) {
            this.visitorId = this.cookies.get('apiVisitorId');
        }

        this.setMilestone();

        this.startTime = getCurrentTimeUTC();

        var pathName = window.location.pathname.split('/');
        this.acquisition = {
            hostName: window.location.hostname,
            zVv:pathName[1],
            zVr: pathName[2]
        };

        var intialAcquisition = getAllUrlParams(window.location.toString());
        if( intialAcquisition ){
            for(var attribute in intialAcquisition){
                this.acquisition[snakeToCamelCase(attribute)] = intialAcquisition[attribute];
                // this.acquisition.utm_campaign = zeeto_test
            }
        }

        this.technology = {};
        if( typeof ipPromise != 'undefined' ){
            ipPromise.then(function (ip){
                self.technology['ipAddress'] = ip;
            });
        }

        self.technology['operatingSystem'] = getOS().name;
        self.technology['browser'] = getBrowser()[0];
        self.technology['browserVersion'] = getBrowser()[1];
        if( self.acquisition.zDc ) {
            self.technology['deviceCategory'] = self.acquisition.zDc;
        }
        self.technology['deviceType'] = navigator.platform;
        // Triggers Save upon window unfocus
        window.addEventListener("blur", function(event) {
            self.save(function(){});
        }, false);

        // Sets Start time on window focus
        window.addEventListener("focus", function(event) {
            self.setStartTime();
        }, false);

        // Triggers Save before window unload
        $(window).bind('beforeunload', function(){
            self.save(function(){});
        });

        //this.microEvent = [];
    };

    /*
     *  Function to get current time in UTC
     */
    function getCurrentTimeUTC(){
        var currentDate = new Date();
        return currentDate.getUTCFullYear() + '-' + currentDate.getUTCMonth() + '-' + currentDate.getUTCDate()+'T'+currentDate.getUTCHours() + ":" + currentDate.getUTCMinutes() + ":" + currentDate.getUTCSeconds();
    }


    /**
     * Manipulate Cookies. This method is partially taken
     * from http://quirksmode.org/js/cookies.html.
     * @memberOf Visit
     */
    Visit.prototype.cookies = (function () {
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

    window.Visit = Visit;

}).call(this);


window.Visit = new window.Visit();
Visit.start();