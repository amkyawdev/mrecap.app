import React, { useState } from 'react';
import { useProjectStore, SubtitleStyle } from '../store/projectStore';
import { RotateCcw, Type, Palette, Bold, AlignLeft, AlignCenter, AlignRight, AlignJustify, Move } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ff6600', '#9900ff', '#ff3399', '#33ff33',
];

const OUTLINE_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#000000', 'transparent',
];

const BG_PRESETS = [
  { color: '#000000', label: 'Black' },
  { color: '#ffffff', label: 'White' },
  { color: '#ffff00', label: 'Yellow' },
  { color: '#0000ff', label: 'Blue' },
  { color: '#ff0000', label: 'Red' },
  { color: 'transparent', label: 'None' },
];

interface SubtitleStylePanelProps {
  onClose?: () => void;
}

export const SubtitleStylePanel: React.FC<SubtitleStylePanelProps> = ({ onClose }) => {
  const { subtitleStyle, setSubtitleStyle, resetSubtitleStyle } = useProjectStore();
  const [activeSection, setActiveSection] = useState<'font' | 'color' | 'bg' | 'position'>('font');

  const handleChange = (key: keyof SubtitleStyle, value: any) => {
    setSubtitleStyle({ [key]: value });
  };

  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
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

      {/* Section Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'font', label: 'Font', icon: Type },
          { id: 'color', label: 'Color', icon: Palette },
          { id: 'bg', label: 'Background', icon: Bold },
          { id: 'position', label: 'Position', icon: Move },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeSection === tab.id
                ? 'text-red-500 bg-white/5 border-b-2 border-red-500'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 max-h-[400px] overflow-y-auto">
        {/* Font Section */}
        {activeSection === 'font' && (
          <div className="space-y-4">
            {/* Font Family */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 text-xs font-medium">Font Family</label>
              <select
                value={subtitleStyle.fontFamily}
                onChange={(e) => handleChange('fontFamily', e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-neutral-400 text-xs font-medium">Font Size</label>
                <span className="text-white text-sm font-mono">{subtitleStyle.fontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="48"
                value={subtitleStyle.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex gap-1">
                {[16, 24, 32, 40].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleChange('fontSize', size)}
                    className={`flex-1 py-1 rounded text-xs transition-colors ${
                      subtitleStyle.fontSize === size
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Style */}
            <div className="space-y-1.5">
              <label className="text-neutral-400 text-xs font-medium">Style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange('fontWeight', subtitleStyle.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    subtitleStyle.fontWeight === 'bold'
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                  }`}
                >
                  Bold
                </button>
                <button
                  onClick={() => handleChange('fontStyle', subtitleStyle.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`flex-1 py-2 rounded-lg text-sm italic transition-colors ${
                    subtitleStyle.fontStyle === 'italic'
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                  }`}
                >
                  Italic
                </button>
                <button
                  onClick={() => handleChange('textDecoration', subtitleStyle.textDecoration === 'underline' ? 'none' : 'underline')}
                  className={`flex-1 py-2 rounded-lg text-sm underline transition-colors ${
                    subtitleStyle.textDecoration === 'underline'
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                  }`}
                >
                  Underline
                </button>
              </div>
            </div>

            {/* Text Shadow */}
            <div className="flex items-center justify-between">
              <label className="text-neutral-400 text-xs font-medium">Text Shadow</label>
              <button
                onClick={() => handleChange('textShadow', !subtitleStyle.textShadow)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  subtitleStyle.textShadow ? 'bg-red-600' : 'bg-neutral-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  subtitleStyle.textShadow ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Outline */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-neutral-400 text-xs font-medium">Outline</label>
                <span className="text-white text-sm font-mono">{subtitleStyle.outlineWidth || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={subtitleStyle.outlineWidth || 0}
                onChange={(e) => handleChange('outlineWidth', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>
        )}

        {/* Color Section */}
        {activeSection === 'color' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-neutral-400 text-xs font-medium">Text Color</label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleChange('textColor', color)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      subtitleStyle.textColor === color ? 'border-red-500 scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={subtitleStyle.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={subtitleStyle.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="flex-1 bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-neutral-900 rounded-lg p-3 text-center">
              <span
                className="text-lg font-bold"
                style={{
                  color: subtitleStyle.textColor,
                  fontFamily: subtitleStyle.fontFamily,
                  fontSize: Math.min(subtitleStyle.fontSize, 24),
                  fontWeight: subtitleStyle.fontWeight as any,
                  fontStyle: subtitleStyle.fontStyle as any,
                  textDecoration: subtitleStyle.textDecoration as any,
                  textShadow: subtitleStyle.textShadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
                }}
              >
                Preview Text
              </span>
            </div>
          </div>
        )}

        {/* Background Section */}
        {activeSection === 'bg' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-neutral-400 text-xs font-medium">Background Color</label>
              <div className="grid grid-cols-6 gap-2">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => handleChange('backgroundColor', preset.color)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      subtitleStyle.backgroundColor === preset.color
                        ? 'border-red-500 scale-110'
                        : 'border-transparent hover:scale-105'
                    } ${preset.color === 'transparent' ? 'bg-gradient-to-br from-neutral-700 to-neutral-800' : ''}`}
                    style={{ backgroundColor: preset.color !== 'transparent' ? preset.color : undefined }}
                    title={preset.label}
                  >
                    {preset.color === 'transparent' && <span className="text-[8px] text-neutral-400">NONE</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-neutral-400 text-xs font-medium">Background Opacity</label>
                <span className="text-white text-sm font-mono">{Math.round(subtitleStyle.backgroundOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={subtitleStyle.backgroundOpacity * 100}
                onChange={(e) => handleChange('backgroundOpacity', parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Padding */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-neutral-400 text-xs font-medium">Padding</label>
                <span className="text-white text-sm font-mono">{subtitleStyle.padding || 4}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={subtitleStyle.padding || 4}
                onChange={(e) => handleChange('padding', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-neutral-400 text-xs font-medium">Border Radius</label>
                <span className="text-white text-sm font-mono">{subtitleStyle.borderRadius || 4}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={subtitleStyle.borderRadius || 4}
                onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>
        )}

        {/* Position Section */}
        {activeSection === 'position' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-neutral-400 text-xs font-medium">Vertical Position</label>
              <div className="flex gap-2">
                {(['top', 'center', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handleChange('position', pos)}
                    className={`flex-1 py-2.5 rounded-lg text-sm capitalize font-medium transition-colors ${
                      subtitleStyle.position === pos
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 text-xs font-medium">Alignment</label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                ].map((align) => (
                  <button
                    key={align.value}
                    onClick={() => handleChange('alignment', align.value)}
                    className={`flex-1 py-2.5 rounded-lg transition-colors ${
                      subtitleStyle.alignment === align.value
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                    }`}
                  >
                    <align.icon className="w-5 h-5 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Position Info */}
            <div className="bg-neutral-900 rounded-lg p-3">
              <p className="text-neutral-500 text-xs text-center">
                Use <span className="text-white">Arrow Buttons</span> above video to fine-tune subtitle position
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtitleStylePanel;
