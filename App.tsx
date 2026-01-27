import React, { useMemo, useState, useEffect } from 'react';
import { LayoutDashboard, Users, Settings as SettingsIcon, Calendar, RefreshCw } from 'lucide-react';
import { DEFAULT_COLUMNS, ColumnDefinition } from './types';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { Settings } from './components/Settings';
import { useEmployeeStore } from './utils/employeeStore';
import { useSettingsStore } from './utils/settingsStore';
import { useGlobalContext } from './utils/GlobalContext';
import { enrichEmployee } from './utils/experience';

type TabType = 'dashboard' | 'employees' | 'settings';

const App: React.FC = () => {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee } = useEmployeeStore();
  const { settings: systemSettings, updateSettings: setSystemSettings } = useSettingsStore();
  const { asOfDate, setAsOfDate } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [customColumns, setCustomColumns] = useState<ColumnDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('hr_columns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return [...DEFAULT_COLUMNS, ...parsed.filter((c: ColumnDefinition) => !c.isSystem)];
        }
      }
    } catch (error) {
      console.error('Failed to load columns from local storage', error);
    }
    return DEFAULT_COLUMNS;
  });

  useEffect(() => {
    const customOnly = customColumns.filter((c) => !c.isSystem);
    localStorage.setItem('hr_columns', JSON.stringify(customOnly));
  }, [customColumns]);

  const enrichedEmployees = useMemo(
    () => employees.map((emp) => enrichEmployee(emp, asOfDate)),
    [employees, asOfDate]
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    setAsOfDate(new Date());
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading HR data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col shadow-xl z-10 hidden md:flex border-r border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-slate-800 font-bold text-xl tracking-tight">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white font-bold">HR</div>
            Analytics
          </div>
          <p className="text-xs text-slate-500 mt-3 ml-1">HR Analytics System</p>
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
          <p className="text-xs text-slate-400 text-center">
            {enrichedEmployees.length} employees
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white text-slate-900 p-4 flex justify-between items-center sticky top-0 z-20 border-b border-slate-100 shadow-sm">
          <div className="font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-bold">HR</div>
            Analytics
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
            >
              <LayoutDashboard size={20} />
            </button>
            <button
              onClick={() => handleTabChange('employees')}
              className={`p-2 rounded-lg ${activeTab === 'employees' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`p-2 rounded-lg ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          <header className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 capitalize flex items-center gap-3">
                {activeTab}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === 'dashboard'
                  ? 'Overview of HR metrics and workforce analytics.'
                  : activeTab === 'employees'
                  ? 'Manage employee records and details.'
                  : 'Configure system settings and export data.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-xs text-slate-500">As of:</span>
                <input
                  type="date"
                  value={formatDate(asOfDate)}
                  onChange={(e) => setAsOfDate(new Date(e.target.value))}
                  className="bg-transparent text-sm text-slate-700 font-medium outline-none"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
                title="Refresh to today"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <Dashboard employees={enrichedEmployees} settings={systemSettings} />
          )}

          {activeTab === 'employees' && (
            <EmployeeList
              employees={enrichedEmployees}
              columns={customColumns}
              onUpdate={updateEmployee}
              onAdd={addEmployee}
              onRemove={deleteEmployee}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={systemSettings}
              onUpdateSettings={setSystemSettings}
              customColumns={customColumns}
              onUpdateColumns={setCustomColumns}
              employees={enrichedEmployees}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
