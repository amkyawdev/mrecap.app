import React from 'react';
import { useTimelineStore, COLOR_FILTER_PRESETS, VideoEffect, ColorFilter } from '../store/timelineStore';
import { Sparkles, Droplet, RotateCw, FlipHorizontal, FlipVertical, Gauge } from 'lucide-react';

interface EffectsPanelProps {
  clipId: string | null;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ clipId }) => {
  const { videoClips, updateVideoClip, addEffectToClip, removeEffect, setFilter } = useTimelineStore();

  const clip = videoClips.find(c => c.id === clipId);

  if (!clip) {
    return (
      <div className="bg-neutral-900 rounded-xl p-4">
        <p className="text-neutral-500 text-sm text-center">Select a clip to edit effects</p>
      </div>
    );
  }

  const handleSpeedChange = (speed: number) => {
    updateVideoClip(clipId!, { speed });
  };

  const handleVolumeChange = (volume: number) => {
    updateVideoClip(clipId!, { volume });
  };

  const handleRotationChange = (rotation: number) => {
    updateVideoClip(clipId!, { rotation });
  };

  const handleFlipH = () => {
    updateVideoClip(clipId!, { flipH: !clip.flipH });
  };

  const handleFlipV = () => {
    updateVideoClip(clipId!, { flipV: !clip.flipV });
  };

  const handleAddEffect = (type: VideoEffect['type']) => {
    const effect: VideoEffect = {
      id: `${Date.now()}`,
      type,
      value: 1,
      enabled: true,
    };
    addEffectToClip(clipId!, effect);
  };

  const handleFilterSelect = (preset: typeof COLOR_FILTER_PRESETS[0]) => {
    if (preset.preset === 'none') {
      setFilter(clipId!, null);
    } else {
      const filter: ColorFilter = {
        id: `filter-${Date.now()}`,
        name: preset.name,
        preset: preset.preset,
        brightness: preset.brightness,
        contrast: preset.contrast,
        saturation: preset.saturation,
        hue: preset.hue,
        enabled: true,
      };
      setFilter(clipId!, filter);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-4 space-y-6 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-red-500" />
        Video Effects
      </h3>

      {/* Speed Control */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide">
          <Gauge className="w-4 h-4" /> Speed
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={clip.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-white text-sm w-16 text-right">{clip.speed}x</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[0.25, 0.5, 1, 1.5, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                clip.speed === speed
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide">
          <Droplet className="w-4 h-4" /> Volume
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={clip.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-white text-sm w-12 text-right">{Math.round(clip.volume * 100)}%</span>
        </div>
      </div>

      {/* Transform */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide">
          <RotateCw className="w-4 h-4" /> Transform
        </label>
        <div className="flex gap-2">
          {[0, 90, 180, 270].map((rotation) => (
            <button
              key={rotation}
              onClick={() => handleRotationChange(rotation)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                clip.rotation === rotation
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {rotation}°
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFlipH}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              clip.flipH
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" /> Flip H
          </button>
          <button
            onClick={handleFlipV}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              clip.flipV
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <FlipVertical className="w-4 h-4" /> Flip V
          </button>
        </div>
      </div>

      {/* Color Filters */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide">
          <Sparkles className="w-4 h-4" /> Color Filters
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_FILTER_PRESETS.map((preset) => (
            <button
              key={preset.preset}
              onClick={() => handleFilterSelect(preset)}
              className={`aspect-square rounded-lg text-[10px] font-medium transition-all flex items-center justify-center ${
                clip.filter?.preset === preset.preset
                  ? 'ring-2 ring-red-500 scale-105'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              } ${preset.preset === 'none' ? 'col-span-1' : ''}`}
              style={{
                background: getFilterPreview(preset),
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Effects */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide">
          <Sparkles className="w-4 h-4" /> Quick Effects
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['blur', 'sharpen', 'sepia', 'grayscale'] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleAddEffect(type)}
              className="px-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium capitalize transition-colors"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Applied Effects */}
      {clip.effects.length > 0 && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide">
            Applied Effects
          </label>
          <div className="space-y-2">
            {clip.effects.map((effect) => (
              <div key={effect.id} className="flex items-center gap-2 bg-neutral-800 rounded-lg p-2">
                <span className="text-white text-sm capitalize flex-1">{effect.type}</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={effect.value}
                  onChange={(e) => {
                    const { updateEffect } = useTimelineStore.getState();
                    updateEffect(clipId!, effect.id, { value: parseFloat(e.target.value) });
                  }}
                  className="flex-1 h-1.5 bg-neutral-700 rounded appearance-none cursor-pointer accent-red-500"
                />
                <button
                  onClick={() => removeEffect(clipId!, effect.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getFilterPreview(preset: typeof COLOR_FILTER_PRESETS[0]): string {
  if (preset.preset === 'none') {
    return 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)';
  }
  
  const saturations = {
    vintage: 'sepia(50%) saturate(80%)',
    cool: 'hue-rotate(20deg) saturate(110%)',
    warm: 'hue-rotate(-10deg) saturate(115%)',
    dramatic: 'contrast(130%) saturate(120%)',
    fade: 'brightness(110%) contrast(90%) saturate(70%)',
    muted: 'saturate(60%)',
    vivid: 'contrast(115%) saturate(140%)',
    bw: 'grayscale(100%)',
    sepia: 'sepia(100%)',
  };
  
  const filter = saturations[preset.preset as keyof typeof saturations] || '';
  return `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%) ${filter ? `(${filter})` : ''}`;
}

export default EffectsPanel;
