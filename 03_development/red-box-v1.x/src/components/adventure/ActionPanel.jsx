/**
 * ActionPanel.jsx
 * Exploration + combat action panel — used by legacy AdventureScreen
 *
 * Patched for Sprint 3 AdventureContext shape.
 *
 * OLD (broken) references → NEW (fixed) references:
 *   adventure.adventure.defeatedMonsters  → dungeonState.defeatedMonsters
 *   adventure.adventure.inCombat          → dungeonState.inCombat
 *   adventure.adventure.currentEnemy      → dungeonState.currentEnemy
 *   adventure.adventure.hasRested         → dungeonState.hasRested
 *   adventure.adventure.visitedRooms      → dungeonState.visitedRooms?.[1]
 *   adventure.adventure.hasLight          → dungeonState.hasLight
 *
 * addNarration(style, text) → addNarration(text, style)  [Sprint 3 arg order]
 */

import React, { useState } from 'react';
import { Shield, Sword, Scroll, Package, ArrowRight, Bed, Sparkles } from 'lucide-react';
import { useCharacter }    from '../../contexts/CharacterContext';
import { useAdventure }    from '../../contexts/AdventureContext';
import { getTutorialMonster } from '../../data/tutorialAdventure';
import { getClassById }    from '../../data/classes';
import { applyItemEffect } from '../../utils/items';
import { calculateModifier } from '../../utils/calculations';
import { rollDice }        from '../../utils/dice';
import handleCastSpell     from '../../utils/handleCastSpell';
import Button              from '../common/Button';
import PaperContainer      from '../common/PaperContainer';
import CombatUI            from '../combat/CombatUI';
import ItemMenu            from './ItemMenu';
import SpellMenu           from '../combat/SpellMenu';
import soundManager        from '../../utils/sound';
import './ActionPanel.css';

export function ActionPanel() {
  const {
    character,
    heal,
    takeDamage,
    removeItem,
    decrementItemQuantity,
    rest,
    useSpellSlot,
    addBuff,
    setEquipment,
  } = useCharacter();

  const adventure = useAdventure();
  const { dungeonState, getCurrentRoom, enterRoom, addNarration } = adventure;

  const [showItemMenu,  setShowItemMenu]  = useState(false);
  const [showSpellMenu, setShowSpellMenu] = useState(false);

  // ── Read from dungeonState (Sprint 3 canonical location) ─────────────────
  const defeatedMonsters = dungeonState?.defeatedMonsters  ?? [];
  const inCombat         = dungeonState?.inCombat          ?? false;
  const currentEnemy     = dungeonState?.currentEnemy      ?? null;
  const hasRested        = dungeonState?.hasRested         ?? false;
  const hasLight         = dungeonState?.hasLight          ?? false;
  const visitedRooms     = dungeonState?.visitedRooms?.[1] ?? [];

  // ── Room data ─────────────────────────────────────────────────────────────
  const currentRoom    = getCurrentRoom();
  const availableExits = currentRoom?.exits ?? [];

  const monstersInRoom = currentRoom?.contents?.monsters ?? [];
  const monstersAlive  = monstersInRoom.filter(mId => !defeatedMonsters.includes(mId));
  const roomCleared    = monstersAlive.length === 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleMove = (targetRoomId) => {
    if (!currentRoom) return;

    // Check for undetected, untriggered traps
    const traps = currentRoom.contents?.traps ?? [];
    if (traps.length > 0) {
      const trap = traps[0];
      if (!trap.detected && !trap.triggered) {
        trap.triggered = true;
        addNarration('⚠️ A pit opens beneath your feet!', 'system');
        const saveRoll   = rollDice(1, 20)[0];
        const saveTarget = 12;
        if (saveRoll >= saveTarget) {
          addNarration(`You leap aside at the last moment! (Rolled ${saveRoll}, needed ${saveTarget})`, 'combat');
          addNarration('Your quick reflexes saved you from falling into the pit.', 'dm');
        } else {
          const damage = rollDice(1, 6)[0];
          takeDamage(damage);
          addNarration(`You fall into the pit! Take ${damage} damage! (Rolled ${saveRoll}, needed ${saveTarget})`, 'combat');
          addNarration('You tumble into the pit, landing hard on the stone floor below.', 'dm');
        }
        setTimeout(() => enterRoom(targetRoomId), 100);
        return;
      }
    }
    enterRoom(targetRoomId);
  };

  const handleUseItem = (item) => {
    setShowItemMenu(false);
    const result = applyItemEffect(item, character, 'exploration');
    addNarration(`You use ${item.name}. ${result.message}`, 'action');
    switch (result.type) {
      case 'healing':
        heal(result.healAmount);
        addNarration(`Restored ${result.healAmount} HP!`, 'system');
        break;
      case 'light':
        adventure.lightNewSource?.('torch');
        addNarration('Light source activated!', 'system');
        break;
      case 'equipment':
        setEquipment(result.equipment);
        addNarration(`You equip ${item.name}.`, 'system');
        break;
      default:
        break;
    }
    if (result.consumed) {
      if (item.quantity !== undefined && item.quantity > 1) decrementItemQuantity(item.id, 1);
      else removeItem(item.id);
    }
  };

  const handleCastSpellLocal = (spellId) => {
    handleCastSpell(spellId, {
      character,
      adventure,
      addNarration: (style, text) => addNarration(text, style),
      heal,
      addBuff,
      useSpellSlot,
      setShowSpellMenu,
    });
  };

  const handleRest = () => {
    const conMod     = calculateModifier(character.abilities.constitution);
    const healAmount = 4 + conMod;
    const actualHeal = Math.min(healAmount, character.hp.max - character.hp.current);
    rest();
    adventure.rest?.(character, (amount) => heal(amount));
    addNarration('You rest and recover your strength.', 'system');
    addNarration(`You restore ${actualHeal} hit points and recover your spell slots.`, 'dm');
  };

  // Enemy object for CombatUI — resolve from tutorial bestiary
  const enemyObj = currentEnemy ? getTutorialMonster(currentEnemy) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="action-panel">
      <PaperContainer variant="cream" padding="lg" className="action-container">

        {/* Character Status */}
        <div className="character-status">
          <h3>{character.name}</h3>
          <div className="status-bars">
            <div className="status-item">
              <span className="status-label">HP:</span>
              <div className="hp-bar">
                <div
                  className="hp-fill"
                  style={{ width: `${Math.max(0, (character.hp.current / character.hp.max) * 100)}%` }}
                />
                <span className="hp-text number">
                  {character.hp.current}/{character.hp.max}
                </span>
              </div>
            </div>
            <div className="status-row">
              <div className="status-compact">
                <span className="status-label">AC:</span>
                <span className="number">{character.ac}</span>
              </div>
              <div className="status-compact">
                <span className="status-label">Gold:</span>
                <span className="number">{character.gold}</span>
              </div>
            </div>
            <div className="status-row status-equipment">
              <div className="status-compact">
                <span className="status-label">Weapon:</span>
                <span className="number">
                  {character.weapon || 'None'}{character.weaponTwoHanded ? ' (2H)' : ''}
                </span>
              </div>
              <div className="status-compact">
                <span className="status-label">Armor:</span>
                <span className="number">{character.armor || 'None'}</span>
              </div>
              <div className="status-compact">
                <span className="status-label">Shield:</span>
                <span className="number">{character.shield || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Current Room */}
        <div className="current-room-info">
          <h4>Current Location</h4>
          <p className="room-name">{currentRoom?.name ?? '—'}</p>
          {monstersAlive.length > 0 && (
            <div className="danger-warning">
              <Sword size={16} aria-hidden="true" />
              <span>{monstersAlive.length} monster(s) present!</span>
            </div>
          )}
          {roomCleared && (
            <div className="cleared-notice"><span>✓ Room Cleared</span></div>
          )}
        </div>

        <div className="section-divider" />

        {/* Combat / Exploration toggle */}
        {inCombat && enemyObj ? (
          <CombatUI enemy={enemyObj} />
        ) : (
          <>
            {/* Movement */}
            {availableExits.length > 0 && (
              <div className="action-group">
                <p className="action-group-label">Movement:</p>
                {availableExits.map((exit, i) => (
                  <Button
                    key={i}
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight size={14} />}
                    onClick={() => handleMove(exit.targetRoomId)}
                    fullWidth
                  >
                    Go {exit.direction}
                  </Button>
                ))}
              </div>
            )}

            {/* Other actions */}
            <div className="action-group">
              <p className="action-group-label">Other Actions:</p>

              {/* Search */}
              <Button
                variant="secondary"
                size="sm"
                icon={<Scroll size={14} />}
                fullWidth
                onClick={() => {
                  if (!roomCleared) {
                    addNarration('Deal with the danger here before searching…', 'dm');
                  } else {
                    addNarration('You search the room carefully but find nothing of interest.', 'system');
                  }
                }}
              >
                Search Room
              </Button>

              {/* Inventory */}
              <Button
                variant="secondary"
                size="sm"
                icon={<Package size={14} />}
                fullWidth
                onClick={() => setShowItemMenu(true)}
              >
                Inventory
              </Button>

              {/* Cast Spell */}
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={14} />}
                fullWidth
                onClick={() => setShowSpellMenu(true)}
              >
                Cast Spell
              </Button>

              {/* Rest */}
              {!inCombat && !hasRested && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Bed size={14} />}
                  fullWidth
                  onClick={handleRest}
                >
                  Rest (Once Per Adventure)
                </Button>
              )}

              {/* Light status */}
              {hasLight && (
                <div className="light-status">🔥 Area is Lit</div>
              )}
              {!hasLight && (() => {
                const classData = getClassById(character.class);
                return !(classData?.infravision > 0);
              })() && (
                <div className="darkness-warning-exploration">
                  ⚠️ In Darkness (−4 attack, reduced search)
                </div>
              )}
            </div>

            {/* Item / Spell modals */}
            {showItemMenu && (
              <ItemMenu
                character={character}
                onUseItem={handleUseItem}
                onClose={() => setShowItemMenu(false)}
                context="exploration"
              />
            )}
            {showSpellMenu && (
              <SpellMenu
                character={character}
                onCastSpell={handleCastSpellLocal}
                onClose={() => setShowSpellMenu(false)}
              />
            )}

            {/* Quest progress */}
            <div className="adventure-progress">
              <h4>Quest Progress</h4>
              <div className="progress-item">
                <span>Monsters Defeated:</span>
                <span className="number">{defeatedMonsters.length}/3</span>
              </div>
              <div className="progress-item">
                <span>Rooms Explored:</span>
                <span className="number">{visitedRooms.length}/5</span>
              </div>
            </div>
          </>
        )}

      </PaperContainer>
    </div>
  );
}

export default ActionPanel;
