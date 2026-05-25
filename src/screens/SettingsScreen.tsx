import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ArrowLeft, Clapperboard, Info, Settings2, RotateCcw } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { reset, setCurrentScreen } = useProjectStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
        <button onClick={() => setCurrentScreen('home')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Settings2 className="w-5 h-5" /> Settings
        </h2>
        <div></div>
      </header>

      <div className={`flex-1 p-4 space-y-6 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {/* App Info */}
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2 ml-1">App Info</p>
          <div className="bg-neutral-900 rounded-xl p-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-neutral-400 text-sm">App Name</span>
              <span className="text-white text-sm font-medium">MRecap</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-neutral-400 text-sm">Version</span>
              <span className="text-red-500 text-sm font-semibold">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-neutral-400 text-sm">Platform</span>
              <span className="text-white text-sm font-medium">Web (PWA)</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2 ml-1">About</p>
          <div className="bg-neutral-900 rounded-xl p-4 text-center">
            <Clapperboard className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              Create stunning video recaps with subtitles and voiceover. Edit, export and share your creations.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Video Editing', 'Subtitles', 'Voiceover', 'Export'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-neutral-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-2 ml-1">Actions</p>
          <div className="bg-neutral-900 rounded-xl p-4">
            <button 
              onClick={reset} 
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset Application
            </button>
            <p className="text-neutral-500 text-xs text-center mt-2">Clear all data and start fresh</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-500 text-sm py-4">Made with ❤️ for content creators</p>
      </div>
    </div>
  );
};

export default SettingsScreen;