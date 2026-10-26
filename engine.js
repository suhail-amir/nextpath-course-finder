// NextPath Career Compass: scoring engine (version 1).
// Loaded by career-compass.html and admin/test-lab.html. Needs data.js and match.js loaded first.
// To change HOW courses are recommended, edit this file only. Run admin/test-lab.html afterwards.
//
// Answer positions used by profile() (ans[n] is the student's answer to question n+1 after the details form):
//  0 free-time style, 1 group role, 2 work setting, 3 favourite subject, 4 success vision,
//  5 stream, 6 stream feeling, 7 marks, 8 budget, 9 location, 10 entrance exam, 11 course status, 12 courses in mind (list), 13 biggest worry.
// If you add, remove or reorder questions in career-compass.html, update profile() and saveData() to match.
//
// NextPath admission settings. NP_BONUS adds points to courses marked na:1 in data.js (0 = neutral ranking).
// NP_ONLY=true shows only courses NextPath handles admission for.
const NP_BONUS=1.5,NP_ONLY=false;
const MAPS={p:{analytical:"a",social:"s",creative:"c",organized:"o"},e:{medical:"m",tech:"t",business:"b",creative:"c"},sj:{science:"s",math:"m",humanities:"h",commerce:"c"},v:{financial:"f",impact:"i",freedom:"r",achievement:"a"}};
const MARKS={high:4,medium:3,low:2,very_low:1},BUD={budget_low:1,budget_mid:2,budget_high:3,budget_premium:4};
const PL={a:"analytical",s:"people-oriented",c:"creative",o:"organised"},EL={m:"healthcare",t:"technology",b:"business",c:"creative work"},VL={f:"financial stability",i:"meaningful work",r:"freedom and flexibility",a:"building status in your field"};
function profile(ans){return{p0:MAPS.p[ans[0]],p1:MAPS.p[ans[1]],env:MAPS.e[ans[2]],sj:MAPS.sj[ans[3]],vis:MAPS.v[ans[4]],st:ans[5],comfort:ans[6],mk:MARKS[ans[7]]||2,bud:BUD[ans[8]]||2,loc:ans[9],ex:ans[10]==="none"?"":ans[10],worry:ans[13]};}
function scoreCourse(c,u){const m=MATCH[c.id];if(!m||m.skip)return null;if(NP_ONLY&&!c.na)return null;
 const r={c:c,m:m,hard:true,soft:[],s:0,why:[],flags:{},parts:[]};
 const add=(label,pts)=>{r.s+=pts;r.parts.push([label,pts]);};
 if(!m.st.includes(u.st)){r.hard=false;r.flags.stream=true;}
 if(m.ex==="N"&&u.ex!=="N"){r.hard=false;r.flags.neet=true;}
 if(m.p.includes(u.p0)||m.p.includes(u.p1)){const a=(m.p.includes(u.p0)?3:0),b=(m.p.includes(u.p1)?3:0);add("personality match",a+b);r.why.push("Fits your "+PL[m.p.includes(u.p0)?u.p0:u.p1]+" side");}
 if(m.e.includes(u.env)){add("work setting match",3);r.why.push("Matches the work setting you picked ("+EL[u.env]+")");}
 if(m.sj.includes(u.sj)){add("subject match",2);r.why.push("Builds on a subject you enjoy");}
 if(m.v.includes(u.vis)){add("vision match",2);r.why.push("Supports your goal of "+VL[u.vis]);}
 if((u.comfort==="stream_love"||u.comfort==="stream_mixed")&&m.st.length<5&&m.st.includes(u.st))add("stream bonus (student likes the stream)",2);
 const gap=m.m-u.mk;r.gap=gap;
 if(gap===1){add("marks one band short",-4);r.flags.marks1=true;}else if(gap>=2){add("marks two or more bands short",-8);r.soft.push("marks");r.flags.marks2=true;}
 if(u.bud<m.b[0]){r.soft.push("budget");r.flags.budgetLow=true;add("budget below cheapest route",-6);}else if(u.bud<m.b[1]){add("budget below typical route",-1.5);r.flags.govtOnly=true;}
 if(u.mk===4&&m.m===4)add("top marks for a top course",1.5);
 add("job demand rating",(m.dm-3));
 if(m.ex==="E"){if(u.ex==="E")add("KEAM/JEE planned",1);else if(u.loc==="abroad")add("abroad, KEAM/JEE not needed",0);else add("no KEAM/JEE planned",u.bud>=3?-1.5:-3);}
 if(m.ex==="O"){if(u.ex==="O")add("entrance exam planned",1);else if(u.loc==="abroad")add("abroad, entrance not needed",0);else add("entrance exam not planned",-2);}
 if(m.ex==="n"){if(u.ex==="N")add("NEET planned",1);else add("NEET not planned",-2);}
 if(u.loc==="kerala"){if(m.loc==="S")add("best options outside Kerala (south)",-2);if(m.loc==="I")add("best options in other states",-3);}else if(u.loc==="south"&&m.loc==="I")add("best options in other states",-2);
 add("AI risk (with skills)",-(c.a[1]/(u.worry==="jobs"?12:22)));
 if(c.na)add("NextPath admission bonus",NP_BONUS);
 return r;}
function scoreAll(ans){const u=profile(ans);const all=COURSES.map(c=>scoreCourse(c,u)).filter(Boolean);return{u:u,all:all};}
function pickTop(all,n){let ok=all.filter(r=>r.hard&&!r.soft.length).sort((a,b)=>b.s-a.s);
 if(ok.length<n)ok=ok.concat(all.filter(r=>r.hard&&r.soft.length).sort((a,b)=>b.s-a.s));
 const out=[],cnt={};for(const r of ok){if(out.length>=n)break;const g=r.c.d+"|"+r.c.s;if((cnt[g]||0)>=1)continue;cnt[g]=1;out.push(r);}
 for(const r of ok){if(out.length>=n)break;if(!out.includes(r))out.push(r);}
 return out;}
function backupsFor(r,all,used,n){const grp=(r.hard?r.m.g:(r.m.g==='eng'?'tech':r.m.g));const cand=all.filter(x=>x.hard&&!x.soft.length&&x.m.g===grp&&x.c.id!==r.c.id&&!used.has(x.c.id)&&x.s>=4&&x.s>=r.s-9);
 const easier=x=>(x.m.m<r.m.m)||(x.m.b[1]<r.m.b[1])||(x.m.b[0]<r.m.b[0]);
 cand.sort((a,b)=>((easier(b)?3:0)+b.s)-((easier(a)?3:0)+a.s));
 const out=cand.slice(0,n);out.forEach(x=>used.add(x.c.id));return out;}
function fitLines(r,u){const L=[],f=r.flags,m=r.m;
 if(f.stream)L.push({t:"bad",x:"Your Plus 2 stream does not qualify for this course"});
 if(f.neet)L.push({t:"bad",x:"Needs NEET. You said you are not planning to write it"});
 if(f.budgetLow)L.push({t:"bad",x:"Your budget is below even the cheapest (government) route"});
 else if(f.govtOnly)L.push({t:"warn",x:"Affordable mainly through a government or aided seat"});
 else L.push({t:"good",x:"Fits your budget"});
 if(f.marks2)L.push({t:"bad",x:"Very competitive for your marks band"});
 else if(f.marks1)L.push({t:"warn",x:"Competitive for your marks. Needs a strong entrance rank or a good college choice"});
 else L.push({t:"good",x:"Realistic for your marks"});
 if(m.m===4&&r.hard)L.push({t:"warn",x:"Admission is rank-based. Even high marks do not guarantee a seat, so keep backups ready"});
 if(m.ex==="E"&&u.ex!=="E")L.push({t:"warn",x:"Government seats need KEAM or JEE. Private management seats may be possible"});
 if(m.ex==="O"&&u.ex!=="O")L.push({t:"warn",x:"Best colleges need an entrance exam (CLAT, NATA, UCEED, NIFT or CUET)"});
 if(m.ex==="n"&&u.ex!=="N")L.push({t:"warn",x:"NEET is usually used for admission. Check the current rule"});
 if(m.loc==="S"&&u.loc==="kerala")L.push({t:"warn",x:"Best options are in Tamil Nadu or Karnataka"});
 if(m.loc==="I"&&u.loc!=="india"&&u.loc!=="abroad")L.push({t:"warn",x:"Best options are in other states"});
 return L;}
