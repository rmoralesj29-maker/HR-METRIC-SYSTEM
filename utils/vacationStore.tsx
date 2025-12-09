import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Vacation } from '../types';

interface VacationStore {
  vacations: Vacation[];
  isLoading: boolean;
  addVacation: (vacation: Vacation) => void;
  updateVacation: (vacation: Vacation) => void;
  deleteVacation: (id: string) => void;
}

const VacationContext = createContext<VacationStore | undefined>(undefined);

const STORAGE_KEY = 'hr_system_vacations';

const loadVacationsFromStorage = (): Vacation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load vacations', e);
    return [];
  }
};

const saveVacationsToStorage = (vacations: Vacation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vacations));
  } catch (e) {
    console.error('Failed to save vacations', e);
  }
};

export const VacationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadVacationsFromStorage();
    setVacations(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveVacationsToStorage(vacations);
    }
  }, [vacations, isLoading]);

  const addVacation = useCallback((vacation: Vacation) => {
    setVacations((prev) => [...prev, vacation]);
  }, []);

  const updateVacation = useCallback((vacation: Vacation) => {
    setVacations((prev) => prev.map((v) => (v.id === vacation.id ? vacation : v)));
  }, []);

  const deleteVacation = useCallback((id: string) => {
    setVacations((prev) => prev.filter((v) => v.id !== id));
  }, []);

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
