// Gender type - strict enum
export type Gender = 'Male' | 'Female' | 'Other' | 'Unspecified';

// VR Rate type - strict enum
export type VRRate = 'VR0' | 'VR1' | 'VR2' | 'VR3' | 'VR4' | 'VR5';

// Employee status
export type EmployeeStatus = 'Active' | 'Inactive';

/**
 * Core Employee interface - Single Source of Truth
 * All calculations (age, tenure) are derived, not stored
 */
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  gender: Gender;
  country: string;
  role: string;
  startDate: string; // ISO date string YYYY-MM-DD - company start date ONLY
  vrRate: VRRate; // Stored explicitly, drives VR charts
  languages: string[]; // Normalized array
  performanceRating?: number; // Optional 1-5 scale
  status?: EmployeeStatus;
  customFields?: Record<string, string | number | null>;

  // Derived fields (calculated at runtime, not stored)
  age?: number;
  tenureMonths?: number;
}

/**
 * Chart data interface for Recharts
 */
export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

/**
 * Column types for custom fields
 */
export type ColumnType = 'text' | 'number' | 'date' | 'select';

/**
 * Column definition for employee custom fields
 */
export interface ColumnDefinition {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[]; // For select type
  isSystem?: boolean; // System columns cannot be deleted
}

/**
 * Monthly sick data - company-wide, not per employee
 */
export interface MonthlySickData {
  month: string;
  value: number;
}

/**
 * System settings interface
 */
export interface SystemSettings {
  adultAgeThreshold: number; // Default 22
  showCountryStats: boolean;
  showLanguageStats: boolean;
  // Global sick days - company-wide, by year and month
  sickDaysByYear: Record<number, MonthlySickData[]>;
}

/**
 * Default monthly sick days template
 */
const createDefaultMonthlySickDays = (): MonthlySickData[] => [
  { month: 'Jan', value: 0 },
  { month: 'Feb', value: 0 },
  { month: 'Mar', value: 0 },
  { month: 'Apr', value: 0 },
  { month: 'May', value: 0 },
  { month: 'Jun', value: 0 },
  { month: 'Jul', value: 0 },
  { month: 'Aug', value: 0 },
  { month: 'Sep', value: 0 },
  { month: 'Oct', value: 0 },
  { month: 'Nov', value: 0 },
  { month: 'Dec', value: 0 },
];

/**
 * Default system settings
 */
export const DEFAULT_SETTINGS: SystemSettings = {
  adultAgeThreshold: 22,
  showCountryStats: true,
  showLanguageStats: true,
  sickDaysByYear: {
    2025: createDefaultMonthlySickDays(),
    2026: createDefaultMonthlySickDays(),
    2027: createDefaultMonthlySickDays(),
  },
};

/**
 * Default column definitions
 */
export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'role', label: 'Role', type: 'text', isSystem: true },
  { id: 'country', label: 'Country', type: 'text', isSystem: true },
  { id: 'languages', label: 'Languages', type: 'text', isSystem: true },
];

/**
 * Helper to create default monthly sick days for a new year
 */
export const getDefaultMonthlySickDays = createDefaultMonthlySickDays;
