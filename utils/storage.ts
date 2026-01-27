import { Employee, Vacation, SystemSettings, DEFAULT_SETTINGS } from '../types';

const KEYS = {
  EMPLOYEES: 'hr_employees',
  VACATIONS: 'hr_vacations',
  SETTINGS: 'hr_settings',
  GLOBAL_STATE: 'hr_global_state',
};

interface GlobalState {
  asOfDate: string; // ISO string
}

const DEFAULT_GLOBAL_STATE: GlobalState = {
  asOfDate: new Date().toISOString(),
};

type Listener<T> = (newValue: T) => void;
const listeners: Record<string, Listener<any>[]> = {};

const subscribe = <T>(key: string, callback: Listener<T>) => {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
};

const notify = <T>(key: string, value: T) => {
  if (listeners[key]) {
    listeners[key].forEach(cb => cb(value));
  }
};

// Generic Storage Helper
const get = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
};

const set = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify(key, value);
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
};

// Typed Accessors
export const storage = {
  KEYS, // Export keys for subscription
  subscribe, // Export subscribe

  getEmployees: (): Employee[] => get<Employee[]>(KEYS.EMPLOYEES, []),
  setEmployees: (data: Employee[]) => set(KEYS.EMPLOYEES, data),

  getVacations: (): Vacation[] => get<Vacation[]>(KEYS.VACATIONS, []),
  setVacations: (data: Vacation[]) => set(KEYS.VACATIONS, data),

  getSettings: (): SystemSettings => get<SystemSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  setSettings: (data: SystemSettings) => set(KEYS.SETTINGS, data),

  getGlobalState: (): GlobalState => get<GlobalState>(KEYS.GLOBAL_STATE, DEFAULT_GLOBAL_STATE),
  setGlobalState: (data: GlobalState) => set(KEYS.GLOBAL_STATE, data),

  // Export/Import
  exportAllData: () => {
    return JSON.stringify({
      version: 1,
      timestamp: new Date().toISOString(),
      employees: get<Employee[]>(KEYS.EMPLOYEES, []),
      vacations: get<Vacation[]>(KEYS.VACATIONS, []),
      settings: get<SystemSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
      globalState: get<GlobalState>(KEYS.GLOBAL_STATE, DEFAULT_GLOBAL_STATE),
    }, null, 2);
  },

  importAllData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.version) throw new Error('Invalid backup format');

      // Basic validation could go here
      if (Array.isArray(data.employees)) set(KEYS.EMPLOYEES, data.employees);
      if (Array.isArray(data.vacations)) set(KEYS.VACATIONS, data.vacations);
      if (data.settings) set(KEYS.SETTINGS, data.settings);
      if (data.globalState) set(KEYS.GLOBAL_STATE, data.globalState);

      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
};
