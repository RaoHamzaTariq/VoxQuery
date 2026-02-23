'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Visualization } from '@/components/Visualization';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function InsightsPanel() {
  const { messages, selectedChartType } = useStore();

  // Get the last assistant message with query results
  const lastResultMessage = messages.slice().reverse().find(m =>
    m.role === 'assistant' && m.relatedQuery && m.relatedQuery.rows.length > 0
  );

  const displayData = lastResultMessage?.relatedQuery || null;
  const chartType = lastResultMessage?.chartType || selectedChartType || 'bar';

  // Calculate metrics from data
  const getMetrics = () => {
    if (!displayData || displayData.rows.length === 0) return null;

    const rows = displayData.rows;
    const numericColumns = displayData.columns.filter(col =>
      typeof rows[0][col] === 'number'
    );

    if (numericColumns.length === 0) return null;

    const primaryColumn = numericColumns[0];
    const values = rows.map(row => row[primaryColumn] || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / rows.length;

    // Calculate trend
    const midPoint = Math.floor(rows.length / 2);
    const firstHalfAvg = midPoint > 0 
      ? rows.slice(0, midPoint).reduce((sum, row) => sum + (row[primaryColumn] || 0), 0) / midPoint 
      : 0;
    const secondHalfAvg = rows.length - midPoint > 0 
      ? rows.slice(midPoint).reduce((sum, row) => sum + (row[primaryColumn] || 0), 0) / (rows.length - midPoint) 
      : 0;
    const trend = firstHalfAvg !== 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    return { total, average, trend, column: primaryColumn };
  };

  const metrics = getMetrics();

  // Get icon based on column name
  const getMetricIcon = (columnName: string) => {
    const lower = columnName.toLowerCase();
    if (lower.includes('student') || lower.includes('enrollment')) return Users;
    if (lower.includes('gpa') || lower.includes('grade')) return Award;
    if (lower.includes('course') || lower.includes('class')) return BookOpen;
    if (lower.includes('faculty') || lower.includes('staff')) return Users;
    if (lower.includes('attendance')) return Calendar;
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('revenue')) return DollarSign;
    if (lower.includes('graduation')) return GraduationCap;
    return BarChart3;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-emerald-500/20">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-xs sm:text-sm">Insights</h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              {displayData ? 'Data visualization' : 'Awaiting your question'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 sm:space-y-4">
        {!displayData ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-xl" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 border border-slate-700/50 rounded-full flex items-center justify-center">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1 text-sm">No Data Yet</h3>
            <p className="text-slate-400 text-xs max-w-xs px-4">
              Ask a question using the voice bot to see insights and visualizations
            </p>
          </div>
        ) : (
          <>
            {/* Key Metric Card */}
            {metrics && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-500/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {React.createElement(getMetricIcon(metrics.column), {
                      className: "w-4 h-4 sm:w-5 sm:h-5 text-emerald-400"
                    })}
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-medium truncate max-w-[180px] sm:max-w-none">
                      {metrics.column.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {metrics.trend !== 0 && (
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0",
                      metrics.trend >= 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/20 text-red-400 border border-red-500/20"
                    )}>
                      {metrics.trend >= 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      {Math.abs(metrics.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {formatValue(metrics.total, metrics.column)}
                  </span>
                  {metrics.average !== metrics.total && (
                    <span className="text-xs text-slate-400">
                      avg: {formatValue(metrics.average, metrics.column)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Main Chart Card */}
            <div className="bg-slate-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm font-semibold text-white">Visualization</h4>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full capitalize">
                  {chartType}
                </span>
              </div>

              <div className="h-[240px] sm:h-[280px] w-full">
                <Visualization type={chartType} data={displayData} />
              </div>
            </div>

            {/* Data Summary */}
            {displayData.rows.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl p-3 sm:p-4 border border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Summary
                </h4>
                <div className="space-y-2">
                  {displayData.rows.slice(0, 5).map((row, index) => {
                    const label = Object.keys(row)[0];
                    const value = Object.values(row)[0];
                    return (
                      <div key={index} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                        <span className="text-xs text-slate-300 capitalize truncate max-w-[60%]">
                          {String(label).replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold text-white flex-shrink-0">
                          {formatValueSimple(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {displayData.rows.length > 5 && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    +{displayData.rows.length - 5} more items
                  </p>
                )}
              </div>
            )}

            {/* Auto Insights */}
            {metrics && metrics.trend !== 0 && (
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-3 sm:p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Insight</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {metrics.trend >= 0
                    ? `↑ There's a positive trend of ${Math.abs(metrics.trend).toFixed(1)}% in the data`
                    : `↓ There's a decline of ${Math.abs(metrics.trend).toFixed(1)}% in the data`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Format value for display
function formatValue(value: number, columnName: string): string {
  const lower = columnName.toLowerCase();
  
  // Check if it's a percentage
  if (lower.includes('rate') || lower.includes('percentage') || lower.includes('percent')) {
    return value.toFixed(1) + '%';
  }
  
  // Check if it's currency
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('revenue') || lower.includes('salary')) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  // Default number formatting
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

// Simple value formatter for summary list
function formatValueSimple(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return String(value);
}
