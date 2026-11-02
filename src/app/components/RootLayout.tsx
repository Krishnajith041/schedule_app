import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, LogOut, Users, Cloud, CloudOff, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useAppContext } from '../state/AppContext';
import { BottomNav } from '../components/BottomNav';
import { TeamSyncModal } from '../components/TeamSyncModal';

export function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { cloudConfig, syncStatus, lastSyncedAt, updateCloudConfig, syncNow, notification, dismissNotification } =
    useAppContext();

  const [showSyncModal, setShowSyncModal] = useState(false);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => dismissNotification(), 4000);
    return () => clearTimeout(t);
  }, [notification, dismissNotification]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const syncColor =
    syncStatus === 'synced'
      ? 'text-emerald-400'
      : syncStatus === 'syncing'
      ? 'text-violet-400 animate-spin'
      : syncStatus === 'error'
      ? 'text-red-400'
      : syncStatus === 'disabled'
      ? 'text-white/30'
      : 'text-white/40';

  const syncTitle =
    syncStatus === 'synced'
      ? `Synced · ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : ''}`
      : syncStatus === 'syncing'
      ? 'Syncing…'
      : syncStatus === 'error'
      ? 'Sync error — tap to retry'
      : cloudConfig.enabled
      ? 'Connected'
      : 'Local only — tap to set up team sync';

  return (
    <div className="bg-app relative min-h-dvh flex flex-col">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" aria-hidden />
      <div className="glow-orb glow-orb-2" aria-hidden />
      <div className="glow-orb glow-orb-3" aria-hidden />

      {/* Top Header */}
      <header className="sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <UtensilsCrossed size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider font-display">CATERING HUB</div>
              {/* Sync status badge */}
              <button
                type="button"
                onClick={() => setShowSyncModal(true)}
                title={syncTitle}
                className="text-[10px] flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {cloudConfig.enabled && cloudConfig.firebaseUrl ? (
                  syncStatus === 'syncing' ? (
                    <RefreshCw size={10} className={syncColor} />
                  ) : syncStatus === 'error' ? (
                    <CloudOff size={10} className={syncColor} />
                  ) : (
                    <Cloud size={10} className={syncColor} />
                  )
                ) : (
                  <Cloud size={10} className={syncColor} />
                )}
                <span className={syncColor}>
                  {cloudConfig.enabled && cloudConfig.firebaseUrl
                    ? syncStatus === 'syncing'
                      ? 'Syncing…'
                      : syncStatus === 'error'
                      ? 'Sync Error'
                      : 'Team Sync'
                    : 'Local Only'}
                </span>
              </button>
            </div>
          </div>

          {/* Right side: user pill + sync button + logout */}
          {user && (
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Team sync icon button */}
              <button
                type="button"
                onClick={() => setShowSyncModal(true)}
                title="Team Cloud Sync Settings"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Team sync settings"
              >
                <Users size={15} className="text-violet-300" />
              </button>

              {/* User pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/90 shadow-inner min-w-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-white max-w-[80px] sm:max-w-[140px] truncate">
                  {user.username}
                </span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-[11px] text-white/60 hidden sm:inline truncate max-w-[100px]">
                  {user.phoneNumber}
                </span>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold text-white/80 hover:text-white border border-white/15 cursor-pointer flex-shrink-0"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <div className="relative mx-auto w-full max-w-3xl flex-1">
        <Outlet />
      </div>

      <BottomNav />

      {/* ── Live update toast notification ── */}
      {notification && (
        <div
          key={notification.id}
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-[200] animate-fade-in-up w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="glass-card px-4 py-3 border border-violet-500/30 shadow-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">{notification.message}</p>
              {notification.staff && (
                <p className="text-xs text-white/50 mt-0.5">
                  by <span className="text-violet-300">{notification.staff}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={dismissNotification}
              className="text-white/40 hover:text-white cursor-pointer flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Team Sync Modal ── */}
      {showSyncModal && (
        <TeamSyncModal
          config={cloudConfig}
          onSaveConfig={updateCloudConfig}
          onSyncNow={syncNow}
          onClose={() => setShowSyncModal(false)}
          syncStatus={syncStatus}
          lastSyncedAt={lastSyncedAt}
        />
      )}
    </div>
  );
}
