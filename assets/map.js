(async function(){
const el=document.getElementById('kmap');if(!el||!window.L)return;
const RG=['23区','東京市町村','神奈川','埼玉','千葉'];const TN=['金運','縁結び・恋愛','仕事・勝運','学業','子宝・安産','健康・厄除'];
const D=(await fetch('/assets/towns.json?v=202611152105').then(r=>r.json())).map(r=>({ward:r[0],town:r[1],lat:r[2],lng:r[3],score:r[4],url:r[5],ty:r[6],rank:r[7],rg:r[8]}));
const map=L.map(el,{preferCanvas:true,zoomControl:true,attributionControl:true,minZoom:8,maxZoom:17}).setView([35.68,139.75],10);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',{maxZoom:18,attribution:'<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>'}).addTo(map);
const rend=L.canvas({padding:0.3});
const col=t=>{t=Math.max(0,Math.min(1,t));const a=[246,214,140],b=[178,30,30];return 'rgb('+a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',')+')';};
let mode='score';const val=d=>mode==='score'?d.score/60:d.ty[+mode]/5;
let layer=L.layerGroup().addTo(map);
const P80={},P50={};[0,1,2,3,4].forEach(r=>{const a=D.filter(d=>d.rg===r).map(d=>d.score).sort((x,y)=>x-y);P80[r]=a[Math.floor(a.length*.8)]||0;P50[r]=a[Math.floor(a.length*.5)]||0;});
function draw(){layer.clearLayers();const z=map.getZoom();const base=z>=15?8:z>=14?7:z>=13?5.5:z>=12?4:2.8;const bnd=map.getBounds().pad(0.2);
 const P=[...D].sort((a,b)=>val(a)-val(b));let lab=[];
 for(const d of P){const v=val(d);if(mode!=='score'&&v<=0)continue;
  if(mode==='score'){if(z<=11&&d.score<P80[d.rg])continue;if(z===12&&d.score<P50[d.rg])continue;}else if(z<=11&&v<0.6)continue;
  if(z>=12&&!bnd.contains([d.lat,d.lng]))continue;
  const m=L.circleMarker([d.lat,d.lng],{renderer:rend,radius:base*(v>=0.66?1.4:v>=0.4?1.15:1),stroke:z>=13,color:'#fff',weight:1,fillColor:col(v),fillOpacity:v>=0.4?0.88:0.55});m.d=d;m.on('click',()=>openTown(d,m));layer.addLayer(m);
  if(z>=14&&v>=0.5)lab.push(m);}
 lab.slice(-25).forEach(m=>m.bindTooltip(`${esc(m.d.town)} ${m.d.score}点`,{permanent:true,direction:'top',className:'tl',offset:[0,-4]}).openTooltip());
 const n=document.getElementById('knote');if(n)n.textContent=z<=12?'いまは点数の高い町だけ表示中。拡大するとすべての町が出ます':'すべての町を表示中';}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
async function openTown(d,m){const tl=TN.map((t,i)=>[t,d.ty[i]]).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,v])=>`<span class=luck>${t}${'★'.repeat(v)}</span>`).join('');
 const head=`<div class=pp><div class=pp-w>${esc(d.ward)}</div><div class=pp-t>${esc(d.town)}</div><div class=pp-s><b>${d.score}</b>点 <small>${RG[d.rg]}で${d.rank}位</small></div><div class=bar><i style="width:${d.score}%"></i></div>`;
 const pop=L.popup({maxWidth:280}).setLatLng(m.getLatLng()).setContent(head+`<div class=badges>${tl}<span>読み込み中…</span></div><a class="btn pp-b" href="${d.url}">この町をくわしく見る</a></div>`).openOn(map);
 try{const h=await (await fetch(d.url)).text();const doc=new DOMParser().parseFromString(h,'text/html');const b=doc.querySelector('.badges');pop.setContent(head+`<div class=badges>${b?b.innerHTML:tl}</div><a class="btn pp-b" href="${d.url}">この町をくわしく見る</a></div>`);}catch(e){}}
draw();map.on('zoomend moveend',draw);
const sel=document.getElementById('kmode');if(sel)sel.onchange=()=>{mode=sel.value;draw();};
const me=document.getElementById('kme');if(me)me.onclick=()=>{if(!navigator.geolocation){alert('この端末では現在地が使えません');return}me.textContent='探しています…';navigator.geolocation.getCurrentPosition(p=>{map.setView([p.coords.latitude,p.coords.longitude],14);L.circleMarker([p.coords.latitude,p.coords.longitude],{radius:8,color:'#1a73e8',fillColor:'#1a73e8',fillOpacity:.9}).addTo(map);me.textContent='📍 現在地の周り';},()=>{me.textContent='📍 現在地の周り';alert('現在地を取得できませんでした');},{timeout:10000});};
const q=document.getElementById('kq'),sg=document.getElementById('ksg');
if(q&&sg){q.oninput=()=>{const s=q.value.trim();sg.textContent='';if(!s)return;D.filter(d=>(d.ward+d.town).includes(s)).sort((a,b)=>b.score-a.score).slice(0,8).forEach(d=>{const a=document.createElement('button');a.type='button';a.innerHTML=`${esc(d.ward)} <b>${esc(d.town)}</b> <small>${d.score}点</small>`;a.onclick=()=>{map.setView([d.lat,d.lng],15);sg.textContent='';q.value=d.ward+d.town;setTimeout(()=>{layer.eachLayer(m=>{if(m.d===d)openTown(d,m)})},350);el.scrollIntoView({behavior:'smooth',block:'center'});};sg.append(a);});};}
const h=location.hash.match(/^#@([\d.]+),([\d.]+)/);if(h){map.setView([+h[1],+h[2]],15);}
})();
