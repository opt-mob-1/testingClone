var $ = jQuery;


(function () {
  
  // Grabs redirect URL
  var modal = document.querySelector('.js-modal');
  var modTimer = document.querySelector('.modTimer')
  var fieldID = modal.dataset.fieldid;
  var delaytime = modal.dataset.delaytime;
  var fieldID = "#" + fieldID;
  
  // if the class model-timer is added (when the timer boolean is checked, then use setTimeout to start the modal
  if(modTimer) {
    setTimeout(function() {
      $(fieldID).modal();
    }, delaytime);
    Visit.zTrkMacroEvent('modal','load','timer');
  }
  
})();//end self-invoking function

