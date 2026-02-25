/**
 * Dice Rolling Utilities
 * Authentic D&D dice mechanics
 */

/**
 * Roll a single die with N sides
 * @param {number} sides - Number of sides on the die
 * @returns {number} - Random number between 1 and sides
 */
export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return individual results
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides on each die
 * @returns {number[]} - Array of individual roll results
 */
export function rollDice(count, sides) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }
  return rolls;
}

/**
 * Roll multiple dice and return the sum
 * @param {number} count - Number of dice to roll
 * @param {number} sides - Number of sides on each die
 * @returns {number} - Sum of all rolls
 */
export function rollDiceSum(count, sides) {
  return rollDice(count, sides).reduce((sum, roll) => sum + roll, 0);
}

/**
 * Roll 3d6 (standard ability score roll)
 * @returns {object} - { rolls: [num, num, num], total: num }
 */
export function roll3d6() {
  const rolls = rollDice(3, 6);
  return {
    rolls,
    total: rolls.reduce((sum, roll) => sum + roll, 0)
  };
}

/**
 * Roll 3d6 six times for all ability scores
 * @returns {object} - Object with all six abilities
 */
export function rollAbilityScores() {
  return {
    strength: roll3d6(),
    intelligence: roll3d6(),
    wisdom: roll3d6(),
    dexterity: roll3d6(),
    constitution: roll3d6(),
    charisma: roll3d6()
  };
}

/**
 * Standard D&D dice shortcuts
 */
export const rollD4 = () => rollDie(4);
export const rollD6 = () => rollDie(6);
export const rollD8 = () => rollDie(8);
export const rollD10 = () => rollDie(10);
export const rollD12 = () => rollDie(12);
export const rollD20 = () => rollDie(20);
export const rollD100 = () => rollDie(100);

/**
 * Roll with advantage (roll twice, take higher)
 * @param {number} sides - Number of sides on die
 * @returns {object} - { rolls: [num, num], result: num }
 */
export function rollWithAdvantage(sides) {
  const rolls = [rollDie(sides), rollDie(sides)];
  return {
    rolls,
    result: Math.max(...rolls)
  };
}

/**
 * Roll with disadvantage (roll twice, take lower)
 * @param {number} sides - Number of sides on die
 * @returns {object} - { rolls: [num, num], result: num }
 */
export function rollWithDisadvantage(sides) {
  const rolls = [rollDie(sides), rollDie(sides)];
  return {
    rolls,
    result: Math.min(...rolls)
  };
}

/**
 * Roll for hit points (class hit die + constitution modifier)
 * @param {string} hitDie - Hit die type (d4, d6, d8, d10)
 * @param {number} conModifier - Constitution modifier
 * @returns {number} - Hit points (minimum 1)
 */
export function rollHitPoints(hitDie, conModifier = 0) {
  const dieMap = {
    'd4': 4,
    'd6': 6,
    'd8': 8,
    'd10': 10
  };
  
  const sides = dieMap[hitDie.toLowerCase()] || 6;
  const roll = rollDie(sides);
  return Math.max(1, roll + conModifier);
}

/**
 * Parse dice notation (e.g., "2d6+3")
 * @param {string} notation - Dice notation string
 * @returns {number} - Total roll result
 */
export function parseDiceNotation(notation) {
  const match = notation.match(/(\d+)?d(\d+)([+-]\d+)?/i);
  
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }
  
  const count = parseInt(match[1] || '1', 10);
  const sides = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || '0', 10);
  
  return rollDiceSum(count, sides) + modifier;
}

/**
 * Format dice roll for display
 * @param {number[]} rolls - Array of individual rolls
 * @param {number} total - Total of all rolls
 * @returns {string} - Formatted string (e.g., "[4, 3, 5] = 12")
 */
export function formatDiceRoll(rolls, total) {
  return `[${rolls.join(', ')}] = ${total}`;
}

export default {
  rollDie,
  rollDice,
  rollDiceSum,
  roll3d6,
  rollAbilityScores,
  rollD4,
  rollD6,
  rollD8,
  rollD10,
  rollD12,
  rollD20,
  rollD100,
  rollWithAdvantage,
  rollWithDisadvantage,
  rollHitPoints,
  parseDiceNotation,
  formatDiceRoll
};
