import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore, VideoClip, AudioTrack } from '../store/timelineStore';
import { useProjectStore } from '../store/projectStore';
import { Timeline } from '../components/Timeline';
import { EffectsPanel } from '../components/EffectsPanel';
import { TextOverlayEditor } from '../components/TextOverlayEditor';
import { ArrowLeft, Download, Music, Type, Sparkles, Play, Pause, Upload, Film, FolderOpen } from 'lucide-react';

type EditorTab = 'effects' | 'text' | 'audio';

export const FullEditorScreen: React.FC = () => {
  const { videoSrc, videoDuration, setCurrentScreen } = useProjectStore();
  const {
    videoClips,
    audioTracks,
    currentTime,
    isPlaying,
    selectedClipId,
    setCurrentTime,
    setIsPlaying,
    addVideoClip,
    addAudioTrack,
    reset,
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<EditorTab>('effects');
  const [showExportModal, setShowExportModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
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

  const selectedClip = videoClips.find(c => c.id === selectedClipId);

  if (!videoSrc && !previewUrl) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
          <button onClick={handleBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Film className="w-5 h-5" /> Select Video
          </h2>
          <div></div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`text-center p-8 md:p-12 max-w-md w-full transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Clapperboard className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-neutral-600 animate-bounce" />
            <h3 className="text-white text-lg md:text-xl font-semibold mb-2">Choose Your Video</h3>
            <p className="text-neutral-500 text-sm mb-6">Select a video file to start editing with full tools</p>
            
            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-600/25 cursor-pointer text-sm">
              <FolderOpen className="w-4 h-4" />
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
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
        <button onClick={handleBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Film className="w-5 h-5 text-red-500" /> Video Editor
        </h2>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-80 border-r border-white/5 bg-neutral-900/30 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('effects')}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === 'effects'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1" />
              Effects
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === 'text'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4 mx-auto mb-1" />
              Text
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === 'audio'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4 mx-auto mb-1" />
              Audio
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
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

        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <div className="bg-black flex-1 flex items-center justify-center relative">
            {previewUrl ? (
              <video
                ref={videoRef}
                src={previewUrl}
                className="max-w-full max-h-full"
                onTimeUpdate={handleTimeUpdate}
                style={{
                  transform: `rotate(${(selectedClip?.rotation || 0)}deg)`,
                  scale: selectedClip?.flipH ? '-1, 1' : selectedClip?.flipV ? '1, -1' : '1, 1',
                }}
              />
            ) : (
              <div className="text-center">
                <Film className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500 mb-4">No video loaded</p>
                <label className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors inline-block">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Playback Controls Overlay */}
            {previewUrl && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/80 rounded-full px-4 py-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-neutral-900 border-t border-white/5">
            <Timeline />
          </div>
        </div>
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
                  <option>MOV</option>
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

// Audio Panel Component
const AudioPanel: React.FC<{ onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; tracks: AudioTrack[] }> = ({ onUpload, tracks }) => {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Music className="w-4 h-4 text-red-500" />
        Audio Tracks
      </h3>

      {/* Upload Button */}
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

      {/* Track List */}
      <div className="space-y-2">
        {tracks.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-4">
            No audio tracks yet
          </p>
        ) : (
          tracks.map((track) => (
            <div key={track.id} className="bg-neutral-800 rounded-lg p-3">
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

// Clapperboard icon component
const Clapperboard: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
    <path d="m6.2 5.3 3.1 3.9" />
    <path d="m12.4 3.4 3.1 4" />
    <path d="M12 14l-4 9h8l-4-9Z" />
    <path d="M5 21h14" />
  </svg>
);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default FullEditorScreen;
