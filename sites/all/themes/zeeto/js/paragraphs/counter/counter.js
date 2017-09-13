'use strict';

var offerLength = offers.length;
$('.num2').html(offerLength);

//If offers = undefined
// currentNum = offerLength;
// $('.num1').html(currentNum);
// $('.num2').html(currentNum);


// Counts the number of offers and increments
if (currentNum < offerLength) {
  currentNum++;
  $('.num1').html(currentNum);
} else if (currentNum >= offerLength) {
  $('.num1').html(currentNum);
}