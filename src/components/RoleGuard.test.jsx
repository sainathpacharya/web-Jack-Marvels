import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import RoleGuard from './RoleGuard';
import { ROLE_IDS } from '../auth/session';

function renderWithRoutes({ initialPath, allow = [], contentText, roleId }) {
  const store = configureStore({
    reducer: {
      auth: (state = {}) => state,
    },
    preloadedState: {
      auth: { roleId },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/profile"
            element={(
              <RoleGuard allow={allow}>
                <div>{contentText}</div>
              </RoleGuard>
            )}
          />
          <Route path="/web-access-blocked" element={<div>Web Access Blocked</div>} />
          <Route path="/forbidden" element={<div>Forbidden</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('RoleGuard', () => {
  test('redirects students to /web-access-blocked and clears session', async () => {
    renderWithRoutes({ initialPath: '/profile', allow: [1, 2, 3], contentText: 'Allowed', roleId: ROLE_IDS.STUDENT });
    expect(screen.getByText('Web Access Blocked')).toBeInTheDocument();
  });

  test('redirects unauthorized roles to /forbidden', async () => {
    renderWithRoutes({ initialPath: '/profile', allow: [1], contentText: 'Allowed', roleId: 2 });
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
  });

  test('renders children when role is allowed', async () => {
    renderWithRoutes({ initialPath: '/profile', allow: [1, 2], contentText: 'Allowed', roleId: 1 });

    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  test('allows super admin when role is included', async () => {
    renderWithRoutes({
      initialPath: '/profile',
      allow: [ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN],
      contentText: 'Allowed',
      roleId: ROLE_IDS.SUPER_ADMIN,
    });
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  test('allows influencer when role is included', async () => {
    renderWithRoutes({
      initialPath: '/profile',
      allow: [ROLE_IDS.PROMOTOR, ROLE_IDS.INFLUENCER],
      contentText: 'Allowed',
      roleId: ROLE_IDS.INFLUENCER,
    });
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });
});

