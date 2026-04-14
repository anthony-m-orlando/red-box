/**
 * DungeonScreen.jsx
 * Universal dungeon exploration interface for all engine-native modules
 * (tutorial, quasqueton / B1, and all future modules).
 *
 * Receives the moduleId to launch via React Router location.state:
 *   navigate('/adventure', { state: { moduleId: 'tutorial' } })
 *
 * If no moduleId is supplied in location.state (e.g. direct URL navigation),
 * falls back to 'tutorial' so the game is always playable.
 *
 * Replaces AdventureScreen for all non-legacy modules.
 * AdventureRouter in App.jsx selects this vs. AdventureScreen via isLegacy().
 *
 * ─────────────────────────────────────────────────────────────────────
 * Layout (desktop):
 *   ┌─────────────────────────────────────────────────┐
 *   │  NARRATION PANEL  [collapse ▲]                  │  sticky top
 *   ├──────────────────────┬──────────────────────────┤
 *   │   DUNGEON MAP        │   TURN COUNTER           │
 *   │   (DungeonMap)       │   DUNGEON ACTIONS        │
 *   │                      │   (or CombatUI)          │
 *   └──────────────────────┴──────────────────────────┘
 */

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, ChevronUp, ChevronDown, Coins } from 'lucide-react';

import { useCharacter } from '../../contexts/CharacterContext';
import { useAdventure } from '../../contexts/AdventureContext';
import { useTown }       from '../../contexts/TownContext';

import { DungeonMap }     from './DungeonMap';
import { DungeonActions } from './DungeonActions';
import { TurnCounter }    from './TurnCounter';
import PaperContainer     from '../common/PaperContainer';
import CombatUI           from '../combat/CombatUI';

import * as SecretDoorResolver from '../../engine/SecretDoorResolver';

import './DungeonScreen.css';

// ─────────────────────────────────────────────────────────────────────────────
// DungeonScreen
// ─────────────────────────────────────────────────────────────────────────────

export function DungeonScreen() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { character, updateHP, updateGold, addItem, addXP, rest: restoreCharacter } = useCharacter();
  const adventure = useAdventure();
  const townCtx   = useTown();

  const {
    dungeonState,
    addNarration,
    startDungeon,
    resetAdventure,
    checkVictory,
    getCurrentRoom,
    getLivingMonsters,
    getUncollectedTreasure,
    getVisibleExits,
    getModule,
    triggerTempleLoop,
    descendStairs,
    ascendStairs,
    searchRoom,
    collectTreasure,
    defeatMonster,
    endCombat,
    startCombat,
  } = adventure;

  const {
    moduleId,
    currentRoomId,
    currentLevel,
    narrationHistory,
    inCombat,
    currentEnemy,
    wanderingMonsters,
    isVictorious,
    isDefeated,
  } = dungeonState;

  // ── UI state ─────────────────────────────────────────────────────────────
  const [narrationCollapsed, setNarrationCollapsed] = useState(false);
  const narrationScrollRef = useRef(null);
  const initRef            = useRef(false);
  const prevRoomRef        = useRef(null);
  const characterIdRef     = useRef(null);

  // ── Module to launch ─────────────────────────────────────────────────────
  // Read from React Router location.state (set by AdventureSelection)
  // Fall back to 'tutorial' so direct /adventure URL always works.
  const targetModuleId = location.state?.moduleId || 'tutorial';

  // ── Init: start the dungeon on first mount ───────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    if (!character.isCreated) {
      navigate('/character/create');
      return;
    }

    const characterChanged = characterIdRef.current !== null
      && characterIdRef.current !== character.name;

    characterIdRef.current = character.name;

    // Resume only if:
    //   1. There's a saved room
    //   2. The saved module matches what we're launching
    //   3. The saved run belongs to this same character
    //   4. Character hasn't changed since last mount
    const savedCharacterMatch = !dungeonState.characterName
      || dungeonState.characterName === character.name;

    const hasSave = !!currentRoomId
      && dungeonState.moduleId === targetModuleId
      && savedCharacterMatch
      && !characterChanged;

    if (hasSave) {
      initRef.current = true;
      return;
    }

    // Fresh start — clear any stale save first, restore character to full HP/spells
    resetAdventure();
    restoreCharacter();
    startDungeon(targetModuleId, character);
    initRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-scroll narration ────────────────────────────────────────────────
  useEffect(() => {
    if (narrationScrollRef.current && !narrationCollapsed) {
      narrationScrollRef.current.scrollTop =
        narrationScrollRef.current.scrollHeight;
    }
  }, [narrationHistory.length, narrationCollapsed]);

  // ── Post-entry pipeline ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentRoomId || currentRoomId === prevRoomRef.current) return;
    prevRoomRef.current = currentRoomId;

    const mod = getModule();
    if (!mod) return;

    // Elf passive secret-door detection
    if (character.class?.toLowerCase() === 'elf') {
      const result = SecretDoorResolver.resolveElfPassiveDetection(
        mod, dungeonState, currentLevel, currentRoomId
      );
      if (result.found.length > 0) {
        adventure.dispatch({
          type: adventure.ACTIONS.SEARCH_ROOM,
          payload: {
            statePatch: {
              discoveredSecretDoors: [
                ...(dungeonState.discoveredSecretDoors || []),
                ...result.found,
              ],
              searchedRooms: dungeonState.searchedRooms,
              detectedTraps: dungeonState.detectedTraps,
            },
            narrationLines: result.narration,
            turnPatch: {},
          },
        });
      }
    }

    checkVictory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoomId]);

  // ── Victory: award XP (navigation handled by the Return button) ──────────
  useEffect(() => {
    if (!isVictorious) return;
    const xp = adventure.getRunXP();
    if (xp > 0) addXP(xp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVictorious]);

  // ── Defeat: temple loop or reset ────────────────────────────────────────
  useEffect(() => {
    if (!isDefeated) return;
    const living = townCtx?.getLivingHirelings?.() || [];
    if (living.length > 0) {
      const t = setTimeout(() => {
        triggerTempleLoop({
          character,
          updateGold,
          updateHP,
          getLivingHirelings:        townCtx.getLivingHirelings,
          dismissHireling:           townCtx.dismissHireling,
          triggerTempleResurrection: townCtx.triggerTempleResurrection,
        });
      }, 300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { resetAdventure(); navigate('/town'); }, 4000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDefeated]);

  // ── Post-combat victory check ─────────────────────────────────────────────
  // Runs whenever inCombat transitions to false — state is fresh here,
  // so checkVictory sees the correct defeatedMonsters list.
  const prevInCombatRef = useRef(false);
  useEffect(() => {
    const wasInCombat = prevInCombatRef.current;
    prevInCombatRef.current = inCombat;
    // Only check when transitioning OUT of combat (not on initial mount)
    if (wasInCombat && !inCombat && !isVictorious) {
      checkVictory();
    }
  }, [inCombat]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ────────────────────────────────────────────────────────
  const currentRoom    = getCurrentRoom();
  const livingMonsters = useMemo(() => getLivingMonsters(),      [dungeonState]);
  const treasure       = useMemo(() => getUncollectedTreasure(), [dungeonState]);
  const visibleExits   = useMemo(() => getVisibleExits(),        [dungeonState]);

  const activeEnemy = useMemo(() => {
    if (!inCombat) return null;
    if (currentEnemy) return currentEnemy;
    if (wanderingMonsters?.length) return wanderingMonsters[0];
    if (livingMonsters.length)     return livingMonsters[0];
    return null;
  }, [inCombat, currentEnemy, wanderingMonsters, livingMonsters]);

  // Is this a multi-level module? (tutorial is single-level — hide tab)
  const mod        = getModule();
  const isMultiLevel = mod ? Object.keys(mod.rooms || {}).length > 1 : false;

  // ── Combat callbacks ──────────────────────────────────────────────────────
  const handleCombatVictory = useCallback((enemyInstanceId, xpEarned) => {
    defeatMonster(enemyInstanceId, xpEarned);
    if (xpEarned > 0) addXP(xpEarned);
    // Note: victory check now handled by the inCombat useEffect above
  }, [defeatMonster, addXP]);

  const handleCombatDefeat = useCallback(() => {
    adventure.dispatch({ type: adventure.ACTIONS.SET_DEFEATED });
  }, [adventure]);

  const handleCollectTreasure = useCallback((treasureObj) => {
    collectTreasure(treasureObj, updateGold, addItem);
  }, [collectTreasure, updateGold, addItem]);

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!character.isCreated) return null;

  // ── Victory overlay ───────────────────────────────────────────────────────
  if (isVictorious) {
    const xpEarned = adventure.getRunXP();
    const handleReturnToThreshold = () => {
      resetAdventure();
      navigate('/town');
    };
    return (
      <div className="dungeon-screen dungeon-screen--outcome">
        <div className="dungeon-outcome dungeon-outcome--victory">
          <div className="outcome-inner">
            <h1 className="outcome-title">Victory!</h1>
            <p className="outcome-flavor">
              {moduleId === 'tutorial'
                ? 'You have completed your first adventure. The dungeon is cleared!'
                : 'You have escaped alive. Songs will be sung of your deeds.'}
            </p>
            {xpEarned > 0 && (
              <p className="outcome-sub">+{xpEarned} XP earned</p>
            )}
            <button
              className="outcome-btn"
              onClick={handleReturnToThreshold}
              style={{
                marginTop: '1.5rem',
                padding: '10px 28px',
                fontFamily: 'var(--font-numbers)',
                fontSize: '0.85rem',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'var(--ink-brown)',
                color: 'var(--paper-cream)',
                border: '2px solid var(--border-dark)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Return to Threshold →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Defeat overlay ────────────────────────────────────────────────────────
  if (isDefeated) {
    const hasHirelings = (townCtx?.getLivingHirelings?.() || []).length > 0;
    return (
      <div className="dungeon-screen dungeon-screen--outcome">
        <div className="dungeon-outcome dungeon-outcome--defeat">
          <div className="outcome-inner">
            <h1 className="outcome-title">Defeated…</h1>
            <p className="outcome-flavor">
              {hasHirelings
                ? 'Your hireling drags your unconscious body to safety…'
                : 'Your lifeless form lies in the darkness…'}
            </p>
            <p className="outcome-sub">Returning to Threshold…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="dungeon-screen">

      {/* Narration panel */}
      <div className={`dungeon-screen__narration ${narrationCollapsed ? 'dungeon-screen__narration--collapsed' : ''}`}>
        <PaperContainer variant="lined" padding="none" className="dungeon-screen__narration-paper">
          <div className="dungeon-screen__narration-header">
            <div className="dungeon-screen__narration-title">
              <BookOpen size={16} aria-hidden="true" />
              <span>Dungeon Master</span>
            </div>
            <button
              className="dungeon-screen__collapse-btn"
              onClick={() => setNarrationCollapsed(c => !c)}
              aria-label={narrationCollapsed ? 'Expand narration' : 'Collapse narration'}
            >
              {narrationCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          {!narrationCollapsed && (
            <div className="dungeon-screen__narration-scroll" ref={narrationScrollRef}>
              {narrationHistory.length === 0 ? (
                <p className="dungeon-screen__narration-empty">Your adventure awaits…</p>
              ) : (
                <div className="dungeon-screen__narration-entries">
                  {narrationHistory.map((entry, i) => (
                    <NarrationEntry key={`${entry.timestamp ?? i}-${i}`} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          )}

          {narrationCollapsed && narrationHistory.length > 0 && (
            <div className="dungeon-screen__narration-preview">
              <NarrationEntry entry={narrationHistory[narrationHistory.length - 1]} preview />
            </div>
          )}
        </PaperContainer>
      </div>

      {/* Map + actions */}
      <div className="dungeon-screen__body">
        <div className="dungeon-screen__map-col">
          <DungeonMap
            dungeonState={dungeonState}
            onEnterRoom={(roomId, level) => enterRoom(roomId, level)}
            onDescend={descendStairs}
            onAscend={ascendStairs}
            compact={false}
          />
        </div>
        <div className="dungeon-screen__actions-col">
          <TurnCounter />
          {/* Character stats always visible — in combat and out */}
          <CharacterStatusBar character={character} />
          {inCombat && activeEnemy ? (
            <CombatUI
              enemy={activeEnemy}
              onVictory={handleCombatVictory}
              onDefeat={handleCombatDefeat}
              character={character}
            />
          ) : (
            <DungeonActions
              currentRoom={currentRoom}
              livingMonsters={livingMonsters}
              treasure={treasure}
              visibleExits={visibleExits}
              character={character}
              onCollectTreasure={handleCollectTreasure}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NarrationEntry
// ─────────────────────────────────────────────────────────────────────────────

const ENTRY_STYLE_MAP = {
  // Sprint 3 types
  room:    'entry--room',
  dm:      'entry--dm',
  combat:  'entry--combat',
  action:  'entry--action',
  system:  'entry--system',
  danger:  'entry--danger',
  treasure:'entry--treasure',
  // Legacy CombatUI styles (in case any slip through unnormalised)
  room_description: 'entry--room',
  combat_action:    'entry--combat',
  system_message:   'entry--system',
  dm_note:          'entry--dm',
  dialogue:         'entry--system',
};

function NarrationEntry({ entry, preview = false }) {
  const cls = ENTRY_STYLE_MAP[entry.type] || 'entry--system';
  return (
    <div className={`narration-entry ${cls} ${preview ? 'narration-entry--preview' : ''}`}>
      <p className="narration-entry__text">{entry.text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CharacterStatusBar — always visible, shown above CombatUI and DungeonActions
// ─────────────────────────────────────────────────────────────────────────────

function CharacterStatusBar({ character }) {
  const hpPct = character.hp?.max > 0
    ? Math.max(0, Math.min(100, (character.hp.current / character.hp.max) * 100))
    : 100;
  const hpClass = hpPct > 50 ? 'hp-bar--healthy'
                : hpPct > 25 ? 'hp-bar--wounded'
                : 'hp-bar--critical';
  return (
    <div className="dungeon-screen__char-bar">
      <div className="dungeon-screen__char-name">{character.name}</div>
      <div className="dungeon-screen__char-hp-row">
        <div className="dungeon-screen__char-hp-track">
          <div className={`dungeon-screen__char-hp-fill ${hpClass}`}
            style={{ width: `${hpPct}%` }} />
        </div>
        <span className="dungeon-screen__char-hp-label">
          {character.hp?.current ?? '?'}/{character.hp?.max ?? '?'} HP
        </span>
      </div>
      <div className="dungeon-screen__char-meta">
        <span>AC {character.ac ?? '?'}</span>
        <span className="dungeon-screen__char-class">{character.class}</span>
        <span className="dungeon-screen__char-gold">
          <Coins size={11} aria-hidden="true" /> {character.gold ?? 0} gp
        </span>
      </div>
    </div>
  );
}

export default DungeonScreen;
