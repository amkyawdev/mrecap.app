import React, { useEffect, useState } from 'react';
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

  if (!activeSubtitle) return null;

  // Calculate position based on style
  const getPositionStyle = () => {
    switch (subtitleStyle.position) {
      case 'top':
        return { top: '10%', bottom: 'auto', transform: 'translateX(-50%)' };
      case 'center':
        return { top: '50%', bottom: 'auto', transform: 'translate(-50%, -50%)' };
      case 'bottom':
      default:
        return { bottom: '60px', top: 'auto', transform: 'translateX(-50%)' };
    }
  };

  return (
    <div className="subtitle-overlay-container" style={getPositionStyle()}>
      <div
        className="subtitle-box"
        style={{
          fontFamily: subtitleStyle.fontFamily,
          fontSize: `${subtitleStyle.fontSize}px`,
          color: subtitleStyle.textColor,
          fontWeight: subtitleStyle.fontWeight,
          backgroundColor: subtitleStyle.backgroundColor,
          opacity: subtitleStyle.backgroundOpacity,
          textShadow: subtitleStyle.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <p className="subtitle-text" style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
          fontWeight: 'inherit',
          textShadow: 'inherit',
        }}>{activeSubtitle.text}</p>
      </div>
      
      <style>{`
        .subtitle-overlay-container {
          position: absolute;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .subtitle-box {
          padding: 12px 24px;
          border-radius: 8px;
          max-width: 90%;
        }
        .subtitle-text {
          text-align: center;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default SubtitleOverlay;