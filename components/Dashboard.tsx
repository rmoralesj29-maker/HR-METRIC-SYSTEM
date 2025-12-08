
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
    const calculateTenureGroup = (min: number,