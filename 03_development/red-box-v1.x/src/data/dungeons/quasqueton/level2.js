/**
 * level2.js
 * B1: In Search of the Unknown — Level 2 of the Caverns of Quasqueton
 *
 * 17 rooms. Canonical stocking (fixed).
 * Level 2 is deeper, darker, and more dangerous than Level 1.
 * The monsters here are higher-HD than Level 1 averages.
 *
 * mapPos coordinates continue the same SVG coordinate system as Level 1,
 * but are rendered in a separate SVG canvas when the player descends.
 * Origin is top-left. Each 10' square = 20px.
 */

import { createMonsterInstance } from './bestiary.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper factories
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
// Monster instances — Level 2 uses tougher types and higher HP values
// ─────────────────────────────────────────────────────────────────────────────
const MONSTERS = {
  // Room 38 — Ghouls (2) — SPECIAL ROOM
  q2_38_ghoul_1: createMonsterInstance('ghoul', 'q2_38_ghoul_1', 12),
  q2_38_ghoul_2: createMonsterInstance('ghoul', 'q2_38_ghoul_2', 10),
  // Room 39 — Troglodytes (3)
  q2_39_trog_1: createMonsterInstance('troglodyte', 'q2_39_trog_1', 11),
  q2_39_trog_2: createMonsterInstance('troglodyte', 'q2_39_trog_2', 9),
  q2_39_trog_3: createMonsterInstance('troglodyte', 'q2_39_trog_3', 12),
  // Room 40 — Zombies (3)
  q2_40_zombie_1: createMonsterInstance('zombie', 'q2_40_zombie_1', 10),
  q2_40_zombie_2: createMonsterInstance('zombie', 'q2_40_zombie_2', 12),
  q2_40_zombie_3: createMonsterInstance('zombie', 'q2_40_zombie_3', 9),
  // Room 42 — Gnolls (3)
  q2_42_gnoll_1: createMonsterInstance('gnoll', 'q2_42_gnoll_1', 13),
  q2_42_gnoll_2: createMonsterInstance('gnoll', 'q2_42_gnoll_2', 11),
  q2_42_gnoll_3: createMonsterInstance('gnoll', 'q2_42_gnoll_3', 14),
  // Room 44 — Giant Spiders (3)
  q2_44_spider_1: createMonsterInstance('giant_spider', 'q2_44_spider_1', 8),
  q2_44_spider_2: createMonsterInstance('giant_spider', 'q2_44_spider_2', 7),
  q2_44_spider_3: createMonsterInstance('giant_spider', 'q2_44_spider_3', 9),
  // Room 46 — Ghoul (1)
  q2_46_ghoul_1: createMonsterInstance('ghoul', 'q2_46_ghoul_1', 14),
  // Room 47 — Gelatinous Cube — SPECIAL ROOM
  q2_47_cube_1: createMonsterInstance('gelatinous_cube', 'q2_47_cube_1', 28),
  // Room 49 — Orcs (5)
  q2_49_orc_1: createMonsterInstance('orc', 'q2_49_orc_1', 7),
  q2_49_orc_2: createMonsterInstance('orc', 'q2_49_orc_2', 5),
  q2_49_orc_3: createMonsterInstance('orc', 'q2_49_orc_3', 8),
  q2_49_orc_4: createMonsterInstance('orc', 'q2_49_orc_4', 6),
  q2_49_orc_5: createMonsterInstance('orc', 'q2_49_orc_5', 7),
  // Room 51 — Hobgoblins (4)
  q2_51_hob_1: createMonsterInstance('hobgoblin', 'q2_51_hob_1', 8),
  q2_51_hob_2: createMonsterInstance('hobgoblin', 'q2_51_hob_2', 7),
  q2_51_hob_3: createMonsterInstance('hobgoblin', 'q2_51_hob_3', 6),
  q2_51_hob_4: createMonsterInstance('hobgoblin', 'q2_51_hob_4', 9),
  // Room 53 — Giant Lizard
  q2_53_lizard_1: createMonsterInstance('giant_lizard', 'q2_53_lizard_1', 22),
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2 ROOMS
// ─────────────────────────────────────────────────────────────────────────────

export const LEVEL2_ROOMS = {

  // ── ROOM 37 — The Bottom of the Pool Stair ────────────────────────────────
  q2_1: {
    id: 'q2_1',
    number: 37,
    name: 'The Dry Passage',
    label: 'Dry Passage',
    level: 2,
    mapPos: { x: 160, y: 600 },
    size: { w: 80, h: 60 },
    description: `The staircase from the pool chamber above emerges here — dry, despite having descended through water. The air is noticeably colder and carries a mineral smell quite different from Level 1 above.

Hewn stone gives way to natural rock with only minimal finishing. The passages here feel older, as if they predate the construction above.`,
    dmNote: 'Entry point from Level 1 Room 25 (the Pool Chamber). Leads deeper into the lower caverns. A faint hum can be heard from the east.',
    exits: [
      { direction: 'up', targetLevel: 1, targetRoomId: 'q1_25', doorType: 'stair', discovered: true, stairType: 'pool_stair', description: 'The pool staircase ascends.' },
      { direction: 'north', targetRoomId: 'q2_2', doorType: 'open', discovered: true },
      { direction: 'east',  targetRoomId: 'q2_3', doorType: 'closed', discovered: true },
    ],
    contents: { monsters: [], treasure: [], traps: [], features: [] },
    autoStartCombat: false,
    isCheckpoint: false,
    searchable: false,
  },

  // ── ROOM 38 — The Charnel Pit (SPECIAL ROOM) ──────────────────────────────
  q2_2: {
    id: 'q2_2',
    number: 38,
    name: 'The Charnel Pit',
    label: 'Charnel Pit',
    level: 2,
    mapPos: { x: 160, y: 480 },
    size: { w: 100, h: 100 },
    description: `The stench hits before you enter — the sweet, cloying rot of old flesh. A shallow pit occupies the center of this chamber, filled with the bones and decaying remains of many creatures. Some of the remains are recent.

Two figures crouch at the edge of the pit, feeding. They look up as you enter, their mouths ringed black, their eyes flat and hungry.`,
    dmNote: 'SPECIAL ROOM. 2 ghouls feeding at the charnel pit. Their paralysis ability is extremely dangerous at low levels. They have collected items from their victims in a nook in the pit wall.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_1', doorType: 'open',   discovered: true },
      { direction: 'east',  targetRoomId: 'q2_4', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_5', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_38_ghoul_1','q2_38_ghoul_2'],
      treasure: [
        treasure('q2_2_ghoul_hoard', 80,
          [
            item('q2_2_ring', 'Ring of Protection +1', 'A plain iron ring that carries a faint magical field. Grants +1 to AC and saving throws.', 'ring_magic'),
          ],
          'Nook in the charnel pit wall, accessible after the ghouls are defeated.'),
      ],
      traps: [],
      features: [
        { id: 'q2_2_pit', name: 'Charnel Pit', description: 'A pit of old remains. The magical ring is in a nook in the pit wall.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'Ghouls\' paralysis is instant danger at low levels. Elves are immune. Cleric Turn Undead (difficulty 11) may affect them.',
  },

  // ── ROOM 39 — Troglodyte Warren ───────────────────────────────────────────
  q2_3: {
    id: 'q2_3',
    number: 39,
    name: 'Troglodyte Warren',
    label: 'Troglodyte Warren',
    level: 2,
    mapPos: { x: 300, y: 600 },
    size: { w: 120, h: 100 },
    description: `A damp, low-ceilinged warren that reeks of the musky stench of troglodytes. The walls are slick with moisture, and crude scratches cover every surface — territorial markings and crude pictograms in a language that is not quite any you know.

Three troglodytes emerge from the darkness, their skin rippling between shades of grey and brown.`,
    dmNote: '3 troglodytes. Stench special ability triggers immediately. Their chameleonic skin gives them surprise on 1-2 (d6). A central "throne" stone suggests a chieftain among them.',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_1', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_4', doorType: 'open',   discovered: true },
      { direction: 'east',  targetRoomId: 'q2_6', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_39_trog_1','q2_39_trog_2','q2_39_trog_3'],
      treasure: [
        treasure('q2_3_chieftain_hoard', 110,
          [item('q2_3_claw_necklace', 'Claw Necklace of Commanding', 'A necklace of carved claws. Troglodytes who see it worn by a non-troglodyte roll morale at -1.', 'misc')],
          'The chieftain\'s hoard beneath the throne stone. Search required.'),
      ],
      traps: [],
      features: [
        { id: 'q2_3_throne', name: 'Throne Stone', description: 'A flat boulder used as a seat of authority. Hoard beneath it.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    surpriseBonus: 2,
    searchable: true,
  },

  // ── ROOM 40 — Zombie Burial Chamber ──────────────────────────────────────
  q2_4: {
    id: 'q2_4',
    number: 40,
    name: 'Zombie Burial Chamber',
    label: 'Zombie Chamber',
    level: 2,
    mapPos: { x: 300, y: 480 },
    size: { w: 100, h: 100 },
    description: `Stone burial alcoves line the walls of this chamber, each sealed with a carved slab bearing a stylized skull motif. Three of the slabs have been pushed out from within, and the three zombies that once rested behind them now occupy the center of the room.

They turn toward you with the slow, inevitable movement of the mindless dead.`,
    dmNote: '3 zombies — always act last in round. Clerics can Turn. The broken burial slabs suggest these were not always undead — they were interred as honored dead and later animated by some dark influence.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_3', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q2_2', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_7', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q2_8', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_40_zombie_1','q2_40_zombie_2','q2_40_zombie_3'],
      treasure: [
        treasure('q2_4_burial_goods', 50,
          [item('q2_4_amulet', 'Amulet of Protection from Undead', 'A carved bone amulet. Undead must roll morale at -1 when attacking the bearer.', 'misc')],
          'Burial goods from the intact alcoves. Search required.'),
      ],
      traps: [],
      features: [
        { id: 'q2_4_alcoves', name: 'Stone Burial Alcoves', description: 'Several are still sealed. The amulet is in one of the intact alcoves.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 41 — The Deep Spring ─────────────────────────────────────────────
  q2_5: {
    id: 'q2_5',
    number: 41,
    name: 'The Deep Spring',
    label: 'Deep Spring',
    level: 2,
    mapPos: { x: 160, y: 340 },
    size: { w: 100, h: 100 },
    description: `The sound of running water reaches you before you enter. A natural spring bubbles up through a crack in the floor, filling a pool no larger than a bathtub before draining away through another crack. The water is clear and cold.

The air here is cleaner than anywhere else on this level. The stone walls are covered in a thin growth of pale green moss.`,
    dmNote: 'The spring water is pure and restorative. Characters who drink from it recover 1d4 HP (once per adventure visit). Filling waterskins here provides water for 3 days. No monsters and no treasure — a rare rest stop on Level 2.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_2', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q2_7', doorType: 'open',   discovered: true },
      { direction: 'north', targetRoomId: 'q2_9', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        {
          id: 'q2_5_spring',
          name: 'Natural Spring',
          description: 'Pure, cold water. Drinking restores 1d4 HP (once per adventure visit). Fills waterskins.',
          interactive: true,
          restorative: true,
          healingFormula: '1d4',
        },
      ],
    },
    autoStartCombat: false,
    searchable: false,
    isSpecialRoom: true,
    specialNote: 'Healing spring — one of the few safe places on Level 2.',
  },

  // ── ROOM 42 — The Gnoll Chieftain's Hall ──────────────────────────────────
  q2_6: {
    id: 'q2_6',
    number: 42,
    name: "The Gnoll Chief's Hall",
    label: "Gnoll Chief's Hall",
    level: 2,
    mapPos: { x: 480, y: 600 },
    size: { w: 120, h: 100 },
    description: `A larger-than-average chamber that clearly serves as the gathering point for the gnolls of Level 2. Three gnolls are present — larger and better-armed than those above. The largest wears a torn military tabard and carries a massive battle axe.

A crude throne of stacked crates and stolen furniture occupies the north end. The floor is thick with gnawed bones.`,
    dmNote: '3 gnolls including a chieftain (the largest, with the battle axe — treat as a gnoll at full HP: 16). The chieftain\'s lockbox is behind the throne.',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_3', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_8', doorType: 'closed', discovered: true },
      {
        direction: 'east',
        targetRoomId: 'q2_10',
        doorType: 'secret',
        discovered: false,
        secretDoorId: 'sd_42_50',
        hint: 'The gnoll throne is mounted against the east wall. Behind it, a block swings out.',
      },
    ],
    contents: {
      monsters: ['q2_42_gnoll_1','q2_42_gnoll_2','q2_42_gnoll_3'],
      treasure: [
        treasure('q2_6_lockbox', 200,
          [
            item('q2_6_battleaxe', 'Battle Axe +1', 'The gnoll chieftain\'s battle axe. Balanced for a large hand but usable by any. Magically sharp.', 'weapon_magic'),
            item('q2_6_gem', 'Large Amethyst', 'A deep purple amethyst, well-cut. Worth 100 gp.', 'gem'),
          ],
          'The chieftain\'s lockbox behind the throne. Requires Search.'),
      ],
      traps: [],
      features: [
        { id: 'q2_6_throne', name: 'Gnoll Throne', description: 'Stacked crates and stolen furniture. The lockbox and secret door are behind it.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 43 — The Collapsed Gallery ──────────────────────────────────────
  q2_7: {
    id: 'q2_7',
    number: 43,
    name: 'The Collapsed Gallery',
    label: 'Collapsed Gallery',
    level: 2,
    mapPos: { x: 300, y: 340 },
    size: { w: 120, h: 100 },
    description: `A large room whose ceiling has partially collapsed, leaving a rubble pile in the center and a narrow path along the east and west walls. Dust still drifts from the fractured stone above.

Among the rubble you can see the remains of what was once a beautiful mosaic floor — shattered now, but the gold and lapis tesserae catch the light.`,
    dmNote: 'Empty of monsters. The rubble pile takes 1 turn to navigate safely. Collecting tesserae from the mosaic yields 30 gp in raw materials (1 turn of work). A Search of the rubble reveals a sealed stone box — a small reliquary containing a Scroll of Cure Light Wounds (Cleric).',
    exits: [
      { direction: 'south', targetRoomId: 'q2_4', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q2_5', doorType: 'open',   discovered: true },
      { direction: 'north', targetRoomId: 'q2_9', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q2_11', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        gold('q2_7_tesserae', 30, 'Gold and lapis lazuli mosaic tesserae recovered from the rubble.'),
        item('q2_7_reliquary', 'Stone Reliquary', 'A sealed stone box containing a Scroll of Cure Light Wounds (Cleric, 1 use).', 'scroll'),
      ],
      traps: [],
      features: [
        { id: 'q2_7_rubble', name: 'Rubble Pile', description: 'Collapsed ceiling debris. Navigate in 1 turn. Tesserae and reliquary require a Search.', searchRequired: true },
        { id: 'q2_7_mosaic', name: 'Shattered Mosaic', description: 'Once a magnificent floor. The tesserae still have value.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 44 — The Spider Cathedral ───────────────────────────────────────
  q2_8: {
    id: 'q2_8',
    number: 44,
    name: 'The Spider Cathedral',
    label: 'Spider Cathedral',
    level: 2,
    mapPos: { x: 480, y: 480 },
    size: { w: 120, h: 100 },
    description: `The vaulted ceiling of this chamber — easily 30 feet high — is entirely filled with webbing, forming a dense canopy above. From the webs hang the silk-wrapped bundles of dozens of past meals.

Three giant spiders descend instantly the moment you enter, each the size of a large dog.`,
    dmNote: '3 giant spiders. This is the densest web encounter in the dungeon — the entire upper half of the room is difficult terrain. Torchlight is partially obscured by the webs. The wrapped bundles include the body of a Knight-errant from two years past — his armor is still serviceable.',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_4', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q2_6', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_11', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q2_12', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_44_spider_1','q2_44_spider_2','q2_44_spider_3'],
      treasure: [
        treasure('q2_8_knight', 90,
          [
            item('q2_8_chain_armor', 'Chain Mail Armor', 'A knight\'s chain mail, recovered from the webs. Still intact, though stained.', 'armor'),
            item('q2_8_signet', 'Silver Signet Ring', 'A noble family\'s seal ring. The crest is unidentified. Worth 40 gp.', 'jewelry'),
          ],
          'The wrapped knight in the webs. Accessible after combat.'),
      ],
      traps: [],
      features: [
        { id: 'q2_8_webs', name: 'Dense Webbing', description: 'Fills the upper half of the room. Difficult terrain. Partial obscurement.' },
        { id: 'q2_8_wrapped', name: 'Wrapped Bundles', description: 'Dozens of old prey. The knight is the most recently wrapped.', searchRequired: true },
      ],
    },
    autoStartCombat: true,
    webTerrain: true,
    searchable: true,
  },

  // ── ROOM 45 — The Fungal Chamber ──────────────────────────────────────────
  q2_9: {
    id: 'q2_9',
    number: 45,
    name: 'The Fungal Chamber',
    label: 'Fungal Chamber',
    level: 2,
    mapPos: { x: 160, y: 200 },
    size: { w: 120, h: 120 },
    description: `A chamber completely transformed by centuries of moisture and darkness. The floor is carpeted with pale grey fungi ranging from thumbnail-size to waist-high. Bioluminescent caps on several clusters cast a dim blue-green glow.

The air is thick with spores. Moving through the fungi disturbs clouds of them.`,
    dmNote: 'The spores are mildly hallucinogenic — characters who fail a Save vs. Poison (required after spending more than 1 turn here) see patterns in the walls and suffer -1 to attack for 1 hour. Some of the fungi are edible (nutritious but foul-tasting). One large toadstool cap conceals a small wooden box wedged against the far wall.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_5', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q2_7', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_13', doorType: 'closed', discovered: true },
      { direction: 'east',  targetRoomId: 'q2_11', doorType: 'open',   discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        treasure('q2_9_wooden_box', 0,
          [
            item('q2_9_wand', 'Wand of Light (3 charges)', 'A plain wooden wand. Emits Light spell effect (60\' radius, 6 turns) for each charge.', 'wand'),
          ],
          'A small wooden box wedged against the far wall beneath a large toadstool. Search required.'),
      ],
      traps: [
        {
          id: 'q2_9_spores',
          type: 'gas',
          detected: false,
          triggered: true,   // automatically triggers after 1 turn
          detectChance: { default: 0, thief: 0.5 },
          description: 'Hallucinogenic spore clouds fill the chamber.',
          effect: 'Save vs. Poison or suffer -1 to attack rolls for 1 hour.',
          damage: null,
          autoTrigger: true,
          turnsToTrigger: 1,
        },
      ],
      features: [
        { id: 'q2_9_fungi', name: 'Vast Fungal Growth', description: 'Fills the entire floor. Disturbing the fungi raises spore clouds.' },
        { id: 'q2_9_bioluminescence', name: 'Glowing Fungi', description: 'Provides dim blue-green light. Not enough to negate darkness penalties but creates an eerie ambiance.' },
        { id: 'q2_9_box', name: 'Wooden Box', description: 'Concealed under a toadstool near the far wall. Requires Search.', searchRequired: true },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 46 — The Secret Vault ────────────────────────────────────────────
  q2_10: {
    id: 'q2_10',
    number: 46,
    name: 'The Secret Vault',
    label: 'Secret Vault',
    level: 2,
    mapPos: { x: 640, y: 480 },
    size: { w: 100, h: 100 },
    description: `A chamber that smells of old parchment and dust. Stone shelves line the walls, most empty. One wall holds a heavy iron safe, its door slightly ajar.

A ghoul crouches beside the safe, apparently trying to pry it open with its fingers. It has left gouges in the iron. It turns to face you.`,
    dmNote: '1 ghoul guarding (or more accurately trying to open) the safe. The safe contains the most valuable single haul on Level 2. The ghoul cannot open it — the mechanism is magical.',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_6', doorType: 'secret', discovered: false, secretDoorId: 'sd_42_50' },
      { direction: 'north', targetRoomId: 'q2_12', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_46_ghoul_1'],
      treasure: [
        treasure('q2_10_vault', 300,
          [
            item('q2_10_sword', 'Sword +2', 'A finely balanced long sword of obvious magical origin. The blade bears faint runes along the fuller.', 'weapon_magic'),
            item('q2_10_scroll_mmu', 'Scroll of Magic Missile (3 charges)', 'A vellum scroll. Contains three castings of Magic Missile (1d6+1 each, auto-hit).', 'scroll'),
          ],
          'The iron safe. The mechanism is magical — opens when touched by the Ring of Protection from Room 38.'),
      ],
      traps: [
        {
          id: 'q2_10_safe_lock',
          type: 'magical_lock',
          detected: false,
          triggered: false,
          detectChance: { default: 0, thief: 0, dwarf: 0 },
          description: 'The iron safe has a magical lock. Normal thieves\' tools cannot open it.',
          effect: 'Requires the Ring of Protection from Room 38 to open.',
          keyItem: 'q2_2_ring',
          damage: null,
        },
      ],
      features: [
        { id: 'q2_10_safe', name: 'Iron Safe', description: 'Ajar. The ghoul\'s claw marks scar the exterior. Magical lock — opened by the Ring of Protection from Room 38.' },
      ],
    },
    autoStartCombat: true,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'The vault safe requires the Ring of Protection (from Room 38 / q2_2) to open. This creates a meaningful object-puzzle loop.',
  },

  // ── ROOM 47 — The Gelatinous Cube Corridor (SPECIAL ROOM) ─────────────────
  q2_11: {
    id: 'q2_11',
    number: 47,
    name: 'The Cube Corridor',
    label: 'Cube Corridor',
    level: 2,
    mapPos: { x: 300, y: 200 },
    size: { w: 60, h: 240 },  // tall narrow corridor
    description: `A long, perfectly straight corridor — remarkable for how clean it is. No dust, no debris, no bones. Not even a cobweb. The floor, walls, and ceiling are uniformly smooth and slightly... gleaming.

As you walk forward, you notice a faint shimmer filling the corridor from floor to ceiling, wall to wall. By the time you recognize what it is, it may already be too late.`,
    dmNote: 'SPECIAL ROOM. 1 gelatinous cube fills the corridor from wall to wall (10 feet wide, 10 feet tall, 10 feet deep). The cube is transparent and nearly invisible until a character is within 10 feet (Surprise on 1-3 on d6 for the first encounter). The cube\'s engulf ability is the primary danger. Items absorbed by previous victims float in the center of the cube.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_7', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q2_8', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_13', doorType: 'open',   discovered: true },
      { direction: 'west',  targetRoomId: 'q2_9', doorType: 'open',   discovered: true },
    ],
    contents: {
      monsters: ['q2_47_cube_1'],
      treasure: [
        treasure('q2_11_absorbed', 0,
          [
            item('q2_11_helm', 'Helm of the Fallen', 'A battered great helm, floating in the cube. Still usable after cleaning. Provides +1 AC.', 'armor'),
            item('q2_11_coins_absorbed', '45 Gold Pieces', 'Coins floating in the gelatinous mass. Easily recovered after the cube is defeated.', 'coins'),
          ],
          'Items absorbed by the cube, visible floating within its mass. Recovered after the cube is defeated.'),
      ],
      traps: [],
      features: [
        {
          id: 'q2_11_cube',
          name: 'Gelatinous Cube',
          description: 'Transparent and almost invisible. Surprise on 1-3. Fills corridor wall-to-wall. Items float within.',
          transparent: true,
        },
      ],
    },
    autoStartCombat: true,
    surpriseBonus: 3,
    searchable: false,
    isSpecialRoom: true,
    specialNote: 'The gelatinous cube is nearly invisible. First encounter surprises on 1-3 (d6). The absorbed items are visible once combat begins.',
  },

  // ── ROOM 48 — The Alchemy Dump ────────────────────────────────────────────
  q2_12: {
    id: 'q2_12',
    number: 48,
    name: 'The Alchemy Dump',
    label: 'Alchemy Dump',
    level: 2,
    mapPos: { x: 640, y: 340 },
    size: { w: 100, h: 100 },
    description: `A room that served as a dumping ground for failed experiments and exhausted alchemical materials. The floor is stained in a dozen colors and pitted where acids have eaten into the stone. The smell is a medley of sulfur, alcohol, and something sweet and wrong.

Most containers are empty or cracked. But some are intact, their contents sloshing when you move them.`,
    dmNote: 'No monsters. Contains 1d6 random potions — use the DM\'s random potion table. For fixed canonical stocking, the contents are: Potion of Healing, Potion of ESP, Potion of Poison (looks identical to the others without Detect Magic). Also contains components worth 50 gp to an alchemist.',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_8', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q2_10', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_14', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q2_12_potion_c', 'Potion of Healing (unlabeled)', 'A corked vial. Restores 1d6+1 HP. Detect Magic reveals its nature.', 'potion'),
        item('q2_12_potion_d', 'Potion of ESP (unlabeled)', 'A corked vial. Grants ESP for 1 hour when consumed. Detect Magic reveals its nature.', 'potion'),
        item('q2_12_potion_e', 'Potion of Poison (unlabeled)', 'A corked vial. Appears identical to the others. Save vs. Poison or die.', 'potion_poison'),
        gold('q2_12_components', 50, 'Alchemical components worth 50 gp to an alchemist or wizard.'),
      ],
      traps: [],
      features: [
        { id: 'q2_12_acid_stains', name: 'Acid-Pitted Floor', description: 'Stained and pitted from years of failed experiments. The acid is long since inert.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
  },

  // ── ROOM 49 — The Orc Stronghold ──────────────────────────────────────────
  q2_13: {
    id: 'q2_13',
    number: 49,
    name: 'The Orc Stronghold',
    label: 'Orc Stronghold',
    level: 2,
    mapPos: { x: 300, y: 60 },
    size: { w: 160, h: 100 },
    description: `The largest humanoid lair in the dungeon: a fortified orc position. A crude barrier of overturned tables and rubble has been erected inside the entrance. Five orcs are behind it, armed and alert. They have torches mounted on the walls and a commanding view of the approaches.

This is clearly an organized position, not a random infestation.`,
    dmNote: '5 orcs in a defensive position. The barricade provides +2 to their AC for the first round of combat (until knocked down). They have a signal drum — if not stopped in round 1, they alert the Hobgoblin Garrison in Room 51. Their combined wealth is in a chest.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_9', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q2_11', doorType: 'open',   discovered: true },
      { direction: 'east',  targetRoomId: 'q2_14', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q2_15', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_16', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_49_orc_1','q2_49_orc_2','q2_49_orc_3','q2_49_orc_4','q2_49_orc_5'],
      treasure: [
        treasure('q2_13_chest', 175,
          [item('q2_13_war_horn', 'War Horn', 'A bronze war horn. Usable to signal (or mislead) humanoid forces.', 'misc')],
          'Chest behind the barricade. Search required.'),
      ],
      traps: [],
      features: [
        { id: 'q2_13_barricade', name: 'Orc Barricade', description: 'Provides +2 AC to orcs in the first round. Can be knocked down.' },
        { id: 'q2_13_drum', name: 'Signal Drum', description: 'If beaten, alerts the hobgoblin garrison in Room 51.' },
      ],
    },
    autoStartCombat: true,
    searchable: true,
  },

  // ── ROOM 50 — The Ruined Chapel ───────────────────────────────────────────
  q2_14: {
    id: 'q2_14',
    number: 50,
    name: 'The Ruined Chapel',
    label: 'Ruined Chapel',
    level: 2,
    mapPos: { x: 500, y: 60 },
    size: { w: 120, h: 100 },
    description: `A former chapel reduced to ruin. Smashed statuary lies in pieces across the floor. An altar at the north end has been deliberately defaced — deep chisel marks obscure its original inscription. What deity was worshipped here has been erased.

The air feels wrong here. Not cold exactly, but uncomfortably hollow, like the absence of something that should be present.`,
    dmNote: 'No monsters. The emptiness is the result of a failed magical experiment that drained the positive energy from this room. Clerics cannot recover spells here and Turn Undead is at -2. A Search of the altar base reveals a hidden compartment with a Cleric scroll (Cure Light Wounds × 3 castings).',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_13', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q2_12', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_17', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: [],
      treasure: [
        item('q2_14_scroll', 'Cleric Scroll (Cure Light Wounds ×3)', 'A scroll with three castings of Cure Light Wounds. Each restores 1d6+1 HP.', 'scroll'),
      ],
      traps: [],
      features: [
        {
          id: 'q2_14_altar',
          name: 'Defaced Altar',
          description: 'Original inscription erased. Hidden compartment in the base contains a scroll. Negative energy aura: Clerics cannot recover spells here; Turn Undead at -2.',
          searchRequired: true,
          negativeEnergy: true,
        },
        { id: 'q2_14_statuary', name: 'Smashed Statuary', description: 'Deliberately destroyed, violently. No value remains.' },
      ],
    },
    autoStartCombat: false,
    searchable: true,
    clericPenalty: true,
  },

  // ── ROOM 51 — Hobgoblin Garrison (Deep) ───────────────────────────────────
  q2_15: {
    id: 'q2_15',
    number: 51,
    name: 'Hobgoblin Deep Garrison',
    label: 'Hobgoblin Garrison',
    level: 2,
    mapPos: { x: 100, y: 60 },
    size: { w: 140, h: 100 },
    description: `A garrison room with the tidy, ordered quality the hobgoblins impose wherever they settle. Four hobgoblins are present: two at a table, two standing watch at the north door. They move to combat positions with practiced efficiency.

A war map pinned to the south wall shows Level 2 of the dungeon — marked with their patrol routes.`,
    dmNote: '4 hobgoblins. If the orcs in Room 49 used their signal drum, 2 additional hobgoblins join from the north corridor (already deployed). The war map reveals all Level 2 room locations to the players\' in-game map (like the stone map on Level 1). Their strongbox is built into the wall.',
    exits: [
      { direction: 'east',  targetRoomId: 'q2_13', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_16', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_51_hob_1','q2_51_hob_2','q2_51_hob_3','q2_51_hob_4'],
      treasure: [
        treasure('q2_15_strongbox', 220,
          [
            item('q2_15_sword1', 'Short Sword +1', 'A hobgoblin officer\'s short sword. The edge holds magic — +1 to attack and damage.', 'weapon_magic'),
          ],
          'Wall-mounted strongbox. Key is on the hobgoblin sergeant (the one at the north door).'),
      ],
      traps: [],
      features: [
        {
          id: 'q2_15_war_map',
          name: 'Hobgoblin War Map',
          description: 'Reveals all Level 2 room locations on the players\' in-game map.',
          interactive: true,
          mapReveal: true,
          level: 2,
        },
        { id: 'q2_15_strongbox', name: 'Wall Strongbox', description: 'Key on the sergeant. Contains the reward.', locked: true },
      ],
    },
    autoStartCombat: true,
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'The war map reveals all Level 2 rooms. Alarm link to Room 49 orc drum.',
  },

  // ── ROOM 52 — The Hall of Pillars ─────────────────────────────────────────
  q2_16: {
    id: 'q2_16',
    number: 52,
    name: 'The Hall of Pillars',
    label: 'Hall of Pillars',
    level: 2,
    mapPos: { x: 300, y: -100 },
    size: { w: 200, h: 100 },
    description: `A large hall supported by six massive pillars, each carved with interlocking serpent and dragon motifs — a grander version of the pillars on Level 1. The ceiling is vaulted high above. The room is empty of furniture.

The floor here is polished stone that reflects torchlight. At the far end, a large set of double doors stands — iron-banded hardwood, impressive and forbidding.`,
    dmNote: 'Empty of monsters. The double doors lead to the lower vault (Room 53). They are not locked but are very heavy — require combined STR of 30 to open (two characters working together, or one with STR 17+). The doors bear no trap, but they make a loud grinding noise when opened — anything in Room 53 will not be surprised.',
    exits: [
      { direction: 'south', targetRoomId: 'q2_13', doorType: 'closed', discovered: true },
      { direction: 'south', targetRoomId: 'q2_15', doorType: 'closed', discovered: true },
      { direction: 'north', targetRoomId: 'q2_17', doorType: 'open',   discovered: true },
      {
        direction: 'east',
        targetRoomId: 'q2_17',
        doorType: 'closed',
        discovered: true,
        heavy: true,
        description: 'Iron-banded double doors. Very heavy — requires combined STR 30 or STR 17+ solo to open. Opens with a loud grinding noise.',
      },
    ],
    contents: {
      monsters: [],
      treasure: [],
      traps: [],
      features: [
        { id: 'q2_16_pillars', name: 'Carved Stone Pillars', description: 'Six massive columns with serpent and dragon motifs. Grander than those on Level 1.' },
        { id: 'q2_16_doors', name: 'Iron-Banded Double Doors', description: 'Very heavy. Requires combined STR 30 to open. Opens loudly — no surprise possible for Room 53.' },
      ],
    },
    autoStartCombat: false,
    searchable: false,
  },

  // ── ROOM 53 — The Lower Vault ─────────────────────────────────────────────
  q2_17: {
    id: 'q2_17',
    number: 53,
    name: 'The Lower Vault',
    label: 'The Lower Vault',
    level: 2,
    mapPos: { x: 500, y: -100 },
    size: { w: 160, h: 120 },
    description: `The greatest chamber in all of Quasqueton. A vaulted ceiling soars above you. The walls are lined with sealed iron doors — storage vaults, most of them ajar and looted. But the room is not empty.

A giant lizard, twelve feet long and broad as a horse, rests in the center of the chamber. It opens both eyes at the grinding of the doors, then rises.

At the north end of the chamber, behind the lizard, is a stone altar bearing a sealed iron chest. Around the chest, carved into the altar stone, are the words: ROGAHN AND ZELLIGAR — WE BUILT THIS. WE WILL RETURN.`,
    dmNote: 'THE END CHAMBER. 1 giant lizard guarding the vault. The iron chest is the climactic reward — it contains Rogahn\'s and Zelligar\'s combined personal treasure. The sealed vault doors in the walls are empty (already looted by the duo before their final expedition). The altar inscription is a plot hook for future adventures.',
    exits: [
      { direction: 'west',  targetRoomId: 'q2_16', doorType: 'closed', discovered: true },
      { direction: 'west',  targetRoomId: 'q2_14', doorType: 'closed', discovered: true },
    ],
    contents: {
      monsters: ['q2_53_lizard_1'],
      treasure: [
        treasure('q2_17_vault_chest', 500,
          [
            item('q2_17_rogahn_sword', "Rogahn's Sword", "Rogahn the Fearless's personal blade. A long sword +2 with a hilt carved in the shape of a roaring lion. Legendary quality.", 'weapon_legendary'),
            item('q2_17_zelligar_tome', "Zelligar's Spellbook", 'A heavy tome bound in dark leather. Contains all 1st level Magic-User spells (10 spells). A Magic-User can copy from it.', 'spellbook'),
            item('q2_17_jewels', 'Gem Hoard', 'Assorted gemstones: a sapphire, two rubies, three emeralds, and a large diamond. Total value: 600 gp.', 'gem'),
          ],
          'The sealed iron chest on the altar behind the giant lizard. The greatest treasure in Quasqueton.'),
      ],
      traps: [],
      features: [
        { id: 'q2_17_altar', name: 'Stone Altar with Inscription', description: '"ROGAHN AND ZELLIGAR — WE BUILT THIS. WE WILL RETURN." A promise, or a threat.' },
        { id: 'q2_17_vault_doors', name: 'Iron Vault Doors', description: 'Lined along the walls. All ajar, all empty. Looted by the masters before their final expedition.' },
      ],
    },
    autoStartCombat: true,
    noSurprise: true,   // the double doors announced you
    searchable: true,
    isSpecialRoom: true,
    specialNote: 'The climactic room. The lizard guards the final treasure. The inscription is a hook for future B-series adventures.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Secret Door Registry — Level 2
// ─────────────────────────────────────────────────────────────────────────────
export const LEVEL2_SECRET_DOORS = {
  sd_42_50: {
    id: 'sd_42_50',
    roomA: 'q2_6',
    roomB: 'q2_10',
    hint: 'The gnoll throne is mounted against the east wall of the Chief\'s Hall. Behind it, a block swings outward.',
    detectChance: { default: 1/6, elf: 2/6, dwarf: 2/6, thief: 1/6 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export function getLevel2Room(roomId) {
  return LEVEL2_ROOMS[roomId] || null;
}

export function getAllLevel2Rooms() {
  return Object.values(LEVEL2_ROOMS);
}

export function getLevel2SecretDoor(doorId) {
  return LEVEL2_SECRET_DOORS[doorId] || null;
}

export function getLevel2MonsterInstances() {
  return MONSTERS;
}

export default LEVEL2_ROOMS;
