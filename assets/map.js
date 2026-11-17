(async function(){
const el=document.getElementById('kmap');if(!el||!window.L)return;
const RG=["23区", "東京市町村", "神奈川", "埼玉", "千葉", "大阪", "京都", "兵庫", "愛知", "福岡"],PF=["東京都", "東京都", "神奈川県", "埼玉県", "千葉県", "大阪府", "京都府", "兵庫県", "愛知県", "福岡県"],RN=[3140, 2145, 4862, 5340, 5743, 8615, 7466, 8983, 14560, 6191],PCT=(r,g)=>Math.max(1,Math.ceil(r*100/RN[g])),TL=p=>p<=1?'最上位':p<=10?'上位':p<=30?'中の上':p<=70?'中堅':'ひかえめ';const TN=['金運','縁結び・恋愛','仕事・勝運','学業','子宝・安産','健康・厄除'];
const BB=[[35.541, 139.567, 35.817, 139.916], [35.504, 139.0, 35.858, 139.593], [35.133, 139.005, 35.652, 139.776], [35.755, 138.785, 36.281, 139.894], [34.909, 139.759, 36.099, 140.864], [34.291, 135.106, 35.036, 135.74], [34.711, 134.865, 35.763, 136.024], [34.168, 134.267, 35.662, 135.459], [34.583, 136.675, 35.408, 137.782], [33.004, 130.036, 33.993, 131.181]];const D=[];const LD={};
const loadRg=i=>LD[i]||(LD[i]=fetch('/assets/towns-'+i+'.json?v=202611171217').then(r=>r.json()).then(a=>{a.forEach(r=>D.push({ward:r[0],town:r[1],lat:r[2],lng:r[3],score:r[4],url:r[5],ty:r[6],rank:r[7],rg:r[8]}))}));
const need=b=>Promise.all(BB.map((x,i)=>(x[0]<=b.getNorth()&&x[2]>=b.getSouth()&&x[1]<=b.getEast()&&x[3]>=b.getWest())?loadRg(i):null));
const loadAll=()=>Promise.all(BB.map((x,i)=>loadRg(i)));
const map=L.map(el,{preferCanvas:true,zoomControl:false,minZoom:8,maxZoom:18}).setView([35.69,139.74],13);
L.control.zoom({position:'bottomright'}).addTo(map);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',{maxZoom:18,attribution:'<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>'}).addTo(map);
const rend=L.canvas({padding:0.3});
const pin=(w,body,ring,txt,glow)=>{const h=Math.round(w*32/26);return L.divIcon({className:'kpin'+(glow?' kgold':''),iconSize:[w,h],iconAnchor:[w/2,h-1],popupAnchor:[0,-h+4],html:`<svg viewBox="0 0 26 32" width="${w}" height="${h}"><path d="M13 31C13 31 2 19.5 2 12.5A11 11 0 0 1 24 12.5C24 19.5 13 31 13 31Z" fill="${body}" stroke="#fff" stroke-width="2"/><circle cx="13" cy="12.5" r="7.2" fill="${ring}"/><text x="13" y="16" font-size="9.5" text-anchor="middle" fill="${txt}" font-weight="700" font-family="sans-serif">福</text></svg>`})};
const PIN={top:pin(34,'#d9a514','#fff4c7','#b22d2d',1),hi:pin(27,'#b22d2d','#f6d36b','#7a1d1d'),mid:pin(20,'#b58a6e','#f3e3d3','#7a4a35')};
let mode='score';const val=d=>mode==='score'?d.score:d.ty[+mode]*12;
const tier=d=>{if(mode==='score'){const p=PCT(d.rank,d.rg);return p<=10?'top':p<=30?'hi':p<=70?'mid':'lo'}const v=d.ty[+mode];return v>=5?'top':v>=4?'hi':v>=2?'mid':'lo';};
let layer=L.layerGroup().addTo(map);
function draw(){layer.clearLayers();const z=map.getZoom();const bnd=map.getBounds().pad(0.15);const note=document.getElementById('knote');
 const vis=D.filter(d=>bnd.contains([d.lat,d.lng]));
 if(z<13){vis.map(d=>[d,tier(d)]).filter(x=>x[1]==='top'||x[1]==='hi').sort((a,b)=>(a[1]==='top')-(b[1]==='top')).forEach(([d,t])=>{const g=t==='top';const m=L.circleMarker([d.lat,d.lng],{renderer:rend,radius:(z>=12?5:z>=11?3.5:2.5)+(g?1.5:0),stroke:g,color:'#fff',weight:1,fillColor:g?'#d9a514':'#b22d2d',fillOpacity:g?.95:.7});m.d=d;m.on('click',()=>openTown(d,m));layer.addLayer(m);});
  if(note)note.textContent='地図を拡大すると、開運物件の印（福）が表示されます';return;}
 if(note)note.textContent='印を押すと、その町が開運物件である理由が出ます';
 const lo=[],ic=[];vis.forEach(d=>{const t=tier(d);(t==='lo'?lo:ic).push([d,t]);});
 lo.forEach(([d])=>{const m=L.circleMarker([d.lat,d.lng],{renderer:rend,radius:4,color:'#fff',weight:1,fillColor:'#d9b98a',fillOpacity:.8});m.d=d;m.on('click',()=>openTown(d,m));layer.addLayer(m);});
 ic.sort((a,b)=>val(a[0])-val(b[0])).slice(-500).forEach(([d,t])=>{const m=L.marker([d.lat,d.lng],{icon:PIN[t],zIndexOffset:t==='top'?1000:t==='hi'?500:0,title:d.ward+d.town});m.d=d;m.on('click',()=>openTown(d,m));layer.addLayer(m);});}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
async function openTown(d,m){const tl=TN.map((t,i)=>[t,d.ty[i]]).filter(x=>x[1]>=2).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,v])=>`<span class=luck>${t}${'★'.repeat(v)}</span>`).join('');
 const pref=PF[d.rg]||'';
 const head=`<div class=pp><div class=pp-t>${esc(pref+d.ward+d.town)}</div><table class=pp-tb><tr><th>開運スコア</th><td><b>${d.score}</b>点</td></tr><tr><th>順位</th><td>${RG[d.rg]}で${d.rank}位／${RN[d.rg].toLocaleString()}町<br>上位${PCT(d.rank,d.rg)}%（<b>${TL(PCT(d.rank,d.rg))}</b>）</td></tr></table>`;
 const foot=`<div class=pp-l><a href="${d.url}">この町の開運スコアをくわしく見る</a><a href="/post.html?area=${encodeURIComponent(pref+d.ward+d.town)}">この町の体験談を投稿する</a></div></div>`;
 const pop=L.popup({maxWidth:300,minWidth:240}).setLatLng(m.getLatLng()).setContent(head+`<div class=pp-h>開運の理由</div><div class=badges>${tl}<span>読み込み中…</span></div>`+foot).openOn(map);
 try{const h=await (await fetch(d.url)).text();const doc=new DOMParser().parseFromString(h,'text/html');const b=doc.querySelector('.badges');pop.setContent(head+`<div class=pp-h>開運の理由</div><div class=badges>${b?b.innerHTML:tl}</div>`+foot);}catch(e){}}
const refresh=()=>{draw();need(map.getBounds().pad(0.3)).then(draw)};map.on('zoomend moveend',refresh);
const sel=document.getElementById('kmode');if(sel)sel.onchange=()=>{mode=sel.value;draw();};
const me=document.getElementById('kme');if(me)me.onclick=()=>{if(!navigator.geolocation){alert('この端末では現在地が使えません');return}me.textContent='…';navigator.geolocation.getCurrentPosition(p=>{map.setView([p.coords.latitude,p.coords.longitude],15);L.circleMarker([p.coords.latitude,p.coords.longitude],{radius:8,color:'#fff',weight:2,fillColor:'#1a73e8',fillOpacity:1}).addTo(map);me.textContent='📍';},()=>{me.textContent='📍';alert('現在地を取得できませんでした');},{timeout:10000});};
const q=document.getElementById('kq'),sg=document.getElementById('ksg');
if(q&&sg){q.onfocus=()=>loadAll();q.oninput=async()=>{const s=q.value.trim();if(s)await loadAll();if(q.value.trim()!==s)return;sg.textContent='';if(!s)return;D.filter(d=>(d.ward+d.town).includes(s)).sort((a,b)=>b.score-a.score).slice(0,8).forEach(d=>{const a=document.createElement('button');a.type='button';a.innerHTML=`${esc(d.ward)} <b>${esc(d.town)}</b> <small>${d.score}点</small>`;a.onclick=()=>{map.setView([d.lat,d.lng],16);sg.textContent='';q.value=d.ward+d.town;q.blur();setTimeout(()=>{let hit=null;layer.eachLayer(x=>{if(x.d===d)hit=x});openTown(d,hit||L.marker([d.lat,d.lng]));},400);};sg.append(a);});};}
const h=location.hash.match(/^#@([\d.]+),([\d.]+)/);if(h){map.setView([+h[1],+h[2]],16);}
const jp=document.getElementById('kjump');if(jp)jp.onchange=()=>{if(!jp.value)return;const [a,b]=jp.value.split(',');map.setView([+a,+b],13);jp.value='';};
refresh();
})();
