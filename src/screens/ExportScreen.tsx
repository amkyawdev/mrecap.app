import React from 'react';
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

  if (isExporting) {
    return (
      <div className="export-screen">
        <div className="exporting">
          <h2>⏳ Exporting...</h2>
          <ProgressBar progress={exportProgress} label="Rendering video" />
        </div>
        
        <style>{`
          .export-screen {
            min-height: 100vh;
            background: #FF0000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .exporting {
            text-align: center;
          }
          .exporting h2 {
            color: white;
            margin-bottom: 24px;
          }
        `}</style>
      </div>
    );
  }

  if (exportedVideoSrc) {
    return (
      <div className="export-screen">
        <div className="success">
          <h2>✅ Export Complete!</h2>
          
          <div className="preview-info">
            <p>📹 Video: {videoSrc ? '✓' : '✗'}</p>
            <p>🎵 Audio: {audioSrc ? '✓' : '○'}</p>
            <p>📝 Subtitles: {subtitles.length > 0 ? `✓ (${subtitles.length})` : '○'}</p>
          </div>
          
          <div className="actions">
            <button onClick={shareVideo} className="btn btn-primary">
              📤 Share Video
            </button>
            
            <button onClick={saveToGallery} className="btn btn-primary">
              💾 Save to Device
            </button>
            
            <button onClick={restart} className="btn btn-secondary">
              ➕ Create New
            </button>
          </div>
        </div>
        
        <style>{`
          .export-screen {
            min-height: 100vh;
            background: #FF0000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .success {
            text-align: center;
            padding: 20px;
          }
          .success h2 {
            color: white;
            margin-bottom: 24px;
          }
          .preview-info {
            background: rgba(0,0,0,0.3);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            text-align: left;
          }
          .preview-info p {
            color: white;
            margin: 8px 0;
          }
          .actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="export-screen">
      <div className="header">
        <button onClick={goBack} className="btn btn-secondary">
          ← Back
        </button>
        <h2>📤 Export</h2>
        <div></div>
      </div>
      
      <div className="preview">
        <h3>Video Preview</h3>
        <div className="preview-details">
          <p>📹 Video: {videoSrc ? '✓ Selected' : 'Not selected'}</p>
          <p>🎵 Audio: {audioSrc ? '✓ Added' : 'None'}</p>
          <p>📝 Subtitles: {subtitles.length} subtitle(s)</p>
        </div>
      </div>
      
      {exportError && (
        <div className="error">
          ⚠️ {exportError}
        </div>
      )}
      
      <div className="export-button">
        <button 
          onClick={startExport} 
          className="btn btn-primary"
          disabled={!videoSrc}
        >
          🎬 Export Final Video
        </button>
      </div>
      
      <style>{`
        .export-screen {
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
        .preview {
          flex: 1;
          padding: 20px;
        }
        .preview h3 {
          color: white;
          margin-bottom: 16px;
        }
        .preview-details {
          background: rgba(0,0,0,0.3);
          padding: 16px;
          border-radius: 8px;
        }
        .preview-details p {
          color: white;
          margin: 8px 0;
        }
        .error {
          background: rgba(255,0,0,0.5);
          color: white;
          padding: 16px;
          margin: 0 20px;
          border-radius: 8px;
        }
        .export-button {
          padding: 20px;
        }
        .export-button .btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default ExportScreen;