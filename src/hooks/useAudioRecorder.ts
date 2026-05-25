import { useCallback, useState, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const {
    audioSrc,
    audioFile,
    audioVolume,
    videoDuration,
    setAudioSrc,
    setAudioFile,
    setAudioVolume,
    setCurrentScreen,
  } = useProjectStore();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
        setAudioFile(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [setAudioSrc, setAudioFile]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const loadAudioFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioSrc(url);
    setAudioFile(file);
  }, [setAudioSrc, setAudioFile]);

  const clearAudio = useCallback(() => {
    setAudioSrc(null);
    setAudioFile(null);
    setRecordingDuration(0);
  }, [setAudioSrc, setAudioFile]);

  const changeVolume = useCallback((volume: number) => {
    setAudioVolume(volume);
  }, [setAudioVolume]);

  const goToNext = useCallback(() => {
    setCurrentScreen('export');
  }, [setCurrentScreen]);

  const goBack = useCallback(() => {
    setCurrentScreen('subtitle');
  }, [setCurrentScreen]);

  return {
    audioSrc,
    audioFile,
    audioVolume,
    videoDuration,
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    loadAudioFile,
    clearAudio,
    changeVolume,
    goToNext,
    goBack,
  };
}

export default useAudioRecorder;