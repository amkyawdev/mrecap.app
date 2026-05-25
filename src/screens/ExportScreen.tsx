import React, { useState, useEffect } from 'react';
import { useExport } from '../hooks/useExport';
import { ProgressBar } from '../components/ProgressBar';

export const ExportScreen: React.FC = () => {
  const {
    videoSrc,
    audioSrc,
    subtitles,
    exportProgress,
    exportedVideoSrc,
    isExporting,
    exportError,
    startExport,
    shareVideo,
    saveToGallery,
    goBack,
    restart,
  } = useExport();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (isExporting) {
    return (
      <div className="export-screen">
        <div className="exporting-state animate-fade-in">
          <div className="export-icon-container">
            <div className="export-spinner"></div>
            <span className="export-icon">🎬</span>
          </div>
          
          <h2>Creating Your Recap</h2>
          <p className="export-status">Please wait while we process your video...</p>
          
          <div className="progress-section">
            <ProgressBar progress={exportProgress} label="Rendering" />
            <span className="progress-percent">{Math.round(exportProgress)}%</span>
          </div>
          
          <div className="processing-steps">
            <div className={`step ${exportProgress > 0 ? 'active' : ''}`}>
              <span className="step-icon">📹</span>
              <span>Processing video</span>
            </div>
            <div className={`step ${exportProgress > 33 ? 'active' : ''}`}>
              <span className="step-icon">📝</span>
              <span>Adding subtitles</span>
            </div>
            <div className={`step ${exportProgress > 66 ? 'active' : ''}`}>
              <span className="step-icon">🎵</span>
              <span>Mixing audio</span>
            </div>
            <div className={`step ${exportProgress >= 100 ? 'active' : ''}`}>
              <span className="step-icon">✅</span>
              <span>Finalizing</span>
            </div>
          </div>
        </div>
        
        <style>{`
          .export-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            padding: var(--space-xl);
          }

          .exporting-state {
            text-align: center;
            max-width: 400px;
          }

          .export-icon-container {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto var(--space-xl);
          }

          .export-spinner {
            position: absolute;
            inset: 0;
            border: 4px solid var(--bg-card);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .export-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2.5rem;
          }

          .exporting-state h2 {
            color: var(--text-primary);
            margin-bottom: var(--space-sm);
          }

          .export-status {
            color: var(--text-muted);
            margin-bottom: var(--space-xl);
          }

          .progress-section {
            margin-bottom: var(--space-2xl);
          }

          .progress-percent {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            margin-top: var(--space-md);
            display: block;
          }

          .processing-steps {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
            text-align: left;
          }

          .step {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md);
            background: var(--bg-card);
            border-radius: var(--radius-md);
            color: var(--text-muted);
            transition: all var(--transition-normal);
          }

          .step.active {
            color: var(--text-primary);
            background: var(--bg-elevated);
          }

          .step-icon {
            font-size: 1.25rem;
          }
        `}</style>
      </div>
    );
  }

  if (exportedVideoSrc) {
    return (
      <div className="export-screen">
        <div className={`success-state ${isLoaded ? 'loaded' : ''}`}>
          <div className="success-icon">🎉</div>
          
          <h2>Export Complete!</h2>
          <p className="success-message">Your video recap is ready to share</p>
          
          <div className="export-summary">
            <div className="summary-item">
              <span className="summary-icon">📹</span>
              <div className="summary-content">
                <span className="summary-label">Video</span>
                <span className="summary-value">{videoSrc ? 'Ready' : 'Missing'}</span>
              </div>
              <span className={`summary-status ${videoSrc ? 'complete' : 'warning'}`}>
                {videoSrc ? '✓' : '!'}
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-icon">🎵</span>
              <div className="summary-content">
                <span className="summary-label">Audio</span>
                <span className="summary-value">{audioSrc ? 'Added' : 'Not added'}</span>
              </div>
              <span className={`summary-status ${audioSrc ? 'complete' : 'neutral'}`}>
                {audioSrc ? '✓' : '○'}
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-icon">📝</span>
              <div className="summary-content">
                <span className="summary-label">Subtitles</span>
                <span className="summary-value">{subtitles.length > 0 ? `${subtitles.length} added` : 'None'}</span>
              </div>
              <span className={`summary-status ${subtitles.length > 0 ? 'complete' : 'neutral'}`}>
                {subtitles.length > 0 ? '✓' : '○'}
              </span>
            </div>
          </div>
          
          <div className="success-actions">
            <button onClick={shareVideo} className="btn btn-primary btn-lg">
              <span>📤</span>
              Share Video
            </button>
            
            <button onClick={saveToGallery} className="btn btn-secondary btn-lg">
              <span>💾</span>
              Save to Device
            </button>
            
            <button onClick={restart} className="btn btn-ghost btn-lg">
              <span>➕</span>
              Create New Recap
            </button>
          </div>
        </div>
        
        <style>{`
          .export-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            padding: var(--space-xl);
          }

          .success-state {
            text-align: center;
            max-width: 450px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease;
          }

          .success-state.loaded {
            opacity: 1;
            transform: translateY(0);
          }

          .success-icon {
            font-size: 5rem;
            margin-bottom: var(--space-lg);
            animation: bounce 1s ease infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .success-state h2 {
            color: var(--text-primary);
            font-size: 2rem;
            margin-bottom: var(--space-sm);
          }

          .success-message {
            color: var(--text-muted);
            margin-bottom: var(--space-xl);
          }

          .export-summary {
            background: var(--bg-card);
            border-radius: var(--radius-lg);
            padding: var(--space-lg);
            margin-bottom: var(--space-xl);
          }

          .summary-item {
            display: flex;
            align-items: center;
            gap: var(--space-md);
            padding: var(--space-md) 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }

          .summary-item:last-child {
            border-bottom: none;
          }

          .summary-icon {
            font-size: 1.5rem;
          }

          .summary-content {
            flex: 1;
            text-align: left;
          }

          .summary-label {
            display: block;
            color: var(--text-primary);
            font-weight: 600;
          }

          .summary-value {
            font-size: 0.875rem;
            color: var(--text-muted);
          }

          .summary-status {
            font-size: 1.25rem;
            font-weight: 700;
          }

          .summary-status.complete {
            color: var(--success);
          }

          .summary-status.warning {
            color: var(--warning);
          }

          .summary-status.neutral {
            color: var(--text-muted);
          }

          .success-actions {
            display: flex;
            flex-direction: column;
            gap: var(--space-md);
          }

          .success-actions .btn span {
            margin-right: var(--space-sm);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="export-screen">
      <header className="screen-header">
        <button onClick={goBack} className="btn btn-secondary btn-icon">
          ←
        </button>
        <h2>📤 Export</h2>
        <div></div>
      </header>

      <div className="export-preview">
        <div className="preview-card">
          <h3>📋 Project Summary</h3>
          
          <div className="preview-items">
            <div className="preview-item">
              <span className="item-icon">📹</span>
              <div className="item-content">
                <span className="item-label">Video Source</span>
                <span className="item-status">
                  {videoSrc ? '✓ Selected' : '✗ Not selected'}
                </span>
              </div>
            </div>
            
            <div className="preview-item">
              <span className="item-icon">🎵</span>
              <div className="item-content">
                <span className="item-label">Audio Voiceover</span>
                <span className="item-status">
                  {audioSrc ? '✓ Added' : '○ Not added'}
                </span>
              </div>
            </div>
            
            <div className="preview-item">
              <span className="item-icon">📝</span>
              <div className="item-content">
                <span className="item-label">Subtitles</span>
                <span className="item-status">
                  {subtitles.length} subtitle{subtitles.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="export-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{exportError}</span>
        </div>
      )}

      <div className="export-action">
        <button 
          onClick={startExport} 
          className="btn btn-primary btn-lg btn-glow"
          disabled={!videoSrc}
        >
          <span>🎬</span>
          Export Final Video
        </button>
        
        {!videoSrc && (
          <p className="export-hint">Please select a video first</p>
        )}
      </div>

      <style>{`
        .export-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .export-preview {
          flex: 1;
          padding: var(--space-lg);
        }

        .preview-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .preview-card h3 {
          color: var(--text-primary);
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .preview-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .preview-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .item-icon {
          font-size: 1.5rem;
        }

        .item-content {
          flex: 1;
        }

        .item-label {
          display: block;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .item-status {
          color: var(--text-primary);
          font-weight: 500;
        }

        .export-error {
          margin: 0 var(--space-lg);
          padding: var(--space-md);
          background: rgba(229, 9, 20, 0.15);
          border: 1px solid rgba(229, 9, 20, 0.3);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .error-text {
          color: var(--primary-light);
        }

        .export-action {
          padding: var(--space-xl);
          text-align: center;
        }

        .export-hint {
          color: var(--text-muted);
          font-size: 0.875rem;
          margin-top: var(--space-md);
        }
      `}</style>
    </div>
  );
};

export default ExportScreen;