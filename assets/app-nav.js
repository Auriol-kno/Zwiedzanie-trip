/* I Was Here 8.4 — jedno dolne menu na każdym etapie: Atlas, przewodnik regionu i przewodnik Warszawy.
 * Zawsze te same pozycje w tej samej kolejności: Mapa · Odkrywaj · Plany · Paszport · Profil.
 *  - Atlas (data-page="atlas"): zakładki obsługuje assets/atlas-plans.js (data-tab).
 *  - Region / Warszawa: Mapa → Atlas (to samo województwo), Odkrywaj → lista atrakcji, Plany → plan dnia,
 *    Paszport → Paszport odkrywcy (place-extras.js), Profil → profil w Atlasie.
 * Etykiety PL i EN są w HTML naraz; widoczna jest ta zgodna z <html lang> (bez przebudowy przy zmianie języka). */
(function(){
'use strict';
const nav=document.getElementById('appNav');if(!nav)return;
const page=nav.dataset.page||'atlas';
const I={
 map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 2 6 2v10l-6-2V6Z"/>',
 explore:'<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm4.2 3.8-6 2.4-2.4 6 6-2.4 2.4-6ZM12 10.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z"/>',
 plans:'<path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 7h14v11H5V9Zm2 2v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H7Zm4 0v2h2v-2h-2Z"/>',
 passport:'<path fill-rule="evenodd" d="M6 2h11a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h11V4H6Zm5.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7ZM8 16.5h7V18H8v-1.5Z"/>',
 profile:'<path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5Z"/>'
};
const L={map:['Mapa','Map'],explore:['Odkrywaj','Explore'],plans:['Plany','Plans'],passport:['Pieczątki','Stamps'],profile:['Profil','Profile']};
const ORDER=['map','explore','plans','passport','profile'];
nav.setAttribute('aria-label','Menu');
nav.innerHTML=ORDER.map(k=>'<button type="button" data-tab="'+k+'"'+(k===(page==='atlas'?'map':'explore')?' class="active" aria-current="page"':'')+' data-i18n-skip><svg viewBox="0 0 24 24" aria-hidden="true">'+I[k]+'</svg><b><span data-l="pl">'+L[k][0]+'</span><span data-l="en">'+L[k][1]+'</span></b></button>').join('');
const logo=document.getElementById('atlasLogo');
function logoLink(){if(!logo)return;const en=document.documentElement.lang==='en';logo.href='./atlas.html?lang='+(en?'en':'pl');logo.setAttribute('aria-label','I Was Here — '+(en?'Show the whole Atlas map':'Pokaż główną mapę Atlasu'))}
logoLink();new MutationObserver(logoLink).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
if(logo&&page==='atlas')logo.addEventListener('click',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();document.getElementById('atlasFloat').click()});
if(page==='atlas')return; // zakładkami Atlasu steruje atlas-plans.js

const lang=()=>document.documentElement.lang==='en'?'en':'pl';
const region=new URLSearchParams(location.search).get('region')||'';
const TARGET={region:{explore:'filtersSection',plans:'planSection'},warsaw:{explore:'interestSection',plans:'routeSection'}}[page]||{};
function mark(k){nav.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===k;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
nav.addEventListener('click',e=>{
 const b=e.target.closest('[data-tab]');if(!b)return;const k=b.dataset.tab;
 if(k==='map'){location.href='./atlas.html?lang='+lang()+(region?'&region='+encodeURIComponent(region):'');return}
 if(k==='profile'){location.href='./atlas.html?lang='+lang()+'&tab=profile';return}
 if(k==='passport'){if(window.IWH_EXTRAS)IWH_EXTRAS.passport.open();return}
 const el=document.getElementById(TARGET[k]);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});mark(k)}
});
window.IWH_NAV={mark};
})();
