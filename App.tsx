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
import { useSettingsStore } from './utils/settingsStore';
import { useGlobalContext } from './utils/GlobalContext';
import { enrichEmployee } from './utils/experience';

const App: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
  const { settings: systemSettings, updateSettings: setSystemSettings } = useSettingsStore();
  const { asOfDate, setAsOfDate } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'vacations' | 'sickTracker' | 'settings'>('employees');

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
    localStorage.setItem('etrack_columns', JSON.stringify(customColumns));
  }, [customColumns]);

  const calculatedEmployees = useMemo(
    () => employees.map((emp) => enrichEmployee(emp, systemSettings, asOfDate)),
    [employees, systemSettings, asOfDate]
  );

  const handleTabChange = (tab: 'dashboard' | 'employees' | 'vacations' | 'sickTracker' | 'settings') => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col shadow-xl z-10 hidden md:flex border-r border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-800 font-bold text-xl tracking-tight">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-bold">HR</div>
            Manager System
          </div>
          <p className="text-xs text-slate-500 mt-3 ml-1">HR Management System v2.0</p>
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
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-bold">HR</div>
            Manager System
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
              <label htmlFor="asOfDate" className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                As Of Date
              </label>
              <input
                 id="asOfDate"
                 type="date"
                 value={asOfDate.toISOString().split('T')[0]}
                 onChange={(e) => setAsOfDate(new Date(e.target.value))}
                 className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none shadow-sm"
              />
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <Dashboard employees={calculatedEmployees} settings={systemSettings} />
          )}

          {activeTab === 'employees' && (
            <EmployeeList
              employees={calculatedEmployees}
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
  );
};

export default App;
