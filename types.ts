export type Gender = 'Male' | 'Female' | 'Other' | string;
export type StatusVR = 'VR0' | 'VR1' | 'VR2' | 'VR3' | 'VR4' | 'VR5' | string;

// Enum for backward compatibility if needed, though HEAD uses string
export enum VRRate {
  VR0 = 'VR0',
  VR1 = 'VR1',
  VR2 = 'VR2',
  VR3 = 'VR3',
  VR4 = 'VR4',
  VR5 = 'VR5',
}

export interface Employee {
  id: string;
  // HEAD fields
  firstName: string;
  lastName: string;
  gender: Gender;
  country: string;
  role: string;
  statusVR: StatusVR;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  startDate: string; // ISO date string YYYY-MM-DD
  // previousExperienceMonths removed
  totalExperienceMonths: number;
  monthsToNextRaise: number | null;
  // sickDaysYTD removed
  performanceRating: number; // 1-5
  languages: string[];
  customFields?: Record<string, string | number | null>;
  inRaiseWindow?: boolean;
  age?: number;

  // Fields from other branch for compatibility
  // name: string; // Use firstName + lastName
  // dob: string; // Use dateOfBirth
  // vrRate: VRRate; // Use statusVR
  // customData: any; // Use customFields
}

// Keeping this type alias for compatibility with other branch's components if they use it explicitly
export interface CalculatedEmployeeStats extends Employee {
  totalDaysWorked: number;
  currentMonthsWorked: number;
  nextMilestone: number | null;
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select';

export interface ColumnDefinition {
  id: string;
  label: string;
  type: ColumnType;
  options?: string[]; // For select type
  isSystem?: boolean; // System columns cannot be deleted
}

export interface MonthlySickData {
  month: string;
  value: number;
}

export interface SystemSettings {
  adultAgeThreshold: number; // Default 22
  raiseMilestones: number[]; // Default [6, 12, 36, 60]
  vrThresholds: {
    vr0: number; // 0
    vr1: number; // 7
    vr2: number; // 13
    vr3: number; // 37
    vr4: number; // 61
  };
  raiseWindowDays: number; // Default 15 (approx 0.5 months)
  showCountryStats: boolean;
  showLanguageStats: boolean;
  // New Global Stats
  /** @deprecated use sickDaysByYear instead */
  monthlySickDays: MonthlySickData[];
  sickDaysByYear: Record<number, MonthlySickData[]>;
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  days: number;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  adultAgeThreshold: 22,
  raiseMilestones: [6, 12, 36, 60],
  vrThresholds: {
    vr0: 0,
    vr1: 7,
    vr2: 13,
    vr3: 37,
    vr4: 61,
  },
  raiseWindowDays: 15,
  showCountryStats: true,
  showLanguageStats: true,
  monthlySickDays: [],
  sickDaysByYear: {
    2025: [
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
    ]
  },
};

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'role', label: 'Role', type: 'text', isSystem: true },
  { id: 'country', label: 'Country', type: 'text', isSystem: true },
  { id: 'languages', label: 'Languages', type: 'text', isSystem: true },
];
