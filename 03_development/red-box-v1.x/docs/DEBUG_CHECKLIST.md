# Test-Driven Debugging Checklist

**Status**: Tests built and failing - ready for code investigation  
**Next Phase**: Debug and fix the code

---

## Phase 1: Understand What Tests Found ✅ COMPLETE

- [x] Tests created and running
- [x] Failures identified (5/21 tests failing)
- [x] Root cause documented (instance properties missing)
- [x] Documentation created (7 files)
- [x] Edge cases catalogued (5 total)

---

## Phase 2: Review Test Output ⏳ NEXT

### Documents to Read (in order)

- [ ] Start: **BUILD_COMPLETE_SUMMARY.md**
  - Overview of what was built
  - Test results at a glance
  - Key findings

- [ ] Then: **TEST_DOCUMENTATION_INDEX.md**
  - Navigation guide
  - Where to find information
  - Role-based reading paths

- [ ] Then: **TEST_SUITE_README.md**
  - How to run tests
  - Test file descriptions
  - Current status

- [ ] Then: **TEST_FAILURE_ANALYSIS.md**
  - Detailed breakdown of each failure
  - Expected vs. actual values
  - Why each failure matters

- [ ] Finally: **TEST_FINDINGS_EDGE_CASES.md**
  - Deep analysis of edge cases
  - Root cause explanation
  - Fix strategy

---

## Phase 3: Debug the Code 🔧 READY

### Step 1: Locate the Problem

- [ ] Open: `src/data/dungeons/quasqueton/bestiary.js`
- [ ] Find: `createMonsterInstance()` function
- [ ] Question: What properties does it set?
- [ ] Compare: Test expectations vs. actual

### Step 2: Verify Instance Structure

- [ ] Add console.log to createMonsterInstance()
- [ ] Create test instance: `createMonsterInstance('kobold', 'test_id', 5)`
- [ ] Log: `Object.keys(instance)`
- [ ] Check for:
  - [ ] `type` property exists?
  - [ ] `maxHp` property exists?
  - [ ] `isDefeated` property exists?
  - [ ] `id` property exists?

### Step 3: Check getLevel1MonsterInstances()

- [ ] Open: Same file or level1.js
- [ ] Find: `getLevel1MonsterInstances()` function
- [ ] Question: Does it return full MONSTERS object?
- [ ] Verify: Properties are accessible

### Step 4: Fix Missing Properties

- [ ] If properties missing from createMonsterInstance():
  - [ ] Add missing properties to instance object
  - [ ] Set initial values
  - [ ] Verify complete structure

- [ ] If getLevel1MonsterInstances() returns incomplete:
  - [ ] Check transformation logic
  - [ ] Remove any filtering
  - [ ] Return full objects

### Step 5: Fix Exit References (Room 1 & 25)

- [ ] Open: `src/data/dungeons/quasqueton/level1.js`
- [ ] Find: Room 1 (entry room)
  - [ ] Check exit targetRoomId
  - [ ] Should not be `null`
  - [ ] Should reference valid room
- [ ] Find: Room 25
  - [ ] Check exit references
  - [ ] Should not reference `q2_1`
  - [ ] Should be valid Level 1 room

---

## Phase 4: Verify Fixes ✅ VALIDATION

### Step 1: Run Tests

```bash
npm run test -- src/data/dungeons/quasqueton/quasqueton.module.test.js
```

- [ ] All 21 tests should pass
- [ ] No failures remaining
- [ ] See: "Test Files  1 passed (1)"

### Step 2: Check Specific Tests

```bash
npm run test -- -t "should verify Room 3"
```

- [ ] Room 3 test passes
- [ ] Kobold instances have .type property
- [ ] Instance.type === 'kobold'

```bash
npm run test -- -t "should verify Room 34"
```

- [ ] Room 34 test passes
- [ ] Lizard instance has .type property
- [ ] Instance.type === 'giant_lizard'

### Step 3: Manual Game Test

- [ ] Start game
- [ ] Create character
- [ ] Go to adventure: Quasqueton
- [ ] Navigate: Room 1 → Room 2 → Room 3 (east)
- [ ] Combat: Fight 4 Kobolds
- [ ] Victory:
  - [ ] Victory screen appears
  - [ ] NOT stuck on screen
  - [ ] Can click through to return
  - [ ] Properly returns to exploration

---

## Phase 5: Regression Testing 🔍 PREVENTION

### Check Other Rooms Aren't Broken

- [ ] Room 5 (Rats): Can fight and win
- [ ] Room 7 (Orcs): Can fight and win  
- [ ] Room 34 (Lizard): Can fight and win
- [ ] Victory works in each room
- [ ] Can navigate after victory

### Check Other Adventures Still Work

- [ ] Tutorial adventure: Works
- [ ] Load existing character: Works
- [ ] Character manager: Works
- [ ] No unrelated breakage

---

## Phase 6: Documentation ✏️ COMPLETION

- [ ] Add notes to TESTING.md
  - [ ] What was fixed
  - [ ] How it was discovered
  - [ ] What tests now verify

- [ ] Update CHANGELOG.md
  - [ ] Version 0.1.2 entry
  - [ ] Bug fix documented
  - [ ] Test suite added

- [ ] Create fix summary
  - [ ] What changed
  - [ ] Why it was needed
  - [ ] How tests verify it

---

## Success Criteria

### Tests
- [ ] 21/21 tests passing (was 16/21)
- [ ] No test failures
- [ ] All edge cases validated
- [ ] Module fully certified

### Gameplay
- [ ] Kobold Room 3: Victory works
- [ ] Other rooms: Victory works
- [ ] Navigation: No stuck screens
- [ ] Character progression: Unaffected

### Code Quality
- [ ] Instance objects complete
- [ ] All properties accessible
- [ ] Exit references valid
- [ ] No undefined access

### Documentation
- [ ] Tests documented
- [ ] Changes recorded
- [ ] Future developers informed
- [ ] Pattern established

---

## Quick Command Reference

### Run All Tests
```bash
npm run test
```

### Run Module Tests
```bash
npm run test -- src/data/dungeons/quasqueton/quasqueton.module.test.js
```

### Run Adventure Context Tests
```bash
npm run test -- src/contexts/AdventureContext.test.jsx
```

### Run Specific Test
```bash
npm run test -- -t "should verify Room 3"
```

### Watch Mode (Auto-rerun on changes)
```bash
npm run test -- --watch
```

### Run with Coverage
```bash
npm run test -- --coverage
```

---

## Files You'll Work With

### Documentation to Read
- [ ] BUILD_COMPLETE_SUMMARY.md
- [ ] TEST_FAILURE_ANALYSIS.md
- [ ] MONSTER_INSTANCE_PATTERN.md

### Code to Debug
- [ ] src/data/dungeons/quasqueton/bestiary.js
- [ ] src/data/dungeons/quasqueton/level1.js (check exits)
- [ ] src/contexts/AdventureContext.jsx (verify usage)

### Tests to Monitor
- [ ] src/data/dungeons/quasqueton/quasqueton.module.test.js
- [ ] src/contexts/AdventureContext.test.jsx

---

## Troubleshooting

### If Tests Still Fail After Fixes

1. Check test output carefully
2. Review TEST_FAILURE_ANALYSIS.md for that test
3. Verify your fix matches the pattern
4. Check MONSTER_INSTANCE_PATTERN.md
5. Add console.logs to debug
6. Run specific failing test only

### If Manual Test Still Stuck

1. Verify all 21 tests pass first
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)
4. Create new character
5. Check bestiary.js logs
6. Verify instance properties in console

### If Other Areas Broken

1. Don't make unrelated changes
2. Undo and start fresh
3. Only modify instance creation
4. Keep room definitions unchanged
5. Test incrementally

---

## Estimated Timeline

| Phase | Time | Status |
|-------|------|--------|
| Tests Built | ✅ Complete | Done |
| Understand Findings | 15-30 min | Next |
| Debug Code | 30-60 min | Pending |
| Verify Fixes | 15-30 min | Pending |
| Regression Test | 15-30 min | Pending |
| Documentation | 15 min | Pending |
| **Total** | **90-180 min** | **On Track** |

---

## Notes

- Tests have already done the hard work of finding the bug
- You just need to fix the exact issue tests identified
- Tests will immediately verify the fix
- No more guessing or trial-and-error
- Much faster than manual debugging

---

## When You're Done

1. All 21 tests pass ✅
2. Manual game test succeeds ✅
3. No regressions detected ✅
4. Documentation updated ✅
5. Victory screen bug fixed ✅

**Congratulations! Bug defeated by test-driven development!** 🎉
