/**
 * AdventureSelection.jsx
 * Choose an adventure to embark on.
 *
 * Patched for Sprint 3+ engine:
 *   - navigate('/adventure', { state: { moduleId } }) so DungeonScreen
 *     knows which module to start.
 *   - Adventure card data pulled from registry.getAllModuleMetadata()
 *     so new modules appear automatically.
 *   - Fallback static cards retained for legacy adventures not in registry.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate }    from 'react-router-dom';
import { MapPin, ArrowLeft, BookOpen, Map } from 'lucide-react';
import { useAdventure }   from '../../contexts/AdventureContext';
import { useCharacter }   from '../../contexts/CharacterContext';
import { getAllModuleMetadata } from '../../data/dungeons/registry';
import Button             from '../common/Button';
import PaperContainer     from '../common/PaperContainer';
import './AdventureSelection.css';

// ─────────────────────────────────────────────────────────────────────────────
// Icon map for known adventure types
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_ICONS = {
  tutorial:   <BookOpen size={32} />,
  quasqueton: <Map      size={32} />,
};

const MODULE_COLORS = {
  tutorial:   'var(--ink-blue)',
  quasqueton: 'var(--ink-brown)',
};

// ─────────────────────────────────────────────────────────────────────────────
// AdventureSelection
// ─────────────────────────────────────────────────────────────────────────────

export default function AdventureSelection() {
  const navigate  = useNavigate();
  const adventure = useAdventure();
  const { character } = useCharacter();
  const [selectedId, setSelectedId] = useState(null);

  if (!character?.name) {
    return (
      <div className="adventure-selection">
        <PaperContainer variant="aged" padding="xl">
          <h2>No Character Found</h2>
          <p>You must create a character before starting an adventure.</p>
          <Button onClick={() => navigate('/character/create')}>Create Character</Button>
        </PaperContainer>
      </div>
    );
  }

  // Load live metadata from registry (includes tutorial + quasqueton natively)
  const modules = useMemo(() => {
    try {
      // Only show native engine modules — legacy shims (goblin_warren, haunted_crypt)
      // are excluded until they are refactored to the registry format.
      return getAllModuleMetadata().filter(m => !m.isLegacy);
    } catch (e) {
      console.warn('[AdventureSelection] Could not load registry metadata:', e);
      return [];
    }
  }, []);

  const handleStart = () => {
    if (!selectedId) return;
    adventure.resetAdventure();
    // Pass moduleId in location.state — DungeonScreen reads this
    navigate('/adventure', { state: { moduleId: selectedId } });
  };

  const selectedModule = modules.find(m => m.id === selectedId);

  return (
    <div className="adventure-selection">
      <PaperContainer variant="aged" padding="xl" className="selection-container">

        <div className="selection-header">
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate('/')}>
            Back to Menu
          </Button>
          <h1>Choose Your Adventure</h1>
          <p className="character-name">
            Playing as: <strong>{character.name}</strong>{' '}
            ({typeof character.class === 'object' ? character.class.name : character.class})
          </p>
        </div>

        <div className="adventures-grid">
          {modules.map(mod => (
            <AdventureCard
              key={mod.id}
              mod={mod}
              selected={selectedId === mod.id}
              onSelect={() => setSelectedId(mod.id)}
            />
          ))}
        </div>

        {selectedId && (
          <div className="selection-footer">
            <Button variant="primary" size="lg" onClick={handleStart} fullWidth>
              Begin: {selectedModule?.title ?? selectedId}
            </Button>
          </div>
        )}

      </PaperContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AdventureCard
// ─────────────────────────────────────────────────────────────────────────────

function AdventureCard({ mod, selected, onSelect }) {
  const icon  = MODULE_ICONS[mod.id]  ?? <BookOpen size={32} />;
  const color = MODULE_COLORS[mod.id] ?? 'var(--ink-brown)';

  const difficulty = mod.difficulty
    ? mod.difficulty.charAt(0).toUpperCase() + mod.difficulty.slice(1)
    : 'Standard';

  const features = mod.features?.length
    ? mod.features
    : [`${mod.totalRooms ?? '?'} rooms`, 'Classic D&D adventure'];

  return (
    <div
      className={`adventure-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      aria-pressed={selected}
    >
      <div className="adventure-icon" style={{ color }}>
        {icon}
      </div>

      <div className="adventure-content">
        <h3>{mod.title}</h3>
        <p className="subtitle">{mod.subtitle}</p>

        <div className="adventure-meta">
          <span className={`difficulty ${difficulty.toLowerCase()}`}>{difficulty}</span>
          <span className="level">
            <MapPin size={14} aria-hidden="true" /> Level {mod.recommendedLevel ?? 1}
          </span>
        </div>

        <p className="description">{mod.description}</p>

        <ul className="features">
          {features.map((f, i) => <li key={i}>• {f}</li>)}
        </ul>
      </div>
    </div>
  );
}
