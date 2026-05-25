import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';

export const SettingsScreen: React.FC = () => {
  const { reset, setCurrentScreen } = useProjectStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="settings-screen">
      <header className="screen-header">
        <button onClick={() => setCurrentScreen('home')} className="btn btn-secondary btn-icon">
          ←
        </button>
        <h2>⚙️ Settings</h2>
        <div></div>
      </header>

      <div className={`settings-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="settings-section">
          <h3 className="section-title">🏷️ App Info</h3>
          <div className="settings-card">
            <div className="info-row">
              <span className="info-label">App Name</span>
              <span className="info-value">MRecap</span>
            </div>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value version">v1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Platform</span>
              <span className="info-value">Web (PWA)</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">ℹ️ About</h3>
          <div className="settings-card about-card">
            <div className="about-icon">🎬</div>
            <p className="about-description">
              Create stunning video recaps with subtitles and voiceover. 
              Edit, export and share your creations with the world.
            </p>
            <div className="about-features">
              <span className="feature-tag">📹 Video Editing</span>
              <span className="feature-tag">📝 Subtitles</span>
              <span className="feature-tag">🎙️ Voiceover</span>
              <span className="feature-tag">📤 Export</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">🛠️ Actions</h3>
          <div className="settings-card">
            <button onClick={reset} className="btn btn-secondary reset-btn">
              <span>🔄</span>
              Reset Application
            </button>
            <p className="reset-hint">Clear all data and start fresh</p>
          </div>
        </div>

        <div className="settings-footer">
          <p>Made with ❤️ for content creators</p>
        </div>
      </div>

      <style>{`
        .settings-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }

        .settings-content {
          flex: 1;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s ease;
        }

        .settings-content.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .section-title {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-left: var(--space-sm);
        }

        .settings-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm) 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .info-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .info-value.version {
          color: var(--primary);
          font-weight: 600;
        }

        .about-card {
          text-align: center;
        }

        .about-icon {
          font-size: 3rem;
          margin-bottom: var(--space-md);
        }

        .about-description {
          color: var(--text-secondary);
          margin-bottom: var(--space-lg);
          line-height: 1.6;
        }

        .about-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          justify-content: center;
        }

        .feature-tag {
          padding: 6px 12px;
          background: var(--bg-elevated);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .reset-btn {
          width: 100%;
        }

        .reset-btn span {
          margin-right: var(--space-sm);
        }

        .reset-hint {
          color: var(--text-muted);
          font-size: 0.75rem;
          text-align: center;
          margin-top: var(--space-sm);
        }

        .settings-footer {
          text-align: center;
          padding: var(--space-xl);
          color: var(--text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default SettingsScreen;