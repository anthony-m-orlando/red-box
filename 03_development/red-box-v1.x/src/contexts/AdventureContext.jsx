/**
 * AdventureContext.jsx
 * v1.0.0 — B1 Engine Refactor
 *
 * Manages all dungeon adventure state.
 * Delegates dungeon logic to the DungeonEngine service layer.
 * Backward-compatible: legacy adventures (tutorial, goblin_warren, haunted_crypt)
 * continue to work via the registry shim.
 *
 * ─────────────────────────────────────────────────────────────────────
 * ARCHITECTURE RULES:
 *   - This context owns state and the save/load cycle.
 *   - DungeonEngine answers questions about state (pure functions).
 *   - TurnTracker, SecretDoorResolver, WanderingMonsters are called
 *     here and their returned patches applied to state.
 *   - No dungeon logic lives inline in this file — only orchestration.
 *
 * STATE SHAPE:
 *   adventure          ← the flat adventure object (legacy modules)
 *   dungeonState       ← the level-aware B1 state object
 *   The reducer handles both; which fields are active depends on moduleId.
 *
 * TEMPLE LOOP (preserved from v0.1.x):
 *   triggerTempleLoop(args) → 15% tithe → restore HP → dismiss first
 *   living hireling → triggerTempleResurrection() → RESET_ADVENTURE
 *   → navigate('/town')
 *   CombatUI calls this when getLivingHirelings().length > 0 on defeat.
 * ─────────────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';

// ── Engine imports ─────────────────────────────────────────────────────────
import * as DungeonEngine from '../engine/DungeonEngine';
import * as TurnTracker   from '../engine/TurnTracker';
import * as SecretDoorResolver from '../engine/SecretDoorResolver';
import * as WanderingMonsters  from '../engine/WanderingMonsters';
import { getModuleById, isLegacyModule } from '../data/dungeons/registry';

// ── Storage key ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'rpg-adventure-state';
const SAVE_DEBOUNCE_MS = 600;

// ─────────────────────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_DUNGEON_STATE = {
  moduleId: null,
  currentLevel: 1,
  currentRoomId: null,
  previousRoomId: null,

  roomStates: { 1: {}, 2: {} },
  visitedRooms: { 1: [], 2: [] },
  defeatedMonsters: [],
  collectedTreasure: [],
  searchedRooms: [],
  discoveredSecretDoors: [],
  detectedTraps: [],
  triggeredTraps: [],
  revealedFeatures: [],
  revealedMapRooms: [],        // rooms revealed by stone map / war map features

  wanderingMonsters: [],       // ephemeral instances during wandering encounter
  wanderingMonsterDue: false,

  turnCount: 0,
  hasLight: false,
  lightSource: null,
  lightDuration: 0,

  inCombat: false,
  currentEnemy: null,
  combatLog: [],
  hasRested: false,

  narrationHistory: [],

  isVictorious: false,
  isDefeated: false,

  // Special room one-time flags
  usedShrine: false,           // q1_27 cleric shrine
  usedThroneTrick: false,      // q1_16 mage throne Detect Magic
  usedHealingSpring: false,    // q2_5 deep spring
};

const INITIAL_STATE = {
  // Legacy flat adventure (tutorial / goblin warren / haunted crypt)
  adventure: null,

  // B1-style level-aware dungeon state
  dungeonState: { ...INITIAL_DUNGEON_STATE },

  // Shared UI state
  isLoading: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Action Types
// ─────────────────────────────────────────────────────────────────────────────

export const ACTIONS = {
  // Lifecycle
  SET_ADVENTURE:        'SET_ADVENTURE',
  RESET_ADVENTURE:      'RESET_ADVENTURE',
  START_DUNGEON:        'START_DUNGEON',

  // Navigation
  ENTER_ROOM:           'ENTER_ROOM',
  DESCEND_STAIRS:       'DESCEND_STAIRS',
  ASCEND_STAIRS:        'ASCEND_STAIRS',

  // Exploration
  SEARCH_ROOM:          'SEARCH_ROOM',
  COLLECT_TREASURE:     'COLLECT_TREASURE',
  TRIGGER_TRAP:         'TRIGGER_TRAP',
  DETECT_TRAP:          'DETECT_TRAP',
  USE_FEATURE:          'USE_FEATURE',
  REVEAL_MAP:           'REVEAL_MAP',

  // Light
  LIGHT_SOURCE:         'LIGHT_SOURCE',
  EXTINGUISH_LIGHT:     'EXTINGUISH_LIGHT',

  // Turn / wandering monsters
  ADVANCE_TURN:         'ADVANCE_TURN',
  SPAWN_WANDERING_MONSTER: 'SPAWN_WANDERING_MONSTER',
  CLEAR_WANDERING_MONSTER: 'CLEAR_WANDERING_MONSTER',

  // Combat
  START_COMBAT:         'START_COMBAT',
  END_COMBAT:           'END_COMBAT',
  DEFEAT_MONSTER:       'DEFEAT_MONSTER',
  ADD_COMBAT_LOG:       'ADD_COMBAT_LOG',

  // Rest
  REST:                 'REST',

  // Narration
  ADD_NARRATION:        'ADD_NARRATION',
  CLEAR_NARRATION:      'CLEAR_NARRATION',

  // Outcome
  SET_VICTORIOUS:       'SET_VICTORIOUS',
  SET_DEFEATED:         'SET_DEFEATED',
};

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

function adventureReducer(state, action) {
  const { type, payload } = action;

  switch (type) {

    // ── Lifecycle ────────────────────────────────────────────────────────────

    case ACTIONS.SET_ADVENTURE: {
      // Legacy flat adventure (tutorial path)
      const adventure = payload.adventure;
      const startRoomId = adventure.startingRoomId || adventure.startingRoom;
      const rooms = adventure.rooms || {};
      const initialRoomStates = {};
      Object.keys(rooms).forEach(id => {
        initialRoomStates[id] = id === startRoomId ? 'entered' : 'unexplored';
      });

      return {
        ...state,
        adventure,
        dungeonState: {
          ...INITIAL_DUNGEON_STATE,
          moduleId: adventure.id,
          currentLevel: 1,
          currentRoomId: startRoomId,
          // Legacy flat roomStates — engine shim handles level wrapping
          roomStates: { 1: initialRoomStates, 2: {} },
          visitedRooms: { 1: [startRoomId], 2: [] },
          hasLight: payload.hasLight ?? true,
          lightSource: payload.lightSource ?? 'torch',
          lightDuration: payload.lightDuration ?? 6,
        },
      };
    }

    case ACTIONS.START_DUNGEON: {
      // B1 (or any registry module) start
      const { moduleId, startRoomId, startLevel, hasLight, lightSource, lightDuration, characterName } = payload;
      const mod = getModuleById(moduleId);
      if (!mod) return state;

      // Pre-populate roomStates for all rooms on both levels
      const roomStates = { 1: {}, 2: {} };
      for (const level of [1, 2]) {
        const levelRooms = mod.rooms?.[level] || {};
        Object.keys(levelRooms).forEach(id => {
          roomStates[level][id] = id === startRoomId && level === startLevel
            ? 'entered'
            : 'unexplored';
        });
      }

      return {
        ...state,
        adventure: null,   // B1 doesn't use legacy adventure object
        dungeonState: {
          ...INITIAL_DUNGEON_STATE,
          moduleId,
          characterName: characterName ?? null,  // for save-resume validation
          currentLevel: startLevel ?? 1,
          currentRoomId: startRoomId,
          roomStates,
          visitedRooms: {
            1: startLevel === 1 ? [startRoomId] : [],
            2: startLevel === 2 ? [startRoomId] : [],
          },
          hasLight: hasLight ?? true,
          lightSource: lightSource ?? 'torch',
          lightDuration: lightDuration ?? 6,
        },
      };
    }

    case ACTIONS.RESET_ADVENTURE: {
      return {
        ...INITIAL_STATE,
        isLoading: false,
      };
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    case ACTIONS.ENTER_ROOM: {
      const { roomId, level, narration, turnPatch, lightExpired, torchExtinguished } = payload;
      const ds = state.dungeonState;

      // Room state transition
      const currentRoomState = ds.roomStates[level]?.[roomId] || 'unexplored';
      const newRoomState = currentRoomState === 'unexplored' ? 'entered' : currentRoomState;

      const newRoomStates = {
        ...ds.roomStates,
        [level]: {
          ...ds.roomStates[level],
          [roomId]: newRoomState,
        },
      };

      // Visited rooms
      const alreadyVisited = (ds.visitedRooms[level] || []).includes(roomId);
      const newVisitedRooms = alreadyVisited
        ? ds.visitedRooms
        : {
            ...ds.visitedRooms,
            [level]: [...(ds.visitedRooms[level] || []), roomId],
          };

      // Narration
      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'room', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          currentLevel: level,
          currentRoomId: roomId,
          previousRoomId: ds.currentRoomId,
          roomStates: newRoomStates,
          visitedRooms: newVisitedRooms,
          narrationHistory: newNarration,
          // Apply turn + light patches from TurnTracker
          ...(turnPatch || {}),
          // Explicit overrides for extinguish events
          ...(lightExpired ? { hasLight: false, lightSource: null, lightDuration: 0 } : {}),
        },
      };
    }

    case ACTIONS.DESCEND_STAIRS: {
      const { targetLevel, targetRoomId, narration, turnPatch } = payload;
      const ds = state.dungeonState;

      const newRoomStates = {
        ...ds.roomStates,
        [targetLevel]: {
          ...(ds.roomStates[targetLevel] || {}),
          [targetRoomId]: 'entered',
        },
      };

      const alreadyVisited = (ds.visitedRooms[targetLevel] || []).includes(targetRoomId);
      const newVisitedRooms = alreadyVisited
        ? ds.visitedRooms
        : {
            ...ds.visitedRooms,
            [targetLevel]: [...(ds.visitedRooms[targetLevel] || []), targetRoomId],
          };

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'system', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          currentLevel: targetLevel,
          currentRoomId: targetRoomId,
          previousRoomId: ds.currentRoomId,
          roomStates: newRoomStates,
          visitedRooms: newVisitedRooms,
          narrationHistory: newNarration,
          ...(turnPatch || {}),
        },
      };
    }

    case ACTIONS.ASCEND_STAIRS: {
      // Same structure as DESCEND_STAIRS — kept separate for clarity
      const { targetLevel, targetRoomId, narration, turnPatch } = payload;
      const ds = state.dungeonState;

      const newRoomStates = {
        ...ds.roomStates,
        [targetLevel]: {
          ...(ds.roomStates[targetLevel] || {}),
          [targetRoomId]: ds.roomStates[targetLevel]?.[targetRoomId] || 'entered',
        },
      };

      const alreadyVisited = (ds.visitedRooms[targetLevel] || []).includes(targetRoomId);
      const newVisitedRooms = alreadyVisited
        ? ds.visitedRooms
        : {
            ...ds.visitedRooms,
            [targetLevel]: [...(ds.visitedRooms[targetLevel] || []), targetRoomId],
          };

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'system', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          currentLevel: targetLevel,
          currentRoomId: targetRoomId,
          previousRoomId: ds.currentRoomId,
          roomStates: newRoomStates,
          visitedRooms: newVisitedRooms,
          narrationHistory: newNarration,
          ...(turnPatch || {}),
        },
      };
    }

    // ── Exploration ──────────────────────────────────────────────────────────

    case ACTIONS.SEARCH_ROOM: {
      const { statePatch, narrationLines, turnPatch } = payload;
      const ds = state.dungeonState;

      const newNarration = [
        ...ds.narrationHistory,
        ...narrationLines.map(text => ({ type: 'action', text, timestamp: Date.now() })),
      ];

      return {
        ...state,
        dungeonState: {
          ...ds,
          ...statePatch,
          narrationHistory: newNarration,
          ...(turnPatch || {}),
        },
      };
    }

    case ACTIONS.COLLECT_TREASURE: {
      const { treasureId, goldAmount, items, narration } = payload;
      const ds = state.dungeonState;

      const newCollected = [...new Set([...ds.collectedTreasure, treasureId])];

      // Update room state to 'looted' if all treasure collected
      // (DungeonScreen will check after dispatch and fire MARK_LOOTED if needed)
      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'treasure', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          collectedTreasure: newCollected,
          narrationHistory: newNarration,
        },
      };
    }

    case ACTIONS.TRIGGER_TRAP: {
      const { trapId, narration } = payload;
      const ds = state.dungeonState;

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'danger', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          triggeredTraps: [...new Set([...ds.triggeredTraps, trapId])],
          narrationHistory: newNarration,
        },
      };
    }

    case ACTIONS.DETECT_TRAP: {
      const { trapId } = payload;
      const ds = state.dungeonState;
      return {
        ...state,
        dungeonState: {
          ...ds,
          detectedTraps: [...new Set([...ds.detectedTraps, trapId])],
        },
      };
    }

    case ACTIONS.USE_FEATURE: {
      const { featureId, narration } = payload;
      const ds = state.dungeonState;

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'dm', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      // Track one-time feature flags
      const featureFlags = {};
      if (featureId === 'q1_27_altar')    featureFlags.usedShrine = true;
      if (featureId === 'q1_16_thrones')  featureFlags.usedThroneTrick = true;
      if (featureId === 'q2_5_spring')    featureFlags.usedHealingSpring = true;

      return {
        ...state,
        dungeonState: {
          ...ds,
          revealedFeatures: [...new Set([...ds.revealedFeatures, featureId])],
          narrationHistory: newNarration,
          ...featureFlags,
        },
      };
    }

    case ACTIONS.REVEAL_MAP: {
      // Stone map / war map reveal — adds all rooms of a level to revealedMapRooms
      const { roomIds } = payload;
      const ds = state.dungeonState;
      return {
        ...state,
        dungeonState: {
          ...ds,
          revealedMapRooms: [...new Set([...ds.revealedMapRooms, ...roomIds])],
        },
      };
    }

    // ── Light ─────────────────────────────────────────────────────────────────

    case ACTIONS.LIGHT_SOURCE: {
      const { sourceType } = payload;
      const patch = TurnTracker.lightSource(state.dungeonState, sourceType);
      return {
        ...state,
        dungeonState: { ...state.dungeonState, ...patch },
      };
    }

    case ACTIONS.EXTINGUISH_LIGHT: {
      const patch = TurnTracker.extinguishLight();
      return {
        ...state,
        dungeonState: { ...state.dungeonState, ...patch },
      };
    }

    // ── Turn / Wandering Monsters ─────────────────────────────────────────────

    case ACTIONS.ADVANCE_TURN: {
      const { turns = 1, inWindCorridor = false } = payload || {};
      const { statePatch } = TurnTracker.advanceTurns(
        state.dungeonState, turns, { inWindCorridor }
      );
      return {
        ...state,
        dungeonState: { ...state.dungeonState, ...statePatch },
      };
    }

    case ACTIONS.SPAWN_WANDERING_MONSTER: {
      const { instances, narration } = payload;
      const ds = state.dungeonState;

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'danger', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          wanderingMonsters: instances,
          wanderingMonsterDue: false,
          inCombat: true,
          currentEnemy: instances[0] || null,
          narrationHistory: newNarration,
        },
      };
    }

    case ACTIONS.CLEAR_WANDERING_MONSTER: {
      return {
        ...state,
        dungeonState: {
          ...state.dungeonState,
          wanderingMonsters: [],
          wanderingMonsterDue: false,
        },
      };
    }

    // ── Combat ────────────────────────────────────────────────────────────────

    case ACTIONS.START_COMBAT: {
      const { enemy, narration } = payload;
      const ds = state.dungeonState;

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'combat', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          inCombat: true,
          currentEnemy: enemy,
          combatLog: [],
          narrationHistory: newNarration,
        },
      };
    }

    case ACTIONS.END_COMBAT: {
      const { victory, narration, xpEarned } = payload;
      const ds = state.dungeonState;

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'combat', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      // If room is now clear, update its state
      const level = ds.currentLevel;
      const roomId = ds.currentRoomId;
      const newRoomStates = victory
        ? {
            ...ds.roomStates,
            [level]: {
              ...ds.roomStates[level],
              [roomId]: 'cleared',
            },
          }
        : ds.roomStates;

      return {
        ...state,
        dungeonState: {
          ...ds,
          inCombat: false,
          currentEnemy: null,
          wanderingMonsters: [],
          roomStates: newRoomStates,
          narrationHistory: newNarration,
        },
      };
    }

    case ACTIONS.DEFEAT_MONSTER: {
      const { instanceId, narration, xp } = payload;
      const ds = state.dungeonState;

      const newDefeated = [...new Set([...ds.defeatedMonsters, instanceId])];

      // Update monster HP in wanderingMonsters array (if it's a wandering monster)
      const newWandering = ds.wanderingMonsters.map(m =>
        m.instanceId === instanceId ? { ...m, isDefeated: true } : m
      );

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'combat', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          defeatedMonsters: newDefeated,
          wanderingMonsters: newWandering,
          narrationHistory: newNarration,
        },
      };
    }

    case ACTIONS.ADD_COMBAT_LOG: {
      const { entry } = payload;
      const ds = state.dungeonState;
      return {
        ...state,
        dungeonState: {
          ...ds,
          combatLog: [...ds.combatLog, entry],
        },
      };
    }

    // ── Rest ──────────────────────────────────────────────────────────────────

    case ACTIONS.REST: {
      const { turnPatch, narration } = payload;
      const ds = state.dungeonState;

      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'system', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;

      return {
        ...state,
        dungeonState: {
          ...ds,
          hasRested: true,
          narrationHistory: newNarration,
          ...(turnPatch || {}),
        },
      };
    }

    // ── Narration ─────────────────────────────────────────────────────────────

    case ACTIONS.ADD_NARRATION: {
      const { text, style = 'dm' } = payload;
      const ds = state.dungeonState;
      return {
        ...state,
        dungeonState: {
          ...ds,
          narrationHistory: [
            ...ds.narrationHistory,
            { type: style, text, timestamp: Date.now() },
          ],
        },
      };
    }

    case ACTIONS.CLEAR_NARRATION: {
      return {
        ...state,
        dungeonState: {
          ...state.dungeonState,
          narrationHistory: [],
        },
      };
    }

    // ── Outcome ───────────────────────────────────────────────────────────────

    case ACTIONS.SET_VICTORIOUS: {
      const { narration } = payload || {};
      const ds = state.dungeonState;
      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'system', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;
      return {
        ...state,
        dungeonState: { ...ds, isVictorious: true, narrationHistory: newNarration },
      };
    }

    case ACTIONS.SET_DEFEATED: {
      const { narration } = payload || {};
      const ds = state.dungeonState;
      const newNarration = narration
        ? [...ds.narrationHistory, { type: 'danger', text: narration, timestamp: Date.now() }]
        : ds.narrationHistory;
      return {
        ...state,
        dungeonState: { ...ds, isDefeated: true, narrationHistory: newNarration },
      };
    }

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AdventureContext = createContext(null);

export function AdventureProvider({ children }) {
  const navigate = useNavigate();

  // ── Load persisted state ────────────────────────────────────────────────
  const loadInitialState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const savedDs = saved.dungeonState || {};

        // On reload, always clear volatile combat/wandering state.
        // If the player was mid-combat when they closed the browser,
        // restart them in the room with monsters still alive but no active combat.
        // This prevents being permanently locked in CombatUI on reload.
        const cleanDungeonState = {
          ...INITIAL_DUNGEON_STATE,
          ...savedDs,
          // Clear volatile runtime state
          inCombat:              false,
          currentEnemy:          null,
          combatLog:             [],
          wanderingMonsters:     [],
          wanderingMonsterDue:   false,
        };

        return {
          ...INITIAL_STATE,
          ...saved,
          dungeonState: cleanDungeonState,
        };
      }
    } catch (e) {
      console.warn('[AdventureContext] Failed to load saved state:', e);
    }
    return INITIAL_STATE;
  };

  const [state, dispatch] = useReducer(adventureReducer, undefined, loadInitialState);

  // ── Debounced save ──────────────────────────────────────────────────────
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('[AdventureContext] Save failed:', e);
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [state]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Get the active module (null for legacy adventures that predate engine). */
  const getModule = useCallback(() => {
    const { moduleId } = state.dungeonState;
    if (!moduleId) return null;
    return getModuleById(moduleId);
  }, [state.dungeonState.moduleId]);

  /** True if running a legacy adventure (tutorial etc.) */
  const isLegacy = useCallback(() => {
    const { moduleId } = state.dungeonState;
    return !moduleId || isLegacyModule(moduleId);
  }, [state.dungeonState.moduleId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Narration Style Normaliser
  // Maps legacy style names → Sprint 3 type names for NarrationEntry
  // ─────────────────────────────────────────────────────────────────────────

  function normaliseStyle(s) {
    const map = {
      room_description: 'room',
      combat_action:    'combat',
      system_message:   'system',
      dm_note:          'dm',
      dialogue:         'system',
    };
    return map[s] ?? s ?? 'dm';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Action Creators
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start a B1 (engine-native) dungeon run.
   * @param {string} moduleId
   * @param {object} character — from CharacterContext
   */
  const startDungeon = useCallback((moduleId, character) => {
    const mod = getModuleById(moduleId);
    if (!mod) {
      console.error(`[AdventureContext] Module not found: ${moduleId}`);
      return;
    }

    const lightPatch = TurnTracker.initializeLightForCharacter(
      character?.class,
      character?.inventory || []
    );

    dispatch({
      type: ACTIONS.START_DUNGEON,
      payload: {
        moduleId,
        characterName: character?.name ?? null,
        startRoomId: mod.entryRoomId,
        startLevel: mod.entryLevel ?? 1,
        ...lightPatch,
      },
    });

    // Narrate the entry
    const entryRoom = mod.rooms?.[mod.entryLevel ?? 1]?.[mod.entryRoomId];
    if (entryRoom) {
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: {
          text: DungeonEngine.buildRoomNarration(entryRoom, lightPatch.hasLight, true),
          style: 'room',
        },
      });
    }
  }, []);

  /**
   * Start a legacy flat adventure.
   * @param {object} adventure — legacy adventure object
   * @param {object} character
   */
  const setAdventure = useCallback((adventure, character) => {
    const lightPatch = TurnTracker.initializeLightForCharacter(
      character?.class,
      character?.inventory || []
    );
    dispatch({
      type: ACTIONS.SET_ADVENTURE,
      payload: { adventure, ...lightPatch },
    });
  }, []);

  /** Reset all adventure state and clear saved progress. */
  const resetAdventure = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_ADVENTURE });
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }, []);

  /**
   * Move to a room.
   * Handles: movement gating, turn advancement, light consumption,
   * wind corridor hazard, elf passive detection, auto-combat trigger,
   * auto-triggering environmental hazards, map reveal features.
   *
   * @param {string} targetRoomId
   * @param {number} [targetLevel] — defaults to current level
   */
  const enterRoom = useCallback((targetRoomId, targetLevel) => {
    const ds = state.dungeonState;
    const mod = getModule();
    const level = targetLevel ?? ds.currentLevel;

    if (!mod) {
      // Legacy path — simple dispatch
      dispatch({
        type: ACTIONS.ENTER_ROOM,
        payload: { roomId: targetRoomId, level: 1, narration: null },
      });
      return;
    }

    // Gate check
    const gate = DungeonEngine.canEnterRoom(mod, ds, level, targetRoomId, ds.currentRoomId);
    if (!gate.allowed) {
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: { text: gate.reason, style: 'system' },
      });
      return;
    }

    const targetRoom = DungeonEngine.getRoom(mod, level, targetRoomId);
    const isFirstVisit = !(ds.visitedRooms[level] || []).includes(targetRoomId);
    const inWindCorridor = targetRoom?.windEffect === true;

    // Advance turn (1 per room move)
    const { statePatch: turnPatch, events: turnEvents } = TurnTracker.advanceTurns(
      ds, 1, { inWindCorridor }
    );

    // Build narration
    const narration = DungeonEngine.buildRoomNarration(
      targetRoom,
      turnEvents.lightExpired ? false : ds.hasLight,
      isFirstVisit
    );

    dispatch({
      type: ACTIONS.ENTER_ROOM,
      payload: {
        roomId: targetRoomId,
        level,
        narration,
        turnPatch,
        lightExpired: turnEvents.lightExpired,
        torchExtinguished: turnEvents.torchExtinguished,
      },
    });

    // Post-entry effects (fire in sequence after state settles)
    setTimeout(() => {
      _postEntryEffects(targetRoomId, level, targetRoom, isFirstVisit, turnEvents);
    }, 0);
  }, [state.dungeonState, getModule]);

  /**
   * Handle all post-entry side effects.
   * Called via setTimeout to run after the ENTER_ROOM dispatch commits.
   */
  const _postEntryEffects = useCallback((roomId, level, room, isFirstVisit, turnEvents) => {
    const ds = state.dungeonState;
    const mod = getModule();
    if (!mod) return;

    // ── Elf passive secret door detection ───────────────────────────────
    // Note: ds here is stale (closure) but we only need character class
    // which doesn't change — safe to read from closure
    // Character is accessed via CharacterContext; we read it through the
    // ref pattern. For now we skip elf detection at this layer and let
    // DungeonScreen trigger it via the Search action.

    // ── Light expired narration ─────────────────────────────────────────
    if (turnEvents.lightExpired) {
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: {
          text: 'Your light source has burned out. You are plunged into darkness.',
          style: 'danger',
        },
      });
    } else if (turnEvents.torchExtinguished) {
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: {
          text: 'The wind in this corridor snuffs out your torch! You are in darkness.',
          style: 'danger',
        },
      });
    }

    // ── Wandering monster trigger ────────────────────────────────────────
    if (turnEvents.wanderingMonsterDue) {
      _checkWanderingMonster(roomId, level);
    }

    // ── Auto-combat trigger ──────────────────────────────────────────────
    if (!ds.inCombat) {
      const livingMonsters = DungeonEngine.getLivingMonstersInRoom(mod, ds, level, roomId);
      if (livingMonsters.length > 0 && room?.autoStartCombat) {
        const combatNarration = DungeonEngine.buildCombatEntryNarration(livingMonsters, mod);
        dispatch({
          type: ACTIONS.START_COMBAT,
          payload: { enemy: livingMonsters[0], narration: combatNarration },
        });
      }
    }

    // ── Map reveal feature ───────────────────────────────────────────────
    const mapFeature = DungeonEngine.getMapRevealFeature(mod, level, roomId);
    if (mapFeature && isFirstVisit) {
      const allRoomsForLevel = mod.getRoomsForLevel(level).map(r => r.id);
      dispatch({ type: ACTIONS.REVEAL_MAP, payload: { roomIds: allRoomsForLevel } });
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: {
          text: `${mapFeature.name}: The layout of this level is revealed to you.`,
          style: 'dm',
        },
      });
    }

    // ── Auto-triggering environmental hazards ────────────────────────────
    const autoHazards = DungeonEngine.getAutoTriggeredHazards(mod, level, roomId);
    for (const hazard of autoHazards) {
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: { text: hazard.description + ' ' + (hazard.effect || ''), style: 'danger' },
      });
      // Actual saving throw resolution is handled by DungeonScreen
      // which has access to CharacterContext
    }
  }, [state.dungeonState, getModule]);

  /**
   * Descend a staircase to the next level.
   * @param {object} stairExit — exit object with targetLevel, targetRoomId
   */
  const descendStairs = useCallback((stairExit) => {
    const ds = state.dungeonState;
    const { targetLevel, targetRoomId } = stairExit;
    const mod = getModule();

    const { statePatch: turnPatch } = TurnTracker.advanceTurns(ds, 1);

    const targetRoom = mod ? DungeonEngine.getRoom(mod, targetLevel, targetRoomId) : null;
    const narration = `You descend into the depths of Level ${targetLevel}.${
      targetRoom ? '\n\n' + targetRoom.description : ''
    }`;

    dispatch({
      type: ACTIONS.DESCEND_STAIRS,
      payload: { targetLevel, targetRoomId, narration, turnPatch },
    });
  }, [state.dungeonState, getModule]);

  /**
   * Ascend a staircase back to the previous level.
   * @param {object} stairExit — exit object with targetLevel, targetRoomId
   */
  const ascendStairs = useCallback((stairExit) => {
    const ds = state.dungeonState;
    const { targetLevel, targetRoomId } = stairExit;
    const mod = getModule();

    const { statePatch: turnPatch } = TurnTracker.advanceTurns(ds, 1);

    const targetRoom = mod ? DungeonEngine.getRoom(mod, targetLevel, targetRoomId) : null;
    const isFirstVisit = !(ds.visitedRooms[targetLevel] || []).includes(targetRoomId);
    const narration = `You ascend back to Level ${targetLevel}.${
      targetRoom && isFirstVisit ? '\n\n' + targetRoom.description : ''
    }`;

    dispatch({
      type: ACTIONS.ASCEND_STAIRS,
      payload: { targetLevel, targetRoomId, narration, turnPatch },
    });
  }, [state.dungeonState, getModule]);

  /**
   * Search the current room.
   * Delegates to SecretDoorResolver, advances 1 turn.
   * @param {object} character — from CharacterContext
   */
  const searchRoom = useCallback((character) => {
    const ds = state.dungeonState;
    const mod = getModule();

    if (!mod) {
      // Legacy search — simple narration only
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: { text: 'You search the room carefully but find nothing hidden.', style: 'action' },
      });
      return;
    }

    // Run the search
    const result = SecretDoorResolver.resolveSearch(mod, ds, character);

    // Advance 1 turn for the search action
    const { statePatch: turnPatch } = TurnTracker.advanceTurns(ds, 1);

    dispatch({
      type: ACTIONS.SEARCH_ROOM,
      payload: {
        statePatch: result.statePatch,
        narrationLines: result.narrationLines.length > 0
          ? result.narrationLines
          : ['You search the room carefully. Nothing additional reveals itself.'],
        turnPatch,
      },
    });

    // Check for wandering monster triggered by the extra turn
    const { events: turnEvents } = TurnTracker.advanceTurns(ds, 1);
    if (turnEvents.wanderingMonsterDue) {
      _checkWanderingMonster(ds.currentRoomId, ds.currentLevel);
    }
  }, [state.dungeonState, getModule]);

  /**
   * Collect treasure in the current room.
   * @param {object} treasureObj — treasure object from room.contents.treasure
   * @param {function} onGoldUpdate — callback: (amount) => void (CharacterContext.updateGold)
   * @param {function} onItemAdd   — callback: (item) => void (CharacterContext.addItem)
   */
  const collectTreasure = useCallback((treasureObj, onGoldUpdate, onItemAdd) => {
    if (!treasureObj) return;

    // Apply gold and items to character
    if (treasureObj.gold > 0 && onGoldUpdate) {
      onGoldUpdate(treasureObj.gold);
    }
    for (const item of (treasureObj.items || [])) {
      if (onItemAdd) onItemAdd(item);
    }

    const parts = [];
    if (treasureObj.gold > 0) parts.push(`${treasureObj.gold} gold pieces`);
    for (const item of (treasureObj.items || [])) {
      parts.push(item.name);
    }
    const narration = parts.length > 0
      ? `You collect: ${parts.join(', ')}.`
      : 'You collect the treasure.';

    dispatch({
      type: ACTIONS.COLLECT_TREASURE,
      payload: {
        treasureId: treasureObj.id,
        goldAmount: treasureObj.gold || 0,
        items: treasureObj.items || [],
        narration,
      },
    });
  }, []);

  /**
   * Advance N turns (for resting, long actions, etc).
   * @param {number} turns
   * @param {object} [options]
   */
  const advanceTurns = useCallback((turns = 1, options = {}) => {
    dispatch({ type: ACTIONS.ADVANCE_TURN, payload: { turns, ...options } });
  }, []);

  /**
   * Rest — 6 turns, restore HP, restore spells.
   * @param {object} character
   * @param {function} onHpRestore — callback: (amount) => void
   */
  const rest = useCallback((character, onHpRestore) => {
    const ds = state.dungeonState;
    const mod = getModule();
    const hasMonsters = mod
      ? DungeonEngine.roomHasLivingMonsters(mod, ds, ds.currentLevel, ds.currentRoomId)
      : false;

    const result = TurnTracker.calculateRest(character, hasMonsters, ds.hasRested);

    if (!result.allowed) {
      dispatch({
        type: ACTIONS.ADD_NARRATION,
        payload: { text: result.reason, style: 'system' },
      });
      return;
    }

    // Apply HP restoration
    if (onHpRestore) onHpRestore(result.hpRestored);

    const { statePatch: turnPatch } = TurnTracker.advanceTurns(ds, result.turnCost);

    dispatch({
      type: ACTIONS.REST,
      payload: { turnPatch, narration: result.narration },
    });
  }, [state.dungeonState, getModule]);

  /**
   * Light a new light source.
   * @param {'torch'|'lantern'|'light_spell'|'infravision'} sourceType
   */
  const lightNewSource = useCallback((sourceType) => {
    dispatch({ type: ACTIONS.LIGHT_SOURCE, payload: { sourceType } });
  }, []);

  /** Add a narration entry manually.
   * Handles both arg orders:
   *   Sprint 3 style: addNarration(text, style)
   *   Legacy CombatUI style: addNarration(style, text)
   */
  const addNarration = useCallback((textOrStyle, styleOrText = 'dm') => {
    // Known style names used by CombatUI and handleCastSpell
    const KNOWN_STYLES = new Set([
      'room', 'dm', 'combat', 'action', 'system', 'danger', 'treasure',
      'combat_action', 'system_message', 'dm_note', 'room_description', 'dialogue',
    ]);
    // If the first arg is a known style name, treat as legacy (style, text) order
    let text, style;
    if (KNOWN_STYLES.has(textOrStyle)) {
      style = normaliseStyle(textOrStyle);
      text  = styleOrText;
    } else {
      text  = textOrStyle;
      style = normaliseStyle(styleOrText);
    }
    dispatch({ type: ACTIONS.ADD_NARRATION, payload: { text, style } });
  }, []);

  /** Start combat with a specific monster instance. */
  const startCombat = useCallback((enemy) => {
    const mod = getModule();
    const monsterType = mod?.bestiary?.[enemy.typeId];
    const narration = monsterType
      ? `A ${enemy.name} advances!`
      : `${enemy.name || 'An enemy'} attacks!`;
    dispatch({ type: ACTIONS.START_COMBAT, payload: { enemy, narration } });
  }, [getModule]);

  /** End combat, transition room state, apply XP. */
  const endCombat = useCallback((victory, xpEarned = 0) => {
    const narration = victory
      ? 'You stand victorious over your fallen enemy.'
      : 'The battle is over.';
    dispatch({ type: ACTIONS.END_COMBAT, payload: { victory, narration, xpEarned } });
  }, []);

  /** Record a monster as defeated. */
  const defeatMonster = useCallback((instanceId, xp = 0) => {
    const mod = getModule();
    const ds  = state.dungeonState;
    const instance = mod ? DungeonEngine.getMonsterInstance(mod, instanceId) : null;
    const narration = instance
      ? `The ${instance.name} is defeated!`
      : 'The enemy is defeated!';

    dispatch({ type: ACTIONS.DEFEAT_MONSTER, payload: { instanceId, narration, xp } });

    // Check if room is now clear — compute synchronously using the CURRENT state
    // plus the monster we just defeated (don't rely on post-dispatch state).
    if (mod) {
      const alreadyDefeated = new Set([...(ds.defeatedMonsters || []), instanceId]);
      const roomMonsters = mod.rooms?.[ds.currentLevel]?.[ds.currentRoomId]
        ?.contents?.monsters ?? [];
      const allInstances  = mod.monsterInstances?.[ds.currentLevel] || {};
      const stillAlive = roomMonsters.filter(
        id => !alreadyDefeated.has(id) && allInstances[id] && !allInstances[id].isDefeated
      );
      if (stillAlive.length === 0) {
        // Small delay so DEFEAT_MONSTER reducer runs first, then end combat
        setTimeout(() => endCombat(true, xp), 50);
      }
    } else {
      // Legacy / no module — always end combat on monster defeat
      setTimeout(() => endCombat(true, xp), 50);
    }
  }, [state.dungeonState, getModule, endCombat]);

  // ─────────────────────────────────────────────────────────────────────────
  // Wandering Monster Logic
  // ─────────────────────────────────────────────────────────────────────────

  const _checkWanderingMonster = useCallback((roomId, level) => {
    const ds = state.dungeonState;
    const mod = getModule();
    if (!mod) return;

    const { suppressed } = WanderingMonsters.shouldSuppressWanderingMonster(mod, ds);
    if (suppressed) return;

    const encounter = WanderingMonsters.generateWanderingEncounter(mod, level);
    if (!encounter) return;

    dispatch({
      type: ACTIONS.SPAWN_WANDERING_MONSTER,
      payload: {
        instances: encounter.instances,
        narration: encounter.narration,
      },
    });
  }, [state.dungeonState, getModule]);

  // ─────────────────────────────────────────────────────────────────────────
  // Victory / Defeat Checks
  // ─────────────────────────────────────────────────────────────────────────

  const checkVictory = useCallback(() => {
    const mod = getModule();
    if (!mod) return false;

    const result = DungeonEngine.checkVictory(mod, state.dungeonState);
    if (result.isVictorious && !state.dungeonState.isVictorious) {
      dispatch({
        type: ACTIONS.SET_VICTORIOUS,
        payload: { narration: 'You have escaped Quasqueton alive. Victory is yours!' },
      });
      return true;
    }
    return result.isVictorious;
  }, [state.dungeonState, getModule]);

  // ─────────────────────────────────────────────────────────────────────────
  // Temple Loop (preserved from v0.1.x, adapted for new state shape)
  // ─────────────────────────────────────────────────────────────────────────
  //
  // Called by CombatUI when the player is defeated AND getLivingHirelings().length > 0
  // Sequence:
  //   1. 15% tithe from character gold
  //   2. Restore character HP to max
  //   3. Dismiss first living hireling (via TownContext)
  //   4. triggerTempleResurrection() (TownContext)
  //   5. RESET_ADVENTURE
  //   6. navigate('/town')
  //
  // Args are injected by CombatUI from other contexts:
  //   updateGold, updateHP, getLivingHirelings, dismissHireling, triggerTempleResurrection
  // ─────────────────────────────────────────────────────────────────────────

  const triggerTempleLoop = useCallback(({
    character,
    updateGold,
    updateHP,
    getLivingHirelings,
    dismissHireling,
    triggerTempleResurrection,
  }) => {
    // 1. 15% tithe
    const tithe = Math.floor((character?.gold || 0) * 0.15);
    if (tithe > 0 && updateGold) {
      updateGold(-tithe);
    }

    // 2. Restore HP
    if (updateHP && character?.hp) {
      updateHP(character.hp.max, character.hp.max);
    }

    // 3. Dismiss first living hireling
    const living = getLivingHirelings?.() || [];
    if (living.length > 0 && dismissHireling) {
      dismissHireling(living[0].id);
    }

    // 4. Temple resurrection narration + TownContext flag
    if (triggerTempleResurrection) {
      triggerTempleResurrection();
    }

    // 5. Reset adventure state
    dispatch({ type: ACTIONS.RESET_ADVENTURE });

    // 6. Route to town
    navigate('/town');
  }, [navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // Read Helpers (used by components)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the current room definition.
   * @returns {object|null}
   */
  const getCurrentRoom = useCallback(() => {
    const ds = state.dungeonState;
    const mod = getModule();

    if (mod) {
      return DungeonEngine.getRoom(mod, ds.currentLevel, ds.currentRoomId);
    }

    // Legacy path
    const adventure = state.adventure;
    return adventure?.rooms?.[ds.currentRoomId] || null;
  }, [state, getModule]);

  /**
   * Get visible exits for the current room.
   * @returns {object[]}
   */
  const getVisibleExits = useCallback(() => {
    const ds = state.dungeonState;
    const mod = getModule();

    if (mod) {
      return DungeonEngine.getVisibleExits(
        mod, ds.currentLevel, ds.currentRoomId,
        ds.discoveredSecretDoors
      );
    }

    // Legacy: all exits visible
    const room = state.adventure?.rooms?.[ds.currentRoomId];
    return room?.exits || [];
  }, [state, getModule]);

  /**
   * Get living monsters in the current room.
   * @returns {object[]}
   */
  const getLivingMonsters = useCallback(() => {
    const ds = state.dungeonState;
    const mod = getModule();

    if (mod) {
      return DungeonEngine.getLivingMonstersInCurrentRoom(mod, ds);
    }

    // Legacy: filter from adventure.monsters by room + defeated list
    const adventure = state.adventure;
    const room = adventure?.rooms?.[ds.currentRoomId];
    if (!room?.contents?.monsters?.length) return [];
    const defeated = new Set(ds.defeatedMonsters);
    return room.contents.monsters
      .filter(id => !defeated.has(id))
      .map(id => adventure.monsters?.[id])
      .filter(Boolean);
  }, [state, getModule]);

  /**
   * Get uncollected treasure in the current room.
   * @returns {object[]}
   */
  const getUncollectedTreasure = useCallback(() => {
    const ds = state.dungeonState;
    const mod = getModule();

    if (mod) {
      return DungeonEngine.getUncollectedTreasure(
        mod, ds, ds.currentLevel, ds.currentRoomId
      );
    }

    // Legacy
    const room = state.adventure?.rooms?.[ds.currentRoomId];
    if (!room?.contents?.treasure) return [];
    const collected = new Set(ds.collectedTreasure);
    return room.contents.treasure.filter(t => !collected.has(t.id));
  }, [state, getModule]);

  /**
   * Get map data for a given level (for DungeonMap renderer).
   * @param {number} level
   * @returns {object[]}
   */
  const getMapData = useCallback((level = 1) => {
    const mod = getModule();
    if (!mod) return [];
    return DungeonEngine.getMapData(mod, state.dungeonState, level);
  }, [state.dungeonState, getModule]);

  /**
   * Get the light status object for the TurnCounter widget.
   * @returns {{ label: string, urgency: string }}
   */
  const getLightStatus = useCallback(() => {
    return TurnTracker.getLightStatus(state.dungeonState);
  }, [state.dungeonState]);

  /**
   * Get the human-readable turn label.
   * @returns {string}
   */
  const getTurnLabel = useCallback(() => {
    return TurnTracker.getTurnLabel(state.dungeonState.turnCount);
  }, [state.dungeonState.turnCount]);

  /**
   * Calculate total XP earned in this run.
   * @returns {number}
   */
  const getRunXP = useCallback(() => {
    const mod = getModule();
    if (!mod) return 0;
    return DungeonEngine.calculateRunXP(mod, state.dungeonState);
  }, [state.dungeonState, getModule]);

  // ─────────────────────────────────────────────────────────────────────────
  // Context Value
  // ─────────────────────────────────────────────────────────────────────────

  const contextValue = {
    // Raw state — components can read directly
    adventure:    state.adventure,
    dungeonState: state.dungeonState,

    // Convenience destructures of dungeonState (for backward compat
    // with components that already use adventure.* pattern)
    currentRoomId:         state.dungeonState.currentRoomId,
    currentLevel:          state.dungeonState.currentLevel,
    defeatedMonsters:      state.dungeonState.defeatedMonsters,
    collectedTreasure:     state.dungeonState.collectedTreasure,
    narrationHistory:      state.dungeonState.narrationHistory,
    inCombat:              state.dungeonState.inCombat,
    currentEnemy:          state.dungeonState.currentEnemy,
    isVictorious:          state.dungeonState.isVictorious,
    isDefeated:            state.dungeonState.isDefeated,
    hasLight:              state.dungeonState.hasLight,
    turnCount:             state.dungeonState.turnCount,
    wanderingMonsters:     state.dungeonState.wanderingMonsters,

    // Lifecycle
    startDungeon,
    setAdventure,
    resetAdventure,

    // Navigation
    enterRoom,
    descendStairs,
    ascendStairs,

    // Exploration
    searchRoom,
    collectTreasure,
    advanceTurns,
    rest,
    lightNewSource,

    // Combat
    startCombat,
    endCombat,
    defeatMonster,

    // Narration
    addNarration,

    // Temple Loop
    triggerTempleLoop,

    // Victory
    checkVictory,

    // Read helpers
    getCurrentRoom,
    getVisibleExits,
    getLivingMonsters,
    getUncollectedTreasure,
    getMapData,
    getLightStatus,
    getTurnLabel,
    getRunXP,
    getModule,
    isLegacy,

    // Low-level dispatch (for CombatUI and other complex consumers)
    dispatch,
    ACTIONS,

    // ── Legacy shims ────────────────────────────────────────────────────
    // These aliases keep pre-Sprint3 code (handleCastSpell, old CombatUI, etc.)
    // working without modification.
    lightTorch:      () => lightNewSource('torch'),
    lightLantern:    () => lightNewSource('lantern'),
    extinguishLight: () => dispatch({ type: ACTIONS.EXTINGUISH_LIGHT }),
    decrementLight:  () => advanceTurns(1),       // legacy light-tick shim

    // Old single-arg endCombat(victory, enemyId) — enemyId ignored (tracked via defeatMonster)
    // Sprint 3 endCombat already handles (victory) so no-op alias needed

    // Old dispatch shorthands
    setVictory: () => dispatch({ type: ACTIONS.SET_VICTORIOUS }),
    setDefeat:  () => dispatch({ type: ACTIONS.SET_DEFEATED }),
  };

  return (
    <AdventureContext.Provider value={contextValue}>
      {children}
    </AdventureContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAdventure() {
  const ctx = useContext(AdventureContext);
  if (!ctx) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  return ctx;
}

export default AdventureContext;
