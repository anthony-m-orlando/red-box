/**
 * CombatUI.jsx
 * Turn-based combat interface
 *
 * Patched for Sprint 3 AdventureContext:
 *   adventure.adventure.hasLight      → dungeonState.hasLight
 *   adventure.adventure.previousRoomId→ dungeonState.previousRoomId
 *   adventure.dispatch('SET_DEFEAT')  → adventure.dispatch(ACTIONS.SET_DEFEATED)
 *   addNarration(style, text)         → addNarration(text, style)  [now auto-detected]
 *   endCombat(true, enemy.id)         → endCombat(true)
 *
 * New props (from DungeonScreen):
 *   onVictory(instanceId, xp) — called when enemy is defeated
 *   onDefeat()                — called when player is defeated
 * Both are optional — if not passed, falls back to context dispatch (legacy path)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Swords, Shield, AlertTriangle, Sparkles, Package } from 'lucide-react';
import { useCharacter }   from '../../contexts/CharacterContext';
import { useAdventure }   from '../../contexts/AdventureContext';
import { getClassById }   from '../../data/classes';
import {
  rollAttack, rollDamage, rollInitiative, checkMorale,
  applyStrengthDamage, getStrengthAttackBonus,
} from '../../utils/combat';
import soundManager    from '../../utils/sound';
import handleCastSpell from '../../utils/handleCastSpell';
import { applySpellEffect } from '../../utils/spells';
import { applyItemEffect }  from '../../utils/items';
import { generateTreasure, formatTreasureMessage } from '../../utils/treasure';
import Button          from '../common/Button';
import PaperContainer  from '../common/PaperContainer';
import SpellMenu       from './SpellMenu';
import ItemMenu        from '../adventure/ItemMenu';
import './CombatUI.css';

export function CombatUI({ enemy, onVictory, onDefeat }) {
  const {
    character, takeDamage, heal, addXP, updateGold,
    useSpellSlot, addItem, addBuff, decrementBuffDurations,
    removeItem, decrementItemQuantity, setEquipment,
  } = useCharacter();

  const adventure = useAdventure();
  const { endCombat, addNarration, enterRoom, dungeonState, ACTIONS } = adventure;

  // ── Read from dungeonState (Sprint 3 shape) ────────────────────────────
  const hasLight      = dungeonState?.hasLight      ?? true;
  const previousRoomId = dungeonState?.previousRoomId ?? null;

  const [combatState,     setCombatState]     = useState('initiative');
  const [enemyHP,         setEnemyHP]         = useState(typeof enemy.hp === 'object' ? enemy.hp.current : enemy.hp);
  const [round,           setRound]           = useState(1);
  const [combatLog,       setCombatLog]       = useState([]);
  const [showSpellMenu,   setShowSpellMenu]   = useState(false);
  const [showItemMenu,    setShowItemMenu]    = useState(false);
  const [enemyConditions, setEnemyConditions] = useState([]);
  const hasInitialized = useRef(false);

  // Use item — free action (doesn't spend the turn)
  const handleUseItem = (item) => {
    setShowItemMenu(false);
    const result = applyItemEffect(item, character, 'combat');
    addNarration(`You use ${item.name}. ${result.message}`, 'action');
    if (result.type === 'healing') {
      heal(result.healAmount);
      addLogEntry(`💊 ${item.name} restores ${result.healAmount} HP!`);
    }
    if (result.type === 'equipment') {
      setEquipment(result.equipment);
      addLogEntry(`🛡️ Equipped ${item.name}.`);
    }
    if (result.consumed) {
      if (item.quantity !== undefined && item.quantity > 1) decrementItemQuantity(item.id, 1);
      else removeItem(item.id);
    }
    // Free action — do NOT advance to enemy turn
  };

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Reset combat state when a new enemy is encountered (multi-enemy rooms)
  // This ensures CombatUI doesn't get stuck on a victory message when moving
  // to the next enemy in a room with multiple creatures.
  useEffect(() => {
    if (hasInitialized.current) {
      // Reset for the next enemy in a multi-enemy combat scenario
      setEnemyHP(typeof enemy.hp === 'object' ? enemy.hp.current : enemy.hp);
      setCombatState('initiative');
      setRound(1);
      setCombatLog([]);
      setEnemyConditions([]);
      hasInitialized.current = false;
      return;
    }
  }, [enemy.id, enemy.instanceId]);

  // Roll initiative once per enemy
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const pInit = rollInitiative();
    const eInit = rollInitiative();

    addLogEntry(`Combat begins! Rolling initiative...`);
    addLogEntry(`You rolled ${pInit}, ${enemy.name} rolled ${eInit}`);

    if (pInit > eInit) {
      addLogEntry('You go first!');
      setCombatState('playerTurn');
    } else if (eInit > pInit) {
      addLogEntry(`${enemy.name} goes first!`);
      setTimeout(() => setCombatState('enemyTurn'), 1000);
    } else {
      addLogEntry('Tied initiative! You go first.');
      setCombatState('playerTurn');
    }
  }, [enemy.id, enemy.instanceId]);

  // Victory / defeat watchers
  useEffect(() => {
    if (enemyHP <= 0 && combatState !== 'victory') handleVictory();
  }, [enemyHP]);

  useEffect(() => {
    if (character.hp.current <= 0 && combatState !== 'defeat') handleDefeat();
  }, [character.hp.current]);

  // Auto-execute enemy turn
  useEffect(() => {
    if (combatState === 'enemyTurn' && enemyHP > 0) {
      const t = setTimeout(handleEnemyTurn, 1500);
      return () => clearTimeout(t);
    }
  }, [combatState]);

  // Decrement buff durations each round
  useEffect(() => {
    if (combatState === 'playerTurn' && round > 1) decrementBuffDurations();
  }, [round, combatState]);

  const addLogEntry = (message) => {
    setCombatLog(prev => [...prev, { id: Date.now() + Math.random(), text: message }]);
  };

  const getEffectiveAC = () => {
    let ac = character.ac;
    character.activeBuffs?.forEach(b => { if (b.stat === 'ac') ac -= b.bonus; });
    return ac;
  };

  // ── Player actions ────────────────────────────────────────────────────

  const handlePlayerAttack = () => {
    const classData = getClassById(character.class);
    const hasInfravision = classData?.infravision > 0;
    const darknessPenalty = (!hasInfravision && !hasLight) ? -4 : 0;

    const attackBonus = getStrengthAttackBonus(character.abilities.strength) + darknessPenalty;
    const attackRoll  = rollAttack(character.thac0, enemy.ac, attackBonus);

    if (darknessPenalty < 0) addLogEntry('⚠️ Fighting in darkness! (-4 to hit)');

    if (attackRoll.hit) {
      let damage = rollDamage('1d8');
      damage = applyStrengthDamage(damage, character.abilities.strength);
      soundManager.play('hit');

      if (attackRoll.critical) {
        damage *= 2;
        addLogEntry(`⚔️ CRITICAL HIT! You strike ${enemy.name} for ${damage} damage!`);
        addNarration(`Critical hit on the ${enemy.name} for ${damage} damage!`, 'combat');
      } else {
        addLogEntry(`⚔️ You hit ${enemy.name} for ${damage} damage!`);
        addNarration(`You hit the ${enemy.name} for ${damage} damage!`, 'combat');
      }
      setEnemyHP(prev => Math.max(0, prev - damage));

      if (enemyConditions.includes('asleep')) {
        setEnemyConditions(c => c.filter(x => x !== 'asleep'));
        addLogEntry(`The ${enemy.name} wakes up!`);
        addNarration(`The ${enemy.name} is jolted awake by your attack!`, 'combat');
      }
    } else {
      soundManager.play('miss');
      if (attackRoll.fumble) {
        addLogEntry('💥 FUMBLE! Your attack goes wild!');
        addNarration('Your attack misses wildly!', 'combat');
      } else {
        addLogEntry('⚔️ Your attack misses!');
        addNarration('Your attack misses.', 'combat');
      }
    }
    setCombatState('enemyTurn');
  };

  const handlePlayerDefend = () => {
    addLogEntry('🛡️ You take a defensive stance! (AC improved)');
    addNarration('You defend, improving your armor class.', 'combat');
    setCombatState('enemyTurn');
    setTimeout(handleEnemyTurn, 1500);
  };

  const handlePlayerFlee = () => {
    if (Math.random() > 0.5) {
      addLogEntry('🏃 You successfully flee from combat!');
      addNarration('You flee from the battle!', 'combat');
      if (previousRoomId) {
        addNarration('You retreat to the previous room.', 'system');
        endCombat(false);
        setTimeout(() => enterRoom(previousRoomId), 500);
      } else {
        endCombat(false);
      }
    } else {
      addLogEntry(`🏃 You fail to escape! ${enemy.name} gets a free attack!`);
      addNarration('Failed to flee!', 'combat');
      setCombatState('enemyTurn');
      setTimeout(handleEnemyTurn, 1000);
    }
  };

  const handleCastSpellLocal = (spellId) => {
    handleCastSpell(spellId, {
      character, enemy, enemyHP, setEnemyHP,
      enemyConditions, setEnemyConditions,
      round, adventure, addLogEntry, addNarration,
      heal, addBuff, useSpellSlot, setCombatState, setShowSpellMenu,
    });
  };

  // ── Enemy turn ────────────────────────────────────────────────────────

  const handleEnemyTurn = () => {
    if (combatState !== 'enemyTurn') return;
    if (enemyHP <= 0 || character.hp.current <= 0) return;

    if (enemyConditions.includes('asleep')) {
      addLogEntry(`💤 The ${enemy.name} is fast asleep...`);
      addNarration(`The ${enemy.name} slumbers peacefully.`, 'combat');
      setRound(r => r + 1);
      setCombatState('playerTurn');
      return;
    }

    if (enemyHP < (enemy.maxHp || enemy.hp?.max || 1) * 0.25 && checkMorale(enemy.morale || 9)) {
      addLogEntry(`${enemy.name} flees in terror!`);
      addNarration(`The ${enemy.name} flees!`, 'combat');
      handleVictory();
      return;
    }

    const attackRoll = rollAttack(enemy.thac0, getEffectiveAC());
    if (attackRoll.hit) {
      const damage = rollDamage(enemy.damage || '1d6');
      if (attackRoll.critical) {
        const critDmg = damage * 2;
        addLogEntry(`💀 CRITICAL! ${enemy.name} hits you for ${critDmg} damage!`);
        addNarration(`The ${enemy.name} scores a critical hit for ${critDmg} damage!`, 'combat');
        takeDamage(critDmg);
      } else {
        addLogEntry(`💢 ${enemy.name} hits you for ${damage} damage!`);
        addNarration(`The ${enemy.name} hits you for ${damage} damage!`, 'combat');
        takeDamage(damage);
      }
    } else {
      if (attackRoll.fumble) {
        addLogEntry(`${enemy.name} fumbles its attack!`);
        addNarration(`The ${enemy.name} attacks wildly and misses!`, 'combat');
      } else {
        addLogEntry(`${enemy.name} misses!`);
        addNarration(`The ${enemy.name}'s attack misses.`, 'combat');
      }
    }

    setTimeout(() => {
      if (character.hp.current > 0 && enemyHP > 0) {
        setRound(r => r + 1);
        setCombatState('playerTurn');
      }
    }, 500);
  };

  // ── Outcomes ──────────────────────────────────────────────────────────

  const handleVictory = () => {
    setCombatState('victory');
    soundManager.play('victory');
    addLogEntry(`🎉 Victory! ${enemy.name} is defeated!`);

    addXP(enemy.xp);
    addLogEntry(`You gain ${enemy.xp} XP!`);

    const treasure = generateTreasure(enemy.id, enemy.type);
    if (treasure.gold > 0) {
      updateGold(treasure.gold);
      addLogEntry(`💰 Found ${treasure.gold} gold pieces!`);
    }
    treasure.items?.forEach(item => {
      addItem(item);
      addLogEntry(`📦 Found: ${item.name}!`);
    });

    addNarration(enemy.defeatedText || `The ${enemy.name} falls defeated!`, 'system');
    addNarration(`You gain ${enemy.xp} experience points!`, 'system');
    if (treasure.gold > 0 || treasure.items?.length > 0) {
      addNarration(`You search the body and find:\n${formatTreasureMessage(treasure)}`, 'dm');
    } else {
      addNarration('You search the body but find nothing of value.', 'dm');
    }

    setTimeout(() => {
      // Prefer the onVictory prop (DungeonScreen path)
      if (onVictory) {
        onVictory(enemy.instanceId ?? enemy.id, enemy.xp);
      } else {
        endCombat(true);
      }
    }, 3000);
  };

  const handleDefeat = () => {
    setCombatState('defeat');
    soundManager.play('defeat');
    addLogEntry('💀 You have been defeated!');
    addNarration('You fall unconscious…', 'danger');

    setTimeout(() => {
      if (onDefeat) {
        onDefeat();
      } else {
        adventure.dispatch({ type: ACTIONS?.SET_DEFEATED ?? 'SET_DEFEAT' });
      }
    }, 2000);
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="combat-ui">
      <PaperContainer variant="aged" padding="lg" className="combat-container">

        {/* Enemy status */}
        <div className="enemy-status">
          <h3>{enemy.name} {enemyConditions.includes('asleep') && '💤'}</h3>
          <div className="enemy-hp-bar">
            <div className="enemy-hp-fill"
              style={{ width: `${(enemyHP / (enemy.maxHp || enemy.hp?.max || 1)) * 100}%` }} />
            <span className="enemy-hp-text number">{enemyHP}/{enemy.maxHp || enemy.hp?.max || 1} HP</span>
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

          <div className="combat-equipment-summary">
            <span className="equipment-chip">
              ⚔ {character.weapon || 'None'}{character.weaponTwoHanded ? ' (2H)' : ''}
            </span>
            <span className="equipment-chip">
              🛡 {character.armor || 'None'}
            </span>
            <span className="equipment-chip">
              ⛨ {character.shield || 'None'}
            </span>
            <span className="equipment-chip equipment-ac">
              🧮 AC: {getEffectiveAC()}
            </span>
          </div>
        </div>

        <div className="combat-divider" />

        {/* Combat log */}
        <div className="combat-log">
          <h4>Round {round}</h4>
          <div className="log-entries">
            {combatLog.slice(-6).map(entry => (
              <div key={entry.id} className="log-entry">{entry.text}</div>
            ))}
          </div>
        </div>

        <div className="combat-divider" />

        {/* Active buffs */}
        {character.activeBuffs?.length > 0 && (
          <div className="active-buffs">
            <h4>Active Effects</h4>
            <div className="buff-list">
              {character.activeBuffs.map((buff, i) => (
                <div key={i} className="buff-indicator">
                  <Shield size={14} />
                  <span className="buff-name">
                    {buff.spellId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="buff-effect">
                    {buff.bonus > 0 ? '+' : ''}{buff.bonus} {buff.stat.toUpperCase()}
                  </span>
                  <span className="buff-duration">({buff.duration} {buff.duration === 1 ? 'turn' : 'turns'})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player turn actions */}
        {combatState === 'playerTurn' && (
          <div className="combat-actions">
            <h4>Your Turn</h4>
            <div className="action-buttons">
              <Button variant="primary" size="md" icon={<Swords size={16} />} onClick={handlePlayerAttack} fullWidth>
                Attack
              </Button>
              <Button variant="secondary" size="md" icon={<Shield size={16} />} onClick={handlePlayerDefend} fullWidth>
                Defend
              </Button>
              <Button variant="secondary" size="md" icon={<Sparkles size={16} />} onClick={() => setShowSpellMenu(true)} fullWidth>
                Cast Spell
              </Button>
              <Button variant="secondary" size="sm" icon={<Package size={14} />} onClick={() => setShowItemMenu(true)} fullWidth>
                Inventory
              </Button>
              <Button variant="ghost" size="sm" icon={<AlertTriangle size={14} />} onClick={handlePlayerFlee} fullWidth>
                Flee
              </Button>
            </div>
          </div>
        )}

        {showSpellMenu && (
          <SpellMenu
            character={character}
            onCastSpell={handleCastSpellLocal}
            onClose={() => setShowSpellMenu(false)}
          />
        )}

        {showItemMenu && (
          <ItemMenu
            character={character}
            onUseItem={handleUseItem}
            onClose={() => setShowItemMenu(false)}
            context="combat"
          />
        )}

        {combatState === 'enemyTurn' && (
          <div className="combat-waiting">
            <h4>Enemy Turn</h4>
            <p className="flavor-text">{enemy.name} is attacking…</p>
            <Button variant="ghost" size="sm" onClick={handleEnemyTurn}>
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
            <p>You have fallen…</p>
          </div>
        )}

      </PaperContainer>
    </div>
  );
}

export default CombatUI;
