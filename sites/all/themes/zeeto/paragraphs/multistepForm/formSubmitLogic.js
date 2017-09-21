"use strict";

(function () {
  
  var prepopHeadline = function prepopHeadline(user) {
    var headline = $('.headline-wrap .headline');
    var subheadline = $('.headline-wrap .subheadline');
    var formSubheadline = $('form .subheadline');
    // returning user headline
    if (headline) {
      headline.text('Welcome back, ' + user.attributes.first_name + '!');
    }
    if (subheadline) {
      subheadline.text('Confirm your information below to find new offers');
    }
    $(headline).show();
    $(subheadline).show();
    $(formSubheadline).hide();
  };

  var handleInputActiveClass = function handleInputActiveClass() {

    $('form input').blur(function () {
      $(this).parent().find("label").removeClass("active");
    }).focus(function () {
      $(this).parent().find("label").addClass("active");
    });

    $('form .select-wrapper').blur(function () {
      $(this).parent().find("label").removeClass("active");
    }).focus(function () {
      $(this).parent().find("label").addClass("active");
    });
  };

  handleInputActiveClass();
  
  var maskPhone = function maskPhone() {
    var maskMethod = '999-999-9999';
    $('#edit-mobile-phone').mask(maskMethod);
  };

  /**
   * Handle cases where we have leap years and fewer days in a month
   **/
  var handleMonthChanged = function handleMonthChanged() {
    // TODO refactor to use associative array
    var self = this;
    var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var month = $('select[name="test_date_list[month]"]').val() - 1;
    var year = +$('select[name="test_date_list[year]"]').val();
    var i;
    // Check for leap year if Feb
    if (month === 1 && new Date(year, month, 29).getMonth() === 1) days[1]++;
    // Add/Remove options
    if ($('select[name="test_date_list[day]"] option').length > days[month] + 1) {
      // Remove
      $('select[name="test_date_list[day]"] option').slice(days[month] + 1).remove();
    } else if ($('select[name="test_date_list[day]"] option').length < days[month] + 1) {
      // Add
      for (i = $('select[name="test_date_list[day]"] option').length; i <= days[month]; i++) {
        $('<option>').attr('value', i).text(i).appendTo('select[name="test_date_list[day]"]');
      }
    }
    // update month and year inputs for leap years, etc.
    $('select[name="test_date_list[month]"]').change(function () {
      handleMonthChanged();
    }); // On month change
    $('select[name="test_date_list[year]"]').change(function () {
      handleMonthChanged();
    }); // On year change (for leap years)
  };

  // This is to apply a disabled attribute to first option in the select element to the elements below
  document.getElementById("edit-state").options[0].disabled = true;
  document.getElementById("edit-test-date-list-month").options[0].disabled = true;
  document.getElementById("edit-test-date-list-day").options[0].disabled = true;
  document.getElementById("edit-test-date-list-year").options[0].disabled = true;

  // TODO : COMMENT WHAT THIS DOES
  //dataLayer.push({ 'event': 'progression', 'phase': 'completedLandingPage' });

  jQuery.validator.addMethod('maskedPhone', function (value, element) {
    var el2 = element.value;
    el2 = el2.replace(/\D/g, '');
    return el2;
  }, '*Required');

  jQuery.validator.addMethod('customemail', function (value) {
    return (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)
    );
  });

  var signupForm = $("form");
  $(signupForm).submit(function (event) {
    event.preventDefault();
  }).validate({
    // override the default onkeyup validation to prevent it on specific fields
    onkeyup: function onkeyup(element) {
      if ($(element).attr('name') !== 'email') {
        $(element).valid();
      }
    },
    onfocusout: function onfocusout(element) {
      if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        element.value = $.trim(element.value);
      }
      if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
        this.element(element);
      }
      // trigger the default regex email on keyup since bypassing true validation
      if ($(element).attr('name') === 'email') {
        $(element).valid();
      }
    },

    errorPlacement: function errorPlacement(error, element) {
      if (element.attr('name') === 'test_date_list[month]') {
        error.insertAfter(element.parents().siblings('.js-monthHook'));
      } else if (element.attr('name') === 'test_date_list[day]') {
        error.insertAfter(element.parents().siblings('.js-dayHook'));
      } else if (element.attr('name') === 'test_date_list[year]') {
        error.insertAfter(element.parents().siblings('.js-yearHook'));
      } else if (element.attr('name') === 'gender') {
        error.insertAfter(element.parents('#edit-gender'));
      } else if (element.attr('type') === 'checkbox' && element.attr('name') === 'terms') {
        error.insertBefore(element.parent()).addClass('formGroup_error-terms');
      } else if (element.attr('type') === 'radio' || element.attr('type') === 'checkbox') {
        error.insertBefore(element.parent().parent()).addClass('formGroup_error');
      } else {
        error.insertAfter(element);
      }
    },
    rules: {
      first_name: {
        required: true,
        letterswithbasicpunc: true
      },
      last_name: {
        required: true,
        letterswithbasicpunc: true
      },
      email: {
        required: true,
        customemail: true
      },
      mobile_phone: {
        required: true,
        phoneUS: true,
        maskedPhone: true
      },
      address: {
        required: true
      },
      city: {
        required: true
      },
      zip: {
        required: true,
        zipcodeUS: true
      },
      'test_date_list[day]': {
        required: true
      },
      'test_date_list[month]': {
        required: true
      },
      'test_date_list[year]': {
        required: true
      },
      gender: {
        required: true
      },
      terms: {
        required: true
      }
    },
    messages: {
      first_name: {
        required: 'Please enter your first name',
        letterswithbasicpunc: 'Please enter a valid first name'
      },
      last_name: {
        required: 'Please enter your last name',
        letterswithbasicpunc: 'Please enter a valid Last name'
      },
      email: {
        required: 'Please enter an email address',
        customemail: 'Please enter a valid email address'
      },
      mobile_phone: {
        required: 'Please enter your phone number',
        phoneUS: 'Please specify a valid US phone number',
        maskedPhone: 'Please enter your phone number'
      },
      address: {
        required: 'Please enter your street address'
      },
      city: {
        required: 'Please enter your city'
      },
      zip: {
        required: 'Please enter your zip',
        zipcodeUS: 'Zip must be 5 digits'
      },
      'test_date_list[day]': {
        required: 'Please select your birth day'
      },
      'test_date_list[month]': {
        required: 'Please select your birth month'
      },
      'test_date_list[year]': {
        required: 'Please select your birth year'
      },
      gender: {
        required: '*Required'
      },
      terms: {
        required: '*Required'
      }
    },

    // the submitHandler is triggered on the click of the final form submit button, $('#edit-submit')
    submitHandler: function submitHandler(signupForm) {
        Visit.zTrkMacroEvent('form','submit','multistepForm', false);
    }
  });

  handleMonthChanged();
  
  $("#edit-gender-f").prop("checked", true);

}());

  initializeFormStepLogic();
