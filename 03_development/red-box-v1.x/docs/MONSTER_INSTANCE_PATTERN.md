# Monster Instance Registration Pattern

## Overview
This document describes the proper pattern for defining and managing monster instances in dungeon modules to ensure correct combat system behavior.

## Pattern: MONSTERS Object

### Location
All monster instances for a dungeon level must be pre-defined in a `MONSTERS` object at the top of the level file (e.g., `level1.js`, `level2.js`).

### Syntax
```javascript
const MONSTERS = {
  // Format: roomIdInstanceId: createMonsterInstance(monsterType, instanceId, HP)
  q1_3_kobold_1:   createMonsterInstance('kobold',   'q1_3_kobold_1',   2),
  q1_3_kobold_2:   createMonsterInstance('kobold',   'q1_3_kobold_2',   3),
  q1_34_lizard_1:  createMonsterInstance('giant_lizard', 'q1_34_lizard_1', 18),
  // ... more instances
};
```

### Key Requirements
1. **Pre-defined**: All instances must be created in MONSTERS before rooms reference them
2. **Keyed by instanceId**: Use the exact instance ID as the object key
3. **Canonical HP**: Use the canonical HP values from module stocking table (not calculated)
4. **Grouped by room**: Organize with comments showing which room each instance belongs to

## Room Reference Pattern

### Correct Usage
Rooms must reference instances by ID only, not create them inline:

```javascript
export const LEVEL1_ROOMS = {
  '34': {
    id: 'q1_34',
    name: 'The Lizard\'s Nest',
    description: '...',
    contents: {
      monsters: ['q1_34_lizard_1'],  // ✅ Reference by ID
      treasure: [...],
      traps: [],
    },
  },
};
```

### Incorrect Pattern (DO NOT USE)
```javascript
contents: {
  monsters: [createMonsterInstance('giant_lizard', 'q1_34_lizard_1', 18)],  // ❌ Inline creation
}
```

## Why This Matters

### Registration System
1. The `getLevel1MonsterInstances()` function returns the MONSTERS object
2. This object is stored in `mod.monsterInstances[level]`
3. Combat system uses this lookup: `mod.monsterInstances[level][instanceId]`

### Combat Flow
```
Player defeats monster
  ↓
defeatMonster(instanceId) called
  ↓
Lookup: mod.monsterInstances[currentLevel][instanceId]
  ↓
If found: Marks as defeated, checks room clearance
If NOT found: Room clearance check fails
  ↓
Combat cannot properly end
```

### Bug Manifestation
If instances are not in MONSTERS object:
- ❌ Combat victory screen gets stuck
- ❌ Room never registers as cleared
- ❌ Player cannot return to exploration
- ❌ UI freezes on victory message

## Implementation Checklist

When adding monsters to a room:

- [ ] Add instance to MONSTERS object at top of file
- [ ] Use canonical HP from module stocking table
- [ ] Use consistent naming: `{roomCode}_{monsterType}_{number}`
- [ ] Add comment showing which room the instance belongs to
- [ ] Reference instance by ID only in room contents
- [ ] Do NOT use `createMonsterInstance()` inline in room definition
- [ ] Verify all instances follow the same pattern

## Example: Complete Implementation

```javascript
// At top of level1.js
const MONSTERS = {
  // Room 3 — Kobolds (4)
  q1_3_kobold_1:   createMonsterInstance('kobold', 'q1_3_kobold_1', 2),
  q1_3_kobold_2:   createMonsterInstance('kobold', 'q1_3_kobold_2', 3),
  q1_3_kobold_3:   createMonsterInstance('kobold', 'q1_3_kobold_3', 2),
  q1_3_kobold_4:   createMonsterInstance('kobold', 'q1_3_kobold_4', 4),
};

// In LEVEL1_ROOMS
'3': {
  id: 'q1_3',
  name: 'Kobold Lair',
  contents: {
    monsters: ['q1_3_kobold_1', 'q1_3_kobold_2', 'q1_3_kobold_3', 'q1_3_kobold_4'],
    // ✅ References only - no creation here
  },
}
```

## Related Files
- `src/data/dungeons/quasqueton/level1.js` - Quasqueton B1 Level 1
- `src/data/dungeons/quasqueton/level2.js` - Quasqueton B1 Level 2
- `src/contexts/AdventureContext.jsx` - Combat system using this pattern
- `src/data/dungeons/quasqueton/bestiary.js` - Monster type definitions

## References
- See `session_updates_april_2026.md` for bug fix history
- See CHANGELOG.md version 0.1.1 for related fixes
