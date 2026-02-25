/**
 * Spell Data - D&D Basic Rules Level 1 Spells
 * 
 * Clerics: Divine magic from their deity
 * Magic-Users: Arcane magic from study
 * Elves: Can use Magic-User spells
 */

export const spells = {
  // ========================================
  // CLERIC SPELLS (Level 1)
  // ========================================
  
  cure_light_wounds: {
    id: 'cure_light_wounds',
    name: 'Cure Light Wounds',
    level: 1,
    classes: ['cleric'],
    school: 'divine',
    range: 'Touch',
    duration: 'Instantaneous',
    description: 'You touch a creature and channel healing energy. The target regains hit points.',
    effect: 'Heals 1d6+1 hit points',
    implementation: {
      type: 'healing',
      formula: '1d6+1',
      target: 'self_or_touch'
    },
    flavorText: 'A warm golden light flows from your hand, mending wounds and restoring vitality.'
  },
  
  protection_from_evil: {
    id: 'protection_from_evil',
    name: 'Protection from Evil',
    level: 1,
    classes: ['cleric'],
    school: 'divine',
    range: 'Touch',
    duration: '6 turns',
    description: 'You ward a creature against attacks from evil creatures. The target gains a bonus to armor class against evil opponents.',
    effect: '+1 AC vs evil creatures for 6 turns',
    implementation: {
      type: 'buff',
      stat: 'ac',
      bonus: 1,
      duration: 6,
      condition: 'vs_evil'
    },
    flavorText: 'A shimmering barrier of holy light surrounds the target, repelling evil.'
  },
  
  detect_evil: {
    id: 'detect_evil',
    name: 'Detect Evil',
    level: 1,
    classes: ['cleric'],
    school: 'divination',
    range: '120 feet',
    duration: '1 turn',
    description: 'You sense the presence of evil intentions and evil creatures within range. The spell reveals the direction of the strongest source of evil.',
    effect: 'Detect evil creatures and sense their direction',
    implementation: {
      type: 'utility',
      effect: 'detect_evil',
      range: 120
    },
    flavorText: 'Your divine senses extend outward, detecting malevolent forces.',
    note: 'Useful for locating evil enemies'
  },
  
  light: {
    id: 'light',
    name: 'Light',
    level: 1,
    classes: ['cleric', 'magic-user', 'elf'],
    school: 'divine',
    range: '120 feet',
    duration: '6 turns plus 1 turn per level',
    description: 'You create a sphere of light that illuminates the area. The light is as bright as a torch and moves with the target object.',
    effect: 'Creates light in 30-foot radius',
    implementation: {
      type: 'utility',
      effect: 'illumination',
      radius: 30
    },
    flavorText: 'A soft, steady radiance springs forth, pushing back the darkness.'
  },
  
  // ========================================
  // MAGIC-USER SPELLS (Level 1)
  // ========================================
  
  magic_missile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    level: 1,
    classes: ['magic-user', 'elf'],
    school: 'evocation',
    range: '150 feet',
    duration: 'Instantaneous',
    description: 'You create a glowing dart of magical force that unerringly strikes its target. The missile automatically hits and deals damage.',
    effect: '1d4+1 force damage (automatic hit)',
    implementation: {
      type: 'damage',
      formula: '1d4+1',
      damageType: 'force',
      autoHit: true
    },
    flavorText: 'A bolt of crackling energy streaks from your fingertip and strikes true.'
  },
  
  shield: {
    id: 'shield',
    name: 'Shield',
    level: 1,
    classes: ['magic-user', 'elf'],
    school: 'abjuration',
    range: 'Self',
    duration: '2 turns',
    description: 'An invisible barrier of magical force appears and protects you. You gain a bonus to armor class.',
    effect: '+4 AC for 2 turns',
    implementation: {
      type: 'buff',
      stat: 'ac',
      bonus: 4,
      duration: 2,
      target: 'self'
    },
    flavorText: 'An invisible wall of force shimmers into existence around you.'
  },
  
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    level: 1,
    classes: ['magic-user', 'elf'],
    school: 'enchantment',
    range: '240 feet',
    duration: '4d4 turns',
    description: 'You send creatures into a magical slumber. Affects 2d8 hit dice of creatures, starting with the weakest.',
    effect: 'Sleep 2d8 HD of creatures (weak first)',
    implementation: {
      type: 'condition',
      condition: 'sleep',
      hdAffected: '2d8',
      savingThrow: false
    },
    flavorText: 'You weave a subtle pattern of drowsiness that settles over your foes.',
    note: 'Not implemented in combat yet - will skip enemies that fall asleep'
  },
  
  charm_person: {
    id: 'charm_person',
    name: 'Charm Person',
    level: 1,
    classes: ['magic-user', 'elf'],
    school: 'enchantment',
    range: '120 feet',
    duration: 'Special',
    description: 'You make a humanoid creature regard you as a trusted friend. The target must save vs spells or be charmed.',
    effect: 'Charm one person (save vs spells)',
    implementation: {
      type: 'utility',
      effect: 'fizzle',
      message: 'The enchantment weaves through the air but finds no purchase in this violent encounter.'
    },
    flavorText: 'You reach out with your mind, planting seeds of friendship and trust.',
    note: 'Causes enemy to become friendly - may end combat peacefully'
  },
  
  detect_magic: {
    id: 'detect_magic',
    name: 'Detect Magic',
    level: 1,
    classes: ['cleric', 'magic-user', 'elf'],
    school: 'divination',
    range: '60 feet',
    duration: '2 turns',
    description: 'You sense the presence of magic within range. You can detect magical auras through barriers, but cannot identify specific spells.',
    effect: 'Detect magic within 60 feet for 2 turns',
    implementation: {
      type: 'utility',
      effect: 'detect_magic',
      range: 60
    },
    flavorText: 'Your senses attune to the ethereal, revealing the shimmer of enchantment.',
    note: 'Useful for finding magical items and hidden enchantments'
  },
  
  read_magic: {
    id: 'read_magic',
    name: 'Read Magic',
    level: 1,
    classes: ['magic-user', 'elf'],
    school: 'divination',
    range: 'Self',
    duration: '1 turn',
    description: 'You decipher magical inscriptions that would otherwise be unintelligible. This allows you to read scrolls and spellbooks.',
    effect: 'Read magical writing for 1 turn',
    implementation: {
      type: 'utility',
      effect: 'fizzle',
      message: 'The arcane runes shimmer briefly but reveal nothing useful in this moment of danger.'
    },
    flavorText: 'Ancient symbols rearrange themselves into comprehensible patterns.',
    note: 'Required to use scrolls - essential for Magic-Users'
  }
};

/**
 * Get all spells available to a specific class
 * @param {string} className - Class name (cleric, magic-user, elf, etc.)
 * @param {number} level - Spell level (default 1)
 * @returns {array} Array of spell objects
 */
export function getSpellsForClass(className, level = 1) {
  return Object.values(spells).filter(spell => 
    spell.level === level && spell.classes.includes(className)
  );
}

/**
 * Get a specific spell by ID
 * @param {string} spellId - Spell ID
 * @returns {object|null} Spell object or null
 */
export function getSpell(spellId) {
  return spells[spellId] || null;
}

/**
 * Get spell slots for a class at a given level
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @returns {object} Spell slots by spell level
 */
export function getSpellSlotsForClass(className, level) {
  // Basic D&D spell progression
  const spellSlots = {
    cleric: {
      1: { 1: 1 },  // Level 1: one 1st-level spell
      2: { 1: 2 },  // Level 2: two 1st-level spells
      3: { 1: 2, 2: 1 },
      // ... etc
    },
    'magic-user': {
      1: { 1: 1 },
      2: { 1: 2 },
      3: { 1: 2, 2: 1 },
      // ... etc
    },
    elf: {
      1: { 1: 1 },
      2: { 1: 2 },
      3: { 1: 2, 2: 1 },
      // ... etc (same as magic-user)
    }
  };
  
  return spellSlots[className]?.[level] || {};
}

/**
 * Check if a class can cast spells
 * @param {string} className - Class name
 * @returns {boolean}
 */
export function canCastSpells(className) {
  return ['cleric', 'magic-user', 'elf'].includes(className);
}

/**
 * Get spell description for display
 * @param {object} spell - Spell object
 * @returns {string} Formatted description
 */
export function formatSpellDescription(spell) {
  return `${spell.description}\n\nRange: ${spell.range}\nDuration: ${spell.duration}\nEffect: ${spell.effect}`;
}

export default spells;
