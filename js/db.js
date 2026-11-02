import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const FUELS = { '98': 'АИ-98', '95': 'АИ-95', '92': 'АИ-92', '92e': 'АИ-92 Экто', 'dt': 'ДТ' };
export const LEVELS = ['Нет очереди', 'Небольшая', 'Большая'];
export const QUEUE_TTL = 2 * 3600 * 1000; // отметка действует 2 часа

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const unwrap = ({ data, error }) => { if (error) throw error; return data; };
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const getStations = () => sb.from('stations').select('*').order('pos').then(unwrap);
export const getPrices = () => sb.from('prices').select('*').then(unwrap);
export const getQueue = () => sb.from('queue').select('*').then(unwrap);
export const getPlaces = () => sb.from('places').select('*').order('name').then(unwrap);
export const getDistances = () => sb.from('distances').select('*').then(unwrap);
