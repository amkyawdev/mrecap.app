import React, { useEffect, useState } from 'react';
import { Subtitle } from '../services/subtitleParser';

interface SubtitleOverlayProps {
  subtitles: Subtitle[];
  currentTime: number;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitles,
  currentTime,
}) => {
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);

  useEffect(() => {
    const active = subtitles.find(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    setActiveSubtitle(active || null);
  }, [currentTime, subtitles]);

  if (!activeSubtitle) return null;

  return (
    <div className="subtitle-overlay-container">
      <div className="subtitle-box">
        <p className="subtitle-text">{activeSubtitle.text}</p>
      </div>
      
      <style>{`
        .subtitle-overlay-container {
          position: absolute;
          bottom: 60px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .subtitle-box {
          background: rgba(0,0,0,0.75);
          padding: 12px 24px;
          border-radius: 8px;
          max-width: 90%;
        }
        .subtitle-text {
          color: white;
          font-size: 20px;
          text-align: center;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default SubtitleOverlay;