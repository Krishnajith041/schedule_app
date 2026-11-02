import type { CateringEvent, CloudSyncConfig } from '../types';

const CLOUD_CONFIG_KEY = 'catering_cloud_config_v1';
const BROADCAST_CHANNEL_NAME = 'caterplan_sync_channel';

// Multi-tab broadcast channel for instantaneous zero-latency updates across windows/tabs
const broadcastChannel =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(BROADCAST_CHANNEL_NAME)
    : null;

export function cleanFirebaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // Remove trailing slashes and .json
  cleaned = cleaned.replace(/\.json\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

export function getInitialCloudConfig(): CloudSyncConfig {
  const defaultConfig: CloudSyncConfig = {
    enabled: false,
    workspaceId: 'main-schedule',
    firebaseUrl: '',
    autoSyncIntervalMs: 5000,
  };

  if (typeof window === 'undefined') return defaultConfig;

  // 1. Check if team invite link parameters exist in URL (e.g. ?syncUrl=...&ws=...)
  try {
    let search = window.location.search;
    if (!search && window.location.hash.includes('?')) {
      search = '?' + window.location.hash.split('?')[1];
    }
    const params = new URLSearchParams(search);
    const syncUrlParam = params.get('syncUrl');
    const wsParam = params.get('ws');

    if (syncUrlParam || wsParam) {
      const urlConfig: CloudSyncConfig = {
        enabled: true,
        workspaceId: wsParam ? decodeURIComponent(wsParam) : defaultConfig.workspaceId,
        firebaseUrl: syncUrlParam ? cleanFirebaseUrl(decodeURIComponent(syncUrlParam)) : '',
        autoSyncIntervalMs: 5000,
      };
      saveCloudSyncConfig(urlConfig);
      return urlConfig;
    }
  } catch (err) {
    console.warn('Failed parsing sync params from URL', err);
  }

  // 2. Load from localStorage
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled ?? false,
        workspaceId: parsed.workspaceId || 'main-schedule',
        firebaseUrl: cleanFirebaseUrl(parsed.firebaseUrl || ''),
        autoSyncIntervalMs: parsed.autoSyncIntervalMs || 5000,
        lastSyncedAt: parsed.lastSyncedAt,
        lastSyncedStaff: parsed.lastSyncedStaff,
      };
    }
  } catch (err) {
    console.warn('Failed loading cloud sync config', err);
  }

  return defaultConfig;
}

export function saveCloudSyncConfig(config: CloudSyncConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed saving cloud sync config', err);
  }
}

/**
 * Push a single event to Firebase Realtime Database
 */
export async function pushEventToCloud(
  event: CateringEvent,
  config: CloudSyncConfig,
  currentStaff?: string
): Promise<boolean> {
  // Broadcast to other tabs on same device immediately
  broadcastChannel?.postMessage({
    type: 'EVENT_MUTATED',
    action: 'SAVE',
    event,
    staff: currentStaff || event.updatedBy?.username || event.createdBy?.username || 'Colleague',
  });

  if (!config.enabled || !config.firebaseUrl) return false;

  const url = `${cleanFirebaseUrl(config.firebaseUrl)}/workspaces/${encodeURIComponent(config.workspaceId)}/events/${encodeURIComponent(event.id)}.json`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error pushing event to cloud', err);
    return false;
  }
}

/**
 * Delete an event from Firebase Realtime Database
 */
export async function deleteEventFromCloud(
  eventId: string,
  config: CloudSyncConfig,
  currentStaff?: string
): Promise<boolean> {
  // Broadcast to other tabs on same device immediately
  broadcastChannel?.postMessage({
    type: 'EVENT_MUTATED',
    action: 'DELETE',
    eventId,
    staff: currentStaff || 'Colleague',
  });

  if (!config.enabled || !config.firebaseUrl) return false;

  const url = `${cleanFirebaseUrl(config.firebaseUrl)}/workspaces/${encodeURIComponent(config.workspaceId)}/events/${encodeURIComponent(eventId)}.json`;

  try {
    const res = await fetch(url, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Error deleting event from cloud', err);
    return false;
  }
}

/**
 * Fetch all events for the workspace from cloud
 */
export async function fetchEventsFromCloud(
  config: CloudSyncConfig
): Promise<CateringEvent[] | null> {
  if (!config.enabled || !config.firebaseUrl) return null;

  const url = `${cleanFirebaseUrl(config.firebaseUrl)}/workspaces/${encodeURIComponent(config.workspaceId)}/events.json`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data) return [];

    // Firebase returns object with id keys or an array
    if (Array.isArray(data)) {
      return data.filter(Boolean) as CateringEvent[];
    }

    if (typeof data === 'object') {
      return Object.values(data).filter(Boolean) as CateringEvent[];
    }

    return [];
  } catch (err) {
    console.warn('Error fetching events from cloud', err);
    return null;
  }
}

/**
 * Upload all current local events to initialize or sync the cloud workspace
 */
export async function uploadAllEventsToCloud(
  events: CateringEvent[],
  config: CloudSyncConfig
): Promise<boolean> {
  if (!config.enabled || !config.firebaseUrl) return false;

  const eventsMap: Record<string, CateringEvent> = {};
  for (const e of events) {
    eventsMap[e.id] = e;
  }

  const url = `${cleanFirebaseUrl(config.firebaseUrl)}/workspaces/${encodeURIComponent(config.workspaceId)}/events.json`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventsMap),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error uploading all events to cloud', err);
    return false;
  }
}

/**
 * Test cloud connection by reading from the workspace
 */
export async function testCloudConnection(
  firebaseUrl: string,
  workspaceId: string
): Promise<{ success: boolean; message: string; count?: number }> {
  const cleanedUrl = cleanFirebaseUrl(firebaseUrl);
  if (!cleanedUrl || !cleanedUrl.startsWith('http')) {
    return { success: false, message: 'Please enter a valid Firebase URL starting with https://' };
  }

  const testUrl = `${cleanedUrl}/workspaces/${encodeURIComponent(workspaceId)}/events.json`;

  try {
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Permission denied: Please ensure your Firebase Realtime Database rules allow read/write (Test Mode).',
      };
    }

    if (!res.ok) {
      return { success: false, message: `Server returned HTTP status ${res.status} (${res.statusText})` };
    }

    const data = await res.json();
    let count = 0;
    if (Array.isArray(data)) count = data.filter(Boolean).length;
    else if (typeof data === 'object' && data !== null) count = Object.keys(data).length;

    return {
      success: true,
      message: `Connection successful! Found ${count} event(s) in workspace "${workspaceId}".`,
      count,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Network error: Could not reach Firebase (${message}). Check your internet connection and URL.`,
    };
  }
}

/**
 * Generate a 1-click invite link with sync configuration preloaded
 */
export function generateTeamInviteLink(config: CloudSyncConfig): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const encodedUrl = encodeURIComponent(config.firebaseUrl);
  const encodedWs = encodeURIComponent(config.workspaceId);
  return `${origin}${pathname}#/?syncUrl=${encodedUrl}&ws=${encodedWs}`;
}

/**
 * Subscribe to multi-tab broadcast updates
 */
export function onBroadcastUpdate(
  callback: (data: { type: string; action: 'SAVE' | 'DELETE'; event?: CateringEvent; eventId?: string; staff: string }) => void
): () => void {
  if (!broadcastChannel) return () => {};

  const handler = (e: MessageEvent) => {
    if (e.data && e.data.type === 'EVENT_MUTATED') {
      callback(e.data);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel.removeEventListener('message', handler);
  };
}

