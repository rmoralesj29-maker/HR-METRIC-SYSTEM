import { Employee } from '../types';

const DAYS_IN_MONTH = 30.437;

/**
 * Calculate months between two dates
 */
const getMonthsBetween = (from: Date, to: Date): number => {
  const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays / DAYS_IN_MONTH);
};

/**
 * Calculate age from date of birth
 */
const calculateAge = (dateOfBirth: string, today = new Date()): number => {
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

/**
 * Format employee full name
 */
export const formatEmployeeName = (employee: Employee): string => {
  return `${employee.firstName} ${employee.lastName}`.trim();
};

/**
 * Enrich employee with derived fields (age, tenure)
 * These are calculated at runtime, not stored
 * VR Rate is stored explicitly and NOT derived from tenure
 */
export const enrichEmployee = (
  employee: Employee,
  asOfDate = new Date()
): Employee => {
  const startDate = new Date(employee.startDate);
  const tenureMonths = Number(getMonthsBetween(startDate, asOfDate).toFixed(1));

  return {
    ...employee,
    age: calculateAge(employee.dateOfBirth, asOfDate),
    tenureMonths: Math.max(0, tenureMonths),
  };
};
