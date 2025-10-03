'use client';

import React, { useCallback } from 'react';
import { Upload, FileText, Database } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas';
import { generateId } from '@/lib/utils';
import Papa from 'papaparse';

interface FileUploadProps {
  className?: string;
}

export function FileUpload({ className }: FileUploadProps) {
  const { addDataset, addNode } = useCanvasStore();

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        Papa.parse(content, {
          header: true,
          complete: (results) => {
            const schema = Object.keys(results.data[0] || {}).map(key => ({
              name: key,
              type: 'string' as const,
              nullable: true,
            }));
            
            const dataset = {
              id: generateId(),
              name: file.name,
              schema,
              sample: results.data.slice(0, 10),
              storageRef: `memory://${file.name}`,
              rowCount: results.data.length,
              createdAt: new Date().toISOString(),
            };
            
            addDataset(dataset);
            
            const node = {
              id: generateId(),
              type: 'dataset' as const,
              config: { datasetId: dataset.id },
              inputs: [],
              outputs: [dataset.id],
              position: { x: 100, y: 100 },
              owner: 'current-user',
              createdAt: new Date().toISOString(),
            };
            
            addNode(node);
          }
        });
      }
    };
    
    reader.readAsText(file);
  }, [addDataset, addNode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleFileUpload);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(handleFileUpload);
  }, [handleFileUpload]);

  return (
    <div className={`${className}`}>
      <div className="p-4">
        <div
          className="border-2 border-dashed border-border/30 rounded-lg p-6 text-center hover:border-accent/50 transition-all duration-200 bg-card/20 backdrop-blur-sm"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload size={24} className="mx-auto mb-2 text-text-subtle" />
          <p className="text-sm text-text-subtle mb-2">
            Drop files here or click to upload
          </p>
          <input
            type="file"
            multiple
            accept=".csv,.json,.geojson,.parquet"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary text-xs cursor-pointer inline-block"
          >
            Choose Files
          </label>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="text-xs text-text-subtle mb-2">Supported formats:</div>
          <div className="flex items-center gap-2 text-xs text-text-subtle">
            <FileText size={14} />
            <span>CSV, JSON, GeoJSON</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-subtle">
            <Database size={14} />
            <span>Parquet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
