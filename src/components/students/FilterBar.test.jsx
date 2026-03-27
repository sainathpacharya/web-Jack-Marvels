import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FilterBar from './FilterBar';

describe('FilterBar', () => {
  test('shows active badge when filters are set', async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(
      <FilterBar
        filters={{ className: '10-A', section: '', search: 'ana', status: 'active' }}
        onFilterChange={onFilterChange}
        classOptions={['10-A', '10-B']}
        sectionOptions={['A', 'B']}
      />,
    );

    expect(screen.getByText('3 active')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/search name \/ mobile/i), 'x');
    expect(onFilterChange).toHaveBeenCalled();
  });

  test('does not show active badge when no filters are set', () => {
    const onFilterChange = jest.fn();

    render(
      <FilterBar
        filters={{ className: '', section: '', search: '', status: '' }}
        onFilterChange={onFilterChange}
      />,
    );

    expect(screen.queryByText(/\d+\s+active/i)).not.toBeInTheDocument();
  });
});

