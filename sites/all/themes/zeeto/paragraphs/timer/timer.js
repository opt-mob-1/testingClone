var timer= document.querySelector('.js-timer');
var timerCountDownTime = timer.dataset.countdowntime * 1000;
var expiredText = timer.dataset.expiredtext;

  // Set the date we're counting down to
  var countDownDate = new Date().getTime() + timerCountDownTime;
  //countDownDate = countDownDate.getTime();
  
  // Update the count down every 1 second
  var x = setInterval(function() {
  
  // Get todays date and time
  var now = new Date().getTime();
  
  // Find the distance between now an the count down date
  var distance = countDownDate - now;
  
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24) % 7);
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  // Output the result in an element with id="demo"
  
  if (days > 0){
    days = '<div class="days number">' + days + '<span class="text"> days</span>' + '</div>';
  } else {
    days = "";
  }
  if (hours > 0){
    hours = '<div class="hours number">' + hours + '<span class="text"> hours</span>' + '</div>';
  } else {
    hours = "";
  }
  if (minutes > 0){
    minutes = '<div class="minutes number">' + minutes + '<span class="text"> min</span>' +  '</div>';
  } else {
    minutes = "";
  }
  
  
    $(".expiredText").html(days + '' + hours + '' + minutes + '' + '<div class="seconds number">' + seconds + '<span class="text"> sec</span>' + '</div>');
  
  // If the count down is over, write some text
  if (distance < 0) {
    clearInterval(x);
    //document.getElementsByClassName("expiredText").innerHTML = expiredText;
    $(".expiredText").html(expiredText);
    $(".timer-headline").css("display", "none");
  }
}, 1000);

