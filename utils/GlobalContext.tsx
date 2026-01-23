import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextProps {
  asOfDate: Date;
  setAsOfDate: (date: Date) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());

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
