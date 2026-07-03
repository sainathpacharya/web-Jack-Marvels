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
    <div className="min-h-screen">
      <AppHeader onLogout={handleLogout} theme="school" />
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6 sm:px-6">
          <aside className="sticky top-4 hidden h-fit w-64 rounded-2xl border border-orange-100/60 bg-sidebar-peach p-4 lg:block">
            <p className="mb-1 font-label text-sm font-semibold text-green-800">School Panel</p>
            <p className="mb-4 font-body text-sm text-gray-600">School ID: {schoolId}</p>
            <SidebarMenu />
          </aside>

          <div className="w-full">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mb-3 inline-flex items-center gap-2 rounded-lg border border-orange-200/60 bg-white/70 px-3 py-2 font-label text-sm text-gray-800 lg:hidden"
            >
              <IconMenu />
              Menu
            </button>

            {sidebarOpen ? (
              <div className="fixed inset-0 z-50 bg-black/30 lg:hidden">
                <div className="h-full w-72 border-r border-orange-100/60 bg-sidebar-peach p-4 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-script text-2xl text-purple-800">School Menu</p>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-md border border-orange-200/60 p-2 text-gray-800"
                    >
                      <IconClose />
                    </button>
                  </div>
                  <SidebarMenu mobile onNavigate={() => setSidebarOpen(false)} />
                </div>
              </div>
            ) : null}

            <section className="rounded-2xl border border-orange-100/50 bg-white/50 p-5 backdrop-blur-sm transition-opacity duration-200 sm:p-6">
              <Outlet />
            </section>
        </div>
      </div>
    </div>
  );
}
