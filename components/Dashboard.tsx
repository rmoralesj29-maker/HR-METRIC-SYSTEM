import React, { useMemo } from 'react';
import { Employee, SystemSettings, DEFAULT_SETTINGS } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LabelList,
  LineChart,
  Line,
} from 'recharts';
import { StatCard } from './ui/StatCard';
import { Users, Clock, Thermometer, Calendar, UserCheck, Activity, UserMinus } from 'lucide-react';
import { getDashboardStats } from '../utils/dashboardStats';
import { useGlobalContext } from '../utils/GlobalContext';
import { DrillDownModal } from './DrillDownModal';

interface DashboardProps {
  employees: Employee[];
  settings: SystemSettings;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

const GENDER_COLORS: Record<string, string> = {
  Male: '#8b5cf6', // Purple
  Female: '#ec4899', // Pink
};
const DEFAULT_GENDER_COLOR = '#94a3b8';

export const WIDGET_TITLES: Record<string, string> = {
  workforce_status: 'Workforce Status Cards',
  main_stats: 'Key Metrics Cards',
  movement_chart: 'Workforce Movement',
  sick_days_trend: 'Sick Days Trend',
  vr_distribution: 'VR Rate Distribution',
  tenure_distribution: 'Experience / Tenure',
  age_demographics: 'Age Demographics',
  gender_diversity: 'Gender Diversity',
  language_stats: 'Spoken Languages',
  country_stats: 'Country Distribution',
};

export const Dashboard: React.FC<DashboardProps> = ({ employees = [], settings }) => {
  const { asOfDate, setAsOfDate } = useGlobalContext();
  const [drillDownConfig, setDrillDownConfig] = React.useState<{ title: string; employees: Employee[] } | null>(null);

  // Pass asOfDate to get correct stats for the selected point in time
  const stats = useMemo(() => getDashboardStats(employees, settings, asOfDate), [employees, settings, asOfDate]);

  const handleDrillDown = (type: string, data: any) => {
    if (!data) return;
    const name = data.name || data.payload?.name;
    if (!name) return;

    let filtered: Employee[] = [];

    if (type === 'VR Rate') {
      filtered = employees.filter((e) => (e.statusVR || 'VR0') === name);
    } else if (type === 'Age Group') {
      filtered = employees.filter((e) => {
        const age = e.age || 0;
        if (name === '<22') return age < 22;
        if (name === '22-29') return age >= 22 && age <= 29;
        if (name === '30-39') return age >= 30 && age <= 39;
        if (name === '40-49') return age >= 40 && age <= 49;
        if (name === '50+') return age >= 50;
        return false;
      });
    } else if (type === 'Tenure') {
      filtered = employees.filter((e) => {
        const tenure = e.totalExperienceMonths || 0;
        if (name === '<6m') return tenure < 6;
        if (name === '6m-1y') return tenure >= 6 && tenure < 12;
        if (name === '1y-2y') return tenure >= 12 && tenure < 24;
        if (name === '2y-3y') return tenure >= 24 && tenure < 36;
        if (name === '3y+') return tenure >= 36;
        return false;
      });
    } else if (type === 'Gender') {
      filtered = employees.filter((e) => (e.gender || 'Other') === name);
    } else if (type === 'Language') {
       filtered = employees.filter(e => e.languages && e.languages.includes(name));
    } else if (type === 'Country') {
       filtered = employees.filter(e => (e.country || 'Unknown') === name);
    }

    setDrillDownConfig({ title: `${type}: ${name}`, employees: filtered });
  };

  const vrData = useMemo(
    () =>
      ['VR0', 'VR1', 'VR2', 'VR3', 'VR4', 'VR5'].map((status) => ({
        name: status,
        value: stats.vrDistribution[status] || 0,
      })),
    [stats.vrDistribution]
  );

  const ageDist = useMemo(
    () =>
      [
        { name: '<22', value: stats.ageBuckets['<22'] },
        { name: '22-29', value: stats.ageBuckets['22-29'] },
        { name: '30-39', value: stats.ageBuckets['30-39'] },
        { name: '40-49', value: stats.ageBuckets['40-49'] },
        { name: '50+', value: stats.ageBuckets['50+'] },
      ],
    [stats.ageBuckets]
  );

  const tenureDist = useMemo(
    () => [
      { name: '<6m', value: stats.tenureBuckets['<6m'] },
      { name: '6m-1y', value: stats.tenureBuckets['6m-1y'] },
      { name: '1y-2y', value: stats.tenureBuckets['1y-2y'] },
      { name: '2y-3y', value: stats.tenureBuckets['2y-3y'] },
      { name: '3y+', value: stats.tenureBuckets['3y+'] },
    ],
    [stats.tenureBuckets]
  );

  const genderData = useMemo(() => {
    const genderDist = employees.reduce((acc, emp) => {
      const gender = emp.gender || 'Other';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genderDist).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const currentYear = asOfDate.getFullYear();

  // Get global sick days for the currently selected year
  const monthlySickDays = useMemo(() => {
    return settings.sickDaysByYear?.[currentYear] || [];
  }, [settings.sickDaysByYear, currentYear]);

  const totalSickDaysYTD = monthlySickDays.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const averageTenureYears = (stats.averageTotalExperienceMonths / 12).toFixed(1);

  const languageData = useMemo(() => {
    return Object.entries(stats.languageDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [stats.languageDistribution]);

  const countryData = useMemo(() => {
    const countryDist = employees.reduce((acc, emp) => {
      const country = emp.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(countryDist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [employees]);

  // Widget definitions using useMemo to avoid re-creating on every render
  // though typically React components inside should be stable or simple
  const widgets = {
      workforce_status: {
          span: 2,
          render: () => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<UserCheck className="text-white" size={24} />}
                    title="Active"
                    value={stats.workforceStatus.active}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={<Activity className="text-white" size={24} />}
                    title="Leaving"
                    value={stats.workforceStatus.leaving}
                    color="bg-amber-500"
                />
                <StatCard
                    icon={<UserMinus className="text-white" size={24} />}
                    title="Left"
                    value={stats.workforceStatus.left}
                    color="bg-slate-500"
                />
              </div>
          )
      },
      main_stats: {
          span: 2,
          render: () => (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Users className="text-white" size={24} />} title="Total Employees" value={stats.totalEmployees} color="bg-indigo-500" />
                <StatCard
                  icon={<Thermometer className="text-white" size={24} />}
                  title="Avg Sick Days"
                  value={stats.averageSickDays}
                  color="bg-rose-500"
                />
                <StatCard
                  icon={<Clock className="text-white" size={24} />}
                  title="Avg Tenure"
                  value={`${averageTenureYears} Years`}
                  color="bg-emerald-500"
                />
              </div>
          )
      },
      movement_chart: {
          span: 1,
          render: () => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Workforce Movement (Monthly)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyMovement}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                       <YAxis allowDecimals={false} />
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                       <Legend />
                       <Line type="monotone" dataKey="hires" name="Hires" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                       <Line type="monotone" dataKey="leavers" name="Leavers" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
          )
      },
      sick_days_trend: {
          span: 1,
          render: () => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="text-lg font-bold text-slate-800">Company Sick Days ({currentYear})</h3>
                   <span className="text-xs font-medium px-2 py-1 bg-rose-100 text-rose-700 rounded-full">Total: {totalSickDaysYTD}</span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySickDays}>
                      <defs>
                        <linearGradient id="colorSick" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSick)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  {monthlySickDays.length === 0 && <p className="text-center text-slate-400 text-sm mt-2">No sick day data for {currentYear}</p>}
                </div>
              </div>
          )
      },
      vr_distribution: {
          span: 1,
          render: () => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4">VR Rate Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vrData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={40} tick={{ fill: '#64748b' }} />
                      <Tooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(data) => handleDrillDown('VR Rate', data)} style={{ cursor: 'pointer' }}>
                        {vrData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList dataKey="value" position="right" fill="#64748b" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
                </div>
              </div>
          )
      },
      tenure_distribution: {
          span: 1,
          render: () => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Experience / Tenure</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tenureDist}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} onClick={(data) => handleDrillDown('Tenure', data)} style={{ cursor: 'pointer' }} />
                    </BarChart>
                  </ResponsiveContainer>
                  {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
                </div>
              </div>
          )
      },
      age_demographics: {
          span: 1,
          render: () => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Age Demographics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ageDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(data) => handleDrillDown('Age Group', data)} style={{ cursor: 'pointer' }}>
                        {ageDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
                </div>
              </div>
          )
      },
      gender_diversity: {
          span: 1,
          render: () => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Gender Diversity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        onClick={(data) => handleDrillDown('Gender', data)}
                        style={{ cursor: 'pointer' }}
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name] || DEFAULT_GENDER_COLOR} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
                </div>
              </div>
          )
      },
      language_stats: {
          span: 2,
          render: () => {
              if (!settings.showLanguageStats) return null;
              return (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Spoken Languages</h3>
                  <div style={{ height: Math.max(languageData.length * 50, 256) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={languageData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(data) => handleDrillDown('Language', data)} style={{ cursor: 'pointer' }}>
                          {languageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                          <LabelList dataKey="value" position="right" fill="#64748b" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
                    {languageData.length === 0 && stats.totalEmployees > 0 && (
                      <p className="text-center text-slate-400 text-sm mt-2">No language data available</p>
                    )}
                  </div>
                </div>
              );
          }
      },
      country_stats: {
          span: 2,
          render: () => {
              if (!settings.showCountryStats) return null;
              return (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Employee Distribution by Country</h3>
                  <div style={{ height: Math.max(countryData.length * 50, 256) }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countryData} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={(data) => handleDrillDown('Country', data)} style={{ cursor: 'pointer' }}>
                          {countryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                          <LabelList dataKey="value" position="right" fill="#64748b" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
                  </div>
                </div>
              );
          }
      },
  };

  // Determine order
  const orderedWidgets = useMemo(() => {
      const savedOrder = settings.dashboardWidgetOrder || DEFAULT_SETTINGS.dashboardWidgetOrder || [];
      const allWidgetIds = Object.keys(widgets);
      // Append any missing widgets
      const missingWidgets = allWidgetIds.filter(id => !savedOrder.includes(id));
      return [...savedOrder, ...missingWidgets];
  }, [settings.dashboardWidgetOrder]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Global As Of Date Control */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                  <Calendar size={20} />
              </div>
              <div>
                  <h2 className="text-sm font-bold text-slate-700">As of Date</h2>
                  <p className="text-xs text-slate-500">All metrics calculated relative to this date</p>
              </div>
          </div>
          <input
              type="date"
              value={asOfDate.toISOString().split('T')[0]}
              onChange={(e) => setAsOfDate(new Date(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orderedWidgets.map(id => {
              const widget = widgets[id as keyof typeof widgets];
              if (!widget) return null;
              const content = widget.render();
              if (!content) return null;

              return (
                  <div key={id} className={widget.span === 2 ? 'lg:col-span-2' : 'lg:col-span-1'}>
                      {content}
                  </div>
              );
          })}
      </div>

      {drillDownConfig && (
        <DrillDownModal
          title={drillDownConfig.title}
          employees={drillDownConfig.employees}
          onClose={() => setDrillDownConfig(null)}
        />
      )}
    </div>
  );
};
