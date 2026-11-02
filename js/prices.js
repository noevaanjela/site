import { FUELS, esc, getStations, getPrices } from './db.js';

export async function initPrices() {
  const [stations, rows] = await Promise.all([getStations(), getPrices()]);
  const pr = {};
  rows.forEach(r => { (pr[r.station_id] ??= {})[r.fuel] = r.price; });
  let last = '';
  const body = stations.map(s => {
    const group = s.district !== last ? `<tr class="g"><td colspan="7">${esc(last = s.district)}</td></tr>` : '';
    const cells = Object.keys(FUELS).map(f => `<td>${pr[s.id]?.[f] == null ? '–' : Number(pr[s.id][f]).toFixed(2).replace('.', ',')}</td>`).join('');
    return `${group}<tr><td>${esc(s.num)}</td><td>${esc(s.address)}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('prices-box').innerHTML =
    `<table><thead><tr><th>№</th><th>Адрес</th>${Object.values(FUELS).map(l => `<th>${l}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}
