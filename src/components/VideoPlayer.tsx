import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Repeat, Subtitles } from 'lucide-react';

interface SubtitlePosition {
  bottom?: number;
  left: number;
  top?: number;
}

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  overlay?: React.ReactNode;
  autoPlay?: boolean;
  showSubtitleControls?: boolean;
  subtitlePosition?: SubtitlePosition;
  onSubtitlePositionChange?: (position: SubtitlePosition) => void;
  onPlaybackSpeedChange?: (speed: number) => void;
  playbackSpeed?: number;
  loop?: boolean;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  src,
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
  overlay,
  autoPlay = false,
  showSubtitleControls = false,
  subtitlePosition,
  onSubtitlePositionChange,
  onPlaybackSpeedChange,
  playbackSpeed = 1,
  loop = false,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [internalSubtitlePosition, setInternalSubtitlePosition] = useState<SubtitlePosition>({ bottom: 40, left: 50 });
  const [showSubtitlePosition, setShowSubtitlePosition] = useState(false);
  const [isLooping, setIsLooping] = useState(loop);
  const [currentSpeed, setCurrentSpeed] = useState(playbackSpeed);

  const effectivePosition = subtitlePosition || internalSubtitlePosition;
  const hasExternalPositionControl = !!onSubtitlePositionChange;

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
      // Calculate aspect ratio
      if (video.videoWidth && video.videoHeight) {
        setVideoAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    const handleEnded = () => {
      setPlaying(false);
      if (isLooping) {
        video.currentTime = 0;
        video.play();
        setPlaying(true);
      } else {
        onEnded?.();
      }
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
  }, [onTimeUpdate, onEnded, onLoadedMetadata, isLooping]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (playing && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [playing, showControls]);

  // Update video playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = currentSpeed;
    }
  }, [currentSpeed]);

  // Update loop
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
    }
  }, [isLooping]);

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

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoClick = () => {
    setShowControls(true);
    togglePlay();
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 10);
  };

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    onPlaybackSpeedChange?.(speed);
    setShowSpeedMenu(false);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleSubtitleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 5;
    let newPosition: SubtitlePosition;
    
    switch (direction) {
      case 'up':
        newPosition = { ...effectivePosition, bottom: Math.min(95, (effectivePosition.bottom || 40) + step), top: undefined };
        break;
      case 'down':
        newPosition = { ...effectivePosition, bottom: Math.max(5, (effectivePosition.bottom || 40) - step), top: undefined };
        break;
      case 'left':
        newPosition = { ...effectivePosition, left: Math.max(5, effectivePosition.left - step) };
        break;
      case 'right':
        newPosition = { ...effectivePosition, left: Math.min(95, effectivePosition.left + step) };
        break;
    }
    
    if (hasExternalPositionControl) {
      onSubtitlePositionChange!(newPosition);
    } else {
      setInternalSubtitlePosition(newPosition);
    }
  };

  const toggleSubtitlePositionControls = () => {
    setShowSubtitlePosition(!showSubtitlePosition);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Container - Fixed aspect ratio 16:9, centered */}
      <div 
        className="relative w-full bg-black"
        style={{ 
          aspectRatio: '16/9',
          maxWidth: '100%',
        }}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay={autoPlay}
          playsInline
          muted={muted}
          onClick={handleVideoClick}
          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        />
        
        {/* Overlay for subtitles */}
        {overlay && (
          <div className="absolute inset-0 pointer-events-none">
            {overlay}
          </div>
        )}
        
        {/* Play/Pause Indicator */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-black/60 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar - Below video */}
      <div className={`w-full bg-neutral-900 px-3 py-2 flex items-center gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div 
          className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group/progress"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
        >
          <div 
            className="h-full bg-red-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Play Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors shrink-0"
        >
          {playing ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white fill-white" />
          )}
        </button>

        {/* Skip Back */}
        <button 
          onClick={(e) => { e.stopPropagation(); skipBackward(); }}
          className="p-1 hover:bg-white/20 rounded transition-colors shrink-0"
          title="Skip 10s back"
        >
          <SkipBack className="w-4 h-4 text-white" />
        </button>

        {/* Skip Forward */}
        <button 
          onClick={(e) => { e.stopPropagation(); skipForward(); }}
          className="p-1 hover:bg-white/20 rounded transition-colors shrink-0"
          title="Skip 10s forward"
        >
          <SkipForward className="w-4 h-4 text-white" />
        </button>

        {/* Volume */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="p-1 hover:bg-white/20 rounded transition-colors shrink-0 hidden sm:block"
        >
          {muted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Time */}
        <span className="text-white/70 text-xs font-mono shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Loop Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleLoop(); }}
          className={`p-1 hover:bg-white/20 rounded transition-colors shrink-0 ${isLooping ? 'text-red-500' : 'text-white/70'}`}
          title="Loop"
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Speed Button */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
            className="p-1 hover:bg-white/20 rounded transition-colors shrink-0 text-white/70 hover:text-white text-xs font-medium"
            title="Playback Speed"
          >
            {currentSpeed}x
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 rounded-lg p-2 shadow-lg z-10">
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={(e) => { e.stopPropagation(); handleSpeedChange(speed); }}
                  className={`block w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                    currentSpeed === speed
                      ? 'bg-red-600 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subtitle Position Controls */}
        {showSubtitleControls && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleSubtitlePositionControls(); }}
            className="p-1 hover:bg-white/20 rounded transition-colors shrink-0"
            title="Subtitle Position"
          >
            <Subtitles className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
        )}

        {/* Fullscreen */}
        <button 
          onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
          className="p-1 hover:bg-white/20 rounded transition-colors shrink-0"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Subtitle Position Controls Panel */}
      {showSubtitleControls && showSubtitlePosition && (
        <div className="absolute bottom-16 right-2 bg-neutral-800 rounded-lg p-3 shadow-lg z-20">
          <p className="text-white text-xs mb-2 font-medium">Subtitle Position</p>
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <button 
              onClick={() => handleSubtitleMove('up')}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white text-sm"
              title="Move Up"
            >
              ↑
            </button>
            <div></div>
            <button 
              onClick={() => handleSubtitleMove('left')}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white text-sm"
              title="Move Left"
            >
              ←
            </button>
            <button 
              onClick={() => {
                // Reset position
                const resetPos = { bottom: 40, left: 50 };
                if (hasExternalPositionControl) {
                  onSubtitlePositionChange!(resetPos);
                } else {
                  setInternalSubtitlePosition(resetPos);
                }
              }}
              className="p-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
              title="Reset"
            >
              ⌂
            </button>
            <button 
              onClick={() => handleSubtitleMove('right')}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white text-sm"
              title="Move Right"
            >
              →
            </button>
            <div></div>
            <button 
              onClick={() => handleSubtitleMove('down')}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-white text-sm"
              title="Move Down"
            >
              ↓
            </button>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default VideoPlayer;