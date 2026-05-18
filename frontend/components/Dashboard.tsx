import React, { useMemo } from 'react';
import { MigraineEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Activity, Calendar, Clock } from 'lucide-react';

interface DashboardProps {
  entries: MigraineEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const stats = useMemo(() => {
    const total = entries.length;
    const prostrating = entries.filter(e => e.prostrating).length;
    
    // Calculate average severity
    const avgSeverity = total > 0 
      ? (entries.reduce((acc, curr) => acc + curr.severity, 0) / total).toFixed(1) 
      : '0';

    // Calculate average duration
    const avgDuration = total > 0
      ? (entries.reduce((acc, curr) => acc + curr.durationHours, 0) / total).toFixed(1)
      : '0';

    // Group by month for chart (last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        count: 0,
        prostratingCount: 0
      };
    }).reverse();

    entries.forEach(entry => {
      const d = new Date(entry.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const monthData = last6Months.find(m => m.key === key);
      if (monthData) {
        monthData.count += 1;
        if (entry.prostrating) {
          monthData.prostratingCount += 1;
        }
      }
    });

    return { total, prostrating, avgSeverity, avgDuration, chartData: last6Months };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Activity className="w-16 h-16 mb-4 text-slate-300" />
        <h3 className="text-xl font-semibold text-slate-700">No entries yet</h3>
        <p className="mt-2 text-center max-w-md">
          Start logging your migraines to see insights and generate reports for your VA claim.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Episodes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Prostrating Episodes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.prostrating}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Severity</p>
            <p className="text-2xl font-bold text-slate-900">{stats.avgSeverity} <span className="text-sm font-normal text-slate-400">/ 10</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Duration</p>
            <p className="text-2xl font-bold text-slate-900">{stats.avgDuration} <span className="text-sm font-normal text-slate-400">hrs</span></p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Frequency (Last 6 Months)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" name="Total Episodes" radius={[4, 4, 0, 0]}>
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" /> // blue-500
                ))}
              </Bar>
              <Bar dataKey="prostratingCount" name="Prostrating" radius={[4, 4, 0, 0]}>
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-prostrating-${index}`} fill="#ef4444" /> // red-500
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4 text-sm text-slate-600">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Total Episodes</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Prostrating</div>
        </div>
      </div>
    </div>
  );
};
