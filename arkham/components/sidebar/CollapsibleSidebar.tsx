'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Database, MessageSquare, Square } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { Inspector } from '@/components/inspector/Inspector';
import { FileUpload } from '@/components/upload/FileUpload';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { GroupsPanel } from '@/components/groups/GroupsPanel';

interface CollapsibleSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function CollapsibleSidebar({ open, onToggle }: CollapsibleSidebarProps) {
  const [activeTab, setActiveTab] = useState('inspector');
  const { selectedNode } = useCanvasStore();

  const tabs = [
    { id: 'inspector', label: 'Inspector', icon: Settings, component: Inspector },
    { id: 'datasets', label: 'Datasets', icon: Database, component: FileUpload },
    { id: 'chat', label: 'Chat', icon: MessageSquare, component: ChatPanel },
    { id: 'groups', label: 'Groups', icon: Square, component: GroupsPanel },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Inspector;

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border border-border/50 text-text hover:text-accent p-2 rounded-lg transition-all duration-200 hover:bg-card/90"
      >
        {open ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className={`fixed top-0 right-0 h-full bg-panel/90 backdrop-blur-sm border-l border-border/30 transition-all duration-300 ease-out z-40 ${
        open ? 'w-[480px] translate-x-0' : 'w-0 translate-x-full'
      }`}>
        {open && (
          <div className="h-full flex flex-col">
            <div className="border-b border-border/30 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <h1 className="text-sm font-medium">Arkham</h1>
              </div>
              
              <div className="flex bg-background/50 rounded-lg p-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-all duration-200 flex-1 justify-center ${
                        activeTab === tab.id
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-text-subtle hover:text-text hover:bg-card/50'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ActiveComponent className="h-full border-none bg-transparent" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
