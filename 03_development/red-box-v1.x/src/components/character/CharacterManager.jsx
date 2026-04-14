import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Download, Upload, Trash2, Play } from 'lucide-react';
import {
  useCharacter,
  loadAllCharacters,
  addToCharacterIndex,
  removeFromCharacterIndex
} from '../../contexts/CharacterContext';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import './CharacterManager.css';

/**
 * CharacterManager — load, save, import, export, and delete characters.
 *
 * Changes vs original:
 *  - FIX: loadCharacters() no longer calls Object.keys(localStorage) and
 *    filters by prefix. That approach scans every key in storage, which
 *    degrades as localStorage grows. It's replaced by loadAllCharacters()
 *    from CharacterContext, which reads a compact index key instead.
 *  - Save / import / delete all go through addToCharacterIndex /
 *    removeFromCharacterIndex so the index stays consistent.
 */
export function CharacterManager() {
  const navigate = useNavigate();
  const { character, importCharacter, resetCharacter, saveCharacterSlot } = useCharacter();
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);

  // ── Load using the index, not a full localStorage scan ───────────────────
  const loadCharacters = () => {
    const saved = loadAllCharacters(); // reads rpg-character-index

    // Prepend the active character if it isn't in the saved list
    if (character.isCreated) {
      const alreadyListed = saved.some(c => c.name === character.name);
      if (!alreadyListed) {
        saved.unshift({ id: 'rpg-character', ...character, isCurrent: true });
      }
    }

    setCharacters(saved);
  };

  useEffect(() => {
    loadCharacters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleLoadCharacter = (char) => {
    const result = importCharacter(JSON.stringify(char));
    if (result.success) {
      localStorage.setItem('rpg-character', JSON.stringify(char));
      navigate('/');
    }
  };

  const handleDeleteCharacter = (charId) => {
    if (!window.confirm('Are you sure you want to delete this character?')) return;
    localStorage.removeItem(charId);
    removeFromCharacterIndex(charId); // keep index in sync
    loadCharacters();
  };

  const handleExportCharacter = (char) => {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${char.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCharacter = () => {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const char    = JSON.parse(event.target.result);
          const key     = `rpg-character-${Date.now()}`;
          localStorage.setItem(key, JSON.stringify(char));
          addToCharacterIndex(key); // keep index in sync
          loadCharacters();
          alert(`Character "${char.name}" imported successfully!`);
        } catch {
          alert('Error importing character: Invalid file format');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleSaveCurrentCharacter = () => {
    if (!character.isCreated) {
      alert('No character to save!');
      return;
    }
    const key = `rpg-character-${Date.now()}`;
    saveCharacterSlot(key); // writes data + updates index
    loadCharacters();
    alert(`Character "${character.name}" saved!`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="character-manager">
      <div className="manager-header">
        <h1>Character Manager</h1>
        <p className="flavor-text">
          Manage your heroes, import characters, and choose who will brave the dungeon!
        </p>
      </div>

      <div className="manager-actions">
        <Button
          variant="primary"
          icon={<UserPlus />}
          onClick={() => {
            resetCharacter();
            localStorage.removeItem('rpg-character');
            navigate('/character/create');
          }}
        >
          Create New Character
        </Button>

        <Button variant="secondary" icon={<Upload />} onClick={handleImportCharacter}>
          Import Character
        </Button>

        {character.isCreated && (
          <Button variant="secondary" icon={<Download />} onClick={handleSaveCurrentCharacter}>
            Save Current Character
          </Button>
        )}
      </div>

      <div className="character-list">
        {characters.length === 0 ? (
          <PaperContainer variant="aged">
            <p style={{ textAlign: 'center', color: 'var(--ink-brown)', padding: '2rem' }}>
              No characters found. Create your first hero!
            </p>
          </PaperContainer>
        ) : (
          characters.map((char) => (
            <PaperContainer
              key={char.id}
              variant={selectedChar === char.id ? 'graph' : 'cream'}
              className={`character-card ${selectedChar === char.id ? 'selected' : ''}`}
              onClick={() => setSelectedChar(char.id === selectedChar ? null : char.id)}
            >
              <div className="character-card-header">
                <div>
                  <h3>{char.name || 'Unnamed Hero'}</h3>
                  <p className="character-subtitle">
                    Level {char.level || 1} {char.class || 'Unknown'}{char.isCurrent ? ' (Active)' : ''}
                  </p>
                </div>
                <div className="character-card-stats">
                  <span>HP: {char.hp?.current ?? '?'}/{char.hp?.max ?? '?'}</span>
                  <span>AC: {char.ac ?? '?'}</span>
                  <span>XP: {char.xp ?? 0}</span>
                </div>
              </div>

              {selectedChar === char.id && (
                <div className="character-card-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Play />}
                    onClick={(e) => { e.stopPropagation(); handleLoadCharacter(char); }}
                  >
                    Load & Play
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download />}
                    onClick={(e) => { e.stopPropagation(); handleExportCharacter(char); }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 />}
                    onClick={(e) => { e.stopPropagation(); handleDeleteCharacter(char.id); }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </PaperContainer>
          ))
        )}
      </div>
    </div>
  );
}

export default CharacterManager;
