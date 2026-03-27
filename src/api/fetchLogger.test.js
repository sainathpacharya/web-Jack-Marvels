import { setupApiLogging } from './fetchLogger';

describe('fetchLogger', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // reset module-level flag by re-requiring fresh module
    jest.resetModules();
  });

  test('wraps window.fetch once and forwards calls', async () => {
    const originalFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      clone: function clone() {
        return {
          text: jest.fn().mockResolvedValue(JSON.stringify({ hello: 'world', password: 'secret' })),
        };
      },
    });

    global.window.fetch = originalFetch;

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    setupApiLogging();
    setupApiLogging();

    const res = await window.fetch('/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'secret' }) });
    expect(originalFetch).toHaveBeenCalledTimes(1);
    expect(res).toBeDefined();

    // Some logs should have happened.
    expect(consoleLog).toHaveBeenCalled();
  });
});

