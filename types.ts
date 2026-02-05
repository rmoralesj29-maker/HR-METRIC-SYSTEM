export type Gender = 'Male' | 'Female' | 'Other' | string;
export type StatusVR = 'VR0' | 'VR1' | 'VR2' | 'VR3' | 'VR4' | 'VR5' | string;
export type EmploymentStatus = 'active' | 'leaving' | 'left';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  country: string;
  role: string;
  statusVR: StatusVR;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  startDate: string; // ISO date string YYYY-MM-DD
  performanceRating: number; // 1-5
  languages: string[];
  employmentStatus?: EmploymentStatus;
  leaveDate?: string | null; // ISO date string YYYY-MM-DD
  leaveReason?: string | null;
  leaveNotes?: string | null;
  statusChangedAt?: string | null; // ISO date string
  customFields?: Record<string, string | number | null>;

  // Derived / Runtime fields (not necessarily stored)
  age?: number;
  totalExperienceMonths?: number;
}

// Keeping this type alias for compatibility if needed
export interface CalculatedEmployeeStats extends Employee {
  totalDaysWorked: number;
  currentMonthsWorked: number;
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
  showCountryStats: boolean;
  showLanguageStats: boolean;
  // Global Sick Days Stats
  sickDaysByYear: Record<number, MonthlySickData[]>;
  dropdownOptions: {
    countries: string[];
    languages: string[];
  };
  dashboardWidgetOrder?: string[];
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
  showCountryStats: true,
  showLanguageStats: true,
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
  dropdownOptions: {
    countries: [
      'Canada',
      'Costa Rica',
      'Croatia',
      'Czech Republic',
      'France',
      'Germany',
      'Iceland',
      'Ireland',
      'Nigeria',
      'Norway',
      'Palestine',
      'Spain',
      'Swiss',
      'United Kingdom',
      'United States',
      'Venezuela',
    ],
    languages: ['English', 'Spanish', 'French', 'German'],
  },
  dashboardWidgetOrder: [
    'workforce_status',
    'main_stats',
    'movement_chart',
    'sick_days_trend',
    'vr_distribution',
    'tenure_distribution',
    'age_demographics',
    'gender_diversity',
    'language_stats',
    'country_stats',
  ],
};

export const DEFAULT_COLUMNS: ColumnDefinition[] = [
  { id: 'role', label: 'Role', type: 'text', isSystem: true },
  { id: 'country', label: 'Country', type: 'text', isSystem: true },
  { id: 'languages', label: 'Languages', type: 'text', isSystem: true },
];
