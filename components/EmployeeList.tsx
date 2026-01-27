import React, { useState, useEffect } from 'react';
import { Employee, ColumnDefinition, VRRate, Gender } from '../types';
import { Edit, Plus, X, Save, Trash2, Search, Info, Calendar } from 'lucide-react';
import { formatEmployeeName } from '../utils/experience';
import { LanguageInput } from './LanguageInput';

interface EmployeeListProps {
  employees: Employee[];
  columns: ColumnDefinition[];
  onUpdate: (employee: Employee) => void;
  onAdd: (employee: Partial<Employee>) => void;
  onRemove: (id: string) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, columns, onUpdate, onAdd, onRemove }) => {
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEmployees = employees
    .filter((e) => {
      const fullName = formatEmployeeName(e).toLowerCase();
      return fullName.includes(filter.toLowerCase()) || e.role.toLowerCase().includes(filter.toLowerCase());
    })
    .sort((a, b) => formatEmployeeName(a).localeCompare(formatEmployeeName(b)));

  const handleEditClick = (id: string) => {
    setEditingId(id);
  };

  const handleCloseEdit = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAddNewClick = () => {
    setIsAdding(true);
  };

  const getCustomValue = (emp: Employee, colId: string) => {
    return emp.customFields?.[colId] ?? '-';
  };

  const EMPTY_EMPLOYEE: Partial<Employee> = {
    firstName: '',
    lastName: '',
    gender: 'Unspecified',
    country: '',
    role: '',
    vrRate: 'VR0',
    dateOfBirth: '',
    startDate: new Date().toISOString().split('T')[0],
    performanceRating: 3,
    languages: [],
    status: 'Active',
    customFields: {},
  };

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deletingId) setDeletingId(null);
        else if (editingId || isAdding) handleCloseEdit();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [deletingId, editingId, isAdding]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Employee Directory</h2>
            <p className="text-slate-500 text-sm">Manage employee records and details.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or role..."
                className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all placeholder-slate-400"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Tenure</th>
                {columns
                  .filter((c) => !c.isSystem)
                  .map((col) => (
                    <th key={col.id} className="px-6 py-4 text-indigo-600">
                      {col.label}
                    </th>
                  ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                        {formatEmployeeName(employee)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2) || '??'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{formatEmployeeName(employee)}</div>
                        <div className="text-xs text-slate-500">{employee.role} • {employee.country}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{employee.languages.join(', ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit ${
                          employee.gender === 'Male'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : employee.gender === 'Female'
                            ? 'bg-pink-50 text-pink-700 border-pink-100'
                            : 'bg-slate-50 text-slate-700 border-slate-100'
                        }`}
                      >
                        {employee.gender}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 w-fit">
                        {employee.vrRate}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        <Info size={12} /> Perf: {employee.performanceRating || 3}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">Start: {employee.startDate}</div>
                    <div className="text-xs text-slate-500">DOB: {employee.dateOfBirth} ({employee.age ?? '-'}y)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-600">
                        <span className="font-bold text-slate-800">{employee.tenureMonths?.toFixed(1) || 0} mo</span>
                      </span>
                    </div>
                  </td>
                  {columns
                    .filter((c) => !c.isSystem)
                    .map((col) => (
                      <td key={col.id} className="px-6 py-4 text-slate-600">
                        {getCustomValue(employee, col.id)}
                      </td>
                    ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditClick(employee.id)}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                        title="Edit employee"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(employee.id)}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
                        title="Delete employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-400" colSpan={columns.length + 5}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingId && (
        <EditEmployeeModal
          employee={employees.find((e) => e.id === editingId)!}
          columns={columns}
          onClose={handleCloseEdit}
          onSave={(updated) => {
            onUpdate(updated);
            handleCloseEdit();
          }}
          title="Edit Employee Details"
        />
      )}

      {isAdding && (
        <EditEmployeeModal
          employee={EMPTY_EMPLOYEE as Employee}
          columns={columns}
          onClose={handleCloseEdit}
          onSave={(newEmp) => {
            onAdd(newEmp);
            handleCloseEdit();
          }}
          title="Add New Employee"
          isNew
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Employee?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone and will remove them from all metrics.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingId) {
                    setIsDeleting(true);
                    onRemove(deletingId);
                    setIsDeleting(false);
                    setDeletingId(null);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface EditEmployeeModalProps {
  employee: Employee;
  columns: ColumnDefinition[];
  onClose: () => void;
  onSave: (emp: Employee) => void;
  title?: string;
  isNew?: boolean;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, columns, onClose, onSave, title, isNew }) => {
  const [formData, setFormData] = useState<Employee>({ ...employee });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'performanceRating' ? Number(value) : value,
    }));
  };

  const handleCustomChange = (colId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [colId]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.startDate || !formData.role) {
      setError('Please fill in first name, last name, dates, and role.');
      return;
    }

    const cleaned: Employee = {
      ...formData,
      id: isNew ? crypto.randomUUID() : formData.id,
      performanceRating: Math.min(5, Math.max(1, Number(formData.performanceRating) || 3)),
    };

    onSave(cleaned);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-slate-800">{title || 'Edit Employee Details'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Unspecified">Unspecified</option>
                </select>
              </div>
              <div>
                <label htmlFor="country" className="block text-xs font-medium text-slate-500 mb-1">Country</label>
                <input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider border-t border-slate-100 pt-4">Role & Employment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-xs font-medium text-slate-500 mb-1">Job Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="">Select Role</option>
                  <option value="Employee">Employee</option>
                  <option value="MR">MR</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar size={10} /> Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="vrRate" className="block text-xs font-medium text-slate-500 mb-1">VR Rate</label>
                <select
                  id="vrRate"
                  name="vrRate"
                  value={formData.vrRate}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="VR0">VR0</option>
                  <option value="VR1">VR1</option>
                  <option value="VR2">VR2</option>
                  <option value="VR3">VR3</option>
                  <option value="VR4">VR4</option>
                  <option value="VR5">VR5</option>
                </select>
              </div>
              <div>
                <label htmlFor="performanceRating" className="block text-xs font-medium text-slate-500 mb-1">Performance Rating (1-5)</label>
                <input
                  id="performanceRating"
                  type="number"
                  min={1}
                  max={5}
                  name="performanceRating"
                  value={formData.performanceRating || 3}
                  onChange={handleChange}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Languages</label>
                <LanguageInput
                  value={formData.languages}
                  onChange={(langs) => setFormData((prev) => ({ ...prev, languages: langs }))}
                />
              </div>
            </div>
          </div>

          {columns.filter((c) => !c.isSystem).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wider border-t border-indigo-100 pt-4">Custom Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns
                  .filter((c) => !c.isSystem)
                  .map((col) => (
                    <div key={col.id}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{col.label}</label>
                      <input
                        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                        value={(formData.customFields?.[col.id] as string) || ''}
                        onChange={(e) => handleCustomChange(col.id, e.target.value)}
                        className="w-full bg-indigo-50/30 text-slate-900 border border-indigo-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
