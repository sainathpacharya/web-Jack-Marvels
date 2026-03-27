import React from 'react';

function Svg({ children, className = 'h-5 w-5', viewBox = '0 0 24 24' }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props) {
  return <Svg {...props}><path d="M3 13h8V3H3z" /><path d="M13 21h8v-8h-8z" /><path d="M13 3h8v6h-8z" /><path d="M3 21h8v-4H3z" /></Svg>;
}
export function IconBook(props) {
  return <Svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" /></Svg>;
}
export function IconCalendar(props) {
  return <Svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></Svg>;
}
export function IconBrain(props) {
  return <Svg {...props}><path d="M9 6a3 3 0 1 1 6 0v12a3 3 0 1 1-6 0z" /><path d="M9 9H7a3 3 0 0 0 0 6h2" /><path d="M15 9h2a3 3 0 0 1 0 6h-2" /></Svg>;
}
export function IconSchool(props) {
  return <Svg {...props}><path d="m3 10 9-6 9 6-9 6-9-6Z" /><path d="M5 10v8h14v-8" /><path d="M9 22h6" /></Svg>;
}
export function IconUser(props) {
  return <Svg {...props}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></Svg>;
}
export function IconUsers(props) {
  return <Svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>;
}
export function IconCreditCard(props) {
  return <Svg {...props}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></Svg>;
}
export function IconMenu(props) {
  return <Svg {...props}><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></Svg>;
}
export function IconClose(props) {
  return <Svg {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>;
}
export function IconBell(props) {
  return <Svg {...props}><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M10 17a2 2 0 0 0 4 0" /></Svg>;
}
export function IconMegaphone(props) {
  return <Svg {...props}><path d="M3 11v2a2 2 0 0 0 2 2h2l4 4V5L7 9H5a2 2 0 0 0-2 2Z" /><path d="M14 9a6 6 0 0 1 0 6" /><path d="M17 7a9 9 0 0 1 0 10" /></Svg>;
}
