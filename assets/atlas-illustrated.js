/* Interactive illustrated geography (Light and Atlas styles), no external image tiles. Decorations never move pins or borders. */
(function atlasArt(){
'use strict';
const palette=['#e8e9bb','#dee8bf','#e4e4b4','#d6e4b7','#efe3b9','#e7ebc8','#deefc7','#dfe6ab','#e7ecbc','#d9e6bb','#e9e6bb','#dfeec1','#eceac4','#d9e5b1','#e8e4b6','#dbe9bd'];
const pick=(seed)=>{const v=Math.sin(seed*127.13+78.45)*43758.5453;return v-Math.floor(v)};
const pointIn=(lon,lat,polygon)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if(((a[1]>lat)!==(b[1]>lat))&&(lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]))hit=!hit}return hit};
const svgpath=(points,project)=>points.map((p,i)=>{const q=project(p[0],p[1]);return(i?'L':'M')+q.x.toFixed(1)+','+q.y.toFixed(1)}).join(' ');
const tree=(x,y,size,idx)=>'<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') scale('+size.toFixed(2)+')" opacity="'+(0.58+pick(idx)*.28).toFixed(2)+'"><path d="M-1 0V-9H1V0Z" fill="#6a6845"/><path d="M0-29 -8-15H-4L-11-7H-6L-14-2H14L6-7H11L4-15H8Z" fill="'+(idx%5===0?'#397d63':idx%3===0?'#568c66':'#6b9f6a')+'"/><path d="M0-27 -4-18H-1L-6-9H-3L-8-4" stroke="#b9cda2" stroke-width=".9" fill="none" opacity=".75"/></g>';
const farmland=(x,y,theta,i)=>'<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+theta+')" opacity=".18"><rect x="-15" y="-7" width="30" height="16" fill="'+(i%2?'#cda45d':'#b8a26f')+'" rx="3"/><path d="M-14-2H14M-14 4H14M-4-6V9M6-6V9" stroke="#fdf1d8" stroke-width="2"/></g>';
const iconGroup=(id)=>{
 const wall='#fcdfb5',shadow='#c69b69',roof='#bb6846',brick='#d18155',line='#435e54';
 const trim='<path d="M9 49Q40 44 72 49" stroke="#6f9663" stroke-width="3" stroke-linecap="round" fill="none"/>';
 const windows=(xs,y,w=3,h=5)=>xs.map(x=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx=".6" fill="#5e897b"/>').join('');
 const tower='<rect x="35" y="12" width="11" height="37" fill="'+wall+'" stroke="'+line+'" stroke-width="1.3"/><path d="M33 12 40 1 48 12Z" fill="'+roof+'"/>'+windows([38,43],22,2,4)+'<rect x="39" y="35" width="4" height="9" rx="2" fill="#678d7c"/>';
 const roofPair='<path d="M10 25 24 11 39 25ZM43 26 58 11 72 26Z" fill="'+roof+'" stroke="'+line+'" stroke-width="1"/>';
 let item='';
 if(id==='warsaw'){
 item='<rect x="5" y="33" width="12" height="17" fill="#9db6ad"/><rect x="62" y="30" width="13" height="20" fill="#a7c6bd"/><path d="M28 47V17L35 12V7L40 2L45 7V12L51 17V47Z" fill="'+wall+'" stroke="'+line+'" stroke-width="1.5"/><path d="M25 19 40 9 55 19" fill="none" stroke="'+roof+'" stroke-width="3"/><path d="M40 2V-4" stroke="'+line+'" stroke-width="2"/>'+windows([31,38,45],22,3,6)+windows([31,38,45],33,3,6)+'<rect x="37" y="13" width="6" height="5" fill="#e9b66f"/>';
 }else if(id==='lodz'){
 item='<rect x="7" y="26" width="64" height="23" fill="'+brick+'" stroke="'+line+'" stroke-width="1.5"/><path d="M6 26 19 17 30 23 40 17 51 23 66 16 72 26Z" fill="'+roof+'"/><rect x="54" y="1" width="8" height="27" fill="'+brick+'" stroke="'+line+'" stroke-width="1.2"/>'+windows([14,24,34,44,54,64],31,5,8)+'<rect x="37" y="40" width="9" height="9" fill="#496b68"/>';
 }else if(id==='katowice'){
 item='<path d="M16 48 20 12 30 12 34 48M15 21H35M19 30H31M17 42H33" stroke="'+line+'" stroke-width="3" fill="none"/><path d="M13 18 36 18" stroke="'+roof+'" stroke-width="2"/><path d="M40 39Q55 21 77 37L70 44H47Z" fill="#819b8a" stroke="'+line+'" stroke-width="2"/><ellipse cx="59" cy="38" rx="22" ry="5" fill="#bed0c5" stroke="'+line+'" stroke-width="1.5"/>';
 }else if(id==='gdansk'){
 item='<path d="M12 49V23L22 15 32 23V49ZM32 49V18L42 7 53 18V49ZM53 49V25L63 14 73 25V49Z" fill="'+wall+'" stroke="'+line+'" stroke-width="1.2"/><path d="M12 23 22 15 32 23M32 18 42 7 53 18M53 25 63 14 73 25" stroke="'+roof+'" stroke-width="3" fill="none"/><path d="M70 7V33M65 12H77M65 13 72 28" stroke="#805b46" stroke-width="2"/>'+windows([18,39,60],28,4,8);
 }else if(id==='krakow'||id==='szczecin'||id==='olsztyn'||id==='lublin'||id==='rzeszow'){
 item='<rect x="9" y="27" width="63" height="22" fill="'+wall+'" stroke="'+line+'" stroke-width="1.2"/><rect x="11" y="14" width="13" height="35" fill="'+shadow+'" stroke="'+line+'" stroke-width="1"/><rect x="56" y="14" width="13" height="35" fill="'+shadow+'" stroke="'+line+'" stroke-width="1"/><path d="M8 14 17 4 27 14ZM54 14 62 4 72 14Z" fill="'+roof+'"/><path d="M26 27 40 10 55 27Z" fill="'+roof+'"/>'+windows([16,30,39,48,61],31,3,6)+'<path d="M37 49V39Q40 33 44 39V49" fill="#638b79"/>';
 }else if(id==='bialystok'){
 item='<rect x="7" y="31" width="66" height="18" fill="'+wall+'" stroke="'+line+'" stroke-width="1.2"/><rect x="30" y="18" width="20" height="31" fill="'+shadow+'" stroke="'+line+'" stroke-width="1"/><path d="M26 18 40 8 54 18Z" fill="'+roof+'"/><path d="M10 31 17 23 26 31M54 31 64 23 72 31" fill="'+roof+'"/>'+windows([15,23,34,43,55,63],35,3,6);
 }else if(id==='torun'||id==='wroclaw'||id==='poznan'||id==='bydgoszcz'){
 item='<rect x="10" y="28" width="62" height="21" fill="'+wall+'" stroke="'+line+'" stroke-width="1.2"/>'+roofPair+'<rect x="34" y="15" width="12" height="34" fill="'+shadow+'" stroke="'+line+'" stroke-width="1"/><path d="M33 15 40 3 47 15Z" fill="'+roof+'"/>'+windows([16,24,38,54,62],31,3,6);
 }else{
 item='<rect x="13" y="27" width="54" height="22" fill="'+wall+'" stroke="'+line+'"/><path d="M11 27 40 10 69 27Z" fill="'+roof+'"/>'+tower+windows([17,25,54,62],32,3,5);
 }
 return '<g class="landmark-drawing"><ellipse cx="40" cy="49" rx="39" ry="6" fill="#7d9f64" opacity=".26"/>'+item+'<path d="M5 49H75" stroke="#78996d" stroke-width="2" fill="none"/>'+trim+'</g>';
};
function decorate({clipped,el,project,path,geo}){
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
window.IWH_ATLAS_ART={decorate,landmark:iconGroup};
})();
