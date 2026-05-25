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
    <div className="bg-neutral-900 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium text-sm flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-red-500" />
          Style
        </h3>
        <button
          onClick={resetSubtitleStyle}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Font */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-neutral-400 text-xs">Font</label>
          <span className="text-white text-xs">{subtitleStyle.fontSize}px</span>
        </div>
        <select
          value={subtitleStyle.fontFamily}
          onChange={(e) => handleChange('fontFamily', e.target.value)}
          className="w-full bg-neutral-800 border border-white/10 rounded-md px-2 py-1.5 text-white text-xs"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
        <input
          type="range"
          min="12"
          max="36"
          value={subtitleStyle.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          className="w-full h-1.5 bg-neutral-700 rounded appearance-none cursor-pointer accent-red-500"
        />
      </div>

      {/* Weight & Shadow */}
      <div className="flex gap-2">
        <button
          onClick={() => handleChange('fontWeight', subtitleStyle.fontWeight === 'bold' ? 'normal' : 'bold')}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${subtitleStyle.fontWeight === 'bold' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
        >
          Bold
        </button>
        <button
          onClick={() => handleChange('textShadow', !subtitleStyle.textShadow)}
          className={`flex-1 py-1.5 px-2 rounded text-xs ${subtitleStyle.textShadow ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
        >
          Shadow
        </button>
      </div>

      {/* Colors */}
      <div className="space-y-1.5">
        <label className="text-neutral-400 text-xs">Text Color</label>
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('textColor', color)}
              className={`w-6 h-6 rounded border-2 ${subtitleStyle.textColor === color ? 'border-red-500' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-neutral-400 text-xs">Background</label>
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleChange('backgroundColor', color)}
              className={`w-6 h-6 rounded border-2 ${subtitleStyle.backgroundColor === color ? 'border-red-500' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 text-xs">Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={subtitleStyle.backgroundOpacity * 100}
            onChange={(e) => handleChange('backgroundOpacity', parseInt(e.target.value) / 100)}
            className="flex-1 h-1.5 bg-neutral-700 rounded appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-white text-xs w-8">{Math.round(subtitleStyle.backgroundOpacity * 100)}%</span>
        </div>
      </div>

      {/* Position */}
      <div className="flex gap-1.5">
        {(['top', 'center', 'bottom'] as const).map((pos) => (
          <button
            key={pos}
            onClick={() => handleChange('position', pos)}
            className={`flex-1 py-1.5 px-2 rounded text-xs capitalize ${subtitleStyle.position === pos ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Keyboard Hint */}
      <div className="text-center text-neutral-500 text-xs py-1 border-t border-white/5 space-y-1">
        <div>Use Arrow Keys to move subtitle</div>
        <div className="text-neutral-600">Hold Shift for larger movement</div>
      </div>
    </div>
  );
};

export default SubtitleStylePanel;
