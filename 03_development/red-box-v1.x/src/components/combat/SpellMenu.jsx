import React from 'react';
import { X, Sparkles, Heart, Shield, Zap } from 'lucide-react';
import { getSpell } from '../../data/spells';
import { canCastSpell, getSpellSlotsText } from '../../utils/spells';
import Button from '../common/Button';
import './SpellMenu.css';

/**
 * SpellMenu - Display available spells during combat
 * @param {object} props
 * @param {object} props.character - Character object
 * @param {function} props.onCastSpell - Callback when spell is cast
 * @param {function} props.onClose - Callback to close menu
 */
export function SpellMenu({ character, onCastSpell, onClose }) {
  const handleSpellClick = (spellId) => {
    const spell = getSpell(spellId);
    const { canCast } = canCastSpell(character, spellId, spell.level);
    
    if (canCast) {
      onCastSpell(spellId);
    }
  };

  // Get spell icon based on type
  const getSpellIcon = (spell) => {
    switch (spell.implementation?.type) {
      case 'healing':
        return <Heart size={20} />;
      case 'damage':
        return <Zap size={20} />;
      case 'buff':
        return <Shield size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  return (
    <div className="spell-menu-overlay" onClick={onClose}>
      <div className="spell-menu" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="spell-menu-header">
          <div className="menu-title">
            <Sparkles size={24} />
            <h3>Cast a Spell</h3>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Spell Slots Info */}
        <div className="spell-slots-info">
          <span className="slots-label">Spell Slots:</span>
          <span className="slots-value">
            Level 1: {getSpellSlotsText(character, 1)}
          </span>
        </div>

        {/* Spell List */}
        <div className="spell-list">
          {!character.spells || character.spells.length === 0 ? (
            <div className="no-spells">
              <p>No spells prepared!</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px', color: '#666' }}>
                Spells are selected during character creation.
              </p>
            </div>
          ) : (
            character.spells.map(spellId => {
              const spell = getSpell(spellId);
              if (!spell) return null;

              const { canCast, reason } = canCastSpell(character, spellId, spell.level);

              return (
                <div
                  key={spellId}
                  className={`spell-option ${!canCast ? 'disabled' : ''}`}
                >
                  <div className="spell-option-header">
                    <div className="spell-option-title">
                      {getSpellIcon(spell)}
                      <span className="spell-name">{spell.name}</span>
                    </div>
                    {!canCast && (
                      <span className="spell-unavailable">{reason}</span>
                    )}
                  </div>

                  <div className="spell-option-effect">
                    {spell.effect}
                  </div>

                  <div className="spell-option-actions">
                    <Button
                      variant={canCast ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleSpellClick(spellId)}
                      disabled={!canCast}
                      fullWidth
                    >
                      {canCast ? 'Cast Spell' : 'Unavailable'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="spell-menu-footer">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SpellMenu;
