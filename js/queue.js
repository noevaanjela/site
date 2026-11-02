import { LEVELS, QUEUE_TTL, esc, getStations, getQueue } from './db.js';

const when = ms => { const m = Math.max(1, Math.round(ms / 60000)); return m < 60 ? m + ' мин назад' : Math.floor(m / 60) + ' ч назад'; };

export async function initQueue() {
  const box = document.getElementById('queue-box');
  const stations = await getStations();
  async function draw() {
    const q = Object.fromEntries((await getQueue()).map(r => [r.station_id, r]));
    box.innerHTML = stations.map(s => {
      const r = q[s.id], age = r ? Date.now() - new Date(r.updated_at) : Infinity, ok = age < QUEUE_TTL;
      return `<div class="st"><div><b>АЗС №${esc(s.num)}</b><br><small>${esc(s.address)} · ${ok ? when(age) : 'нет свежих отметок'}</small></div>` +
        `<span class="pill l${ok ? r.level : 'x'}">${ok ? LEVELS[r.level] : 'неизвестно'}</span></div>`;
    }).join('');
  }
  await draw();
  setInterval(() => draw().catch(() => {}), 30000);
}
