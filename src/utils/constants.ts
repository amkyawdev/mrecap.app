// App constants

export const APP_NAME = 'Movie Recap';
export const APP_VERSION = '1.0.0';

// Screen names
export const SCREENS = {
  HOME: 'home',
  VIDEO: 'video',
  SUBTITLE: 'subtitle',
  AUDIO: 'audio',
  EXPORT: 'export',
  SETTINGS: 'settings',
} as const;

// Supported video formats
export const VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];

// Supported audio formats
export const AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/webm'];

// Default values
export const DEFAULTS = {
  SUBTITLE_DURATION: 3, // seconds
  AUDIO_VOLUME: 0.8,
  VIDEO_QUALITY: 'high',
} as const;

// Colors (red theme)
export const COLORS = {
  PRIMARY: '#FF0000',
  SECONDARY: '#CC0000',
  DARK: '#990000',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;