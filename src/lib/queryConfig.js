export const QUERY_STALE = {
  dashboard: 5 * 60 * 1000,
  profile: 5 * 60 * 1000,
  schools: 3 * 60 * 1000,
  students: 2 * 60 * 1000,
  superAdmins: 2 * 60 * 1000,
};

export const QUERY_GC = {
  default: 10 * 60 * 1000,
  longLived: 30 * 60 * 1000,
};

export const QUERY_BACKGROUND_SYNC = {
  dashboard: 5 * 60 * 1000,
  summary: 5 * 60 * 1000,
};
