/**
 * WanderingMonsters.js
 * Wandering Monster System
 *
 * Pure functions — no state mutation.
 * Called by AdventureContext when TurnTracker signals wanderingMonsterDue.
 *
 * ─────────────────────────────────────────────────────────────────────
 * B/X Wandering Monster Rules:
 *
 *   Check every 2 turns (already handled by TurnTracker).
 *   On a triggered check, roll 1d6 on the level's encounter table.
 *   The result spawns a group of monsters in the current room.
 *
 *   Wandering monsters do NOT appear if:
 *     - The room is cleared (no living placed monsters ever existed OR all defeated)
 *     - The player is in a checkpoint/safe room (Room 1)
 *     - The player is already in combat
 *
 *   Wandering monsters:
 *     - Yield NO TREASURE (they carry nothing)
 *     - Yield HALF XP compared to placed monsters
 *     - Are NOT added to the permanent monster roster
 *     - Are resolved in combat using temporary instance objects
 *     - Surprise: Player surprised on 1-2 (d6); monsters surprised on 1-2 (d6)
 *
 * ─────────────────────────────────────────────────────────────────────
 */



// ─────────────────────────────────────────────────────────────────────────────
// Spawn Guard Conditions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether a wandering monster encounter should be suppressed.
 *
 * @param {object} mod          — dungeon module
 * @param {object} dungeonState — current state
 * @returns {{ suppressed: boolean, reason: string|null }}
 */
export function shouldSuppressWanderingMonster(mod, dungeonState) {
  // Already in combat
  if (dungeonState.inCombat) {
    return { suppressed: true, reason: 'Already in combat.' };
  }

  const { currentLevel: level, currentRoomId: roomId } = dungeonState;
  const room = mod.rooms?.[level]?.[roomId];

  // Checkpoint rooms are always safe
  if (room?.isCheckpoint) {
    return { suppressed: true, reason: 'Safe room — no wandering monsters.' };
  }

  // The dungeon entrance/exit is always safe
  if (room?.exits?.some(e => e.isExit)) {
    return { suppressed: true, reason: 'Dungeon entrance — no wandering monsters.' };
  }

  // Wind corridor: wandering monsters can still appear here
  // (They'd be carried in on the wind... thematically appropriate)

  return { suppressed: false, reason: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Encounter Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a wandering monster encounter for the current level.
 * Returns an array of temporary monster instances.
 *
 * These instances are EPHEMERAL — they are not stored in the module's
 * permanent monsterInstances registry. AdventureContext holds them in
 * a separate `wanderingMonsters` field on dungeonState for the duration
 * of the combat, then discards them.
 *
 * @param {object} mod      — dungeon module
 * @param {number} level    — current dungeon level (1 or 2)
 * @returns {{ instances: object[], tableEntry: object, narration: string } | null}
 */
export function generateWanderingEncounter(mod, level) {
  const table = mod.wanderingMonsters?.[level];
  if (!table?.length) return null;

  // Roll 1d6 for table entry
  const roll = Math.floor(Math.random() * 6) + 1;
  const entry = table.find(t => t.roll === roll) || table[0];

  // Parse the count formula (e.g. '1d4', '1d2', '1', '1d3')
  const count = rollCountFormula(entry.count);
  if (count <= 0) return null;

  // Get the monster type from the module's bestiary
  const monsterType = mod.bestiary?.[entry.typeId];
  if (!monsterType) {
    console.warn(`[WanderingMonsters] Unknown monster type: ${entry.typeId}`);
    return null;
  }

  // Stamp out instances with temporary IDs
  const timestamp = Date.now();
  const instances = [];
  for (let i = 0; i < count; i++) {
    const instanceId = `wm_${entry.typeId}_${timestamp}_${i}`;
    // Roll HP normally for wandering monsters (not fixed canonical HP)
    const hp = monsterType.hpMin +
      Math.floor(Math.random() * (monsterType.hpMax - monsterType.hpMin + 1));

    instances.push({
      instanceId,
      typeId: entry.typeId,
      name: monsterType.name,
      hp: { current: hp, max: hp },
      ac: monsterType.ac,
      thac0: monsterType.thac0,
      damage: monsterType.damage,
      attacks: monsterType.attacks || 1,
      morale: monsterType.morale,
      xp: Math.floor((monsterType.xp || 0) / 2),  // half XP for wandering
      save: monsterType.save,
      alignment: monsterType.alignment,
      undead: monsterType.undead || false,
      alwaysLast: monsterType.alwaysLast || false,
      special: monsterType.special || [],
      conditions: [],
      isDefeated: false,
      isWandering: true,     // flag: no treasure, half XP
    });
  }

  // Build narration
  const plural = count > 1;
  const typeName = plural ? (monsterType.plural || monsterType.name + 's') : monsterType.name;
  const article = plural ? `${count}` : `A`;
  const narration = buildWanderingNarration(entry, count, typeName, article);

  return { instances, tableEntry: entry, narration };
}

// ─────────────────────────────────────────────────────────────────────────────
// Surprise Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve surprise for a wandering monster encounter.
 * Returns who (if anyone) is surprised and the initiative modifier.
 *
 * B/X: Both sides roll 1d6. Surprised on 1-2. If surprised, that side
 * loses their first round of actions.
 *
 * Special modifiers:
 *   - Troglodyte/Gelatinous Cube/etc. have elevated surprise ranges.
 *   - These are handled via the monster's special ability list.
 *
 * @param {object[]} monsterInstances  — wandering monster instances
 * @param {object} mod                 — module (for bestiary access)
 * @param {object} character           — character (for class-based modifiers)
 * @returns {{ playerSurprised: boolean, monsterSurprised: boolean, narration: string }}
 */
export function resolveSurprise(monsterInstances, mod, character) {
  // Get the surprise threshold for the first monster type
  const firstMonster = monsterInstances[0];
  const monsterType = mod.bestiary?.[firstMonster?.typeId];

  // Check if any monster has elevated surprise range
  const elevatedSurprise = monsterType?.special?.find(s => s.effect?.type === 'surprise_bonus');
  const monsterSurpriseThreshold = elevatedSurprise
    ? elevatedSurprise.effect.value    // e.g. 3 for gelatinous cube (1-in-3)
    : 2;                               // standard 1-2 on d6

  // Player surprise: standard 1-2 on d6, modified by class
  // Halflings: -1 to opponents' surprise die (better at sneaking)
  const cls = character?.class?.toLowerCase();
  const playerSurpriseThreshold = cls === 'halfling' ? 1 : 2;  // halflings: 1-in-6

  const playerRoll = Math.floor(Math.random() * 6) + 1;
  const monsterRoll = Math.floor(Math.random() * 6) + 1;

  const playerSurprised = playerRoll <= playerSurpriseThreshold;
  const monsterSurprised = monsterRoll <= 2;  // standard for monsters

  let narration = '';
  if (playerSurprised && !monsterSurprised) {
    narration = 'The monsters catch you off guard! You lose your first round.';
  } else if (monsterSurprised && !playerSurprised) {
    narration = 'You catch the monsters by surprise! You act first.';
  } else if (playerSurprised && monsterSurprised) {
    narration = 'Both sides are startled by the encounter.';
  } else {
    narration = 'Neither side is surprised.';
  }

  return { playerSurprised, monsterSurprised, narration };
}

// ─────────────────────────────────────────────────────────────────────────────
// Morale Checks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roll a morale check for a monster or group.
 * B/X: Roll 2d6. If result > morale score, monsters flee or surrender.
 *
 * Triggers:
 *   - Monster reduced to half HP
 *   - First ally defeated
 *   - Spells affecting the group
 *
 * @param {number} moraleScore   — the monster's morale stat (2-12)
 * @param {object} options
 * @param {boolean} options.isLeaderDead  — +2 modifier if leader is dead
 * @param {boolean} options.isUndead      — undead never check morale
 * @returns {{ flees: boolean, roll: number, narration: string }}
 */
export function rollMoraleCheck(moraleScore, options = {}) {
  const { isLeaderDead = false, isUndead = false } = options;

  // Undead never flee
  if (isUndead) {
    return { flees: false, roll: 0, narration: 'The undead feel no fear.' };
  }

  // 2d6
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const effectiveRoll = roll + (isLeaderDead ? 2 : 0);
  const flees = effectiveRoll > moraleScore;

  const narration = flees
    ? 'The monster\'s courage fails! It turns and flees!'
    : 'The monster holds its ground.';

  return { flees, roll: effectiveRoll, narration };
}

/**
 * Check whether the first monster defeat should trigger a morale check
 * for any surviving monsters in the group.
 *
 * @param {object[]} allMonsters     — all monsters in current combat
 * @param {string} justDefeatedId    — instanceId of the monster just defeated
 * @returns {boolean}
 */
export function shouldCheckMoraleOnDeath(allMonsters, justDefeatedId) {
  const survivors = allMonsters.filter(
    m => !m.isDefeated && m.instanceId !== justDefeatedId
  );
  // Check morale when first ally dies OR when group is at half strength
  if (survivors.length === 0) return false;   // no one left to check
  const total = allMonsters.length;
  const defeated = total - survivors.length;
  return defeated === 1 || survivors.length === Math.floor(total / 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Reaction Roll (Monster Attitude)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Roll a monster reaction when the party encounters a wandering monster.
 * B/X Reaction Table:
 *   2     = Immediate Attack
 *   3-5   = Hostile, Attack likely
 *   6-8   = Uncertain, DM judges
 *   9-11  = No attack if not provoked
 *   12    = Friendly
 *
 * Charisma modifier applied to roll.
 *
 * @param {number} charisma — character's CHA score
 * @returns {{ reaction: string, code: number, narration: string }}
 */
export function rollMonsterReaction(charisma = 10) {
  const chaMod = getCharismaMod(charisma);
  const roll = Math.floor(Math.random() * 6) + 1 +
               Math.floor(Math.random() * 6) + 1 + chaMod;
  const clamped = Math.max(2, Math.min(12, roll));

  if (clamped <= 2) {
    return {
      code: clamped,
      reaction: 'attack',
      narration: 'The monsters charge immediately, weapons raised!',
    };
  }
  if (clamped <= 5) {
    return {
      code: clamped,
      reaction: 'hostile',
      narration: 'The monsters advance with obvious hostile intent.',
    };
  }
  if (clamped <= 8) {
    return {
      code: clamped,
      reaction: 'uncertain',
      narration: 'The monsters halt, regarding you warily. The situation could go either way.',
    };
  }
  if (clamped <= 11) {
    return {
      code: clamped,
      reaction: 'cautious',
      narration: 'The monsters hold back, not immediately aggressive.',
    };
  }
  return {
    code: clamped,
    reaction: 'friendly',
    narration: 'Surprisingly, the monsters seem non-hostile — perhaps even friendly.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse and roll a count formula like '1d4', '1d2', '1', '1d6'.
 * @param {string} formula
 * @returns {number}
 */
function rollCountFormula(formula) {
  if (!formula) return 1;
  const str = String(formula).trim();

  // Pure number
  if (/^\d+$/.test(str)) return parseInt(str, 10);

  // NdN
  const match = str.match(/^(\d+)d(\d+)$/i);
  if (!match) return 1;

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

/**
 * B/X Charisma reaction modifier.
 * @param {number} cha
 * @returns {number}
 */
function getCharismaMod(cha) {
  if (cha <= 3)  return -3;
  if (cha <= 5)  return -2;
  if (cha <= 8)  return -1;
  if (cha <= 12) return  0;
  if (cha <= 15) return  1;
  if (cha <= 17) return  2;
  return 3;
}

/**
 * Build encounter narration for a wandering monster group.
 * @param {object} entry
 * @param {number} count
 * @param {string} typeName
 * @param {string} article
 * @returns {string}
 */
function buildWanderingNarration(entry, count, typeName, article) {
  const note = entry.note || '';
  if (count === 1) {
    return `${note || 'You hear movement in the darkness'} — a ${typeName} appears from the shadows!`;
  }
  return `${note || 'Movement echoes in the corridor'} — ${count} ${typeName} emerge from the darkness!`;
}

export default {
  shouldSuppressWanderingMonster,
  generateWanderingEncounter,
  resolveSurprise,
  rollMoraleCheck,
  shouldCheckMoraleOnDeath,
  rollMonsterReaction,
};
