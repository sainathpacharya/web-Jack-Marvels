import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FormModal from './FormModal';

describe('FormModal', () => {
  test('renders title and children and closes on Close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <FormModal title="Test Modal" onClose={onClose}>
        <div>Modal body</div>
      </FormModal>,
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

