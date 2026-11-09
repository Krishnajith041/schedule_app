import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Trash2,
  Users,
  Eye,
  CalendarPlus,
  Lock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Cloud,
  CloudOff,
  Copy,
  Check,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { useAuth, type UserRole } from '../state/AuthContext';
import { useAppContext } from '../state/AppContext';
import { GlassCard } from '../components/GlassCard';
import { Button3D } from '../components/Button3D';
import {
  cleanFirebaseUrl,
  testCloudConnection,
  generateTeamInviteLink,
} from '../lib/cloudSync';

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badgeClass: string; icon: typeof Shield; description: string }
> = {
  admin: {
    label: 'Admin',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    icon: ShieldCheck,
    description: 'Full access: Events, Food Menu, Users & Team Sync',
  },
  staff: {
    label: 'Staff',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
    icon: CalendarPlus,
    description: 'Can add new events and view schedule/menu',
  },
  viewer: {
    label: 'Viewer',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
    icon: Eye,
    description: 'Read-only: Can view schedule and menu',
  },
};

export function AdminPage() {
  const { user, allUsers, refreshUsers, addUser, updateUserRole, deleteUser } = useAuth();
  const { cloudConfig, updateCloudConfig, syncNow, lastSyncedAt } = useAppContext();

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(
    new Date().toLocaleTimeString()
  );

  // Cloud config edit state inside AdminPage
  const [firebaseUrlInput, setFirebaseUrlInput] = useState(cloudConfig.firebaseUrl || '');
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Auto-poll registered users every 3 seconds while AdminPage is visible
  useEffect(() => {
    refreshUsers();
    const timer = setInterval(() => {
      refreshUsers();
      setLastRefreshedTime(new Date().toLocaleTimeString());
    }, 3000);
    return () => clearInterval(timer);
  }, [refreshUsers]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshUsers();
    if (cloudConfig.enabled && cloudConfig.firebaseUrl) {
      await syncNow();
    }
    setLastRefreshedTime(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="page-content px-4 pt-10 text-center">
        <GlassCard className="p-8 max-w-md mx-auto text-center border-red-500/20">
          <ShieldAlert size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-white/60 mb-4">
            Only administrators have permission to view and manage staff accounts.
          </p>
        </GlassCard>
      </div>
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const res = addUser({
      username: newUsername,
      password: newPassword,
      phoneNumber: newPhone,
      role: newRole,
    });

    if (res.success) {
      setFormSuccess(`User "${newUsername}" successfully registered as ${ROLE_CONFIG[newRole].label}!`);
      setNewUsername('');
      setNewPassword('');
      setNewPhone('');
      setNewRole('staff');
      refreshUsers();
    } else {
      setFormError(res.error || 'Failed to register user.');
    }
  };

  const handleDelete = (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? They will no longer be able to log in.`)) {
      const res = deleteUser(username);
      if (!res.success && res.error) {
        alert(res.error);
      } else {
        refreshUsers();
      }
    }
  };

  const handleSaveCloudUrl = async () => {
    setCloudMessage(null);
    const cleaned = cleanFirebaseUrl(firebaseUrlInput);
    if (!cleaned) {
      setCloudMessage({ type: 'error', text: 'Please enter a valid Firebase URL' });
      return;
    }
    setIsSavingCloud(true);
    const test = await testCloudConnection(cleaned, cloudConfig.workspaceId || 'main-schedule');
    setIsSavingCloud(false);

    if (test.success) {
      const updated = {
        ...cloudConfig,
        enabled: true,
        firebaseUrl: cleaned,
      };
      updateCloudConfig(updated);
      setCloudMessage({ type: 'success', text: 'Connected successfully! Cloud sync is now live for all users.' });
      await syncNow();
      refreshUsers();
    } else {
      setCloudMessage({ type: 'error', text: test.message });
    }
  };

  const handleCopyInviteLink = () => {
    const link = generateTeamInviteLink(cloudConfig);
    if (navigator.clipboard && link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const staffCount = allUsers.filter(u => u.role === 'staff').length;
  const viewerCount = allUsers.filter(u => u.role === 'viewer').length;

  const isLive = cloudConfig.enabled && !!cloudConfig.firebaseUrl;

  return (
    <div className="page-content px-4 pt-6 pb-24 max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Shield size={18} />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Staff & Permissions</h1>
          </div>
          <p className="text-sm text-white/50 mt-1">
            Manage who can access the MH CATERING &amp; EVENTS portal and their permission levels
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="btn-3d btn-secondary text-xs flex items-center gap-1.5 px-3 py-2 cursor-pointer flex-shrink-0"
          title="Refresh user list from cloud"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Team Cloud Sync Card ── */}
      <GlassCard className="p-4 border-violet-500/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isLive ? (
              <Cloud size={18} className="text-emerald-400 animate-pulse" />
            ) : (
              <CloudOff size={18} className="text-red-400" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-white text-sm">
                  Team Cloud Sync Backend
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-red-500/20 text-red-300 border-red-400/40'
                  }`}
                >
                  {isLive ? 'Live & Connected' : 'Offline / Not Connected'}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {isLive
                  ? `Synced with Firebase · ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Active'}`
                  : 'Enter your Firebase Realtime Database URL below to activate live sync across all devices.'}
              </p>
            </div>
          </div>

          {isLive && (
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="btn-3d btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 cursor-pointer flex-shrink-0"
            >
              {copiedLink ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Staff Invite Link'}</span>
            </button>
          )}
        </div>

        {copiedLink && (
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 animate-fade-in flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
            <span>
              Copied! Send this link to staff on mobile or laptop. Opening it will instantly switch their app from
              &apos;Offline&apos; to &apos;Live&apos;!
            </span>
          </div>
        )}

        {/* Firebase URL Input */}
        <div className="pt-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-white/60 block mb-1">
            Firebase Realtime Database URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={firebaseUrlInput}
              onChange={(e) => setFirebaseUrlInput(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              className="glass-input text-xs flex-1"
            />
            <Button3D
              variant="primary"
              onClick={handleSaveCloudUrl}
              disabled={isSavingCloud}
              className="text-xs px-3 py-1.5 flex-shrink-0"
            >
              {isSavingCloud ? 'Testing...' : 'Save & Connect'}
            </Button3D>
          </div>
          {cloudMessage && (
            <p
              className={`text-xs mt-1.5 flex items-center gap-1 ${
                cloudMessage.type === 'success' ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {cloudMessage.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              <span>{cloudMessage.text}</span>
            </p>
          )}

          {/* Help guide toggle if not connected */}
          {!isLive && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHelp(prev => !prev)}
                className="text-xs text-violet-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <HelpCircle size={13} />
                <span>{showHelp ? 'Hide setup instructions' : 'Free 1-Minute Setup Guide (No credit card required)'}</span>
              </button>
              {showHelp && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-violet-950/60 border border-violet-400/20 text-xs text-white/80 space-y-2 animate-fade-in">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Radio size={14} className="text-pink-400" />
                    How to get your free database in 60 seconds:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-white/70">
                    <li>
                      Open{' '}
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-300 underline underline-offset-2"
                      >
                        console.firebase.google.com
                      </a>{' '}
                      (Sign in with your Google account).
                    </li>
                    <li>Click <strong>Add Project</strong> (name it anything, e.g. &quot;CateringApp&quot;).</li>
                    <li>In the left sidebar, click <strong>Build</strong> → <strong>Realtime Database</strong>.</li>
                    <li>Click <strong>Create Database</strong> and choose <strong>Start in test mode</strong>.</li>
                    <li>Copy the database URL (ending with <code className="text-pink-300">.firebaseio.com</code>) and paste it in the box above!</li>
                  </ol>
                  <p className="text-[11px] text-white/50 pt-1.5 border-t border-white/10">
                    Once connected, all events and staff registrations on Android, iPhone, and PC will automatically stay in sync!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-3 text-center border-amber-500/20">
          <p className="text-[11px] font-semibold text-amber-300/80 uppercase tracking-wider">Admins</p>
          <p className="text-2xl font-bold text-white mt-0.5">{adminCount}</p>
        </GlassCard>
        <GlassCard className="p-3 text-center border-violet-500/20">
          <p className="text-[11px] font-semibold text-violet-300/80 uppercase tracking-wider">Staff</p>
          <p className="text-2xl font-bold text-white mt-0.5">{staffCount}</p>
        </GlassCard>
        <GlassCard className="p-3 text-center border-slate-500/20">
          <p className="text-[11px] font-semibold text-slate-300/80 uppercase tracking-wider">Viewers</p>
          <p className="text-2xl font-bold text-white mt-0.5">{viewerCount}</p>
        </GlassCard>
      </div>

      {/* Permissions Breakdown Banner */}
      <GlassCard className="p-4 border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <Sparkles size={14} className="text-violet-400" />
          <span>Role Permissions Matrix</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-white/70">
          <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-2.5">
            <span className="font-bold text-amber-300 block mb-1">Admin</span>
            <span>Full system control: Events CRUD, Food items CRUD, Cloud sync, and User management.</span>
          </div>
          <div className="bg-violet-500/10 border border-violet-400/20 rounded-lg p-2.5">
            <span className="font-bold text-violet-300 block mb-1">Staff</span>
            <span>Operational staff: Can add events and view the live schedule & menu. Cannot modify menu.</span>
          </div>
          <div className="bg-slate-500/10 border border-slate-400/20 rounded-lg p-2.5">
            <span className="font-bold text-slate-300 block mb-1">Viewer</span>
            <span>Read-only: Can observe the live schedule, timings, and food menu. Cannot add or edit.</span>
          </div>
        </div>
      </GlassCard>

      {/* Users List with Real-time indicator */}
      <GlassCard className="overflow-hidden border-white/15">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-violet-400" />
            <h2 className="font-display font-semibold text-white text-base">
              Registered Accounts ({allUsers.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {isLive ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Cloud Synced · {lastRefreshedTime}
              </span>
            ) : (
              <span className="text-amber-300/80 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Local Only (Connect above to sync with mobile)
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {allUsers.map((u) => {
            const isRootAdmin = u.username.toLowerCase() === 'krishnajith';
            const roleInfo = ROLE_CONFIG[u.role] || ROLE_CONFIG.viewer;
            const RoleIcon = roleInfo.icon;

            return (
              <div
                key={u.username}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/40 via-fuchsia-600/30 to-pink-600/30 border border-white/15 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm truncate">
                        {u.username}
                      </span>
                      {isRootAdmin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          Primary Owner
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${roleInfo.badgeClass}`}
                      >
                        <RoleIcon size={10} />
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone size={11} className="text-white/40" />
                        {u.phoneNumber}
                      </span>
                      {u.lastLoginAt ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400/70">
                          <Clock size={11} />
                          Active {new Date(u.lastLoginAt).toLocaleDateString()} {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/30">Never logged in</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Role selector + delete */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {isRootAdmin ? (
                    <span className="text-xs text-amber-400/70 italic px-2 py-1">Permanent Admin</span>
                  ) : (
                    <>
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.username, e.target.value as UserRole)}
                        aria-label={`Change role for ${u.username}`}
                        className="glass-input text-xs py-1.5 px-2.5 rounded-lg bg-black/40 border border-white/15 text-white cursor-pointer hover:border-violet-400 transition-colors"
                      >
                        <option value="admin" className="bg-slate-900 text-white">Admin (Full)</option>
                        <option value="staff" className="bg-slate-900 text-white">Staff (Add Events)</option>
                        <option value="viewer" className="bg-slate-900 text-white">Viewer (Read-Only)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDelete(u.username)}
                        title={`Delete ${u.username}`}
                        aria-label={`Delete ${u.username}`}
                        className="btn-3d btn-icon btn-danger cursor-pointer"
                        style={{ minWidth: 32, minHeight: 32, padding: '6px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Add New User Section */}
      <GlassCard className="p-5 border-white/15 animate-fade-in-up">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300">
            <UserPlus size={15} />
          </div>
          <h2 className="font-display font-semibold text-white text-base">Register New Staff</h2>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-red-200 text-xs">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-emerald-200 text-xs">
            <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} autoComplete="off" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1.5 flex items-center gap-1.5">
                <User size={13} />
                User Name
              </label>
              <input
                type="text"
                name="admin_user_input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="user name"
                required
                className="glass-input text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1.5 flex items-center gap-1.5">
                <Lock size={13} />
                Password
              </label>
              <input
                type="password"
                name="admin_pass_input"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="password"
                required
                className="glass-input text-sm"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1.5 flex items-center gap-1.5">
                <Phone size={13} />
                Phone Number
              </label>
              <input
                type="tel"
                name="admin_phone_input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="phone number"
                required
                className="glass-input text-sm"
              />
            </div>

            {/* Permission Role */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1.5 flex items-center gap-1.5">
                <Shield size={13} />
                Role & Permission
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="glass-input text-sm cursor-pointer"
              >
                <option value="staff" className="bg-slate-900 text-white">Staff (Can add events)</option>
                <option value="viewer" className="bg-slate-900 text-white">Viewer (Read-only)</option>
                <option value="admin" className="bg-slate-900 text-white">Admin (Full access)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button3D
              variant="primary"
              type="submit"
              className="w-full justify-center text-sm font-semibold py-2.5 gap-2"
            >
              <UserPlus size={16} />
              <span>Register User</span>
            </Button3D>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
