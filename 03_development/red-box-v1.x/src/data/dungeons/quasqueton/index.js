/**
 * index.js
 * B1: In Search of the Unknown — Module Manifest
 *
 * This file is the single entry point for the Quasqueton dungeon module.
 * DungeonEngine.js imports from here — it never imports level1/level2/bestiary directly.
 *
 * Exports:
 *   quasquetonModule  — the full module object (default export)
 *   getModule()       — accessor used by DungeonEngine
 */

import {
  LEVEL1_ROOMS,
  LEVEL1_SECRET_DOORS,
  getLevel1Room,
  getAllLevel1Rooms,
  getLevel1MonsterInstances,
} from './level1.js';

import {
  LEVEL2_ROOMS,
  LEVEL2_SECRET_DOORS,
  getLevel2Room,
  getAllLevel2Rooms,
  getLevel2MonsterInstances,
} from './level2.js';

import { B1_BESTIARY, getMonsterType, createMonsterInstance } from './bestiary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Module Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const MODULE_METADATA = {
  id: 'quasqueton',
  title: 'B1: In Search of the Unknown',
  subtitle: 'The Caverns of Quasqueton',
  code: 'B1',
  author: 'Mike Carr',
  originalYear: 1979,
  recommendedLevels: '1–3',
  description: `Deep in the wild hills, the stronghold of Quasqueton lies forgotten. Built by the legendary heroes Rogahn the Fearless and Zelligar the Unknown, the caverns served as base, laboratory, and vault for two of the most powerful adventurers of their age.

Then Rogahn and Zelligar marched to war — and never returned.

Now Quasqueton stands empty. Or so the rumors say. Strange lights have been seen on the hillside at night. Humanoid raiders have been using the surrounding area as a base. And the treasures of Rogahn and Zelligar — their weapons, their spells, their accumulated wealth — lie waiting for those bold enough to find them.

You have heard the rumors. You have bought your equipment. You stand at the entrance.`,
  levels: 2,
  totalRooms: 53,
  entryRoomId: 'q1_1',
  entryLevel: 1,
  victoryRoomId: 'q2_17',
};

// ─────────────────────────────────────────────────────────────────────────────
// Wandering Monster Tables
// ─────────────────────────────────────────────────────────────────────────────
// Checked every 2 turns (after each turn in exploration, roll 1d6 — on a 1, spawn).
// Each level has its own table. Roll 1d6 on the appropriate table.

export const WANDERING_MONSTERS = {
  1: [
    // Level 1 wandering monsters (1d6)
    { roll: 1, typeId: 'kobold',      count: '1d4', note: 'A scouting pack of kobolds' },
    { roll: 2, typeId: 'giant_rat',   count: '1d6', note: 'A pack of giant rats' },
    { roll: 3, typeId: 'orc',         count: '1d3', note: 'An orc patrol' },
    { roll: 4, typeId: 'hobgoblin',   count: '1d2', note: 'A hobgoblin patrol checking on their garrison' },
    { roll: 5, typeId: 'stirge',      count: '1d4', note: 'A swarm of stirges from the upper roosts' },
    { roll: 6, typeId: 'skeleton',    count: '1d2', note: 'Animated bones stirred by the intrusion' },
  ],
  2: [
    // Level 2 wandering monsters (1d6)
    { roll: 1, typeId: 'ghoul',         count: '1',   note: 'A lone ghoul drawn by the living' },
    { roll: 2, typeId: 'troglodyte',    count: '1d2', note: 'Troglodyte scouts from the warren' },
    { roll: 3, typeId: 'gnoll',         count: '1d2', note: 'Gnoll patrol from the Chief\'s Hall' },
    { roll: 4, typeId: 'giant_spider',  count: '1',   note: 'A spider seeking fresh webbing territory' },
    { roll: 5, typeId: 'zombie',        count: '1d2', note: 'Mindless undead from the burial chamber' },
    { roll: 6, typeId: 'orc',           count: '1d3', note: 'Orc scouts from the stronghold' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Rumor Table
// ─────────────────────────────────────────────────────────────────────────────
// In canonical B1, the DM gives players 3 rumors each from this 20-entry table
// before the adventure begins. Some are true, some are false.
// Rumors are tagged: true | false | partial

export const RUMORS = [
  // 1-10: True rumors
  {
    id: 'r1', roll: 1, text: 'The stronghold was built by two powerful adventurers — a great warrior and a mighty mage.',
    truth: true, hint: 'rooms_16_21_23',
  },
  {
    id: 'r2', roll: 2, text: 'The warrior\'s name was Rogahn the Fearless. He never fell before any man.',
    truth: true, hint: 'room_21',
  },
  {
    id: 'r3', roll: 3, text: 'The mage\'s name was Zelligar the Unknown. His true power was never measured.',
    truth: true, hint: 'rooms_12_23',
  },
  {
    id: 'r4', roll: 4, text: 'There are two levels to the dungeon. The lower level is far more dangerous.',
    truth: true, hint: 'level_2',
  },
  {
    id: 'r5', roll: 5, text: 'A magical pool in the dungeon leads to the lower level.',
    truth: true, hint: 'room_25',
  },
  {
    id: 'r6', roll: 6, text: 'Many of the rooms contain strange and dangerous creatures of all types.',
    truth: true, hint: 'general',
  },
  {
    id: 'r7', roll: 7, text: 'There are secret doors throughout the dungeon.',
    truth: true, hint: 'secret_doors',
  },
  {
    id: 'r8', roll: 8, text: 'One of the rooms contains a map of the dungeon itself.',
    truth: true, hint: 'room_18',
  },
  {
    id: 'r9', roll: 9, text: 'The stronghold contains the personal effects and equipment of Rogahn and Zelligar.',
    truth: true, hint: 'rooms_21_23_53',
  },
  {
    id: 'r10', roll: 10, text: 'A long winding corridor runs through the dungeon, swept clean by a strange wind.',
    truth: true, hint: 'room_15',
  },
  // 11-20: False or misleading rumors
  {
    id: 'r11', roll: 11, text: 'The dungeon is entirely safe — Rogahn and Zelligar cleared it before they left.',
    truth: false, hint: null,
  },
  {
    id: 'r12', roll: 12, text: 'All of Rogahn\'s personal treasure is kept in a room on the first level.',
    truth: false, hint: null,
  },
  {
    id: 'r13', roll: 13, text: 'Zelligar placed a curse on any who take his spellbook — they will age ten years overnight.',
    truth: false, hint: null,
  },
  {
    id: 'r14', roll: 14, text: 'There is a dragon living in the deepest part of the dungeon.',
    truth: false, hint: null,
  },
  {
    id: 'r15', roll: 15, text: 'The pool in the dungeon has healing properties if you bathe in it.',
    truth: false, hint: 'room_25_misleading',
  },
  {
    id: 'r16', roll: 16, text: 'Rogahn and Zelligar never actually disappeared — they still live somewhere in the dungeon.',
    truth: false, hint: null,
  },
  {
    id: 'r17', roll: 17, text: 'The entire dungeon is trapped from end to end. Every door, every floor, every wall.',
    truth: false, hint: null,
  },
  {
    id: 'r18', roll: 18, text: 'There is a friendly wizard on the second level who will pay for information about Level 1.',
    truth: false, hint: null,
  },
  {
    id: 'r19', roll: 19, text: 'The treasure in the stronghold was all taken by the humanoids who moved in.',
    truth: false, hint: null,
  },
  {
    id: 'r20', roll: 20, text: 'A holy shrine in the dungeon will restore a cleric\'s power if they pray at it.',
    truth: true,   // partial — true for Level 1 room 27
    partial: true,
    hint: 'room_27',
  },
];

/**
 * Select 3 random rumors for a character's briefing before the adventure.
 * Returns a mix weighted to include at least 1-2 true rumors.
 * @returns {object[]} Array of 3 rumor objects
 */
export function selectStartingRumors() {
  const trueRumors = RUMORS.filter(r => r.truth && !r.partial);
  const falseRumors = RUMORS.filter(r => !r.truth);
  const partial = RUMORS.filter(r => r.partial);

  const shuffleSlice = (arr, n) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  // 2 true, 1 false (canonical B1 ratio — mostly useful info mixed with misdirection)
  return [
    ...shuffleSlice(trueRumors, 2),
    ...shuffleSlice([...falseRumors, ...partial], 1),
  ].sort(() => Math.random() - 0.5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Victory Conditions
// ─────────────────────────────────────────────────────────────────────────────

export const VICTORY_CONDITIONS = [
  {
    id: 'reach_vault',
    type: 'reach_room',
    targetRoomId: 'q2_17',
    description: 'Reach the Lower Vault',
    required: false,
  },
  {
    id: 'defeat_lizard',
    type: 'defeat_monster',
    targetInstanceId: 'q2_53_lizard_1',
    description: 'Defeat the guardian of the Lower Vault',
    required: false,
  },
  {
    id: 'collect_vault_treasure',
    type: 'collect_treasure',
    targetTreasureId: 'q2_17_vault_chest',
    description: 'Claim the treasure of Rogahn and Zelligar',
    required: false,
  },
  {
    id: 'exit_dungeon',
    type: 'reach_room',
    targetRoomId: 'q1_1',
    description: 'Escape Quasqueton alive',
    required: true,   // The only REQUIRED condition — must exit to claim victory
    winOnReach: true, // Reaching this room while alive = victory
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Module Rooms Accessor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a room from any level by its full room ID.
 * @param {string} roomId — e.g. 'q1_7' or 'q2_11'
 * @returns {object|null}
 */
export function getRoom(roomId) {
  return getLevel1Room(roomId) || getLevel2Room(roomId) || null;
}

/**
 * Get all rooms for a given level number.
 * @param {number} level — 1 or 2
 * @returns {object[]}
 */
export function getRoomsForLevel(level) {
  return level === 1 ? getAllLevel1Rooms() : getAllLevel2Rooms();
}

/**
 * Get all secret doors for a given level.
 * @param {number} level — 1 or 2
 * @returns {object}
 */
export function getSecretDoorsForLevel(level) {
  return level === 1 ? LEVEL1_SECRET_DOORS : LEVEL2_SECRET_DOORS;
}

/**
 * Get all monster instances for a given level.
 * @param {number} level — 1 or 2
 * @returns {object}
 */
export function getMonsterInstancesForLevel(level) {
  return level === 1 ? getLevel1MonsterInstances() : getLevel2MonsterInstances();
}

/**
 * Get the wandering monster table for a given level.
 * @param {number} level — 1 or 2
 * @returns {object[]}
 */
export function getWanderingMonsterTable(level) {
  return WANDERING_MONSTERS[level] || WANDERING_MONSTERS[1];
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Module Object
// ─────────────────────────────────────────────────────────────────────────────

export const quasquetonModule = {
  ...MODULE_METADATA,

  // Data
  rooms: {
    1: LEVEL1_ROOMS,
    2: LEVEL2_ROOMS,
  },
  secretDoors: {
    1: LEVEL1_SECRET_DOORS,
    2: LEVEL2_SECRET_DOORS,
  },
  monsterInstances: {
    1: getLevel1MonsterInstances(),
    2: getLevel2MonsterInstances(),
  },
  bestiary: B1_BESTIARY,
  wanderingMonsters: WANDERING_MONSTERS,
  rumors: RUMORS,
  victoryConditions: VICTORY_CONDITIONS,

  // Accessors
  getRoom,
  getRoomsForLevel,
  getSecretDoorsForLevel,
  getMonsterInstancesForLevel,
  getWanderingMonsterTable,
  getMonsterType,
  createMonsterInstance,
  selectStartingRumors,
};

/**
 * Get the module object (called by DungeonEngine.js).
 * @returns {object}
 */
export function getModule() {
  return quasquetonModule;
}

export default quasquetonModule;
