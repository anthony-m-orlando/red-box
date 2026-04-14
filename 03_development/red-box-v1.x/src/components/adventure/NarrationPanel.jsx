/**
 * NarrationPanel.jsx
 * Collapsible DM narration panel — used by legacy AdventureScreen
 *
 * Patched for Sprint 3 AdventureContext shape:
 *   narrationHistory now lives on dungeonState, not adventure.
 *
 * Entry shape from Sprint 3:
 *   { type: 'room'|'dm'|'combat'|'action'|'system'|'danger'|'treasure',
 *     text: string, timestamp: number }
 *
 * Legacy entries (from old AdventureContext) used:
 *   { style: 'room_description'|'combat_action'|'system_message'|'dm_note',
 *     text: string, id: ... }
 *
 * Both shapes are handled via the styleClass map below.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, BookOpen } from 'lucide-react';
import { useAdventure } from '../../contexts/AdventureContext';
import PaperContainer   from '../common/PaperContainer';
import './NarrationPanel.css';

export function NarrationPanel() {
  const { dungeonState } = useAdventure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollRef = useRef(null);

  // Read from dungeonState (Sprint 3 canonical location)
  const narrationHistory = dungeonState?.narrationHistory ?? [];

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrationHistory.length, isCollapsed]);

  const latestEntry = narrationHistory[narrationHistory.length - 1] ?? null;

  return (
    <div className={`narration-panel ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <PaperContainer variant="lined" padding="none" className="narration-container">

        {/* Header */}
        <div className="narration-header">
          <div className="header-left">
            <BookOpen size={20} aria-hidden="true" />
            <span className="header-title">Dungeon Master</span>
          </div>
          <button
            className="collapse-button"
            onClick={() => setIsCollapsed(c => !c)}
            aria-label={isCollapsed ? 'Expand narration' : 'Collapse narration'}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>

        {/* Expanded content */}
        {!isCollapsed && (
          <div className="narration-content" ref={scrollRef}>
            {narrationHistory.length === 0 ? (
              <div className="narration-empty">
                <p>Your adventure begins…</p>
              </div>
            ) : (
              <div className="narration-entries">
                {narrationHistory.map((entry, i) => (
                  <NarrationEntry key={`${entry.timestamp ?? i}-${i}`} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsed preview */}
        {isCollapsed && latestEntry && (
          <div className="narration-preview">
            <NarrationEntry entry={latestEntry} preview />
          </div>
        )}

      </PaperContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NarrationEntry
// Handles both Sprint 3 { type, text } and legacy { style, text } shapes
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_MAP = {
  // Sprint 3 types
  room:    'entry-room',
  dm:      'entry-dm-note',
  combat:  'entry-combat',
  action:  'entry-system',
  system:  'entry-system',
  danger:  'entry-combat',
  treasure:'entry-system',
  // Legacy styles (old AdventureContext)
  room_description: 'entry-room',
  combat_action:    'entry-combat',
  system_message:   'entry-system',
  dm_note:          'entry-dm-note',
  dialogue:         'entry-system',
};

function NarrationEntry({ entry, preview = false }) {
  // Support both { type } (Sprint 3) and { style } (legacy)
  const key = entry.type || entry.style || 'system';
  const styleClass = STYLE_MAP[key] || 'entry-system';
  const text = entry.text || '';

  return (
    <div
      className={[
        'narration-entry',
        styleClass,
        entry.emphasis ? 'emphasis' : '',
        preview ? 'preview' : '',
      ].filter(Boolean).join(' ')}
    >
      <p className="entry-text">{text}</p>
    </div>
  );
}

export default NarrationPanel;
