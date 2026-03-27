import React from 'react';

export default function FormModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
