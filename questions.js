// Existing assessment: answer values and English wording preserved pending review.
const questions=[
{sec:"Section 1: Who you are",q:"When you have free time, what do you naturally enjoy most?",sub:"Pick the one that feels most like you. Be honest",type:"options",opts:[
{i:"🔬",t:"Experimenting or figuring out how things work",s:"Science, technology, solving puzzles",v:"analytical"},
{i:"🤝",t:"Talking, helping, or being around people",s:"Socializing, counseling, leading",v:"social"},
{i:"🎨",t:"Creating something: art, writing, design",s:"Making things, expressing ideas",v:"creative"},
{i:"📋",t:"Organizing, planning, managing things",s:"Lists, systems, getting things done",v:"organized"}]},
{sec:"Section 1: Who you are",q:"In a group project, what role do you naturally take?",sub:"What you actually do, not what sounds impressive",type:"options",opts:[
{i:"💡",t:"The idea person: I suggest new approaches",s:"Creative thinking, problem solving",v:"creative"},
{i:"📊",t:"The researcher: I find and analyze information",s:"Data, facts, deep thinking",v:"analytical"},
{i:"🗣️",t:"The communicator: I present and coordinate",s:"Talking to people, making things clear",v:"social"},
{i:"✅",t:"The executor: I make sure things get done",s:"Organization, deadlines, finishing",v:"organized"}]},
{sec:"Section 1: Who you are",q:"What work environment excites you most?",sub:"10 years from now, where do you want to be working?",type:"options",opts:[
{i:"🏥",t:"Hospital or clinic: helping patients directly",s:"Healthcare, hands-on care",v:"medical"},
{i:"💻",t:"Tech company: building things on a computer",s:"Software, data, digital products",v:"tech"},
{i:"🏢",t:"Office: managing teams or running a business",s:"Management, strategy, entrepreneurship",v:"business"},
{i:"🎬",t:"Creative field: media, design, content",s:"Studios, agencies, freelancing",v:"creative"}]},
{sec:"Section 1: Who you are",q:"Which school subject did you genuinely enjoy?",sub:"Enjoyment, not marks",type:"options",opts:[
{i:"🔭",t:"Science: Biology, Physics, Chemistry",s:"",v:"science"},
{i:"📐",t:"Maths and logical thinking",s:"",v:"math"},
{i:"📚",t:"Languages, History, Social Science",s:"",v:"humanities"},
{i:"💰",t:"Commerce, Economics, Accounts",s:"",v:"commerce"}]},
{sec:"Section 1: Who you are",q:"What does success mean to you at age 30?",sub:"Your honest vision, not your parents' version",type:"options",opts:[
{i:"💵",t:"High salary and financial stability",s:"Security, savings, comfortable life",v:"financial"},
{i:"❤️",t:"Work that feels meaningful and helps others",s:"Impact, purpose, changing lives",v:"impact"},
{i:"🌍",t:"Freedom: travel, work from anywhere",s:"Flexibility, independence, experiences",v:"freedom"},
{i:"🏆",t:"Respected in my field, building something big",s:"Status, achievement, legacy",v:"achievement"}]},
{sec:"Section 2: Your situation",q:"What stream did you complete your Plus 2 in?",sub:"This decides which courses you are eligible for",type:"options",opts:[
{i:"🧬",t:"Science with Biology, without Maths (PCB)",s:"",v:"P"},
{i:"🔬",t:"Science with Biology and Maths (PCMB)",s:"",v:"X"},
{i:"⚙️",t:"Science with Maths, without Biology (PCM)",s:"",v:"M"},
{i:"💼",t:"Commerce",s:"",v:"C"},
{i:"📖",t:"Humanities / Arts",s:"",v:"H"}]},
{sec:"Section 2: Your situation",q:"How do you honestly feel about the stream you studied?",sub:"This matters more than you think. Be completely honest",type:"options",opts:[
{i:"❤️",t:"I genuinely enjoyed it and want a career in this field",s:"My stream matches my interest",v:"stream_love"},
{i:"😐",t:"I studied it due to circumstances, not really my choice",s:"Parent pressure, school options, or I just followed along",v:"stream_forced"},
{i:"🤷",t:"I liked some parts but not others",s:"Mixed feelings",v:"stream_mixed"},
{i:"🔄",t:"I have no idea what I want. My stream does not define me",s:"Open to anything that suits my personality",v:"stream_lost"}]},
{sec:"Section 2: Your situation",q:"Your approximate Plus 2 percentage?",sub:"An honest answer helps us suggest realistic options",type:"options",opts:[
{i:"🌟",t:"Above 85%",s:"All top colleges and courses open",v:"high"},
{i:"✨",t:"70% to 85%",s:"Most good colleges accessible",v:"medium"},
{i:"📈",t:"55% to 70%",s:"Good options with the right guidance",v:"low"},
{i:"🔄",t:"Below 55% or still appearing",s:"We will find the right path",v:"very_low"}]},
{sec:"Section 2: Your situation",q:"Approximate annual college budget?",sub:"Total per year including hostel if needed",type:"options",opts:[
{i:"🏛️",t:"Under 50,000 per year",s:"Government or aided colleges only",v:"budget_low"},
{i:"💰",t:"50,000 to 2 Lakh per year",s:"Aided and affordable private colleges",v:"budget_mid"},
{i:"💳",t:"2 Lakh to 5 Lakh per year",s:"Most private colleges in Kerala and Karnataka",v:"budget_high"},
{i:"💎",t:"Above 5 Lakh per year",s:"Premium colleges, medical, deemed universities",v:"budget_premium"}]},
{sec:"Section 2: Your situation",q:"Where are you open to studying?",sub:"Location affects your college options a lot",type:"options",opts:[
{i:"🏠",t:"Only in Kerala",s:"Stay close to home",v:"kerala"},
{i:"🚌",t:"Kerala or nearby: Karnataka, Tamil Nadu",s:"Mangalore, Bangalore, Chennai",v:"south"},
{i:"✈️",t:"Anywhere in India",s:"Best college wherever it is",v:"india"},
{i:"🌏",t:"Open to studying abroad",s:"UK, Australia, Canada, Gulf",v:"abroad"}]},
{sec:"Section 2: Your situation",q:"Which entrance exam are you writing or planning?",sub:"Pick the main one. Choose the last option if none",type:"options",opts:[
{i:"🩺",t:"NEET (medical)",s:"",v:"N"},
{i:"🛠️",t:"KEAM or JEE (engineering)",s:"",v:"E"},
{i:"📝",t:"CLAT, NATA, UCEED, NIFT, CUET or similar",s:"Law, architecture, design, central universities",v:"O"},
{i:"🚫",t:"None, or not planning any entrance exam",s:"",v:"none"}]},
{sec:"Section 2: Your situation",q:"Do you have a course already in mind?",sub:"We will tell you honestly if it fits your profile",type:"options",opts:[
{i:"✅",t:"Yes, I have a specific course in mind",s:"",v:"yes_course"},
{i:"🤔",t:"I have 2-3 options but I am confused",s:"",v:"confused"},
{i:"❓",t:"No idea. That is why I am here",s:"",v:"no_idea"},
{i:"⚡",t:"My parents want one thing, I want another",s:"",v:"conflict"}]},
{sec:"Section 2: Your situation",q:"Select any courses you are considering:",sub:"Tap multiple, or skip if you have no idea yet",type:"course_select",optional:true},
{sec:"Section 3: Final question",q:"What is your biggest worry about choosing a course?",sub:"This helps us give you better guidance",type:"options",opts:[
{i:"💸",t:"Fees and financial burden on family",s:"",v:"fees"},
{i:"💼",t:"Not getting a job after the degree",s:"",v:"jobs"},
{i:"👨‍👩‍👧",t:"My parents will not approve my choice",s:"",v:"parents"},
{i:"🎯",t:"I might choose wrong and regret it",s:"",v:"wrong_choice"}]}
];
