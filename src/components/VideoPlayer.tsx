import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);

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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video with Aspect Ratio Container */}
      <div 
        className="relative w-full bg-black"
        style={{ 
          paddingBottom: `${(1 / videoAspectRatio) * 100}%`,
          maxHeight: '70vh'
        }}
      >
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            src={src}
            autoPlay={autoPlay}
            playsInline
            muted={muted}
            onClick={handleVideoClick}
            className="w-full h-full object-contain cursor-pointer"
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
              <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress hover:h-1.5 transition-all"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seek(pos * duration);
          }}
        >
          <div 
            className="h-full bg-red-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {playing ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  changeVolume(val);
                  if (val > 0 && muted) toggleMute();
                }}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            <span className="text-white/80 text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button 
            onClick={handleFullscreen}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default VideoPlayer;