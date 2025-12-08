import React, { useState } from 'react';
import { SystemSettings, ColumnDefinition, Employee } from '../types';
import { Plus, Trash2, Download, Table, Settings as SettingsIcon, Layout, Thermometer } from 'lucide-react';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  customColumns: ColumnDefinition[];
  onUpdateColumns: (columns: ColumnDefinition[]) => void;
  employees: Employee[];
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  customColumns,
  onUpdateColumns,
  employees,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'columns' | 'export' | 'sickdays'>('rules');
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<'text' | 'number' | 'date'>('text');

  const handleRuleChange = (key: keyof SystemSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleVRThresholdChange = (key: keyof SystemSettings['vrThresholds'], value: number) => {
    onUpdateSettings({
      ...settings,
      vrThresholds: { ...settings.vrThresholds, [key]: value },
    });
  };

  const handleSickDayChange = (index: number, value: number) => {
    const newSickDays = [...settings.monthlySickDays];
    newSickDays[index].value = value;
    onUpdateSettings({ ...settings, monthlySickDays: newSickDays });
  };

  const handleAddColumn = () => {
    if (!newColLabel.trim()) return;
    const newId = newColLabel.toLowerCase().replace(/\s+/g, '_');
    const newCol: ColumnDefinition = {
      id: newId,
      label: newColLabel,
      type: newColType,
      isSystem: false,
    };
    onUpdateColumns([...customColumns, newCol]);
    setNewColLabel('');
  };

  const handleRemoveColumn = (id: string) => {
    onUpdateColumns(customColumns.filter((c) => c.id !== id));
  };

  const handleExport = () => {
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Role',
      'Country',
      'Languages',
      'DOB',
      'Start Date',
      'Gender',
      'Prev Exp (Mo)',
      'Total Experience (Mo)',
      'VR Rate',
      'In Raise Window',
      'Months To Next Raise',
      ...customColumns.filter((c) => !c.isSystem).map((c) => c.label),
    ];

    const rows = employees.map((e) => [
      e.id,
      e.firstName,
      e.lastName,
      e.role,
      e.country,
      e.languages.join(', '),
      e.dateOfBirth,
      e.startDate,
      e.gender,
      e.previousExperienceMonths,
      e.totalExperienceMonths,
      e.statusVR,
      e.inRaiseWindow ? 'Yes' : 'No',
      e.monthsToNextRaise ?? 'Max',
      ...customColumns.filter((c) => !c.isSystem).map((c) => e.customFields?.[c.id] || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employees_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[600px] flex flex-col md:flex-row overflow-hidden animate-fade-in">
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Configuration</h3>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('rules')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'rules' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <SettingsIcon size={18} /> Rules & Formulas
          </button>
          <button
            onClick={() => setActiveTab('sickdays')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'sickdays' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Thermometer size={18} /> Sick Days Tracker
          </button>
          <button
            onClick={() => setActiveTab('columns')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'columns' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Table size={18} /> Data Fields
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'export' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Download size={18} /> Export
          </button>
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'rules' && (
          <div className="space-y-8 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">System Rules</h2>
              <p className="text-slate-500">Modify the business logic that drives calculations across the app.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Layout size={18} className="text-indigo-600" /> Dashboard Configuration
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.showCountryStats}
                      onChange={(e) => handleRuleChange('showCountryStats', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 bg-white"
                    />
                    <span className="text-sm font-medium text-slate-700">Show Country Analytics</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.showLanguageStats}
                      onChange={(e) => handleRuleChange('showLanguageStats', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 bg-white"
                    />
                    <span className="text-sm font-medium text-slate-700">Show Language Analytics</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adult Age Threshold</label>
                  <input
                    type="number"
                    value={settings.adultAgeThreshold}
                    onChange={(e) => handleRuleChange('adultAgeThreshold', parseInt(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">Age where "Adult" VR logic applies (skips 6mo bump).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Raise Alert Window (Days)</label>
                  <input
                    type="number"
                    value={settings.raiseWindowDays}
                    onChange={(e) => handleRuleChange('raiseWindowDays', parseInt(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">Days before a raise to show alert.</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">VR Experience Thresholds (Months)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(Object.keys(settings.vrThresholds) as Array<keyof SystemSettings['vrThresholds']>).map((key) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">{key}</label>
                      <input
                        type="number"
                        value={settings.vrThresholds[key]}
                        onChange={(e) => handleVRThresholdChange(key, parseInt(e.target.value))}
                        className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sickdays' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Monthly Sick Days</h2>
              <p className="text-slate-500">Manually input the total number of sick days recorded for the company each month. This data populates the "Sick Days Overview" chart on the dashboard.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {settings.monthlySickDays.map((data, index) => (
                  <div key={data.month} className="p-4 border-b border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors">
                    <label className="block text-xs font-bold text-indigo-600 mb-2 uppercase">{data.month}</label>
                    <div className="relative">
                      <Thermometer size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        value={data.value}
                        onChange={(e) => handleSickDayChange(index, parseInt(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Schema</h2>
              <p className="text-slate-500">Add or remove columns from the employee database. New fields will appear in the dashboard and employee list.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
              <h4 className="text-sm font-bold text-slate-800 mb-3">Add New Column</h4>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Column Label</label>
                  <input
                    type="text"
                    value={newColLabel}
                    onChange={(e) => setNewColLabel(e.target.value)}
                    placeholder="e.g. Department, T-Shirt Size"
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Data Type</label>
                  <select
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as any)}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColLabel}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Field
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-3">Active Columns</h4>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-medium text-slate-500">Label</th>
                      <th className="px-6 py-3 font-medium text-slate-500">ID</th>
                      <th className="px-6 py-3 font-medium text-slate-500">Type</th>
                      <th className="px-6 py-3 font-medium text-slate-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customColumns.map((col) => (
                      <tr key={col.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{col.label}</td>
                        <td className="px-6 py-3 text-slate-500 font-mono text-xs">{col.id}</td>
                        <td className="px-6 py-3 text-slate-500 capitalize">{col.type}</td>
                        <td className="px-6 py-3 text-right">
                          {!col.isSystem && (
                            <button
                              onClick={() => handleRemoveColumn(col.id)}
                              className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-full transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                          {col.isSystem && <span className="text-xs text-slate-400 italic">System</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Export Data</h2>
            <p className="text-slate-500 mb-8">Download a complete CSV file of all employee records, including system calculated fields and your custom columns.</p>

            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Table size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">All Employee Records</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Contains {employees.length} rows with {20 + customColumns.filter((c) => !c.isSystem).length} columns of data.</p>

              <button onClick={handleExport} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto">
                <Download size={20} /> Download CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
