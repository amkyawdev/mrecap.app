/**
 * Export Service
 * Fast video export with optimized FFmpeg processing
 */

import { SubtitleStyle } from '../store/projectStore';

export interface ExportOptions {
  videoUrl: string;
  subtitleContent?: string;
  subtitleStyle?: SubtitleStyle;
  audioUrl?: string;
  audioVolume?: number;
  quality?: 'ultra-fast' | 'fast' | 'balanced' | 'high-quality';
  onProgress?: (progress: number, message?: string) => void;
}

// Quality presets for fast export
const QUALITY_PRESETS = {
  'ultra-fast': { preset: 'ultrafast', crf: 28, audioBitrate: '96k' },
  'fast': { preset: 'veryfast', crf: 26, audioBitrate: '128k' },
  'balanced': { preset: 'medium', crf: 23, audioBitrate: '192k' },
  'high-quality': { preset: 'slow', crf: 20, audioBitrate: '256k' },
};

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
      onProgress 
    } = options;
    
    this.progress = 0;
    
    // Quick export if no modifications needed
    if (!subtitleContent && !audioUrl) {
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

      let ffmpegArgs: string[] = ['-i', 'input.mp4'];

      // Subtitles
      if (subtitleContent) {
        onProgress?.(30, 'Adding subtitles...');
        const srtData = new TextEncoder().encode(subtitleContent);
        await this.ffmpeg.writeFile('subs.srt', srtData);
        const styleString = this.buildSubtitleStyle(subtitleStyle);
        ffmpegArgs.push('-vf', `subtitles=subs.srt:force_style='${styleString}'`);
      }

      // Audio
      if (audioUrl) {
        onProgress?.(40, 'Mixing audio...');
        const audioData = await fetchFile(audioUrl);
        await this.ffmpeg.writeFile('audio.mp3', audioData);
        
        if (audioVolume < 1) {
          ffmpegArgs.push(
            '-filter_complex', 
            `[0:a]volume=0.3[a0];[1:a]volume=${audioVolume}[a1];[a0][a1]amix=inputs=2:duration=longest[aout]`, 
            '-map', '[aout]'
          );
        } else {
          ffmpegArgs.push('-i', 'audio.mp3', '-c:a', 'aac', '-b:a', preset.audioBitrate, '-map', '0:v', '-map', '1:a');
        }
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