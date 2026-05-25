import React, { useRef } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { usePWAPrompt } from '../hooks/usePWAPrompt';

export const HomeScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadVideo, goToNext, videoSrc } = useVideoEditor();
  const { needsInstall, installApp, isInstalled } = usePWAPrompt();

  const handleSelectVideo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await loadVideo(file);
      }
    };
    
    input.click();
  };

  const handleProceed = () => {
    if (videoSrc) {
      goToNext();
    }
  };

  return (
    <div className="home-screen">
      <div className="hero">
        <h1>🎬 Movie Recap</h1>
        <p>Create amazing video recaps with subtitles and voiceover</p>
      </div>
      
      <div className="actions">
        <button onClick={handleSelectVideo} className="btn btn-primary">
          📂 Select Video
        </button>
        
        {videoSrc && (
          <button onClick={handleProceed} className="btn btn-secondary">
            Continue →
          </button>
        )}
      </div>
      
      {needsInstall && (
        <div className="install-prompt">
          <p>Install this app for the best experience!</p>
          <button onClick={installApp} className="btn btn-primary">
            Install
          </button>
        </div>
      )}
      
      {isInstalled && (
        <div className="installed-badge">
          ✅ App Installed
        </div>
      )}
      
      <style>{`
        .home-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
        }
        .hero {
          text-align: center;
          margin-bottom: 40px;
        }
        .hero h1 {
          font-size: 3rem;
          color: white;
          margin-bottom: 16px;
        }
        .hero p {
          font-size: 1.25rem;
          color: rgba(255,255,255,0.8);
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 300px;
        }
        .btn {
          padding: 16px 32px;
          font-size: 1.25rem;
          border-radius: 12px;
          cursor: pointer;
        }
        .btn-primary {
          background: white;
          color: #FF0000;
          border: none;
        }
        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }
        .install-prompt {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: rgba(0,0,0,0.8);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
        }
        .install-prompt p {
          color: white;
          margin-bottom: 12px;
        }
        .installed-badge {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0,255,0,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;