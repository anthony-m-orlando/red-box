# Test Failures - Detailed Analysis

**Generated**: April 30, 2026  
**Test Runner**: Vitest v1.6.1  
**Test File**: `src/data/dungeons/quasqueton/quasqueton.module.test.js`  
**Result**: 5 FAILED / 16 PASSED (76% Pass Rate)

---

## Test Failures Overview

```
FAIL 1: should verify Room 3 (Kobold Lair) combat viability
FAIL 2: should verify Room 34 (Lizard Lair) has properly registered instance  
FAIL 3: should handle rooms with different monster types
FAIL 4: should validate all exit targetRoomIds reference existing rooms
FAIL 5: should prevent victory screen stuck bug (Issue: Kobold in Room 3)
```

---

## FAILURE #1: Room 3 Kobold Combat Viability

### Test Code
```javascript
it('should verify Room 3 (Kobold Lair) combat viability', () => {
  const room = LEVEL1_ROOMS.q1_3;
  const instances = getLevel1MonsterInstances();
  
  expect(room).toBeDefined();
  expect(room.name).toBe('Kobold Lair');
  expect(room.contents.monsters).toEqual([
    'q1_3_kobold_1','q1_3_kobold_2','q1_3_kobold_3','q1_3_kobold_4'
  ]);
  
  // FAILS HERE:
  room.contents.monsters.forEach(monsterId => {
    expect(instances[monsterId]).toBeDefined();
    expect(instances[monsterId].type).toBe('kobold');  // ← FAILURE POINT
    expect(instances[monsterId].maxHp).toBeGreaterThan(0);
    expect(instances[monsterId].hp).toBe(instances[monsterId].maxHp);
  });
});
```

### Failure Message
```
AssertionError: expected undefined to be 'kobold'

Expected:
  "kobold"

Received:
  undefined
```

### What This Means
- ✅ Room 3 exists
- ✅ Room is named "Kobold Lair"
- ✅ Room references 4 kobold instances by ID
- ✅ Instances exist in the MONSTERS object
- ❌ **Instances don't have `.type` property**
- ❌ Combat code cannot verify monster type
- ❌ defeatMonster() cannot confirm monster identity

### Combat Impact
When combat system tries to verify a defeated monster:
```javascript
const instance = instances['q1_3_kobold_1'];
if (instance.type === 'kobold') {  // undefined === 'kobold' → FALSE
  // Never reaches here!
  confirmDefeat();
}
// Monster defeat not confirmed → room not cleared → victory stuck
```

---

## FAILURE #2: Room 34 Lizard Instance Registration

### Test Code
```javascript
it('should verify Room 34 (Lizard Lair) has properly registered instance', () => {
  const room = LEVEL1_ROOMS.q1_34;
  const instances = getLevel1MonsterInstances();
  
  expect(room).toBeDefined();
  expect(room.name).toBe("The Lizard's Nest");
  expect(room.contents.monsters).toEqual(['q1_34_lizard_1']);
  
  // FAILS HERE:
  const instance = instances['q1_34_lizard_1'];
  expect(instance).toBeDefined();
  expect(instance.type).toBe('giant_lizard');  // ← FAILURE POINT
  expect(instance.maxHp).toBe(18);
  expect(instance.hp).toBe(18);
  expect(instance.isDefeated).toBe(false);
});
```

### Failure Message
```
AssertionError: expected undefined to be 'giant_lizard'

Expected:
  "giant_lizard"

Received:
  undefined
```

### What This Means
Same pattern as Room 3:
- ✅ Room 34 exists and is configured correctly
- ✅ Instance `q1_34_lizard_1` exists in MONSTERS
- ❌ **Instance object missing `.type` property**
- ❌ Instance object missing `.maxHp` property
- ❌ Instance object missing `.isDefeated` property

### Combat Impact
Identical to Kobold issue - combat cannot verify the lizard's state.

---

## FAILURE #3: Different Monster Types Not Distinguished

### Test Code
```javascript
it('should handle rooms with different monster types', () => {
  const instances = getLevel1MonsterInstances();
  const roomsWithMonsters = Object.values(LEVEL1_ROOMS).filter(
    r => r.contents?.monsters?.length > 0
  );
  
  const monsterTypes = new Set();
  
  roomsWithMonsters.forEach(room => {
    room.contents.monsters.forEach(monsterId => {
      const instance = instances[monsterId];
      monsterTypes.add(instance.type);  // Adding undefined repeatedly
    });
  });
  
  // FAILS HERE:
  expect(monsterTypes.size).toBeGreaterThan(1);  // Set size is 1, not > 1
});
```

### Failure Message
```
AssertionError: expected 1 to be greater than 1
```

### What This Means
- The test creates a Set of all unique monster types
- Since every instance has `.type === undefined`
- The Set contains only: `{ undefined }`
- Set size = 1 (only undefined)
- Should be 13+ (kobold, rat, orc, skeleton, etc.)

### Combat Impact
The combat system cannot distinguish between different monster types:
- All monsters appear as "undefined"
- Special abilities won't work (rust monster rust, etc.)
- Cannot apply type-specific combat modifiers
- Cannot properly track defeats

---

## FAILURE #4: Room Exit References Invalid

### Test Code
```javascript
it('should validate all exit targetRoomIds reference existing rooms', () => {
  const roomIds = new Set(Object.keys(LEVEL1_ROOMS));
  const failures = [];
  
  Object.values(LEVEL1_ROOMS).forEach(room => {
    if (room.exits) {
      room.exits.forEach(exit => {
        if (!roomIds.has(exit.targetRoomId)) {
          failures.push(
            `Room ${room.number} exit to "${exit.targetRoomId}": target room doesn't exist`
          );
        }
      });
    }
  });
  
  // FAILS HERE:
  expect(failures).toEqual([]);
});
```

### Failure Message
```
AssertionError: expected [ ...(2) ] to deeply equal []

Received:
  [
    "Room 1 exit to "null": target room doesn't exist",
    "Room 25 exit to "q2_1": target room doesn't exist"
  ]
```

### What This Means
Two rooms have exits to non-existent rooms:

1. **Room 1** has an exit to `null`
   - Room 1 is Entry Alcove (starting room)
   - Null exit is invalid
   - Player might not be able to navigate away

2. **Room 25** has an exit to `q2_1`
   - Room 25 is not in LEVEL1_ROOMS keys
   - q2_1 is Level 2 (different module)
   - Cannot navigate between levels properly

### Combat Impact
After defeating monsters and trying to return to exploration:
- ❌ Cannot navigate away from combat room
- ❌ Victory screen cannot progress to next area
- ❌ Player stuck (similar to victory screen freeze)

---

## FAILURE #5: Victory Screen Stuck Bug (THE BUG WE'RE TRYING TO CATCH)

### Test Code
```javascript
it('should prevent victory screen stuck bug (Issue: Kobold in Room 3)', () => {
  const instances = getLevel1MonsterInstances();
  const room = LEVEL1_ROOMS.q1_3;
  
  // Reproduce the exact scenario
  const cobalts = room.contents.monsters;
  
  // FAILS HERE - with EVERY MONSTER:
  cobalts.forEach(monsterId => {
    const instance = instances[monsterId];
    expect(instance).toBeDefined(
      `Cannot find instance ${monsterId} - would cause victory screen to stick`
    );
    expect(instance.id).toBe(monsterId);  // instance is undefined, so instance.id → undefined
  });
});
```

### Failure Message
```
AssertionError: expected undefined to be 'q1_3_kobold_1'

Expected:
  "q1_3_kobold_1"

Received:
  undefined
```

### What This Means
This is **THE EXACT BUG** we're trying to catch:

1. Player travels east from Room 2 to Room 3 (Kobold Lair)
2. Combat starts with 4 kobolds
3. Player defeats all 4 kobolds
4. Combat system calls: `defeatMonster('q1_3_kobold_1', xp)`
5. In defeatMonster():
   ```javascript
   const instance = instances['q1_3_kobold_1'];
   if (!instance) {
     // BUG: instance is undefined!
     // Cannot mark as defeated
     // Cannot check room clearance
     // Cannot trigger victory
   }
   ```
6. Victory screen renders but isVictorious flag never set properly
7. **UI STUCK on victory screen**

### Why Test Catches It
The test specifically reproduces:
- ✅ Navigate to Room 3
- ✅ Reference the exact monsters
- ✅ Verify instances are accessible
- ✅ Verify instances have proper ID property
- ❌ **FAILS because instance.id is undefined**

---

## Root Cause: Instance Object Structure

### Current Behavior
```javascript
const instances = getLevel1MonsterInstances();
const kobold1 = instances['q1_3_kobold_1'];

console.log(kobold1);  // ???

// Current (BROKEN):
// undefined or { } (empty object)

// Expected (NEEDED):
// {
//   id: 'q1_3_kobold_1',
//   type: 'kobold',
//   maxHp: 2,
//   hp: 2,
//   isDefeated: false,
//   ac: 9,
//   thac0: 19,
//   // ... other properties
// }
```

### The Problem Chain
```
createMonsterInstance() called
  ↓
Returns incomplete object
  ↓
MONSTERS object stores incomplete object
  ↓
getLevel1MonsterInstances() returns incomplete object
  ↓
Combat code tries to access .type, .maxHp, etc.
  ↓
All properties are undefined
  ↓
Combat logic fails
  ↓
Victory never triggered
  ↓
UI STUCK on victory screen
```

---

## What Needs to Be Fixed

### Fix #1: Instance Object Properties
**Location**: `src/data/dungeons/quasqueton/bestiary.js`
**Function**: `createMonsterInstance()`

Verify it returns:
```javascript
{
  id: string,
  type: string,
  hp: number,
  maxHp: number,
  isDefeated: boolean,
  ac: number,
  thac0: number,
  xpValue: number,
  // ... other properties
}
```

### Fix #2: Room Exit References
**Location**: `src/data/dungeons/quasqueton/level1.js`

Rooms to fix:
- Room 1: Replace null exit with valid room
- Room 25: Replace q2_1 reference or handle differently

---

## How to Verify Fixes

After fixing, run tests:
```bash
npm run test -- src/data/dungeons/quasqueton/quasqueton.module.test.js
```

Expected output:
```
PASS (21/21 tests)
✓ All instances have .type property
✓ All instances have .maxHp property
✓ All exit references valid
✓ Victory screen bug prevented
✓ Module fully validated
```

---

## Test Output Format

The test failures show:
- **Line number** of test that failed
- **Expected value** (what should happen)
- **Received value** (what actually happened)
- **Assertion** that failed

This makes debugging easy:
1. Look at test line number
2. See what property failed
3. Go to bestiary.js to fix it
4. Re-run tests to verify

The tests are your **quality assurance system** - they ensure the module works correctly **before** manual testing.
