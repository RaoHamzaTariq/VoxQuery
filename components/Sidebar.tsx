'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Plus,
  Database,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const { activeView, setActiveView, connection } = useStore();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'connection', label: 'Database', icon: Database }
  ] as const;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/Logo_dark_bg.png" alt="VoxQuery" className="h-10 w-auto object-contain shrink-0" />
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Connection Status */}
        {connection && (
          <div className="mt-3 flex items-center gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-emerald-400 truncate">
                {connection.database}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {connection.type}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Query Button */}
      <div className="p-3">
        <button
          onClick={() => {
            setActiveView('dashboard');
            setIsMobileOpen(false);
          }}
          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] text-sm"
        >
          <Plus className="w-4 h-4" />
          New Query
        </button>
      </div>

      {/* Navigation */}
      <div className="px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as any);
                setIsMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                isActive 
                  ? "bg-white/5 text-white border border-slate-700/50" 
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                isActive 
                  ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20" 
                  : "bg-slate-800/50 group-hover:bg-slate-700/50"
              )}>
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                )} />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="mt-auto p-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            VQ
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">VoxQuery User</p>
            <p className="text-xs text-slate-500 truncate">Analyst</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 flex-col h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      {isMobile && (
        <>
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <img src="/Logo_dark_bg.png" alt="VoxQuery" className="h-8 w-auto object-contain" />
            </div>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>

          {/* Mobile Sidebar Overlay */}
          {isMobileOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsMobileOpen(false)}
              />
              <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 z-50 overflow-y-auto">
                <SidebarContent />
              </aside>
            </>
          )}
        </>
      )}
    </>
  );
}
