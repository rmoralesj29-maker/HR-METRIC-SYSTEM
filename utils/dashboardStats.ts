import { Employee, SystemSettings } from '../types';

export interface DashboardStats {
  totalEmployees: number;
  averageAge: number;
  averageTenureMonths: number;
  averageSickDays: number;
  vrDistribution: Record<string, number>;
  ageBuckets: Record<string, number>;
  performanceDistribution: Record<number, number>;
  languageDistribution: Record<string, number>;
}

export const getDashboardStats = (employees: Employee[], settings: SystemSettings, asOfYear?: number): DashboardStats => {
  if (!employees.length) {
    return {
      totalEmployees: 0,
      averageAge: 0,
      averageTenureMonths: 0,
      averageSickDays: 0,
      vrDistribution: { VR0: 0, VR1: 0, VR2: 0, VR3: 0, VR4: 0, VR5: 0 },
      ageBuckets: { '<22': 0, '22-29': 0, '30-39': 0, '40-49': 0, '50+': 0 },
      performanceDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      languageDistribution: {},
    };
  }

  const totalEmployees = employees.length;

  // Calculate average age
  const sumAge = employees.reduce((sum, emp) => sum + (emp.age || 0), 0);
  const averageAge = Number((sumAge / totalEmployees).toFixed(1));

  // Calculate average tenure (in months)
  const sumTenure = employees.reduce((sum, emp) => sum + (emp.tenureMonths || 0), 0);
  const averageTenureMonths = Number((sumTenure / totalEmployees).toFixed(1));

  // Calculate Average Sick Days (Global Total / Total Employees)
  const currentYear = asOfYear || new Date().getFullYear();
  const yearData = settings.sickDaysByYear?.[currentYear] || [];
  const totalSickDays = yearData.reduce((sum, m) => sum + (m.value || 0), 0);
  const averageSickDays = Number((totalSickDays / totalEmployees).toFixed(1));

  // VR Rate distribution
  const vrDistribution = employees.reduce(
    (acc, emp) => {
      const key = emp.vrRate || 'VR0';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    { VR0: 0, VR1: 0, VR2: 0, VR3: 0, VR4: 0, VR5: 0 } as Record<string, number>
  );

  // Age buckets
  const ageBuckets = employees.reduce(
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

  // Performance distribution
  const performanceDistribution = employees.reduce(
    (acc, emp) => {
      const rating = Math.min(5, Math.max(1, Math.round(emp.performanceRating || 3))) as 1 | 2 | 3 | 4 | 5;
      acc[rating] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  // Language distribution
  const languageDistribution = employees.reduce((acc, emp) => {
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
    averageTenureMonths,
    averageSickDays,
    vrDistribution,
    ageBuckets,
    performanceDistribution,
    languageDistribution,
  };
};
