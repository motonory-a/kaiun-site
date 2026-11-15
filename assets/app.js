
(async function(){
const RG=['23区','東京市町村','神奈川','埼玉','千葉'];
const D=(await fetch('/assets/towns.json?v=202611152141').then(r=>r.json())).map(r=>({ward:r[0],town:r[1],lat:r[2],lng:r[3],score:r[4],url:r[5],ty:r[6],rank:r[7],rg:r[8]}));
const $=id=>document.getElementById(id);const TN=['金運','縁結び・恋愛','仕事・勝運','学業','子宝・安産','健康・厄除'];
// 地図（canvas）
const cv=$('map');if(cv){const ctx=cv.getContext('2d'),tip=$('tip');const W=cv.width,H=cv.height,pad=10;const la=D.map(d=>d.lat),lo=D.map(d=>d.lng);const la0=Math.min(...la),la1=Math.max(...la),lo0=Math.min(...lo),lo1=Math.max(...lo);const k=Math.cos(35.7*Math.PI/180);const s=Math.min((W-2*pad)/((lo1-lo0)*k),(H-2*pad)/(la1-la0));const ox=(W-(lo1-lo0)*k*s)/2,oy=(H-(la1-la0)*s)/2;
const col=v=>{const t=Math.min(1,v/60);const a=[240,226,196],b=[178,45,45];return 'rgb('+a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',')+')';};
const P=[...D].sort((a,b)=>a.score-b.score).map(d=>({d,x:ox+(d.lng-lo0)*k*s,y:H-(oy+(d.lat-la0)*s)}));
P.forEach(p=>{ctx.fillStyle=col(p.d.score);ctx.beginPath();ctx.arc(p.x,p.y,p.d.score>=50?2.6:1.7,0,7);ctx.fill();});
const hit=e=>{const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;const rr=(14*W/r.width)**2;let b=null,bd=rr;for(const p of P){const q=(p.x-x)**2+(p.y-y)**2;if(q<bd){bd=q;b=p;}}return b;};
cv.addEventListener('mousemove',e=>{const p=hit(e);if(!p){tip.style.display='none';return;}tip.textContent=p.d.ward+p.d.town+' '+p.d.score+'点';tip.style.display='block';tip.style.left=Math.min(e.clientX+10,innerWidth-200)+'px';tip.style.top=(e.clientY-30)+'px';});
cv.addEventListener('mouseleave',()=>tip.style.display='none');cv.addEventListener('click',e=>{const p=hit(e);if(p)location.href=p.d.url;});}
// 検索・並べ替え
const list=$('list');if(!list)return;const q=$('q'),so=$('sort'),wd=$('ward'),rs=$('rg');let shown=30;
const W23='千代田区,中央区,港区,新宿区,文京区,台東区,墨田区,江東区,品川区,目黒区,大田区,世田谷区,渋谷区,中野区,杉並区,豊島区,北区,荒川区,板橋区,練馬区,足立区,葛飾区,江戸川区'.split(',');const wk=d=>d.rg*1000+(d.rg==0?W23.indexOf(d.ward):+((d.url.match(/\/c(\d+)\//)||[0,999])[1]));
function wards(){if(!wd)return;wd.length=1;const m=new Map();D.filter(d=>!rs||rs.value===''||d.rg==rs.value).forEach(d=>{if(!m.has(d.ward))m.set(d.ward,wk(d));});[...m.keys()].sort((a,b)=>m.get(a)-m.get(b)).forEach(w=>{const o=document.createElement('option');o.value=w;o.textContent=w;wd.append(o);});}
wards();
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function render(){let a=D.filter(d=>(!rs||rs.value===''||d.rg==rs.value)&&(!wd||!wd.value||d.ward===wd.value)&&(!q.value||(d.ward+d.town).includes(q.value.trim())));const v=so.value;if(/^t\d$/.test(v)){const k=+v[1];a=[...a].sort((x,y)=>y.ty[k]-x.ty[k]||y.score-x.score);}list.textContent='';
a.slice(0,shown).forEach(d=>{const c=el('a','card');c.href=d.url;const r=el('div','row');const rk=el('span','rank',d.rank+'位');rk.append(el('small',null,RG[d.rg]));const n=el('span','name',d.town);n.prepend(el('small',null,d.ward));const sc=el('span','score',String(d.score));sc.append(el('small',null,' 点'));r.append(rk,n,sc);c.append(r);const b=el('div','bar'),i=el('i');i.style.width=d.score+'%';b.append(i);c.append(b);const bd=el('div','badges');TN.map((t,j)=>[t,d.ty[j]]).filter(x=>x[1]>=2).sort((x,y)=>y[1]-x[1]).slice(0,3).forEach(([t,v])=>bd.append(el('span','luck',t+'★'.repeat(v))));c.append(bd);list.append(c);});
$('more').style.display=a.length>shown?'block':'none';$('count').textContent=a.length.toLocaleString()+'件';if(!a.length)list.append(el('p','hint','条件に合う町が見つかりませんでした。町名の一部（例：「本町」）で探してみてください。'));}
if(rs)rs.onchange=()=>{wards();shown=30;render();};
const hs=location.hash.match(/^#(t[0-5])$/);if(hs){so.value=hs[1];}
addEventListener('hashchange',()=>{const h=location.hash.match(/^#(t[0-5])$/);if(h){so.value=h[1];shown=30;render();}});
[q,so,wd].forEach(x=>x&&(x.oninput=x.onchange=()=>{shown=30;render();}));$('more').onclick=()=>{shown+=30;render();};render();
})();
