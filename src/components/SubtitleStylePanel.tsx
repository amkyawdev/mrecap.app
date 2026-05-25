import React from 'react';
import { useProjectStore, SubtitleStyle } from '../store/projectStore';
import { RotateCcw, Type, Palette } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Impact, sans-serif', label: 'Impact' },
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ff6600', '#9900ff', '#ff3399', '#33ff33',
];

interface SubtitleStylePanelProps {
  onClose?: () => void;
}

export const SubtitleStylePanel: React.FC<SubtitleStylePanelProps> = ({ onClose }) => {
  const { subtitleStyle, setSubtitleStyle, resetSubtitleStyle } = useProjectStore();

  const handleChange = (key: keyof SubtitleStyle, value: any) => {
    setSubtitleStyle({ [key]: value });
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4 text-red-500" />
          Subtitle Style
        </h3>
        <button
          onClick={resetSubtitleStyle}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Reset to default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label className="text-neutral-400 text-xs uppercase tracking-wide">Font Family</label>
        <select
          value={subtitleStyle.fontFamily}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
          className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-neutral-400 text-xs uppercase tracking-wide">Font Size</label>
          <span className="text-white text-sm">{subtitleStyle.fontSize}px</span>
        </div>
        <input
          type="range"
          min="12"
          max="48"
          value={subtitleStyle.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>12px</span>
          <span>48px</span>
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <label className="text-neutral-400 text-xs uppercase tracking-wide">Font Weight</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleChange('fontWeight', 'normal')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              subtitleStyle.fontWeight === 'normal'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => handleChange('fontWeight', 'bold')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
              subtitleStyle.fontWeight === 'bold'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Bold
          </button>
        </div>
      </div>

      {/* Text Shadow */}
      <div className="space-y-2">
        <label className="text-neutral-400 text-xs uppercase tracking-wide">Text Shadow</label>
        <button
          onClick={() => handleChange('textShadow', !subtitleStyle.textShadow)}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            subtitleStyle.textShadow
              ? 'bg-red-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          {subtitleStyle.textShadow ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-neutral-400 text-xs uppercase tracking-wide">Text Color</label>
          <span className="text-white text-sm">{subtitleStyle.textColor}</span>
        </div>
        <div className="flex gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('textColor', color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                subtitleStyle.textColor === color
                  ? 'border-red-500 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input
          type="color"
          value={subtitleStyle.textColor}
          onChange={(e) => handleChange('textColor', e.target.value)}
          className="w-full h-10 bg-neutral-800 rounded-lg cursor-pointer border border-white/10"
        />
      </div>

      {/* Background Color */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-neutral-400 text-xs uppercase tracking-wide">Background Color</label>
          <span className="text-white text-sm">{subtitleStyle.backgroundColor}</span>
        </div>
        <div className="flex gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('backgroundColor', color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                subtitleStyle.backgroundColor === color
                  ? 'border-red-500 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input
          type="color"
          value={subtitleStyle.backgroundColor}
          onChange={(e) => handleChange('backgroundColor', e.target.value)}
          className="w-full h-10 bg-neutral-800 rounded-lg cursor-pointer border border-white/10"
        />
      </div>

      {/* Background Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-neutral-400 text-xs uppercase tracking-wide">Background Opacity</label>
          <span className="text-white text-sm">{Math.round(subtitleStyle.backgroundOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={subtitleStyle.backgroundOpacity * 100}
          onChange={(e) => handleChange('backgroundOpacity', parseInt(e.target.value) / 100)}
          className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="text-neutral-400 text-xs uppercase tracking-wide">Position</label>
        <div className="flex gap-2">
          {(['top', 'center', 'bottom'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => handleChange('position', pos)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                subtitleStyle.position === pos
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-neutral-400 text-xs uppercase tracking-wide">Preview</label>
        <div
          className="relative w-full aspect-video bg-neutral-800 rounded-lg overflow-hidden"
          style={{ fontFamily: subtitleStyle.fontFamily }}
        >
          <div
            className="absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg max-w-[90%]"
            style={{
              fontFamily: subtitleStyle.fontFamily,
              fontSize: `${Math.max(12, subtitleStyle.fontSize / 3)}px`,
              color: subtitleStyle.textColor,
              fontWeight: subtitleStyle.fontWeight,
              backgroundColor: subtitleStyle.backgroundColor,
              opacity: subtitleStyle.backgroundOpacity,
              textShadow: subtitleStyle.textShadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
              top: subtitleStyle.position === 'top' ? '10%' : subtitleStyle.position === 'center' ? '50%' : 'auto',
              bottom: subtitleStyle.position === 'bottom' ? '10%' : subtitleStyle.position === 'center' ? 'auto' : undefined,
              transform: subtitleStyle.position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
            }}
          >
            Sample Subtitle
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleStylePanel;
