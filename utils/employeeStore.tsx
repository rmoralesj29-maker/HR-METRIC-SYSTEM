import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Employee, VRRate } from '../types';
import { INITIAL_EMPLOYEES } from './initialData';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'hr_employees';

interface EmployeeStore {
  employees: Employee[];
  isLoading: boolean;
  addEmployee: (input: Partial<Employee>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
}

const EmployeeContext = createContext<EmployeeStore | undefined>(undefined);

/**
 * Load employees from localStorage
 */
const loadFromStorage = (): Employee[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load employees from localStorage:', error);
  }
  return [];
};

/**
 * Save employees to localStorage
 */
const saveToStorage = (employees: Employee[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Failed to save employees to localStorage:', error);
  }
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load employees on mount
  useEffect(() => {
    setIsLoading(true);
    const stored = loadFromStorage();
    if (stored.length > 0) {
      setEmployees(stored);
    } else {
      // Initialize with seed data
      setEmployees(INITIAL_EMPLOYEES);
      saveToStorage(INITIAL_EMPLOYEES);
    }
    setIsLoading(false);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!isLoading && employees.length > 0) {
      saveToStorage(employees);
    }
  }, [employees, isLoading]);

  const addEmployee = useCallback((input: Partial<Employee>) => {
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      gender: input.gender ?? 'Unspecified',
      country: input.country ?? '',
      role: input.role ?? '',
      vrRate: input.vrRate ?? 'VR0',
      dateOfBirth: input.dateOfBirth ?? new Date().toISOString().split('T')[0],
      startDate: input.startDate ?? new Date().toISOString().split('T')[0],
      performanceRating: input.performanceRating ?? 3,
      languages: input.languages ?? [],
      status: input.status ?? 'Active',
      customFields: input.customFields ?? {},
    };

    setEmployees((prev) => [...prev, newEmployee]);
    showToast('Employee added successfully', 'success');
  }, [showToast]);

  const updateEmployee = useCallback((employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
    showToast('Employee updated successfully', 'success');
  }, [showToast]);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Employee deleted successfully', 'success');
  }, [showToast]);

  const value: EmployeeStore = {
    employees,
    isLoading,
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
