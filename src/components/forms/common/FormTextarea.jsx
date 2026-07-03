import React from 'react';

export default function FormTextarea({ error, className = '', ...props }) {
  return (
    <div>
      <textarea
        {...props}
        className={`w-full resize-none rounded-lg border bg-white/80 p-3 font-body text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 ${error ? 'border-red-400 focus:border-red-400' : 'border-orange-200/70 focus:border-brand-orange'} ${className}`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
