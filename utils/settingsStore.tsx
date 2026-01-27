import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SystemSettings, DEFAULT_SETTINGS, getDefaultMonthlySickDays } from '../types';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'hr_settings';

interface SettingsStore {
  settings: SystemSettings;
  isLoading: boolean;
  updateSettings: (newSettings: SystemSettings) => void;
}

const SettingsContext = createContext<SettingsStore | undefined>(undefined);

/**
 * Load settings from localStorage
 */
const loadFromStorage = (): SystemSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return null;
};

/**
 * Save settings to localStorage
 */
const saveToStorage = (settings: SystemSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load settings on mount
  useEffect(() => {
    setIsLoading(true);
    const stored = loadFromStorage();
    if (stored) {
      setSettings(stored);
    } else {
      // Initialize with defaults
      saveToStorage(DEFAULT_SETTINGS);
    }
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: SystemSettings) => {
    // Ensure sick days data exists for all years
    const updatedSettings = { ...newSettings };

    // Make sure we have data for years 2025-2027
    [2025, 2026, 2027].forEach((year) => {
      if (!updatedSettings.sickDaysByYear[year]) {
        updatedSettings.sickDaysByYear[year] = getDefaultMonthlySickDays();
      }
    });

    setSettings(updatedSettings);
    saveToStorage(updatedSettings);
    showToast('Settings saved successfully', 'success');
  }, [showToast]);

  const value: SettingsStore = {
    settings,
    isLoading,
    updateSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettingsStore = (): SettingsStore => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsStore must be used within a SettingsProvider');
  }
  return context;
};
