import { useReducer, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppContext } from './AppContext';
import { reducer } from './reducer';
import { SEED_CATEGORIES, SEED_FOOD_ITEMS } from './seedData';
import {
  getInitialCloudConfig,
  saveCloudSyncConfig,
  fetchEventsFromCloud,
  onBroadcastUpdate,
} from '../lib/cloudSync';
import type { AppState, CloudSyncConfig } from '../types';

const STORAGE_KEY = 'catering_scheduler_v1';
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const defaultState: AppState = {
  categories: SEED_CATEGORIES,
  foodItems:  SEED_FOOD_ITEMS,
  events:     [],
};

function loadFromStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      categories: parsed.categories ?? defaultState.categories,
      foodItems:  parsed.foodItems  ?? defaultState.foodItems,
      events:     parsed.events     ?? defaultState.events,
    };
  } catch {
    return defaultState;
  }
}

function purgeOldEvents(state: AppState): AppState {
  const today = new Date();
  const cutoff = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  const filtered = state.events.filter(e => {
    const [y, m, d] = e.date.split('-').map(Number);
    const eventDate = new Date(y, m - 1, d);
    return eventDate >= cutoff;
  });
  if (filtered.length === state.events.length) return state;
  return { ...state, events: filtered };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const loaded = loadFromStorage();
    return purgeOldEvents(loaded);
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cloud sync configuration & state
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => getInitialCloudConfig());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'disabled'>(
    cloudConfig.enabled && cloudConfig.firebaseUrl ? 'idle' : 'disabled'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(cloudConfig.lastSyncedAt);
  const [notification, setNotification] = useState<{
    id: string;
    message: string;
    staff?: string;
    type: 'info' | 'success';
  } | null>(null);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, [state]);

  // Purge old events every 24h while the app is open
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'PURGE_OLD_EVENTS' });
    }, PURGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const updateCloudConfig = (newConfig: CloudSyncConfig) => {
    setCloudConfig(newConfig);
    saveCloudSyncConfig(newConfig);
    setSyncStatus(newConfig.enabled && newConfig.firebaseUrl ? 'idle' : 'disabled');
  };

  const dismissNotification = () => setNotification(null);

  // Sync execution: pulls latest events from cloud and merges them
  const syncNow = async () => {
    if (!cloudConfig.enabled || !cloudConfig.firebaseUrl) return;

    setSyncStatus('syncing');
    try {
      const remoteEvents = await fetchEventsFromCloud(cloudConfig);
      if (remoteEvents !== null) {
        const currentLocal = stateRef.current.events;
        const currentMap = new Map(currentLocal.map(e => [e.id, e]));

        // Check if anything is new, edited or deleted
        let hasChanges = remoteEvents.length !== currentLocal.length;
        let lastChangedEventTitle = '';
        let lastChangedStaff = '';

        if (!hasChanges) {
          for (const rem of remoteEvents) {
            const loc = currentMap.get(rem.id);
            if (!loc) {
              hasChanges = true;
              lastChangedEventTitle = rem.title;
              lastChangedStaff = rem.createdBy?.username || '';
              break;
            }
            if (
              loc.updatedAt !== rem.updatedAt ||
              loc.title !== rem.title ||
              loc.date !== rem.date ||
              loc.venue !== rem.venue
            ) {
              hasChanges = true;
              lastChangedEventTitle = rem.title;
              lastChangedStaff = rem.updatedBy?.username || rem.createdBy?.username || '';
              break;
            }
          }
        }

        if (hasChanges) {
          dispatch({ type: 'MERGE_REMOTE_EVENTS', payload: { events: remoteEvents } });
          if (lastChangedEventTitle) {
            setNotification({
              id: Math.random().toString(),
              message: `Updated: "${lastChangedEventTitle}"`,
              staff: lastChangedStaff,
              type: 'info',
            });
          }
        }

        const now = new Date().toISOString();
        setLastSyncedAt(now);
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.warn('Sync error:', err);
      setSyncStatus('error');
    }
  };

  // Background auto-sync polling loop
  useEffect(() => {
    if (!cloudConfig.enabled || !cloudConfig.firebaseUrl) return;

    // Initial sync
    syncNow();

    // Auto-sync interval (default 5s)
    const interval = setInterval(() => {
      syncNow();
    }, cloudConfig.autoSyncIntervalMs || 5000);

    return () => clearInterval(interval);
  }, [cloudConfig.enabled, cloudConfig.firebaseUrl, cloudConfig.workspaceId]);

  // Multi-tab broadcast channel listener for 0ms cross-tab updates
  useEffect(() => {
    const unsubscribe = onBroadcastUpdate((data) => {
      syncNow();
      if (data.event) {
        setNotification({
          id: Math.random().toString(),
          message: `${data.action === 'SAVE' ? 'Event saved' : 'Event deleted'}: "${data.event.title || 'Event'}"`,
          staff: data.staff,
          type: 'info',
        });
      }
    });
    return unsubscribe;
  }, [cloudConfig.enabled, cloudConfig.firebaseUrl]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        cloudConfig,
        syncStatus,
        lastSyncedAt,
        updateCloudConfig,
        syncNow,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
