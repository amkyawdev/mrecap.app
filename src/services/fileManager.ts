/**
 * File Manager Service
 * Handles local storage and file operations
 */

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  uri: string;
}

const FILE_STORAGE_KEY = 'mrecap_files';

export class FileManager {
  private static storage: Map<string, FileMetadata> = new Map();

  /**
   * Save file to storage
   */
  static async saveFile(file: File): Promise<FileMetadata> {
    const uri = URL.createObjectURL(file);
    const metadata: FileMetadata = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      uri,
    };
    
    this.storage.set(file.name, metadata);
    
    // Also save to localStorage for persistence
    try {
      const filesJson = localStorage.getItem(FILE_STORAGE_KEY) || '{}';
      const files = JSON.parse(filesJson);
      files[file.name] = metadata;
      localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.warn('localStorage not available');
    }
    
    return metadata;
  }

  /**
   * Get file from storage
   */
  static getFile(name: string): FileMetadata | undefined {
    return this.storage.get(name);
  }

  /**
   * Delete file from storage
   */
  static deleteFile(name: string): void {
    const metadata = this.storage.get(name);
    if (metadata?.uri) {
      URL.revokeObjectURL(metadata.uri);
    }
    this.storage.delete(name);
    
    try {
      const filesJson = localStorage.getItem(FILE_STORAGE_KEY) || '{}';
      const files = JSON.parse(filesJson);
      delete files[name];
      localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.warn('localStorage not available');
    }
  }

  /**
   * Load all files from storage
   */
  static loadAllFiles(): FileMetadata[] {
    return Array.from(this.storage.values());
  }

  /**
   * Pick video file from device
   */
  static async pickVideoFile(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      
      input.onchange = () => {
        resolve(input.files?.[0] || null);
      };
      
      input.click();
    });
  }

  /**
   * Pick subtitle file (SRT)
   */
  static async pickSubtitleFile(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.srt,.vtt,.txt';
      
      input.onchange = () => {
        resolve(input.files?.[0] || null);
      };
      
      input.click();
    });
  }

  /**
   * Export file to download
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all cached files
   */
  static clearCache(): void {
    for (const [, metadata] of this.storage) {
      if (metadata.uri) {
        URL.revokeObjectURL(metadata.uri);
      }
    }
    this.storage.clear();
    
    try {
      localStorage.removeItem(FILE_STORAGE_KEY);
    } catch (error) {
      console.warn('localStorage not available');
    }
  }
}