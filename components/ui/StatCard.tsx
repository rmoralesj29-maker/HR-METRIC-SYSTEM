import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, color = "blue" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
    </div>
  );
};
