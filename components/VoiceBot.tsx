'use client';

import React from 'react';
import { useLiveGemini } from '@/hooks/use-live-gemini';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceBot() {
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

  // Auto-connect on mount
  React.useEffect(() => {
    if (!isConnected && connectionStatus === 'disconnected') {
      connect();
    }
  }, [isConnected, connectionStatus, connect]);

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Keyboard shortcut: Space to interrupt
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpeaking && e.target === document.body) {
        e.preventDefault();
        interruptSpeaking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, interruptSpeaking]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Connection Status */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-2">
        <div className={cn(
          "flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border transition-all",
          connectionStatus === 'connected'
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : connectionStatus === 'connecting'
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              : "bg-slate-800/50 border-slate-700 text-slate-400"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            connectionStatus === 'connected' ? "bg-emerald-500 animate-pulse" :
            connectionStatus === 'connecting' ? "bg-yellow-500 animate-ping" :
            "bg-slate-500"
          )} />
          <span className="text-xs font-medium truncate">
            {connectionStatus === 'connected'
              ? isListening
                ? "Listening..."
                : isSpeaking
                  ? "Speaking..."
                  : "Ready to assist"
              : connectionStatus === 'connecting'
                ? "Connecting..."
                : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Main Voice Interface */}
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-3xl">
        {/* Animated Voice Orb */}
        <div className="relative flex-shrink-0">
          {/* Outer glow rings */}
          {(isListening || isSpeaking) && (
            <>
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20",
                isListening ? "bg-emerald-500" : "bg-blue-500"
              )} style={{ animationDuration: '2s' }} />
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20",
                isListening ? "bg-emerald-500" : "bg-blue-500"
              )} style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-10",
                isListening ? "bg-emerald-500" : "bg-blue-500"
              )} style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </>
          )}

          {/* Audio visualizer rings */}
          {(isListening || isSpeaking) && (
            <div className="absolute inset-0 flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute rounded-full border transition-all duration-150",
                    isListening
                      ? "border-emerald-500/30"
                      : "border-blue-500/30"
                  )}
                  style={{
                    width: `${120 + i * 40}px`,
                    height: `${120 + i * 40}px`,
                    opacity: isListening || isSpeaking ? 0.3 - (i * 0.05) : 0,
                    transform: `scale(${isListening || isSpeaking ? 1 + Math.random() * 0.2 : 0.8})`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Main orb button */}
          <button
            onClick={toggleRecording}
            disabled={!isConnected || isSpeaking}
            className={cn(
              "relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl touch-manipulation",
              "hover:scale-105 active:scale-95",
              isListening
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/50 animate-pulse"
                : isSpeaking
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50"
                  : "bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-900/50 hover:from-slate-600 hover:to-slate-700",
              (!isConnected || isSpeaking) && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Inner icon */}
            <div className="relative z-10">
              {isListening ? (
                <MicOff className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
              ) : (
                <Mic className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
              )}
            </div>

            {/* Orb inner glow */}
            <div className={cn(
              "absolute inset-0 rounded-full opacity-30",
              isListening
                ? "bg-gradient-to-br from-white to-emerald-300 blur-xl"
                : isSpeaking
                  ? "bg-gradient-to-br from-white to-blue-300 blur-xl"
                  : "bg-gradient-to-br from-white to-slate-500 blur-xl"
            )} />
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center space-y-2 px-2 sm:px-4 w-full">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight">
            {isListening
              ? "I'm listening..."
              : isSpeaking
                ? "Sara is speaking..."
                : isConnected
                  ? "Tap to ask a question"
                  : "Connecting to university portal..."}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {isListening
              ? "Go ahead, I'm ready to help"
              : isSpeaking
                ? "Press spacebar or tap to interrupt"
                : isConnected
                  ? "Ask about enrollment, attendance, GPA, or any university metric"
                  : "Please wait while we connect to the database"}
          </p>
        </div>

        {/* Example Questions */}
        {isConnected && !isListening && !isSpeaking && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full px-2 sm:px-4">
            {[
              "How many students are enrolled?",
              "What is the average GPA?",
              "Show me attendance rates",
              "Which courses are most popular?"
            ].map((question, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-300 backdrop-blur-sm break-words"
              >
                💬 {question}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4 text-red-300 text-xs sm:text-sm backdrop-blur-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Connection Issue</p>
                <p className="mt-1 opacity-80 break-words">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interrupt Button - Shows when AI is speaking */}
      {isSpeaking && (
        <button
          onClick={interruptSpeaking}
          className="absolute bottom-20 sm:bottom-24 px-5 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm rounded-full font-medium transition-all flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-200 touch-manipulation min-h-[44px]"
        >
          <StopCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Stop
        </button>
      )}

      {/* Helper Text */}
      <div className="absolute bottom-2 sm:bottom-4 text-center px-4 w-full">
        <p className="text-xs text-slate-500">
          {isConnected && !isListening && !isSpeaking && "Press spacebar to interrupt • Tap mic to speak"}
        </p>
      </div>
    </div>
  );
}
