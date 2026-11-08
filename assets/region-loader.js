/* I Was Here 8.7 — ładowanie danych przewodnika regionu (BAZA_DANYCH.md, etap 1).
 * Strona ma lekki plik data/regiony-lite.js (wszystkie województwa, bez opisów). Pełne dane — opisy, adresy, OSM —
 * pobieramy tylko dla otwartego województwa z data/regiony/<id>.json, a dopiero potem uruchamiamy assets/region.js.
 * Gdy plik województwa jest niedostępny, ładujemy zapasowy pełny data/regiony.js. */
(function(){
'use strict';
var id=new URLSearchParams(location.search).get('region')||'swietokrzyskie',DB=window.IWH_REGIONS;
function add(src,ok,fail){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=fail||ok;document.body.appendChild(s)}
function go(){
 // Bez pełnych danych przewodnik i tak działa: puste opisy zamiast błędu.
 if(window.IWH_REGIONS)window.IWH_REGIONS.places.forEach(function(p){if(!p.desc)p.desc={pl:'',en:''};if(p.url===undefined)p.url=null});
 add('./assets/region.js');
}
function fallback(){add('./data/regiony.js',go,go)}
if(!DB||!DB.lite||!/^[a-z-]+$/.test(id)){go();return}
if(!DB.places.some(function(p){return p.region===id})){go();return}
fetch('./data/regiony/'+id+'.json').then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(j){
 var full={};(j.places||[]).forEach(function(p){full[p.id]=p});
 DB.places=DB.places.map(function(p){return full[p.id]||p});DB.fullRegion=id;go();
}).catch(fallback);
})();
