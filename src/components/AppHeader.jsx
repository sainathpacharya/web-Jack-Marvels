import React from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationPrefetch from '../hooks/useNavigationPrefetch';

const THEMES = {
  admin: {
    headerBg: 'bg-gradient-to-r from-green-100 to-blue-100',
    titleGradient: 'bg-gradient-to-r from-green-700 to-blue-800',
    logoutBtn: 'bg-green-600 hover:bg-green-700',
  },
  school: {
    headerBg: 'bg-[#cceeff]',
    titleGradient: 'bg-gradient-to-r from-sky-700 to-blue-800',
    logoutBtn: 'bg-sky-600 hover:bg-sky-700',
  },
  promoter: {
    headerBg: 'bg-[#ffe6b3]',
    titleGradient: 'bg-gradient-to-r from-amber-700 to-orange-800',
    logoutBtn: 'bg-amber-600 hover:bg-amber-700',
  },
};

function AppHeader({ onLogout, theme = 'admin' }) {
  const navigate = useNavigate();
  const { prefetchByPath } = useNavigationPrefetch();
  const selectedTheme = THEMES[theme] || THEMES.admin;

  return (
    <header className={`w-full flex justify-between items-center px-4 sm:px-6 md:px-20 py-4 sm:py-5 shadow ${selectedTheme.headerBg}`}>
      <button
        type="button"
        onClick={() => {
          // Default behavior: let each page decide what "home" means via logout callback or routing.
          // Keeping as no-op here to avoid unexpected navigation when clicking logo.
          // (If you want logo to navigate, wire it via onLogo prop later.)
        }}
        className="flex items-center gap-3 cursor-default"
        aria-label="Alpha Vlogs"
      >
        <img
          src="/alpha-vlogs-logo.png"
          alt="Alpha Vlogs logo"
          className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
        />
        <h1 className={`text-lg sm:text-xl font-extrabold text-transparent bg-clip-text ${selectedTheme.titleGradient}`}>
          Alpha Vlogs
        </h1>
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onMouseEnter={() => prefetchByPath('/profile')}
          onFocus={() => prefetchByPath('/profile')}
          onClick={() => navigate('/profile')}
          className="rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm text-slate-800 hover:bg-white/70"
        >
          Profile
        </button>
        <button
          type="button"
          onClick={onLogout}
          className={`text-white px-4 sm:px-5 py-2 rounded-full transition text-sm ${selectedTheme.logoutBtn}`}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default React.memo(AppHeader);

