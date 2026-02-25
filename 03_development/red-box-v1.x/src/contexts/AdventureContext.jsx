import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { tutorialAdventure, getTutorialRoom, getTutorialMonster, checkTutorialVictory } from '../data/tutorialAdventure';

/**
 * AdventureContext - Global adventure state
 */
const AdventureContext = createContext(undefined);

/**
 * Initial adventure state
 */
const initialState = {
  // Current adventure
  adventureId: 'tutorial',
  currentRoomId: 'tutorial_entrance',
  previousRoomId: null, // Track where player came from for fleeing
  
  // Room states
  roomStates: {
    tutorial_entrance: 'entered',
    tutorial_corridor: 'unexplored',
    goblin_room: 'unexplored',
    snake_room: 'unexplored',
    treasure_room: 'unexplored'
  },
  
  // Progress tracking
  defeatedMonsters: [],
  collectedTreasure: [],
  visitedRooms: ['tutorial_entrance'],
  
  // Combat state
  inCombat: false,
  currentEnemy: null,
  combatLog: [],
  
  // Narration
  narrationHistory: [],
  
  // Victory/Defeat
  isVictorious: false,
  isDefeated: false,
  
  // Tutorial flags
  tutorialComplete: false,
  
  // Rest tracking
  hasRested: false, // Can only rest once per adventure
  
  // Light tracking
  hasLight: false, // Whether character has active light source
  lightSource: null, // 'torch' | 'lantern' | 'spell' | null
  lightDuration: 0, // Turns remaining
};

/**
 * Adventure reducer
 */
function adventureReducer(state, action) {
  switch (action.type) {
    case 'ENTER_ROOM': {
      const roomId = action.payload;
      const room = getTutorialRoom(roomId);
      
      const newVisited = state.visitedRooms.includes(roomId) 
        ? state.visitedRooms 
        : [...state.visitedRooms, roomId];
      
      const newRoomStates = {
        ...state.roomStates,
        [roomId]: 'entered'
      };
      
      // Check if room has monsters and auto-start combat
      const hasMonsters = room.contents.monsters && room.contents.monsters.length > 0;
      const monstersAlive = hasMonsters && !room.contents.monsters.every(mId => 
        state.defeatedMonsters.includes(mId)
      );
      
      return {
        ...state,
        previousRoomId: state.currentRoomId, // Track where we came from
        currentRoomId: roomId,
        visitedRooms: newVisited,
        roomStates: newRoomStates,
        inCombat: monstersAlive && room.autoStartCombat,
        currentEnemy: monstersAlive ? room.contents.monsters[0] : null
      };
    }
    
    case 'REVEAL_ROOM': {
      const roomId = action.payload;
      return {
        ...state,
        roomStates: {
          ...state.roomStates,
          [roomId]: 'revealed'
        }
      };
    }
    
    case 'CLEAR_ROOM': {
      const roomId = action.payload;
      return {
        ...state,
        roomStates: {
          ...state.roomStates,
          [roomId]: 'cleared'
        }
      };
    }
    
    case 'START_COMBAT': {
      const enemyId = action.payload;
      return {
        ...state,
        inCombat: true,
        currentEnemy: enemyId,
        combatLog: []
      };
    }
    
    case 'END_COMBAT': {
      const { victory, enemyId } = action.payload;
      
      const newDefeated = victory && enemyId
        ? [...state.defeatedMonsters, enemyId]
        : state.defeatedMonsters;
      
      const newRoomStates = victory
        ? { ...state.roomStates, [state.currentRoomId]: 'cleared' }
        : state.roomStates;
      
      return {
        ...state,
        inCombat: false,
        currentEnemy: null,
        defeatedMonsters: newDefeated,
        roomStates: newRoomStates,
        combatLog: []
      };
    }
    
    case 'ADD_COMBAT_LOG': {
      return {
        ...state,
        combatLog: [...state.combatLog, action.payload]
      };
    }
    
    case 'COLLECT_TREASURE': {
      const treasureId = action.payload;
      return {
        ...state,
        collectedTreasure: [...state.collectedTreasure, treasureId]
      };
    }
    
    case 'ADD_NARRATION': {
      // Generate unique ID using timestamp + length to avoid collisions
      const uniqueId = `${Date.now()}-${state.narrationHistory.length}`;
      const entry = {
        id: uniqueId,
        timestamp: Date.now(),
        ...action.payload
      };
      
      return {
        ...state,
        narrationHistory: [...state.narrationHistory, entry]
      };
    }
    
    case 'SET_VICTORY': {
      return {
        ...state,
        isVictorious: true,
        tutorialComplete: true
      };
    }
    
    case 'SET_DEFEAT': {
      return {
        ...state,
        isDefeated: true
      };
    }
    
    case 'REST': {
      return {
        ...state,
        hasRested: true
      };
    }
    
    case 'LIGHT_TORCH': {
      return {
        ...state,
        hasLight: true,
        lightSource: 'torch',
        lightDuration: 6 // 6 turns for a torch
      };
    }
    
    case 'DECREMENT_LIGHT': {
      const newDuration = Math.max(0, state.lightDuration - 1);
      return {
        ...state,
        lightDuration: newDuration,
        hasLight: newDuration > 0,
        lightSource: newDuration > 0 ? state.lightSource : null
      };
    }
    
    case 'EXTINGUISH_LIGHT': {
      return {
        ...state,
        hasLight: false,
        lightSource: null,
        lightDuration: 0
      };
    }
    
    case 'RESET_ADVENTURE': {
      return initialState;
    }
    
    case 'LOAD_ADVENTURE': {
      return {
        ...initialState,
        ...action.payload
      };
    }
    
    default:
      return state;
  }
}

/**
 * AdventureProvider component
 */
export function AdventureProvider({ children }) {
  const [state, dispatch] = useReducer(adventureReducer, initialState);
  
  // Auto-save to localStorage on state changes
  useEffect(() => {
    try {
      const stateToSave = { ...state, version: '1.0' };
      localStorage.setItem('rpg-adventure', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save adventure:', error);
    }
  }, [state]);
  
  // Load adventure on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rpg-adventure');
      if (saved) {
        const adventureState = JSON.parse(saved);
        // Check if saved data is compatible
        if (!adventureState.version || adventureState.version !== '1.0') {
          localStorage.removeItem('rpg-adventure');
          return;
        }
        dispatch({ type: 'LOAD_ADVENTURE', payload: adventureState });
      }
    } catch (error) {
      console.error('Failed to load adventure:', error);
      // Clear corrupted data
      localStorage.removeItem('rpg-adventure');
    }
  }, []);
  
  // Check victory condition
  useEffect(() => {
    if (!state.isVictorious && !state.isDefeated) {
      const victory = checkTutorialVictory(state.defeatedMonsters);
      if (victory) {
        dispatch({ type: 'SET_VICTORY' });
        dispatch({
          type: 'ADD_NARRATION',
          payload: {
            style: 'system_message',
            text: 'Congratulations! You have completed "Your First Adventure"!',
            emphasis: true
          }
        });
      }
    }
  }, [state.defeatedMonsters, state.isVictorious, state.isDefeated]);
  
  const value = {
    adventure: state,
    dispatch,
    
    // Room navigation
    enterRoom: (roomId) => {
      const room = getTutorialRoom(roomId);
      dispatch({ type: 'ENTER_ROOM', payload: roomId });
      dispatch({
        type: 'ADD_NARRATION',
        payload: {
          style: 'room_description',
          text: room.description
        }
      });
    },
    
    revealRoom: (roomId) => dispatch({ type: 'REVEAL_ROOM', payload: roomId }),
    clearRoom: (roomId) => dispatch({ type: 'CLEAR_ROOM', payload: roomId }),
    
    // Combat
    startCombat: (enemyId) => {
      const monster = getTutorialMonster(enemyId);
      dispatch({ type: 'START_COMBAT', payload: enemyId });
      dispatch({
        type: 'ADD_NARRATION',
        payload: {
          style: 'combat_action',
          text: `Combat begins! You face a ${monster.name}!`,
          emphasis: true
        }
      });
    },
    
    endCombat: (victory, enemyId) => {
      const monster = getTutorialMonster(enemyId);
      dispatch({ type: 'END_COMBAT', payload: { victory, enemyId } });
      
      if (victory) {
        dispatch({
          type: 'ADD_NARRATION',
          payload: {
            style: 'system_message',
            text: monster.defeatedText
          }
        });
      }
    },
    
    addCombatLog: (entry) => dispatch({ type: 'ADD_COMBAT_LOG', payload: entry }),
    
    // Treasure
    collectTreasure: (treasureId) => dispatch({ type: 'COLLECT_TREASURE', payload: treasureId }),
    
    // Narration
    addNarration: (style, text, options = {}) => {
      dispatch({
        type: 'ADD_NARRATION',
        payload: { style, text, ...options }
      });
    },
    
    // Game state
    setVictory: () => dispatch({ type: 'SET_VICTORY' }),
    setDefeat: () => dispatch({ type: 'SET_DEFEAT' }),
    resetAdventure: () => dispatch({ type: 'RESET_ADVENTURE' }),
    rest: () => dispatch({ type: 'REST' }),
    
    // Light management
    lightTorch: () => dispatch({ type: 'LIGHT_TORCH' }),
    decrementLight: () => dispatch({ type: 'DECREMENT_LIGHT' }),
    extinguishLight: () => dispatch({ type: 'EXTINGUISH_LIGHT' }),
    
    // Helpers
    getCurrentRoom: () => getTutorialRoom(state.currentRoomId),
    getCurrentEnemy: () => state.currentEnemy ? getTutorialMonster(state.currentEnemy) : null,
    isRoomCleared: (roomId) => state.roomStates[roomId] === 'cleared',
    hasVisited: (roomId) => state.visitedRooms.includes(roomId),
    hasDefeated: (monsterId) => state.defeatedMonsters.includes(monsterId),
    hasCollected: (treasureId) => state.collectedTreasure.includes(treasureId)
  };
  
  return (
    <AdventureContext.Provider value={value}>
      {children}
    </AdventureContext.Provider>
  );
}

/**
 * Hook to use adventure context
 */
export function useAdventure() {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error('useAdventure must be used within AdventureProvider');
  }
  return context;
}

export default AdventureContext;
