import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { BottomNav } from '../components/BottomNav';

export function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="bg-app relative min-h-dvh flex flex-col">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" aria-hidden />
      <div className="glow-orb glow-orb-2" aria-hidden />
      <div className="glow-orb glow-orb-3" aria-hidden />

      {/* Top Header with App brand, Logged-in User and Logout */}
      <header className="sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <UtensilsCrossed size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider font-display">CATERING HUB</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>Active</span>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/90 shadow-inner">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white max-w-[100px] sm:max-w-[140px] truncate">
                    {user.username}
                  </span>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="text-[11px] text-white/60 hidden sm:inline">
                    {user.phoneNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold text-white/80 hover:text-white border border-white/15 cursor-pointer"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Centered container on desktop */}
      <div className="relative z-10 mx-auto w-full max-w-3xl flex-1">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
