import React from 'react';
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

  const handleLoadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadVideo(file);
    }
  };

  if (!videoSrc) {
    return (
      <div className="video-editor-screen">
        <div className="upload-section">
          <h2>Select a Video</h2>
          <input
            type="file"
            accept="video/*"
            onChange={handleLoadVideo}
            className="file-input"
          />
          <label className="btn btn-primary">
            📂 Choose Video
          </label>
        </div>
        
        <button onClick={reset} className="btn btn-secondary back-btn">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="video-editor-screen">
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
      
      <div className="controls">
        <TimelineSlider
          duration={videoDuration}
          currentTime={currentTime}
          onSeek={seek}
          startTime={trimStart}
          endTime={trimEnd}
          onRangeChange={setTrimRange}
        />
        
        <div className="buttons">
          <button onClick={goToNext} className="btn btn-primary">
            Next: Subtitles →
          </button>
          
          <button onClick={reset} className="btn btn-secondary">
            Start Over
          </button>
        </div>
      </div>
      
      <style>{`
        .video-editor-screen {
          min-height: 100vh;
          background: #FF0000;
          display: flex;
          flex-direction: column;
        }
        .video-container {
          flex: 1;
          background: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .controls {
          padding: 16px;
          background: rgba(0,0,0,0.3);
        }
        .buttons {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .upload-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .file-input {
          display: none;
        }
        .back-btn {
          position: fixed;
          top: 20px;
          left: 20px;
        }
      `}</style>
    </div>
  );
};

export default VideoEditorScreen;