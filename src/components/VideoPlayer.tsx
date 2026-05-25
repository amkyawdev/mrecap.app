import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  overlay?: React.ReactNode;
  autoPlay?: boolean;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  src,
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
  overlay,
  autoPlay = false,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useImperativeHandle(ref, () => videoRef.current!, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      onLoadedMetadata?.(video.duration);
    };

    const handleEnded = () => {
      setPlaying(false);
      onEnded?.();
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onTimeUpdate, onEnded, onLoadedMetadata]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (playing && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [playing, showControls]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
    } else {
      video.play();
    }
  }, [playing]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const handleVideoClick = () => {
    setShowControls(true);
    togglePlay();
  };

  return (
    <div 
      className="video-player-container"
      onMouseMove={() => setShowControls(true)}
    >
      <div className="video-wrapper" onClick={handleVideoClick}>
        <video
          ref={videoRef}
          src={src}
          autoPlay={autoPlay}
          playsInline
          muted={muted}
          style={{
            width: '100%',
            backgroundColor: '#000',
            cursor: 'pointer',
          }}
        />
        
        {overlay && <div className="video-overlay">{overlay}</div>}
        
        {/* Play indicator */}
        {!playing && (
          <div className="play-indicator">
            <span>▶</span>
          </div>
        )}
      </div>

      <div className={`video-controls ${showControls ? 'visible' : ''}`}>
        <div className="controls-progress">
          <div 
            className="progress-track"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
          >
            <div 
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        <div className="controls-row">
          <div className="controls-left">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="control-btn"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '⏸' : '▶'}
            </button>

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="controls-right">
            <div className="volume-group">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="control-btn"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  e.stopPropagation();
                  const val = parseFloat(e.target.value);
                  changeVolume(val);
                  if (val > 0 && muted) toggleMute();
                }}
                className="volume-slider"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .video-player-container {
          position: relative;
          width: 100%;
          background: #000;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .play-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          pointer-events: none;
          opacity: 0.8;
        }

        .video-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: var(--space-md);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .video-controls.visible {
          opacity: 1;
        }

        .controls-progress {
          margin-bottom: var(--space-sm);
        }

        .progress-track {
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: var(--radius-full);
          cursor: pointer;
          position: relative;
        }

        .progress-track:hover {
          height: 6px;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: var(--radius-full);
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .progress-track:hover .progress-fill::after {
          opacity: 1;
        }

        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .controls-left, .controls-right {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .control-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .control-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .time-display {
          color: white;
          font-size: 0.875rem;
          font-variant-numeric: tabular-nums;
        }

        .volume-group {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .volume-slider {
          width: 80px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.3);
          border-radius: var(--radius-full);
          cursor: pointer;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default VideoPlayer;