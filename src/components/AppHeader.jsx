import React from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationPrefetch from '../hooks/useNavigationPrefetch';

function AppHeader({ onLogout, theme = 'admin' }) {
  const navigate = useNavigate();
  const { prefetchByPath } = useNavigationPrefetch();

  return (
    <header className="theme-site-header flex w-full items-center justify-between px-4 py-4 sm:px-6 md:px-20 md:py-5">
      <button
        type="button"
        onClick={() => navigate('/home')}
        className="flex items-center gap-3"
        aria-label="Alpha Vlogs Home"
      >
        <img
          src="/alpha-vlogs-logo.png"
          alt="Alpha Vlogs logo"
          className="h-10 w-10 object-contain sm:h-14 sm:w-14"
        />
        <h1 className="font-display text-lg font-bold text-brand-orange sm:text-xl">
          ALPHA VLOGS
        </h1>
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onMouseEnter={() => prefetchByPath('/profile')}
          onFocus={() => prefetchByPath('/profile')}
          onClick={() => navigate('/profile')}
          className="theme-btn-outline !border-orange-200/80 !text-gray-700"
        >
          Profile
        </button>
        <button type="button" onClick={onLogout} className="theme-btn-primary">
          Logout
        </button>
      </div>
    </header>
  );
}

export default React.memo(AppHeader);
