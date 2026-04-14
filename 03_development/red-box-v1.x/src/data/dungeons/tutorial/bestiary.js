/**
 * dungeons/tutorial/bestiary.js
 * Monster type definitions for the Tutorial adventure
 *
 * Shape matches quasqueton/bestiary.js type entries:
 *   id, name, plural, ac, thac0, damage, attacks, hpMin, hpMax,
 *   morale, xp, save, alignment, undead, special[]
 */

export const types = {

  goblin: {
    id:        'goblin',
    name:      'Goblin',
    plural:    'Goblins',
    ac:        6,
    thac0:     19,
    damage:    '1d6',
    attacks:   1,
    hpMin:     4,
    hpMax:     4,     // fixed for tutorial
    morale:    7,
    xp:        5,
    save:      { death: 12, wands: 13, paralysis: 14, breath: 15, spells: 16 },
    alignment: 'Chaotic',
    undead:    false,
    special:   [],
    description: 'A small, wicked humanoid with yellowed skin and sharp teeth.',
    tactics:     'Attacks with its short sword, fighting to protect its lair.',
    defeatedText: 'The goblin falls with a final shriek. Its treasure is now yours!',
  },

  giant_snake: {
    id:        'giant_snake',
    name:      'Giant Snake',
    plural:    'Giant Snakes',
    ac:        7,
    thac0:     19,
    damage:    '1d4',
    attacks:   1,
    hpMin:     6,
    hpMax:     6,
    morale:    8,
    xp:        10,
    save:      { death: 12, wands: 13, paralysis: 14, breath: 15, spells: 16 },
    alignment: 'Neutral',
    undead:    false,
    special:   [
      { id: 'poison', name: 'Poison Bite', effect: { type: 'save_or_damage', saveType: 'poison', damage: '1d4' } },
    ],
    description: 'A large constrictor snake, over 8 feet long.',
    tactics:     'Strikes with a venomous bite, then tries to coil around prey.',
    defeatedText: 'The snake goes limp. The path east is now clear.',
  },

  rust_monster: {
    id:        'rust_monster',
    name:      'Rust Monster',
    plural:    'Rust Monsters',
    ac:        2,
    thac0:     15,
    damage:    '0',    // does not deal HP damage
    attacks:   1,
    hpMin:     10,
    hpMax:     10,
    morale:    12,
    xp:        50,
    save:      { death: 10, wands: 11, paralysis: 12, breath: 13, spells: 14 },
    alignment: 'Neutral',
    undead:    false,
    special:   [
      { id: 'rust', name: 'Rust Metal', description: 'Any metal that touches its antennae turns to rust instantly.', effect: { type: 'rust_metal' } },
    ],
    description: 'A bizarre creature with armadillo-like plating and feathery antennae.',
    tactics:     'Seeks metal to corrode. Ignores non-metal wielders.',
    defeatedText: 'The rust monster collapses! The treasure chest is safe!',
  },

};

/**
 * Create a stamped monster instance from a type definition.
 * Called by level1.js to build monsterInstances.
 */
export function createInstance(instanceId, typeId, hpOverride) {
  const type = types[typeId];
  if (!type) throw new Error(`[Tutorial Bestiary] Unknown type: ${typeId}`);
  const hp = hpOverride ?? type.hpMax;
  return {
    instanceId,
    typeId,
    name:       type.name,
    hp:         { current: hp, max: hp },
    ac:         type.ac,
    thac0:      type.thac0,
    damage:     type.damage,
    attacks:    type.attacks,
    morale:     type.morale,
    xp:         type.xp,
    save:       type.save,
    alignment:  type.alignment,
    undead:     type.undead,
    special:    type.special,
    conditions: [],
    isDefeated: false,
    isWandering: false,
  };
}

export default { types, createInstance };
