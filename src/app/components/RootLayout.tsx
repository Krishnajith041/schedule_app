import React from 'react';

import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export function RootLayout() {
  return (
    <div className="bg-app relative min-h-dvh">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" aria-hidden />
      <div className="glow-orb glow-orb-2" aria-hidden />
      <div className="glow-orb glow-orb-3" aria-hidden />

      {/* Centered container on desktop */}
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
