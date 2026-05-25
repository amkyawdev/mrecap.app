import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore, VideoClip, AudioTrack } from '../store/timelineStore';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { Timeline } from '../components/Timeline';
import { EffectsPanel } from '../components/EffectsPanel';
import { TextOverlayEditor } from '../components/TextOverlayEditor';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { ArrowLeft, Download, Music, Type, Sparkles, Upload, Film, FolderOpen, Scissors, Trash2, Settings, Undo, Redo } from 'lucide-react';

type EditorTab = 'effects' | 'text' | 'audio';

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
  } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<EditorTab>('effects');
  const [showExportModal, setShowExportModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentVideoDuration, setCurrentVideoDuration] = useState(0);

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

  const displayDuration = currentVideoDuration || videoDuration;

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
      <header className="flex items-center justify-between p-2 md:p-3 border-b border-white/5 bg-neutral-900/80 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-white">
            <Film className="w-5 h-5 text-red-500" />
            <span className="font-semibold hidden sm:inline">Video Editor</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors" title="Redo">
            <Redo className="w-4 h-4" />
          </button>
          <button 
            onClick={handleSplit}
            disabled={!selectedClipId}
            className={`p-2 rounded-lg transition-colors ${selectedClipId ? 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
            title="Split clip"
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDeleteClip}
            disabled={!selectedClipId}
            className={`p-2 rounded-lg transition-colors ${selectedClipId ? 'bg-white/5 hover:bg-red-600 text-neutral-400 hover:text-white' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
            title="Delete clip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors hidden md:block" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExport}
            className="ml-2 px-3 md:px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-72 md:w-80 border-r border-white/5 bg-neutral-900/50 flex flex-col shrink-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/5 shrink-0">
            <button
              onClick={() => setActiveTab('effects')}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'effects'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Effects
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'text'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-3 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
                activeTab === 'audio'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              Audio
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
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
        <div className="flex-1 flex flex-col bg-black">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-5xl">
              {previewUrl && (
                <VideoPlayer
                  src={previewUrl}
                  onTimeUpdate={handleTimeUpdate}
                  autoPlay={false}
                  overlay={
                    <SubtitleOverlay
                      subtitles={subtitles}
                      currentTime={currentTime}
                    />
                  }
                />
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-neutral-900 border-t border-white/5 shrink-0">
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
