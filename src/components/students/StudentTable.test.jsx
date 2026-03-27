import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StudentTable from './StudentTable';

describe('StudentTable', () => {
  test('shows empty state when no students and not loading', () => {
    render(<StudentTable students={[]} loading={false} onSortChange={jest.fn()} onStatusToggle={jest.fn()} />);
    expect(screen.getByText(/no students uploaded yet/i)).toBeInTheDocument();
  });

  test('shows loading skeleton rows when loading', () => {
    const { container } = render(<StudentTable loading onSortChange={jest.fn()} onStatusToggle={jest.fn()} />);
    // skeleton uses animate-pulse divs
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('renders rows and calls onSortChange and onStatusToggle', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    const onStatusToggle = jest.fn();

    const students = [
      { id: 1, name: 'Ana', mobileNumber: '123', emailId: 'a@a.com', className: '10', section: 'A', status: 'active' },
    ];

    render(
      <StudentTable
        students={students}
        sortBy="name"
        sortDir="asc"
        onSortChange={onSortChange}
        onStatusToggle={onStatusToggle}
        updatingStudentId={null}
        loading={false}
      />,
    );

    expect(screen.getByText('Ana')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /name/i }));
    expect(onSortChange).toHaveBeenCalledWith('name');

    const statusBtn = screen.getByRole('button', { name: /active/i });
    expect(statusBtn).not.toBeDisabled();
    await user.click(statusBtn);
    expect(onStatusToggle).toHaveBeenCalledWith(students[0]);
  });

  test('disables StatusToggle while updating specific student', async () => {
    const user = userEvent.setup();
    const onStatusToggle = jest.fn();
    const students = [{ id: 2, name: 'Bob', status: 'inactive' }];

    render(
      <StudentTable
        students={students}
        onSortChange={jest.fn()}
        onStatusToggle={onStatusToggle}
        updatingStudentId={2}
        loading={false}
      />,
    );

    const statusBtn = screen.getByRole('button', { name: /inactive/i });
    expect(statusBtn).toBeDisabled();
    await user.click(statusBtn);
    expect(onStatusToggle).not.toHaveBeenCalled();
  });
});

