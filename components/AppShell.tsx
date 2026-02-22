'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { ConnectionForm } from '@/components/ConnectionForm';
import { SchemaBrowser } from '@/components/SchemaBrowser';
import { ChatInterface } from '@/components/ChatInterface';
import { InsightCanvas } from '@/components/InsightCanvas';

export function AppShell() {
  const { activeView } = useStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen-safe">
        {activeView === 'connection' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="w-full lg:w-1/2 flex items-start justify-center p-4 lg:p-6 overflow-y-auto">
              <ConnectionForm />
            </div>
            <div className="hidden lg:block w-full lg:w-1/2 p-4 lg:p-6">
              <SchemaBrowser />
            </div>
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative h-full">
            {/* Chat Interface - Full width on mobile, left panel on desktop */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
              <ChatInterface />
            </div>

            {/* Desktop Insights Panel - Always visible on desktop */}
            <div className="hidden lg:block w-[400px] xl:w-[450px] h-full shrink-0">
              <InsightCanvas />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
