import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Subtitle } from '../services/subtitleParser';
import { useProjectStore } from '../store/projectStore';

interface SubtitleOverlayProps {
  subtitles: Subtitle[];
  currentTime: number;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  currentTime,
}) => {
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);
  const [position, setPosition] = useState({ bottom: 40, left: 50 });
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

  // Keyboard arrow controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeSubtitle) return;
    
    const step = e.shiftKey ? 10 : 2; // Shift for larger movement
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setPosition(prev => ({
          ...prev,
          bottom: Math.min(95, (prev.bottom || 0) + step),
          top: undefined
        }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setPosition(prev => ({
          ...prev,
          bottom: Math.max(5, (prev.bottom || 40) - step),
          top: undefined
        }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setPosition(prev => ({
          ...prev,
          left: Math.max(5, (prev.left || 50) - step)
        }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setPosition(prev => ({
          ...prev,
          left: Math.min(95, (prev.left || 50) + step)
        }));
        break;
    }
  }, [activeSubtitle]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!activeSubtitle) return null;

  // Position style
  const getPositionStyle = () => {
    const pos = position as { bottom?: number; left: number; top?: number };
    const baseStyle: React.CSSProperties = {
      left: `${pos.left}%`,
      transform: 'translateX(-50%)',
    };
    
    if (pos.top !== undefined) {
      return { ...baseStyle, top: `${pos.top}%`, bottom: undefined };
    }
    return { ...baseStyle, bottom: `${pos.bottom}px`, top: undefined };
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={getPositionStyle()}
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