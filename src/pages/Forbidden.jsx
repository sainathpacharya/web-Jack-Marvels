import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="theme-card-lg w-full max-w-xl text-center">
        <h1 className="theme-page-title !mb-3 !text-3xl">403 - Forbidden</h1>
        <p className="text-gray-700">You are not authorized to access this section.</p>
        <div className="mt-6">
          <button type="button" onClick={() => navigate('/home')} className="theme-btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
