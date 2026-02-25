import { rollD20, rollDie, parseDiceNotation } from './dice';

/**
 * Combat Utilities
 * Functions for resolving combat in D&D Basic Rules
 */

/**
 * Roll an attack using THAC0 system
 * @param {number} thac0 - Attacker's THAC0
 * @param {number} targetAC - Target's armor class
 * @param {number} attackBonus - Additional attack bonus (strength, magic, etc.)
 * @returns {object} - { roll, needed, hit, critical, fumble }
 */
export function rollAttack(thac0, targetAC, attackBonus = 0) {
  const roll = rollD20();
  const totalRoll = roll + attackBonus;
  const needed = thac0 - targetAC;
  
  return {
    roll,
    totalRoll,
    needed,
    hit: totalRoll >= needed || roll === 20, // Natural 20 always hits
    critical: roll === 20,
    fumble: roll === 1
  };
}

/**
 * Roll damage dice
 * @param {string} damageDice - Damage notation (e.g., "1d8", "2d6+2")
 * @returns {number} - Total damage
 */
export function rollDamage(damageDice) {
  if (typeof damageDice === 'number') {
    return damageDice; // Fixed damage
  }
  
  try {
    return Math.max(1, parseDiceNotation(damageDice));
  } catch (error) {
    console.error('Invalid damage dice:', damageDice);
    return 1;
  }
}

/**
 * Roll initiative (d6 in Basic D&D)
 * @returns {number} - Initiative roll (1-6)
 */
export function rollInitiative() {
  return rollDie(6);
}

/**
 * Check if monster should flee (morale check)
 * @param {number} morale - Monster's morale score (2-12)
 * @returns {boolean} - True if monster flees
 */
export function checkMorale(morale) {
  const roll = rollDie(6) + rollDie(6); // 2d6
  return roll > morale;
}

/**
 * Apply strength modifier to melee damage
 * @param {number} baseDamage - Base damage rolled
 * @param {number} strengthScore - Attacker's strength score
 * @returns {number} - Modified damage (minimum 1)
 */
export function applyStrengthDamage(baseDamage, strengthScore) {
  const modifier = calculateModifier(strengthScore);
  return Math.max(1, baseDamage + modifier);
}

/**
 * Calculate modifier from ability score
 * (Duplicated from calculations.js for convenience)
 */
function calculateModifier(score) {
  if (score <= 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return +1;
  if (score <= 17) return +2;
  return +3;
}

/**
 * Roll saving throw
 * @param {number} saveTarget - Target number to beat
 * @param {number} bonus - Bonus to the roll
 * @returns {object} - { roll, total, success }
 */
export function rollSavingThrow(saveTarget, bonus = 0) {
  const roll = rollD20();
  const total = roll + bonus;
  
  return {
    roll,
    total,
    success: total >= saveTarget || roll === 20, // Natural 20 always succeeds
    criticalSuccess: roll === 20,
    criticalFailure: roll === 1
  };
}

/**
 * Calculate XP from defeated monster
 * @param {number} hitDice - Monster's hit dice
 * @param {number} specialAbilities - Number of special abilities (0-4+)
 * @returns {number} - XP value
 */
export function calculateMonsterXP(hitDice, specialAbilities = 0) {
  // Basic D&D XP table
  const baseXP = {
    0: 5,      // Less than 1 HD
    1: 10,
    2: 20,
    3: 35,
    4: 75,
    5: 175,
    6: 275,
    7: 450,
    8: 650,
    9: 900
  };
  
  const base = baseXP[Math.min(hitDice, 9)] || 5;
  const abilityBonus = specialAbilities * base;
  
  return base + abilityBonus;
}

/**
 * Determine surprise (1-2 on d6)
 * @returns {boolean} - True if surprised
 */
export function checkSurprise() {
  return rollDie(6) <= 2;
}

/**
 * Calculate attack bonus from strength (for melee)
 * @param {number} strengthScore - Strength score
 * @returns {number} - Attack bonus
 */
export function getStrengthAttackBonus(strengthScore) {
  return calculateModifier(strengthScore);
}

/**
 * Calculate attack bonus from dexterity (for missiles)
 * @param {number} dexterityScore - Dexterity score
 * @returns {number} - Attack bonus
 */
export function getDexterityAttackBonus(dexterityScore) {
  return calculateModifier(dexterityScore);
}

/**
 * Format combat roll for display
 * @param {object} attackResult - Result from rollAttack
 * @param {string} attackerName - Name of attacker
 * @param {string} targetName - Name of target
 * @returns {string} - Formatted message
 */
export function formatAttackRoll(attackResult, attackerName, targetName) {
  if (attackResult.critical) {
    return `${attackerName} rolled a CRITICAL HIT (20)! ${targetName} takes maximum damage!`;
  }
  
  if (attackResult.fumble) {
    return `${attackerName} rolled a FUMBLE (1)! The attack goes wild!`;
  }
  
  if (attackResult.hit) {
    return `${attackerName} rolled ${attackResult.roll} (needed ${attackResult.needed}) - HIT!`;
  }
  
  return `${attackerName} rolled ${attackResult.roll} (needed ${attackResult.needed}) - MISS!`;
}

export default {
  rollAttack,
  rollDamage,
  rollInitiative,
  checkMorale,
  applyStrengthDamage,
  rollSavingThrow,
  calculateMonsterXP,
  checkSurprise,
  getStrengthAttackBonus,
  getDexterityAttackBonus,
  formatAttackRoll
};
