import { useCallback, useRef, useState } from 'react';
import { useProjectStore } from '../store/projectStore';

export function useVideoEditor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  const {
    videoSrc,
    videoFile,
    videoDuration,
    currentTime,
    playing,
    trimStart,
    trimEnd,
    setVideoSrc,
    setVideoFile,
    setVideoDuration,
    setCurrentTime,
    setPlaying,
    setTrimRange,
    setCurrentScreen,
    reset,
  } = useProjectStore();

  const loadVideo = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadProgress(0);
    
    try {
      // Create object URL immediately for fast start
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoFile(file);
      setLoadProgress(50);
      
      // Get duration in background
      const video = document.createElement('video');
      video.preload = 'metadata'; // Only load metadata first
      
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setLoadProgress(100);
        // Small delay to show 100% before hiding
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      };
      
      video.onerror = () => {
        console.error('Failed to load video metadata');
        setIsLoading(false);
      };
      
      video.src = url;
      
      // Fallback timeout in case metadata doesn't fire
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Failed to load video:', error);
      setIsLoading(false);
    }
  }, [setVideoSrc, setVideoFile, setVideoDuration, isLoading]);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  }, [setPlaying]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [setPlaying]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    // Loop within trim range
    if (time >= trimEnd) {
      seek(trimStart);
    }
  }, [setCurrentTime, trimEnd, trimStart, seek]);

  const trimVideo = useCallback(() => {
    // This would typically use ffmpeg to trim
    // For now just seeking within bounds
    console.log('Trimming video from', trimStart, 'to', trimEnd);
  }, [trimStart, trimEnd]);

  const goToVideoEditor = useCallback(() => {
    pause();
    setCurrentScreen('video');
  }, [pause, setCurrentScreen]);

  const goToSubtitleEditor = useCallback(() => {
    pause();
    setCurrentScreen('subtitle');
  }, [pause, setCurrentScreen]);

  return {
    videoRef,
    videoSrc,
    videoFile,
    videoDuration,
    currentTime,
    playing,
    trimStart,
    trimEnd,
    isLoading,
    loadProgress,
    loadVideo,
    play,
    pause,
    seek,
    handleTimeUpdate,
    trimVideo,
    setTrimRange,
    goToVideoEditor,
    goToSubtitleEditor,
    reset,
  };
}

export default useVideoEditor;