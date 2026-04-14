/**
 * shopInventory.js
 * Canonical Basic D&D (1983 Red Box) equipment prices and stats.
 *
 * Prices sourced from the Basic Set equipment tables.
 * Weight in "coins" (the Basic Set's encumbrance unit — 10 coins = 1 lb).
 * All items carry an `itemId` that matches the existing items.js item IDs
 * where applicable, so CharacterContext.addItem() can accept them directly.
 *
 * Shop keys: 'general_store' | 'blacksmith' | 'mages_tower' | 'temple'
 */

// ---------------------------------------------------------------------------
// SHARED ITEM SHAPE
// ---------------------------------------------------------------------------
// {
//   itemId:      string   — matches items.js id, used by CharacterContext
//   name:        string
//   description: string
//   cost:        number   — GP cost to purchase
//   weight:      number   — encumbrance in coins
//   type:        string   — 'consumable' | 'tool' | 'weapon' | 'armor' | 'service'
//   quantity:    number   — default stack size when added to inventory
//   shopStock:   number   — units available per visit (Infinity = always stocked)
//   requires:    object   — optional class/level gate { class: [...], minLevel: n }
//   effect:      object   — mirrors items.js effect shape for CharacterContext
// }

// ---------------------------------------------------------------------------
// GENERAL STORE
// Everyday adventuring supplies. Always open. No class restrictions.
// ---------------------------------------------------------------------------
export const generalStoreInventory = [
  {
    itemId: 'torch',
    name: 'Torch (×6)',
    description: 'Provides light in a 30\' radius for 1 hour each. ' +
                 'Wind and water can extinguish it.',
    cost: 1,
    weight: 6,       // 6 torches × 1 coin each
    type: 'consumable',
    quantity: 6,
    shopStock: Infinity,
    effect: {
      type: 'light',
      duration: '1 hour',
      radius: 30,
      narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'oil_flask',
    name: 'Flask of Oil',
    description: 'Fuel for a lantern (4 hours per flask). Can also be used ' +
                 'as a fire weapon — throw and ignite for 1d8 damage.',
    cost: 2,
    weight: 10,
    type: 'consumable',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You hold the flask of oil. It can fuel a lantern or serve as a weapon.'
    },
    usableIn: ['exploration', 'combat']
  },
  {
    itemId: 'lantern',
    name: 'Lantern',
    description: 'Burns oil flasks for steady light in a 30\' radius. ' +
                 'Lasts 4 hours per flask; harder to extinguish than a torch.',
    cost: 10,
    weight: 20,
    type: 'tool',
    quantity: 1,
    shopStock: 3,
    effect: {
      type: 'light',
      duration: '4 hours per flask',
      radius: 30,
      narrative: 'You light the lantern. Steady light illuminates the area, ' +
                 'casting fewer shadows than a torch.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'rope_50ft',
    name: 'Rope (50 ft.)',
    description: 'Hempen rope, 50 feet. Useful for climbing, binding, ' +
                 'or securing a trapdoor. Holds up to 600 lbs.',
    cost: 1,
    weight: 50,
    type: 'tool',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You coil the rope. Useful for climbing, but not much use right here.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'iron_spikes',
    name: 'Iron Spikes (×12)',
    description: 'Used to wedge doors open or shut, or as pitons for climbing. ' +
                 'An adventurer\'s best friend.',
    cost: 1,
    weight: 60,
    type: 'tool',
    quantity: 12,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You examine the iron spikes. Useful for wedging doors and climbing.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'pole_10ft',
    name: '10-Foot Pole',
    description: 'Wooden pole, 10 feet long. Used to probe floors, ' +
                 'ceilings, and suspicious-looking tiles from a safe distance.',
    cost: 1,
    weight: 100,
    type: 'tool',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You extend the pole ahead of you, probing for hidden dangers.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'iron_rations',
    name: 'Iron Rations (1 week)',
    description: 'Dried meat, hardtack, and salted provisions. ' +
                 'Unpleasant but nourishing. Required for wilderness travel.',
    cost: 15,
    weight: 70,
    type: 'consumable',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You eat some dried meat and hardtack. Not delicious, but filling.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'waterskin',
    name: 'Waterskin',
    description: 'Holds enough water for one day of travel. ' +
                 'Should be refilled at every available water source.',
    cost: 1,
    weight: 5,
    type: 'tool',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You drink from your waterskin. Cool water refreshes you.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'backpack',
    name: 'Backpack',
    description: 'A sturdy leather pack. Allows you to carry more gear ' +
                 'without penalty. Every serious adventurer owns one.',
    cost: 5,
    weight: 20,
    type: 'tool',
    quantity: 1,
    shopStock: 5,
    effect: {
      type: 'utility',
      narrative: 'You adjust the straps on your backpack. Everything is securely stowed.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'healing_potion',
    name: 'Healing Potion',
    description: 'A ruby-red vial that restores 1d8 hit points when drunk. ' +
                 'Tastes of honey and herbs. Single use.',
    cost: 100,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 3,   // limited supply — restocks each town visit
    effect: {
      type: 'healing',
      formula: '1d8',
      narrative: 'You drink the potion and feel your wounds close. ' +
                 'The liquid tastes of honey and herbs.'
    },
    usableIn: ['exploration', 'combat']
  },
  {
    itemId: 'antitoxin',
    name: 'Antitoxin',
    description: 'A bitter draught that grants +4 to saving throws vs. Poison ' +
                 'for 1 hour. Best taken before entering serpent-infested areas.',
    cost: 10,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 2,
    effect: {
      type: 'buff',
      buff: { id: 'antitoxin', name: 'Antitoxin', bonus: 4, saves: ['death_poison'], duration: 6 },
      narrative: 'You drink the antitoxin. A bitter taste fills your mouth, ' +
                 'but you feel fortified against poison.'
    },
    usableIn: ['exploration', 'combat']
  },
  {
    itemId: 'tinderbox',
    name: 'Tinderbox',
    description: 'Flint, steel, and tinder. Required to light torches and lanterns. ' +
                 'Takes 1 round to produce a flame.',
    cost: 3,
    weight: 5,
    type: 'tool',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'You strike the flint and steel together, producing a small spark.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'mirror_small',
    name: 'Small Mirror (silver)',
    description: 'A hand-sized polished silver mirror. Useful for looking around ' +
                 'corners, signaling, or confirming you haven\'t been turned to stone.',
    cost: 5,
    weight: 5,
    type: 'tool',
    quantity: 1,
    shopStock: 3,
    effect: {
      type: 'utility',
      narrative: 'You hold the mirror up. Your reflection stares back, reassuringly alive.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'garlic',
    name: 'Garlic (bunch)',
    description: 'A bunch of fresh garlic. Repels vampires and other ' +
                 'undead that depend on proximity. Also makes a decent stew.',
    cost: 5,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'utility',
      narrative: 'The pungent smell of garlic fills the air. Undead recoil slightly.'
    },
    usableIn: ['exploration', 'combat']
  },
  {
    itemId: 'wolfsbane',
    name: 'Wolfsbane (sprig)',
    description: 'A sprig of wolfsbane. Repels lycanthropes when presented. ' +
                 'Handle with care — mildly toxic if ingested.',
    cost: 10,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 2,
    effect: {
      type: 'utility',
      narrative: 'You hold out the wolfsbane. The bitter herb scent hangs in the air.'
    },
    usableIn: ['exploration', 'combat']
  }
];

// ---------------------------------------------------------------------------
// BLACKSMITH
// Weapons and armor. No class restrictions on purchase — the game handles
// what each class can actually equip during CharacterContext validation.
// ---------------------------------------------------------------------------
export const blacksmithInventory = [
  // --- ARMOR ---
  {
    itemId: 'leather_armor',
    name: 'Leather Armor',
    description: 'Hardened leather plates stitched over a padded backing. ' +
                 'Armor Class 7. Light enough for thieves and elves.',
    cost: 20,
    weight: 150,
    type: 'armor',
    quantity: 1,
    shopStock: 5,
    armorClass: 7,
    effect: {
      type: 'equip_armor',
      acValue: 7,
      narrative: 'You don the leather armor. It fits snugly and allows free movement.'
    },
    usableIn: []
  },
  {
    itemId: 'chain_mail',
    name: 'Chain Mail',
    description: 'Interlocking iron rings over a padded gambeson. ' +
                 'Armor Class 5. Standard armor for fighters and clerics.',
    cost: 40,
    weight: 400,
    type: 'armor',
    quantity: 1,
    shopStock: 3,
    armorClass: 5,
    effect: {
      type: 'equip_armor',
      acValue: 5,
      narrative: 'You pull on the chain mail. The rings shift and settle around you.'
    },
    usableIn: []
  },
  {
    itemId: 'plate_mail',
    name: 'Plate Mail',
    description: 'Fitted steel plates covering the entire body. ' +
                 'Armor Class 3. The finest protection money can buy.',
    cost: 60,
    weight: 500,
    type: 'armor',
    quantity: 1,
    shopStock: 1,
    armorClass: 3,
    effect: {
      type: 'equip_armor',
      acValue: 3,
      narrative: 'You buckle on the plate mail. You feel nearly invulnerable.'
    },
    usableIn: []
  },
  {
    itemId: 'shield',
    name: 'Shield',
    description: 'A sturdy wooden shield banded with iron. ' +
                 'Improves Armor Class by 1 when carried.',
    cost: 10,
    weight: 100,
    type: 'armor',
    quantity: 1,
    shopStock: 5,
    armorClass: -1, // modifier, not absolute
    effect: {
      type: 'equip_shield',
      acBonus: 1,
      narrative: 'You strap the shield to your arm. It feels solid and reassuring.'
    },
    usableIn: []
  },

  // --- WEAPONS ---
  {
    itemId: 'sword',
    name: 'Sword',
    description: 'A standard single-handed sword, well-balanced and reliable. ' +
                 'Deals 1d8 damage.',
    cost: 10,
    weight: 60,
    type: 'weapon',
    quantity: 1,
    shopStock: 10,
    damage: '1d8',
    effect: {
      type: 'equip_weapon',
      damage: '1d8',
      narrative: 'You draw the sword. Its blade gleams in the torchlight.'
    },
    usableIn: []
  },
  {
    itemId: 'two_handed_sword',
    name: 'Two-Handed Sword',
    description: 'A great sword requiring both hands. Deals 1d10 damage ' +
                 'but cannot be used with a shield.',
    cost: 15,
    weight: 150,
    type: 'weapon',
    quantity: 1,
    shopStock: 3,
    damage: '1d10',
    requires: { classes: ['fighter', 'dwarf', 'elf'] },
    effect: {
      type: 'equip_weapon',
      damage: '1d10',
      twoHanded: true,
      narrative: 'You heft the two-handed sword. It is heavy but brutally effective.'
    },
    usableIn: []
  },
  {
    itemId: 'battle_axe',
    name: 'Battle Axe',
    description: 'A single-bladed war axe, well-suited to chopping through armor. ' +
                 'Deals 1d8 damage.',
    cost: 7,
    weight: 70,
    type: 'weapon',
    quantity: 1,
    shopStock: 5,
    damage: '1d8',
    effect: {
      type: 'equip_weapon',
      damage: '1d8',
      narrative: 'You test the weight of the battle axe. It is heavy and well-balanced.'
    },
    usableIn: []
  },
  {
    itemId: 'hand_axe',
    name: 'Hand Axe',
    description: 'A light axe suitable for melee or throwing. ' +
                 'Deals 1d6 damage. Range 10/20/30 ft. when thrown.',
    cost: 4,
    weight: 30,
    type: 'weapon',
    quantity: 1,
    shopStock: 10,
    damage: '1d6',
    effect: {
      type: 'equip_weapon',
      damage: '1d6',
      canThrow: true,
      narrative: 'You balance the hand axe in your grip. Light and versatile.'
    },
    usableIn: []
  },
  {
    itemId: 'spear',
    name: 'Spear',
    description: 'A 6-foot wooden shaft tipped with iron. Deals 1d6 damage. ' +
                 'Can be set against a charge for double damage.',
    cost: 3,
    weight: 30,
    type: 'weapon',
    quantity: 1,
    shopStock: 8,
    damage: '1d6',
    effect: {
      type: 'equip_weapon',
      damage: '1d6',
      canSet: true,
      narrative: 'You level the spear. Against a charging foe, it will be deadly.'
    },
    usableIn: []
  },
  {
    itemId: 'dagger',
    name: 'Dagger',
    description: 'A short iron blade, easily concealed. Deals 1d4 damage. ' +
                 'Can be thrown at range 10/20/30 ft.',
    cost: 3,
    weight: 10,
    type: 'weapon',
    quantity: 1,
    shopStock: 10,
    damage: '1d4',
    effect: {
      type: 'equip_weapon',
      damage: '1d4',
      canThrow: true,
      narrative: 'You slip the dagger into your belt. Never go anywhere without one.'
    },
    usableIn: []
  },
  {
    itemId: 'short_sword',
    name: 'Short Sword',
    description: 'A slightly shorter single-handed blade. Deals 1d6 damage. ' +
                 'Favored by halflings and thieves.',
    cost: 7,
    weight: 30,
    type: 'weapon',
    quantity: 1,
    shopStock: 8,
    damage: '1d6',
    effect: {
      type: 'equip_weapon',
      damage: '1d6',
      narrative: 'You draw the short sword. Quick and easy to maneuver in tight corridors.'
    },
    usableIn: []
  },
  {
    itemId: 'mace',
    name: 'Mace',
    description: 'A flanged iron mace. Deals 1d6 damage. ' +
                 'One of the few weapons usable by clerics.',
    cost: 5,
    weight: 50,
    type: 'weapon',
    quantity: 1,
    shopStock: 5,
    damage: '1d6',
    effect: {
      type: 'equip_weapon',
      damage: '1d6',
      narrative: 'You feel the satisfying weight of the mace. Blunt and righteous.'
    },
    usableIn: []
  },
  {
    itemId: 'warhammer',
    name: 'Warhammer',
    description: 'A heavy-headed iron hammer on a short haft. Deals 1d6 damage. ' +
                 'Usable by clerics and dwarves.',
    cost: 5,
    weight: 50,
    type: 'weapon',
    quantity: 1,
    shopStock: 5,
    damage: '1d6',
    effect: {
      type: 'equip_weapon',
      damage: '1d6',
      narrative: 'You swing the warhammer. It has a satisfying heft to it.'
    },
    usableIn: []
  },
  {
    itemId: 'pole_arm',
    name: 'Pole Arm',
    description: 'A long-hafted weapon with an axe or blade head. ' +
                 'Deals 1d10 damage. Requires space to swing effectively.',
    cost: 7,
    weight: 150,
    type: 'weapon',
    quantity: 1,
    shopStock: 3,
    damage: '1d10',
    requires: { classes: ['fighter', 'dwarf', 'elf'] },
    effect: {
      type: 'equip_weapon',
      damage: '1d10',
      twoHanded: true,
      narrative: 'You sweep the pole arm in a wide arc. It demands room — and respect.'
    },
    usableIn: []
  },
  {
    itemId: 'silver_dagger',
    name: 'Silver Dagger',
    description: 'A dagger with a silver blade. Deals 1d4 damage. ' +
                 'Required to hit lycanthropes and certain undead.',
    cost: 30,
    weight: 10,
    type: 'weapon',
    quantity: 1,
    shopStock: 2,
    damage: '1d4',
    effect: {
      type: 'equip_weapon',
      damage: '1d4',
      silver: true,
      narrative: 'The silver blade catches the light. Against creatures of the night, ' +
                 'this will be invaluable.'
    },
    usableIn: []
  },
  {
    itemId: 'quiver_arrows',
    name: 'Quiver of Arrows (20)',
    description: '20 iron-tipped arrows. Required ammunition for a shortbow or longbow.',
    cost: 5,
    weight: 20,
    type: 'consumable',
    quantity: 20,
    shopStock: Infinity,
    effect: {
      type: 'ammunition',
      narrative: 'You count the arrows. Twenty — enough for a good fight.'
    },
    usableIn: []
  },
  {
    itemId: 'shortbow',
    name: 'Shortbow',
    description: 'A compact recurve bow. Deals 1d6 damage. ' +
                 'Range 50/100/150 ft. Requires arrows.',
    cost: 25,
    weight: 30,
    type: 'weapon',
    quantity: 1,
    shopStock: 3,
    damage: '1d6',
    effect: {
      type: 'equip_weapon',
      damage: '1d6',
      ranged: true,
      ammo: 'quiver_arrows',
      narrative: 'You string the shortbow. It responds smoothly to the draw.'
    },
    usableIn: []
  },
  {
    itemId: 'armor_repair',
    name: 'Armor Repair (service)',
    description: 'The blacksmith will repair damaged armor to full effectiveness. ' +
                 'Price depends on armor type.',
    cost: 10,      // base price; scales with armor type in ShopInterface
    weight: 0,
    type: 'service',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'repair_armor',
      narrative: 'The blacksmith hammers and reshapes your battered armor. ' +
                 'Good as new.'
    },
    usableIn: []
  }
];

// ---------------------------------------------------------------------------
// MAGE'S TOWER
// Spells, scrolls, identify service. Restricted by class where noted.
// ---------------------------------------------------------------------------
export const magesTowerInventory = [
  {
    itemId: 'scroll_magic_missile',
    name: 'Scroll: Magic Missile',
    description: 'A parchment inscribed with the Magic Missile spell. ' +
                 'Deals 1d6+1 damage automatically, no to-hit roll needed. Single use.',
    cost: 200,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 2,
    requires: { classes: ['magic-user', 'elf'] },
    effect: {
      type: 'scroll',
      spellId: 'magic_missile',
      narrative: 'You read the scroll aloud. A bolt of force leaps from your fingertips.'
    },
    usableIn: ['combat']
  },
  {
    itemId: 'scroll_sleep',
    name: 'Scroll: Sleep',
    description: 'Puts 2d8 HD of creatures into a magical slumber. ' +
                 'No saving throw allowed. Single use.',
    cost: 200,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 2,
    requires: { classes: ['magic-user', 'elf'] },
    effect: {
      type: 'scroll',
      spellId: 'sleep',
      narrative: 'You read the scroll. A wave of drowsiness washes over your enemies.'
    },
    usableIn: ['combat']
  },
  {
    itemId: 'scroll_light',
    name: 'Scroll: Light',
    description: 'Creates magical light in a 30\' radius for 6 turns. ' +
                 'Does not require a torch. Single use.',
    cost: 100,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 3,
    requires: { classes: ['magic-user', 'elf', 'cleric'] },
    effect: {
      type: 'scroll',
      spellId: 'light',
      narrative: 'You read the scroll. Warm magical light fills the area.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'scroll_protection_evil',
    name: 'Scroll: Protection from Evil',
    description: 'Creates a magical barrier against evil creatures. ' +
                 '+1 to AC and saves vs. evil beings for 6 turns. Single use.',
    cost: 200,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 1,
    requires: { classes: ['magic-user', 'elf', 'cleric'] },
    effect: {
      type: 'scroll',
      spellId: 'protection_from_evil',
      narrative: 'You read the scroll. A faint shimmer surrounds you.'
    },
    usableIn: ['exploration', 'combat']
  },
  {
    itemId: 'scroll_hold_portal',
    name: 'Scroll: Hold Portal',
    description: 'Magically holds a door, gate, or window shut for 2d6 turns. ' +
                 'Very useful when retreating from superior numbers. Single use.',
    cost: 200,
    weight: 1,
    type: 'consumable',
    quantity: 1,
    shopStock: 1,
    requires: { classes: ['magic-user', 'elf'] },
    effect: {
      type: 'scroll',
      spellId: 'hold_portal',
      narrative: 'You read the scroll. The door shudders and holds fast.'
    },
    usableIn: ['exploration']
  },
  {
    itemId: 'identify_service',
    name: 'Identify Magic Item (service)',
    description: 'Zelligar\'s apprentice will cast Identify on one magic item, ' +
                 'revealing its properties. Results delivered next morning.',
    cost: 100,    // per item
    weight: 0,
    type: 'service',
    quantity: 1,
    shopStock: Infinity,
    effect: {
      type: 'identify',
      narrative: 'The apprentice takes your item carefully. "Come back at dawn," ' +
                 'she says.'
    },
    usableIn: []
  },
  {
    itemId: 'spell_components',
    name: 'Spell Component Pouch',
    description: 'A leather pouch containing common somatic and material components ' +
                 'for Level 1 spells. Restocks daily.',
    cost: 5,
    weight: 5,
    type: 'consumable',
    quantity: 1,
    shopStock: Infinity,
    requires: { classes: ['magic-user', 'elf', 'cleric'] },
    effect: {
      type: 'utility',
      narrative: 'You check the component pouch. Bat guano, sulfur, a pinch of sand ' +
                 '— all present.'
    },
    usableIn: ['exploration']
  }
];

// ---------------------------------------------------------------------------
// TEMPLE (donation-based, not fixed-price purchases)
// Services are offered in exchange for donations — the priest will not refuse
// a donation that is "too small," but attitude degrades if you underpay.
// ---------------------------------------------------------------------------
export const templeServices = [
  {
    itemId: 'cure_light_wounds',
    name: 'Cure Light Wounds',
    description: 'Brother Ealdric lays hands and restores 1d6+1 hit points. ' +
                 'Suggested donation: 25 GP.',
    suggestedDonation: 25,
    minDonation: 1,
    weight: 0,
    type: 'service',
    shopStock: Infinity,
    effect: {
      type: 'healing',
      formula: '1d6+1',
      narrative: 'Brother Ealdric murmurs a prayer. Warmth flows through you ' +
                 'and your wounds begin to close.'
    }
  },
  {
    itemId: 'bless',
    name: 'Blessing',
    description: 'A prayer of protection before an adventure. Grants +1 to ' +
                 'attack rolls and saving throws until next rest. Suggested donation: 50 GP.',
    suggestedDonation: 50,
    minDonation: 10,
    weight: 0,
    type: 'service',
    shopStock: Infinity,
    effect: {
      type: 'buff',
      buff: {
        id: 'blessed',
        name: 'Blessed',
        attackBonus: 1,
        saveBonus: 1,
        duration: 'until_rest'
      },
      narrative: 'The priest touches your forehead. "Go with the light," he says softly.'
    }
  },
  {
    itemId: 'remove_curse',
    name: 'Remove Curse',
    description: 'Removes one curse from a character or item. ' +
                 'Suggested donation: 200 GP.',
    suggestedDonation: 200,
    minDonation: 100,
    weight: 0,
    type: 'service',
    shopStock: Infinity,
    effect: {
      type: 'remove_curse',
      narrative: 'The priest\'s voice rises in a commanding prayer. You feel something ' +
                 'dark and clinging loosen its grip and dissolve.'
    }
  },
  {
    itemId: 'holy_water',
    name: 'Holy Water (vial)',
    description: 'A small vial of water blessed by the temple. Deals 1d8 damage ' +
                 'to undead when thrown (as a ranged attack). Suggested donation: 25 GP.',
    suggestedDonation: 25,
    minDonation: 10,
    weight: 5,
    type: 'consumable',
    quantity: 1,
    shopStock: 3,
    effect: {
      type: 'holy_water',
      damage: '1d8',
      narrative: 'You hurl the holy water. It burns like acid against the undead creature.'
    },
    usableIn: ['combat']
  }
];

// ---------------------------------------------------------------------------
// HIRELING ROSTER (available at the Threshold Arms)
// Wages are per expedition (not per day — simplification for this game).
// Loyalty starts at base morale; modified by player treatment over time.
// ---------------------------------------------------------------------------
export const hirelingRoster = [
  // TORCHBEARERS — no combat ability, carry torches / gear
  {
    templateId: 'torchbearer_01',
    name: 'Aldric',
    role: 'Torchbearer',
    description: 'A nervous but willing young man, eager to earn a few coins. ' +
                 'Will not fight, but keeps your torches lit.',
    class: null,
    level: 0,
    hp: { current: 2, max: 2 },
    ac: 9,
    thac0: 19,
    morale: 6,
    loyalty: 0,
    wagePerExpedition: 2,
    mode: 'protector',
    combat: false,
    carryCapacity: 400,  // coins of extra encumbrance they absorb
    availability: 'common'
  },
  {
    templateId: 'torchbearer_02',
    name: 'Mira',
    role: 'Torchbearer',
    description: 'A quick-footed young woman who has done this before. ' +
                 'Slightly more reliable than most.',
    class: null,
    level: 0,
    hp: { current: 3, max: 3 },
    ac: 9,
    thac0: 19,
    morale: 7,
    loyalty: 0,
    wagePerExpedition: 2,
    mode: 'protector',
    combat: false,
    carryCapacity: 400,
    availability: 'common'
  },

  // PORTERS — heavier carry capacity, still no combat
  {
    templateId: 'porter_01',
    name: 'Brom',
    role: 'Porter',
    description: 'Built like an ox and about as talkative. ' +
                 'Carries gear without complaint — for the right wage.',
    class: null,
    level: 0,
    hp: { current: 4, max: 4 },
    ac: 9,
    thac0: 19,
    morale: 6,
    loyalty: 0,
    wagePerExpedition: 5,
    mode: 'protector',
    combat: false,
    carryCapacity: 800,
    availability: 'common'
  },

  // MEN-AT-ARMS — can fight, use weapons and armor
  {
    templateId: 'man_at_arms_01',
    name: 'Gareth',
    role: 'Man-at-Arms',
    description: 'A retired soldier, slightly gone to seed but still handy with a sword. ' +
                 'Fights alongside you, no questions asked.',
    class: 'fighter',
    level: 1,
    hp: { current: 6, max: 6 },
    ac: 7,          // leather armor
    thac0: 19,
    damage: '1d6',  // short sword
    weapon: 'Short Sword',
    morale: 8,
    loyalty: 0,
    wagePerExpedition: 10,
    mode: 'protector',
    combat: true,
    carryCapacity: 200,
    availability: 'uncommon'
  },
  {
    templateId: 'man_at_arms_02',
    name: 'Sera',
    role: 'Man-at-Arms',
    description: 'A sharp-eyed mercenary with quick reflexes. ' +
                 'Prefers not to discuss her past, but her sword arm is reliable.',
    class: 'fighter',
    level: 1,
    hp: { current: 5, max: 5 },
    ac: 7,
    thac0: 19,
    damage: '1d6',
    weapon: 'Short Sword',
    morale: 8,
    loyalty: 0,
    wagePerExpedition: 10,
    mode: 'protector',
    combat: true,
    carryCapacity: 200,
    availability: 'uncommon'
  },

  // CLERIC HIRELING — rare, can cast Cure Light Wounds once per expedition
  {
    templateId: 'cleric_hireling_01',
    name: 'Brother Oswin',
    role: 'Initiate Cleric',
    description: 'A young initiate of the temple, sent to gain experience. ' +
                 'Can cast Cure Light Wounds once per expedition. Pious and earnest.',
    class: 'cleric',
    level: 1,
    hp: { current: 4, max: 4 },
    ac: 9,
    thac0: 19,
    damage: '1d6',
    weapon: 'Mace',
    spells: ['cure_light_wounds'],
    spellsRemaining: { cure_light_wounds: 1 },
    morale: 9,
    loyalty: 2,     // temple affiliation gives a loyalty bonus
    wagePerExpedition: 25,
    mode: 'protector',
    combat: true,
    carryCapacity: 150,
    availability: 'rare'
  }
];

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Get all items for a given shop.
 * @param {'general_store'|'blacksmith'|'mages_tower'|'temple'} shopId
 * @returns {Array}
 */
export function getShopInventory(shopId) {
  switch (shopId) {
    case 'general_store': return generalStoreInventory;
    case 'blacksmith':    return blacksmithInventory;
    case 'mages_tower':   return magesTowerInventory;
    case 'temple':        return templeServices;
    default:
      console.warn(`getShopInventory: unknown shopId "${shopId}"`);
      return [];
  }
}

/**
 * Check whether a character can purchase a given item.
 * @param {Object} item        — shop item with optional `requires` field
 * @param {Object} character   — CharacterContext character state
 * @returns {{ allowed: boolean, reason: string|null }}
 */
export function canPurchase(item, character) {
  if (!item.requires) return { allowed: true, reason: null };

  const { classes, minLevel } = item.requires;

  if (classes && !classes.includes(character.class)) {
    return {
      allowed: false,
      reason: `Only available to: ${classes.map(c =>
        c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}`
    };
  }

  if (minLevel && character.level < minLevel) {
    return {
      allowed: false,
      reason: `Requires level ${minLevel} or higher`
    };
  }

  return { allowed: true, reason: null };
}

/**
 * Calculate total cost for a purchase.
 * @param {Object} item
 * @param {number} quantity
 * @returns {number} GP
 */
export function calculateCost(item, quantity = 1) {
  return item.cost * quantity;
}

/**
 * Get available hirelings (those not already recruited).
 * @param {Array} currentHirelings — TownContext hirelings array
 * @returns {Array} available hireling templates
 */
export function getAvailableHirelings(currentHirelings) {
  const recruitedIds = new Set(currentHirelings.map(h => h.templateId));
  return hirelingRoster.filter(h => !recruitedIds.has(h.templateId));
}
