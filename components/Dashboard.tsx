
import React, { useMemo } from 'react';
import { CalculatedEmployeeStats, VRRate, SystemSettings } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LabelList
} from 'recharts';
import { StatCard } from './ui/StatCard';
import { Users, AlertCircle, Clock, Thermometer } from 'lucide-react';

interface DashboardProps {
  employees: CalculatedEmployeeStats[];
  settings: SystemSettings;
  onAlertClick?: () => void;
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export const Dashboard: React.FC<DashboardProps> = ({ employees = [], settings, onAlertClick }) => {
  
  // Analytics Logic
  const stats = useMemo(() => {
    // 1. Safety Checks
    const safeEmployees = Array.isArray(employees) ? employees : [];
    const total = safeEmployees.length;
    const inRaiseWindow = safeEmployees.filter(e => e.inRaiseWindow).length;
    
    // Helper to format percentage
    const formatPercent = (val: number) => total > 0 ? `${((val / total) * 100).toFixed(0)}%` : '0%';

    // 2. VR Distribution (Strict Enum check)
    const vrData = Object.values(VRRate).map(rate => {
      const value = safeEmployees.filter(e => e.vrRate === rate).length;
      return {
        name: rate,
        value: value,
        percentage: formatPercent(value)
      };
    });

    // 3. Sick Days Analysis (Global from Settings)
    // Fallback if settings or monthlySickDays is missing to prevent crash
    const sickDaysData = settings?.monthlySickDays?.length 
        ? settings.monthlySickDays 
        : [
            { month: 'Jan', value: 0 }, { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 },
            { month: 'Apr', value: 0 }, { month: 'May', value: 0 }, { month: 'Jun', value: 0 },
            { month: 'Jul', value: 0 }, { month: 'Aug', value: 0 }, { month: 'Sep', value: 0 },
            { month: 'Oct', value: 0 }, { month: 'Nov', value: 0 }, { month: 'Dec', value: 0 }
          ];
    
    const totalSickDaysYTD = sickDaysData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

    // 4. Age Groups (Updated to: <22, 22-29, 30-39, 40-49, 50+)
    const calculateAgeGroup = (min: number, max?: number) => {
        const count = safeEmployees.filter(e => {
            const age = e.age || 0;
            return age >= min && (max ? age <= max : true);
        }).length;
        return { value: count, percentage: formatPercent(count) };
    };
    
    const ageDist = [
      { name: '<22', ...calculateAgeGroup(0, 21) },
      { name: '22-29', ...calculateAgeGroup(22, 29) },
      { name: '30-39', ...calculateAgeGroup(30, 39) },
      { name: '40-49', ...calculateAgeGroup(40, 49) },
      { name: '50+', ...calculateAgeGroup(50) },
    ];

    // 5. Tenure Distribution
    const calculateTenureGroup = (min: number, max?: number) => {
      const count = safeEmployees.filter(e => {
          const tenure = e.totalMonthsExperience || 0;
          return tenure >= min && (max ? tenure <= max : true);
      }).length;
      return { value: count, percentage: formatPercent(count) };
    };

    const tenureDist = [
      { name: '<6m', ...calculateTenureGroup(0, 5) },
      { name: '6m-1y', ...calculateTenureGroup(6, 11) },
      { name: '1-3y', ...calculateTenureGroup(12, 35) },
      { name: '3-5y', ...calculateTenureGroup(36, 59) },
      { name: '5y+', ...calculateTenureGroup(60) },
    ];

    // 6. Gender Distribution
    const genderDist = safeEmployees.reduce((acc, emp) => {
      const gender = emp.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genderData = Object.entries(genderDist).map(([name, value]) => ({
      name,
      value,
      percentage: formatPercent(value)
    }));

    return {
      total,
      inRaiseWindow,
      vrData,
      sickDaysData,
      totalSickDaysYTD,
      ageDist,
      tenureDist,
      genderData
    };

  }, [employees, settings]);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="text-white" size={24} />}
          title="Total Employees"
          value={stats.total}
          color="bg-indigo-500"
        />
        <StatCard
          icon={<AlertCircle className="text-white" size={24} />}
          title="Raise Due"
          value={stats.inRaiseWindow}
          subValue="Action Required"
          color="bg-amber-500"
          onClick={onAlertClick}
          className="cursor-pointer hover:shadow-lg transition-shadow"
        />
        <StatCard
          icon={<Thermometer className="text-white" size={24} />}
          title="Sick Days (YTD)"
          value={stats.totalSickDaysYTD}
          color="bg-rose-500"
        />
        <StatCard
          icon={<Clock className="text-white" size={24} />}
          title="Avg Tenure"
          value="1.2 Years" // Placeholder for simple average calc
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
              <BarChart data={stats.vrData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={40} tick={{fill: '#64748b'}} />
                <Tooltip
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {stats.vrData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                   <LabelList dataKey="value" position="right" fill="#64748b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sick Days Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Sick Days Trend (2025)</h3>
           <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.sickDaysData}>
                <defs>
                  <linearGradient id="colorSick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSick)" />
              </AreaChart>
            </ResponsiveContainer>
           </div>
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
                    <Pie
                      data={stats.ageDist}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.ageDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Tenure */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Experience / Tenure</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.tenureDist}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

           {/* Gender Diversity */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Gender Diversity</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={stats.genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>

       </div>
    </div>
  );
};
