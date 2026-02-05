import React, { useMemo, useState } from 'react';
import { Employee, SystemSettings } from '../types';
import { formatEmployeeName } from '../utils/experience';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Search, Calendar, Filter } from 'lucide-react';

interface OffboardingProps {
  employees: Employee[];
  settings: SystemSettings;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export const Offboarding: React.FC<OffboardingProps> = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter employees: Leaving or Left
  const relevantEmployees = useMemo(() => {
    return employees.filter(e => e.employmentStatus === 'leaving' || e.employmentStatus === 'left');
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return relevantEmployees.filter(e => {
        const nameMatch = formatEmployeeName(e).toLowerCase().includes(searchTerm.toLowerCase());
        const reasonMatch = reasonFilter === 'All' || (e.leaveReason || 'Other') === reasonFilter;

        let dateMatch = true;
        if (e.leaveDate) {
            const leave = new Date(e.leaveDate);
            if (startDate) dateMatch = dateMatch && leave >= new Date(startDate);
            if (endDate) dateMatch = dateMatch && leave <= new Date(endDate);
        }

        return nameMatch && reasonMatch && dateMatch;
    }).sort((a, b) => {
        // Sort by leave date desc
        return (new Date(b.leaveDate || 0).getTime() - new Date(a.leaveDate || 0).getTime());
    });
  }, [relevantEmployees, searchTerm, reasonFilter, startDate, endDate]);

  // Analytics
  // Leavers by month (Trend)
  const leaversByMonth = useMemo(() => {
      const data: Record<string, number> = {};
      filteredEmployees.forEach(e => {
          if (e.leaveDate) {
              const date = new Date(e.leaveDate);
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              data[key] = (data[key] || 0) + 1;
          }
      });
      return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredEmployees]);

  // Reasons distribution
  const reasonsData = useMemo(() => {
      const data: Record<string, number> = {};
      filteredEmployees.forEach(e => {
          const reason = e.leaveReason || 'Not Specified';
          data[reason] = (data[reason] || 0) + 1;
      });
      return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredEmployees]);

  // Unique reasons for filter
  const allReasons = useMemo(() => {
      const reasons = new Set<string>();
      relevantEmployees.forEach(e => {
          if (e.leaveReason) reasons.add(e.leaveReason);
      });
      return Array.from(reasons);
  }, [relevantEmployees]);

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Leavers Trend</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={leaversByMonth}
                            onClick={(data) => {
                                if (data && data.activePayload && data.activePayload.length > 0) {
                                    const payload = data.activePayload[0].payload;
                                    const [year, month] = payload.name.split('-').map(Number);
                                    const start = new Date(year, month - 1, 1);
                                    const end = new Date(year, month, 0);

                                    // Adjust for timezone offset to ensure correct YYYY-MM-DD string
                                    const toDateString = (date: Date) => {
                                        const offset = date.getTimezoneOffset() * 60000;
                                        return new Date(date.getTime() - offset).toISOString().split('T')[0];
                                    };

                                    setStartDate(toDateString(start));
                                    setEndDate(toDateString(end));
                                }
                            }}
                            className="cursor-pointer"
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {leaversByMonth.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data available</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Reasons for Leaving</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={reasonsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                onClick={(data) => {
                                    if (data && data.name) {
                                        setReasonFilter(data.name);
                                    }
                                }}
                                className="cursor-pointer outline-none"
                            >
                                {reasonsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                        </PieChart>
                    </ResponsiveContainer>
                    {reasonsData.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data available</p>}
                </div>
            </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Offboarding & Ex-Employees</h2>
                    <p className="text-slate-500 text-sm">Manage departures and exit data.</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <select
                        value={reasonFilter}
                        onChange={(e) => setReasonFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">All Reasons</option>
                        {allReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2">
                        <span className="text-xs text-slate-400 font-medium">From</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent py-2 text-sm focus:outline-none w-32"
                        />
                    </div>
                     <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2">
                        <span className="text-xs text-slate-400 font-medium">To</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent py-2 text-sm focus:outline-none w-32"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-medium">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Start Date</th>
                            <th className="px-6 py-4">Leave Date</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {formatEmployeeName(employee)}
                                    <div className="text-xs text-slate-500 font-normal">{employee.role}</div>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit ${
                                          (employee.employmentStatus === 'leaving') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                          'bg-slate-100 text-slate-500 border-slate-200'
                                      }`}>
                                          {employee.employmentStatus === 'leaving' ? 'Leaving' : 'Left'}
                                      </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{employee.startDate}</td>
                                <td className="px-6 py-4 text-slate-600">{employee.leaveDate || '-'}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {employee.leaveReason ? (
                                        <span className="inline-flex px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs">
                                            {employee.leaveReason}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={employee.leaveNotes || ''}>
                                    {employee.leaveNotes || '-'}
                                </td>
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                    No records found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
