import { useCallback, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useTimelineStore } from '../store/timelineStore';
import { ExportService } from '../services/exportService';

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

  const {
    videoClips,
    selectedClipId,
  } = useTimelineStore();
  
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
      
      // Get selected clip effects
      const selectedClip = videoClips.find(c => c.id === selectedClipId) || videoClips[0];
      const clipEffects = selectedClip?.effects || [];
      const clipFilter = selectedClip?.filter || null;
      const clipRotation = selectedClip?.rotation || 0;
      const clipFlipH = selectedClip?.flipH || false;
      const clipFlipV = selectedClip?.flipV || false;
      const clipSpeed = selectedClip?.speed || 1;
      const clipVolume = selectedClip?.volume || 1;
      
      let outputUrl: string;
      
      // Client-side export using FFmpeg.wasm
      setUsingServerExport(false);
      outputUrl = await ExportService.export({
        videoUrl: videoSrc,
        subtitleContent: srtContent,
        subtitleStyle: subtitleStyle,
        audioUrl: audioSrc || undefined,
        audioVolume: audioVolume,
        effects: clipEffects,
        filter: clipFilter,
        rotation: clipRotation,
        flipH: clipFlipH,
        flipV: clipFlipV,
        speed: clipSpeed,
        volume: clipVolume,
        onProgress: (progress, message) => {
          setExportProgress(progress);
        },
      });
      
      setExportedVideoSrc(outputUrl);
    } catch (error: any) {
      console.error('Export failed:', error);
      const errorMessage = error.message || 'Failed to export video';
      setExportError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [videoSrc, audioSrc, subtitles, subtitleStyle, audioVolume, videoClips, selectedClipId, setExportProgress, setExportedVideoSrc]);

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
