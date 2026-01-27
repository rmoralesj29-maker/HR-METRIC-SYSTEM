import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../utils/settingsStore';
import { MonthlySickData, SystemSettings } from '../types';
import { Calendar, Save, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SickTracker: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [localData, setLocalData] = useState<MonthlySickData[]>([]);

  // Initialize data for the selected year
  useEffect(() => {
    const yearData = settings.sickDaysByYear?.[selectedYear];
    if (yearData) {
      setLocalData(yearData);
    } else {
      // Default empty months if year doesn't exist
      const defaults = [
        { month: 'Jan', value: 0 },
        { month: 'Feb', value: 0 },
        { month: 'Mar', value: 0 },
        { month: 'Apr', value: 0 },
        { month: 'May', value: 0 },
        { month: 'Jun', value: 0 },
        { month: 'Jul', value: 0 },
        { month: 'Aug', value: 0 },
        { month: 'Sep', value: 0 },
        { month: 'Oct', value: 0 },
        { month: 'Nov', value: 0 },
        { month: 'Dec', value: 0 },
      ];
      setLocalData(defaults);
    }
  }, [settings, selectedYear]);

  const handleValueChange = (index: number, val: string) => {
    const newValue = parseInt(val) || 0;
    const newData = [...localData];
    newData[index] = { ...newData[index], value: newValue };
    setLocalData(newData);
  };

  const saveChanges = async () => {
    const newSettings: SystemSettings = {
      ...settings,
      sickDaysByYear: {
        ...settings.sickDaysByYear,
        [selectedYear]: localData,
      },
    };
    await updateSettings(newSettings);
  };

  const totalSickDays = localData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Global Sick Tracker</h2>
          <p className="text-slate-500 text-sm">Track company-wide monthly sick day totals.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <Calendar size={16} className="text-slate-400" />
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent font-medium text-slate-700 outline-none"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                </select>
            </div>
            <button
                onClick={saveChanges}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
                <Save size={16} /> Save Changes
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Grid */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Monthly Totals</h3>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                    Total: {totalSickDays}
                </span>
            </div>
            <div className="divide-y divide-slate-100">
                {localData.map((item, index) => (
                    <div key={item.month} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-600 w-12">{item.month}</span>
                        <input
                            type="number"
                            min="0"
                            value={item.value || ''}
                            onChange={(e) => handleValueChange(index, e.target.value)}
                            className="w-full max-w-[100px] text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="0"
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                {selectedYear} Overview
            </h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={localData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sick Days" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};
