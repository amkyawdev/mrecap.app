import React, { useState, useEffect } from 'react';
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

  const [isLoaded, setIsLoaded] = useState(false);

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
    <div className="subtitle-editor-screen">
      <header className="screen-header">
        <button onClick={goBack} className="btn btn-secondary btn-icon">
          ←
        </button>
        <h2>📝 Subtitle Editor</h2>
        <button onClick={downloadSRT} className="btn btn-ghost btn-sm">
          💾 Export
        </button>
      </header>

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

      <div className="subtitle-toolbar">
        <button onClick={togglePlay} className="btn btn-secondary btn-icon">
          {playing ? '⏸' : '▶'}
        </button>
        
        <div className="toolbar-actions">
          <label className="btn btn-secondary btn-sm">
            📂 Import SRT
            <input
              type="file"
              accept=".srt"
              onChange={handleLoadSRT}
              style={{ display: 'none' }}
            />
          </label>
          
          <button onClick={addNewSubtitle} className="btn btn-primary btn-sm">
            ➕ Add Subtitle
          </button>
        </div>
      </div>

      <div className="subtitle-stats">
        <span className="stat-item">
          📝 {subtitles.length} subtitle{subtitles.length !== 1 ? 's' : ''}
        </span>
        <span className="stat-item">
          ⏱️ {formatDuration(videoDuration)}
        </span>
      </div>

      <div className={`subtitle-list-container ${isLoaded ? 'loaded' : ''}`}>
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

      <div className="screen-footer">
        <button onClick={goToNext} className="btn btn-primary btn-lg">
          Continue to Audio
          <span>→</span>
        </button>
      </div>

      <style>{`
        .subtitle-editor-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .video-preview {
          background: #000;
          aspect-ratio: 16/9;
          position: relative;
        }

        .subtitle-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-secondary);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .toolbar-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .subtitle-stats {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-md) var(--space-lg);
          background: var(--bg-card);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .stat-item {
          font-size: 0.875rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .subtitle-list-container {
          flex: 1;
          overflow-y: auto;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s ease;
        }

        .subtitle-list-container.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .screen-footer {
          padding: var(--space-lg);
          background: var(--bg-secondary);
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .screen-footer .btn {
          width: 100%;
        }

        .screen-footer .btn span {
          margin-left: var(--space-xs);
        }
      `}</style>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default SubtitleEditorScreen;