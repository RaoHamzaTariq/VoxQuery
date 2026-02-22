import React from 'react';
import { useStore } from '@/lib/store';
import { Mic, Settings, User } from 'lucide-react';

export function Header() {
  const { isListening } = useStore();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-800 bg-[#101722] px-6 py-3 shrink-0 z-20">
      <div className="flex items-center gap-4 text-white">
        <div className="size-8 flex items-center justify-center bg-blue-500 rounded-lg text-white">
          <span className="font-bold text-lg">DV</span>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">DataVoice Agent</h2>
      </div>
      
      <div className="flex items-center gap-4">
        {isListening && (
          <div className="flex items-center justify-center overflow-hidden rounded-full h-10 bg-blue-500/20 text-blue-400 gap-2 text-sm font-bold px-4 transition-colors animate-pulse">
            <Mic className="size-4" />
            <span>Listening...</span>
          </div>
        )}
        
        <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
        
        <button className="text-slate-400 hover:text-white transition-colors">
          <Settings className="size-5" />
        </button>
        
        <div className="size-9 rounded-full bg-slate-700 border border-slate-600 overflow-hidden">
             <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                <User className="size-5" />
             </div>
        </div>
      </div>
    </header>
  );
}
