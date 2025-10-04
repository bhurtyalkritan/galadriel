'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FileText, Image as ImageIcon, File } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you analyze data, build pipelines, and answer questions about your knowledge silo. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAiId, setSelectedAiId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nodes, connectors } = useCanvasStore();

  // Find AI nodes
  const aiNodes = nodes.filter(node => node.type === 'ai');
  
  // Find knowledge silo nodes
  const knowledgeSilos = nodes.filter(node => node.type === 'knowledge_silo');

  // Auto-select first AI if none selected and AIs exist
  useEffect(() => {
    if (aiNodes.length > 0 && !selectedAiId) {
      setSelectedAiId(aiNodes[0].id);
    }
  }, [aiNodes, selectedAiId]);

  // Get selected AI node
  const selectedAi = aiNodes.find(node => node.id === selectedAiId);

  // Get knowledge silos connected to selected AI
  const connectedKnowledgeSilos = selectedAi
    ? connectors
        .filter(conn => conn.toNode === selectedAi.id)
        .map(conn => nodes.find(node => node.id === conn.fromNode))
        .filter(node => node?.type === 'knowledge_silo')
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAi) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with selected AI's configuration
    setTimeout(() => {
      const modelInfo = selectedAi.config?.modelId || 'gpt-4';
      const contextInfo = connectedKnowledgeSilos.length > 0
        ? ` I have access to ${connectedKnowledgeSilos.length} knowledge silo(s): ${connectedKnowledgeSilos.map(k => k?.config?.name || 'Unnamed').join(', ')}.`
        : ' Note: No knowledge silos are connected to me yet.';
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `[Using ${selectedAi.config?.name || 'AI'} with ${modelInfo}]${contextInfo}\n\nI received: "${input}"\n\nThis is a placeholder response. Full AI integration coming soon!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${className} flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={20} className="text-accent" />
          <h3 className="text-sm font-medium">AI Assistant</h3>
          <Sparkles size={14} className="text-accent ml-auto animate-pulse" />
        </div>

        {/* AI Selection Dropdown */}
        {aiNodes.length > 0 ? (
          <div className="space-y-2">
            <label className="text-xs text-text-subtle">Select AI Model</label>
            <select
              value={selectedAiId}
              onChange={(e) => setSelectedAiId(e.target.value)}
              className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors"
            >
              {aiNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.config?.name || 'Unnamed AI'} ({node.config?.modelId || 'GPT-4'})
                </option>
              ))}
            </select>
            
            {/* Show connected knowledge silos */}
            {selectedAi && (
              <div className="text-xs text-text-subtle">
                {connectedKnowledgeSilos.length > 0 ? (
                  <div className="flex items-center gap-1">
                    <span>📚 Connected to:</span>
                    <span className="text-purple-400">
                      {connectedKnowledgeSilos.map(k => k?.config?.name || 'Knowledge Silo').join(', ')}
                    </span>
                  </div>
                ) : (
                  <div className="text-orange-400">⚠️ No knowledge silos connected</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-text-subtle bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            ⚠️ No AI nodes in canvas. Create an AI node to start chatting!
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-accent" />
              </div>
            )}
            
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-accent/20 border border-accent/30 text-text'
                  : 'bg-background/50 border border-border/30 text-text'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <div className="text-[10px] text-text-subtle mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-purple-400" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-accent" />
            </div>
            <div className="bg-background/50 border border-border/30 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/30">
        <div className="flex gap-2 mb-2">
          <button
            className="p-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/30 transition-colors text-xs"
            title="Attach file"
          >
            <File size={14} className="text-text-subtle" />
          </button>
          <button
            className="p-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/30 transition-colors text-xs"
            title="Attach image"
          >
            <ImageIcon size={14} className="text-text-subtle" />
          </button>
          <button
            className="p-2 rounded-lg bg-background/50 border border-border/30 hover:border-accent/30 transition-colors text-xs"
            title="Attach document"
          >
            <FileText size={14} className="text-text-subtle" />
          </button>
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data..."
            className="flex-1 bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent/50 transition-colors"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed border border-accent/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <Send size={16} className="text-accent" />
          </button>
        </div>

        <div className="text-[10px] text-text-subtle mt-2">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
