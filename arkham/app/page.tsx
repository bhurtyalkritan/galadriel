'use client';

import React, { useState } from 'react';
import { Canvas } from '@/components/canvas/Canvas';
import { CollapsibleSidebar } from '@/components/sidebar/CollapsibleSidebar';
import { FloatingActionButton } from '@/components/floating/FloatingActionButton';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex bg-gradient-to-br from-black via-gray-900 to-black text-text relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]"></div>
      
      <div className="flex-1 relative z-10">
        <Canvas />
      </div>
      
      <FloatingActionButton />
      
      <CollapsibleSidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
