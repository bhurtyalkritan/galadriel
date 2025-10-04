'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '@/store/canvas';

export function KeyboardControls() {
  const { canvasOffset, setCanvasOffset, canvasScale, setCanvasScale } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const panStep = 50; // pixels to move per keypress
      const zoomStep = 0.1; // zoom increment

      switch (e.key.toLowerCase()) {
        case 'arrowup':
          e.preventDefault();
          setCanvasOffset({ x: canvasOffset.x, y: canvasOffset.y + panStep });
          break;
        
        case 'arrowdown':
          e.preventDefault();
          setCanvasOffset({ x: canvasOffset.x, y: canvasOffset.y - panStep });
          break;
        
        case 'arrowleft':
          e.preventDefault();
          setCanvasOffset({ x: canvasOffset.x + panStep, y: canvasOffset.y });
          break;
        
        case 'arrowright':
          e.preventDefault();
          setCanvasOffset({ x: canvasOffset.x - panStep, y: canvasOffset.y });
          break;
        
        case 'q':
          e.preventDefault();
          // Zoom out
          const newScaleOut = Math.max(0.1, canvasScale - zoomStep);
          setCanvasScale(newScaleOut);
          break;
        
        case 'e':
          e.preventDefault();
          // Zoom in
          const newScaleIn = Math.min(3, canvasScale + zoomStep);
          setCanvasScale(newScaleIn);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvasOffset, canvasScale, setCanvasOffset, setCanvasScale]);

  return null; // This component doesn't render anything
}
