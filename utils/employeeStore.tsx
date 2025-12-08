import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Employee, DEFAULT_SETTINGS } from '../types';
import { enrichEmployee } from './experience';
import { loadEmployeesFromStorage, saveEmployeesToStorage } from './employeeStorage';
import { seedEmployees } from './seedEmployees';

interface EmployeeStore {
  employees: Employee[];
  isLoading: boolean;
  loadEmployees: () => void;
  addEmployee: (input: Partial<Employee> | Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
}

const EmployeeContext = createContext<EmployeeStore | undefined>(undefined);

const sampleEmployees: Employee[] = seedEmployees;

const normalizeEmployeeRecord = (record: any): Employee => {
  const [firstNameFromName = '', ...restName] = (record.firstName ? [record.firstName, record.lastName] : (record.name || '')
    .toString()
    .split(' ')) as string[];
  const firstName = record.firstName ?? firstNameFromName;
  const lastName = record.lastName ?? restName.join(' ');

  return enrichEmployee(
    {
      id: record.id ?? crypto.randomUUID(),
      firstName,
      lastName,
      gender: record.gender ?? 'Other',
      country: record.country ?? '',
      role: record.role ?? '',
      statusVR: record.statusVR ?? record.vrRate ?? 'VR0',
      dateOfBirth: record.dateOfBirth ?? record.dob ?? new Date().toISOString().split('T')[0],
      startDate: record.startDate ?? new Date().toISOString().split('T')[0],
      previousExperienceMonths: Number(record.previousExperienceMonths ?? 0),
      totalExperienceMonths: Number(record.totalExperienceMonths ?? record.totalMonthsExperience ?? 0),
      monthsToNextRaise: record.monthsToNextRaise ?? record.monthsUntilNextRate ?? null,
      sickDaysYTD: Number(record.sickDaysYTD ?? 0),
      performanceRating: Number(record.performanceRating ?? 3),
      languages: Array.isArray(record.languages) ? record.languages : [],
      customFields: record.customFields ?? record.customData ?? {},
    },
    DEFAULT_SETTINGS
  );
};

const normalizeEmployees = (list: Employee[]): Employee[] => list.map((employee) => normalizeEmployeeRecord(employee));

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = useCallback(() => {
    const stored = loadEmployeesFromStorage();
    const source = stored.length ? stored : sampleEmployees;
    setEmployees(normalizeEmployees(source));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (!isLoading) {
      saveEmployeesToStorage(employees);
    }
  }, [employees, isLoading]);

  const addEmployee = useCallback((input: Partial<Employee> | Employee) => {
    setEmployees((prev) => {
      const base: Employee = {
        id: input.id ?? crypto.randomUUID(),
        firstName: input.firstName ?? '',
        lastName: input.lastName ?? '',
        gender: input.gender ?? 'Other',
        country: input.country ?? '',
        role: input.role ?? '',
        statusVR: input.statusVR ?? 'VR0',
        dateOfBirth: input.dateOfBirth ?? new Date().toISOString().split('T')[0],
        startDate: input.startDate ?? new Date().toISOString().split('T')[0],
        previousExperienceMonths: input.previousExperienceMonths ?? 0,
        totalExperienceMonths: input.totalExperienceMonths ?? 0,
        monthsToNextRaise: input.monthsToNextRaise ?? null,
        sickDaysYTD: input.sickDaysYTD ?? 0,
        performanceRating: input.performanceRating ?? 3,
        languages: input.languages ?? [],
        customFields: input.customFields ?? {},
      };
      const enriched = enrichEmployee(base, DEFAULT_SETTINGS);
      const updated = [...prev, enriched];
      return updated;
    });
  }, []);

  const updateEmployee = useCallback((employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? enrichEmployee(employee, DEFAULT_SETTINGS) : e)));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value: EmployeeStore = {
    employees,
    isLoading,
    loadEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployeeStore = (): EmployeeStore => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployeeStore must be used within an EmployeeProvider');
  }
  return context;
};
