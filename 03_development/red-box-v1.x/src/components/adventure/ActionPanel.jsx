import React, { useState } from 'react';
import { Sword, Scroll, Package, ArrowRight, Bed, Sparkles } from 'lucide-react';
import { useCharacter } from '../../contexts/CharacterContext';
import { useAdventure } from '../../contexts/AdventureContext';
import { getTutorialMonster } from '../../data/tutorialAdventure';
import { getClassById } from '../../data/classes';
import { applyItemEffect } from '../../utils/items';
import { calculateModifier } from '../../utils/calculations';
import { rollDice } from '../../utils/dice';
import { hasSpellsAvailable } from '../../utils/spells';
import handleCastSpell from '../../utils/handleCastSpell';
import Button from '../common/Button';
import PaperContainer from '../common/PaperContainer';
import CombatUI from '../combat/CombatUI';
import ItemMenu from './ItemMenu';
import SpellMenu from '../combat/SpellMenu';
import soundManager from '../../utils/sound';
import './ActionPanel.css';

/**
 * ActionPanel - Shows current room status and available actions
 */
export function ActionPanel() {
  const { character, heal, removeItem, decrementItemQuantity, rest, useSpellSlot, addBuff } = useCharacter();
  
  const adventure = useAdventure();
  const { getCurrentRoom, enterRoom, addNarration } = adventure;
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [showSpellMenu, setShowSpellMenu] = useState(false);
  
  const currentRoom = getCurrentRoom();
  // Show all exits from the current room (player can see doors/passages)
  const availableExits = currentRoom.exits;
  
  // Check if room is cleared
  const monstersInRoom = currentRoom.contents.monsters || [];
  const monstersAlive = monstersInRoom.filter(mId => 
    !adventure.adventure.defeatedMonsters.includes(mId)
  );
  const roomCleared = monstersAlive.length === 0;
  
  // Handle item usage
  const handleUseItem = (item) => {
    // Close item menu
    setShowItemMenu(false);
    
    // Apply item effect
    const result = applyItemEffect(item, character, 'exploration');
    
    // Add narration
    addNarration('system_message', `You use ${item.name}.`);
    addNarration('dm_note', result.message);
    
    // Apply effects based on type
    switch (result.type) {
      case 'healing':
        heal(result.healAmount);
        addNarration('system_message', `Restored ${result.healAmount} HP!`);
        break;
        
      case 'light':
        // Actually light the torch/lantern
        adventure.lightTorch();
        addNarration('system_message', '🔥 Light source activated!');
        break;
        
      case 'utility':
      default:
        // Utility effects are narrative only
        break;
    }
    
    // Handle consumed items with quantity tracking
    if (result.consumed) {
      if (item.quantity !== undefined && item.quantity > 1) {
        // Decrement quantity
        decrementItemQuantity(item.id, 1);
      } else {
        // Remove item entirely
        removeItem(item.id);
      }
    }
  };
  
  // Handle spell casting in exploration
  const handleCastSpellLocal = (spellId) => {
    // Call shared handleCastSpell with exploration context (no enemy)
    handleCastSpell(spellId, {
      character,
      adventure,
      addNarration,
      heal,
      addBuff,
      useSpellSlot,
      setShowSpellMenu
    });
  };
  
  // Handle rest
  const handleRest = () => {
    // Calculate healing
    const conMod = calculateModifier(character.abilities.constitution);
    const healAmount = 4 + conMod;
    const actualHeal = Math.min(healAmount, character.hp.max - character.hp.current);
    
    // Rest character (restores HP and spell slots)
    rest();
    
    // Mark adventure as rested
    adventure.rest();
    
    // Add narration
    addNarration('system_message', 'You rest and recover your strength.');
    addNarration('dm_note', `You restore ${actualHeal} hit points and recover your spell slots. The dungeon remains quiet during your respite.`);
  };
  
  // Handle room movement with trap checking
  const handleMove = (targetRoomId) => {
    const currentRoom = getCurrentRoom();
    
    // Check for undetected traps in current room
    if (currentRoom.contents.traps && currentRoom.contents.traps.length > 0) {
      const trap = currentRoom.contents.traps[0];
      
      if (!trap.detected && !trap.triggered) {
        // Trigger the trap!
        trap.triggered = true;
        
        addNarration('system_message', '⚠️ A pit opens beneath your feet!');
        
        // Roll saving throw
        const saveRoll = rollDice(1, 20)[0];
        const saveTarget = 12; // Death Ray save for 1st level
        
        if (saveRoll >= saveTarget) {
          // Saved!
          addNarration('combat_action', `You leap aside at the last moment! (Rolled ${saveRoll}, needed ${saveTarget})`);
          addNarration('dm_note', 'Your quick reflexes saved you from falling into the pit.');
        } else {
          // Failed save - take damage
          const damage = rollDice(1, 6)[0];
          takeDamage(damage);
          addNarration('combat_action', `You fall into the pit! Take ${damage} damage! (Rolled ${saveRoll}, needed ${saveTarget})`);
          addNarration('dm_note', 'You tumble into the pit, landing hard on the stone floor below.');
        }
        
        // Still allow movement after trap
        setTimeout(() => {
          enterRoom(targetRoomId);
        }, 100);
        return;
      }
    }
    
    // No trap or trap already dealt with - move normally
    enterRoom(targetRoomId);
  };
  
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
                  style={{ width: `${(character.hp.current / character.hp.max) * 100}%` }}
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
          </div>
        </div>
        
        <div className="section-divider"></div>
        
        {/* Current Room */}
        <div className="current-room-info">
          <h4>Current Location</h4>
          <p className="room-name">{currentRoom.name}</p>
          
          {monstersAlive.length > 0 && (
            <div className="danger-warning">
              <Sword size={16} />
              <span>{monstersAlive.length} monster(s) present!</span>
            </div>
          )}
          
          {roomCleared && (
            <div className="cleared-notice">
              <span>✓ Room Cleared</span>
            </div>
          )}
        </div>
        
        <div className="section-divider"></div>
        
        {/* Combat Section */}
        {adventure.adventure.inCombat ? (
          <CombatUI enemy={getTutorialMonster(adventure.adventure.currentEnemy)} />
        ) : (
          <>
            {/* Available Actions */}
            <div className="available-actions">
              <h4>Available Actions</h4>
              
              {/* Movement */}
              {availableExits.length > 0 && (
                <div className="action-group">
                  <p className="action-group-label">Movement:</p>
                  {availableExits.map((exit, index) => (
                    <Button
                      key={index}
                      variant="primary"
                      size="sm"
                      icon={<ArrowRight />}
                      onClick={() => handleMove(exit.targetRoomId)}
                      fullWidth
                    >
                      Go {exit.direction}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Other Actions */}
              <div className="action-group">
                <p className="action-group-label">Other Actions:</p>
                
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Scroll />}
                  fullWidth
                  onClick={() => {
                    const room = getCurrentRoom();
                    
                    // Check for undetected traps
                    if (room.contents.traps && room.contents.traps.length > 0) {
                      const trap = room.contents.traps[0]; // First trap
                      
                      if (!trap.detected) {
                        // Determine detection chance based on class
                        const className = character.class; // character.class is already the string ID
                        let detectChance = trap.detectChance.default;
                        
                        if (className === 'dwarf' || className === 'thief') {
                          detectChance = trap.detectChance[className];
                        }
                        
                        // Apply darkness penalty if no light and no infravision
                        const classData = getClassById(character.class);
                        const hasInfravision = classData?.infravision > 0;
                        const hasLight = adventure.adventure.hasLight;
                        
                        if (!hasInfravision && !hasLight) {
                          // -4 penalty translates to reducing chance significantly
                          // For 1/6 chance (0.167), reduce to ~0.04
                          // For automatic (1.0), reduce to 0.6
                          detectChance = detectChance * 0.25; // 75% reduction
                          addNarration('dm_note', '⚠️ Searching in darkness is extremely difficult...');
                        }
                        
                        // Roll for detection
                        const roll = Math.random();
                        
                        if (roll < detectChance) {
                          // Detected!
                          trap.detected = true;
                          addNarration('system_message', '🔍 You discover a hidden pit trap!');
                          addNarration('dm_note', 'A concealed pit yawns before you. You carefully mark it to avoid falling in.');
                        } else {
                          if (!hasInfravision && !hasLight) {
                            addNarration('system_message', 'You fumble around in the darkness but find nothing.');
                          } else {
                            addNarration('system_message', 'You search carefully but find nothing unusual.');
                          }
                        }
                      } else {
                        addNarration('dm_note', 'You already know about the pit trap here.');
                      }
                    } else if (roomCleared) {
                      addNarration('system_message', 'You search the room carefully but find nothing of interest.');
                    } else {
                      addNarration('dm_note', 'You should deal with the danger here before searching...');
                    }
                  }}
                >
                  Search Room
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Package />}
                  fullWidth
                  onClick={() => setShowItemMenu(true)}
                >
                  Use Item
                </Button>
                
                {/* Cast Spell Button */}
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Sparkles />}
                  fullWidth
                  onClick={() => setShowSpellMenu(true)}
                >
                  Cast Spell
                </Button>
                
                {/* Rest Button - Only in exploration, once per adventure */}
                {!adventure.adventure.hasRested && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Bed />}
                    fullWidth
                    onClick={handleRest}
                  >
                    Rest (Once Per Adventure)
                  </Button>
                )}
                
                {/* Light Status - Show if light is active */}
                {adventure.adventure.hasLight && (
                  <div className="light-status">
                    🔥 Area is Lit
                  </div>
                )}
                
                {/* Darkness Warning - Show if no light and no infravision */}
                {(() => {
                  const classData = getClassById(character.class);
                  const hasInfravision = classData?.infravision > 0;
                  return !hasInfravision && !adventure.adventure.hasLight;
                })() && (
                  <div className="darkness-warning-exploration">
                    ⚠️ In Darkness (-4 attack, reduced search)
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Item Menu Modal */}
        {showItemMenu && (
          <ItemMenu
            character={character}
            onUseItem={handleUseItem}
            onClose={() => setShowItemMenu(false)}
            context="exploration"
          />
        )}
        
        {/* Spell Menu Modal */}
        {showSpellMenu && (
          <SpellMenu
            character={character}
            onCastSpell={handleCastSpellLocal}
            onClose={() => setShowSpellMenu(false)}
          />
        )}
        
        {/* Progress */}
        <div className="adventure-progress">
          <h4>Quest Progress</h4>
          <div className="progress-item">
            <span>Monsters Defeated:</span>
            <span className="number">{adventure.adventure.defeatedMonsters.length}/3</span>
          </div>
          <div className="progress-item">
            <span>Rooms Explored:</span>
            <span className="number">{adventure.adventure.visitedRooms.length}/5</span>
          </div>
        </div>
      </PaperContainer>
    </div>
  );
}

export default ActionPanel;
