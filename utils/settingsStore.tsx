import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SystemSettings, DEFAULT_SETTINGS } from '../types';
import { storage } from './storage';
import { useToast } from './ToastContext';

interface SettingsStore {
  settings: SystemSettings;
  isLoading: boolean;
  updateSettings: (newSettings: SystemSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsStore | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedSettings = storage.getSettings();
      // Merge with default to ensure structure if keys are missing in storage
      setSettings({
        ...DEFAULT_SETTINGS,
        ...storedSettings
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      showToast('Failed to load settings', 'error');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();

    // Subscribe to external changes
    const unsubscribe = storage.subscribe<SystemSettings>(storage.KEYS.SETTINGS, (newData) => {
      // Merge with defaults to be safe
      setSettings({ ...DEFAULT_SETTINGS, ...newData });
    });
    return unsubscribe;
  }, [loadSettings]);

  const updateSettings = useCallback(async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    try {
      storage.setSettings(newSettings);
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Failed to save settings', 'error');
    }
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
