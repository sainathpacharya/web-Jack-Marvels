import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WebAccessBlocked() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="theme-card-lg w-full max-w-xl text-center">
        <h1 className="theme-page-title !mb-3 !text-3xl">Web Access Restricted</h1>
        <p className="text-gray-700">Student registration is only available on mobile app.</p>
        <p className="mt-2 text-sm text-gray-500">
          Please use the mobile app to register as a student and select your school.
        </p>
        <div className="mt-6">
          <button type="button" onClick={() => navigate('/')} className="theme-btn-primary">
            Go to Landing
          </button>
        </div>
      </div>
    </div>
  );
}
