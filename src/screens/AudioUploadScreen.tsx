import React, { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioWaveform } from '../components/AudioWaveform';
import { ArrowLeft, Mic, Upload, Music, Square, ChevronRight, Volume2, RefreshCw, Check, ArrowRight } from 'lucide-react';

export const AudioUploadScreen: React.FC = () => {
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const {
    audioSrc,
    audioFile,
    audioVolume,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    loadAudioFile,
    clearAudio,
    changeVolume,
    goToNext,
    goBack,
  } = useAudioRecorder();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleUploadMP3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadAudioFile(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-white/5 bg-neutral-900/50">
        <button onClick={goBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Mic className="w-5 h-5" /> Audio Voiceover
        </h2>
        <div></div>
      </header>

      {!audioSrc ? (
        <div className="flex-1 flex flex-col p-4">
          <div className={`flex rounded-lg bg-neutral-900 p-1 mb-6 transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              onClick={() => setMode('upload')}
            >
              <Upload className="w-4 h-4" /> Upload MP3
            </button>
            <button 
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${mode === 'record' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              onClick={() => setMode('record')}
            >
              <Mic className="w-4 h-4" /> Record Voice
            </button>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {mode === 'upload' ? (
              <div className="text-center max-w-sm">
                <div className="p-8 md:p-10 bg-neutral-900 border-2 border-dashed border-white/10 rounded-xl mb-4">
                  <Music className="w-12 h-12 mx-auto mb-4 text-neutral-500" />
                  <p className="text-neutral-500 text-sm mb-4">Select an MP3 file to add as voiceover</p>
                  
                  <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all text-sm cursor-pointer">
                    <FolderOpenIcon className="w-4 h-4" /> Browse Files
                    <input
                      type="file"
                      accept="audio/mpeg,audio/*"
                      onChange={handleUploadMP3}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="flex justify-center gap-2">
                  <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-500">MP3</span>
                  <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-500">WAV</span>
                  <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-500">M4A</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className={`relative flex items-center justify-center mb-6 ${isRecording ? 'animate-pulse' : ''}`}>
                  <div className={`w-28 h-28 md:w-32 md:h-32 bg-neutral-900 border-3 rounded-full flex items-center justify-center transition-all ${isRecording ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-white/10'}`}>
                    <Mic className={`w-8 h-8 md:w-10 md:h-10 ${isRecording ? 'text-red-500' : 'text-neutral-400'}`} />
                  </div>
                  {isRecording && <div className="absolute inset-0 border-3 border-red-500 rounded-full animate-ping"></div>}
                </div>
                
                {isRecording && (
                  <div className="mb-4">
                    <span className="text-2xl md:text-3xl font-bold text-red-500 tabular-nums">{formatDuration(recordingDuration)}</span>
                    <p className="text-neutral-500 text-xs mt-1">Recording...</p>
                  </div>
                )}
                
                <button 
                  onClick={isRecording ? stopRecording : startRecording} 
                  className={`px-6 py-3 font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2 mx-auto ${isRecording ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-600/25'}`}
                >
                  {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
                
                <p className="text-neutral-500 text-xs mt-4">{isRecording ? 'Click to stop when finished' : 'Click to start recording your voice'}</p>
              </div>
            )}
          </div>
          
          <button onClick={goToNext} className="mt-auto py-2 text-neutral-500 hover:text-white text-sm font-medium transition-colors text-center flex items-center justify-center gap-1">
            Skip this step <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="text-center p-6 bg-neutral-900 rounded-xl">
            <Check className="w-10 h-10 mx-auto mb-2 text-green-500" />
            <h3 className="text-white font-semibold mb-1">Audio Added</h3>
            {audioFile && <p className="text-neutral-500 text-xs">{audioFile.name}</p>}
          </div>
          
          <div className="bg-neutral-900 rounded-xl p-3 min-h-24">
            <AudioWaveform audioSrc={audioSrc} currentTime={0} />
          </div>
          
          <div className="bg-neutral-900 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="w-5 h-5 text-neutral-400" />
              <span className="flex-1 text-white font-medium text-sm">Volume</span>
              <span className="text-red-500 font-bold tabular-nums text-sm">{Math.round(audioVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioVolume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
          
          <div className="flex flex-col gap-3 mt-auto">
            <button onClick={clearAudio} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Change Audio
            </button>
            
            <button onClick={goToNext} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all text-sm flex items-center justify-center gap-2">
              Continue to Export <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple folder icon component
const FolderOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export default AudioUploadScreen;