/**
 * Item Utilities - Handle item usage and effects
 */

import { rollDice, rollDiceSum } from './dice';
import { calculateAC } from './calculations';
import { getStartingEquipment } from '../data/classes';

/**
 * Check if an item can be used in the current context
 * @param {object} item - Item object
 * @param {string} context - 'combat' or 'exploration'
 * @returns {object} { canUse: boolean, reason: string }
 */
const EQUIP_TYPES = ['equip_weapon', 'equip_armor', 'equip_shield'];

export function isEquipableItem(item) {
  return !!item?.effect?.type && EQUIP_TYPES.includes(item.effect.type);
}

export function canEquipItem(item, character = {}) {
  const { effect = {} } = item;
  const { type } = effect;
  const { weapon, weaponTwoHanded, hasShield, shield } = character;

  if (type === 'equip_shield') {
    if (weaponTwoHanded) {
      return { canUse: false, reason: 'Cannot equip a shield while wielding a two-handed weapon.' };
    }
    // Allow unequipping if already equipped, but prevent equipping different shield if one is equipped
    if (hasShield && shield !== item.name) {
      return { canUse: false, reason: 'A shield is already equipped.' };
    }
  }

  if (type === 'equip_weapon') {
    if (effect.twoHanded && hasShield) {
      return { canUse: false, reason: 'Cannot equip a two-handed weapon while a shield is equipped.' };
    }
    // Allow unequipping if already equipped, but prevent equipping different weapon if one is equipped
    if (weapon && weapon !== item.name) {
      return { canUse: false, reason: 'A weapon is already equipped.' };
    }
  }

  if (type === 'equip_armor') {
    // Allow unequipping if already equipped, but prevent equipping different armor if one is equipped
    if (character.armor && character.armor !== item.name && character.armor !== item.name.toLowerCase()) {
      return { canUse: false, reason: 'Armor is already equipped.' };
    }
  }

  return { canUse: true, reason: '' };
}

export function canUseItem(item, context = 'exploration', character = null) {
  if (!item) {
    return { canUse: false, reason: 'Item not found' };
  }

  if (isEquipableItem(item)) {
    return canEquipItem(item, character);
  }

  // Check if item is usable in this context
  const usableIn = item.usableIn || ['exploration', 'combat'];
  if (context === 'town') {
    // Town inventory acts like an item browser, but only exploration/combat items can be actively used.
    if (usableIn.includes('exploration') || usableIn.includes('combat')) {
      return { canUse: true, reason: '' };
    }
    return { canUse: false, reason: `Cannot use ${item.name} here` };
  }

  if (!usableIn.includes(context)) {
    return { 
      canUse: false, 
      reason: `Cannot use ${item.name} in ${context}` 
    };
  }

  // Check if item is consumable and quantity > 0
  if (item.type === 'consumable' && item.quantity !== undefined) {
    if (item.quantity <= 0) {
      return { canUse: false, reason: 'No charges remaining' };
    }
  }

  return { canUse: true, reason: '' };
}

/**
 * Use a healing item (potion, salve, etc.)
 * @param {object} item - Item object
 * @param {object} character - Character object
 * @returns {object} { healAmount: number, newHP: number, message: string, consumed: boolean }
 */
export function useHealingItem(item, character) {
  const { effect } = item;
  const { formula } = effect;
  
  // Parse healing formula (e.g., "1d8", "2d4+2")
  const healAmount = parseDiceFormula(formula);
  const newHP = Math.min(character.hp.current + healAmount, character.hp.max);
  const actualHealing = newHP - character.hp.current;

  return {
    healAmount: actualHealing,
    newHP,
    message: effect.narrative || `${item.name} restores ${actualHealing} hit points!`,
    consumed: item.type === 'consumable'
  };
}

/**
 * Use a light source (lantern, torch, etc.)
 * @param {object} item - Item object
 * @returns {object} { effect: string, message: string, consumed: boolean }
 */
export function useLightSource(item) {
  const { effect } = item;
  const duration = effect.duration || 'several hours';

  return {
    effect: 'illumination',
    message: effect.narrative || `You light the ${item.name}. Warm light pushes back the darkness, illuminating the area for ${duration}.`,
    consumed: item.type === 'consumable' // Torches consumed, lanterns not
  };
}

/**
 * Use a utility item (rope, pole, etc.)
 * @param {object} item - Item object
 * @param {string} context - Current context
 * @returns {object} { effect: string, message: string, consumed: boolean }
 */
export function useUtilityItem(item, context = 'exploration') {
  const { effect } = item;

  // Check if item has a specific use in this context
  if (effect && effect.narrative) {
    return {
      effect: effect.type || 'utility',
      message: effect.narrative,
      consumed: false
    };
  }

  // Default: item has no immediate effect
  return {
    effect: 'none',
    message: `You hold the ${item.name}. Nothing significant happens right now.`,
    consumed: false
  };
}

/**
 * Use a combat item (weapon, shield, etc.)
 * @param {object} item - Item object
 * @param {object} character - Character object
 * @returns {object} { effect: string, message: string, equipped: boolean }
 */
export function useCombatItem(item, character) {
  const equipResult = equipItem(item, character);
  return {
    effect: 'equip',
    ...equipResult
  };
}

export function equipItem(item, character) {
  const { effect = {} } = item;
  const armorClass = character.armorClass ?? 9;
  const currentWeapon = character.weapon || null;
  const currentWeaponTwoHanded = character.weaponTwoHanded || false;
  const currentShield = character.shield || null;

  let newArmor = character.armor || 'none';
  let newArmorClass = armorClass;
  let newWeapon = currentWeapon;
  let newWeaponTwoHanded = currentWeaponTwoHanded;
  let newShield = currentShield;
  let newHasShield = character.hasShield || false;

  // Check if item is already equipped (for unequipping)
  const isEquipped = (
    (effect.type === 'equip_weapon' && currentWeapon === item.name) ||
    (effect.type === 'equip_armor' && (character.armor === item.name || character.armor === item.name.toLowerCase())) ||
    (effect.type === 'equip_shield' && currentShield === item.name)
  );

  if (isEquipped) {
    // Unequip the item
    switch (effect.type) {
      case 'equip_armor':
        newArmor = 'none';
        newArmorClass = 9;
        break;
      case 'equip_shield':
        newShield = null;
        newHasShield = false;
        break;
      case 'equip_weapon':
        newWeapon = null;
        newWeaponTwoHanded = false;
        break;
    }
  } else {
    // Equip the item
    switch (effect.type) {
      case 'equip_armor':
        newArmor = item.name;
        newArmorClass = effect.acValue || 9;
        break;

      case 'equip_shield':
        newShield = item.name;
        newHasShield = true;
        break;

      case 'equip_weapon':
        newWeapon = item.name;
        newWeaponTwoHanded = !!effect.twoHanded;
        if (newWeaponTwoHanded) {
          newShield = null;
          newHasShield = false;
        }
        break;

      default:
        break;
    }
  }

  const armorBonus = (newArmorClass - 9) + (newHasShield ? -1 : 0);
  const ac = calculateAC(9, character.abilities?.dexterity ?? 10, armorBonus);

  return {
    message: isEquipped 
      ? `You unequip the ${item.name}.`
      : (effect.narrative || `You equip the ${item.name}.`),
    equipped: !isEquipped,
    equipment: {
      armor: newArmor,
      armorClass: newArmorClass,
      hasShield: newHasShield,
      shield: newShield,
      weapon: newWeapon,
      weaponTwoHanded: newWeaponTwoHanded,
      ac,
      inventory: character.inventory || [],
    }
  };
}

/**
 * Apply item effect based on item type
 * @param {object} item - Item object
 * @param {object} character - Character object
 * @param {string} context - 'combat' or 'exploration'
 * @returns {object} Effect result
 */
export function applyItemEffect(item, character, context = 'exploration') {
  const itemType = item.effect?.type || item.type;

  switch (itemType) {
    case 'healing':
      return {
        type: 'healing',
        ...useHealingItem(item, character)
      };

    case 'light':
      return {
        type: 'light',
        ...useLightSource(item)
      };

    case 'equip_weapon':
    case 'equip_armor':
    case 'equip_shield':
    case 'weapon':
    case 'armor':
      return {
        type: 'equipment',
        ...useCombatItem(item, character)
      };

    case 'utility':
    default:
      return {
        type: 'utility',
        ...useUtilityItem(item, context)
      };
  }
}

/**
 * Parse dice formula and roll
 * @param {string} formula - Dice formula (e.g., "1d8", "2d4+2")
 * @returns {number} Result
 */
function parseDiceFormula(formula) {
  // Handle simple numbers (e.g., "8")
  if (!formula.includes('d')) {
    return parseInt(formula) || 0;
  }

  // Parse formula like "1d8+2" or "2d4"
  const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
  
  if (!match) {
    console.error('Invalid dice formula:', formula);
    return 0;
  }
  
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  
  const roll = rollDiceSum(count, sides);
  return roll + modifier;
}

/**
 * Get item icon based on type
 * @param {object} item - Item object
 * @returns {string} Icon character/emoji
 */
export function getItemIcon(item) {
  const type = item.effect?.type || item.type;

  switch (type) {
    case 'healing':
      return '🧪'; // Potion
    case 'light':
      return '🔦'; // Lantern/Torch
    case 'weapon':
      return '⚔️'; // Weapon
    case 'armor':
      return '🛡️'; // Shield/Armor
    case 'utility':
      return '🎒'; // Generic tool
    default:
      return '📦'; // Generic item
  }
}

/**
 * Format item usage message for display
 * @param {string} characterName - Name of character using item
 * @param {object} item - Item object
 * @param {object} result - Item effect result
 * @returns {string} Formatted message
 */
export function formatItemUseMessage(characterName, item, result) {
  let message = `${characterName} uses ${item.name}. `;

  switch (result.type) {
    case 'healing':
      message += `Restores ${result.healAmount} HP!`;
      break;
    case 'light':
      message += 'Light illuminates the area.';
      break;
    case 'equipment':
      message += result.message;
      break;
    case 'utility':
    default:
      message = result.message;
  }

  return message;
}

/**
 * Get default starting items by class
 * @param {string} className - Class name
 * @returns {array} Array of item objects
 */
export function getStartingItems(className) {
  const equipment = getStartingEquipment(className);
  const items = [];

  // Add armor if not none
  if (equipment.armor && equipment.armor !== 'none') {
    items.push({
      id: equipment.armor.replace(' ', '_'),
      name: equipment.armor.charAt(0).toUpperCase() + equipment.armor.slice(1),
      type: 'armor',
      weight: equipment.armor === 'chain mail' ? 5 : equipment.armor === 'leather' ? 2 : 1,
      quantity: 1,
      effect: { type: 'equip_armor', acValue: equipment.armor === 'chain mail' ? 5 : equipment.armor === 'leather' ? 7 : 9 },
      usableIn: []
    });
  }

  // Add shield if available
  if (equipment.shield) {
    items.push({
      id: 'shield',
      name: 'Shield',
      type: 'armor',
      weight: 1,
      quantity: 1,
      effect: { type: 'equip_shield', acBonus: 1 },
      usableIn: []
    });
  }

  // Add weapons
  equipment.weapons.forEach(weapon => {
    const weaponData = {
      sword: { name: 'Sword', weight: 3, damage: '1d8', type: 'melee' },
      dagger: { name: 'Dagger', weight: 1, damage: '1d4', type: 'melee' },
      mace: { name: 'Mace', weight: 3, damage: '1d6', type: 'melee' },
      sling: { name: 'Sling', weight: 0, damage: '1d4', type: 'ranged' },
      staff: { name: 'Staff', weight: 4, damage: '1d6', type: 'melee' },
      'war hammer': { name: 'War Hammer', weight: 3, damage: '1d6', type: 'melee' },
      'hand axe': { name: 'Hand Axe', weight: 1, damage: '1d6', type: 'melee' }
    }[weapon] || { name: weapon.charAt(0).toUpperCase() + weapon.slice(1), weight: 1, damage: '1d6', type: 'melee' };

    items.push({
      id: weapon.replace(' ', '_'),
      name: weaponData.name,
      type: 'weapon',
      weight: weaponData.weight,
      quantity: 1,
      effect: { 
        type: 'equip_weapon', 
        damage: weaponData.damage, 
        weaponType: weaponData.type,
        twoHanded: weapon === 'staff' || weapon === 'war hammer' || weapon === 'spear' // Add two-handed weapons as needed
      },
      usableIn: []
    });
  });

  const baseItems = [
    {
      id: 'backpack',
      name: 'Backpack',
      type: 'container',
      weight: 2,
      quantity: 1,
      effect: { type: 'utility' },
      usableIn: []
    },
    {
      id: 'waterskin',
      name: 'Waterskin',
      type: 'consumable',
      weight: 1,
      quantity: 1,
      effect: { 
        type: 'utility',
        narrative: 'You take a refreshing drink of water.'
      },
      usableIn: ['exploration']
    },
    {
      id: 'ration',
      name: 'Iron Ration',
      type: 'consumable',
      weight: 1,
      quantity: 7, // 1 week = 7 rations
      effect: {
        type: 'healing',
        formula: '1d4',
        narrative: 'You eat a ration. The dried food restores some vitality.'
      },
      usableIn: ['exploration']
    }
  ];

  const classItems = {
    fighter: [
      {
        id: 'healing_potion',
        name: 'Healing Potion',
        type: 'consumable',
        weight: 1,
        quantity: 1,
        effect: {
          type: 'healing',
          formula: '1d8',
          narrative: 'You drink the potion and feel your wounds close. The liquid tastes of honey and herbs.'
        },
        usableIn: ['exploration', 'combat']
      },
      {
        id: 'torch',
        name: 'Torch',
        type: 'consumable',
        weight: 1,
        quantity: 6,
        effect: {
          type: 'light',
          duration: '1 hour',
          narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
        },
        usableIn: ['exploration']
      }
    ],
    cleric: [
      {
        id: 'holy_symbol',
        name: 'Holy Symbol',
        type: 'tool',
        weight: 1,
        quantity: 1,
        effect: {
          type: 'utility',
          narrative: 'You clutch your holy symbol. Its familiar weight brings comfort.'
        },
        usableIn: ['exploration', 'combat']
      },
      {
        id: 'torch',
        name: 'Torch',
        type: 'consumable',
        weight: 1,
        quantity: 6,
        effect: {
          type: 'light',
          duration: '1 hour',
          narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
        },
        usableIn: ['exploration']
      }
    ],
    'magic-user': [
      {
        id: 'spellbook',
        name: 'Spellbook',
        type: 'tool',
        weight: 3,
        quantity: 1,
        effect: {
          type: 'utility',
          narrative: 'You page through your spellbook, reviewing arcane formulas.'
        },
        usableIn: ['exploration']
      },
      {
        id: 'torch',
        name: 'Torch',
        type: 'consumable',
        weight: 1,
        quantity: 5,
        effect: {
          type: 'light',
          duration: '1 hour',
          narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
        },
        usableIn: ['exploration']
      },
      {
        id: 'lantern',
        name: 'Lantern',
        type: 'tool',
        weight: 2,
        quantity: 1,
        effect: {
          type: 'light',
          duration: 'several hours per flask of oil',
          narrative: 'You light the lantern. Steady light illuminates the area, casting fewer shadows than a torch.'
        },
        usableIn: ['exploration']
      }
    ],
    thief: [
      {
        id: 'thieves_tools',
        name: "Thieves' Tools",
        type: 'tool',
        weight: 1,
        quantity: 1,
        effect: {
          type: 'utility',
          narrative: 'You examine your lockpicks and tools. Everything is in order.'
        },
        usableIn: ['exploration']
      },
      {
        id: 'rope',
        name: 'Rope (50 feet)',
        type: 'tool',
        weight: 5,
        quantity: 1,
        effect: {
          type: 'utility',
          narrative: 'You coil the rope. Useful for climbing, but not much use here right now.'
        },
        usableIn: ['exploration']
      },
      {
        id: 'torch',
        name: 'Torch',
        type: 'consumable',
        weight: 1,
        quantity: 5,
        effect: {
          type: 'light',
          duration: '1 hour',
          narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
        },
        usableIn: ['exploration']
      }
    ],
    dwarf: [
      {
        id: 'healing_potion',
        name: 'Healing Potion',
        type: 'consumable',
        weight: 1,
        quantity: 1,
        effect: {
          type: 'healing',
          formula: '1d8',
          narrative: 'You drink the potion and feel your wounds close. The liquid tastes of honey and herbs.'
        },
        usableIn: ['exploration', 'combat']
      },
      {
        id: 'torch',
        name: 'Torch',
        type: 'consumable',
        weight: 1,
        quantity: 6,
        effect: {
          type: 'light',
          duration: '1 hour',
          narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
        },
        usableIn: ['exploration']
      }
    ],
    elf: [
      {
        id: 'lantern',
        name: 'Lantern',
        type: 'tool',
        weight: 2,
        quantity: 1,
        effect: {
          type: 'light',
          duration: 'several hours per flask of oil',
          narrative: 'You light the lantern. Steady light illuminates the area, casting fewer shadows than a torch.'
        },
        usableIn: ['exploration']
      },
      {
        id: 'rope',
        name: 'Rope (50 feet)',
        type: 'tool',
        weight: 5,
        quantity: 1,
        effect: {
          type: 'utility',
          narrative: 'You coil the rope. Useful for climbing, but not much use here right now.'
        },
        usableIn: ['exploration']
      }
    ],
    halfling: [
      {
        id: 'healing_potion',
        name: 'Healing Potion',
        type: 'consumable',
        weight: 1,
        quantity: 1,
        effect: {
          type: 'healing',
          formula: '1d8',
          narrative: 'You drink the potion and feel your wounds close. The liquid tastes of honey and herbs.'
        },
        usableIn: ['exploration', 'combat']
      },
      {
        id: 'torch',
        name: 'Torch',
        type: 'consumable',
        weight: 1,
        quantity: 6,
        effect: {
          type: 'light',
          duration: '1 hour',
          narrative: 'You light a torch. Flickering flames cast dancing shadows on the walls.'
        },
        usableIn: ['exploration']
      },
      {
        id: 'sling_stones',
        name: 'Sling Stones (20)',
        type: 'ammunition',
        weight: 1,
        quantity: 20,
        effect: {
          type: 'utility',
          narrative: 'You count your sling stones. All accounted for.'
        },
        usableIn: []
      }
    ]
  };

  return [...items, ...baseItems, ...(classItems[className] || classItems.fighter)];
}

export default {
  canUseItem,
  useHealingItem,
  useLightSource,
  useUtilityItem,
  useCombatItem,
  applyItemEffect,
  getItemIcon,
  formatItemUseMessage,
  getStartingItems
};
