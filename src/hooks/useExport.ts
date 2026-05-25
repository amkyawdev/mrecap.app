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
    
    try {
      const srtContent = subtitles.length > 0 
        ? subtitles.map(s => `${s.id}\n${s.startTime} --> ${s.endTime}\n${s.text}`).join('\n\n')
        : null;
      
      // Create blob for srt if needed
      let srtBlob: Blob | null = null;
      if (srtContent) {
        srtBlob = new Blob([srtContent], { type: 'text/plain' });
      }
      
      // Would export using FFmpeg in real implementation
      // For now just simulate progress
      const mockSrtPath = srtBlob ? URL.createObjectURL(srtBlob) : undefined;
      
      await ExportService.export({
        videoPath: videoSrc,
        srtPath: mockSrtPath,
        audioPath: audioSrc || undefined,
        onProgress: (progress) => {
          setExportProgress(progress);
        },
      });
      
      // Mock exported video (use original for demo)
      setExportedVideoSrc(videoSrc);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export video');
    } finally {
      setIsExporting(false);
    }
  }, [videoSrc, audioSrc, subtitles, setExportProgress, setExportedVideoSrc]);

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