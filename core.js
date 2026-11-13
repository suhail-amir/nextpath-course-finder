'use strict';
const CompassCore = (() => {
 const districts=['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];
 const districtML=['തിരുവനന്തപുരം','കൊല്ലം','പത്തനംതിട്ട','ആലപ്പുഴ','കോട്ടയം','ഇടുക്കി','എറണാകുളം','തൃശ്ശൂർ','പാലക്കാട്','മലപ്പുറം','കോഴിക്കോട്','വയനാട്','കണ്ണൂർ','കാസർഗോഡ്'];
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function normalizePhone(raw){let p=raw.trim().replace(/[\s()-]/g,'');if(p.startsWith('+91'))p=p.slice(3);else if(p.length===12&&p.startsWith('91'))p=p.slice(2);return /^[6-9]\d{9}$/.test(p)?p:null;}
 function validName(s){const n=s.trim();return n.length>=2&&n.length<=80&&/\p{L}/u.test(n)&&/^[\p{L}\p{M}\s.'’\-]+$/u.test(n);}
 const validPlace=s=>s.trim().length>=2&&s.trim().length<=80&&/\p{L}/u.test(s)&&/^[\p{L}\p{M}\p{N}\s.,'’()\-]+$/u.test(s);
 function excluded(c){if(c.id==='ba-llb-integrated')return false;return c.d===6 || /\bB\.?\s*A\.?\b|\bBA\b|\bB\.?\s*Ed\b|b-ed|b-arch|\bITEP\b|\barchitecture\b|\bdesign\b/i.test(c.n+' '+c.id);}
 function diploma(c){return /diploma|certificate|\bd\.pharm\b|\bgnm\b|\banm\b|gp-rating/i.test(c.n+' '+c.id);}
 // Provisional grouping only. These sample entries are not verified NextPath admissions.
 function groupFor(c){
  const s=c.n+' '+c.id;
  if(diploma(c))return 'diploma';
  if(c.d===5)return 'law';
  if(/nursing/i.test(s))return 'nursing';
  if(/\bbca\b/i.test(s))return 'bca';
  if(/\bbba\b|\bbms\b|\bbbm\b/i.test(s))return 'bba';
  if(/\bbcom\b|b\.com/i.test(s))return 'bcom';
  if(c.d===0)return /mbbs|bds|bams|bhms|bsms|bums|veterinary/i.test(s)?'medical':'allied';
  if(c.d===1)return /pharm/i.test(s)?'pharmacy':'science';
  if(c.d===2)return 'engineering';
  if(c.d===3)return 'computing';
  if(c.d===4)return 'finance';
  if(c.d===5)return 'law';
  if(c.d===8)return 'hospitality';
  return 'science';
 }
 return {districts,districtML,escape,normalizePhone,validName,validPlace,excluded,diploma,groupFor};
})();
if(typeof module!=='undefined')module.exports=CompassCore;
