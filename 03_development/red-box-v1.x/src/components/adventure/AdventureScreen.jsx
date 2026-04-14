/**
 * AdventureScreen.jsx
 * Legacy adventure screen — tutorial, goblin_warren, haunted_crypt
 *
 * Patched for Sprint 3 AdventureContext shape:
 *   - `adventure` is now the legacy adventure object OR null on fresh load.
 *   - `dungeonState` is the canonical state; currentRoomId, narrationHistory,
 *     isVictorious, isDefeated all live there.
 *   - `adventure.currentRoomId` → `dungeonState.currentRoomId`
 *   - `adventure.narrationHistory` → `dungeonState.narrationHistory`
 *   - `adventure.isVictorious`    → `dungeonState.isVictorious`
 *   - `adventure.isDefeated`      → `dungeonState.isDefeated`
 *
 * Everything else (MapDisplay, ActionPanel, NarrationPanel, CombatUI) is
 * unchanged — those components read from context directly.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useAdventure }  from '../../contexts/AdventureContext';
import NarrationPanel    from './NarrationPanel';
import MapDisplay        from './MapDisplay';
import ActionPanel       from './ActionPanel';
import Button            from '../common/Button';
import './AdventureScreen.css';

export function AdventureScreen() {
  const navigate = useNavigate();
  const { character, rest: restoreCharacter } = useCharacter();
  const {
    adventure,
    dungeonState,
    getCurrentRoom,
    addNarration,
    resetAdventure,
    setAdventure,
  } = useAdventure();

  const hasInitialized = useRef(false);
  const characterIdRef = useRef(null);

  // ── Pull state from dungeonState (Sprint 3 canonical location) ──────────
  const currentRoomId  = dungeonState?.currentRoomId  ?? null;
  const narrationLen   = dungeonState?.narrationHistory?.length ?? 0;
  const isVictorious   = dungeonState?.isVictorious   ?? false;
  const isDefeated     = dungeonState?.isDefeated     ?? false;

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Scroll to top when room changes
  useEffect(() => { window.scrollTo(0, 0); }, [currentRoomId]);

  // Guard: redirect to character creation if no character
  useEffect(() => {
    if (!character.isCreated) navigate('/character/create');
  }, [character.isCreated, navigate]);

  // Reset adventure when a NEW or DIFFERENT character is detected
  useEffect(() => {
    if (!character.isCreated) return;
    if (characterIdRef.current !== character.name) {
      characterIdRef.current = character.name;
      resetAdventure();
      restoreCharacter();
      hasInitialized.current = false;
    }
  }, [character.isCreated, character.name, resetAdventure, restoreCharacter]);

  // Add initial narration ONCE when entering a fresh adventure
  useEffect(() => {
    if (hasInitialized.current) return;
    if (narrationLen > 0) { hasInitialized.current = true; return; }
    if (!character.isCreated) return;

    const room = getCurrentRoom();
    if (room) {
      addNarration(room.description, 'room');
      addNarration('Your adventure begins! Explore the dungeon and defeat all monsters to win.', 'system');
      hasInitialized.current = true;
    }
  }, [narrationLen, character.isCreated, getCurrentRoom, addNarration]);

  // ── Outcome screens ───────────────────────────────────────────────────────
  if (isVictorious) return <VictoryScreen />;
  if (isDefeated)   return <DefeatScreen />;

  return (
    <div className="adventure-screen">
      <NarrationPanel />

      <div className="adventure-content">
        <div className="adventure-map-section">
          <MapDisplay />
        </div>
        <div className="adventure-action-section">
          <ActionPanel />
        </div>
      </div>

      <div className="adventure-footer">
        <Button
          variant="ghost"
          size="sm"
          icon={<Home size={16} />}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VictoryScreen
// ─────────────────────────────────────────────────────────────────────────────

function VictoryScreen() {
  const navigate = useNavigate();
  const { character, exportCharacter } = useCharacter();
  const { dungeonState, resetAdventure } = useAdventure();
  const [saved, setSaved] = useState(false);

  const defeatedCount  = dungeonState?.defeatedMonsters?.length  ?? 0;
  const collectedCount = dungeonState?.collectedTreasure?.length ?? 0;
  const visitedCount   = dungeonState?.visitedRooms?.[1]?.length ?? 0;

  return (
    <div className="adventure-screen victory-screen">
      <div className="victory-content">
        <div className="victory-header">
          <h1>🎉 Victory! 🎉</h1>
          <p className="victory-subtitle">You have completed the adventure!</p>
        </div>

        <div className="victory-stats">
          <div className="stat-item">
            <span className="stat-label">Character</span>
            <span className="stat-value number">{character.name}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Monsters Defeated</span>
            <span className="stat-value number">{defeatedCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Treasure Collected</span>
            <span className="stat-value number">{collectedCount} items</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rooms Explored</span>
            <span className="stat-value number">{visitedCount}</span>
          </div>
        </div>

        <div className="victory-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => { resetAdventure(); navigate('/adventure'); }}
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => { if (!saved) { exportCharacter(); setSaved(true); } }}
            disabled={saved}
          >
            {saved ? 'Character Saved!' : 'Save Character'}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DefeatScreen
// ─────────────────────────────────────────────────────────────────────────────

function DefeatScreen() {
  const navigate = useNavigate();
  const { resetAdventure } = useAdventure();

  return (
    <div className="adventure-screen defeat-screen">
      <div className="defeat-content">
        <div className="defeat-header">
          <h1>💀 Defeated</h1>
          <p className="defeat-subtitle">You have fallen in battle…</p>
        </div>
        <div className="defeat-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => { resetAdventure(); navigate('/adventure'); }}
          >
            Try Again
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdventureScreen;
