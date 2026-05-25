import React, { useCallback, useState, useEffect } from 'react';

interface TimelineSliderProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  startTime?: number;
  endTime?: number;
  onRangeChange?: (start: number, end: number) => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  duration,
  currentTime,
  onSeek,
  startTime = 0,
  endTime,
  onRangeChange,
}) => {
  const [trimStart, setTrimStart] = useState(startTime);
  const [trimEnd, setTrimEnd] = useState(endTime || duration);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setTrimStart(startTime);
    setTrimEnd(endTime || duration);
  }, [startTime, endTime, duration]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !duration) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = Math.max(0, Math.min(duration, percent * duration));
      
      onSeek(time);
    },
    [duration, onSeek]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      handleSeek(e);
    },
    [isDragging, handleSeek]
  );

  const updateTrimRange = useCallback(
    (type: 'start' | 'end', value: number) => {
      const newStart = type === 'start' ? value : trimStart;
      const newEnd = type === 'end' ? value : trimEnd;
      
      if (newEnd > newStart) {
        if (type === 'start') {
          setTrimStart(value);
        } else {
          setTrimEnd(value);
        }
        onRangeChange?.(newStart, newEnd);
      }
    },
    [trimStart, trimEnd, onRangeChange]
  );

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const trimStartPercent = duration ? (trimStart / duration) * 100 : 0;
  const trimEndPercent = duration ? (trimEnd / duration) * 100 : 100;

  return (
    <div className="timeline-slider">
      <div
        ref={containerRef}
        className="timeline-track"
        onClick={handleSeek}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        {/* Background track */}
        <div className="track-bg" />
        
        {/* Trim range highlight */}
        <div
          className="track-trim-range"
          style={{
            left: `${trimStartPercent}%`,
            width: `${trimEndPercent - trimStartPercent}%`,
          }}
        />
        
        {/* Playhead position */}
        <div
          className="track-playhead"
          style={{ left: `${progressPercent}%` }}
        />
        
        {/* Trim handles */}
        <div
          className="trim-handle trim-handle-start"
          style={{ left: `${trimStartPercent}%` }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        />
        <div
          className="trim-handle trim-handle-end"
          style={{ left: `${trimEndPercent}%` }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        />
      </div>
      
      <style>{`
        .timeline-slider {
          padding: 16px;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
        }
        .timeline-track {
          position: relative;
          height: 32px;
          user-select: none;
        }
        .track-bg {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
        .track-trim-range {
          position: absolute;
          top: 0;
          bottom: 0;
          background: rgba(255,255,255,0.4);
        }
        .track-playhead {
          position: absolute;
          top: -4px;
          bottom: -4px;
          width: 4px;
          background: white;
          border-radius: 2px;
          transform: translateX(-50%);
        }
        .trim-handle {
          position: absolute;
          top: -8px;
          bottom: -8px;
          width: 16px;
          background: white;
          border-radius: 4px;
          cursor: ew-resize;
          transform: translateX(-50%);
        }
        .trim-handle:hover {
          background: #FF0000;
        }
        .time-display {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 14px;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default TimelineSlider;