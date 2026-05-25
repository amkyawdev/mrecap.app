import React, { useState, useEffect } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { TimelineSlider } from '../components/TimelineSlider';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { ArrowLeft, Video, Clapperboard, FolderOpen, ChevronRight, RotateCcw } from 'lucide-react';

export const VideoEditorScreen: React.FC = () => {
  const { subtitles } = useProjectStore();
  
  const {
    videoRef,
    videoSrc,
    videoDuration,
    currentTime,
    playing,
    trimStart,
    trimEnd,
    loadVideo,
    seek,
    handleTimeUpdate,
    setTrimRange,
    goToNext,
    reset,
  } = useVideoEditor();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLoadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadVideo(file);
    }
  };

  if (!videoSrc) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
          <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Video className="w-5 h-5" /> Select Video
          </h2>
          <div></div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className={`text-center p-8 md:p-12 max-w-md w-full transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Clapperboard className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-neutral-600 animate-bounce" />
            <h3 className="text-white text-lg md:text-xl font-semibold mb-2">Choose Your Video</h3>
            <p className="text-neutral-500 text-sm mb-6">Select a video file to get started with your recap</p>
            
            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-600/25 cursor-pointer text-sm">
              <FolderOpen className="w-4 h-4" />
              Browse Files
              <input
                type="file"
                accept="video/*"
                onChange={handleLoadVideo}
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
      <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
        <button onClick={reset} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Clapperboard className="w-5 h-5" /> Video Editor
        </h2>
        <span className="px-3 py-1 bg-white/5 rounded-full text-neutral-400 text-xs font-medium">
          {formatDuration(videoDuration)}
        </span>
      </header>

      <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
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

      <div className="p-4 md:p-6 bg-neutral-900 border-t border-white/5">
        <div className="mb-4 md:mb-6">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl md:text-2xl font-bold text-white tabular-nums">{formatDuration(currentTime)}</span>
            <span className="text-neutral-500 text-sm">/ {formatDuration(videoDuration)}</span>
          </div>
          
          <TimelineSlider
            duration={videoDuration}
            currentTime={currentTime}
            onSeek={seek}
            startTime={trimStart}
            endTime={trimEnd}
            onRangeChange={setTrimRange}
          />
          
          <div className="flex justify-between mt-3 text-xs text-neutral-500">
            <span>Trim: {formatDuration(trimStart)} - {formatDuration(trimEnd)}</span>
            <span className="text-red-500 font-medium">Duration: {formatDuration(trimEnd - trimStart)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={reset} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Start Over
          </button>
          
          <button onClick={goToNext} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
            Continue to Subtitles <ChevronRight className="w-4 h-4" />
          </button>
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

export default VideoEditorScreen;