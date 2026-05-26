/**
 * Export Service
 * Fast video export with optimized FFmpeg processing
 */

import { SubtitleStyle } from '../store/projectStore';
import { VideoEffect, ColorFilter } from '../store/timelineStore';

export interface ExportOptions {
  videoUrl: string;
  subtitleContent?: string;
  subtitleStyle?: SubtitleStyle;
  audioUrl?: string;
  audioVolume?: number;
  quality?: 'ultra-fast' | 'fast' | 'balanced' | 'high-quality';
  onProgress?: (progress: number, message?: string) => void;
  // Video effects
  effects?: VideoEffect[];
  filter?: ColorFilter | null;
  // Transform
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  speed?: number;
  volume?: number;
}

// Quality presets for fast export
const QUALITY_PRESETS = {
  'ultra-fast': { preset: 'ultrafast', crf: 28, audioBitrate: '96k' },
  'fast': { preset: 'veryfast', crf: 26, audioBitrate: '128k' },
  'balanced': { preset: 'medium', crf: 23, audioBitrate: '192k' },
  'high-quality': { preset: 'slow', crf: 20, audioBitrate: '256k' },
};

// Build FFmpeg video filter string from effects and filter
interface VideoFilterOptions {
  effects?: VideoEffect[];
  filter?: ColorFilter | null;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  speed?: number;
}

function buildVideoFilter(options: VideoFilterOptions): string {
  const filters: string[] = [];
  
  // Apply color filter (brightness, contrast, saturation, hue)
  if (options.filter && options.filter.enabled) {
    if (options.filter.brightness !== 1 || options.filter.contrast !== 1 || 
        options.filter.saturation !== 1 || options.filter.hue !== 0) {
      filters.push(`eq=brightness=${options.filter.brightness - 1}:contrast=${options.filter.contrast}:saturation=${options.filter.saturation}:hue=${options.filter.hue}`);
    }
  }
  
  // Apply video effects
  if (options.effects) {
    options.effects.forEach(effect => {
      if (!effect.enabled) return;
      
      switch (effect.type) {
        case 'brightness':
          filters.push(`eq=brightness=${effect.value}`);
          break;
        case 'contrast':
          filters.push(`eq=contrast=${1 + effect.value}`);
          break;
        case 'saturation':
          filters.push(`eq=saturation=${1 + effect.value}`);
          break;
        case 'blur':
          filters.push(`boxblur=${effect.value}:${effect.value}`);
          break;
        case 'sepia':
          filters.push(`colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`);
          break;
        case 'grayscale':
          filters.push(`hue=s=0`);
          break;
        case 'invert':
          filters.push(`negate`);
          break;
        case 'vintage':
          filters.push(`curves=all='0/0 0.25/0.1 0.6/0.4 1/0.95'`);
          break;
        case 'cool':
          filters.push(`hue=h=10`);
          break;
        case 'warm':
          filters.push(`hue=h=-10:s=1.2`);
          break;
      }
    });
  }
  
  // Apply rotation
  if (options.rotation === 90) {
    filters.push('transpose=1');
  } else if (options.rotation === 180) {
    filters.push('transpose=1,transpose=1');
  } else if (options.rotation === 270) {
    filters.push('transpose=2');
  }
  
  // Apply flip
  if (options.flipH) {
    filters.push('hflip');
  }
  if (options.flipV) {
    filters.push('vflip');
  }
  
  // Apply speed (setpts for video)
  if (options.speed && options.speed !== 1) {
    filters.push(`setpts=${1/options.speed}*PTS`);
  }
  
  return filters.length > 0 ? filters.join(',') : '';
}

export class ExportService {
  private static progress = 0;
  private static ffmpeg: any = null;
  private static ffmpegLoaded = false;

  /**
   * Initialize FFmpeg with caching
   */
  static async initFFmpeg(onProgress?: (progress: number, message?: string) => void): Promise<boolean> {
    if (this.ffmpegLoaded && this.ffmpeg) return true;

    try {
      onProgress?.(5, 'Loading video processor...');
      
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      this.ffmpeg = new FFmpeg();
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.ffmpegLoaded = true;
      onProgress?.(15, 'Video processor ready!');
      return true;
    } catch (error) {
      console.error('FFmpeg init failed:', error);
      return false;
    }
  }

  /**
   * Quick export - Skip FFmpeg for simple cases (no subtitles/audio)
   */
  static async quickExport(videoUrl: string): Promise<string> {
    // For videos without modifications, just return the original
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Fast export with optimized settings
   */
  static async export(options: ExportOptions): Promise<string> {
    const { 
      videoUrl, 
      subtitleContent, 
      subtitleStyle, 
      audioUrl, 
      audioVolume = 1, 
      quality = 'fast',
      effects,
      filter,
      rotation,
      flipH,
      flipV,
      speed,
      volume = 1,
      onProgress 
    } = options;
    
    this.progress = 0;
    
    // Quick export if no modifications needed
    if (!subtitleContent && !audioUrl && !effects?.length && !filter?.enabled && 
        !rotation && !flipH && !flipV && (!speed || speed === 1) && volume === 1) {
      onProgress?.(10, 'Quick export...');
      onProgress?.(50, 'Processing...');
      onProgress?.(100, 'Done!');
      return this.quickExport(videoUrl);
    }
    
    const preset = QUALITY_PRESETS[quality];

    try {
      onProgress?.(5, 'Initializing...');
      const loaded = await this.initFFmpeg();
      if (!loaded) throw new Error('Failed to load FFmpeg');

      onProgress?.(15, 'Loading video...');
      const { fetchFile } = await import('@ffmpeg/util');
      
      const videoData = await fetchFile(videoUrl);
      await this.ffmpeg.writeFile('input.mp4', videoData);
      onProgress?.(25, 'Video loaded');

      // Build video filter string
      const videoFilterStr = buildVideoFilter({
        effects,
        filter,
        rotation,
        flipH,
        flipV,
        speed,
      });

      let ffmpegArgs: string[] = ['-i', 'input.mp4'];
      let vfParts: string[] = [];

      // Add video filter if exists
      if (videoFilterStr) {
        vfParts.push(videoFilterStr);
      }

      // Subtitles
      if (subtitleContent) {
        onProgress?.(30, 'Adding subtitles...');
        const srtData = new TextEncoder().encode(subtitleContent);
        await this.ffmpeg.writeFile('subs.srt', srtData);
        const styleString = this.buildSubtitleStyle(subtitleStyle);
        vfParts.push(`subtitles=subs.srt:force_style='${styleString}'`);
      }

      // Audio - build audio filter
      let audioFilterComplex = '';
      let audioStream = '0:a';
      
      if (audioUrl) {
        onProgress?.(40, 'Mixing audio...');
        const audioData = await fetchFile(audioUrl);
        await this.ffmpeg.writeFile('audio.mp3', audioData);
        
        if (audioVolume < 1 || volume !== 1) {
          // Mix original audio with voiceover
          ffmpegArgs.push('-i', 'audio.mp3');
          audioFilterComplex = `[0:a]volume=${volume}[a0];[1:a]volume=${audioVolume}[a1];[a0][a1]amix=inputs=2:duration=longest[aout]`;
        } else {
          // Replace audio with voiceover
          ffmpegArgs.push('-i', 'audio.mp3');
          audioFilterComplex = '[1:a]';
          audioStream = '[1:a]';
        }
      } else if (volume !== 1) {
        // Adjust volume without adding audio
        audioFilterComplex = `[0:a]volume=${volume}[aout]`;
        audioStream = '[aout]';
      }

      // Build final filter complex
      if (vfParts.length > 0 || audioFilterComplex) {
        // Handle speed change for audio separately (setpts for video, atempo for audio)
        let audioFilterStr = audioFilterComplex;
        if (speed && speed !== 1 && audioUrl) {
          // Add atempo for audio speed (FFmpeg.wasm atempo range: 0.5-2.0)
          const atempoValue = Math.min(2, Math.max(0.5, speed));
          if (audioFilterStr) {
            audioFilterStr = `[aout]atempo=${atempoValue}[aout]`;
          }
        }
        
        if (vfParts.length > 0 && audioFilterStr) {
          ffmpegArgs.push('-filter_complex', `${vfParts.join(',')},${audioFilterStr}`);
        } else if (vfParts.length > 0) {
          ffmpegArgs.push('-vf', vfParts.join(','));
        } else if (audioFilterStr) {
          ffmpegArgs.push('-filter_complex', audioFilterStr);
        }
        
        if (vfParts.length > 0) {
          ffmpegArgs.push('-map', '0:v');
        }
        ffmpegArgs.push('-map', audioStream);
      }

      // Fast output settings
      onProgress?.(55, 'Exporting...');
      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', preset.preset,
        '-crf', preset.crf.toString(),
        '-c:a', 'aac',
        '-b:a', preset.audioBitrate,
        '-movflags', '+faststart',
        '-threads', '4',
        '-y',
        'output.mp4'
      );

      onProgress?.(60, 'Processing video...');
      await this.ffmpeg.exec(ffmpegArgs);

      onProgress?.(90, 'Finalizing...');
      const data = await this.ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      
      this.progress = 100;
      onProgress?.(100, 'Export complete!');

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static getProgress(): number {
    return this.progress;
  }

  static async share(videoPath: string): Promise<boolean> {
    try {
      if (navigator.share) {
        const response = await fetch(videoPath);
        const blob = await response.blob();
        const file = new File([blob], 'mrecap-video.mp4', { type: 'video/mp4' });
        await navigator.share({ files: [file], title: 'My Recap', text: 'Check out my video!' });
        return true;
      }
      const a = document.createElement('a');
      a.href = videoPath;
      a.download = 'mrecap-video.mp4';
      a.click();
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }

  static async saveToGallery(videoPath: string): Promise<boolean> {
    try {
      const a = document.createElement('a');
      a.href = videoPath;
      a.download = 'mrecap-video.mp4';
      a.click();
      return true;
    } catch (error) {
      console.error('Save to gallery failed:', error);
      return false;
    }
  }

  static subtitlesToSRT(subtitles: Array<{ id: number; startTime: number; endTime: number; text: string }>): string {
    return subtitles
      .map((sub, index) => {
        const start = this.formatSRTTime(sub.startTime);
        const end = this.formatSRTTime(sub.endTime);
        return `${index + 1}\n${start} --> ${end}\n${sub.text}`;
      })
      .join('\n\n');
  }

  private static formatSRTTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }

  private static buildSubtitleStyle(style?: SubtitleStyle): string {
    if (!style) return 'FontSize=24,PrimaryColour=&HFFFFFF&,BorderStyle=3';
    const styles: string[] = [];
    styles.push(`FontSize=${style.fontSize}`);
    const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '');
    styles.push(`FontName=${fontName}`);
    const textColor = style.textColor.replace('#', '');
    styles.push(`PrimaryColour=&H${this.hexToBGR(textColor)}&`);
    const bgColor = style.backgroundColor.replace('#', '');
    const alpha = Math.round((1 - style.backgroundOpacity) * 255);
    styles.push(`BackColour=&H${alpha.toString(16).padStart(2, '0')}${this.hexToBGR(bgColor)}&`);
    styles.push('BorderStyle=3');
    styles.push(style.position === 'top' ? 'Alignment=5' : style.position === 'center' ? 'Alignment=5' : 'Alignment=2');
    styles.push(`Bold=${style.fontWeight === 'bold' ? 1 : 0}`);
    if (style.textShadow) styles.push('Shadow=2');
    return styles.join(',');
  }

  private static hexToBGR(hex: string): string {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`;
  }
}