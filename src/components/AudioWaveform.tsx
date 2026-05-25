import React from 'react';

interface AudioWaveformProps {
  audioSrc: string;
  currentTime?: number;
  onReady?: (duration: number) => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioSrc,
  currentTime = 0,
  onReady,
}) => {
  // Visual placeholder for waveform
  // In production, use a library like wavesurfer.js
  
  return (
    <div className="audio-waveform">
      <div className="waveform-bars">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${Math.random() * 100}%`,
              opacity: (i / 50) <= (currentTime / 30) ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      
      <style>{`
        .audio-waveform {
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 16px;
        }
        .waveform-bars {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 60px;
        }
        .waveform-bar {
          flex: 1;
          background: linear-gradient(to top, #FF0000, #FF6666);
          border-radius: 2px;
          min-height: 4px;
        }
      `}</style>
    </div>
  );
};

export default AudioWaveform;