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
    <div className="h-screen bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-2 border-b border-white/5 bg-neutral-900/50 shrink-0">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Type className="w-4 h-4" /> Subtitle Editor
        </h2>
        <button onClick={downloadSRT} className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
          <Save className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Content - Video on top, editing below */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Video Area - Fixed size */}
        <div className="flex items-center justify-center p-2 bg-black shrink-0 min-h-[250px]">
          {videoSrc ? (
            <div className="w-full max-w-full">
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
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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