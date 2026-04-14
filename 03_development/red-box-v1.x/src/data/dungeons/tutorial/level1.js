/**
 * dungeons/tutorial/level1.js
 * "Your First Adventure" — Level 1 room definitions
 *
 * 5 rooms on a simple east-west / north-south layout:
 *
 *          [Goblin's Lair]  (t_goblin)
 *                 |
 *   [Entrance] — [Corridor] — [Snake Pit] — [Treasure Chamber]
 *    t_entrance  t_corridor   t_snake        t_treasure
 *
 * mapPos coordinates place rooms on a compact SVG grid.
 * Room IDs are prefixed 't_' to avoid collisions with B1.
 */

import { createInstance } from './bestiary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper shorthand
// ─────────────────────────────────────────────────────────────────────────────

function treasure(id, gold, items = [], description = '') {
  return { id, gold, items, description: description || `${gold} gold pieces` };
}

function item(id, name, description, type = 'misc') {
  return { id, name, description, type };
}

// ─────────────────────────────────────────────────────────────────────────────
// Monster instances (canonical, fixed HP for tutorial)
// ─────────────────────────────────────────────────────────────────────────────

export const monsterInstances = {
  t_goblin_1:       createInstance('t_goblin_1',       'goblin',       4),
  t_snake_1:        createInstance('t_snake_1',        'giant_snake',  6),
  t_rust_monster_1: createInstance('t_rust_monster_1', 'rust_monster', 10),
};

// ─────────────────────────────────────────────────────────────────────────────
// Rooms
// ─────────────────────────────────────────────────────────────────────────────

export const rooms = {

  // ── Room 1: Dungeon Entrance ───────────────────────────────────────────────
  t_entrance: {
    id:     't_entrance',
    number: 1,
    label:  'Dungeon Entrance',
    name:   'Dungeon Entrance',
    mapPos: { x: 0, y: 200 },
    size:   { w: 56, h: 48 },
    isCheckpoint:   true,    // safe rest area — no wandering monsters here
    isSpecialRoom:  false,
    autoStartCombat: false,

    description: `You stand at the entrance to your first dungeon. The stone walls are damp and covered in moss. A narrow corridor stretches ahead into darkness.

This is where your adventure begins! Move east to explore.`,

    exits: [
      { direction: 'east', targetRoomId: 't_corridor', doorType: 'open', discovered: true },
    ],

    contents: {
      monsters:  [],
      treasure:  [],
      traps:     [],
      features:  [
        {
          id:          't_entrance_sign',
          name:        'Warning Inscription',
          description: 'Scratched into the wall near the entrance: "HERE THERE BE MONSTERS. TURN BACK."',
          interactive: false,
        },
      ],
    },
  },

  // ── Room 2: Dark Corridor ─────────────────────────────────────────────────
  t_corridor: {
    id:     't_corridor',
    number: 2,
    label:  'Dark Corridor',
    name:   'Dark Corridor',
    mapPos: { x: 160, y: 200 },
    size:   { w: 56, h: 48 },
    isCheckpoint:   false,
    isSpecialRoom:  false,
    autoStartCombat: false,

    description: `A long, dark corridor stretches before you. You hear the faint sound of dripping water echoing off the stone walls. The air is musty and stale.

In the dim light, you see passages leading north, south, and back west.`,

    exits: [
      { direction: 'west',  targetRoomId: 't_entrance', doorType: 'open', discovered: true  },
      { direction: 'north', targetRoomId: 't_goblin',   doorType: 'open', discovered: false },
      { direction: 'south', targetRoomId: 't_snake',    doorType: 'open', discovered: false },
    ],

    contents: {
      monsters: [],
      treasure: [],
      traps: [
        {
          id:          't_pit_trap',
          type:        'pit',
          description: 'A concealed pit trap! The floor section shifts underfoot.',
          damage:      '1d6',
          autoTrigger: false,
          detectChance: {
            dwarf:   1.0,
            thief:   1.0,
            default: 1 / 6,
          },
        },
      ],
      features: [],
    },
  },

  // ── Room 3: Goblin's Lair ─────────────────────────────────────────────────
  t_goblin: {
    id:     't_goblin',
    number: 3,
    label:  "Goblin's Lair",
    name:   "Goblin's Lair",
    mapPos: { x: 160, y: 80 },
    size:   { w: 56, h: 48 },
    isCheckpoint:   false,
    isSpecialRoom:  false,
    autoStartCombat: true,

    description: `You enter a small chamber littered with bones and refuse. The stench is overwhelming.

A GOBLIN crouches in the corner, its yellow eyes gleaming with malice. It notices you and reaches for its crude weapon!`,

    exits: [
      { direction: 'south', targetRoomId: 't_corridor', doorType: 'open', discovered: true },
    ],

    contents: {
      monsters: ['t_goblin_1'],
      treasure: [
        treasure('t_goblin_coins', 10, [],
          '10 gold pieces scattered among the refuse'),
      ],
      traps:    [],
      features: [],
    },
  },

  // ── Room 4: Snake Pit ────────────────────────────────────────────────────
  t_snake: {
    id:     't_snake',
    number: 4,
    label:  'Snake Pit',
    name:   'Snake Pit',
    mapPos: { x: 160, y: 320 },
    size:   { w: 56, h: 48 },
    isCheckpoint:   false,
    isSpecialRoom:  false,
    autoStartCombat: true,

    description: `You step into a dank chamber. The floor is slick with moisture, and you hear a low hissing sound.

Coiled in the center of the room is a large SNAKE, its forked tongue tasting the air. It regards you with cold, unblinking eyes!`,

    exits: [
      { direction: 'north', targetRoomId: 't_corridor', doorType: 'open', discovered: true  },
      { direction: 'east',  targetRoomId: 't_treasure', doorType: 'open', discovered: false },
    ],

    contents: {
      monsters: ['t_snake_1'],
      treasure: [],
      traps:    [],
      features: [],
    },
  },

  // ── Room 5: Treasure Chamber ──────────────────────────────────────────────
  t_treasure: {
    id:     't_treasure',
    number: 5,
    label:  'Treasure Chamber',
    name:   'Treasure Chamber',
    mapPos: { x: 320, y: 320 },
    size:   { w: 56, h: 48 },
    isCheckpoint:   false,
    isSpecialRoom:  true,     // highlighted on map
    autoStartCombat: true,

    description: `You enter a small chamber with higher ceilings than the previous rooms. Against the far wall sits an old wooden chest bound with iron straps.

But wait! A bizarre creature scuttles toward you — a RUST MONSTER! Its antennae wave menacingly, seeking metal to corrode!`,

    exits: [
      { direction: 'west', targetRoomId: 't_snake', doorType: 'open', discovered: true },
    ],

    contents: {
      monsters: ['t_rust_monster_1'],
      treasure: [
        {
          id:          't_wooden_chest',
          gold:        50,
          description: 'An old wooden chest bound with iron straps',
          items: [
            item(
              't_healing_potion',
              'Potion of Healing',
              'A small vial of red liquid that glows faintly. Restores 1d6+1 HP when consumed.',
              'potion'
            ),
          ],
        },
      ],
      traps:    [],
      features: [
        {
          id:          't_treasure_chest_feature',
          name:        'Old Wooden Chest',
          description: 'A chest bound with iron straps. Contains the adventure\'s reward.',
          interactive: false,
        },
      ],
    },
  },

};

export default { rooms, monsterInstances };
