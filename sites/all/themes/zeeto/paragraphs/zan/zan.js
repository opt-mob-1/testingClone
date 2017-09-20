// var zanplacement = document.querySelector('.js-zan');
// var placementID = zanplacement.dataset.placementid;


(function(w,d,s,p,a){
  var z=w.zan=w.zan||[],f=d.getElementsByTagName(s)[0],j=d.createElement(s);
  z.a=!!a;z.b=[];z.p=p;z.on=function(e, cb){z.b.push({e:e,cb:cb})};
  j.async=true;
  j.src='https://zan-staging-placements.s3.amazonaws.com/zeeto.js?v=' + Date.now();
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', '59c1918218db8f0007d2a012');

