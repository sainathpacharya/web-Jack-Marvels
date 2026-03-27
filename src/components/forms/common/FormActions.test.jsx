import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FormActions from './FormActions';

describe('FormActions', () => {
  test('disables submit button when submitting or submitDisabled', async () => {
    const user = userEvent.setup();

    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(
      <FormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitting
        submitDisabled={false}
        submitLabel="Save"
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /saving/i });
    expect(submitBtn).toBeDisabled();
    await user.click(submitBtn);
    expect(onSubmit).not.toHaveBeenCalled();

    render(
      <FormActions
        onCancel={onCancel}
        onSubmit={onSubmit}
        submitting={false}
        submitDisabled
        submitLabel="Save"
      />,
    );
    const submitBtn2 = screen.getByRole('button', { name: /save/i });
    expect(submitBtn2).toBeDisabled();
    await user.click(submitBtn2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('calls onCancel and onSubmit when buttons are clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(<FormActions onCancel={onCancel} onSubmit={onSubmit} submitLabel="Submit" cancelLabel="Go Back" />);

    await user.click(screen.getByRole('button', { name: /go back/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

