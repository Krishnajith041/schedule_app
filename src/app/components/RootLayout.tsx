import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Users,
  Cloud,
  CloudOff,
  RefreshCw,
  X,
  CheckCircle2,
  Shield,
  Eye,
  CalendarPlus,
  AlertTriangle, MoreHorizontal, Utensils,
} from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { useAppContext } from '../state/AppContext';
import { BottomNav } from '../components/BottomNav';
import { TeamSyncModal } from '../components/TeamSyncModal';

export function RootLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const {
    cloudConfig,
    syncStatus,
    lastSyncedAt,
    updateCloudConfig,
    syncNow,
    notification,
    dismissNotification,
  } = useAppContext();

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isAdmin = user?.role === 'admin';

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
      ? 'Sync error'
      : cloudConfig.enabled
      ? 'Connected'
      : 'Local only';

  const roleBadge = user?.role === 'admin' ? (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-0.5 flex-shrink-0">
      <Shield size={10} /> Admin
    </span>
  ) : user?.role === 'staff' ? (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/40 flex items-center gap-0.5 flex-shrink-0">
      <CalendarPlus size={10} /> Staff
    </span>
  ) : (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/40 flex items-center gap-0.5 flex-shrink-0">
      <Eye size={10} /> Viewer
    </span>
  );

  return (
    <div className="bg-app relative min-h-dvh flex flex-col">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb-1" aria-hidden />
      <div className="glow-orb glow-orb-2" aria-hidden />
      <div className="glow-orb glow-orb-3" aria-hidden />

      {/* Top Header */}
      <header className="sticky top-0 z-40 px-4 py-2.5 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-2">
          {/* Left: Brand name + sync status */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Brand icon — default gradient icon, no image */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/30 flex-shrink-0">
              <Utensils size={18} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wider font-display">
                MH CATERING &amp; EVENTS
              </div>
              {/* Sync status indicator */}
              <button
                type="button"
                onClick={() => setShowSyncModal(true)}
                title={`${syncTitle} (Click to manage Team Sync)`}
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
                  <CloudOff size={10} className="text-white/40" />
                )}
                <span className={syncColor}>
                  {cloudConfig.enabled && cloudConfig.firebaseUrl
                    ? syncStatus === 'syncing'
                      ? 'Syncing…'
                      : syncStatus === 'error'
                      ? 'Sync Error'
                      : isAdmin
                      ? 'Team Sync'
                      : 'Live'
                    : 'Offline'}
                </span>
              </button>
            </div>
          </div>

          {/* Right: user pill + three-dot menu */}
          {user && (
            <div className="flex items-center gap-1.5 min-w-0">
              {/* User pill with avatar + role badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/90 shadow-inner min-w-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-white max-w-[70px] sm:max-w-[120px] truncate">
                  {user.username}
                </span>
                {roleBadge}
              </div>

              {/* Three-dot dropdown menu */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer flex-shrink-0"
                  aria-label="More options"
                  onClick={() => setShowMenu(prev => !prev)}
                >
                  <MoreHorizontal size={16} className="text-white/80" />
                </button>
                {showMenu && (
                  <>
                    {/* Backdrop to close menu on outside click */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden">
                      {/* User info header */}
                      <div className="px-3 py-2.5 border-b border-white/10">
                        <p className="text-xs font-semibold text-white">{user.username}</p>
                        <p className="text-[10px] text-white/50 capitalize">{user.role}</p>
                      </div>
                      <ul className="py-1">
                        {isAdmin && (
                          <li>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                              onClick={() => { setShowMenu(false); setShowSyncModal(true); }}
                            >
                              <Users size={13} className="text-amber-300" />
                              Team Sync Settings
                            </button>
                          </li>
                        )}
                        <li>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-red-500/15 flex items-center gap-2 transition-colors"
                            onClick={() => { setShowMenu(false); setShowLogoutConfirm(true); }}
                          >
                            <LogOut size={13} />
                            Log Out
                          </button>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
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
              <p className="text-sm font-semibold text-white leading-tight">
                {notification.message}
              </p>
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
              aria-label="Dismiss notification"
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
          isAdmin={isAdmin}
        />
      )}

      {/* ── Logout Warning Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="glass-card max-w-sm w-full p-6 border border-white/20 shadow-2xl animate-fade-in-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-rose-400 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>

            <h3
              id="logout-confirm-title"
              className="text-lg font-bold text-white font-display"
            >
              Confirm Log Out
            </h3>
            <p className="text-sm text-white/70 mt-2 mb-6 leading-relaxed">
              Are you sure you want to log out of <strong className="text-white">MH CATERING &amp; EVENTS</strong>? You will need your login credentials to access the app again.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 transition-all text-sm font-semibold text-white border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 transition-all text-sm font-semibold text-white shadow-lg shadow-red-600/30 border border-red-400/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
