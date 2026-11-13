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
  const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<3)return;
  const bend=Math.min(2,length*.02),nx=-dy/length*bend,ny=dx/length*bend;
  const d=`M${from.x} ${from.y} Q${(from.x+to.x)/2+nx} ${(from.y+to.y)/2+ny} ${to.x} ${to.y}`;
  const ribbon=document.createElementNS(ns,'g');ribbon.classList.add('flow-ribbon');
  for(const [kind,width]of [['flow-soft',6],['flow-core',1.2]]){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('stroke-width',width);path.classList.add(kind);ribbon.append(path);}
  ribbon.addEventListener('animationend',()=>ribbon.remove(),{once:true});layer.append(ribbon);
 }
 function queue(point,target){if(reduced.matches)return;const host=target?.closest?.('dialog')||document.body;if(layer.parentElement!==host){layer.querySelectorAll('g').forEach(g=>g.remove());host.append(layer);previous=null;}if(!previous){previous=point;return;}pending=point;if(frame===null)frame=requestAnimationFrame(()=>{frame=null;if(previous&&pending){draw(previous,pending);previous=pending;pending=null;}});}
 document.addEventListener('pointerdown',event=>{if(!event.isPrimary||reduced.matches)return;previous={x:event.clientX,y:event.clientY};},{passive:true});
 document.addEventListener('pointermove',event=>{if(event.isPrimary&&event.pointerType!=='touch')queue({x:event.clientX,y:event.clientY},event.target);},{passive:true});
 document.addEventListener('touchmove',event=>{if(event.touches.length===1){const touch=event.touches[0];queue({x:touch.clientX,y:touch.clientY},event.target);}},{passive:true});
 const end=()=>{previous=null;pending=null;if(frame!==null){cancelAnimationFrame(frame);frame=null;}};
 document.addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')end();},{passive:true});document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true});document.addEventListener('pointerout',event=>{if(!event.relatedTarget)end();},{passive:true});document.addEventListener('pointercancel',end,{passive:true});reduced.addEventListener('change',()=>{end();layer.querySelectorAll('g').forEach(g=>g.remove());});window.addEventListener('blur',end);window.addEventListener('pagehide',end);
})();
