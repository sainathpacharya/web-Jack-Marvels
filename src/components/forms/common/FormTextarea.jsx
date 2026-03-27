import React from 'react';

export default function FormTextarea({ error, className = '', ...props }) {
  return (
    <div>
      <textarea
        {...props}
        className={`w-full rounded-lg border p-3 text-sm resize-none ${error ? 'border-red-400' : 'border-gray-300'} ${className}`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
