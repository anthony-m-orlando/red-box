import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacter } from '../../contexts/CharacterContext';
import { canCastSpells } from '../../data/spells';
import AbilityRoller from './AbilityRoller';
import ClassSelector from './ClassSelector';
import AlignmentSelector from './AlignmentSelector';
import SpellSelector from './SpellSelector';
import CharacterFinalization from './CharacterFinalization';
import './CharacterCreator.css';

/**
 * CharacterCreator - Multi-step wizard for character creation
 * Steps:
 * 1. Roll Abilities (AbilityRoller)
 * 2. Choose Class (ClassSelector)
 * 3. Choose Alignment (AlignmentSelector)
 * 4. Select Spells (SpellSelector) - if spell-casting class
 * 5. Finalize & Name (CharacterFinalization)
 */
export function CharacterCreator() {
  const { character, resetCharacter } = useCharacter();
  const navigate = useNavigate();
  const currentStep = character.creationStep;
  
  // Check if current class can cast spells
  const isSpellcaster = character.class && canCastSpells(character.class);

  // Reset character immediately if entering with a completed character
  useEffect(() => {
    if (character.isCreated) {
      resetCharacter();
    }
  }, []); // Empty deps - run once on mount

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Progress indicator
  const steps = [
    { number: 1, label: 'Abilities', active: currentStep >= 1, complete: currentStep > 1 },
    { number: 2, label: 'Class', active: currentStep >= 2, complete: currentStep > 2 },
    { number: 3, label: 'Alignment', active: currentStep >= 3, complete: currentStep > 3 },
    { number: 4, label: isSpellcaster ? 'Spells' : 'Review', active: currentStep >= 4, complete: currentStep > 4 },
    { number: 5, label: 'Finalize', active: currentStep >= 5, complete: character.isCreated }
  ];

  return (
    <div className="character-creator">
      {/* Progress Bar */}
      <div className="creation-progress">
        <div className="progress-bar">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className={`progress-step ${step.active ? 'active' : ''} ${step.complete ? 'complete' : ''}`}>
                <div className="step-number">{step.number}</div>
                <div className="step-label">{step.label}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`progress-line ${step.complete ? 'complete' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="creation-content">
        {currentStep === 1 && <AbilityRoller />}
        
        {currentStep === 2 && <ClassSelector />}
        
        {currentStep === 3 && <AlignmentSelector />}
        
        {/* Step 4: Spell Selection (only for spellcasters) or skip to finalization */}
        {currentStep === 4 && isSpellcaster && <SpellSelector />}
        {currentStep === 4 && !isSpellcaster && !character.isCreated && <CharacterFinalization />}
        
        {/* Step 5: Finalization */}
        {currentStep === 5 && !character.isCreated && <CharacterFinalization />}
      </div>

      {/* Back to Home Button */}
      <div className="creator-footer">
        <button 
          className="back-home-link" 
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

/**
 * Placeholder for coming soon steps
 */
function ComingSoonStep({ title, description }) {
  return (
    <div className="coming-soon-step">
      <div className="coming-soon-content">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="coming-soon-badge">
          Coming Soon in Phase 2
        </div>
      </div>
    </div>
  );
}

export default CharacterCreator;
