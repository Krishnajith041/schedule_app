import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Cloud,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Users,
  HelpCircle,
  AlertCircle,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Button3D } from './Button3D';
import {
  testCloudConnection,
  generateTeamInviteLink,
  cleanFirebaseUrl,
} from '../lib/cloudSync';
import type { CloudSyncConfig } from '../types';

interface TeamSyncModalProps {
  config: CloudSyncConfig;
  onSaveConfig: (newConfig: CloudSyncConfig) => void;
  onSyncNow: () => Promise<void>;
  onClose: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'disabled';
  lastSyncedAt?: string;
}

export function TeamSyncModal({
  config,
  onSaveConfig,
  onSyncNow,
  onClose,
  syncStatus,
  lastSyncedAt,
}: TeamSyncModalProps) {
  const [enabled, setEnabled] = useState(config.enabled);
  const [workspaceId, setWorkspaceId] = useState(config.workspaceId || 'main-schedule');
  const [firebaseUrl, setFirebaseUrl] = useState(config.firebaseUrl || '');
  const [showHelp, setShowHelp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestAndSave = async () => {
    if (!enabled) {
      const updatedConfig: CloudSyncConfig = {
        ...config,
        enabled: false,
        workspaceId: workspaceId.trim() || 'main-schedule',
        firebaseUrl: cleanFirebaseUrl(firebaseUrl),
      };
      onSaveConfig(updatedConfig);
      onClose();
      return;
    }

    if (!firebaseUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide your Firebase Realtime Database URL to enable cloud sync.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await testCloudConnection(firebaseUrl, workspaceId.trim() || 'main-schedule');
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      const updatedConfig: CloudSyncConfig = {
        ...config,
        enabled: true,
        workspaceId: workspaceId.trim() || 'main-schedule',
        firebaseUrl: cleanFirebaseUrl(firebaseUrl),
        lastSyncedAt: new Date().toISOString(),
      };
      onSaveConfig(updatedConfig);
      await onSyncNow();
    }
  };

  const handleCopyInviteLink = () => {
    const tempConfig: CloudSyncConfig = {
      ...config,
      enabled: true,
      workspaceId: workspaceId.trim() || 'main-schedule',
      firebaseUrl: cleanFirebaseUrl(firebaseUrl),
    };
    const link = generateTeamInviteLink(tempConfig);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-card w-full max-w-lg p-5 sm:p-6 border border-white/15 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg">Team Cloud Sync</h2>
              <p className="text-xs text-white/50">Multi-user real-time schedule sharing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-3d btn-icon btn-secondary !min-h-[34px] !min-w-[34px] !p-1.5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Status Banner */}
          <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                {enabled && firebaseUrl ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white/30"></span>
                )}
              </span>
              <div>
                <p className="text-xs font-semibold text-white">
                  {enabled && firebaseUrl ? 'Multi-User Cloud Sync Active' : 'Local Only (Single Device)'}
                </p>
                <p className="text-[11px] text-white/50">
                  {lastSyncedAt
                    ? `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()}`
                    : 'Not yet synchronized to cloud'}
                </p>
              </div>
            </div>

            {enabled && firebaseUrl && (
              <button
                type="button"
                onClick={onSyncNow}
                disabled={syncStatus === 'syncing'}
                className="btn-3d btn-secondary !min-h-[32px] !py-1 !px-2.5 !text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={13} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            )}
          </div>

          {/* Test connection alert result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                  : 'bg-red-500/15 border-red-500/30 text-red-200'
              }`}
            >
              {testResult.success ? (
                <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Enable Sync Checkbox */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm font-semibold text-white">Enable Real-Time Cloud Sync</p>
              <p className="text-xs text-white/50">
                Allows staff to view & edit the schedule at the same time
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 accent-violet-500 rounded cursor-pointer"
            />
          </div>

          {enabled && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Workspace ID */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                  Team Workspace ID
                </label>
                <input
                  type="text"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  placeholder="e.g. royal-caterers"
                  className="glass-input text-sm"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Staff members using the same Workspace ID will share events automatically.
                </p>
              </div>

              {/* Firebase Realtime Database URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                    <Cloud size={14} className="text-violet-400" />
                    Firebase Database URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelp(prev => !prev)}
                    className="text-xs text-violet-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle size={13} />
                    <span>{showHelp ? 'Hide instructions' : 'Free Setup Guide'}</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={firebaseUrl}
                  onChange={(e) => setFirebaseUrl(e.target.value)}
                  placeholder="https://your-app-default-rtdb.firebaseio.com"
                  className="glass-input text-sm font-mono text-xs"
                />
              </div>

              {/* Free Setup Guide Accordion */}
              {showHelp && (
                <div className="p-3.5 rounded-xl bg-violet-900/30 border border-violet-400/20 text-xs text-white/80 space-y-2 animate-fade-in">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Radio size={14} className="text-pink-400" />
                    How to get your free database in 1 minute:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-white/70">
                    <li>
                      Go to{' '}
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-300 underline underline-offset-2 inline-flex items-center gap-0.5"
                      >
                        console.firebase.google.com <ExternalLink size={10} />
                      </a>{' '}
                      (Free Google login).
                    </li>
                    <li>Click <strong>Add Project</strong> (name it anything, e.g. "CateringApp").</li>
                    <li>In the left sidebar, click <strong>Build</strong> → <strong>Realtime Database</strong>.</li>
                    <li>Click <strong>Create Database</strong> and select <strong>Start in test mode</strong>.</li>
                    <li>Copy the URL at the top (ending with <code className="text-pink-300">.firebaseio.com</code>) and paste it here!</li>
                  </ol>
                  <p className="text-[11px] text-white/50 pt-1 border-t border-white/10">
                    Once pasted, click <strong>Copy Invite Link</strong> below to send it to other staff!
                  </p>
                </div>
              )}

              {/* Share invite link with other staff */}
              {firebaseUrl && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-900/40 to-fuchsia-900/30 border border-violet-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Share2 size={14} className="text-pink-400" />
                      Staff 1-Click Invite Link
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Send this link to colleagues via WhatsApp or SMS. Opening the link on Android, iPhone, or PC automatically connects them to this workspace!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3 flex-shrink-0">
          <Button3D variant="secondary" onClick={onClose} className="!min-h-[38px] !py-1.5 !px-4 text-xs">
            Cancel
          </Button3D>
          <Button3D
            variant="primary"
            onClick={handleTestAndSave}
            disabled={testing}
            className="!min-h-[38px] !py-1.5 !px-5 text-xs font-semibold"
          >
            {testing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <span>Save & Connect</span>
            )}
          </Button3D>
        </div>
      </div>
    </div>,
    document.body
  );
}

