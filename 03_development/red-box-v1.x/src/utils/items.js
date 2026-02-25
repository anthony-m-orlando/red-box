/**
 * Item Utilities - Handle item usage and effects
 */

import { rollDice, rollDiceSum } from './dice';

/**
 * Check if an item can be used in the current context
 * @param {object} item - Item object
 * @param {string} context - 'combat' or 'exploration'
 * @returns {object} { canUse: boolean, reason: string }
 */
export function canUseItem(item, context = 'exploration') {
  if (!item) {
    return { canUse: false, reason: 'Item not found' };
  }

  // Check if item is usable in this context
  const usableIn = item.usableIn || ['exploration', 'combat'];
  
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
  // Equipping weapons/armor would change character stats
  // For now, just return a message
  
  return {
    effect: 'equip',
    message: `You ready the ${item.name}.`,
    equipped: true
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

  return [...baseItems, ...(classItems[className] || classItems.fighter)];
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
