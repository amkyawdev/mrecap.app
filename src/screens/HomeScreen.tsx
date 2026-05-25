import React, { useRef, useEffect, useState } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { usePWAPrompt } from '../hooks/usePWAPrompt';

export const HomeScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadVideo, goToNext, videoSrc } = useVideoEditor();
  const { needsInstall, installApp, isInstalled } = usePWAPrompt();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      {/* Background Effects */}
      <div className="bg-effects">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
      </div>

      {/* Header */}
      <header className="home-header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MRecap</span>
        </div>
        <div className="header-actions">
          {isInstalled && (
            <span className="installed-badge">
              <span className="badge-dot"></span>
              Installed
            </span>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className={`hero-content ${isLoaded ? 'loaded' : ''}`}>
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Create Stunning Recaps</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Movie Recap</span>
            <span className="title-accent">Editor</span>
          </h1>
          
          <p className="hero-description">
            Transform your videos into captivating recaps with 
            automatic subtitles, voiceover, and professional effects.
          </p>

          <div className="hero-actions">
            <button onClick={handleSelectVideo} className="btn btn-primary btn-lg btn-glow">
              <span className="btn-icon">📂</span>
              Select Video
            </button>
            
            {videoSrc && (
              <button onClick={handleProceed} className="btn btn-secondary btn-lg">
                Continue
                <span className="btn-arrow">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className={`features-grid ${isLoaded ? 'loaded' : ''}`}>
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3>Video Selection</h3>
            <p>Choose any video from your device</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Subtitle Editor</h3>
            <p>Add and edit subtitles easily</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <h3>Voiceover</h3>
            <p>Record or upload audio</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Export & Share</h3>
            <p>Download or share your creation</p>
          </div>
        </div>
      </main>

      {/* Install Prompt */}
      {needsInstall && (
        <div className="install-prompt animate-slide-up">
          <div className="install-content">
            <div className="install-icon">📱</div>
            <div className="install-text">
              <strong>Get the App</strong>
              <span>Install for offline access and better experience</span>
            </div>
          </div>
          <button onClick={installApp} className="btn btn-sm btn-ghost">
            Install
          </button>
        </div>
      )}

      <style>{`
        .home-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        /* Background Effects */
        .bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 30% 20%, rgba(229, 9, 20, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(255, 215, 0, 0.08) 0%, transparent 50%);
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .bg-glow {
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(229, 9, 20, 0.1) 0%, transparent 60%);
          filter: blur(80px);
        }

        /* Header */
        .home-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg) var(--space-xl);
          position: relative;
          z-index: 10;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .installed-badge {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 8px 16px;
          background: rgba(70, 211, 105, 0.15);
          border: 1px solid rgba(70, 211, 105, 0.3);
          border-radius: var(--radius-full);
          color: var(--success);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        /* Hero Section */
        .hero-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl);
          position: relative;
          z-index: 10;
        }

        .hero-content {
          text-align: center;
          max-width: 600px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-content.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 8px 16px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: var(--radius-full);
          color: var(--accent);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: var(--space-lg);
        }

        .badge-icon {
          font-size: 1rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--space-lg);
        }

        .title-line {
          display: block;
          color: var(--text-primary);
        }

        .title-accent {
          display: block;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-xl);
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }

        .btn-glow {
          animation: glow 3s ease infinite;
        }

        .btn-arrow {
          margin-left: var(--space-xs);
          transition: transform var(--transition-fast);
        }

        .btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-md);
          margin-top: var(--space-2xl);
          width: 100%;
          max-width: 800px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
        }

        .features-grid.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          text-align: center;
          transition: all var(--transition-normal);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: var(--space-sm);
        }

        .feature-card h3 {
          color: var(--text-primary);
          font-size: 1rem;
          margin-bottom: var(--space-xs);
        }

        .feature-card p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        /* Install Prompt */
        .install-prompt {
          position: fixed;
          bottom: var(--space-lg);
          left: var(--space-lg);
          right: var(--space-lg);
          max-width: 480px;
          margin: 0 auto;
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-lg);
          z-index: 100;
        }

        .install-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .install-icon {
          font-size: 2rem;
        }

        .install-text {
          display: flex;
          flex-direction: column;
        }

        .install-text strong {
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .install-text span {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .install-prompt {
            flex-direction: column;
            gap: var(--space-md);
            text-align: center;
          }

          .install-content {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;