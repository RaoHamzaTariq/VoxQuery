'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { useLiveGemini } from '@/hooks/use-live-gemini';
import { Mic, MicOff, Power, Sparkles, Waves, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const { messages, connection } = useStore();
  const {
    isConnected,
    isListening,
    isSpeaking,
    error,
    connectionStatus,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    interruptSpeaking,
  } = useLiveGemini();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleConnection = async () => {
    if (isConnected) {
      disconnect();
    } else {
      if (!connection) {
        alert("Please connect to a database first from the Database page.");
        return;
      }
      await connect();
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Keyboard shortcut: Space to interrupt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar to interrupt (only when not typing in an input)
      if (e.code === 'Space' && isSpeaking && e.target === document.body) {
        e.preventDefault();
        interruptSpeaking();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, interruptSpeaking]);

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-500 shrink-0",
            connectionStatus === 'connected' ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" : 
            connectionStatus === 'connecting' ? "bg-yellow-500 animate-ping" : 
            "bg-slate-600"
          )} />
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">Voice Assistant</h2>
            <p className="text-xs text-slate-400 truncate">
              {connectionStatus === 'connected' 
                ? isListening 
                  ? "Listening..." 
                  : isSpeaking 
                    ? "Speaking..." 
                    : "Ready"
                : connectionStatus === 'connecting'
                  ? "Connecting..."
                  : "Disconnected"}
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            onClick={toggleConnection}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors shrink-0"
            title="Disconnect"
          >
            <Power className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 relative z-10"
      >
        {!isConnected ? (
          /* Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Waves className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">
              Welcome to VoxQuery
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-4 leading-relaxed px-2">
              Your AI-powered database assistant. Ask questions and get instant insights.
            </p>
            
            {/* Quick Start Steps */}
            <div className="grid grid-cols-3 gap-2 max-w-lg w-full mb-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 backdrop-blur">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-emerald-400 font-bold text-xs sm:text-sm">1</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Connect DB</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 backdrop-blur">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-blue-400 font-bold text-xs sm:text-sm">2</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Click Connect</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 backdrop-blur">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-purple-400 font-bold text-xs sm:text-sm">3</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Start Talking</p>
              </div>
            </div>
            
            <button
              onClick={toggleConnection}
              className="w-full max-w-xs px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 flex items-center justify-center gap-2 text-sm"
            >
              <Power className="w-4 h-4" />
              Connect to Assistant
            </button>

            {/* Example Questions */}
            <div className="mt-6 text-left max-w-sm w-full">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Try asking:</p>
              <div className="space-y-1.5">
                {[
                  "Show me total sales",
                  "How many customers?",
                  "Top products?"
                ].map((question, i) => (
                  <div key={i} className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
                    💬 {question}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Start a Conversation
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto">
                  Tap the microphone below and ask me anything about your data
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.role === 'system') return null;
                if (msg.role === 'assistant' && !msg.content) return null;
                
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg",
                        msg.role === 'user'
                          ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
                          : "bg-slate-800/80 border border-slate-700/50 text-slate-100 backdrop-blur"
                      )}
                    >
                      {msg.role === 'user' && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-xs opacity-70">
                          <Sparkles className="w-3 h-3" />
                          You asked
                        </div>
                      )}
                      <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                      
                      {msg.relatedQuery?.sql && msg.role === 'assistant' && (
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-600/50">
                          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">
                            <Waves className="w-3 h-3" />
                            SQL Query
                          </div>
                          <code className="text-xs font-mono text-emerald-400 bg-slate-900/50 p-2 rounded-lg block overflow-x-auto">
                            {msg.relatedQuery.sql}
                          </code>
                          {msg.relatedQuery.rows.length > 0 && (
                            <div className="mt-2 flex gap-1.5 flex-wrap">
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                ✓ {msg.relatedQuery.rows.length} rows
                              </span>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                                📊 {msg.relatedQuery.columns.length} cols
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-50 mt-1.5 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="relative z-10 mx-4 mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs sm:text-sm backdrop-blur animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Controls */}
      <div className="relative z-10 px-4 py-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-xl shrink-0">
        <div className="max-w-xl mx-auto">
          {/* Audio Visualizer */}
          {(isListening || isSpeaking) && (
            <div className="flex items-center justify-center gap-0.5 h-6 mb-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-0.5 bg-gradient-to-t from-emerald-400 to-blue-400 rounded-full transition-all duration-150",
                    isListening || isSpeaking ? "animate-pulse" : "h-2 opacity-30"
                  )}
                  style={{
                    height: isListening || isSpeaking 
                      ? `${Math.random() * 16 + 8}px` 
                      : '8px',
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 relative">
            {/* Voice Button */}
            {isConnected && (
              <button
                onClick={toggleRecording}
                disabled={isSpeaking}
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shadow-2xl relative group",
                  isListening
                    ? "bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse ring-4 ring-red-500/30"
                    : "bg-gradient-to-br from-emerald-500 to-blue-500 text-white hover:scale-105 active:scale-95 ring-4 ring-emerald-500/30",
                  isSpeaking && "opacity-50 cursor-not-allowed"
                )}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
                
                {/* Tooltip */}
                <span className="absolute -bottom-6 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isListening ? "Tap to stop" : "Tap to speak"}
                </span>
              </button>
            )}

            {/* Interrupt Button - Shows when AI is speaking */}
            {isSpeaking && (
              <button
                onClick={interruptSpeaking}
                className="absolute -right-20 sm:right-0 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs rounded-full font-medium transition-all flex items-center gap-1.5 shadow-lg animate-in fade-in zoom-in duration-200"
                title="Stop speaking (or press Space)"
              >
                <StopCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            )}
          </div>

          {/* Helper Text */}
          <div className="mt-3 text-center">
            <p className={cn(
              "text-xs transition-colors",
              isListening ? "text-red-400 font-medium" : "text-slate-500"
            )}>
              {isConnected
                ? isListening
                  ? "🔴 Listening... Ask your question"
                  : isSpeaking
                    ? "🔊 Speaking... (Say anything to interrupt)"
                    : "Tap the microphone to start speaking"
                : "Connect to start"}
            </p>
            {isSpeaking && (
              <p className="text-[10px] text-slate-500 mt-1">
                💡 Just start talking - I'll stop automatically
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
