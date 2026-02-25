import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Swords } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useAdventure } from '../../contexts/AdventureContext';
import NarrationPanel from './NarrationPanel';
import MapDisplay from './MapDisplay';
import ActionPanel from './ActionPanel';
import Button from '../common/Button';
import './AdventureScreen.css';

/**
 * AdventureScreen - Main adventure gameplay screen
 * Layout: Narration (top) | Map (bottom-left) | Actions (bottom-right)
 */
export function AdventureScreen() {
  const navigate = useNavigate();
  const { character, rest: restoreCharacter } = useCharacter();
  const { adventure, getCurrentRoom, addNarration, resetAdventure } = useAdventure();
  const hasInitialized = useRef(false);
  const characterIdRef = useRef(null);
  
  // Scroll to top when adventure first loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Run once on mount
  
  // Scroll to top when room changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [adventure.currentRoomId]);
  
  // Check if player has a character
  useEffect(() => {
    if (!character.isCreated) {
      navigate('/character/create');
    }
  }, [character.isCreated, navigate]);
  
  // Reset adventure when entering with a NEW or DIFFERENT character
  useEffect(() => {
    if (character.isCreated) {
      // If this is a different character than last time, reset everything
      if (characterIdRef.current !== character.name) {
        characterIdRef.current = character.name;
        resetAdventure();
        restoreCharacter(); // Restore character to full HP and spells
        hasInitialized.current = false;
      }
    }
  }, [character.isCreated, character.name, resetAdventure, restoreCharacter]);
  
  // Add initial narration ONCE when entering a fresh adventure
  useEffect(() => {
    // Only run if not already initialized and no narration exists
    if (!hasInitialized.current && adventure.narrationHistory.length === 0 && character.isCreated) {
      const room = getCurrentRoom();
      if (room) {
        addNarration('room_description', room.description);
        addNarration('system_message', 'Your adventure begins! Explore the dungeon and defeat all monsters to win.');
        hasInitialized.current = true;
      }
    }
  }, [adventure.narrationHistory.length, character.isCreated, getCurrentRoom, addNarration]); // Add deps
  
  // Check for victory or defeat
  if (adventure.isVictorious) {
    return <VictoryScreen />;
  }
  
  if (adventure.isDefeated) {
    return <DefeatScreen />;
  }
  
  return (
    <div className="adventure-screen">
      {/* Narration Panel (top) */}
      <NarrationPanel />
      
      {/* Main Content Area */}
      <div className="adventure-content">
        {/* Map (left) */}
        <div className="adventure-map-section">
          <MapDisplay />
        </div>
        
        {/* Actions (right) */}
        <div className="adventure-action-section">
          <ActionPanel />
        </div>
      </div>
      
      {/* Footer */}
      <div className="adventure-footer">
        <Button
          variant="ghost"
          size="sm"
          icon={<Home />}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}

/**
 * VictoryScreen - Shown when player wins
 */
function VictoryScreen() {
  const navigate = useNavigate();
  const { character, addXP, exportCharacter } = useCharacter();
  const { adventure, resetAdventure } = useAdventure();
  const [saved, setSaved] = useState(false);
  
  // Don't award XP again (already awarded in combat)
  // Just display final stats
  
  const handleSaveCharacter = () => {
    // Export character to file
    exportCharacter();
    setSaved(true);
  };
  
  const handlePlayAgain = () => {
    // Reset adventure but keep character progress
    resetAdventure();
    navigate('/adventure');
  };
  
  return (
    <div className="adventure-screen victory-screen">
      <div className="victory-content">
        <div className="victory-header">
          <h1>🎉 Victory! 🎉</h1>
          <p className="victory-subtitle">
            You have completed "Your First Adventure"!
          </p>
        </div>
        
        <div className="victory-stats">
          <h2>Adventure Summary</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Monsters Defeated:</span>
              <span className="stat-value number">{adventure.defeatedMonsters.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rooms Explored:</span>
              <span className="stat-value number">{adventure.visitedRooms.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Final HP:</span>
              <span className="stat-value number">{character.hp.current}/{character.hp.max}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Gold Collected:</span>
              <span className="stat-value number">{character.gold} GP</span>
            </div>
          </div>
          
          <div className="character-progress">
            <h3>{character.name} - Level {character.level} {character.class}</h3>
            <div className="progress-detail">
              <span>Experience: {character.xp} XP</span>
              <span>Items: {character.inventory.length}</span>
            </div>
          </div>
        </div>
        
        <div className="victory-message">
          <p>
            Congratulations, {character.name}! You have proven yourself a capable adventurer.
            You've learned the basics of dungeon exploration, combat, and treasure hunting.
          </p>
          <p>
            Your character has been saved with all XP, gold, and items earned during this adventure.
            You can continue adventuring or save your character for future quests!
          </p>
        </div>
        
        <div className="victory-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveCharacter}
            disabled={saved}
          >
            {saved ? '✓ Character Saved!' : 'Save Character to File'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handlePlayAgain}
          >
            Play Tutorial Again
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {
              resetAdventure();
              navigate('/character/create');
            }}
          >
            Create New Character
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
        
        {saved && (
          <div className="save-confirmation">
            <p>✓ Character exported successfully! Your progress has been saved.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * DefeatScreen - Shown when player dies
 */
function DefeatScreen() {
  const navigate = useNavigate();
  const { character, heal, updateHP } = useCharacter();
  const { resetAdventure } = useAdventure();
  
  const handleTryAgain = () => {
    // Restore character to full HP FIRST
    updateHP(character.hp.max, character.hp.max);
    
    // Small delay to ensure HP is updated in state
    setTimeout(() => {
      // Reset adventure to beginning
      resetAdventure();
      
      // Navigate away and back to force component remount
      navigate('/');
      setTimeout(() => {
        navigate('/adventure');
      }, 100);
    }, 100);
  };
  
  return (
    <div className="adventure-screen defeat-screen">
      <div className="defeat-content">
        <div className="defeat-header">
          <h1>💀 Defeat 💀</h1>
          <p className="defeat-subtitle">
            {character.name} has fallen in the dungeon...
          </p>
        </div>
        
        <div className="defeat-message">
          <p>
            Your adventure has come to a tragic end. The dungeon has claimed another brave soul.
          </p>
          <p>
            But fear not! In the world of D&D, death is not always the end.
            You can try again with {character.name}, or create a new character!
          </p>
        </div>
        
        <div className="defeat-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleTryAgain}
          >
            Try Again (Restore {character.name})
          </Button>
          
          <Button
            variant="danger"
            onClick={() => {
              resetAdventure();
              navigate('/character/create');
            }}
          >
            Create New Character
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdventureScreen;
