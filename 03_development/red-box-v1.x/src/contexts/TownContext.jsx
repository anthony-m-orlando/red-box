/**
 * TownContext.jsx
 * State management for the Town of Threshold hub.
 *
 * STATE DESIGN NOTES
 * ------------------
 * The state shape is intentionally flat and JSON-serializable so it maps
 * directly to the future `world_state_json` DB column with no migration needed.
 *
 * npcAttitudes stores a numeric score per NPC (not the label string) so
 * shifts accumulate correctly. scoreToAttitude() converts to 'hostile' |
 * 'neutral' | 'friendly' for display. Labels are never persisted.
 *
 * TEMPLE LOOP INTEGRATION
 * -----------------------
 * When AdventureContext detects character death with a living hireling present,
 * it sets `templeResurrectionPending: true` via the exposed
 * `triggerTempleResurrection()` helper, then navigates to /town.
 * TownScreen automatically opens the Temple when this flag is true.
 *
 * HIRELING LIFECYCLE
 * ------------------
 * Hirelings are created from shopInventory.hirelingRoster templates on
 * recruitment, live in townState.hirelings[], and are passed to
 * AdventureContext at dungeon entry. On return, their state (hp, loyalty)
 * is written back from AdventureContext via syncHirelings().
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef
} from 'react';

import { rollRumors }              from '../data/rumors';
import { hirelingRoster }          from '../data/shopInventory';
import { scoreToAttitude }         from '../data/townData';

// ---------------------------------------------------------------------------
// STORAGE KEY
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'rpg-town-state-v1';

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------
const initialState = {
  // Has the player visited the town at least once?
  initialized: false,

  // Which locations have been entered (for first-visit flavour text)
  visitedLocations: [],

  // NPC attitude as numeric score: <= -2 hostile, -1..1 neutral, >= 2 friendly
  npcAttitudes: {
    innkeeper:    0,
    shopkeeper:   0,
    blacksmith:   0,
    wizard:       0,
    priest:       2,   // starts friendly (temple is always welcoming)
    clerk:        0,
    guild_master: 0
  },

  // Three rumors rolled on first visit, persisted thereafter
  activeRumors: [],

  // Recruited hirelings; shape matches shopInventory.hirelingRoster entries
  // plus: { ...template, instanceId, loyalty (running modifier), isAlive }
  hirelings: [],

  // Gold on deposit at Town Hall bank
  bankBalance: 0,

  // Set to true by AdventureContext on death-with-hireling.
  // Cleared when player acknowledges resurrection at Temple.
  templeResurrectionPending: false,

  // Track how many times the player has returned to town
  townVisitCount: 0,

  // Active guild contracts: [{ contractId, acceptedAt, status }]
  activeContracts: [],

  // Whether the character is registered at Town Hall
  registeredAdventurer: false,

  // Whether the character is a guild member (10% discount at shops)
  isGuildMember: false,

  // Pending item identifications: [{ itemId, requestedAt }]
  pendingIdentifications: [],

  // Item storage at the inn: array of item objects
  storedItems: [],

  // Last location the player rested at
  lastRestLocation: null
};

// ---------------------------------------------------------------------------
// ACTION TYPES
// ---------------------------------------------------------------------------
const ACTIONS = {
  // Lifecycle
  INIT_TOWN:                'INIT_TOWN',
  MARK_LOCATION_VISITED:    'MARK_LOCATION_VISITED',
  INCREMENT_VISIT_COUNT:    'INCREMENT_VISIT_COUNT',
  LOAD_STATE:               'LOAD_STATE',

  // NPC attitudes
  SHIFT_ATTITUDE:           'SHIFT_ATTITUDE',

  // Rumors
  SET_RUMORS:               'SET_RUMORS',

  // Hirelings
  RECRUIT_HIRELING:         'RECRUIT_HIRELING',
  DISMISS_HIRELING:         'DISMISS_HIRELING',
  UPDATE_HIRELING:          'UPDATE_HIRELING',
  HIRELING_DIED:            'HIRELING_DIED',
  SYNC_HIRELINGS:           'SYNC_HIRELINGS',

  // Economy
  DEPOSIT_GOLD:             'DEPOSIT_GOLD',
  WITHDRAW_GOLD:            'WITHDRAW_GOLD',

  // Temple
  SET_RESURRECTION_PENDING: 'SET_RESURRECTION_PENDING',
  RESOLVE_RESURRECTION:     'RESOLVE_RESURRECTION',

  // Town Hall
  REGISTER_ADVENTURER:      'REGISTER_ADVENTURER',
  ACCEPT_CONTRACT:          'ACCEPT_CONTRACT',
  COMPLETE_CONTRACT:        'COMPLETE_CONTRACT',

  // Guild
  JOIN_GUILD:               'JOIN_GUILD',

  // Item storage
  STORE_ITEM:               'STORE_ITEM',
  RETRIEVE_ITEM:            'RETRIEVE_ITEM',

  // Identification
  REQUEST_IDENTIFICATION:   'REQUEST_IDENTIFICATION',
  COMPLETE_IDENTIFICATION:  'COMPLETE_IDENTIFICATION',

  // Rest
  SET_LAST_REST:            'SET_LAST_REST'
};

// ---------------------------------------------------------------------------
// REDUCER
// ---------------------------------------------------------------------------
function townReducer(state, action) {
  switch (action.type) {

    // ---- Lifecycle --------------------------------------------------------

    case ACTIONS.INIT_TOWN: {
      // Roll rumors on first ever visit
      const rumors = rollRumors();
      return {
        ...state,
        initialized: true,
        activeRumors: rumors,
        townVisitCount: state.townVisitCount + 1
      };
    }

    case ACTIONS.INCREMENT_VISIT_COUNT: {
      return {
        ...state,
        townVisitCount: state.townVisitCount + 1
      };
    }

    case ACTIONS.MARK_LOCATION_VISITED: {
      const { locationId } = action.payload;
      if (state.visitedLocations.includes(locationId)) return state;
      return {
        ...state,
        visitedLocations: [...state.visitedLocations, locationId]
      };
    }

    case ACTIONS.LOAD_STATE: {
      return { ...initialState, ...action.payload };
    }

    // ---- NPC Attitudes ----------------------------------------------------

    case ACTIONS.SHIFT_ATTITUDE: {
      const { npcId, delta } = action.payload;
      const current = state.npcAttitudes[npcId] ?? 0;
      // Clamp between -3 and 3 so attitudes don't spiral infinitely
      const clamped = Math.max(-3, Math.min(3, current + delta));
      return {
        ...state,
        npcAttitudes: {
          ...state.npcAttitudes,
          [npcId]: clamped
        }
      };
    }

    // ---- Rumors -----------------------------------------------------------

    case ACTIONS.SET_RUMORS: {
      return { ...state, activeRumors: action.payload };
    }

    // ---- Hirelings --------------------------------------------------------

    case ACTIONS.RECRUIT_HIRELING: {
      const template = action.payload;
      const instanceId = `${template.templateId}_${Date.now()}`;
      const hireling = {
        ...template,
        instanceId,
        loyalty: template.loyalty ?? 0,
        isAlive: true
      };
      return {
        ...state,
        hirelings: [...state.hirelings, hireling]
      };
    }

    case ACTIONS.DISMISS_HIRELING: {
      const { instanceId } = action.payload;
      return {
        ...state,
        hirelings: state.hirelings.filter(h => h.instanceId !== instanceId)
      };
    }

    case ACTIONS.UPDATE_HIRELING: {
      // Partial update — merge patch by instanceId
      const { instanceId, updates } = action.payload;
      return {
        ...state,
        hirelings: state.hirelings.map(h =>
          h.instanceId === instanceId ? { ...h, ...updates } : h
        )
      };
    }

    case ACTIONS.HIRELING_DIED: {
      const { instanceId } = action.payload;
      return {
        ...state,
        hirelings: state.hirelings.map(h =>
          h.instanceId === instanceId ? { ...h, isAlive: false, hp: { ...h.hp, current: 0 } } : h
        )
      };
    }

    case ACTIONS.SYNC_HIRELINGS: {
      // Called when returning from a dungeon run.
      // action.payload is an array of { instanceId, hp, loyalty, isAlive }
      const updates = action.payload; // array of partial updates
      return {
        ...state,
        hirelings: state.hirelings.map(h => {
          const update = updates.find(u => u.instanceId === h.instanceId);
          return update ? { ...h, ...update } : h;
        })
      };
    }

    // ---- Economy ----------------------------------------------------------

    case ACTIONS.DEPOSIT_GOLD: {
      const { amount } = action.payload;
      return {
        ...state,
        bankBalance: state.bankBalance + Math.max(0, amount)
      };
    }

    case ACTIONS.WITHDRAW_GOLD: {
      const { amount } = action.payload;
      const actual = Math.min(amount, state.bankBalance);
      return {
        ...state,
        bankBalance: state.bankBalance - actual
      };
    }

    // ---- Temple -----------------------------------------------------------

    case ACTIONS.SET_RESURRECTION_PENDING: {
      return { ...state, templeResurrectionPending: true };
    }

    case ACTIONS.RESOLVE_RESURRECTION: {
      // The tithe and hireling removal are handled by CharacterContext and
      // the caller before dispatching this action. We only clear the flag here.
      return { ...state, templeResurrectionPending: false };
    }

    // ---- Town Hall --------------------------------------------------------

    case ACTIONS.REGISTER_ADVENTURER: {
      return { ...state, registeredAdventurer: true };
    }

    case ACTIONS.ACCEPT_CONTRACT: {
      const { contractId } = action.payload;
      if (state.activeContracts.some(c => c.contractId === contractId)) return state;
      return {
        ...state,
        activeContracts: [
          ...state.activeContracts,
          { contractId, acceptedAt: Date.now(), status: 'active' }
        ]
      };
    }

    case ACTIONS.COMPLETE_CONTRACT: {
      const { contractId } = action.payload;
      return {
        ...state,
        activeContracts: state.activeContracts.map(c =>
          c.contractId === contractId ? { ...c, status: 'completed' } : c
        )
      };
    }

    // ---- Guild ------------------------------------------------------------

    case ACTIONS.JOIN_GUILD: {
      return { ...state, isGuildMember: true };
    }

    // ---- Item Storage -----------------------------------------------------

    case ACTIONS.STORE_ITEM: {
      const { item } = action.payload;
      return {
        ...state,
        storedItems: [...state.storedItems, { ...item, storedAt: Date.now() }]
      };
    }

    case ACTIONS.RETRIEVE_ITEM: {
      const { itemId } = action.payload;
      // Remove first matching itemId from storage
      const idx = state.storedItems.findIndex(i => i.id === itemId);
      if (idx === -1) return state;
      const next = [...state.storedItems];
      next.splice(idx, 1);
      return { ...state, storedItems: next };
    }

    // ---- Identification ---------------------------------------------------

    case ACTIONS.REQUEST_IDENTIFICATION: {
      const { itemId } = action.payload;
      return {
        ...state,
        pendingIdentifications: [
          ...state.pendingIdentifications,
          { itemId, requestedAt: Date.now() }
        ]
      };
    }

    case ACTIONS.COMPLETE_IDENTIFICATION: {
      const { itemId } = action.payload;
      return {
        ...state,
        pendingIdentifications: state.pendingIdentifications.filter(
          i => i.itemId !== itemId
        )
      };
    }

    // ---- Rest -------------------------------------------------------------

    case ACTIONS.SET_LAST_REST: {
      return { ...state, lastRestLocation: action.payload };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// CONTEXT + PROVIDER
// ---------------------------------------------------------------------------
const TownContext = createContext(null);

export function TownProvider({ children }) {
  const [state, dispatch] = useReducer(townReducer, initialState);

  // --- Persistence: load on mount ----------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: ACTIONS.LOAD_STATE, payload: parsed });
      }
    } catch (err) {
      console.error('[TownContext] Failed to load saved town state:', err);
    }
  }, []);

  // --- Persistence: debounced save on state changes ----------------------
  const saveTimer = useRef(null);
  useEffect(() => {
    // Only persist once the town has been initialized (avoids overwriting a
    // saved state with the blank initialState on first render before load)
    if (!state.initialized) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('[TownContext] Failed to save town state:', err);
      }
    }, 600); // 600ms debounce — matches AdventureContext pattern

    return () => clearTimeout(saveTimer.current);
  }, [state]);

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS (stable references via useCallback)
  // ---------------------------------------------------------------------------

  /** Call once when the player arrives in town for the first time ever. */
  const initTown = useCallback(() => {
    if (!state.initialized) {
      dispatch({ type: ACTIONS.INIT_TOWN });
    } else {
      dispatch({ type: ACTIONS.INCREMENT_VISIT_COUNT });
    }
  }, [state.initialized]);

  /** Mark a location as visited (for first-visit flavour text). */
  const markLocationVisited = useCallback((locationId) => {
    dispatch({ type: ACTIONS.MARK_LOCATION_VISITED, payload: { locationId } });
  }, []);

  /** Returns true if the player has entered this location before. */
  const hasVisitedLocation = useCallback((locationId) => {
    return state.visitedLocations.includes(locationId);
  }, [state.visitedLocations]);

  // ---- NPC Attitudes ------------------------------------------------------

  /**
   * Shift an NPC's attitude score.
   * @param {string} npcId
   * @param {number} delta  — positive = friendlier, negative = more hostile
   */
  const shiftAttitude = useCallback((npcId, delta) => {
    dispatch({ type: ACTIONS.SHIFT_ATTITUDE, payload: { npcId, delta } });
  }, []);

  /**
   * Get the attitude label for an NPC.
   * @param {string} npcId
   * @returns {'hostile'|'neutral'|'friendly'}
   */
  const getAttitude = useCallback((npcId) => {
    return scoreToAttitude(state.npcAttitudes[npcId] ?? 0);
  }, [state.npcAttitudes]);

  // ---- Rumors -------------------------------------------------------------

  /** Re-roll rumors (should only be called on character death / new game). */
  const rerollRumors = useCallback(() => {
    dispatch({ type: ACTIONS.SET_RUMORS, payload: rollRumors() });
  }, []);

  // ---- Hirelings ----------------------------------------------------------

  /**
   * Recruit a hireling from the roster.
   * @param {string} templateId — matches hirelingRoster[n].templateId
   * @returns {{ success: boolean, reason?: string }}
   */
  const recruitHireling = useCallback((templateId) => {
    const template = hirelingRoster.find(h => h.templateId === templateId);
    if (!template) return { success: false, reason: 'Unknown hireling' };

    const alreadyRecruited = state.hirelings.some(
      h => h.templateId === templateId && h.isAlive
    );
    if (alreadyRecruited) return { success: false, reason: 'Already in your party' };

    dispatch({ type: ACTIONS.RECRUIT_HIRELING, payload: template });
    return { success: true };
  }, [state.hirelings]);

  /** Dismiss a hireling by their instanceId. */
  const dismissHireling = useCallback((instanceId) => {
    dispatch({ type: ACTIONS.DISMISS_HIRELING, payload: { instanceId } });
  }, []);

  /**
   * Update a hireling's state (hp, loyalty, mode, etc.)
   * @param {string} instanceId
   * @param {Object} updates — partial updates to merge
   */
  const updateHireling = useCallback((instanceId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_HIRELING, payload: { instanceId, updates } });
  }, []);

  /**
   * Mark a hireling as dead (does not remove — persisted as memorial).
   * @param {string} instanceId
   */
  const hirelingDied = useCallback((instanceId) => {
    dispatch({ type: ACTIONS.HIRELING_DIED, payload: { instanceId } });
  }, []);

  /**
   * Sync hireling state back from AdventureContext after a dungeon run.
   * @param {Array<{ instanceId, hp, loyalty, isAlive }>} updates
   */
  const syncHirelings = useCallback((updates) => {
    dispatch({ type: ACTIONS.SYNC_HIRELINGS, payload: updates });
  }, []);

  /** Returns only alive hirelings. */
  const getLivingHirelings = useCallback(() => {
    return state.hirelings.filter(h => h.isAlive);
  }, [state.hirelings]);

  // ---- Economy ------------------------------------------------------------

  /**
   * Deposit gold into the town bank.
   * IMPORTANT: caller must also call character.updateGold(-amount) to
   * deduct from the character sheet. TownContext only tracks the bank side.
   * @param {number} amount
   */
  const depositGold = useCallback((amount) => {
    dispatch({ type: ACTIONS.DEPOSIT_GOLD, payload: { amount } });
  }, []);

  /**
   * Withdraw gold from the town bank.
   * Returns actual amount withdrawn (may be less than requested).
   * Caller must call character.updateGold(+actual) to add to character sheet.
   * @param {number} amount
   * @returns {number} actual amount withdrawn
   */
  const withdrawGold = useCallback((amount) => {
    const actual = Math.min(amount, state.bankBalance);
    dispatch({ type: ACTIONS.WITHDRAW_GOLD, payload: { amount } });
    return actual;
  }, [state.bankBalance]);

  // ---- Temple -------------------------------------------------------------

  /**
   * Trigger the Temple Resurrection loop.
   * Called by AdventureContext when character dies with a living hireling.
   * The 15% tithe and hireling removal are applied by the caller BEFORE
   * this is invoked — this only sets the flag and TownScreen handles the rest.
   */
  const triggerTempleResurrection = useCallback(() => {
    dispatch({ type: ACTIONS.SET_RESURRECTION_PENDING });
  }, []);

  /** Clear the resurrection pending flag (called by Temple component). */
  const resolveResurrection = useCallback(() => {
    dispatch({ type: ACTIONS.RESOLVE_RESURRECTION });
  }, []);

  // ---- Town Hall ----------------------------------------------------------

  const registerAdventurer = useCallback(() => {
    dispatch({ type: ACTIONS.REGISTER_ADVENTURER });
  }, []);

  const acceptContract = useCallback((contractId) => {
    dispatch({ type: ACTIONS.ACCEPT_CONTRACT, payload: { contractId } });
  }, []);

  const completeContract = useCallback((contractId) => {
    dispatch({ type: ACTIONS.COMPLETE_CONTRACT, payload: { contractId } });
  }, []);

  const hasContract = useCallback((contractId) => {
    return state.activeContracts.some(c => c.contractId === contractId);
  }, [state.activeContracts]);

  const getContractStatus = useCallback((contractId) => {
    const c = state.activeContracts.find(c => c.contractId === contractId);
    return c?.status ?? null;
  }, [state.activeContracts]);

  // ---- Guild --------------------------------------------------------------

  const joinGuild = useCallback(() => {
    dispatch({ type: ACTIONS.JOIN_GUILD });
  }, []);

  /**
   * Get the shop price discount multiplier for this character.
   * Guild members get 10% off.
   * @returns {number} 0.9 if guild member, 1.0 otherwise
   */
  const getShopDiscount = useCallback(() => {
    return state.isGuildMember ? 0.9 : 1.0;
  }, [state.isGuildMember]);

  // ---- Item Storage -------------------------------------------------------

  const storeItem = useCallback((item) => {
    dispatch({ type: ACTIONS.STORE_ITEM, payload: { item } });
  }, []);

  const retrieveItem = useCallback((itemId) => {
    dispatch({ type: ACTIONS.RETRIEVE_ITEM, payload: { itemId } });
  }, []);

  // ---- Identification -----------------------------------------------------

  const requestIdentification = useCallback((itemId) => {
    dispatch({ type: ACTIONS.REQUEST_IDENTIFICATION, payload: { itemId } });
  }, []);

  const completeIdentification = useCallback((itemId) => {
    dispatch({ type: ACTIONS.COMPLETE_IDENTIFICATION, payload: { itemId } });
  }, []);

  const isPendingIdentification = useCallback((itemId) => {
    return state.pendingIdentifications.some(i => i.itemId === itemId);
  }, [state.pendingIdentifications]);

  // ---- Rest ---------------------------------------------------------------

  const setLastRestLocation = useCallback((locationId) => {
    dispatch({ type: ACTIONS.SET_LAST_REST, payload: locationId });
  }, []);

  // ---------------------------------------------------------------------------
  // CONTEXT VALUE
  // ---------------------------------------------------------------------------
  const value = {
    // Raw state (for components that need to read multiple fields)
    town: state,

    // Lifecycle
    initTown,
    markLocationVisited,
    hasVisitedLocation,

    // NPC attitudes
    shiftAttitude,
    getAttitude,

    // Rumors
    rerollRumors,

    // Hirelings
    recruitHireling,
    dismissHireling,
    updateHireling,
    hirelingDied,
    syncHirelings,
    getLivingHirelings,

    // Economy
    depositGold,
    withdrawGold,

    // Temple
    triggerTempleResurrection,
    resolveResurrection,

    // Town Hall
    registerAdventurer,
    acceptContract,
    completeContract,
    hasContract,
    getContractStatus,

    // Guild
    joinGuild,
    getShopDiscount,

    // Item storage
    storeItem,
    retrieveItem,

    // Identification
    requestIdentification,
    completeIdentification,
    isPendingIdentification,

    // Rest
    setLastRestLocation
  };

  return (
    <TownContext.Provider value={value}>
      {children}
    </TownContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------------------
export function useTown() {
  const context = useContext(TownContext);
  if (!context) {
    throw new Error('useTown must be used within a TownProvider');
  }
  return context;
}

export default TownContext;
