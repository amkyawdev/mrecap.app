/**
 * Audio Mixer Service
 * Handles audio recording, upload, and mixing
 */

export interface AudioTrack {
  uri: string;
  name: string;
  duration: number;
}

export interface MixerOptions {
  tracks: AudioTrack[];
  volumes: number[];
  outputPath: string;
}

export class AudioMixer {
  /**
   * Record audio from microphone
   */
  static async startRecording(): Promise<MediaRecorder | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      return mediaRecorder;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return null;
    }
  }

  /**
   * Stop recording and get audio blob
   */
  static async stopRecording(mediaRecorder: MediaRecorder): Promise<Blob | null> {
    return new Promise((resolve) => {
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(blob);
      };
      
      mediaRecorder.stop();
    });
  }

  /**
   * Upload audio file from device
   */
  static async pickAudioFile(): Promise<File | null> {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      
      return new Promise((resolve) => {
        input.onchange = () => {
          const file = input.files?.[0] || null;
          resolve(file);
        };
        input.click();
      });
    } catch (error) {
      console.error('Failed to pick audio file:', error);
      return null;
    }
  }

  /**
   * Get audio duration
   */
  static async getAudioDuration(audioUrl: string): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        resolve(0);
      };
    });
  }

  /**
   * Mix multiple audio tracks
   */
  static async mixTracks(tracks: AudioTrack[]): Promise<AudioBuffer | null> {
    try {
      const audioContext = new AudioContext();
      const buffers = await Promise.all(
        tracks.map(async (track) => {
          const response = await fetch(track.uri);
          const arrayBuffer = await response.arrayBuffer();
          return audioContext.decodeAudioData(arrayBuffer);
        })
      );
      
      // Get max length
      const maxLength = Math.max(...buffers.map((b) => b.length));
      
      // Create output buffer
      const outputBuffer = audioContext.createBuffer(
        2,
        maxLength,
        audioContext.sampleRate
      );
      
      // Mix channels
      for (let channel = 0; channel < 2; channel++) {
        const output = outputBuffer.getChannelData(channel);
        
        for (let i = 0; i < maxLength; i++) {
          let sum = 0;
          
          for (const buffer of buffers) {
            if (i < buffer.length) {
              sum += buffer.getChannelData(channel)[i];
            }
          }
          
          output[i] = Math.min(1, Math.max(-1, sum));
        }
      }
      
      return outputBuffer;
    } catch (error) {
      console.error('Failed to mix tracks:', error);
      return null;
    }
  }

  /**
   * Convert audio buffer to WAV blob
   */
  static async bufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = buffer.length * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;
    
    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);
    
    // Write WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
}