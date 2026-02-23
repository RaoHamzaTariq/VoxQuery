'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { UniversitySidebar } from '@/components/UniversitySidebar';
import { VoiceBot } from '@/components/VoiceBot';
import { InsightsPanel } from '@/components/InsightsPanel';

export function AppShell() {
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const { setSchema } = useStore();

  // Set mounted state
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Load schema on mount
  React.useEffect(() => {
    const loadSchema = async () => {
      try {
        console.log('🔄 Loading university data schema...');
        const response = await fetch('/api/db/schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Failed to load university data');
        }

        console.log('✅ Schema loaded:', data.schema.length, 'tables');
        setSchema(data.schema);
        setLoadError(null);
      } catch (err: any) {
        console.error('❌ Schema load error:', err);
        setLoadError(err.message || 'Failed to connect to university database');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      loadSchema();
    }
  }, [setSchema, mounted]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar - University Navigation */}
      <UniversitySidebar />

      {/* Center - Voice Bot Interface */}
      <div className="flex-1 flex flex-col min-w-0 h-full lg:h-full relative border-b lg:border-b-0 lg:border-r border-slate-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full w-full px-4">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center animate-spin">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 border-t-white rounded-full" />
              </div>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white mb-2 text-center px-4">Connecting to University Portal</h2>
            <p className="text-slate-400 text-xs sm:text-sm text-center">Loading your data...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center h-full w-full p-4 sm:p-6 lg:p-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl sm:text-3xl">⚠️</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2 text-center px-4">Connection Error</h2>
            <p className="text-red-400 text-xs sm:text-sm mb-6 max-w-md text-center px-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all text-xs sm:text-sm min-h-[44px] touch-manipulation"
            >
              Try Again
            </button>
          </div>
        ) : (
          <VoiceBot />
        )}
      </div>

      {/* Right Panel - Insights & Data */}
      <div className="w-full lg:w-[400px] xl:w-[450px] h-[50vh] lg:h-full shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800">
        <InsightsPanel />
      </div>
    </div>
  );
}
