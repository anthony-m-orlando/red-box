/**
 * Spell Utilities - Handle spell casting and effects
 */

import { rollDice, rollDiceSum } from './dice';
import { getSpell } from '../data/spells';

/**
 * Check if a character can cast a spell
 * @param {object} character - Character object
 * @param {string} spellId - Spell ID
 * @param {number} spellLevel - Spell level (1-3)
 * @returns {object} { canCast: boolean, reason: string }
 */
export function canCastSpell(character, spellId, spellLevel = 1) {
  // Check if character knows the spell
  if (!character.spells.includes(spellId)) {
    return { canCast: false, reason: "You don't know this spell" };
  }
  
  // Check if spell slots available
  const slotsAvailable = character.spellSlots[spellLevel] || 0;
  const slotsUsed = character.spellSlotsUsed[spellLevel] || 0;
  
  if (slotsUsed >= slotsAvailable) {
    return { canCast: false, reason: 'No spell slots remaining' };
  }
  
  return { canCast: true, reason: '' };
}

/**
 * Cast a healing spell
 * @param {object} spell - Spell object
 * @param {object} target - Target character
 * @returns {object} { healAmount: number, newHP: number, message: string }
 */
export function castHealingSpell(spell, target) {
  const { formula } = spell.implementation;
  const healAmount = parseDiceFormula(formula);
  const newHP = Math.min(target.hp.current + healAmount, target.hp.max);
  const actualHealing = newHP - target.hp.current;
  
  return {
    healAmount: actualHealing,
    newHP,
    message: `${spell.name} heals ${actualHealing} hit points!`
  };
}

/**
 * Cast a damage spell
 * @param {object} spell - Spell object
 * @param {object} target - Target enemy
 * @returns {object} { damage: number, newHP: number, message: string }
 */
export function castDamageSpell(spell, target) {
  const { formula, autoHit } = spell.implementation;
  const damage = parseDiceFormula(formula);
  const newHP = Math.max(0, target.hp.current - damage);
  
  const hitMessage = autoHit 
    ? `${spell.name} strikes unerringly!` 
    : `${spell.name} hits!`;
  
  return {
    damage,
    newHP,
    autoHit: autoHit || false,
    message: `${hitMessage} ${damage} damage!`
  };
}

/**
 * Cast a buff spell (AC, attack bonus, etc.)
 * @param {object} spell - Spell object
 * @param {object} target - Target character
 * @returns {object} { stat: string, bonus: number, duration: number, message: string }
 */
export function castBuffSpell(spell, target) {
  const { stat, bonus, duration } = spell.implementation;
  
  let statName = stat.toUpperCase();
  let currentValue = target[stat];
  
  // AC is inverted (lower is better)
  const newValue = stat === 'ac' 
    ? currentValue - bonus  // -4 makes AC better
    : currentValue + bonus;
  
  return {
    stat,
    bonus,
    duration,
    currentValue,
    newValue,
    message: `${spell.name} grants ${bonus > 0 ? '+' : ''}${bonus} ${statName}!`
  };
}

/**
 * Cast a utility spell (Light, Detect Magic, etc.)
 * @param {object} spell - Spell object
 * @returns {object} { effect: string, message: string }
 */
export function castUtilitySpell(spell) {
  const { effect } = spell.implementation;
  
  let message = '';
  switch (effect) {
    case 'illumination':
      message = `${spell.name} creates a bright light! The area is now illuminated.`;
      break;
    case 'detect_magic':
      message = `${spell.name} reveals magical auras! You sense the presence of enchantment.`;
      break;
    case 'detect_evil':
      message = `You focus your divine senses...`;
      break;
    case 'fizzle':
      message = spell.implementation.message || `${spell.name} fizzles without useful effect here.`;
      break;
    case 'read_magic':
      message = `${spell.name} allows you to decipher magical writing!`;
      break;
    default:
      message = `You cast ${spell.name}!`;
  }
  
  return {
    effect,
    message
  };
}

/**
 * Apply spell effect based on spell type
 * @param {object} spell - Spell object
 * @param {object} caster - Character casting the spell
 * @param {object} target - Target of the spell (character or enemy)
 * @param {string} context - 'combat' or 'exploration'
 * @returns {object} Effect result
 */
export function applySpellEffect(spell, caster, target, context = 'combat') {
  const { type } = spell.implementation;
  
  switch (type) {
    case 'healing':
      return {
        type: 'healing',
        ...castHealingSpell(spell, target)
      };
      
    case 'damage':
      return {
        type: 'damage',
        ...castDamageSpell(spell, target)
      };
      
    case 'buff':
      return {
        type: 'buff',
        ...castBuffSpell(spell, target)
      };
      
    case 'utility':
      return {
        type: 'utility',
        ...castUtilitySpell(spell)
      };
      
    case 'condition':
      // Not implemented yet (Sleep, Charm)
      return {
        type: 'condition',
        message: `${spell.name} is not yet implemented in combat.`
      };
      
    default:
      return {
        type: 'unknown',
        message: `${spell.name} effect is not recognized.`
      };
  }
}

/**
 * Parse dice formula and roll
 * @param {string} formula - Dice formula (e.g., "1d6+1", "1d4+1")
 * @returns {number} Result
 */
function parseDiceFormula(formula) {
  // Parse formula like "1d6+1" or "2d4"
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
 * Get available spells for character in current context
 * @param {object} character - Character object
 * @param {string} context - 'combat' or 'exploration'
 * @returns {array} Available spell objects with castability
 */
export function getAvailableSpells(character, context = 'combat') {
  return character.spells.map(spellId => {
    const spell = getSpell(spellId);
    const canCast = canCastSpell(character, spellId, spell.level);
    
    return {
      ...spell,
      canCast: canCast.canCast,
      reason: canCast.reason
    };
  }).filter(spell => spell !== null);
}

/**
 * Format spell casting message for combat log
 * @param {string} casterName - Name of caster
 * @param {object} spell - Spell object
 * @param {object} result - Spell effect result
 * @returns {string} Formatted message
 */
export function formatSpellCastMessage(casterName, spell, result) {
  let message = `✨ ${casterName} casts ${spell.name}! `;
  
  switch (result.type) {
    case 'healing':
      message += `Heals ${result.healAmount} HP!`;
      break;
    case 'damage':
      message += `Deals ${result.damage} damage!`;
      break;
    case 'buff':
      message += `Grants ${result.bonus > 0 ? '+' : ''}${result.bonus} ${result.stat.toUpperCase()}!`;
      break;
    case 'utility':
      message += result.message;
      break;
    default:
      message += result.message || 'Effect applied!';
  }
  
  return message;
}

/**
 * Get spell slots remaining text
 * @param {object} character - Character object
 * @param {number} level - Spell level
 * @returns {string} "1/1" or "0/1" etc.
 */
export function getSpellSlotsText(character, level) {
  const max = character.spellSlots[level] || 0;
  const used = character.spellSlotsUsed[level] || 0;
  const remaining = max - used;
  
  return `${remaining}/${max}`;
}

/**
 * Check if character has any spells available
 * @param {object} character - Character object
 * @returns {boolean}
 */
export function hasSpellsAvailable(character) {
  for (let level = 1; level <= 3; level++) {
    const max = character.spellSlots[level] || 0;
    const used = character.spellSlotsUsed[level] || 0;
    if (used < max) {
      return true;
    }
  }
  return false;
}

export default {
  canCastSpell,
  castHealingSpell,
  castDamageSpell,
  castBuffSpell,
  castUtilitySpell,
  applySpellEffect,
  getAvailableSpells,
  formatSpellCastMessage,
  getSpellSlotsText,
  hasSpellsAvailable
};
