'use strict';
// Crisp header contours respond to scrolling; text and form controls stay stable.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),header=document.querySelector('.header'),ns='http://www.w3.org/2000/svg';
 const art=document.createElementNS(ns,'svg');art.classList.add('header-contours');art.setAttribute('viewBox','0 0 520 230');art.setAttribute('preserveAspectRatio','none');art.setAttribute('aria-hidden','true');art.setAttribute('focusable','false');
 art.innerHTML='<g class="contour-back"><path d="M-80 32C90 132 290-50 610 60"/><path d="M-80 42C90 142 290-40 610 70"/></g><g class="contour-front"><path d="M-40 202C130 113 365 269 590 146"/><path d="M-40 208C130 119 365 275 590 152"/></g>';
 header.prepend(art);const back=art.querySelector('.contour-back'),front=art.querySelector('.contour-front');let frame=null,scrollOffset=0,pointerX=0,pointerY=0,entryHeight=null,entryTimer=null,lastCompleted=0,visualProgress=0,progressFrame=null,pendingShine=false,completionTimer=null;
 function paint(){frame=null;if(reduced.matches){back.removeAttribute('transform');front.removeAttribute('transform');return;}back.setAttribute('transform',`translate(${pointerX*4} ${scrollOffset*.065+pointerY*3})`);front.setAttribute('transform',`translate(${-pointerX*5} ${-scrollOffset*.045-pointerY*3})`);}
 function schedule(){if(frame===null)frame=requestAnimationFrame(paint);}
 function scroll(){scrollOffset=Math.min(window.scrollY,260);schedule();}
 document.addEventListener('scroll',scroll,{passive:true});
 header.addEventListener('pointermove',event=>{const r=header.getBoundingClientRect();pointerX=(event.clientX-r.left)/r.width-.5;pointerY=(event.clientY-r.top)/r.height-.5;schedule();},{passive:true});
 header.addEventListener('pointerleave',()=>{pointerX=pointerY=0;schedule();},{passive:true});
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('reveal-visible');observer.unobserve(entry.target);}},{threshold:.08}):null;
 function beginJourneyMotion(reverse){
  if(reduced.matches)return;
  entryHeight=header.getBoundingClientRect().height;
  header.classList.remove('journey-starting','journey-returning');
  void header.offsetWidth;
  header.classList.add('journey-starting');
  header.classList.toggle('journey-returning',reverse);
  clearTimeout(entryTimer);
  entryTimer=setTimeout(()=>header.classList.remove('journey-starting','journey-returning'),1850);
 }
 document.addEventListener('compass:journey',event=>beginJourneyMotion(event.detail.reverse));
 function addBurst(parent,className,rayCount){
  const burst=document.createElementNS(ns,'svg');
  burst.classList.add(className);
  burst.setAttribute('aria-hidden','true');
  burst.setAttribute('viewBox','-150 -150 300 300');
  for(let ray=0;ray<rayCount;ray++){
   const spark=document.createElementNS(ns,'line');
   const radius=ray%2===0?130:93;
   spark.setAttribute('y1',-radius+14);
   spark.setAttribute('y2',-radius);
   spark.setAttribute('transform',`rotate(${ray*360/rayCount})`);
   burst.append(spark);
  }
  burst.addEventListener('animationend',event=>{
   if(event.animationName==='celebration-fade')burst.remove();
  });
  parent.append(burst);
 }
 function updateProgress(){
  clearTimeout(completionTimer);completionTimer=null;
  header.querySelector('.header-celebration')?.remove();
  if(progressFrame!==null)cancelAnimationFrame(progressFrame);progressFrame=null;
  const marker=document.querySelector('.journey-position');if(!marker)return;
  const track=marker.parentElement,done=Number(marker.dataset.completed||0),target=done/15*100;
  if(!reduced.matches){
   header.querySelectorAll('.milestone.reached').forEach(milestone=>{
    if(Number(milestone.dataset.threshold)>lastCompleted)milestone.classList.add('just-reached');
   });
  }
  marker.innerHTML='<svg class="orb-globe" viewBox="0 0 16 16" aria-hidden="true"><ellipse class="meridian" cx="8" cy="8" rx="4" ry="6.5"/><path d="M1.5 8h13"/><circle cx="4.5" cy="4" r="1"/></svg>';
  const fill=document.createElement('span');fill.className='journey-fill';fill.setAttribute('aria-hidden','true');track.prepend(fill);
  pendingShine=pendingShine||done>lastCompleted;lastCompleted=done;
  function set(value){visualProgress=value;fill.style.width=value+'%';marker.style.left=value+'%';}
  function complete(delay=0){
   function showTick(){
    if(!marker.isConnected)return;
    marker.classList.remove('is-charged');marker.classList.add('is-finished');
    marker.innerHTML='<svg class="completion-tick" viewBox="0 0 16 16" focusable="false"><path pathLength="1" d="M4 8.2 6.7 11 12 5.5"/></svg>';
    if(delay>0){
     marker.classList.add('is-celebrating');
     addBurst(marker,'completion-burst',8);
     addBurst(header,'header-celebration',24);
    }
   }
   if(delay>0)completionTimer=setTimeout(showTick,delay*1000);else showTick();
  }
  function shine(){
   if(!pendingShine||reduced.matches)return;pendingShine=false;
   const duration=done===15?.95:1.8+.6*target/100,el=document.createElement('span');
   el.className='journey-sheen';el.setAttribute('aria-hidden','true');el.style.width=target+'%';el.style.setProperty('--sweep-duration',duration+'s');track.append(el);
   el.classList.toggle('is-final',done===15);
   if(done===15)complete(duration*.82);else{marker.style.setProperty('--catch-delay',duration*.82+'s');marker.classList.add('is-charged');}
   marker.addEventListener('animationend',event=>{if(event.animationName==='dot-turbo')marker.classList.remove('is-charged');});
   el.addEventListener('animationend',()=>el.remove(),{once:true});
  }
  if(reduced.matches||done===0){set(target);pendingShine=false;if(done===15)complete();return;}
  const from=visualProgress;
  if(Math.abs(target-from)<.01){set(target);if(done===15&&!pendingShine)complete();shine();return;}
  const duration=done===15?180:850,start=performance.now();set(from);
  function flow(now){
   if(!track.isConnected){progressFrame=null;return;}
   const p=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-p,3);
   set(from+(target-from)*ease);
   if(ease>=.85)shine();
   if(p<1)progressFrame=requestAnimationFrame(flow);else{progressFrame=null;set(target);shine();}
  }
  progressFrame=requestAnimationFrame(flow);
 }
 function reveal(){
  updateProgress();
if(entryHeight!==null&&!reduced.matches){const before=entryHeight;entryHeight=null;header.animate([{height:before+'px'},{height:header.getBoundingClientRect().height+'px'}],{duration:700,easing:'cubic-bezier(.2,.75,.25,1)'});}if(!observer||reduced.matches)return;observer.disconnect();document.querySelectorAll('.course-card,.pick,.footer-brand,.social-links').forEach(el=>{el.classList.add('scroll-reveal');observer.observe(el);});scroll();}
 reduced.addEventListener('change',()=>{if(reduced.matches){document.querySelectorAll('.scroll-reveal').forEach(el=>el.classList.add('reveal-visible'));document.querySelector('.journey-fill')?.remove();document.querySelector('.journey-sheen')?.remove();document.querySelector('.journey-position')?.classList.remove('is-charged');updateProgress();}paint();});
 document.addEventListener('compass:render',reveal);window.addEventListener('pagehide',()=>{clearTimeout(entryTimer);clearTimeout(completionTimer);if(progressFrame!==null)cancelAnimationFrame(progressFrame);observer?.disconnect();if(frame!==null)cancelAnimationFrame(frame);});reveal();
})();
