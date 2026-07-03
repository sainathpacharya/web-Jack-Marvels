import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SiteHeader({
  onLogin,
  onRegister,
  onLogout,
  onSubscribe,
  showLogin = false,
  showRegister = false,
  showLogout = false,
  showSubscribe = false,
  homePath = '/',
}) {
  const navigate = useNavigate();

  return (
    <header className="theme-site-header flex items-center justify-between px-4 py-4 sm:px-6 md:px-20 md:py-5">
      <button
        type="button"
        onClick={() => navigate(homePath)}
        className="flex items-center gap-3 bg-transparent"
        aria-label="Go to Home"
      >
        <img
          src="/alpha-vlogs-logo.png"
          alt="Alpha Vlogs logo"
          className="h-10 w-10 rounded-full object-contain sm:h-14 sm:w-14"
        />
        <span className="font-display text-lg font-bold text-brand-orange sm:text-xl">ALPHA VLOGS</span>
      </button>

      <div className="flex items-center gap-2">
        {showSubscribe ? (
          <button type="button" onClick={onSubscribe} className="theme-btn-accent text-sm">
            Subscribe
          </button>
        ) : null}
        {showRegister ? (
          <button type="button" onClick={onRegister} className="theme-btn-outline text-sm">
            Register
          </button>
        ) : null}
        {showLogin ? (
          <button type="button" onClick={onLogin} className="theme-btn-primary text-sm">
            Login
          </button>
        ) : null}
        {showLogout ? (
          <button type="button" onClick={onLogout} className="theme-btn-primary text-sm">
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}
