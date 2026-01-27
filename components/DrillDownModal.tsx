import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Employee } from '../types';
import { formatEmployeeName } from '../utils/experience';

interface DrillDownModalProps {
  title: string;
  employees: Employee[];
  onClose: () => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ title, employees, onClose }) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{employees.length} Employees found</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-auto p-6">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">VR Rate</th>
                <th className="px-4 py-3">Tenure</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{formatEmployeeName(emp)}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.role}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {emp.vrRate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{emp.tenureMonths?.toFixed(1) || 0} mo</td>
                  <td className="px-4 py-3 text-slate-500">{emp.age}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.country}</td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-slate-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
