/** Shared artistic admin theme tokens (screenshot-matched). */

export const ADMIN_NAV_COLORS = {
  dashboard: 'text-blue-600',
  students: 'text-green-700',
  events: 'text-red-700',
  quiz: 'text-orange-600',
  promotors: 'text-amber-800',
  influencers: 'text-amber-900',
  partners: 'text-purple-700',
  schools: 'text-indigo-700',
  profile: 'text-teal-700',
  promoters: 'text-amber-800',
  sponsors: 'text-rose-600',
  'video-bytes': 'text-violet-700',
  'promo-codes': 'text-fuchsia-700',
  history: 'text-rose-700',
};

export const EVENT_TABLE_HEADER_COLORS = [
  'text-blue-600',
  'text-green-700',
  'text-red-700',
  'text-blue-500',
  'text-blue-500',
  'text-fuchsia-600',
];

export const SCRIPT_NAME_COLORS = [
  'text-red-600',
  'text-green-600',
  'text-blue-600',
  'text-purple-600',
  'text-orange-600',
  'text-teal-600',
  'text-pink-600',
  'text-indigo-600',
];

export function getScriptNameColor(index) {
  return SCRIPT_NAME_COLORS[index % SCRIPT_NAME_COLORS.length];
}

export function getNavColor(path) {
  return ADMIN_NAV_COLORS[path] || 'text-gray-700';
}
