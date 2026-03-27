import React from 'react';
import { render, screen } from '@testing-library/react';

import ErrorTable from './ErrorTable';

describe('ErrorTable', () => {
  test('returns null when there are no failures', () => {
    const { container } = render(<ErrorTable failures={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders failures and optionally download button', () => {
    const onDownloadReport = jest.fn();
    const failures = [
      { rowNumber: 2, reason: 'Bad email', mobileNumber: '9999999999', emailId: 'x@y.com' },
    ];

    render(<ErrorTable failures={failures} onDownloadReport={onDownloadReport} />);

    expect(screen.getByText(/upload errors\s*\(\s*1\s*\)/i)).toBeInTheDocument();
    expect(screen.getByText('Bad email')).toBeInTheDocument();

    screen.getByRole('button', { name: /download failure report/i }).click();
    expect(onDownloadReport).toHaveBeenCalledTimes(1);
  });
});

