'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Home,
  BarChart3,
  Users,
  BookOpen,
  Menu,
  X,
  School
} from 'lucide-react';

export function UniversitySidebar() {
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'enrollment', label: 'Enrollment', icon: Users },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* University Logo & Name */}
      <div className="p-4 sm:p-6 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-white leading-tight">University Portal</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Voice Assistant</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Welcome Card */}
      <div className="p-3 sm:p-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <School className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">Welcome</span>
          </div>
          <p className="text-sm text-white font-medium">Good day!</p>
          <p className="text-xs text-slate-400 mt-1">Ask me anything about the university</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setIsMobileOpen(false)}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group min-h-[48px] touch-manipulation"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-800/50 group-hover:bg-slate-700/50 flex items-center justify-center transition-colors flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
          <p className="text-xs text-slate-500 font-medium mb-2">Quick Access</p>
          <div className="space-y-1.5">
            <button className="w-full text-left text-xs text-slate-300 hover:text-white transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
              📊 View Reports
            </button>
            <button className="w-full text-left text-xs text-slate-300 hover:text-white transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
              📅 Academic Calendar
            </button>
            <button className="w-full text-left text-xs text-slate-300 hover:text-white transition-colors py-1.5 px-2 rounded-lg hover:bg-white/5">
              👥 Faculty Directory
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer min-h-[56px]">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Administrator</p>
            <p className="text-xs text-slate-500 truncate">University Admin</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 border-r border-slate-800 flex-col h-full shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      {isMobile && (
        <>
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-900 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-white font-bold text-sm">University Portal</h1>
            </div>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
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
