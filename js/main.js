import { initPrices } from './prices.js';
import { initQueue } from './queue.js';
import { initCalc } from './calc.js';

const fail = id => e => { console.error(e); document.getElementById(id).textContent = 'Не удалось загрузить данные. Проверьте настройки в js/config.js.'; };
initPrices().catch(fail('prices-box'));
initQueue().catch(fail('queue-box'));
initCalc().catch(fail('cres'));
