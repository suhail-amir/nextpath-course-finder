'use strict';
// A short directional ribbon follows cursor or finger movement without blocking controls or scrolling.
(()=>{
 const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'svg');
 layer.classList.add('interaction-flow');layer.setAttribute('aria-hidden','true');layer.setAttribute('focusable','false');
 layer.innerHTML='<defs><linearGradient id="nextpath-flow" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#0071bc" stop-opacity=".12"/><stop offset=".6" stop-color="#0071bc" stop-opacity=".4"/><stop offset="1" stop-color="#ffffff" stop-opacity=".7"/></linearGradient></defs>';
 document.body.append(layer);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let previous=null,pending=null,frame=null;
 function draw(from,to){
  if(reduced.matches)return;
  while(layer.querySelectorAll('g').length>=24)layer.querySelector('g').remove();
  // A transformed dialog establishes the fixed overlay's coordinate space.
  const bounds=layer.getBoundingClientRect();
  const scaleX=bounds.width/(layer.clientWidth||bounds.width||1)||1;
  const scaleY=bounds.height/(layer.clientHeight||bounds.height||1)||1;
  const local=point=>({x:(point.x-bounds.left)/scaleX,y:(point.y-bounds.top)/scaleY});
  from=local(from);
  to=local(to);
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<3)return;
  const bend=Math.min(2,length*.02),nx=-dy/length*bend,ny=dx/length*bend;
  const d=`M${from.x} ${from.y} Q${(from.x+to.x)/2+nx} ${(from.y+to.y)/2+ny} ${to.x} ${to.y}`;
  const ribbon=document.createElementNS(ns,'g');ribbon.classList.add('flow-ribbon');
  for(const [kind,width]of [['flow-soft',6],['flow-core',1.2]]){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('stroke-width',width);path.classList.add(kind);ribbon.append(path);}
  ribbon.addEventListener('animationend',()=>ribbon.remove(),{once:true});layer.append(ribbon);
 }
 function queue(point,target){if(reduced.matches)return;const host=target?.closest?.('dialog')||document.body;if(layer.parentElement!==host){layer.querySelectorAll('g').forEach(g=>g.remove());host.append(layer);previous=null;}if(!previous){previous=point;return;}pending=point;if(frame===null)frame=requestAnimationFrame(()=>{frame=null;if(previous&&pending){draw(previous,pending);previous=pending;pending=null;}});}
 const point=touch=>({x:touch.clientX,y:touch.clientY});
 let gesture=null;
 document.addEventListener('touchmove',event=>{
  const modal=document.querySelector('dialog[open]');
  if(!modal||!event.cancelable)return;
  const body=event.target.closest('.dialog-body');
  if(!body||body.scrollHeight<=body.clientHeight)event.preventDefault();
 },{passive:false});
 const optionSelector='.option,.course-btn';
 function clearPress(){gesture?.option?.classList.remove('is-pressed');}
 function cancelGesture(){if(gesture)gesture.cancelled=true;clearPress();}
 const end=()=>{
  if(previous&&pending)draw(previous,pending);
  previous=null;pending=null;
  if(frame!==null){cancelAnimationFrame(frame);frame=null;}
 };
 document.addEventListener('pointermove',event=>{
  if(event.isPrimary&&event.pointerType!=='touch')queue(point(event),event.target);
 },{passive:true});
 document.addEventListener('touchstart',event=>{
  if(event.touches.length!==1){cancelGesture();end();return;}
  end();
  const at=point(event.touches[0]);
  const option=event.target.closest(optionSelector);
  gesture={at,option,cancelled:false};
  option?.classList.add('is-pressed');
  queue({x:at.x-9,y:at.y+5},event.target);
  if(previous)draw(previous,at);
  previous=at;
 },{passive:true});
 document.addEventListener('touchmove',event=>{
  if(event.touches.length!==1){cancelGesture();end();return;}
  const at=point(event.touches[0]);
  if(gesture&&Math.hypot(at.x-gesture.at.x,at.y-gesture.at.y)>8)cancelGesture();
  queue(at,event.target);
 },{passive:true});
 document.addEventListener('touchend',event=>{
  clearPress();
  if(event.touches.length===0){
   if(gesture&&!gesture.cancelled&&gesture.option){
    const at=point(event.changedTouches[0]);
    if(!gesture.option.contains(document.elementFromPoint(at.x,at.y)))cancelGesture();
   }
   end();
  }
 },{passive:true});
 document.addEventListener('touchcancel',()=>{cancelGesture();end();},{passive:true});
 document.addEventListener('click',event=>{
  const option=event.target.closest(optionSelector);
  const touchClick=event.pointerType==='touch'||event.sourceCapabilities?.firesTouchEvents||
   (!event.pointerType&&event.detail>0&&gesture);
  if(option&&touchClick&&gesture&&(gesture.cancelled||gesture.option!==option)){
   event.preventDefault();
   event.stopImmediatePropagation();
  }
  if(touchClick)gesture=null;
 },true);
 document.addEventListener('pointerout',event=>{if(event.pointerType!=='touch'&&!event.relatedTarget){end();}},{passive:true});
 reduced.addEventListener('change',()=>{end();layer.querySelectorAll('g').forEach(g=>g.remove());});
 window.addEventListener('blur',()=>{cancelGesture();end();});
 window.addEventListener('pagehide',()=>{cancelGesture();end();});
})();
