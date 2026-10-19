const toggle=document.querySelector('.menu-toggle'),mobile=document.querySelector('.mobile-nav');
const setMenu=open=>{if(!toggle)return;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');mobile.classList.toggle('open',open);document.documentElement.classList.toggle('menu-open',open);};
if(toggle)toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
if(mobile)mobile.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
addEventListener('resize',()=>{if(innerWidth>900)setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.nav-menu[open]').forEach(x=>x.open=false);if(toggle&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}}});
document.addEventListener('click',e=>{document.querySelectorAll('.nav-menu[open]').forEach(x=>{if(!x.contains(e.target))x.open=false})});
const params=new URLSearchParams(location.search);
const intentNames={'buy':'Buying','sell':'Selling','both':'Buying and selling','first-home':'First home','new-construction':'New construction','military-relocation':'Military relocation','land':'Land','investment':'Investment property','property':'Property question','area':'Area question'};
for(const form of document.querySelectorAll('.inquiry-form')){
 const intent=form.querySelector('[name=intent]');if(params.has('intent')&&intent&&intent.tagName==='SELECT'){const name=intentNames[params.get('intent')];if(name&&[...intent.options].some(x=>x.value===name))intent.value=name;}
 const area=form.querySelector('[name=area]');if(area&&params.has('area'))area.value=params.get('area').slice(0,150);
 const message=form.querySelector('[name=message]');if(message&&params.has('message'))message.value=params.get('message').slice(0,2000);
 const hp=document.createElement('input');hp.type='text';hp.name='company';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');hp.style.cssText='position:absolute;left:-9999px;width:1px;height:1px;opacity:0';form.append(hp);
 const draft=()=>{const data=new FormData(form);data.delete('company');const lines=['Website inquiry for April Johnson','',...Array.from(data.entries()).filter(([k,v])=>String(v).trim()).map(([k,v])=>`${({name:'Name',email:'Email',phone:'Phone',intent:'Interested in',contact:'Phone or email',area:'Location or property address',timeframe:'Timing',message:'Message'})[k]||k}: ${v}`)];const text=lines.join('\n');const output=form.querySelector('.form-status');output.replaceChildren();const lead=document.createElement('p');lead.textContent='Your inquiry is ready. No message has been sent yet.';output.append(lead);const preview=document.createElement('pre');preview.textContent=text;output.append(preview);
 const copy=document.createElement('button');copy.type='button';copy.className='button secondary small';copy.textContent='Copy inquiry';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);copy.textContent='Copied';}catch{copy.textContent='Select and copy the text above';}});output.append(copy);
 const download=document.createElement('button');download.type='button';download.className='button secondary small';download.textContent='Download inquiry';download.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='inquiry-for-april-johnson.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});output.append(download);
 if(form.dataset.email){const email=document.createElement('a');email.className='button small';email.textContent='Review email to April';email.href=`mailto:${form.dataset.email}?subject=${encodeURIComponent('Website inquiry: '+data.get('intent'))}&body=${encodeURIComponent(text)}`;output.append(email);}
 output.focus();
 };
 // Send to April's Lofty CRM; if that fails, fall back to the email draft above.
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const btn=form.querySelector('[type=submit]');const label=btn?btn.textContent:'';const output=form.querySelector('.form-status');
  if(btn){btn.disabled=true;btn.textContent='Sending…';}
  const payload=Object.fromEntries(new FormData(form).entries());payload.page=location.pathname;
  let ok=false;try{const r=await fetch('/api/lead/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});ok=r.ok&&(await r.json()).ok;}catch{}
  if(btn){btn.disabled=false;btn.textContent=label;}
  if(ok){output.replaceChildren();const p=document.createElement('p');p.className='form-success';p.textContent='Thank you. Your message is with April, and she will be in touch personally soon.';output.append(p);form.querySelectorAll('input:not([type=hidden]):not([type=radio]),textarea').forEach(x=>x.value='');output.focus();}
  else{draft();const note=document.createElement('p');note.textContent='We could not send your message just now. You can email it to April instead:';output.prepend(note);output.querySelector('p+p')?.remove();}
 });
}
const planner=document.querySelector('#search-planner');
if(planner){const set=(n,v)=>{const f=planner.elements[n];if(!f||!v)return;if(f.tagName==='SELECT'){if([...f.options].some(o=>o.value===v))f.value=v}else f.value=v.slice(0,200)};set('area',params.get('area'));set('type',params.get('type'));set('budget',params.get('budget'));set('features',params.get('beds'));if(['area','type','budget','beds'].some(k=>params.get(k)))planner.scrollIntoView({block:'center'});}
if(planner)planner.addEventListener('submit',e=>{e.preventDefault();const values=new FormData(planner);const area=values.get('area');const description=`I am looking for ${values.get('type')} in ${area}. Budget: ${values.get('budget')||'To discuss'}. Features: ${values.get('features')||'To discuss'}.`;const result=planner.querySelector('.search-result');result.replaceChildren();const p=document.createElement('p');p.textContent='Your search preferences are ready. Ask April about matching properties and current availability.';result.append(p);const a=document.createElement('a');a.className='button';a.textContent='Discuss this search';a.href='/contact/?intent=buy&area='+encodeURIComponent(area)+'&message='+encodeURIComponent(description);result.append(a);result.focus();});
// Motion: scroll reveals, header state. Skipped entirely when the visitor prefers reduced motion.
(()=>{
 const header=document.querySelector('.site-header');
 const onScroll=()=>header&&header.classList.toggle('scrolled',scrollY>8);
 addEventListener('scroll',onScroll,{passive:true});onScroll();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 document.documentElement.classList.add('motion');
 const sel='.sec-head,.lead-c,.tile,.meet-copy>*,.meet-photo,.t-card,.steps article,.svc,.mil-box>*,.cm,.cs-form>*,.cs-photo,.work-inner>*,.faq-grid>div:first-child>*,.faq-list details,.f-grid>*,.page-body-grid .prose>*,.aside,.areas>*';
 const io=new IntersectionObserver(entries=>{for(const en of entries){if(!en.isIntersecting)continue;const el=en.target;io.unobserve(el);el.classList.add('in');
  el.addEventListener('transitionend',function done(ev){if(ev.target!==el||ev.propertyName!=='opacity')return;el.classList.remove('reveal','in');el.style.removeProperty('--d');el.removeEventListener('transitionend',done)});}},{rootMargin:'0px 0px -8% 0px',threshold:.12});
 const seen=new Set();
 for(const el of document.querySelectorAll(sel)){if(seen.has(el)||el.closest('.reveal'))continue;seen.add(el);
  if(el.getBoundingClientRect().top<innerHeight*.92)continue; // already on screen: never hide it
  if(!el.offsetParent||el.parentElement.scrollWidth>el.parentElement.clientWidth+2)continue; // hidden, or inside a swipe row
  const i=[...el.parentElement.children].filter(c=>seen.has(c)).indexOf(el);
  el.style.setProperty('--d',Math.min(Math.max(i,0),5)*0.08+'s');el.classList.add('reveal');io.observe(el);}
})();
// FAQ accordion: opening one answer closes the others in the same list.
for(const list of document.querySelectorAll('.faq-list'))list.addEventListener('toggle',e=>{const d=e.target;if(d.tagName!=='DETAILS'||!d.open)return;for(const o of list.querySelectorAll('details[open]'))if(o!==d)o.open=false},true);

// Hero slideshow: crossfading photos with progress bars and a pause button.
(()=>{const hero=document.querySelector('.hero');if(!hero)return;const slides=[...hero.querySelectorAll('.slide')],bars=[...hero.querySelectorAll('.bars-track span')],btn=hero.querySelector('.hero-pause');if(slides.length<2)return;
 const DUR=7000,still=matchMedia('(prefers-reduced-motion: reduce)').matches;let i=0,timer=null,left=DUR,started=0;
 const pauseIcon=btn.innerHTML,playIcon='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>';
 const show=n=>{slides.forEach((s,k)=>{s.classList.toggle('on',k===n);const img=s.querySelector('img');if(img&&img.loading==='lazy')img.loading='eager'});bars.forEach((b,k)=>{b.classList.toggle('done',k<n);b.classList.remove('run')});void bars[n].offsetWidth;bars[n].style.setProperty('--dur',DUR+'ms');bars[n].classList.add('run');i=n};
 const schedule=ms=>{clearTimeout(timer);started=Date.now();left=ms;timer=setTimeout(()=>{show((i+1)%slides.length);schedule(DUR)},ms)};
 const setPaused=p=>{hero.classList.toggle('paused',p);btn.setAttribute('aria-label',p?'Play slideshow':'Pause slideshow');btn.innerHTML=p?playIcon:pauseIcon;if(p){clearTimeout(timer);left-=Date.now()-started}else schedule(Math.max(left,300))};
 bars.forEach((b,k)=>{b.style.cursor='pointer';b.addEventListener('click',()=>{show(k);if(!hero.classList.contains('paused'))schedule(DUR)})});
 btn.addEventListener('click',()=>setPaused(!hero.classList.contains('paused')));
 show(0);if(still)setPaused(true);else schedule(DUR);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!hero.classList.contains('paused')){clearTimeout(timer);left-=Date.now()-started}else if(!document.hidden&&!hero.classList.contains('paused'))schedule(Math.max(left,300))});
})();
// Statement text lights up word by word as it scrolls into view.
(()=>{const el=document.querySelector('[data-highlight]');if(!el)return;const words=el.textContent.trim().split(/\s+/);el.innerHTML=words.map(w=>'<span class="w">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>').join(' ');const spans=[...el.querySelectorAll('.w')];
 const update=()=>{const r=el.getBoundingClientRect(),vh=innerHeight;const p=Math.min(1,Math.max(0,(vh*.85-r.top)/(r.height+vh*.35)));const n=Math.round(p*spans.length);spans.forEach((s,k)=>s.classList.toggle('lit',k<n))};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){spans.forEach(s=>s.classList.add('lit'));return}
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();})();
// Services list: hovering or focusing an item swaps the photo beside it.
(()=>{const items=[...document.querySelectorAll('.svc-list li')],imgs=[...document.querySelectorAll('.svc-img')];if(!items.length)return;const set=n=>{items.forEach((x,k)=>x.classList.toggle('on',k===n));imgs.forEach((x,k)=>x.classList.toggle('on',k===n))};items.forEach((it,k)=>{it.addEventListener('mouseenter',()=>set(k));it.addEventListener('focusin',()=>set(k))});})();

// Client stories: one complete review at a time; no automatic rotation.
(()=>{const root=document.querySelector('.client-stories');if(!root)return;const cards=[...root.querySelectorAll('.client-quote')];let current=0;const show=n=>{current=(n+cards.length)%cards.length;cards.forEach((card,i)=>card.hidden=i!==current);root.querySelector('.client-count').textContent=String(current+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0')};root.querySelector('.client-prev').addEventListener('click',()=>show(current-1));root.querySelector('.client-next').addEventListener('click',()=>show(current+1));})();
