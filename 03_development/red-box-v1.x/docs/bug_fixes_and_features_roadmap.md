# Bug Fixes + 7 New Features Implementation Roadmap

**Date**: February 16, 2026  
**Status**: Bugs Fixed ✅ | Features In Progress  

---

## ✅ Bugs Fixed (3/3)

### Bug 1: Character Manager Delete
**Issue**: Not all characters had delete button  
**Fix**: Removed `!isCurrent` condition on delete button  
**File**: `CharacterManager.jsx` line 285  
**Status**: ✅ FIXED

### Bug 2: Duplicate Initial Narration
**Issue**: Welcome message displayed twice on adventure start  
**Fix**: Added `useRef` to track initialization, only run once  
**File**: `AdventureScreen.jsx` lines 1, 20, 29-38  
**Status**: ✅ FIXED

### Bug 3: Duplicate Map Grids
**Issue**: Two overlapping grids in map display  
**Fix**: Removed SVG grid pattern, kept CSS grid from PaperContainer  
**File**: `MapDisplay.jsx` lines 34-36  
**Status**: ✅ FIXED

---

## 🎯 New Features Implementation Plan (7 Features)

### Feature 1: Dice Roller
**Priority**: Medium  
**Complexity**: Low  
**Time**: 1-2 hours

**Requirements**:
- Standalone dice roller component
- Accessible from main menu or during gameplay
- Roll any standard dice (d4, d6, d8, d10, d12, d20, d100)
- Show animation
- Show result + history
- Multiple dice support (e.g., 3d6)

**Files to Create**:
- `src/components/tools/DiceRoller.jsx`
- `src/components/tools/DiceRoller.css`

**Files to Modify**:
- `src/App.jsx` (add route)
- `src/components/layout/HomePage.jsx` (add link)

---

### Feature 2: Bestiary
**Priority**: Medium  
**Complexity**: Medium  
**Time**: 2-3 hours

**Requirements**:
- Bestiary viewer component
- List all monsters in tutorial (3 + future expansion)
- Show stats: HP, AC, THAC0, damage, XP, description
- Filter by defeated/not defeated
- Beautiful monster cards
- Graph paper aesthetic

**Files to Create**:
- `src/components/tools/Bestiary.jsx`
- `src/components/tools/Bestiary.css`
- `src/data/bestiary.js` (centralize monster data)

**Files to Modify**:
- `src/App.jsx` (add route)
- `src/components/layout/HomePage.jsx` (add link)

---

### Feature 3: Enhanced Spell Functionality
**Priority**: HIGH  
**Complexity**: Medium-High  
**Time**: 3-4 hours

**Requirements**:

**Shield**:
- Apply +4 AC bonus for 2 turns
- Track buff duration
- Remove buff after 2 turns or end of combat

**Sleep**:
- Roll 2d8 HD affected
- Put weakest enemies to sleep
- Skip sleeping enemies' turns
- Wake on damage

**Detect Evil**:
- Show direction to Goblin if alive
- Show narration: "You sense evil to the NORTH"
- Only works once per room

**Protection from Evil**:
- Apply +1 AC vs evil creatures
- Track buff duration (6 turns)

**Other Spells (Charm, Read Magic, etc.)**:
- Add narration explaining effect
- Message: "The spell fizzles without effect in this situation"

**Files to Modify**:
- `src/utils/spells.js` (enhance effects)
- `src/data/spells.js` (update implementations)
- `src/components/combat/CombatUI.jsx` (buff tracking)
- `src/contexts/CharacterContext.jsx` (buff state)

---

### Feature 4: Rest System
**Priority**: HIGH  
**Complexity**: Low-Medium  
**Time**: 1-2 hours

**Requirements**:
- "Rest" button in exploration (not combat)
- Can only be used ONCE per adventure
- Restores: 4 HP + Constitution modifier
- Visual feedback (resting animation/message)
- Track if rest has been used

**Files to Create**:
- None (integrate into existing)

**Files to Modify**:
- `src/components/adventure/ActionPanel.jsx` (add Rest button)
- `src/contexts/AdventureContext.jsx` (track hasRested)
- `src/contexts/CharacterContext.jsx` (rest action)

---

### Feature 5: Enhanced Item System
**Priority**: HIGH  
**Complexity**: Medium  
**Time**: 2-3 hours

**Requirements**:

**Rations**:
- Change from "1 week" to "7 rations" with quantity=7
- Consuming 1 ration heals 1d4 HP
- Decrement quantity on use
- Can be used between rests

**Quantity System**:
- Add proper quantity tracking
- Display quantity in item menu (×7)
- Decrement consumables on use
- Remove items when quantity=0

**Files to Modify**:
- `src/utils/items.js` (update ration effect, quantity logic)
- `src/components/adventure/ItemMenu.jsx` (show quantity)
- `src/contexts/CharacterContext.jsx` (decrement quantity action)

---

### Feature 6: Darkness & Light Sources
**Priority**: MEDIUM  
**Complexity**: Medium-High  
**Time**: 2-3 hours

**Requirements**:
- Dungeon is dark by default
- Dwarves/Elves have infravision (always see)
- Humans/Halflings need light source
- "Light Torch" action for humans
- Track lit torch status
- Combat possible in darkness (penalties?)
- Visual: Darken rooms without light

**Files to Modify**:
- `src/components/adventure/ActionPanel.jsx` (Light Torch button)
- `src/components/adventure/MapDisplay.jsx` (darken unlit rooms)
- `src/contexts/AdventureContext.jsx` (track light status)
- `src/data/classes.js` (add infravision property)

---

### Feature 7: Pit Trap in Dark Corridor
**Priority**: MEDIUM  
**Complexity**: Medium  
**Time**: 2-3 hours

**Requirements**:

**Trap Mechanics**:
- Pit trap in tutorial_corridor room
- Dwarves: Automatic detection (special ability)
- Thieves: Automatic detection (special ability)
- Other classes: 1-in-6 chance

**Detection**:
- "Search Room" action triggers detection roll
- If found: "You discover a pit trap!"
- Mark trap as discovered

**Triggering**:
- Moving through room without discovering = trigger
- Roll save vs. Death Ray
- Fail: 1d6 damage
- Success: Avoid damage

**Visual**:
- Show trap icon on map if discovered
- Warning message if trap ahead

**Files to Modify**:
- `src/data/tutorialAdventure.js` (add trap to corridor)
- `src/components/adventure/ActionPanel.jsx` (Search Room)
- `src/contexts/AdventureContext.jsx` (track discovered traps)
- `src/utils/combat.js` (trap damage logic)

---

## Implementation Order (Recommended)

### Phase 1: Core Mechanics (4-6 hours)
1. Feature 4: Rest System (easiest, foundational)
2. Feature 5: Enhanced Items (builds on rest)
3. Feature 3: Enhanced Spells (critical for gameplay)

### Phase 2: UI Features (3-5 hours)
4. Feature 1: Dice Roller (standalone)
5. Feature 2: Bestiary (standalone)

### Phase 3: Advanced Mechanics (4-6 hours)
6. Feature 6: Darkness & Light (complex)
7. Feature 7: Pit Trap (complex, uses mechanics from #6)

**Total Estimated Time**: 11-17 hours

---

## Testing Strategy

### After Each Feature
- Manual test the feature
- Verify no regressions
- Update automated tests

### Final QA
- Complete tutorial walkthrough
- Test all 7 classes
- Test all new features
- Edge cases (rest twice, trap variations)
- Browser compatibility

---

## Current Status

✅ Bugs Fixed: 3/3  
⏳ Features Complete: 0/7  
📋 Ready to Begin: Feature 4 (Rest System)

---

**Next Steps**: Implement Feature 4 (Rest System) as it's the simplest and most foundational.
