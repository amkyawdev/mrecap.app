import React, { useState, useEffect } from 'react';
import { useSubtitleEditor } from '../hooks/useSubtitleEditor';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { SubtitleList } from '../components/SubtitleList';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { SubtitleStylePanel } from '../components/SubtitleStylePanel';
import { ArrowLeft, Type, Play, Pause, Upload, Plus, Save, ChevronRight, Clock, Palette, X } from 'lucide-react';

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
      <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" /> Subtitle Editor
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              showStylePanel
                ? 'bg-red-600 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Style
          </button>
          <button onClick={downloadSRT} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

      <div className="bg-black aspect-video relative">
        {videoSrc && (
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
        )}
      </div>

      <div className="flex items-center justify-between p-3 md:p-4 bg-neutral-900 border-b border-white/5">
        <button onClick={togglePlay} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" /> Import SRT
            <input
              type="file"
              accept=".srt"
              onChange={handleLoadSRT}
              className="hidden"
            />
          </label>
          
          <button onClick={addNewSubtitle} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-3 md:p-4 bg-neutral-800/50 border-b border-white/5 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><Type className="w-3.5 h-3.5" /> {subtitles.length} subtitle{subtitles.length !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(videoDuration)}</span>
      </div>

      {/* Style Panel */}
      {showStylePanel && (
        <div className="border-b border-white/5">
          <SubtitleStylePanel />
        </div>
      )}

      <div className={`flex-1 overflow-y-auto transition-all duration-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
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

      <div className="p-4 bg-neutral-900 border-t border-white/5">
        <button onClick={goToNext} className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
          Continue to Audio <ChevronRight className="w-4 h-4" />
        </button>
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