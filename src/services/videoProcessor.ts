/**
 * Video Processing Service using FFmpeg
 * Handles video trimming, subtitle burning, and audio mixing
 */

export interface TrimOptions {
  inputPath: string;
  startTime: number;
  endTime: number;
}

export interface SubtitleOptions {
  videoPath: string;
  srtPath: string;
}

export interface AudioMixOptions {
  videoPath: string;
  audioPath: string;
  volume: number;
}

export class VideoProcessor {
  private static ffmpeg: any = null;

  /**
   * Initialize FFmpeg
   */
  static async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { toBlobURL } = await import('@ffmpeg/util');
        
        this.ffmpeg = new FFmpeg();
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      } catch (error) {
        console.warn('FFmpeg loading skipped in non-browser environment');
      }
    }
  }

  /**
   * Trim video between start and end time
   */
  static async trimVideo(options: TrimOptions): Promise<string> {
    if (!this.ffmpeg) {
      await this.initialize();
    }
    
    const { inputPath, startTime, endTime } = options;
    const outputPath = `trimmed_${Date.now()}.mp4`;
    
    try {
      await this.ffmpeg.exec([
        '-i', inputPath,
        '-ss', String(startTime),
        '-to', String(endTime),
        '-c', 'copy',
        outputPath
      ]);
    } catch (error) {
      console.error('Trim failed:', error);
      throw error;
    }
    
    return outputPath;
  }

  /**
   * Burn subtitles into video
   */
  static async burnSubtitles(options: SubtitleOptions): Promise<string> {
    if (!this.ffmpeg) {
      await this.initialize();
    }
    
    const { videoPath, srtPath } = options;
    const outputPath = `subtitled_${Date.now()}.mp4`;
    
    try {
      await this.ffmpeg.exec([
        '-i', videoPath,
        '-vf', `subtitles='${srtPath}'`,
        '-c:a', 'copy',
        outputPath
      ]);
    } catch (error) {
      console.error('Subtitle burn failed:', error);
      throw error;
    }
    
    return outputPath;
  }

  /**
   * Mix audio with video
   */
  static async mixAudio(options: AudioMixOptions): Promise<string> {
    if (!this.ffmpeg) {
      await this.initialize();
    }
    
    const { videoPath, audioPath, volume } = options;
    const outputPath = `mixed_${Date.now()}.mp4`;
    
    try {
      await this.ffmpeg.exec([
        '-i', videoPath,
        '-i', audioPath,
        '-filter_complex', `[1:a]volume=${volume}[a1];[0:a][a1]amix=inputs=2:duration=first`,
        '-c:v', 'copy',
        outputPath
      ]);
    } catch (error) {
      console.error('Audio mix failed:', error);
      throw error;
    }
    
    return outputPath;
  }

  /**
   * Complete render pipeline
   */
  static async renderComplete(
    videoPath: string,
    srtPath?: string | null,
    audioPath?: string | null
  ): Promise<string> {
    let current = videoPath;
    
    if (srtPath) {
      current = await this.burnSubtitles({ videoPath: current, srtPath });
    }
    
    if (audioPath) {
      current = await this.mixAudio({ videoPath: current, audioPath, volume: 0.8 });
    }
    
    return current;
  }
}