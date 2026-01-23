import { Employee, SystemSettings, DEFAULT_SETTINGS } from '../types';

const daysInMonth = 30.437;

const getMonthsBetween = (from: Date, to: Date): number => {
  const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays / daysInMonth);
};

const calculateAge = (dateOfBirth: string, today = new Date()): number => {
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
  const startDate = new Date(employee.startDate);
  const tenureMonths = getMonthsBetween(startDate, today);

  // Tenure is now strictly time since start date. No previous experience added.
  const totalExperienceMonths = Math.max(0, Number(tenureMonths.toFixed(1)));

  // VR Status is no longer calculated/inferred. It uses the stored value.
  // We ensure it defaults to VR0 if missing (though DB default covers this).
  const statusVR = employee.statusVR || 'VR0';

  return {
    ...employee,
    age: calculateAge(employee.dateOfBirth, today),
    totalExperienceMonths,
    statusVR,
  };
};
