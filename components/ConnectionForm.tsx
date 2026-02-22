'use client';

import React, { useState } from 'react';
import { useStore, DatabaseConnection } from '@/lib/store';
import { Database, Lock, User, Server, CheckCircle, AlertCircle, Loader2, Plug, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionForm() {
  const { setConnection, setSchema, setActiveView } = useStore();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  const [formData, setFormData] = useState<DatabaseConnection>({
    id: '1',
    name: 'My Database',
    type: 'mysql',
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    ssl: false,
    isMock: false
  });

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const connectionPayload = { ...formData, isMock };

      const response = await fetch('/api/db/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: connectionPayload }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to connect');
      }

      setSuccess('Connection successful! You can now save and connect.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const connectionPayload = { ...formData, isMock };

      const response = await fetch('/api/db/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: connectionPayload }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to connect');
      }

      // Save Connection & Schema
      // Note: setConnection automatically clears messages and resets conversation
      setConnection(connectionPayload);
      setSchema(data.schema);
      setActiveView('dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">Database Connection</h2>
                <p className="text-xs sm:text-sm text-slate-400 truncate">Connect to your database</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isMock}
                onChange={(e) => setIsMock(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                "w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors relative",
                isMock ? "bg-emerald-500" : "bg-slate-700"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                  isMock ? "left-5" : "left-0.5"
                )} />
              </div>
              <span className="text-xs sm:text-sm text-slate-400 hidden sm:inline">Demo</span>
            </label>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 sm:p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Connection Error</p>
                <p className="mt-1 opacity-80">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 sm:p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Success</p>
                <p className="mt-1 opacity-80">{success}</p>
              </div>
            </div>
          )}

          {/* Database Type */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Database Type</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                disabled={isMock}
                onClick={() => setFormData({ ...formData, type: 'mysql', port: 3306 })}
                className={cn(
                  "p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                  formData.type === 'mysql'
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-lg"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                )}
              >
                <Database className="w-4 h-4" />
                MySQL
              </button>
              <button
                disabled={isMock}
                onClick={() => setFormData({ ...formData, type: 'postgres', port: 5432 })}
                className={cn(
                  "p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                  formData.type === 'postgres'
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-lg"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                )}
              >
                <Database className="w-4 h-4" />
                PostgreSQL
              </button>
            </div>
          </div>

          {/* Host & Port */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="col-span-3">
              <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Host</label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  disabled={isMock}
                  value={isMock ? 'demo-db.internal' : formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  placeholder="localhost"
                />
              </div>
            </div>
            <div className="col-span-1">
              <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Port</label>
              <input
                disabled={isMock}
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 3306 })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none text-center disabled:opacity-50"
              />
            </div>
          </div>

          {/* Database Name */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Database Name</label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                disabled={isMock}
                value={isMock ? 'ecommerce_demo' : formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                placeholder="mydb"
              />
            </div>
          </div>

          {/* Authentication */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">Authentication</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    disabled={isMock}
                    value={isMock ? 'demo_user' : formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    placeholder="root"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    disabled={isMock}
                    type="password"
                    value={isMock ? 'demo123' : formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 pl-10 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SSL Option */}
          <label className="flex items-center gap-3 p-3 sm:p-4 bg-slate-800/30 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              disabled={isMock}
              checked={formData.ssl}
              onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Use SSL connection</p>
              <p className="text-xs text-slate-500 hidden sm:block">Recommended for production</p>
            </div>
            <Wifi className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
              formData.ssl ? "text-emerald-400" : "text-slate-600"
            )} />
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/50 space-y-2 sm:space-y-3">
          <button
            onClick={testConnection}
            disabled={loading || testing || isMock}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-700"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plug className="w-4 h-4" />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button
            onClick={handleConnect}
            disabled={loading || testing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-medium shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {loading ? 'Connecting...' : 'Save & Connect'}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-xs text-slate-500 px-4">
          {isMock 
            ? '🎭 Demo mode uses sample data - no database required'
            : '💡 Tip: Use Demo mode to explore without a database'}
        </p>
      </div>
    </div>
  );
}
