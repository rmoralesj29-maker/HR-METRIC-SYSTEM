import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Vacation } from '../types';
import { supabase } from './supabaseClient';
import { useToast } from './ToastContext';

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
  const { showToast } = useToast();

  const loadVacations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('vacations').select('*');
      if (error) {
        console.error('Error fetching vacations:', error);
        showToast('Failed to load vacation records', 'error');
      } else if (data) {
        setVacations(data.map(mapDbToVacation));
      }
    } catch (err) {
      console.error('Unexpected error loading vacations:', err);
      showToast('Unexpected error loading vacation records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadVacations();
  }, [loadVacations]);

  const addVacation = useCallback(async (vacation: Vacation) => {
    try {
      const dbRecord = mapVacationToDb(vacation);
      const { error } = await supabase.from('vacations').insert([dbRecord]);
      if (error) {
        console.error('Error adding vacation to DB:', error);
        showToast('Failed to add record: ' + error.message, 'error');
      } else {
        setVacations((prev) => [...prev, vacation]);
        showToast('Record added successfully', 'success');
      }
    } catch (err) {
      console.error('Unexpected error adding vacation:', err);
      showToast('Unexpected error adding record', 'error');
    }
  }, [showToast]);

  const updateVacation = useCallback(async (vacation: Vacation) => {
    try {
      const dbRecord = mapVacationToDb(vacation);
      const { id, ...updates } = dbRecord;
      const { error } = await supabase.from('vacations').update(updates).eq('id', vacation.id);
      if (error) {
        console.error('Error updating vacation in DB:', error);
        showToast('Failed to update record: ' + error.message, 'error');
      } else {
        setVacations((prev) => prev.map((v) => (v.id === vacation.id ? vacation : v)));
        showToast('Record updated successfully', 'success');
      }
    } catch (err) {
      console.error('Unexpected error updating vacation:', err);
      showToast('Unexpected error updating record', 'error');
    }
  }, [showToast]);

  const deleteVacation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('vacations').delete().eq('id', id);
      if (error) {
        console.error('Error deleting vacation from DB:', error);
        showToast('Failed to delete record: ' + error.message, 'error');
      } else {
        setVacations((prev) => prev.filter((v) => v.id !== id));
        showToast('Record deleted successfully', 'success');
      }
    } catch (err) {
      console.error('Unexpected error deleting vacation:', err);
      showToast('Unexpected error deleting record', 'error');
    }
  }, [showToast]);

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
