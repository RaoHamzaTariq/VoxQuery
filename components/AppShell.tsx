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

    loadSchema();
  }, [setSchema]);

  if (!mounted) {
    React.useEffect(() => {
      setMounted(true);
    }, []);
    return null;
  }

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar - University Navigation */}
      <UniversitySidebar />

      {/* Center - Voice Bot Interface */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-800 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center animate-spin">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connecting to University Portal</h2>
            <p className="text-slate-400 text-sm">Loading your data...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center h-full w-full p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-red-400 text-sm mb-6 max-w-md text-center">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <VoiceBot />
        )}
      </div>

      {/* Right Panel - Insights & Data */}
      <div className="w-[400px] xl:w-[450px] h-full shrink-0">
        <InsightsPanel />
      </div>
    </div>
  );
}
