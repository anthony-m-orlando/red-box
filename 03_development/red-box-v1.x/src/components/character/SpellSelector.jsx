import React, { useState } from 'react';
import { ArrowRight, Book, Sparkles } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { getSpellsForClass, getSpellSlotsForClass } from '../../data/spells';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './SpellSelector.css';

/**
 * SpellSelector - Choose starting spells (Step 4 in character creation)
 * Only shown for spell-casting classes (Cleric, Magic-User, Elf)
 */
export function SpellSelector() {
  const { character, setSpells } = useCharacter();
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [expandedSpell, setExpandedSpell] = useState(null);

  // Get class name (handle both string and object formats)
  const className = typeof character.class === 'string' ? character.class : character.class?.id;
  
  // Get available spells for this class
  const availableSpells = getSpellsForClass(className, 1);
  
  // Get number of spells they can select
  const spellSlots = getSpellSlotsForClass(className, 1);
  const maxSpells = spellSlots[1] || 1; // Level 1 spell slots

  const handleSpellToggle = (spellId) => {
    if (selectedSpells.includes(spellId)) {
      // Deselect
      setSelectedSpells(selectedSpells.filter(id => id !== spellId));
    } else if (selectedSpells.length < maxSpells) {
      // Select (if under limit)
      setSelectedSpells([...selectedSpells, spellId]);
    }
  };

  const handleConfirm = () => {
    // Pass both spell IDs and spell slots to context
    setSpells(selectedSpells, spellSlots);
  };

  const canConfirm = selectedSpells.length === maxSpells;

  return (
    <div className="spell-selector">
      <div className="selector-header">
        <h1>Choose Your Spells</h1>
        <p className="flavor-text">
          As a {className}, you can prepare spells from your sacred texts or spellbook.
          Choose {maxSpells} {maxSpells === 1 ? 'spell' : 'spells'} to prepare for your adventure.
        </p>
        
        <div className="spell-counter">
          <span className="counter-label">Spells Selected:</span>
          <span className={`counter-value ${canConfirm ? 'complete' : ''}`}>
            {selectedSpells.length} / {maxSpells}
          </span>
        </div>
      </div>

      <div className="spells-grid">
        {availableSpells.map(spell => {
          const isSelected = selectedSpells.includes(spell.id);
          const isExpanded = expandedSpell === spell.id;
          const canSelect = !isSelected && selectedSpells.length < maxSpells;

          return (
            <PaperContainer 
              key={spell.id}
              className={`spell-card ${isSelected ? 'selected' : ''} ${!canSelect && !isSelected ? 'disabled' : ''}`}
              variant="cream"
              padding="md"
            >
              {/* Spell Header */}
              <div 
                className="spell-header"
                onClick={() => setExpandedSpell(isExpanded ? null : spell.id)}
              >
                <div className="spell-title">
                  <Sparkles className="spell-icon" size={20} />
                  <h3>{spell.name}</h3>
                  {isSelected && <span className="selected-badge">✓ Selected</span>}
                </div>
                <div className="spell-meta">
                  <span className="spell-school">{spell.school}</span>
                  <span className="spell-range">Range: {spell.range}</span>
                </div>
              </div>

              {/* Spell Effect (Always Visible) */}
              <div className="spell-effect">
                <strong>Effect:</strong> {spell.effect}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="spell-details">
                  <div className="spell-description">
                    {spell.description}
                  </div>
                  
                  <div className="spell-mechanics">
                    <div className="mechanic-row">
                      <span className="mechanic-label">Duration:</span>
                      <span className="mechanic-value">{spell.duration}</span>
                    </div>
                  </div>

                  {spell.flavorText && (
                    <div className="spell-flavor">
                      <em>{spell.flavorText}</em>
                    </div>
                  )}

                  {spell.note && (
                    <div className="spell-note">
                      <strong>Note:</strong> {spell.note}
                    </div>
                  )}
                </div>
              )}

              {/* Select Button */}
              <div className="spell-actions">
                <Button
                  variant={isSelected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleSpellToggle(spell.id)}
                  disabled={!canSelect && !isSelected}
                  fullWidth
                >
                  {isSelected ? 'Deselect' : 'Select This Spell'}
                </Button>
              </div>
            </PaperContainer>
          );
        })}
      </div>

      {/* Instructions */}
      {!canConfirm && (
        <div className="selection-hint">
          <Book size={24} />
          <p>
            Click on a spell card to see full details. 
            Select {maxSpells} {maxSpells === 1 ? 'spell' : 'spells'} to continue.
          </p>
        </div>
      )}

      {/* Confirm Button */}
      <div className="selector-actions">
        <Button
          variant="primary"
          size="lg"
          icon={<ArrowRight />}
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          Confirm Spells & Continue
        </Button>
      </div>
    </div>
  );
}

export default SpellSelector;
