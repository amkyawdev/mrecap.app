import React, { useState, useEffect } from 'react';
import { useExport } from '../hooks/useExport';
import { ArrowLeft, Video, Music, Type, Upload, Share2, Download, Plus, AlertTriangle, Loader2, Server } from 'lucide-react';

export const ExportScreen: React.FC = () => {
  const {
    videoSrc,
    audioSrc,
    subtitles,
    exportProgress,
    exportedVideoSrc,
    isExporting,
    exportError,
    usingServerExport,
    startExport,
    shareVideo,
    saveToGallery,
    goBack,
    restart,
  } = useExport();

  const [isLoaded, setIsLoaded] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Update progress message based on export progress
  useEffect(() => {
    if (usingServerExport) {
      if (exportProgress < 10) setProgressMessage('Uploading video...');
      else if (exportProgress < 30) setProgressMessage('Processing with FFmpeg...');
      else if (exportProgress < 80) setProgressMessage('Encoding video...');
      else if (exportProgress < 95) setProgressMessage('Finalizing...');
      else setProgressMessage('Export complete!');
    } else {
      if (exportProgress < 5) setProgressMessage('Initializing...');
      else if (exportProgress < 20) setProgressMessage('Loading FFmpeg...');
      else if (exportProgress < 25) setProgressMessage('Loading video file...');
      else if (exportProgress < 35) setProgressMessage('Video loaded');
      else if (exportProgress < 50) setProgressMessage('Processing subtitles...');
      else if (exportProgress < 60) setProgressMessage('Loading audio...');
      else if (exportProgress < 90) setProgressMessage('Processing video...');
      else if (exportProgress < 100) setProgressMessage('Finalizing...');
      else setProgressMessage('Export complete!');
    }
  }, [exportProgress, usingServerExport]);

  if (isExporting) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Loader2 className="w-20 h-20 text-red-500 animate-spin" />
            <Video className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-white text-xl font-semibold mb-2">Creating Your Recap</h2>
          <p className="text-neutral-500 text-sm mb-6">{progressMessage}</p>
          
          <div className="mb-6">
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
            </div>
            <span className="text-red-500 font-bold text-lg">{Math.round(exportProgress)}%</span>
          </div>
          
          <div className="space-y-2 text-left">
            {usingServerExport ? (
              <>
                {[
                  { label: 'Uploading video', active: exportProgress > 5 },
                  { label: 'Processing subtitles', active: exportProgress > 20 },
                  { label: 'FFmpeg encoding', active: exportProgress > 40 },
                  { label: 'Finalizing', active: exportProgress >= 80 },
                ].map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step.active ? 'bg-neutral-800 text-white' : 'bg-neutral-900/50 text-neutral-500'}`}>
                    {step.active ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-neutral-600"></div>
                    )}
                    <span className="text-sm">{step.label}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: 'Loading FFmpeg', active: exportProgress > 5 },
                  { label: 'Loading video', active: exportProgress > 15 },
                  { label: 'Processing subtitles', active: exportProgress > 35 },
                  { label: 'Mixing audio', active: exportProgress > 50 },
                  { label: 'Encoding video', active: exportProgress > 60 },
                  { label: 'Finalizing', active: exportProgress >= 90 },
                ].map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step.active ? 'bg-neutral-800 text-white' : 'bg-neutral-900/50 text-neutral-500'}`}>
                    {step.active ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-neutral-600"></div>
                    )}
                    <span className="text-sm">{step.label}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        `}</style>
      </div>
    );
  }

  if (exportedVideoSrc) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className={`text-center max-w-sm transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <Download className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-white text-xl font-semibold mb-2">Export Complete!</h2>
          <p className="text-neutral-500 text-sm mb-6">Your video recap is ready to download</p>
          
          <div className="bg-neutral-900 rounded-xl p-4 mb-6 space-y-3">
            {[
              { icon: Video, label: 'Video', value: 'Processed', complete: true },
              { icon: Type, label: 'Subtitles', value: subtitles.length > 0 ? 'Burned in' : 'None', complete: true },
              { icon: Music, label: 'Audio', value: audioSrc ? 'Mixed' : 'Original', complete: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <item.icon className="w-5 h-5 text-neutral-400" />
                <div className="flex-1 text-left">
                  <span className="text-white text-sm font-medium block">{item.label}</span>
                  <span className="text-neutral-500 text-xs">{item.value}</span>
                </div>
                <span className="text-green-500">✓</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            <button onClick={saveToGallery} className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Video
            </button>
            
            <button onClick={shareVideo} className="w-full px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
            
            <button onClick={restart} className="w-full px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Create New Recap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5" /> Export
        </h2>
        <div></div>
      </header>

      <div className="flex-1 p-4">
        <div className="bg-neutral-900 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5" /> Project Summary
          </h3>
          
          <div className="space-y-3">
            {[
              { icon: Video, label: 'Video Source', status: videoSrc ? '✓ Ready' : '✗ Not selected' },
              { icon: Type, label: 'Subtitles', status: subtitles.length > 0 ? `✓ ${subtitles.length} subtitle(s)` : '○ None' },
              { icon: Music, label: 'Audio Voiceover', status: audioSrc ? '✓ Added' : '○ None' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <item.icon className="w-5 h-5 text-neutral-400" />
                <div className="flex-1">
                  <span className="text-neutral-400 text-xs block">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Server className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-blue-400 text-xs leading-relaxed">
              {usingServerExport ? (
                <>
                  <span className="font-semibold">Server-side FFmpeg</span> is processing your video for faster, 
                  more reliable export with subtitles and audio mixing.
                </>
              ) : (
                <>
                  <span className="font-semibold">FFmpeg.wasm</span> will process your video in the browser. 
                  Subtitles will be burned into the video and audio will be mixed automatically.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {exportError && (
        <div className="mx-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-400 text-sm">{exportError}</span>
        </div>
      )}

      <div className="p-4">
        <button 
          onClick={startExport} 
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!videoSrc}
        >
          <Video className="w-4 h-4" /> Export with FFmpeg
        </button>
        
        {!videoSrc && (
          <p className="text-neutral-500 text-xs text-center mt-2">Please select a video first</p>
        )}
      </div>
    </div>
  );
};

export default ExportScreen;