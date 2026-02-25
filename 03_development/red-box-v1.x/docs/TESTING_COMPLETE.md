# Complete Testing Guide - All Features

**Version**: 1.0 (Final)  
**Date**: February 16, 2026  
**Coverage**: All 5 Features + Core Systems  
**Status**: Production Testing Ready  

---

## Table of Contents

1. [Automated Tests](#1-automated-tests)
2. [Manual Test Scenarios](#2-manual-test-scenarios)
3. [Feature-Specific Tests](#3-feature-specific-tests)
4. [Integration Tests](#4-integration-tests)
5. [Edge Cases & Error Handling](#5-edge-cases--error-handling)
6. [Performance Tests](#6-performance-tests)
7. [Browser Compatibility](#7-browser-compatibility)
8. [Regression Tests](#8-regression-tests)

---

## 1. Automated Tests

### 1.1 Current Test Suite

**83 Tests Passing** (92%+ coverage):

```bash
npm test               # Run all tests once
npm test -- --watch    # Watch mode (auto-rerun)
npm run test:ui        # Visual test UI
npm run test:coverage  # Generate coverage report
```

### 1.2 Test Breakdown by Module

**Dice Utilities** (`src/utils/dice.test.js`) - 16 tests:
- ✅ rollDie() returns value in range
- ✅ rollDice() returns correct array length
- ✅ rollDiceSum() sums correctly
- ✅ roll3d6() returns valid ability scores
- ✅ rollAbilityScores() generates 6 scores
- ✅ parseDiceNotation() handles all formats
- ✅ Edge cases (d4, d100, modifiers)

**Calculation Utilities** (`src/utils/calculations.test.js`) - 37 tests:
- ✅ calculateModifier() matches rulebook table
- ✅ calculateMaxHP() correct for all classes
- ✅ calculateAC() applies dex modifier
- ✅ getArmorAC() correct armor values
- ✅ calculateTHAC0() accurate by class/level
- ✅ calculateToHit() returns proper roll needed
- ✅ getPrimeRequisite() correct for all classes
- ✅ calculateXPBonus() 0/5/10% correct
- ✅ meetsClassRequirements() validates properly
- ✅ getStartingGold() in valid range
- ✅ calculateEncumbrance() sums weight
- ✅ getMovementRate() correct breakpoints
- ✅ getXPForNextLevel() matches tables
- ✅ shouldLevelUp() detects correctly
- ✅ getLevelFromXP() calculates level

**Button Component** (`src/components/common/Button.test.jsx`) - 8 tests:
- ✅ Renders with children
- ✅ onClick handler works
- ✅ Variants apply correct classes
- ✅ Sizes apply correct classes
- ✅ Disabled state works
- ✅ fullWidth prop works
- ✅ Icon renders when provided
- ✅ Accessibility attributes present

**PaperContainer Component** (`src/components/common/PaperContainer.test.jsx`) - 6 tests:
- ✅ Renders children
- ✅ Variants apply correct classes
- ✅ Padding applies correct classes
- ✅ Custom className merges
- ✅ Default variant is cream
- ✅ Default padding is md

**CharacterContext** (`src/contexts/CharacterContext.test.jsx`) - 16 tests:
- ✅ Initial state correct
- ✅ SET_ABILITIES updates and advances step
- ✅ SET_CLASS calculates HP/AC/THAC0
- ✅ SET_ALIGNMENT updates and advances
- ✅ SET_SPELLS stores spells and slots
- ✅ SET_NAME updates name
- ✅ FINALIZE_CHARACTER marks complete
- ✅ DAMAGE reduces HP
- ✅ HEAL restores HP (capped at max)
- ✅ ADD_XP accumulates experience
- ✅ ADD_ITEM adds to inventory
- ✅ REMOVE_ITEM removes from inventory
- ✅ UPDATE_GOLD modifies gold (min 0)
- ✅ USE_SPELL_SLOT consumes slot
- ✅ REST restores HP and spell slots
- ✅ RESET_CHARACTER clears all data

### 1.3 Coverage Goals

**Current**: 92%+ overall  
**Target**: 95%+

**Areas needing more tests**:
- Combat utilities (planned)
- Spell utilities (planned)
- Item utilities (planned)
- Treasure utilities (planned)
- AdventureContext (planned)

---

## 2. Manual Test Scenarios

### 2.1 Complete Tutorial Walkthrough

**Test ID**: MT-001  
**Purpose**: Verify all systems work together  
**Duration**: 15-20 minutes  
**Priority**: CRITICAL

**Steps**:
1. Start application → Navigate to "Create New Character"
2. Roll abilities → Verify all 6 abilities rolled (3-18 range)
3. Choose Fighter class → Verify HP, AC, THAC0 calculated
4. Choose Lawful alignment → Verify step advances
5. Skip spell selection (Fighter doesn't cast) → Verify auto-advance to step 5
6. Name character "Test Hero" → Click "Begin Adventure"
7. Verify starting inventory (Healing Potion, 6 Torches, etc.)
8. Enter dungeon → Read initial narration
9. Move North to Corridor → Verify map updates
10. Move West to Goblin's Lair → Auto-trigger combat
11. Attack Goblin → Verify damage rolls, HP updates
12. Defeat Goblin → Verify XP gained, treasure rolled
13. Check treasure in narration → Note gold/items found
14. Return to Corridor → Move East to Snake Pit
15. Attack Snake → Use Healing Potion if damaged
16. Defeat Snake → Verify treasure again
17. Move to Treasure Chamber → Fight Rust Monster
18. Defeat Rust Monster (1 HP, dies in one hit)
19. Verify victory screen appears
20. Check final stats (HP, Gold, XP, Items)
21. Click "Save Character to File" → Verify JSON downloads
22. Click "Play Tutorial Again" → Verify adventure resets, character persists

**Expected Results**:
- ✅ All calculations correct
- ✅ Combat flows smoothly
- ✅ Treasure varies between runs
- ✅ Progress saved correctly
- ✅ Can replay with accumulated progress
- ✅ No console errors
- ✅ No visual glitches

**Pass Criteria**: All steps complete without errors

---

### 2.2 All Classes Test

**Test ID**: MT-002  
**Purpose**: Verify each class works correctly  
**Duration**: 90-120 minutes (7 classes × 15 min)  
**Priority**: HIGH

**For Each Class**:
1. Create character of this class
2. Verify starting equipment correct
3. **If spellcaster** (Cleric/Magic-User/Elf):
   - Select spell during creation
   - Cast spell in first combat
   - Verify effect applies
   - Verify spell slot consumed
4. **If not spellcaster** (Fighter/Thief/Dwarf/Halfling):
   - Verify spell selection skipped
   - No "Cast Spell" button in combat
5. Complete tutorial
6. Verify class-specific bonuses work

**Classes to Test**:
- [ ] Fighter
- [ ] Cleric (test Cure Light Wounds)
- [ ] Magic-User (test Magic Missile)
- [ ] Thief
- [ ] Dwarf
- [ ] Elf (test spells)
- [ ] Halfling

**Pass Criteria**: All classes complete tutorial without errors

---

### 2.3 Spell System Test

**Test ID**: MT-003  
**Purpose**: Verify all spells work correctly  
**Duration**: 60 minutes  
**Priority**: HIGH

**Spells to Test**:

**Cleric Spells**:
1. [ ] **Cure Light Wounds** (healing)
   - Create Cleric, select this spell
   - Take damage in combat
   - Cast spell on self
   - Verify: Heals 1d6+1 HP (1-7 range)
   - Verify: HP bar updates
   - Verify: Spell slot consumed (1/1 → 0/1)

2. [ ] **Protection from Evil** (buff)
   - Cast in combat
   - Verify: Narration shows +1 AC vs evil
   - (Full effect implementation pending)

3. [ ] **Light** (utility)
   - Cast in combat
   - Verify: Narration shows illumination
   - No mechanical effect (narrative only)

4. [ ] **Detect Magic** (utility)
   - Cast in combat
   - Verify: Narration shows sensing magic
   - No mechanical effect (narrative only)

**Magic-User Spells**:
1. [ ] **Magic Missile** (damage)
   - Create Magic-User, select this spell
   - Cast in first combat
   - Verify: Auto-hit (no attack roll)
   - Verify: 1d4+1 damage (2-5 range)
   - Verify: Enemy HP decreases
   - Verify: Spell slot consumed

2. [ ] **Shield** (buff)
   - Cast in combat
   - Verify: Narration shows +4 AC
   - (Full effect implementation pending)

3. [ ] **Sleep** (condition)
   - Currently not functional
   - Verify: Shows "not yet implemented" message
   - Skip this test

4. [ ] **Charm Person** (condition)
   - Currently not functional
   - Verify: Shows "not yet implemented" message
   - Skip this test

5. [ ] **Read Magic** (utility)
   - Cast in combat
   - Verify: Narration appropriate
   - No mechanical effect

6. [ ] **Light** (utility)
   - Same as Cleric Light

7. [ ] **Detect Magic** (utility)
   - Same as Cleric Detect Magic

**Elf Spells**:
- Same as Magic-User (test subset)

**Pass Criteria**: All functional spells work as expected

---

### 2.4 Item System Test

**Test ID**: MT-004  
**Purpose**: Verify all items work correctly  
**Duration**: 45 minutes  
**Priority**: HIGH

**Items to Test**:

**Healing Items**:
1. [ ] **Healing Potion**
   - Create Fighter (gets potion)
   - Take damage in combat
   - Exit combat, open item menu
   - Use Healing Potion
   - Verify: Heals 1d8 HP (1-8 range)
   - Verify: HP bar updates
   - Verify: Potion removed from inventory
   - Verify: Narration shows effect

**Light Sources**:
2. [ ] **Lantern** (Magic-User/Elf)
   - Use lantern in exploration
   - Verify: Narration shows steady light
   - Verify: Lantern remains in inventory (not consumed)

3. [ ] **Torch** (Fighter/Cleric/Dwarf)
   - Use torch in exploration
   - Verify: Narration shows flickering light
   - (Consumption not yet implemented - remains for now)

**Utility Items**:
4. [ ] **Rope** (Thief/Elf)
   - Use rope in exploration
   - Verify: "Not much use here" message

5. [ ] **Iron Rations**
   - Use rations in exploration
   - Verify: "Eat dried meat" message
   - Verify: Rations remain (rest system needed to consume)

6. [ ] **Waterskin**
   - Use waterskin in exploration
   - Verify: "Refreshing drink" message

**Tools**:
7. [ ] **Thieves' Tools** (Thief)
   - Use in exploration
   - Verify: "Examine lockpicks" message

8. [ ] **Holy Symbol** (Cleric)
   - Use in exploration
   - Verify: "Clutch holy symbol" message

9. [ ] **Spellbook** (Magic-User)
   - Use in exploration
   - Verify: "Review arcane formulas" message

**Pass Criteria**: All items show appropriate effects

---

### 2.5 Treasure Variation Test

**Test ID**: MT-005  
**Purpose**: Verify treasure randomization  
**Duration**: 60 minutes  
**Priority**: MEDIUM

**Procedure**:
1. Complete tutorial 5 times with same class
2. Record treasure from each run:

**Run 1**:
- Goblin: ___ GP, Items: ___
- Snake: ___ GP, Items: ___
- Rust Monster: ___ GP, Items: ___
- Total: ___ GP, ___ items

**Run 2**:
- Goblin: ___ GP, Items: ___
- Snake: ___ GP, Items: ___
- Rust Monster: ___ GP, Items: ___
- Total: ___ GP, ___ items

**Run 3-5**: (same format)

**Analysis**:
- Goblin gold range: 1-6 GP ✅
- Snake gold range: 2-12 GP ✅
- Rust Monster gold range: 3-30 GP ✅
- Item drops vary between runs ✅
- No duplicated exact treasure ✅

**Pass Criteria**: Treasure varies appropriately, within expected ranges

---

### 2.6 Character Progression Test

**Test ID**: MT-006  
**Purpose**: Verify XP/Gold/Items persist  
**Duration**: 45 minutes  
**Priority**: HIGH

**Steps**:
1. Create character "Progression Test"
2. Complete tutorial (Record: XP, Gold, Items)
3. At victory screen, note final stats:
   - XP: ___
   - Gold: ___
   - Items: ___
4. Click "Play Tutorial Again"
5. Complete tutorial again (second run)
6. At victory screen, verify:
   - XP: ___ (should be ~130 = 65 × 2)
   - Gold: ___ (varies, should be ~60-120)
   - Items: ___ (should be starting + found items × 2)
7. Click "Save Character to File"
8. Verify JSON file downloads
9. Open Character Manager
10. Import the saved character
11. Verify all stats match final values
12. Load character and begin adventure
13. Verify character has accumulated progress

**Pass Criteria**: Progress accumulates correctly across runs

---

## 3. Feature-Specific Tests

### 3.1 Feature 1: Spell Selection

**Test Cases**:

1. [ ] **Cleric Spell Selection**
   - Create Cleric → Step 4 appears
   - See 4 cleric spells
   - Select Cure Light Wounds
   - Counter shows 1/1
   - Confirm enabled
   - Advance to Step 5

2. [ ] **Magic-User Spell Selection**
   - Create Magic-User → Step 4 appears
   - See 7 magic-user spells
   - Try selecting 2 spells → Second disables
   - Select Magic Missile
   - Confirm advances to Step 5

3. [ ] **Elf Spell Selection**
   - Create Elf → Step 4 appears
   - See same 7 spells as Magic-User
   - Selection works identically

4. [ ] **Fighter No Spell Selection**
   - Create Fighter → Step 4 skipped
   - Goes directly from Alignment (Step 3) to Finalize (Step 5)

5. [ ] **Spell Card Interaction**
   - Click spell card → Expands details
   - Click again → Collapses
   - Hover → Lift effect

### 3.2 Feature 2: Spell Casting

**Test Cases**:

1. [ ] **Cast Spell Button Visibility**
   - Fighter: No button ✅
   - Cleric: Button appears ✅
   - Magic-User: Button appears ✅

2. [ ] **Spell Menu Functionality**
   - Click "Cast Spell" → Menu opens
   - See selected spell
   - Spell shows effect
   - Click Cancel → Menu closes
   - Click outside → Menu closes

3. [ ] **Healing Spell Effect**
   - Cast Cure Light Wounds
   - Verify HP increases (1-7)
   - Verify narration shows healing
   - Verify spell slot consumed

4. [ ] **Damage Spell Effect**
   - Cast Magic Missile
   - Verify enemy takes damage (2-5)
   - Verify auto-hit (no miss possible)
   - Verify narration shows damage

5. [ ] **Spell Slot Depletion**
   - Cast 1 spell (only slot)
   - Try to cast again
   - Verify "Cast Spell" button disabled OR
   - Spell shows "No spell slots remaining"

### 3.3 Feature 3: Item Usage

**Test Cases**:

1. [ ] **Use Item Button**
   - In exploration → Button visible
   - In combat → Button visible (but menu filters items)

2. [ ] **Item Menu Functionality**
   - Click "Use Item" → Menu opens
   - See all inventory items
   - Items show icons, names, quantities
   - Click Cancel → Menu closes

3. [ ] **Healing Item**
   - Use Healing Potion
   - Verify HP increases
   - Verify potion removed
   - Verify narration

4. [ ] **Light Source**
   - Use Lantern
   - Verify narration shows light
   - Verify lantern remains

5. [ ] **Utility Item**
   - Use Rope
   - Verify contextual message
   - Verify rope remains

### 3.4 Feature 4: Random Treasure

**Test Cases**:

1. [ ] **Goblin Treasure**
   - Defeat Goblin 5 times
   - Gold range: 1-6 GP ✅
   - Dagger drops: 0-1 times out of 5 ✅

2. [ ] **Snake Treasure**
   - Defeat Snake 5 times
   - Gold range: 2-12 GP ✅
   - Potion drops: 0-1 times out of 5 ✅

3. [ ] **Rust Monster Treasure**
   - Defeat Rust Monster 5 times
   - Gold range: 3-30 GP ✅
   - Shield/Potion drops: Variable ✅

4. [ ] **Treasure Display**
   - Verify combat log shows gold
   - Verify combat log shows items
   - Verify narration shows "search body"
   - Verify victory screen totals

### 3.5 Feature 5: Character Progression

**Test Cases**:

1. [ ] **XP Accumulation**
   - Defeat Goblin → +5 XP
   - Defeat Snake → +10 XP
   - Defeat Rust Monster → +50 XP
   - Total: 65 XP ✅

2. [ ] **Victory Screen Stats**
   - Shows monsters defeated (3)
   - Shows rooms explored (5)
   - Shows final HP
   - Shows total gold

3. [ ] **Save Character**
   - Click "Save Character to File"
   - Verify JSON downloads
   - Verify contains XP, Gold, Items, Spells

4. [ ] **Play Again**
   - Click "Play Tutorial Again"
   - Adventure resets to entrance
   - Character keeps XP, Gold, Items
   - Complete tutorial again
   - Verify XP doubles (~130)

5. [ ] **Level-Up Detection** (Future)
   - Not yet implemented
   - Skip for now

---

## 4. Integration Tests

### 4.1 Combat + Spells

**Test**: Cast spell, then attack in same combat

**Steps**:
1. Create Cleric, select Cure Light Wounds
2. Enter combat with Goblin
3. Take damage (defend or let enemy hit)
4. Player turn → Cast Cure Light Wounds
5. Verify HP restored
6. Enemy turn → Take more damage
7. Player turn → Attack with weapon
8. Verify attack rolls normally

**Pass Criteria**: Both systems work together

### 4.2 Combat + Items + Treasure

**Test**: Use item mid-combat, then receive treasure

**Steps**:
1. Create Fighter with Healing Potion
2. Enter combat, take heavy damage
3. Win combat
4. Exit to exploration
5. Use Healing Potion
6. Return to combat
7. Defeat enemy
8. Receive treasure including new Healing Potion

**Pass Criteria**: Item use doesn't interfere with treasure

### 4.3 All Systems Together

**Test**: Full feature integration

**Steps**:
1. Create spellcasting class
2. Select spell during creation
3. Start with items in inventory
4. Enter combat
5. Cast spell
6. Use item (if possible)
7. Attack with weapon
8. Defeat enemy
9. Receive treasure (gold + items)
10. Use newly found item
11. Complete tutorial
12. Save character

**Pass Criteria**: All systems work harmoniously

---

## 5. Edge Cases & Error Handling

### 5.1 Edge Case Tests

1. [ ] **Empty Inventory**
   - Remove all items (dev console)
   - Click "Use Item"
   - Verify: "Inventory is empty" message

2. [ ] **No Spell Slots**
   - Cast only spell
   - Click "Cast Spell"
   - Verify: Button disabled OR spell grayed out

3. [ ] **HP at Max**
   - Use Healing Potion at full HP
   - Verify: HP doesn't exceed max
   - Verify: Still consumes potion

4. [ ] **HP at 0**
   - Let enemy kill character
   - Verify: Defeat screen appears
   - Verify: "Try Again" works

5. [ ] **Zero Gold**
   - Start character (30-180 GP)
   - Can't go negative
   - Treasure always adds

6. [ ] **Invalid Character Name**
   - Try names >30 characters
   - Try special characters
   - Verify validation

7. [ ] **Refresh During Combat**
   - Mid-combat, refresh browser
   - Verify: Combat state restored OR
   - Verify: Returns to safe state

### 5.2 localStorage Failure

1. [ ] **localStorage Full**
   - Fill localStorage (dev tools)
   - Try to save character
   - Verify: Graceful error handling

2. [ ] **localStorage Disabled**
   - Disable localStorage (private browsing)
   - Try to create character
   - Verify: Works without persistence OR
   - Verify: Warning message

3. [ ] **Corrupted Data**
   - Manually corrupt localStorage
   - Load application
   - Verify: Resets to initial state

---

## 6. Performance Tests

### 6.1 Load Time Tests

1. [ ] **Initial Load**
   - Clear cache
   - Navigate to app
   - Measure: Time to interactive
   - Target: <2 seconds

2. [ ] **Combat Turn**
   - Click "Attack"
   - Measure: Time to enemy turn
   - Target: <1 second

3. [ ] **Spell Cast**
   - Click "Cast Spell" → Select spell
   - Measure: Effect application
   - Target: <500ms

4. [ ] **Item Use**
   - Click "Use Item" → Select item
   - Measure: Effect application
   - Target: <500ms

5. [ ] **Treasure Generation**
   - Defeat enemy
   - Measure: Treasure roll + display
   - Target: <100ms

### 6.2 Memory Tests

1. [ ] **Memory Leaks**
   - Play tutorial 10 times
   - Monitor memory usage (dev tools)
   - Verify: No continuous growth

2. [ ] **Character Load**
   - Load 50 saved characters
   - Verify: App remains responsive

---

## 7. Browser Compatibility

### 7.1 Desktop Browsers

**Chrome/Edge**:
- [ ] Version: ___
- [ ] All features work ✅
- [ ] Animations smooth ✅
- [ ] No console errors ✅

**Firefox**:
- [ ] Version: ___
- [ ] All features work ✅
- [ ] Animations smooth ✅
- [ ] No console errors ✅

**Safari**:
- [ ] Version: ___
- [ ] All features work ✅
- [ ] Animations smooth ✅
- [ ] No console errors ✅

### 7.2 Mobile Browsers

**iOS Safari**:
- [ ] Version: ___
- [ ] Touch controls work ✅
- [ ] Responsive layout ✅
- [ ] No scroll issues ✅

**Chrome Mobile**:
- [ ] Version: ___
- [ ] Touch controls work ✅
- [ ] Responsive layout ✅
- [ ] Performance good ✅

---

## 8. Regression Tests

### 8.1 Previously Fixed Bugs

1. [ ] **Try Again Navigation** (Fixed Feb 15)
   - Die in combat
   - Click "Try Again"
   - Verify: Returns to adventure entrance
   - Verify: Character HP restored
   - Verify: NOT navigating to character creation

2. [ ] **Double Initiative Roll** (Fixed Feb 15)
   - Enter combat
   - Check console
   - Verify: Initiative only rolled once

3. [ ] **Enemy Turn Stuck** (Fixed Feb 15)
   - Player attack
   - Verify: Enemy turn executes automatically
   - Verify: No infinite waiting

4. [ ] **Character State Reset** (Fixed Feb 15)
   - Create character
   - Save and exit
   - Return, click "Create New Character"
   - Verify: Clean slate, no leftover data

---

## 9. Test Reporting

### 9.1 Test Results Template

```
Test Run: [Date/Time]
Tester: [Name]
Build: [Version/Commit]

=== AUTOMATED TESTS ===
Total: 83 tests
Passed: ___
Failed: ___
Skipped: ___
Coverage: ___%

=== MANUAL TESTS ===
Complete Tutorial Walkthrough (MT-001): [PASS/FAIL]
All Classes Test (MT-002): [PASS/FAIL]
Spell System Test (MT-003): [PASS/FAIL]
Item System Test (MT-004): [PASS/FAIL]
Treasure Variation Test (MT-005): [PASS/FAIL]
Character Progression Test (MT-006): [PASS/FAIL]

=== ISSUES FOUND ===
1. [Description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

=== BROWSER COMPATIBILITY ===
Chrome: [Version] - [PASS/FAIL]
Firefox: [Version] - [PASS/FAIL]
Safari: [Version] - [PASS/FAIL]

=== PERFORMANCE ===
Load time: [___] seconds
Combat turn: [___] ms
Spell cast: [___] ms
Item use: [___] ms

=== OVERALL RESULT ===
[PASS/FAIL]

Notes:
[Additional observations]
```

### 9.2 Bug Severity Classification

**Critical**: Blocks core functionality
- App won't load
- Can't create character
- Can't complete tutorial
- Data loss

**High**: Major feature broken
- Spell doesn't work
- Treasure doesn't generate
- Combat freezes
- Save doesn't work

**Medium**: Minor feature issue
- Visual glitch
- Wrong text
- Timing issue
- Rare edge case

**Low**: Cosmetic or enhancement
- Alignment issue
- Missing tooltip
- Could be clearer

---

## 10. Pre-Release Checklist

Before declaring production-ready:

- [ ] All automated tests pass (83/83)
- [ ] Manual test scenarios complete (MT-001 through MT-006)
- [ ] All 7 classes tested
- [ ] All functional spells tested
- [ ] All items tested
- [ ] Treasure variation confirmed
- [ ] Character progression verified
- [ ] All browsers tested (Chrome, Firefox, Safari)
- [ ] Mobile tested (iOS, Android)
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance targets met
- [ ] Regression tests pass
- [ ] Documentation updated
- [ ] README updated
- [ ] Deployment tested

---

## 11. Continuous Testing

### 11.1 Smoke Tests (Daily)

Quick verification that nothing broke:
1. Create character
2. Enter dungeon
3. Win one fight
4. Cast one spell (if caster)
5. Use one item
6. Check treasure received

**Duration**: 5 minutes  
**Frequency**: Daily during active development

### 11.2 Full Test Suite (Weekly)

Complete manual testing:
- All classes (90 min)
- All spells (60 min)
- All items (45 min)
- Integration (45 min)

**Duration**: 4 hours  
**Frequency**: Weekly or before releases

---

**End of Complete Testing Guide**

This document covers all testing requirements for The Old School RPG Demo. Update as new features are added.
