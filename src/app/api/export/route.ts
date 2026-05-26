/**
 * Server-side Export API Route
 * Uses FFmpeg for video export
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Video effect types for server processing
interface VideoEffect {
  id: string;
  type: 'brightness' | 'contrast' | 'saturation' | 'blur' | 'sharpen' | 'sepia' | 'grayscale' | 'invert' | 'vintage' | 'cool' | 'warm';
  value: number;
  enabled: boolean;
}

interface ColorFilter {
  id: string;
  name: string;
  preset: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  enabled: boolean;
}

// Build FFmpeg video filter string
function buildVideoFilter(options: {
  effects?: VideoEffect[];
  filter?: ColorFilter | null;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  speed?: number;
}): string {
  const filters: string[] = [];
  
  // Apply color filter
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
  
  // Apply speed
  if (options.speed && options.speed !== 1) {
    filters.push(`setpts=${1/options.speed}*PTS`);
  }
  
  return filters.length > 0 ? filters.join(',') : '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const subtitle = formData.get('subtitle') as string | null;
    const audio = formData.get('audio') as File | null;
    const audioVolume = parseFloat(formData.get('audioVolume') as string) || 1;
    
    // Get video effect options
    const effectsJson = formData.get('effects') as string;
    const filterJson = formData.get('filter') as string;
    const rotation = parseInt(formData.get('rotation') as string) || 0;
    const flipH = formData.get('flipH') === 'true';
    const flipV = formData.get('flipV') === 'true';
    const speed = parseFloat(formData.get('speed') as string) || 1;

    const effects = effectsJson ? JSON.parse(effectsJson) : undefined;
    const filter = filterJson ? JSON.parse(filterJson) : null;

    if (!video) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Create temp directory
    const tempDir = path.join(os.tmpdir(), `mrecap-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Save uploaded video
    const videoBuffer = Buffer.from(await video.arrayBuffer());
    const videoPath = path.join(tempDir, 'input.mp4');
    await fs.writeFile(videoPath, videoBuffer);

    // Build video filter
    const videoFilterStr = buildVideoFilter({ effects, filter, rotation, flipH, flipV, speed });
    
    // Prepare output path and FFmpeg args
    const outputPath = path.join(tempDir, 'output.mp4');
    let ffmpegArgs: string[] = ['-i', 'input.mp4'];
    
    let vfParts: string[] = [];
    
    // Add video filter if exists
    if (videoFilterStr) {
      vfParts.push(videoFilterStr);
    }

    // Add subtitles if provided
    if (subtitle && subtitle.trim()) {
      const srtPath = path.join(tempDir, 'subs.srt');
      await fs.writeFile(srtPath, subtitle);
      
      // Use ASS subtitle format for better styling support
      const assPath = path.join(tempDir, 'subs.ass');
      await convertSrtToAss(subtitle, assPath);
      
      // Burn subtitles into video with styling
      vfParts.push(`ass=${assPath}`);
    }

    // Add audio overlay if provided
    if (audio) {
      const audioBuffer = Buffer.from(await audio.arrayBuffer());
      const audioPath = path.join(tempDir, 'audio.mp3');
      await fs.writeFile(audioPath, audioBuffer);
      
      if (audioVolume < 1) {
        // Mix original audio with voiceover
        ffmpegArgs.push(
          '-filter_complex', 
          `[0:a]volume=${audioVolume}[a0];[1:a]volume=1[a1];[a0][a1]amix=inputs=2:duration=longest[aout]`,
          '-map', '0:v',
          '-map', '[aout]'
        );
      } else {
        // Replace audio with voiceover
        ffmpegArgs.push('-i', 'audio.mp3', '-c:a', 'aac', '-b:a', '128k', '-map', '0:v', '-map', '1:a');
      }
    }

    // Apply video filters
    if (vfParts.length > 0) {
      ffmpegArgs.push('-vf', vfParts.join(','));
    }

    // Fast encoding settings
    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '26',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-threads', '4',
      '-y',
      'output.mp4'
    );

    // Execute FFmpeg
    try {
      await execAsync(`cd "${tempDir}" && ffmpeg ${ffmpegArgs.join(' ')}`, {
        maxBuffer: 1024 * 1024 * 100, // 100MB
      });
    } catch (ffmpegError: any) {
      console.error('FFmpeg error:', ffmpegError);
      throw new Error('FFmpeg processing failed');
    }

    // Read output file
    const outputBuffer = await fs.readFile(outputPath);
    
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });

    // Return video as streaming response
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="mrecap-export.mp4"',
        'Content-Length': outputBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}

// Helper function to convert SRT to ASS format
async function convertSrtToAss(srtContent: string, outputPath: string): Promise<void> {
  const lines = srtContent.trim().split('\n\n');
  let assContent = `[Script Info]
Title: mrecap subtitles

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, PrimaryColour, SecondaryColour, OutlineColour, BackColour
Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,&H00FFFFFF,&H000000FF,&H00000000,&H00000000

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  for (const block of lines) {
    const parts = block.split('\n');
    if (parts.length >= 3) {
      const timeLine = parts[1];
      const text = parts.slice(2).join('\n').replace(/<[^>]+>/g, ''); // Strip HTML tags
      const [start, end] = timeLine.split(' --> ').map(t => convertTimeToAss(t.trim()));
      
      assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
    }
  }

  await fs.writeFile(outputPath, assContent, 'utf-8');
}

function convertTimeToAss(time: string): string {
  // Convert SRT time (00:00:00,000) to ASS time (0:00:00.00)
  const parts = time.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const secondsParts = parts[2].split(',');
  const seconds = parseInt(secondsParts[0]);
  const centiseconds = Math.round(parseInt(secondsParts[1]) / 10);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// Health check
export async function GET() {
  try {
    // Check if FFmpeg is available
    await execAsync('ffmpeg -version');
    return NextResponse.json({ status: 'ok', ffmpeg: 'available' });
  } catch {
    return NextResponse.json({ status: 'ok', ffmpeg: 'not found' });
  }
}