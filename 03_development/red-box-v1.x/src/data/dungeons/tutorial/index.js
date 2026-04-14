/**
 * dungeons/tutorial/index.js
 * "Your First Adventure" — Tutorial Module
 *
 * Structured identically to quasqueton/index.js so DungeonEngine
 * and DungeonScreen treat it exactly the same as B1.
 *
 * Architecture:
 *   - 1 level (level 1 only, no stairs)
 *   - 5 rooms: entrance → corridor → goblin / snake / treasure
 *   - 3 canonical monster instances
 *   - Victory: defeat all 3 monsters
 *   - Entry point: t_entrance (safe checkpoint, no combat)
 */

import level1 from './level1.js';
import bestiary from './bestiary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Module manifest
// ─────────────────────────────────────────────────────────────────────────────

const tutorialModule = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id:          'tutorial',
  name:        'Your First Adventure',
  subtitle:    'A Tutorial Adventure',
  description: 'Learn the basics of dungeon exploration, combat, and treasure.',
  difficulty:  'beginner',
  recommendedLevel: 1,
  features: [
    '5 rooms to explore',
    '3 monsters to defeat',
    'Treasure chest reward',
    'Pit trap in the corridor',
  ],

  // ── Entry point ───────────────────────────────────────────────────────────
  entryRoomId: 't_entrance',
  entryLevel:  1,

  // ── Levels ────────────────────────────────────────────────────────────────
  // Only level 1 — no stairs, no level 2
  rooms: {
    1: level1.rooms,
  },

  // ── Monster instances ─────────────────────────────────────────────────────
  // keyed by instanceId, grouped by level (matches DungeonEngine.getMonsterInstance)
  monsterInstances: {
    1: level1.monsterInstances,
  },

  // ── Bestiary (type definitions) ───────────────────────────────────────────
  bestiary: bestiary.types,

  // ── Secret doors ─────────────────────────────────────────────────────────
  // None in tutorial
  secretDoors: { 1: {} },

  // ── Wandering monsters ────────────────────────────────────────────────────
  // Disabled for tutorial — no wandering encounters
  wanderingMonsters: { 1: [] },

  // ── Victory conditions ────────────────────────────────────────────────────
  victoryConditions: [
    {
      id:               'defeat_goblin',
      type:             'defeat_monster',
      targetInstanceId: 't_goblin_1',
      description:      'Defeat the goblin',
      required:         true,
    },
    {
      id:               'defeat_snake',
      type:             'defeat_monster',
      targetInstanceId: 't_snake_1',
      description:      'Defeat the giant snake',
      required:         true,
    },
    {
      id:               'defeat_rust_monster',
      type:             'defeat_monster',
      targetInstanceId: 't_rust_monster_1',
      description:      'Defeat the rust monster',
      required:         true,
    },
  ],

  // ── Helpers (expected by DungeonEngine) ───────────────────────────────────

  /** Get all rooms for a given level as an array. */
  getRoomsForLevel(level) {
    return Object.values(this.rooms[level] || {});
  },

  /** Get a specific room. */
  getRoom(level, roomId) {
    return this.rooms[level]?.[roomId] || null;
  },
};

export default tutorialModule;
