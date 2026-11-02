import { getPlaces, getDistances } from './db.js';

const $ = id => document.getElementById(id);
const hav = (p, q) => { const r = Math.PI / 180, a = Math.sin((q[0] - p[0]) * r / 2) ** 2 + Math.cos(p[0] * r) * Math.cos(q[0] * r) * Math.sin((q[1] - p[1]) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(a)); };

export async function initCalc() {
  const [places, dist] = await Promise.all([getPlaces(), getDistances()]);
  const P = Object.fromEntries(places.map(p => [p.name, [p.lat, p.lon]]));
  const G = {};
  dist.forEach(d => { (G[d.from_place] ??= {})[d.to_place] = +d.km; (G[d.to_place] ??= {})[d.from_place] = +d.km; });

  // Кратчайший путь по таблице расстояний (в том числе через промежуточные пункты).
  function road(a, b) {
    const D = { [a]: 0 }, seen = new Set();
    for (;;) {
      let u = null;
      for (const k in D) if (!seen.has(k) && (u === null || D[k] < D[u])) u = k;
      if (u === null) return null;
      if (u === b) return D[b];
      seen.add(u);
      for (const v in G[u] || {}) { const n = D[u] + G[u][v]; if (D[v] === undefined || n < D[v]) D[v] = n; }
    }
  }

  const opts = Object.keys(P).map(n => `<option>${n}</option>`).join('');
  $('ca').innerHTML = opts; $('cb').innerHTML = opts; $('cb').value = Object.keys(P)[1] || '';
  let approx = false;

  function auto() {
    const a = $('ca').value, b = $('cb').value;
    let d = a === b ? 0 : road(a, b);
    approx = d === null;
    if (approx) d = Math.round(hav(P[a], P[b]) * 1.3);
    $('cdist').value = d;
    calc();
  }

  function calc() {
    const r = $('cres'), d = +$('cdist').value, c = +$('ccons').value, t = +$('ctank').value, m = +$('cmar').value / 100, n = +$('ctrip').value;
    if (!(d > 0 && c > 0 && t > 0)) { r.className = 'res'; r.textContent = 'Выберите разные точки и заполните расход и бак.'; return; }
    const h = Math.round(+$('cpct').value * t / 10) / 10, need = d * n * c / 100 * (1 + m), lack = need - h;
    if (lack <= 0) { r.className = 'res ok'; r.innerHTML = `<strong>Хватит</strong>Нужно ${need.toFixed(1)} л, в баке ${h} л, останется около ${(-lack).toFixed(1)} л.`; }
    else {
      r.className = 'res no';
      r.innerHTML = `<strong>Не хватит: нужно ещё ${lack.toFixed(1)} л</strong>Нужно ${need.toFixed(1)} л, в баке ${h} л, хватит на ${Math.round(h / (c * (1 + m)) * 100)} км.` +
        (need > t ? ` Бак вмещает ${t} л, по пути нужна заправка.` : ` Заправьтесь минимум на ${Math.ceil(lack)} л.`);
    }
  }

  $('ca').onchange = auto; $('cb').onchange = auto;
  ['cdist', 'ccons', 'ctank', 'cmar', 'ctrip', 'cpct'].forEach(i => $(i).oninput = () => { $('cpv').textContent = $('cpct').value; try { localStorage.setItem('siboil-car', JSON.stringify([$('ccons').value, $('ctank').value, $('cmar').value])); } catch (e) {} calc(); });
  try { const s = JSON.parse(localStorage.getItem('siboil-car') || 'null'); if (s) { $('ccons').value = s[0]; $('ctank').value = s[1]; $('cmar').value = s[2]; } } catch (e) {}
  auto();
}
