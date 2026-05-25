import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioWaveform } from '../components/AudioWaveform';

export const AudioUploadScreen: React.FC = () => {
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [isLoaded, setIsLoaded] = useState(false);
  
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

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      <header className="screen-header">
        <button onClick={goBack} className="btn btn-secondary btn-icon">
          ←
        </button>
        <h2>🎙️ Audio Voiceover</h2>
        <div></div>
      </header>

      {!audioSrc ? (
        <div className="upload-options">
          <div className={`mode-tabs ${isLoaded ? 'loaded' : ''}`}>
            <button 
              className={`tab ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              <span className="tab-icon">📂</span>
              <span className="tab-label">Upload MP3</span>
            </button>
            <button 
              className={`tab ${mode === 'record' ? 'active' : ''}`}
              onClick={() => setMode('record')}
            >
              <span className="tab-icon">🎤</span>
              <span className="tab-label">Record Voice</span>
            </button>
          </div>
          
          <div className="mode-content">
            {mode === 'upload' ? (
              <div className="upload-section">
                <div className="upload-box">
                  <div className="upload-icon">🎵</div>
                  <p className="upload-text">Select an MP3 file to add as voiceover</p>
                  
                  <label className="btn btn-primary btn-lg">
                    <span>📂</span>
                    Browse Files
                    <input
                      type="file"
                      accept="audio/mpeg,audio/*"
                      onChange={handleUploadMP3}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                
                <div className="upload-formats">
                  <span className="format-badge">MP3</span>
                  <span className="format-badge">WAV</span>
                  <span className="format-badge">M4A</span>
                </div>
              </div>
            ) : (
              <div className="record-section">
                <div className={`record-visual ${isRecording ? 'recording' : ''}`}>
                  <div className="record-circle">
                    <span className="record-icon">{isRecording ? '🔴' : '🎤'}</span>
                  </div>
                  {isRecording && (
                    <div className="recording-pulse"></div>
                  )}
                </div>
                
                {isRecording && (
                  <div className="recording-info">
                    <span className="recording-time">{formatDuration(recordingDuration)}</span>
                    <span className="recording-label">Recording...</span>
                  </div>
                )}
                
                <div className="record-controls">
                  {isRecording ? (
                    <button onClick={stopRecording} className="btn btn-primary btn-lg">
                      <span>⏹</span>
                      Stop Recording
                    </button>
                  ) : (
                    <button onClick={startRecording} className="btn btn-primary btn-lg btn-glow">
                      <span>🎤</span>
                      Start Recording
                    </button>
                  )}
                </div>
                
                <p className="record-hint">
                  {isRecording ? 'Click to stop when finished' : 'Click to start recording your voice'}
                </p>
              </div>
            )}
          </div>
          
          <div className="skip-option">
            <button onClick={goToNext} className="btn btn-ghost">
              Skip this step →
            </button>
          </div>
        </div>
      ) : (
        <div className="audio-preview">
          <div className="audio-loaded">
            <div className="audio-icon">✅</div>
            <h3>Audio Added</h3>
            {audioFile && <p className="audio-name">{audioFile.name}</p>}
          </div>
          
          <div className="waveform-section">
            <AudioWaveform 
              audioSrc={audioSrc} 
              currentTime={0}
            />
          </div>
          
          <div className="volume-section">
            <div className="volume-header">
              <span className="volume-icon">🔊</span>
              <span className="volume-label">Volume</span>
              <span className="volume-value">{Math.round(audioVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioVolume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
          
          <div className="audio-actions">
            <button onClick={clearAudio} className="btn btn-secondary">
              🔄 Change Audio
            </button>
            
            <button onClick={goToNext} className="btn btn-primary btn-lg">
              Continue to Export
              <span>→</span>
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        .audio-upload-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .upload-options {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: var(--space-lg);
        }

        .mode-tabs {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-xs);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-xl);
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s ease;
        }

        .mode-tabs.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .mode-tabs .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mode-tabs .tab.active {
          background: var(--primary);
          color: var(--text-primary);
        }

        .tab-icon {
          font-size: 1.25rem;
        }

        .tab-label {
          font-weight: 600;
        }

        .mode-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .upload-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
        }

        .upload-box {
          text-align: center;
          padding: var(--space-2xl);
          background: var(--bg-card);
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 400px;
        }

        .upload-icon {
          font-size: 4rem;
          margin-bottom: var(--space-md);
        }

        .upload-text {
          color: var(--text-muted);
          margin-bottom: var(--space-lg);
        }

        .upload-formats {
          display: flex;
          gap: var(--space-sm);
        }

        .format-badge {
          padding: 4px 12px;
          background: var(--bg-elevated);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .record-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xl);
        }

        .record-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .record-circle {
          width: 120px;
          height: 120px;
          background: var(--bg-card);
          border: 3px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-normal);
        }

        .record-visual.recording .record-circle {
          border-color: var(--primary);
          box-shadow: 0 0 30px rgba(229, 9, 20, 0.3);
        }

        .record-icon {
          font-size: 3rem;
        }

        .recording-pulse {
          position: absolute;
          inset: 0;
          border: 3px solid var(--primary);
          border-radius: 50%;
          animation: recordingPulse 1.5s ease infinite;
        }

        @keyframes recordingPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .recording-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
        }

        .recording-time {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary);
          font-variant-numeric: tabular-nums;
        }

        .recording-label {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .record-controls {
          display: flex;
          gap: var(--space-md);
        }

        .record-hint {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .skip-option {
          margin-top: var(--space-xl);
          text-align: center;
        }

        .audio-preview {
          flex: 1;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .audio-loaded {
          text-align: center;
          padding: var(--space-xl);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
        }

        .audio-icon {
          font-size: 3rem;
          margin-bottom: var(--space-sm);
        }

        .audio-loaded h3 {
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .audio-name {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .waveform-section {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          min-height: 100px;
        }

        .volume-section {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .volume-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .volume-icon {
          font-size: 1.5rem;
        }

        .volume-label {
          flex: 1;
          color: var(--text-primary);
          font-weight: 600;
        }

        .volume-value {
          color: var(--primary);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .volume-slider {
          width: 100%;
          height: 8px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--bg-elevated);
          border-radius: var(--radius-full);
          outline: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: var(--shadow-md);
        }

        .audio-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: auto;
        }

        .audio-actions .btn span {
          margin-left: var(--space-xs);
        }

        @media (max-width: 480px) {
          .mode-tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioUploadScreen;