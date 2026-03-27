import { downloadStudentsTemplate, getStudentsTemplateUrl, getStudents } from './students';

jest.mock('../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('../auth/session', () => ({
  getCurrentUser: jest.fn(),
  getMe: jest.fn(),
}));

import { apiClient } from '../services/apiClient';
import { getCurrentUser, getMe } from '../auth/session';

describe('students api', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getStudentsTemplateUrl returns correct template url', () => {
    expect(getStudentsTemplateUrl()).toBe('/templates/student-upload-template.xlsx');
  });

  test('downloadStudentsTemplate creates an anchor with correct href and triggers click', async () => {
    const clickSpy = jest.fn();
    const created = { href: null, download: null };

    const originalCreateElement = document.createElement.bind(document);
    const spy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const a = originalCreateElement(tag);
      if (tag === 'a') {
        a.click = clickSpy;
        Object.defineProperty(a, 'href', {
          set: (v) => { created.href = v; },
          get: () => created.href,
        });
        Object.defineProperty(a, 'download', {
          set: (v) => { created.download = v; },
          get: () => created.download,
        });
      }
      return a;
    });

    await downloadStudentsTemplate();

    expect(created.href).toBe('/templates/student-upload-template.xlsx');
    expect(created.download).toBe('student-upload-template.xlsx');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  test('getStudents builds query params including status mapping and page offset', async () => {
    getCurrentUser.mockReturnValue({ id: 12 });
    getMe.mockReturnValue({});

    apiClient.get.mockResolvedValue({ items: [], totalElements: 0, page: 0, size: 20, totalPages: 1 });

    await getStudents({ page: 0, size: 20, status: 'active', className: '', section: '' });

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    const [url, _undef, config] = apiClient.get.mock.calls[0];
    expect(url).toContain('/api/v1/students/school/list?');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=20');
    expect(url).toContain('status=true');
    expect(config.headers).toEqual(expect.objectContaining({ 'X-User-Role': 'SCHOOL', 'X-User-Id': '12', Accept: 'application/json' }));
  });
});

