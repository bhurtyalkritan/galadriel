'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichDocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichDocumentEditor({ content, onChange, onImageUpload }: RichDocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '<p><br></p>';
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    if (document.queryCommandState('justifyLeft')) formats.add('left');
    if (document.queryCommandState('justifyCenter')) formats.add('center');
    if (document.queryCommandState('justifyRight')) formats.add('right');
    setActiveFormats(formats);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let imageSrc: string;
      if (onImageUpload) {
        imageSrc = await onImageUpload(file);
      } else {
        // Create local data URL
        imageSrc = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      // Insert image at cursor
      const img = `<img src="${imageSrc}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
      document.execCommand('insertHTML', false, img);
      handleInput();
    } catch (error) {
      console.error('Failed to upload image:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertHeading = (level: number) => {
    document.execCommand('formatBlock', false, `h${level}`);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    value, 
    tooltip,
    isActive,
    onClick
  }: { 
    icon: any; 
    command?: string; 
    value?: string; 
    tooltip: string;
    isActive?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick ? onClick() : execCommand(command!, value);
      }}
      className={cn(
        "p-1.5 rounded hover:bg-accent/20 transition-colors",
        isActive && "bg-accent/30 text-accent"
      )}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div 
        className="flex flex-wrap gap-1 p-2 bg-card/50 border-b border-border/30"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Text Formatting */}
        <div className="flex gap-0.5 pr-2 border-r border-border/30">
          <ToolbarButton 
            icon={Bold} 
            command="bold" 
            tooltip="Bold (Ctrl+B)"
            isActive={activeFormats.has('bold')}
          />
          <ToolbarButton 
            icon={Italic} 
            command="italic" 
            tooltip="Italic (Ctrl+I)"
            isActive={activeFormats.has('italic')}
          />
          <ToolbarButton 
            icon={Underline} 
            command="underline" 
            tooltip="Underline (Ctrl+U)"
            isActive={activeFormats.has('underline')}
          />
        </div>

        {/* Headings */}
        <div className="flex gap-0.5 pr-2 border-r border-border/30">
          <ToolbarButton 
            icon={Heading1} 
            onClick={() => insertHeading(1)} 
            tooltip="Heading 1"
          />
          <ToolbarButton 
            icon={Heading2} 
            onClick={() => insertHeading(2)} 
            tooltip="Heading 2"
          />
          <ToolbarButton 
            icon={Heading3} 
            onClick={() => insertHeading(3)} 
            tooltip="Heading 3"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-0.5 pr-2 border-r border-border/30">
          <ToolbarButton 
            icon={List} 
            command="insertUnorderedList" 
            tooltip="Bullet List"
            isActive={activeFormats.has('ul')}
          />
          <ToolbarButton 
            icon={ListOrdered} 
            command="insertOrderedList" 
            tooltip="Numbered List"
            isActive={activeFormats.has('ol')}
          />
          <ToolbarButton 
            icon={Quote} 
            command="formatBlock" 
            value="blockquote" 
            tooltip="Quote"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-0.5 pr-2 border-r border-border/30">
          <ToolbarButton 
            icon={AlignLeft} 
            command="justifyLeft" 
            tooltip="Align Left"
            isActive={activeFormats.has('left')}
          />
          <ToolbarButton 
            icon={AlignCenter} 
            command="justifyCenter" 
            tooltip="Align Center"
            isActive={activeFormats.has('center')}
          />
          <ToolbarButton 
            icon={AlignRight} 
            command="justifyRight" 
            tooltip="Align Right"
            isActive={activeFormats.has('right')}
          />
        </div>

        {/* Insert */}
        <div className="flex gap-0.5">
          <ToolbarButton 
            icon={LinkIcon} 
            onClick={insertLink} 
            tooltip="Insert Link"
          />
          <ToolbarButton 
            icon={ImageIcon} 
            onClick={handleImageClick} 
            tooltip="Insert Image"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onMouseUp={updateActiveFormats}
          onKeyUp={updateActiveFormats}
          className="min-h-full p-4 outline-none prose prose-invert max-w-none
                     prose-headings:text-text prose-headings:font-bold
                     prose-h1:text-2xl prose-h1:mb-4
                     prose-h2:text-xl prose-h2:mb-3
                     prose-h3:text-lg prose-h3:mb-2
                     prose-p:text-text prose-p:mb-2
                     prose-strong:text-text prose-strong:font-bold
                     prose-em:text-text prose-em:italic
                     prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-2
                     prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-2
                     prose-li:text-text prose-li:mb-1
                     prose-blockquote:border-l-4 prose-blockquote:border-accent 
                     prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-text-subtle
                     prose-a:text-accent prose-a:underline prose-a:cursor-pointer
                     prose-img:rounded-lg prose-img:shadow-lg"
          style={{
            minHeight: '200px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
