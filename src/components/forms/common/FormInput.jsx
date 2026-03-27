import React from 'react';

export default function FormInput({ error, className = '', ...props }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full rounded-lg border p-3 text-sm ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
