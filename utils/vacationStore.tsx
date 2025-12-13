import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Vacation } from '../types';
import { supabase } from './supabaseClient';

interface VacationStore {
  vacations: Vacation[];
  isLoading: boolean;
  addVacation: (vacation: Vacation) => Promise<void>;
  updateVacation: (vacation: Vacation) => Promise<void>;
  deleteVacation: (id: string) => Promise<void>;
}

const VacationContext = createContext<VacationStore | undefined>(undefined);

// Helper to map DB columns (snake_case) to Vacation type (camelCase)
const mapDbToVacation = (record: any): Vacation => {
  return {
    id: record.id,
    employeeId: record.employee_id,
    startDate: record.start_date,
    endDate: record.end_date,
    days: record.days,
    type: record.type,
    status: record.status,
    notes: record.notes,
  };
};

// Helper to map Vacation type to DB columns
const mapVacationToDb = (vacation: Vacation) => {
  return {
    id: vacation.id,
    employee_id: vacation.employeeId,
    start_date: vacation.startDate,
    end_date: vacation.endDate,
    days: vacation.days,
    type: vacation.type,
    status: vacation.status,
    notes: vacation.notes,
  };
};

export const VacationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVacations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('vacations').select('*');
      if (error) {
        console.error('Error fetching vacations:', error);
      } else if (data) {
        setVacations(data.map(mapDbToVacation));
      }
    } catch (err) {
      console.error('Unexpected error loading vacations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVacations();
  }, [loadVacations]);

  const addVacation = useCallback(async (vacation: Vacation) => {
    // Optimistic update
    setVacations((prev) => [...prev, vacation]);

    try {
      const dbRecord = mapVacationToDb(vacation);
      const { error } = await supabase.from('vacations').insert([dbRecord]);
      if (error) {
        console.error('Error adding vacation to DB:', error);
        setVacations((prev) => prev.filter(v => v.id !== vacation.id)); // Revert
      }
    } catch (err) {
      console.error('Unexpected error adding vacation:', err);
      setVacations((prev) => prev.filter(v => v.id !== vacation.id)); // Revert
    }
  }, []);

  const updateVacation = useCallback(async (vacation: Vacation) => {
    // Optimistic update
    setVacations((prev) => prev.map((v) => (v.id === vacation.id ? vacation : v)));

    try {
      const dbRecord = mapVacationToDb(vacation);
      const { id, ...updates } = dbRecord;
      const { error } = await supabase.from('vacations').update(updates).eq('id', vacation.id);
      if (error) {
        console.error('Error updating vacation in DB:', error);
        // Maybe revert?
      }
    } catch (err) {
      console.error('Unexpected error updating vacation:', err);
    }
  }, []);

  const deleteVacation = useCallback(async (id: string) => {
    // Optimistic update
    const oldVacations = vacations;
    setVacations((prev) => prev.filter((v) => v.id !== id));

    try {
      const { error } = await supabase.from('vacations').delete().eq('id', id);
      if (error) {
        console.error('Error deleting vacation from DB:', error);
        setVacations(oldVacations); // Revert
      }
    } catch (err) {
      console.error('Unexpected error deleting vacation:', err);
      setVacations(oldVacations); // Revert
    }
  }, [vacations]);

  const value: VacationStore = {
    vacations,
    isLoading,
    addVacation,
    updateVacation,
    deleteVacation,
  };

  return <VacationContext.Provider value={value}>{children}</VacationContext.Provider>;
};

export const useVacationStore = (): VacationStore => {
  const context = useContext(VacationContext);
  if (!context) {
    throw new Error('useVacationStore must be used within a VacationProvider');
  }
  return context;
};
