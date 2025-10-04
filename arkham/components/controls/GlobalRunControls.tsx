'use client';

import React, { useState } from 'react';
import { Play, Square, Settings, AlertTriangle, X } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { cn } from '@/lib/utils';

export function GlobalRunControls() {
  const { isGlobalRunning, runAll, stopAll, runningGroups } = useCanvasStore();
  const hasRunningGroups = runningGroups.size > 0;
  const [showWarning, setShowWarning] = useState(false);

  const handleRunAll = () => {
    setShowWarning(true);
  };

  const confirmRunAll = () => {
    setShowWarning(false);
    runAll();
  };

  return (
    <>
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border-2 border-amber-500/50 rounded-xl p-6 max-w-md mx-4 shadow-2xl shadow-amber-500/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-100 mb-1">
                  Warning: Global Run
                </h3>
                <p className="text-sm text-amber-200/70">
                  Running all groups at once may cause performance issues or crashes
                </p>
              </div>
              <button
                onClick={() => setShowWarning(false)}
                className="text-text-subtle hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-amber-100">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                <span>Heavy resource consumption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-100">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                <span>Potential browser slowdown</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-100">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                <span>Risk of workflow interruption</span>
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-200/80">
                <span className="font-semibold text-blue-300">💡 Recommendation:</span> Run individual groups for better control and stability. Use the play button next to each group name.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 px-4 py-2 bg-card hover:bg-card/80 border border-border/30 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRunAll}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Run Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-2.5 shadow-lg">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <Settings 
            className={cn(
              "w-4 h-4 text-accent transition-all",
              (isGlobalRunning || hasRunningGroups) && "animate-spin"
            )}
          />
          <span className="text-sm font-medium text-text">
            {isGlobalRunning ? 'Running All...' : hasRunningGroups ? `${runningGroups.size} Active` : 'Ready'}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border/50" />

        {/* Run/Stop Button */}
        <button
          onClick={isGlobalRunning ? stopAll : handleRunAll}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all",
            isGlobalRunning
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
          )}
          disabled={hasRunningGroups && !isGlobalRunning}
        >
          {isGlobalRunning ? (
            <>
              <Square className="w-3.5 h-3.5" />
              Stop All
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Run All
            </>
          )}
        </button>

        {/* Running indicator */}
        {(isGlobalRunning || hasRunningGroups) && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-200" />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
