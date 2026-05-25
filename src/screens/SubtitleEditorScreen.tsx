import React from 'react';
import { useSubtitleEditor } from '../hooks/useSubtitleEditor';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { SubtitleList } from '../components/SubtitleList';
import { SubtitleOverlay } from '../components/SubtitleOverlay';

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
    <div className="subtitle-editor-screen">
      <div className="header">
        <button onClick={goBack} className="btn btn-secondary">
          ← Back
        </button>
        <h2>📝 Subtitle Editor</h2>
        <button onClick={downloadSRT} className="btn btn-secondary">
          💾 Export SRT
        </button>
      </div>
      
      <div className="video-preview">
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
      
      <div className="subtitle-controls">
        <button onClick={togglePlay} className="btn btn-primary">
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        
        <label className="btn btn-secondary">
          📂 Load SRT
          <input
            type="file"
            accept=".srt"
            onChange={handleLoadSRT}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      <SubtitleList
        subtitles={subtitles}
        currentTime={currentTime}
        onSelect={handleSelectSubtitle}
        onUpdate={editSubtitle}
        onDelete={removeSubtitle}
        onAdd={addNewSubtitle}
        videoDuration={videoDuration}
      />
      
      <div className="footer">
        <button onClick={goToNext} className="btn btn-primary">
          Next: Audio →
        </button>
      </div>
      
      <style>{`
        .subtitle-editor-screen {
          min-height: 100vh;
          background: #FF0000;
          display: flex;
          flex-direction: column;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(0,0,0,0.3);
        }
        .header h2 {
          color: white;
          margin: 0;
        }
        .video-preview {
          background: black;
          aspect-ratio: 16/9;
        }
        .subtitle-controls {
          display: flex;
          gap: 12px;
          padding: 16px;
        }
        .footer {
          padding: 16px;
          background: rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default SubtitleEditorScreen;