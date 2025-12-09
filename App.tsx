import React, { useMemo, useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings as SettingsIcon, LogOut, Palmtree, Thermometer } from 'lucide-react';
import { SystemSettings, DEFAULT_SETTINGS, DEFAULT_COLUMNS, ColumnDefinition } from './types';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { Settings } from './components/Settings';
import { Vacations } from './components/Vacations';
import { SickTracker } from './components/SickTracker';
import { BirkirBot } from './components/BirkirBot';
import { useEmployeeStore } from './utils/employeeStore';
import { VacationProvider } from './utils/vacationStore';
import { enrichEmployee } from './utils/experience';

const App: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'vacations' | 'sickTracker' | 'settings'>('employees');
  const [showRaiseDueOnly, setShowRaiseDueOnly] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('etrack_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          vrThresholds: {
            ...DEFAULT_SETTINGS.vrThresholds,
            ...(parsed.vrThresholds || {}),
          },
          monthlySickDays: Array.isArray(parsed.monthlySickDays)
            ? parsed.monthlySickDays
            : DEFAULT_SETTINGS.monthlySickDays,
        };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings from local storage', error);
      return DEFAULT_SETTINGS;
    }
  });

  const [customColumns, setCustomColumns] = useState<ColumnDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('etrack_columns');
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch (error) {
      console.error('Failed to load columns from local storage', error);
      return DEFAULT_COLUMNS;
    }
  });

  useEffect(() => {
    localStorage.setItem('etrack_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('etrack_columns', JSON.stringify(customColumns));
  }, [customColumns]);

  const calculatedEmployees = useMemo(
    () => employees.map((emp) => enrichEmployee(emp, systemSettings)),
    [employees, systemSettings]
  );

  const displayedEmployees = useMemo(() => {
    if (showRaiseDueOnly) {
      return calculatedEmployees.filter((e) => e.inRaiseWindow);
    }
    return calculatedEmployees;
  }, [calculatedEmployees, showRaiseDueOnly]);

  const handleDashboardAlertClick = () => {
    setShowRaiseDueOnly(true);
    setActiveTab('employees');
  };

  const handleTabChange = (tab: 'dashboard' | 'employees' | 'vacations' | 'sickTracker' | 'settings') => {
    setActiveTab(tab);
    if (tab !== 'employees') setShowRaiseDueOnly(false);
  };

  return (
    <VacationProvider>
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col shadow-xl z-10 hidden md:flex border-r border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-2xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">E</div>
            E.Track
          </div>
          <p className="text-xs text-slate-500 mt-2">HR Management System v2.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => handleTabChange('employees')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'employees'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={20} />
            <span className="font-medium">Employees</span>
          </button>

          <button
            onClick={() => handleTabChange('vacations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'vacations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palmtree size={20} />
            <span className="font-medium">Vacations</span>
          </button>

          <button
            onClick={() => handleTabChange('sickTracker')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'sickTracker'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer size={20} />
            <span className="font-medium">Sick Tracker</span>
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <SettingsIcon size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            className="flex items-center gap-2 text-sm text-slate-500 rounded-lg px-3 py-2 cursor-not-allowed"
            title="Coming soon"
            disabled
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white text-slate-900 p-4 flex justify-between items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm">
          <div className="font-bold flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs">E</div>
            E.Track
          </div>
          <button onClick={() => setActiveTab(activeTab === 'dashboard' ? 'employees' : 'dashboard')}>
            {activeTab === 'dashboard' ? <Users /> : <LayoutDashboard />}
          </button>
        </div>

        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          <header className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 capitalize flex items-center gap-3">
                {activeTab}
                {showRaiseDueOnly && activeTab === 'employees' && (
                  <span className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-2">
                    Filtered: Raise Due
                    <button onClick={() => setShowRaiseDueOnly(false)} className="hover:text-amber-950">
                      <Users size={14} />
                    </button>
                  </span>
                )}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === 'dashboard'
                  ? 'Overview of HR metrics and analytics.'
                  : activeTab === 'employees'
                  ? 'Manage workforce details and records.'
                  : activeTab === 'sickTracker'
                  ? 'Monitor and record employee sick leave.'
                  : 'Configure system rules, fields, and export data.'}
              </p>
            </div>
            <div className="text-left md:text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <Dashboard employees={calculatedEmployees} settings={systemSettings} onAlertClick={handleDashboardAlertClick} />
          )}

          {activeTab === 'employees' && (
            <EmployeeList
              employees={displayedEmployees}
              columns={customColumns}
              onUpdate={updateEmployee}
              onAdd={addEmployee}
              onRemove={deleteEmployee}
            />
          )}

          {activeTab === 'vacations' && (
            <Vacations />
          )}

          {activeTab === 'sickTracker' && (
            <SickTracker />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={systemSettings}
              onUpdateSettings={setSystemSettings}
              customColumns={customColumns}
              onUpdateColumns={setCustomColumns}
              employees={calculatedEmployees}
            />
          )}
        </div>
      </main>

      {/* Birkir Chatbot */}
      <BirkirBot employees={calculatedEmployees} />
    </div>
    </VacationProvider>
  );
};

export default App;
