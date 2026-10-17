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
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const lines=['Website inquiry for April Johnson','',...Array.from(data.entries()).filter(([k,v])=>String(v).trim()).map(([k,v])=>`${({name:'Name',email:'Email',phone:'Phone',intent:'Interested in',contact:'Phone or email',area:'Location or property address',timeframe:'Timing',message:'Message'})[k]||k}: ${v}`)];const text=lines.join('\n');const output=form.querySelector('.form-status');output.replaceChildren();const lead=document.createElement('p');lead.textContent='Your inquiry is ready. No message has been sent yet.';output.append(lead);const preview=document.createElement('pre');preview.textContent=text;output.append(preview);
 const copy=document.createElement('button');copy.type='button';copy.className='button secondary small';copy.textContent='Copy inquiry';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);copy.textContent='Copied';}catch{copy.textContent='Select and copy the text above';}});output.append(copy);
 const download=document.createElement('button');download.type='button';download.className='button secondary small';download.textContent='Download inquiry';download.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='inquiry-for-april-johnson.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});output.append(download);
 if(form.dataset.email){const email=document.createElement('a');email.className='button small';email.textContent='Review email to April';email.href=`mailto:${form.dataset.email}?subject=${encodeURIComponent('Website inquiry: '+data.get('intent'))}&body=${encodeURIComponent(text)}`;output.append(email);}
 output.focus();
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
 const sel='.section-heading,h2.center,.bento>*,.military-photo,.military-copy>*,.mini-grid>div,.value-card>*,.steps li,.area-bento>*,.meet-photo,.meet>div:last-child>*,.cred-grid>div,.faq-home>div:first-child>*,.faq-card,.consult-grid>div>*,.consult-form,.page-hero-grid>*,.prose>*,.aside,.areas>*,.faq-wrap>div,.faq-list details,.cta-band .container>*,.footer-grid>div,.finder-row>*';
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
