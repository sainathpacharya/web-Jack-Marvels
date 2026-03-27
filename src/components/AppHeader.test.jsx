import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import AppHeader from './AppHeader';

describe('AppHeader', () => {
  test('navigates to /profile when Profile is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppHeader onLogout={jest.fn()} />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /profile/i }));
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });

  test('calls onLogout when Logout is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<AppHeader onLogout={onLogout} />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

