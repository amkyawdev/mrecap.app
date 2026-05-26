import React, { useRef, useEffect, useState } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { useProjectStore } from '../store/projectStore';
import { usePWAPrompt } from '../hooks/usePWAPrompt';
import { Film, FolderOpen, ChevronRight, Smartphone, Video, Type, Mic, Download, Wand2, Clapperboard, Loader2 } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadVideo, goToVideoEditor, videoSrc, isLoading } = useVideoEditor();
  const { setCurrentScreen } = useProjectStore();
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
        // Navigate to video editor screen
        goToVideoEditor();
      }
    };
    
    input.click();
  };

  const handleFullEditor = () => {
    setCurrentScreen('fullEditor');
  };

  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-neutral-950 to-neutral-950"></div>
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(229,9,20,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,215,0,0.05) 0%, transparent 50%)'}}></div>
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Film className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">MRecap</span>
        </div>
        {isInstalled && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Installed
          </span>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className={`text-center max-w-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-4 md:mb-6">
            <span>✨</span>
            <span>Create Stunning Recaps</span>
          </span>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            <span className="text-white">Movie Recap</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-400 bg-clip-text text-transparent">Editor</span>
          </h1>
          
          <p className="text-neutral-400 text-sm md:text-base lg:text-lg mb-6 md:mb-8 max-w-md mx-auto leading-relaxed">
            Transform your videos into captivating recaps with automatic subtitles, voiceover, and professional effects.
          </p>

          <div className="flex flex-col items-center gap-3 md:gap-4">
            <button 
              onClick={handleSelectVideo} 
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-600/25 hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  Select Video
                </>
              )}
            </button>
            
            {videoSrc && !isLoading && (
              <button 
                onClick={goToVideoEditor} 
                className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-16 w-full max-w-2xl md:max-w-3xl transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { icon: Wand2, title: 'Full Editor', desc: 'Professional tools', onClick: handleFullEditor },
            { icon: Video, title: 'Quick Edit', desc: 'Simple workflow' },
            { icon: Type, title: 'Subtitles', desc: 'Add & edit text' },
            { icon: Mic, title: 'Voiceover', desc: 'Record audio' },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="bg-neutral-900/80 border border-white/5 rounded-xl p-4 md:p-5 text-center hover:border-red-500/30 hover:bg-neutral-900 transition-all duration-200 hover:-translate-y-1"
              onClick={feature.onClick}
              style={{ cursor: feature.onClick ? 'pointer' : 'default' }}
            >
              <feature.icon className="w-6 h-6 md:w-7 md:h-7 mx-auto mb-2 text-red-400" />
              <h3 className="text-white font-semibold text-sm md:text-base mb-1">{feature.title}</h3>
              <p className="text-neutral-500 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Install Prompt */}
      {needsInstall && (
        <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-sm mx-auto bg-neutral-900 border border-white/10 rounded-xl p-4 shadow-xl flex items-center justify-between gap-4 animate-slide-up z-50">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-neutral-400" />
            <div>
              <p className="text-white text-sm font-medium">Get the App</p>
              <p className="text-neutral-500 text-xs">Install for offline access</p>
            </div>
          </div>
          <button onClick={installApp} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors">
            Install
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;