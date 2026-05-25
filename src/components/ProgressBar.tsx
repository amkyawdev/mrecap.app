import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="progress-bar-container">
      {label && <div className="progress-label">{label}</div>}
      
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      
      {showPercentage && (
        <div className="progress-percentage">{Math.round(clampedProgress)}%</div>
      )}
      
      <style>{`
        .progress-bar-container {
          padding: 16px;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
        }
        .progress-label {
          color: white;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .progress-track {
          height: 8px;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF0000, #FF6666);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .progress-percentage {
          color: white;
          text-align: center;
          margin-top: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;