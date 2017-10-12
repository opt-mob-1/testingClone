'use strict';

var $ = jQuery;
/**
 - Each object in the formSteps array houses the information and custom functionality for each step
 - StepLoadedCustom is called when the step loads and you can pass in custom functionality there
 - StepSubmittedCustom is called when the step submits and you can pass in custom functionality there
 - For stepLoadedCustom always call attachListeners after custom code or pass attachListeners as a callback to a function, for example
 as callback to fireTracking
 - For stepSubmittedCustom always call loadNextStep after custom code or pass loadNextStep as a callback to a function
 **/
function initializeFormStepLogic() {
  var formLogic = {
    formSteps: [{
      stepNumber: 1,
      stepElement: '#edit-multi-step-section-1',
      submitButton: '#next-step-1',
      inputs: ['#edit-first-name', '#edit-last-name', '#edit-postal'],
      stepLoadedCustom: function stepLoadedCustom(attachListeners) {
        /* begin custom functionality */
        this.prepopZip();
        /* end custom functionality */
        Visit.zTrkMacroEvent('form', 'load', 'multistepForm');
        Visit.zTrkMacroEvent('formstep', 'load', '1');
        attachListeners.call(this);
      },
      stepSubmittedCustom: function stepSubmittedCustom(loadNextStep) {
        /* begin custom functionality */

        /* end custom functionality */
        Visit.zTrkMacroEvent('formstep', 'complete', '1');
        loadNextStep.call(this);
      }
    }, {
      stepNumber: 2,
      stepElement: '#edit-multi-step-section-2',
      submitButton: '#next-step-2',
      inputs: ['#edit-street1', '#edit-city', '#edit-state-initials'],
      stepLoadedCustom: function stepLoadedCustom(attachListeners) {
        /* begin custom functionality */
        /* end custom functionality */
        Visit.zTrkMacroEvent('formstep', 'load', '2');
        attachListeners.call(this);
      },
      stepSubmittedCustom: function stepSubmittedCustom(loadNextStep) {
        /* begin custom functionality */

        /* end custom functionality */
        Visit.zTrkMacroEvent('formstep', 'complete', '2');
        loadNextStep.call(this);
      }
    }, {
      stepNumber: 3,
      stepElement: '#edit-multi-step-section-3',
      submitButton: '#next-step-3',
      inputs: ['#edit-email'],
      stepLoadedCustom: function stepLoadedCustom(attachListeners) {
        /* begin custom functionality */
        Visit.zTrkMacroEvent('formstep', 'load', '3');

        /* end custom functionality */
        attachListeners.call(this);
      },
      stepSubmittedCustom: function stepSubmittedCustom(loadNextStep) {
        /* begin custom functionality */
        var userData = this.userData;
        Visitor.fetchByEmail(userData.email, function (error, response) {
          if (response.status == 'SUCCESS') {
            Visitor.id = response.visitor[0]._id;
            Visitor.update(userData, function (error, response) {});
          } else {
            Visitor.save(userData, function (error, response) {});
          }
        });
        /* end custom functionality */
        Visit.zTrkMacroEvent('formstep', 'complete', '3');
        loadNextStep.call(this);
      }
    }, {
      stepNumber: 4,
      stepElement: '#edit-multi-step-section-4',
      submitButton: '#next-step-4',
      inputs: ['#edit-test-date-list-month', '#edit-test-date-list-day', '#edit-test-date-list-year'],
      stepLoadedCustom: function stepLoadedCustom(attachListeners) {
        /* begin custom functionality */
        Visit.zTrkMacroEvent('formstep', 'load', '4');
        /* end custom functionality */

        attachListeners.call(this);
      },
      stepSubmittedCustom: function stepSubmittedCustom(loadNextStep) {
        /* begin custom functionality */
        this.formatDobAndAddToUserData();
        var userData = this.userData;
        Visitor.update(userData, function (error, response) {});
        /* end custom functionality */
        Visit.zTrkMacroEvent('formstep', 'complete', '4');
        loadNextStep.call(this);
      }
    }, {
      stepNumber: 5,
      stepElement: '#edit-multi-step-section-5',
      submitButton: '#next-step-5',
      inputs: ['#edit-phone'],
      stepLoadedCustom: function stepLoadedCustom(attachListeners) {
        /* begin custom functionality */
        Visit.zTrkMacroEvent('formstep', 'load', '5');
        /* end custom functionality */

        attachListeners.call(this);
      },
      stepSubmittedCustom: function stepSubmittedCustom(loadNextStep) {
        /* begin custom functionality */
        var userData = this.userData;
        Visitor.update(userData, function (error, response) {});
        /* end custom functionality */
        Visit.zTrkMacroEvent('formstep', 'complete', '5');
        loadNextStep.call(this);
      }
    }, {
      stepNumber: 6,
      stepElement: '#edit-multi-step-section-6',
      submitButton: '#edit-submit',
      inputs: ['#edit-gender-f', '#edit-gender-m'],
      stepLoadedCustom: function stepLoadedCustom(attachListeners) {
        /* begin custom functionality */
        Visit.zTrkMacroEvent('formstep', 'load', '6');

        $('.form-item-gender .form-radio:checked').focus();
        $('#edit-submit').show();
        /* end custom functionality */
        attachListeners.call(this);
      },
      stepSubmittedCustom: function stepSubmittedCustom() {
        /* begin custom functionality */
        var userData = this.userData;
        Visitor.update(userData, function (error, response) {});
        /* end custom functionality */

        Visit.zTrkMacroEvent('formstep', 'complete', '6');
        if (variationNextPage) {
          window.location = variationNextPage;
        } else {
          //need to remove and update fallback
          window.location = '/z/072017/survey';
        }
      }
    }],

    // adds a hdden input value to userData object
    addHiddenInputToUserData: function addHiddenInputToUserData(hiddenInput) {
      var hiddenInputName = $(hiddenInput).attr('name');
      var hiddenInputValue = $(hiddenInput).val();
      this.userData[hiddenInputName] = hiddenInputValue;
    },

    // formats dob based on input values and adds to userData
    formatDobAndAddToUserData: function formatDobAndAddToUserData() {
      var dobDay = $('#edit-test-date-list-day').val();
      var dobMonth = $('#edit-test-date-list-month').val();
      var dobYear = $('#edit-test-date-list-year').val();
      // format dob
      var date_of_birth = dobDay + '-' + dobMonth + '-' + dobYear;
      // add dob to userData
      this.userData.date_of_birth = date_of_birth;

      // remove unneeded day/month/year values from userData object
      delete this.userData['test_date_list[day]'];
      delete this.userData['test_date_list[month]'];
      delete this.userData['test_date_list[year]'];
    },

    // populates city and state values based on zip
    prepopZip: function prepopZip() {
      if ($('input[name=postal]') !== '') {

        $('#edit-postal').keyup(function () {
          if ($(this).val().length == 5) {
            var zip = $(this).val();
            var city = '';
            var state = '';

            //make a request to the google geocode api
            //county:us restricts zip code responses to united states
            $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?&components=country:US|postal_code:' + zip).success(function (response) {
              //find the city and state
              if (response.results.length > 0) {
                var address_components = response.results[0].address_components;

                $.each(address_components, function (index, component) {
                  var types = component.types;

                  $.each(types, function (index, type) {
                    if (type == 'locality') {
                      city = component.long_name;
                    }
                    if (type == 'administrative_area_level_1') {
                      state = component.short_name;
                    }
                  });
                });
                //pre-fill the city and state
                $('#edit-city').val(city);
                $('#edit-state-initials').val(state);
              }
            });
          }
        });
      }
    },

    loadNextStep: function loadNextStep(stepNumber) {
      if (this.formSteps[stepNumber]) {
        var nextStepElement = this.formSteps[stepNumber].stepElement;
        var stepElement = this.formSteps[stepNumber - 1].stepElement;
        $(stepElement).hide();
        $(nextStepElement).show();
        this.currentStepNumber += 1;
        this.stepLoaded(stepNumber + 1);
      }
    },

    // calls stepSubmittedCustom passing loadNextStep as a callback
    stepSubmitted: function stepSubmitted(stepNumber) {
      var stepSubmittedCustom = this.formSteps[stepNumber - 1].stepSubmittedCustom;
      if (stepSubmittedCustom) {
        stepSubmittedCustom.call(this, function () {
          this.loadNextStep(stepNumber);
        }.bind(this));
      } else {
        this.loadNextStep(stepNumber);
      }
    },

    // stores the new input values for that particular step to a userData object
    // the userData object can then be sent to the path.user.save when needed
    storeUserData: function storeUserData(inputsArray, stepNumber) {
      inputsArray.forEach(function (input) {
        var $input = $(input);
        // add sanitize data here
        var userAttribute = $input.attr('name');
        // for radio buttons only store values if selected/checked
        if ($input.prop('type') === 'radio') {
          if ($input.prop('checked')) {
            this.userData[userAttribute] = $input.val();
          }
          // for all other inputs store values in userData
        } else {
          this.userData[userAttribute] = $input.val();
        }
      }.bind(this));

      this.stepSubmitted(stepNumber);
    },

    // validate inputs for a particular step
    // if all inputs valid, add values to userData
    validateInputs: function validateInputs(stepNumber) {
      var inputsArray = this.formSteps[stepNumber - 1].inputs;
      var inputsValid = true;
      // loops through all inputs for that particular step and checks if each is valid
      // if any one of the inputs is invalid, inputsValid is set to false and we do not store userData
      inputsArray.forEach(function (input) {
        if (!$(input).valid()) {
          inputsValid = false;
        }
      });
      // passes the inputs for that particular step to storeUserData
      if (inputsValid) {
        this.storeUserData(inputsArray, stepNumber);
      }
    },

    // on continue click validate inputs
    listenForContinueClick: function listenForContinueClick(stepNumber) {
      var submitButton = this.formSteps[stepNumber - 1].submitButton;
      $(submitButton).click(function () {
        this.validateInputs(stepNumber);
      }.bind(this));
    },

    // returns true if all inputs all inputs are filled
    // otherwise returns false
    allInputsFilled: function allInputsFilled(inputsArray) {
      var inputsFilled = true;
      inputsArray.forEach(function (input) {
        if ($(input).val() === '') {
          inputsFilled = false;
        }
      });
      return inputsFilled;
    },

    // tabs to next input or button
    tabToNextInput: function tabToNextInput(inputsArray, stepNumber) {
      var focusedInputId = '#' + document.activeElement.id;
      var index = inputsArray.indexOf(focusedInputId);
      // if not the last input in array focus on next input
      if (index < inputsArray.length - 1) {
        var nextInput = inputsArray[index + 1];
        var focusThis = $(nextInput);
        focusThis.focus();
        //if last input in array focus on button
      } else {
        var submitButton = this.formSteps[stepNumber - 1].submitButton;
        $(submitButton).focus();
      }
    },

    checkCurrentInput: function checkCurrentInput(inputsArray, stepNumber) {
      var currentInput = '#' + document.activeElement.id;
      //validate the current input
      this.validateCurrentInput(currentInput, inputsArray, stepNumber);
    },

    validateCurrentInput: function validateCurrentInput(currentInput, inputsArray, stepNumber) {
      var currentInput = $(currentInput);
      var isCurrentInputValid = currentInput.valid();
      var userAttribute = currentInput.attr('name');
      if (isCurrentInputValid) {
        //if it is valid then save user data
        this.userData[userAttribute] = currentInput.val();
        // tab to next to input
        this.tabToNextInput(inputsArray, stepNumber);
      }
    },

    // on enter press while focused on input validate inputs
    listenForEnterPressOnInputs: function listenForEnterPressOnInputs(stepNumber) {
      var inputsArray = this.formSteps[stepNumber - 1].inputs;
      $(inputsArray.join(", ")).keypress(function (event) {
        if (event.which === 13) {
          event.preventDefault();
          // if all inputs are filled, then validate all input
          if (this.allInputsFilled(inputsArray)) {
            this.validateInputs(stepNumber);
          } else {
            // otherwise just validate the current input
            this.checkCurrentInput(inputsArray, stepNumber);
          }
        }
      }.bind(this));
    },

    // attach listeners for particular step
    attachListeners: function attachListeners(stepNumber) {
      this.listenForContinueClick(stepNumber);
      this.listenForEnterPressOnInputs(stepNumber);
    },

    // fires page pixel and path impression network calls
    // the callback passed in is called once there is a response from the path impression call
    fireTracking: function fireTracking(pageName, pageNumber, callback) {
      path.options.page = pageName;
      path.pixels();
      path.trackPageView(pageNumber, callback);
    },

    // called once step is show on the page
    stepLoaded: function stepLoaded(stepNumber) {
      var stepLoadedCustom = this.formSteps[stepNumber - 1].stepLoadedCustom;
      // call custom functionality if we have it for this step, passing attachListeners as a callback
      // if no custom functionality, call attachListeners
      if (stepLoadedCustom) {
        stepLoadedCustom.call(this, function () {
          this.attachListeners(stepNumber);
        }.bind(this));
      } else {
        this.attachListeners(stepNumber);
      }
    },

    showStep1WithHeadlines: function showStep1WithHeadlines() {
      $('#edit-multi-step-section-1').show();
      $('.headline-wrap .headline').show();
      $('.headline-wrap .subheadline').show();
    },

    currentStepNumber: 1,

    userData: {}
  };

  // initialize first step
  formLogic.showStep1WithHeadlines();
  formLogic.stepLoaded(1);
}