import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PaginationControls from './PaginationControls';

describe('PaginationControls', () => {
  test('disables Previous on first page and calls onPageChange on Next', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    const onSizeChange = jest.fn();

    render(
      <PaginationControls
        page={0}
        size={10}
        totalElements={100}
        totalPages={10}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />,
    );

    expect(screen.getByText(/showing 1-10 of 100 students/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('calls onSizeChange when Rows select changes', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    const onSizeChange = jest.fn();

    render(
      <PaginationControls
        page={0}
        size={10}
        totalElements={0}
        totalPages={1}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/rows/i), ['20']);
    expect(onSizeChange).toHaveBeenCalledWith(20);
  });
});

