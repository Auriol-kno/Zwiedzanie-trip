/* Interactive illustrated geography (Light and Atlas styles), no external image tiles. Decorations never move pins or borders. */
(function atlasArt(){
'use strict';
const palette=['#e8e9bb','#dee8bf','#e4e4b4','#d6e4b7','#efe3b9','#e7ebc8','#deefc7','#dfe6ab','#e7ecbc','#d9e6bb','#e9e6bb','#dfeec1','#eceac4','#d9e5b1','#e8e4b6','#dbe9bd'];
const pick=(seed)=>{const v=Math.sin(seed*127.13+78.45)*43758.5453;return v-Math.floor(v)};
const pointIn=(lon,lat,polygon)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if(((a[1]>lat)!==(b[1]>lat))&&(lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]))hit=!hit}return hit};
const svgpath=(points,project)=>points.map((p,i)=>{const q=project(p[0],p[1]);return(i?'L':'M')+q.x.toFixed(1)+','+q.y.toFixed(1)}).join(' ');
const tree=(x,y,size,idx)=>'<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') scale('+size.toFixed(2)+')" opacity="'+(0.58+pick(idx)*.28).toFixed(2)+'"><path d="M-1 0V-9H1V0Z" fill="#6a6845"/><path d="M0-29 -8-15H-4L-11-7H-6L-14-2H14L6-7H11L4-15H8Z" fill="'+(idx%5===0?'#397d63':idx%3===0?'#568c66':'#6b9f6a')+'"/><path d="M0-27 -4-18H-1L-6-9H-3L-8-4" stroke="#b9cda2" stroke-width=".9" fill="none" opacity=".75"/></g>';
const farmland=(x,y,theta,i)=>'<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+theta+')" opacity=".18"><rect x="-15" y="-7" width="30" height="16" fill="'+(i%2?'#cda45d':'#b8a26f')+'" rx="3"/><path d="M-14-2H14M-14 4H14M-4-6V9M6-6V9" stroke="#fdf1d8" stroke-width="2"/></g>';
// 8.4 — malowane (akwarelowe) motywy miast: plama farby, światło z lewej góry, miękki „pędzlowy” kontur.
// Bez filtrów SVG (płynny zoom na iPhonie). Gradienty: wspólne <defs> (paintDefs), wstrzykiwane raz na stronę.
const PAINT_DEFS='<linearGradient id="lmWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6E2"/><stop offset="1" stop-color="#E9C796"/></linearGradient>'+
 '<linearGradient id="lmShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EBCB9C"/><stop offset="1" stop-color="#C79763"/></linearGradient>'+
 '<linearGradient id="lmRoof" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EE9566"/><stop offset="1" stop-color="#A9472C"/></linearGradient>'+
 '<linearGradient id="lmBrick" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E59B6E"/><stop offset="1" stop-color="#A2523A"/></linearGradient>'+
 '<linearGradient id="lmCopper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B4E2CC"/><stop offset="1" stop-color="#4A917B"/></linearGradient>'+
 '<linearGradient id="lmGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE6A0"/><stop offset="1" stop-color="#D49A2A"/></linearGradient>'+
 '<linearGradient id="lmStone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6F2E8"/><stop offset="1" stop-color="#BDB4A0"/></linearGradient>'+
 '<linearGradient id="lmSlate" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9AAAB8"/><stop offset="1" stop-color="#55677A"/></linearGradient>'+
 '<linearGradient id="lmTimber" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9A7154"/><stop offset="1" stop-color="#5A3B28"/></linearGradient>'+
 '<linearGradient id="lmWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9DCEC"/><stop offset="1" stop-color="#4F98B6"/></linearGradient>'+
 '<linearGradient id="lmGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5DA88"/><stop offset="1" stop-color="#6FA65A"/></linearGradient>'+
 '<radialGradient id="lmWash" cx=".45" cy=".45" r=".6"><stop offset="0" stop-color="#FFF1CF" stop-opacity=".95"/><stop offset=".7" stop-color="#FBE3B4" stop-opacity=".55"/><stop offset="1" stop-color="#FBE3B4" stop-opacity="0"/></radialGradient>';
function paintDefs(svg){
 if(document.getElementById('lmWall'))return;
 const host=svg||(()=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('width','0');s.setAttribute('height','0');s.setAttribute('aria-hidden','true');s.style.position='absolute';document.body.appendChild(s);return s})();
 const d=document.createElementNS('http://www.w3.org/2000/svg','defs');d.innerHTML=PAINT_DEFS+stampDefs();host.insertBefore(d,host.firstChild);
}
const INK=' stroke="#5A4535" stroke-opacity=".55" stroke-width=".9" stroke-linejoin="round"';
const P=(d,f,extra)=>'<path d="'+d+'" fill="'+f+'"'+INK+(extra||'')+'/>';
const R=(x,y,w,h,f)=>P('M'+x+' '+y+'h'+w+'v'+h+'h-'+w+'Z',f);
const win=(xs,y,w,h,f)=>xs.map(x=>'<rect x="'+x+'" y="'+y+'" width="'+(w||2.4)+'" height="'+(h||4)+'" rx="1" fill="'+(f||'#5F8FA0')+'" opacity=".85"/>').join('');
const arches=(xs,y,w,h)=>xs.map(x=>'<path d="M'+x+' '+(y+h)+'v-'+(h-w/2)+'a'+(w/2)+' '+(w/2)+' 0 0 1 '+w+' 0v'+(h-w/2)+'Z" fill="#7A9AA2" opacity=".8"/>').join('');
const hi=d=>'<path d="'+d+'" fill="none" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round"/>';
const WASH='<path d="M5 45C1 30 15 11 35 10C55 7 76 17 78 33C80 46 66 53 40 53C19 53 8 51 5 45Z" fill="url(#lmWash)"/>';
const GROUND='<path d="M1 48Q21 43 40 46T79 47V53Q40 57 1 53Z" fill="url(#lmGround)"/><path d="M6 49Q27 45 49 48T76 48" fill="none" stroke="#4F7F45" stroke-opacity=".45" stroke-width="1.1" stroke-linecap="round"/>';
const lmTree=(x,y,s)=>'<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><path d="M0-12C-5-8-6-3-4 0H4C6-3 5-8 0-12Z" fill="#4E8E55"'+INK+'/><path d="M0-12C2-8 3-4 2 0H4C6-3 5-8 0-12Z" fill="#2F6B45" opacity=".6"/></g>';
const LM={
 warsaw:()=>R(12,36,56,12,'url(#lmStone)')+R(22,26,36,10,'url(#lmStone)')+R(30,15,20,11,'url(#lmStone)')+R(34,8,12,7,'url(#lmStone)')+P('M38 8 40 0 42 8Z','url(#lmGold)')+
  '<path d="M46 15v11M58 26v10M68 36v12" stroke="#A2977F" stroke-width="2.2" opacity=".6"/>'+win([15,19,23,57,61,65],39,2,6,'#6E8C96')+win([25,29,47,51],29,2,5,'#6E8C96')+win([33,37,41,45],18,1.8,6,'#6E8C96')+hi('M14 37H40M24 27H40M32 16H40'),
 krakow:()=>P('M3 48C10 38 24 34 40 34S70 38 77 48Z','url(#lmGround)')+R(10,30,58,12,'url(#lmWall)')+P('M10 30v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3','none')+
  R(16,14,9,16,'url(#lmShade)')+P('M15 14 20.5 4 26 14Z','url(#lmCopper)')+R(38,21,20,10,'url(#lmWall)')+P('M37 21 48 13 59 21Z','url(#lmRoof)')+P('M43 13a5 5 0 0 1 10 0Z','url(#lmGold)')+P('M47.6 8h.8v-3h-.8Z','url(#lmGold)')+
  R(61,17,7,13,'url(#lmBrick)')+P('M60 17 64.5 9 69 17Z','url(#lmRoof)')+win([18,22],19,1.8,4)+win([41,45,51,55],24,1.8,4)+win([14,24,34,46,56],34,2.2,4)+hi('M11 31H40M39 22H50'),
 gdansk:()=>'<path d="M0 45Q20 42 40 45T80 45V53H0Z" fill="url(#lmWater)"/><path d="M4 48Q14 46 24 48M34 49Q46 47 58 49" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="1" fill="none"/>'+
  R(8,24,13,21,'url(#lmBrick)')+R(30,24,13,21,'url(#lmBrick)')+P('M16 22H36V8H16Z','url(#lmTimber)')+P('M14 9 26 2 38 9Z','url(#lmTimber)')+P('M36 12h8v3h-8Z','url(#lmTimber)')+
  P('M21 45V34a4.5 4.5 0 0 1 9 0V45Z','#5A3B28')+win([11,16,33,38],29,2,4,'#3E5E68')+R(50,26,8,19,'url(#lmWall)')+P('M50 26 54 19 58 26Z','url(#lmRoof)')+R(58,24,8,21,'#F2C46F')+P('M58 24 62 17 66 24Z','url(#lmRoof)')+R(66,27,9,18,'#C9E0D3')+P('M66 27 70.5 20 75 27Z','url(#lmRoof)')+win([52,60,68,71],31,1.8,3.6)+hi('M17 9H34'),
 wroclaw:()=>R(8,27,50,19,'url(#lmWall)')+P('M7 27 18 15H48L59 27Z','url(#lmRoof)')+P('M26 27 33 11 40 27Z','url(#lmWall)')+P('M33 11v-4','none')+P('M24 15l2-5 2 5M38 15l2-5 2 5','none')+
  R(58,12,10,34,'url(#lmShade)')+P('M57 12 63 6 69 12Z','url(#lmCopper)')+P('M60 6a3 3 0 0 1 6 0Z','url(#lmCopper)')+P('M62.6 3h.8v-3h-.8Z','url(#lmGold)')+
  arches([12,20,42,50],34,5,9)+win([31,35],19,1.6,5)+win([60,64],18,1.8,4)+hi('M9 28H30M27 26 33 12'),
 poznan:()=>R(4,30,12,16,'#E7745B')+P('M4 30 10 23 16 30Z','url(#lmRoof)')+R(56,28,10,18,'#F3C65E')+P('M56 28 61 21 66 28Z','url(#lmRoof)')+R(66,31,10,15,'#9ECBA8')+P('M66 31 71 24 76 31Z','url(#lmRoof)')+
  R(16,20,40,26,'url(#lmStone)')+R(16,16,40,4,'url(#lmWall)')+arches([19,25,31,37,43,49],22,4,6)+arches([19,25,31,37,43,49],30,4,6)+arches([19,25,31,37,43,49],38,4,7)+
  R(32,7,8,9,'url(#lmWall)')+P('M31 7 36 0 41 7Z','url(#lmCopper)')+win([7,11,59,62,69,72],34,1.8,4)+hi('M17 21H40'),
 lodz:()=>R(6,24,58,22,'url(#lmBrick)')+P('M6 24l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 4 6Z','url(#lmShade)')+R(65,2,7,44,'url(#lmBrick)')+P('M64 2h9v3h-9Z','#5A3B28')+
  arches([9,16,23,30,37,44,51,58],29,4,7)+arches([9,16,23,30,37,44,51,58],38,4,6)+'<path d="M68 2C64-3 70-6 66-10" stroke="#B9B2A5" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>'+hi('M7 25H40M66 4V30'),
 szczecin:()=>R(10,24,42,22,'url(#lmWall)')+P('M9 24 15 16H47L53 24Z','url(#lmRoof)')+R(52,10,12,36,'url(#lmShade)')+P('M51 10 58 3 65 10Z','url(#lmCopper)')+P('M55 3a3 3 0 0 1 6 0Z','url(#lmCopper)')+P('M57.6 0h.8v-3h-.8Z','url(#lmGold)')+
  arches([13,20,27,34,41],34,5,9)+win([14,21,28,35,42],27,2,4)+win([55,60],16,1.8,4)+win([55,60],26,1.8,4)+'<path d="M0 47Q20 44 40 47T80 46V53H0Z" fill="url(#lmWater)" opacity=".75"/>'+hi('M11 25H30M53 11V30'),
 lublin:()=>R(6,32,22,14,'url(#lmWall)')+P('M6 32 17 25 28 32Z','url(#lmRoof)')+R(52,30,22,16,'url(#lmWall)')+P('M52 30 63 23 74 30Z','url(#lmRoof)')+
  R(28,22,24,25,'url(#lmBrick)')+R(31,11,18,11,'url(#lmWall)')+P('M30 11 40 4 50 11Z','url(#lmSlate)')+P('M36 4a4 4 0 0 1 8 0Z','url(#lmSlate)')+P('M39.6 0h.8v-4h-.8Z','url(#lmGold)')+
  P('M35 47V37a5 5 0 0 1 10 0V47Z','#5A3B28')+win([34,38,42,46],14,1.6,5,'#3E5E68')+win([10,15,20,56,62,68],36,1.8,4)+'<circle cx="40" cy="28" r="3" fill="#FFF6E2"'+INK+'/>'+hi('M29 23H40M32 12H40'),
 katowice:()=>P('M8 46 12 14H20L24 46','none')+P('M12 14 24 46M20 14 8 46M10 30H22','none')+'<circle cx="16" cy="11" r="5" fill="none"'+INK+' stroke-width="1.6"/>'+P('M14 6h4v2h-4Z','#C94B33')+
  P('M24 34C30 24 64 24 74 34C64 39 30 39 24 34Z','url(#lmStone)')+P('M28 34C34 30 64 30 70 34','none')+'<path d="M30 36.5C38 38.5 60 38.5 68 36.5" stroke="#6A7C88" stroke-width="1.4" fill="none" opacity=".7"/>'+
  P('M34 37 30 46M49 38V46M64 37 68 46','none')+P('M24 46H74V48H24Z','url(#lmShade)')+hi('M30 31C40 27 58 27 66 30'),
 bialystok:()=>R(6,28,68,18,'url(#lmWall)')+P('M5 28 12 22H68L75 28Z','url(#lmSlate)')+R(30,18,20,28,'url(#lmWall)')+P('M28 18 40 9 52 18Z','url(#lmWall)')+P('M36 9a4 4 0 0 1 8 0Z','url(#lmGold)')+P('M39.6 1h.8v-4h-.8Z','url(#lmGold)')+
  R(6,22,8,24,'url(#lmShade)')+P('M5 22a5 5 0 0 1 10 0Z','url(#lmSlate)')+R(66,22,8,24,'url(#lmShade)')+P('M65 22a5 5 0 0 1 10 0Z','url(#lmSlate)')+
  win([17,22,27,53,58,63],32,2,6)+arches([33,38,43],34,4,12)+'<circle cx="40" cy="14" r="2" fill="#D49A2A"/>'+hi('M7 29H30M31 19H40'),
 rzeszow:()=>R(14,24,48,22,'url(#lmWall)')+P('M13 24 20 17H56L63 24Z','url(#lmRoof)')+R(10,18,8,28,'url(#lmShade)')+P('M9 18 14 10 19 18Z','url(#lmCopper)')+R(58,18,8,28,'url(#lmShade)')+P('M57 18 62 10 67 18Z','url(#lmCopper)')+
  R(34,8,8,16,'url(#lmWall)')+P('M33 8 38 1 43 8Z','url(#lmGold)')+arches([20,27,45,52],34,5,10)+win([36],12,2,5)+win([20,27,45,52],27,2,4)+P('M35 46V36a3 3 0 0 1 6 0V46Z','#5A3B28')+hi('M15 25H36'),
 torun:()=>R(8,22,48,24,'url(#lmBrick)')+P('M8 22h4v-5h4v5h8v-5h4v5h8v-5h4v5h8v-5h4v5','none')+R(46,2,10,44,'url(#lmBrick)')+P('M45 2 51-4 57 2Z','url(#lmRoof)')+
  arches([12,19,26,33,40],27,4,9)+arches([12,19,26,33,40],37,4,8)+win([48.5,52.5],8,1.6,6,'#3E5E68')+win([48.5,52.5],20,1.6,6,'#3E5E68')+R(60,30,14,16,'#EBC79B')+P('M60 30 67 21 74 30Z','url(#lmRoof)')+win([63,68],35,2,4)+hi('M9 23H30M47 3V24'),
 olsztyn:()=>R(8,24,40,22,'url(#lmBrick)')+P('M7 24 14 15H42L49 24Z','url(#lmRoof)')+R(48,6,14,40,'url(#lmBrick)')+P('M48 6v-3h3v3h3v-3h3v3h3v-3h2v3','none')+R(62,28,10,18,'url(#lmShade)')+P('M61 28 67 21 73 28Z','url(#lmRoof)')+
  win([12,19,26,33,40],29,2,5,'#3E5E68')+arches([52,57],12,3,8)+win([52,56],26,1.8,5,'#3E5E68')+P('M24 46V38a3.5 3.5 0 0 1 7 0V46Z','#5A3B28')+lmTree(4,47,1)+lmTree(76,47,.9)+hi('M9 25H28M49 7V30'),
 kielce:()=>R(12,24,56,22,'url(#lmWall)')+P('M11 24 18 17H62L69 24Z','url(#lmSlate)')+R(8,18,10,28,'url(#lmShade)')+R(62,18,10,28,'url(#lmShade)')+
  P('M7 18C7 13 13 9 13 4C13 9 19 13 19 18Z','url(#lmSlate)')+P('M61 18C61 13 67 9 67 4C67 9 73 13 73 18Z','url(#lmSlate)')+P('M12.6 4h.8v-4h-.8ZM66.6 4h.8v-4h-.8Z','url(#lmGold)')+
  arches([24,31,38,45,52],36,5,10)+win([24,31,38,45,52],27,2,5)+win([11,15,65,69],24,1.6,4)+R(30,12,20,5,'url(#lmWall)')+P('M30 12 40 6 50 12Z','url(#lmSlate)')+hi('M13 25H40M9 19V36')
};
// 8.5 — styl 5 „znaczek pocztowy”: ząbkowany znaczek, jednobarwny rytowany rysunek (kreskowanie), nazwa miasta.
// Ten sam rysunek co w 8.4, przemalowany na tusz danego miasta; odwiedzone miasto dostaje stempel „✓”.
const STAMP_INK=['#8E2F25','#1F4E6E','#2F5B3A','#5B3A78','#8A4B12','#1E5B5B'];
const CITY_ORDER=['warsaw','krakow','gdansk','wroclaw','poznan','lodz','szczecin','torun','lublin','bialystok','katowice','rzeszow','kielce','olsztyn'];
const CITY_NAME={warsaw:'Warszawa',krakow:'Kraków',gdansk:'Gdańsk',wroclaw:'Wrocław',poznan:'Poznań',lodz:'Łódź',szczecin:'Szczecin',torun:'Toruń',lublin:'Lublin',bialystok:'Białystok',katowice:'Katowice',rzeszow:'Rzeszów',kielce:'Kielce',olsztyn:'Olsztyn'};
const STAMP_PAPER='#F6EEDA';
const lum=h=>{const n=parseInt(h.slice(1),16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
const PERF=(()=>{let c='';for(let x=10;x<=70;x+=4.3)c+='<circle cx="'+x.toFixed(1)+'" cy="-5" r="1.5"/><circle cx="'+x.toFixed(1)+'" cy="55" r="1.5"/>';for(let y=-1;y<=52;y+=4.3)c+='<circle cx="8" cy="'+y.toFixed(1)+'" r="1.5"/><circle cx="72" cy="'+y.toFixed(1)+'" r="1.5"/>';return c})();
function stampDefs(){
 return STAMP_INK.map((ink,i)=>'<pattern id="lmH'+i+'" width="1.7" height="1.7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V1.7" stroke="'+ink+'" stroke-width=".6"/></pattern>').join('')+
  '<mask id="lmPerf" maskUnits="userSpaceOnUse" x="0" y="-8" width="80" height="66"><rect x="0" y="-8" width="80" height="66" fill="#fff"/><g fill="#000">'+PERF+'</g></mask>';
}
function stampify(svg,ink,hatch){
 return svg
  .replace(/fill="url\(#lm(Wall|Stone)\)"/g,'fill="'+STAMP_PAPER+'"')
  .replace(/fill="url\(#lm(Shade|Brick|Ground|Water)\)"/g,'fill="url(#'+hatch+')"')
  .replace(/fill="url\(#lm(Roof|Slate|Copper|Timber|Gold)\)"/g,'fill="'+ink+'"')
  .replace(/fill="(#[0-9A-Fa-f]{6})"/g,(m,h)=>'fill="'+(lum(h)>.55?STAMP_PAPER:ink)+'"')
  .replace(/stroke="#5A4535" stroke-opacity="\.55"/g,'stroke="'+ink+'" stroke-opacity=".95"')
  .replace(/stroke="#4F7F45" stroke-opacity="\.45"/g,'stroke="'+ink+'" stroke-opacity=".8"')
  .replace(/stroke="#FFFFFF" stroke-opacity="\.5"/g,'stroke="none"')
  .replace(/stroke="#(B9B2A5|A2977F|6A7C88|9FD6EE|E6F6FC)"/g,'stroke="'+ink+'"');
}
// opts: {name, visited}
const iconGroup=(id,opts)=>{
 const o=opts||{},i=Math.max(0,CITY_ORDER.indexOf(id))%STAMP_INK.length,ink=STAMP_INK[i],name=o.name||CITY_NAME[id]||'';
 const art=stampify(GROUND+(LM[id]||LM.krakow)(),ink,'lmH'+i);
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const post=o.visited?'<g class="stamp-postmark" opacity=".7" fill="none" stroke="#1C2940" stroke-width="1.1"><circle cx="61" cy="5" r="8"/><path d="M57 5.2l2.6 2.6 5-5.4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 1Q43-2 48 1T58 1M38 5Q43 2 48 5" stroke-width=".8"/></g>':'';
 return '<g class="landmark-drawing stamp'+(o.visited?' visited':'')+'"><g filter="none"><rect x="8.6" y="-4.4" width="62.8" height="58.8" fill="#1C2940" opacity=".18" transform="translate(1.2 1.6)" mask="url(#lmPerf)"/><rect x="8" y="-5" width="64" height="60" fill="#FFFFFF" mask="url(#lmPerf)"/></g>'+
  '<rect x="12" y="-1" width="56" height="43" fill="'+STAMP_PAPER+'" stroke="'+ink+'" stroke-width=".9"/>'+
  '<svg x="12" y="-1" width="56" height="43" viewBox="0 -6 80 62" preserveAspectRatio="xMidYMid meet" overflow="hidden">'+art+'</svg>'+
  '<text x="40" y="50.6" text-anchor="middle" font-family="Georgia,\'Playfair Display\',serif" font-style="italic" font-weight="700" font-size="6.6" fill="'+ink+'">'+esc(name)+'</text>'+post+'</g>';
};
function decorate({clipped,el,project,path,geo}){
 paintDefs(clipped.ownerSVGElement);
 if(!geo?.regions?.length)return;
 const regional=el('g',{class:'province-layer'});
 geo.regions.forEach((r,i)=>{const q=el('path',{class:'atlas-province',d:path(r.coords),fill:palette[i%palette.length]});regional.appendChild(q)});
 clipped.appendChild(regional);
 const fields=el('g',{class:'atlas-farmland'});
 for(let i=1;i<120;i++){const lon=14.5+pick(i*14)*8.9,lat=49.75+pick(i*31)*4.2;
   if(pointIn(lon,lat,geo.border)&&Math.abs(lon-21.01)+Math.abs(lat-52.23)>0.3){const p=project(lon,lat);fields.innerHTML+=farmland(p.x,p.y,Math.round(pick(i*19)*140),i)}
 }
 clipped.appendChild(fields);
 const hills=el('g',{class:'atlas-hills'});
 const hillsCoords=[[15.5,50.6],[16.5,50.15],[18.4,49.88],[19.75,49.38],[20.4,49.42],[21.0,49.45],[22.7,49.35]];
 for(let i=0;i<hillsCoords.length;i++){let [lon,lat]=hillsCoords[i],p=project(lon,lat);hills.innerHTML+='<g transform="translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')"><path d="M-37 12 0-31 39 12Z" fill="#8ba28c" opacity=".68"/><path d="M-13-16 0-31 14-15 6-17 1-14-4-18Z" fill="#f6f0d8" opacity=".9"/><path d="M-37 12Q1 0 39 12" stroke="#577d69" stroke-width="2" fill="none" opacity=".7"/></g>'}
 clipped.appendChild(hills);
 const greenery=el('g',{class:'atlas-forest'});
 const zones=[[17.0,53.7,1.5,.65],[21.4,53.85,1.2,.6],[23.1,52.6,.65,.75],[15.2,52.2,.6,1],[16.3,50.75,.9,.6],[22.3,49.6,1.1,.6],[19.5,51.7,.7,.5],[20.3,50.6,.6,.4]];
 let n=0;
 for(let zi=0;zi<zones.length;zi++){const [lon0,lat0,rx,ry]=zones[zi];
   for(let t=0;t<26;t++){const lo=lon0+(pick(zi*100+t*8)-.5)*2*rx,la=lat0+(pick(zi*130+t*5)-.5)*2*ry;
     if(!pointIn(lo,la,geo.border))continue;const pt=project(lo,la);greenery.innerHTML+=tree(pt.x,pt.y,.38+pick(zi*290+t*7)*.33,n++);}
 }
 clipped.appendChild(greenery);
 const water=el('g',{class:'atlas-water'});
 // Rzeki i jeziora z Natural Earth 1:10m (geo.rivers, geo.lakes); grubość według rangi rzeki.
 const rank=geo.riverRank||{Vistula:3,Oder:3};
 for(const [river,sets] of Object.entries(geo.rivers||{})){
   const rk=rank[river]||1;
   sets.forEach(line=>{water.appendChild(el('path',{class:'atlas-geo-river rank-'+rk,'data-river':river,d:svgpath(line,project),stroke:rk===3?'#5fb0d2':rk===2?'#6db8d4':'#84c2d6','stroke-width':rk===3?3.1:rk===2?2.2:1.4}))});
 }
 if(geo.lakes&&geo.lakes.length){geo.lakes.forEach(l=>water.appendChild(el('path',{class:'atlas-geo-lake',d:path(l.coords)})))}
 else{
  const lakeCoords=[[21.65,53.83,13,5],[21.92,53.86,12,4],[21.50,53.74,16,4],[22.00,53.68,14,4],[20.55,54.05,9,3],[21.28,53.71,11,3]];
  lakeCoords.forEach(([lon,lat,rx,ry],i)=>{const p=project(lon,lat);water.appendChild(el('ellipse',{class:'atlas-geo-lake',cx:p.x,cy:p.y,rx,ry,transform:'rotate('+((i%3-1)*17)+' '+p.x+' '+p.y+')'}))});
 }
 clipped.appendChild(water);
}
window.IWH_ATLAS_ART={decorate,landmark:iconGroup,paintDefs,cities:CITY_ORDER,cityName:id=>CITY_NAME[id]||id};
})();
