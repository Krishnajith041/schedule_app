// ─── Data Models ────────────────────────────────────────────────────────────

export interface FoodCategory {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
}

export interface FoodItem {
  id: string;
  name: string;
  categoryId: string;
  pricePerUnit: number;    // ₹ total price for defaultQuantity units
  defaultQuantity: number; // if > 1, price is a bundle price for this many units
  createdAt: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0=Sun…6=Sat (weekly only)
  endDate?: string;      // YYYY-MM-DD
  occurrences?: number;  // alternative end condition
}

export interface EventFoodItem {
  foodItemId: string;
  quantity: number;
}

export interface CateringEvent {
  id: string;
  title: string;
  clientName: string;
  date: string;       // YYYY-MM-DD (base/first date)
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  venue: string;
  guestCount: number;
  notes: string;
  items: EventFoodItem[];
  recurrence?: RecurrenceRule;
  createdAt: string;
  createdBy?: {
    username: string;
    phoneNumber?: string;
  };
  updatedBy?: {
    username: string;
    phoneNumber?: string;
  };
  updatedAt?: string;
}

// ─── Cloud Sync Configuration ──────────────────────────────────────────────

export interface CloudSyncConfig {
  enabled: boolean;
  workspaceId: string;
  firebaseUrl: string;
  autoSyncIntervalMs: number;
  lastSyncedAt?: string;
  lastSyncedStaff?: string;
}

// ─── App State ──────────────────────────────────────────────────────────────

export interface AppState {
  categories: FoodCategory[];
  foodItems: FoodItem[];
  events: CateringEvent[];
}

// ─── Action Types ────────────────────────────────────────────────────────────

export type AppAction =
  // Categories
  | { type: 'ADD_CATEGORY';    payload: FoodCategory }
  | { type: 'UPDATE_CATEGORY'; payload: FoodCategory }
  | { type: 'DELETE_CATEGORY'; payload: { id: string } }
  // Food Items
  | { type: 'ADD_FOOD_ITEM';    payload: FoodItem }
  | { type: 'UPDATE_FOOD_ITEM'; payload: FoodItem }
  | { type: 'DELETE_FOOD_ITEM'; payload: { id: string } }
  // Events
  | { type: 'ADD_EVENT';              payload: CateringEvent }
  | { type: 'UPDATE_EVENT';           payload: CateringEvent }
  | { type: 'DELETE_EVENT';           payload: { id: string } }
  | { type: 'DELETE_EVENT_SERIES';    payload: { id: string } }
  | { type: 'UPDATE_EVENT_SERIES';    payload: CateringEvent }
  // Cloud & Multi-User Sync
  | { type: 'MERGE_REMOTE_EVENTS'; payload: { events: CateringEvent[]; sourceStaff?: string } }
  // Maintenance
  | { type: 'PURGE_OLD_EVENTS' }
  | { type: 'LOAD_STATE'; payload: AppState };

// ─── Context shape ──────────────────────────────────────────────────────────

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Cloud multi-user sync
  cloudConfig: CloudSyncConfig;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'disabled';
  lastSyncedAt?: string;
  updateCloudConfig: (cfg: CloudSyncConfig) => void;
  syncNow: () => Promise<void>;
  notification: { id: string; message: string; staff?: string; type: 'info' | 'success' } | null;
  dismissNotification: () => void;
}
