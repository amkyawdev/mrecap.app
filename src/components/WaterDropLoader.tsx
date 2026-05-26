import React, { useEffect, useState } from 'react';

interface WaterDropLoaderProps {
  progress?: number;
  size?: number;
  color?: string;
  showPercentage?: boolean;
  text?: string;
}

export function WaterDropLoader({
  progress = 0,
  size = 120,
  color = '#dc2626',
  showPercentage = true,
  text = 'Loading...'
}: WaterDropLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [fillLevel, setFillLevel] = useState(0);

  useEffect(() => {
    // Animate progress number
    const timer = setTimeout(() => {
      setDisplayProgress(Math.min(100, Math.round(progress)));
    }, 100);
    
    // Animate fill level with delay
    const fillTimer = setTimeout(() => {
      setFillLevel(progress);
    }, 200);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(fillTimer);
    };
  }, [progress]);

  const dropHeight = size * 0.7;
  const dropWidth = size * 0.5;
  const neckWidth = size * 0.25;
  const neckHeight = size * 0.15;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size + 60 }}>
      {/* SVG Water Drop */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 120"
        className="drop-shadow-lg"
        style={{
          filter: `drop-shadow(0 4px 12px ${color}40)`,
        }}
      >
        {/* Bottle outline */}
        <defs>
          <clipPath id="bottleClip">
            <path d={`
              M ${50 - neckWidth/2} 0
              L ${50 + neckWidth/2} 0
              L ${50 + neckWidth/2} ${neckHeight}
              Q ${50 + dropWidth/2} ${neckHeight + 10}
                ${50 + dropWidth/2} ${neckHeight + dropHeight * 0.3}
              Q ${50 + dropWidth/2} ${neckHeight + dropHeight * 0.9}
                ${50} ${neckHeight + dropHeight}
              Q ${50 - dropWidth/2} ${neckHeight + dropHeight * 0.9}
                ${50 - dropWidth/2} ${neckHeight + dropHeight * 0.3}
              Q ${50 - dropWidth/2} ${neckHeight + 10}
                ${50 - neckWidth/2} ${neckHeight}
              Z
            `} />
          </clipPath>
          
          {/* Water gradient */}
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          
          {/* Glass reflection */}
          <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Bottle background */}
        <path
          d={`
            M ${50 - neckWidth/2} 0
            L ${50 + neckWidth/2} 0
            L ${50 + neckWidth/2} ${neckHeight}
            Q ${50 + dropWidth/2} ${neckHeight + 10}
              ${50 + dropWidth/2} ${neckHeight + dropHeight * 0.3}
            Q ${50 + dropWidth/2} ${neckHeight + dropHeight * 0.9}
              ${50} ${neckHeight + dropHeight}
            Q ${50 - dropWidth/2} ${neckHeight + dropHeight * 0.9}
              ${50 - dropWidth/2} ${neckHeight + dropHeight * 0.3}
            Q ${50 - dropWidth/2} ${neckHeight + 10}
              ${50 - neckWidth/2} ${neckHeight}
            Z
          `}
          fill="none"
          stroke="#444"
          strokeWidth="2"
          className="dark:stroke-neutral-600"
        />
        
        {/* Water fill - animated */}
        <g clipPath="url(#bottleClip)">
          {/* Water with wave effect */}
          <rect
            x="0"
            y={120 - (fillLevel / 100) * 120}
            width="100"
            height="120"
            fill="url(#waterGradient)"
          >
            <animate
              attributeName="y"
              values={`${100 - fillLevel};${98 - fillLevel};${100 - fillLevel}`}
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          
          {/* Wave effect on top */}
          <ellipse
            cx="50"
            cy={120 - (fillLevel / 100) * 120 + 5}
            rx={40 - (fillLevel / 100) * 20}
            ry="5"
            fill={color}
            opacity="0.8"
          >
            <animate
              attributeName="ry"
              values="5;7;5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          
          {/* Bubble animations */}
          {fillLevel > 10 && (
            <>
              <circle cx="35" cy="90" r="3" fill="white" opacity="0.4">
                <animate attributeName="cy" values="90;70;90" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="55" cy="85" r="2" fill="white" opacity="0.3">
                <animate attributeName="cy" values="85;60;85" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="65" cy="95" r="2.5" fill="white" opacity="0.35">
                <animate attributeName="cy" values="95;75;95" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="3.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          
          {/* Glass reflection overlay */}
          <path
            d={`
              M ${50 - neckWidth/2 + 5} 0
              L ${50 - neckWidth/2 + 5} ${neckHeight}
              Q ${50 - dropWidth/2 + 10} ${neckHeight + 10}
                ${50 - dropWidth/2 + 10} ${neckHeight + dropHeight * 0.5}
              L ${50 - neckWidth/2 + 5} ${neckHeight + dropHeight * 0.5}
              Z
            `}
            fill="url(#glassReflect)"
          />
        </g>
        
        {/* Bottle neck cap */}
        <rect
          x={50 - neckWidth/2 - 3}
          y="-5"
          width={neckWidth + 6}
          height="8"
          rx="2"
          fill="#333"
          className="dark:fill-neutral-700"
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute bottom-8 flex flex-col items-center">
          <span 
            className="text-3xl font-bold tabular-nums"
            style={{ 
              color: displayProgress > 50 ? 'white' : '#666',
              textShadow: displayProgress > 50 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {displayProgress}%
          </span>
          {text && (
            <span className="text-xs text-neutral-500 mt-1">
              {text}
            </span>
          )}
        </div>
      )}
      
      {/* Pulse animation when complete */}
      {displayProgress >= 100 && (
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ 
            backgroundColor: color,
            animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}
    </div>
  );
}

// Compact version for buttons
export function WaterDropMini({ progress = 0, size = 24, color = '#dc2626' }: { progress?: number; size?: number; color?: string }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#333"
          strokeWidth="2"
          className="dark:stroke-neutral-600"
        />
        {/* Progress arc */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 10}`}
          strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export default WaterDropLoader;
