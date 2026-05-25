import React from 'react';
import { useProjectStore } from '../store/projectStore';

export const SettingsScreen: React.FC = () => {
  const { reset, setCurrentScreen } = useProjectStore();

  return (
    <div className="settings-screen">
      <div className="header">
        <button onClick={() => setCurrentScreen('home')} className="btn btn-secondary">
          ← Back
        </button>
        <h2>⚙️ Settings</h2>
        <div></div>
      </div>
      
      <div className="settings-options">
        <div className="setting-item">
          <h3>About</h3>
          <p>Movie Recap Editor v1.0.0</p>
        </div>
        
        <div className="setting-item">
          <h3>Help</h3>
          <p>Create video recaps with subtitles and voiceover</p>
        </div>
        
        <div className="setting-item">
          <h3>Reset App</h3>
          <button onClick={reset} className="btn btn-secondary">
            Start Fresh
          </button>
        </div>
      </div>
      
      <style>{`
        .settings-screen {
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
        .settings-options {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .setting-item {
          background: rgba(0,0,0,0.3);
          padding: 16px;
          border-radius: 8px;
        }
        .setting-item h3 {
          color: white;
          margin-bottom: 8px;
        }
        .setting-item p {
          color: rgba(255,255,255,0.7);
        }
      `}</style>
    </div>
  );
};

export default SettingsScreen;