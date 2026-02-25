/**
 * Bestiary - Monster reference database
 * Contains detailed stats for all monsters in the tutorial adventure
 */

export const bestiary = {
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    type: 'humanoid',
    alignment: 'Chaotic',
    hp: { current: 4, max: 4 },
    hitDice: '1-1',
    ac: 6,
    thac0: 19,
    attacks: [
      { name: 'Short Sword', damage: '1d6' }
    ],
    xp: 5,
    movement: 60,
    morale: 7,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: ['Infravision 60 feet', 'Prefer ambushes'],
    description: 'Small, wicked humanoids that dwell in dark places. Goblins are cowardly creatures with yellowish-green skin and sharp teeth. They stand about 3-4 feet tall and prefer to attack from the shadows.',
    tactics: 'Goblins prefer ambushes and overwhelming numbers. They flee if reduced to half strength or if their leader is killed. They fight best in darkness.',
    habitat: 'Caves, ruins, and underground lairs',
    treasure: 'Individual: 1d6 GP, 10% chance of rusty dagger',
    alignment: 'Chaotic',
    encounterSize: '2d4 individuals'
  },
  
  snake: {
    id: 'snake',
    name: 'Snake, Giant',
    type: 'beast',
    hp: { current: 6, max: 6 },
    hitDice: '2',
    ac: 6,
    thac0: 18,
    attacks: [
      { name: 'Bite', damage: '1d6', special: 'poison' }
    ],
    xp: 10,
    movement: 90,
    morale: 8,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: [
      'Poison (save vs. Poison or die)',
      'Keen senses',
      'Can detect vibrations'
    ],
    description: 'A massive serpent measuring 10-15 feet in length with gleaming scales. Its fangs drip with deadly venom. These creatures are found in warm underground chambers and attack anything that enters their territory.',
    tactics: 'The giant snake strikes quickly, attempting to bite and inject venom. It then retreats and waits for the poison to take effect. If the prey survives, it strikes again.',
    habitat: 'Warm caves, underground chambers, tropical ruins',
    treasure: '2d6 GP, 5% chance of healing potion (often guarding treasure)',
    alignment: 'Neutral',
    encounterSize: '1d3 snakes'
  },
  
  rust_monster: {
    id: 'rust_monster',
    name: 'Rust Monster',
    type: 'aberration',
    hp: { current: 18, max: 18 },
    hitDice: '5',
    ac: 2,
    thac0: 15,
    attacks: [
      { name: 'Antenna Touch', damage: 'Special', special: 'rusts metal instantly' }
    ],
    xp: 50,
    movement: 120,
    morale: 12,
    saves: {
      death: 10,
      wands: 11,
      paralysis: 12,
      breath: 13,
      spells: 14
    },
    special: [
      'Rust Metal (any metal touching antennae rusts instantly)',
      'Immune to most weapons (metal weapons useless)',
      'Feeds on metal (attracted to armor and weapons)',
      'Fast movement (120 feet per round)'
    ],
    description: 'A bizarre creature resembling a lobster with a propeller-like tail. Its body is covered in yellow-brown plating, and two long antennae extend from its head. These antennae instantly rust any metal they touch. The rust monster feeds exclusively on metal and is drawn to heavily armored parties.',
    tactics: 'The rust monster actively seeks out metal to consume. It rushes toward the most heavily armored target, attempting to touch armor or weapons with its antennae. It is not aggressive toward creatures without metal, but will defend itself if attacked. Difficult to defeat without wooden or stone weapons.',
    habitat: 'Underground ruins, old fortifications, anywhere with abundant metal',
    treasure: '3d10 GP, 20% chance of wooden shield, 15% chance of healing potion (piles of rusted metal may contain intact items)',
    alignment: 'Neutral',
    encounterSize: '1d2 rust monsters',
    weakness: 'Vulnerable to wooden, stone, and magical weapons'
  },
  
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    type: 'undead',
    alignment: 'Chaotic',
    hp: { current: 4, max: 4 },
    hitDice: '1',
    ac: 7,
    thac0: 19,
    attacks: [
      { name: 'Rusty Sword', damage: '1d6' }
    ],
    xp: 10,
    movement: 60,
    morale: 12,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: [
      'Undead (immune to charm, sleep, and mind-affecting spells)',
      'Never checks morale',
      'Takes half damage from edged weapons',
      'Holy water deals 1d8 damage'
    ],
    description: 'An animated skeleton, its bones held together by dark magic. Empty eye sockets glow with unholy light. These undead warriors serve necromancers and haunt ancient tombs, fighting with the weapons they wielded in life.',
    tactics: 'Skeletons fight mindlessly and never flee. They advance relentlessly, attacking the nearest target. Groups of skeleons coordinate basic tactics but show no self-preservation instinct.',
    habitat: 'Crypts, tombs, dungeons, ancient battlefields',
    treasure: '1d6 GP, 10% chance of rusty weapon',
    encounterSize: '2d4 skeletons',
    weakness: 'Clerics can Turn Undead, blunt weapons deal full damage'
  },
  
  orc: {
    id: 'orc',
    name: 'Orc',
    type: 'humanoid',
    alignment: 'Chaotic',
    hp: { current: 5, max: 5 },
    hitDice: '1',
    ac: 6,
    thac0: 19,
    attacks: [
      { name: 'Scimitar', damage: '1d8' }
    ],
    xp: 10,
    movement: 120,
    morale: 8,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: [
      'Infravision 60 feet',
      '-1 to hit in bright sunlight',
      'Often organized in war bands'
    ],
    description: 'Brutish humanoids with pig-like features and greenish-gray skin. Orcs stand about 6 feet tall with muscular builds. They live by raiding and conquest, despising civilization and beauty. They wear crude armor and fight with scimitars and battle axes.',
    tactics: 'Orcs prefer overwhelming numbers and brutal charges. They fight aggressively but flee if their leader falls or they lose more than half their number. They avoid fighting in daylight when possible.',
    habitat: 'Underground lairs, wilderness camps, raided settlements',
    treasure: '2d6 GP, 20% chance of crude weapon or armor',
    encounterSize: '2d4 orcs',
    weakness: 'Penalty to hit in sunlight, poor morale without leader'
  },
  
  giant_rat: {
    id: 'giant_rat',
    name: 'Giant Rat',
    type: 'beast',
    alignment: 'Neutral',
    hp: { current: 2, max: 2 },
    hitDice: '1/2',
    ac: 7,
    thac0: 20,
    attacks: [
      { name: 'Bite', damage: '1d3', special: 'disease' }
    ],
    xp: 5,
    movement: 120,
    morale: 8,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: [
      'Disease (save vs. Poison or contract filth fever)',
      'Pack tactics (+1 to hit when 3+ rats attack same target)',
      'Keen smell'
    ],
    description: 'Rats the size of small dogs, with matted fur and yellow teeth dripping with disease. They infest dungeons, sewers, and ruins, traveling in packs. Their bites carry dangerous diseases that can weaken even strong adventurers.',
    tactics: 'Giant rats swarm targets in packs, with multiple rats attacking the same victim. They fight viciously when cornered but flee if more than half their pack is killed.',
    habitat: 'Dungeons, sewers, ruins, city cellars',
    treasure: 'None (occasionally guard larger treasure)',
    encounterSize: '3d6 giant rats',
    weakness: 'Low HP, weak individually'
  },
  
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    type: 'undead',
    alignment: 'Chaotic',
    hp: { current: 8, max: 8 },
    hitDice: '2',
    ac: 8,
    thac0: 18,
    attacks: [
      { name: 'Fist', damage: '1d8' }
    ],
    xp: 20,
    movement: 60,
    morale: 12,
    saves: {
      death: 11,
      wands: 12,
      paralysis: 13,
      breath: 14,
      spells: 15
    },
    special: [
      'Undead (immune to charm, sleep, and mind-affecting spells)',
      'Never checks morale',
      'Always attacks last (slow)',
      'Holy water deals 1d8 damage'
    ],
    description: 'The shambling corpse of a humanoid, animated by dark necromancy. Zombies move with jerky, awkward motions, their decaying flesh hanging in tatters. They reek of death and show no sign of intelligence, following simple commands from their creators.',
    tactics: 'Zombies advance slowly but relentlessly, attacking with their powerful undead fists. They never flee or show fear, continuing to attack until destroyed. Their slow speed means they always act last in combat rounds.',
    habitat: 'Graveyards, crypts, necromancer lairs, cursed lands',
    treasure: 'None (sometimes found guarding valuables)',
    encounterSize: '2d4 zombies',
    weakness: 'Clerics can Turn Undead, always attacks last, slow movement'
  },
  
  stirge: {
    id: 'stirge',
    name: 'Stirge',
    type: 'beast',
    alignment: 'Neutral',
    hp: { current: 5, max: 5 },
    hitDice: '1*',
    ac: 7,
    thac0: 19,
    attacks: [
      { name: 'Proboscis', damage: '1d3', special: 'blood drain' }
    ],
    xp: 13,
    movement: 180,
    morale: 9,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: [
      'Blood Drain (attaches on hit, drains 1d4 HP per round)',
      'Flying (can attack from above)',
      'Detaches after draining 12 HP'
    ],
    description: 'A bird-sized creature with bat wings and a long proboscis like a mosquito. Stirges are rust-red with a furry body and leathery wings. They attack in groups, diving from above to pierce flesh with their needle-like beaks and drain blood.',
    tactics: 'Stirges dive from above, attempting to attach to victims. Once attached, they drain blood automatically each round. They detach and flee once gorged with blood (12 HP drained). Groups coordinate their attacks, with multiple stirges targeting one victim.',
    habitat: 'Caves, forests, ruins, anywhere with dark recesses',
    treasure: 'None',
    encounterSize: '1d10 stirges',
    weakness: 'Once attached, can be pulled off (STR check) or killed'
  },
  
  kobold: {
    id: 'kobold',
    name: 'Kobold',
    type: 'humanoid',
    alignment: 'Chaotic',
    hp: { current: 3, max: 3 },
    hitDice: '1/2',
    ac: 7,
    thac0: 19,
    attacks: [
      { name: 'Spear', damage: '1d6' },
      { name: 'Sling', damage: '1d4' }
    ],
    xp: 5,
    movement: 60,
    morale: 6,
    saves: {
      death: 14,
      wands: 15,
      paralysis: 16,
      breath: 17,
      spells: 18
    },
    special: [
      'Infravision 90 feet',
      'Sunlight sensitivity (-1 to attacks in daylight)',
      'Trap masters (10% chance room contains trap)',
      'Cowardly (flee at 50% casualties)'
    ],
    description: 'Small reptilian humanoids with rust-brown scales and short horns. Standing only 2-3 feet tall, kobolds are weak individually but dangerous in numbers. They speak their own yipping language and are known for their cunning trap-making abilities.',
    tactics: 'Kobolds rely on superior numbers, traps, and ambushes. They attack from range with slings when possible, using their small size to take cover. They flee quickly if reduced to half strength, regrouping to plan another ambush.',
    habitat: 'Caves, dungeons, underground warrens',
    treasure: 'Individual: 1d4 CP, 5% chance of trap components',
    encounterSize: '4d4 kobolds',
    weakness: 'Very weak (1/2 HD), cowardly, sunlight sensitivity'
  },
  
  hobgoblin: {
    id: 'hobgoblin',
    name: 'Hobgoblin',
    type: 'humanoid',
    alignment: 'Chaotic',
    hp: { current: 5, max: 5 },
    hitDice: '1+1',
    ac: 6,
    thac0: 18,
    attacks: [
      { name: 'Longsword', damage: '1d8' },
      { name: 'Spear', damage: '1d6' }
    ],
    xp: 15,
    movement: 90,
    morale: 9,
    saves: {
      death: 12,
      wands: 13,
      paralysis: 14,
      breath: 15,
      spells: 16
    },
    special: [
      'Infravision 60 feet',
      'Military discipline (never check morale if leader present)',
      'Organized fighters (use formations)',
      'Hate elves (-1 morale when fighting elves)'
    ],
    description: 'Large, muscular goblin-kin with dark red or gray skin and fierce yellow eyes. Standing 6 feet tall, hobgoblins are disciplined warriors who organize into military units with clear command structures. They wear crude armor and favor practical weapons.',
    tactics: 'Hobgoblins fight in organized formations with tactical discipline. They use shield walls, flanking maneuvers, and coordinated attacks. Leaders shout orders in their harsh language. They never retreat while their leader lives, fighting to the death if necessary.',
    habitat: 'Fortified lairs, military outposts, conquest territories',
    treasure: 'Individual: 2d6 GP, 25% chance of military equipment (shield, weapon)',
    encounterSize: '2d6 hobgoblins',
    weakness: 'Predictable tactics, hatred of elves can be exploited'
  }
};


/**
 * Get a specific monster by ID
 * @param {string} monsterId - The monster's unique identifier
 * @returns {object} Monster data
 */
export function getMonster(monsterId) {
  return bestiary[monsterId];
}

/**
 * Get all monsters as an array
 * @returns {array} Array of all monster objects
 */
export function getAllMonsters() {
  return Object.values(bestiary);
}

/**
 * Get monsters by type
 * @param {string} type - Monster type (humanoid, beast, aberration, etc.)
 * @returns {array} Array of monsters of that type
 */
export function getMonstersByType(type) {
  return Object.values(bestiary).filter(monster => monster.type === type);
}

/**
 * Get monsters by HD range
 * @param {number} minHD - Minimum hit dice
 * @param {number} maxHD - Maximum hit dice
 * @returns {array} Array of monsters in HD range
 */
export function getMonstersByHD(minHD, maxHD) {
  return Object.values(bestiary).filter(monster => {
    const hd = parseInt(monster.hitDice);
    return hd >= minHD && hd <= maxHD;
  });
}

export default bestiary;
