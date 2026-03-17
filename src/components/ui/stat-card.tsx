'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  note?: string;
  icon?: ReactNode;
  trend?: number; // Persentase perubahan dari tahun lalu
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  note,
  icon,
  trend,
  className = ''
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return '';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {note && (
            <p className="mt-0.5 text-xs text-gray-400 italic">{note}</p>
          )}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend > 0 ? '+' : ''}{trend}% dari tahun lalu</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-[#599E6E]/10 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
