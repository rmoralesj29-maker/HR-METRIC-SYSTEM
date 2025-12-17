import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Employee, DEFAULT_SETTINGS } from '../types';
import { enrichEmployee } from './experience';
import { supabase } from './supabaseClient';
import { INITIAL_EMPLOYEES } from './initialData';

interface EmployeeStore {
  employees: Employee[];
  isLoading: boolean;
  loadEmployees: () => Promise<void>;
  addEmployee: (input: Partial<Employee> | Employee) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

const EmployeeContext = createContext<EmployeeStore | undefined>(undefined);

// Helper to map DB columns (snake_case) to Employee type (camelCase)
const mapDbToEmployee = (record: any): Employee => {
  return enrichEmployee(
    {
      id: record.id,
      firstName: record.first_name,
      lastName: record.last_name,
      gender: record.gender,
      country: record.country,
      role: record.role,
      statusVR: record.status_vr,
      dateOfBirth: record.date_of_birth,
      startDate: record.start_date,
      previousExperienceMonths: record.previous_experience_months,
      totalExperienceMonths: record.total_experience_months,
      monthsToNextRaise: record.months_to_next_raise,
      sickDaysYTD: record.sick_days_ytd,
      performanceRating: record.performance_rating,
      languages: record.languages || [],
      customFields: record.custom_fields || {},
    },
    DEFAULT_SETTINGS
  );
};

// Helper to map Employee type to DB columns
const mapEmployeeToDb = (employee: Partial<Employee>) => {
  return {
    id: employee.id,
    first_name: employee.firstName,
    last_name: employee.lastName,
    gender: employee.gender,
    country: employee.country,
    role: employee.role,
    status_vr: employee.statusVR,
    date_of_birth: employee.dateOfBirth,
    start_date: employee.startDate,
    previous_experience_months: employee.previousExperienceMonths,
    total_experience_months: employee.totalExperienceMonths,
    months_to_next_raise: employee.monthsToNextRaise,
    sick_days_ytd: employee.sickDaysYTD,
    performance_rating: employee.performanceRating,
    languages: employee.languages,
    custom_fields: employee.customFields,
  };
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('employees').select('*');
      if (error) {
        console.error('Error fetching employees:', error);
        // Fallback: load initial data so UI isn't empty
        console.warn('Fallback: Loading initial data due to DB error.');
        const validEmployees = INITIAL_EMPLOYEES.filter(e => {
             if (!e.firstName || !e.lastName) {
                 console.warn('Skipping invalid employee in fallback:', e);
                 return false;
             }
             return true;
        });
        console.log(`Loaded ${validEmployees.length} employees from authoritative source (Fallback mode).`);
        setEmployees(validEmployees.map(e => enrichEmployee(e, DEFAULT_SETTINGS)));
      } else if (data) {
        // Prepare for sync: "Insert or upsert all employees"
        const existingEmployees = data.map(mapDbToEmployee);
        const updates: any[] = [];
        const inserts: any[] = [];
        let insertedCount = 0;
        let updatedCount = 0;

        for (const initialEmp of INITIAL_EMPLOYEES) {
          // Validate: check for missing name
          if (!initialEmp.firstName || !initialEmp.lastName) {
            console.warn('Skipping employee with missing name:', initialEmp);
            continue;
          }

          const match = existingEmployees.find(
            (e) =>
              e.firstName.toLowerCase() === initialEmp.firstName.toLowerCase() &&
              e.lastName.toLowerCase() === initialEmp.lastName.toLowerCase()
          );

          const dbRecord = mapEmployeeToDb(initialEmp);
          const { id: _, ...recordData } = dbRecord; // Remove placeholder ID

          if (match) {
            // Update existing
            // Check if data is different? For now, we force upsert as requested "Insert or upsert all"
            // We use the MATCH ID
            updates.push({ ...recordData, id: match.id });
          } else {
            // Insert new
            inserts.push(recordData);
          }
        }

        // Perform inserts
        if (inserts.length > 0) {
          const { data: insertedData, error: insertError } = await supabase
            .from('employees')
            .insert(inserts)
            .select();

          if (insertError) {
            console.error('Error inserting new employees:', insertError);
          } else if (insertedData) {
            insertedCount = insertedData.length;
          }
        }

        // Perform updates
        // Supabase upsert can work if we provide ID.
        // We can do bulk upsert if we have IDs.
        if (updates.length > 0) {
          const { data: updatedData, error: updateError } = await supabase
            .from('employees')
            .upsert(updates) // Upsert uses primary key (id) to update
            .select();

          if (updateError) {
            console.error('Error updating existing employees:', updateError);
          } else if (updatedData) {
            updatedCount = updatedData.length;
          }
        }

        if (insertedCount > 0 || updatedCount > 0) {
          console.log(`Sync complete. Inserted: ${insertedCount}, Updated: ${updatedCount}`);
          // Reload to get fresh state
          const { data: refreshedData } = await supabase.from('employees').select('*');
          if (refreshedData) {
            setEmployees(refreshedData.map(mapDbToEmployee));
          }
        } else {
            setEmployees(existingEmployees);
        }
      } else {
        // Fallback for when Supabase fails (e.g. no connection), maybe use local storage or just memory
        console.warn('Could not fetch from Supabase. Using INITIAL_EMPLOYEES directly if empty.');
        setEmployees(INITIAL_EMPLOYEES.map(e => enrichEmployee(e, DEFAULT_SETTINGS)));
      }
    } catch (err) {
      console.error('Unexpected error loading employees:', err);
      // Fallback in case of error
      setEmployees(INITIAL_EMPLOYEES.map(e => enrichEmployee(e, DEFAULT_SETTINGS)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const addEmployee = useCallback(async (input: Partial<Employee> | Employee) => {
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

    // Optimistic update
    const enriched = enrichEmployee(base, DEFAULT_SETTINGS);
    setEmployees((prev) => [...prev, enriched]);

    try {
      const dbRecord = mapEmployeeToDb(base);
      const { error } = await supabase.from('employees').insert([dbRecord]);
      if (error) {
        console.error('Error adding employee to DB:', error);
        // Revert optimistic update if needed, or show toast
        setEmployees((prev) => prev.filter(e => e.id !== base.id));
      }
    } catch (err) {
      console.error('Unexpected error adding employee:', err);
      setEmployees((prev) => prev.filter(e => e.id !== base.id));
    }
  }, []);

  const updateEmployee = useCallback(async (employee: Employee) => {
    const enriched = enrichEmployee(employee, DEFAULT_SETTINGS);

    // Optimistic update
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? enriched : e)));

    try {
      const dbRecord = mapEmployeeToDb(employee);
      // We don't update ID
      const { id, ...updates } = dbRecord;

      const { error } = await supabase.from('employees').update(updates).eq('id', employee.id);
      if (error) {
        console.error('Error updating employee in DB:', error);
        // Maybe revert? For now logging error.
      }
    } catch (err) {
      console.error('Unexpected error updating employee:', err);
    }
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    // Optimistic update
    const oldEmployees = employees;
    setEmployees((prev) => prev.filter((e) => e.id !== id));

    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) {
        console.error('Error deleting employee from DB:', error);
        setEmployees(oldEmployees); // Revert
      }
    } catch (err) {
      console.error('Unexpected error deleting employee:', err);
      setEmployees(oldEmployees); // Revert
    }
  }, [employees]);

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
