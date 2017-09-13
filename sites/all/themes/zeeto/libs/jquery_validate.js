/*!
 * jQuery Validation Plugin v1.14.0
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2015 JÃ¶rn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
  if ( typeof define === "function" && define.amd ) {
    define( ["jquery"], factory );
  } else {
    factory( jQuery );
  }
}(function( $ ) {

  $.extend($.fn, {
    // http://jqueryvalidation.org/validate/
    validate: function( options ) {

      // if nothing is selected, return nothing; can't chain anyway
      if ( !this.length ) {
        if ( options && options.debug && window.console ) {
          console.warn( "Nothing selected, can't validate, returning nothing." );
        }
        return;
      }

      // check if a validator for this form was already created
      var validator = $.data( this[ 0 ], "validator" );
      if ( validator ) {
        return validator;
      }

      // Add novalidate tag if HTML5.
      this.attr( "novalidate", "novalidate" );

      validator = new $.validator( options, this[ 0 ] );
      $.data( this[ 0 ], "validator", validator );

      if ( validator.settings.onsubmit ) {

        this.on( "click.validate", ":submit", function( event ) {
          if ( validator.settings.submitHandler ) {
            validator.submitButton = event.target;
          }

          // allow suppressing validation by adding a cancel class to the submit button
          if ( $( this ).hasClass( "cancel" ) ) {
            validator.cancelSubmit = true;
          }

          // allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
          if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
            validator.cancelSubmit = true;
          }
        });

        // validate the form on submit
        this.on( "submit.validate", function( event ) {
          if ( validator.settings.debug ) {
            // prevent form submit to be able to see console output
            event.preventDefault();
          }
          function handle() {
            var hidden, result;
            if ( validator.settings.submitHandler ) {
              if ( validator.submitButton ) {
                // insert a hidden input as a replacement for the missing submit button
                hidden = $( "<input type='hidden'/>" )
                  .attr( "name", validator.submitButton.name )
                  .val( $( validator.submitButton ).val() )
                  .appendTo( validator.currentForm );
              }
              result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
              if ( validator.submitButton ) {
                // and clean up afterwards; thanks to no-block-scope, hidden can be referenced
                hidden.remove();
              }
              if ( result !== undefined ) {
                return result;
              }
              return false;
            }
            return true;
          }

          // prevent submit for invalid forms or custom submit handlers
          if ( validator.cancelSubmit ) {
            validator.cancelSubmit = false;
            return handle();
          }
          if ( validator.form() ) {
            if ( validator.pendingRequest ) {
              validator.formSubmitted = true;
              return false;
            }
            return handle();
          } else {
            validator.focusInvalid();
            return false;
          }
        });
      }

      return validator;
    },
    // http://jqueryvalidation.org/valid/
    valid: function() {
      var valid, validator, errorList;

      if ( $( this[ 0 ] ).is( "form" ) ) {
        valid = this.validate().form();
      } else {
        errorList = [];
        valid = true;
        validator = $( this[ 0 ].form ).validate();
        this.each( function() {
          valid = validator.element( this ) && valid;
          errorList = errorList.concat( validator.errorList );
        });
        validator.errorList = errorList;
      }
      return valid;
    },

    // http://jqueryvalidation.org/rules/
    rules: function( command, argument ) {
      var element = this[ 0 ],
        settings, staticRules, existingRules, data, param, filtered;

      if ( command ) {
        settings = $.data( element.form, "validator" ).settings;
        staticRules = settings.rules;
        existingRules = $.validator.staticRules( element );
        switch ( command ) {
          case "add":
            $.extend( existingRules, $.validator.normalizeRule( argument ) );
            // remove messages from rules, but allow them to be set separately
            delete existingRules.messages;
            staticRules[ element.name ] = existingRules;
            if ( argument.messages ) {
              settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
            }
            break;
          case "remove":
            if ( !argument ) {
              delete staticRules[ element.name ];
              return existingRules;
            }
            filtered = {};
            $.each( argument.split( /\s/ ), function( index, method ) {
              filtered[ method ] = existingRules[ method ];
              delete existingRules[ method ];
              if ( method === "required" ) {
                $( element ).removeAttr( "aria-required" );
              }
            });
            return filtered;
        }
      }

      data = $.validator.normalizeRules(
        $.extend(
          {},
          $.validator.classRules( element ),
          $.validator.attributeRules( element ),
          $.validator.dataRules( element ),
          $.validator.staticRules( element )
        ), element );

      // make sure required is at front
      if ( data.required ) {
        param = data.required;
        delete data.required;
        data = $.extend( { required: param }, data );
        $( element ).attr( "aria-required", "true" );
      }

      // make sure remote is at back
      if ( data.remote ) {
        param = data.remote;
        delete data.remote;
        data = $.extend( data, { remote: param });
      }

      return data;
    }
  });

// Custom selectors
  $.extend( $.expr[ ":" ], {
    // http://jqueryvalidation.org/blank-selector/
    blank: function( a ) {
      return !$.trim( "" + $( a ).val() );
    },
    // http://jqueryvalidation.org/filled-selector/
    filled: function( a ) {
      return !!$.trim( "" + $( a ).val() );
    },
    // http://jqueryvalidation.org/unchecked-selector/
    unchecked: function( a ) {
      return !$( a ).prop( "checked" );
    }
  });

// constructor for validator
  $.validator = function( options, form ) {
    this.settings = $.extend( true, {}, $.validator.defaults, options );
    this.currentForm = form;
    this.init();
  };

// http://jqueryvalidation.org/jQuery.validator.format/
  $.validator.format = function( source, params ) {
    if ( arguments.length === 1 ) {
      return function() {
        var args = $.makeArray( arguments );
        args.unshift( source );
        return $.validator.format.apply( this, args );
      };
    }
    if ( arguments.length > 2 && params.constructor !== Array  ) {
      params = $.makeArray( arguments ).slice( 1 );
    }
    if ( params.constructor !== Array ) {
      params = [ params ];
    }
    $.each( params, function( i, n ) {
      source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
        return n;
      });
    });
    return source;
  };

  $.extend( $.validator, {

    defaults: {
      messages: {},
      groups: {},
      rules: {},
      errorClass: "error",
      validClass: "valid",
      errorElement: "label",
      focusCleanup: false,
      focusInvalid: true,
      errorContainer: $( [] ),
      errorLabelContainer: $( [] ),
      onsubmit: true,
      ignore: ":hidden",
      ignoreTitle: false,
      onfocusin: function( element ) {
        this.lastActive = element;

        // Hide error label and remove error class on focus if enabled
        if ( this.settings.focusCleanup ) {
          if ( this.settings.unhighlight ) {
            this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
          }
          this.hideThese( this.errorsFor( element ) );
        }
      },
      onfocusout: function( element ) {
        if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
          this.element( element );
        }
      },
      onkeyup: function( element, event ) {
        // Avoid revalidate the field when pressing one of the following keys
        // Shift       => 16
        // Ctrl        => 17
        // Alt         => 18
        // Caps lock   => 20
        // End         => 35
        // Home        => 36
        // Left arrow  => 37
        // Up arrow    => 38
        // Right arrow => 39
        // Down arrow  => 40
        // Insert      => 45
        // Num lock    => 144
        // AltGr key   => 225
        var excludedKeys = [
          16, 17, 18, 20, 35, 36, 37,
          38, 39, 40, 45, 144, 225
        ];

        if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
          return;
        } else if ( element.name in this.submitted || element === this.lastElement ) {
          this.element( element );
        }
      },
      onclick: function( element ) {
        // click on selects, radiobuttons and checkboxes
        if ( element.name in this.submitted ) {
          this.element( element );

          // or option elements, check parent select in that case
        } else if ( element.parentNode.name in this.submitted ) {
          this.element( element.parentNode );
        }
      },
      highlight: function( element, errorClass, validClass ) {
        if ( element.type === "radio" ) {
          this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
        } else {
          $( element ).addClass( errorClass ).removeClass( validClass );
        }
      },
      unhighlight: function( element, errorClass, validClass ) {
        if ( element.type === "radio" ) {
          this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
        } else {
          $( element ).removeClass( errorClass ).addClass( validClass );
        }
      }
    },

    // http://jqueryvalidation.org/jQuery.validator.setDefaults/
    setDefaults: function( settings ) {
      $.extend( $.validator.defaults, settings );
    },

    messages: {
      required: "This field is required.",
      remote: "Please fix this field.",
      email: "Please enter a valid email address.",
      url: "Please enter a valid URL.",
      date: "Please enter a valid date.",
      dateISO: "Please enter a valid date ( ISO ).",
      number: "Please enter a valid number.",
      digits: "Please enter only digits.",
      creditcard: "Please enter a valid credit card number.",
      equalTo: "Please enter the same value again.",
      maxlength: $.validator.format( "Please enter no more than {0} characters." ),
      minlength: $.validator.format( "Please enter at least {0} characters." ),
      rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
      range: $.validator.format( "Please enter a value between {0} and {1}." ),
      max: $.validator.format( "Please enter a value less than or equal to {0}." ),
      min: $.validator.format( "Please enter a value greater than or equal to {0}." )
    },

    autoCreateRanges: false,

    prototype: {

      init: function() {
        this.labelContainer = $( this.settings.errorLabelContainer );
        this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
        this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
        this.submitted = {};
        this.valueCache = {};
        this.pendingRequest = 0;
        this.pending = {};
        this.invalid = {};
        this.reset();

        var groups = ( this.groups = {} ),
          rules;
        $.each( this.settings.groups, function( key, value ) {
          if ( typeof value === "string" ) {
            value = value.split( /\s/ );
          }
          $.each( value, function( index, name ) {
            groups[ name ] = key;
          });
        });
        rules = this.settings.rules;
        $.each( rules, function( key, value ) {
          rules[ key ] = $.validator.normalizeRule( value );
        });

        function delegate( event ) {
          var validator = $.data( this.form, "validator" ),
            eventType = "on" + event.type.replace( /^validate/, "" ),
            settings = validator.settings;
          if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
            settings[ eventType ].call( validator, this, event );
          }
        }

        $( this.currentForm )
          .on( "focusin.validate focusout.validate keyup.validate",
            ":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
            "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
            "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
            "[type='radio'], [type='checkbox']", delegate)
          // Support: Chrome, oldIE
          // "select" is provided as event.target when clicking a option
          .on("click.validate", "select, option, [type='radio'], [type='checkbox']", delegate);

        if ( this.settings.invalidHandler ) {
          $( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
        }

        // Add aria-required to any Static/Data/Class required fields before first validation
        // Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
        $( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
      },

      // http://jqueryvalidation.org/Validator.form/
      form: function() {
        this.checkForm();
        $.extend( this.submitted, this.errorMap );
        this.invalid = $.extend({}, this.errorMap );
        if ( !this.valid() ) {
          $( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
        }
        this.showErrors();
        return this.valid();
      },

      checkForm: function() {
        this.prepareForm();
        for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
          this.check( elements[ i ] );
        }
        return this.valid();
      },

      // http://jqueryvalidation.org/Validator.element/
      element: function( element ) {
        var cleanElement = this.clean( element ),
          checkElement = this.validationTargetFor( cleanElement ),
          result = true;

        this.lastElement = checkElement;

        if ( checkElement === undefined ) {
          delete this.invalid[ cleanElement.name ];
        } else {
          this.prepareElement( checkElement );
          this.currentElements = $( checkElement );

          result = this.check( checkElement ) !== false;
          if ( result ) {
            delete this.invalid[ checkElement.name ];
          } else {
            this.invalid[ checkElement.name ] = true;
          }
        }
        // Add aria-invalid status for screen readers
        $( element ).attr( "aria-invalid", !result );

        if ( !this.numberOfInvalids() ) {
          // Hide error containers on last error
          this.toHide = this.toHide.add( this.containers );
        }
        this.showErrors();
        return result;
      },

      // http://jqueryvalidation.org/Validator.showErrors/
      showErrors: function( errors ) {
        if ( errors ) {
          // add items to error list and map
          $.extend( this.errorMap, errors );
          this.errorList = [];
          for ( var name in errors ) {
            this.errorList.push({
              message: errors[ name ],
              element: this.findByName( name )[ 0 ]
            });
          }
          // remove items from success list
          this.successList = $.grep( this.successList, function( element ) {
            return !( element.name in errors );
          });
        }
        if ( this.settings.showErrors ) {
          this.settings.showErrors.call( this, this.errorMap, this.errorList );
        } else {
          this.defaultShowErrors();
        }
      },

      // http://jqueryvalidation.org/Validator.resetForm/
      resetForm: function() {
        if ( $.fn.resetForm ) {
          $( this.currentForm ).resetForm();
        }
        this.submitted = {};
        this.lastElement = null;
        this.prepareForm();
        this.hideErrors();
        var i, elements = this.elements()
          .removeData( "previousValue" )
          .removeAttr( "aria-invalid" );

        if ( this.settings.unhighlight ) {
          for ( i = 0; elements[ i ]; i++ ) {
            this.settings.unhighlight.call( this, elements[ i ],
              this.settings.errorClass, "" );
          }
        } else {
          elements.removeClass( this.settings.errorClass );
        }
      },

      numberOfInvalids: function() {
        return this.objectLength( this.invalid );
      },

      objectLength: function( obj ) {
        /* jshint unused: false */
        var count = 0,
          i;
        for ( i in obj ) {
          count++;
        }
        return count;
      },

      hideErrors: function() {
        this.hideThese( this.toHide );
      },

      hideThese: function( errors ) {
        errors.not( this.containers ).text( "" );
        this.addWrapper( errors ).hide();
      },

      valid: function() {
        return this.size() === 0;
      },

      size: function() {
        return this.errorList.length;
      },

      focusInvalid: function() {
        if ( this.settings.focusInvalid ) {
          try {
            $( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [])
              .filter( ":visible" )
              .focus()
              // manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
              .trigger( "focusin" );
          } catch ( e ) {
            // ignore IE throwing errors when focusing hidden elements
          }
        }
      },

      findLastActive: function() {
        var lastActive = this.lastActive;
        return lastActive && $.grep( this.errorList, function( n ) {
            return n.element.name === lastActive.name;
          }).length === 1 && lastActive;
      },

      elements: function() {
        var validator = this,
          rulesCache = {};

        // select all valid inputs inside the form (no submit or reset buttons)
        return $( this.currentForm )
          .find( "input, select, textarea" )
          .not( ":submit, :reset, :image, :disabled" )
          .not( this.settings.ignore )
          .filter( function() {
            if ( !this.name && validator.settings.debug && window.console ) {
              console.error( "%o has no name assigned", this );
            }

            // select only the first element for each name, and only those with rules specified
            if ( this.name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
              return false;
            }

            rulesCache[ this.name ] = true;
            return true;
          });
      },

      clean: function( selector ) {
        return $( selector )[ 0 ];
      },

      errors: function() {
        var errorClass = this.settings.errorClass.split( " " ).join( "." );
        return $( this.settings.errorElement + "." + errorClass, this.errorContext );
      },

      reset: function() {
        this.successList = [];
        this.errorList = [];
        this.errorMap = {};
        this.toShow = $( [] );
        this.toHide = $( [] );
        this.currentElements = $( [] );
      },

      prepareForm: function() {
        this.reset();
        this.toHide = this.errors().add( this.containers );
      },

      prepareElement: function( element ) {
        this.reset();
        this.toHide = this.errorsFor( element );
      },

      elementValue: function( element ) {
        var val,
          $element = $( element ),
          type = element.type;

        if ( type === "radio" || type === "checkbox" ) {
          return this.findByName( element.name ).filter(":checked").val();
        } else if ( type === "number" && typeof element.validity !== "undefined" ) {
          return element.validity.badInput ? false : $element.val();
        }

        val = $element.val();
        if ( typeof val === "string" ) {
          return val.replace(/\r/g, "" );
        }
        return val;
      },

      check: function( element ) {
        element = this.validationTargetFor( this.clean( element ) );

        var rules = $( element ).rules(),
          rulesCount = $.map( rules, function( n, i ) {
            return i;
          }).length,
          dependencyMismatch = false,
          val = this.elementValue( element ),
          result, method, rule;

        for ( method in rules ) {
          rule = { method: method, parameters: rules[ method ] };
          try {

            result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

            // if a method indicates that the field is optional and therefore valid,
            // don't mark it as valid when there are no other rules
            if ( result === "dependency-mismatch" && rulesCount === 1 ) {
              dependencyMismatch = true;
              continue;
            }
            dependencyMismatch = false;

            if ( result === "pending" ) {
              this.toHide = this.toHide.not( this.errorsFor( element ) );
              return;
            }

            if ( !result ) {
              this.formatAndAdd( element, rule );
              return false;
            }
          } catch ( e ) {
            if ( this.settings.debug && window.console ) {
              console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
            }
            if ( e instanceof TypeError ) {
              e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
            }

            throw e;
          }
        }
        if ( dependencyMismatch ) {
          return;
        }
        if ( this.objectLength( rules ) ) {
          this.successList.push( element );
        }
        return true;
      },

      // return the custom message for the given element and validation method
      // specified in the element's HTML5 data attribute
      // return the generic message if present and no method specific message is present
      customDataMessage: function( element, method ) {
        return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
            method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
      },

      // return the custom message for the given element name and validation method
      customMessage: function( name, method ) {
        var m = this.settings.messages[ name ];
        return m && ( m.constructor === String ? m : m[ method ]);
      },

      // return the first defined argument, allowing empty strings
      findDefined: function() {
        for ( var i = 0; i < arguments.length; i++) {
          if ( arguments[ i ] !== undefined ) {
            return arguments[ i ];
          }
        }
        return undefined;
      },

      defaultMessage: function( element, method ) {
        return this.findDefined(
          this.customMessage( element.name, method ),
          this.customDataMessage( element, method ),
          // title is never undefined, so handle empty string as undefined
          !this.settings.ignoreTitle && element.title || undefined,
          $.validator.messages[ method ],
          "<strong>Warning: No message defined for " + element.name + "</strong>"
        );
      },

      formatAndAdd: function( element, rule ) {
        var message = this.defaultMessage( element, rule.method ),
          theregex = /\$?\{(\d+)\}/g;
        if ( typeof message === "function" ) {
          message = message.call( this, rule.parameters, element );
        } else if ( theregex.test( message ) ) {
          message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
        }
        this.errorList.push({
          message: message,
          element: element,
          method: rule.method
        });

        this.errorMap[ element.name ] = message;
        this.submitted[ element.name ] = message;
      },

      addWrapper: function( toToggle ) {
        if ( this.settings.wrapper ) {
          toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
        }
        return toToggle;
      },

      defaultShowErrors: function() {
        var i, elements, error;
        for ( i = 0; this.errorList[ i ]; i++ ) {
          error = this.errorList[ i ];
          if ( this.settings.highlight ) {
            this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
          }
          this.showLabel( error.element, error.message );
        }
        if ( this.errorList.length ) {
          this.toShow = this.toShow.add( this.containers );
        }
        if ( this.settings.success ) {
          for ( i = 0; this.successList[ i ]; i++ ) {
            this.showLabel( this.successList[ i ] );
          }
        }
        if ( this.settings.unhighlight ) {
          for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
            this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
          }
        }
        this.toHide = this.toHide.not( this.toShow );
        this.hideErrors();
        this.addWrapper( this.toShow ).show();
      },

      validElements: function() {
        return this.currentElements.not( this.invalidElements() );
      },

      invalidElements: function() {
        return $( this.errorList ).map(function() {
          return this.element;
        });
      },

      showLabel: function( element, message ) {
        var place, group, errorID,
          error = this.errorsFor( element ),
          elementID = this.idOrName( element ),
          describedBy = $( element ).attr( "aria-describedby" );
        if ( error.length ) {
          // refresh error/success class
          error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );
          // replace message on existing label
          error.html( message );
        } else {
          // create error element
          error = $( "<" + this.settings.errorElement + ">" )
            .attr( "id", elementID + "-error" )
            .addClass( this.settings.errorClass )
            .html( message || "" );

          // Maintain reference to the element to be placed into the DOM
          place = error;
          if ( this.settings.wrapper ) {
            // make sure the element is visible, even in IE
            // actually showing the wrapped element is handled elsewhere
            place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
          }
          if ( this.labelContainer.length ) {
            this.labelContainer.append( place );
          } else if ( this.settings.errorPlacement ) {
            this.settings.errorPlacement( place, $( element ) );
          } else {
            place.insertAfter( element );
          }

          // Link error back to the element
          if ( error.is( "label" ) ) {
            // If the error is a label, then associate using 'for'
            error.attr( "for", elementID );
          } else if ( error.parents( "label[for='" + elementID + "']" ).length === 0 ) {
            // If the element is not a child of an associated label, then it's necessary
            // to explicitly apply aria-describedby

            errorID = error.attr( "id" ).replace( /(:|\.|\[|\]|\$)/g, "\\$1");
            // Respect existing non-error aria-describedby
            if ( !describedBy ) {
              describedBy = errorID;
            } else if ( !describedBy.match( new RegExp( "\\b" + errorID + "\\b" ) ) ) {
              // Add to end of list if not already present
              describedBy += " " + errorID;
            }
            $( element ).attr( "aria-describedby", describedBy );

            // If this element is grouped, then assign to all elements in the same group
            group = this.groups[ element.name ];
            if ( group ) {
              $.each( this.groups, function( name, testgroup ) {
                if ( testgroup === group ) {
                  $( "[name='" + name + "']", this.currentForm )
                    .attr( "aria-describedby", error.attr( "id" ) );
                }
              });
            }
          }
        }
        if ( !message && this.settings.success ) {
          error.text( "" );
          if ( typeof this.settings.success === "string" ) {
            error.addClass( this.settings.success );
          } else {
            this.settings.success( error, element );
          }
        }
        this.toShow = this.toShow.add( error );
      },

      errorsFor: function( element ) {
        var name = this.idOrName( element ),
          describer = $( element ).attr( "aria-describedby" ),
          selector = "label[for='" + name + "'], label[for='" + name + "'] *";

        // aria-describedby should directly reference the error element
        if ( describer ) {
          selector = selector + ", #" + describer.replace( /\s+/g, ", #" );
        }
        return this
          .errors()
          .filter( selector );
      },

      idOrName: function( element ) {
        return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
      },

      validationTargetFor: function( element ) {

        // If radio/checkbox, validate first element in group instead
        if ( this.checkable( element ) ) {
          element = this.findByName( element.name );
        }

        // Always apply ignore filter
        return $( element ).not( this.settings.ignore )[ 0 ];
      },

      checkable: function( element ) {
        return ( /radio|checkbox/i ).test( element.type );
      },

      findByName: function( name ) {
        return $( this.currentForm ).find( "[name='" + name + "']" );
      },

      getLength: function( value, element ) {
        switch ( element.nodeName.toLowerCase() ) {
          case "select":
            return $( "option:selected", element ).length;
          case "input":
            if ( this.checkable( element ) ) {
              return this.findByName( element.name ).filter( ":checked" ).length;
            }
        }
        return value.length;
      },

      depend: function( param, element ) {
        return this.dependTypes[typeof param] ? this.dependTypes[typeof param]( param, element ) : true;
      },

      dependTypes: {
        "boolean": function( param ) {
          return param;
        },
        "string": function( param, element ) {
          return !!$( param, element.form ).length;
        },
        "function": function( param, element ) {
          return param( element );
        }
      },

      optional: function( element ) {
        var val = this.elementValue( element );
        return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
      },

      startRequest: function( element ) {
        if ( !this.pending[ element.name ] ) {
          this.pendingRequest++;
          this.pending[ element.name ] = true;
        }
      },

      stopRequest: function( element, valid ) {
        this.pendingRequest--;
        // sometimes synchronization fails, make sure pendingRequest is never < 0
        if ( this.pendingRequest < 0 ) {
          this.pendingRequest = 0;
        }
        delete this.pending[ element.name ];
        if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
          $( this.currentForm ).submit();
          this.formSubmitted = false;
        } else if (!valid && this.pendingRequest === 0 && this.formSubmitted ) {
          $( this.currentForm ).triggerHandler( "invalid-form", [ this ]);
          this.formSubmitted = false;
        }
      },

      previousValue: function( element ) {
        return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
            old: null,
            valid: true,
            message: this.defaultMessage( element, "remote" )
          });
      },

      // cleans up all forms and elements, removes validator-specific events
      destroy: function() {
        this.resetForm();

        $( this.currentForm )
          .off( ".validate" )
          .removeData( "validator" );
      }

    },

    classRuleSettings: {
      required: { required: true },
      email: { email: true },
      url: { url: true },
      date: { date: true },
      dateISO: { dateISO: true },
      number: { number: true },
      digits: { digits: true },
      creditcard: { creditcard: true }
    },

    addClassRules: function( className, rules ) {
      if ( className.constructor === String ) {
        this.classRuleSettings[ className ] = rules;
      } else {
        $.extend( this.classRuleSettings, className );
      }
    },

    classRules: function( element ) {
      var rules = {},
        classes = $( element ).attr( "class" );

      if ( classes ) {
        $.each( classes.split( " " ), function() {
          if ( this in $.validator.classRuleSettings ) {
            $.extend( rules, $.validator.classRuleSettings[ this ]);
          }
        });
      }
      return rules;
    },

    normalizeAttributeRule: function( rules, type, method, value ) {

      // convert the value to a number for number inputs, and for text for backwards compability
      // allows type="date" and others to be compared as strings
      if ( /min|max/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
        value = Number( value );

        // Support Opera Mini, which returns NaN for undefined minlength
        if ( isNaN( value ) ) {
          value = undefined;
        }
      }

      if ( value || value === 0 ) {
        rules[ method ] = value;
      } else if ( type === method && type !== "range" ) {

        // exception: the jquery validate 'range' method
        // does not test for the html5 'range' type
        rules[ method ] = true;
      }
    },

    attributeRules: function( element ) {
      var rules = {},
        $element = $( element ),
        type = element.getAttribute( "type" ),
        method, value;

      for ( method in $.validator.methods ) {

        // support for <input required> in both html5 and older browsers
        if ( method === "required" ) {
          value = element.getAttribute( method );

          // Some browsers return an empty string for the required attribute
          // and non-HTML5 browsers might have required="" markup
          if ( value === "" ) {
            value = true;
          }

          // force non-HTML5 browsers to return bool
          value = !!value;
        } else {
          value = $element.attr( method );
        }

        this.normalizeAttributeRule( rules, type, method, value );
      }

      // maxlength may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
      if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
        delete rules.maxlength;
      }

      return rules;
    },

    dataRules: function( element ) {
      var rules = {},
        $element = $( element ),
        type = element.getAttribute( "type" ),
        method, value;

      for ( method in $.validator.methods ) {
        value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
        this.normalizeAttributeRule( rules, type, method, value );
      }
      return rules;
    },

    staticRules: function( element ) {
      var rules = {},
        validator = $.data( element.form, "validator" );

      if ( validator.settings.rules ) {
        rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
      }
      return rules;
    },

    normalizeRules: function( rules, element ) {
      // handle dependency check
      $.each( rules, function( prop, val ) {
        // ignore rule when param is explicitly false, eg. required:false
        if ( val === false ) {
          delete rules[ prop ];
          return;
        }
        if ( val.param || val.depends ) {
          var keepRule = true;
          switch ( typeof val.depends ) {
            case "string":
              keepRule = !!$( val.depends, element.form ).length;
              break;
            case "function":
              keepRule = val.depends.call( element, element );
              break;
          }
          if ( keepRule ) {
            rules[ prop ] = val.param !== undefined ? val.param : true;
          } else {
            delete rules[ prop ];
          }
        }
      });

      // evaluate parameters
      $.each( rules, function( rule, parameter ) {
        rules[ rule ] = $.isFunction( parameter ) ? parameter( element ) : parameter;
      });

      // clean number parameters
      $.each([ "minlength", "maxlength" ], function() {
        if ( rules[ this ] ) {
          rules[ this ] = Number( rules[ this ] );
        }
      });
      $.each([ "rangelength", "range" ], function() {
        var parts;
        if ( rules[ this ] ) {
          if ( $.isArray( rules[ this ] ) ) {
            rules[ this ] = [ Number( rules[ this ][ 0 ]), Number( rules[ this ][ 1 ] ) ];
          } else if ( typeof rules[ this ] === "string" ) {
            parts = rules[ this ].replace(/[\[\]]/g, "" ).split( /[\s,]+/ );
            rules[ this ] = [ Number( parts[ 0 ]), Number( parts[ 1 ] ) ];
          }
        }
      });

      if ( $.validator.autoCreateRanges ) {
        // auto-create ranges
        if ( rules.min != null && rules.max != null ) {
          rules.range = [ rules.min, rules.max ];
          delete rules.min;
          delete rules.max;
        }
        if ( rules.minlength != null && rules.maxlength != null ) {
          rules.rangelength = [ rules.minlength, rules.maxlength ];
          delete rules.minlength;
          delete rules.maxlength;
        }
      }

      return rules;
    },

    // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
    normalizeRule: function( data ) {
      if ( typeof data === "string" ) {
        var transformed = {};
        $.each( data.split( /\s/ ), function() {
          transformed[ this ] = true;
        });
        data = transformed;
      }
      return data;
    },

    // http://jqueryvalidation.org/jQuery.validator.addMethod/
    addMethod: function( name, method, message ) {
      $.validator.methods[ name ] = method;
      $.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
      if ( method.length < 3 ) {
        $.validator.addClassRules( name, $.validator.normalizeRule( name ) );
      }
    },

    methods: {

      // http://jqueryvalidation.org/required-method/
      required: function( value, element, param ) {
        // check if dependency is met
        if ( !this.depend( param, element ) ) {
          return "dependency-mismatch";
        }
        if ( element.nodeName.toLowerCase() === "select" ) {
          // could be an array for select-multiple or a string, both are fine this way
          var val = $( element ).val();
          return val && val.length > 0;
        }
        if ( this.checkable( element ) ) {
          return this.getLength( value, element ) > 0;
        }
        return value.length > 0;
      },

      // http://jqueryvalidation.org/email-method/
      email: function( value, element ) {
        // From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
        // Retrieved 2014-01-14
        // If you have a problem with this implementation, report a bug against the above spec
        // Or use custom methods to implement your own email validation
        return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
      },

      // http://jqueryvalidation.org/url-method/
      url: function( value, element ) {

        // Copyright (c) 2010-2013 Diego Perini, MIT licensed
        // https://gist.github.com/dperini/729294
        // see also https://mathiasbynens.be/demo/url-regex
        // modified to allow protocol-relative URLs
        return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
      },

      // http://jqueryvalidation.org/date-method/
      date: function( value, element ) {
        return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
      },

      // http://jqueryvalidation.org/dateISO-method/
      dateISO: function( value, element ) {
        return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
      },

      // http://jqueryvalidation.org/number-method/
      number: function( value, element ) {
        return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
      },

      // http://jqueryvalidation.org/digits-method/
      digits: function( value, element ) {
        return this.optional( element ) || /^\d+$/.test( value );
      },

      // http://jqueryvalidation.org/creditcard-method/
      // based on http://en.wikipedia.org/wiki/Luhn_algorithm
      creditcard: function( value, element ) {
        if ( this.optional( element ) ) {
          return "dependency-mismatch";
        }
        // accept only spaces, digits and dashes
        if ( /[^0-9 \-]+/.test( value ) ) {
          return false;
        }
        var nCheck = 0,
          nDigit = 0,
          bEven = false,
          n, cDigit;

        value = value.replace( /\D/g, "" );

        // Basing min and max length on
        // http://developer.ean.com/general_info/Valid_Credit_Card_Types
        if ( value.length < 13 || value.length > 19 ) {
          return false;
        }

        for ( n = value.length - 1; n >= 0; n--) {
          cDigit = value.charAt( n );
          nDigit = parseInt( cDigit, 10 );
          if ( bEven ) {
            if ( ( nDigit *= 2 ) > 9 ) {
              nDigit -= 9;
            }
          }
          nCheck += nDigit;
          bEven = !bEven;
        }

        return ( nCheck % 10 ) === 0;
      },

      // http://jqueryvalidation.org/minlength-method/
      minlength: function( value, element, param ) {
        var length = $.isArray( value ) ? value.length : this.getLength( value, element );
        return this.optional( element ) || length >= param;
      },

      // http://jqueryvalidation.org/maxlength-method/
      maxlength: function( value, element, param ) {
        var length = $.isArray( value ) ? value.length : this.getLength( value, element );
        return this.optional( element ) || length <= param;
      },

      // http://jqueryvalidation.org/rangelength-method/
      rangelength: function( value, element, param ) {
        var length = $.isArray( value ) ? value.length : this.getLength( value, element );
        return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
      },

      // http://jqueryvalidation.org/min-method/
      min: function( value, element, param ) {
        return this.optional( element ) || value >= param;
      },

      // http://jqueryvalidation.org/max-method/
      max: function( value, element, param ) {
        return this.optional( element ) || value <= param;
      },

      // http://jqueryvalidation.org/range-method/
      range: function( value, element, param ) {
        return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
      },

      // http://jqueryvalidation.org/equalTo-method/
      equalTo: function( value, element, param ) {
        // bind to the blur event of the target in order to revalidate whenever the target field is updated
        // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
        var target = $( param );
        if ( this.settings.onfocusout ) {
          target.off( ".validate-equalTo" ).on( "blur.validate-equalTo", function() {
            $( element ).valid();
          });
        }
        return value === target.val();
      },

      // http://jqueryvalidation.org/remote-method/
      remote: function( value, element, param ) {
        if ( this.optional( element ) ) {
          return "dependency-mismatch";
        }

        var previous = this.previousValue( element ),
          validator, data;

        if (!this.settings.messages[ element.name ] ) {
          this.settings.messages[ element.name ] = {};
        }
        previous.originalMessage = this.settings.messages[ element.name ].remote;
        this.settings.messages[ element.name ].remote = previous.message;

        param = typeof param === "string" && { url: param } || param;

        if ( previous.old === value ) {
          return previous.valid;
        }

        previous.old = value;
        validator = this;
        this.startRequest( element );
        data = {};
        data[ element.name ] = value;
        $.ajax( $.extend( true, {
          mode: "abort",
          port: "validate" + element.name,
          dataType: "json",
          data: data,
          context: validator.currentForm,
          success: function( response ) {
            var valid = response === true || response === "true",
              errors, message, submitted;

            validator.settings.messages[ element.name ].remote = previous.originalMessage;
            if ( valid ) {
              submitted = validator.formSubmitted;
              validator.prepareElement( element );
              validator.formSubmitted = submitted;
              validator.successList.push( element );
              delete validator.invalid[ element.name ];
              validator.showErrors();
            } else {
              errors = {};
              message = response || validator.defaultMessage( element, "remote" );
              errors[ element.name ] = previous.message = $.isFunction( message ) ? message( value ) : message;
              validator.invalid[ element.name ] = true;
              validator.showErrors( errors );
            }
            previous.valid = valid;
            validator.stopRequest( element, valid );
          }
        }, param ) );
        return "pending";
      }
    }

  });

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

  var pendingRequests = {},
    ajax;
// Use a prefilter if available (1.5+)
  if ( $.ajaxPrefilter ) {
    $.ajaxPrefilter(function( settings, _, xhr ) {
      var port = settings.port;
      if ( settings.mode === "abort" ) {
        if ( pendingRequests[port] ) {
          pendingRequests[port].abort();
        }
        pendingRequests[port] = xhr;
      }
    });
  } else {
    // Proxy ajax
    ajax = $.ajax;
    $.ajax = function( settings ) {
      var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
        port = ( "port" in settings ? settings : $.ajaxSettings ).port;
      if ( mode === "abort" ) {
        if ( pendingRequests[port] ) {
          pendingRequests[port].abort();
        }
        pendingRequests[port] = ajax.apply(this, arguments);
        return pendingRequests[port];
      }
      return ajax.apply(this, arguments);
    };
  }

}));
/*! jQuery Validation Plugin - v1.14.0 - 6/30/2015
 * http://jqueryvalidation.org/
 * Copyright (c) 2015 Jörn Zaefferer; Licensed MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery","./jquery.validate.min"],a):a(jQuery)}(function(a){!function(){function b(a){return a.replace(/<.[^<>]*?>/g," ").replace(/&nbsp;|&#160;/gi," ").replace(/[.(),;:!?%#$'\"_+=\/\-“”’]*/g,"")}a.validator.addMethod("maxWords",function(a,c,d){return this.optional(c)||b(a).match(/\b\w+\b/g).length<=d},a.validator.format("Please enter {0} words or less.")),a.validator.addMethod("minWords",function(a,c,d){return this.optional(c)||b(a).match(/\b\w+\b/g).length>=d},a.validator.format("Please enter at least {0} words.")),a.validator.addMethod("rangeWords",function(a,c,d){var e=b(a),f=/\b\w+\b/g;return this.optional(c)||e.match(f).length>=d[0]&&e.match(f).length<=d[1]},a.validator.format("Please enter between {0} and {1} words."))}(),a.validator.addMethod("accept",function(b,c,d){var e,f,g="string"==typeof d?d.replace(/\s/g,"").replace(/,/g,"|"):"image/*",h=this.optional(c);if(h)return h;if("file"===a(c).attr("type")&&(g=g.replace(/\*/g,".*"),c.files&&c.files.length))for(e=0;e<c.files.length;e++)if(f=c.files[e],!f.type.match(new RegExp("\\.?("+g+")$","i")))return!1;return!0},a.validator.format("Please enter a value with a valid mimetype.")),a.validator.addMethod("alphanumeric",function(a,b){return this.optional(b)||/^\w+$/i.test(a)},"Letters, numbers, and underscores only please"),a.validator.addMethod("bankaccountNL",function(a,b){if(this.optional(b))return!0;if(!/^[0-9]{9}|([0-9]{2} ){3}[0-9]{3}$/.test(a))return!1;var c,d,e,f=a.replace(/ /g,""),g=0,h=f.length;for(c=0;h>c;c++)d=h-c,e=f.substring(c,c+1),g+=d*e;return g%11===0},"Please specify a valid bank account number"),a.validator.addMethod("bankorgiroaccountNL",function(b,c){return this.optional(c)||a.validator.methods.bankaccountNL.call(this,b,c)||a.validator.methods.giroaccountNL.call(this,b,c)},"Please specify a valid bank or giro account number"),a.validator.addMethod("bic",function(a,b){return this.optional(b)||/^([A-Z]{6}[A-Z2-9][A-NP-Z1-2])(X{3}|[A-WY-Z0-9][A-Z0-9]{2})?$/.test(a)},"Please specify a valid BIC code"),a.validator.addMethod("cifES",function(a){"use strict";var b,c,d,e,f,g,h=[];if(a=a.toUpperCase(),!a.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)"))return!1;for(d=0;9>d;d++)h[d]=parseInt(a.charAt(d),10);for(c=h[2]+h[4]+h[6],e=1;8>e;e+=2)f=(2*h[e]).toString(),g=f.charAt(1),c+=parseInt(f.charAt(0),10)+(""===g?0:parseInt(g,10));return/^[ABCDEFGHJNPQRSUVW]{1}/.test(a)?(c+="",b=10-parseInt(c.charAt(c.length-1),10),a+=b,h[8].toString()===String.fromCharCode(64+b)||h[8].toString()===a.charAt(a.length-1)):!1},"Please specify a valid CIF number."),a.validator.addMethod("cpfBR",function(a){if(a=a.replace(/([~!@#$%^&*()_+=`{}\[\]\-|\\:;'<>,.\/? ])+/g,""),11!==a.length)return!1;var b,c,d,e,f=0;if(b=parseInt(a.substring(9,10),10),c=parseInt(a.substring(10,11),10),d=function(a,b){var c=10*a%11;return(10===c||11===c)&&(c=0),c===b},""===a||"00000000000"===a||"11111111111"===a||"22222222222"===a||"33333333333"===a||"44444444444"===a||"55555555555"===a||"66666666666"===a||"77777777777"===a||"88888888888"===a||"99999999999"===a)return!1;for(e=1;9>=e;e++)f+=parseInt(a.substring(e-1,e),10)*(11-e);if(d(f,b)){for(f=0,e=1;10>=e;e++)f+=parseInt(a.substring(e-1,e),10)*(12-e);return d(f,c)}return!1},"Please specify a valid CPF number"),a.validator.addMethod("creditcardtypes",function(a,b,c){if(/[^0-9\-]+/.test(a))return!1;a=a.replace(/\D/g,"");var d=0;return c.mastercard&&(d|=1),c.visa&&(d|=2),c.amex&&(d|=4),c.dinersclub&&(d|=8),c.enroute&&(d|=16),c.discover&&(d|=32),c.jcb&&(d|=64),c.unknown&&(d|=128),c.all&&(d=255),1&d&&/^(5[12345])/.test(a)?16===a.length:2&d&&/^(4)/.test(a)?16===a.length:4&d&&/^(3[47])/.test(a)?15===a.length:8&d&&/^(3(0[012345]|[68]))/.test(a)?14===a.length:16&d&&/^(2(014|149))/.test(a)?15===a.length:32&d&&/^(6011)/.test(a)?16===a.length:64&d&&/^(3)/.test(a)?16===a.length:64&d&&/^(2131|1800)/.test(a)?15===a.length:128&d?!0:!1},"Please enter a valid credit card number."),a.validator.addMethod("currency",function(a,b,c){var d,e="string"==typeof c,f=e?c:c[0],g=e?!0:c[1];return f=f.replace(/,/g,""),f=g?f+"]":f+"]?",d="^["+f+"([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$",d=new RegExp(d),this.optional(b)||d.test(a)},"Please specify a valid currency"),a.validator.addMethod("dateFA",function(a,b){return this.optional(b)||/^[1-4]\d{3}\/((0?[1-6]\/((3[0-1])|([1-2][0-9])|(0?[1-9])))|((1[0-2]|(0?[7-9]))\/(30|([1-2][0-9])|(0?[1-9]))))$/.test(a)},a.validator.messages.date),a.validator.addMethod("dateITA",function(a,b){var c,d,e,f,g,h=!1,i=/^\d{1,2}\/\d{1,2}\/\d{4}$/;return i.test(a)?(c=a.split("/"),d=parseInt(c[0],10),e=parseInt(c[1],10),f=parseInt(c[2],10),g=new Date(Date.UTC(f,e-1,d,12,0,0,0)),h=g.getUTCFullYear()===f&&g.getUTCMonth()===e-1&&g.getUTCDate()===d?!0:!1):h=!1,this.optional(b)||h},a.validator.messages.date),a.validator.addMethod("dateNL",function(a,b){return this.optional(b)||/^(0?[1-9]|[12]\d|3[01])[\.\/\-](0?[1-9]|1[012])[\.\/\-]([12]\d)?(\d\d)$/.test(a)},a.validator.messages.date),a.validator.addMethod("extension",function(a,b,c){return c="string"==typeof c?c.replace(/,/g,"|"):"png|jpe?g|gif",this.optional(b)||a.match(new RegExp("\\.("+c+")$","i"))},a.validator.format("Please enter a value with a valid extension.")),a.validator.addMethod("giroaccountNL",function(a,b){return this.optional(b)||/^[0-9]{1,7}$/.test(a)},"Please specify a valid giro account number"),a.validator.addMethod("iban",function(a,b){if(this.optional(b))return!0;var c,d,e,f,g,h,i,j,k,l=a.replace(/ /g,"").toUpperCase(),m="",n=!0,o="",p="";if(c=l.substring(0,2),h={AL:"\\d{8}[\\dA-Z]{16}",AD:"\\d{8}[\\dA-Z]{12}",AT:"\\d{16}",AZ:"[\\dA-Z]{4}\\d{20}",BE:"\\d{12}",BH:"[A-Z]{4}[\\dA-Z]{14}",BA:"\\d{16}",BR:"\\d{23}[A-Z][\\dA-Z]",BG:"[A-Z]{4}\\d{6}[\\dA-Z]{8}",CR:"\\d{17}",HR:"\\d{17}",CY:"\\d{8}[\\dA-Z]{16}",CZ:"\\d{20}",DK:"\\d{14}",DO:"[A-Z]{4}\\d{20}",EE:"\\d{16}",FO:"\\d{14}",FI:"\\d{14}",FR:"\\d{10}[\\dA-Z]{11}\\d{2}",GE:"[\\dA-Z]{2}\\d{16}",DE:"\\d{18}",GI:"[A-Z]{4}[\\dA-Z]{15}",GR:"\\d{7}[\\dA-Z]{16}",GL:"\\d{14}",GT:"[\\dA-Z]{4}[\\dA-Z]{20}",HU:"\\d{24}",IS:"\\d{22}",IE:"[\\dA-Z]{4}\\d{14}",IL:"\\d{19}",IT:"[A-Z]\\d{10}[\\dA-Z]{12}",KZ:"\\d{3}[\\dA-Z]{13}",KW:"[A-Z]{4}[\\dA-Z]{22}",LV:"[A-Z]{4}[\\dA-Z]{13}",LB:"\\d{4}[\\dA-Z]{20}",LI:"\\d{5}[\\dA-Z]{12}",LT:"\\d{16}",LU:"\\d{3}[\\dA-Z]{13}",MK:"\\d{3}[\\dA-Z]{10}\\d{2}",MT:"[A-Z]{4}\\d{5}[\\dA-Z]{18}",MR:"\\d{23}",MU:"[A-Z]{4}\\d{19}[A-Z]{3}",MC:"\\d{10}[\\dA-Z]{11}\\d{2}",MD:"[\\dA-Z]{2}\\d{18}",ME:"\\d{18}",NL:"[A-Z]{4}\\d{10}",NO:"\\d{11}",PK:"[\\dA-Z]{4}\\d{16}",PS:"[\\dA-Z]{4}\\d{21}",PL:"\\d{24}",PT:"\\d{21}",RO:"[A-Z]{4}[\\dA-Z]{16}",SM:"[A-Z]\\d{10}[\\dA-Z]{12}",SA:"\\d{2}[\\dA-Z]{18}",RS:"\\d{18}",SK:"\\d{20}",SI:"\\d{15}",ES:"\\d{20}",SE:"\\d{20}",CH:"\\d{5}[\\dA-Z]{12}",TN:"\\d{20}",TR:"\\d{5}[\\dA-Z]{17}",AE:"\\d{3}\\d{16}",GB:"[A-Z]{4}\\d{14}",VG:"[\\dA-Z]{4}\\d{16}"},g=h[c],"undefined"!=typeof g&&(i=new RegExp("^[A-Z]{2}\\d{2}"+g+"$",""),!i.test(l)))return!1;for(d=l.substring(4,l.length)+l.substring(0,4),j=0;j<d.length;j++)e=d.charAt(j),"0"!==e&&(n=!1),n||(m+="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(e));for(k=0;k<m.length;k++)f=m.charAt(k),p=""+o+f,o=p%97;return 1===o},"Please specify a valid IBAN"),a.validator.addMethod("integer",function(a,b){return this.optional(b)||/^-?\d+$/.test(a)},"A positive or negative non-decimal number please"),a.validator.addMethod("ipv4",function(a,b){return this.optional(b)||/^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(a)},"Please enter a valid IP v4 address."),a.validator.addMethod("ipv6",function(a,b){return this.optional(b)||/^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(a)},"Please enter a valid IP v6 address."),a.validator.addMethod("lettersonly",function(a,b){return this.optional(b)||/^[a-z]+$/i.test(a)},"Letters only please"),a.validator.addMethod("letterswithbasicpunc",function(a,b){return this.optional(b)||/^[a-z\-.,()'"\s]+$/i.test(a)},"Letters or punctuation only please"),a.validator.addMethod("mobileNL",function(a,b){return this.optional(b)||/^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)6((\s|\s?\-\s?)?[0-9]){8}$/.test(a)},"Please specify a valid mobile number"),a.validator.addMethod("mobileUK",function(a,b){return a=a.replace(/\(|\)|\s+|-/g,""),this.optional(b)||a.length>9&&a.match(/^(?:(?:(?:00\s?|\+)44\s?|0)7(?:[1345789]\d{2}|624)\s?\d{3}\s?\d{3})$/)},"Please specify a valid mobile number"),a.validator.addMethod("nieES",function(a){"use strict";return a=a.toUpperCase(),a.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)")?/^[T]{1}/.test(a)?a[8]===/^[T]{1}[A-Z0-9]{8}$/.test(a):/^[XYZ]{1}/.test(a)?a[8]==="TRWAGMYFPDXBNJZSQVHLCKE".charAt(a.replace("X","0").replace("Y","1").replace("Z","2").substring(0,8)%23):!1:!1},"Please specify a valid NIE number."),a.validator.addMethod("nifES",function(a){"use strict";return a=a.toUpperCase(),a.match("((^[A-Z]{1}[0-9]{7}[A-Z0-9]{1}$|^[T]{1}[A-Z0-9]{8}$)|^[0-9]{8}[A-Z]{1}$)")?/^[0-9]{8}[A-Z]{1}$/.test(a)?"TRWAGMYFPDXBNJZSQVHLCKE".charAt(a.substring(8,0)%23)===a.charAt(8):/^[KLM]{1}/.test(a)?a[8]===String.fromCharCode(64):!1:!1},"Please specify a valid NIF number."),jQuery.validator.addMethod("notEqualTo",function(b,c,d){return this.optional(c)||!a.validator.methods.equalTo.call(this,b,c,d)},"Please enter a different value, values must not be the same."),a.validator.addMethod("nowhitespace",function(a,b){return this.optional(b)||/^\S+$/i.test(a)},"No white space please"),a.validator.addMethod("pattern",function(a,b,c){return this.optional(b)?!0:("string"==typeof c&&(c=new RegExp("^(?:"+c+")$")),c.test(a))},"Invalid format."),a.validator.addMethod("phoneNL",function(a,b){return this.optional(b)||/^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(a)},"Please specify a valid phone number."),a.validator.addMethod("phoneUK",function(a,b){return a=a.replace(/\(|\)|\s+|-/g,""),this.optional(b)||a.length>9&&a.match(/^(?:(?:(?:00\s?|\+)44\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/)},"Please specify a valid phone number"),a.validator.addMethod("phoneUS",function(a,b){return a=a.replace(/\s+/g,""),this.optional(b)||a.length>9&&a.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/)},"Please specify a valid phone number"),a.validator.addMethod("phonesUK",function(a,b){return a=a.replace(/\(|\)|\s+|-/g,""),this.optional(b)||a.length>9&&a.match(/^(?:(?:(?:00\s?|\+)44\s?|0)(?:1\d{8,9}|[23]\d{9}|7(?:[1345789]\d{8}|624\d{6})))$/)},"Please specify a valid uk phone number"),a.validator.addMethod("postalCodeCA",function(a,b){return this.optional(b)||/^[ABCEGHJKLMNPRSTVXY]\d[A-Z] \d[A-Z]\d$/.test(a)},"Please specify a valid postal code"),a.validator.addMethod("postalcodeBR",function(a,b){return this.optional(b)||/^\d{2}.\d{3}-\d{3}?$|^\d{5}-?\d{3}?$/.test(a)},"Informe um CEP válido."),a.validator.addMethod("postalcodeIT",function(a,b){return this.optional(b)||/^\d{5}$/.test(a)},"Please specify a valid postal code"),a.validator.addMethod("postalcodeNL",function(a,b){return this.optional(b)||/^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(a)},"Please specify a valid postal code"),a.validator.addMethod("postcodeUK",function(a,b){return this.optional(b)||/^((([A-PR-UWYZ][0-9])|([A-PR-UWYZ][0-9][0-9])|([A-PR-UWYZ][A-HK-Y][0-9])|([A-PR-UWYZ][A-HK-Y][0-9][0-9])|([A-PR-UWYZ][0-9][A-HJKSTUW])|([A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]))\s?([0-9][ABD-HJLNP-UW-Z]{2})|(GIR)\s?(0AA))$/i.test(a)},"Please specify a valid UK postcode"),a.validator.addMethod("require_from_group",function(b,c,d){var e=a(d[1],c.form),f=e.eq(0),g=f.data("valid_req_grp")?f.data("valid_req_grp"):a.extend({},this),h=e.filter(function(){return g.elementValue(this)}).length>=d[0];return f.data("valid_req_grp",g),a(c).data("being_validated")||(e.data("being_validated",!0),e.each(function(){g.element(this)}),e.data("being_validated",!1)),h},a.validator.format("Please fill at least {0} of these fields.")),a.validator.addMethod("skip_or_fill_minimum",function(b,c,d){var e=a(d[1],c.form),f=e.eq(0),g=f.data("valid_skip")?f.data("valid_skip"):a.extend({},this),h=e.filter(function(){return g.elementValue(this)}).length,i=0===h||h>=d[0];return f.data("valid_skip",g),a(c).data("being_validated")||(e.data("being_validated",!0),e.each(function(){g.element(this)}),e.data("being_validated",!1)),i},a.validator.format("Please either skip these fields or fill at least {0} of them.")),a.validator.addMethod("stateUS",function(a,b,c){var d,e="undefined"==typeof c,f=e||"undefined"==typeof c.caseSensitive?!1:c.caseSensitive,g=e||"undefined"==typeof c.includeTerritories?!1:c.includeTerritories,h=e||"undefined"==typeof c.includeMilitary?!1:c.includeMilitary;return d=g||h?g&&h?"^(A[AEKLPRSZ]|C[AOT]|D[CE]|FL|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$":g?"^(A[KLRSZ]|C[AOT]|D[CE]|FL|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEINOPST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$":"^(A[AEKLPRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$":"^(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])$",d=f?new RegExp(d):new RegExp(d,"i"),this.optional(b)||d.test(a)},"Please specify a valid state"),a.validator.addMethod("strippedminlength",function(b,c,d){return a(b).text().length>=d},a.validator.format("Please enter at least {0} characters")),a.validator.addMethod("time",function(a,b){return this.optional(b)||/^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(a)},"Please enter a valid time, between 00:00 and 23:59"),a.validator.addMethod("time12h",function(a,b){return this.optional(b)||/^((0?[1-9]|1[012])(:[0-5]\d){1,2}(\ ?[AP]M))$/i.test(a)},"Please enter a valid time in 12-hour am/pm format"),a.validator.addMethod("url2",function(a,b){return this.optional(b)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(a)},a.validator.messages.url),a.validator.addMethod("vinUS",function(a){if(17!==a.length)return!1;var b,c,d,e,f,g,h=["A","B","C","D","E","F","G","H","J","K","L","M","N","P","R","S","T","U","V","W","X","Y","Z"],i=[1,2,3,4,5,6,7,8,1,2,3,4,5,7,9,2,3,4,5,6,7,8,9],j=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2],k=0;for(b=0;17>b;b++){if(e=j[b],d=a.slice(b,b+1),8===b&&(g=d),isNaN(d)){for(c=0;c<h.length;c++)if(d.toUpperCase()===h[c]){d=i[c],d*=e,isNaN(g)&&8===c&&(g=h[c]);break}}else d*=e;k+=d}return f=k%11,10===f&&(f="X"),f===g?!0:!1},"The specified vehicle identification number (VIN) is invalid."),a.validator.addMethod("zipcodeUS",function(a,b){return this.optional(b)||/^\d{5}(-\d{4})?$/.test(a)},"The specified US ZIP Code is invalid"),a.validator.addMethod("ziprange",function(a,b){return this.optional(b)||/^90[2-5]\d\{2\}-\d{4}$/.test(a)},"Your ZIP-code must be in the range 902xx-xxxx to 905xx-xxxx")});


/*
 Masked Input plugin for jQuery
 Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
 Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
 Version: 1.3.1
 */
(function ($) {
  function getPasteEvent() {
    var el = document.createElement('input'),
      name = 'onpaste';
    el.setAttribute(name, '');
    return (typeof el[name] === 'function') ? 'paste' : 'input';
  }

  var pasteEventName = getPasteEvent() + ".mask",
    ua = navigator.userAgent,
    iPhone = /iphone/i.test(ua),
    android = /android/i.test(ua),
    caretTimeoutId;

  $.mask = {
    //Predefined character definitions
    definitions: {
      '9': "[0-9]",
      'a': "[A-Za-z]",
      '*': "[A-Za-z0-9]"
    },
    dataName: "rawMaskFn",
    placeholder: '_'
  };

  $.fn.extend({
    //Helper Function for Caret positioning
    caret: function (begin, end) {
      var range;

      if (this.length === 0 || this.is(":hidden")) {
        return;
      }

      if (typeof begin == 'number') {
        end = (typeof end === 'number') ? end : begin;
        return this.each(function () {
          if (this.setSelectionRange) {
            this.setSelectionRange(begin, end);
          } else if (this.createTextRange) {
            range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', begin);
            range.select();
          }
        });
      } else {
        if (this[0].setSelectionRange) {
          begin = this[0].selectionStart;
          end = this[0].selectionEnd;
        } else if (document.selection && document.selection.createRange) {
          range = document.selection.createRange();
          begin = 0 - range.duplicate().moveStart('character', -100000);
          end = begin + range.text.length;
        }
        return {begin: begin, end: end};
      }
    },
    unmask: function () {
      return this.trigger("unmask");
    },
    mask: function (mask, settings) {
      var input,
        defs,
        tests,
        partialPosition,
        firstNonMaskPos,
        len;

      if (!mask && this.length > 0) {
        input = $(this[0]);
        return input.data($.mask.dataName)();
      }
      settings = $.extend({
        placeholder: $.mask.placeholder, // Load default placeholder
        completed: null
      }, settings);


      defs = $.mask.definitions;
      tests = [];
      partialPosition = len = mask.length;
      firstNonMaskPos = null;

      $.each(mask.split(""), function (i, c) {
        if (c == '?') {
          len--;
          partialPosition = i;
        } else if (defs[c]) {
          tests.push(new RegExp(defs[c]));
          if (firstNonMaskPos === null) {
            firstNonMaskPos = tests.length - 1;
          }
        } else {
          tests.push(null);
        }
      });

      return this.trigger("unmask").each(function () {
        var input = $(this),
          buffer = $.map(
            mask.split(""),
            function (c, i) {
              if (c != '?') {
                return defs[c] ? settings.placeholder : c;
              }
            }),
          focusText = input.val();

        function seekNext(pos) {
          while (++pos < len && !tests[pos]);
          return pos;
        }

        function seekPrev(pos) {
          while (--pos >= 0 && !tests[pos]);
          return pos;
        }

        function shiftL(begin, end) {
          var i,
            j;

          if (begin < 0) {
            return;
          }

          for (i = begin, j = seekNext(end); i < len; i++) {
            if (tests[i]) {
              if (j < len && tests[i].test(buffer[j])) {
                buffer[i] = buffer[j];
                buffer[j] = settings.placeholder;
              } else {
                break;
              }

              j = seekNext(j);
            }
          }
          writeBuffer();
          input.caret(Math.max(firstNonMaskPos, begin));
        }

        function shiftR(pos) {
          var i,
            c,
            j,
            t;

          for (i = pos, c = settings.placeholder; i < len; i++) {
            if (tests[i]) {
              j = seekNext(i);
              t = buffer[i];
              buffer[i] = c;
              if (j < len && tests[j].test(t)) {
                c = t;
              } else {
                break;
              }
            }
          }
        }

        function keydownEvent(e) {
          var k = e.which,
            pos,
            begin,
            end;

          //backspace, delete, and escape get special treatment
          if (k === 8 || k === 46 || (iPhone && k === 127)) {
            pos = input.caret();
            begin = pos.begin;
            end = pos.end;

            if (end - begin === 0) {
              begin = k !== 46 ? seekPrev(begin) : (end = seekNext(begin - 1));
              end = k === 46 ? seekNext(end) : end;
            }
            clearBuffer(begin, end);
            shiftL(begin, end - 1);

            e.preventDefault();
          } else if (k == 27) {//escape
            input.val(focusText);
            input.caret(0, checkVal());
            e.preventDefault();
          }
        }

        function keypressEvent(e) {
          var k = e.which,
            pos = input.caret(),
            p,
            c,
            next;

          if (e.ctrlKey || e.altKey || e.metaKey || k < 32) {//Ignore
            return;
          } else if (k) {
            if (pos.end - pos.begin !== 0) {
              clearBuffer(pos.begin, pos.end);
              shiftL(pos.begin, pos.end - 1);
            }

            p = seekNext(pos.begin - 1);
            if (p < len) {
              c = String.fromCharCode(k);
              if (tests[p].test(c)) {
                shiftR(p);

                buffer[p] = c;
                writeBuffer();
                next = seekNext(p);

                if (android) {
                  setTimeout($.proxy($.fn.caret, input, next), 0);
                } else {
                  input.caret(next);
                }

                if (settings.completed && next >= len) {
                  settings.completed.call(input);
                }
              }
            }
            e.preventDefault();
          }
        }

        function clearBuffer(start, end) {
          var i;
          for (i = start; i < end && i < len; i++) {
            if (tests[i]) {
              buffer[i] = settings.placeholder;
            }
          }
        }

        function writeBuffer() {
          input.val(buffer.join(''));
        }

        function checkVal(allow) {
          //try to place characters where they belong
          var test = input.val(),
            lastMatch = -1,
            pos,
            i,
            c;

          for (i = 0, pos = 0; i < len; i++) {
            if (tests[i]) {
              buffer[i] = settings.placeholder;
              while (pos++ < test.length) {
                c = test.charAt(pos - 1);
                if (tests[i].test(c)) {
                  buffer[i] = c;
                  lastMatch = i;
                  break;
                }
              }
              if (pos > test.length) {
                break;
              }
            } else if (buffer[i] === test.charAt(pos) && i !== partialPosition) {
              pos++;
              lastMatch = i;
            }
          }
          if (allow) {
            writeBuffer();
          } else if (lastMatch + 1 < partialPosition) {
            input.val("");
            clearBuffer(0, len);
          } else {
            writeBuffer();
            input.val(input.val().substring(0, lastMatch + 1));
          }
          return (partialPosition ? i : firstNonMaskPos);
        }

        input.data($.mask.dataName, function () {
          return $.map(buffer, function (c, i) {
            return tests[i] && c != settings.placeholder ? c : null;
          }).join('');
        });

        if (!input.attr("readonly"))
          input
            .one("unmask", function () {
              input
                .unbind(".mask")
                .removeData($.mask.dataName);
            })
            .bind("focus.mask", function () {
              clearTimeout(caretTimeoutId);
              var pos,
                moveCaret;

              focusText = input.val();
              pos = checkVal();

              caretTimeoutId = setTimeout(function () {
                writeBuffer();
                if (pos == mask.length) {
                  input.caret(0, pos);
                } else {
                  input.caret(pos);
                }
              }, 10);
            })
            .bind("blur.mask", function () {
              checkVal();
              if (input.val() != focusText)
                input.change();
            })
            .bind("keydown.mask", keydownEvent)
            .bind("keypress.mask", keypressEvent)
            .bind(pasteEventName, function () {
              setTimeout(function () {
                var pos = checkVal(true);
                input.caret(pos);
                if (settings.completed && pos == input.val().length)
                  settings.completed.call(input);
              }, 0);
            });
        checkVal(); //Perform initial check for existing values
      });
    }
  });


})(jQuery);
