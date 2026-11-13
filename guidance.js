'use strict';
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let floating=null,link=null,dock=null,observer=null,animation=null,streamAnimations=[],finishTimer=null,version=0,docked=false,scrollFrame=null,idle=null,dockTimer=null,lastY=window.scrollY;
 function stopMotion(){animation?.cancel();animation=null;streamAnimations.forEach(a=>a.cancel());streamAnimations=[];clearTimeout(finishTimer);finishTimer=null;}
 function cleanup(){version++;observer?.disconnect();observer=null;stopMotion();if(scrollFrame!==null)cancelAnimationFrame(scrollFrame);scrollFrame=null;clearTimeout(idle);clearTimeout(dockTimer);dock?.classList.remove('is-absorbing','is-releasing');floating?.remove();floating=link=dock=null;docked=false;document.body.classList.remove('has-guidance');}
 function settle(hide,token){if(token!==version||!floating)return;if(hide&&document.activeElement===link)dock?.focus({preventScroll:true});floating.hidden=hide;floating.classList.remove('is-merging');stopMotion();}
 const reversed=frames=>frames.slice().reverse().map(f=>({...f,offset:1-f.offset}));
 function merge(hide){
  if(!floating||!dock||docked===hide)return;
  docked=hide;const token=++version;stopMotion();floating.hidden=false;floating.classList.remove('guidance-up','guidance-down');
  if(reduced.matches||typeof link.animate!=='function'){settle(hide,token);return;}
  floating.classList.add('is-merging');
  const from=link.getBoundingClientRect();
  function geometry(){
   const r=dock.getBoundingClientRect(),dx=r.left+r.width/2-from.left-from.width/2,dy=r.top+r.height/2-from.top-from.height/2;
   const sx=r.width/from.width,sy=r.height/from.height;
   const frames=[
    {offset:0,transform:'translate(0,0) scale(1)',backgroundColor:'#0071bc',opacity:1},
    {offset:.28,transform:`translate(${dx*.25}px,${dy*.25}px) scale(${1+(sx-1)*.25},${1+(sy-1)*.25})`,backgroundColor:'#0071bc',opacity:1},
    {offset:.78,transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,backgroundColor:'#087b52',opacity:1},
    {offset:1,transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`,backgroundColor:'#087b52',opacity:0}
   ];
   return hide?frames:reversed(frames);
  }
  const duration=hide?1000:850;
  animation=link.animate(geometry(),{duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
  const fade=[{offset:0,opacity:1},{offset:.32,opacity:0},{offset:1,opacity:0}];
  streamAnimations=[...link.querySelectorAll('.guidance-icon,.guidance-label,.guidance-arrow')].map(child=>child.animate(hide?fade:reversed(fade),{duration,fill:'forwards'}));
  // One stable transition avoids restarting the animation on every frame.
  finishTimer=setTimeout(()=>settle(hide,token),duration+80);
  clearTimeout(dockTimer);dock.classList.remove('is-absorbing','is-releasing');void dock.offsetWidth;dock.classList.add(hide?'is-absorbing':'is-releasing');const target=dock;dockTimer=setTimeout(()=>target.classList.remove('is-absorbing','is-releasing'),1100);
  animation.onfinish=()=>settle(hide,token);
 }
 function sync(){
  cleanup();dock=document.querySelector('#main .wa-btn');if(!dock)return;document.body.classList.add('has-guidance');lastY=window.scrollY;
  floating=document.createElement('div');floating.className='guidance-float';link=document.createElement('a');link.className='guidance-link';link.href=dock.href;link.target='_blank';link.rel='noopener noreferrer';
  const label=document.documentElement.lang==='ml'?'നിങ്ങൾക്ക് ചേരുന്ന വഴി സംസാരിക്കാം':'For More Personalised Guidance';link.setAttribute('aria-label',label+' · WhatsApp');
  link.innerHTML='<span class="guidance-sheen" aria-hidden="true"></span><img class="guidance-icon" src="assets/whatsapp-mark.png" width="28" height="28" alt=""><span class="guidance-label">'+label+'</span><span class="guidance-arrow" aria-hidden="true">→</span>';floating.append(link);document.body.append(floating);
  if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>{const e=entries[0];merge(e.isIntersecting&&e.intersectionRatio>=.85);},{threshold:[0,.85,1],rootMargin:'0px 0px -16px 0px'});observer.observe(dock);}else checkPosition();
 }
 function checkPosition(){if(!dock)return;const r=dock.getBoundingClientRect();merge(Math.min(r.bottom,innerHeight-16)-Math.max(r.top,0)>=r.height*.85);}
 document.addEventListener('scroll',()=>{if(!floating||scrollFrame!==null)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=null;const delta=window.scrollY-lastY;lastY=window.scrollY;if(!('IntersectionObserver'in window))checkPosition();if(reduced.matches||docked||floating.classList.contains('is-merging')||Math.abs(delta)<2)return;floating.classList.toggle('guidance-up',delta<0);floating.classList.toggle('guidance-down',delta>0);clearTimeout(idle);idle=setTimeout(()=>floating?.classList.remove('guidance-up','guidance-down'),180);});},{passive:true});
 reduced.addEventListener('change',()=>{if(animation){const hide=docked;version++;stopMotion();settle(hide,version);}});
 document.addEventListener('compass:render',sync);window.addEventListener('pagehide',cleanup);sync();
})();
