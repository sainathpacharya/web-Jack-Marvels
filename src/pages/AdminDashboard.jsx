import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  STATIC_TOTAL_STUDENTS,
  STATIC_RECENT_UPLOADS,
  STATIC_QUIZ_ATTEMPTS,
  STATIC_STUDENTS_LIST,
  STATIC_UPLOADS_LIST,
} from '../data/staticData';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: '🕐', path: 'dashboard' },
  { label: 'Upload', icon: '📤', path: 'upload' },
  { label: 'Students', icon: '✉️', path: 'students' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-blue-700">S- JACXES</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveNav(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeNav === item.path ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main - static data for now; TODO: replace with API */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {activeNav === 'dashboard' && 'ADMIN DASHBOARD'}
          {activeNav === 'upload' && 'Upload'}
          {activeNav === 'students' && 'Students'}
        </h1>

        {activeNav === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">{STATIC_TOTAL_STUDENTS}</p>
                <p className="text-gray-600 mt-1">Total Students</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-gray-600 mb-2">Active Students</p>
                <div className="flex gap-2">
                  <div className="h-8 flex-1 bg-gray-200 rounded" />
                  <div className="h-8 flex-1 bg-gray-200 rounded" />
                  <div className="h-8 flex-1 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Uploads</h2>
              <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
                {STATIC_RECENT_UPLOADS.map((name, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700">{name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quiz Attempts</h2>
              <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
                {STATIC_QUIZ_ATTEMPTS.map((name, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700">{name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeNav === 'upload' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {STATIC_UPLOADS_LIST.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <span className="text-gray-800 font-medium">{u.title}</span>
                  <span className="text-gray-500 text-sm ml-2">— {u.student}</span>
                </div>
                <span className="text-gray-400 text-sm">{u.date}</span>
              </div>
            ))}
          </div>
        )}

        {activeNav === 'students' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {STATIC_STUDENTS_LIST.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <span className="text-gray-800 font-medium">{s.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{s.email}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
