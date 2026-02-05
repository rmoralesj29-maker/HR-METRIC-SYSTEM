import { z } from 'zod';
import { Employee, Vacation, SystemSettings, DEFAULT_SETTINGS } from '../types';

const KEYS = {
  EMPLOYEES: 'hr_employees',
  VACATIONS: 'hr_vacations',
  SETTINGS: 'hr_settings',
  GLOBAL_STATE: 'hr_global_state',
};

// Zod Schemas
const EmployeeSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string().optional(),
  country: z.string().optional(),
  role: z.string().optional(),
  statusVR: z.string().optional(),
  dateOfBirth: z.string().optional(),
  startDate: z.string().optional(),
  performanceRating: z.number().optional(),
  languages: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  age: z.number().optional(),
  totalExperienceMonths: z.number().optional(),
});

const VacationSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  days: z.number(),
  type: z.enum(['Vacation', 'Sick', 'Personal', 'Other']).or(z.string()),
  status: z.enum(['Pending', 'Approved', 'Rejected']).or(z.string()),
  notes: z.string().optional(),
});

const MonthlySickDataSchema = z.object({
  month: z.string(),
  value: z.number(),
});

const SettingsSchema = z.object({
  adultAgeThreshold: z.number(),
  showCountryStats: z.boolean(),
  showLanguageStats: z.boolean(),
  sickDaysByYear: z.record(z.array(MonthlySickDataSchema)),
  dropdownOptions: z.object({
    countries: z.array(z.string()),
    languages: z.array(z.string()),
  }).optional(),
  dashboardWidgetOrder: z.array(z.string()).optional(),
});

const GlobalStateSchema = z.object({
  asOfDate: z.string(),
});

interface GlobalState {
  asOfDate: string;
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

const get = <T>(key: string, fallback: T, schema?: z.ZodType<any>): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;

    const parsed = JSON.parse(item);

    if (schema) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        console.warn(`Data validation failed for ${key}. Using raw data or fallback if critical. Error:`, result.error);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
        if (!Array.isArray(fallback) && Array.isArray(parsed)) return fallback;
        return parsed as T;
      }
      return result.data as T;
    }

    return parsed as T;
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

export const storage = {
  KEYS,
  subscribe,

  getEmployees: (): Employee[] => get<Employee[]>(KEYS.EMPLOYEES, [], z.array(EmployeeSchema)),
  setEmployees: (data: Employee[]) => set(KEYS.EMPLOYEES, data),

  getVacations: (): Vacation[] => get<Vacation[]>(KEYS.VACATIONS, [], z.array(VacationSchema)),
  setVacations: (data: Vacation[]) => set(KEYS.VACATIONS, data),

  getSettings: (): SystemSettings => get<SystemSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS, SettingsSchema),
  setSettings: (data: SystemSettings) => set(KEYS.SETTINGS, data),

  getGlobalState: (): GlobalState => get<GlobalState>(KEYS.GLOBAL_STATE, DEFAULT_GLOBAL_STATE, GlobalStateSchema),
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

      // Use schemas to validate imported data
      if (data.employees) {
        const res = z.array(EmployeeSchema).safeParse(data.employees);
        if (res.success) set(KEYS.EMPLOYEES, res.data);
      }
      if (data.vacations) {
        const res = z.array(VacationSchema).safeParse(data.vacations);
        if (res.success) set(KEYS.VACATIONS, res.data);
      }
      if (data.settings) {
        const res = SettingsSchema.safeParse(data.settings);
        if (res.success) set(KEYS.SETTINGS, res.data);
      }
      if (data.globalState) {
         const res = GlobalStateSchema.safeParse(data.globalState);
         if (res.success) set(KEYS.GLOBAL_STATE, res.data);
      }

      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
};
