import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { storage } from './storage';

interface GlobalContextProps {
  asOfDate: Date;
  setAsOfDate: (date: Date) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from storage or default to today
  const [asOfDate, setAsOfDateState] = useState<Date>(() => {
    const saved = storage.getGlobalState().asOfDate;
    return saved ? new Date(saved) : new Date();
  });

  const setAsOfDate = (date: Date) => {
    setAsOfDateState(date);
    storage.setGlobalState({ asOfDate: date.toISOString() });
  };

  useEffect(() => {
      const unsubscribe = storage.subscribe<{ asOfDate: string }>(storage.KEYS.GLOBAL_STATE, (newState) => {
          if (newState.asOfDate) {
              setAsOfDateState(new Date(newState.asOfDate));
          }
      });
      return unsubscribe;
  }, []);

  return (
    <GlobalContext.Provider value={{ asOfDate, setAsOfDate }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextProps => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
