import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Shield, Sword, Info } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { getAllClasses, getStartingEquipment } from '../../data/classes';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './ClassSelector.css';

/**
 * ClassSelector - Choose your character class
 * Step 2 of character creation
 */
export function ClassSelector() {
  const { character, setClass, goToStep, canChooseClass } = useCharacter();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const allClasses = getAllClasses();

  const handleSelectClass = (classData) => {
    setSelectedClass(classData);
    setShowDetails(true);
  };

  const handleConfirm = () => {
    if (selectedClass) {
      setClass(selectedClass.id);
    }
  };

  const handleBack = () => {
    goToStep(1);
  };

  return (
    <div className="class-selector">
      <div className="selector-header">
        <h1>Choose Your Class</h1>
        <p className="flavor-text">
          Your class defines your role, abilities, and destiny. Choose wisely!
        </p>
      </div>

      {/* Ability Scores Summary */}
      <div className="ability-summary">
        <PaperContainer variant="aged" padding="md">
          <h3>Your Ability Scores</h3>
          <div className="ability-grid-compact">
            {Object.entries(character.abilities).map(([ability, score]) => (
              <div key={ability} className="ability-compact">
                <span className="ability-name">{ability.substring(0, 3).toUpperCase()}</span>
                <span className="number ability-score">{score}</span>
              </div>
            ))}
          </div>
        </PaperContainer>
      </div>

      {/* Class Cards */}
      {!showDetails && (
        <div className="classes-grid">
          {allClasses.map(classData => {
            const eligible = canChooseClass(classData.id);
            const primeReqScores = classData.primeRequisite.map(
              ability => character.abilities[ability]
            );
            const avgPrimeReq = primeReqScores.reduce((a, b) => a + b, 0) / primeReqScores.length;
            const recommended = avgPrimeReq >= 13;

            return (
              <ClassCard
                key={classData.id}
                classData={classData}
                eligible={eligible.allowed}
                reason={eligible.reason}
                recommended={recommended}
                onSelect={() => handleSelectClass(classData)}
              />
            );
          })}
        </div>
      )}

      {/* Class Details */}
      {showDetails && selectedClass && (
        <ClassDetails
          classData={selectedClass}
          character={character}
          onBack={() => setShowDetails(false)}
          onConfirm={handleConfirm}
        />
      )}

      {/* Navigation */}
      <div className="selector-actions">
        {!showDetails ? (
          <Button
            variant="secondary"
            icon={<ArrowLeft />}
            onClick={handleBack}
          >
            Back to Abilities
          </Button>
        ) : (
          <Button
            variant="secondary"
            icon={<ArrowLeft />}
            onClick={() => setShowDetails(false)}
          >
            Back to Classes
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * ClassCard - Individual class card
 */
function ClassCard({ classData, eligible, reason, recommended, onSelect }) {
  return (
    <button
      className={`class-card ${!eligible ? 'disabled' : ''} ${recommended ? 'recommended' : ''}`}
      onClick={onSelect}
      disabled={!eligible}
    >
      <div className="class-icon">{classData.icon}</div>
      
      <h3 className="class-name">{classData.name}</h3>
      
      <p className="class-description">{classData.description}</p>
      
      <div className="class-stats">
        <div className="stat-item">
          <Shield size={16} />
          <span>Hit Die: {classData.hitDie}</span>
        </div>
        <div className="stat-item">
          <Sword size={16} />
          <span>Max Level: {classData.maxLevel}</span>
        </div>
      </div>

      {recommended && (
        <div className="recommended-badge">
          ⭐ Recommended
        </div>
      )}

      {!eligible && (
        <div className="requirement-warning">
          {reason}
        </div>
      )}

      <div className="card-action">
        <Info size={16} />
        <span>View Details</span>
      </div>
    </button>
  );
}

/**
 * ClassDetails - Detailed view of selected class
 */
function ClassDetails({ classData, character, onBack, onConfirm }) {
  const equipment = getStartingEquipment(classData.id);
  
  const primeReqScores = classData.primeRequisite.map(
    ability => ({
      name: ability,
      score: character.abilities[ability]
    })
  );

  return (
    <div className="class-details">
      <PaperContainer variant="cream" padding="lg" className="details-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Class Selection
        </button>

        <div className="details-header">
          <div className="details-icon">{classData.icon}</div>
          <div>
            <h2>{classData.name}</h2>
            <p className="flavor-text">{classData.flavor}</p>
          </div>
        </div>

        <div className="details-grid">
          {/* Basic Info */}
          <div className="details-section">
            <h3>Basic Information</h3>
            <ul>
              <li><strong>Hit Die:</strong> {classData.hitDie}</li>
              <li><strong>Maximum Level:</strong> {classData.maxLevel}</li>
              <li>
                <strong>Prime Requisite:</strong>{' '}
                {primeReqScores.map((pr, i) => (
                  <span key={pr.name}>
                    {pr.name.charAt(0).toUpperCase() + pr.name.slice(1)} ({pr.score})
                    {i < primeReqScores.length - 1 && ', '}
                  </span>
                ))}
              </li>
            </ul>
          </div>

          {/* Combat */}
          <div className="details-section">
            <h3>Combat</h3>
            <ul>
              <li><strong>Weapons:</strong> {classData.weapons.join(', ')}</li>
              <li><strong>Armor:</strong> {classData.armor.join(', ')}</li>
            </ul>
          </div>

          {/* Special Abilities */}
          <div className="details-section full-width">
            <h3>Special Abilities</h3>
            <ul className="abilities-list">
              {classData.specialAbilities.map((ability, index) => (
                <li key={index}>{ability}</li>
              ))}
            </ul>
          </div>

          {/* Starting Equipment */}
          <div className="details-section full-width">
            <h3>Starting Equipment</h3>
            <div className="equipment-list">
              <div><strong>Armor:</strong> {equipment.armor || 'None'}</div>
              <div><strong>Shield:</strong> {equipment.shield ? 'Yes' : 'No'}</div>
              <div><strong>Weapons:</strong> {equipment.weapons.join(', ')}</div>
              <div><strong>Items:</strong> {equipment.items.join(', ')}</div>
            </div>
          </div>
        </div>

        <div className="details-actions">
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight />}
            onClick={onConfirm}
          >
            Choose {classData.name}
          </Button>
        </div>
      </PaperContainer>
    </div>
  );
}

export default ClassSelector;
