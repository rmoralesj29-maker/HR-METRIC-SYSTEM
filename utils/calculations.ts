
import { Employee, SystemSettings, CalculatedEmployeeStats, VRRate } from '../types';

export const processEmployee = (employee: Employee, settings: SystemSettings): CalculatedEmployeeStats => {
    const today = new Date();
    const startDate = new Date(employee.startDate);
    const dob = new Date(employee.dob);

    // Calculate Age
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    // Calculate Tenure
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const totalDaysWorked = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Months worked (approx)
    const currentMonthsWorked = Math.floor(totalDaysWorked / 30.437); // Average days in month

    const totalMonthsExperience = currentMonthsWorked + (employee.previousExperienceMonths || 0);

    // VR Rate Calculation
    let vrRate = VRRate.VR0;
    const { vrThresholds } = settings;

    if (totalMonthsExperience >= vrThresholds.vr4) vrRate = VRRate.VR4;
    else if (totalMonthsExperience >= vrThresholds.vr3) vrRate = VRRate.VR3;
    else if (totalMonthsExperience >= vrThresholds.vr2) vrRate = VRRate.VR2;
    else if (totalMonthsExperience >= vrThresholds.vr1) vrRate = VRRate.VR1;
    else vrRate = VRRate.VR0;

    // Raise Window Calculation
    // Find next milestone
    const nextMilestone = settings.raiseMilestones.find(m => m > totalMonthsExperience) || null;

    let monthsUntilNextRate = null;
    let inRaiseWindow = false;

    if (nextMilestone) {
         monthsUntilNextRate = nextMilestone - totalMonthsExperience;

         // We need (NextMilestone - PreviousExperience) months from StartDate.
         const monthsNeededFromStart = nextMilestone - (employee.previousExperienceMonths || 0);
         const targetDate = new Date(startDate);
         targetDate.setMonth(startDate.getMonth() + monthsNeededFromStart);

         const diffDaysToTarget = (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

         // Logic: if we are within raiseWindowDays of the target date (either side, or approaching)
         // Usually alerts are "Due soon" or "Overdue".
         // Let's say we show alert if we are within window before due date, or if it's passed but not too long ago?
         // User's code said "Raise Due", implying action required.

         if (Math.abs(diffDaysToTarget) <= settings.raiseWindowDays) {
             inRaiseWindow = true;
         }
    }

    return {
        ...employee,
        age,
        totalDaysWorked,
        currentMonthsWorked,
        totalMonthsExperience,
        vrRate,
        inRaiseWindow,
        monthsUntilNextRate,
        nextMilestone
    };
};
