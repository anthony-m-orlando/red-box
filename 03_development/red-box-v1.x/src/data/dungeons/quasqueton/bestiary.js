/**
 * bestiary.js
 * B1: In Search of the Unknown — Monster Type Definitions
 *
 * These are TEMPLATES, not instances. level1.js and level2.js stamp out
 * individual instances (with unique IDs and rolled HP) from these blueprints.
 *
 * Stats are canonical D&D Basic Rules (1983 Red Box / B/X):
 *   ac       — Armor Class (lower = better)
 *   hd       — Hit Dice string (e.g. "1", "1-1", "2", "1/2")
 *   hpMin    — minimum HP roll
 *   hpMax    — maximum HP roll
 *   thac0    — To Hit Armor Class 0
 *   damage   — damage formula per attack
 *   attacks  — number of attacks per round
 *   move     — movement in feet per turn
 *   morale   — morale score (2d6, fail = flee)
 *   xp       — XP value per monster
 *   save     — saving throw class+level (e.g. "F1" = Fighter 1)
 *   alignment
 *   special  — array of special ability descriptors (used by engine)
 */

export const B1_BESTIARY = {

  // ── Humanoids ────────────────────────────────────────────────────────────

  orc: {
    id: 'orc',
    name: 'Orc',
    plural: 'Orcs',
    ac: 6,
    hd: '1',
    hpMin: 1,
    hpMax: 8,
    thac0: 19,
    damage: '1d8',
    attacks: 1,
    move: 120,
    morale: 8,
    xp: 10,
    save: 'F1',
    alignment: 'Chaotic',
    special: [],
    description: 'Brutish nocturnal humanoids that despise light. Orcs lurk in the darker passages of Quasqueton, drawn by the promise of plunder left behind by Rogahn and Zelligar.',
    combatNarration: {
      attack: ['swings a rusted blade', 'lunges with a jagged spear', 'slashes with a heavy cleaver'],
      hit: ['The blow lands with a meaty thud.', 'You feel the bite of crude iron.'],
      miss: ['The orc overextends and stumbles.', 'You sidestep the clumsy swing.'],
      flee: ['The orc snarls and bolts for the shadows.'],
      death: ['The orc crumples to the floor with a guttural groan.'],
    },
  },

  troglodyte: {
    id: 'troglodyte',
    name: 'Troglodyte',
    plural: 'Troglodytes',
    ac: 5,
    hd: '2',
    hpMin: 2,
    hpMax: 16,
    thac0: 18,
    damage: '1d4',       // per claw/bite; attacks = 3
    attacks: 3,
    move: 120,
    morale: 9,
    xp: 20,
    save: 'F2',
    alignment: 'Chaotic',
    special: [
      {
        id: 'stench',
        name: 'Stench',
        trigger: 'on_entry',   // fires when troglodyte enters combat
        description: 'Overpowering musk fills the air.',
        effect: {
          type: 'save_or_penalty',
          save: 'poison',
          onFail: { stat: 'attack', modifier: -2, duration: 3 },  // -2 to attack for 3 rounds
          narration: 'The troglodyte\'s nauseating stench washes over you. Save vs. Poison or fight at -2 to attack for 3 rounds.',
        },
      },
      {
        id: 'chameleon',
        name: 'Chameleon Skin',
        trigger: 'passive',
        description: 'Troglodytes can blend into stone walls, surprising on a 1-4 on d6.',
        effect: { type: 'surprise_bonus', value: 4 },
      },
    ],
    description: 'Reptilian sub-humans that haunt the deepest corridors. Their skin shifts to match the grey stone of Quasqueton, and their musk can weaken the strongest fighter.',
    combatNarration: {
      attack: ['rakes with its claws', 'snaps with jagged teeth', 'tears at you with both claws and a vicious bite'],
      hit: ['Claws rake across your skin.', 'You stagger under the fetid assault.'],
      miss: ['The troglodyte\'s claws scrape stone.', 'You pull back just in time.'],
      flee: ['The troglodyte blends into the shadows and vanishes.'],
      death: ['The troglodyte collapses, its skin fading to grey.'],
    },
  },

  gnoll: {
    id: 'gnoll',
    name: 'Gnoll',
    plural: 'Gnolls',
    ac: 5,
    hd: '2',
    hpMin: 2,
    hpMax: 16,
    thac0: 18,
    damage: '2d4',
    attacks: 1,
    move: 90,
    morale: 8,
    xp: 20,
    save: 'F2',
    alignment: 'Chaotic',
    special: [],
    description: 'Hyena-headed humanoids nearly the height of a man, wielding heavy weapons with brutal efficiency. Their cackling laughter echoes down the corridors of Quasqueton.',
    combatNarration: {
      attack: ['swings a massive flail', 'brings a heavy axe down in a vicious arc', 'snaps its jaws while striking'],
      hit: ['The powerful blow staggers you.', 'The gnoll\'s brute strength hammers through your guard.'],
      miss: ['The gnoll\'s heavy weapon clangs against the floor.', 'You dart aside from the crushing swing.'],
      flee: ['The gnoll snarls and lopes away into the darkness.'],
      death: ['The gnoll collapses with a final mocking laugh cut short.'],
    },
  },

  kobold: {
    id: 'kobold',
    name: 'Kobold',
    plural: 'Kobolds',
    ac: 7,
    hd: '1/2',
    hpMin: 1,
    hpMax: 4,
    thac0: 19,
    damage: '1d4',
    attacks: 1,
    move: 90,
    morale: 6,
    xp: 5,
    save: 'NM',   // Normal Man
    alignment: 'Chaotic',
    special: [
      {
        id: 'pack_tactics',
        name: 'Pack Tactics',
        trigger: 'passive',
        description: 'Kobolds gain +1 to attack when two or more attack the same target.',
        effect: { type: 'attack_bonus_if_ally', value: 1 },
      },
    ],
    description: 'Small, craven reptilian humanoids that infest the lower reaches. Individually weak, they are cunning enough to set traps and dangerous in packs.',
    combatNarration: {
      attack: ['jabs with a crude spear', 'nicks at your ankles with a dagger', 'hurls a stone'],
      hit: ['The small blade finds a gap in your guard.', 'The spear pokes through.'],
      miss: ['The kobold squeaks and flails wildly.', 'You bat the tiny weapon aside.'],
      flee: ['The kobold shrieks and scurries away.'],
      death: ['The kobold collapses with a pitiful yelp.'],
    },
  },

  hobgoblin: {
    id: 'hobgoblin',
    name: 'Hobgoblin',
    plural: 'Hobgoblins',
    ac: 6,
    hd: '1+1',
    hpMin: 2,
    hpMax: 9,
    thac0: 18,
    damage: '1d8',
    attacks: 1,
    move: 90,
    morale: 9,
    xp: 15,
    save: 'F1',
    alignment: 'Chaotic',
    special: [],
    description: 'Larger, more disciplined cousins of goblins. Hobgoblins fight with military precision and hold their ground even when lesser creatures flee.',
    combatNarration: {
      attack: ['strikes with a short sword', 'advances with shield raised and sword leveled', 'delivers a disciplined thrust'],
      hit: ['The precise strike gets through your defense.', 'A controlled blow lands solidly.'],
      miss: ['The hobgoblin steps back and reassesses.', 'You deflect the disciplined strike.'],
      flee: ['The hobgoblin retreats in good order, covering its withdrawal.'],
      death: ['The hobgoblin falls, its military bearing collapsing with it.'],
    },
  },

  // ── Undead ────────────────────────────────────────────────────────────────

  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    plural: 'Skeletons',
    ac: 7,
    hd: '1',
    hpMin: 1,
    hpMax: 8,
    thac0: 19,
    damage: '1d6',
    attacks: 1,
    move: 60,
    morale: 12,   // undead never check morale
    xp: 10,
    save: 'F1',
    alignment: 'Chaotic',
    undead: true,
    special: [
      {
        id: 'undead_immunity',
        name: 'Undead Immunities',
        trigger: 'passive',
        description: 'Immune to sleep, charm, and hold spells. Immune to poison.',
        effect: { type: 'immunity', immuneTo: ['sleep', 'charm', 'hold', 'poison'] },
      },
      {
        id: 'turn_undead',
        name: 'Turned by Clerics',
        trigger: 'passive',
        description: 'Clerics may attempt to Turn Undead.',
        effect: { type: 'turnable', turnDifficulty: 7 },
      },
    ],
    description: 'Animated bones of the dead, driven by dark magic. The skeletons of Quasqueton may be the remains of those who perished here long ago.',
    combatNarration: {
      attack: ['strikes with a rusty blade', 'rakes bony fingers across you', 'swings a knobby arm'],
      hit: ['Bone strikes hard against flesh.', 'The skeleton\'s blow rattles through you.'],
      miss: ['The skeleton\'s blow clatters against stone.', 'You deflect a dry, rattling limb.'],
      flee: [],   // undead do not flee
      death: ['The skeleton collapses into a pile of loose bones.'],
    },
  },

  zombie: {
    id: 'zombie',
    name: 'Zombie',
    plural: 'Zombies',
    ac: 8,
    hd: '2',
    hpMin: 2,
    hpMax: 16,
    thac0: 18,
    damage: '1d8',
    attacks: 1,
    move: 60,   // always last in initiative
    morale: 12,
    xp: 20,
    save: 'F2',
    alignment: 'Chaotic',
    undead: true,
    alwaysLast: true,   // always acts last in round per B/X rules
    special: [
      {
        id: 'undead_immunity',
        name: 'Undead Immunities',
        trigger: 'passive',
        description: 'Immune to sleep, charm, and hold spells. Immune to poison.',
        effect: { type: 'immunity', immuneTo: ['sleep', 'charm', 'hold', 'poison'] },
      },
      {
        id: 'turn_undead',
        name: 'Turned by Clerics',
        trigger: 'passive',
        description: 'Clerics may attempt to Turn Undead.',
        effect: { type: 'turnable', turnDifficulty: 9 },
      },
    ],
    description: 'Shambling corpses that always attack last, relentless and beyond fear. Their slow gait makes them easier to hit, but they absorb tremendous punishment.',
    combatNarration: {
      attack: ['lurches forward with a heavy blow', 'slams with rotting fists', 'drags at you with dead hands'],
      hit: ['The zombie\'s dead weight slams into you.', 'You stagger under the blow.'],
      miss: ['The zombie\'s slow swing misses by a wide margin.', 'You easily sidestep the shambling attack.'],
      flee: [],
      death: ['The zombie collapses in a heap of rotten flesh.'],
    },
  },

  ghoul: {
    id: 'ghoul',
    name: 'Ghoul',
    plural: 'Ghouls',
    ac: 6,
    hd: '2',
    hpMin: 2,
    hpMax: 16,
    thac0: 18,
    damage: '1d3',    // per claw; 3 attacks
    attacks: 3,
    move: 90,
    morale: 9,
    xp: 25,
    save: 'F2',
    alignment: 'Chaotic',
    undead: true,
    special: [
      {
        id: 'paralysis',
        name: 'Paralyzing Touch',
        trigger: 'on_hit',
        description: 'Any creature hit must save vs. Paralysis or be paralyzed for 2d4 turns.',
        effect: {
          type: 'save_or_condition',
          save: 'paralysis',
          onFail: { condition: 'paralyzed', duration: '2d4', narration: 'Your limbs lock up! You are paralyzed!' },
        },
      },
      {
        id: 'undead_immunity',
        name: 'Undead Immunities',
        trigger: 'passive',
        description: 'Immune to sleep, charm, and hold spells.',
        effect: { type: 'immunity', immuneTo: ['sleep', 'charm', 'hold', 'poison'] },
      },
      {
        id: 'turn_undead',
        name: 'Turned by Clerics',
        trigger: 'passive',
        description: 'Clerics may attempt to Turn Undead.',
        effect: { type: 'turnable', turnDifficulty: 11 },
      },
      {
        id: 'elven_immunity',
        name: 'Elves Immune to Paralysis',
        trigger: 'passive',
        description: 'Elves are immune to ghoul paralysis.',
        effect: { type: 'racial_immunity', race: 'elf', immuneTo: 'paralysis' },
      },
    ],
    description: 'Undead carnivores that hunger for living flesh. Their touch can lock muscles solid — a paralyzed adventurer is easy prey for a ghoul\'s continuing attacks.',
    combatNarration: {
      attack: ['claws at you with cold fingers', 'rakes with three-fingered hands', 'bites with yellowed teeth'],
      hit: ['Icy claws rake across you. Save vs. Paralysis!', 'The ghoul\'s touch sends cold terror through your limbs.'],
      miss: ['The ghoul\'s claws scrape past you.', 'You pull back from the icy grasp.'],
      flee: [],
      death: ['The ghoul collapses into dust and rags.'],
    },
  },

  // ── Beasts ────────────────────────────────────────────────────────────────

  giant_rat: {
    id: 'giant_rat',
    name: 'Giant Rat',
    plural: 'Giant Rats',
    ac: 7,
    hd: '1/2',
    hpMin: 1,
    hpMax: 4,
    thac0: 19,
    damage: '1d3',
    attacks: 1,
    move: 120,
    morale: 8,
    xp: 5,
    save: 'F1',
    alignment: 'Neutral',
    special: [
      {
        id: 'disease',
        name: 'Disease',
        trigger: 'on_hit',
        description: '5% chance per hit of contracting a disease (save vs. Poison or lose 1 point of Constitution).',
        effect: {
          type: 'chance_save',
          chance: 0.05,
          save: 'poison',
          onFail: { stat: 'constitution', modifier: -1, permanent: true, narration: 'The rat\'s bite may carry disease. Save vs. Poison!' },
        },
      },
    ],
    description: 'Three-foot long rodents with matted grey fur that infest the lower passages. Individually they are weak, but they swarm in packs of a dozen or more.',
    combatNarration: {
      attack: ['darts in and bites', 'lunges for your ankle', 'snaps with yellowed teeth'],
      hit: ['Sharp teeth find flesh.', 'The rat\'s bite draws blood.'],
      miss: ['The rat misses and squeaks in frustration.', 'You stomp it back.'],
      flee: ['The rat squeals and scurries into the dark.'],
      death: ['The rat squeaks once and goes still.'],
    },
  },

  giant_spider: {
    id: 'giant_spider',
    name: 'Giant Spider',
    plural: 'Giant Spiders',
    ac: 8,
    hd: '1+1',
    hpMin: 2,
    hpMax: 9,
    thac0: 18,
    damage: '1d6',
    attacks: 1,
    move: 60,
    morale: 8,
    xp: 15,
    save: 'F1',
    alignment: 'Neutral',
    special: [
      {
        id: 'poison_bite',
        name: 'Poison Bite',
        trigger: 'on_hit',
        description: 'Save vs. Poison on a successful hit or die in 1d4 turns.',
        effect: {
          type: 'save_or_die',
          save: 'poison',
          delay: '1d4',
          narration: 'The spider\'s bite injects venom. Save vs. Poison or perish in moments!',
        },
      },
      {
        id: 'web',
        name: 'Web',
        trigger: 'on_entry',
        description: 'Spider webs in some rooms slow movement (treat as difficult terrain).',
        effect: { type: 'terrain', modifier: 'slow' },
      },
    ],
    description: 'Hairy black spiders the size of a large dog that lurk in webs strung between pillars and doorways. Their bite is lethal to the unprepared.',
    combatNarration: {
      attack: ['lunges from its web', 'drops from the ceiling and bites', 'scuttles forward with mandibles clacking'],
      hit: ['Mandibles pierce flesh. Save vs. Poison!', 'The spider bites deep.'],
      miss: ['The spider skitters back.', 'You knock the spider away.'],
      flee: ['The spider retreats up into the darkness of the ceiling.'],
      death: ['The spider curls its legs and lies still.'],
    },
  },

  stirge: {
    id: 'stirge',
    name: 'Stirge',
    plural: 'Stirges',
    ac: 7,
    hd: '1',
    hpMin: 1,
    hpMax: 8,
    thac0: 19,
    damage: '1d3',
    attacks: 1,
    move: 180,   // flies
    morale: 9,
    xp: 13,
    save: 'F2',
    alignment: 'Neutral',
    special: [
      {
        id: 'blood_drain',
        name: 'Blood Drain',
        trigger: 'on_hit',
        description: 'After a successful hit, a stirge attaches and drains 1d4 HP per round automatically until killed or pulled free (STR check).',
        effect: {
          type: 'attached_drain',
          drainFormula: '1d4',
          detachCheck: 'strength',
          narration: 'The stirge buries its proboscis in your flesh and begins draining blood!',
        },
      },
    ],
    description: 'Bat-winged creatures resembling giant mosquitoes that swarm from the ceilings of Quasqueton. Their needle-like beak punctures skin and drains blood rapidly.',
    combatNarration: {
      attack: ['swoops in with its proboscis extended', 'dives from the ceiling', 'wings beating, lunges at your neck'],
      hit: ['The stirge buries its beak in you and latches on!', 'Needle-sharp beak pierces flesh. It\'s attached!'],
      miss: ['The stirge swoops past your ear.', 'You swat the stirge away.'],
      flee: ['The stirge squeaks and flutters away.'],
      death: ['The stirge drops to the floor, legs curling.'],
    },
  },

  giant_lizard: {
    id: 'giant_lizard',
    name: 'Giant Lizard',
    plural: 'Giant Lizards',
    ac: 5,
    hd: '3+1',
    hpMin: 4,
    hpMax: 25,
    thac0: 16,
    damage: '1d8',
    attacks: 1,
    move: 120,
    morale: 8,
    xp: 50,
    save: 'F3',
    alignment: 'Neutral',
    special: [],
    description: 'A reptile the length of a horse that can cling to walls and ceilings. It lurks motionless until prey passes beneath it.',
    combatNarration: {
      attack: ['lunges with snapping jaws', 'whips its heavy tail', 'bites with powerful force'],
      hit: ['The massive jaws clamp down hard.', 'The lizard\'s tail sweeps you off balance.'],
      miss: ['The lizard misses and skitters on the stone.', 'You dodge the snapping jaws.'],
      flee: ['The lizard retreats to the wall and freezes.'],
      death: ['The giant lizard slumps to the floor.'],
    },
  },

  // ── Oozes & Vermin ────────────────────────────────────────────────────────

  gray_ooze: {
    id: 'gray_ooze',
    name: 'Gray Ooze',
    plural: 'Gray Oozes',
    ac: 8,
    hd: '3',
    hpMin: 3,
    hpMax: 24,
    thac0: 17,
    damage: '2d8',
    attacks: 1,
    move: 10,
    morale: 12,
    xp: 50,
    save: 'F2',
    alignment: 'Neutral',
    special: [
      {
        id: 'metal_corrosion',
        name: 'Corrode Metal',
        trigger: 'on_hit',
        description: 'Gray ooze dissolves metal on contact. Non-magical metal armor or weapons that touch it are destroyed.',
        effect: {
          type: 'destroy_item',
          targets: ['armor', 'weapon'],
          requiresMagic: true,
          narration: 'The ooze dissolves through metal! Your equipment is destroyed!',
        },
      },
      {
        id: 'immune_cold_fire',
        name: 'Cold & Fire Immunity',
        trigger: 'passive',
        description: 'Immune to cold and fire damage.',
        effect: { type: 'immunity', immuneTo: ['cold', 'fire'] },
      },
    ],
    description: 'A wet, grey slime that seeps across the floor and is easily mistaken for a puddle of standing water. It destroys metal on contact and is nearly immune to cold and fire.',
    combatNarration: {
      attack: ['surges forward and engulfs you', 'flows across the floor toward you', 'slaps a pseudopod against you'],
      hit: ['The ooze burns through your equipment! Metal corrodes on contact!', 'Acid seeps through your armor.'],
      miss: ['The ooze flows past your feet.', 'You leap back from the creeping mass.'],
      flee: [],
      death: ['The gray ooze liquefies and drains into the cracks of the floor.'],
    },
  },

  gelatinous_cube: {
    id: 'gelatinous_cube',
    name: 'Gelatinous Cube',
    plural: 'Gelatinous Cubes',
    ac: 8,
    hd: '4',
    hpMin: 4,
    hpMax: 32,
    thac0: 16,
    damage: '2d4',
    attacks: 1,
    move: 60,
    morale: 12,
    xp: 125,
    save: 'F2',
    alignment: 'Neutral',
    special: [
      {
        id: 'engulf',
        name: 'Engulf',
        trigger: 'on_hit',
        description: 'On a hit, save vs. Paralysis or be engulfed and paralyzed for 1d4 turns, taking 2d4 damage per round while trapped.',
        effect: {
          type: 'save_or_condition',
          save: 'paralysis',
          onFail: {
            condition: 'engulfed',
            ongoingDamage: '2d4',
            duration: '1d4',
            narration: 'You are engulfed by the cube! Paralyzed and dissolving!',
          },
        },
      },
      {
        id: 'transparent',
        name: 'Transparent',
        trigger: 'passive',
        description: 'Nearly invisible in dungeon corridors. Surprise on 1-3 on d6.',
        effect: { type: 'surprise_bonus', value: 3 },
      },
    ],
    description: 'A 10-foot cube of transparent gelatinous matter that sweeps dungeon corridors clean of everything in its path, trapping and digesting prey. Nearly invisible until it is too late.',
    combatNarration: {
      attack: ['slides forward and engulfs you', 'extends a pseudopod of acid jelly', 'rolls toward you filling the corridor'],
      hit: ['You are partially engulfed! Save vs. Paralysis!', 'The acid jelly burns through flesh.'],
      miss: ['You scramble back from the cube\'s advance.', 'You squeeze past the edge of the transparent mass.'],
      flee: [],
      death: ['The gelatinous cube collapses into a spreading puddle of goo.'],
    },
  },
};

/**
 * Get a monster type template by ID.
 * @param {string} monsterId
 * @returns {object|null}
 */
export function getMonsterType(monsterId) {
  return B1_BESTIARY[monsterId] || null;
}

/**
 * Get all monster types.
 * @returns {object[]}
 */
export function getAllMonsterTypes() {
  return Object.values(B1_BESTIARY);
}

/**
 * Create a live monster instance from a type template.
 * Rolls HP within the type's range.
 * @param {string} monsterId — key into B1_BESTIARY
 * @param {string} instanceId — unique ID for this specific monster (e.g. 'q1_7_orc_1')
 * @param {number} [fixedHp]  — if provided, skip roll (used for canonical stocking)
 * @returns {object}
 */
export function createMonsterInstance(monsterId, instanceId, fixedHp) {
  const type = getMonsterType(monsterId);
  if (!type) throw new Error(`Unknown monster type: ${monsterId}`);

  const hp = fixedHp != null
    ? fixedHp
    : type.hpMin + Math.floor(Math.random() * (type.hpMax - type.hpMin + 1));

  return {
    instanceId,
    typeId: monsterId,
    name: type.name,
    hp: { current: hp, max: hp },
    ac: type.ac,
    thac0: type.thac0,
    damage: type.damage,
    attacks: type.attacks,
    morale: type.morale,
    xp: type.xp,
    save: type.save,
    alignment: type.alignment,
    undead: type.undead || false,
    alwaysLast: type.alwaysLast || false,
    special: type.special || [],
    conditions: [],     // runtime: 'paralyzed', 'asleep', 'engulfed', etc.
    isDefeated: false,
  };
}

export default B1_BESTIARY;
