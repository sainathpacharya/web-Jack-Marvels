import { getAccessToken } from '../auth/session';
import { apiClient } from './apiClient';

function unwrapResponse(data) {
  return data?.response ?? data?.data ?? data;
}

const EVENT_DESCRIPTION_MAP = {
  'national anthem': 'Lead with pride and confidence as you present the national anthem with clarity, expression, and stage presence.',
  'tongue twister': 'Show your speed, diction, and confidence by delivering fun tongue twisters without missing rhythm or accuracy.',
  singing: 'Perform your favorite song and showcase melody, expression, and vocal confidence in front of your peers.',
  dancing: 'Express your creativity through movement, rhythm, and style in an energetic and engaging dance performance.',
  'movie dialogues': 'Bring iconic scenes to life with expressive dialogue delivery, timing, and strong stage performance.',
  'comedy act / skit': 'Entertain the audience with a creative skit that highlights humor, teamwork, and performance skills.',
  shayari: 'Present original or classic shayari with emotion, fluency, and impactful delivery.',
  rhymes: 'Perform lively rhymes with clear pronunciation, rhythm, and expressive voice modulation.',
  poems: 'Recite poetry with confidence and expression, highlighting tone, meaning, and performance quality.',
  cooking: 'Demonstrate practical creativity by presenting simple, tasty, and innovative culinary ideas.',
  'twins act': 'Deliver a synchronized and creative dual performance showcasing coordination and stage chemistry.',
  'any special talent': 'Showcase your unique talent and impress the audience with originality, confidence, and skill.',
  'mom and kid act': 'Create a memorable joint performance that reflects connection, creativity, and stage confidence.',
  'craft making': 'Present handmade creative work and demonstrate your imagination, design sense, and presentation skills.',
  'kids group performance with teacher':
    'Collaborate in a coordinated group act with guidance from your teacher to showcase teamwork and confidence.',
};

function buildEventDescription(name) {
  const key = String(name ?? '').trim().toLowerCase();
  return (
    EVENT_DESCRIPTION_MAP[key] ||
    'Participate, showcase your talent, and earn recognition through creative event performances.'
  );
}

function toEventViewModel(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.eventName ?? raw.name ?? '').trim();
  const mediaPath = String(raw.eventGifOrImage ?? raw.mediaPath ?? '').trim();
  return {
    id: raw.id ?? raw.eventId ?? '',
    eventName: name,
    eventGifOrImage: mediaPath,
    description: String(raw.description ?? raw.eventDescription ?? '').trim() || buildEventDescription(name),
    status: String(raw.status ?? '').trim().toLowerCase() || 'inactive',
    fromDate: raw.fromDate ?? raw.activeFromDate ?? null,
    toDate: raw.toDate ?? raw.activeToDate ?? null,
  };
}

export function getAssetUrl(path) {
  const raw = String(path ?? '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) {
    const base = apiClient.getApiBaseUrl?.() || '';
    if (base) return `${base}${raw}`;
    if (typeof window !== 'undefined') {
      if (import.meta.env.DEV) return `http://localhost:8080${raw}`;
      return `${window.location.origin}${raw}`;
    }
  }
  return raw;
}

export async function fetchPublicEvents({ signal } = {}) {
  const data = await apiClient.get('/api/public/events', undefined, { auth: false, signal });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to fetch public events');
  }
  const rows = unwrapResponse(data);
  return (Array.isArray(rows) ? rows : []).map(toEventViewModel).filter(Boolean);
}

export async function fetchAuthenticatedEvents({ signal } = {}) {
  const hasToken = Boolean(getAccessToken());
  if (!hasToken) {
    throw new Error('Authentication required to fetch private events');
  }
  const data = await apiClient.get('/api/events', undefined, { auth: true, signal });
  if (typeof data?.statusCode === 'number' && data.statusCode !== 200) {
    throw new Error(data?.response || data?.message || 'Failed to fetch events');
  }
  const rows = unwrapResponse(data);
  return (Array.isArray(rows) ? rows : []).map(toEventViewModel).filter(Boolean);
}

