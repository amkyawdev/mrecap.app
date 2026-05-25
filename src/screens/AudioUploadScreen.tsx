import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioWaveform } from '../components/AudioWaveform';

export const AudioUploadScreen: React.FC = () => {
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  
  const {
    audioSrc,
    audioFile,
    audioVolume,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    loadAudioFile,
    clearAudio,
    changeVolume,
    goToNext,
    goBack,
  } = useAudioRecorder();

  const handleUploadMP3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadAudioFile(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-upload-screen">
      <div className="header">
        <button onClick={goBack} className="btn btn-secondary">
          ← Back
        </button>
        <h2>🎙️ Audio</h2>
        <div></div>
      </div>
      
      {!audioSrc ? (
        <div className="upload-options">
          <div className="mode-tabs">
            <button 
              className={`tab ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              📂 Upload MP3
            </button>
            <button 
              className={`tab ${mode === 'record' ? 'active' : ''}`}
              onClick={() => setMode('record')}
            >
              🎤 Record Voice
            </button>
          </div>
          
          {mode === 'upload' ? (
            <div className="upload-section">
              <label className="btn btn-primary btn-large">
                📂 Select MP3 File
                <input
                  type="file"
                  accept="audio/mpeg,audio/*"
                  onChange={handleUploadMP3}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <div className="record-section">
              <div className="record-icon">
                {isRecording ? '🔴' : '🎤'}
              </div>
              
              {isRecording && (
                <div className="recording-time">
                  Recording: {formatDuration(recordingDuration)}
                </div>
              )}
              
              {isRecording ? (
                <button onClick={stopRecording} className="btn btn-primary">
                  ⏹ Stop Recording
                </button>
              ) : (
                <button onClick={startRecording} className="btn btn-primary">
                  🎤 Start Recording
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="audio-preview">
          <h3>✅ Audio Loaded</h3>
          
          <AudioWaveform 
            audioSrc={audioSrc} 
            currentTime={0}
          />
          
          <div className="volume-control">
            <label>Volume: {Math.round(audioVolume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioVolume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="audio-actions">
            <button onClick={clearAudio} className="btn btn-secondary">
              🔄 Change Audio
            </button>
            
            <button onClick={goToNext} className="btn btn-primary">
              Next: Export →
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        .audio-upload-screen {
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
        .upload-options {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }
        .mode-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .tab {
          flex: 1;
          padding: 16px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }
        .tab.active {
          background: white;
          color: #FF0000;
        }
        .upload-section, .record-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .btn-large {
          padding: 24px 48px;
          font-size: 1.5rem;
        }
        .record-icon {
          font-size: 80px;
        }
        .recording-time {
          font-size: 2rem;
          color: white;
        }
        .audio-preview {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .audio-preview h3 {
          color: white;
          text-align: center;
        }
        .volume-control {
          background: rgba(0,0,0,0.3);
          padding: 16px;
          border-radius: 8px;
        }
        .volume-control label {
          color: white;
          display: block;
          margin-bottom: 8px;
        }
        .volume-control input {
          width: 100%;
        }
        .audio-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>
    </div>
  );
};

export default AudioUploadScreen;