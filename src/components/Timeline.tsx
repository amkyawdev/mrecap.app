import React, { useRef, useState, useEffect } from 'react';
import { useTimelineStore, VideoClip, AudioTrack, TextOverlay } from '../store/timelineStore';
import { Scissors, Trash2, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineProps {
  onClipSelect?: (clipId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onClipSelect }) => {
  const {
    videoClips,
    audioTracks,
    subtitles,
    timelineDuration,
    currentTime,
    zoom,
    selectedClipId,
    toolMode,
    isPlaying,
    setCurrentTime,
    setZoom,
    setToolMode,
    setSelectedClipId,
    setIsPlaying,
    splitClipAt,
    removeVideoClip,
  } = useTimelineStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pixelsPerSecond = 50 * zoom;
  const timelineWidth = timelineDuration * pixelsPerSecond;

  // Time ruler markers
  const timeMarkers = [];
  const markerInterval = zoom < 2 ? 5 : zoom < 5 ? 2 : 1;
  for (let i = 0; i <= timelineDuration; i += markerInterval) {
    timeMarkers.push(i);
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(timelineDuration, x / pixelsPerSecond));
    setCurrentTime(newTime);
  };

  const handleClipClick = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    setSelectedClipId(clipId);
    onClipSelect?.(clipId);
  };

  const handleSplit = () => {
    if (selectedClipId) {
      splitClipAt(selectedClipId, currentTime);
    }
  };

  const handleDelete = () => {
    if (selectedClipId) {
      removeVideoClip(selectedClipId);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-neutral-900 rounded-xl overflow-hidden">
      {/* Timeline Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(timelineDuration)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(zoom - 0.5)}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/50 text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(zoom + 0.5)}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setToolMode('select')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              toolMode === 'select' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Select
          </button>
          <button
            onClick={handleSplit}
            disabled={!selectedClipId}
            className={`p-1.5 rounded transition-colors ${
              selectedClipId ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title="Split at playhead"
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={!selectedClipId}
            className={`p-1.5 rounded transition-colors ${
              selectedClipId ? 'bg-white/5 hover:bg-red-600 text-white/70 hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div 
        ref={timelineRef}
        className="relative overflow-x-auto"
        onClick={handleTimelineClick}
        style={{ height: '200px' }}
      >
        <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
          {/* Time Ruler */}
          <div className="h-6 bg-neutral-800 border-b border-white/10 flex items-end relative">
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute text-[10px] text-neutral-500"
                style={{ left: `${time * pixelsPerSecond}px` }}
              >
                {formatTime(time)}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 bg-red-500 z-20 pointer-events-none"
            style={{ 
              left: `${currentTime * pixelsPerSecond}px`,
              height: '100%',
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-sm -translate-x-1/2" />
          </div>

          {/* Video Track */}
          <div className="h-16 bg-neutral-800/50 border-b border-white/5 relative">
            <div className="absolute top-1 left-2 text-[10px] text-white/40 uppercase tracking-wider">Video</div>
            <div className="pt-5">
              {videoClips.map((clip) => (
                <div
                  key={clip.id}
                  onClick={(e) => handleClipClick(e, clip.id)}
                  className={`absolute top-1 h-10 rounded cursor-pointer transition-all ${
                    selectedClipId === clip.id 
                      ? 'bg-red-600 ring-2 ring-red-400' 
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                  style={{
                    left: `${clip.startTime * pixelsPerSecond}px`,
                    width: `${clip.duration * pixelsPerSecond}px`,
                  }}
                >
                  <div className="px-2 py-1 truncate text-white text-xs">
                    {clip.url ? 'Video Clip' : 'Empty Clip'}
                  </div>
                  {/* Trim handles */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 cursor-ew-resize hover:bg-white/60" />
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 cursor-ew-resize hover:bg-white/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Audio Track */}
          <div className="h-16 bg-neutral-800/50 border-b border-white/5 relative">
            <div className="absolute top-1 left-2 text-[10px] text-white/40 uppercase tracking-wider">Audio</div>
            <div className="pt-5">
              {audioTracks.map((track) => (
                <div
                  key={track.id}
                  className="absolute top-1 h-10 rounded bg-green-600 hover:bg-green-500 cursor-pointer transition-all"
                  style={{
                    left: `${track.startTime * pixelsPerSecond}px`,
                    width: `${track.duration * pixelsPerSecond}px`,
                  }}
                >
                  <div className="px-2 py-1 truncate text-white text-xs">
                    {track.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtitles Track */}
          <div className="h-14 bg-neutral-800/50 relative">
            <div className="absolute top-1 left-2 text-[10px] text-white/40 uppercase tracking-wider">Subtitles</div>
            <div className="pt-4">
              {subtitles.map((sub) => (
                <div
                  key={sub.id}
                  className="absolute top-0 h-8 rounded bg-yellow-600/70 hover:bg-yellow-500/70 cursor-pointer transition-all"
                  style={{
                    left: `${sub.startTime * pixelsPerSecond}px`,
                    width: `${(sub.endTime - sub.startTime) * pixelsPerSecond}px`,
                  }}
                >
                  <div className="px-2 py-1 truncate text-white text-xs">
                    {sub.text.substring(0, 20)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default Timeline;
