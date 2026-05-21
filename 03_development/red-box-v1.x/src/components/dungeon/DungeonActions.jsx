/**
 * DungeonActions.jsx
 * Exploration Action Panel for B1 Dungeon
 *
 * Renders the right-column panel during exploration (non-combat).
 * During combat, DungeonScreen swaps this out for CombatUI.
 *
 * Sections (top to bottom):
 *   1. Character status bar (HP, AC, gold, light)
 *   2. Current room info (name, number, state badge)
 *   3. Movement — one button per visible exit
 *   4. Exploration actions — Search, Rest, Use Item, Cast Spell
 *   5. Treasure collection (when uncollected treasure present)
 *   6. Special room features (shrine, spring, stair prompt)
 *   7. Quest stats (rooms visited, monsters defeated)
 *
 * Props:
 *   currentRoom       {object|null}
 *   livingMonsters    {object[]}
 *   treasure          {object[]}    — uncollected treasure items
 *   visibleExits      {object[]}
 *   character         {object}      — from CharacterContext
 *   onCollectTreasure {function}    — (treasureObj) => void
 */

import React, { useState, useCallback } from 'react';
import {
  ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Search, Bed, Package, Sparkles,
  Coins, Star, AlertTriangle, CheckCircle,
  ChevronDown, ChevronRight,
} from 'lucide-react';

import { useCharacter }  from '../../contexts/CharacterContext';
import { useAdventure }  from '../../contexts/AdventureContext';

import Button         from '../common/Button';
import ItemMenu       from '../adventure/ItemMenu';
import SpellMenu      from '../combat/SpellMenu';
import handleCastSpell from '../../utils/handleCastSpell';
import { applyItemEffect } from '../../utils/items';

import './DungeonActions.css';

// ─────────────────────────────────────────────────────────────────────────────
// Direction icon map
// ─────────────────────────────────────────────────────────────────────────────

const DIR_ICONS = {
  north: <ArrowUp    size={14} aria-hidden="true" />,
  south: <ArrowDown  size={14} aria-hidden="true" />,
  east:  <ArrowRight size={14} aria-hidden="true" />,
  west:  <ArrowLeft  size={14} aria-hidden="true" />,
  up:    <ArrowUp    size={14} aria-hidden="true" />,
  down:  <ArrowDown  size={14} aria-hidden="true" />,
};

const DIR_LABEL = {
  north: 'North', south: 'South', east: 'East', west: 'West',
  up: 'Up (stairs)', down: 'Down (stairs)',
};

// ─────────────────────────────────────────────────────────────────────────────
// DungeonActions
// ─────────────────────────────────────────────────────────────────────────────

export function DungeonActions({
  currentRoom,
  livingMonsters = [],
  treasure = [],
  visibleExits = [],
  character,
  onCollectTreasure,
}) {
  const { heal, removeItem, decrementItemQuantity, rest: charRest,
          useSpellSlot, addBuff, addXP, updateGold, setEquipment } = useCharacter();

  const adventure = useAdventure();
  const {
    dungeonState,
    enterRoom,
    descendStairs,
    ascendStairs,
    searchRoom,
    rest,
    addNarration,
    lightNewSource,
    getModule,
    startCombat,
  } = adventure;

  const {
    currentLevel,
    hasLight,
    hasRested,
    inCombat,
    searchedRooms,
    defeatedMonsters,
    visitedRooms,
    revealedFeatures,
  } = dungeonState;

  // ── Local state ───────────────────────────────────────────────────────────
  const [showItemMenu,  setShowItemMenu]  = useState(false);
  const [showSpellMenu, setShowSpellMenu] = useState(false);

  const roomCleared    = livingMonsters.length === 0;
  const alreadySearched = (searchedRooms || []).includes(currentRoom?.id);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Movement
  const handleMove = useCallback((exit) => {
    if (inCombat) return;
    if (exit.doorType === 'stair' || exit.isStair) {
      if (exit.direction === 'down') {
        descendStairs({ targetLevel: exit.targetLevel, targetRoomId: exit.targetRoomId });
      } else {
        ascendStairs({ targetLevel: exit.targetLevel, targetRoomId: exit.targetRoomId });
      }
      return;
    }
    // Guard: don't walk into a room that has uncleared monsters without confronting them
    // (The engine's canEnterRoom handles the real gate; this is just UX feedback)
    enterRoom(exit.targetRoomId, exit.targetLevel ?? currentLevel);
  }, [inCombat, enterRoom, descendStairs, ascendStairs, currentLevel]);

  // Search
  const handleSearch = useCallback(() => {
    if (inCombat) return;
    searchRoom(character);
  }, [inCombat, searchRoom, character]);

  // Rest
  const handleRest = useCallback(() => {
    if (inCombat) return;
    rest(character, (amount) => heal(amount));
  }, [inCombat, rest, character, heal]);

  // Item usage
  const handleUseItem = useCallback((item) => {
    setShowItemMenu(false);
    const result = applyItemEffect(item, character, 'exploration');
    addNarration(`You use ${item.name}. ${result.message}`, 'action');
    if (result.type === 'healing') heal(result.healAmount);
    if (result.type === 'light')   lightNewSource('torch');
    if (result.type === 'equipment') setEquipment(result.equipment);
    if (result.removeOnUse)        removeItem(item.id);
    else                           decrementItemQuantity(item.id);
  }, [character, addNarration, heal, lightNewSource, removeItem, decrementItemQuantity, setEquipment]);

  // Spell casting (delegates to shared handleCastSpell util)
  const handleCastSpellLocal = useCallback((spellId) => {
    handleCastSpell(spellId, {
      character,
      enemy: null,             // exploration context — no enemy
      enemyHP: 0,
      setEnemyHP: () => {},
      enemyConditions: [],
      setEnemyConditions: () => {},
      round: 0,
      adventure,
      addLogEntry: (text) => addNarration(text, 'action'),
      addNarration: (style, text) => addNarration(text, style),
      heal,
      addBuff,
      useSpellSlot,
      setCombatState: () => {},
      setShowSpellMenu,
    });
  }, [character, adventure, addNarration, heal, addBuff, useSpellSlot]);

  // Fight monsters in current room
  const handleFight = useCallback(() => {
    if (!livingMonsters.length) return;
    startCombat(livingMonsters[0]);
  }, [livingMonsters, startCombat]);

  // Collect treasure
  const handleCollect = useCallback((treasureObj) => {
    onCollectTreasure(treasureObj);
  }, [onCollectTreasure]);

  // Use special feature
  const handleFeature = useCallback((feature) => {
    adventure.dispatch({
      type: adventure.ACTIONS.USE_FEATURE,
      payload: { featureId: feature.id, narration: feature.description },
    });

    // Shrine: restore one lost spell slot
    if (feature.clerical && character.spellSlots) {
      addNarration(
        'You pray at the shrine. The gods favour you — a spell slot is restored.',
        'dm'
      );
    }
    // Healing spring: restore 1d6+1 HP, usable once
    if (feature.restorative && !(revealedFeatures || []).includes(feature.id)) {
      const restored = Math.floor(Math.random() * 6) + 2;  // 1d6+1
      heal(restored);
      addNarration(
        `The spring's water restores ${restored} hit points. The magic fades — it won't work again.`,
        'dm'
      );
    }
  }, [adventure, character, addNarration, heal, revealedFeatures]);

  // ── Derived room feature list ─────────────────────────────────────────────
  const mod = getModule();
  const specialFeatures = currentRoom?.contents?.features?.filter(f =>
    f.interactive || f.clerical || f.restorative
  ) || [];

  const roomState = currentRoom ? dungeonState.roomStates?.[currentLevel]?.[currentRoom.id] : 'unexplored';
  const hasTrap   = (currentRoom?.contents?.traps || []).some(
    t => !(dungeonState.triggeredTraps || []).includes(t.id)
  );
  const detectedTrap = (currentRoom?.contents?.traps || []).find(
    t => (dungeonState.detectedTraps || []).includes(t.id)
  );

  // ── Stats for quest progress ──────────────────────────────────────────────
  const totalRooms   = mod ? (Object.keys(mod.rooms?.[1] || {}).length + Object.keys(mod.rooms?.[2] || {}).length) : 0;
  const visitedCount = ((visitedRooms?.[1] || []).length + (visitedRooms?.[2] || []).length);
  const defeatedCount = (defeatedMonsters || []).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dungeon-actions">

      {/* ── 2. Room info ─────────────────────────────────────────────────── */}
      {currentRoom && (
        <>
          <div className="dungeon-actions__room-info">
            <span className="room-info__number">Room {currentRoom.number}</span>
            <span className="room-info__name">{currentRoom.label || currentRoom.name}</span>
            <RoomStateBadge state={roomState} />
          </div>
          <div className="dungeon-actions__equipment-summary">
            <span className="equipment-chip">
              ⚔ {character.weapon || 'None'}{character.weaponTwoHanded ? ' (2H)' : ''}
            </span>
            <span className="equipment-chip">
              🛡 {character.armor || 'None'}
            </span>
            <span className="equipment-chip">
              ⛨ {character.shield || 'None'}
            </span>
          </div>
        </>
      )}

      {/* ── Danger / trap warnings ───────────────────────────────────────── */}
      {livingMonsters.length > 0 && (
        <div className="dungeon-actions__warning dungeon-actions__warning--danger">
          <AlertTriangle size={13} aria-hidden="true" />
          <span>
            {livingMonsters.length === 1
              ? `A ${livingMonsters[0].name} is here!`
              : `${livingMonsters.length} monsters present!`}
          </span>
        </div>
      )}
      {detectedTrap && (
        <div className="dungeon-actions__warning dungeon-actions__warning--trap">
          <AlertTriangle size={13} aria-hidden="true" />
          <span>Trap detected: {detectedTrap.description}</span>
        </div>
      )}
      {!hasLight && (
        <div className="dungeon-actions__warning dungeon-actions__warning--dark">
          <AlertTriangle size={13} aria-hidden="true" />
          <span>Darkness — attacks and searching are penalised</span>
        </div>
      )}

      {/* ── 3. Movement ──────────────────────────────────────────────────── */}
      {visibleExits.length > 0 && (
        <div className="dungeon-actions__group">
          <h4 className="dungeon-actions__group-label">Movement</h4>
          <div className="dungeon-actions__move-grid">
            {visibleExits.map((exit, i) => {
              const isStair = exit.doorType === 'stair' || exit.isStair;
              const label   = isStair
                ? (exit.direction === 'down' ? 'Descend stairs' : 'Ascend stairs')
                : `Go ${DIR_LABEL[exit.direction] || exit.direction}`;
              const icon = DIR_ICONS[exit.direction] || <ArrowRight size={14} />;
              const isClosed = exit.doorType === 'closed';
              const isSecret = exit.doorType === 'secret' || exit.isSecret;
              return (
                <Button
                  key={i}
                  variant={isStair ? 'secondary' : 'primary'}
                  size="sm"
                  icon={icon}
                  fullWidth
                  onClick={() => handleMove(exit)}
                  disabled={inCombat}
                  className={isSecret ? 'btn--secret' : ''}
                >
                  {label}
                  {isClosed && <span className="exit-badge exit-badge--door"> (door)</span>}
                  {isSecret && <span className="exit-badge exit-badge--secret"> (secret)</span>}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Fight button (when monsters present and not already in combat) ── */}
      {livingMonsters.length > 0 && !inCombat && (
        <Button
          variant="danger"
          size="sm"
          icon={<AlertTriangle size={14} />}
          fullWidth
          onClick={handleFight}
          className="dungeon-actions__fight-btn"
        >
          Fight!
        </Button>
      )}

      {/* ── 4. Exploration actions ────────────────────────────────────────── */}
      <div className="dungeon-actions__group">
        <h4 className="dungeon-actions__group-label">Actions</h4>
        <div className="dungeon-actions__action-stack">

          {/* Search */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Search size={14} />}
            fullWidth
            onClick={handleSearch}
            disabled={inCombat}
            title={alreadySearched ? 'Already searched' : 'Search for hidden doors, traps, treasure'}
          >
            {alreadySearched ? 'Search Again' : 'Search Room'}
          </Button>

          {/* Rest */}
          {!hasRested && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Bed size={14} />}
              fullWidth
              onClick={handleRest}
              disabled={inCombat || livingMonsters.length > 0}
              title={livingMonsters.length > 0 ? 'Cannot rest with monsters present' : 'Rest to restore HP (6 turns, once per expedition)'}
            >
              Rest (once per expedition)
            </Button>
          )}

          {/* Inventory */}
          <Button
            variant="secondary"
            size="sm"
            icon={<Package size={14} />}
            fullWidth
            onClick={() => setShowItemMenu(true)}
            disabled={inCombat}
          >
            Inventory
          </Button>

          {/* Cast Spell */}
          {character.spellSlots && Object.values(character.spellSlots).some(v => v > 0) && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Sparkles size={14} />}
              fullWidth
              onClick={() => setShowSpellMenu(true)}
              disabled={inCombat}
            >
              Cast Spell
            </Button>
          )}
        </div>
      </div>

      {/* ── 5. Treasure ──────────────────────────────────────────────────── */}
      {treasure.length > 0 && roomCleared && (
        <div className="dungeon-actions__group dungeon-actions__group--treasure">
          <h4 className="dungeon-actions__group-label">
            <Coins size={13} aria-hidden="true" /> Treasure
          </h4>
          <div className="dungeon-actions__treasure-list">
            {treasure.map(t => (
              <TreasureItem key={t.id} treasure={t} onCollect={handleCollect} />
            ))}
          </div>
        </div>
      )}
      {treasure.length > 0 && !roomCleared && (
        <div className="dungeon-actions__warning dungeon-actions__warning--info">
          <span>Defeat the monsters before looting.</span>
        </div>
      )}

      {/* ── 6. Special room features ─────────────────────────────────────── */}
      {specialFeatures.length > 0 && (
        <div className="dungeon-actions__group dungeon-actions__group--features">
          <h4 className="dungeon-actions__group-label">
            <Star size={13} aria-hidden="true" /> Features
          </h4>
          {specialFeatures.map(f => (
            <FeatureAction
              key={f.id}
              feature={f}
              alreadyUsed={(revealedFeatures || []).includes(f.id)}
              onUse={() => handleFeature(f)}
            />
          ))}
        </div>
      )}

      {/* ── 7. Quest stats ────────────────────────────────────────────────── */}
      <div className="dungeon-actions__stats">
        <div className="quest-stat">
          <span className="quest-stat__label">Rooms explored</span>
          <span className="quest-stat__value">{visitedCount}{totalRooms > 0 ? `/${totalRooms}` : ''}</span>
        </div>
        <div className="quest-stat">
          <span className="quest-stat__label">Monsters defeated</span>
          <span className="quest-stat__value">{defeatedCount}</span>
        </div>
        <div className="quest-stat">
          <span className="quest-stat__label">XP this run</span>
          <span className="quest-stat__value">{adventure.getRunXP()}</span>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RoomStateBadge
// ─────────────────────────────────────────────────────────────────────────────

function RoomStateBadge({ state }) {
  if (!state || state === 'unexplored' || state === 'entered') return null;
  const labels = { cleared: 'Cleared', looted: 'Looted' };
  const label = labels[state];
  if (!label) return null;
  return (
    <span className={`room-badge room-badge--${state}`}>
      <CheckCircle size={10} aria-hidden="true" /> {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TreasureItem
// ─────────────────────────────────────────────────────────────────────────────

function TreasureItem({ treasure, onCollect }) {
  const parts = [];
  if (treasure.gold > 0)   parts.push(`${treasure.gold} gp`);
  for (const item of (treasure.items || [])) parts.push(item.name);
  const summary = parts.join(', ') || treasure.description || 'Treasure';

  return (
    <div className="treasure-item">
      <span className="treasure-item__summary">{summary}</span>
      <Button
        variant="ghost"
        size="sm"
        icon={<Coins size={12} />}
        onClick={() => onCollect(treasure)}
      >
        Take
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FeatureAction
// ─────────────────────────────────────────────────────────────────────────────

function FeatureAction({ feature, alreadyUsed, onUse }) {
  const label = alreadyUsed
    ? `${feature.name} (used)`
    : feature.name;

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<Star size={13} />}
      fullWidth
      onClick={onUse}
      disabled={alreadyUsed && !feature.repeatable}
      title={feature.description}
    >
      {label}
    </Button>
  );
}

export default DungeonActions;
