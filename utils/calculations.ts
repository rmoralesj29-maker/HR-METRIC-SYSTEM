
import { Employee, CalculatedEmployeeStats, VRRate, SystemSettings, DEFAULT_SETTINGS } from '../types';

export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const calculateDaysWorked = (startDate: string): number => {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

export const calculateCurrentMonths = (startDate: string): number => {
  const start = new Date(startDate);
  const today = new Date();
  // PDF Formula approximation: (TODAY - StartDate) / 30, rounded to 1 decimal
  const diffTime = today.getTime() - start.getTime();
  const days = diffTime / (1000 * 60 * 60 * 24);
  return Math.round((days / 30) * 10) / 10;
};

export const calculateVRRate = (age: number, totalMonths: number, settings: SystemSettings): VRRate => {
  const { adultAgeThreshold, vrThresholds } = settings;

  // Age check
  if (age < adultAgeThreshold) {
    if (totalMonths < vrThresholds.vr1) return VRRate.VR0;
    if (totalMonths < vrThresholds.vr2) return VRRate.VR1;
    if (totalMonths < vrThresholds.vr3) return VRRate.VR2;
    if (totalMonths < vrThresholds.vr4) return VRRate.VR3;
    return VRRate.VR4;
  } else {
    // Adult Age Logic (Floor at VR1)
    if (totalMonths < vrThresholds.vr1) return VRRate.VR1; 
    if (totalMonths < vrThresholds.vr2) return VRRate.VR1;
    if (totalMonths < vrThresholds.vr3) return VRRate.VR2;
    if (totalMonths < vrThresholds.vr4) return VRRate.VR3;
    return VRRate.VR4;
  }
};

export const checkRaiseWindow = (age: number, totalMonths: number, settings: SystemSettings): boolean => {
  const { adultAgeThreshold, raiseMilestones } = settings;
  // Window is roughly +/- 0.5 months (15 days) around the milestone trigger
  // The PDF logic specifically checked for ranges like 6.5-7.0 (which is 0.5 month before effective date)
  // We'll generalize: if current month is within 0.5 of a milestone (before it passes)
  
  // Note: PDF logic was specific:
  // 6.5-7.0 (for <22), 12.5-13.0, 36.5-37.0, 60.5-61.0
  // Effective raises at 7, 13, 37, 61.
  
  // Dynamic Check:
  // Iterate through effective raise months (Milestone + 1).
  // Alert if Total Months is between (Effective - 0.5) and Effective.
  
  // We need to map the "Experience Milestones" (6, 12, 36, 60) to "Effective Raise Months" (7, 13, 37, 61).
  // Logic: Raise applies the month AFTER the milestone.
  
  const relevantMilestones = age >= adultAgeThreshold 
    ? raiseMilestones.filter(m => m >= 12) // Skip first milestone for adults if logic dictates, though PDF just skipped 6-month for adults.
    : raiseMilestones;

  // Note: PDF says for age >= 22 skip 6-month window.
  // We assume raiseMilestones[0] is the 6 month one.
  const milestonesToCheck = (age >= adultAgeThreshold && raiseMilestones.includes(6))
    ? raiseMilestones.filter(m => m !== 6)
    : raiseMilestones;

  for (const milestone of milestonesToCheck) {
      const effectiveMonth = milestone + 1;
      const windowStart = effectiveMonth - 0.5;
      const windowEnd = effectiveMonth;
      
      if (totalMonths >= windowStart && totalMonths <= windowEnd) {
          return true;
      }
  }
  return false;
};

export const calculateNextRateMonths = (age: number, totalMonths: number, settings: SystemSettings): { months: number | null, milestone: number | null } => {
  const { adultAgeThreshold, raiseMilestones } = settings;
  
  let milestones = [...raiseMilestones];
  
  if (age >= adultAgeThreshold) {
      // PDF Logic: Adults usually skip the very first <1yr bump if it was just for probationary period, but sticking to PDF logic:
      // "For age >= 22 -> skip 6-month window".
      milestones = milestones.filter(m => m !== 6);
  }

  for (const m of milestones) {
      if (totalMonths < m) {
          const diff = Math.round((m - totalMonths) * 10) / 10;
          return { months: diff, milestone: m };
      }
  }

  return { months: null, milestone: null };
};

export const processEmployee = (emp: Employee, settings: SystemSettings = DEFAULT_SETTINGS): CalculatedEmployeeStats => {
  const age = calculateAge(emp.dob);
  const currentMonths = calculateCurrentMonths(emp.startDate);
  const totalMonths = Math.round((emp.previousExperienceMonths + currentMonths) * 10) / 10;
  
  const vrRate = calculateVRRate(age, totalMonths, settings);
  const inRaiseWindow = checkRaiseWindow(age, totalMonths, settings);
  const nextRate = calculateNextRateMonths(age, totalMonths, settings);

  return {
    ...emp,
    age,
    currentMonthsWorked: currentMonths,
    totalDaysWorked: calculateDaysWorked(emp.startDate),
    totalMonthsExperience: totalMonths,
    vrRate,
    inRaiseWindow,
    monthsUntilNextRate: nextRate.months,
    nextMilestone: nextRate.milestone
  };
};
