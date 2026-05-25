import React, { useState } from 'react';
import { useTimelineStore, TextOverlay } from '../store/timelineStore';
import { Type, Plus, Trash2, Move, Palette, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'slideIn', label: 'Slide In' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulse' },
];

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff6600', '#9900ff', '#ff3399', '#33ff33', '#00ffff', '#ff00ff',
];

export const TextOverlayEditor: React.FC = () => {
  const { subtitles, setSubtitles } = useTimelineStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Local text overlays state (simplified - stored in subtitles for now)
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  const handleAddText = () => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      startTime: 0,
      duration: 3,
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontColor: '#ffffff',
      backgroundColor: '#000000',
      backgroundOpacity: 0.5,
      position: { x: 50, y: 50 },
      alignment: 'center',
      animation: 'none',
      rotation: 0,
      bold: false,
      italic: false,
      shadow: true,
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setShowAddPanel(false);
  };

  const handleUpdateText = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const handleDeleteText = (id: string) => {
    setTextOverlays(textOverlays.filter(o => o.id !== id));
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-4 space-y-4 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Type className="w-4 h-4 text-red-500" />
          Text Overlays
        </h3>
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Text
        </button>
      </div>

      {/* Add Text Panel */}
      {showAddPanel && (
        <div className="bg-neutral-800 rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-neutral-400 text-xs uppercase tracking-wide">Text Content</label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter your text..."
              className="w-full bg-neutral-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none h-20"
            />
          </div>
          <button
            onClick={handleAddText}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add Text Overlay
          </button>
        </div>
      )}

      {/* Text Overlay List */}
      <div className="space-y-3">
        {textOverlays.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-4">
            No text overlays yet. Click "Add Text" to create one.
          </p>
        ) : (
          textOverlays.map((overlay) => (
            <div key={overlay.id} className="bg-neutral-800 rounded-lg p-3 space-y-3">
              {/* Text Input */}
              <input
                type="text"
                value={overlay.text}
                onChange={(e) => handleUpdateText(overlay.id, { text: e.target.value })}
                className="w-full bg-neutral-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Enter text..."
              />

              {/* Font & Size */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-neutral-500 text-[10px] uppercase tracking-wide">Font</label>
                  <select
                    value={overlay.fontFamily}
                    onChange={(e) => handleUpdateText(overlay.id, { fontFamily: e.target.value })}
                    className="w-full bg-neutral-700 border border-white/10 rounded px-2 py-1.5 text-white text-xs"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-500 text-[10px] uppercase tracking-wide">Size</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={overlay.fontSize}
                      onChange={(e) => handleUpdateText(overlay.id, { fontSize: parseInt(e.target.value) })}
                      className="flex-1 h-1.5 bg-neutral-600 rounded appearance-none cursor-pointer accent-red-500"
                    />
                    <span className="text-white text-xs w-8">{overlay.fontSize}</span>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-neutral-500 text-[10px] uppercase tracking-wide">Text Color</label>
                  <div className="flex gap-1">
                    {PRESET_COLORS.slice(0, 6).map((color) => (
                      <button
                        key={color}
                        onClick={() => handleUpdateText(overlay.id, { fontColor: color })}
                        className={`w-6 h-6 rounded border-2 ${
                          overlay.fontColor === color ? 'border-red-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-500 text-[10px] uppercase tracking-wide">BG Color</label>
                  <div className="flex gap-1">
                    {PRESET_COLORS.slice(0, 6).map((color) => (
                      <button
                        key={color}
                        onClick={() => handleUpdateText(overlay.id, { backgroundColor: color })}
                        className={`w-6 h-6 rounded border-2 ${
                          overlay.backgroundColor === color ? 'border-red-500' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* BG Opacity */}
              <div className="space-y-1">
                <label className="text-neutral-500 text-[10px] uppercase tracking-wide">
                  Background Opacity: {Math.round(overlay.backgroundOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={overlay.backgroundOpacity}
                  onChange={(e) => handleUpdateText(overlay.id, { backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-600 rounded appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Animation */}
              <div className="space-y-1">
                <label className="text-neutral-500 text-[10px] uppercase tracking-wide">Animation</label>
                <div className="flex gap-1">
                  {ANIMATION_OPTIONS.map((anim) => (
                    <button
                      key={anim.value}
                      onClick={() => handleUpdateText(overlay.id, { animation: anim.value as TextOverlay['animation'] })}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                        overlay.animation === anim.value
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position & Alignment */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-neutral-500 text-[10px] uppercase tracking-wide">Alignment</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateText(overlay.id, { alignment: 'left' })}
                      className={`flex-1 p-1.5 rounded ${overlay.alignment === 'left' ? 'bg-red-600' : 'bg-neutral-700'}`}
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-white mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateText(overlay.id, { alignment: 'center' })}
                      className={`flex-1 p-1.5 rounded ${overlay.alignment === 'center' ? 'bg-red-600' : 'bg-neutral-700'}`}
                    >
                      <AlignCenter className="w-3.5 h-3.5 text-white mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateText(overlay.id, { alignment: 'right' })}
                      className={`flex-1 p-1.5 rounded ${overlay.alignment === 'right' ? 'bg-red-600' : 'bg-neutral-700'}`}
                    >
                      <AlignRight className="w-3.5 h-3.5 text-white mx-auto" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-500 text-[10px] uppercase tracking-wide">Position</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => handleUpdateText(overlay.id, { position: { x: 50, y: 20 } })}
                      className={`p-1 rounded ${overlay.position.y < 40 ? 'bg-red-600' : 'bg-neutral-700'}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateText(overlay.id, { position: { x: 50, y: 50 } })}
                      className={`p-1 rounded ${overlay.position.y >= 40 && overlay.position.y <= 60 ? 'bg-red-600' : 'bg-neutral-700'}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                    </button>
                    <button
                      onClick={() => handleUpdateText(overlay.id, { position: { x: 50, y: 80 } })}
                      className={`p-1 rounded ${overlay.position.y > 60 ? 'bg-red-600' : 'bg-neutral-700'}`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full mx-auto" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Style Options */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateText(overlay.id, { bold: !overlay.bold })}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
                    overlay.bold ? 'bg-red-600 text-white' : 'bg-neutral-700 text-neutral-400'
                  }`}
                >
                  B
                </button>
                <button
                  onClick={() => handleUpdateText(overlay.id, { italic: !overlay.italic })}
                  className={`flex-1 py-1.5 rounded text-xs italic transition-colors ${
                    overlay.italic ? 'bg-red-600 text-white' : 'bg-neutral-700 text-neutral-400'
                  }`}
                >
                  I
                </button>
                <button
                  onClick={() => handleUpdateText(overlay.id, { shadow: !overlay.shadow })}
                  className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                    overlay.shadow ? 'bg-red-600 text-white' : 'bg-neutral-700 text-neutral-400'
                  }`}
                >
                  Shadow
                </button>
                <button
                  onClick={() => handleDeleteText(overlay.id)}
                  className="p-1.5 rounded bg-neutral-700 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TextOverlayEditor;
