import React, { useState, useEffect } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { useProjectStore } from '../store/projectStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { TimelineSlider } from '../components/TimelineSlider';
import { SubtitleOverlay } from '../components/SubtitleOverlay';

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
      <div className="video-editor-screen">
        <header className="screen-header">
          <button onClick={reset} className="btn btn-secondary btn-icon">
            ←
          </button>
          <h2>🎥 Select Video</h2>
          <div></div>
        </header>

        <div className="upload-center">
          <div className={`upload-zone ${isLoaded ? 'loaded' : ''}`}>
            <div className="upload-icon">📹</div>
            <h3>Choose Your Video</h3>
            <p>Select a video file to get started with your recap</p>
            
            <label className="btn btn-primary btn-lg">
              <span>📂</span>
              Browse Files
              <input
                type="file"
                accept="video/*"
                onChange={handleLoadVideo}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <style>{`
          .video-editor-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: var(--bg-primary);
          }
          
          .upload-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-xl);
          }
          
          .upload-zone {
            text-align: center;
            padding: var(--space-2xl);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          
          .upload-zone.loaded {
            opacity: 1;
            transform: translateY(0);
          }
          
          .upload-icon {
            font-size: 5rem;
            margin-bottom: var(--space-lg);
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .upload-zone h3 {
            color: var(--text-primary);
            font-size: 1.5rem;
            margin-bottom: var(--space-sm);
          }
          
          .upload-zone p {
            color: var(--text-muted);
            margin-bottom: var(--space-xl);
            max-width: 300px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="video-editor-screen">
      <header className="screen-header">
        <button onClick={reset} className="btn btn-secondary btn-icon">
          ←
        </button>
        <h2>🎬 Video Editor</h2>
        <div className="header-info">
          <span className="duration-badge">
            {formatDuration(videoDuration)}
          </span>
        </div>
      </header>

      <div className="video-container">
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

      <div className="editor-controls">
        <div className="timeline-section">
          <div className="time-labels">
            <span className="time-current">{formatDuration(currentTime)}</span>
            <span className="time-total">/ {formatDuration(videoDuration)}</span>
          </div>
          
          <TimelineSlider
            duration={videoDuration}
            currentTime={currentTime}
            onSeek={seek}
            startTime={trimStart}
            endTime={trimEnd}
            onRangeChange={setTrimRange}
          />
          
          <div className="trim-info">
            <span>Trim: {formatDuration(trimStart)} - {formatDuration(trimEnd)}</span>
            <span className="trim-duration">
              Duration: {formatDuration(trimEnd - trimStart)}
            </span>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={reset} className="btn btn-ghost">
            🔄 Start Over
          </button>
          
          <button onClick={goToNext} className="btn btn-primary btn-lg">
            Continue to Subtitles
            <span>→</span>
          </button>
        </div>
      </div>

      <style>{`
        .video-editor-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .duration-badge {
          padding: 6px 12px;
          background: var(--bg-card);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .video-container {
          flex: 1;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          position: relative;
        }

        .editor-controls {
          background: var(--bg-secondary);
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: var(--space-lg);
        }

        .timeline-section {
          margin-bottom: var(--space-lg);
        }

        .time-labels {
          display: flex;
          align-items: baseline;
          gap: var(--space-xs);
          margin-bottom: var(--space-md);
        }

        .time-current {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }

        .time-total {
          font-size: 1rem;
          color: var(--text-muted);
        }

        .trim-info {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-md);
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .trim-duration {
          color: var(--primary);
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: var(--space-md);
          justify-content: flex-end;
        }

        .action-buttons .btn span {
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

export default VideoEditorScreen;