import React, { useState, useEffect } from 'react';
import { useSubtitleEditor } from '../hooks/useSubtitleEditor';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { SubtitleList } from '../components/SubtitleList';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { SubtitleStylePanel } from '../components/SubtitleStylePanel';
import { ArrowLeft, Type, Play, Pause, Upload, Plus, Save, ChevronRight, Clock, Palette, X, List } from 'lucide-react';

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

  const [isLoaded, setIsLoaded] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showSubtitleList, setShowSubtitleList] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLoadSRT = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadSubtitles(file);
    }
  };

  const handleSelectSubtitle = (subtitle: any) => {
    setCurrentTime(subtitle.startTime);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-3 md:p-4 border-b border-white/5 bg-neutral-900/50 shrink-0">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" /> Subtitle Editor
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className={`px-2 md:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              showStylePanel
                ? 'bg-red-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Style</span>
          </button>
          <button onClick={downloadSRT} className="px-2 md:px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content - Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Subtitle List */}
        <div className={`${showSubtitleList ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-white/5 bg-neutral-900/30 flex flex-col shrink-0`}>
          {showSubtitleList && (
            <>
              {/* Sidebar Header */}
              <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-neutral-400" />
                  <span className="text-white text-sm font-medium">Subtitles ({subtitles.length})</span>
                </div>
                <button
                  onClick={() => setShowSubtitleList(false)}
                  className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subtitle Actions */}
              <div className="p-3 border-b border-white/5 flex items-center gap-2 shrink-0">
                <label className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> Import
                  <input
                    type="file"
                    accept=".srt"
                    onChange={handleLoadSRT}
                    className="hidden"
                  />
                </label>
                <button onClick={addNewSubtitle} className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Subtitle List */}
              <div className="flex-1 overflow-y-auto">
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
            </>
          )}
        </div>

        {/* Right Area - Video & Controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-4xl">
              {videoSrc ? (
                <VideoPlayer
                  src={videoSrc}
                  onTimeUpdate={handleTimeUpdate}
                  autoPlay={playing}
                  overlay={
                    <SubtitleOverlay
                      subtitles={subtitles}
                      currentTime={currentTime}
                    />
                  }
                />
              ) : (
                <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <Type className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No video loaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-3 md:p-4 bg-neutral-900 border-t border-white/5 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {!showSubtitleList && (
                  <button
                    onClick={() => setShowSubtitleList(true)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    <List className="w-5 h-5" />
                  </button>
                )}
                <button onClick={togglePlay} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className="text-neutral-400 text-sm font-mono">
                  {formatDuration(currentTime)} / {formatDuration(videoDuration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-xs hidden sm:inline">{subtitles.length} subtitles</span>
                <button onClick={goToNext} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Style Panel - Right Sidebar */}
        {showStylePanel && (
          <div className="w-80 border-l border-white/5 bg-neutral-900/30 overflow-y-auto shrink-0">
            <div className="p-4">
              <SubtitleStylePanel />
            </div>
          </div>
        )}
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