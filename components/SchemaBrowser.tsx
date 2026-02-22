'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Database, Table, Key, Link as LinkIcon, Search, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SchemaBrowser() {
  const { schema } = useStore();
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filter schema based on search
  const filteredSchema = schema.filter(table => {
    const lowerSearch = searchTerm.toLowerCase();
    const tableMatch = table.tableName.toLowerCase().includes(lowerSearch);
    const columnMatch = table.columns.some(col => 
      col.name.toLowerCase().includes(lowerSearch)
    );
    return tableMatch || columnMatch;
  });

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">Schema Browser</h3>
              <p className="text-xs text-slate-400">
                {schema.length} {schema.length === 1 ? 'table' : 'tables'}
              </p>
            </div>
          </div>
          <div className="relative w-32 sm:w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:border-blue-500 outline-none placeholder-slate-600"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 bg-[#101722]/20">
        <div className="space-y-1">
          {schema.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-white font-medium mb-1 text-sm">No Schema Loaded</h3>
              <p className="text-slate-400 text-xs">
                Connect to a database to view tables
              </p>
            </div>
          ) : filteredSchema.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-slate-400 text-xs">No tables match your search</p>
            </div>
          ) : (
            filteredSchema.map((table) => {
              const isExpanded = expandedTables[table.tableName];
              
              return (
                <div key={table.tableName}>
                  <div
                    onClick={() => toggleTable(table.tableName)}
                    className={cn(
                      "flex items-center gap-2 py-2 px-2.5 rounded-lg group cursor-pointer transition-all",
                      isExpanded 
                        ? "bg-blue-500/10 border-l-2 border-blue-500" 
                        : "hover:bg-white/5 border-l-2 border-transparent"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="text-slate-400 w-4 h-4" />
                    ) : (
                      <ChevronRight className="text-slate-500 w-4 h-4" />
                    )}
                    <Table className={cn(
                      "w-4 h-4",
                      isExpanded ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-400"
                    )} />
                    <span className={cn(
                      "text-xs sm:text-sm font-medium truncate",
                      isExpanded ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}>
                      {table.tableName}
                    </span>
                    <span className="ml-auto text-xs text-slate-600 shrink-0">
                      {table.columns.length} cols
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(table.tableName, `table-${table.tableName}`);
                      }}
                      className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      {copiedText === `table-${table.tableName}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Columns */}
                  {isExpanded && (
                    <div className="pl-7 pr-2 pt-1.5 pb-1.5 space-y-0.5 border-l border-slate-800 ml-2.5">
                      {table.columns.map((col) => (
                        <div 
                          key={col.name} 
                          className="flex items-center justify-between py-1.5 px-2 hover:bg-white/5 rounded group cursor-default"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {col.isPrimaryKey && <Key className="text-yellow-500 w-3 h-3 shrink-0" />}
                            {col.isForeignKey && !col.isPrimaryKey && <LinkIcon className="text-blue-500 w-3 h-3 shrink-0" />}
                            {!col.isPrimaryKey && !col.isForeignKey && <span className="w-3 shrink-0"></span>}
                            <span className="text-xs text-slate-300 truncate">{col.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                              {col.type}
                            </span>
                            <button
                              onClick={() => copyToClipboard(col.name, `column-${table.tableName}-${col.name}`)}
                              className="p-0.5 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {copiedText === `column-${table.tableName}-${col.name}` ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 sm:p-3 bg-[#101722]/50 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
        <span>Database Schema</span>
        <span className="hidden sm:inline">Read-only view</span>
      </div>
    </div>
  );
}
