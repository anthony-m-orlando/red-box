/**
 * Shared Spell Casting Logic
 * Used by both CombatUI and ActionPanel (exploration)
 */

import { getSpell } from '../data/spells';
import { applySpellEffect } from '../utils/spells';
import soundManager from '../utils/sound';

/**
 * Handle spell casting - works in both combat and exploration
 * 
 * @param {string} spellId - The spell ID to cast
 * @param {object} context - Context object containing:
 *   - character: Character object
 *   - enemy: Enemy object (null in exploration)
 *   - enemyHP: Enemy HP (null in exploration)  
 *   - setEnemyHP: Function to set enemy HP (null in exploration)
 *   - enemyConditions: Array of enemy conditions
 *   - setEnemyConditions: Function to set conditions
 *   - round: Current combat round
 *   - adventure: Adventure context
 *   - addLogEntry: Function to add log entries (combat only)
 *   - addNarration: Function to add narration
 *   - heal: Function to heal character
 *   - addBuff: Function to add buff
 *   - useSpellSlot: Function to use spell slot
 *   - setCombatState: Function to set combat state (combat only)
 *   - setShowSpellMenu: Function to close spell menu
 */
export function handleCastSpell(spellId, context) {
  const {
    character,
    enemy = null,
    enemyHP = null,
    setEnemyHP = null,
    enemyConditions = [],
    setEnemyConditions = null,
    round = 0,
    adventure,
    addLogEntry = null,
    addNarration,
    heal,
    addBuff,
    useSpellSlot,
    setCombatState = null,
    setShowSpellMenu
  } = context;

  const spell = getSpell(spellId);
  if (!spell) {
    console.error('Spell not found:', spellId);
    return;
  }
  
  // Close spell menu
  setShowSpellMenu(false);
  
  // Determine target based on spell type
  const spellType = spell.implementation.type;
  const target = (spellType === 'healing' || spellType === 'buff') 
    ? character  // Self-target for healing/buffs
    : enemy ? { hp: { current: enemyHP, max: enemy.hp.max }, ...enemy } : null; // Enemy for damage
  
  // Apply spell effect
  const result = applySpellEffect(spell, character, target, enemy ? 'combat' : 'exploration');
  
  // Log spell cast
  if (addLogEntry) {
    addLogEntry(`✨ You cast ${spell.name}!`);
  }
  addNarration('combat_action', `You cast ${spell.name}!`, { emphasis: true });
  
  // Play spell sound
  soundManager.play('spell');
  
  // Apply effects based on type
  switch (result.type) {
    case 'healing':
      heal(result.healAmount);
      soundManager.play('heal');
      if (addLogEntry) {
        addLogEntry(`💚 ${spell.name} heals ${result.healAmount} HP!`);
      }
      addNarration('combat_action', `${spell.name} restores ${result.healAmount} hit points!`);
      break;
      
    case 'damage':
      if (setEnemyHP && enemyHP !== null) {
        setEnemyHP(result.newHP);
        soundManager.play('hit');
        if (addLogEntry) {
          addLogEntry(`⚡ ${spell.name} deals ${result.damage} damage!`);
        }
        addNarration('combat_action', `${spell.name} strikes for ${result.damage} damage!`, { emphasis: true });
      }
      break;
      
    case 'buff':
      // Apply buff to character
      const buff = {
        spellId: spell.id,
        stat: result.stat,
        bonus: result.bonus,
        duration: result.duration,
        turnApplied: round
      };
      addBuff(buff);
      if (addLogEntry) {
        addLogEntry(`🛡️ ${spell.name} grants ${result.bonus > 0 ? '+' : ''}${result.bonus} ${result.stat.toUpperCase()}!`);
      }
      addNarration('combat_action', result.message);
      break;
    
    case 'condition':
      // Handle Sleep spell
      if (spell.id === 'sleep' && enemy && setEnemyConditions) {
        // Roll HD affected
        const hdRoll1 = Math.floor(Math.random() * 8) + 1;
        const hdRoll2 = Math.floor(Math.random() * 8) + 1;
        const hdAffected = hdRoll1 + hdRoll2;
        
        // Get enemy HD (parse "1" from "1 HD" or "1-1" etc)
        const enemyHD = parseInt(enemy.hitDice) || 1;
        
        if (enemyHD <= hdAffected) {
          // Enemy falls asleep!
          setEnemyConditions([...enemyConditions, 'asleep']);
          if (addLogEntry) {
            addLogEntry(`💤 The ${enemy.name} falls into a deep slumber!`);
          }
          addNarration('combat_action', `${spell.name} causes the ${enemy.name} to collapse into magical sleep! (${hdAffected} HD affected)`);
        } else {
          // Too many HD to affect
          if (addLogEntry) {
            addLogEntry(`✨ ${spell.name} fails to affect the ${enemy.name}.`);
          }
          addNarration('combat_action', `The ${enemy.name} is too powerful to be affected by ${spell.name}. (Need ${enemyHD} HD, rolled ${hdAffected})`);
        }
      }
      break;
      
    case 'utility':
      // Special handling for Detect Evil
      if (spell.id === 'detect_evil') {
        if (enemy && enemy.alignment === 'Chaotic') {
          if (addLogEntry) {
            addLogEntry(`👁️ You sense evil emanating from the ${enemy.name}!`);
          }
          addNarration('dm_note', `Your divine senses detect a malevolent presence - the ${enemy.name} radiates chaotic evil!`);
        } else {
          if (addLogEntry) {
            addLogEntry(`✨ You sense no evil nearby.`);
          }
          addNarration('dm_note', 'Your senses detect no evil in the immediate area.');
        }
      } else if (spell.id === 'light') {
        // Light spell creates magical illumination
        adventure.lightTorch();
        if (addLogEntry) {
          addLogEntry(`✨ Magical light fills the area!`);
        }
        addNarration('combat_action', 'A soft, steady radiance springs forth from your hand, illuminating the darkness with magical light.');
      } else {
        if (addLogEntry) {
          addLogEntry(`✨ ${result.message}`);
        }
        addNarration('combat_action', result.message);
      }
      break;
      
    default:
      if (addLogEntry) {
        addLogEntry(`✨ ${result.message}`);
      }
      addNarration('combat_action', result.message);
  }
  
  // Use spell slot
  useSpellSlot(spell.level);
  
  // Enemy turn next (combat only)
  if (setCombatState) {
    setCombatState('enemyTurn');
  }
}

export default handleCastSpell;
