import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UploadSection from './UploadSection';

describe('UploadSection', () => {
  test('calls onDownloadTemplate when download button is clicked', async () => {
    const user = userEvent.setup();
    const onDownloadTemplate = jest.fn();

    render(
      <UploadSection
        onDownloadTemplate={onDownloadTemplate}
        onUpload={jest.fn()}
        isUploading={false}
        uploadProgress={0}
        lastResult={null}
      />,
    );

    await user.click(screen.getByRole('button', { name: /download excel template/i }));
    expect(onDownloadTemplate).toHaveBeenCalledTimes(1);
  });

  test('shows error for invalid file type', async () => {
    const onUpload = jest.fn();
    const { container } = render(
      <UploadSection
        onDownloadTemplate={jest.fn()}
        onUpload={onUpload}
        isUploading={false}
        uploadProgress={0}
        lastResult={null}
      />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    const badFile = new File(['bad'], 'students.txt', { type: 'text/plain' });
    // `userEvent.upload` may respect the input `accept` attribute; we want to bypass it
    // to test component-side validation based on filename/extension.
    Object.defineProperty(input, 'files', {
      value: [badFile],
    });
    fireEvent.change(input);

    await waitFor(() => expect(screen.getByText(/invalid file type/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /upload students/i })).toBeDisabled();
    expect(onUpload).not.toHaveBeenCalled();
  });

  test('shows error for oversized file', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <UploadSection
        onDownloadTemplate={jest.fn()}
        onUpload={jest.fn()}
        isUploading={false}
        uploadProgress={0}
        lastResult={null}
      />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    // 6MB
    const bigContent = new Array(6 * 1024 * 1024 + 10).join('a');
    const bigFile = new File([bigContent], 'students.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(input, bigFile);

    await waitFor(() => expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument());
  });

  test('uploads selected valid file when Upload Students is clicked', async () => {
    const user = userEvent.setup();
    const onUpload = jest.fn();
    const { container } = render(
      <UploadSection
        onDownloadTemplate={jest.fn()}
        onUpload={onUpload}
        isUploading={false}
        uploadProgress={0}
        lastResult={null}
      />,
    );

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    const file = new File(['ok'], 'students.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(input, file);

    expect(screen.getByText(/selected:/i)).toHaveTextContent('students.xlsx');
    const uploadBtn = screen.getByRole('button', { name: /upload students/i });
    expect(uploadBtn).toBeEnabled();

    await user.click(uploadBtn);
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  test('disables upload button when isUploading is true', async () => {
    const user = userEvent.setup();
    const onUpload = jest.fn();
    const { container } = render(
      <UploadSection
        onDownloadTemplate={jest.fn()}
        onUpload={onUpload}
        isUploading
        uploadProgress={42}
        lastResult={null}
      />,
    );

    const input = container.querySelector('input[type="file"]');
    const file = new File(['ok'], 'students.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(input, file);
    expect(screen.getByText(/42%/)).toBeInTheDocument();
    const uploadBtn = screen.getByRole('button', { name: /uploading/i });
    expect(uploadBtn).toBeDisabled();
  });
});

