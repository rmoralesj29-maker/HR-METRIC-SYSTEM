
export enum VRRate {
  VR0 = 'VR0',
  VR1 = 'VR1',
  VR2 = 'VR2',
  VR3 = 'VR3',
  VR4 = 'VR4',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  NonBinary = 'Non-Binary',
  Other = 'Other',
}

export interface Employee {
  id: string;
  name: string;
  dob: string; // ISO date string YYYY-MM-DD
  startDate: string; // ISO date string YYYY-MM-DD
  previousExperienceMonths: number;
  gender: string; // Changed from Gender enum to string for flexibility
  country: string;
  languages: string[];
  role: string;
  // Dynamic fields
  customData?: Record<string, any>;
}

export interface CalculatedEmployeeStats extends Employee {
  age: number;
  totalDaysWorked: number;
  currentMonthsWorked: number;
  totalMonthsExperience: number;
  vrRate: VRRate;
  inRaiseWindow: boolean;
  monthsUntilNextRate: number | null;
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
  monthlySickDays: MonthlySickData[];
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
  monthlySickDays: [
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
};

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'role', label: 'Role', type: 'text', isSystem: true },
  { id: 'country', label: 'Country', type: 'text', isSystem: true },
  { id: 'languages', label: 'Languages', type: 'text', isSystem: true },
];
