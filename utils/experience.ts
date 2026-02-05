import { Employee, SystemSettings, DEFAULT_SETTINGS } from '../types';

const daysInMonth = 30.437;

const getMonthsBetween = (from: Date, to: Date): number => {
  const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays / daysInMonth);
};

const calculateAge = (dateOfBirth: string, today = new Date()): number => {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export const formatEmployeeName = (employee: Employee): string => `${employee.firstName} ${employee.lastName}`.trim();

export const enrichEmployee = (
  employee: Employee,
  settings: SystemSettings = DEFAULT_SETTINGS,
  today = new Date()
): Employee => {
  // Safe date parsing
  const startDate = new Date(employee.startDate);

  // Tenure: Strictly time since start date.
  const tenureMonths = getMonthsBetween(startDate, today);
  const totalExperienceMonths = Math.max(0, Number(tenureMonths.toFixed(1)));

  // Ensure VR Status is present (defaulting if needed)
  const statusVR = employee.statusVR || 'VR0';
  const employmentStatus = employee.employmentStatus || 'active';

  return {
    ...employee,
    age: calculateAge(employee.dateOfBirth, today),
    totalExperienceMonths,
    statusVR,
    employmentStatus,
  };
};
