import { useEffect, useRef } from 'react';

interface MinimapProps {
  content: string;
  scrollTop: number;
  containerHeight: number;
  contentHeight: number;
  onScroll: (position: number) => void;
}

export const Minimap = ({ 
  content, 
  scrollTop, 
  containerHeight, 
  contentHeight,
  onScroll 
}: MinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 100;
    canvas.height = containerHeight;

    // Clear canvas
    ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw simplified content representation
    const lines = content.split('\n');
    const lineHeight = Math.max(1, canvas.height / Math.max(lines.length, 1));

    lines.forEach((line, index) => {
      if (line.trim()) {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        const width = Math.min(canvas.width * 0.8, (line.length / 100) * canvas.width);
        ctx.fillRect(5, index * lineHeight, width, Math.max(1, lineHeight - 1));
      }
    });

    // Draw viewport indicator
    if (contentHeight > containerHeight) {
      const viewportHeight = (containerHeight / contentHeight) * canvas.height;
      const viewportTop = (scrollTop / contentHeight) * canvas.height;
      
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.fillRect(0, viewportTop, canvas.width, viewportHeight);
      
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, viewportTop, canvas.width, viewportHeight);
    }
  }, [content, scrollTop, containerHeight, contentHeight]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current && e.type !== 'click') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = y / rect.height;
    const newScrollTop = percentage * contentHeight;

    onScroll(newScrollTop);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="w-[100px] bg-[rgba(30,30,30,0.5)] border-l border-[var(--theme-border)] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleMouseMove}
      />
    </div>
  );
};
