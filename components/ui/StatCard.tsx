import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon,
  trend,
  trendUp,
  color = "bg-blue-500",
  onClick,
  className = ""
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between transition-all hover:shadow-md ${className}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subValue && (
            <p className="text-xs font-medium text-slate-400 mt-1">{subValue}</p>
        )}
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg shadow-sm ${color}`}>
        {icon}
      </div>
    </div>
  );
};
