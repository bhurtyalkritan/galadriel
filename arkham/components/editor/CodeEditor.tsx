'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: 'javascript' | 'python' | 'sql' | 'typescript';
  height?: string;
  readOnly?: boolean;
  minimap?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = '200px',
  readOnly = false,
  minimap = false
}: CodeEditorProps) {
  return (
    <div className="border border-border/30 rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: minimap },
          fontSize: 12,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          wrappingIndent: 'indent',
          folding: true,
          renderLineHighlight: 'all',
          cursorStyle: 'line',
          cursorBlinking: 'smooth',
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          padding: {
            top: 8,
            bottom: 8,
          },
        }}
        beforeMount={(monaco) => {
          // Custom dark theme matching Arkham aesthetic
          monaco.editor.defineTheme('arkham-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
              { token: 'keyword', foreground: '6FA3FF' },
              { token: 'string', foreground: '9ECE6A' },
              { token: 'number', foreground: 'E5C07B' },
              { token: 'type', foreground: '56B6C2' },
              { token: 'function', foreground: 'C678DD' },
              { token: 'variable', foreground: 'E06C75' },
            ],
            colors: {
              'editor.background': '#151720',
              'editor.foreground': '#E8E8E8',
              'editor.lineHighlightBackground': '#1F2330',
              'editor.selectionBackground': '#6FA3FF33',
              'editorCursor.foreground': '#6FA3FF',
              'editorWhitespace.foreground': '#3B4252',
              'editorLineNumber.foreground': '#4C566A',
              'editorLineNumber.activeForeground': '#6FA3FF',
              'scrollbarSlider.background': '#6FA3FF33',
              'scrollbarSlider.hoverBackground': '#6FA3FF66',
            },
          });
        }}
        onMount={(editor, monaco) => {
          monaco.editor.setTheme('arkham-dark');
        }}
      />
    </div>
  );
}
