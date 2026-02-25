import React, { useState, useEffect, useRef } from 'react';
import { Swords, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useAdventure } from '../../contexts/AdventureContext';
import { getClassById } from '../../data/classes';
import { rollAttack, rollDamage, rollInitiative, checkMorale, applyStrengthDamage, getStrengthAttackBonus } from '../../utils/combat';
import soundManager from '../../utils/sound';
import handleCastSpell from '../../utils/handleCastSpell';
import { applySpellEffect, hasSpellsAvailable } from '../../utils/spells';
import { generateTreasure, formatTreasureMessage } from '../../utils/treasure';
import { getSpell } from '../../data/spells';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import SpellMenu from './SpellMenu';
import './CombatUI.css';

/**
 * CombatUI - Turn-based combat interface
 */
export function CombatUI({ enemy }) {
  const { character, takeDamage, heal, addXP, updateGold, useSpellSlot, addItem, addBuff, decrementBuffDurations } = useCharacter();
  const adventure = useAdventure();
  const { endCombat, addNarration, enterRoom } = adventure;
  
  const [combatState, setCombatState] = useState('initiative'); // initiative, playerTurn, enemyTurn, victory, defeat
  const [enemyHP, setEnemyHP] = useState(enemy.hp.current);
  const [playerInitiative, setPlayerInitiative] = useState(0);
  const [enemyInitiative, setEnemyInitiative] = useState(0);
  const [round, setRound] = useState(1);
  const [combatLog, setCombatLog] = useState([]);
  const [showSpellMenu, setShowSpellMenu] = useState(false);
  const [enemyConditions, setEnemyConditions] = useState([]); // ['asleep', 'charmed', etc.]

  const hasInitialized = useRef(false);

  // Scroll to top when combat starts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Run once on mount

  // Roll initiative on mount - only once
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const pInit = rollInitiative();
    const eInit = rollInitiative();
    setPlayerInitiative(pInit);
    setEnemyInitiative(eInit);
    
    addLogEntry(`Combat begins! Rolling initiative...`);
    addLogEntry(`You rolled ${pInit}, ${enemy.name} rolled ${eInit}`);
    
    if (pInit > eInit) {
      addLogEntry(`You go first!`);
      setCombatState('playerTurn');
    } else if (eInit > pInit) {
      addLogEntry(`${enemy.name} goes first!`);
      setTimeout(() => setCombatState('enemyTurn'), 1000);
    } else {
      addLogEntry(`Tied initiative! You go first.`);
      setCombatState('playerTurn');
    }
  }, []); // Empty array - only run once on mount

  // Check for victory/defeat
  useEffect(() => {
    if (enemyHP <= 0 && combatState !== 'victory') {
      handleVictory();
    }
    if (character.hp.current <= 0 && combatState !== 'defeat') {
      handleDefeat();
    }
  }, [enemyHP, character.hp.current]);

  // Auto-execute enemy turn
  useEffect(() => {
    if (combatState === 'enemyTurn' && enemyHP > 0) {
      const timer = setTimeout(() => {
        handleEnemyTurn();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [combatState]);

  // Decrement buff durations at start of each round
  useEffect(() => {
    if (combatState === 'playerTurn' && round > 1) {
      decrementBuffDurations();
    }
  }, [round, combatState]);

  const addLogEntry = (message) => {
    setCombatLog(prev => [...prev, { id: Date.now() + Math.random(), text: message }]);
  };

  // Calculate character's effective AC including buffs
  const getEffectiveAC = () => {
    let effectiveAC = character.ac;
    
    // Apply AC buffs (lower is better for AC)
    character.activeBuffs.forEach(buff => {
      if (buff.stat === 'ac') {
        effectiveAC -= buff.bonus;
      }
    });
    
    return effectiveAC;
  };

  const handlePlayerAttack = () => {
    // Check for darkness penalty
    const classData = getClassById(character.class);
    const hasInfravision = classData?.infravision > 0;
    const hasLight = adventure.adventure.hasLight;
    const darknessPenalty = (!hasInfravision && !hasLight) ? -4 : 0;
    
    // Calculate attack
    const attackBonus = getStrengthAttackBonus(character.abilities.strength) + darknessPenalty;
    const attackRoll = rollAttack(character.thac0, enemy.ac, attackBonus);
    
    // Log darkness penalty
    if (darknessPenalty < 0) {
      addLogEntry(`⚠️ Fighting in darkness! (-4 to hit)`);
    }
    
    if (attackRoll.hit) {
      // Roll damage
      let damage = rollDamage('1d8'); // Basic sword damage
      damage = applyStrengthDamage(damage, character.abilities.strength);
      
      // Play hit sound
      soundManager.play('hit');
      
      if (attackRoll.critical) {
        damage = damage * 2;
        addLogEntry(`⚔️ CRITICAL HIT! You strike ${enemy.name} for ${damage} damage!`);
      } else {
        addLogEntry(`⚔️ You hit ${enemy.name} for ${damage} damage!`);
      }
      
      setEnemyHP(prev => Math.max(0, prev - damage));
      
      // Wake sleeping enemy on damage
      if (enemyConditions.includes('asleep')) {
        setEnemyConditions(enemyConditions.filter(c => c !== 'asleep'));
        addLogEntry(`The ${enemy.name} wakes up!`);
        addNarration('combat_action', `The ${enemy.name} is jolted awake by your attack!`);
      }
      
      // Add to narration
      addNarration('combat_action', `You hit the ${enemy.name} for ${damage} damage!`, { emphasis: true });
    } else {
      // Play miss sound
      soundManager.play('miss');
      
      if (attackRoll.fumble) {
        addLogEntry(`💥 FUMBLE! Your attack goes wild!`);
        addNarration('combat_action', 'Your attack misses wildly!');
      } else {
        addLogEntry(`⚔️ Your attack misses!`);
        addNarration('combat_action', 'Your attack misses.');
      }
    }
    
    // Enemy turn next (don't use setTimeout here)
    setCombatState('enemyTurn');
  };

  const handlePlayerDefend = () => {
    addLogEntry(`🛡️ You take a defensive stance! (AC improved)`);
    addNarration('combat_action', 'You defend, improving your armor class.');
    
    // Temporary AC bonus (would need to track this in state for full implementation)
    setCombatState('enemyTurn');
    setTimeout(handleEnemyTurn, 1500);
  };

  const handlePlayerFlee = () => {
    // 50% chance to flee successfully
    const fleeRoll = Math.random();
    
    if (fleeRoll > 0.5) {
      addLogEntry(`🏃 You successfully flee from combat!`);
      addNarration('combat_action', 'You flee from the battle!');
      
      // Move player back to previous room if there is one
      const previousRoom = adventure.adventure.previousRoomId;
      if (previousRoom) {
        addNarration('system_message', 'You retreat to the previous room.');
        endCombat(false, enemy.id);
        // Small delay to let combat close before moving
        setTimeout(() => {
          enterRoom(previousRoom);
        }, 500);
      } else {
        // No previous room, just end combat
        endCombat(false, enemy.id);
      }
    } else {
      addLogEntry(`🏃 You fail to escape! ${enemy.name} gets a free attack!`);
      addNarration('combat_action', 'Failed to flee!');
      setCombatState('enemyTurn');
      setTimeout(handleEnemyTurn, 1000);
    }
  };

  const handleCastSpellLocal = (spellId) => {
    // Call shared handleCastSpell with combat context
    handleCastSpell(spellId, {
      character,
      enemy,
      enemyHP,
      setEnemyHP,
      enemyConditions,
      setEnemyConditions,
      round,
      adventure,
      addLogEntry,
      addNarration,
      heal,
      addBuff,
      useSpellSlot,
      setCombatState,
      setShowSpellMenu
    });
  };

  const handleEnemyTurn = () => {
    // Double-check combat is still active
    if (combatState !== 'enemyTurn') {
      return;
    }
    
    if (enemyHP <= 0) {
      return;
    }
    
    if (character.hp.current <= 0) {
      return;
    }
    
    // Check if enemy is asleep
    if (enemyConditions.includes('asleep')) {
      addLogEntry(`💤 The ${enemy.name} is fast asleep...`);
      addNarration('combat_action', `The ${enemy.name} slumbers peacefully, oblivious to danger.`);
      setRound(round + 1);
      setCombatState('playerTurn');
      return;
    }
    
    // Check morale if badly wounded
    if (enemyHP < enemy.hp.max * 0.25) {
      if (checkMorale(enemy.morale || 9)) {
        addLogEntry(`${enemy.name} flees in terror!`);
        addNarration('combat_action', `The ${enemy.name} flees!`);
        handleVictory();
        return;
      }
    }
    
    // Enemy attacks
    const effectiveAC = getEffectiveAC();
    const attackRoll = rollAttack(enemy.thac0, effectiveAC);
    
    if (attackRoll.hit) {
      const damage = rollDamage(enemy.damage);
      
      if (attackRoll.critical) {
        const critDamage = damage * 2;
        addLogEntry(`💀 CRITICAL! ${enemy.name} hits you for ${critDamage} damage!`);
        addNarration('combat_action', `The ${enemy.name} scores a critical hit for ${critDamage} damage!`, { emphasis: true });
        takeDamage(critDamage);
      } else {
        addLogEntry(`💢 ${enemy.name} hits you for ${damage} damage!`);
        addNarration('combat_action', `The ${enemy.name} hits you for ${damage} damage!`);
        takeDamage(damage);
      }
    } else {
      if (attackRoll.fumble) {
        addLogEntry(`${enemy.name} fumbles its attack!`);
        addNarration('combat_action', `The ${enemy.name} attacks wildly and misses!`);
      } else {
        addLogEntry(`${enemy.name} misses!`);
        addNarration('combat_action', `The ${enemy.name}'s attack misses.`);
      }
    }
    
    // Check if player is still alive before continuing
    setTimeout(() => {
      if (character.hp.current > 0 && enemyHP > 0) {
        setRound(prev => prev + 1);
        setCombatState('playerTurn');
      }
    }, 500);
  };

  const handleVictory = () => {
    setCombatState('victory');
    soundManager.play('victory'); // Play victory fanfare
    addLogEntry(`🎉 Victory! ${enemy.name} is defeated!`);
    
    // Award XP
    addXP(enemy.xp);
    addLogEntry(`You gain ${enemy.xp} XP!`);
    
    // Generate treasure
    const treasure = generateTreasure(enemy.id, enemy.type);
    
    // Award gold
    if (treasure.gold > 0) {
      updateGold(treasure.gold);
      addLogEntry(`💰 Found ${treasure.gold} gold pieces!`);
    }
    
    // Award items
    treasure.items.forEach(item => {
      addItem(item);
      addLogEntry(`📦 Found: ${item.name}!`);
    });
    
    // Narration
    addNarration('system_message', enemy.defeatedText || `The ${enemy.name} falls defeated!`, { emphasis: true });
    addNarration('system_message', `You gain ${enemy.xp} experience points!`);
    
    // Treasure narration
    if (treasure.gold > 0 || treasure.items.length > 0) {
      const treasureMsg = formatTreasureMessage(treasure);
      addNarration('dm_note', `You search the body and find:\n${treasureMsg}`);
    } else {
      addNarration('dm_note', 'You search the body but find nothing of value.');
    }
    
    // End combat after delay
    setTimeout(() => {
      endCombat(true, enemy.id);
    }, 3000);
  };

  const handleDefeat = () => {
    setCombatState('defeat');
    soundManager.play('defeat'); // Play defeat sound
    addLogEntry(`💀 You have been defeated!`);
    addNarration('combat_action', 'You fall unconscious...', { emphasis: true });
    
    // Trigger defeat state
    setTimeout(() => {
      adventure.dispatch({ type: 'SET_DEFEAT' });
    }, 2000);
  };

  return (
    <div className="combat-ui">
      <PaperContainer variant="aged" padding="lg" className="combat-container">
        {/* Enemy Status */}
        <div className="enemy-status">
          <h3>{enemy.name} {enemyConditions.includes('asleep') && '💤'}</h3>
          <div className="enemy-hp-bar">
            <div 
              className="enemy-hp-fill"
              style={{ width: `${(enemyHP / enemy.hp.max) * 100}%` }}
            />
            <span className="enemy-hp-text number">
              {enemyHP}/{enemy.hp.max} HP
            </span>
          </div>
          <div className="enemy-stats">
            <span>AC: {enemy.ac}</span>
            <span>THAC0: {enemy.thac0}</span>
          </div>
          {enemyConditions.includes('asleep') && (
            <div className="enemy-condition">
              <span className="condition-asleep">😴 Asleep</span>
            </div>
          )}
        </div>

        <div className="combat-divider"></div>

        {/* Combat Log */}
        <div className="combat-log">
          <h4>Round {round}</h4>
          <div className="log-entries">
            {combatLog.slice(-6).map(entry => (
              <div key={entry.id} className="log-entry">
                {entry.text}
              </div>
            ))}
          </div>
        </div>

        <div className="combat-divider"></div>

        {/* Active Buffs */}
        {character.activeBuffs && character.activeBuffs.length > 0 && (
          <>
            <div className="active-buffs">
              <h4>Active Effects</h4>
              <div className="buff-list">
                {character.activeBuffs.map((buff, index) => (
                  <div key={index} className="buff-indicator">
                    <Shield size={14} />
                    <span className="buff-name">
                      {buff.spellId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="buff-effect">
                      {buff.bonus > 0 ? '+' : ''}{buff.bonus} {buff.stat.toUpperCase()}
                    </span>
                    <span className="buff-duration">
                      ({buff.duration} {buff.duration === 1 ? 'turn' : 'turns'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="combat-divider"></div>
          </>
        )}
        
        {/* Darkness Warning */}
        {(() => {
          const classData = getClassById(character.class);
          const hasInfravision = classData?.infravision > 0;
          return !hasInfravision && !adventure.adventure.hasLight;
        })() && (
          <>
            <div className="darkness-warning">
              <h4>⚠️ Fighting in Darkness</h4>
              <p>-4 penalty to attack rolls</p>
              <p className="darkness-hint">Use a torch or cast Light spell!</p>
            </div>
            <div className="combat-divider"></div>
          </>
        )}

        {/* Combat Actions */}
        {combatState === 'playerTurn' && (
          <div className="combat-actions">
            <h4>Your Turn</h4>
            <div className="action-buttons">
              <Button
                variant="danger"
                icon={<Swords />}
                onClick={handlePlayerAttack}
                fullWidth
              >
                Attack
              </Button>
              
              {/* Cast Spell Button */}
              <Button
                variant="primary"
                icon={<Sparkles />}
                onClick={() => setShowSpellMenu(true)}
                fullWidth
              >
                Cast Spell
              </Button>
              
              <Button
                variant="secondary"
                icon={<Shield />}
                onClick={handlePlayerDefend}
                fullWidth
              >
                Defend
              </Button>
              
              <Button
                variant="ghost"
                icon={<AlertTriangle />}
                onClick={handlePlayerFlee}
                fullWidth
              >
                Flee
              </Button>
            </div>
          </div>
        )}
        
        {/* Spell Menu Modal */}
        {showSpellMenu && (
          <SpellMenu
            character={character}
            onCastSpell={handleCastSpellLocal}
            onClose={() => setShowSpellMenu(false)}
          />
        )}

        {combatState === 'enemyTurn' && (
          <div className="combat-waiting">
            <h4>Enemy Turn</h4>
            <p className="flavor-text">{enemy.name} is attacking...</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEnemyTurn()}
            >
              [Skip Enemy Turn]
            </Button>
          </div>
        )}

        {combatState === 'victory' && (
          <div className="combat-result victory-result">
            <h2>🎉 Victory!</h2>
            <p>You defeated the {enemy.name}!</p>
            <p className="xp-award">+{enemy.xp} XP</p>
          </div>
        )}

        {combatState === 'defeat' && (
          <div className="combat-result defeat-result">
            <h2>💀 Defeated</h2>
            <p>You have fallen...</p>
          </div>
        )}
      </PaperContainer>
    </div>
  );
}

export default CombatUI;
