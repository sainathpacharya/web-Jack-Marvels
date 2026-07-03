import React from 'react';
import WatercolorBackground from '../admin/WatercolorBackground';

export default function AppLayout({ children }) {
  return (
    <div className="theme-shell">
      <WatercolorBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
