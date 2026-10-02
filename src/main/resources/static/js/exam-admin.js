'use strict';
const root=document.querySelector('#admin-content'), heading=document.querySelector('#admin-heading'), error=document.querySelector('#admin-error');
const base='/admin/exam-center', apiBase=base+'/api';
const el=(tag,text,cls)=>{const n=document.createElement(tag); if(text!==undefined)n.textContent=text; if(cls)n.className=cls; return n;};
const link=(text,href)=>{const n=el('a',text,'button'); n.href=href; return n;};
const run=async fn=>{error.hidden=true;try{await fn();}catch(e){error.textContent=e.message;error.hidden=false;}};
const button=(text,fn)=>{const n=el('button',text,'button'); n.type='button';n.onclick=()=>run(async()=>{n.disabled=true;try{await fn();}finally{n.disabled=false;}});return n;};
async function api(path,method='GET',body){
 const response=await fetch(path.startsWith('/api/auth/') ? path : apiBase+path,{method,cache:'no-store',headers:{Accept:'application/json','Content-Type':'application/json',
 [document.querySelector('meta[name="csrf-header"]').content]:document.querySelector('meta[name="csrf-token"]').content},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const data=await response.json().catch(()=>({message:'Request failed. Reload the page and sign in as an administrator.'}));
 if(!response.ok)throw new Error(data.errors?Object.entries(data.errors).map(([k,v])=>`${k}: ${v}`).join(' · '):data.message);return data;
}
function input(label,name,value='',type='text'){
 const wrap=el('label',label), field=el('input');field.name=name;field.setAttribute('aria-label',label);field.type=type;field.value=value??'';wrap.append(field);return [wrap,field];
}
function select(label,choices){const wrap=el('label',label),field=el('select');field.setAttribute('aria-label',label);for(const [value,text] of choices){const o=el('option',text);o.value=value;field.append(o);}wrap.append(field);return [wrap,field];}
const date=value=>value?new Date(value).toLocaleString():'—';
function table(headers,rows){const wrap=el('div',undefined,'admin-table-scroll'), t=el('table',undefined,'admin-results-table'),thead=el('thead'),tr=el('tr');headers.forEach(h=>tr.append(el('th',h)));thead.append(tr);t.append(thead);const body=el('tbody');for(const values of rows){const row=el('tr');for(const v of values){const cell=el('td');cell.append(v instanceof Node?v:document.createTextNode(String(v??'—')));row.append(cell);}body.append(row);}t.append(body);wrap.append(t);if(!rows.length)wrap.append(el('p','No matching records.'));return wrap;}
function editor(student,done){
 const card=el('article',undefined,'exam-card'),form=el('form',undefined,'admin-form');card.append(el('h2',student?'Edit student':'Create student'));
 const fields={};for(const [label,name,type] of [['Name','name','text'],['Username','username','text'],['Email (optional)','email','email'],[student?'New password (leave blank to keep current password)':'Password','password','password']]){
 const [wrap,f]=input(label,name,student?.[name],type);f.required=['name','username'].includes(name)||(!student&&name==='password');f.maxLength=name==='name'?80:name==='password'?64:254;fields[name]=f;form.append(wrap);}
 fields.password.autocomplete='new-password';
 form.append(el('p','Passwords need 10–64 characters, uppercase, lowercase and a number.'));
 form.append(button('Generate credentials',()=>{if(!fields.username.value)fields.username.value='student-'+crypto.randomUUID().slice(0,8);fields.password.value='Aa1!'+crypto.randomUUID().replaceAll('-','').slice(0,20);fields.password.type='text';}));
 const [activeWrap,active]=input('Active account','active','','checkbox');active.checked=student?.active??true;form.append(activeWrap);
 const submit=el('button',student?'Save student':'Create student','button button-primary');submit.type='submit';form.append(submit);
 const receipt=el('div');receipt.setAttribute('role','status');
 form.onsubmit=event=>{event.preventDefault();run(async()=>{submit.disabled=true;try{
 const body=Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value]));body.active=active.checked;
 const saved=await api('/students'+(student?'/'+student.id:''),student?'PUT':'POST',body);
 receipt.replaceChildren(el('p','Student saved. Provide these credentials to the student securely.'),el('p','Username: '+saved.username));
 if(body.password)receipt.append(el('p','Password: '+body.password));
 receipt.append(button('Hide credentials',()=>receipt.replaceChildren()));fields.password.value='';fields.password.type='password';
 if(!student){fields.name.value='';fields.username.value='';fields.email.value='';active.checked=true;}
 await done(saved);
 }finally{submit.disabled=false;}});};card.append(form,receipt);return card;
}
async function students(){heading.textContent='Student Management';root.replaceChildren();const list=el('div');
 const controls=el('div',undefined,'exam-actions');const [sw,search]=input('Search name, username or email','search');const [aw,active]=select('Account status',[['','All'],['true','Active'],['false','Inactive']]);controls.append(sw,aw);
 let all=[];const render=()=>{const q=search.value.toLowerCase();list.replaceChildren(table(['Name','Username','Email','Status','Profile'],all.filter(u=>(!active.value||String(u.active)===active.value)&&[u.name,u.username,u.email].some(v=>v?.toLowerCase().includes(q))).map(u=>[u.name,u.username,u.email,u.active?'Active':'Inactive',link('View student',base+'/students/'+u.id)])));};
 const refresh=async()=>{all=await api('/students');render();};search.oninput=render;active.onchange=render;
 root.append(editor(null,refresh),controls,list);await refresh();
}
function resultList(rows,showStudent=true){
 const container=el('div'),controls=el('div',undefined,'exam-actions'),output=el('div');
 const [sw,search]=input('Student name or username','search');
 const exams=[...new Map(rows.map(r=>[r.examId,r.title])).entries()];const [ew,exam]=select('Exam',[['','All exams'],...exams]);
 const [fw,from]=input('From date','from','','date'),[tw,to]=input('To date','to','','date');
 const [ow,sort]=select('Sort by',[['date','Newest first'],['oldest','Oldest first'],['score','Score (highest)'],['student','Student name']]);
 controls.append(sw,ew,fw,tw,ow);container.append(controls,output);
 const render=()=>{
 const q=search.value.toLowerCase();let filtered=rows.filter(r=>(!exam.value||r.examId===exam.value)&&(!q||[r.name,r.username].some(v=>v?.toLowerCase().includes(q)))&&(!from.value||new Date(r.startedAt)>=new Date(from.value+'T00:00:00'))&&(!to.value||new Date(r.startedAt)<=new Date(to.value+'T23:59:59.999')));
 filtered.sort((a,b)=>sort.value==='student'?(a.name||'').localeCompare(b.name||''):sort.value==='score'?(b.result?.obtainedMarks??-Infinity)-(a.result?.obtainedMarks??-Infinity):sort.value==='oldest'?new Date(a.startedAt)-new Date(b.startedAt):new Date(b.startedAt)-new Date(a.startedAt));
 output.replaceChildren(table([...(showStudent?['Student','Username']:[]),'Exam','Attempt','Started','Ended','Score','Percentage','Correct','Wrong','Status','Details'],filtered.map(r=>[...(showStudent?[link(r.name,base+'/students/'+r.userId),r.username]:[]),r.title,r.attemptNumber,date(r.startedAt),date(r.submittedAt),r.result?`${r.result.obtainedMarks}/${r.result.totalMarks}`:'—',r.result?`${r.result.percentage}%`:'—',r.result?.correct,r.result?.incorrect,r.status,link('Open attempt',base+'/results/'+r.attemptId)])));
 };[search,exam,from,to,sort].forEach(f=>f.addEventListener('input',render));render();return container;
}
async function profile(id){
 const data=await api('/students/'+id);let student=data.student;root.replaceChildren();
 const summary=el('article',undefined,'exam-card');
 const renderSummary=()=>{
   heading.textContent=student.name;
   summary.replaceChildren(el('h2','Student information'),
     el('p',`Username: ${student.username} · Email: ${student.email||'—'} · ${student.active?'Active':'Inactive'}`),
     el('p','Created: '+date(student.createdAt)),
     el('p',`${new Set(data.attempts.map(a=>a.examId)).size} exams · ${data.attempts.length} attempts`));
   if(student.active)summary.append(button('Deactivate student',async()=>{
     if(confirm('Deactivate this student? Their results will be retained.')){
       await api('/students/'+id,'DELETE');await profile(id);
     }
   }));
 };
 renderSummary();
 const counts=new Map();for(const a of data.attempts){const item=counts.get(a.examId)||{title:a.title,total:0,submitted:0};item.total++;if(a.status==='SUBMITTED')item.submitted++;counts.set(a.examId,item);}
 const exams=el('div');if(counts.size)exams.append(el('h2','Exams attempted'),table(['Exam','Total attempts','Submitted'],[...counts.values()].map(e=>[e.title,e.total,e.submitted])));
 root.append(link('Back to students',base+'/students'),summary,
   editor(student,async saved=>{student=saved;renderSummary();}),exams,
   el('h2','Complete attempt history'),resultList(data.attempts,false));
}
async function detail(id){const a=await api('/results/'+id);heading.textContent=`${a.title} · Attempt ${a.attemptNumber}`;const card=el('article',undefined,'exam-card');card.append(link('Student profile',base+'/students/'+a.userId),el('p',`Student at attempt: ${a.studentName}`),el('p',`${a.status} · Started ${date(a.startedAt)} · Ended ${date(a.submittedAt)}`));root.replaceChildren(card);
 if(a.result){const r=a.result;card.append(el('p',`Score: ${r.obtainedMarks}/${r.totalMarks} · ${r.percentage}% · Questions: ${r.totalQuestions} · Correct: ${r.correct} · Wrong: ${r.incorrect} · Unanswered: ${r.unanswered}`));
 for(const q of a.review.questions){const row=el('article',undefined,'exam-card');row.append(el('h2',q.question),el('p','Selected answer: '+(q.selectedAnswer??'Unanswered')),el('p','Correct answer: '+q.correctAnswer),el('p',`${q.status} · Marks: ${q.marksObtained}`));root.append(row);}
 }else card.append(el('p',`${Object.keys(a.answers).length} answers saved. Results will be available after submission.`));
}
run(async()=>{const parts=location.pathname.slice(base.length).split('/').filter(Boolean);if(parts[0]==='results'){if(parts[1])await detail(parts[1]);else{heading.textContent='Results Management';root.replaceChildren(resultList(await api('/results')));}}else if(parts[1])await profile(parts[1]);else await students();});

document.querySelector('#admin-logout').addEventListener('click',()=>run(async()=>{
 await api('/api/auth/logout','POST');location.assign('/admin-login');
}));
