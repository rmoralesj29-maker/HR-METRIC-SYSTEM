import React, { useState, useMemo } from 'react';
import { useVacationStore } from '../utils/vacationStore';
import { useEmployeeStore } from '../utils/employeeStore';
import { Vacation, Employee } from '../types';
import { formatEmployeeName } from '../utils/experience';
import { Plus, X, Calendar, Search, Trash2, Edit } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

export const Vacations: React.FC = () => {
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

  const filteredVacations = vacations
    .filter(v => {
      const empName = getEmployeeName(v.employeeId).toLowerCase();
      const matchesSearch = empName.includes(filter.toLowerCase()) || v.type.toLowerCase().includes(filter.toLowerCase());
      const matchesYear = new Date(v.startDate).getFullYear() === selectedYear;
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Stats
  const vacationsByMonth = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    filteredVacations.forEach(v => {
      const date = new Date(v.startDate);
      const month = months[date.getMonth()];
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    return months.map(m => ({ name: m, value: monthCounts[m] || 0 }));
  }, [filteredVacations]);

  const topVacationTakers = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVacations.forEach(v => {
       const empName = getEmployeeName(v.employeeId);
       counts[empName] = (counts[empName] || 0) + v.days;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredVacations, employees]);


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vacation Tracker</h2>
          <p className="text-slate-500 text-sm">Manage and track employee time off.</p>
        </div>
        <div className="flex gap-2">
            <select
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
            </select>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={16} /> Log Vacation
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Vacations by Month</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vacationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
             {vacations.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Vacation Takers (Days)</h3>
           <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVacationTakers} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                 <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="value" position="right" fill="#64748b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {vacations.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
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
                className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all placeholder-slate-400"
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
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVacations.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{getEmployeeName(v.employeeId)}</td>
                  <td className="px-6 py-4 text-slate-500">{v.startDate} <span className="text-slate-300">→</span> {v.endDate}</td>
                  <td className="px-6 py-4 text-slate-800 font-bold">{v.days}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit
                        ${v.type === 'Sick' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          v.type === 'Vacation' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-700 border-slate-100'}
                     `}>
                        {v.type}
                     </span>
                  </td>
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
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100 mr-1"
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
               {filteredVacations.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-400" colSpan={6}>
                    No vacation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isAdding || editingId) && (
        <VacationModal
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

interface VacationModalProps {
  vacation?: Vacation;
  onClose: () => void;
  onSave: (v: Vacation) => void;
  employees: Employee[];
}

const VacationModal: React.FC<VacationModalProps> = ({ vacation, onClose, onSave, employees }) => {
    const [formData, setFormData] = useState<Partial<Vacation>>(vacation || {
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: 1,
        type: 'Vacation',
        status: 'Pending',
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
            type: (formData.type as any) || 'Vacation',
            status: (formData.status as any) || 'Pending',
            notes: formData.notes
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800">{vacation ? 'Edit Vacation' : 'Log Vacation'}</h3>
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
                         className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
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
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                         <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleDateChange}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            <option value="Vacation">Vacation</option>
                            <option value="Sick">Sick</option>
                            <option value="Personal">Personal</option>
                             <option value="Other">Other</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
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
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                    Save Record
                </button>
            </div>
        </div>
        </div>
    )
}
