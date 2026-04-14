/**
 * level1.js
 * B1: In Search of the Unknown — Level 1 of the Caverns of Quasqueton
 *
 * 36 rooms. Canonical stocking (fixed, not procedural).
 * Monster instances reference type IDs from bestiary.js.
 * mapPos coordinates are in SVG units for the graph-paper renderer
 * (origin top-left, each 10' square = 20px).
 *
 * Exit doorType values:
 *   'open'    — archway / no door
 *   'closed'  — closed but unlocked wooden door
 *   'locked'  — requires a key item
 *   'secret'  — hidden; only appears after successful search
 *   'stair'   — staircase to another level (direction: 'down' or 'up')
 *   'one_way' — can only be used from one side
 *
 * Room state values (managed at runtime in AdventureContext):
 *   'unexplored' | 'entered' | 'cleared' | 'looted'
 */

import { createMonsterInstance } from './bestiary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: quick treasure factory
// ─────────────────────────────────────────────────────────────────────────────
function gold(id, amount, description) {
  return { id, type: 'coins', amount, denomination: 'gp', description };
}
function item(id, name, description, type = 'misc') {
  return { id, type: 'item', itemType: type, name, description };
}
function treasure(id, gold_amount, items = [], description = '') {
  return { id, gold: gold_amount, items, description };
}

// ─────────────────────────────────────────────────────────────────────────────
// Monster instances — canonical HP from module stocking table
// Canonical B1 uses fixed monster counts with average/typical HP
// ─────────────────────────────────────────────────────────────────────────────
const MONSTERS = {
  // Room 3 — Kobolds (4)
  q1_3_kobold_1:   createMonsterInstance('kobold',   'q1_3_kobold_1',   2),
  q1_3_kobold_2:   createMonsterInstance('kobold',   'q1_3_kobold_2',   3),
  q1_3_kobold_3:   createMonsterInstance('kobold',   'q1_3_kobold_3',   2),
  q1_3_kobold_4:   createMonsterInstance('kobold',   'q1_3_kobold_4',   4),
  // Room 5 — Giant Rats (6)
  q1_5_rat_1:      createMonsterInstance('giant_rat','q1_5_rat_1',      3),
  q1_5_rat_2:      createMonsterInstance('giant_rat','q1_5_rat_2',      2),
  q1_5_rat_3:      createMonsterInstance('giant_rat','q1_5_rat_3',      3),
  q1_5_rat_4:      createMonsterInstance('giant_rat','q1_5_rat_4',      2),
  q1_5_rat_5:      createMonsterInstance('giant_rat','q1_5_rat_5',      4),
  q1_5_rat_6:      createMonsterInstance('giant_rat','q1_5_rat_6',      3),
  // Room 7 — Orcs (3) — The Guard Chamber
  q1_7_orc_1:      createMonsterInstance('orc',      'q1_7_orc_1',      6),
  q1_7_orc_2:      createMonsterInstance('orc',      'q1_7_orc_2',      5),
  q1_7_orc_3:      createMonsterInstance('orc',      'q1_7_orc_3',      7),
  // Room 9 — Skeleton (1)
  q1_9_skeleton_1: createMonsterInstance('skeleton', 'q1_9_skeleton_1', 5),
  // Room 11 — Troglodytes (2) — The Trophy Hall
  q1_11_trog_1:    createMonsterInstance('troglodyte','q1_11_trog_1',   9),
  q1_11_trog_2:    createMonsterInstance('troglodyte','q1_11_trog_2',   7),
  // Room 14 — Stirges (4)
  q1_14_stirge_1:  createMonsterInstance('stirge',   'q1_14_stirge_1',  5),
  q1_14_stirge_2:  createMonsterInstance('stirge',   'q1_14_stirge_2',  4),
  q1_14_stirge_3:  createMonsterInstance('stirge',   'q1_14_stirge_3',  6),
  q1_14_stirge_4:  createMonsterInstance('stirge',   'q1_14_stirge_4',  3),
  // Room 17 — Gnolls (2)
  q1_17_gnoll_1:   createMonsterInstance('gnoll',    'q1_17_gnoll_1',   12),
  q1_17_gnoll_2:   createMonsterInstance('gnoll',    'q1_17_gnoll_2',   10),
  // Room 19 — Hobgoblins (3)
  q1_19_hob_1:     createMonsterInstance('hobgoblin','q1_19_hob_1',     6),
  q1_19_hob_2:     createMonsterInstance('hobgoblin','q1_19_hob_2',     7),
  q1_19_hob_3:     createMonsterInstance('hobgoblin','q1_19_hob_3',     5),
  // Room 22 — Giant Spiders (2)
  q1_22_spider_1:  createMonsterInstance('giant_spider','q1_22_spider_1', 7),
  q1_22_spider_2:  createMonsterInstance('giant_spider','q1_22_spider_2', 6),
  // Room 26 — Orcs (4)
  q1_26_orc_1:     createMonsterInstance('orc',      'q1_26_orc_1',     5),
  q1_26_orc_2:     createMonsterInstance('orc',      'q1_26_orc_2',     6),
  q1_26_orc_3:     createMonsterInstance('orc',      'q1_26_orc_3',     4),
  q1_26_orc_4:     createMonsterInstance('orc',      'q1_26_orc_4',     7),
  // Room 29 — Giant Rats (3)
  q1_29_rat_1:     createMonsterInstance('giant_rat','q1_29_rat_1',     3),
  q1_29_rat_2:     createMonsterInstance('giant_rat','q1_29_rat_2',     2),
  q1_29_rat_3:     createMonsterInstance('giant_rat','q1_29_rat_3',     4),
  // Room 33 — Gray Ooze
  q1_33_ooze_1:    createMonsterInstance('gray_ooze','q1_33_ooze_1',    15),
  // Room 36 — Giant Rats (2) — The Laboratory
  q1_36_rat_1:     createMonsterInstance('giant_rat','q1_36_rat_1',     3),
  q1_36_rat_2:     createMonsterInstance('giant_rat','q1_36_rat_2',     2),
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1 ROOMS
// ─────────────────────────────────────────────────────────────────────────────

export const LEVEL1_ROOMS = {

  // ── ROOM 1 — Entry Alcove ─────────────────────────────────────────────────
  q1_1: {
    id: 'q1_1',
    number: 1,
    name: 'Entry Alcove',
    label: 'Entry Alcove',
    level: 1,
    mapPos: { x: 40, y: 600 },   // SVG coords; entrance at south edge
    size: { w: 80, h: 60 },
    description: `Worn stone steps descend from above into a small, cold alcove. The air carries the damp smell of earth and old stone. Two iron torch brackets flank the passage — the torches are long since burned away.

A single corridor stretches northward into darkness. The floor is gritty with fallen plaster and the tracks of small creatures.`,
    dmNote: 'This is the dungeon entrance from the hillside. Characters who have been here before recognize the carved lintel above the steps.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_2', doorType: 'open', discovered: true },
      { direction: 'south', targetRoomId: null, doorType: 'open', discovered: true, isExit: true, exitLabel: 'Exit to surface' },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q1_1_torchbrackets', name: 'Empty Torch Brackets', description: 'Iron brackets that once held torches. Empty now.' },
      ],
    },
    autoStartCombat: false,
    isCheckpoint: true,
    searchable: false,
  },

  // ── ROOM 2 — Guard Post ───────────────────────────────────────────────────
  q1_2: {
    id: 'q1_2',
    number: 2,
    name: 'Guard Post',
    label: 'Guard Post',
    level: 1,
    mapPos: { x: 40, y: 500 },
    size: { w: 80, h: 80 },
    description: `A square chamber that once served as a guard post. A heavy wooden table lies on its side against the east wall, its surface hacked and scarred. Two stools are overturned nearby.

The smell of old cooking grease and unwashed bodies clings to the room. Crude graffiti in a language you do not recognize is scratched into the south wall.`,
    dmNote: 'Currently empty — the monsters who occupied it were driven out by whatever now lurks further in. A successful Search reveals the graffiti is Orcish, reading "TURN BACK."',
    exits: [
      { direction: 'south', targetRoomId: 'q1_1', doorType: 'open', discovered: true },
      { direction: 'north', targetRoomId: 'q1_4', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_3', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        gold('q1_2_coins', 12, 'Copper and silver pieces scattered beneath the table'),
      ],
      traps: [],
      features: [
        { id: 'q1_2_graffiti', name: 'Orcish Graffiti', description: 'Scratched into the south wall. A character who can read Orcish (or casts Read Languages) learns it says "TURN BACK."', searchRequired: true },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 3 — Kobold Lair ──────────────────────────────────────────────────
  q1_3: {
    id: 'q1_3',
    number: 3,
    name: 'Kobold Lair',
    label: 'Kobold Lair',
    level: 1,
    mapPos: { x: 160, y: 500 },
    size: { w: 80, h: 80 },
    description: `A low-ceilinged room reeking of dog and offal. Filthy nesting material — rags, straw, and gnawed bones — is piled in the corners. Crude drawings of stick figures being impaled adorn the walls at waist height.

Four small shapes crouch in the shadows, their eyes glinting red in the torchlight.`,
    dmNote: '4 kobolds make their lair here. They will attempt to swarm from different corners.',
    exits: [
      { direction: 'west', targetRoomId: 'q1_2', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_6', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_3_kobold_1','q1_3_kobold_2','q1_3_kobold_3','q1_3_kobold_4'],
      treasure: [
        gold('q1_3_gold', 35, 'A small leather pouch containing mixed coins from the kobold hoard'),
      ],
      traps: [
        {
          id: 'q1_3_alarm',
          type: 'alarm',
          detected: false,
          triggered: false,
          detectChance: { default: 1/6, thief: 1.0, dwarf: 1.0 },
          description: 'A string of small bones and shells stretched across the entrance at ankle height.',
          effect: 'Rattles loudly — kobolds cannot be surprised if triggered.',
          damage: null,
        },
      ],
      features: [],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 4 — Abandoned Barracks ───────────────────────────────────────────
  q1_4: {
    id: 'q1_4',
    number: 4,
    name: 'Abandoned Barracks',
    label: 'Barracks',
    level: 1,
    mapPos: { x: 40, y: 380 },
    size: { w: 120, h: 100 },
    description: `A long room that once housed soldiers or servants. Rows of rough wooden bed frames line the walls, their mattresses rotted away. Some still have rusted iron rings for securing prisoners — or perhaps for locking down equipment.

A fireplace on the north wall is cold and filled with ash and bird bones. The room smells of mold and dust. Nothing has slept here in a long time.`,
    dmNote: 'Empty and looted long ago. A Search of the fireplace turns up a dagger with a carved horn hilt (worth 15 gp, but the blade is still serviceable — treat as a normal dagger).',
    exits: [
      { direction: 'south', targetRoomId: 'q1_2', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_8', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_5', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_13', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_4_dagger', 'Horn-Hilted Dagger', 'A dagger with a carved horn hilt. The blade is still sharp and serviceable. Worth 15 gp.', 'weapon'),
      ],
      traps: [],
      features: [
        { id: 'q1_4_fireplace', name: 'Cold Fireplace', description: 'Filled with ash. The dagger is buried beneath the ash — Search required.', searchRequired: true },
        { id: 'q1_4_beds', name: 'Decayed Bed Frames', description: 'The iron rings suggest prisoners were secured here. Nothing of value remains.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 5 — Rat Nest ─────────────────────────────────────────────────────
  q1_5: {
    id: 'q1_5',
    number: 5,
    name: 'Rat Nest',
    label: 'Rat Nest',
    level: 1,
    mapPos: { x: 200, y: 380 },
    size: { w: 80, h: 80 },
    description: `A choking stench of ammonia and rot fills this room. The floor is covered in a thick layer of droppings and chewed debris. A large pile of gnawed wood and fabric in the far corner shifts and rustles.

Six enormous rats pour out of the nest, their eyes catching the light, whiskers twitching.`,
    dmNote: '6 giant rats guard their nest. The nest itself conceals treasure buried by the rats.',
    exits: [
      { direction: 'west', targetRoomId: 'q1_4', doorType: 'open', discovered: true },
    ],
    contents: {
      monsters: ['q1_5_rat_1','q1_5_rat_2','q1_5_rat_3','q1_5_rat_4','q1_5_rat_5','q1_5_rat_6'],
      treasure: [
        treasure('q1_5_nest_hoard', 40,
          [item('q1_5_ring', 'Tarnished Silver Ring', 'A plain silver ring. Worth 20 gp.', 'jewelry')],
          'Hidden deep in the rat nest under layers of debris. Requires Search after clearing.'),
      ],
      traps: [],
      features: [
        { id: 'q1_5_nest', name: 'Giant Rat Nest', description: 'The nest conceals a small hoard. Searchable after the rats are defeated.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 6 — Storage Room ─────────────────────────────────────────────────
  q1_6: {
    id: 'q1_6',
    number: 6,
    name: 'Storage Room',
    label: 'Storage',
    level: 1,
    mapPos: { x: 160, y: 380 },
    size: { w: 80, h: 80 },
    description: `Broken crates and smashed barrels are stacked against every wall. Most have been looted or have rotted away entirely. The contents of a few — old grain, oil-soaked rope, dried herbs — lie scattered across the floor.

The smell of stale oil and decay hangs in the still air.`,
    dmNote: 'A full search yields one intact flask of oil (useful as fuel, or as a fire weapon) and a full waterskin hung from a peg near the door.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_3', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_10', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_6_oil', 'Flask of Oil', 'A sealed flask of lamp oil. Full.', 'supply'),
        item('q1_6_waterskin', 'Full Waterskin', 'A leather waterskin, still sealed. Contains clean water.', 'supply'),
      ],
      traps: [],
      features: [
        { id: 'q1_6_crates', name: 'Broken Crates and Barrels', description: 'Most are rotted or smashed. A Search turns up usable supplies.', searchRequired: true },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 7 — Orc Guard Chamber ────────────────────────────────────────────
  q1_7: {
    id: 'q1_7',
    number: 7,
    name: 'Orc Guard Chamber',
    label: 'Orc Guard Chamber',
    level: 1,
    mapPos: { x: 40, y: 260 },
    size: { w: 120, h: 100 },
    description: `A stench of smoke, rancid fat, and unwashed bodies assaults you as you push open the door. Three orcs are seated around a low stone table, playing dice by the light of a smoking tallow candle. They look up at your entrance with yellow eyes and a collective snarl.

Crude weapons hang from pegs driven into the mortar. A rack of spears leans against the far wall.`,
    dmNote: 'SPECIAL ROOM. Three orcs who serve as irregular guards for the deeper complex. They are alert; no surprise possible. A chest beneath the table holds their accumulated pay.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_4', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_11', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_8', doorType: 'open',   discovered: true },
      {
        direction: 'west',
        targetRoomId: 'q1_15',
        doorType: 'secret',
        discovered: false,
        secretDoorId: 'sd_7_15',
        hint: 'One of the wall blocks in the north-west corner is slightly out of alignment.',
      },
    ],
    contents: {
      monsters: ['q1_7_orc_1','q1_7_orc_2','q1_7_orc_3'],
      treasure: [
        treasure('q1_7_chest', 85,
          [item('q1_7_potion', 'Potion of Healing', 'A small vial of red liquid that glows faintly. Restores 1d6+1 HP when consumed.', 'potion')],
          'Locked iron-bound chest beneath the table. Contains orc pay and a potion.'),
      ],
      traps: [],
      features: [
        { id: 'q1_7_chest', name: 'Locked Chest', description: 'A small iron-bound chest beneath the table. The orcs carry the key.', locked: true },
        { id: 'q1_7_spears', name: 'Rack of Spears', description: '6 crude spears in serviceable condition. Each could be used as a weapon.' },
      ],
    },
    autoStartCombat: true,
    noSurprise: true,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'Orc guards cannot be surprised. The western secret door is the main clue that deeper passages exist.',
  },

  // ── ROOM 8 — Corridor Intersection ───────────────────────────────────────
  q1_8: {
    id: 'q1_8',
    number: 8,
    name: 'Corridor Intersection',
    label: 'Intersection',
    level: 1,
    mapPos: { x: 200, y: 260 },
    size: { w: 60, h: 60 },
    description: `A T-shaped corridor intersection. The walls bear the same hewn-stone construction as the rest of the dungeon, but here a set of iron hooks has been driven into the mortar, as if someone planned to hang lanterns here. The hooks are empty.

Passages lead in three directions. The air is still and carries the faint odor of dampness from the north.`,
    dmNote: 'Purely navigational. The hooks are an architectural detail — no treasure.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_4', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_7', doorType: 'open',   discovered: true },
      { direction: 'north', targetRoomId: 'q1_9', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_12', doorType: 'closed', discovered: true },
    ],
    contents: { monsters: [], treasure: [], traps: [], features: [] },
    autoStartCombat: false,
    searchable: false,
  },

  // ── ROOM 9 — Crypt Alcove ─────────────────────────────────────────────────
  q1_9: {
    id: 'q1_9',
    number: 9,
    name: 'Crypt Alcove',
    label: 'Crypt Alcove',
    level: 1,
    mapPos: { x: 200, y: 160 },
    size: { w: 80, h: 80 },
    description: `A small alcove carved from the rock, clearly intended as a burial niche. A stone sarcophagus occupies most of the space, its lid carved with the face of a stern-looking man. The name URIKAL is carved in the base.

As you enter, the air grows chill, and the sarcophagus lid begins to scrape open.`,
    dmNote: 'A skeleton animates from within the sarcophagus when any character approaches within 10 feet. The sarcophagus contains modest treasure buried with the original occupant.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_8', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_9_skeleton_1'],
      treasure: [
        treasure('q1_9_burial_goods', 30,
          [item('q1_9_silver_clasp', 'Silver Burial Clasp', 'An ornate silver clasp engraved with runes. Worth 25 gp.', 'jewelry')],
          'Burial goods inside the sarcophagus lid. Accessible after the skeleton is defeated.'),
      ],
      traps: [],
      features: [
        { id: 'q1_9_sarcophagus', name: 'Stone Sarcophagus', description: 'The lid bears the name URIKAL. The treasure is within — accessible after the encounter.', searchRequired: false },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 10 — The Pillared Hall ───────────────────────────────────────────
  q1_10: {
    id: 'q1_10',
    number: 10,
    name: 'The Pillared Hall',
    label: 'Pillared Hall',
    level: 1,
    mapPos: { x: 160, y: 260 },
    size: { w: 120, h: 100 },
    description: `A large rectangular hall supported by four great stone pillars. The columns are carved with intertwined serpents and are stained dark from decades of torch smoke. The floor here is smoother, almost polished — this was a formal space.

Faded tapestries hang on the east and west walls, their scenes long since bleached to grey ghosts. The ceiling is twice the height of the corridor outside.`,
    dmNote: 'Empty and peaceful. This was a formal reception hall for Rogahn and Zelligar\'s important guests. A Search of the tapestries reveals a hidden alcove behind the west one — empty, but once used to store valuables.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_6', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_16', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_11', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_13', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q1_10_tapestries', name: 'Faded Tapestries', description: 'Once depicted great battles and victories. The hidden alcove behind the west tapestry is empty.', searchRequired: true },
        { id: 'q1_10_pillars', name: 'Carved Stone Pillars', description: 'Entwined serpents rise from floor to ceiling. An impressive piece of stonework.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 11 — The Trophy Hall ─────────────────────────────────────────────
  q1_11: {
    id: 'q1_11',
    number: 11,
    name: 'The Trophy Hall',
    label: 'Trophy Hall',
    level: 1,
    mapPos: { x: 320, y: 260 },
    size: { w: 120, h: 100 },
    description: `The walls of this long chamber are lined with mounted trophy heads — stags, bears, great boars, and things less identifiable. Many have been knocked from their mounts and lie in decay on the floor.

Two shapes lurk in the deep shadows at the far end of the room. As they shift, their skin ripples and changes — one moment grey as stone, the next a mottled pattern of dark and light that blends into the wall. Then the wave of their stench hits you.`,
    dmNote: 'SPECIAL ROOM. 2 troglodytes. Their chameleon skin means they can only be spotted on a 1-2 on d6 at the room entrance (before entering). The stench special ability triggers automatically. Trophy heads on the floor conceal a cache.',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_10', doorType: 'open',   discovered: true },
      { direction: 'south', targetRoomId: 'q1_8',  doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_20', doorType: 'closed', discovered: true },
      {
        direction: 'east',
        targetRoomId: 'q1_18',
        doorType: 'secret',
        discovered: false,
        secretDoorId: 'sd_11_18',
        hint: 'The mounted head of a boar near the east wall can be rotated, releasing a catch.',
      },
    ],
    contents: {
      monsters: ['q1_11_trog_1','q1_11_trog_2'],
      treasure: [
        treasure('q1_11_cache', 60,
          [item('q1_11_sword', 'Short Sword +1', 'A finely balanced short sword. The blade bears a faint enchantment — the edge never dulls.', 'weapon_magic')],
          'Hidden beneath a fallen trophy head in the north-east corner. Requires Search.'),
      ],
      traps: [],
      features: [
        { id: 'q1_11_trophies', name: 'Mounted Trophy Heads', description: 'Dozens of trophies, many fallen. The magical sword is hidden beneath one.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'Troglodytes blend into walls; surprise on 1-2 (d6). Stench triggers at start of round 1.',
  },

  // ── ROOM 12 — Wizard's Workroom ───────────────────────────────────────────
  q1_12: {
    id: 'q1_12',
    number: 12,
    name: "Wizard's Workroom",
    label: "Wizard's Workroom",
    level: 1,
    mapPos: { x: 320, y: 160 },
    size: { w: 120, h: 80 },
    description: `This room smells of burnt wood and old chemicals. A heavy stone workbench dominates the center of the room, its surface deeply stained with acids and unidentifiable substances. Several stone shelves are built into the walls; most are bare or hold only cracked and empty bottles.

Two intact bottles sit on the lowest shelf, their contents murky. Runes are scratched into the stone above the workbench — they may be a warning, or a recipe.`,
    dmNote: 'This was Zelligar the Unknown\'s primary workroom for alchemical experiments. The two intact bottles are potions: one is a Potion of Healing (1d6+1 HP), the other is a Potion of Poison — they look identical without Detect Magic. The runes are magical notes; a Magic-User can decipher them with Read Magic (yields a clue about the lower level).',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_8',  doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_18', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_12_potion_a', 'Potion (Unlabeled — A)', 'A murky bottle. Could be beneficial or harmful. Detect Magic reveals its nature.', 'potion_unknown'),
        item('q1_12_potion_b', 'Potion (Unlabeled — B)', 'A murky bottle identical to the other. Could be beneficial or harmful.', 'potion_unknown'),
      ],
      traps: [],
      features: [
        { id: 'q1_12_runes', name: 'Magical Runes', description: 'Scratched above the workbench. Readable only with Read Magic or a Comprehend Languages spell. Contains a clue about the lower level.', magical: true },
        { id: 'q1_12_bench', name: 'Stone Workbench', description: 'Heavily stained from decades of use.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 13 — Servants' Quarters ─────────────────────────────────────────
  q1_13: {
    id: 'q1_13',
    number: 13,
    name: "Servants' Quarters",
    label: "Servants' Quarters",
    level: 1,
    mapPos: { x: -80, y: 380 },
    size: { w: 100, h: 100 },
    description: `A long room divided by a low partition into two sleeping areas. Simple wooden beds — better quality than the barracks — line the walls. A wardrobe stands against the south wall, its door hanging open to reveal bare shelves and a single moth-eaten cloak.

This room has not been disturbed in years. A thin layer of dust covers every surface. The silence here feels respectful, almost sad.`,
    dmNote: 'The servants here left in an orderly fashion long ago. A Search of the wardrobe yields a loose stone concealing a hidden niche — inside is a personal journal written in Common, describing the evacuation of Quasqueton (interesting lore, no mechanical value). The cloak is worthless.',
    exits: [
      { direction: 'east',  targetRoomId: 'q1_4',  doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_15', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_10', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_13_journal', "Servant's Journal", "A personal journal written in Common by a servant named Pira. Describes the final days before Quasqueton was abandoned, and refers to 'the lower vault' in fearful terms.", 'document'),
      ],
      traps: [],
      features: [
        { id: 'q1_13_wardrobe', name: 'Old Wardrobe', description: 'Contains only a moth-eaten cloak. The hidden niche behind a loose stone in the base requires a Search.', searchRequired: true },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 14 — Stirge Roost ────────────────────────────────────────────────
  q1_14: {
    id: 'q1_14',
    number: 14,
    name: 'Stirge Roost',
    label: 'Stirge Roost',
    level: 1,
    mapPos: { x: -80, y: 260 },
    size: { w: 100, h: 80 },
    description: `As you open the door, the sound of dry, leathery wings fills the air. The upper reaches of this room are thick with stirges clinging to the ceiling in a roosting cluster. They stir and drop from the ceiling like falling leaves, wings spreading.

The floor is covered in a thick layer of pellets and the desiccated remains of their previous victims.`,
    dmNote: '4 stirges roosting in the ceiling. They have surprise on a roll of 1-3 on d6 if the players have not scouted. The dried remains on the floor include a dead adventurer who met his end here — his pack still has salvageable supplies.',
    exits: [
      { direction: 'east',  targetRoomId: 'q1_13', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_15', doorType: 'open',   discovered: true },
    ],
    contents: {
      monsters: ['q1_14_stirge_1','q1_14_stirge_2','q1_14_stirge_3','q1_14_stirge_4'],
      treasure: [
        treasure('q1_14_remains', 20,
          [
            item('q1_14_torch', 'Bundle of Torches', '4 intact torches from a dead adventurer\'s pack.', 'supply'),
            item('q1_14_rations', 'Iron Rations', 'A sealed tin of hard bread and salt pork. Still edible.', 'supply'),
          ],
          'The pack of a dead adventurer on the floor. Requires Search after combat.'),
      ],
      traps: [],
      features: [
        { id: 'q1_14_dead_adventurer', name: 'Dead Adventurer', description: 'Desiccated remains with a pack still strapped to the back. Supplies inside.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    surpriseBonus: 3,
    searchable: true,
  },

  // ── ROOM 15 — The Wind Corridor ───────────────────────────────────────────
  q1_15: {
    id: 'q1_15',
    number: 15,
    name: 'The Wind Corridor',
    label: 'Wind Corridor',
    level: 1,
    mapPos: { x: -80, y: 140 },
    size: { w: 200, h: 60 },
    description: `A long, narrow corridor carved in a straight line through the rock. Unusually, a constant wind flows from east to west through this passage — enough to make torches gutter and sputter, and to carry the sound of distant chambers.

The walls here are smoother than elsewhere, as if the stone was worn by long-running water. Small channels are cut into the floor at regular intervals — drainage grooves. The air smells clean and slightly mineral.`,
    dmNote: 'SPECIAL FEATURE. The wind flows from a crack in the rock at the east end (a natural feature Zelligar incorporated into his design). Torches have a 1-in-6 chance per turn of being extinguished here; lanterns are unaffected. Smell and sound clues from other rooms are carried on the wind.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_14', doorType: 'open',   discovered: true },
      { direction: 'south', targetRoomId: 'q1_13', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_7',  doorType: 'secret', discovered: false, secretDoorId: 'sd_7_15', hint: 'A section of the east wall shifts inward.' },
      { direction: 'north', targetRoomId: 'q1_21', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q1_15_wind', name: 'Constant Wind', description: 'A persistent wind flows west. Torches may be extinguished (1-in-6 per turn). Carries sounds from adjacent chambers.' },
        { id: 'q1_15_drainage', name: 'Drainage Grooves', description: 'Cut into the floor at regular intervals. Suggest this area flooded periodically.' },
      ],
    },
    autoStartCombat: false,
    windEffect: true,
    torchHazard: true,
    searchable: true,
  },

  // ── ROOM 16 — The Audience Hall ───────────────────────────────────────────
  q1_16: {
    id: 'q1_16',
    number: 16,
    name: 'The Audience Hall',
    label: 'Audience Hall',
    level: 1,
    mapPos: { x: 160, y: 140 },
    size: { w: 160, h: 100 },
    description: `A grand chamber that once served as an audience hall. Two stone thrones sit on a raised dais at the north end, facing the entrance. The thrones are carved with martial motifs — weapons, shields, battle scenes. Between them stands an empty iron brazier.

The walls bear painted murals, faded but still recognizable: they depict two figures, a sword-wielding warrior and a robed mage, accepting tribute from various humanoid peoples. The faces have been deliberately defaced.`,
    dmNote: 'The two thrones are for Rogahn (the fighter) and Zelligar (the mage). A character who sits in the mage\'s throne and speaks the word "ZELLIGAR" (discoverable from the Journal in Room 13) will trigger a Detect Magic effect on all carried items for 10 minutes. This is a single-use trick — it only works once per dungeon visit.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_10', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_23', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_20', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_21', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q1_16_thrones', name: 'Twin Stone Thrones', description: 'Carved with martial motifs. Sitting in the mage\'s throne and speaking "ZELLIGAR" triggers Detect Magic for 10 minutes.', interactive: true },
        { id: 'q1_16_murals', name: 'Faded Murals', description: 'Depict Rogahn and Zelligar receiving tribute. Faces deliberately defaced — likely done in anger after their disappearance.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 17 — Gnoll Lair ──────────────────────────────────────────────────
  q1_17: {
    id: 'q1_17',
    number: 17,
    name: 'Gnoll Lair',
    label: 'Gnoll Lair',
    level: 1,
    mapPos: { x: 360, y: 140 },
    size: { w: 100, h: 80 },
    description: `A powerful animal smell — musk, blood, and wet fur — rolls out of this room. It is a gnoll lair: the floor is strewn with cracked bones, discarded weapons, and gnawed strips of leather. A small fire smolders in a pit dug into the floor, heating a crude metal pot containing something unpleasant.

Two gnolls rise from their resting positions, their hyena-heads fixed on you, lips pulling back from powerful jaws.`,
    dmNote: '2 gnolls. They are not stupid — if reduced to half HP they check morale. A locked box beneath the bone pile holds their combined wealth.',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_20', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_24', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_17_gnoll_1','q1_17_gnoll_2'],
      treasure: [
        treasure('q1_17_lockbox', 120,
          [item('q1_17_gem', 'Carnelian Gem', 'A polished orange-red carnelian. Worth 50 gp.', 'gem')],
          'Locked box beneath the bone pile. Found with a Search after combat.'),
      ],
      traps: [],
      features: [
        { id: 'q1_17_firepit', name: 'Smoldering Fire Pit', description: 'A crude firepit with a pot of unknown contents. The fire can be used to light torches.' },
        { id: 'q1_17_lockbox', name: 'Locked Box', description: 'Buried beneath bones. Found with a Search.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 18 — The Map Room ────────────────────────────────────────────────
  q1_18: {
    id: 'q1_18',
    number: 18,
    name: 'The Map Room',
    label: 'Map Room',
    level: 1,
    mapPos: { x: 360, y: 260 },
    size: { w: 100, h: 80 },
    description: `This chamber houses a large stone table on which a map has been carved in relief — a map of the dungeon itself. The carving is detailed but incomplete: it shows most of Level 1 clearly, but the passages to Level 2 are marked only with question marks, and several rooms appear to have been deliberately obscured with later chisel work.

A candelabra of green bronze stands in the corner, its candles long since burned down. The stub of one candle is still present.`,
    dmNote: 'SPECIAL ROOM. The stone map updates the character\'s parchment map automatically with all currently carved rooms of Level 1 (marks them as "known" even if unvisited). Deliberately obscured areas can be revealed with a Dispel Magic. The bronze candelabra is worth 30 gp if carried out.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_12', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_11', doorType: 'secret', discovered: false, secretDoorId: 'sd_11_18', hint: 'The south edge of the stone table aligns with a seam in the west wall.' },
      { direction: 'north', targetRoomId: 'q1_25', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_18_candelabra', 'Green Bronze Candelabra', 'An ornate candelabra of green-patinated bronze. Heavy but valuable — worth 30 gp.', 'misc'),
      ],
      traps: [],
      features: [
        {
          id: 'q1_18_stonemap',
          name: 'Stone Relief Map',
          description: 'A carved map of Level 1. Reveals all known rooms of Level 1 on your parchment map. Obscured areas require Dispel Magic.',
          interactive: true,
          mapReveal: true,
        },
      ],
    },
    autoStartCombat: false,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'The stone map reveals all Level 1 rooms to the players\' in-game map.',
  },

  // ── ROOM 19 — Hobgoblin Garrison ──────────────────────────────────────────
  q1_19: {
    id: 'q1_19',
    number: 19,
    name: 'Hobgoblin Garrison',
    label: 'Hobgoblin Garrison',
    level: 1,
    mapPos: { x: 160, y: 40 },
    size: { w: 120, h: 80 },
    description: `Three hobgoblins are drilling in this room — one calls out movements while the other two practice formations with short swords and shields. They are clearly disciplined fighters, not random raiders. They halt their drill and raise their weapons as you enter.

The room contains neat bunks, a weapon rack, and a locked iron strongbox bolted to the floor.`,
    dmNote: '3 hobgoblins in a disciplined unit. They use formation tactics: +1 to hit when two attack the same target. The strongbox key is on the leader\'s belt.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_16', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_20', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_21', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_27', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_19_hob_1','q1_19_hob_2','q1_19_hob_3'],
      treasure: [
        treasure('q1_19_strongbox', 150,
          [item('q1_19_scroll', 'Scroll of Protection from Evil', 'A rolled vellum scroll inscribed in a neat hand. Single use.', 'scroll')],
          'Locked strongbox bolted to the floor. Key on the hobgoblin leader.'),
      ],
      traps: [],
      features: [
        { id: 'q1_19_weapon_rack', name: 'Weapon Rack', description: 'Contains 3 short swords and 3 shields in good condition.' },
        { id: 'q1_19_strongbox', name: 'Iron Strongbox', description: 'Bolted to the floor. Key on the hobgoblin leader.', locked: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 20 — The Corridor of Doors ──────────────────────────────────────
  q1_20: {
    id: 'q1_20',
    number: 20,
    name: 'Corridor of Doors',
    label: 'Corridor of Doors',
    level: 1,
    mapPos: { x: 320, y: 140 },
    size: { w: 80, h: 100 },
    description: `A long north-south corridor with four doors in the east wall and two in the west. All the doors are closed. The corridor itself is empty — swept clean, in contrast to most of the dungeon. Whatever occupies the rooms behind these doors apparently values a tidy threshold.`,
    dmNote: 'Navigational hub. The swept floor is because the hobgoblins in Room 19 maintain it. Characters who listen at the east doors will hear gnoll sounds from Room 17.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_11', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_17', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_16', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_19', doorType: 'open',   discovered: true },
      { direction: 'east',  targetRoomId: 'q1_24', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_25', doorType: 'closed', discovered: true },
    ],
    contents: { monsters: [], treasure: [], traps: [], features: [] },
    autoStartCombat: false,
    searchable: false,
  },

  // ── ROOM 21 — The Warrior's Rest ──────────────────────────────────────────
  q1_21: {
    id: 'q1_21',
    number: 21,
    name: "Rogahn's Memorial",
    label: "Rogahn's Memorial",
    level: 1,
    mapPos: { x: -80, y: 40 },
    size: { w: 160, h: 80 },
    description: `A memorial chamber to a warrior's life. On a stone plinth in the center stands a bronze statue of a powerfully built fighter, its expression fierce, one arm raised to strike. The base is inscribed: "ROGAHN — WHO NEVER FELL BEFORE ANY MAN."

Around the walls hang faded battle standards, trophies of victories won in a hundred campaigns. A votive lamp still burns before the statue — fed, it seems, by a magical flame that needs no oil.`,
    dmNote: 'The magical flame is a permanent Light spell effect. The bronze statue is too heavy to remove (1,000 lb). A Search of the base reveals a concealed compartment: inside is Rogahn\'s personal journal describing one entrance to Level 2.',
    exits: [
      { direction: 'east',  targetRoomId: 'q1_16', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_19', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q1_15', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_21_journal', "Rogahn's Journal", "A water-stained journal in a warrior's hand. Describes Rogahn's life and campaigns. The final entries mention 'the lower vault' and a staircase 'beneath the pool chamber.'", 'document'),
      ],
      traps: [],
      features: [
        { id: 'q1_21_statue', name: 'Bronze Statue of Rogahn', description: 'A magnificent statue, 7 feet tall. Far too heavy to remove. The plinth has a hidden compartment — Search required.', searchRequired: true },
        { id: 'q1_21_flame', name: 'Magical Votive Flame', description: 'Burns without fuel. A permanent Light effect. The chamber is always lit.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 22 — The Spider Vault ────────────────────────────────────────────
  q1_22: {
    id: 'q1_22',
    number: 22,
    name: 'The Spider Vault',
    label: 'Spider Vault',
    level: 1,
    mapPos: { x: -80, y: -80 },
    size: { w: 100, h: 100 },
    description: `Thick grey webbing fills the upper half of this vaulted chamber, draped from pillar to ceiling like a shroud. The floor is sticky under your boots, and you can see the silk-wrapped shapes of small animals — and something larger — hanging in the webs above.

Two giant spiders descend from the ceiling on threads of silk, their legs clicking against each other.`,
    dmNote: '2 giant spiders. Their web in this room counts as difficult terrain: movement is halved except along the floor path. The wrapped shapes in the webs include a merchant who blundered in some time ago — his pack holds useful items.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_21', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_23', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_22_spider_1','q1_22_spider_2'],
      treasure: [
        treasure('q1_22_merchant', 75,
          [
            item('q1_22_potion_heal', 'Potion of Healing', 'A red potion in a corked vial. Restores 1d6+1 HP.', 'potion'),
            item('q1_22_rope', '50\' of Silk Rope', 'Good quality climbing rope, still serviceable.', 'supply'),
          ],
          'The wrapped corpse of a merchant in the webs. Accessible after combat.'),
      ],
      traps: [],
      features: [
        { id: 'q1_22_webs', name: 'Spider Webs', description: 'Thick webbing fills the upper chamber. Counts as difficult terrain (half movement except on the floor path).' },
        { id: 'q1_22_wrapped', name: 'Wrapped Shapes in Webs', description: 'The silk-wrapped remains of several creatures, including a merchant with a pack.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    webTerrain: true,
    searchable: true,
  },

  // ── ROOM 23 — Zelligar's Study ────────────────────────────────────────────
  q1_23: {
    id: 'q1_23',
    number: 23,
    name: "Zelligar's Study",
    label: "Zelligar's Study",
    level: 1,
    mapPos: { x: 160, y: -80 },
    size: { w: 140, h: 100 },
    description: `A scholar's lair. Bookshelves cover three walls floor to ceiling, most of them empty but for a few volumes too damaged to be worth taking. A wide writing desk holds the remains of many worked documents — brittle scrolls, cracked wax tablets, ink-stained papers.

A brass orrery sits in one corner, its gears still turning. The mechanical model shows planets and moons in slow, silent motion. Where it draws its power from is unclear.`,
    dmNote: 'Zelligar\'s personal study. The damaged books are worthless. A careful Search of the desk yields an intact scroll — a 1st level Magic-User spell chosen by the DM. The orrery is worth 200 gp if transported intact, but weighs 200 coins and is fragile.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_16', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_22', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_24', doorType: 'open',   discovered: true },
      { direction: 'north', targetRoomId: 'q1_28', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_23_spell_scroll', 'Magic-User Spell Scroll', 'A single spell scroll, intact. Contains one 1st level Magic-User spell (Sleep). Can be cast directly without preparing it.', 'scroll'),
        item('q1_23_orrery', 'Brass Orrery', 'A mechanical model of the heavens, still moving. Worth 200 gp if transported intact. Weight: 200 coins. Fragile.', 'valuables'),
      ],
      traps: [],
      features: [
        { id: 'q1_23_bookshelves', name: 'Empty Bookshelves', description: 'Most volumes are too damaged to be valuable. The spell scroll is hidden among cracked wax tablets.', searchRequired: true },
        { id: 'q1_23_orrery', name: 'Brass Orrery', description: 'Runs without any visible power source. A slow, beautiful machine.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 24 — The Cold Corridor ───────────────────────────────────────────
  q1_24: {
    id: 'q1_24',
    number: 24,
    name: 'The Cold Corridor',
    label: 'Cold Corridor',
    level: 1,
    mapPos: { x: 360, y: 40 },
    size: { w: 80, h: 100 },
    description: `A short passage with a marked drop in temperature. Frost rimes the edges of the doorframes and crystals of ice form in the cracks of the stone. Breath mists in the frigid air. A low, continuous hum resonates from the walls — almost too low to hear, felt more in the chest than the ears.

The cold is intense enough to numb fingers and slow movement.`,
    dmNote: 'The cold and hum come from a sealed magical containment vault beyond the north wall. Characters who stay in this corridor more than 2 turns must save vs. Paralysis or have their Dexterity reduced by 1 for 1 hour (cold stiffness). There is no vault entrance from here — it is accessible only from Room 30.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_17', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_23', doorType: 'open',   discovered: true },
      { direction: 'north', targetRoomId: 'q1_30', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_20', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q1_24_cold', name: 'Magical Cold', description: 'Intense unnatural cold. After 2 turns, save vs. Paralysis or lose 1 Dexterity for 1 hour.' },
        { id: 'q1_24_hum', name: 'Low Humming', description: 'A deep vibration felt in the chest. Source is beyond the north wall.' },
      ],
    },
    autoStartCombat: false,
    coldHazard: true,
    searchable: false,
  },

  // ── ROOM 25 — The Pool Chamber ────────────────────────────────────────────
  q1_25: {
    id: 'q1_25',
    number: 25,
    name: 'The Pool Chamber',
    label: 'Pool Chamber',
    level: 1,
    mapPos: { x: 360, y: 380 },
    size: { w: 120, h: 120 },
    description: `A circular chamber with a pool of perfectly still water at its center, set into the floor in a carved stone basin. The water is dark and impossibly clear — you can see the bottom far below, smooth stone going deeper than any pool should.

The air here is very still. A carved ring of runes encircles the pool's edge. A narrow staircase descends into the water at the pool's far side — the steps vanish into the darkness below.`,
    dmNote: 'SPECIAL ROOM. The pool is a portal to Level 2 if approached and the correct phrase spoken (learnable from Zelligar\'s runes in Room 12 or Rogahn\'s journal in Room 21: "QUASQUETON ENDURES"). Walking into the pool without speaking the phrase simply results in getting wet. The staircase is the main physical stair to Level 2 — it goes down under the water but is a dry passage for those who know to look.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_18', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_20', doorType: 'closed', discovered: true },
      { direction: 'down',  targetLevel: 2, targetRoomId: 'q2_1', doorType: 'stair', discovered: true, stairType: 'pool_stair', description: 'A staircase descends into the dark water.' },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        {
          id: 'q1_25_pool',
          name: 'The Still Pool',
          description: 'Impossibly deep. The carved runes read "QUASQUETON ENDURES." Speaking this phrase unlocks the passage to Level 2.',
          interactive: true,
          portalPhrase: 'QUASQUETON ENDURES',
        },
        { id: 'q1_25_stair', name: 'Submerged Staircase', description: 'Steps lead down into the pool. The stair is a dry passage — the water parts for those who know the phrase.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'Primary descent to Level 2. The pool phrase can be learned from Rooms 12 and 21.',
  },

  // ── ROOM 26 — Orc Lair ────────────────────────────────────────────────────
  q1_26: {
    id: 'q1_26',
    number: 26,
    name: 'Orc Lair',
    label: 'Orc Lair',
    level: 1,
    mapPos: { x: 480, y: 260 },
    size: { w: 100, h: 80 },
    description: `A large, foul-smelling chamber that has clearly been home to orcs for some time. The walls are smeared with grease and blood. Crude pallets of straw and rags serve as beds. Gnawed bones and discarded weapons litter the floor.

Four orcs are here — two sleeping, two alert. The sleeping ones begin to rise as you enter.`,
    dmNote: '4 orcs. The two who were awake act in the first round; sleeping orcs join combat from round 2. A pile of "tribute" collected from passing humanoids is in a sack under the largest pallet.',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_18', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q1_32', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q1_30', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_31', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_26_orc_1','q1_26_orc_2','q1_26_orc_3','q1_26_orc_4'],
      treasure: [
        treasure('q1_26_tribute', 100,
          [item('q1_26_amulet', 'Bronze Amulet', 'An amulet stamped with a stylized eye. Worth 20 gp.', 'jewelry')],
          'Sack under the largest pallet. Requires Search.'),
      ],
      traps: [],
      features: [
        { id: 'q1_26_sack', name: 'Tribute Sack', description: 'Under the largest orc\'s pallet. Requires Search.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    delayedMonsters: ['q1_26_orc_3','q1_26_orc_4'],
    searchable: true,
  },

  // ── ROOM 27 — The Shrine ──────────────────────────────────────────────────
  q1_27: {
    id: 'q1_27',
    number: 27,
    name: 'The Shrine',
    label: 'The Shrine',
    level: 1,
    mapPos: { x: 160, y: -200 },
    size: { w: 100, h: 80 },
    description: `A small devotional shrine carved into an alcove at the end of a short passage. The altar is a plain block of stone with a bas-relief carving of a sun disc. Votive bowls in various states of decay sit before the altar.

The room is oddly peaceful. The air feels less cold here, and the stone itself seems lighter in color.`,
    dmNote: 'A Cleric who prays here for 10 minutes recovers one previously expended spell slot (once per adventure). Other classes feel a sense of calm but nothing mechanical. The shrine was dedicated to a lawful deity — an evil character who tries to use it must save vs. Spells or be paralyzed for 1 turn.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_19', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_28', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        {
          id: 'q1_27_altar',
          name: 'Holy Altar',
          description: 'A Cleric who prays for 10 minutes recovers one expended spell slot. Once per adventure per character.',
          interactive: true,
          clerical: true,
        },
      ],
    },
    autoStartCombat: false,
    searchable: false,
    isSpecialRoom: true,
    specialNote: 'Cleric spell recovery shrine. Evil characters must save vs. Spells or be paralyzed 1 turn.',
  },

  // ── ROOM 28 — The Armoury ─────────────────────────────────────────────────
  q1_28: {
    id: 'q1_28',
    number: 28,
    name: 'The Armoury',
    label: 'Armoury',
    level: 1,
    mapPos: { x: 320, y: -80 },
    size: { w: 100, h: 80 },
    description: `A former weapon storage room. Racks that once held dozens of weapons are now mostly bare or hold only rusted husks. The smell of old iron and oil permeates the room.

Here and there, better-preserved items survive: a leather baldric with a workable buckle, a shield with a sound steel boss, two spears still straight and sharp.`,
    dmNote: 'The rusted weapons are useless. The two serviceable spears and the shield can be taken. A Search of the storage chests along the west wall turns up a whetstone and a vial of weapon oil (each worth 2 gp and useful for maintenance).',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_27', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q1_23', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_29', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_28_spear1', 'Spear', 'A straight ash-wood spear with an iron head. Still sharp.', 'weapon'),
        item('q1_28_spear2', 'Spear', 'A second serviceable spear.', 'weapon'),
        item('q1_28_shield', 'Shield', 'A round shield with a solid steel boss. AC bonus still intact.', 'armor'),
        item('q1_28_whetstone', 'Whetstone', 'For maintaining weapon edges. Worth 2 gp.', 'supply'),
        item('q1_28_oil', 'Weapon Oil', 'A small vial of oil for metal maintenance. Worth 2 gp.', 'supply'),
      ],
      traps: [],
      features: [
        { id: 'q1_28_chests', name: 'Storage Chests', description: 'Old supply chests. Whetstone and weapon oil found with a Search.', searchRequired: true },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 29 — Rat Run ─────────────────────────────────────────────────────
  q1_29: {
    id: 'q1_29',
    number: 29,
    name: 'Rat Run',
    label: 'Rat Run',
    level: 1,
    mapPos: { x: 480, y: -80 },
    size: { w: 80, h: 80 },
    description: `A narrow room with low passages cut through the floor — natural fissures widened by generations of rats. Three giant rats are in the process of dragging a dead chicken (where they found it is unclear) toward a nest in the eastern passage.

They drop their meal and surge toward you.`,
    dmNote: '3 giant rats. Their nest in the east fissure passage contains shiny objects they have collected.',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_28', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q1_35', doorType: 'open',   discovered: true },
    ],
    contents: {
      monsters: ['q1_29_rat_1','q1_29_rat_2','q1_29_rat_3'],
      treasure: [
        treasure('q1_29_shiny', 15,
          [item('q1_29_brooch', 'Copper Brooch', 'A tarnished copper brooch shaped like a leaf. Worth 5 gp.', 'jewelry')],
          'Rat nest in the east passage. Requires Search.'),
      ],
      traps: [],
      features: [
        { id: 'q1_29_fissures', name: 'Floor Fissures', description: 'Natural cracks in the floor widened by rats. The nest in the eastern fissure has small treasures.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 30 — The Cold Vault ──────────────────────────────────────────────
  q1_30: {
    id: 'q1_30',
    number: 30,
    name: 'The Cold Vault',
    label: 'Cold Vault',
    level: 1,
    mapPos: { x: 480, y: 140 },
    size: { w: 100, h: 100 },
    description: `Intense magical cold radiates from a sealed stone door in the north wall, padlocked with a blue-glowing iron padlock. Frost covers every surface. The floor is slick with ice.

Whatever is sealed inside this room has been kept at near-freezing temperatures for decades. The padlock bears the same rune as one of the bottles in Room 12.`,
    dmNote: 'The padlock requires a key hidden in Room 12 (on the workbench) — Search required to find it. Inside is Zelligar\'s preserved food store: 20 days of iron rations, and a scroll of Restore (Cleric), which Zelligar kept in case his experiments went wrong. The cold vault is now permanent — the magic won\'t dispel.',
    exits: [
      { direction: 'south', targetRoomId: 'q1_26', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_24', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q1_31', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        treasure('q1_30_vault', 0,
          [
            item('q1_30_rations', 'Iron Rations (20 days)', 'Twenty days of preserved food in sealed clay pots. Still edible.', 'supply'),
            item('q1_30_scroll', 'Scroll of Restore', 'A Cleric scroll. Reverses the effects of ability score damage (e.g. from disease or poison).', 'scroll'),
          ],
          'Behind the locked and frozen vault door. Locked — requires the key from Room 12.'),
      ],
      traps: [
        {
          id: 'q1_30_cold_trap',
          type: 'cold',
          detected: false,
          triggered: false,
          detectChance: { default: 1/6, thief: 1.0, dwarf: 1.0 },
          description: 'The floor is coated in magical ice.',
          effect: 'Save vs. Paralysis or fall — losing your action next round.',
          damage: null,
        },
      ],
      features: [
        { id: 'q1_30_padlock', name: 'Blue-Glowing Padlock', description: 'A magical padlock glowing with cold blue light. Key is in Room 12.', locked: true, keyLocation: 'q1_12' },
      ],
    },
    autoStartCombat: false,
    coldHazard: true,
    searchable: true,
  },

  // ── ROOM 31 — The Tapestry Gallery ───────────────────────────────────────
  q1_31: {
    id: 'q1_31',
    number: 31,
    name: 'The Tapestry Gallery',
    label: 'Tapestry Gallery',
    level: 1,
    mapPos: { x: 600, y: 260 },
    size: { w: 100, h: 120 },
    description: `A gallery with a vaulted ceiling decorated in sky-blue plaster, now water-stained. Six large tapestries hang from iron rods, depicting the life of a warrior hero in sequential scenes — birth, training, first battle, great victory, old age, and death.

The tapestries are moth-eaten and faded, but the quality of their workmanship is still evident.`,
    dmNote: 'The tapestries depict Rogahn\'s life (though they do not name him). A character with training in appraisal who succeeds on an INT check knows each tapestry is worth 50 gp each if intact — but they are heavy (100 coins each) and fragile. Carrying more than two requires encumbrance penalties.',
    exits: [
      { direction: 'west',  targetRoomId: 'q1_26', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_30', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q1_36', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q1_31_tapestry_1', 'Tapestry: The Birth', 'Depicts a warrior\'s birth in a great hall. Well-made. Worth 50 gp intact.', 'valuables'),
        item('q1_31_tapestry_2', 'Tapestry: The Victory', 'Depicts a great battle. The finest of the six. Worth 50 gp intact.', 'valuables'),
      ],
      traps: [],
      features: [
        { id: 'q1_31_gallery', name: 'Six Tapestries', description: 'Moth-eaten but fine quality. Each worth 50 gp if intact. Heavy (100 coins each).' },
      ],
    },
    autoStartCombat: false,
    searchable: false,
  },

  // ── ROOM 32 — The Sloping Passage ─────────────────────────────────────────
  q1_32: {
    id: 'q1_32',
    number: 32,
    name: 'The Sloping Passage',
    label: 'Sloping Passage',
    level: 1,
    mapPos: { x: 480, y: 380 },
    size: { w: 80, h: 100 },
    description: `A passage that descends at a noticeable angle before leveling off. The walls here are rough and unfinished, suggesting this part of the dungeon was carved later or in haste. Strange claw marks score the south wall at about knee height — something large passed through here repeatedly.

At the bottom of the slope, the passage opens into a wider corridor.`,
    dmNote: 'The claw marks are from the giant lizard in Room 34. The slope connects the upper sections of Level 1 to the south wing.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_26', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q1_34', doorType: 'open',   discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q1_32_clawmarks', name: 'Claw Marks', description: 'Large claw marks at knee height, scoring the south wall. Something large and reptilian passes here regularly.' },
      ],
    },
    autoStartCombat: false,
    searchable: false,
  },

  // ── ROOM 33 — The Ooze Chamber ────────────────────────────────────────────
  q1_33: {
    id: 'q1_33',
    number: 33,
    name: 'The Ooze Chamber',
    label: 'Ooze Chamber',
    level: 1,
    mapPos: { x: 480, y: 500 },
    size: { w: 100, h: 80 },
    description: `At first glance the floor of this room appears covered in a shallow pool of standing water. The smell is faintly metallic — like wet iron. As you step forward, the "pool" ripples and a pseudopod rises from its surface.

A gray ooze fills the center of the room. Corroded sword fragments and bits of dissolved armor litter the perimeter.`,
    dmNote: 'One gray ooze. Its metal-dissolving ability is the main danger. Characters with wooden or bone weapons are safer. The corroded fragments are worthless, but a Search of the room edges turns up a small ceramic jar (waterproof-sealed) that the ooze cannot dissolve — it contains 45 gp worth of gems.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_26', doorType: 'open',   discovered: true },
      { direction: 'east',  targetRoomId: 'q1_36', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_33_ooze_1'],
      treasure: [
        treasure('q1_33_ceramic_jar', 0,
          [item('q1_33_gems', 'Three Small Gems', 'A fire opal, a turquoise, and a bloodstone. Worth 45 gp total.', 'gem')],
          'A sealed ceramic jar along the south wall — the ooze cannot dissolve ceramics. Requires Search.'),
      ],
      traps: [],
      features: [
        { id: 'q1_33_corroded', name: 'Corroded Metal Fragments', description: 'The remnants of previous adventurers\' weapons and armor. Worthless.' },
        { id: 'q1_33_jar', name: 'Sealed Ceramic Jar', description: 'Along the south wall. Waterproof seal. Contents intact.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 34 — The Lizard Den ──────────────────────────────────────────────
  q1_34: {
    id: 'q1_34',
    number: 34,
    name: 'The Lizard Den',
    label: 'Lizard Den',
    level: 1,
    mapPos: { x: 480, y: 620 },
    size: { w: 100, h: 100 },
    description: `A large, irregular chamber whose rough walls are scored with claw marks from floor to ceiling. A massive lizard — easily 12 feet long — rests motionless against the north wall, its scales the same grey as the stone. It is impossible to tell at first whether it is alive.

Then it opens one yellow eye.`,
    dmNote: '1 giant lizard. It prefers to wait for prey to come within range before striking. The lizard has been nesting here and has accumulated objects that caught its eye in a heap at the back of the den.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_32', doorType: 'open',   discovered: true },
      {
        direction: 'east',
        targetRoomId: 'q1_35',
        doorType: 'secret',
        discovered: false,
        secretDoorId: 'sd_34_35',
        hint: 'The lizard\'s nest is piled against the east wall. Moving it reveals a passage.',
      },
    ],
    contents: {
      monsters: [createMonsterInstance('giant_lizard', 'q1_34_lizard_1', 18)],
      treasure: [
        treasure('q1_34_nest', 60,
          [
            item('q1_34_dwarven_helm', 'Dwarven Iron Helm', 'A sturdy helm of dwarven make. Provides +1 to AC when worn. Worth 30 gp.', 'armor'),
          ],
          'The lizard\'s nest in the east corner. Accessible after the lizard is defeated.'),
      ],
      traps: [],
      features: [
        { id: 'q1_34_lizard_nest', name: "Lizard's Nest", description: 'Piled debris and shiny objects. Contains treasure. Secret passage behind it.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 35 — The Junction ────────────────────────────────────────────────
  q1_35: {
    id: 'q1_35',
    number: 35,
    name: 'Junction',
    label: 'Junction',
    level: 1,
    mapPos: { x: 600, y: 500 },
    size: { w: 60, h: 100 },
    description: `A simple junction of two passages. Nothing remarkable — bare stone, a few torch burns on the walls from previous explorers, and a dead end to the south where someone appears to have started digging and then stopped.

The floor here shows heavy traffic: many boot prints in the grime.`,
    dmNote: 'Navigational junction. The abandoned digging to the south is a false clue — it leads nowhere.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_29', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_33', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q1_34', doorType: 'secret', discovered: false, secretDoorId: 'sd_34_35' },
    ],
    contents: { monsters: [], treasure: [], traps: [], features: [] },
    autoStartCombat: false,
    searchable: false,
  },

  // ── ROOM 36 — The Laboratory ──────────────────────────────────────────────
  q1_36: {
    id: 'q1_36',
    number: 36,
    name: 'The Laboratory',
    label: 'The Laboratory',
    level: 1,
    mapPos: { x: 600, y: 380 },
    size: { w: 120, h: 100 },
    description: `Benches are covered in cracked glass vials, stained copper tubing, and brittle parchment notes. The air smells faintly of chemicals and decay. Most of the equipment has been knocked to the floor and smashed.

Two giant rats have made their nest among the debris. They look up from whatever they were chewing and bare their teeth.`,
    dmNote: 'Room 36 from the canonical data — 2 giant rats, 20 gp, silver stirring rod. A complete Search of the laboratory bench yields additional alchemical notes (useful only to a Magic-User with Alchemy proficiency, or saleable to a wizard in town for 25 gp) and the silver stirring rod.',
    exits: [
      { direction: 'north', targetRoomId: 'q1_31', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q1_33', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q1_36_rat_1','q1_36_rat_2'],
      treasure: [
        gold('q1_36_coins', 20, 'Twenty gold pieces scattered amid the laboratory debris'),
        item('q1_36_stirring_rod', 'Silver Stirring Rod', 'A slender rod of solid silver used for alchemical work. Worth 15 gp.', 'misc'),
        item('q1_36_notes', 'Alchemical Notes', 'Densely written parchment notes on an unfinished experiment. Worth 25 gp to a wizard or alchemist.', 'document'),
      ],
      traps: [],
      features: [
        { id: 'q1_36_bench', name: 'Laboratory Bench', description: 'Most equipment is smashed. The silver stirring rod and alchemical notes require a Search.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Secret Door Registry — all secret doors on Level 1
// ─────────────────────────────────────────────────────────────────────────────
export const LEVEL1_SECRET_DOORS = {
  sd_7_15: {
    id: 'sd_7_15',
    roomA: 'q1_7',
    roomB: 'q1_15',
    hint: 'A section of the north-west wall of the Guard Chamber shifts inward.',
    detectChance: { default: 1/6, elf: 2/6, dwarf: 2/6, thief: 1/6 },
  },
  sd_11_18: {
    id: 'sd_11_18',
    roomA: 'q1_11',
    roomB: 'q1_18',
    hint: 'The mounted boar\'s head near the east wall of the Trophy Hall can be rotated — it triggers a catch.',
    detectChance: { default: 1/6, elf: 2/6, dwarf: 2/6, thief: 1/6 },
  },
  sd_34_35: {
    id: 'sd_34_35',
    roomA: 'q1_34',
    roomB: 'q1_35',
    hint: "The lizard's nest is piled against the east wall. Moving the debris reveals a low passage.",
    detectChance: { default: 1/6, elf: 2/6, dwarf: 2/6, thief: 1/6 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a Level 1 room by its ID.
 * @param {string} roomId
 * @returns {object|null}
 */
export function getLevel1Room(roomId) {
  return LEVEL1_ROOMS[roomId] || null;
}

/**
 * Get all Level 1 rooms.
 * @returns {object[]}
 */
export function getAllLevel1Rooms() {
  return Object.values(LEVEL1_ROOMS);
}

/**
 * Get a secret door definition by its ID.
 * @param {string} doorId
 * @returns {object|null}
 */
export function getSecretDoor(doorId) {
  return LEVEL1_SECRET_DOORS[doorId] || null;
}

/**
 * Get all monster instances placed on Level 1.
 * (Keyed by instanceId for quick lookup.)
 * @returns {object}
 */
export function getLevel1MonsterInstances() {
  return MONSTERS;
}

export default LEVEL1_ROOMS;
