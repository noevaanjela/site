(function () {
  if (!document.getElementById("sib-game")) return;
  const $ = s => document.querySelector("#sib-game " + s), fmt = n => Math.floor(n).toLocaleString("ru-RU");

const BONUS=[[10,"Скидка 1 ₽/л на одну заправку","SIB-10"],[50,"Бесплатный кофе на АЗС","SIB-50"],[200,"Скидка 3 ₽/л на одну заправку","SIB-200"],[1000,"Бонусная карта «СиБонус»: 500 баллов","SIB-1000"]];
const UPS=[{id:"bit",n:"Алмазное долото",d:"+1 м за клик",base:15,k:1.6},{id:"pump",n:"Станок-качалка",d:"+1 бочка в секунду",base:40,k:1.55},{id:"well",n:"Новая скважина",d:"+3 бочки в секунду",base:200,k:1.8},{id:"price",n:"Контракт с АЗС",d:"+5 ₽ за бочку",base:120,k:1.7}];
const fresh=()=>({depth:0,bar:0,money:0,total:0,lv:{bit:0,pump:0,well:0,price:0}});
let S=fresh();
try{const r=localStorage.getItem("siboil-game");if(r)S=Object.assign(fresh(),JSON.parse(r))}catch(e){}
function pop(t,x,y){const e=document.createElementNS("http://www.w3.org/2000/svg","text");e.setAttribute("x",x);e.setAttribute("y",y);e.setAttribute("class","pop");e.setAttribute("text-anchor","middle");e.textContent=t;$("#sc").appendChild(e);setTimeout(()=>e.remove(),900)}
const cost=u=>Math.round(u.base*Math.pow(u.k,S.lv[u.id]));
const perSec=()=>S.lv.pump+3*S.lv.well, step=()=>1+S.lv.bit, price=()=>10+5*S.lv.price;
function save(){try{localStorage.setItem("siboil-game",JSON.stringify(S))}catch(e){}}
function render(){
 const found=S.depth>=100;
 $("#sDepth").textContent=fmt(S.depth)+" м";$("#sBar").textContent=fmt(S.bar);$("#sMoney").textContent=fmt(S.money)+" ₽";$("#sTotal").textContent=fmt(S.total);
 $("#boreR").setAttribute("height",Math.min(S.depth,100)*.85);$("#gush").setAttribute("opacity",found?1:0);$("#sc").classList.toggle("pump",found&&perSec()>0);
 {const h=Math.min(S.bar,100)*.4;$("#tankR").setAttribute("height",h);$("#tankR").setAttribute("y",170-h)}
 $("#stage").textContent=found?"Этап 2: нефть найдена. Качайте и продавайте (цена "+price()+" ₽ за бочку)":"Этап 1: бурим до нефтяного пласта (100 м)";
 $("#prog").style.width=found?Math.min(100,S.total/10)+"%":S.depth+"%";
 $("#bDrill").textContent=found?"Качать нефть":"Бурить";
 $("#bSell").disabled=S.bar<1;
 $("#shop").innerHTML=UPS.map(u=>`<div class="card up"><b>${u.n} (ур. ${S.lv[u.id]})</b><small>${u.d}</small><button data-u="${u.id}" ${S.money<cost(u)||!found?"disabled":""}>Купить за ${fmt(cost(u))} ₽</button></div>`).join("");
 $("#bonuses").innerHTML=BONUS.map(b=>{const g=S.total>=b[0];return `<div class="bonus ${g?"got":""}"><span>${b[1]}<br><small>Добыть ${fmt(b[0])} бочек</small></span><b>${g?'<span class="code">'+b[2]+"</span>":"закрыто"}</b></div>`}).join("");
}
$("#bDrill").onclick=()=>{const sc=$("#sc");sc.classList.remove("act");void sc.getBoundingClientRect();sc.classList.add("act");pop(S.depth<100?"+"+step()+" м":"+"+step()+" бар.",232,56);if(S.depth<100)S.depth=Math.min(100,S.depth+step());else{S.bar+=step();S.total+=step()}save();render()};
$("#bSell").onclick=()=>{if(S.bar>0)pop("+"+fmt(S.bar*price())+" ₽",287,110);S.money+=S.bar*price();S.bar=0;save();render()};
$("#shop").onclick=e=>{const id=e.target.dataset.u;if(!id)return;const u=UPS.find(x=>x.id===id),c=cost(u);if(S.money>=c){S.money-=c;S.lv[id]++;save();render()}};
$("#bReset").onclick=()=>{if(confirm("Сбросить прогресс?")){S=fresh();save();render()}};
setInterval(()=>{const p=perSec();if(p&&S.depth>=100){S.bar+=p;S.total+=p;save();render()}},1000);
render();

})();
