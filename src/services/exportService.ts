/**
 * Export Service
 * Handles exporting final video with all effects applied using FFmpeg.wasm
 */

export interface ExportOptions {
  videoUrl: string;
  subtitleContent?: string;
  audioUrl?: string;
  audioVolume?: number;
  onProgress?: (progress: number, message: string) => void;
}

export class ExportService {
  private static progress = 0;
  private static ffmpeg: any = null;
  private static ffmpegLoaded = false;

  /**
   * Initialize FFmpeg
   */
  static async initFFmpeg(onProgress?: (progress: number) => void): Promise<boolean> {
    if (this.ffmpegLoaded && this.ffmpeg) return true;

    try {
      onProgress?.(5);
      
      // Dynamic import for FFmpeg
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      this.ffmpeg = new FFmpeg();
      
      // Load FFmpeg core
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.ffmpegLoaded = true;
      onProgress?.(20);
      return true;
    } catch (error) {
      console.error('FFmpeg init failed:', error);
      return false;
    }
  }

  /**
   * Export final video with FFmpeg processing
   */
  static async export(options: ExportOptions): Promise<string> {
    const { videoUrl, subtitleContent, audioUrl, audioVolume = 1, onProgress } = options;
    
    this.progress = 0;
    let currentPath = videoUrl;

    try {
      // Initialize FFmpeg
      onProgress?.(5, 'Loading FFmpeg...');
      const loaded = await this.initFFmpeg((p) => onProgress?.(5 + p * 0.1, 'Loading FFmpeg...'));
      if (!loaded) throw new Error('Failed to load FFmpeg');

      onProgress?.(15, 'Loading video file...');
      
      // Get file from URL
      const { fetchFile } = await import('@ffmpeg/util');
      
      // Load video file
      const videoData = await fetchFile(videoUrl);
      await this.ffmpeg.writeFile('input.mp4', videoData);
      onProgress?.(25, 'Video loaded');

      // Build FFmpeg command
      let ffmpegArgs: string[] = ['-i', 'input.mp4'];

      // Add subtitles if provided
      if (subtitleContent) {
        onProgress?.(35, 'Processing subtitles...');
        
        // Create SRT file
        const srtData = new TextEncoder().encode(subtitleContent);
        await this.ffmpeg.writeFile('subs.srt', srtData);
        
        // Burn subtitles into video
        ffmpegArgs.push('-vf', `subtitles=subs.srt:force_style='FontSize=24,PrimaryColour=&HFFFFFF&,BorderStyle=3'`);
      }

      // Add audio overlay if provided
      if (audioUrl) {
        onProgress?.(50, 'Loading audio...');
        
        const audioData = await fetchFile(audioUrl);
        await this.ffmpeg.writeFile('audio.mp3', audioData);
        
        // Mix original audio with voiceover
        if (audioVolume < 1) {
          // Lower original audio volume and mix with voiceover
          ffmpegArgs.push('-filter_complex', `[0:a]volume=0.3[a0];[1:a]volume=${audioVolume}[a1];[a0][a1]amix=inputs=2:duration=longest[aout]`, '-map', '[aout]');
        } else {
          // Replace with voiceover
          ffmpegArgs.push('-i', 'audio.mp3', '-c:a', 'aac', '-b:a', '192k', '-map', '0:v', '-map', '1:a');
        }
      }

      // Output settings
      ffmpegArgs.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        'output.mp4'
      );

      onProgress?.(60, 'Processing video...');

      // Execute FFmpeg command
      await this.ffmpeg.exec(ffmpegArgs);

      onProgress?.(90, 'Finalizing...');

      // Read output file
      const data = await this.ffmpeg.readFile('output.mp4');
      const blob = new Blob([data], { type: 'video/mp4' });
      currentPath = URL.createObjectURL(blob);

      this.progress = 100;
      onProgress?.(100, 'Export complete!');

      return currentPath;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Get current export progress
   */
  static getProgress(): number {
    return this.progress;
  }

  /**
   * Share exported video
   */
  static async share(videoPath: string): Promise<boolean> {
    try {
      if (navigator.share) {
        const response = await fetch(videoPath);
        const blob = await response.blob();
        
        const file = new File([blob], 'mrecap-video.mp4', {
          type: 'video/mp4',
        });
        
        await navigator.share({
          files: [file],
          title: 'My Movie Recap',
          text: 'Check out my video!',
        });
        
        return true;
      }
      
      // Fallback to download
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

  /**
   * Save to device gallery (mobile)
   */
  static async saveToGallery(videoPath: string): Promise<boolean> {
    try {
      // For mobile, we'd use expo-media-library
      // This is a web fallback
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

  /**
   * Convert subtitle array to SRT format
   */
  static subtitlesToSRT(subtitles: Array<{ id: number; startTime: number; endTime: number; text: string }>): string {
    return subtitles
      .map((sub, index) => {
        const start = this.formatSRTTime(sub.startTime);
        const end = this.formatSRTTime(sub.endTime);
        return `${index + 1}\n${start} --> ${end}\n${sub.text}`;
      })
      .join('\n\n');
  }

  /**
   * Format time for SRT (HH:MM:SS,mmm)
   */
  private static formatSRTTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
}