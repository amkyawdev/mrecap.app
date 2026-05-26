import React, { useState, useEffect } from 'react';
import { useSubtitleEditor } from '../hooks/useSubtitleEditor';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { SubtitleList } from '../components/SubtitleList';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { SubtitleStylePanel } from '../components/SubtitleStylePanel';
import { ArrowLeft, Type, Play, Pause, Upload, Plus, Save, ChevronRight, Clock, Palette, X, List, ChevronLeft, Move, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight } from 'lucide-react';

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

  const [isLoaded, setIsLoaded] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showSubtitleList, setShowSubtitleList] = useState(true);
  const [subtitlePosition, setSubtitlePosition] = useState<SubtitlePosition>({ bottom: 40, left: 50 });
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitlePositionPanel, setShowSubtitlePositionPanel] = useState(false);

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

  const handleSubtitlePositionChange = (position: SubtitlePosition) => {
    setSubtitlePosition(position);
  };

  const moveSubtitle = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 5;
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
          {/* Subtitle Position Toggle Button */}
          <button 
            onClick={() => setShowSubtitlePositionPanel(!showSubtitlePositionPanel)}
            className={`p-2 rounded-lg transition-colors ${showSubtitlePositionPanel ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
            title="Subtitle Position Controls"
          >
            <Move className="w-4 h-4" />
          </button>
          <button onClick={downloadSRT} className="px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Subtitle Position Control Panel */}
      {showSubtitlePositionPanel && (
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
      )}

      {/* Main Content - Video on top, editing below */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Video Area - Fixed size */}
        <div className="flex items-center justify-center p-2 bg-black shrink-0 min-h-[250px] relative">
          {videoSrc ? (
            <div className="w-full max-w-full">
              <VideoPlayer
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                autoPlay={playing}
                playbackSpeed={playbackSpeed}
                loop={isLooping}
                showSubtitleControls={true}
                subtitlePosition={subtitlePosition}
                onSubtitlePositionChange={handleSubtitlePositionChange}
                onPlaybackSpeedChange={setPlaybackSpeed}
                overlay={
                  <SubtitleOverlay
                    subtitles={subtitles}
                    currentTime={currentTime}
                    position={subtitlePosition}
                    onPositionChange={handleSubtitlePositionChange}
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
              {/* Loop Toggle */}
              <button 
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-lg transition-colors ${isLooping ? 'text-red-500' : 'text-neutral-500 hover:text-white'}`}
                title="Loop"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Speed Control */}
              <select 
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-neutral-800 text-white text-xs px-2 py-1 rounded border border-white/10"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
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