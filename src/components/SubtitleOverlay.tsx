import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Subtitle } from '../services/subtitleParser';
import { useProjectStore } from '../store/projectStore';

interface SubtitleOverlayProps {
  subtitles: Subtitle[];
  currentTime: number;
  onPositionChange?: (position: { top?: number; bottom?: number; left?: number }) => void;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  currentTime,
  onPositionChange,
}) => {
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({ bottom: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { subtitleStyle } = useProjectStore();

  useEffect(() => {
    const active = subtitles.find(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    setActiveSubtitle(active || null);
  }, [currentTime, subtitles]);

  // Convert hex to rgba for background
  const backgroundColorWithOpacity = useMemo(() => {
    const hex = subtitleStyle.backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${subtitleStyle.backgroundOpacity})`;
  }, [subtitleStyle.backgroundColor, subtitleStyle.backgroundOpacity]);

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!overlayRef.current) return;
      
      const parent = overlayRef.current.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate percentage position
      const leftPercent = (x / rect.width) * 100;
      const topPercent = (y / rect.height) * 100;
      
      // Clamp to reasonable bounds
      const clampedX = Math.max(5, Math.min(95, leftPercent));
      const clampedY = Math.max(10, Math.min(90, topPercent));
      
      setPosition({ 
        left: clampedX,
        top: clampedY,
        bottom: undefined 
      });
      
      onPositionChange?.({ 
        left: clampedX,
        top: clampedY 
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onPositionChange]);

  if (!activeSubtitle) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute cursor-move"
      style={{
        left: position.left !== undefined ? `${position.left}%` : undefined,
        top: position.top !== undefined ? `${position.top}%` : undefined,
        bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
        transform: position.top ? 'translateY(-50%)' : position.left ? 'translateX(-50%)' : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          fontFamily: subtitleStyle.fontFamily,
          fontSize: `${subtitleStyle.fontSize}px`,
          color: subtitleStyle.textColor,
          fontWeight: subtitleStyle.fontWeight,
          backgroundColor: backgroundColorWithOpacity,
          textShadow: subtitleStyle.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          maxWidth: '90%',
          userSelect: 'none',
          border: isDragging ? '2px dashed rgba(255,255,255,0.5)' : '2px solid transparent',
        }}
      >
        <p style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
          fontWeight: 'inherit',
          textShadow: subtitleStyle.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.4,
        }}>
          {activeSubtitle.text}
        </p>
      </div>
    </div>
  );
};

export default SubtitleOverlay;