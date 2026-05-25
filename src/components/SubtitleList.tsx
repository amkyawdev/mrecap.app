import React, { useState } from 'react';
import { Subtitle, createSubtitle } from '../services/subtitleParser';

interface SubtitleListProps {
  subtitles: Subtitle[];
  currentTime: number;
  onSelect: (subtitle: Subtitle) => void;
  onUpdate: (subtitle: Subtitle) => void;
  onDelete: (id: number) => void;
  onAdd: (subtitle: Subtitle) => void;
  videoDuration: number;
}

export const SubtitleList: React.FC<SubtitleListProps> = ({
  subtitles,
  currentTime,
  onSelect,
  onUpdate,
  onDelete,
  onAdd,
  videoDuration,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const isActive = (subtitle: Subtitle) => {
    return currentTime >= subtitle.startTime && currentTime <= subtitle.endTime;
  };

  const handleEdit = (subtitle: Subtitle) => {
    setEditingId(subtitle.id);
    setEditText(subtitle.text);
  };

  const handleSave = (subtitle: Subtitle) => {
    onUpdate({ ...subtitle, text: editText });
    setEditingId(null);
    setEditText('');
  };

  const handleAddNew = () => {
    // Add subtitle at current time with 3 second duration
    const newSubtitle = createSubtitle(
      currentTime,
      Math.min(currentTime + 3, videoDuration),
      'New subtitle'
    );
    onAdd(newSubtitle);
    setEditingId(newSubtitle.id);
    setEditText(newSubtitle.text);
  };

  const sortedSubtitles = [...subtitles].sort((a, b) => a.startTime - b.startTime);

  return (
    <div className="subtitle-list">
      <div className="subtitle-header">
        <h3>Subtitles</h3>
        <button onClick={handleAddNew} className="btn btn-primary">
          + Add
        </button>
      </div>
      
      <div className="subtitle-items">
        {sortedSubtitles.map((subtitle) => (
          <div
            key={subtitle.id}
            className={`subtitle-item ${isActive(subtitle) ? 'active' : ''}`}
            onClick={() => onSelect(subtitle)}
          >
            {editingId === subtitle.id ? (
              <div className="subtitle-edit">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <div className="subtitle-edit-buttons">
                  <button
                    onClick={() => handleSave(subtitle)}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="subtitle-time">
                  {formatTimestamp(subtitle.startTime)} -{' '}
                  {formatTimestamp(subtitle.endTime)}
                </div>
                <div className="subtitle-text">{subtitle.text}</div>
                <div className="subtitle-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(subtitle);
                    }}
                    className="btn-icon"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(subtitle.id);
                    }}
                    className="btn-icon"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        .subtitle-list {
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }
        .subtitle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .subtitle-header h3 {
          margin: 0;
          color: white;
        }
        .subtitle-item {
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .subtitle-item:hover {
          background: rgba(255,255,255,0.2);
        }
        .subtitle-item.active {
          background: rgba(255,0,0,0.5);
          border-left: 4px solid white;
        }
        .subtitle-time {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 4px;
        }
        .subtitle-text {
          color: white;
          font-size: 16px;
        }
        .subtitle-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          font-size: 16px;
        }
        .subtitle-edit {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .subtitle-edit textarea {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          padding: 8px;
          color: white;
          min-height: 60px;
          resize: vertical;
        }
        .subtitle-edit-buttons {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default SubtitleList;