import { useCallback, useRef, useState } from 'react';
import { useProjectStore } from '../store/projectStore';

export function useVideoEditor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
    try {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoFile(file);
      
      // Get duration
      const video = document.createElement('video');
      video.src = url;
      
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });
      
      setVideoDuration(video.duration);
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setVideoSrc, setVideoFile, setVideoDuration]);

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

  const goToNext = useCallback(() => {
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
    loadVideo,
    play,
    pause,
    seek,
    handleTimeUpdate,
    trimVideo,
    setTrimRange,
    goToNext,
    reset,
  };
}

export default useVideoEditor;