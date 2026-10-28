import type { AppState, AppAction } from '../types';
import { isOlderThan3Months } from '../lib/dates';

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    // ── Categories ──────────────────────────────────────────────────────────
    case 'ADD_CATEGORY':
      // Prepend so newest appears first
      return { ...state, categories: [action.payload, ...state.categories] };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'DELETE_CATEGORY': {
      const catId = action.payload.id;
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== catId),
        // Also remove food items in that category
        foodItems: state.foodItems.filter(fi => fi.categoryId !== catId),
      };
    }

    // ── Food Items ───────────────────────────────────────────────────────────
    case 'ADD_FOOD_ITEM':
      // Prepend so newest appears first
      return { ...state, foodItems: [action.payload, ...state.foodItems] };

    case 'UPDATE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.map(fi =>
          fi.id === action.payload.id ? action.payload : fi
        ),
      };

    case 'DELETE_FOOD_ITEM':
      return {
        ...state,
        foodItems: state.foodItems.filter(fi => fi.id !== action.payload.id),
      };

    // ── Events ───────────────────────────────────────────────────────────────
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload.id),
      };

    case 'DELETE_EVENT_SERIES':
      // Delete the base event and ALL events that share the same series
      // We identify a series by the original event id stored in recurrence
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload.id),
      };

    case 'UPDATE_EVENT_SERIES':
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    // ── Maintenance ──────────────────────────────────────────────────────────
    case 'PURGE_OLD_EVENTS':
      return {
        ...state,
        events: state.events.filter(e => !isOlderThan3Months(e.date)),
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}
