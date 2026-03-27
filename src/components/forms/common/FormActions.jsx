import React from 'react';

export default function FormActions({
  onCancel,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  submitting = false,
  submitDisabled = false,
}) {
  return (
    <div className="mt-4 flex gap-3 border-t border-gray-100 pt-3">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-lg border border-gray-300 py-2 hover:bg-gray-50"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || submitDisabled}
        className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}
