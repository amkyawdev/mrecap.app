import { create } from 'zustand';
import { Subtitle } from '../services/subtitleParser';

// Video Effect Types
export interface VideoEffect {
  id: string;
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sharpen' | 'sepia' | 'grayscale' | 'invert' | 'vintage' | 'cool' | 'warm';
  value: number;
  enabled: boolean;
}

// Color Filter Types
export interface ColorFilter {
  id: string;
  name: string;
  preset: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  enabled: boolean;
}

// Video Clip
export interface VideoClip {
  id: string;
  file: File | null;
  url: string;
  startTime: number; // Position on timeline
  duration: number;
  trimStart: number; // Trim in point
  trimEnd: number; // Trim out point
  speed: number; // 0.25 to 4
  volume: number; // 0 to 1
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
  effects: VideoEffect[];
  filter: ColorFilter | null;
}

// Audio Track
export interface AudioTrack {
  id: string;
  file: File | null;
  url: string;
  name: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  muted: boolean;
}

// Text Overlay
export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: { x: number; y: number };
  alignment: 'left' | 'center' | 'right';
  animation: 'none' | 'fadeIn' | 'slideIn' | 'typewriter' | 'bounce' | 'pulse';
  rotation: number;
  bold: boolean;
  italic: boolean;
  shadow: boolean;
}

// Timeline State
interface TimelineState {
  // Clips and tracks
  videoClips: VideoClip[];
  audioTracks: AudioTrack[];
  subtitles: Subtitle[];
  
  // Timeline settings
  timelineDuration: number;
  currentTime: number;
  zoom: number; // 1 to 10
  playheadPosition: number;
  
  // Selection
  selectedClipId: string | null;
  selectedTrackId: string | null;
  
  // Tool mode
  toolMode: 'select' | 'trim' | 'split' | 'delete';
  
  // Playback
  isPlaying: boolean;
  
  // Actions
  addVideoClip: (clip: VideoClip) => void;
  updateVideoClip: (id: string, updates: Partial<VideoClip>) => void;
  removeVideoClip: (id: string) => void;
  reorderVideoClips: (clips: VideoClip[]) => void;
  
  addAudioTrack: (track: AudioTrack) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  removeAudioTrack: (id: string) => void;
  
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setToolMode: (mode: 'select' | 'trim' | 'split' | 'delete') => void;
  setSelectedClipId: (id: string | null) => void;
  setSelectedTrackId: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  
  splitClipAt: (clipId: string, time: number) => void;
  trimClip: (clipId: string, trimStart: number, trimEnd: number) => void;
  
  addEffectToClip: (clipId: string, effect: VideoEffect) => void;
  updateEffect: (clipId: string, effectId: string, updates: Partial<VideoEffect>) => void;
  removeEffect: (clipId: string, effectId: string) => void;
  setFilter: (clipId: string, filter: ColorFilter | null) => void;
  
  setTimelineDuration: (duration: number) => void;
  reset: () => void;
}

const defaultClips: VideoClip[] = [];
const defaultAudioTracks: AudioTrack[] = [];

export const useTimelineStore = create<TimelineState>((set, get) => ({
  videoClips: defaultClips,
  audioTracks: defaultAudioTracks,
  subtitles: [],
  timelineDuration: 60,
  currentTime: 0,
  zoom: 1,
  playheadPosition: 0,
  selectedClipId: null,
  selectedTrackId: null,
  toolMode: 'select',
  isPlaying: false,
  
  addVideoClip: (clip) => set((state) => ({
    videoClips: [...state.videoClips, clip]
  })),
  
  updateVideoClip: (id, updates) => set((state) => ({
    videoClips: state.videoClips.map(clip =>
      clip.id === id ? { ...clip, ...updates } : clip
    )
  })),
  
  removeVideoClip: (id) => set((state) => ({
    videoClips: state.videoClips.filter(clip => clip.id !== id),
    selectedClipId: state.selectedClipId === id ? null : state.selectedClipId
  })),
  
  reorderVideoClips: (clips) => set({ videoClips: clips }),
  
  addAudioTrack: (track) => set((state) => ({
    audioTracks: [...state.audioTracks, track]
  })),
  
  updateAudioTrack: (id, updates) => set((state) => ({
    audioTracks: state.audioTracks.map(track =>
      track.id === id ? { ...track, ...updates } : track
    )
  })),
  
  removeAudioTrack: (id) => set((state) => ({
    audioTracks: state.audioTracks.filter(track => track.id !== id),
    selectedTrackId: state.selectedTrackId === id ? null : state.selectedTrackId
  })),
  
  setCurrentTime: (time) => set({ currentTime: time, playheadPosition: time }),
  setZoom: (zoom) => set({ zoom: Math.max(1, Math.min(10, zoom)) }),
  setToolMode: (mode) => set({ toolMode: mode }),
  setSelectedClipId: (id) => set({ selectedClipId: id }),
  setSelectedTrackId: (id) => set({ selectedTrackId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  splitClipAt: (clipId, time) => set((state) => {
    const clip = state.videoClips.find(c => c.id === clipId);
    if (!clip) return state;
    
    const relativeTime = time - clip.startTime;
    if (relativeTime <= 0 || relativeTime >= clip.duration) return state;
    
    const firstClip: VideoClip = {
      ...clip,
      id: `${clip.id}-a`,
      duration: relativeTime,
      trimEnd: clip.trimStart + relativeTime,
    };
    
    const secondClip: VideoClip = {
      ...clip,
      id: `${clip.id}-b`,
      startTime: clip.startTime + relativeTime,
      duration: clip.duration - relativeTime,
      trimStart: clip.trimStart + relativeTime,
    };
    
    const newClips = state.videoClips.filter(c => c.id !== clipId);
    newClips.push(firstClip, secondClip);
    
    return { videoClips: newClips };
  }),
  
  trimClip: (clipId, trimStart, trimEnd) => set((state) => ({
    videoClips: state.videoClips.map(clip => {
      if (clip.id !== clipId) return clip;
      const newDuration = clip.duration - (trimStart - clip.trimStart) - (clip.trimEnd - trimEnd);
      return {
        ...clip,
        trimStart,
        trimEnd,
        duration: Math.max(0.1, newDuration),
      };
    })
  })),
  
  addEffectToClip: (clipId, effect) => set((state) => ({
    videoClips: state.videoClips.map(clip =>
      clip.id === clipId
        ? { ...clip, effects: [...clip.effects, effect] }
        : clip
    )
  })),
  
  updateEffect: (clipId, effectId, updates) => set((state) => ({
    videoClips: state.videoClips.map(clip =>
      clip.id === clipId
        ? {
            ...clip,
            effects: clip.effects.map(effect =>
              effect.id === effectId ? { ...effect, ...updates } : effect
            )
          }
        : clip
    )
  })),
  
  removeEffect: (clipId, effectId) => set((state) => ({
    videoClips: state.videoClips.map(clip =>
      clip.id === clipId
        ? { ...clip, effects: clip.effects.filter(e => e.id !== effectId) }
        : clip
    )
  })),
  
  setFilter: (clipId, filter) => set((state) => ({
    videoClips: state.videoClips.map(clip =>
      clip.id === clipId ? { ...clip, filter } : clip
    )
  })),
  
  setTimelineDuration: (duration) => set({ timelineDuration: duration }),
  
  reset: () => set({
    videoClips: [],
    audioTracks: [],
    subtitles: [],
    timelineDuration: 60,
    currentTime: 0,
    zoom: 1,
    playheadPosition: 0,
    selectedClipId: null,
    selectedTrackId: null,
    toolMode: 'select',
    isPlaying: false,
  }),
}));

// Color Filter Presets
export const COLOR_FILTER_PRESETS: { name: string; preset: string; brightness: number; contrast: number; saturation: number; hue: number }[] = [
  { name: 'None', preset: 'none', brightness: 1, contrast: 1, saturation: 1, hue: 0 },
  { name: 'Vintage', preset: 'vintage', brightness: 0.9, contrast: 1.1, saturation: 0.8, hue: 0 },
  { name: 'Cool', preset: 'cool', brightness: 1, contrast: 1.05, saturation: 1.1, hue: 200 },
  { name: 'Warm', preset: 'warm', brightness: 1, contrast: 1.05, saturation: 1.15, hue: 30 },
  { name: 'Dramatic', preset: 'dramatic', brightness: 0.85, contrast: 1.3, saturation: 1.2, hue: 0 },
  { name: 'Fade', preset: 'fade', brightness: 1.1, contrast: 0.9, saturation: 0.7, hue: 0 },
  { name: 'Muted', preset: 'muted', brightness: 1, contrast: 0.95, saturation: 0.6, hue: 0 },
  { name: 'Vivid', preset: 'vivid', brightness: 1, contrast: 1.15, saturation: 1.4, hue: 0 },
  { name: 'B&W', preset: 'bw', brightness: 1, contrast: 1.1, saturation: 0, hue: 0 },
  { name: 'Sepia', preset: 'sepia', brightness: 1, contrast: 1.05, saturation: 0.5, hue: 30 },
];

export default useTimelineStore;
