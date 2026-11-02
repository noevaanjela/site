(function () {
  const root = document.getElementById("sib-game");
  if (!root) return;
  const $ = s => document.querySelector("#sib-game " + s), fmt = n => Math.floor(n).toLocaleString("ru-RU");

  const GOALS = { 1: 100, 2: 8000, 3: 10000 };
  const BONUS = [
    [1, "Скидка 1 ₽/л на одну заправку", "SIB-L1", "Добыча"],
    [2, "Бесплатный кофе на АЗС", "SIB-L2", "Переработка"],
    [3, "Скидка 3 ₽/л и 500 баллов «СиБонус»", "SIB-L3", "Доставка на АЗС"]
  ];
  const UPS = [
    { id: "bit", l: 1, n: "Алмазное долото", d: "+1 м или +1 бочка за клик", base: 15, k: 1.6 },
    { id: "pump", l: 1, n: "Станок-качалка", d: "+1 бочка в секунду", base: 40, k: 1.55 },
    { id: "well", l: 1, n: "Новая скважина", d: "+3 бочки в секунду", base: 200, k: 1.8 },
    { id: "price", l: 1, n: "Контракт на сырьё", d: "+5 ₽ за бочку", base: 120, k: 1.7 },
    { id: "col", l: 2, n: "Ректификационная колонна", d: "+1 бочка в секунду перерабатывается сама", base: 150, k: 1.7 },
    { id: "cat", l: 2, n: "Катализатор", d: "+10% топлива из бочки", base: 180, k: 1.8 },
    { id: "truck", l: 3, n: "Бензовоз Scania", d: "+250 л в рейс", base: 200, k: 1.7 },
    { id: "fleet", l: 3, n: "Ещё один бензовоз", d: "возит топливо сам, без вашего клика", base: 300, k: 2 }
  ];

  root.innerHTML = `<h2>Юный нефтяник</h2>
<p class="sub">Пройдите три уровня: добыча, переработка, доставка на АЗС. За каждый пройденный уровень даётся бонус.</p>
<ol class="steps" id="steps"><li>1. Добыча</li><li>2. Переработка</li><li>3. Доставка на АЗС</li></ol>
<div class="rig"><div class="scene"><svg id="sc" viewBox="0 0 320 280" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Нефтяник в каске у буровой вышки"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5dffb0" stop-opacity="0"/><stop offset=".5" stop-color="#5dffb0" stop-opacity=".55"/><stop offset="1" stop-color="#5dffb0" stop-opacity="0"/></linearGradient></defs><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1b33"/><stop offset=".7" stop-color="#1d4468"/><stop offset="1" stop-color="#3b6f8f"/></linearGradient><radialGradient id="mn"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></radialGradient><linearGradient id="hat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#f0a800"/></linearGradient><linearGradient id="ov" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff7e33"/><stop offset=".6" stop-color="#ff6a1a"/><stop offset="1" stop-color="#d9520c"/></linearGradient><linearGradient id="mt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c3743"/><stop offset=".35" stop-color="#7c8b99"/><stop offset="1" stop-color="#2c3743"/></linearGradient><radialGradient id="fc"><stop offset="0" stop-color="#ffd9b3"/><stop offset="1" stop-color="#e9b98a"/></radialGradient></defs><rect width="320" height="172" fill="url(#sk)"/><circle cx="60" cy="38" r="22" fill="url(#mn)"/><circle cx="60" cy="38" r="8" fill="#fffbe6"/><ellipse cx="190" cy="52" rx="34" ry="6" fill="#fff" opacity=".07"/><path class="au" d="M0 70C60 20 120 90 180 40S280 30 320 60V110C260 80 200 120 140 90S50 120 0 100Z" fill="url(#ag)"/><g fill="#fff" opacity=".8"><circle cx="30" cy="20" r="1"/><circle cx="90" cy="35" r="1"/><circle cx="170" cy="15" r="1.2"/><circle cx="250" cy="28" r="1"/><circle cx="300" cy="12" r="1"/></g><g fill="#0e2233"><path d="M0 172V150l12-28 12 28 8-18 12 18 10-24 12 24 8-12 10 12V172z"/><path d="M180 172v-18l10-22 10 22 10-14 10 14 12-26 12 26 8-10 10 10 8-14 10 14V172z"/></g><rect y="172" width="320" height="108" fill="#4a3b2f"/><path d="M0 172H320V178Q280 184 240 178T160 179 80 178 0 181Z" fill="#eef5fa"/><g stroke="#3a2e24" stroke-width="2" opacity=".6"><path d="M0 200H320M0 225H320M0 248H320"/></g><path d="M0 190c40 6 70-4 110 2s90 2 120-3 60 4 90 0" stroke="#5d4a3a" stroke-width="2" fill="none"/><g id="l1"><ellipse cx="232" cy="266" rx="62" ry="10" fill="#0a0a0a"/><ellipse cx="215" cy="263" rx="20" ry="2.5" fill="#fff" opacity=".15"/><rect id="boreR" x="230" y="177" width="4" height="0" fill="#0a0a0a"/><path d="M214 172 232 70 250 172M220 138H244M224 118H240M227 98H237M218 156 244 138M246 156 220 138M222 134 240 118" stroke="#e3222a" stroke-width="3" fill="none"/><rect x="226" y="64" width="12" height="7" fill="#444"/><circle class="bk" cx="232" cy="60" r="3" fill="#ff3030"/><circle class="bk" cx="232" cy="60" r="7" fill="#ff3030" opacity=".25"/><rect id="pipe" x="230" y="72" width="4" height="100" fill="#c4ccd4"/><g id="gush" opacity="0" stroke="#0a0a0a" stroke-width="3" fill="none" stroke-linecap="round"><path d="M232 64C220 40 210 30 204 42M232 64C244 38 256 30 262 44M232 64V28"/><g stroke="none" fill="#0a0a0a"><circle class="dr" cx="212" cy="46" r="2"/><circle class="dr" cx="252" cy="44" r="2.2"/><circle class="dr" cx="232" cy="34" r="2"/></g></g><rect x="105" y="160" width="50" height="12" fill="#333"/><path d="M118 160 130 122 142 160" stroke="#e3222a" stroke-width="3" fill="none"/><line x1="98" y1="128" x2="98" y2="172" stroke="#c4ccd4" stroke-width="2"/><g class="pumpbeam"><line x1="96" y1="122" x2="164" y2="122" stroke="#e3222a" stroke-width="6" stroke-linecap="round"/><path d="M96 111V133Q84 122 96 111Z" fill="#e3222a"/><circle cx="166" cy="132" r="9" fill="#333"/></g><rect x="268" y="128" width="38" height="44" rx="4" fill="url(#mt)"/><path d="M268 134Q287 122 306 134" fill="#5b6b7a"/><path d="M268 146H306M268 158H306" stroke="#1d2630" stroke-width="1" opacity=".5"/><path d="M310 130v42M314 130v42M310 140h4M310 150h4M310 160h4" stroke="#9aa6b2" stroke-width="1"/><rect id="tankR" x="270" y="170" width="34" height="0" fill="#0a0a0a"/><text x="287" y="123" font-size="8" font-weight="700" fill="#fff" text-anchor="middle" font-family="Rubik,Arial,sans-serif">СибОйл</text></g><g id="l2"><rect x="130" y="95" width="16" height="77" fill="url(#mt)"/><rect x="158" y="75" width="18" height="97" fill="url(#mt)"/><rect x="190" y="110" width="14" height="62" fill="url(#mt)"/><ellipse cx="138" cy="95" rx="8" ry="3" fill="#5b6b7a"/><ellipse cx="167" cy="75" rx="9" ry="3" fill="#5b6b7a"/><ellipse cx="197" cy="110" rx="7" ry="3" fill="#5b6b7a"/><path d="M130 120h16M130 145h16M158 100h18M158 125h18M158 150h18M190 130h14M190 150h14" stroke="#1d2630" stroke-width="2" opacity=".6"/><path d="M146 140H158M176 130H190M204 150H238" stroke="#9aa6b2" stroke-width="3" fill="none"/><rect x="222" y="62" width="4" height="110" fill="#666"/><path class="fl" d="M224 40c-7 8-5 14 0 18 5-4 7-10 0-18z" fill="#ff9a1a"/><circle class="bk" cx="167" cy="70" r="2.5" fill="#ff3030"/><rect x="238" y="132" width="36" height="40" rx="4" fill="url(#mt)"/><rect id="fR2" x="240" y="170" width="32" height="0" fill="#ffc400"/><text x="256" y="127" font-size="8" font-weight="700" fill="#fff" text-anchor="middle" font-family="Rubik,Arial,sans-serif">НПЗ СибОйл</text><rect x="282" y="140" width="22" height="32" rx="3" fill="url(#mt)"/></g><g id="l3"><rect y="173" width="320" height="8" fill="#2b2f36"/><path d="M0 177H320" stroke="#e8eef3" stroke-width="1.5" stroke-dasharray="10 8"/><rect x="236" y="138" width="74" height="6" fill="#e3222a"/><rect x="242" y="144" width="3" height="28" fill="#9aa6b2"/><rect x="302" y="144" width="3" height="28" fill="#9aa6b2"/><rect x="252" y="152" width="12" height="20" rx="2" fill="#e3222a"/><rect x="278" y="152" width="12" height="20" rx="2" fill="#e3222a"/><rect x="255" y="156" width="6" height="5" fill="#9fd3ff"/><rect x="281" y="156" width="6" height="5" fill="#9fd3ff"/><text x="273" y="134" font-size="9" font-weight="700" fill="#fff" text-anchor="middle" font-family="Rubik,Arial,sans-serif">АЗС СибОйл</text><g id="truck" style="transform:translateX(0)"><rect x="95" y="152" width="34" height="14" rx="3" fill="#e8eef3"/><rect x="95" y="155" width="34" height="3" fill="#e3222a"/><rect x="129" y="156" width="13" height="10" rx="2" fill="#e3222a"/><rect x="134" y="158" width="6" height="4" fill="#9fd3ff"/><circle cx="103" cy="168" r="4" fill="#222"/><circle cx="121" cy="168" r="4" fill="#222"/><circle cx="136" cy="168" r="4" fill="#222"/></g></g><g transform="translate(28,69)"><ellipse cx="26" cy="104" rx="22" ry="3.5" fill="#000" opacity=".3"/><rect x="13" y="73" width="10" height="27" fill="#2b3a55"/><rect x="27" y="73" width="10" height="27" fill="#2b3a55"/><rect x="10" y="98" width="15" height="6" rx="2" fill="#111"/><rect x="27" y="98" width="15" height="6" rx="2" fill="#111"/><rect x="19" y="31" width="12" height="6" fill="#f2c9a0"/><rect x="11" y="34" width="28" height="42" rx="5" fill="url(#ov)"/><path d="M19 34l6 8 6-8z" fill="#c94d0a"/><rect x="29" y="46" width="7" height="6" rx="1" fill="#d9520c"/><rect x="14" y="44" width="9" height="4" rx="1" fill="#fff" opacity=".85"/><rect x="11" y="52" width="28" height="4" fill="#dfe8ee"/><rect x="11" y="62" width="28" height="4" fill="#dfe8ee"/><rect x="2" y="36" width="9" height="30" rx="4" fill="#ff6a1a"/><circle cx="6.5" cy="68" r="4.5" fill="#f2c9a0"/><g id="arm"><rect x="39" y="36" width="9" height="28" rx="4" fill="#ff6a1a"/><circle cx="43.5" cy="68" r="4.5" fill="#f2c9a0"/><rect x="42" y="68" width="3" height="18" fill="#9aa6b2"/></g><circle cx="14.5" cy="23" r="2.5" fill="#e9b98a"/><circle cx="35.5" cy="23" r="2.5" fill="#e9b98a"/><circle cx="25" cy="22" r="11" fill="url(#fc)"/><circle cx="19" cy="26" r="2" fill="#ff9a7a" opacity=".35"/><circle cx="31" cy="26" r="2" fill="#ff9a7a" opacity=".35"/><circle cx="21" cy="22" r="1.4" fill="#222"/><circle cx="29" cy="22" r="1.4" fill="#222"/><path d="M19 26q6-3 12 0v2q-6-2-12 0z" fill="#5a3a22"/><path d="M21 30q4 2.5 8 0" stroke="#7a4a2a" fill="none" stroke-width="1.3"/><path d="M12 18a13 13 0 0 1 26 0z" fill="url(#hat)"/><path d="M16 14q3-6 9-7" stroke="#fff" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/><rect x="9" y="17" width="32" height="4" rx="2" fill="#e6a900"/><rect x="23" y="7" width="4" height="10" fill="#e6a900"/><circle cx="25" cy="13" r="2.5" fill="#fff"/></g><path d="M54 82L135 150 112 170Z" fill="#fff" opacity=".07"/><g class="sn" fill="#fff" opacity=".85"><circle cx="20" r="1.4"/><circle cx="60" r="1"/><circle cx="100" r="1.6"/><circle cx="140" r="1.1"/><circle cx="180" r="1.4"/><circle cx="215" r="1"/><circle cx="255" r="1.5"/><circle cx="290" r="1.1"/><circle cx="310" r="1.3"/></g></svg></div><div>
<div class="stats"><div class="stat"><b id="sCrude">0</b><span>бочек нефти</span></div><div class="stat"><b id="sFuel">0</b><span>литров топлива</span></div><div class="stat"><b id="sMoney">0 ₽</b><span>деньги</span></div><div class="stat"><b id="sDel">0</b><span>доставлено, л</span></div></div>
<div id="stage"></div><div class="bar"><i id="prog"></i></div>
<div class="acts"><button id="bMain"></button><button id="bPump" class="alt">Качать нефть</button><button id="bSell" class="alt">Продать нефть</button></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div></div></div>
<div class="shop" id="shop"></div>
<div class="card" style="margin-top:12px"><b>Бонусы за прохождение</b><div id="bonuses"></div><p class="sub" style="margin:10px 0 0;font-size:13px">Коды демонстрационные: замените на настоящие акции СибОйл.</p><button class="alt" id="bReset" style="margin-top:10px">Начать заново</button></div>`;

  const KEY = "siboil-game2";
  const fresh = () => ({ lvl: 1, depth: 0, crude: 0, fuel: 0, money: 0, totC: 0, totF: 0, del: 0, done: [], lv: { bit: 0, pump: 0, well: 0, price: 0, col: 0, cat: 0, truck: 0, fleet: 0 } });
  let S = fresh();
  try { const o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o) S = Object.assign(fresh(), o, { lv: Object.assign(fresh().lv, o.lv) }); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const step = () => 1 + S.lv.bit, perSec = () => (S.depth >= 100 ? S.lv.pump + 3 * S.lv.well : 0), cprice = () => 10 + 5 * S.lv.price;
  const yieldL = () => 50 * (1 + 0.1 * S.lv.cat), cap = () => 500 + 250 * S.lv.truck, cost = u => Math.round(u.base * Math.pow(u.k, S.lv[u.id]));
  const POP = { 1: [232, 56], 2: [170, 66], 3: [150, 110] };
  let trip = false, tt = 0;

  function pop(t, x, y) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "text");
    e.setAttribute("x", x); e.setAttribute("y", y); e.setAttribute("class", "pop"); e.setAttribute("text-anchor", "middle"); e.textContent = t;
    $("#sc").appendChild(e); setTimeout(() => e.remove(), 900);
  }
  function toast(m) { $("#toast").textContent = m; clearTimeout(tt); tt = setTimeout(() => { $("#toast").textContent = ""; }, 9000); }

  function check() {
    const v = { 1: S.totC, 2: S.totF, 3: S.del };
    [1, 2, 3].forEach(l => {
      if (S.done.includes(l) || S.lvl < l || v[l] < GOALS[l]) return;
      S.done.push(l);
      const b = BONUS[l - 1];
      if (l < 3) { S.lvl = l + 1; toast(`Уровень «${b[3]}» пройден! Бонус: ${b[1]}, код ${b[2]}. Открыт следующий уровень.`); }
      else toast(`Поздравляем, игра пройдена! Бонус: ${b[1]}, код ${b[2]}.`);
    });
  }
  function refine(n) {
    n = Math.min(S.crude, n); if (n < 1) return 0;
    S.crude -= n; S.fuel += n * yieldL(); S.totF += n * yieldL(); return n;
  }
  function send() {
    if (trip || S.fuel < 1) return;
    const load = Math.min(S.fuel, cap()), t = $("#truck");
    S.fuel -= load; trip = true;
    t.style.transition = "transform 3s linear"; t.style.transform = "translateX(70px)";
    render();
    setTimeout(() => {
      S.money += load * 0.4; S.del += load; pop("+" + fmt(load * 0.4) + " ₽", 270, 125);
      t.style.transition = "none"; t.style.transform = "translateX(0)"; trip = false; check(); save(); render();
    }, 3000);
  }

  function render() {
    const found = S.depth >= 100, L = S.lvl, d3 = S.done.includes(3);
    $("#sCrude").textContent = fmt(S.crude); $("#sFuel").textContent = fmt(S.fuel); $("#sMoney").textContent = fmt(S.money) + " ₽"; $("#sDel").textContent = fmt(S.del);
    document.querySelectorAll("#sib-game #steps li").forEach((li, i) => { li.className = S.done.includes(i + 1) ? "done" : (L === i + 1 ? "on" : ""); });
    let txt, pr;
    if (L === 1) { txt = found ? `Уровень 1. Добыча: добыто ${fmt(S.totC)} из ${GOALS[1]} бочек` : `Уровень 1. Добыча: бурим до пласта, ${fmt(S.depth)} из 100 м`; pr = found ? S.totC / GOALS[1] : S.depth / 100; }
    else if (L === 2) { txt = `Уровень 2. Переработка: ${fmt(S.totF)} из ${fmt(GOALS[2])} л топлива (бочка даёт ${Math.round(yieldL())} л)`; pr = S.totF / GOALS[2]; }
    else { txt = d3 ? "Игра пройдена. Можно продолжать развиваться." : `Уровень 3. Доставка на АЗС: ${fmt(S.del)} из ${fmt(GOALS[3])} л (бензовоз берёт до ${cap()} л)`; pr = S.del / GOALS[3]; }
    $("#stage").textContent = txt; $("#prog").style.width = Math.min(100, pr * 100) + "%";
    $("#bMain").textContent = L === 1 ? (found ? "Качать нефть" : "Бурить") : L === 2 ? "Переработать" : (trip ? "Бензовоз в пути…" : "Отправить бензовоз");
    $("#bMain").disabled = (L === 2 && S.crude < 1) || (L === 3 && (S.fuel < 1 || trip));
    $("#bPump").hidden = L < 2; $("#bSell").disabled = S.crude < 1;
    $("#shop").innerHTML = UPS.filter(u => u.l <= L).map(u => `<div class="card up"><b>${u.n} (ур. ${S.lv[u.id]})</b><small>${u.d}</small><button data-u="${u.id}" ${S.money < cost(u) ? "disabled" : ""}>Купить за ${fmt(cost(u))} ₽</button></div>`).join("");
    $("#bonuses").innerHTML = BONUS.map(b => { const g = S.done.includes(b[0]); return `<div class="bonus ${g ? "got" : ""}"><span>${b[1]}<br><small>Пройти уровень «${b[3]}»</small></span><b>${g ? '<span class="code">' + b[2] + "</span>" : "закрыто"}</b></div>`; }).join("");
    const sc = $("#sc");
    sc.dataset.l = L;
    $("#boreR").setAttribute("height", Math.min(S.depth, 100) * 0.85);
    $("#gush").setAttribute("opacity", found ? 1 : 0);
    sc.classList.toggle("pump", L === 1 && perSec() > 0);
    { const h = Math.min(S.crude, 100) * 0.4; $("#tankR").setAttribute("height", h); $("#tankR").setAttribute("y", 170 - h); }
    { const h = Math.min(S.fuel / 2000, 1) * 36; $("#fR2").setAttribute("height", h); $("#fR2").setAttribute("y", 170 - h); }
  }

  function act() { const sc = $("#sc"); sc.classList.remove("act"); void sc.getBoundingClientRect(); sc.classList.add("act"); }
  function pumpClick() { S.crude += step(); S.totC += step(); pop("+" + step() + " бар.", ...POP[S.lvl]); }

  $("#bMain").onclick = () => {
    act();
    if (S.lvl === 1) { if (S.depth < 100) { S.depth = Math.min(100, S.depth + step()); pop("+" + step() + " м", ...POP[1]); if (S.depth >= 100) toast("Нефть найдена! Качайте и продавайте."); } else pumpClick(); }
    else if (S.lvl === 2) { const n = refine(5); if (n) pop("+" + fmt(n * yieldL()) + " л", ...POP[2]); }
    else { send(); return; }
    check(); save(); render();
  };
  $("#bPump").onclick = () => { act(); pumpClick(); check(); save(); render(); };
  $("#bSell").onclick = () => { if (S.crude > 0) { pop("+" + fmt(S.crude * cprice()) + " ₽", ...POP[S.lvl]); S.money += S.crude * cprice(); S.crude = 0; save(); render(); } };
  $("#shop").onclick = e => { const id = e.target.dataset.u; if (!id) return; const u = UPS.find(x => x.id === id), c = cost(u); if (S.money >= c) { S.money -= c; S.lv[id]++; save(); render(); } };
  $("#bReset").onclick = () => { if (confirm("Сбросить прогресс?")) { S = fresh(); trip = false; save(); render(); } };

  setInterval(() => {
    let ch = false;
    const p = perSec(); if (p) { S.crude += p; S.totC += p; ch = true; }
    if (S.lvl >= 2 && S.lv.col > 0 && refine(S.lv.col)) ch = true;
    if (S.lvl >= 3 && S.lv.fleet > 0 && S.fuel >= 1) { const load = Math.min(S.fuel, S.lv.fleet * cap() / 4); S.fuel -= load; S.del += load; S.money += load * 0.4; ch = true; }
    if (ch) { check(); save(); render(); }
  }, 1000);
  render();
})();
