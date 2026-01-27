import React, { useMemo } from 'react';
import { Employee, SystemSettings } from '../types';
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
} from 'recharts';
import { StatCard } from './ui/StatCard';
import { Users, Clock, Thermometer } from 'lucide-react';
import { getDashboardStats } from '../utils/dashboardStats';
import { useGlobalContext } from '../utils/GlobalContext';
import { DrillDownModal } from './DrillDownModal';

interface DashboardProps {
  employees: Employee[];
  settings: SystemSettings;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

const GENDER_COLORS: Record<string, string> = {
  Male: '#8b5cf6',
  Female: '#ec4899',
};
const DEFAULT_GENDER_COLOR = '#94a3b8';

export const Dashboard: React.FC<DashboardProps> = ({ employees = [], settings }) => {
  const { asOfDate } = useGlobalContext();
  const [drillDownConfig, setDrillDownConfig] = React.useState<{ title: string; employees: Employee[] } | null>(null);

  const currentYear = asOfDate.getFullYear();
  const stats = useMemo(() => getDashboardStats(employees, settings, currentYear), [employees, settings, currentYear]);

  const handleDrillDown = (type: string, data: any) => {
    if (!data) return;
    const name = data.name || data.payload?.name;
    if (!name) return;

    let filtered: Employee[] = [];

    if (type === 'VR Rate') {
      filtered = employees.filter((e) => (e.vrRate || 'VR0') === name);
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
        const tenure = e.tenureMonths || 0;
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
      filtered = employees.filter((e) => e.languages && e.languages.includes(name));
    } else if (type === 'Country') {
      filtered = employees.filter((e) => (e.country || 'Unknown') === name);
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
    () => [
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
      { name: '<6m', value: employees.filter((e) => (e.tenureMonths || 0) < 6).length },
      { name: '6m-1y', value: employees.filter((e) => (e.tenureMonths || 0) >= 6 && (e.tenureMonths || 0) < 12).length },
      { name: '1y-2y', value: employees.filter((e) => (e.tenureMonths || 0) >= 12 && (e.tenureMonths || 0) < 24).length },
      { name: '2y-3y', value: employees.filter((e) => (e.tenureMonths || 0) >= 24 && (e.tenureMonths || 0) < 36).length },
      { name: '3y+', value: employees.filter((e) => (e.tenureMonths || 0) >= 36).length },
    ],
    [employees]
  );

  const genderData = useMemo(() => {
    const genderDist = employees.reduce((acc, emp) => {
      const gender = emp.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(genderDist).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const monthlySickDays = settings.sickDaysByYear[currentYear] || [];
  const totalSickDaysYTD = monthlySickDays.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const calculatedAvgSickDays = stats.totalEmployees > 0 ? (totalSickDaysYTD / stats.totalEmployees).toFixed(1) : 0;
  const averageTenureYears = (stats.averageTenureMonths / 12).toFixed(1);

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

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-white" size={24} />} title="Total Employees" value={stats.totalEmployees} color="bg-indigo-500" />
        <StatCard
          icon={<Thermometer className="text-white" size={24} />}
          title="Avg Sick Days"
          value={calculatedAvgSickDays}
          color="bg-rose-500"
        />
        <StatCard
          icon={<Clock className="text-white" size={24} />}
          title="Avg Tenure"
          value={`${averageTenureYears} Years`}
          color="bg-emerald-500"
        />
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VR Rate Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

        {/* Sick Days Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sick Days Trend ({currentYear})</h3>
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
            {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
          </div>
          <p className="text-xs text-slate-500 mt-2">Total sick days recorded: {totalSickDaysYTD}</p>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Demographics */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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

        {/* Tenure */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Experience / Tenure</h3>
          <div className="h-64">
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

        {/* Gender Diversity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
      </div>

      {/* Language Stats */}
      {settings.showLanguageStats && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
      )}

      {/* Country Stats */}
      {settings.showCountryStats && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
      )}

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
