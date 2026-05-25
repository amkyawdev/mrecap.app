'use client';

import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { HomeScreen } from '../screens/HomeScreen';
import { VideoEditorScreen } from '../screens/VideoEditorScreen';
import { SubtitleEditorScreen } from '../screens/SubtitleEditorScreen';
import { AudioUploadScreen } from '../screens/AudioUploadScreen';
import { ExportScreen } from '../screens/ExportScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import '../styles/global.css';

export default function App() {
  const { currentScreen, setCurrentScreen } = useProjectStore();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed:', err);
      });
    }
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'video':
        return <VideoEditorScreen />;
      case 'subtitle':
        return <SubtitleEditorScreen />;
      case 'audio':
        return <AudioUploadScreen />;
      case 'export':
        return <ExportScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}