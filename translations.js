'use strict';
// Conversational display copy. Preserve question meaning and answer order; do not translate word-for-word.
// Both languages still need student/counsellor review before release.
const EN_QUESTIONS = [
 ['What do you enjoy in your free time?','Pick what feels most like you.', ['Experiments, puzzles or figuring out how things work','Talking to people or helping them','Art, writing or design','Planning and organising things']],
 ['What do you usually do in a group project?','Think about what you actually do.', ['Come up with new ideas','Research and look at the facts','Present ideas and bring people together','Keep things on track and finish the work']],
 ['Where would you like to work?','Picture yourself ten years from now.', ['A hospital or clinic, caring for patients','A tech company, building things on a computer','An office, leading a team or running a business','A creative space, working on media, design or content']],
 ['Which subjects did you enjoy?','Think about interest, not marks.', ['Science: Biology, Physics or Chemistry','Maths and logical thinking','Languages, History or Social Science','Commerce, Economics or Accounts']],
 ['What would success look like at 30?','Choose what matters to you.', ['A good salary and financial security','Meaningful work that helps people','Freedom to travel and work from anywhere','Recognition in my field and building something big']],
 ['What did you study in +2?','Choose your subject combination.', ['Science: Biology, without Maths (PCB)','Science: Biology and Maths (PCMB)','Science: Maths, without Biology (PCM)','Commerce','Humanities / Arts']],
 ['How did you feel about your stream?','It’s okay if it wasn’t your first choice.', ['I enjoyed it and want to work in this field','I took it because of circumstances, not by choice','I liked some parts, but not all','I’m not sure what I want; I’m open to other fields']],
 ['Roughly what was your +2 percentage?','Choose the closest option.', ['Above 85%','70% to 85%','55% to 70%','Below 55% or still appearing']],
 ['What’s your yearly study budget?','Include hostel costs if you’ll need one.', ['Under ₹50,000','₹50,000 to ₹2 lakh','₹2 lakh to ₹5 lakh','Above ₹5 lakh']],
 ['Where are you open to studying?','Choose what works for you.', ['Only Kerala','Kerala, Karnataka or Tamil Nadu','Anywhere in India','I’m also open to studying abroad']],
 ['Which entrance exam are you planning?','Pick your main exam, or “None”.', ['NEET (medical)','KEAM or JEE (engineering)','CLAT, NATA, UCEED, NIFT, CUET or similar','None']],
 ['Do you have a course in mind?','You don’t need to have it all figured out.', ['Yes, I have a specific course in mind','I’m deciding between two or three options','No idea yet','My parents and I want different things']],
 ['Which courses are you thinking about?','Open a group to choose. You can pick several or skip.', []],
 ['What worries you most about choosing?','Choose your biggest concern.', ['Fees and the cost to my family','Finding a job after the course','Whether my parents will agree','Choosing the wrong course and regretting it']]
];
const ML_QUESTIONS = [
 ['ഫ്രീ ടൈമിൽ എന്ത് ചെയ്യാനാണ് കൂടുതൽ ഇഷ്ടം?','നിങ്ങൾക്ക് ഏറ്റവും ചേരുന്നത് തിരഞ്ഞെടുക്കൂ.', ['പരീക്ഷണങ്ങൾ, പസിലുകൾ, കാര്യങ്ങൾ എങ്ങനെ നടക്കുന്നു എന്ന് കണ്ടെത്തൽ','ആളുകളോട് സംസാരിക്കാനും സഹായിക്കാനും','വരയ്ക്കാനും എഴുതാനും ഡിസൈൻ ചെയ്യാനും','കാര്യങ്ങൾ പ്ലാൻ ചെയ്യാനും ക്രമപ്പെടുത്തി നടത്താനും']],
 ['ഗ്രൂപ്പ് പ്രോജക്ടിൽ സാധാരണ നിങ്ങൾ എന്താണ് ചെയ്യാറ്?','നിങ്ങൾ ചെയ്യാറുള്ളത് തന്നെ പറയൂ.', ['പുതിയ ഐഡിയകൾ പറയും','വിവരങ്ങൾ അന്വേഷിച്ച് പഠിക്കും','കാര്യങ്ങൾ അവതരിപ്പിക്കും, എല്ലാവരെയും ഒന്നിച്ച് കൊണ്ടുപോകും','ജോലി സമയത്ത് തീരുന്നുണ്ടെന്ന് നോക്കും']],
 ['എവിടെ ജോലി ചെയ്യാനാണ് കൂടുതൽ ഇഷ്ടം?','പത്ത് വർഷം കഴിഞ്ഞുള്ള നിങ്ങളെ ഒന്ന് ചിന്തിച്ചുനോക്കൂ.', ['ഹോസ്പിറ്റലിൽ രോഗികളെ നോക്കാനും സഹായിക്കാനും','ടെക് കമ്പനിയിൽ കമ്പ്യൂട്ടർ ഉപയോഗിച്ച് പുതിയ കാര്യങ്ങൾ ഉണ്ടാക്കാനും','ഓഫീസിൽ ഒരു ടീമിനെ നയിക്കാനോ ബിസിനസ് നടത്താനോ','മീഡിയ, ഡിസൈൻ, കണ്ടന്റ് പോലുള്ള ക്രിയേറ്റീവ് ജോലികൾ ചെയ്യാനും']],
 ['ഏത് വിഷയമാണ് പഠിക്കാൻ ഇഷ്ടമായിരുന്നത്?','മാർക്കല്ല, ഇഷ്ടമാണ് നോക്കേണ്ടത്.', ['സയൻസ്: ബയോളജി, ഫിസിക്സ്, കെമിസ്ട്രി','മാത്‌സും ലോജിക്കും','ഭാഷകൾ, ഹിസ്റ്ററി, സോഷ്യൽ സയൻസ്','കൊമേഴ്‌സ്, ഇക്കണോമിക്സ്, അക്കൗണ്ട്‌സ്']],
 ['30 വയസ്സാകുമ്പോൾ ജീവിതം എങ്ങനെയാകണമെന്നാണ് ആഗ്രഹം?','നിങ്ങൾക്ക് പ്രധാനപ്പെട്ടത് തിരഞ്ഞെടുക്കൂ.', ['നല്ല ശമ്പളം, പണത്തെക്കുറിച്ച് ടെൻഷനില്ലാത്ത ജീവിതം','മറ്റുള്ളവർക്ക് സഹായമാകുന്ന, സന്തോഷം തരുന്ന ജോലി','യാത്ര ചെയ്യാനും എവിടെനിന്നും ജോലി ചെയ്യാനുമുള്ള സ്വാതന്ത്ര്യം','ജോലി ചെയ്യുന്ന മേഖലയിൽ പേരെടുക്കണം, വലിയ കാര്യങ്ങൾ ചെയ്യണം']],
 ['+2-ൽ എന്താണ് പഠിച്ചത്?','നിങ്ങൾ പഠിച്ച വിഷയങ്ങൾ നോക്കി തിരഞ്ഞെടുക്കൂ.', ['സയൻസ്: ബയോളജി ഉണ്ട്, മാത്‌സ് ഇല്ല (PCB)','സയൻസ്: ബയോളജിയും മാത്‌സും (PCMB)','സയൻസ്: മാത്‌സ് ഉണ്ട്, ബയോളജി ഇല്ല (PCM)','കൊമേഴ്‌സ്','ഹ്യുമാനിറ്റീസ് / ആർട്‌സ്']],
 ['+2-ൽ പഠിച്ച സ്ട്രീം ഇഷ്ടമായിരുന്നോ?','ഇഷ്ടമല്ലായിരുന്നെങ്കിലും കുഴപ്പമില്ല.', ['ഇഷ്ടമായിരുന്നു; ഇതേ ഫീൽഡിൽ ജോലി ചെയ്യണം','സാഹചര്യം കാരണം എടുത്തതാണ്, എന്റെ ഇഷ്ടമായിരുന്നില്ല','ചില ഭാഗങ്ങൾ ഇഷ്ടപ്പെട്ടു, ചിലത് ഇഷ്ടമായില്ല','എന്ത് വേണമെന്ന് ഉറപ്പില്ല; മറ്റു ഫീൽഡുകളും നോക്കാം']],
 ['+2-ൽ ഏകദേശം എത്ര ശതമാനം മാർക്കുണ്ട്?','ചേരുന്ന ഓപ്ഷൻ തിരഞ്ഞെടുക്കൂ.', ['85%-നു മുകളിൽ','70% മുതൽ 85% വരെ','55% മുതൽ 70% വരെ','55%-നു താഴെ / പരീക്ഷ എഴുതാനിരിക്കുന്നു']],
 ['ഒരു വർഷത്തെ പഠനത്തിന് എത്ര ചെലവാക്കാനാകും?','ഹോസ്റ്റൽ വേണമെങ്കിൽ അതിന്റെ ചെലവും കൂട്ടണം.', ['₹50,000-ൽ താഴെ','₹50,000 മുതൽ ₹2 ലക്ഷം വരെ','₹2 ലക്ഷം മുതൽ ₹5 ലക്ഷം വരെ','₹5 ലക്ഷത്തിനു മുകളിൽ']],
 ['എവിടെയൊക്കെ പോയി പഠിക്കാൻ തയ്യാറാണ്?','നിങ്ങൾക്ക് സൗകര്യമുള്ളത് തിരഞ്ഞെടുക്കൂ.', ['കേരളത്തിൽ മാത്രം','കേരളം, കർണാടക, തമിഴ്‌നാട്','ഇന്ത്യയിൽ എവിടെയായാലും','വിദേശത്തും പോകാൻ തയ്യാറാണ്']],
 ['ഏത് എൻട്രൻസ് പരീക്ഷയാണ് എഴുതാൻ പ്ലാൻ?','പ്രധാനമായ ഒന്ന് തിരഞ്ഞെടുക്കൂ. ഇല്ലെങ്കിൽ അവസാന ഓപ്ഷൻ.', ['NEET (മെഡിക്കൽ)','KEAM അല്ലെങ്കിൽ JEE (എൻജിനീയറിങ്)','CLAT, NATA, UCEED, NIFT, CUET പോലുള്ള പരീക്ഷകൾ','എൻട്രൻസ് എഴുതാൻ പ്ലാനില്ല']],
 ['ഏതെങ്കിലും കോഴ്‌സ് മനസ്സിലുണ്ടോ?','ഇപ്പോൾ തന്നെ ഉറപ്പിച്ചിരിക്കണമെന്നില്ല.', ['ഉണ്ട്, ഒരു കോഴ്‌സ് മനസ്സിലുണ്ട്','രണ്ടോ മൂന്നോ ഓപ്ഷനുകൾ ഉണ്ട്; ഏത് വേണമെന്ന് ഉറപ്പില്ല','ഇതുവരെ ഐഡിയയില്ല','എന്റെ ഇഷ്ടവും വീട്ടുകാരുടെ ഇഷ്ടവും വേറെയാണ്']],
 ['ഏതൊക്കെ കോഴ്‌സുകളാണ് നോക്കുന്നത്?','ഒരു ഗ്രൂപ്പ് തുറന്ന് തിരഞ്ഞെടുക്കാം. ഒന്നിലധികം എടുക്കാം; സ്കിപ്പ് ചെയ്യുകയും ചെയ്യാം.', []],
 ['കോഴ്‌സ് തിരഞ്ഞെടുക്കുമ്പോൾ എന്താണ് കൂടുതൽ ടെൻഷൻ?','ഏറ്റവും കൂടുതൽ അലട്ടുന്നത് തിരഞ്ഞെടുക്കൂ.', ['ഫീസും വീട്ടുകാരുടെ ചെലവും','കോഴ്‌സ് കഴിഞ്ഞ് ജോലി കിട്ടുമോ','വീട്ടുകാർ സമ്മതിക്കുമോ','തെറ്റായ കോഴ്‌സ് എടുത്ത് പിന്നീട് വിഷമിക്കുമോ']]
];
