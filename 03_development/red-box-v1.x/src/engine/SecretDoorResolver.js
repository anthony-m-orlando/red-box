/**
 * SecretDoorResolver.js
 * Secret Door Detection and Search System
 *
 * Pure functions — receive state, return results and state patches.
 *
 * ─────────────────────────────────────────────────────────────────────
 * B/X Secret Door Rules:
 *
 *   Standard search (any class)    : 1-in-6 chance per search attempt
 *   Elf (passive while passing)    : 1-in-6 automatic when moving through
 *   Elf (active search)            : 2-in-6 chance
 *   Dwarf (stonework secret doors) : 2-in-6 chance
 *   Thief (find traps)             : per Thief ability table (we use 1-in-6
 *                                    at level 1, same as standard, thief
 *                                    excels at trap not door detection)
 *
 *   Once discovered, a secret door is permanently revealed for this run.
 *   It appears in getVisibleExits() as a normal exit.
 *
 *   Search also detects:
 *     - Traps (class-based detection chance)
 *     - Hidden features and treasure
 *
 * ─────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Detection Chances
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the secret door detection chance for a character class.
 * Returns a fraction (e.g. 1/6 = 0.1667).
 *
 * @param {string} characterClass — lowercase
 * @param {boolean} isActiveSearch — true if character is actively searching
 * @returns {number} probability 0-1
 */
export function getSecretDoorChance(characterClass, isActiveSearch = true) {
  const cls = characterClass?.toLowerCase();
  if (cls === 'elf') {
    return isActiveSearch ? 2 / 6 : 1 / 6;   // passive while moving: 1-in-6
  }
  if (cls === 'dwarf') {
    return 2 / 6;   // stonework expert
  }
  // All others: 1-in-6 on active search only
  return isActiveSearch ? 1 / 6 : 0;
}

/**
 * Get the trap detection chance for a character class.
 * @param {string} characterClass
 * @param {boolean} hasLight
 * @returns {number} probability 0-1
 */
export function getTrapDetectionChance(characterClass, hasLight = true) {
  const cls = characterClass?.toLowerCase();
  const darkPenalty = hasLight ? 1 : 0.25;   // 75% reduction in dark

  if (cls === 'thief') return 1.0 * darkPenalty;     // always detects if searching
  if (cls === 'dwarf') return 1.0 * darkPenalty;     // stonework expertise
  return (1 / 6) * darkPenalty;                       // default 1-in-6
}

// ─────────────────────────────────────────────────────────────────────────────
// Active Search Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a Search Room action.
 * Checks for secret doors, traps, and hidden features/treasure in one pass.
 *
 * Returns a comprehensive result object — the caller (AdventureContext)
 * decides which state patches to apply.
 *
 * @param {object} mod            — dungeon module
 * @param {object} dungeonState   — current dungeon state
 * @param {object} character      — character from CharacterContext
 * @returns {SearchResult}
 */
export function resolveSearch(mod, dungeonState, character) {
  const { currentLevel: level, currentRoomId: roomId } = dungeonState;
  const room = mod.getRoom ? mod.getRoom(roomId) : (mod.rooms?.[level]?.[roomId]);

  if (!room) {
    return buildResult({ narration: 'There is nothing here to search.' });
  }

  const cls = character?.class?.toLowerCase() || 'fighter';
  const hasLight = dungeonState.hasLight;
  const alreadySearched = (dungeonState.searchedRooms || []).includes(roomId);

  const results = {
    secretDoorsFound: [],
    trapsDetected: [],
    featuresFound: [],
    treasureRevealed: [],
    narrationLines: [],
    statePatch: {},
  };

  // ── Secret Doors ─────────────────────────────────────────────────────────
  const secretDoorResults = checkSecretDoors(mod, dungeonState, cls, level, roomId);
  results.secretDoorsFound = secretDoorResults.found;
  results.narrationLines.push(...secretDoorResults.narration);

  // ── Traps ─────────────────────────────────────────────────────────────────
  const trapResults = checkTraps(mod, dungeonState, cls, hasLight, level, roomId);
  results.trapsDetected = trapResults.detected;
  results.narrationLines.push(...trapResults.narration);

  // ── Hidden Features & Treasure ────────────────────────────────────────────
  if (!alreadySearched) {
    const featureResults = checkHiddenFeatures(mod, dungeonState, level, roomId);
    results.featuresFound = featureResults.features;
    results.treasureRevealed = featureResults.treasure;
    results.narrationLines.push(...featureResults.narration);
  } else {
    results.narrationLines.push('You have already searched this room carefully.');
  }

  // ── No Finds ──────────────────────────────────────────────────────────────
  if (
    results.secretDoorsFound.length === 0 &&
    results.trapsDetected.length === 0 &&
    results.featuresFound.length === 0 &&
    results.treasureRevealed.length === 0 &&
    !alreadySearched
  ) {
    results.narrationLines.push(getNoFindNarration());
  }

  // ── Build State Patch ─────────────────────────────────────────────────────
  const newDiscovered = [
    ...(dungeonState.discoveredSecretDoors || []),
    ...results.secretDoorsFound,
  ];
  const newDetectedTraps = [
    ...(dungeonState.detectedTraps || []),
    ...results.trapsDetected,
  ];
  const newSearchedRooms = alreadySearched
    ? dungeonState.searchedRooms
    : [...(dungeonState.searchedRooms || []), roomId];

  results.statePatch = {
    discoveredSecretDoors: [...new Set(newDiscovered)],
    detectedTraps: [...new Set(newDetectedTraps)],
    searchedRooms: newSearchedRooms,
  };

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Checks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check for secret doors in a room.
 * @param {object} mod
 * @param {object} dungeonState
 * @param {string} cls — character class
 * @param {number} level
 * @param {string} roomId
 * @returns {{ found: string[], narration: string[] }}
 */
function checkSecretDoors(mod, dungeonState, cls, level, roomId) {
  const room = mod.rooms?.[level]?.[roomId];
  if (!room) return { found: [], narration: [] };

  const secretExits = (room.exits || []).filter(e => e.doorType === 'secret');
  if (!secretExits.length) return { found: [], narration: [] };

  const alreadyDiscovered = new Set(dungeonState.discoveredSecretDoors || []);
  const undiscovered = secretExits.filter(e => !alreadyDiscovered.has(e.secretDoorId));
  if (!undiscovered.length) return { found: [], narration: [] };

  const chance = getSecretDoorChance(cls, true);
  const found = [];
  const narration = [];

  for (const exit of undiscovered) {
    if (Math.random() < chance) {
      found.push(exit.secretDoorId);
      const doorDef = mod.secretDoors?.[level]?.[exit.secretDoorId];
      const hint = doorDef?.hint || 'A hidden door is revealed!';
      narration.push(`You discover a secret door! ${hint}`);
    }
  }

  return { found, narration };
}

/**
 * Check for traps in a room.
 * @param {object} mod
 * @param {object} dungeonState
 * @param {string} cls
 * @param {boolean} hasLight
 * @param {number} level
 * @param {string} roomId
 * @returns {{ detected: string[], narration: string[] }}
 */
function checkTraps(mod, dungeonState, cls, hasLight, level, roomId) {
  const room = mod.rooms?.[level]?.[roomId];
  if (!room?.contents?.traps?.length) return { detected: [], narration: [] };

  const alreadyDetected = new Set(dungeonState.detectedTraps || []);
  const alreadyTriggered = new Set(dungeonState.triggeredTraps || []);
  const activeTraps = room.contents.traps.filter(
    t => !alreadyDetected.has(t.id) && !alreadyTriggered.has(t.id)
  );

  if (!activeTraps.length) return { detected: [], narration: [] };

  const chance = getTrapDetectionChance(cls, hasLight);
  const detected = [];
  const narration = [];

  for (const trap of activeTraps) {
    // Use trap-specific override if defined
    const trapChance = trap.detectChance?.[cls] ?? trap.detectChance?.default ?? chance;
    if (Math.random() < trapChance) {
      detected.push(trap.id);
      narration.push(`You notice a trap: ${trap.description}`);
    }
  }

  return { detected, narration };
}

/**
 * Check for hidden features and treasure in a room (first search only).
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {{ features: string[], treasure: string[], narration: string[] }}
 */
function checkHiddenFeatures(mod, dungeonState, level, roomId) {
  const room = mod.rooms?.[level]?.[roomId];
  if (!room) return { features: [], treasure: [], narration: [] };

  const features = [];
  const treasure = [];
  const narration = [];

  // Hidden features
  const hiddenFeatures = (room.contents?.features || []).filter(f => f.searchRequired);
  for (const feature of hiddenFeatures) {
    features.push(feature.id);
    narration.push(`You find: ${feature.name}. ${feature.description}`);
  }

  // Treasure that requires search
  const collected = new Set(dungeonState.collectedTreasure || []);
  const hiddenTreasure = (room.contents?.treasure || []).filter(t => {
    if (collected.has(t.id)) return false;
    return t.description?.toLowerCase().includes('search') || false;
  });

  for (const t of hiddenTreasure) {
    treasure.push(t.id);
    if (t.gold > 0) {
      narration.push(`Search reveals: ${t.description || `${t.gold} gold pieces`}.`);
    }
    for (const item of (t.items || [])) {
      narration.push(`You find: ${item.name} — ${item.description}`);
    }
  }

  return { features, treasure, narration };
}

// ─────────────────────────────────────────────────────────────────────────────
// Passive Elf Detection (movement-based)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roll passive elf detection when an elf moves past a secret door.
 * Called by AdventureContext when processing room entry for an elf character.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId      — the room being entered
 * @returns {{ found: string[], narration: string[] }}
 */
export function resolveElfPassiveDetection(mod, dungeonState, level, roomId) {
  const room = mod.rooms?.[level]?.[roomId];
  if (!room) return { found: [], narration: [] };

  const secretExits = (room.exits || []).filter(e => e.doorType === 'secret');
  if (!secretExits.length) return { found: [], narration: [] };

  const alreadyDiscovered = new Set(dungeonState.discoveredSecretDoors || []);
  const undiscovered = secretExits.filter(e => !alreadyDiscovered.has(e.secretDoorId));
  if (!undiscovered.length) return { found: [], narration: [] };

  const found = [];
  const narration = [];
  const passiveChance = 1 / 6;

  for (const exit of undiscovered) {
    if (Math.random() < passiveChance) {
      found.push(exit.secretDoorId);
      narration.push(
        'Your elven senses detect something odd about the wall nearby — there may be a hidden door here.'
      );
    }
  }

  return { found, narration };
}

// ─────────────────────────────────────────────────────────────────────────────
// Trap Triggering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a trap being triggered (movement without detection).
 * Returns damage and narration — caller applies HP changes.
 *
 * @param {object} trap     — trap object from room definition
 * @param {object} character — character from CharacterContext
 * @returns {{ damage: number, narration: string, trapId: string }}
 */
export function resolveTrapTrigger(trap, character) {
  let damage = 0;
  let narration = '';

  if (trap.damage) {
    damage = rollDiceFormula(trap.damage);
    narration = `You trigger a trap! ${trap.description} You take ${damage} damage.`;
  } else if (trap.effect) {
    narration = `You trigger a trap! ${trap.description} ${trap.effect}`;
  } else {
    narration = `You trigger a trap! ${trap.description}`;
  }

  return { damage, narration, trapId: trap.id };
}

/**
 * Check whether automatic traps in a room trigger on entry.
 * Environmental hazards (spores, cold) trigger after a set number of turns.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {object[]} Array of traps that should fire
 */
export function getTriggeredAutoHazards(mod, dungeonState, level, roomId) {
  const room = mod.rooms?.[level]?.[roomId];
  if (!room?.contents?.traps) return [];

  const triggered = new Set(dungeonState.triggeredTraps || []);
  return room.contents.traps.filter(t =>
    t.autoTrigger === true && !triggered.has(t.id)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roll a dice formula string, e.g. '1d6', '2d4', '1d6+1'.
 * @param {string} formula
 * @returns {number}
 */
function rollDiceFormula(formula) {
  if (!formula || typeof formula !== 'string') return 0;

  // Handle NdN+M and NdN-M
  const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return 0;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  let total = modifier;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return Math.max(0, total);
}

/**
 * Build a standardized SearchResult object.
 * @param {object} overrides
 * @returns {object}
 */
function buildResult(overrides = {}) {
  return {
    secretDoorsFound: [],
    trapsDetected: [],
    featuresFound: [],
    treasureRevealed: [],
    narrationLines: overrides.narration ? [overrides.narration] : [],
    statePatch: {},
    ...overrides,
  };
}

/**
 * Get a random "nothing found" narration line.
 * @returns {string}
 */
function getNoFindNarration() {
  const lines = [
    'You search carefully. Nothing of note reveals itself.',
    'Your search turns up nothing beyond what you can already see.',
    'Dust and shadows are all that your search uncovers.',
    'A thorough inspection of the room finds nothing hidden.',
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

export default {
  getSecretDoorChance,
  getTrapDetectionChance,
  resolveSearch,
  resolveElfPassiveDetection,
  resolveTrapTrigger,
  getTriggeredAutoHazards,
};
