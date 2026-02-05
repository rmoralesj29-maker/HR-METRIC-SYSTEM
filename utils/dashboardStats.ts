import { Employee, SystemSettings } from '../types';

export interface DashboardStats {
  totalEmployees: number;
  averageAge: number;
  averageTotalExperienceMonths: number;
  averageSickDays: number;
  vrDistribution: Record<string, number>;
  ageBuckets: Record<string, number>;
  tenureBuckets: Record<string, number>;
  performanceDistribution: Record<number, number>;
  languageDistribution: Record<string, number>;
  workforceStatus: {
    active: number;
    leaving: number;
    left: number;
  };
  monthlyMovement: {
    month: string;
    hires: number;
    leavers: number;
    net: number;
  }[];
}

export const getDashboardStats = (
  employees: Employee[],
  settings: SystemSettings,
  asOfDate: Date = new Date()
): DashboardStats => {
  // Determine status for ALL employees based on asOfDate
  const currentYear = asOfDate.getFullYear();

  // "Active" for the dashboard means "Currently Working" (Active or Leaving, but not yet Left).
  // "Left" means leaveDate <= asOfDate.
  // "Future" means startDate > asOfDate.

  // Categorize employees
  const relevantEmployees = employees.filter(e => {
    const start = new Date(e.startDate);
    // Ignore future hires for "Active" stats
    return start <= asOfDate;
  });

  const activeEmployees = relevantEmployees.filter(e => {
    // If they have no leave date, they are active.
    if (!e.leaveDate) return true;
    const leave = new Date(e.leaveDate);
    // If they have a leave date, they are active only if leaveDate > asOfDate
    return leave > asOfDate;
  });

  // Calculate Workforce Status Counts
  // Active: Status is active OR (status is leaving but not yet left)
  // But the UI wants Active / Leaving / Left cards.
  // Leaving = Has leave date > asOfDate
  // Active = No leave date
  // Left = Has leave date <= asOfDate
  // Note: This relies on leaveDate presence.

  // We need to look at ALL employees for the Status Cards (except future starts for Active/Leaving)
  const startedEmployees = employees.filter(e => new Date(e.startDate) <= asOfDate);

  const statusActive = startedEmployees.filter(e => !e.leaveDate).length;
  const statusLeaving = startedEmployees.filter(e => e.leaveDate && new Date(e.leaveDate) > asOfDate).length;
  const statusLeft = employees.filter(e => e.leaveDate && new Date(e.leaveDate) <= asOfDate).length; // Includes left employees even if they started after asOfDate? No, if they left, they must have started.

  // Use activeEmployees (Active + Leaving) for the main charts
  const totalEmployees = activeEmployees.length;

  // ---------------------------------------------------------------------------
  // Monthly Movement (Current Year of asOfDate)
  // ---------------------------------------------------------------------------
  const monthlyMovement = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(currentYear, i, 1);
    // End of month
    const monthEnd = new Date(currentYear, i + 1, 0);
    const monthName = monthStart.toLocaleString('default', { month: 'short' });

    // Hires: startDate in this month
    const hires = employees.filter(e => {
      const start = new Date(e.startDate);
      return start >= monthStart && start <= monthEnd;
    }).length;

    // Leavers: leaveDate in this month AND status is 'left' (to confirm they actually left?)
    // Requirement: "Count employees where employmentStatus = "left" and leaveDate is within each month"
    // However, status 'left' is a current state. If I look at past months, they are 'left' now.
    // So just checking leaveDate is sufficient for historical analysis.
    const leavers = employees.filter(e => {
      if (!e.leaveDate) return false;
      const leave = new Date(e.leaveDate);
      return leave >= monthStart && leave <= monthEnd;
    }).length;

    return {
      month: monthName,
      hires,
      leavers,
      net: hires - leavers
    };
  });


  if (totalEmployees === 0) {
    return {
      totalEmployees: 0,
      averageAge: 0,
      averageTotalExperienceMonths: 0,
      averageSickDays: 0,
      vrDistribution: { VR0: 0, VR1: 0, VR2: 0, VR3: 0, VR4: 0, VR5: 0 },
      ageBuckets: { '<22': 0, '22-29': 0, '30-39': 0, '40-49': 0, '50+': 0 },
      tenureBuckets: { '<6m': 0, '6m-1y': 0, '1y-2y': 0, '2y-3y': 0, '3y+': 0 },
      performanceDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      languageDistribution: {},
      workforceStatus: {
          active: statusActive,
          leaving: statusLeaving,
          left: statusLeft
      },
      monthlyMovement
    };
  }

  const enriched = activeEmployees;

  const sumAge = enriched.reduce((sum, emp) => sum + (emp.age || 0), 0);
  const averageAge = Number((sumAge / totalEmployees).toFixed(1));

  const sumExperience = enriched.reduce((sum, emp) => sum + (emp.totalExperienceMonths || 0), 0);
  const averageTotalExperienceMonths = Number((sumExperience / totalEmployees).toFixed(1));

  // Calculate Average Sick Days (Global Total / Total Employees)
  const yearData = settings.sickDaysByYear?.[currentYear] || [];
  const totalSickDays = yearData.reduce((sum, m) => sum + m.value, 0);
  const averageSickDays = Number((totalSickDays / totalEmployees).toFixed(1));

  const vrDistribution = enriched.reduce((acc, emp) => {
    const key = emp.statusVR || 'VR0';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { VR0: 0, VR1: 0, VR2: 0, VR3: 0, VR4: 0, VR5: 0 } as Record<string, number>);

  const ageBuckets = enriched.reduce(
    (acc, emp) => {
      const age = emp.age || 0;
      if (age < 22) acc['<22'] += 1;
      else if (age <= 29) acc['22-29'] += 1;
      else if (age <= 39) acc['30-39'] += 1;
      else if (age <= 49) acc['40-49'] += 1;
      else acc['50+'] += 1;
      return acc;
    },
    { '<22': 0, '22-29': 0, '30-39': 0, '40-49': 0, '50+': 0 } as Record<string, number>
  );

  const tenureBuckets = enriched.reduce((acc, emp) => {
    const months = emp.totalExperienceMonths || 0;
    if (months < 6) acc['<6m'] += 1;
    else if (months < 12) acc['6m-1y'] += 1;
    else if (months < 24) acc['1y-2y'] += 1;
    else if (months < 36) acc['2y-3y'] += 1;
    else acc['3y+'] += 1;
    return acc;
  }, { '<6m': 0, '6m-1y': 0, '1y-2y': 0, '2y-3y': 0, '3y+': 0 } as Record<string, number>);

  const performanceDistribution = enriched.reduce(
    (acc, emp) => {
      const rating = Math.min(5, Math.max(1, Math.round(emp.performanceRating || 0))) as 1 | 2 | 3 | 4 | 5;
      acc[rating] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  const languageDistribution = enriched.reduce((acc, emp) => {
    if (emp.languages && Array.isArray(emp.languages)) {
      emp.languages.forEach((lang) => {
        const trimmedLang = lang.trim();
        if (trimmedLang) {
          acc[trimmedLang] = (acc[trimmedLang] || 0) + 1;
        }
      });
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEmployees,
    averageAge,
    averageTotalExperienceMonths,
    averageSickDays,
    vrDistribution,
    ageBuckets,
    tenureBuckets,
    performanceDistribution,
    languageDistribution,
    workforceStatus: {
        active: statusActive,
        leaving: statusLeaving,
        left: statusLeft
    },
    monthlyMovement
  };
};
