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
import { Users, AlertCircle, Clock, Thermometer } from 'lucide-react';
import { getDashboardStats } from '../utils/dashboardStats';

interface DashboardProps {
  employees: Employee[];
  settings: SystemSettings;
  onAlertClick?: () => void;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export const Dashboard: React.FC<DashboardProps> = ({ employees = [], settings, onAlertClick }) => {
  const stats = useMemo(() => getDashboardStats(employees, settings), [employees, settings]);

  const vrData = useMemo(
    () =>
      ['VR0', 'VR1', 'VR2', 'VR3', 'VR4'].map((status) => ({
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
      { name: '<6m', value: employees.filter((e) => (e.totalExperienceMonths || 0) < 6).length },
      {
        name: '6m-1y',
        value: employees.filter((e) => (e.totalExperienceMonths || 0) >= 6 && (e.totalExperienceMonths || 0) < 12).length,
      },
      {
        name: '1-3y',
        value: employees.filter((e) => (e.totalExperienceMonths || 0) >= 12 && (e.totalExperienceMonths || 0) < 36).length,
      },
      {
        name: '3-5y',
        value: employees.filter((e) => (e.totalExperienceMonths || 0) >= 36 && (e.totalExperienceMonths || 0) < 60).length,
      },
      { name: '5y+', value: employees.filter((e) => (e.totalExperienceMonths || 0) >= 60).length },
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

  const totalSickDaysYTD = settings.monthlySickDays.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const averageTenureYears = (stats.averageTotalExperienceMonths / 12).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-white" size={24} />} title="Total Employees" value={stats.totalEmployees} color="bg-indigo-500" />
        <StatCard
          icon={<AlertCircle className="text-white" size={24} />}
          title="Raise Due"
          value={stats.raiseDue}
          subValue="Action Required"
          color="bg-amber-500"
          onClick={onAlertClick}
          className="cursor-pointer hover:shadow-lg transition-shadow"
        />
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
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
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
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sick Days Trend (YTD)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={settings.monthlySickDays}>
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
                <Pie data={ageDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
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
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {stats.totalEmployees === 0 && <p className="text-center text-slate-400 text-sm mt-2">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
