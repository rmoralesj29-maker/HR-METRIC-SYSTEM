import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Vacation } from '../types';
import { storage } from './storage';
import { useToast } from './ToastContext';

interface VacationStore {
  vacations: Vacation[];
  isLoading: boolean;
  addVacation: (vacation: Vacation) => Promise<void>;
  updateVacation: (vacation: Vacation) => Promise<void>;
  deleteVacation: (id: string) => Promise<void>;
}

const VacationContext = createContext<VacationStore | undefined>(undefined);

export const VacationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadVacations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = storage.getVacations();
      setVacations(data);
    } catch (err) {
      console.error('Error loading vacations:', err);
      showToast('Failed to load vacation records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadVacations();

    // Subscribe to external changes
    const unsubscribe = storage.subscribe<Vacation[]>(storage.KEYS.VACATIONS, (newData) => {
      setVacations(newData);
    });
    return unsubscribe;
  }, [loadVacations]);

  const addVacation = useCallback(async (vacation: Vacation) => {
    try {
      const newVacations = [...vacations, vacation];
      setVacations(newVacations);
      storage.setVacations(newVacations);
      showToast('Record added successfully', 'success');
    } catch (err) {
      console.error('Error adding vacation:', err);
      showToast('Unexpected error adding record', 'error');
    }
  }, [vacations, showToast]);

  const updateVacation = useCallback(async (vacation: Vacation) => {
    try {
      const newVacations = vacations.map((v) => (v.id === vacation.id ? vacation : v));
      setVacations(newVacations);
      storage.setVacations(newVacations);
      showToast('Record updated successfully', 'success');
    } catch (err) {
      console.error('Error updating vacation:', err);
      showToast('Unexpected error updating record', 'error');
    }
  }, [vacations, showToast]);

  const deleteVacation = useCallback(async (id: string) => {
    try {
      const newVacations = vacations.filter((v) => v.id !== id);
      setVacations(newVacations);
      storage.setVacations(newVacations);
      showToast('Record deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting vacation:', err);
      showToast('Unexpected error deleting record', 'error');
    }
  }, [vacations, showToast]);

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
