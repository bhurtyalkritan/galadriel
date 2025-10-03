'use client';

import React, { useState } from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { CollapsibleSidebar } from '@/components/sidebar/CollapsibleSidebar';
import { FloatingActionButton } from '@/components/floating/FloatingActionButton';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex bg-gradient-to-br from-black via-gray-900 to-black text-text relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex-1 relative" style={{ zIndex: 1 }}>
        <Canvas />
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <span className="text-sm text-text-subtle/40 font-light tracking-wider">arkham.</span>
      </div>
      
      <FloatingActionButton />
      
      <CollapsibleSidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
