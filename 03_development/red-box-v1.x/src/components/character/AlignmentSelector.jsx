import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Scale, Users, Flame } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { canCastSpells } from '../../data/spells';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './AlignmentSelector.css';

/**
 * AlignmentSelector - Choose character alignment
 * Step 3 of character creation
 */
export function AlignmentSelector() {
  const { character, setAlignment, goToStep } = useCharacter();
  const [selected, setSelected] = useState(null);
  
  const isSpellcaster = character.class && canCastSpells(character.class);

  const alignments = [
    {
      id: 'lawful',
      name: 'Lawful',
      icon: <Scale size={64} />,
      shortDesc: 'Honor, Order, and Justice',
      description: 'You believe in order, law, and the greater good. You keep your word, respect authority, and fight for what is right.',
      traits: [
        'Honors agreements and promises',
        'Respects legitimate authority',
        'Values tradition and order',
        'Protects the innocent',
        'Believes in justice and fairness'
      ],
      examples: 'Paladins, honorable knights, devout clerics',
      color: 'var(--ink-blue)'
    },
    {
      id: 'neutral',
      name: 'Neutral',
      icon: <Users size={64} />,
      shortDesc: 'Balance and Pragmatism',
      description: 'You value balance and practicality. You are not bound by law or chaos, good or evil, but act as the situation demands.',
      traits: [
        'Acts according to circumstances',
        'Values personal freedom',
        'Avoids extreme positions',
        'Makes practical decisions',
        'Respects natural balance'
      ],
      examples: 'Druids, rangers, pragmatic adventurers',
      color: 'var(--ink-brown)'
    },
    {
      id: 'chaotic',
      name: 'Chaotic',
      icon: <Flame size={64} />,
      shortDesc: 'Freedom and Individuality',
      description: 'You prize personal freedom above all. You follow your own conscience, resist authority, and make your own path.',
      traits: [
        'Values personal freedom highly',
        'Distrusts authority',
        'Acts on impulse and emotion',
        'Resents restrictions',
        'Follows own moral compass'
      ],
      examples: 'Barbarians, rebels, free-spirited rogues',
      color: 'var(--ink-red)'
    }
  ];

  const handleConfirm = () => {
    if (selected) {
      setAlignment(selected);
      // If not a spellcaster, skip step 4 (spells) and go to step 5 (finalize)
      if (!isSpellcaster) {
        // setAlignment will set step to 4, but we want to skip to 5
        setTimeout(() => goToStep(5), 0);
      }
    }
  };

  const handleBack = () => {
    goToStep(2);
  };

  return (
    <div className="alignment-selector">
      <div className="selector-header">
        <h1>Choose Your Alignment</h1>
        <p className="flavor-text">
          Your alignment reflects your character's worldview, morality, and approach to life's challenges.
        </p>
      </div>

      {/* Character Summary */}
      <div className="character-summary-compact">
        <PaperContainer variant="aged" padding="md">
          <div className="summary-row">
            <div>
              <strong>Class:</strong> {character.class ? character.class.charAt(0).toUpperCase() + character.class.slice(1) : 'None'}
            </div>
            <div>
              <strong>HP:</strong> <span className="number">{character.hp.max}</span>
            </div>
            <div>
              <strong>AC:</strong> <span className="number">{character.ac}</span>
            </div>
          </div>
        </PaperContainer>
      </div>

      {/* Alignment Cards */}
      <div className="alignments-grid">
        {alignments.map(alignment => (
          <AlignmentCard
            key={alignment.id}
            alignment={alignment}
            selected={selected === alignment.id}
            onSelect={() => setSelected(alignment.id)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="selector-actions">
        <Button
          variant="secondary"
          icon={<ArrowLeft />}
          onClick={handleBack}
        >
          Back to Class
        </Button>

        {selected && (
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight />}
            onClick={handleConfirm}
          >
            Confirm Alignment
          </Button>
        )}
      </div>

      {/* Help Info */}
      <div className="alignment-help">
        <PaperContainer variant="lined" padding="md">
          <h4>About Alignment</h4>
          <p>
            In Basic D&D, alignment represents your character's fundamental approach to ethics and society. 
            It affects how NPCs react to you and may restrict certain classes (Clerics must be Lawful).
          </p>
          <p>
            <strong>Note:</strong> Alignment is not a straitjacket. Your character can act according to the situation, 
            but consistently acting against your alignment may have consequences.
          </p>
        </PaperContainer>
      </div>
    </div>
  );
}

/**
 * AlignmentCard - Individual alignment option
 */
function AlignmentCard({ alignment, selected, onSelect }) {
  return (
    <button
      className={`alignment-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ '--card-color': alignment.color }}
    >
      <div className="alignment-icon" style={{ color: alignment.color }}>
        {alignment.icon}
      </div>

      <h3 className="alignment-name">{alignment.name}</h3>
      <p className="alignment-short-desc">{alignment.shortDesc}</p>

      <div className="alignment-divider"></div>

      <p className="alignment-description">{alignment.description}</p>

      <div className="alignment-traits">
        <h4>Core Values:</h4>
        <ul>
          {alignment.traits.map((trait, index) => (
            <li key={index}>{trait}</li>
          ))}
        </ul>
      </div>

      <div className="alignment-examples">
        <strong>Examples:</strong> {alignment.examples}
      </div>

      {selected && (
        <div className="selected-indicator">
          ✓ Selected
        </div>
      )}
    </button>
  );
}

export default AlignmentSelector;
