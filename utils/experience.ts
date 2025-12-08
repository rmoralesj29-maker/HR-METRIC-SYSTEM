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
  const totalExperienceMonths = Math.max(0, Math.round(tenureMonths + (employee.previousExperienceMonths || 0)));

  const nextMilestone = settings.raiseMilestones.find((milestone) => milestone > totalExperienceMonths) ?? null;
  const monthsToNextRaise = nextMilestone !== null ? Math.max(0, nextMilestone - totalExperienceMonths) : null;

  const monthsNeededFromStart = nextMilestone !== null ? nextMilestone - (employee.previousExperienceMonths || 0) : null;
  const targetDate = monthsNeededFromStart !== null ? new Date(startDate) : null;
  if (targetDate && monthsNeededFromStart !== null) {
    targetDate.setMonth(targetDate.getMonth() + monthsNeededFromStart);
  }
  const diffDaysToTarget = targetDate ? (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) : null;
  const inRaiseWindow = diffDaysToTarget !== null && Math.abs(diffDaysToTarget) <= settings.raiseWindowDays;

  const { vrThresholds } = settings;
  let statusVR: Employee['statusVR'] = 'VR0';
  if (totalExperienceMonths >= vrThresholds.vr4) statusVR = 'VR4';
  else if (totalExperienceMonths >= vrThresholds.vr3) statusVR = 'VR3';
  else if (totalExperienceMonths >= vrThresholds.vr2) statusVR = 'VR2';
  else if (totalExperienceMonths >= vrThresholds.vr1) statusVR = 'VR1';
  else statusVR = 'VR0';

  return {
    ...employee,
    age: calculateAge(employee.dateOfBirth, today),
    totalExperienceMonths,
    monthsToNextRaise,
    inRaiseWindow,
    statusVR,
  };
};
