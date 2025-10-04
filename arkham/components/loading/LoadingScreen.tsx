'use client';

import React, { useState, useEffect } from 'react';

export function LoadingScreen() {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const fullText = 'arkham.';
  const stages = [
    'INITIALIZING SECURE CONNECTION...',
    'ESTABLISHING ENCRYPTED CHANNEL...',
    'LOADING INTELLIGENCE MODULES...',
    'VERIFYING CLEARANCE LEVEL...',
    'ACCESSING OPERATIONAL CANVAS...',
    'SYSTEM READY'
  ];

  useEffect(() => {
    // Typewriter effect for main title
    if (text.length < fullText.length) {
      const timeout = setTimeout(() => {
        setText(fullText.slice(0, text.length + 1));
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [text]);

  useEffect(() => {
    // Cursor blink
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Progress bar and stages
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update stage based on progress
    const newStage = Math.floor((progress / 100) * stages.length);
    setStage(Math.min(newStage, stages.length - 1));
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(111, 163, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(111, 163, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }} />
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent to-transparent h-1 animate-scan" />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-accent/50" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-accent/50" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-accent/50" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-accent/50" />

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Classification banner */}
        <div className="mb-8 text-xs tracking-[0.3em] text-red-400 font-mono animate-pulse">
          ░ CLASSIFIED ░ TOP SECRET ░ EYES ONLY ░
        </div>

        {/* Main title with typewriter */}
        <div className="mb-12">
          <div className="text-6xl font-light tracking-wider text-accent mb-2 font-mono">
            {text}
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>▮</span>
          </div>
          <div className="text-xs tracking-[0.4em] text-text-subtle/60 font-mono">
            OPERATIONAL INTELLIGENCE PLATFORM
          </div>
        </div>

        {/* Status display */}
        <div className="space-y-4 mb-8">
          <div className="text-sm font-mono text-accent/80 h-6 flex items-center justify-center">
            <span className="inline-block min-w-[400px] text-left">
              {stages[stage]}
              <span className="inline-block animate-pulse ml-1">
                {progress < 100 && '▮'}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-96 mx-auto">
            <div className="h-1 bg-surface/30 rounded-full overflow-hidden border border-accent/20">
              <div 
                className="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50 transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-accent/50 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 text-xs font-mono text-text-subtle/60 text-right">
              {progress.toFixed(0)}% COMPLETE
            </div>
          </div>
        </div>

        {/* System info */}
        <div className="space-y-1 text-[10px] font-mono text-text-subtle/40">
          <div className="flex items-center justify-center gap-4">
            <span>SYS.ID: AKM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            <span>|</span>
            <span>ENCRYPTION: AES-256</span>
            <span>|</span>
            <span>PROTOCOL: HTTPS/3.0</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              SECURE
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              VERIFIED
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              AUTHORIZED
            </span>
          </div>
        </div>

        {/* Glitch effect elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-px bg-accent animate-glitchLine" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 left-0 w-full h-px bg-accent animate-glitchLine" style={{ animationDelay: '0.7s' }} />
          <div className="absolute top-2/3 left-0 w-full h-px bg-accent animate-glitchLine" style={{ animationDelay: '1.4s' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes gridScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        
        @keyframes glitchLine {
          0%, 90%, 100% { opacity: 0; transform: translateX(-100%); }
          92%, 98% { opacity: 1; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
