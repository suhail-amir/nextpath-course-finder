'use strict';
const CompassRanking=(()=>{
 const weights={'personality match':.5,'work setting match':1,'subject match':2,'vision match':.5};
 const points=(r,label)=>r.parts.find(p=>p[0]===label)?.[1]||0;
 function selection(answers,catalogue){return catalogue.courses.filter(c=>(answers[12]||[]).includes(c.id));}
 function assess(all,answers,links,catalogue){
  const selected=selection(answers,catalogue);
  const conflicts=selected.filter(course=>{
   const profiles=all.filter(r=>(links[r.c.id]||[]).includes(course.name));
   return !profiles.length||profiles.every(r=>!points(r,'work setting match')&&(!points(r,'subject match')||!points(r,'personality match')));
  });
  return {needsReview:conflicts.length>0,conflicts,selected};
 }
 function rank(all,answers,links,catalogue){
  const assessment=assess(all,answers,links,catalogue);
  const names=new Set(assessment.selected.map(c=>c.name));
  return all.filter(r=>r.hard&&links[r.c.id]).map(r=>{
   const chosen=links[r.c.id].some(name=>names.has(name));
   const supported=points(r,'work setting match')>0||(points(r,'subject match')>0&&points(r,'personality match')>0);
   const interest=r.parts.reduce((sum,[label,p])=>sum+(weights[label]||0)*p,0);
   return {r,supported,chosen,interestScore:interest,conditional:r.soft.length>0,requiresReview:r.soft.length>0||Boolean(r.flags?.marks1||r.flags?.govtOnly),courses:links[r.c.id].map(name=>catalogue.courses.find(c=>c.name===name)).filter(Boolean)};
  }).filter(x=>x.supported&&x.interestScore>0&&x.courses.length)
   .sort((a,b)=>Number(a.conditional)-Number(b.conditional)||b.interestScore-a.interestScore||a.r.c.id.localeCompare(b.r.c.id)).slice(0,3);
 }
 return {rank,assess};
})();
if(typeof module!=='undefined')module.exports=CompassRanking;
