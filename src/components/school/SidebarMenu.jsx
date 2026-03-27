import React from 'react';
import { NavLink } from 'react-router-dom';
import useNavigationPrefetch from '../../hooks/useNavigationPrefetch';
import { IconCreditCard, IconDashboard, IconUser, IconUsers } from '../icons/AppIcons';

const ITEMS = [
  { label: 'Dashboard', to: '/school/dashboard', icon: IconDashboard },
  { label: 'Students (Bulk Upload)', to: '/school/students', icon: IconUsers },
  { label: 'Subscription', to: '/school/subscription', icon: IconCreditCard },
  { label: 'Profile', to: '/profile', icon: IconUser },
];

function SidebarMenu({ mobile = false, onNavigate }) {
  const { getPrefetchHandlers } = useNavigationPrefetch();
  return (
    <nav className="space-y-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            {...getPrefetchHandlers(item.to)}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-sky-700 text-white shadow-sm' : 'text-sky-900 hover:bg-sky-100',
                mobile ? 'w-full' : '',
              ].join(' ')
            }
          >
            <Icon className="text-base" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default React.memo(SidebarMenu);
