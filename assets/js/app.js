(function(){const $=(s,r=document)=>r.querySelector(s);
const BASE=document.querySelector('meta[name="bwp-base"]')?.content||'./';
window.go=function(path){if(!path)return;if(path.startsWith('/'))path=path.slice(1);const url=new URL(BASE+path,document.baseURI);window.location.href=url.toString();};

async function injectPartials(){const depth=window.location.pathname.split('/').filter(Boolean).length;
const prefix=depth<=1?'./':'../'.repeat(depth-1);
const h=$('#site-header'),f=$('#site-footer');
if(h)h.innerHTML=await fetch(prefix+'partials/header.html').then(r=>r.text());
if(f)f.innerHTML=await fetch(prefix+'partials/footer.html').then(r=>r.text());
const y=$('#year');if(y)y.textContent=new Date().getFullYear();}
window.toast=function(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.remove('hidden');clearTimeout(window.__toastT);window.__toastT=setTimeout(()=>el.classList.add('hidden'),2200);};
window.openHowItWorks=function(){const m=$('#modal');if(!m)return;m.classList.remove('hidden');m.classList.add('flex');document.body.style.overflow='hidden';};
window.closeModal=function(){const m=$('#modal');if(!m)return;m.classList.add('hidden');m.classList.remove('flex');document.body.style.overflow='';};
window.playVideo=function(url){const vm=$('#videoModal'),fr=$('#ytFrame');if(!vm||!fr)return;fr.src=url||'';vm.classList.remove('hidden');vm.classList.add('flex');document.body.style.overflow='hidden';};
window.closeVideo=function(){const vm=$('#videoModal'),fr=$('#ytFrame');if(fr)fr.src='';if(!vm)return;vm.classList.add('hidden');vm.classList.remove('flex');document.body.style.overflow='';};
window.subscribeFooter=function(){const i=$('#footerEmail');if(!i)return;const v=(i.value||'').trim();if(!v||!v.includes('@'))return toast('Please enter a valid email.');i.value='';toast('Thanks! You\u2019re on the list.');};

function badge(status){const map={open:'bg-emerald-50 text-emerald-700 border-emerald-200',waitlist:'bg-amber-50 text-amber-700 border-amber-200',closed:'bg-slate-100 text-slate-700 border-slate-200'};
const label=status==='open'?'Open':status==='waitlist'?'Waitlist':'Closed';return `<span class="pill ${map[status]||''}">${label}</span>`;}
function courseCard(c){const tags=(c.tags||[]).slice(0,3).map(t=>`<span class="pill">${t}</span>`).join('');
const btn=c.status==='open'?`<a class="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" href="javascript:void(0)" onclick="go('courses/${c.id}/index.html')">View</a>`
:`<button class="rounded-2xl border px-4 py-2 text-sm hover:bg-black/5" onclick="toast('Join waitlist: coming soon')">Notify me</button>`;
return `<div class="card-hover rounded-3xl border bg-white p-5">
<div class="flex items-center justify-between gap-3"><div class="text-sm font-semibold">${c.title}</div>${badge(c.status)}</div>
<div class="mt-2 text-sm text-slate-500">${c.level} • ${c.duration} • ${c.price}</div>
<div class="mt-3 flex flex-wrap gap-2">${tags}</div>
<div class="mt-4 flex items-center justify-between"><button class="rounded-2xl border px-4 py-2 text-sm hover:bg-black/5" onclick="playVideo('${c.video||''}')">Preview</button>${btn}</div>
</div>`;}

function renderHome(root){const {featured=[]}=window.BWP_DATA||{};
root.innerHTML=`<section class="py-10 md:py-14">
<div class="grid gap-8 md:grid-cols-2 md:items-center">
<div>
<div class="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-slate-600"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Live batches are open on selected courses</div>
<h1 class="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Learn UI/UX with live guidance — build a portfolio that gets you hired</h1>
<p class="mt-4 text-base text-slate-500 md:text-lg">Step-by-step curriculum, assignments, and feedback. Designed for Bangla-speaking learners.</p>
<div class="mt-6 flex flex-col gap-3 sm:flex-row">
<a href="javascript:void(0)" onclick="go('courses/index.html')" class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Browse courses</a>
<button onclick="openHowItWorks()" class="rounded-2xl border px-5 py-3 text-sm font-semibold hover:bg-black/5">How it works</button>
</div>
<div class="mt-6 flex flex-wrap gap-2 text-sm text-slate-600"><span class="pill">Live classes</span><span class="pill">Assignments</span><span class="pill">Community</span><span class="pill">Portfolio outcomes</span></div>
</div>
<div class="rounded-3xl border bg-white p-6"><div class="text-sm font-semibold">Featured courses</div><div class="mt-4 grid gap-4">${featured.map(courseCard).join('')}</div></div>
</div></section>`;}

function renderCourses(root){const {courses=[]}=window.BWP_DATA||{};
root.innerHTML=`<section class="py-10 md:py-14">
<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
<div><h1 class="text-3xl font-semibold tracking-tight md:text-4xl">Courses</h1><p class="mt-2 text-slate-500">Pick a batch based on your level and target outcome.</p></div>
<div class="flex gap-2">
<input id="q" class="w-full rounded-2xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 md:w-72" placeholder="Search course..." />
<select id="f" class="rounded-2xl border px-4 py-2 text-sm"><option value="all">All</option><option value="open">Open</option><option value="waitlist">Waitlist</option><option value="closed">Closed</option></select>
</div></div>
<div id="grid" class="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"></div></section>`;
const q=$('#q',root),f=$('#f',root),grid=$('#grid',root);
function draw(){const term=(q.value||'').toLowerCase().trim();const st=f.value;
const filtered=courses.filter(c=>{const hit=!term||c.title.toLowerCase().includes(term)||(c.tags||[]).join(' ').toLowerCase().includes(term);
const ok=st==='all'||c.status===st;return hit&&ok;});
grid.innerHTML=filtered.map(courseCard).join('')||`<div class="text-sm text-slate-500">No courses found.</div>`;}
q.addEventListener('input',draw);f.addEventListener('change',draw);draw();}

function renderAbout(root){root.innerHTML=`<section class="py-10 md:py-14">
<h1 class="text-3xl font-semibold tracking-tight md:text-4xl">About</h1>
<p class="mt-3 max-w-3xl text-slate-500">Build With Pavel focuses on live learning and real outcomes: portfolio projects, feedback, and a structured roadmap.</p>
<div class="mt-8 grid gap-4 md:grid-cols-3">
<div class="rounded-3xl border bg-white p-5"><div class="text-sm font-semibold">Live batches</div><div class="mt-2 text-sm text-slate-500">Start together, finish together. Accountability included.</div></div>
<div class="rounded-3xl border bg-white p-5"><div class="text-sm font-semibold">Portfolio outcomes</div><div class="mt-2 text-sm text-slate-500">Leave with projects you can confidently show.</div></div>
<div class="rounded-3xl border bg-white p-5"><div class="text-sm font-semibold">Community</div><div class="mt-2 text-sm text-slate-500">Support, reviews, and progress tracking.</div></div>
</div></section>`;}

function renderContact(root){root.innerHTML=`<section class="py-10 md:py-14">
<h1 class="text-3xl font-semibold tracking-tight md:text-4xl">Contact</h1>
<p class="mt-2 text-slate-500">Send a message — we’ll get back to you.</p>
<div class="mt-6 grid gap-6 md:grid-cols-2">
<form class="rounded-3xl border bg-white p-6" onsubmit="event.preventDefault(); toast('Message sent (demo)');">
<div class="grid gap-3">
<input class="rounded-2xl border px-4 py-2 text-sm" placeholder="Your name" required />
<input class="rounded-2xl border px-4 py-2 text-sm" placeholder="Email" required />
<textarea class="min-h-[140px] rounded-2xl border px-4 py-2 text-sm" placeholder="Message" required></textarea>
<button class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Send</button>
</div></form>
<div class="rounded-3xl border bg-white p-6"><div class="text-sm font-semibold">Batch info</div>
<div class="mt-2 text-sm text-slate-500">If a course is closed, join waitlist and get notified.</div>
<div class="mt-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">Replace this section with your email, WhatsApp, or social links.</div>
</div></div></section>`;}

function renderCourseDetail(root,id){const {courses=[]}=window.BWP_DATA||{};const c=courses.find(x=>x.id===id);
if(!c){root.innerHTML=`<section class="py-10"><div class="text-sm text-slate-500">Course not found.</div></section>`;return;}
root.innerHTML=`<section class="py-10 md:py-14">
<a href="javascript:void(0)" onclick="go('courses/index.html')" class="text-sm text-slate-600 hover:text-slate-900">← Back to courses</a>
<div class="mt-4 rounded-3xl border bg-white p-6 md:p-8">
<div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
<div>
<h1 class="text-3xl font-semibold tracking-tight md:text-4xl">${c.title}</h1>
<div class="mt-2 text-slate-500">${c.level} • ${c.duration} • ${c.price}</div>
<div class="mt-3 flex flex-wrap gap-2">${(c.tags||[]).map(t=>`<span class="pill">${t}</span>`).join('')}</div>
</div>
<div class="flex flex-wrap items-center gap-2">
${badge(c.status)}
<button class="rounded-2xl border px-4 py-2 text-sm hover:bg-black/5" onclick="playVideo('${c.video||''}')">Preview</button>
${c.status==='open'?`<button class="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800" onclick="toast('Enroll flow (demo)')">Enroll</button>`
:`<button class="rounded-2xl border px-4 py-2 text-sm hover:bg-black/5" onclick="toast('Waitlist flow (demo)')">Join waitlist</button>`}
</div></div>
<div class="soft-divider my-6"></div>
<div class="grid gap-6 md:grid-cols-3">
<div class="md:col-span-2">
<div class="text-sm font-semibold">Outcomes</div>
<ul class="mt-3 list-disc pl-5 text-sm text-slate-600">${(c.outcomes||[]).map(x=>`<li>${x}</li>`).join('')}</ul>
<div class="mt-6 text-sm font-semibold">What’s included</div>
<ul class="mt-3 list-disc pl-5 text-sm text-slate-600">${(c.includes||[]).map(x=>`<li>${x}</li>`).join('')}</ul>
</div>
<div class="rounded-3xl bg-slate-50 p-5">
<div class="text-sm font-semibold">Need help choosing?</div>
<div class="mt-2 text-sm text-slate-600">Message us from the contact page for guidance.</div>
<a href="javascript:void(0)" onclick="go('contact/index.html')" class="mt-4 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">Contact</a>
</div></div></div></section>`;}

function shellBoot(){const root=document.getElementById('app');if(!root)return;
const p=root.dataset.page;
if(p==='home')return renderHome(root);
if(p==='courses')return renderCourses(root);
if(p==='about')return renderAbout(root);
if(p==='contact')return renderContact(root);
if(p==='course')return renderCourseDetail(root,root.dataset.course);
}

document.addEventListener('DOMContentLoaded',async()=>{await injectPartials();shellBoot();});
})();