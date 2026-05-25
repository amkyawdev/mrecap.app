import { create } from 'zustand';
import { Subtitle } from '../services/subtitleParser';

interface VideoState {
  // Video
  videoSrc: string | null;
  videoFile: File | null;
  videoDuration: number;
  currentTime: number;
  playing: boolean;
  
  // Trim
  trimStart: number;
  trimEnd: number;
  
  // Subtitles
  subtitles: Subtitle[];
  subtitleFile: File | null;
  
  // Audio
  audioSrc: string | null;
  audioFile: File | null;
  audioVolume: number;
  
  // Export
  exportProgress: number;
  exportedVideoSrc: string | null;
  
  // Navigation
  currentScreen: string;
  
  // Actions
  setVideoSrc: (src: string | null) => void;
  setVideoFile: (file: File | null) => void;
  setVideoDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  setTrimRange: (start: number, end: number) => void;
  setSubtitles: (subtitles: Subtitle[]) => void;
  addSubtitle: (subtitle: Subtitle) => void;
  updateSubtitle: (subtitle: Subtitle) => void;
  deleteSubtitle: (id: number) => void;
  setSubtitleFile: (file: File | null) => void;
  setAudioSrc: (src: string | null) => void;
  setAudioFile: (file: File | null) => void;
  setAudioVolume: (volume: number) => void;
  setExportProgress: (progress: number) => void;
  setExportedVideoSrc: (src: string | null) => void;
  setCurrentScreen: (screen: string) => void;
  reset: () => void;
}

const initialState = {
  videoSrc: null,
  videoFile: null,
  videoDuration: 0,
  currentTime: 0,
  playing: false,
  trimStart: 0,
  trimEnd: 0,
  subtitles: [],
  subtitleFile: null,
  audioSrc: null,
  audioFile: null,
  audioVolume: 0.8,
  exportProgress: 0,
  exportedVideoSrc: null,
  currentScreen: 'home',
};

export const useProjectStore = create<VideoState>((set) => ({
  ...initialState,
  
  setVideoSrc: (src) => set({ videoSrc: src }),
  setVideoFile: (file) => set({ videoFile: file }),
  setVideoDuration: (duration) => set({ videoDuration: duration, trimEnd: duration }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setPlaying: (playing) => set({ playing }),
  setTrimRange: (start, end) => set({ trimStart: start, trimEnd: end }),
  setSubtitles: (subtitles) => set({ subtitles }),
  addSubtitle: (subtitle) =>
    set((state) => ({ subtitles: [...state.subtitles, subtitle] })),
  updateSubtitle: (subtitle) =>
    set((state) => ({
      subtitles: state.subtitles.map((s) =>
        s.id === subtitle.id ? subtitle : s
      ),
    })),
  deleteSubtitle: (id) =>
    set((state) => ({
      subtitles: state.subtitles.filter((s) => s.id !== id),
    })),
  setSubtitleFile: (file) => set({ subtitleFile: file }),
  setAudioSrc: (src) => set({ audioSrc: src }),
  setAudioFile: (file) => set({ audioFile: file }),
  setAudioVolume: (volume) => set({ audioVolume: volume }),
  setExportProgress: (progress) => set({ exportProgress: progress }),
  setExportedVideoSrc: (src) => set({ exportedVideoSrc: src }),
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  reset: () => set(initialState),
}));

export default useProjectStore;