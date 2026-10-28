import { useReducer, useEffect, useRef, type ReactNode } from 'react';
import { AppContext } from './AppContext';
import { reducer } from './reducer';
import { SEED_CATEGORIES, SEED_FOOD_ITEMS } from './seedData';
import type { AppState } from '../types';

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
  stateRef.current = state;

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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
