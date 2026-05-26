import React, { useState, useEffect, useRef } from 'react';
import { useSubtitleEditor } from '../hooks/useSubtitleEditor';
import { useProjectStore } from '../store/projectStore';
import { SubtitleList } from '../components/SubtitleList';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { SubtitleStylePanel } from '../components/SubtitleStylePanel';
import { ArrowLeft, Type, Play, Pause, Upload, Plus, Save, ChevronRight, Palette, List, Move, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight, SkipBack, SkipForward, Repeat, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface SubtitlePosition {
  bottom?: number;
  left: number;
  top?: number;
}

export const SubtitleEditorScreen: React.FC = () => {
  const { 
    videoSrc, 
    videoDuration, 
    currentTime, 
    playing, 
    setCurrentTime, 
    setPlaying 
  } = useProjectStore();
  
  const {
    subtitles,
    isLoading,
    loadSubtitles,
    addNewSubtitle,
    editSubtitle,
    removeSubtitle,
    downloadSRT,
    goToNext,
    goBack,
  } = useSubtitleEditor();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showSubtitleList, setShowSubtitleList] = useState(true);
  const [subtitlePosition, setSubtitlePosition] = useState<SubtitlePosition>({ bottom: 40, left: 50 });
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitlePositionPanel, setShowSubtitlePositionPanel] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Handle video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsVideoPlaying(false);
      if (isLooping) {
        video.currentTime = 0;
        video.play();
        setIsVideoPlaying(true);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isLooping, setCurrentTime]);

  // Update playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isVideoPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isVideoPlaying, showControls]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLoadSRT = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadSubtitles(file);
    }
  };

  const handleSelectSubtitle = (subtitle: any) => {
    setCurrentTime(subtitle.startTime);
    if (videoRef.current) {
      videoRef.current.currentTime = subtitle.startTime;
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isVideoPlaying) {
      video.pause();
    } else {
      video.play();
    }
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

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !muted;
    setMuted(!muted);
  };

  const changeVolume = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && muted) {
      video.muted = false;
      setMuted(false);
    }
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainerRef.current.requestFullscreen();
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const moveSubtitle = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 0.5;
    let newPosition = { ...subtitlePosition };
    
    switch (direction) {
      case 'up':
        newPosition = { ...newPosition, bottom: Math.min(95, (newPosition.bottom || 40) + step), top: undefined };
        break;
      case 'down':
        newPosition = { ...newPosition, bottom: Math.max(5, (newPosition.bottom || 40) - step), top: undefined };
        break;
      case 'left':
        newPosition = { ...newPosition, left: Math.max(5, newPosition.left - step) };
        break;
      case 'right':
        newPosition = { ...newPosition, left: Math.min(95, newPosition.left + step) };
        break;
    }
    
    setSubtitlePosition(newPosition);
  };

  const resetSubtitlePosition = () => {
    setSubtitlePosition({ bottom: 40, left: 50 });
  };

  const handleSubtitlePositionChange = (position: SubtitlePosition) => {
    setSubtitlePosition(position);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b border-white/5 bg-neutral-900/50 shrink-0">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Type className="w-4 h-4" /> Subtitle Editor
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={downloadSRT} className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Subtitle Position Control Panel */}
      <div className="bg-neutral-800 border-b border-white/10 p-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-sm font-medium flex items-center gap-2">
            <Move className="w-4 h-4 text-red-500" />
            Subtitle Position
          </p>
          <button 
            onClick={resetSubtitlePosition}
            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs rounded transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => moveSubtitle('up')}
            className="p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
            title="Move Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <button 
            onClick={() => moveSubtitle('down')}
            className="p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
            title="Move Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button 
            onClick={() => moveSubtitle('left')}
            className="p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
            title="Move Left"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => moveSubtitle('right')}
            className="p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
            title="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-neutral-500 text-xs text-center mt-2">
          Position: Left {subtitlePosition.left}%, Bottom {subtitlePosition.bottom || 40}px
        </p>
      </div>

      {/* Main Content - Video on top, editing below */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Video Area - With full controls */}
        <div 
          ref={videoContainerRef}
          className="flex items-center justify-center p-2 bg-black shrink-0 min-h-[250px] relative"
          onMouseMove={() => setShowControls(true)}
        >
          {videoSrc ? (
            <div className="relative w-full" style={{ aspectRatio: '16/9', maxWidth: '100%' }}>
              <video
                ref={videoRef}
                src={videoSrc}
                autoPlay={playing}
                playsInline
                loop={isLooping}
                muted={muted}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />
              
              {/* Subtitle Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <SubtitleOverlay
                  subtitles={subtitles}
                  currentTime={currentTime}
                  position={subtitlePosition}
                  onPositionChange={handleSubtitlePositionChange}
                />
              </div>

              {/* Play/Pause Center Button */}
              {!isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Controls Bar - Always visible */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${showControls || !isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress Bar */}
                <div 
                  className="h-1 bg-white/30 rounded-full cursor-pointer group mb-2"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    if (videoRef.current) {
                      videoRef.current.currentTime = pos * duration;
                    }
                  }}
                >
                  <div 
                    className="h-full bg-red-500 rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button 
                      onClick={togglePlay}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isVideoPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white" />
                      )}
                    </button>

                    {/* Skip Back */}
                    <button 
                      onClick={skipBackward}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      title="Skip 10s back"
                    >
                      <SkipBack className="w-4 h-4 text-white" />
                    </button>

                    {/* Skip Forward */}
                    <button 
                      onClick={skipForward}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      title="Skip 10s forward"
                    >
                      <SkipForward className="w-4 h-4 text-white" />
                    </button>

                    {/* Volume */}
                    <div className="relative">
                      <button 
                        onClick={toggleMute}
                        className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      >
                        {muted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-white" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white" />
                        )}
                      </button>
                      {showVolumeSlider && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-800 rounded-lg p-2 shadow-lg">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => changeVolume(parseFloat(e.target.value))}
                            className="w-20 h-2 bg-neutral-600 rounded appearance-none cursor-pointer accent-red-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <span className="text-white/70 text-xs font-mono">
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Loop */}
                    <button 
                      onClick={() => setIsLooping(!isLooping)}
                      className={`p-1.5 rounded transition-colors ${isLooping ? 'text-red-500' : 'text-white/70 hover:text-white'}`}
                      title="Loop"
                    >
                      <Repeat className="w-4 h-4" />
                    </button>

                    {/* Speed */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="px-2 py-1 bg-white/20 rounded text-white text-xs font-medium"
                      >
                        {playbackSpeed}x
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 rounded-lg p-2 shadow-lg z-10">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handleSpeedChange(speed)}
                              className={`block w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                                playbackSpeed === speed
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

                    {/* Fullscreen */}
                    <button 
                      onClick={handleFullscreen}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center max-w-md">
              <div className="text-center text-neutral-500">
                <Type className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No video loaded</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation - Below video */}
        <div className="flex border-b border-white/5 bg-neutral-900/80 shrink-0">
          <button
            onClick={() => { setShowSubtitleList(!showSubtitleList); setShowStylePanel(false); }}
            className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              showSubtitleList
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Subtitles ({subtitles.length})</span>
          </button>
          <button
            onClick={() => { setShowStylePanel(!showStylePanel); setShowSubtitleList(false); }}
            className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              showStylePanel
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Style</span>
          </button>
        </div>

        {/* Tab Content - Below video */}
        <div className="flex-1 overflow-y-auto p-3 bg-neutral-900/50">
          {/* Subtitle List Panel */}
          {showSubtitleList && (
            <div className="space-y-3">
              {/* Import & Add Buttons */}
              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                  <Upload className="w-4 h-4" /> Import SRT
                  <input
                    type="file"
                    accept=".srt"
                    onChange={handleLoadSRT}
                    className="hidden"
                  />
                </label>
                <button onClick={addNewSubtitle} className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              
              {/* Subtitle List */}
              <SubtitleList
                subtitles={subtitles}
                currentTime={currentTime}
                onSelect={handleSelectSubtitle}
                onUpdate={editSubtitle}
                onDelete={removeSubtitle}
                onAdd={addNewSubtitle}
                videoDuration={videoDuration}
              />
            </div>
          )}

          {/* Style Panel */}
          {showStylePanel && (
            <SubtitleStylePanel />
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div className="p-2 border-t border-white/5 bg-neutral-900 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-neutral-400 text-xs font-mono">
                {formatDuration(currentTime)}
              </span>
            </div>
            
            <button onClick={goToNext} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default SubtitleEditorScreen;