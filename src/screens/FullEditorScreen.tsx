import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore, VideoClip, AudioTrack } from '../store/timelineStore';
import { useProjectStore } from '../store/projectStore';
import { Timeline } from '../components/Timeline';
import { EffectsPanel } from '../components/EffectsPanel';
import { TextOverlayEditor } from '../components/TextOverlayEditor';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { ArrowLeft, Download, Music, Type, Sparkles, Upload, Film, FolderOpen, Scissors, Trash2, Settings, Undo, Redo, ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause, Repeat, Maximize2, Volume2, VolumeX, Move, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight } from 'lucide-react';

type EditorTab = 'effects' | 'text' | 'audio';

interface SubtitlePosition {
  bottom?: number;
  left: number;
  top?: number;
}

export const FullEditorScreen: React.FC = () => {
  const { videoSrc, videoDuration, subtitles, setCurrentScreen } = useProjectStore();
  const {
    videoClips,
    audioTracks,
    currentTime,
    selectedClipId,
    setCurrentTime,
    addVideoClip,
    addAudioTrack,
    removeVideoClip,
    splitClipAt,
    reset,
    updateVideoClip,
  } = useTimelineStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<EditorTab>('effects');
  const [showExportModal, setShowExportModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentVideoDuration, setCurrentVideoDuration] = useState(0);
  const [subtitlePosition, setSubtitlePosition] = useState<SubtitlePosition>({ bottom: 40, left: 50 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize with video clip from project store
  useEffect(() => {
    if (videoSrc && videoClips.length === 0) {
      const clip: VideoClip = {
        id: `clip-${Date.now()}`,
        file: null,
        url: videoSrc,
        startTime: 0,
        duration: videoDuration,
        trimStart: 0,
        trimEnd: videoDuration,
        speed: 1,
        volume: 1,
        rotation: 0,
        flipH: false,
        flipV: false,
        cropLeft: 0,
        cropRight: 0,
        cropTop: 0,
        cropBottom: 0,
        effects: [],
        filter: null,
      };
      addVideoClip(clip);
      setPreviewUrl(videoSrc);
      setCurrentVideoDuration(videoDuration);
    }
  }, [videoSrc, videoDuration]);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        const clip: VideoClip = {
          id: `clip-${Date.now()}`,
          file,
          url,
          startTime: 0,
          duration: video.duration,
          trimStart: 0,
          trimEnd: video.duration,
          speed: 1,
          volume: 1,
          rotation: 0,
          flipH: false,
          flipV: false,
          cropLeft: 0,
          cropRight: 0,
          cropTop: 0,
          cropBottom: 0,
          effects: [],
          filter: null,
        };
        addVideoClip(clip);
        setCurrentVideoDuration(video.duration);
      };
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const audio = document.createElement('audio');
      audio.src = url;
      audio.onloadedmetadata = () => {
        const track: AudioTrack = {
          id: `audio-${Date.now()}`,
          file,
          url,
          name: file.name,
          startTime: 0,
          duration: audio.duration,
          trimStart: 0,
          trimEnd: audio.duration,
          volume: 1,
          fadeIn: 0,
          fadeOut: 0,
          muted: false,
        };
        addAudioTrack(track);
      };
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSplit = () => {
    if (selectedClipId) {
      splitClipAt(selectedClipId, currentTime);
    }
  };

  const handleDeleteClip = () => {
    if (selectedClipId) {
      removeVideoClip(selectedClipId);
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportFinal = () => {
    if (previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = 'edited-video.mp4';
      a.click();
    }
    setShowExportModal(false);
  };

  const handleBack = () => {
    reset();
    setCurrentScreen('home');
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setCurrentVideoDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isLooping) {
        video.currentTime = 0;
        video.play();
        setIsPlaying(true);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

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

  // Update loop
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
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
    video.currentTime = Math.min(displayDuration, video.currentTime + 10);
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

  const displayDuration = currentVideoDuration || videoDuration;
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  if (!videoSrc && !previewUrl) {
    return (
      <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/80 shrink-0">
          <button onClick={handleBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Film className="w-5 h-5" /> Video Editor
          </h2>
          <div></div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 md:p-12 max-w-md w-full">
            <div className="w-24 h-24 mx-auto mb-6 bg-neutral-800 rounded-2xl flex items-center justify-center">
              <Film className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-white text-xl md:text-2xl font-semibold mb-2">Choose Your Video</h3>
            <p className="text-neutral-500 text-sm mb-6">Select a video file to start editing</p>
            
            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-600/25 cursor-pointer">
              <FolderOpen className="w-5 h-5" />
              Browse Files
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b border-white/5 bg-neutral-900/80 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-white font-semibold text-sm">Video Editor</span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleSplit}
            disabled={!selectedClipId}
            className={`p-2 rounded-lg transition-colors ${selectedClipId ? 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDeleteClip}
            disabled={!selectedClipId}
            className={`p-2 rounded-lg transition-colors ${selectedClipId ? 'bg-white/5 hover:bg-red-600 text-neutral-400 hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExport}
            className="ml-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Content - Video on top, tools below */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
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

        {/* Video Preview - Top section with full controls */}
        <div 
          ref={videoContainerRef}
          className="bg-black flex items-center justify-center p-2 shrink-0 relative"
          onMouseMove={() => setShowControls(true)}
        >
          {previewUrl ? (
            <div className="relative w-full" style={{ aspectRatio: '16/9', maxWidth: '100%' }}>
              <video
                ref={videoRef}
                src={previewUrl}
                autoPlay={isPlaying}
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
                  onPositionChange={setSubtitlePosition}
                />
              </div>

              {/* Play/Pause Center Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Controls Bar */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress Bar */}
                <div 
                  className="h-1 bg-white/30 rounded-full cursor-pointer group mb-2"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    if (videoRef.current) {
                      videoRef.current.currentTime = pos * displayDuration;
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
                      {isPlaying ? (
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

                    {/* Time */}
                    <span className="text-white/70 text-xs font-mono">
                      {formatDuration(currentTime)} / {formatDuration(displayDuration)}
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
                <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No video loaded</p>
              </div>
            </div>
          )}
        </div>

        {/* Editing Tools - Below video */}
        <div className="flex-1 flex flex-col overflow-hidden border-t border-white/5">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/5 bg-neutral-900/80 shrink-0">
            <button
              onClick={() => setActiveTab('effects')}
              className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'effects'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Effects</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'text'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'audio'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 bg-neutral-900/50">
            {activeTab === 'effects' && (
              <EffectsPanel clipId={selectedClipId} />
            )}
            {activeTab === 'text' && (
              <TextOverlayEditor />
            )}
            {activeTab === 'audio' && (
              <AudioPanel onUpload={handleAudioUpload} tracks={audioTracks} />
            )}
          </div>
        </div>
      </div>

      {/* Timeline - Always at bottom */}
      <div className="bg-neutral-900 border-t border-white/5 shrink-0">
        <Timeline />
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-red-500" />
              Export Video
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-neutral-400 text-sm mb-2 block">Quality</label>
                <select className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>1080p (Full HD)</option>
                  <option>720p (HD)</option>
                  <option>480p (SD)</option>
                </select>
              </div>
              
              <div>
                <label className="text-neutral-400 text-sm mb-2 block">Format</label>
                <select className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>MP4 (H.264)</option>
                  <option>WebM</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportFinal}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Export Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Audio Panel Component
const AudioPanel: React.FC<{ onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; tracks: AudioTrack[] }> = ({ onUpload, tracks }) => {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Music className="w-4 h-4 text-red-500" />
        Audio Tracks
      </h3>

      <label className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 border border-dashed border-white/20">
        <Upload className="w-4 h-4" />
        Add Audio
        <input
          type="file"
          accept="audio/*"
          onChange={onUpload}
          className="hidden"
        />
      </label>

      <div className="space-y-2">
        {tracks.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-4">
            No audio tracks
          </p>
        ) : (
          tracks.map((track) => (
            <div key={track.id} className="bg-neutral-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-green-500" />
                <span className="text-white text-sm truncate flex-1">{track.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-xs">Vol:</span>
                <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${track.volume * 100}%` }}
                  />
                </div>
                <span className="text-neutral-500 text-xs">{Math.round(track.volume * 100)}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FullEditorScreen;
