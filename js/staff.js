import { sb, unwrap, FUELS, LEVELS, QUEUE_TTL, esc, getStations, getPrices, getQueue, getPlaces } from './db.js';

const $ = id => document.getElementById(id);
const say = (t, bad) => { const m = $('msg'); m.textContent = t || ''; m.className = bad ? 'err' : 'okmsg'; };

$('loginform').addEventListener('submit', async e => {
  e.preventDefault(); say('');
  const { error } = await sb.auth.signInWithPassword({ email: $('email').value.trim(), password: $('pass').value });
  if (error) return say('Ошибка входа: ' + error.message, true);
  start();
});
$('logout').onclick = async () => { await sb.auth.signOut(); start(); };

async function start() {
  const { data: { session } } = await sb.auth.getSession();
  $('login').hidden = !!session; $('panel').hidden = !session;
  if (!session) return;
  const me = unwrap(await sb.from('staff').select('role,station_id').eq('user_id', session.user.id).maybeSingle());
  if (!me) { $('who').textContent = 'Учётная запись не привязана к АЗС. Обратитесь к менеджеру.'; $('queue-ed').hidden = true; $('mgr').hidden = true; return; }
  const mgr = me.role === 'manager';
  $('who').textContent = mgr ? 'Вы вошли как менеджер.' : 'Вы вошли как сотрудник АЗС.';
  $('queue-ed').hidden = false; $('mgr').hidden = !mgr;
  const stations = await getStations();
  await drawQueue(mgr ? stations : stations.filter(s => s.id === me.station_id));
  if (mgr) await drawManager(stations);
}

async function drawQueue(list) {
  const q = Object.fromEntries((await getQueue()).map(r => [r.station_id, r]));
  $('qlist').innerHTML = list.map(s => {
    const r = q[s.id], ok = r && Date.now() - new Date(r.updated_at) < QUEUE_TTL;
    return `<div class="st"><div><b>АЗС №${esc(s.num)}</b><br><small>${esc(s.address)}</small></div>` +
      `<span class="pill l${ok ? r.level : 'x'}">${ok ? LEVELS[r.level] : 'нет отметки'}</span>` +
      `<div class="set">${LEVELS.map((l, i) => `<button class="alt" data-s="${s.id}" data-l="${i}">${l}</button>`).join('')}</div></div>`;
  }).join('');
}
$('qlist').addEventListener('click', async e => {
  const b = e.target.closest('button[data-s]');
  if (!b) return;
  b.disabled = true;
  const { error } = await sb.from('queue').upsert({ station_id: +b.dataset.s, level: +b.dataset.l }, { onConflict: 'station_id' });
  say(error ? 'Не удалось сохранить: ' + error.message : 'Сохранено.', !!error);
  start();
});

async function drawManager(stations) {
  const pr = {};
  (await getPrices()).forEach(r => { (pr[r.station_id] ??= {})[r.fuel] = r.price; });
  $('ptb').innerHTML = stations.map(s => `<tr><td>${esc(s.num)}</td><td>${esc(s.address)}</td>` +
    Object.keys(FUELS).map(f => `<td><input data-s="${s.id}" data-f="${f}" value="${pr[s.id]?.[f] ?? ''}" inputmode="decimal"></td>`).join('') + '</tr>').join('');
  const opts = (await getPlaces()).map(p => `<option>${esc(p.name)}</option>`).join('');
  $('d-a').innerHTML = opts; $('d-b').innerHTML = opts;
}

$('saveprices').onclick = async () => {
  const up = [], del = [];
  document.querySelectorAll('#ptb input').forEach(i => {
    const v = i.value.trim().replace(',', '.'), o = i.defaultValue;
    if (v === o || (v !== '' && o !== '' && +v === +o)) return;
    const s = +i.dataset.s, f = i.dataset.f;
    if (v === '') del.push([s, f]); else if (+v > 0) up.push({ station_id: s, fuel: f, price: +v });
  });
  let err = null;
  if (up.length) err = (await sb.from('prices').upsert(up, { onConflict: 'station_id,fuel' })).error;
  for (const [s, f] of del) if (!err) err = (await sb.from('prices').delete().eq('station_id', s).eq('fuel', f)).error;
  say(err ? 'Ошибка: ' + err.message : `Цены сохранены (изменено: ${up.length + del.length}).`, !!err);
  if (!err) start();
};

$('adddist').onclick = async () => {
  const a = $('d-a').value, b = $('d-b').value, km = +$('d-km').value;
  if (a === b || !(km > 0)) return say('Выберите две разные точки и расстояние.', true);
  const { error } = await sb.from('distances').upsert({ from_place: a, to_place: b, km }, { onConflict: 'from_place,to_place' });
  say(error ? 'Ошибка: ' + error.message : 'Расстояние сохранено.', !!error);
};

start().catch(e => { console.error(e); say('Не удалось подключиться к базе. Проверьте js/config.js.', true); });
