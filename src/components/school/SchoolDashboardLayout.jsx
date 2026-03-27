import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../auth/session';
import AppHeader from '../AppHeader';
import SidebarMenu from './SidebarMenu';
import { logoutFromServer } from '../../api/auth';
import { IconClose, IconMenu } from '../icons/AppIcons';

export default function SchoolDashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getCurrentUser();
  const schoolId = user?.schoolId ?? user?.school_id ?? '-';

  const handleLogout = async () => {
    await logoutFromServer();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f3fbff]">
      <AppHeader onLogout={handleLogout} theme="school" />
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6 sm:px-6">
        <aside className="sticky top-4 hidden h-fit w-64 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm lg:block">
          <p className="mb-1 text-xs uppercase tracking-wide text-sky-700">School Panel</p>
          <p className="mb-4 text-sm text-gray-600">School ID: {schoolId}</p>
          <SidebarMenu />
        </aside>

        <div className="w-full">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-900 lg:hidden"
          >
            <IconMenu />
            Menu
          </button>

          {sidebarOpen ? (
            <div className="fixed inset-0 z-50 bg-black/30 lg:hidden">
              <div className="h-full w-72 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-sky-900">School Menu</p>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-md border border-sky-200 p-2 text-sky-900"
                  >
                    <IconClose />
                  </button>
                </div>
                <SidebarMenu mobile onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-opacity duration-200 sm:p-6">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
