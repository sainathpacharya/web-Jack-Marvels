import React from 'react';
import { getNavColor } from '../../lib/adminTheme';

function SidebarBrand({ onLogoClick }) {
  return (
    <button
      type="button"
      onClick={onLogoClick}
      className="flex w-full flex-col items-center border-b border-orange-100/80 bg-sidebar-peach p-5 hover:bg-peach-highlight/40"
      aria-label="Go to Home"
    >
      <img
        src="/alpha-vlogs-logo.png"
        alt="Alpha Vlogs logo"
        className="mb-2 h-16 w-16 object-contain"
      />
      <span className="font-display text-xl font-bold tracking-wide text-brand-orange">
        ALPHA VLOGS
      </span>
    </button>
  );
}

function SidebarNav({ items, activeNav, onNavClick, onMouseEnterItem }) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {items.map((item) => {
        const isActive = activeNav === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => onNavClick(item.path)}
            onMouseEnter={() => onMouseEnterItem?.(item.path)}
            className={[
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-script text-xl transition',
              isActive
                ? 'bg-peach-highlight text-gray-800 shadow-sm'
                : `${getNavColor(item.path)} hover:bg-peach-highlight/50`,
            ].join(' ')}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" /> : null}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({
  items,
  activeNav,
  onNavClick,
  onLogoClick,
  onLogout,
  onMouseEnterItem,
  mobile = false,
  onNavigate,
}) {
  const handleNav = (path) => {
    onNavClick(path);
    if (mobile) onNavigate?.();
  };

  return (
    <aside
      className={[
        'flex w-56 flex-col border-r border-orange-100/60 bg-sidebar-peach',
        mobile ? '' : 'hidden md:flex',
      ].join(' ')}
    >
      <SidebarBrand onLogoClick={onLogoClick} />
      <div className="px-4 pt-3">
        <p className="font-label text-sm font-semibold text-green-800">Admin Panel</p>
      </div>
      <SidebarNav
        items={items}
        activeNav={activeNav}
        onNavClick={handleNav}
        onMouseEnterItem={onMouseEnterItem}
      />
      <div className="border-t border-orange-100/80 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg bg-brand-orange px-3 py-2 font-script text-lg font-bold text-white transition hover:bg-orange-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export function AdminMobileSidebar({
  open,
  items,
  activeNav,
  onNavClick,
  onLogoClick,
  onLogout,
  onClose,
  onMouseEnterItem,
}) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-orange-100/60 bg-sidebar-peach transform transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarBrand onLogoClick={onLogoClick} />
        <div className="px-4 pt-3">
          <p className="font-label text-sm font-semibold text-green-800">Admin Panel</p>
        </div>
        <SidebarNav
          items={items}
          activeNav={activeNav}
          onNavClick={(path) => {
            onNavClick(path);
            onClose();
          }}
          onMouseEnterItem={onMouseEnterItem}
        />
        <div className="border-t border-orange-100/80 p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full rounded-lg bg-brand-orange px-3 py-2 font-script text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
