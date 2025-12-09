import { Employee, SystemSettings } from '../types';
import { enrichEmployee } from './experience';

export interface DashboardStats {
  totalEmployees: number;
  averageAge: number;
  averageTotalExperienceMonths: number;
  averageSickDays: number;
  vrDistribution: Record<string, number>;
  ageBuckets: Record<string, number>;
  performanceDistribution: Record<number, number>;
  raiseDue: number;
  languageDistribution: Record<string, number>;
}

export const getDashboardStats = (employees: Employee[], settings: SystemSettings): DashboardStats => {
  if (!employees.length) {
    return {
      totalEmployees: 0,
      averageAge: 0,
      averageTotalExperienceMonths: 0,
      averageSickDays: 0,
      vrDistribution: { VR0: 0, VR1: 0, VR2: 0, VR3: 0, VR4: 0 },
      ageBuckets: { '<22': 0, '22-29': 0, '30-39': 0, '40-49': 0, '50+': 0 },
      performanceDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      raiseDue: 0,
      languageDistribution: {},
    };
  }

  const enriched = employees.map((emp) => enrichEmployee(emp, settings));
  const totalEmployees = enriched.length;

  const sumAge = enriched.reduce((sum, emp) => sum + (emp.age || 0), 0);
  const averageAge = Number((sumAge / totalEmployees).toFixed(1));

  const sumExperience = enriched.reduce((sum, emp) => sum + (emp.totalExperienceMonths || 0), 0);
  const averageTotalExperienceMonths = Number((sumExperience / totalEmployees).toFixed(1));

  const sumSickDays = enriched.reduce((sum, emp) => sum + (emp.sickDaysYTD || 0), 0);
  const averageSickDays = Number((sumSickDays / totalEmployees).toFixed(1));

  const vrDistribution = enriched.reduce((acc, emp) => {
    const key = emp.statusVR || 'VR0';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { VR0: 0, VR1: 0, VR2: 0, VR3: 0, VR4: 0 } as Record<string, number>);

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

  const performanceDistribution = enriched.reduce(
    (acc, emp) => {
      const rating = Math.min(5, Math.max(1, Math.round(emp.performanceRating || 0))) as 1 | 2 | 3 | 4 | 5;
      acc[rating] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  const raiseDue = enriched.filter((emp) => emp.inRaiseWindow).length;

  const languageDistribution = enriched.reduce((acc, emp) => {
    if (emp.languages && Array.isArray(emp.languages)) {
      emp.languages.forEach((lang) => {
        const trimmedLang = lang.trim();
        if (trimmedLang && trimmedLang.toLowerCase() !== 'english') {
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
    performanceDistribution,
    raiseDue,
    languageDistribution,
  };
};
