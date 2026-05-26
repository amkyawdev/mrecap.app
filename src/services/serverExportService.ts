/**
 * Server-side Export Service
 * Uses the API route for video export with FFmpeg
 */

import { SubtitleStyle } from '../store/projectStore';

export interface ServerExportOptions {
  videoUrl: string;
  subtitleContent?: string;
  subtitleStyle?: SubtitleStyle;
  audioUrl?: string;
  audioVolume?: number;
  onProgress?: (progress: number, message?: string) => void;
}

export class ServerExportService {
  private static apiUrl = '/api/export';

  /**
   * Check if server-side export is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/api/export', {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Export video using server-side FFmpeg
   */
  static async export(options: ServerExportOptions): Promise<string> {
    const { 
      videoUrl, 
      subtitleContent, 
      audioUrl, 
      audioVolume = 1, 
      onProgress 
    } = options;
    
    onProgress?.(5, 'Uploading video...');
    
    // Create form data
    const formData = new FormData();
    
    // Fetch and append video file
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video file');
    }
    const videoBlob = await videoResponse.blob();
    const videoFile = new File([videoBlob], 'video.mp4', { type: 'video/mp4' });
    formData.append('video', videoFile);
    
    // Add subtitle content
    if (subtitleContent) {
      formData.append('subtitle', subtitleContent);
    }
    
    // Add audio if provided
    if (audioUrl) {
      onProgress?.(15, 'Processing audio...');
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file');
      }
      const audioBlob = await audioResponse.blob();
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });
      formData.append('audio', audioFile);
      formData.append('audioVolume', audioVolume.toString());
    }
    
    onProgress?.(25, 'Processing video...');
    
    // Send request to server with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min timeout
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = 'Export failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }
    
    onProgress?.(90, 'Finalizing...');
    
    // Get the video blob
    const videoBlobResult = await response.blob();
    
    onProgress?.(100, 'Export complete!');
    
    // Return as object URL
    return URL.createObjectURL(videoBlobResult);
  }

  /**
   * Convert subtitles to SRT format
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

  private static formatSRTTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
}