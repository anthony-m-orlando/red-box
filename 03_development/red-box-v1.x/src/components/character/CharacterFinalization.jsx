import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Play, ArrowLeft } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { getClassById } from '../../data/classes';
import { calculateModifier } from '../../utils/calculations';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './CharacterFinalization.css';

/**
 * CharacterFinalization - Name character and view completed sheet
 * Step 5 (final step) of character creation
 */
export function CharacterFinalization() {
  const { character, setName, finalizeCharacter, exportCharacter, goToStep } = useCharacter();
  const navigate = useNavigate();
  const [characterName, setCharacterName] = useState(character.name || '');
  const [isNamed, setIsNamed] = useState(!!character.name);

  const classData = getClassById(character.class);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (characterName.trim()) {
      setName(characterName.trim());
      setIsNamed(true);
    }
  };

  const handleBeginAdventure = () => {
    finalizeCharacter();
    navigate('/adventure');
  };

  const handleExport = () => {
    exportCharacter();
  };

  const handleBack = () => {
    goToStep(3);
  };

  if (!isNamed) {
    return (
      <div className="character-finalization">
        <div className="naming-section">
          <PaperContainer variant="cream" padding="lg">
            <div className="naming-content">
              <h1>Name Your Character</h1>
              <p className="flavor-text">
                Every hero needs a name. Choose wisely — this name will echo through the ages!
              </p>

              <form onSubmit={handleNameSubmit} className="naming-form">
                <div className="name-input-group">
                  <label htmlFor="character-name">Character Name:</label>
                  <input
                    id="character-name"
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter name..."
                    maxLength={30}
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!characterName.trim()}
                >
                  Confirm Name
                </Button>
              </form>

              <button className="back-link" onClick={handleBack}>
                ← Back to Alignment
              </button>
            </div>
          </PaperContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="character-finalization">
      <div className="finalization-header">
        <h1>{characterName} is Ready!</h1>
        <p className="flavor-text">
          Your character is complete. Review your hero below and begin your adventure!
        </p>
      </div>

      {/* Character Sheet */}
      <div className="character-sheet">
        <PaperContainer variant="aged" padding="lg">
          {/* Header */}
          <div className="sheet-header">
            <div className="sheet-title-section">
              <h2 className="character-name-display">{characterName}</h2>
              <div className="character-subtitle">
                Level {character.level} {classData?.name} • {character.alignment}
              </div>
            </div>
            <div className="class-icon-large">{classData?.icon}</div>
          </div>

          <div className="sheet-divider"></div>

          {/* Ability Scores */}
          <div className="sheet-section">
            <h3>Ability Scores</h3>
            <div className="abilities-display">
              {Object.entries(character.abilities).map(([ability, score]) => {
                const modifier = calculateModifier(score);
                const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
                return (
                  <div key={ability} className="ability-box">
                    <div className="ability-name-display">
                      {ability.charAt(0).toUpperCase() + ability.slice(1)}
                    </div>
                    <div className="ability-score-display number">{score}</div>
                    <div className={`ability-mod-display ${modifier >= 0 ? 'positive' : 'negative'}`}>
                      ({modifierText})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Combat Stats */}
          <div className="sheet-section">
            <h3>Combat Statistics</h3>
            <div className="combat-stats-grid">
              <div className="stat-box">
                <div className="stat-label">Hit Points</div>
                <div className="stat-value number">
                  {character.hp.current} / {character.hp.max}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Armor Class</div>
                <div className="stat-value number">{character.ac}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">THAC0</div>
                <div className="stat-value number">{character.thac0}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">XP</div>
                <div className="stat-value number">{character.xp}</div>
              </div>
            </div>
          </div>

          {/* Class Features */}
          <div className="sheet-section">
            <h3>Class Features</h3>
            <div className="features-list">
              <div className="feature-item">
                <strong>Hit Die:</strong> {classData?.hitDie}
              </div>
              <div className="feature-item">
                <strong>Prime Requisite:</strong>{' '}
                {classData?.primeRequisite.map(pr => 
                  pr.charAt(0).toUpperCase() + pr.slice(1)
                ).join(', ')}
              </div>
              <div className="feature-item">
                <strong>Maximum Level:</strong> {classData?.maxLevel}
              </div>
            </div>
            
            <h4>Special Abilities:</h4>
            <ul className="abilities-list">
              {classData?.specialAbilities.map((ability, index) => (
                <li key={index}>{ability}</li>
              ))}
            </ul>
          </div>

          {/* Equipment */}
          <div className="sheet-section">
            <h3>Equipment & Wealth</h3>
            <div className="equipment-section">
              <div className="equipment-item">
                <strong>Gold:</strong> <span className="number">{character.gold}</span> gp
              </div>
              <div className="equipment-item">
                <strong>Armor:</strong> {character.armor || 'None'}
              </div>
              <div className="equipment-item">
                <strong>Shield:</strong> {character.hasShield ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </PaperContainer>
      </div>

      {/* Actions */}
      <div className="finalization-actions">
        <Button
          variant="secondary"
          icon={<Download />}
          onClick={handleExport}
        >
          Export Character
        </Button>

        <Button
          variant="primary"
          size="lg"
          icon={<Play />}
          onClick={handleBeginAdventure}
        >
          Begin Adventure!
        </Button>
      </div>

      <div className="finalization-footer">
        <button className="back-link" onClick={handleBack}>
          ← Back to Alignment
        </button>
      </div>
    </div>
  );
}

export default CharacterFinalization;
