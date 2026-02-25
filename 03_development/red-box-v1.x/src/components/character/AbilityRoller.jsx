import React, { useState } from 'react';
import { Dices, RotateCcw, ArrowRight } from 'lucide-react';
import { roll3d6, rollAbilityScores } from '../../utils/dice';
import { calculateModifier } from '../../utils/calculations';
import { useCharacter } from '../../contexts/CharacterContext';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './AbilityRoller.css';

/**
 * AbilityRoller - Roll 3d6 for each of the six ability scores
 * Step 1 of character creation
 */
export function AbilityRoller() {
  const { setAbilities } = useCharacter();
  const [rolls, setRolls] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [manualScores, setManualScores] = useState({
    strength: 10,
    intelligence: 10,
    wisdom: 10,
    dexterity: 10,
    constitution: 10,
    charisma: 10
  });

  const abilities = [
    { key: 'strength', label: 'Strength', description: 'Melee combat, damage' },
    { key: 'intelligence', label: 'Intelligence', description: 'Spells for Magic-Users' },
    { key: 'wisdom', label: 'Wisdom', description: 'Spells for Clerics' },
    { key: 'dexterity', label: 'Dexterity', description: 'AC, missile attacks' },
    { key: 'constitution', label: 'Constitution', description: 'Hit points' },
    { key: 'charisma', label: 'Charisma', description: 'Reactions, retainers' }
  ];

  const handleRollAll = () => {
    setIsRolling(true);
    
    // Simulate dice rolling animation
    setTimeout(() => {
      const newRolls = rollAbilityScores();
      setRolls(newRolls);
      setIsRolling(false);
    }, 800);
  };

  const handleRerollSingle = (abilityKey) => {
    setIsRolling(true);
    
    setTimeout(() => {
      const newRoll = roll3d6();
      setRolls({
        ...rolls,
        [abilityKey]: newRoll
      });
      setIsRolling(false);
    }, 600);
  };

  const handleConfirm = () => {
    if (debugMode) {
      // Use manually set scores
      setAbilities(manualScores);
    } else {
      // Use rolled scores
      const abilityScores = {};
      Object.keys(rolls).forEach(key => {
        abilityScores[key] = rolls[key].total;
      });
      setAbilities(abilityScores);
    }
  };

  const handleManualScoreChange = (ability, value) => {
    const numValue = parseInt(value) || 3;
    const clampedValue = Math.max(3, Math.min(18, numValue));
    setManualScores(prev => ({
      ...prev,
      [ability]: clampedValue
    }));
  };

  const allRolled = rolls && Object.keys(rolls).length === 6;

  return (
    <div className="ability-roller">
      <div className="roller-header">
        <h1>Roll Ability Scores</h1>
        <p className="flavor-text">
          Roll 3d6 for each of your six ability scores. These numbers define your character's strengths and weaknesses.
        </p>
        
        {/* Debug Mode Toggle */}
        <button
          className="debug-toggle"
          onClick={() => setDebugMode(!debugMode)}
          title="Enable manual ability score entry for testing"
        >
          {debugMode ? '🎲 Switch to Dice Rolling' : '⚙️ Enable Debug Mode'}
        </button>
      </div>

      {!rolls && !debugMode && (
        <div className="initial-roll-section">
          <PaperContainer variant="aged" padding="lg">
            <div className="roll-prompt">
              <Dices size={64} className="dice-icon" />
              <h2>Ready to Begin?</h2>
              <p>
                Click the button below to roll 3d6 six times — once for each ability score.
                The dice will determine your character's fate!
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={<Dices />}
                onClick={handleRollAll}
                disabled={isRolling}
              >
                {isRolling ? 'Rolling Dice...' : 'Roll All Abilities'}
              </Button>
            </div>
          </PaperContainer>
        </div>
      )}

      {debugMode && (
        <>
          <div className="debug-mode-notice">
            <h3>⚙️ Debug Mode: Manual Ability Entry</h3>
            <p>Enter ability scores between 3 and 18 for testing purposes.</p>
          </div>

          <div className="abilities-grid">
            {abilities.map(ability => {
              const score = manualScores[ability.key];
              const modifier = calculateModifier(score);
              const modifierText = modifier >= 0 ? `+${modifier}` : modifier;

              return (
                <PaperContainer key={ability.key} className="ability-card">
                  <div className="ability-header">
                    <h3>{ability.label}</h3>
                  </div>

                  <div className="ability-roll">
                    <div className="manual-input">
                      <input
                        type="number"
                        min="3"
                        max="18"
                        value={score}
                        onChange={(e) => handleManualScoreChange(ability.key, e.target.value)}
                        className="score-input"
                      />
                    </div>

                    <div className={`ability-modifier ${modifier >= 0 ? 'positive' : 'negative'}`}>
                      <span className="modifier-label">Modifier:</span>
                      <span className="number modifier-value">{modifierText}</span>
                    </div>
                  </div>

                  <p className="ability-description">{ability.description}</p>
                </PaperContainer>
              );
            })}
          </div>

          <div className="roller-actions">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight />}
              onClick={handleConfirm}
            >
              Confirm & Choose Class
            </Button>
          </div>
        </>
      )}

      {rolls && !debugMode && (
        <>
          <div className="abilities-grid">
            {abilities.map(ability => {
              const roll = rolls[ability.key];
              const total = roll?.total || 0;
              const modifier = calculateModifier(total);
              const modifierText = modifier >= 0 ? `+${modifier}` : modifier;

              return (
                <PaperContainer key={ability.key} className="ability-card">
                  <div className="ability-header">
                    <h3>{ability.label}</h3>
                    <button
                      className="reroll-btn"
                      onClick={() => handleRerollSingle(ability.key)}
                      disabled={isRolling}
                      title={`Reroll ${ability.label}`}
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>

                  <div className="ability-roll">
                    <div className="dice-display">
                      {roll?.rolls.map((die, index) => (
                        <span 
                          key={index} 
                          className={`die ${isRolling ? 'rolling' : ''}`}
                        >
                          {die}
                        </span>
                      ))}
                    </div>

                    <div className="ability-total">
                      <span className="total-label">Total:</span>
                      <span className="number total-value">{total}</span>
                    </div>

                    <div className={`ability-modifier ${modifier >= 0 ? 'positive' : 'negative'}`}>
                      <span className="modifier-label">Modifier:</span>
                      <span className="number modifier-value">{modifierText}</span>
                    </div>
                  </div>

                  <p className="ability-description">{ability.description}</p>
                </PaperContainer>
              );
            })}
          </div>

          <div className="roller-actions">
            <Button
              variant="secondary"
              icon={<RotateCcw />}
              onClick={handleRollAll}
              disabled={isRolling}
            >
              Reroll All
            </Button>

            {allRolled && (
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight />}
                onClick={handleConfirm}
              >
                Confirm & Choose Class
              </Button>
            )}
          </div>
        </>
      )}

      <div className="roller-help">
        <PaperContainer variant="lined" padding="md">
          <h4>How It Works</h4>
          <ul>
            <li><strong>3d6:</strong> Each ability is determined by rolling three six-sided dice</li>
            <li><strong>Modifier:</strong> Your modifier affects related rolls (attacks, saves, etc.)</li>
            <li><strong>Prime Requisites:</strong> High scores in your class's prime requisite grant bonus XP</li>
            <li><strong>Reroll:</strong> You can reroll any single ability or all of them</li>
          </ul>
        </PaperContainer>
      </div>
    </div>
  );
}

export default AbilityRoller;
