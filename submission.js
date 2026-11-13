'use strict';
const CompassSubmission = (() => {
 const endpoint = document.querySelector('meta[name="compass-submissions"]')?.content;
 const answerColumns = ['q1','q2','q3','q4','q5','stream','streamComfort','marks','budget','locationPref','entrance','courseStatus',null,'worry'];

 function create(state, recommendations) {
  const fields = {
   refId: crypto.randomUUID(),
   name: state.name.trim(),
   phone: '+91' + CompassCore.normalizePhone(state.phone),
   location: state.region === 'kerala' ? state.district + ', Kerala' : state.place.trim() + ', ' + state.stateName.trim(),
   language: state.lang,
   consent: 'guidance-v1',
   coursesInMind: (state.answers[12] || []).map(id => ADMISSIONS.courses.find(course => course.id === id)?.name).filter(Boolean).join(' | '),
   otherCourse: state.other.trim(),
   result1: recommendations[0] || '',
   result2: recommendations[1] || '',
   result3: recommendations[2] || '',
   quizVersion: '5.0',
   reportVersion: REPORT.version
  };
  answerColumns.forEach((key, i) => {
   if (!key) return;
   const option = questions[i].opts.findIndex(answer => answer.v === state.answers[i]);
   fields[key] = EN_QUESTIONS[i][2][option] || '';
  });
  return fields;
 }

 async function save(fields) {
  const response = await fetch(endpoint, {
   method: 'POST',
   credentials: 'omit',
   headers: {'Content-Type': 'text/plain;charset=UTF-8'},
   body: JSON.stringify(fields),
   signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error('Save failed');
  const receipt = await response.json();
  if (receipt.status !== 'ok' || receipt.refId !== fields.refId) throw new Error('Save unconfirmed');
 }
 return {enabled: Boolean(endpoint), create, save};
})();
