/**
 * TurnTracker.js
 * Turn Counter, Light Management, and Wandering Monster Clock
 *
 * All functions are pure — they receive state and return new state
 * or derived values. AdventureContext applies the returned patches.
 *
 * ─────────────────────────────────────────────────────────────────────
 * B/X D&D Turn Rules (implemented here):
 *
 *   1 turn = 10 minutes of game time
 *
 *   Movement:
 *     Entering a new room          = 1 turn
 *     Resting                      = 6 turns
 *     Searching a room             = 1 turn
 *     Attempting a locked door     = 1 turn (already counted in movement)
 *
 *   Light:
 *     Torch duration               = 6 turns
 *     Lantern duration             = 24 turns
 *     Light spell                  = 6 turns
 *     Wind corridor torch hazard   = 1-in-6 per turn extinguished
 *
 *   Wandering Monsters:
 *     Check every 2 turns          → roll 1d6
 *     On a 1                       → encounter spawned
 *     Cleared rooms never spawn    → checked by caller
 *
 * ─────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const TURNS_PER_WANDERING_CHECK = 2;
export const WANDERING_MONSTER_TRIGGER = 1;   // roll of 1 on d6 spawns

export const LIGHT_DURATIONS = {
  torch:       6,    // turns
  lantern:     24,   // turns
  light_spell: 6,    // turns
  infravision: Infinity,  // dwarves/elves never run out
};

export const LIGHT_CLASSES_WITH_INFRAVISION = ['dwarf', 'elf'];

// ─────────────────────────────────────────────────────────────────────────────
// Turn Advancement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Advance the turn counter by N turns.
 * Returns a patch object to be merged into dungeonState by the context.
 *
 * Side effects computed here (returned as flags):
 *   - wanderingMonsterDue:  true if a wandering monster check should fire
 *   - lightConsumed:        how many turns of light were used
 *   - lightExpired:         true if the light source ran out this advance
 *   - torchExtinguished:    true if wind corridor hazard extinguished torch
 *
 * @param {object} dungeonState   — current state
 * @param {number} turns          — number of turns to advance (default 1)
 * @param {object} options
 * @param {boolean} options.inWindCorridor  — apply wind corridor torch hazard
 * @returns {{ statePatch: object, events: object }}
 */
export function advanceTurns(dungeonState, turns = 1, options = {}) {
  const { inWindCorridor = false } = options;

  const previousTurnCount = dungeonState.turnCount || 0;
  const newTurnCount = previousTurnCount + turns;

  // ── Light Consumption ───────────────────────────────────────────────────
  let hasLight = dungeonState.hasLight;
  let lightSource = dungeonState.lightSource;
  let lightDuration = dungeonState.lightDuration || 0;
  let lightExpired = false;
  let torchExtinguished = false;

  if (hasLight && lightSource !== 'infravision') {
    lightDuration -= turns;

    // Wind corridor: each turn has 1-in-6 chance of extinguishing torch
    if (inWindCorridor && lightSource === 'torch') {
      for (let i = 0; i < turns; i++) {
        if (Math.floor(Math.random() * 6) === 0) {
          torchExtinguished = true;
          lightDuration = 0;
          break;
        }
      }
    }

    if (lightDuration <= 0) {
      lightDuration = 0;
      lightExpired = true;
      hasLight = false;
      lightSource = null;
    }
  }

  // ── Wandering Monster Check ─────────────────────────────────────────────
  // Check fires every TURNS_PER_WANDERING_CHECK turns.
  // We detect if any check interval was crossed in this advance.
  const previousChecks = Math.floor(previousTurnCount / TURNS_PER_WANDERING_CHECK);
  const newChecks = Math.floor(newTurnCount / TURNS_PER_WANDERING_CHECK);
  const checksThisAdvance = newChecks - previousChecks;

  let wanderingMonsterDue = false;
  if (checksThisAdvance > 0) {
    // One roll per check interval crossed, any 1 triggers
    for (let i = 0; i < checksThisAdvance; i++) {
      if (rollWanderingMonsterCheck()) {
        wanderingMonsterDue = true;
        break;
      }
    }
  }

  const statePatch = {
    turnCount: newTurnCount,
    hasLight,
    lightSource,
    lightDuration,
    wanderingMonsterDue,
  };

  const events = {
    wanderingMonsterDue,
    lightExpired,
    torchExtinguished,
    turnsAdvanced: turns,
  };

  return { statePatch, events };
}

/**
 * Roll the wandering monster check.
 * Returns true if monsters appear (roll of 1 on d6).
 * @returns {boolean}
 */
export function rollWanderingMonsterCheck() {
  return Math.floor(Math.random() * 6) === 0;  // 1-in-6
}

// ─────────────────────────────────────────────────────────────────────────────
// Light Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine if a character class uses infravision instead of torchlight.
 * @param {string} characterClass — lowercase class string
 * @returns {boolean}
 */
export function classHasInfravision(characterClass) {
  return LIGHT_CLASSES_WITH_INFRAVISION.includes(characterClass?.toLowerCase());
}

/**
 * Light a new light source. Returns a state patch.
 * Extinguishes the previous source if different type.
 *
 * @param {object} dungeonState
 * @param {'torch'|'lantern'|'light_spell'|'infravision'} sourceType
 * @returns {object} State patch
 */
export function lightSource(dungeonState, sourceType) {
  const duration = LIGHT_DURATIONS[sourceType] ?? 6;
  return {
    hasLight: true,
    lightSource: sourceType,
    lightDuration: duration,
  };
}

/**
 * Extinguish the current light source. Returns a state patch.
 * @returns {object} State patch
 */
export function extinguishLight() {
  return {
    hasLight: false,
    lightSource: null,
    lightDuration: 0,
  };
}

/**
 * Get a descriptive string for the current light status.
 * Used by the TurnCounter UI component.
 *
 * @param {object} dungeonState
 * @returns {{ label: string, urgency: 'safe'|'warning'|'critical'|'dark' }}
 */
export function getLightStatus(dungeonState) {
  if (!dungeonState.hasLight) {
    return { label: 'No light — darkness!', urgency: 'dark' };
  }

  const { lightSource: src, lightDuration: dur } = dungeonState;

  if (src === 'infravision') {
    return { label: 'Infravision (no light needed)', urgency: 'safe' };
  }

  const sourceLabel = src === 'torch' ? 'Torch'
    : src === 'lantern' ? 'Lantern'
    : src === 'light_spell' ? 'Light Spell'
    : 'Light source';

  if (dur <= 0) {
    return { label: `${sourceLabel} — burned out`, urgency: 'dark' };
  }
  if (dur === 1) {
    return { label: `${sourceLabel} — sputtering out! (1 turn)`, urgency: 'critical' };
  }
  if (dur <= 2) {
    return { label: `${sourceLabel} — almost out (${dur} turns)`, urgency: 'critical' };
  }
  if (dur <= 3) {
    return { label: `${sourceLabel} — low (${dur} turns)`, urgency: 'warning' };
  }
  return { label: `${sourceLabel} — ${dur} turns remaining`, urgency: 'safe' };
}

/**
 * Initialize light for a character at dungeon start.
 * Dwarves/Elves get infravision. Others check their inventory for torches/lanterns.
 *
 * @param {string} characterClass   — lowercase
 * @param {object[]} inventory      — character inventory items
 * @returns {object} State patch for light fields
 */
export function initializeLightForCharacter(characterClass, inventory = []) {
  if (classHasInfravision(characterClass)) {
    return {
      hasLight: true,
      lightSource: 'infravision',
      lightDuration: Infinity,
    };
  }

  // Look for lantern first (longer duration), then torch
  const hasLantern = inventory.some(item =>
    item.type === 'light' && item.id?.includes('lantern')
  );
  const hasTorch = inventory.some(item =>
    item.type === 'light' && item.id?.includes('torch')
  );

  if (hasLantern) {
    return {
      hasLight: true,
      lightSource: 'lantern',
      lightDuration: LIGHT_DURATIONS.lantern,
    };
  }
  if (hasTorch) {
    return {
      hasLight: true,
      lightSource: 'torch',
      lightDuration: LIGHT_DURATIONS.torch,
    };
  }

  return {
    hasLight: false,
    lightSource: null,
    lightDuration: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rest Mechanic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the result of a rest action.
 * A rest costs 6 turns, restores HP (1d4 + CON modifier), and restores spell slots.
 * Cannot rest if monsters are present.
 *
 * @param {object} character    — character object from CharacterContext
 * @param {boolean} hasMonsters — whether living monsters are in the current room
 * @param {boolean} hasRested   — whether the character has already rested this run
 * @returns {{ allowed: boolean, reason: string|null, hpRestored: number, turnCost: number }}
 */
export function calculateRest(character, hasMonsters, hasRested) {
  if (hasMonsters) {
    return { allowed: false, reason: 'You cannot rest while monsters are present.', hpRestored: 0, turnCost: 0 };
  }
  if (hasRested) {
    return { allowed: false, reason: 'You have already rested on this expedition.', hpRestored: 0, turnCost: 0 };
  }

  const conMod = getConstitutionModifier(character?.abilities?.constitution || 10);
  const roll = Math.floor(Math.random() * 4) + 1;  // 1d4
  const hpRestored = Math.max(1, roll + conMod);

  return {
    allowed: true,
    reason: null,
    hpRestored,
    turnCost: 6,
    narration: `You rest for a turn. You recover ${hpRestored} hit point${hpRestored !== 1 ? 's' : ''}.`,
  };
}

/**
 * Get Constitution HP modifier (B/X table).
 * @param {number} con
 * @returns {number}
 */
function getConstitutionModifier(con) {
  if (con <= 3)  return -3;
  if (con <= 5)  return -2;
  if (con <= 8)  return -1;
  if (con <= 12) return  0;
  if (con <= 15) return  1;
  if (con <= 17) return  2;
  return 3;
}

// ─────────────────────────────────────────────────────────────────────────────
// Turn Display Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a human-readable label for the current turn count.
 * @param {number} turnCount
 * @returns {string}
 */
export function getTurnLabel(turnCount) {
  const hours = Math.floor(turnCount / 6);
  const remainingTurns = turnCount % 6;
  if (hours === 0) return `Turn ${turnCount}`;
  if (remainingTurns === 0) return `${hours}h elapsed (Turn ${turnCount})`;
  return `${hours}h ${remainingTurns * 10}min elapsed (Turn ${turnCount})`;
}

/**
 * Get the next wandering monster check turn number.
 * @param {number} turnCount
 * @returns {number}
 */
export function getNextWanderingCheckTurn(turnCount) {
  const currentCheck = Math.floor(turnCount / TURNS_PER_WANDERING_CHECK);
  return (currentCheck + 1) * TURNS_PER_WANDERING_CHECK;
}

export default {
  advanceTurns,
  rollWanderingMonsterCheck,
  classHasInfravision,
  lightSource,
  extinguishLight,
  getLightStatus,
  initializeLightForCharacter,
  calculateRest,
  getTurnLabel,
  getNextWanderingCheckTurn,
  TURNS_PER_WANDERING_CHECK,
  WANDERING_MONSTER_TRIGGER,
  LIGHT_DURATIONS,
  LIGHT_CLASSES_WITH_INFRAVISION,
};
