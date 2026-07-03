import React from 'react';
import { NavLink } from 'react-router-dom';
import useNavigationPrefetch from '../../hooks/useNavigationPrefetch';
import { IconCreditCard, IconDashboard, IconUser, IconUsers } from '../icons/AppIcons';
import { getNavColor } from '../../lib/adminTheme';

const ITEMS = [
  { label: 'Dashboard', to: '/school/dashboard', icon: IconDashboard, colorKey: 'dashboard' },
  { label: 'Students (Bulk Upload)', to: '/school/students', icon: IconUsers, colorKey: 'students' },
  { label: 'Subscription', to: '/school/subscription', icon: IconCreditCard, colorKey: 'partners' },
  { label: 'Profile', to: '/profile', icon: IconUser, colorKey: 'profile' },
];

function SidebarMenu({ mobile = false, onNavigate }) {
  const { getPrefetchHandlers } = useNavigationPrefetch();
  return (
    <nav className="space-y-1">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 font-script text-xl transition',
                isActive
                  ? 'bg-peach-highlight text-gray-800 shadow-sm'
                  : `${getNavColor(item.colorKey)} hover:bg-peach-highlight/50`,
                mobile ? 'w-full' : '',
              ].join(' ')
            }
          >
            <Icon className="text-base opacity-80" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default React.memo(SidebarMenu);
