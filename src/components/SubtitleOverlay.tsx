import React, { useEffect, useState, useMemo } from 'react';
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

  if (!activeSubtitle) return null;

  return (
    <div
      className="absolute left-4 right-4 flex justify-center pointer-events-none"
      style={{
        bottom: subtitleStyle.position === 'bottom' ? '60px' : undefined,
        top: subtitleStyle.position === 'top' ? '60px' : undefined,
        transform: subtitleStyle.position === 'center' ? 'translateY(-50%)' : undefined,
      }}
    >
      <div
        style={{
          fontFamily: subtitleStyle.fontFamily,
          fontSize: `${subtitleStyle.fontSize}px`,
          color: subtitleStyle.textColor,
          fontWeight: subtitleStyle.fontWeight,
          backgroundColor: backgroundColorWithOpacity,
          textShadow: subtitleStyle.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
          padding: '10px 20px',
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