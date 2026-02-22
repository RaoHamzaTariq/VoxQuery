'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Visualization } from '@/components/Visualization';
import { 
  BarChart3, 
  Table2, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  ArrowDownRight,
  Database
} from 'lucide-react';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

export function InsightCanvas() {
  const { messages, viewMode, setViewMode, selectedChartType } = useStore();
  
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
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate trend
    const midPoint = Math.floor(rows.length / 2);
    const firstHalfAvg = midPoint > 0 ? rows.slice(0, midPoint).reduce((sum, row) => sum + (row[primaryColumn] || 0), 0) / midPoint : 0;
    const secondHalfAvg = rows.length - midPoint > 0 ? rows.slice(midPoint).reduce((sum, row) => sum + (row[primaryColumn] || 0), 0) / (rows.length - midPoint) : 0;
    const trend = firstHalfAvg !== 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    
    return { total, average, max, min, trend, column: primaryColumn };
  };

  const metrics = getMetrics();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-emerald-500/20 shrink-0">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">Results & Insights</h2>
            <p className="text-xs text-slate-400 truncate">
              {displayData ? `${displayData.rows.length} rows found` : 'Awaiting query'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {!displayData ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-xl" />
              <div className="relative w-16 h-16 bg-slate-800/50 border border-slate-700/50 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-slate-600" />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1 text-sm">No Results Yet</h3>
            <p className="text-slate-400 text-xs max-w-xs">
              Ask a question to see results, charts, and insights
            </p>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            {metrics && (
              <div className="grid grid-cols-3 gap-2">
                <MetricCard 
                  label="Total" 
                  value={metrics.total} 
                  column={metrics.column}
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                  color="emerald"
                />
                <MetricCard 
                  label="Average" 
                  value={metrics.average} 
                  column={metrics.column}
                  icon={<BarChart3 className="w-3.5 h-3.5" />}
                  color="blue"
                />
                <MetricCard 
                  label="Trend" 
                  value={metrics.trend} 
                  column={metrics.column}
                  isPercentage
                  icon={metrics.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  color={metrics.trend >= 0 ? "emerald" : "red"}
                />
              </div>
            )}

            {/* View Toggle */}
            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 shrink-0">
              <button 
                onClick={() => setViewMode('chart')}
                className={cn(
                  "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                  viewMode === 'chart' 
                    ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chart</span>
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={cn(
                  "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                  viewMode === 'table' 
                    ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                )}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Main Chart/Table Card */}
            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                    {displayData.rows.length} rows
                  </span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">
                    {displayData.columns.length} cols
                  </span>
                </div>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                  {chartType}
                </span>
              </div>

              <div className="h-[220px] sm:h-[260px] w-full">
                {viewMode === 'chart' ? (
                  <Visualization type={chartType} data={displayData} />
                ) : (
                  <Visualization type="table" data={displayData} />
                )}
              </div>
            </div>

            {/* Auto-Insights */}
            {displayData.rows.length > 1 && metrics && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-white">Insights</h4>
                </div>
                <div className="space-y-2">
                  <InsightRow 
                    icon={<TrendingUp className="w-3.5 h-3.5" />}
                    color="emerald"
                    text={`Range: ${formatValue(metrics.min, metrics.column)} - ${formatValue(metrics.max, metrics.column)}`}
                  />
                  {metrics.trend !== 0 && (
                    <InsightRow 
                      icon={metrics.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      color={metrics.trend >= 0 ? "emerald" : "red"}
                      text={`${metrics.trend >= 0 ? '↑' : '↓'} ${Math.abs(metrics.trend).toFixed(1)}% trend`}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* SQL Preview Footer */}
      {displayData?.sql && (
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs text-slate-400 font-medium">SQL Query</p>
          </div>
          <code className="text-xs font-mono text-emerald-400 bg-slate-950/50 p-2 rounded-lg block overflow-x-auto border border-slate-800/50">
            {displayData.sql}
          </code>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  label, 
  value, 
  column, 
  icon, 
  color = 'blue',
  isPercentage = false 
}: { 
  label: string; 
  value: number; 
  column: string;
  icon: React.ReactNode;
  color?: 'emerald' | 'blue' | 'red';
  isPercentage?: boolean;
}) {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/20 text-blue-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/20 text-red-400',
  };

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-xl p-2.5 border backdrop-blur",
      colorClasses[color]
    )}>
      <div className="flex items-center gap-1 mb-1 text-xs opacity-70">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="text-sm font-bold text-white truncate">
        {isPercentage 
          ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
          : formatValue(value, column)
        }
      </p>
    </div>
  );
}

// Insight Row Component
function InsightRow({ icon, color, text }: { icon: React.ReactNode; color: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className={cn(
        "w-5 h-5 rounded flex items-center justify-center shrink-0",
        color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" :
        color === 'red' ? "bg-red-500/20 text-red-400" :
        "bg-blue-500/20 text-blue-400"
      )}>
        {icon}
      </div>
      <p className="text-xs text-slate-300 leading-tight">{text}</p>
    </div>
  );
}

// Helper function
function formatValue(value: number, columnName: string): string {
  // Return plain number without currency symbol
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
