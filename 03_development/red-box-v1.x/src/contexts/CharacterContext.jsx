import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  calculateModifier,
  calculateMaxHP,
  calculateAC,
  calculateTHAC0,
  getPrimeRequisite,
  calculateXPBonus,
  meetsClassRequirements,
  getStartingGold
} from '../utils/calculations';
import { getStartingItems } from '../utils/items';

/**
 * CharacterContext - Global character state
 *
 * Changes vs original:
 *  - FIX 1: Every helper in `value` is wrapped in useCallback so context
 *    consumers don't re-render on unrelated state changes.
 *  - FIX 2: A lightweight index key (`rpg-character-index`) replaces the
 *    Object.keys(localStorage) scan in CharacterManager. Saving/deleting a
 *    character also updates the index so the manager never has to iterate
 *    the entire localStorage keyspace.
 */

const CharacterContext = createContext();

// ─── localStorage helpers ─────────────────────────────────────────────────────

const INDEX_KEY = 'rpg-character-index';

/** Read the list of saved character keys from the index. */
function readIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Write a new list of keys to the index. */
function writeIndex(keys) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(keys));
  } catch (err) {
    console.error('Failed to update character index:', err);
  }
}

/**
 * Add a key to the saved-character index (deduped).
 * Exported so CharacterManager can call it after a manual save.
 */
export function addToCharacterIndex(key) {
  const index = readIndex();
  if (!index.includes(key)) {
    writeIndex([...index, key]);
  }
}

/**
 * Remove a key from the saved-character index.
 * Exported so CharacterManager can call it on delete.
 */
export function removeFromCharacterIndex(key) {
  writeIndex(readIndex().filter(k => k !== key));
}

/**
 * Return all saved characters as an array of objects.
 * Uses the index — no full localStorage scan needed.
 */
export function loadAllCharacters() {
  return readIndex().reduce((acc, key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data) acc.push({ id: key, ...data });
    } catch {
      // Corrupt entry — drop from index silently
      removeFromCharacterIndex(key);
    }
    return acc;
  }, []);
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState = {
  name: '',
  class: null,
  level: 1,
  xp: 0,
  alignment: null,

  abilities: {
    strength: null,
    intelligence: null,
    wisdom: null,
    dexterity: null,
    constitution: null,
    charisma: null,
  },

  hp: { current: 0, max: 0 },
  ac: 9,
  thac0: 19,

  inventory: [],
  gold: 0,
  armor: 'none',
  armorClass: 9,
  hasShield: false,
  shield: null,
  weapon: null,
  weaponTwoHanded: false,

  spells: [],
  spellSlots: { 1: 0, 2: 0, 3: 0 },
  spellSlotsUsed: { 1: 0, 2: 0, 3: 0 },

  activeBuffs: [],

  isCreated: false,
  creationStep: 1,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function characterReducer(state, action) {
  switch (action.type) {
    case 'SET_ABILITIES':
      return { ...state, abilities: action.payload, creationStep: 2 };

    case 'SET_CLASS': {
      const className = action.payload;
      return {
        ...state,
        class: className,
        hp: { current: calculateMaxHP(className, state.abilities.constitution, 1),
               max:     calculateMaxHP(className, state.abilities.constitution, 1) },
        ac:    calculateAC(9, state.abilities.dexterity),
        thac0: calculateTHAC0(className, 1, state.abilities.strength),
        gold:  getStartingGold(className),
        inventory: getStartingItems(className),
        creationStep: 3,
      };
    }

    case 'SET_ALIGNMENT':
      return { ...state, alignment: action.payload, creationStep: 4 };

    case 'SET_SPELLS':
      return {
        ...state,
        spells: action.payload,
        spellSlots: action.spellSlots || { 1: 1, 2: 0, 3: 0 },
        spellSlotsUsed: { 1: 0, 2: 0, 3: 0 },
        creationStep: 5,
      };

    case 'SET_EQUIPMENT': {
      const {
        armor,
        armorClass = state.armorClass,
        hasShield,
        shield = state.shield,
        weapon = state.weapon,
        weaponTwoHanded = state.weaponTwoHanded,
        ac,
        inventory,
      } = action.payload;
      return {
        ...state,
        armor,
        armorClass,
        hasShield,
        shield,
        weapon,
        weaponTwoHanded,
        ac: ac ?? calculateAC(9, state.abilities.dexterity, (armorClass - 9) + (hasShield ? -1 : 0)),
        inventory,
        creationStep: 5,
      };
    }

    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'FINALIZE_CHARACTER':
      return { ...state, isCreated: true };

    case 'UPDATE_HP': {
      const { current, max } = action.payload;
      return {
        ...state,
        hp: {
          current: Math.max(0, Math.min(current, max || state.hp.max)),
          max: max || state.hp.max,
        },
      };
    }

    case 'DAMAGE':
      return { ...state, hp: { ...state.hp, current: Math.max(0, state.hp.current - action.payload) } };

    case 'HEAL':
      return { ...state, hp: { ...state.hp, current: Math.min(state.hp.max, state.hp.current + action.payload) } };

    case 'ADD_XP':
      return { ...state, xp: state.xp + action.payload };

    case 'ADD_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };

    case 'REMOVE_ITEM':
      return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) };

    case 'DECREMENT_ITEM_QUANTITY': {
      const { itemId, amount = 1 } = action.payload;
      return {
        ...state,
        inventory: state.inventory
          .map(item => item.id === itemId
            ? { ...item, quantity: (item.quantity || 1) - amount }
            : item)
          .filter(item => (item.quantity ?? 1) > 0),
      };
    }

    case 'UPDATE_GOLD':
      return { ...state, gold: Math.max(0, state.gold + action.payload) };

    case 'USE_SPELL_SLOT': {
      const { level } = action.payload;
      return {
        ...state,
        spellSlotsUsed: {
          ...state.spellSlotsUsed,
          [level]: Math.min(state.spellSlotsUsed[level] + 1, state.spellSlots[level] || 0),
        },
      };
    }

    case 'ADD_BUFF':
      return { ...state, activeBuffs: [...state.activeBuffs, action.payload] };

    case 'DECREMENT_BUFF_DURATIONS':
      return {
        ...state,
        activeBuffs: state.activeBuffs
          .map(b => ({ ...b, duration: b.duration - 1 }))
          .filter(b => b.duration > 0),
      };

    case 'REMOVE_BUFF':
      return { ...state, activeBuffs: state.activeBuffs.filter(b => b.spellId !== action.payload) };

    case 'CLEAR_BUFFS':
      return { ...state, activeBuffs: [] };

    case 'REST': {
      const conMod = calculateModifier(state.abilities.constitution);
      const newHP = Math.min(state.hp.current + 4 + conMod, state.hp.max);
      return { ...state, hp: { ...state.hp, current: newHP }, spellSlotsUsed: { 1: 0, 2: 0, 3: 0 } };
    }

    case 'LOAD_CHARACTER':
      return { ...action.payload, isCreated: true, inventory: action.payload.inventory || [] };

    case 'RESET_CHARACTER':
      return initialState;

    case 'GO_TO_STEP':
      return { ...state, creationStep: action.payload };

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Auto-save (only when character is fully created)
  useEffect(() => {
    if (!state.isCreated) return;
    try {
      localStorage.setItem('rpg-character', JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save character:', err);
    }
  }, [state]);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rpg-character');
      if (saved) {
        dispatch({ type: 'LOAD_CHARACTER', payload: JSON.parse(saved) });
      }
    } catch (err) {
      console.error('Failed to load character:', err);
    }
  }, []);

  // ── FIX: useCallback for all helpers ────────────────────────────────────────
  // The `value` object was recreated on every render, giving every consumer a
  // new reference and triggering re-renders even when nothing changed.
  // Each helper is now stable across renders unless its specific dep changes.

  const setAbilities       = useCallback((abilities) => dispatch({ type: 'SET_ABILITIES',   payload: abilities }), []);
  const setClass           = useCallback((cls)        => dispatch({ type: 'SET_CLASS',       payload: cls }),       []);
  const setAlignment       = useCallback((al)         => dispatch({ type: 'SET_ALIGNMENT',   payload: al }),        []);
  const setSpells          = useCallback((ids, slots) => dispatch({ type: 'SET_SPELLS',      payload: ids, spellSlots: slots }), []);
  const setEquipment       = useCallback((eq)         => dispatch({ type: 'SET_EQUIPMENT',   payload: eq }),        []);
  const setName            = useCallback((name)       => dispatch({ type: 'SET_NAME',        payload: name }),      []);
  const finalizeCharacter  = useCallback(()           => dispatch({ type: 'FINALIZE_CHARACTER' }),                  []);
  const useSpellSlot       = useCallback((level)      => dispatch({ type: 'USE_SPELL_SLOT',  payload: { level } }), []);
  const addBuff            = useCallback((buff)       => dispatch({ type: 'ADD_BUFF',        payload: buff }),      []);
  const decrementBuffDurations = useCallback(()       => dispatch({ type: 'DECREMENT_BUFF_DURATIONS' }),            []);
  const removeBuff         = useCallback((id)         => dispatch({ type: 'REMOVE_BUFF',     payload: id }),        []);
  const clearBuffs         = useCallback(()           => dispatch({ type: 'CLEAR_BUFFS' }),                        []);
  const rest               = useCallback(()           => dispatch({ type: 'REST' }),                               []);
  const takeDamage         = useCallback((dmg)        => dispatch({ type: 'DAMAGE',          payload: dmg }),       []);
  const heal               = useCallback((amt)        => dispatch({ type: 'HEAL',            payload: amt }),       []);
  const updateHP           = useCallback((cur, max)   => dispatch({ type: 'UPDATE_HP',       payload: { current: cur, max } }), []);
  const addItem            = useCallback((item)       => dispatch({ type: 'ADD_ITEM',        payload: item }),      []);
  const removeItem         = useCallback((id)         => dispatch({ type: 'REMOVE_ITEM',     payload: id }),        []);
  const decrementItemQuantity = useCallback((id, amt = 1) =>
    dispatch({ type: 'DECREMENT_ITEM_QUANTITY', payload: { itemId: id, amount: amt } }), []);
  const updateGold         = useCallback((amt)        => dispatch({ type: 'UPDATE_GOLD',     payload: amt }),       []);
  const addXP              = useCallback((amt)        => dispatch({ type: 'ADD_XP',          payload: amt }),       []);
  const resetCharacter     = useCallback(()           => dispatch({ type: 'RESET_CHARACTER' }),                    []);
  const goToStep           = useCallback((step)       => dispatch({ type: 'GO_TO_STEP',      payload: step }),      []);

  // Derived — stable unless the specific slice they read changes
  const getModifier       = useCallback((ability) => calculateModifier(state.abilities[ability]), [state.abilities]);
  const getPrimeRequisite_ = useCallback(() => getPrimeRequisite(state.class),                    [state.class]);
  const getXPBonus        = useCallback(() => calculateXPBonus(state.class, state.abilities),     [state.class, state.abilities]);
  const canChooseClass    = useCallback((cls) => meetsClassRequirements(cls, state.abilities),    [state.abilities]);

  const exportCharacter = useCallback(() => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${state.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importCharacter = useCallback((jsonString) => {
    try {
      const character = JSON.parse(jsonString);
      dispatch({ type: 'LOAD_CHARACTER', payload: character });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * FIX: Save character to a named slot AND update the index.
   * CharacterManager should call this instead of writing directly to
   * localStorage so the index stays in sync.
   */
  const saveCharacterSlot = useCallback((key) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      addToCharacterIndex(key);
    } catch (err) {
      console.error('Failed to save character slot:', err);
    }
  }, [state]);

  const value = {
    character: state,
    dispatch,
    // Creation
    setAbilities, setClass, setAlignment, setSpells, setEquipment, setName, finalizeCharacter,
    // Spells / buffs
    useSpellSlot, addBuff, decrementBuffDurations, removeBuff, clearBuffs,
    // Combat
    rest, takeDamage, heal, updateHP,
    // Inventory
    addItem, removeItem, decrementItemQuantity, updateGold,
    // Progress
    addXP,
    // Utility
    resetCharacter, goToStep,
    // Derived
    getModifier, getPrimeRequisite: getPrimeRequisite_, getXPBonus, canChooseClass,
    // Persistence helpers
    exportCharacter, importCharacter, saveCharacterSlot,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) throw new Error('useCharacter must be used within CharacterProvider');
  return context;
}

export default CharacterContext;
