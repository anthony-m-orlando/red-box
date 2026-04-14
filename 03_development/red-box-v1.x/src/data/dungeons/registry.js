/**
 * registry.js
 * Dungeon Module Registry
 *
 * Every playable dungeon is registered here.
 * DungeonEngine.js uses this registry to look up the correct module
 * for any given moduleId.
 *
 * Adding a new dungeon (e.g. B2) requires only:
 *   1. Creating src/data/dungeons/keepontheborderlands/index.js
 *   2. Adding it to DUNGEON_REGISTRY below
 *
 * ─────────────────────────────────────────────────────────────────────
 * MODULE STATUS
 * ─────────────────────────────────────────────────────────────────────
 *   tutorial      ← Native module (refactored from legacy flat object)
 *   quasqueton    ← Native module (B1)
 *   goblin_warren ← Legacy shim (flat object, awaiting future refactor)
 *   haunted_crypt ← Legacy shim (flat object, awaiting future refactor)
 */

import tutorialModule     from './tutorial/index.js';
import { quasquetonModule } from './quasqueton/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Compatibility Shim — retained for goblin_warren and haunted_crypt only
// ─────────────────────────────────────────────────────────────────────────────

function wrapLegacyAdventure(adventure) {
  const wrappedRooms = {};
  const rooms = adventure.rooms || {};

  Object.entries(rooms).forEach(([id, room]) => {
    wrappedRooms[id] = {
      ...room,
      level: 1,
      mapPos: room.mapPos || {
        x: (room.coordinates?.x ?? 0) * 80,
        y: (room.coordinates?.y ?? 0) * 80,
      },
    };
  });

  const monsterInstances = {};
  const monsters = adventure.monsters || {};
  Object.entries(monsters).forEach(([id, m]) => {
    monsterInstances[id] = {
      instanceId: id,
      typeId: id,
      name: m.name,
      hp: { current: m.hp?.current ?? m.hp ?? 4, max: m.hp?.max ?? m.hp ?? 4 },
      ac: m.ac,
      thac0: m.thac0,
      damage: m.damage,
      attacks: 1,
      morale: m.morale ?? 7,
      xp: m.xp ?? 5,
      save: m.save ?? 'F1',
      alignment: m.alignment ?? 'Chaotic',
      undead: false,
      alwaysLast: false,
      special: m.special?.map(s => ({ id: s, name: s, trigger: 'passive', description: s, effect: {} })) ?? [],
      conditions: [],
      isDefeated: false,
    };
  });

  return {
    id: adventure.id,
    title: adventure.name || adventure.title,
    subtitle: adventure.description?.slice(0, 60) + '...' || '',
    code: null,
    recommendedLevels: '1',
    description: adventure.description || '',
    levels: 1,
    totalRooms: Object.keys(rooms).length,
    entryRoomId: adventure.startingRoom || adventure.startingRoomId,
    entryLevel: 1,
    victoryRoomId: null,

    rooms: { 1: wrappedRooms, 2: {} },
    secretDoors: { 1: {}, 2: {} },
    monsterInstances: { 1: monsterInstances, 2: {} },
    bestiary: {},
    wanderingMonsters: { 1: [], 2: [] },
    rumors: [],
    victoryConditions: (adventure.victoryConditions || []).map(vc => ({
      id: vc.targetId,
      type: vc.type === 'defeat_enemy' ? 'defeat_monster' : vc.type,
      targetInstanceId: vc.targetId,
      description: vc.description,
      required: true,
    })),

    getRoom: (roomId) => wrappedRooms[roomId] || null,
    getRoomsForLevel: (level) => level === 1 ? Object.values(wrappedRooms) : [],
    getSecretDoorsForLevel: () => ({}),
    getMonsterInstancesForLevel: (level) => level === 1 ? monsterInstances : {},
    getWanderingMonsterTable: () => [],
    getMonsterType: () => null,
    selectStartingRumors: () => [],
    isLegacy: true,
    originalAdventure: adventure,
  };
}

// Legacy flat-adventure files — imported statically so Vite can analyse them.
// If the files don't exist the import will fail at build time; the try/catch
// below in getLegacyModules() handles the runtime-wrapping logic.
import goblinWarrenMod  from '../goblinWarrenAdventure.js';
import hauntedCryptMod  from '../hauntedCryptAdventure.js';

// Lazy-load remaining legacy adventures (goblin_warren, haunted_crypt)
let _legacyModules = null;

function getLegacyModules() {
  if (_legacyModules) return _legacyModules;
  try {
    _legacyModules = {
      goblin_warren: wrapLegacyAdventure(goblinWarrenMod?.goblinWarrenAdventure ?? goblinWarrenMod?.default ?? goblinWarrenMod),
      haunted_crypt: wrapLegacyAdventure(hauntedCryptMod?.hauntedCryptAdventure ?? hauntedCryptMod?.default ?? hauntedCryptMod),
    };
  } catch (e) {
    console.warn('[DungeonRegistry] Legacy adventure files could not be wrapped:', e.message);
    _legacyModules = {};
  }
  return _legacyModules;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

const DUNGEON_REGISTRY = {
  tutorial:    tutorialModule,    // ← native module
  quasqueton:  quasquetonModule,  // ← native module (B1)
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function getModuleById(moduleId) {
  if (DUNGEON_REGISTRY[moduleId]) return DUNGEON_REGISTRY[moduleId];
  const legacy = getLegacyModules();
  return legacy[moduleId] || null;
}

export function isLegacyModule(moduleId) {
  // tutorial and quasqueton are NOT legacy — they use DungeonScreen
  if (DUNGEON_REGISTRY[moduleId]) return false;
  const legacy = getLegacyModules();
  return !!(legacy[moduleId]);
}

export function getAllModuleMetadata() {
  const nativeModules = Object.values(DUNGEON_REGISTRY).map(m => ({
    id:                m.id,
    title:             m.name || m.title,
    subtitle:          m.subtitle,
    description:       m.description,
    difficulty:        m.difficulty,
    recommendedLevel:  m.recommendedLevel,
    features:          m.features || [],
    levels:            m.levels ?? 1,
    totalRooms:        m.totalRooms
                         ?? Object.values(m.rooms?.[1] || {}).length
                          + Object.values(m.rooms?.[2] || {}).length,
    isLegacy:          false,
  }));

  const legacyMeta = Object.values(getLegacyModules()).map(m => ({
    id:               m.id,
    title:            m.title,
    subtitle:         m.subtitle,
    description:      m.description,
    difficulty:       'intermediate',
    recommendedLevel: 1,
    features:         [],
    levels:           1,
    totalRooms:       m.totalRooms,
    isLegacy:         true,
  }));

  return [...nativeModules, ...legacyMeta];
}

export function registerModule(moduleId, moduleObject) {
  DUNGEON_REGISTRY[moduleId] = moduleObject;
}

export default DUNGEON_REGISTRY;
