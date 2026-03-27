import React, { Suspense, lazy, memo } from 'react';
import { IconBell, IconBook, IconMegaphone, IconSchool, IconUser } from '../../components/icons/AppIcons';

const LottiePlayer = lazy(() => import('../../components/common/LottiePlayer'));

function getQuickActionIcon(name) {
  const key = String(name || '').trim().toLowerCase();
  if (key === 'add school') return <IconSchool className="h-8 w-8 text-indigo-700" />;
  if (key === 'add promoter') return <IconUser className="h-8 w-8 text-indigo-700" />;
  if (key === 'announce results') return <IconMegaphone className="h-8 w-8 text-indigo-700" />;
  if (key === 'add quiz') return <IconBook className="h-8 w-8 text-indigo-700" />;
  if (key === 'admin actions') return <IconBook className="h-8 w-8 text-indigo-700" />;
  if (key === 'send notice') return <IconBell className="h-8 w-8 text-indigo-700" />;
  return null;
}

function QuickActionsSection({ actions = [], onActionClick }) {
  if (!actions.length) return null;
  return (
    <section className="mt-16 mb-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-800">Explore Quick Actions</h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Manage your events, results, and announcements seamlessly</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {actions.map((item, i) => (
          <button
            key={`${item.name}-${i}`}
            type="button"
            className="relative bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex flex-col items-center justify-center border border-indigo-100 hover:-translate-y-1"
            onClick={() => onActionClick(item)}
          >
            <div className="bg-white p-3 rounded-full shadow-inner border border-indigo-100">
              {getQuickActionIcon(item.name) || (
                <Suspense fallback={<div className="h-[60px] w-[60px] animate-pulse rounded-full bg-slate-100" />}>
                  <LottiePlayer src={item.animation} className="h-[60px] w-[60px]" />
                </Suspense>
              )}
            </div>
            <span className="mt-3 text-sm font-semibold text-indigo-800">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default memo(QuickActionsSection);
