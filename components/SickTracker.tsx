import React, { useState, useMemo } from 'react';
import { useVacationStore } from '../utils/vacationStore';
import { useEmployeeStore } from '../utils/employeeStore';
import { Vacation, Employee } from '../types';
import { formatEmployeeName } from '../utils/experience';
import { Plus, X, Search, Trash2, Edit } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';

export const SickTracker: React.FC = () => {
  const { vacations, addVacation, updateVacation, deleteVacation } = useVacationStore();
  const { employees } = useEmployeeStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleAddNew = () => setIsAdding(true);
  const handleEdit = (id: string) => setEditingId(id);
  const handleCloseModal = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? formatEmployeeName(emp) : 'Unknown Employee';
  };

  const filteredSickDays = vacations
    .filter(v => {
      const isSick = v.type === 'Sick';
      const empName = getEmployeeName(v.employeeId).toLowerCase();
      const matchesSearch = empName.includes(filter.toLowerCase());
      // Use string splitting for safer year extraction (YYYY-MM-DD)
      const matchesYear = parseInt(v.startDate.split('-')[0]) === selectedYear;
      return isSick && matchesSearch && matchesYear;
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Stats
  const sickDaysByMonth = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    filteredSickDays.forEach(v => {
      // Use string splitting for safer month extraction (YYYY-MM-DD)
      // Month is 0-indexed in Date, but 1-indexed in ISO string (01-12)
      // So '01' is Jan (index 0), '12' is Dec (index 11)
      const monthIndex = parseInt(v.startDate.split('-')[1]) - 1;
      const month = months[monthIndex];
      if (month) {
        monthCounts[month] = (monthCounts[month] || 0) + v.days;
      }
    });

    return months.map(m => ({ name: m, value: monthCounts[m] || 0 }));
  }, [filteredSickDays]);

  const topSickLeaveTakers = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSickDays.forEach(v => {
       const empName = getEmployeeName(v.employeeId);
       counts[empName] = (counts[empName] || 0) + v.days;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredSickDays, employees]);


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sick Tracker</h2>
          <p className="text-slate-500 text-sm">Manage and track employee sick days.</p>
        </div>
        <div className="flex gap-2">
            <select
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2.5"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
            </select>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors shadow-sm shadow-rose-200"
          >
            <Plus size={16} /> Log Sick Day
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sick Days by Month</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sickDaysByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
             {filteredSickDays.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Sick Leave Takers (Days)</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSickLeaveTakers} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                 <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="value" position="right" fill="#64748b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {filteredSickDays.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800">History</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search employee..."
                className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm transition-all placeholder-slate-400"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSickDays.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{getEmployeeName(v.employeeId)}</td>
                  <td className="px-6 py-4 text-slate-500">{v.startDate} <span className="text-slate-300">→</span> {v.endDate}</td>
                  <td className="px-6 py-4 text-slate-800 font-bold">{v.days}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit
                        ${v.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          v.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'}
                    `}>
                        {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button
                        onClick={() => handleEdit(v.id)}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 mr-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteVacation(v.id)}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                      >
                        <Trash2 size={16} />
                      </button>
                  </td>
                </tr>
              ))}
               {filteredSickDays.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-400" colSpan={5}>
                    No sick day records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isAdding || editingId) && (
        <SickModal
          vacation={editingId ? vacations.find(v => v.id === editingId) : undefined}
          onClose={handleCloseModal}
          onSave={(v) => {
            if (editingId) updateVacation(v);
            else addVacation(v);
            handleCloseModal();
          }}
          employees={employees}
        />
      )}
    </div>
  );
};

interface SickModalProps {
  vacation?: Vacation;
  onClose: () => void;
  onSave: (v: Vacation) => void;
  employees: Employee[];
}

const SickModal: React.FC<SickModalProps> = ({ vacation, onClose, onSave, employees }) => {
    const [formData, setFormData] = useState<Partial<Vacation>>(vacation || {
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: 1,
        type: 'Sick', // Default to Sick
        status: 'Approved', // Sick days usually just logged, default to Approved
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto calculate days
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };

        if (newData.startDate && newData.endDate) {
            const start = new Date(newData.startDate);
            const end = new Date(newData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            newData.days = diffDays > 0 ? diffDays : 1;
        }
        setFormData(newData);
    }

    const handleSubmit = () => {
        if (!formData.employeeId || !formData.startDate || !formData.endDate) return;

        onSave({
            id: vacation?.id || crypto.randomUUID(),
            employeeId: formData.employeeId!,
            startDate: formData.startDate!,
            endDate: formData.endDate!,
            days: Number(formData.days) || 0,
            type: 'Sick', // Enforce Sick type
            status: (formData.status as any) || 'Pending',
            notes: formData.notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">{vacation ? 'Edit Sick Record' : 'Log Sick Day'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
            </button>
            </div>

            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Employee</label>
                    <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                         className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                    >
                        <option value="">Select Employee</option>
                        {employees.map(e => (
                            <option key={e.id} value={e.id}>{formatEmployeeName(e)}</option>
                        ))}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleDateChange}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                         <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleDateChange}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Total Days</label>
                    <input
                        type="number"
                        name="days"
                        value={formData.days}
                        onChange={handleChange}
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none h-20 resize-none"
                    />
                </div>

            </div>

             <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
                >
                    Save Record
                </button>
            </div>
        </div>
        </div>
    )
}
