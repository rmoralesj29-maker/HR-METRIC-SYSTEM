
import React, { useState, useMemo, useEffect } from 'react';
import { processEmployee } from './utils/calculations';
import { Employee, Gender, SystemSettings, DEFAULT_SETTINGS, DEFAULT_COLUMNS, ColumnDefinition } from './types';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { Settings } from './components/Settings';
import { BirkirBot } from './components/BirkirBot';
import { LayoutDashboard, Users, Settings as SettingsIcon, LogOut } from 'lucide-react';

// DATA FROM SCREENSHOT
const initialEmployees: Employee[] = [
  { id: '1', name: 'Alina Miller', dob: '2002-06-20', startDate: '2025-05-09', previousExperienceMonths: 0, gender: Gender.Female, country: 'USA', languages: ['English'], role: 'Employee' },
  { id: '2', name: 'Anna Kvitová', dob: '1995-08-09', startDate: '2024-06-01', previousExperienceMonths: 0, gender: Gender.Female, country: 'Czech Republic', languages: ['Czech', 'English'], role: 'Employee' },
  { id: '3', name: 'Anthony Allen', dob: '1990-01-16', startDate: '2024-05-27', previousExperienceMonths: 0, gender: Gender.Male, country: 'USA', languages: ['English'], role: 'Manager' },
  { id: '4', name: 'Ari Karl', dob: '2005-04-14', startDate: '2025-04-30', previousExperienceMonths: 0, gender: Gender.NonBinary, country: 'Iceland', languages: ['Icelandic', 'English'], role: 'Intern' },
  { id: '5', name: 'Ben Massey', dob: '1999-04-09', startDate: '2024-10-29', previousExperienceMonths: 0, gender: Gender.Male, country: 'Canada', languages: ['English'], role: 'Employee' },
  { id: '6', name: 'Bríet Valdís Reeve', dob: '2008-07-23', startDate: '2024-12-27', previousExperienceMonths: 0, gender: Gender.Female, country: 'Iceland', languages: ['Icelandic', 'English'], role: 'Employee' },
  { id: '7', name: 'Cale Galbraith', dob: '2001-06-26', startDate: '2023-09-18', previousExperienceMonths: 0, gender: Gender.Male, country: 'USA', languages: ['English'], role: 'Employee' },
  { id: '8', name: 'Chantel Jones', dob: '1996-07-13', startDate: '2025-02-27', previousExperienceMonths: 0, gender: Gender.Female, country: 'USA', languages: ['English'], role: 'Employee' },
  { id: '9', name: 'Elijah Owens', dob: '1997-02-25', startDate: '2023-07-25', previousExperienceMonths: 0, gender: Gender.Male, country: 'USA', languages: ['English'], role: 'Employee' },
  { id: '10', name: 'Elisa Nina', dob: '2002-12-25', startDate: '2023-09-02', previousExperienceMonths: 0, gender: Gender.Female, country: 'Spain', languages: ['Spanish', 'English'], role: 'Employee' },
  { id: '11', name: 'Elvar Gapunay', dob: '2001-08-24', startDate: '2024-10-01', previousExperienceMonths: 0, gender: Gender.Male, country: 'Philippines', languages: ['Filipino', 'English'], role: 'Support' },
  { id: '12', name: 'Emil Baldursson', dob: '1998-09-04', startDate: '2025-05-20', previousExperienceMonths: 0, gender: Gender.Male, country: 'Iceland', languages: ['Icelandic', 'English'], role: 'Employee' },
  { id: '13', name: 'Emilía Áróra', dob: '2007-06-04', startDate: '2025-06-25', previousExperienceMonths: 0, gender: Gender.Female, country: 'Iceland', languages: ['Icelandic', 'English'], role: 'Employee' },
  { id: '14', name: 'Enrique Morales', dob: '1995-12-01', startDate: '2024-01-07', previousExperienceMonths: 0, gender: Gender.Male, country: 'Spain', languages: ['Spanish', 'English'], role: 'Manager' },
  { id: '15', name: 'Fabien Dambron', dob: '1985-05-15', startDate: '2024-06-07', previousExperienceMonths: 0, gender: Gender.Male, country: 'France', languages: ['French', 'English'], role: 'Senior' },
  { id: '16', name: 'Gareth Wild', dob: '1986-05-08', startDate: '2025-09-08', previousExperienceMonths: 24, gender: Gender.Male, country: 'UK', languages: ['English'], role: 'Senior' },
  { id: '17', name: 'Gloriousgospel Henry', dob: '2000-10-18', startDate: '2025-04-29', previousExperienceMonths: 0, gender: Gender.Female, country: 'Nigeria', languages: ['English'], role: 'Employee' },
  { id: '18', name: 'Herdis Davidsdottir', dob: '2008-04-04', startDate: '2023-06-05', previousExperienceMonths: 0, gender: Gender.Female, country: 'Iceland', languages: ['Icelandic', 'English'], role: 'Employee' },
  { id: '19', name: 'Iva Vladimirová', dob: '1998-04-30', startDate: '2024-01-25', previousExperienceMonths: 0, gender: Gender.Female, country: 'Slovakia', languages: ['Slovak', 'English'], role: 'HR' },
  { id: '20', name: 'Jack Bandak', dob: '2002-11-24', startDate: '2025-02-28', previousExperienceMonths: 0, gender: Gender.Male, country: 'Poland', languages: ['Polish', 'English'], role: 'Employee' },
  { id: '21', name: 'Jarred Stancil', dob: '1994-06-13', startDate: '2025-04-25', previousExperienceMonths: 24, gender: Gender.Male, country: 'USA', languages: ['English'], role: 'Senior' },
  { id: '22', name: 'Jasmín Luana', dob: '2002-09-07', startDate: '2025-04-26', previousExperienceMonths: 0, gender: Gender.Female, country: 'Brazil', languages: ['Portuguese', 'English'], role: 'Employee' },
  { id: '23', name: 'Laura Petrone', dob: '1996-12-20', startDate: '2024-12-16', previousExperienceMonths: 0, gender: Gender.Female, country: 'Italy', languages: ['Italian', 'English'], role: 'Employee' },
  { id: '24', name: 'Lucia Lara', dob: '2000-06-05', startDate: '2025-05-05', previousExperienceMonths: 0, gender: Gender.Female, country: 'Spain', languages: ['Spanish', 'English'], role: 'Employee' },
  { id: '25', name: 'Luz Medina', dob: '1996-04-27', startDate: '2023-06-15', previousExperienceMonths: 0, gender: Gender.Female, country: 'Mexico', languages: ['Spanish', 'English'], role: 'Employee' },
  { id: '26', name: 'Marieta Zderic', dob: '1999-09-04', startDate: '2024-10-01', previousExperienceMonths: 0, gender: Gender.Female, country: 'Croatia', languages: ['Croatian', 'English'], role: 'Employee' },
  { id: '27', name: 'Michael Hansen', dob: '1987-12-31', startDate: '2024-10-01', previousExperienceMonths: 0, gender: Gender.Male, country: 'Denmark', languages: ['Danish', 'English'], role: 'Manager' },
  { id: '28', name: 'Paola Tunarosa', dob: '2003-03-27', startDate: '2025-05-16', previousExperienceMonths: 0, gender: Gender.Female, country: 'Colombia', languages: ['Spanish', 'English'], role: 'Employee' },
  { id: '29', name: 'Rachel Ogimont', dob: '2001-08-09', startDate: '2025-06-28', previousExperienceMonths: 0, gender: Gender.Female, country: 'France', languages: ['French', 'English'], role: 'Employee' },
  { id: '30', name: 'Robin Schindfessel', dob: '2001-03-10', startDate: '2025-01-20', previousExperienceMonths: 0, gender: Gender.Male, country: 'Germany', languages: ['German', 'English'], role: 'Employee' },
  { id: '31', name: 'Roksana Owczarek', dob: '2003-09-02', startDate: '2023-06-20', previousExperienceMonths: 0, gender: Gender.Female, country: 'Poland', languages: ['Polish', 'English'], role: 'Employee' },
  { id: '32', name: 'Sophie Pietrzok', dob: '2000-07-11', startDate: '2023-06-12', previousExperienceMonths: 0, gender: Gender.Female, country: 'Poland', languages: ['Polish', 'English'], role: 'Employee' },
  { id: '33', name: 'Tiana Dusil', dob: '1999-09-04', startDate: '2025-09-04', previousExperienceMonths: 0, gender: Gender.Female, country: 'Czech Republic', languages: ['Czech', 'English'], role: 'Employee' },
  { id: '34', name: 'Zachary Owens', dob: '1996-06-03', startDate: '2024-11-02', previousExperienceMonths: 0, gender: Gender.Male, country: 'USA', languages: ['English'], role: 'Employee' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'settings'>('employees');
  const [showRaiseDueOnly, setShowRaiseDueOnly] = useState(false);

  // Persistence Logic for Employees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
        const saved = localStorage.getItem('etrack_employees');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure compatibility if types changed
            return parsed.map((e: any) => {
                const { sickDaysYTD, performanceRating, ...rest } = e; // Strip old fields
                return rest;
            });
        }
        return initialEmployees;
    } catch (e) {
        console.error("Failed to load employees from local storage", e);
        return initialEmployees;
    }
  });

  // Persistence Logic for Settings (DEEP MERGE FIX)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
        const saved = localStorage.getItem('etrack_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Deep merge to ensure nested objects like vrThresholds and arrays like monthlySickDays exist
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                vrThresholds: {
                    ...DEFAULT_SETTINGS.vrThresholds,
                    ...(parsed.vrThresholds || {})
                },
                monthlySickDays: Array.isArray(parsed.monthlySickDays) ? parsed.monthlySickDays : DEFAULT_SETTINGS.monthlySickDays
            };
        }
        return DEFAULT_SETTINGS;
    } catch (e) {
        console.error("Failed to load settings from local storage", e);
        return DEFAULT_SETTINGS;
    }
  });

  // Persistence Logic for Custom Columns
  const [customColumns, setCustomColumns] = useState<ColumnDefinition[]>(() => {
     try {
        const saved = localStorage.getItem('etrack_columns');
        return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
     } catch (e) {
        console.error("Failed to load columns from local storage", e);
        return DEFAULT_COLUMNS;
     }
  });

  // Save changes to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('etrack_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('etrack_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

   useEffect(() => {
    localStorage.setItem('etrack_columns', JSON.stringify(customColumns));
  }, [customColumns]);


  // Process data with logic respecting system settings
  const calculatedEmployees = useMemo(() => {
    return employees.map(emp => processEmployee(emp, systemSettings));
  }, [employees, systemSettings]);

  const displayedEmployees = useMemo(() => {
    if (showRaiseDueOnly) {
        return calculatedEmployees.filter(e => e.inRaiseWindow);
    }
    return calculatedEmployees;
  }, [calculatedEmployees, showRaiseDueOnly]);

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
  };

  const handleDashboardAlertClick = () => {
    setShowRaiseDueOnly(true);
    setActiveTab('employees');
  };

  const handleTabChange = (tab: 'dashboard' | 'employees' | 'settings') => {
    setActiveTab(tab);
    if (tab !== 'employees') setShowRaiseDueOnly(false);
  };

  return (
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => handleTabChange('employees')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'employees' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
          >
            <Users size={20} />
            <span className="font-medium">Employees</span>
          </button>

          <button 
            onClick={() => handleTabChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
          >
            <SettingsIcon size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 transition-colors">
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
                        <button onClick={() => setShowRaiseDueOnly(false)} className="hover:text-amber-950"><Users size={14}/></button>
                    </span>
                )}
              </h1>
              <p className="text-slate-500 mt-1">
                {activeTab === 'dashboard' ? 'Overview of HR metrics and analytics.' : 
                 activeTab === 'employees' ? 'Manage workforce details and records.' : 
                 'Configure system rules, fields, and export data.'}
              </p>
            </div>
            <div className="text-left md:text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <Dashboard 
                employees={calculatedEmployees} 
                settings={systemSettings} 
                onAlertClick={handleDashboardAlertClick}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeList 
              employees={displayedEmployees} 
              columns={customColumns}
              onUpdate={handleUpdateEmployee}
              onAdd={handleAddEmployee}
              onRemove={handleRemoveEmployee}
            />
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
