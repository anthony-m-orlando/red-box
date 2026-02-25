/**
 * Character Classes Data
 * Authentic 1983 D&D Basic Rules
 */

export const classes = {
  'cleric': {
    id: 'cleric',
    name: 'Cleric',
    description: 'Holy warriors who serve the gods, wielding divine magic and healing powers.',
    hitDie: 'd6',
    primeRequisite: ['wisdom'],
    requirements: { constitution: 9 },
    weapons: ['Club', 'Mace', 'Sling', 'War Hammer'],
    armor: ['Any armor', 'Any shield'],
    specialAbilities: [
      'Turn Undead: Can drive away or destroy undead creatures',
      'Divine Spells: Gains access to clerical magic at 2nd level',
      'Healing Magic: Can heal wounds and cure diseases'
    ],
    maxLevel: 14,
    flavor: 'You are a champion of faith, blessed by the divine with the power to heal allies and smite evil.',
    icon: '✝️'
  },

  'fighter': {
    id: 'fighter',
    name: 'Fighter',
    description: 'Masters of combat, skilled in all weapons and armor.',
    hitDie: 'd8',
    primeRequisite: ['strength'],
    requirements: { strength: 9 },
    weapons: ['All weapons'],
    armor: ['Any armor', 'Any shield'],
    specialAbilities: [
      'Combat Mastery: Best THAC0 progression in the game',
      'Weapon Expertise: Can use any weapon',
      'Stronghold: Can build a castle at 9th level'
    ],
    maxLevel: 14,
    flavor: 'You are a warrior born for battle, unmatched in martial prowess and physical strength.',
    icon: '⚔️'
  },

  'magic-user': {
    id: 'magic-user',
    name: 'Magic-User',
    description: 'Scholars of arcane magic who command reality-bending spells.',
    hitDie: 'd4',
    primeRequisite: ['intelligence'],
    requirements: { intelligence: 9 },
    weapons: ['Dagger', 'Staff'],
    armor: ['No armor', 'No shields'],
    specialAbilities: [
      'Arcane Spells: Can cast powerful magic-user spells',
      'Spell Research: Can create new spells and magic items',
      'Read Magic: Can decipher magical writings'
    ],
    maxLevel: 14,
    flavor: 'You are a master of the arcane arts, fragile in body but wielding devastating magical power.',
    icon: '🔮'
  },

  'thief': {
    id: 'thief',
    name: 'Thief',
    description: 'Cunning rogues skilled in stealth, traps, and surprise attacks.',
    hitDie: 'd4',
    primeRequisite: ['dexterity'],
    requirements: { dexterity: 9 },
    weapons: ['Any weapon'],
    armor: ['Leather armor only', 'No shields'],
    specialAbilities: [
      'Open Locks: Can pick locks and disable mechanisms',
      'Find/Remove Traps: Detect and disarm traps',
      'Move Silently & Hide: Exceptional stealth abilities',
      'Backstab: Deal extra damage when attacking from behind',
      'Climb Walls: Scale sheer surfaces'
    ],
    maxLevel: 14,
    flavor: 'You are a shadow in the night, relying on cunning, agility, and surprise to overcome challenges.',
    icon: '🗡️'
  },

  'dwarf': {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Stout warriors of the mountain halls, combining combat skill with limited magical abilities.',
    hitDie: 'd8',
    primeRequisite: ['strength'],
    requirements: { constitution: 9, strength: 9 },
    weapons: ['All weapons except longbow or two-handed sword'],
    armor: ['Any armor', 'Any shield'],
    infravision: 60, // Feet - can see in darkness
    specialAbilities: [
      'Detect Construction: Notice unusual stonework (1-2 on d6)',
      'Detect Traps: Find traps in stonework (1-2 on d6)',
      'Infravision: See in darkness up to 60 feet',
      'Hardy: +4 bonus to saving throws vs magic'
    ],
    maxLevel: 12,
    flavor: 'You are a dwarf, inheritor of ancient stone halls, tough as the mountains and resistant to magic.',
    icon: '⛏️'
  },

  'elf': {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful warriors who blend swordplay with arcane magic.',
    hitDie: 'd6',
    primeRequisite: ['strength', 'intelligence'],
    requirements: { intelligence: 9, strength: 9 },
    weapons: ['All weapons'],
    armor: ['Any armor', 'Any shield'],
    infravision: 60, // Feet - can see in darkness
    specialAbilities: [
      'Arcane Spells: Can cast magic-user spells',
      'Secret Doors: Find secret doors (1-2 on d6)',
      'Infravision: See in darkness up to 60 feet',
      'Immunity to Ghoul Paralysis: Cannot be paralyzed by ghouls'
    ],
    maxLevel: 10,
    flavor: 'You are an elf, an immortal being who has mastered both blade and spell.',
    icon: '🏹'
  },

  'halfling': {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small but brave adventurers, nimble and surprisingly resilient.',
    hitDie: 'd6',
    primeRequisite: ['strength', 'dexterity'],
    requirements: { constitution: 9, dexterity: 9 },
    weapons: ['Any weapon appropriate to size'],
    armor: ['Any armor', 'Any shield'],
    specialAbilities: [
      'Missile Accuracy: +1 bonus to hit with missile weapons',
      'Defensive Bonus: -2 AC vs large opponents',
      'Hide in Woods: Nearly invisible outdoors (90%)',
      'Hardy: +4 bonus to saving throws vs magic',
      'Initiative Bonus: +1 to individual initiative'
    ],
    maxLevel: 8,
    flavor: 'You are a halfling, small in stature but big in courage, with uncanny luck on your side.',
    icon: '🌿'
  }
};

/**
 * Get array of all classes
 */
export function getAllClasses() {
  return Object.values(classes);
}

/**
 * Get class by ID
 */
export function getClassById(id) {
  return classes[id.toLowerCase()];
}

/**
 * Get starting equipment package for a class
 */
export function getStartingEquipment(classId) {
  const packages = {
    'cleric': {
      armor: 'chain mail',
      shield: true,
      weapons: ['mace', 'sling'],
      items: ['wooden holy symbol', 'backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)']
    },
    'fighter': {
      armor: 'chain mail',
      shield: true,
      weapons: ['sword', 'dagger'],
      items: ['backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)']
    },
    'magic-user': {
      armor: 'none',
      shield: false,
      weapons: ['dagger', 'staff'],
      items: ['spellbook', 'backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)']
    },
    'thief': {
      armor: 'leather',
      shield: false,
      weapons: ['sword', 'dagger'],
      items: ['thieves tools', 'backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)']
    },
    'dwarf': {
      armor: 'chain mail',
      shield: true,
      weapons: ['war hammer', 'hand axe'],
      items: ['backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)', 'iron spikes (12)']
    },
    'elf': {
      armor: 'chain mail',
      shield: false,
      weapons: ['sword', 'longbow', 'arrows (20)'],
      items: ['spellbook', 'backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)']
    },
    'halfling': {
      armor: 'leather',
      shield: true,
      weapons: ['sword', 'sling'],
      items: ['backpack', 'waterskin', 'rations (7 days)', 'rope (50 ft)']
    }
  };

  return packages[classId.toLowerCase()];
}

export default classes;
