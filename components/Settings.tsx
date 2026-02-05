import React, { useState, useEffect } from 'react';
import { SystemSettings, ColumnDefinition, Employee, DEFAULT_SETTINGS } from '../types';
import { Plus, Trash2, Download, Upload, Table, Settings as SettingsIcon, Layout, Database, List, X, GripVertical, Save } from 'lucide-react';
import { storage } from '../utils/storage';
import { useToast } from '../utils/ToastContext';
import { WIDGET_TITLES } from './Dashboard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  customColumns: ColumnDefinition[];
  onUpdateColumns: (columns: ColumnDefinition[]) => void;
  employees: Employee[];
}

interface ListEditorProps {
  title: string;
  items: string[];
  onUpdate: (items: string[]) => void;
  placeholder?: string;
}

const ListEditor: React.FC<ListEditorProps> = ({ title, items, onUpdate, placeholder }) => {
  const [newItem, setNewItem] = useState('');
  const { showToast } = useToast();

  const handleAdd = () => {
    if (!newItem.trim()) return;
    const normalized = newItem.trim();
    // Check duplicates (case insensitive)
    if (items.some(i => i.toLowerCase() === normalized.toLowerCase())) {
        showToast('Item already exists', 'error');
        return;
    }
    onUpdate([...items, normalized].sort());
    setNewItem('');
  };

  const handleRemove = (itemToRemove: string) => {
    onUpdate(items.filter(i => i !== itemToRemove));
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <h3 className="text-sm font-bold text-slate-800 mb-3">{title}</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center w-10"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 shadow-sm">
            {item}
            <button onClick={() => handleRemove(item)} className="text-slate-400 hover:text-rose-500 ml-1">
              <X size={14} />
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-sm text-slate-400 italic">No items defined.</span>}
      </div>
    </div>
  );
};

interface SortableItemProps {
  id: string;
  title: string;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, title }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-4 mb-2 shadow-sm touch-none select-none"
    >
      <div {...listeners} {...attributes} className="cursor-grab text-slate-400 hover:text-indigo-600 outline-none">
        <GripVertical size={20} />
      </div>
      <span className="font-medium text-slate-700">{title}</span>
    </div>
  );
};

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  customColumns,
  onUpdateColumns,
  employees,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'columns' | 'data' | 'dropdowns' | 'layout'>('rules');
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<'text' | 'number' | 'date'>('text');
  const { showToast } = useToast();

  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  useEffect(() => {
     if (settings.dashboardWidgetOrder && settings.dashboardWidgetOrder.length > 0) {
         setWidgetOrder(settings.dashboardWidgetOrder);
     } else {
         setWidgetOrder(DEFAULT_SETTINGS.dashboardWidgetOrder || []);
     }
  }, [settings.dashboardWidgetOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveLayout = () => {
      setIsSavingLayout(true);
      try {
          onUpdateSettings({ ...settings, dashboardWidgetOrder: widgetOrder });
          showToast('Dashboard layout saved successfully', 'success');
      } catch (e) {
          showToast('Failed to save layout', 'error');
      } finally {
          setIsSavingLayout(false);
      }
  };

  const handleRuleChange = (key: keyof SystemSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleDropdownChange = (key: 'countries' | 'languages', newItems: string[]) => {
      onUpdateSettings({
          ...settings,
          dropdownOptions: {
              ...settings.dropdownOptions,
              [key]: newItems
          }
      });
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

  const handleExportCSV = () => {
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
      'Total Experience (Mo)',
      'VR Rate',
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
      e.totalExperienceMonths,
      e.statusVR,
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

  const handleBackupJSON = () => {
    const jsonString = storage.exportAllData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hr_system_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Backup created successfully', 'success');
  };

  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (confirm('Are you sure? This will overwrite all current data with the backup.')) {
            const success = storage.importAllData(content);
            if (success) {
                showToast('Data restored successfully. Reloading...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast('Failed to restore data. Invalid file format.', 'error');
            }
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
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
            <SettingsIcon size={18} /> Rules & Config
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'layout' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Layout size={18} /> Dashboard Layout
          </button>
          <button
            onClick={() => setActiveTab('dropdowns')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dropdowns' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <List size={18} /> Dropdown Options
          </button>
          <button
            onClick={() => setActiveTab('columns')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'columns' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Table size={18} /> Data Fields
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'data' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Database size={18} /> Data Management
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

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adult Age Threshold</label>
                  <input
                    type="number"
                    value={settings.adultAgeThreshold}
                    onChange={(e) => handleRuleChange('adultAgeThreshold', parseInt(e.target.value))}
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-1">Age where "Adult" logic applies.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
            <div className="max-w-2xl space-y-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Dashboard Layout</h2>
                        <p className="text-slate-500">Drag and drop items to reorder the dashboard widgets.</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                     <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={widgetOrder}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                             {widgetOrder.map((id) => (
                               <SortableItem key={id} id={id} title={WIDGET_TITLES[id] || id} />
                             ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSaveLayout}
                        disabled={isSavingLayout}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSavingLayout ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'dropdowns' && (
          <div className="max-w-3xl space-y-8">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Dropdown Options</h2>
                <p className="text-slate-500">Manage the list options available in forms (Countries, Languages).</p>
             </div>

             <ListEditor
                title="Countries List"
                items={settings.dropdownOptions?.countries || []}
                onUpdate={(items) => handleDropdownChange('countries', items)}
                placeholder="Add new country..."
             />

             <ListEditor
                title="Languages List"
                items={settings.dropdownOptions?.languages || []}
                onUpdate={(items) => handleDropdownChange('languages', items)}
                placeholder="Add new language..."
             />
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="max-w-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Schema</h2>
              <p className="text-slate-500">Add or remove columns from the employee database.</p>
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

        {activeTab === 'data' && (
          <div className="max-w-2xl space-y-8">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Data Management</h2>
                 <p className="text-slate-500">Export your data for backup or import to restore from a previous point.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export CSV */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Table size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Employee List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-4">Download a spreadsheet of all employees.</p>
                    <button onClick={handleExportCSV} className="mt-auto w-full bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                 {/* Backup JSON */}
                 <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <Database size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Full Backup (JSON)</h3>
                    <p className="text-slate-500 text-sm mb-4">Save all app data (Employees, Settings, Sick Days).</p>
                    <button onClick={handleBackupJSON} className="mt-auto w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <Download size={16} /> Backup JSON
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
                 <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
                             <Upload size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Restore from Backup</h3>
                            <p className="text-slate-600 text-sm mb-4">
                                Import a previously saved JSON backup file. <br/>
                                <strong className="text-rose-600">Warning: This will overwrite all current data.</strong>
                            </p>
                            <label className="inline-flex cursor-pointer bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-lg font-medium hover:bg-amber-100 transition-colors items-center gap-2">
                                <Upload size={16} /> Select Backup File
                                <input type="file" accept=".json" onChange={handleRestoreJSON} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
