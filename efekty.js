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
    var E=[],m=W<700?10:20;
    function spark(init){return{x:Math.random()*W,y:init?H*(.45+Math.random()*.55):H+5,s:.35+Math.random()*.6,r:1+Math.random()*1.5,o:.55+Math.random()*.4,p:Math.random()*6.28,g:Math.random(),l:init?Math.random()*200:0,m:260+Math.random()*320}}
    for(var q=0;q<m;q++)E.push(spark(true));
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
      // jiskry z ohně: pár teplých světýlek stoupá proti sněhu
      for(var j=0;j<E.length;j++){var e=E[j];
        e.y-=e.s;e.p+=.03;e.x+=Math.sin(e.p)*.5-wind*.15;e.l+=1;
        var k=e.l/e.m;if(k>=1){E[j]=spark(false);continue}
        var o=(k<.15?k/.15:1-(k-.15)/.85)*e.o*(.75+.25*Math.sin(e.p*4));
        x.beginPath();x.fillStyle='rgba(255,'+(150+Math.round(e.g*50))+',80,'+o+')';x.shadowColor='rgba(255,120,50,.9)';x.shadowBlur=8;x.arc(e.x,e.y,e.r,0,6.283);x.fill();x.shadowBlur=0;
      }
      requestAnimationFrame(loop);
    })();
  }
  // plovoucí lišta s výzvou: objeví se po odrolování hero a schová se u formuláře
  function lista(){
    var el=document.getElementById('lista'); if(!el) return;
    var cil=document.getElementById('ukazka-sekce');
    var hero=document.querySelector('.hero2');
    var ck=document.getElementById('cookies');
    var uFormulare=false;
    function uprav(){
      var hranice=hero?hero.offsetHeight*0.8:520;
      var ckVidet=ck&&getComputedStyle(ck).display!=='none';
      el.classList.toggle('on', window.scrollY>hranice && !uFormulare && !ckVidet);
    }
    if('IntersectionObserver' in window && cil){
      new IntersectionObserver(function(en){uFormulare=en[0].isIntersecting;uprav()},{threshold:0}).observe(cil);
    }
    if('MutationObserver' in window && ck){
      new MutationObserver(uprav).observe(ck,{attributes:true,attributeFilter:['style']});
    }
    addEventListener('scroll',uprav,{passive:true});
    addEventListener('resize',uprav);
    var btn=el.querySelector('.lista-cta');
    if(btn) btn.addEventListener('click',function(){ if(window.gtag) gtag('event','select_promotion',{promotion_name:'plovouci_lista'}); });
    uprav();
  }
  document.addEventListener('DOMContentLoaded',function(){reveal();snow();lista();
    requestAnimationFrame(function(){document.querySelectorAll('.hero2 .rv').forEach(function(e){e.classList.add('on')})});
  });
})();
