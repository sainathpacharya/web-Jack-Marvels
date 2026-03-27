import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">403 - Forbidden</h1>
        <p className="text-gray-700 mt-3">
          You are not authorized to access this section.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
