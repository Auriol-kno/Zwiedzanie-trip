(function(){
const cities=[['Warszawa',52.2297,21.0122,true],['Kraków',50.0647,19.9450],['Gdańsk',54.352,18.6466],['Wrocław',51.1079,17.0385],['Poznań',52.4064,16.9252],['Łódź',51.7592,19.455],['Lublin',51.2465,22.5684],['Toruń',53.0138,18.5984],['Szczecin',53.4285,14.5528],['Zakopane',49.2992,19.9496],['Białystok',53.1325,23.1688],['Rzeszów',50.0412,21.9991],['Katowice',50.2649,19.0238]];
const home=document.createElement('section');home.id='polandHome';home.setAttribute('aria-label','Mapa Polski i wybór miast');
home.innerHTML='<div class="poland-title"><h2>Tu Byłem</h2><p>Miejsca i Wspomnienia · Odkrywaj Polskę</p></div><div id="polandMap" aria-label="Interaktywna mapa Polski"></div><div class="poland-actions"><button id="polandFull" type="button">⛶ Pełny ekran</button><button id="polandReset" type="button">⌖ Cała Polska</button></div><p class="poland-note">Wybierz miasto. Szczegółowy przewodnik jest obecnie dostępny dla Warszawy; pozostałe miasta przygotowujemy.</p>';
const hero=document.querySelector('.hero');if(hero)hero.before(home);
if(typeof L!=='undefined'){
const m=L.map('polandMap',{zoomControl:true,scrollWheelZoom:false}).setView([52.05,19.15],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(m);
cities.forEach(([name,lat,lon,ready])=>{
const marker=L.marker([lat,lon],{icon:L.divIcon({className:'',html:'<span class="p-city-label">'+name+'</span>',iconSize:[90,28],iconAnchor:[45,14]})}).addTo(m);
marker.on('click',()=>{if(ready){home.classList.remove('fullscreen');document.body.style.overflow='';setTimeout(()=>document.querySelector('#mapSection')?.scrollIntoView({behavior:'smooth'}),120);}else{m.flyTo([lat,lon],10,{duration:.8});marker.bindPopup('<strong>'+name+'</strong><p>Przewodnik po tym mieście w przygotowaniu.</p>').openPopup();}});
});
document.querySelector('#polandFull').addEventListener('click',()=>{const full=home.classList.toggle('fullscreen');document.body.style.overflow=full?'hidden':'';document.querySelector('#polandFull').textContent=full?'✕ Zamknij mapę':'⛶ Pełny ekran';setTimeout(()=>m.invalidateSize(),100);});
document.querySelector('#polandReset').addEventListener('click',()=>m.flyTo([52.05,19.15],6));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&home.classList.contains('fullscreen'))document.querySelector('#polandFull').click()});
}else document.querySelector('#polandMap').textContent='Mapa wymaga połączenia z internetem.';
const opt=document.createElement('section');opt.id='smartOptions';opt.innerHTML='<label for="smartPriority">🧠 Inteligentna kolejność zwiedzania</label><select id="smartPriority"><option value="closing">Najpierw atrakcje zamykane wcześniej</option><option value="balanced">Równowaga: godziny, jakość i dojazdy</option><option value="nearest">Najpierw najbliższe atrakcje</option></select><p>Planer uwzględnia znane harmonogramy i szacowany czas przejazdu. Sprawdź aktualne godziny i ostatnie wejście na stronie obiektu. To algorytm planowania, nie usługa AI na żywo.</p>';
document.querySelector('#routeSection')?.before(opt);
const s=document.querySelector('#smartPriority');s.value=localStorage.getItem('tubylem_priority')||'closing';s.addEventListener('change',()=>{localStorage.setItem('tubylem_priority',s.value);document.querySelector('#regenRoute')?.click()});
})();