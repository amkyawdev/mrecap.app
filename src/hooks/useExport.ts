import { useCallback, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ExportService } from '../services/exportService';
import { ServerExportService } from '../services/serverExportService';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [usingServerExport, setUsingServerExport] = useState(false);
  
  const {
    videoSrc,
    audioSrc,
    subtitles,
    subtitleStyle,
    audioVolume,
    exportProgress,
    exportedVideoSrc,
    setExportProgress,
    setExportedVideoSrc,
    setCurrentScreen,
    reset,
  } = useProjectStore();

  const startExport = useCallback(async () => {
    if (!videoSrc) return;
    
    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);
    setUsingServerExport(false);
    
    try {
      // Convert subtitles to SRT format
      const srtContent = subtitles.length > 0 
        ? ExportService.subtitlesToSRT(subtitles)
        : undefined;
      
      // Try server-side export first (more reliable with Docker)
      const serverAvailable = await ServerExportService.checkHealth();
      
      let outputUrl: string;
      
      if (serverAvailable) {
        // Use server-side export with FFmpeg in Docker
        setUsingServerExport(true);
        outputUrl = await ServerExportService.export({
          videoUrl: videoSrc,
          subtitleContent: srtContent,
          subtitleStyle: subtitleStyle,
          audioUrl: audioSrc || undefined,
          audioVolume: audioVolume,
          onProgress: (progress, message) => {
            setExportProgress(progress);
          },
        });
      } else {
        // Fallback to client-side FFmpeg.wasm
        outputUrl = await ExportService.export({
          videoUrl: videoSrc,
          subtitleContent: srtContent,
          subtitleStyle: subtitleStyle,
          audioUrl: audioSrc || undefined,
          audioVolume: audioVolume,
          onProgress: (progress, message) => {
            setExportProgress(progress);
          },
        });
      }
      
      setExportedVideoSrc(outputUrl);
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportError(error.message || 'Failed to export video. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [videoSrc, audioSrc, subtitles, subtitleStyle, audioVolume, setExportProgress, setExportedVideoSrc]);

  const shareVideo = useCallback(async () => {
    if (!exportedVideoSrc) return;
    await ExportService.share(exportedVideoSrc);
  }, [exportedVideoSrc]);

  const saveToGallery = useCallback(async () => {
    if (!exportedVideoSrc) return;
    await ExportService.saveToGallery(exportedVideoSrc);
  }, [exportedVideoSrc]);

  const goBack = useCallback(() => {
    setCurrentScreen('audio');
  }, [setCurrentScreen]);

  const restart = useCallback(() => {
    reset();
    setCurrentScreen('home');
  }, [reset, setCurrentScreen]);

  return {
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
  };
}

export default useExport;