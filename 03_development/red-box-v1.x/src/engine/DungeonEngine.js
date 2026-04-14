/**
 * DungeonEngine.js
 * Core Dungeon Engine — Pure Functions
 *
 * All functions are stateless. They receive the module and the current
 * dungeonState (from AdventureContext) and return answers — they never
 * mutate anything.
 *
 * AdventureContext owns state. DungeonEngine answers questions about it.
 *
 * Import pattern:
 *   import * as DungeonEngine from '../engine/DungeonEngine';
 *
 * ─────────────────────────────────────────────────────────────────────
 * dungeonState shape (managed by AdventureContext):
 * {
 *   moduleId: 'quasqueton',
 *   currentLevel: 1,
 *   currentRoomId: 'q1_1',
 *   previousRoomId: null,
 *
 *   roomStates: {
 *     1: { q1_1: 'entered', q1_2: 'unexplored', ... },
 *     2: { q2_1: 'unexplored', ... }
 *   },
 *
 *   defeatedMonsters: [],        // instance IDs
 *   collectedTreasure: [],       // treasure IDs
 *   searchedRooms: [],           // room IDs where Search has been used
 *   discoveredSecretDoors: [],   // secretDoorId strings
 *   visitedRooms: { 1: [], 2: [] },
 *
 *   turnCount: 0,
 *   wanderingMonsterDue: false,
 *
 *   inCombat: false,
 *   currentEnemy: null,
 *
 *   narrationHistory: [],
 *   isVictorious: false,
 *   isDefeated: false,
 *   hasLight: false,
 *   lightSource: null,
 *   lightDuration: 0,
 * }
 * ─────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────────────────────
// Module Access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the full module object from the registry.
 * Imported lazily to avoid circular dependency at module load time.
 * @param {string} moduleId
 * @returns {object}
 */
export function getModule(moduleId) {
  // NOTE: This function is provided for completeness but is not called by
  // the current codebase — AdventureContext uses getModuleById() directly.
  // Callers should import getModuleById from the registry instead.
  throw new Error(
    `[DungeonEngine] getModule() is not available. ` +
    `Import getModuleById from data/dungeons/registry and call it directly.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Room Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a room definition from the module.
 * @param {object} mod      — module object (from getModule)
 * @param {number} level    — 1 or 2
 * @param {string} roomId
 * @returns {object|null}
 */
export function getRoom(mod, level, roomId) {
  const levelRooms = mod.rooms?.[level];
  if (!levelRooms) return null;
  return levelRooms[roomId] || null;
}

/**
 * Get the current room from dungeonState.
 * @param {object} mod
 * @param {object} dungeonState
 * @returns {object|null}
 */
export function getCurrentRoom(mod, dungeonState) {
  return getRoom(mod, dungeonState.currentLevel, dungeonState.currentRoomId);
}

/**
 * Get the canonical room state string for a room.
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {'unexplored'|'entered'|'cleared'|'looted'}
 */
export function getRoomState(dungeonState, level, roomId) {
  return dungeonState.roomStates?.[level]?.[roomId] || 'unexplored';
}

/**
 * Check if a room has been visited (entered or beyond).
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {boolean}
 */
export function hasVisited(dungeonState, level, roomId) {
  return dungeonState.visitedRooms?.[level]?.includes(roomId) || false;
}

/**
 * Check if a room is fully cleared (no live monsters).
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {boolean}
 */
export function isRoomCleared(mod, dungeonState, level, roomId) {
  const state = getRoomState(dungeonState, level, roomId);
  if (state === 'cleared' || state === 'looted') return true;

  // Also compute it from live monsters in case state hasn't been updated yet
  const living = getLivingMonstersInRoom(mod, dungeonState, level, roomId);
  return living.length === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exit & Movement Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all visible exits from a room.
 * Secret doors are excluded unless their ID is in discoveredSecretDoors.
 * Stair exits are always included.
 *
 * @param {object} mod
 * @param {number} level
 * @param {string} roomId
 * @param {string[]} discoveredSecretDoors — from dungeonState
 * @returns {object[]} Array of exit objects
 */
export function getVisibleExits(mod, level, roomId, discoveredSecretDoors = []) {
  const room = getRoom(mod, level, roomId);
  if (!room) return [];

  return (room.exits || []).filter(exit => {
    // Always show non-secret exits
    if (exit.doorType !== 'secret') return true;
    // Show secret exits only if discovered
    return exit.secretDoorId && discoveredSecretDoors.includes(exit.secretDoorId);
  });
}

/**
 * Check if the player can enter a given room.
 * Returns { allowed: boolean, reason: string|null }
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} targetLevel
 * @param {string} targetRoomId
 * @param {string} fromRoomId    — the room the player is coming from
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canEnterRoom(mod, dungeonState, targetLevel, targetRoomId, fromRoomId) {
  // Can't move while in combat
  if (dungeonState.inCombat) {
    return { allowed: false, reason: 'You cannot move while in combat.' };
  }

  const fromRoom = getRoom(mod, dungeonState.currentLevel, fromRoomId);
  if (!fromRoom) {
    return { allowed: false, reason: 'Current room not found.' };
  }

  const targetRoom = getRoom(mod, targetLevel, targetRoomId);
  if (!targetRoom) {
    return { allowed: false, reason: 'Target room not found.' };
  }

  // Find the exit connecting from → target
  const discoveredSecretDoors = dungeonState.discoveredSecretDoors || [];
  const exits = getVisibleExits(mod, dungeonState.currentLevel, fromRoomId, discoveredSecretDoors);
  const exit = exits.find(e => e.targetRoomId === targetRoomId);

  if (!exit) {
    return { allowed: false, reason: 'No visible passage in that direction.' };
  }

  // Locked doors require a key item (resolved elsewhere — here we just block)
  if (exit.doorType === 'locked') {
    return { allowed: false, reason: 'The door is locked.' };
  }

  // Heavy doors require strength check (handled at interaction level, not here)
  // They are still traversable — just noisy

  return { allowed: true, reason: null };
}

/**
 * Find the exit object connecting a room to a specific target.
 * Searches all exits including discovered secrets.
 * @param {object} mod
 * @param {number} level
 * @param {string} fromRoomId
 * @param {string} targetRoomId
 * @param {string[]} discoveredSecretDoors
 * @returns {object|null}
 */
export function findExit(mod, level, fromRoomId, targetRoomId, discoveredSecretDoors = []) {
  const exits = getVisibleExits(mod, level, fromRoomId, discoveredSecretDoors);
  return exits.find(e => e.targetRoomId === targetRoomId) || null;
}

/**
 * Get the stair exit (if any) in a room.
 * @param {object} room
 * @returns {object|null}
 */
export function getStairExit(room) {
  if (!room?.exits) return null;
  return room.exits.find(e => e.doorType === 'stair') || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Monster Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all monster instances assigned to a room that are still alive.
 * Cross-references the room's monster list against defeatedMonsters in state.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {object[]} Array of live monster instance objects
 */
export function getLivingMonstersInRoom(mod, dungeonState, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.monsters?.length) return [];

  const allInstances = mod.monsterInstances?.[level] || {};
  const defeated = new Set(dungeonState.defeatedMonsters || []);

  return room.contents.monsters
    .filter(instanceId => !defeated.has(instanceId))
    .map(instanceId => allInstances[instanceId])
    .filter(Boolean);
}

/**
 * Get living monsters in the current room.
 * @param {object} mod
 * @param {object} dungeonState
 * @returns {object[]}
 */
export function getLivingMonstersInCurrentRoom(mod, dungeonState) {
  return getLivingMonstersInRoom(
    mod, dungeonState,
    dungeonState.currentLevel,
    dungeonState.currentRoomId
  );
}

/**
 * Check if a room has any living monsters.
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {boolean}
 */
export function roomHasLivingMonsters(mod, dungeonState, level, roomId) {
  return getLivingMonstersInRoom(mod, dungeonState, level, roomId).length > 0;
}

/**
 * Get a specific monster instance by its instanceId.
 * Searches both levels.
 * @param {object} mod
 * @param {string} instanceId
 * @returns {object|null}
 */
export function getMonsterInstance(mod, instanceId) {
  for (const level of [1, 2]) {
    const instances = mod.monsterInstances?.[level] || {};
    if (instances[instanceId]) return instances[instanceId];
  }
  return null;
}

/**
 * Get the monster type definition for an instance.
 * @param {object} mod
 * @param {string} instanceId
 * @returns {object|null}
 */
export function getMonsterTypeForInstance(mod, instanceId) {
  const instance = getMonsterInstance(mod, instanceId);
  if (!instance) return null;
  return mod.bestiary?.[instance.typeId] || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Treasure Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get uncollected treasure in a room.
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {object[]} Array of treasure/item objects not yet collected
 */
export function getUncollectedTreasure(mod, dungeonState, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.treasure?.length) return [];

  const collected = new Set(dungeonState.collectedTreasure || []);

  return room.contents.treasure.filter(t => !collected.has(t.id));
}

/**
 * Check if a room has uncollected treasure visible to the player.
 * Treasure that requires a Search is only visible if the room has been searched.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {boolean}
 */
export function roomHasVisibleTreasure(mod, dungeonState, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.treasure?.length) return false;

  const collected = new Set(dungeonState.collectedTreasure || []);
  const searched = (dungeonState.searchedRooms || []).includes(roomId);
  const cleared = isRoomCleared(mod, dungeonState, level, roomId);

  return room.contents.treasure.some(t => {
    if (collected.has(t.id)) return false;
    // Treasure that needs a Search (nested features flag) — only after search
    // Simple gold and visible items are always collectible after room is cleared
    const needsSearch = t.description?.toLowerCase().includes('search') || false;
    if (needsSearch && !searched) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Trap Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all undetected, untriggered traps in a room.
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @param {string} roomId
 * @returns {object[]}
 */
export function getActiveTraps(mod, dungeonState, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.traps?.length) return [];

  const triggeredTraps = new Set(dungeonState.triggeredTraps || []);
  const detectedTraps = new Set(dungeonState.detectedTraps || []);

  return room.contents.traps.filter(trap =>
    !triggeredTraps.has(trap.id) && !detectedTraps.has(trap.id)
  );
}

/**
 * Check if a room has auto-triggering environmental traps/hazards.
 * @param {object} mod
 * @param {number} level
 * @param {string} roomId
 * @returns {object[]}
 */
export function getAutoTriggeredHazards(mod, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.traps?.length) return [];
  return room.contents.traps.filter(t => t.autoTrigger === true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Special Room Features
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all interactive features in a room.
 * @param {object} mod
 * @param {number} level
 * @param {string} roomId
 * @returns {object[]}
 */
export function getInteractiveFeatures(mod, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.features?.length) return [];
  return room.contents.features.filter(f => f.interactive === true);
}

/**
 * Check if a room has a map-reveal feature (stone map, war map).
 * @param {object} mod
 * @param {number} level
 * @param {string} roomId
 * @returns {object|null} The feature object, or null
 */
export function getMapRevealFeature(mod, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.features?.length) return null;
  return room.contents.features.find(f => f.mapReveal === true) || null;
}

/**
 * Check if a room has a healing spring.
 * @param {object} mod
 * @param {number} level
 * @param {string} roomId
 * @returns {object|null}
 */
export function getHealingFeature(mod, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.features?.length) return null;
  return room.contents.features.find(f => f.restorative === true) || null;
}

/**
 * Check if a room has a cleric shrine.
 * @param {object} mod
 * @param {number} level
 * @param {string} roomId
 * @returns {object|null}
 */
export function getClericalShrine(mod, level, roomId) {
  const room = getRoom(mod, level, roomId);
  if (!room?.contents?.features?.length) return null;
  return room.contents.features.find(f => f.clerical === true) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Victory Condition Checking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether the player has met the required victory conditions.
 * In B1, the only hard requirement is exiting the dungeon alive (reaching q1_1).
 * Optional conditions (defeating the lizard, collecting the vault) earn bonus XP.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @returns {{ isVictorious: boolean, completedConditions: string[], pendingConditions: string[] }}
 */
export function checkVictory(mod, dungeonState) {
  const conditions = mod.victoryConditions || [];
  const completed = [];
  const pending = [];

  for (const condition of conditions) {
    let met = false;

    switch (condition.type) {
      case 'reach_room':
        met = (dungeonState.visitedRooms?.[1] || []).includes(condition.targetRoomId) ||
              (dungeonState.visitedRooms?.[2] || []).includes(condition.targetRoomId);
        // Special: winOnReach means RE-ENTERING this room after exploring = victory
        // Guard: only fires if player has visited more than 1 room, so the start
        // room doesn't immediately trigger victory on dungeon initialisation.
        if (condition.winOnReach) {
          const totalVisited = (dungeonState.visitedRooms?.[1]?.length ?? 0)
                             + (dungeonState.visitedRooms?.[2]?.length ?? 0);
          met = dungeonState.currentRoomId === condition.targetRoomId
                && !dungeonState.inCombat
                && totalVisited > 1;
        }
        break;

      case 'defeat_monster':
        met = (dungeonState.defeatedMonsters || []).includes(condition.targetInstanceId);
        break;

      case 'collect_treasure':
        met = (dungeonState.collectedTreasure || []).includes(condition.targetTreasureId);
        break;

      default:
        met = false;
    }

    if (met) completed.push(condition.id);
    else pending.push(condition.id);
  }

  // Victory requires all REQUIRED conditions to be met.
  // Guard: if no required conditions exist, never auto-victory (would fire on start).
  const requiredConditions = conditions.filter(c => c.required);
  const isVictorious = requiredConditions.length > 0
    && requiredConditions.every(c => completed.includes(c.id));

  return { isVictorious, completedConditions: completed, pendingConditions: pending };
}

/**
 * Calculate total XP earned in the current dungeon run.
 * XP from defeated monsters + XP bonuses for optional victory conditions.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @returns {number}
 */
export function calculateRunXP(mod, dungeonState) {
  let xp = 0;

  // XP from defeated monsters
  const defeated = dungeonState.defeatedMonsters || [];
  for (const instanceId of defeated) {
    const instance = getMonsterInstance(mod, instanceId);
    if (instance) xp += instance.xp || 0;
  }

  // XP from collected treasure (1 XP per GP value — classic B/X rule)
  const collected = dungeonState.collectedTreasure || [];
  for (const level of [1, 2]) {
    const levelRooms = mod.rooms?.[level] || {};
    for (const room of Object.values(levelRooms)) {
      for (const treasure of (room.contents?.treasure || [])) {
        if (collected.includes(treasure.id)) {
          xp += treasure.gold || 0;
        }
      }
    }
  }

  return xp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Map Data for Renderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all map data for a given level, merged with current dungeon state.
 * Used by DungeonMap.jsx to render the SVG.
 *
 * @param {object} mod
 * @param {object} dungeonState
 * @param {number} level
 * @returns {object[]} Array of room map objects
 */
export function getMapData(mod, dungeonState, level) {
  const levelRooms = mod.rooms?.[level] || {};
  const visited = new Set(dungeonState.visitedRooms?.[level] || []);
  const discovered = new Set(dungeonState.discoveredSecretDoors || []);

  return Object.values(levelRooms).map(room => {
    const isVisited = visited.has(room.id);
    const isCurrent = room.id === dungeonState.currentRoomId &&
                      dungeonState.currentLevel === level;
    const state = getRoomState(dungeonState, level, room.id);
    const hasMonsters = roomHasLivingMonsters(mod, dungeonState, level, room.id);

    // Visible exits for connection lines
    const exits = getVisibleExits(mod, level, room.id, [...discovered]);

    return {
      id: room.id,
      number: room.number,
      label: room.label,
      mapPos: room.mapPos,
      size: room.size || { w: 60, h: 60 },
      isVisited,
      isCurrent,
      state,               // 'unexplored' | 'entered' | 'cleared' | 'looted'
      hasMonsters,
      hasTreasure: roomHasVisibleTreasure(mod, dungeonState, level, room.id),
      isSpecial: room.isSpecialRoom || false,
      exits: exits.map(e => ({
        direction: e.direction,
        targetRoomId: e.targetRoomId,
        doorType: e.doorType,
        isSecret: e.doorType === 'secret',
        isStair: e.doorType === 'stair',
      })),
    };
  });
}

/**
 * Get all secret door IDs that EXIST in a given level's rooms.
 * Used by DungeonMap to know which doors to potentially render.
 * @param {object} mod
 * @param {number} level
 * @returns {string[]}
 */
export function getAllSecretDoorIds(mod, level) {
  const secretDoors = mod.secretDoors?.[level] || {};
  return Object.keys(secretDoors);
}

// ─────────────────────────────────────────────────────────────────────────────
// Narration Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the entry narration for entering a room.
 * Returns the room description, modified for darkness if applicable.
 *
 * @param {object} room      — room definition
 * @param {boolean} hasLight — whether the player has an active light source
 * @param {boolean} firstVisit — whether this is the first time entering
 * @returns {string}
 */
export function buildRoomNarration(room, hasLight, firstVisit) {
  if (!room) return 'You stand in darkness.';

  if (!hasLight) {
    return firstVisit
      ? `You enter a chamber in total darkness. The room is ${room.name}. Without light, you can barely perceive the space around you.`
      : `You return to the ${room.name}. It is pitch dark.`;
  }

  return firstVisit
    ? room.description
    : `You return to the ${room.name}.\n\n${room.description.split('\n')[0]}`;
}

/**
 * Build the combat entry narration when a room triggers auto-combat.
 * Picks a random attack narration from the first monster's type data.
 *
 * @param {object[]} monsters — living monster instances
 * @param {object} mod
 * @returns {string}
 */
export function buildCombatEntryNarration(monsters, mod) {
  if (!monsters.length) return '';

  const first = monsters[0];
  const type = mod.bestiary?.[first.typeId];
  const count = monsters.length;
  const name = count === 1 ? `a ${first.name}` : `${count} ${type?.plural || first.name + 's'}`;

  return count === 1
    ? `A ${first.name} is here!`
    : `${count} ${type?.plural || first.name + 's'} are here!`;
}

/**
 * Build narration for a successful search result.
 * @param {object} room
 * @param {boolean} foundSomething
 * @param {object[]} foundItems — items/treasure found
 * @returns {string}
 */
export function buildSearchNarration(room, foundSomething, foundItems = []) {
  if (!foundSomething) {
    const noFinds = [
      'You search the room carefully. Nothing of note reveals itself.',
      'A thorough search turns up nothing you hadn\'t already seen.',
      'Dust and shadows are all that your search uncovers.',
    ];
    return noFinds[Math.floor(Math.random() * noFinds.length)];
  }

  const itemNames = foundItems.map(i => i.name).join(', ');
  return `Your search reveals: ${itemNames}.`;
}

export default {
  getModule,
  getRoom,
  getCurrentRoom,
  getRoomState,
  hasVisited,
  isRoomCleared,
  getVisibleExits,
  canEnterRoom,
  findExit,
  getStairExit,
  getLivingMonstersInRoom,
  getLivingMonstersInCurrentRoom,
  roomHasLivingMonsters,
  getMonsterInstance,
  getMonsterTypeForInstance,
  getUncollectedTreasure,
  roomHasVisibleTreasure,
  getActiveTraps,
  getAutoTriggeredHazards,
  getInteractiveFeatures,
  getMapRevealFeature,
  getHealingFeature,
  getClericalShrine,
  checkVictory,
  calculateRunXP,
  getMapData,
  getAllSecretDoorIds,
  buildRoomNarration,
  buildCombatEntryNarration,
  buildSearchNarration,
};
