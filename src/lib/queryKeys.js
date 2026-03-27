function normalizeParams(params = {}) {
  return Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const value = params[key];
      if (value === undefined || value === null || value === '') return acc;
      acc[key] = value;
      return acc;
    }, {});
}

export const queryKeys = {
  dashboard: {
    all: ['dashboard'],
    details: (roleId) => ['dashboard', 'details', roleId ?? 'guest'],
    stats: (roleId) => ['dashboard', 'stats', roleId ?? 'guest'],
    performers: (roleId) => ['dashboard', 'performers', roleId ?? 'guest'],
    events: (roleId) => ['dashboard', 'events', roleId ?? 'guest'],
  },
  profile: {
    all: ['profile'],
    me: ['profile', 'me'],
  },
  schools: {
    all: ['schools'],
    list: (params = {}) => ['schools', 'list', normalizeParams(params)],
    infiniteList: (params = {}) => ['schools', 'infinite-list', normalizeParams(params)],
  },
  students: {
    all: ['students'],
    list: (params = {}) => ['students', 'list', normalizeParams(params)],
    infiniteList: (params = {}) => ['students', 'infinite-list', normalizeParams(params)],
    summary: ['students', 'summary'],
  },
  events: {
    all: ['events'],
    list: ['events', 'list'],
  },
  superAdmins: {
    all: ['superAdmins'],
    list: (params = {}) => ['superAdmins', 'list', normalizeParams(params)],
  },
};
