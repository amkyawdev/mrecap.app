import { useCallback, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Subtitle, parseSRT, toSRT, createSubtitle } from '../services/subtitleParser';

export function useSubtitleEditor() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    subtitles,
    subtitleFile,
    videoDuration,
    currentTime,
    setSubtitles,
    addSubtitle,
    updateSubtitle,
    deleteSubtitle,
    setSubtitleFile,
    setCurrentScreen,
  } = useProjectStore();

  const loadSubtitles = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseSRT(text);
      setSubtitles(parsed);
      setSubtitleFile(file);
    } catch (error) {
      console.error('Failed to load subtitles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setSubtitles, setSubtitleFile]);

  const addNewSubtitle = useCallback(() => {
    const newSub = createSubtitle(
      currentTime,
      Math.min(currentTime + 3, videoDuration),
      'New subtitle'
    );
    addSubtitle(newSub);
  }, [addSubtitle, currentTime, videoDuration]);

  const editSubtitle = useCallback((subtitle: Subtitle) => {
    updateSubtitle(subtitle);
  }, [updateSubtitle]);

  const removeSubtitle = useCallback((id: number) => {
    deleteSubtitle(id);
  }, [deleteSubtitle]);

  const exportSRT = useCallback(() => {
    return toSRT(subtitles);
  }, [subtitles]);

  const downloadSRT = useCallback(() => {
    const content = exportSRT();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    URL.revokeObjectURL(url);
  }, [exportSRT]);

  const goToNext = useCallback(() => {
    setCurrentScreen('audio');
  }, [setCurrentScreen]);

  const goBack = useCallback(() => {
    setCurrentScreen('video');
  }, [setCurrentScreen]);

  return {
    subtitles,
    subtitleFile,
    videoDuration,
    currentTime,
    isLoading,
    loadSubtitles,
    addNewSubtitle,
    editSubtitle,
    removeSubtitle,
    exportSRT,
    downloadSRT,
    goToNext,
    goBack,
  };
}

export default useSubtitleEditor;