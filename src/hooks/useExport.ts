import { useCallback, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ExportService } from '../services/exportService';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  const {
    videoSrc,
    audioSrc,
    subtitles,
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
    
    try {
      // Convert subtitles to SRT format
      const srtContent = subtitles.length > 0 
        ? ExportService.subtitlesToSRT(subtitles)
        : undefined;
      
      // Export using FFmpeg
      const outputUrl = await ExportService.export({
        videoUrl: videoSrc,
        subtitleContent: srtContent,
        audioUrl: audioSrc || undefined,
        audioVolume: audioVolume,
        onProgress: (progress, message) => {
          setExportProgress(progress);
        },
      });
      
      setExportedVideoSrc(outputUrl);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export video. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [videoSrc, audioSrc, subtitles, audioVolume, setExportProgress, setExportedVideoSrc]);

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
    startExport,
    shareVideo,
    saveToGallery,
    goBack,
    restart,
  };
}

export default useExport;