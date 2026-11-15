'use strict';
(() => {
 const C=CompassCore,esc=C.escape,main=document.querySelector('#main'),dialog=document.querySelector('#dialog');
 const state={lang:'en',phase:'intro',reviewing:false,q:0,contact:0,answers:{},completed:new Set(),name:'',phone:'',region:'kerala',district:'',place:'',stateName:'',other:'',busy:false};
 let timer=null,modalGroup=null,lastTrigger=null;
 let submission=null;
 const collect=CompassSubmission.enabled;
 const t=(en,ml)=>state.phase!=='intro'&&state.lang==='ml'?ml:en;
 const iconPaths={
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  spark:'<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  linkedin:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7h.01M11 17v-7m0 3a3 3 0 0 1 6 0v4"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  law:'<path d="M12 3v18M7 21h10M4 7h16M6 7l-4 8h8L6 7Zm12 0-4 8h8l-4-8Z"/>',
  hospitality:'<path d="M3 16h18M5 16a7 7 0 0 1 14 0M12 6v3M10 6h4M3 20h18"/>',
  science:'<path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 14h8"/><path d="M10 17h.01M14 18h.01"/>',
  people:'<circle cx="10" cy="8" r="3"/><path d="M4 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M19 15a5 5 0 0 1 2 4"/>',
  creative:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>',
  business:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 12a22 22 0 0 0 18 0M12 12v3"/>',
  tech:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4m-3-9-2 2 2 2m6-4 2 2-2 2"/>',
  health:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"/>',
  route:'<circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 19h7a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h7"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 18h2"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  check:'<path d="m5 12 4 4L19 6"/>'
 };
 const icon=k=>`<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24">${iconPaths[k]||iconPaths.compass}</svg></span>`;
 const arrow='<span class="arrow" aria-hidden="true">→</span>';
 const REPORT_URL='https://suhail-amir.github.io/nextpath-course-finder/ai-risk.html';
 const groupLabel=g=>state.lang==='ml'?g.ml:g.label;
 const primary=(label,action)=>`<button type="button" class="primary" data-action="${action}">${label}${arrow}</button>`;
 function heading(title,sub,kicker=''){return `${kicker?`<p class="step-kicker">${kicker}</p>`:''}<h1 tabindex="-1">${title}</h1>${sub?`<p class="question-sub">${sub}</p>`:''}`;}
 function intro(){return `<section class="welcome"><p class="welcome-label">${t('YOUR NEXT CHAPTER','ഇനി നിങ്ങളുടെ അടുത്ത ചുവട്')}</p><h1>${t('Discover <span>Your Future</span>','നിങ്ങളുടെ <span>ഭാവിയിലേക്ക്</span>')}</h1><p class="welcome-description">${t('Find the course that fits you in 3 minutes.','നിങ്ങൾക്ക് ചേരുന്ന കോഴ്‌സ് 3 മിനിറ്റിൽ കണ്ടെത്താം.')}</p>${primary(t('Find My Dream Course','എന്റെ സ്വപ്ന കോഴ്‌സ് കണ്ടെത്താം'),'start')}<div class="welcome-meta"><span>${icon('clock')}${t('3 Minutes','3 മിനിറ്റ്')}</span><span>${icon('spark')}${t('AI Career Insights','AI കരിയർ അറിവുകൾ')}</span></div><p class="welcome-footnote">${icon('compass')}${t('A few questions about you. A clearer place to start.','നിങ്ങളെക്കുറിച്ച് കുറച്ച് ചോദ്യങ്ങൾ. എവിടെ തുടങ്ങണമെന്ന് അറിയാം.')}</p></section>`;}
 const completedSteps=()=>state.completed.size+Number(state.phase==='result'||state.reviewing);
 function progress(){const total=15,done=completedSteps();const active=state.reviewing?-1:state.phase==='quiz'?(state.q<5?0:1):state.phase==='contact'?2:-1;const steps=[[5,t('Interests','ഇഷ്ടങ്ങൾ')],[14,t('Plans','പദ്ധതികൾ')],[total,t('Your Results','നിങ്ങളുടെ ഫലം')]];return `<div class="progress-top" aria-live="polite"><span><b class="count">${done}</b> ${t('Completed','പൂർത്തിയായി')}</span><span><b class="count">${total-done}</b> ${t('Left','ബാക്കി')}</span></div><div class="journey-track"><progress max="${total}" value="${done}" aria-label="${t('Journey progress','പുരോഗതി')}"></progress><span class="journey-position" data-completed="${done}" aria-hidden="true"></span></div><div class="milestones" aria-label="${t('Milestones','നാഴികക്കല്ലുകൾ')}">${steps.map(([n,label],i)=>`<span ${i===active?'aria-current="step"':''} data-threshold="${n}" class="milestone ${i===active?'current ':''}${done>=n?'reached':''}"><i aria-hidden="true">${done>=n?'<svg class="milestone-tick" viewBox="0 0 16 16" focusable="false"><path pathLength="1" d="M4 8.2 6.7 11 12 5.5"/></svg>':i+1}</i>${label}</span>`).join('')}</div>`;}
 function quizNextLabel(){
  if(state.reviewing)return state.q===questions.length-1?t('See Updated Results','ഫലം കാണാം'):t('Next Question','അടുത്ത ചോദ്യം');
  if(questions[state.q].type==='course_select')return t('Continue','തുടരാം');
  return state.completed.has(state.q)?t('Next','അടുത്തത്'):'';
 }
 function usesGlassNavigation(){
  return state.phase==='contact'||(state.phase==='quiz'&&(state.reviewing||state.completed.has(state.q)));
 }
 function inlineQuizNavigation(){
  if(usesGlassNavigation())return '';
  const next=quizNextLabel();
  return `<div class="nav${next?' course-picker-actions':''}"><button type="button" class="back" data-action="back">← ${t('Back','പിന്നോട്ട്')}</button>${next?`<button type="button" class="primary course-continue" data-action="next">${next}${arrow}</button>`:`<span class="nav-note">${t('Tap an answer to continue.','ഒന്ന് തിരഞ്ഞെടുത്താൽ മുന്നോട്ട് പോകാം.')}</span>`}</div>`;
 }
 function question(){const q=questions[state.q],en=EN_QUESTIONS[state.q],ml=ML_QUESTIONS[state.q];let h=heading(esc(t(en[0],ml[0])),esc(t(en[1],ml[1])),`${t('Question','ചോദ്യം')} ${String(state.q+1).padStart(2,'0')} / 14`);
  if(state.reviewing)h=`<button type="button" class="review-return" data-action="return-results">${t('Back to Results','ഫലത്തിലേക്ക് മടങ്ങുക')} <span aria-hidden="true">→</span></button>`+h;
  if(q.type==='course_select'){
   const cue=`<div class="course-continue-cue" ${!usesGlassNavigation()&&state.answers[12]?.length?'':'hidden'}><button type="button" data-action="scroll-to-continue">${t('Scroll down to continue','തുടരാൻ താഴേക്ക് സ്ക്രോൾ ചെയ്യൂ')} <span aria-hidden="true">↓</span></button></div>`;
   return h+cue+coursePicker()+inlineQuizNavigation();
  }
  h+='<div class="options">'+q.opts.map((o,i)=>`<button class="option ${state.answers[state.q]===o.v?'selected':''}" type="button" data-answer="${i}" aria-pressed="${state.answers[state.q]===o.v}"><span class="option-icon" aria-hidden="true">${esc(o.i)}</span><span class="copy"><strong>${esc(t(en[2][i],ml[2][i]))}</strong>${state.lang==='en'&&state.q<5&&o.s?`<small>${esc(o.s)}</small>`:''}</span><span class="mark" aria-hidden="true">${state.answers[state.q]===o.v?'✓':'↗'}</span></button>`).join('')+'</div>'+inlineQuizNavigation();return h;
 }
 function coursePicker(){let h='';const sections=[['health',t('Health & care','ആരോഗ്യ മേഖല')],['tech',t('Technology & engineering','ടെക്‌നോളജി & എൻജിനീയറിങ്')],['business',t('Business & commerce','ബിസിനസ് & കൊമേഴ്‌സ്')],['other',t('Other paths','മറ്റു വഴികൾ')]];
  for(const [area,label] of sections)h+=`<h2 class="course-section">${label}</h2><div class="course-groups">${ADMISSIONS.groups.filter(g=>g.area===area).map(groupButton).join('')}</div>`;
  h+=`<details class="diploma-disclosure"><summary class="course-section">${t('Explore diploma routes','ഡിപ്ലോമ വഴികൾ കാണാം')}</summary><p class="small-note">${t('Interested in a diploma? Explore these. Entry requirements vary, including whether you need to pass +2.','ഡിപ്ലോമയിൽ താൽപ്പര്യമുണ്ടെങ്കിൽ നോക്കാം. +2 പാസാകണമോ എന്നത് കോഴ്‌സ് അനുസരിച്ച് മാറും.')}</p><div class="course-groups">${ADMISSIONS.groups.filter(g=>g.area==='diploma').map(groupButton).join('')}</div></details>`;
  h+=`<div class="field"><label for="other-course">${t('Something else in mind? (optional)','മറ്റേതെങ്കിലും കോഴ്‌സ് മനസ്സിലുണ്ടോ? (നിർബന്ധമില്ല)')}</label><input id="other-course" data-field="other" class="input" maxlength="100" value="${esc(state.other)}" placeholder="${t('Type a course name','കോഴ്‌സിന്റെ പേര്')}" autocomplete="off"></div><div id="chosen">${chosen()}</div>`;
  return h;
 }
 function groupButton(g){const selected=(state.answers[12]||[]).filter(id=>ADMISSIONS.courses.find(c=>c.id===id)?.group===g.id).length;return `<button type="button" class="option ${selected?'selected':''}" data-group="${g.id}" ${ADMISSIONS.courses.filter(c=>c.group===g.id).length>1?'aria-haspopup="dialog"':'aria-pressed="'+Boolean(selected)+'"'}>${icon(g.icon)}<span class="copy"><strong>${esc(groupLabel(g))}</strong><small>${selected?`${selected} ${t('selected','തിരഞ്ഞെടുത്തു')}`:ADMISSIONS.courses.filter(c=>c.group===g.id).length===1?t('Select course','കോഴ്‌സ് തിരഞ്ഞെടുക്കൂ'):t('Explore options','ഓപ്ഷനുകൾ കാണാം')}</small></span><span class="mark" aria-hidden="true">↗</span></button>`;}
 function chosen(){const ids=state.answers[12]||[];return `<p class="selection-summary" role="status">${ids.length} ${t('selected · You can skip this.','തിരഞ്ഞെടുത്തു · സ്കിപ്പ് ചെയ്യാം.')}</p><div class="chips">${ids.map(id=>{const c=ADMISSIONS.courses.find(c=>c.id===id);return c?`<button type="button" class="chip" data-remove="${esc(id)}" aria-label="${t('Remove','ഒഴിവാക്കുക')} ${esc(c.name)}">${esc(c.name)} ×</button>`:''}).join('')}</div>`;}
 function refreshCourseSelection(id,restoreFocus=false){
  if(id){
   const group=ADMISSIONS.groups.find(group=>group.id===id);
   const button=main.querySelector(`[data-group="${id}"]`);
   if(group&&button){
    button.outerHTML=groupButton(group);
    if(restoreFocus)main.querySelector(`[data-group="${id}"]`)?.focus({preventScroll:true});
   }
  }
  main.querySelector('#chosen').innerHTML=chosen();
  main.querySelector('.course-continue-cue').hidden=usesGlassNavigation()||!state.answers[12]?.length;
 }
 let groupOpenedWithKeyboard=false;
 function openGroup(id){modalGroup=id;const g=ADMISSIONS.groups.find(g=>g.id===id);if(!g)return;showDialog(`<h2 id="dialog-title">${esc(groupLabel(g))}</h2><p>${t('Pick the courses you like. Entry requirements still need checking.','ഇഷ്ടമുള്ള കോഴ്‌സുകൾ തിരഞ്ഞെടുക്കൂ. ചേരാനുള്ള യോഗ്യത ഇനിയും പരിശോധിക്കാനുണ്ട്.')}</p>${g.sourceAward?`<p class="small-note">${t('B.Tech / BE: confirm the degree name with the college.','B.Tech / BE: ബിരുദത്തിന്റെ പേര് കോളേജിനോട് ചോദിച്ച് ഉറപ്പാക്കണം.')}</p>`:''}<div class="options">${ADMISSIONS.courses.filter(c=>c.group===id).map(c=>`<button type="button" class="option ${(state.answers[12]||[]).includes(c.id)?'selected':''}" data-course="${c.id}" aria-pressed="${(state.answers[12]||[]).includes(c.id)}"><span class="copy"><strong lang="en">${esc(c.name)}</strong></span><span class="mark" aria-hidden="true">${(state.answers[12]||[]).includes(c.id)?'✓':'+'}</span></button>`).join('')}</div>`,true);}
 function validLocation(){return state.region==='kerala'?C.districts.includes(state.district):C.validPlace(state.stateName)&&C.validPlace(state.place);}
 function field(id,label,placeholder,attrs=''){return `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" data-field="${id}" value="${esc(state[id])}" placeholder="${placeholder}" ${attrs}></div>`;}
 function contactLocationFields(){return state.region==='kerala'?`<div class="districts" id="districts">${districtButtons('')}</div>`:field('stateName',t('State / Union Territory','സംസ്ഥാനം / കേന്ദ്രഭരണ പ്രദേശം'),t('Enter your state','സംസ്ഥാനം'),'autocomplete="address-level1" maxlength="80"')+field('place',t('Town / City','പട്ടണം / നഗരം'),t('Enter your town','പട്ടണം'),'autocomplete="address-level2" maxlength="80"');}
 function contact(){return `<form id="contact-form" novalidate>${heading(t('A Little About You','ഇനി നിങ്ങളെക്കുറിച്ച്'),t('One last step before your results.','ഫലം കാണുന്നതിന് മുമ്പ് ഒരു ചെറിയ കാര്യം കൂടി.'))}${field('name',t('Your Name','നിങ്ങളുടെ പേര്'),t('Enter your name','പേര് എഴുതൂ'),'autocomplete="name" maxlength="80" required')}<section id="phone-section" ${C.validName(state.name)?'':'hidden'}>${field('phone',t('WhatsApp Number','WhatsApp നമ്പർ'),t('Your 10-digit mobile number','10 അക്ക മൊബൈൽ നമ്പർ'),'type="tel" inputmode="tel" autocomplete="tel-national" maxlength="20"')}<p class="helper">${t('Indian mobile number · +91','ഇന്ത്യൻ മൊബൈൽ നമ്പർ · +91')}</p></section><section id="location-section" ${C.validName(state.name)&&C.normalizePhone(state.phone)?'':'hidden'}><h2>${t('Where Are You From?','നിങ്ങൾ എവിടെയാണ്?')}</h2><div class="segments">${[['kerala',t('Kerala','കേരളം')],['outside',t('Outside Kerala','കേരളത്തിന് പുറത്ത്')]].map(([id,label])=>`<button type="button" data-region="${id}" aria-pressed="${state.region===id}">${label}</button>`).join('')}</div><div id="contact-location-fields">${contactLocationFields()}</div></section>${collect?`<p class="helper">${t('When you tap See Results, NextPath EduCare saves your contact details and answers for course guidance and may contact you.','ഫലം കാണുക അമർത്തുമ്പോൾ കോഴ്‌സ് സഹായത്തിനായി NextPath EduCare നിങ്ങളുടെ വിവരങ്ങളും മറുപടികളും സൂക്ഷിക്കും. ഞങ്ങൾ നിങ്ങളെ ബന്ധപ്പെടാം.')}</p>`:''}<p class="error" id="error" role="alert"></p></form>`;}
 const contactActions=document.querySelector('#contact-actions');
 let contactEndObserver;
 let contactInset=0;
 let contactFrame=0;
 function positionContactActions(){
  if(contactActions.hidden||contactFrame)return;
  contactFrame=requestAnimationFrame(()=>{
   contactFrame=0;
   if(contactActions.hidden)return;
   const viewport=window.visualViewport;
   const editing=document.activeElement?.matches('#contact-form input');
   // Use height to detect the keyboard. Its top offset can change as Safari pans to an input.
   const occluded=viewport&&viewport.scale===1?window.innerHeight-viewport.height:0;
   const keyboardOpen=editing&&occluded>100;
   const inset=keyboardOpen?Math.max(0,Math.round(occluded-viewport.offsetTop)):0;
   if(inset===contactInset)return;
   contactInset=inset;
   contactActions.style.setProperty('--keyboard-shift',-inset+'px');
  });
 }
 window.visualViewport?.addEventListener('resize',positionContactActions);
 window.visualViewport?.addEventListener('scroll',positionContactActions);
 window.addEventListener('scroll',positionContactActions,{passive:true});
 window.addEventListener('resize',positionContactActions);
 document.addEventListener('focusin',positionContactActions);
 document.addEventListener('focusout',positionContactActions);
 new ResizeObserver(()=>{
  if(contactActions.hidden)return;
  const height=contactActions.offsetHeight;
  document.documentElement.style.setProperty('--contact-actions-height',height+'px');
  contactEndObserver?.disconnect();
  contactEndObserver=new IntersectionObserver(([entry])=>{
   contactActions.classList.toggle('has-more',!entry.isIntersecting);
  },{rootMargin:`0px 0px -${height+10}px 0px`});
  observeNavigationEnd();
 }).observe(contactActions);
 function observeNavigationEnd(){
  contactEndObserver?.disconnect();
  const end=main.querySelector('.navigation-end');
  if(end)contactEndObserver?.observe(end);
 }
 function renderNavigation(){
  const contact=state.phase==='contact';
  contactActions.hidden=!usesGlassNavigation();
  if(!contact){
   contactInset=0;
   contactActions.style.removeProperty('--keyboard-shift');
  }
  observeNavigationEnd();
  if(contactActions.hidden)return;

  const backButton=contactActions.querySelector('[data-action="back"]');
  backButton.textContent='← '+t('Back','പിന്നോട്ട്');
  const nextButton=contactActions.querySelector('.primary');
  const label=contact?t('See Results','ഫലം കാണുക'):quizNextLabel();
  nextButton.hidden=!label;
  nextButton.querySelector('.navigation-label').textContent=label;
  nextButton.type=contact?'submit':'button';
  nextButton.disabled=contact?!(C.validName(state.name)&&C.normalizePhone(state.phone)&&validLocation()):false;
  nextButton.classList.toggle('revisit-next',!contact&&state.completed.has(state.q));
  nextButton.classList.toggle('course-continue',!contact&&questions[state.q].type==='course_select');
  if(contact){
   nextButton.id='contact-submit';
   nextButton.setAttribute('form','contact-form');
   delete nextButton.dataset.action;
   positionContactActions();
  }else{
   nextButton.removeAttribute('id');
   nextButton.removeAttribute('form');
   nextButton.dataset.action='next';
  }
 }
 function updateContact(){if(state.phase!=='contact')return;document.querySelector('#phone-section').hidden=!C.validName(state.name);document.querySelector('#location-section').hidden=!(C.validName(state.name)&&C.normalizePhone(state.phone));document.querySelector('#contact-submit').disabled=!(C.validName(state.name)&&C.normalizePhone(state.phone)&&validLocation());}
 function districtButtons(search){const query=search.toLowerCase().trim();const items=C.districts.map((name,i)=>({name,ml:C.districtML[i]})).filter(d=>(d.name+' '+d.ml).toLowerCase().includes(query));return items.length?items.map(d=>`<button type="button" class="option ${state.district===d.name?'selected':''}" data-district="${d.name}" aria-pressed="${state.district===d.name}"><span class="copy">${t(d.name,d.ml)}</span><span class="mark" aria-hidden="true">${state.district===d.name?'✓':'↗'}</span></button>`).join(''):`<p class="small-note" role="status">${t('No district found. Try another spelling.','ജില്ല കണ്ടെത്തിയില്ല. മറ്റൊരു രീതിയിൽ എഴുതൂ.')}</p>`;}
 // Explicit links to profile-listed courses; legacy engine is preserved; the preview adapter ranks interest evidence separately.
 const resultLinks={
 'mbbs-and-bds-clinical-practice':['MBBS','BDS'],
 'bams-ayurveda':['BAMS'],'bhms-homoeopathy':['BHMS'],'nursing':['B.Sc Nursing'],
 'physiotherapy-bpt':['Physiotherapy'],'occupational-therapy-bot':['Occupational Therapy'],
 'audiology-speech-therapy-baslp':['Bachelor of Speech Therapy & Audiology'],
 'lab-radiography-and-imaging-technology':['Medical Lab Technology','Radiology'],
 'optometry':['Optometry'],'cardiac-dialysis-and-perfusion-technology':['Cardiac Care Technology','Renal Dialysis Technology','Perfusion Technology'],
 'physician-associate-b-pa':['Physician Assistant'],
 'emergency-medical-technology-b-emt-paramedics':['Emergency Trauma Care Management System'],
 'respiratory-therapy-b-rt':['Respiratory Care Technology'],
 'anaesthesia-operation-theatre-technology':['Operation Theatre & Anaesthesia Technology'],
 'pharmacy-b-pharm':['B.Pharm'],'pharm-d-doctor-of-pharmacy':['Pharm.D'],
 'computer-science-engineering-b-tech-cse-it':['B.Tech · Computer Science','B.Tech · Information Technology'],
 'ai-data-science-engineering-b-tech':['B.Tech · Artificial Intelligence','B.Tech · Data Science'],
 'electronics-communication-engineering-ece':['B.Tech · Electronics & Communication Engineering'],
 'civil-engineering-and-construction':['B.Tech · Civil Engineering'],
 'electrical-electronics-engineering-eee':['B.Tech · Electrical & Electronics Engineering'],
 'mechanical-engineering':['B.Tech · Mechanical Engineering'],
 'chemical-engineering':['B.Tech · Chemical Engineering'],
 'aerospace-aeronautical-engineering':['B.Tech · Aerospace Engineering','B.Tech · Aeronautical Engineering'],
 'biomedical-engineering-and-equipment':['B.Tech · Biomedical Engineering'],
 'mechatronics-robotics-engineering':['B.Tech · Mechatronics','B.Tech · Automation & Robotics'],
 'automobile-ev-engineering':['B.Tech · Automobile Engineering'],
 'artificial-intelligence-and-machine-learning-bsc-or-bca-with-ai':['BCA · Artificial Intelligence','BCA · Machine Learning'],
 'cloud-computing-and-devops-bca-bsc-specialisation':['BCA · Cloud Computing','BCA · DevOps'],
 'digital-forensics-and-cyber-law-bsc-or-specialisation':['BCA · Digital Forensics'],
 'bba-general':['BBA · Business Management'],
 'bba-aviation-management':['BBA · Aviation'],
 'bba-logistics-and-supply-chain':['BBA · Logistics','BBA · Supply Chain Management'],
 'bba-hospital-and-healthcare-management':['BBA · Hospital Administration'],
 'bba-entrepreneurship-and-family-business':['BBA · Entrepreneurship'],
 'bcom-finance-and-taxation':['B.Com · Finance','B.Com · Taxation & Auditing'],
 'ba-llb-integrated':['BA LL.B'],'bba-llb-integrated':['BBA LL.B'],
 'hotel-management-bhm-bsc-hospitality':['Bachelor of Hotel Management']
 };
 const backupNames={'bca-bachelor-of-computer-applications':'BCA · Specialisation to Discuss'};
 const reportCourseName=c=>resultLinks[c.id]?resultLinks[c.id].map(esc).join(' / '):esc(backupNames[c.id]);
 function assessment(){return CompassRanking.assess(scoreAll(state.answers).all,state.answers,resultLinks,ADMISSIONS);}
 function consistencyNotice(){const a=assessment();if(!a.needsReview)return '';return `<div class="info-box info-note"><h2 class="course-name">${t('Your Interests and Your Course Choices','നിങ്ങളുടെ ഇഷ്ടങ്ങളും കോഴ്‌സ് തിരഞ്ഞെടുപ്പും')}</h2><p>${t('Some selected courses need a closer look alongside your interest answers. We have kept their entry checks below; selecting a course does not automatically make it your best match.','തിരഞ്ഞെടുത്ത ചില കോഴ്‌സുകൾ നിങ്ങളുടെ ഇഷ്ടങ്ങളുമായി ചേർത്ത് കൂടുതൽ പരിശോധിക്കണം. അവയുടെ പ്രവേശന വിവരങ്ങൾ താഴെയുണ്ട്. ഒരു കോഴ്‌സ് തിരഞ്ഞെടുത്തു എന്നതുകൊണ്ട് മാത്രം അത് ഏറ്റവും ചേരുന്നതായി കണക്കാക്കുന്നില്ല.')}</p></div>`;}
 function directionGroups(){return CompassRanking.rank(scoreAll(state.answers).all,state.answers,resultLinks,ADMISSIONS);}
 function whatsappUrl(){
  const base='https://wa.me/918590361125';
  const saved=submission?.payload;
  const place=state.region==='kerala'?state.district+', Kerala':state.place.trim()+', '+state.stateName.trim();
  const name=saved?.name||state.name.trim();
  const greeting=name?`Hi NextPath! I’m ${name} from ${saved?.location||place}.`:'Hi NextPath!';
  const ref=submission?.refId||(!saved?.referenceFormat&&saved?.refId);
  const message=greeting+' I completed Career Compass and would like some course guidance.'+(ref?` My reference is ${ref}.`:'');
  return base+'?text='+encodeURIComponent(message);
 }
 function results(){const top=directionGroups(),backupUsed=new Set(top.map(x=>x.r.c.id)),loc=state.region==='kerala'?state.district+', Kerala':state.place+', '+state.stateName;return `<div class="result-header"><img src="assets/nextpath-logo.png" class="result-logo" alt="NextPath EduCare"><h1 tabindex="-1">${t('Your Career Compass 🧭','നിങ്ങളുടെ കരിയർ കോമ്പസ് 🧭')}</h1><p>${t('Based on your interests, studies, budget and plans','നിങ്ങളുടെ ഇഷ്ടങ്ങൾ, പഠനം, ബജറ്റ്, പദ്ധതികൾ എന്നിവ നോക്കി')}</p></div>${state.name?`<div class="student-summary"><div class="student-name">👋 ${esc(state.name)}</div><div class="student-sub">${esc(loc)}</div></div>`:''}${collect?`<div id="submission-status" ${submission?.status==='failed'?'':'hidden'}><p role="alert">${t('We couldn’t confirm your details were saved.','വിവരങ്ങൾ സൂക്ഷിച്ചോ എന്ന് ഉറപ്പാക്കാനായില്ല.')}</p>${primary(t('Try Again','വീണ്ടും ശ്രമിക്കാം'),'retry-save')}</div>`:''}${consistencyNotice()}<div class="sec-title">${t('Your Interest-led Options','നിങ്ങളുടെ ഇഷ്ടങ്ങൾ അനുസരിച്ചുള്ള വഴികൾ')}</div>${!top.length?`<div class="info-box info-note">${t('We don’t have enough supporting evidence to name a suitable course from this catalogue. Your interests may need routes beyond our current course list. Review your selected courses below with a counsellor.','ഈ ലിസ്റ്റിൽ നിന്ന് നിങ്ങൾക്ക് ചേരുന്ന കോഴ്‌സ് ഉറപ്പിക്കാൻ ആവശ്യമായ വിവരങ്ങൾ ഇപ്പോൾ ഇല്ല. നിങ്ങളുടെ ഇഷ്ടങ്ങൾക്ക് ഞങ്ങളുടെ ലിസ്റ്റിന് പുറത്തുള്ള വഴികളും വേണ്ടിവരാം. താഴെയുള്ള കോഴ്‌സുകൾ കൗൺസലറുമായി നോക്കാം.')}</div>`:''}${top.map(({courses,r,conditional,requiresReview},i)=>`<article class="course-card ${i===0?'top':''}"><span class="badge">${requiresReview?t('Check Entry Route','പ്രവേശന വഴി പരിശോധിക്കാം'):i===0?t('⭐ Strongest Interest Match','⭐ ഇഷ്ടങ്ങളോട് കൂടുതൽ ചേരുന്നത്'):t('Interest Match '+(i+1),'മറ്റൊരു വഴി '+(i+1))}</span><h2 class="course-name">${courses.map(c=>esc(c.name)).join(' / ')}</h2><p class="course-yrs">${esc(r.c.y)}</p><div class="why"><ul>${reasons(r)}</ul></div>${requiresReview?`<div class="fit"><div class="warn">${t('Marks or budget need a closer check for this option.','ഈ കോഴ്‌സിന് മാർക്കോ ബജറ്റോ കൂടുതൽ പരിശോധിക്കണം.')}</div></div>`:''}<div class="fit"><div class="warn">${t('Confirm subjects, entrance requirements and fees with the college.','വേണ്ട വിഷയങ്ങൾ, എൻട്രൻസ്, ഫീസ് എന്നിവ കോളേജിനോട് ഉറപ്പാക്കാം.')}</div></div>${riskBlock(r.c)}${backupBlock(r,top,backupUsed)}</article>`).join('')}${selectedResults()}${worryMessage()}<div class="info-box info-note">${t('About the AI numbers: these are estimates from the earlier report. They show possible changes to tasks, not a prediction about your job. Course matching is still a preview.','AI കണക്കുകൾ പഴയ റിപ്പോർട്ടിലെ ഏകദേശ വിലയിരുത്തലാണ്. ജോലിയിലെ കാര്യങ്ങൾ എങ്ങനെ മാറാം എന്നാണ് സൂചിപ്പിക്കുന്നത്. നിങ്ങളുടെ ജോലി പോകുമെന്ന പ്രവചനമല്ല. കോഴ്‌സ് നിർദേശങ്ങളും ഇപ്പോൾ പ്രിവ്യൂ ആണ്.')} <span class="report-version">${t('Report','റിപ്പോർട്ട്')} v${esc(REPORT.version)} · ${esc(REPORT.date)}</span><a class="report-link" href="${REPORT_URL}" target="_blank" rel="noopener noreferrer">${t('Open the Full AI Career Risk Report →','പൂർണ്ണ AI കരിയർ റിപ്പോർട്ട് കാണാം →')}</a></div><a class="wa-btn" href="${esc(whatsappUrl())}" target="_blank" rel="noopener noreferrer"><span class="wa-shine" aria-hidden="true"></span><span class="wa-intake" aria-hidden="true"></span><span class="wa-entry"><img class="wa-app-icon" src="assets/whatsapp-mark.png" width="36" height="36" alt=""><span class="wa-copy"><span class="wa-label">${t('Talk to a NextPath Counsellor','NextPath കൗൺസലറോട് സംസാരിക്കാം')}</span><small>+91 85903 61125</small></span><span class="wa-open" aria-hidden="true">→</span></span></a><div class="result-actions"><button type="button" class="secondary" data-action="review">${t('Review My Answers','മറുപടികൾ നോക്കാം')}</button><button type="button" class="secondary" data-action="restart">${t('↺ Start Again','↺ വീണ്ടും തുടങ്ങാം')}</button></div>`;}
 function backupBlock(r,top,used){const all=scoreAll(state.answers).all;const backups=backupsFor(r,all,used,8).filter(x=>resultLinks[x.c.id]||backupNames[x.c.id]).slice(0,2);backups.forEach(x=>used.add(x.c.id));if(!backups.length)return '';return `<div class="bk"><div class="bk-t">${t('If this does not work out, consider:','ഇത് സാധിച്ചില്ലെങ്കിൽ നോക്കാവുന്ന വഴികൾ:')}</div>${backups.map(b=>`<div class="bk-i"><b>${reportCourseName(b.c)}</b> <button type="button" class="more-guidance" data-guidance="${esc(b.c.id)}" aria-haspopup="dialog">${t('More Details →','കൂടുതൽ വിവരങ്ങൾ →')}</button></div>`).join('')}</div>`;}
 function riskBlock(c){const bar=(label,a,k)=>`<div class="rb"><div class="rl"><span>${label}</span><b>${a[0]}–${a[1]}%</b></div><svg class="risk-svg" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><rect class="${k}" x="${a[0]}" y="0" width="${a[1]-a[0]}" height="8" rx="3"/></svg></div>`;return `<div class="risk"><div class="risk-h"><span>${t('AI RISK (estimate)','AI മാറ്റങ്ങൾ (ഏകദേശ കണക്ക്)')}</span><span class="ev ev-e">${t('Our Estimate','ഏകദേശ കണക്ക്')}</span></div>${bar(t('If you ignore AI','AI പഠിക്കാതെ'),c.r,'ra')}${bar(t('If you learn AI in this field','ഈ മേഖലയിൽ AI പഠിച്ചാൽ'),c.a,'rg')}${c.note?`<div class="rr" lang="en">${esc(c.note)}</div>`:''}<a class="dbtn" href="${REPORT_URL}#${esc(c.id)}" target="_blank" rel="noopener noreferrer">${t('See Full Details →','പൂർണ്ണ വിവരങ്ങൾ കാണാം →')}</a><div class="rr">${t('Related field:','ബന്ധപ്പെട്ട മേഖല:')} <span lang="en">${esc(c.n)}</span></div><details><summary>${t('Quick AI Summary','AI-യെക്കുറിച്ച് ചുരുക്കത്തിൽ')}</summary><p><b>${t('AI can help with: ','AI സഹായിക്കാവുന്നത്: ')}</b>${esc(c.t||'')}</p><p><b>${t('Your human skills: ','നിങ്ങളുടെ കഴിവുകൾ: ')}</b>${esc(c.h||'')}</p><p><b>${t('What to learn: ','പഠിക്കാവുന്നത്: ')}</b>${esc(c.k||'')}</p></details></div>`;}
 function reasons(r){const labels={'personality match':t('Connects with activities you enjoy.','നിങ്ങൾക്ക് ഇഷ്ടമുള്ള കാര്യങ്ങളുമായി ബന്ധമുണ്ട്.'),'work setting match':t('Fits the work setting you picked.','നിങ്ങൾ ജോലി ചെയ്യാൻ ആഗ്രഹിക്കുന്ന ഇടവുമായി ചേരുന്നു.'),'subject match':t('Builds on a subject you enjoy.','ഇഷ്ടമുള്ള വിഷയവുമായി ബന്ധമുണ്ട്.'),'vision match':t('Connects with what matters to you.','നിങ്ങൾക്ക് പ്രധാനപ്പെട്ട കാര്യങ്ങളുമായി ചേരുന്നു.')};const texts=r.parts.filter(([k,p])=>p>0&&labels[k]).map(([k])=>labels[k]);return (texts.length?texts:[t('The original scoring placed this area among the available options. Discuss your interests further before deciding.','പഴയ സ്കോറിങ് ഈ മേഖലയെ ഓപ്ഷനുകളിൽ ഉൾപ്പെടുത്തി. തീരുമാനിക്കുന്നതിന് മുമ്പ് താൽപ്പര്യങ്ങൾ കൂടുതൽ ചർച്ച ചെയ്യാം.')]).slice(0,3).map(s=>`<li>${s}</li>`).join('');}
 function fitCheck(r,u){const translated={
 'Your Plus 2 stream does not qualify for this course':'പഴയ നിയമങ്ങൾ പ്രകാരം നിങ്ങളുടെ +2 വിഷയങ്ങൾ ഈ കോഴ്‌സിന് ചേരുന്നില്ല.',
 'Needs NEET. You said you are not planning to write it':'NEET വേണം. എഴുതാൻ പദ്ധതിയില്ലെന്നാണ് നിങ്ങൾ പറഞ്ഞത്.',
 'Your budget is below even the cheapest (government) route':'പഴയ ഫീസ് കണക്കുപ്രകാരം സർക്കാർ സീറ്റിനും നിങ്ങളുടെ ബജറ്റ് കുറവായേക്കാം.',
 'Affordable mainly through a government or aided seat':'സർക്കാർ അല്ലെങ്കിൽ എയ്ഡഡ് സീറ്റ് കിട്ടിയാൽ ബജറ്റിൽ ഒതുങ്ങാം.',
 'Fits your budget':'പഴയ ഫീസ് കണക്കുപ്രകാരം ബജറ്റിൽ ഒതുങ്ങാം.',
 'Very competitive for your marks band':'ഈ മാർക്കിൽ പ്രവേശനം നേടാൻ കൂടുതൽ മത്സരമുണ്ടാകാം.',
 'Competitive for your marks. Needs a strong entrance rank or a good college choice':'നല്ല എൻട്രൻസ് റാങ്കോ അനുയോജ്യമായ കോളേജോ വേണ്ടിവരാം.',
 'Realistic for your marks':'പഴയ നിയമങ്ങൾ പ്രകാരം ഈ മാർക്കിൽ പരിഗണിക്കാം.',
 'Admission is rank-based. Even high marks do not guarantee a seat, so keep backups ready':'പ്രവേശനം റാങ്ക് അനുസരിച്ചാണ്. ഉയർന്ന മാർക്ക് മാത്രം സീറ്റ് ഉറപ്പാക്കില്ല.',
 'Government seats need KEAM or JEE. Private management seats may be possible':'സർക്കാർ സീറ്റിന് KEAM/JEE വേണം. സ്വകാര്യ മാനേജ്‌മെന്റ് സീറ്റ് പരിശോധിക്കാം.',
 'Best colleges need an entrance exam (CLAT, NATA, UCEED, NIFT or CUET)':'ചില കോളേജുകളിൽ എൻട്രൻസ് വേണം. കോഴ്‌സ് അനുസരിച്ച് പരിശോധിക്കാം.',
 'NEET is usually used for admission. Check the current rule':'സാധാരണ NEET ഉപയോഗിച്ചാണ് പ്രവേശനം. ഇപ്പോഴത്തെ നിയമം ഉറപ്പാക്കണം.',
 'Best options are in Tamil Nadu or Karnataka':'തമിഴ്‌നാട്ടിലോ കർണാടകയിലോ ഉള്ള ഓപ്ഷനുകളും നോക്കാം.',
 'Best options are in other states':'മറ്റ് സംസ്ഥാനങ്ങളിലെ ഓപ്ഷനുകളും നോക്കാം.'};return `<div class="fit">${fitLines(r,u).map(l=>`<div class="${l.t}"><span aria-hidden="true">${l.t==='good'?'✓':l.t==='bad'?'×':'!'}</span> ${esc(t(l.x.replace(/\bPlus 2\b/g,'+2'),translated[l.x]||l.x.replace(/\bPlus 2\b/g,'+2')))}</div>`).join('')}</div>`;}
 function selectedResults(){const selected=(state.answers[12]||[]).map(id=>ADMISSIONS.courses.find(c=>c.id===id)).filter(Boolean);if(!selected.length&&!state.other.trim())return '';const {u,all}=scoreAll(state.answers);return `<div class="sec-title">${t('Your Picks · Entry & AI Overview','തിരഞ്ഞെടുത്ത കോഴ്‌സുകൾ · പ്രവേശനവും AI വിവരങ്ങളും')}</div><p class="small-note fit-disclaimer">${t('Preview checks use earlier admission rules and fee bands. Confirm current requirements with the college.','പഴയ പ്രവേശന നിയമങ്ങളും ഫീസ് കണക്കുകളും ഉപയോഗിച്ചുള്ള പ്രിവ്യൂ പരിശോധനയാണ്. ഇപ്പോഴത്തെ വിവരങ്ങൾ കോളേജിനോട് ഉറപ്പാക്കണം.')}</p>${selected.map(course=>{const id=Object.keys(resultLinks).find(id=>resultLinks[id].includes(course.name)),c=COURSES.find(c=>c.id===id),r=c?scoreCourse(c,u):null;if(!r)return `<article class="pick"><h2 class="course-name">${esc(course.name)}</h2><div class="info-box info-note">${t('We haven’t verified the fit rules for this course yet. A counsellor can check its subjects, fees and entry route with you.','ഈ കോഴ്‌സിന്റെ യോഗ്യതാ നിയമങ്ങൾ ഇനിയും പരിശോധിച്ചിട്ടില്ല. വേണ്ട വിഷയങ്ങൾ, ഫീസ്, പ്രവേശന വഴി എന്നിവ കൗൺസലറുമായി നോക്കാം.')}</div></article>`;const safer=(!r.hard||r.soft.length||r.flags.marks1)?backupsFor(r,all.filter(x=>resultLinks[x.c.id]||backupNames[x.c.id]),new Set(),3):[];return `<article class="pick"><h2 class="course-name">${esc(course.name)}</h2><p class="course-yrs">${t('You selected:','നിങ്ങൾ തിരഞ്ഞെടുത്തത്:')} ${esc(course.name)}</p>${fitCheck(r,u)}${riskBlock(c)}${safer.length?`<div class="bk"><div class="bk-t">${t('Safer Options in the Same Area','ഇതേ മേഖലയിലെ മറ്റ് വഴികൾ')}</div>${safer.map(b=>`<div class="bk-i"><b>${reportCourseName(b.c)}</b> <button type="button" class="more-guidance" data-guidance="${esc(b.c.id)}" aria-haspopup="dialog">${t('More Details →','കൂടുതൽ വിവരങ്ങൾ →')}</button></div>`).join('')}</div>`:''}</article>`;}).join('')}${state.other.trim()?`<div class="info-box info-note">${t('Also on your mind:','നിങ്ങളുടെ മനസ്സിലുള്ള മറ്റൊരു കോഴ്‌സ്:')} ${esc(state.other.trim())}. ${t('A counsellor can check this with you.','കൗൺസലറുമായി ഇത് പരിശോധിക്കാം.')}</div>`:''}`;}
 function worryMessage(){const messages={fees:[ 'Let’s explore affordable routes and compare the full cost before you decide.','തീരുമാനിക്കുന്നതിന് മുമ്പ് ബജറ്റിൽ ഒതുങ്ങുന്ന വഴികളും മുഴുവൻ ചെലവും നോക്കാം.'],jobs:['Look beyond the course name: ask about practical skills, internships and placement support.','കോഴ്‌സിന്റെ പേരിനൊപ്പം പ്രാക്ടിക്കൽ പഠനം, ഇന്റേൺഷിപ്പ്, പ്ലേസ്‌മെന്റ് സഹായം എന്നിവയും നോക്കാം.'],parents:['A conversation with your family and a counsellor can help everyone understand your interests.','വീട്ടുകാരുമായും കൗൺസലറുമായും സംസാരിക്കുന്നത് നിങ്ങളുടെ ഇഷ്ടങ്ങൾ വ്യക്തമാക്കാൻ സഹായിക്കും.'],wrong_choice:['You have options. Explore these courses and their alternatives with a counsellor before you decide.','നിങ്ങൾക്ക് വഴികളുണ്ട്. തീരുമാനിക്കുന്നതിന് മുമ്പ് ഈ കോഴ്‌സുകളും മറ്റു ഓപ്ഷനുകളും കൗൺസലറുമായി നോക്കാം.']};const m=messages[state.answers[13]];return m?`<div class="info-box info-green">💬 ${t(...m)}</div>`:'';}
 function socialIcon(app){const path=app==='instagram'?'M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5a4.25 4.25 0 004.25 4.25h8.5a4.25 4.25 0 004.25-4.25v-8.5a4.25 4.25 0 00-4.25-4.25h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM18 7a1 1 0 110-2 1 1 0 010 2z':'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z';return `<span class="icon" aria-hidden="true"><svg class="social-brand-symbol" viewBox="0 0 24 24"><path d="${path}"/></svg></span>`;}
 function footer(){return `
  <div class="footer-brand"><img src="assets/nextpath-logo.png" width="112" alt="NextPath EduCare"><span>Your Next Chapter Starts Here</span></div>
  <div class="footer-contact"><button id="privacy" type="button">Privacy Policy</button><span aria-hidden="true">|</span><a href="tel:+918590361125">For Any Queries<strong>+91 85903 61125</strong></a></div>
  <nav class="social-links" aria-label="NextPath social accounts">
   <a href="https://www.instagram.com/nextpath.thalassery/" target="_blank" rel="noopener noreferrer" aria-label="Instagram · NextPath Thalassery">${socialIcon('instagram','thalassery')}<span>Thalassery</span></a>
   <a href="https://www.linkedin.com/company/nextpath-educare/" target="_blank" rel="noopener noreferrer" aria-label="NextPath on LinkedIn">${socialIcon('linkedin')}<span>LinkedIn</span></a>
   <a href="https://www.instagram.com/nextpath.calicut/" target="_blank" rel="noopener noreferrer" aria-label="Instagram · NextPath Calicut">${socialIcon('instagram','calicut')}<span>Calicut</span></a>
  </nav>
  <p class="footer-copyright">© 2026 NextPath EduCare. All Rights Reserved.</p>`;}
 function privacyPolicy(){return `
  <h2 id="dialog-title">Privacy Policy</h2>
  <p>NextPath Career Compass</p>
  <h3>What You Enter</h3>
  <p>The course finder asks about your interests, education and plans to suggest courses. The results form asks for your name, Indian mobile number and district or state and city.</p>
  <h3>How Your Details Are Handled</h3>
  ${collect?`<p>When you tap See Results, NextPath EduCare saves your name, mobile number, location, assessment answers and suggested courses in its restricted Google Sheet. The team uses them to provide course guidance and may contact you about your results.</p><p>Contact us below to request a correction or deletion of a saved submission.</p>`:`<p>Your answers and contact details stay in this browser tab. Refreshing or closing the tab clears them.</p>`}
  <p>The course finder uses no analytics, cookies or browser storage. The hosting service may log routine page requests.</p>
  <h3>Your Choices</h3>
  <p>You can review your answers or start a new assessment. The mobile number check only checks the format.${collect?' Edits made while reviewing results affect your current tab only.':''}</p>
  <h3>External Links</h3>
  <p>WhatsApp, Instagram, LinkedIn and the AI risk report open external sites. Those sites receive normal browser connection information and follow their own privacy policies. The WhatsApp link opens a draft with your name, location and submission reference. You can review or edit the draft before sending.</p>
  <h3>Privacy Questions</h3>
  <p>NextPath EduCare · <a href="tel:+918590361125">+91 85903 61125</a></p>
  ${primary('Got It','close')}`;}
 function render(focus=true,reverse=false,journey=false){
  const onHome=state.phase==='intro';
  main.classList.toggle('travel-back',reverse);
  main.classList.toggle('journey-arriving',journey);
  document.documentElement.lang=onHome?'en':state.lang;
  const bannerTools=document.querySelector('.banner-tools');
  bannerTools.hidden=onHome;
  bannerTools.classList.remove('language-leaving');
  document.querySelector('#language').innerHTML=icon('globe')+'<span>'+t('മലയാളം','English')+'</span>';document.querySelector('#language').lang=t('ml','en');document.querySelector('#language').setAttribute('aria-label',t('Switch to Malayalam','Switch to English'));
  document.querySelector('#banner-progress').hidden=state.phase==='intro';document.querySelector('#banner-progress').innerHTML=progress();document.querySelector('.journey-position').style.left=completedSteps()/15*100+'%';document.querySelector('#banner-subtitle').textContent=t('Find the right course after +2 in 3 minutes','+2 കഴിഞ്ഞ് ചേരുന്ന കോഴ്‌സ് 3 മിനിറ്റിൽ കണ്ടെത്താം');
  main.innerHTML=state.phase==='intro'?intro():`<div class="workspace"><div class="flow"><section class="stage">${state.phase==='quiz'?question():state.phase==='contact'?contact():results()}<div class="navigation-end" aria-hidden="true"></div></section></div>`;
  renderNavigation();
  document.dispatchEvent(new Event('compass:render'));
  if(focus){window.scrollTo({top:0,behavior:'instant'});main.querySelector('h1')?.focus({preventScroll:true});}
 }
 function move(change,{reverse=false,home=false,hold=220}={}){
  if(state.busy)return;
  const journey=home||state.phase==='intro';
  const finish=()=>{
   if(journey)document.dispatchEvent(new CustomEvent('compass:journey',{detail:{reverse}}));
   change();state.busy=false;timer=null;render(true,reverse,journey);
  };
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
  state.busy=true;
  const target=main.querySelector('.stage,.welcome');
  if(home)document.querySelector('.banner-tools').classList.add('language-leaving');
  timer=setTimeout(()=>{
   target?.classList.add('outgoing');
   if(reverse)target?.classList.add('outgoing-reverse');
   if(journey)target?.classList.add('outgoing-journey');
   timer=setTimeout(finish,journey?280:160);
  },journey?150:hold);
 }
 function cancelMove(){clearTimeout(timer);timer=null;state.busy=false;document.querySelector('.banner-tools').classList.remove('language-leaving');}
 function showResults(){
  state.phone=C.normalizePhone(state.phone)||'';
  state.phase='result';
  render();
 }
 async function saveContact(){
  const pending=submission;
  if(!pending||pending.status!=='ready'&&pending.status!=='failed')return;
  pending.status='pending';
  const status=document.querySelector('#submission-status');
  if(status)status.hidden=true;
  try{
   pending.refId=await CompassSubmission.save(pending.payload);
   if(submission===pending&&pending.payload.referenceFormat==='nextpath'){
    document.querySelectorAll('.wa-btn,.guidance-float .guidance-link,.guidance-mini').forEach(link=>{link.href=whatsappUrl();});
   }
   pending.status='saved';
  }catch{
   pending.status='failed';
   if(submission===pending){
    const status=document.querySelector('#submission-status');
    if(status)status.hidden=false;
   }
  }
 }
 function prepareSubmission(){
  const recommendations=directionGroups().map(group=>group.courses.map(course=>course.name).join(' / '));
  const payload=CompassSubmission.create(state,recommendations);
  const {refId,...fields}=payload;
  const fingerprint=JSON.stringify(fields);
  if(submission?.fingerprint!==fingerprint)submission={fingerprint,payload,status:'ready'};
 }
 function next(){if(state.busy)return;if(state.phase==='contact'){let error='',id='';if(!C.validName(state.name)){error=t('Please enter a name using letters, spaces, apostrophes or hyphens (2–80 characters).','അക്ഷരങ്ങൾ ഉപയോഗിച്ച് പേര് എഴുതൂ (2–80 അക്ഷരങ്ങൾ).');id='name';}else if(!C.normalizePhone(state.phone)){error=t('Enter a valid Indian mobile format: 10 digits starting with 6, 7, 8 or 9.','6, 7, 8 അല്ലെങ്കിൽ 9-ൽ തുടങ്ങുന്ന 10 അക്ക ഇന്ത്യൻ മൊബൈൽ നമ്പർ എഴുതൂ.');id='phone';}else if(!validLocation()){error=t('Enter both your state and town/city, or choose a Kerala district.','സംസ്ഥാനവും പട്ടണവും എഴുതൂ, അല്ലെങ്കിൽ കേരളത്തിലെ ജില്ല തിരഞ്ഞെടുക്കൂ.');id=!C.validPlace(state.stateName)?'stateName':'place';}if(error){document.querySelector('#error').textContent=error;const input=document.getElementById(id);input?.setAttribute('aria-invalid','true');input?.setAttribute('aria-describedby','error');input?.focus();return;}
   if(collect)prepareSubmission();
   showResults();
   if(collect)void saveContact();
   return;}
  if(state.phase==='quiz'){if(questions[state.q].type==='options'&&!state.answers[state.q])return;state.completed.add(state.q);move(()=>{if(state.q<questions.length-1)state.q++;else if(state.reviewing)endReview();else{state.phase='contact';state.contact=0;}});}}
 function endReview(){state.reviewing=false;state.phase='result';}
 function back(){
  if(state.busy)return;
  const home=state.phase==='quiz'&&state.q===0&&!state.reviewing;
  cancelMove();
  move(()=>{
   if(home)state.phase='intro';
   else if(state.phase==='result'){state.phase='contact';state.contact=2;}
   else if(state.phase==='contact'){state.phase='quiz';state.q=13;}
   else if(state.phase==='quiz'){if(state.q)state.q--;else endReview();}
  },{reverse:true,home,hold:home?220:0});
 }
 function guidanceDialog(id){const course=COURSES.find(c=>c.id===id);showDialog(`<div class="personal-guidance"><img class="guidance-app-mark" src="assets/whatsapp-mark.png" width="34" height="34" alt="WhatsApp"><h2 id="dialog-title">${t('A Little More Guidance','കുറച്ചുകൂടി സഹായം വേണോ?')}</h2>${course?`<p class="guidance-course">${reportCourseName(course)}</p>`:''}<p>${t('For more personalised guidance, talk to our experienced team.','നിങ്ങൾക്ക് ചേരുന്ന വഴി കണ്ടെത്താൻ ഞങ്ങളുടെ പരിചയസമ്പന്നരായ ടീമിനോട് സംസാരിക്കാം.')}</p><a class="guidance-link guidance-mini" href="${esc(whatsappUrl())}" target="_blank" rel="noopener noreferrer"><span class="guidance-sheen" aria-hidden="true"></span><span class="guidance-label">${t('Chat on WhatsApp','WhatsApp-ൽ സംസാരിക്കാം')}</span><span class="guidance-arrow" aria-hidden="true">→</span></a></div>`);}
 function showDialog(body,picker=false,language=document.documentElement.lang){dialog.lang=language;if(!dialog.open)lastTrigger=document.activeElement;dialog.classList.toggle('course-picker',picker);dialog.innerHTML=`<div class="dialog-toolbar"><button type="button" class="dialog-close" data-action="close" aria-label="${language==='en'?'Close':'അടയ്ക്കുക'}">×</button></div><div class="dialog-body">${body}</div>${picker?`<div class="picker-scrollbar" aria-hidden="true"><span></span></div><div class="picker-footer" ${(state.answers[12]||[]).some(id=>ADMISSIONS.courses.find(c=>c.id===id)?.group===modalGroup)?'':'hidden'}>${primary(t('Done','തിരഞ്ഞെടുത്തു'),'close')}</div>`:''}`;if(!dialog.open)dialog.showModal();if(picker){dialog.querySelector('.dialog-body').addEventListener('scroll',updatePickerScroll,{passive:true});requestAnimationFrame(updatePickerScroll);}}
 function updatePickerScroll(){const body=dialog.querySelector('.dialog-body'),rail=dialog.querySelector('.picker-scrollbar');if(!body||!rail)return;const footer=dialog.querySelector('.picker-footer'),height=Math.max(8,body.clientHeight/body.scrollHeight*100);rail.hidden=body.scrollHeight<=body.clientHeight;rail.style.top=dialog.querySelector('.dialog-toolbar').offsetHeight+8+'px';rail.style.bottom=(footer&&!footer.hidden?footer.offsetHeight:0)+8+'px';const thumb=rail.firstElementChild;thumb.style.height=height+'%';thumb.style.top=(100-height)*body.scrollTop/Math.max(1,body.scrollHeight-body.clientHeight)+'%';}
 window.addEventListener('resize',updatePickerScroll);
 function closeDialog(afterClose){
  if(!dialog.open||dialog.classList.contains('is-closing'))return;
  let fallback;
  function finish(event){
   if(event&&(event.target!==dialog||event.animationName!=='dialog-leave'||event.pseudoElement))return;
   clearTimeout(fallback);
   dialog.removeEventListener('animationend',finish);
   dialog.close();
   dialog.classList.remove('is-closing');
   if(afterClose){afterClose();return;}
   if(modalGroup){const id=modalGroup;modalGroup=null;refreshCourseSelection(id,groupOpenedWithKeyboard);}
   else lastTrigger?.focus({preventScroll:true});
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
  dialog.addEventListener('animationend',finish);
  dialog.classList.add('is-closing');
  fallback=setTimeout(finish,330);
 }
 document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b)return;
  if(dialog.classList.contains('is-closing'))return;
  if(b.id==='language'){if(state.phase==='intro')return;cancelMove();const open=modalGroup;if(dialog.open)dialog.close();state.lang=state.lang==='en'?'ml':'en';render(false);if(open)openGroup(open);return;}
  if(b.id==='privacy'){showDialog(privacyPolicy(),false,'en');return;}if(b.dataset.guidance){guidanceDialog(b.dataset.guidance);return;}
  if(b.dataset.action==='back'){back();return;}if(b.dataset.action==='close'){closeDialog();return;}if(state.busy)return;
  if(b.dataset.answer!==undefined){const q=questions[state.q],o=q.opts[Number(b.dataset.answer)];if(!o)return;state.answers[state.q]=o.v;state.completed.add(state.q);main.querySelectorAll('[data-answer]').forEach(el=>{const selected=el===b;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));el.querySelector('.mark').textContent=selected?'✓':'↗';});next();return;}
  if(b.dataset.group){const courses=ADMISSIONS.courses.filter(c=>c.group===b.dataset.group);if(courses.length===1){const id=courses[0].id,a=state.answers[12]||[];state.answers[12]=a.includes(id)?a.filter(x=>x!==id):[...a,id];refreshCourseSelection(b.dataset.group,event.detail===0);}else{groupOpenedWithKeyboard=event.detail===0;openGroup(b.dataset.group);}return;}
  if(b.dataset.course){const id=b.dataset.course,a=state.answers[12]||[];state.answers[12]=a.includes(id)?a.filter(x=>x!==id):[...a,id];const selected=state.answers[12].includes(id);b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));b.querySelector('.mark').textContent=selected?'✓':'+';const footer=dialog.querySelector('.picker-footer');if(footer)footer.hidden=!(state.answers[12]||[]).some(id=>ADMISSIONS.courses.find(c=>c.id===id)?.group===modalGroup);updatePickerScroll();return;}
  if(b.dataset.remove){state.answers[12]=(state.answers[12]||[]).filter(id=>id!==b.dataset.remove);refreshCourseSelection(ADMISSIONS.courses.find(course=>course.id===b.dataset.remove)?.group);document.querySelector('#chosen')?.previousElementSibling?.querySelector('input')?.focus();return;}
  if(b.dataset.region){
   const input=document.activeElement;
   if(input?.matches('#contact-form input'))input.blur();
   if(state.region!==b.dataset.region){
    state.region=b.dataset.region;
    document.querySelector('#contact-location-fields').innerHTML=contactLocationFields();
    main.querySelectorAll('[data-region]').forEach(button=>{
     button.setAttribute('aria-pressed',String(button===b));
    });
   }
   b.focus({preventScroll:true});
   updateContact();
   positionContactActions();
   return;
  }
  if(b.dataset.district){state.district=b.dataset.district;main.querySelectorAll('[data-district]').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));el.querySelector('.mark').textContent=el===b?'✓':'↗';});updateContact();return;}
  switch(b.dataset.action){case 'start':move(()=>{state.phase='quiz';state.q=0;});break;case 'next':next();break;case 'scroll-to-continue':{
   const nextButton=main.querySelector('[data-action="next"]');
   nextButton.focus({preventScroll:true});
   nextButton.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   break;
  }case 'retry-save':void saveContact();break;case 'review':if(state.phase==='result')move(()=>{state.reviewing=true;state.phase='quiz';state.q=0;},{hold:0});break;case 'return-results':if(state.reviewing)move(endReview,{reverse:true,hold:0});break;case 'restart':showDialog(`<h2 id="dialog-title">${t('Start fresh?','വീണ്ടും തുടങ്ങണോ?')}</h2><p>${t('This clears your answers and details from this tab.','ഈ ടാബിലെ നിങ്ങളുടെ മറുപടികളും വിവരങ്ങളും മായും.')}</p>${primary(t('Clear and start again','മായ്ച്ച് വീണ്ടും തുടങ്ങാം'),'confirm-restart')}`);break;case 'confirm-restart':closeDialog(()=>move(()=>{submission=null;Object.assign(state,{phase:'intro',reviewing:false,q:0,contact:0,answers:{},completed:new Set(),name:'',phone:'',region:'kerala',district:'',place:'',stateName:'',other:''});},{reverse:true,home:true,hold:0}));break;}
 });
 document.addEventListener('input',e=>{if(e.target.dataset.field){state[e.target.dataset.field]=e.target.value;e.target.removeAttribute('aria-invalid');const error=document.querySelector('#error');if(error)error.textContent='';updateContact();}if(e.target.id==='district-search')document.querySelector('#districts').innerHTML=districtButtons(e.target.value);});
 document.addEventListener('submit',e=>{if(e.target.id==='contact-form'){e.preventDefault();next();}});
 document.addEventListener('keydown',event=>{
  const input=event.target;
  if(event.key!=='Enter'||event.isComposing||state.phase!=='contact'||!input.matches('#contact-form input'))return;
  event.preventDefault();
  if(input.id==='name'&&C.validName(state.name)){
   document.querySelector('#phone').focus();
  }else if(input.id==='stateName'&&C.validPlace(state.stateName)){
   document.querySelector('#place').focus();
  }else{
   input.blur();
   positionContactActions();
   if(input.id!=='phone'&&C.validName(state.name)&&C.normalizePhone(state.phone)&&validLocation())next();
  }
 });
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
 document.querySelector('.site-footer').innerHTML=footer();
 if('scrollRestoration' in history)history.scrollRestoration='manual';
 render(false);
 window.scrollTo({top:0,behavior:'instant'});
 window.addEventListener('pageshow',event=>{
  if(!event.persisted&&state.phase==='intro')window.scrollTo({top:0,behavior:'instant'});
 });
})();
