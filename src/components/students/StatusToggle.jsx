import React from 'react';

export default function StatusToggle({ active, disabled = false, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`inline-flex min-w-24 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition ${
        active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {active ? 'Active' : 'Inactive'}
    </button>
  );
}
