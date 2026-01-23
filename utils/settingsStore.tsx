import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SystemSettings, DEFAULT_SETTINGS } from '../types';
import { supabase } from './supabaseClient';
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
      const { data, error } = await supabase.from('settings').select('settings').eq('id', 1).single();

      if (error) {
        if (error.code === 'PGRST116') {
            // No rows found, verify connection or RLS?
            // Fallback to defaults
             console.warn('Settings not found in DB, using defaults.');
        } else {
             console.error('Error fetching settings:', error);
             showToast('Failed to load settings', 'error');
        }
        // Try local storage as fallback or just default
        const local = localStorage.getItem('etrack_settings');
        if (local) {
            try {
                const parsed = JSON.parse(local);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch (e) {
                setSettings(DEFAULT_SETTINGS);
            }
        } else {
             setSettings(DEFAULT_SETTINGS);
        }
      } else if (data) {
        // Merge with default settings to ensure structure
        setSettings((prev) => ({
            ...DEFAULT_SETTINGS,
            ...data.settings
        }));
      }
    } catch (err) {
      console.error('Unexpected error loading settings:', err);
      // Fallback
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (newSettings: SystemSettings) => {
    // Optimistic update
    setSettings(newSettings);
    // Also update local storage for redundancy/offline
    localStorage.setItem('etrack_settings', JSON.stringify(newSettings));

    try {
      const { error } = await supabase
        .from('settings')
        .update({ settings: newSettings, updated_at: new Date().toISOString() })
        .eq('id', 1);

      if (error) {
        console.error('Error updating settings in DB:', error);
        showToast('Failed to save settings: ' + error.message, 'error');
        // Revert? For now, we keep optimistic state but warn.
      } else {
        showToast('Settings saved successfully', 'success');
      }
    } catch (err) {
      console.error('Unexpected error saving settings:', err);
      showToast('Unexpected error saving settings', 'error');
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
