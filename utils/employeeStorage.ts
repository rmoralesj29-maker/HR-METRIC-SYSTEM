import { Employee } from '../types';

const STORAGE_KEY = 'hr_metric_system_employees';

export const loadEmployeesFromStorage = (): Employee[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load employees from storage', error);
    return [];
  }
};

export const saveEmployeesToStorage = (employees: Employee[]): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Failed to save employees to storage', error);
  }
};
