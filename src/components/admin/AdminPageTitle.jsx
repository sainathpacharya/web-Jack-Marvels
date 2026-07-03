import React from 'react';

const TITLES = {
  dashboard: 'Admin Dashboard',
  students: 'Students',
  events: 'Events',
  quiz: 'Quiz',
  promotors: 'Promotors',
  influencers: 'Influencers',
  partners: 'Partners',
  schools: 'Schools',
  profile: 'Profile',
  promoters: 'Promoters',
  sponsors: 'Sponsors',
  'video-bytes': 'Video Bytes',
  'promo-codes': 'Promo Codes',
};

export default function AdminPageTitle({ activeNav, className = '' }) {
  const title = TITLES[activeNav] || activeNav;
  return (
    <h1 className={`font-script text-4xl font-bold text-purple-800 md:text-5xl ${className}`}>
      {title}
    </h1>
  );
}
