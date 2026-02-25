import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, BookOpen } from 'lucide-react';
import { useAdventure } from '../../contexts/AdventureContext';
import PaperContainer from '../common/PaperContainer';
import './NarrationPanel.css';

/**
 * NarrationPanel - Collapsible panel showing DM narration and game events
 * Displays at top of adventure screen
 */
export function NarrationPanel() {
  const { adventure } = useAdventure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollRef = useRef(null);
  
  // Auto-scroll to bottom when new narration is added
  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [adventure.narrationHistory, isCollapsed]);
  
  const latestEntry = adventure.narrationHistory[adventure.narrationHistory.length - 1];
  
  return (
    <div className={`narration-panel ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <PaperContainer variant="lined" padding="none" className="narration-container">
        {/* Header */}
        <div className="narration-header">
          <div className="header-left">
            <BookOpen size={20} />
            <span className="header-title">Dungeon Master</span>
          </div>
          
          <button
            className="collapse-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand narration' : 'Collapse narration'}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
        
        {/* Content */}
        {!isCollapsed && (
          <div className="narration-content" ref={scrollRef}>
            {adventure.narrationHistory.length === 0 ? (
              <div className="narration-empty">
                <p>Your adventure begins...</p>
              </div>
            ) : (
              <div className="narration-entries">
                {adventure.narrationHistory.map((entry) => (
                  <NarrationEntry key={entry.id} entry={entry} />
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

/**
 * NarrationEntry - Individual narration message
 */
function NarrationEntry({ entry, preview = false }) {
  const styleClasses = {
    room_description: 'entry-room',
    combat_action: 'entry-combat',
    dialogue: 'entry-dialogue',
    system_message: 'entry-system',
    dm_note: 'entry-dm-note'
  };
  
  const styleClass = styleClasses[entry.style] || 'entry-default';
  
  return (
    <div className={`narration-entry ${styleClass} ${entry.emphasis ? 'emphasis' : ''} ${preview ? 'preview' : ''}`}>
      {entry.speaker && (
        <div className="entry-speaker">{entry.speaker}:</div>
      )}
      <div className="entry-text">
        {entry.text.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < entry.text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default NarrationPanel;
