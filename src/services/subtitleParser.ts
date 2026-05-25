/**
 * Subtitle Parser Service
 * Handles SRT/VTT parsing, editing, and formatting
 */

export interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

/**
 * Detect subtitle format from content
 */
export function detectFormat(content: string): 'srt' | 'vtt' | 'unknown' {
  const trimmed = content.trim();
  if (trimmed.startsWith('WEBVTT')) return 'vtt';
  if (trimmed.match(/\d{2}:\d{2}:\d{2},\d{3}/)) return 'srt';
  return 'srt'; // default to srt
}

/**
 * Parse SRT timestamp to seconds
 * Example: "00:01:23,456" -> 83.456
 */
export function parseTimestamp(timestamp: string): number {
  const cleanTs = timestamp.replace(',', '.');
  const parts = cleanTs.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convert seconds to SRT timestamp
 * Example: 83.456 -> "00:01:23,456"
 */
export function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Convert seconds to VTT timestamp
 * Example: 83.456 -> "00:01:23.456"
 */
export function formatVTTTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Parse subtitle content (auto-detect format)
 */
export function parseSubtitles(content: string): Subtitle[] {
  const format = detectFormat(content);
  
  if (format === 'vtt') {
    return parseVTT(content);
  }
  return parseSRT(content);
}

/**
 * Parse SRT content to Subtitle array
 */
export function parseSRT(content: string): Subtitle[] {
  const entries = content.trim().split(/\n\n+/);
  const subtitles: Subtitle[] = [];
  
  for (const entry of entries) {
    const lines = entry.split('\n');
    if (lines.length < 3) continue;
    
    const indexLine = lines[0].trim();
    const timeLine = lines[1].trim();
    const textLines = lines.slice(2);
    
    const index = parseInt(indexLine, 10);
    if (isNaN(index)) continue;
    
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;
    
    subtitles.push({
      id: index,
      startTime: parseTimestamp(timeMatch[1]),
      endTime: parseTimestamp(timeMatch[2]),
      text: textLines.join('\n'),
    });
  }
  
  return subtitles;
}

/**
 * Parse VTT content to Subtitle array
 */
export function parseVTT(content: string): Subtitle[] {
  // Remove WEBVTT header and any metadata
  const lines = content.replace(/^WEBVTT.*\n/, '').trim().split(/\n\n+/);
  const subtitles: Subtitle[] = [];
  
  for (const entry of lines) {
    const entryLines = entry.split('\n');
    if (entryLines.length < 2) continue;
    
    // Find timestamp line
    const timeLine = entryLines.find(line => line.includes('-->'));
    if (!timeLine) continue;
    
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})/);
    if (!timeMatch) continue;
    
    const textIdx = entryLines.indexOf(timeLine);
    const text = entryLines.slice(textIdx + 1).join('\n');
    
    subtitles.push({
      id: subtitles.length + 1,
      startTime: parseVTTTime(timeMatch[1]),
      endTime: parseVTTTime(timeMatch[2]),
      text: text,
    });
  }
  
  return subtitles;
}

/**
 * Parse VTT timestamp to seconds
 */
function parseVTTTime(timestamp: string): number {
  const cleanTs = timestamp.replace('.', ':');
  const parts = cleanTs.split(':');
  
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return 0;
}

/**
 * Convert Subtitle array to SRT content
 */
export function toSRT(subtitles: Subtitle[]): string {
  return subtitles
    .sort((a, b) => a.startTime - b.startTime)
    .map((sub, idx) => {
      return `${idx + 1}\n${formatTimestamp(sub.startTime)} --> ${formatTimestamp(sub.endTime)}\n${sub.text}`;
    })
    .join('\n\n');
}

/**
 * Convert Subtitle array to VTT content
 */
export function toVTT(subtitles: Subtitle[]): string {
  const header = 'WEBVTT\n\n';
  const content = subtitles
    .sort((a, b) => a.startTime - b.startTime)
    .map((sub, idx) => {
      return `${idx + 1}\n${formatVTTTimestamp(sub.startTime)} --> ${formatVTTTimestamp(sub.endTime)}\n${sub.text}`;
    })
    .join('\n\n');
  
  return header + content;
}

/**
 * Create a new subtitle entry
 */
export function createSubtitle(
  startTime: number,
  endTime: number,
  text: string
): Subtitle {
  return {
    id: Date.now(),
    startTime,
    endTime,
    text,
  };
}

/**
 * Find subtitle at current playback time
 */
export function findActiveSubtitle(
  subtitles: Subtitle[],
  currentTime: number
): Subtitle | null {
  return (
    subtitles.find(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    ) || null
  );
}

/**
 * Merge overlapping subtitles
 */
export function mergeOverlapping(subtitles: Subtitle[]): Subtitle[] {
  const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
  const merged: Subtitle[] = [];
  
  for (const sub of sorted) {
    const last = merged[merged.length - 1];
    if (last && sub.startTime <= last.endTime) {
      last.endTime = Math.max(last.endTime, sub.endTime);
      last.text += '\n' + sub.text;
    } else {
      merged.push({ ...sub });
    }
  }
  
  return merged;
}