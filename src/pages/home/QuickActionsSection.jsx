import React, { Suspense, lazy, memo } from 'react';
import { IconBell, IconBook, IconMegaphone, IconSchool, IconUser } from '../../components/icons/AppIcons';

const LottiePlayer = lazy(() => import('../../components/common/LottiePlayer'));

function getQuickActionIcon(name) {
  const key = String(name || '').trim().toLowerCase();
  if (key === 'add school') return <IconSchool className="h-8 w-8 text-brand-orange" />;
  if (key === 'add promoter') return <IconUser className="h-8 w-8 text-brand-orange" />;
  if (key === 'announce results') return <IconMegaphone className="h-8 w-8 text-brand-orange" />;
  if (key === 'add quiz') return <IconBook className="h-8 w-8 text-brand-orange" />;
  if (key === 'admin actions') return <IconBook className="h-8 w-8 text-brand-orange" />;
  if (key === 'send notice') return <IconBell className="h-8 w-8 text-brand-orange" />;
  return null;
}

function QuickActionsSection({ actions = [], onActionClick }) {
  if (!actions.length) return null;
  return (
    <section className="mb-20 mt-16 px-4">
      <div className="mb-10 text-center">
        <h2 className="theme-section-title">Explore Quick Actions</h2>
        <p className="mt-2 font-body text-sm text-gray-600 md:text-base">
          Manage your events, results, and announcements seamlessly
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
        {actions.map((item, i) => (
          <button
            key={`${item.name}-${i}`}
            type="button"
            className="theme-card relative flex flex-col items-center justify-center p-4 transition hover:-translate-y-1 hover:shadow-lg"
            onClick={() => onActionClick(item)}
          >
            <div className="rounded-full border border-orange-100/60 bg-white/80 p-3 shadow-inner">
              {getQuickActionIcon(item.name) || (
                <Suspense fallback={<div className="h-[60px] w-[60px] animate-pulse rounded-full bg-orange-100/50" />}>
                  <LottiePlayer src={item.animation} className="h-[60px] w-[60px]" />
                </Suspense>
              )}
            </div>
            <span className="mt-3 font-script text-xl text-purple-800">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default memo(QuickActionsSection);
