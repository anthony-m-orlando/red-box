import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Download, Upload, Trash2, Play } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './CharacterManager.css';

/**
 * CharacterManager - Manage multiple characters in localStorage
 */
export function CharacterManager() {
  const navigate = useNavigate();
  const { character, importCharacter, resetCharacter } = useCharacter();
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);

  // Load all characters from localStorage
  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = () => {
    const keys = Object.keys(localStorage);
    const charKeys = keys.filter(key => key.startsWith('rpg-character-'));
    
    const chars = charKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return {
          id: key,
          ...data
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean);
    
    // Also include current character if not in list
    if (character.isCreated) {
      const currentExists = chars.some(c => c.name === character.name);
      if (!currentExists) {
        chars.unshift({
          id: 'rpg-character',
          ...character,
          isCurrent: true
        });
      }
    }
    
    setCharacters(chars);
  };

  const handleLoadCharacter = (char) => {
    const result = importCharacter(JSON.stringify(char));
    if (result.success) {
      // Update main character storage
      localStorage.setItem('rpg-character', JSON.stringify(char));
      navigate('/');
    }
  };

  const handleDeleteCharacter = (charId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      localStorage.removeItem(charId);
      loadCharacters();
    }
  };

  const handleExportCharacter = (char) => {
    const data = JSON.stringify(char, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${char.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCharacter = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const char = JSON.parse(event.target.result);
            
            // Generate unique ID for imported character
            const uniqueId = `rpg-character-${Date.now()}`;
            localStorage.setItem(uniqueId, JSON.stringify(char));
            
            loadCharacters();
            alert(`Character "${char.name}" imported successfully!`);
          } catch (error) {
            alert('Error importing character: Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const handleSaveCurrentCharacter = () => {
    if (!character.isCreated) {
      alert('No character to save!');
      return;
    }
    
    const uniqueId = `rpg-character-${Date.now()}`;
    localStorage.setItem(uniqueId, JSON.stringify(character));
    loadCharacters();
    alert(`Character "${character.name}" saved!`);
  };

  return (
    <div className="character-manager">
      <div className="manager-header">
        <h1>Character Manager</h1>
        <p className="flavor-text">
          Manage your heroes, import characters, and choose who will brave the dungeon!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="manager-actions">
        <Button
          variant="primary"
          icon={<UserPlus />}
          onClick={() => {
            // Reset character state before creating new
            resetCharacter();
            localStorage.removeItem('rpg-character');
            navigate('/character/create');
          }}
        >
          Create New Character
        </Button>

        <Button
          variant="secondary"
          icon={<Upload />}
          onClick={handleImportCharacter}
        >
          Import Character
        </Button>

        {character.isCreated && (
          <Button
            variant="secondary"
            icon={<Download />}
            onClick={handleSaveCurrentCharacter}
          >
            Save Current Character
          </Button>
        )}
      </div>

      {/* Character List */}
      <div className="character-list">
        {characters.length === 0 ? (
          <PaperContainer variant="aged" padding="lg">
            <div className="empty-state">
              <Users size={64} />
              <h3>No Characters Found</h3>
              <p>Create a new character to begin your adventure!</p>
            </div>
          </PaperContainer>
        ) : (
          characters.map(char => (
            <CharacterCard
              key={char.id}
              character={char}
              onLoad={() => handleLoadCharacter(char)}
              onDelete={() => handleDeleteCharacter(char.id)}
              onExport={() => handleExportCharacter(char)}
              isCurrent={char.id === 'rpg-character'}
            />
          ))
        )}
      </div>

      {/* Back Button */}
      <div className="manager-footer">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </Button>
      </div>
    </div>
  );
}

/**
 * CharacterCard - Individual character display
 */
function CharacterCard({ character, onLoad, onDelete, onExport, isCurrent }) {
  const navigate = useNavigate();
  
  const handleLoadAndPlay = () => {
    onLoad(); // Load the character
    setTimeout(() => {
      navigate('/adventure'); // Navigate to adventure
    }, 100);
  };
  
  return (
    <PaperContainer className="character-card">
      <div className="card-header">
        <div>
          <h3>{character.name}</h3>
          <p className="char-subtitle">
            Level {character.level} {character.class} • {character.alignment}
          </p>
        </div>
        {isCurrent && <span className="current-badge">Current</span>}
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">HP:</span>
          <span className="number">{character.hp.current}/{character.hp.max}</span>
        </div>
        <div className="stat">
          <span className="stat-label">AC:</span>
          <span className="number">{character.ac}</span>
        </div>
        <div className="stat">
          <span className="stat-label">XP:</span>
          <span className="number">{character.xp}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Gold:</span>
          <span className="number">{character.gold}</span>
        </div>
      </div>

      <div className="card-abilities">
        {Object.entries(character.abilities).map(([ability, score]) => (
          <div key={ability} className="ability-mini">
            <span className="ability-name-mini">{ability.substring(0, 3).toUpperCase()}</span>
            <span className="number">{score}</span>
          </div>
        ))}
      </div>

      <div className="card-actions">
        <Button
          variant="primary"
          size="sm"
          icon={<Play />}
          onClick={handleLoadAndPlay}
          fullWidth
        >
          Load & Begin Adventure
        </Button>

        <div className="card-actions-row">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoad}
          >
            Load Only
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={<Download />}
            onClick={onExport}
          >
            Export
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </PaperContainer>
  );
}

export default CharacterManager;
