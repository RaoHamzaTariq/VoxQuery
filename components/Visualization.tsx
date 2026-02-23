import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { formatNumber, cn } from '@/lib/utils';
import { QueryResult } from '@/lib/store';

interface VisualizationProps {
  type: 'bar' | 'line' | 'pie' | 'table' | 'number' | null;
  data: QueryResult | null;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function Visualization({ type, data }: VisualizationProps) {
  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
          <p className="text-sm">No data to display</p>
          <p className="text-xs mt-1 opacity-60">Execute a query to see results</p>
        </div>
      </div>
    );
  }

  const chartData = data.rows;
  const keys = Object.keys(chartData[0]);
  
  // Determine axis keys intelligently
  let xAxisKey = keys[0];
  let dataKey = keys[1];
  
  // Look for date/time columns for x-axis
  const datePatterns = ['date', 'time', 'day', 'month', 'year', 'created', 'updated'];
  const categoryPatterns = ['name', 'type', 'status', 'category', 'id'];
  
  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    if (datePatterns.some(p => lowerKey.includes(p))) {
      xAxisKey = key;
      break;
    }
  }
  
  // Find numeric column for data
  for (const key of keys) {
    if (key !== xAxisKey && typeof chartData[0][key] === 'number') {
      dataKey = key;
      break;
    }
  }

  // 1. Single Number Display
  if (type === 'number') {
    const value = chartData[0][keys[0]];
    const label = keys[0].replace(/_/g, ' ');

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
          {label}
        </span>
        <span className={cn(
          "font-bold tracking-tight",
          typeof value === 'number' && value > 1000000 ? "text-4xl" : "text-5xl"
        )}>
          {typeof value === 'number'
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(value)
            : value}
        </span>
      </div>
    );
  }

  // 2. Table Display
  if (type === 'table') {
    return (
      <div className="overflow-auto h-full w-full custom-scrollbar">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-slate-800/50 sticky top-0 z-10">
            <tr>
              {data.columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 whitespace-nowrap"
                >
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {chartData.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                {data.columns.map((col, idx) => (
                  <td key={idx} className="p-3 text-slate-300 whitespace-nowrap">
                    {formatCellValue(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 3. Charts
  const commonXAxisProps = {
    dataKey: xAxisKey,
    stroke: "#64748b",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
  };

  const commonYAxisProps = {
    stroke: "#64748b",
    fontSize: 11,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    tickFormatter: (value: number) => formatNumber(value),
  };

  const commonTooltipProps = {
    contentStyle: { 
      backgroundColor: '#1e293b', 
      borderColor: '#334155', 
      color: '#f8fafc',
      borderRadius: '8px',
      fontSize: '12px',
    },
    itemStyle: { color: '#f8fafc' },
    labelStyle: { color: '#94a3b8', marginBottom: '4px' },
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis {...commonXAxisProps} angle={-45} textAnchor="end" height={60} />
            <YAxis {...commonYAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Bar dataKey={dataKey} fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis {...commonXAxisProps} angle={-45} textAnchor="end" height={60} />
            <YAxis {...commonYAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#60a5fa' }}
            />
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="80%"
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={xAxisKey}
              label={({ name, percent }: { name?: string; percent?: number }) => 
                `${name || ''} ${(percent ? (percent * 100).toFixed(0) : '0')}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...commonTooltipProps} />
          </PieChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis {...commonXAxisProps} angle={-45} textAnchor="end" height={60} />
            <YAxis {...commonYAxisProps} />
            <Tooltip {...commonTooltipProps} />
            <Bar dataKey={dataKey} fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function formatCellValue(value: any, columnName: string): string {
  if (value === null || value === undefined) return '-';
  
  if (typeof value === 'number') {
    // Return plain number without currency symbol
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}