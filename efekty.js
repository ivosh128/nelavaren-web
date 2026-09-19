(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  // odhalování při rolování
  function reveal(){
    var els=document.querySelectorAll('.rv');
    if(!('IntersectionObserver' in window)||reduce){els.forEach(function(e){e.classList.add('on')});return;}
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}})},{threshold:.15});
    els.forEach(function(e){io.observe(e)});
  }
  // padající sníh
  function snow(){
    if(reduce)return;
    var c=document.getElementById('snih');if(!c)return;
    var x=c.getContext('2d'),W,H,dpr=Math.min(window.devicePixelRatio||1,2),F=[];
    function size(){W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
    size();addEventListener('resize',size);
    var n=W<700?70:140;
    for(var i=0;i<n;i++){var z=Math.random();F.push({x:Math.random()*W,y:Math.random()*H,z:z,r:.6+z*z*3.2,s:.25+z*1.1,o:.15+z*.55,p:Math.random()*6.28})}
    var wind=0,t=0;
    (function loop(){
      t+=.005;wind=Math.sin(t)*.6+.35;
      x.clearRect(0,0,W,H);
      for(var i=0;i<F.length;i++){var f=F[i];
        f.y+=f.s;f.p+=.01;f.x+=wind*f.s*.6+Math.sin(f.p)*.3;
        if(f.y>H+5){f.y=-5;f.x=Math.random()*W}
        if(f.x>W+5)f.x=-5;if(f.x<-5)f.x=W+5;
        x.beginPath();x.fillStyle='rgba(240,245,255,'+f.o+')';x.arc(f.x,f.y,f.r,0,6.283);x.fill();
      }
      requestAnimationFrame(loop);
    })();
  }
  document.addEventListener('DOMContentLoaded',function(){reveal();snow();
    requestAnimationFrame(function(){document.querySelectorAll('.hero2 .rv').forEach(function(e){e.classList.add('on')})});
  });
})();
