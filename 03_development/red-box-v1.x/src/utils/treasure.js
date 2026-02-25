/**
 * Treasure Utilities - Random treasure generation
 */

import { rollDice, rollDiceSum } from './dice';

/**
 * Treasure tables by monster type
 * Based on D&D Basic Rules treasure types
 */
const treasureTables = {
  goblin: {
    gold: { dice: '1d6', bonus: 0 },
    items: [
      { id: 'dagger', name: 'Rusty Dagger', chance: 0.10, type: 'weapon' }
    ]
  },
  
  snake: {
    gold: { dice: '2d6', bonus: 0 },
    items: [
      { id: 'healing_potion', name: 'Healing Potion', chance: 0.05, type: 'consumable', effect: { type: 'healing', formula: '1d8' } }
    ]
  },
  
  rust_monster: {
    gold: { dice: '3d10', bonus: 0 },
    items: [
      { id: 'wooden_shield', name: 'Wooden Shield', chance: 0.20, type: 'armor' },
      { id: 'healing_potion', name: 'Healing Potion', chance: 0.15, type: 'consumable', effect: { type: 'healing', formula: '1d8' } }
    ]
  },
  
  // Default treasure for unknown monsters
  default: {
    gold: { dice: '1d10', bonus: 0 },
    items: []
  }
};

/**
 * Generate treasure from a defeated monster
 * @param {string} monsterId - Monster ID
 * @param {string} monsterType - Monster type (goblin, snake, etc.)
 * @returns {object} { gold: number, items: array }
 */
export function generateTreasure(monsterId, monsterType) {
  // Get monster's treasure table
  const table = treasureTables[monsterType] || treasureTables.default;
  
  // Roll for gold
  const gold = rollTreasureGold(table.gold);
  
  // Roll for items
  const items = rollTreasureItems(table.items);
  
  return {
    gold,
    items,
    monsterId,
    monsterType
  };
}

/**
 * Roll for gold amount
 * @param {object} goldData - { dice: '1d6', bonus: 0 }
 * @returns {number} Gold pieces
 */
function rollTreasureGold(goldData) {
  const { dice, bonus } = goldData;
  const amount = parseDiceFormula(dice) + bonus;
  return Math.max(0, amount); // Minimum 0
}

/**
 * Roll for treasure items
 * @param {array} itemList - List of possible items with chances
 * @returns {array} Array of item objects
 */
function rollTreasureItems(itemList) {
  const foundItems = [];
  
  for (const itemData of itemList) {
    const roll = Math.random();
    if (roll < itemData.chance) {
      // Found item!
      foundItems.push({
        id: itemData.id,
        name: itemData.name,
        type: itemData.type,
        weight: itemData.weight || 1,
        quantity: 1,
        effect: itemData.effect || { type: 'utility' },
        usableIn: itemData.usableIn || ['exploration', 'combat']
      });
    }
  }
  
  return foundItems;
}

/**
 * Parse dice formula and roll
 * @param {string} formula - Dice formula (e.g., "1d6", "2d10+5")
 * @returns {number} Result
 */
function parseDiceFormula(formula) {
  // Handle simple numbers
  if (!formula.includes('d')) {
    return parseInt(formula) || 0;
  }

  // Parse formula like "1d6+2" or "2d10"
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
 * Format treasure for display
 * @param {object} treasure - Treasure object
 * @returns {string} Formatted message
 */
export function formatTreasureMessage(treasure) {
  let message = '';
  
  // Gold
  if (treasure.gold > 0) {
    message += `💰 ${treasure.gold} gold pieces`;
  }
  
  // Items
  if (treasure.items.length > 0) {
    if (message) message += '\n';
    message += '📦 Items found:\n';
    treasure.items.forEach(item => {
      message += `  • ${item.name}\n`;
    });
  }
  
  // Nothing
  if (treasure.gold === 0 && treasure.items.length === 0) {
    message = 'No treasure found.';
  }
  
  return message.trim();
}

/**
 * Get treasure type for a monster
 * @param {string} monsterType - Monster type
 * @returns {object} Treasure table
 */
export function getTreasureTable(monsterType) {
  return treasureTables[monsterType] || treasureTables.default;
}

/**
 * Add custom treasure table
 * @param {string} monsterType - Monster type
 * @param {object} table - Treasure table
 */
export function addTreasureTable(monsterType, table) {
  treasureTables[monsterType] = table;
}

/**
 * Calculate total treasure value in gold
 * @param {object} treasure - Treasure object
 * @returns {number} Total value in GP
 */
export function calculateTreasureValue(treasure) {
  let value = treasure.gold;
  
  // Add item values (rough estimates)
  treasure.items.forEach(item => {
    switch (item.type) {
      case 'weapon':
        value += 10;
        break;
      case 'armor':
        value += 20;
        break;
      case 'consumable':
        value += 50; // Potions are valuable
        break;
      default:
        value += 5;
    }
  });
  
  return value;
}

export default {
  generateTreasure,
  formatTreasureMessage,
  getTreasureTable,
  addTreasureTable,
  calculateTreasureValue
};
