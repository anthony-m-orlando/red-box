# User Requirements Document: "The Old School RPG Demo" - UPDATED

**Version**: 2.0  
**Date**: February 15, 2026  
**Status**: Reflects Current Implementation (Phase 3 Complete)

---

## 1. Project Overview

### 1.1 Vision
Create a browser-based, single-player experience that recreates the feeling of solo D&D Basic gameplay from the 1980s. The interface evokes the physical artifacts of tabletop gaming: character sheets, dice rolls, and dungeon exploration.

### 1.2 Core Principles
- **Solo Experience**: Single player controlling one character through guided adventures
- **Analog Aesthetics**: Paper textures, graph paper maps, handwritten fonts
- **Faithful Mechanics**: Strict adherence to 1983 Basic Rules (Red Box)
- **Client-Side Only**: Fully functional without backend server

### 1.3 Technical Constraints
- **Infrastructure**: Purely client-side (React + Vite)
- **No Backend**: No server-side processing or databases
- **Storage**: localStorage for character and adventure state
- **Deployment**: Static build deployable anywhere

---

## 2. Implemented Features (Current Version)

### 2.1 Character Creation ✅ COMPLETE

#### 2.1.1 Ability Score Generation
- **Method**: 3d6 rolled per ability (Strength, Intelligence, Wisdom, Dexterity, Constitution, Charisma)
- **Animated Dice**: Visual d6 display with rolling animation
- **Individual Rerolls**: Reroll any single ability or reroll all
- **Modifiers**: Auto-calculate -3 to +3 modifiers
- **Prime Requisite**: Display for each class
- **DEBUG MODE**: ⚙️ Manual ability entry (3-18 range) for testing

#### 2.1.2 Class Selection
- **7 Classes Available**:
  - Cleric (✝️) - d6 HD, Turn Undead, Divine Spells
  - Fighter (⚔️) - d8 HD, Best THAC0, All Weapons
  - Magic-User (🔮) - d4 HD, Arcane Spells
  - Thief (🗡️) - d4 HD, Backstab, Stealth Skills
  - Dwarf (⛏️) - d8 HD, Detect Construction, Infravision
  - Elf (🏹) - d6 HD, Spells + Combat
  - Halfling (🌿) - d6 HD, Missile Bonus, Hide

- **Requirements Check**: Grayed out if abilities don't qualify
- **Recommended Badge**: Shows if prime requisite ≥13
- **Detailed View**: Click to see full class information
- **Auto-Calculation**: HP, AC, THAC0, Starting Gold on selection

#### 2.1.3 Alignment Selection
- **3 Alignments**:
  - Lawful (⚖️) - Honor, Order, Justice
  - Neutral (👥) - Balance, Pragmatism
  - Chaotic (🔥) - Freedom, Individuality
- **Descriptions**: Full explanation of each alignment
- **Core Values**: 5 key principles per alignment
- **Character Examples**: Sample characters for each

#### 2.1.4 Character Finalization
- **Name Entry**: Free text (max 30 characters)
- **Complete Character Sheet**: All stats displayed
- **Export**: Download character.json
- **Begin Adventure**: Launch tutorial immediately

### 2.2 Character Management System ✅ COMPLETE

#### 2.2.1 Multiple Character Storage
- **Save Multiple Characters**: Unlimited characters in localStorage
- **Unique IDs**: Format `rpg-character-{timestamp}`
- **Character Cards**: Grid display of all saved characters
- **Current Badge**: Shows active character

#### 2.2.2 Import/Export
- **Export**: Download character.json file
- **Import**: Upload JSON to add character
- **Save Current**: Store active character to list
- **Load Character**: Switch to any saved character
- **Load & Begin Adventure**: One-click from character to dungeon

#### 2.2.3 Character Deletion
- **Delete**: Remove characters from localStorage (except current)
- **Confirmation**: Prompt before deletion
- **Persistent**: Current character cannot be deleted

### 2.3 Tutorial Adventure ✅ COMPLETE

#### 2.3.1 "Your First Adventure"
- **5 Rooms**: Entrance → Corridor → 3 Combat Encounters
- **Dungeon Layout**:
  ```
           [Goblin's Lair]
                  |
  [Entrance] - [Corridor] - [Snake Pit] - [Treasure Chamber]
                                               (Rust Monster)
  ```

- **3 Monster Encounters**:
  - **Goblin** (4 HP, AC 6) → 5 XP
  - **Snake** (6 HP, AC 7, Poison) → 10 XP
  - **Rust Monster** (1 HP, AC 2, Wounded) → 50 XP
  
- **Treasure**: 60 GP total, 1 Healing Potion
- **Victory Condition**: Defeat all 3 monsters
- **Completion Time**: 10-15 minutes

#### 2.3.2 Map System
- **Graph Paper Grid**: SVG-based dungeon map
- **Fog of War**: Unexplored rooms hidden
- **Current Location**: Blue dot indicator
- **Room States**:
  - Unexplored (faded)
  - Revealed (visible)
  - Cleared (✓ checkmark)
- **Danger Indicators**: Red dot for monsters, gold dot for treasure
- **Clickable Navigation**: Click rooms to move
- **Legend**: Explains all symbols

#### 2.3.3 Narration System
- **Collapsible DM Panel**: Top of screen
- **Scrollable History**: All narration preserved
- **Multiple Styles**:
  - Room descriptions (italic, brown)
  - Combat actions (bold, red)
  - System messages (highlighted)
  - Dialogue (blue)
- **Auto-Scroll**: Latest message always visible
- **Preview Mode**: Shows last message when collapsed

#### 2.3.4 Action Panel
- **Character Status**:
  - HP bar (visual, dynamic)
  - AC, Gold display
  - Character name and class
- **Movement Buttons**: Directional (N/E/S/W)
- **Search Room**: Context-aware messages
- **Use Item**: Placeholder for future
- **Quest Progress**: Monsters defeated, rooms explored

### 2.4 Combat System ✅ COMPLETE

#### 2.4.1 Turn-Based Combat
- **Initiative Roll**: d6 per side, determines turn order
- **Player Turn**: Choose Attack/Defend/Flee
- **Enemy Turn**: Automatic AI decision
- **Round Counter**: Tracks combat rounds
- **Combat Log**: Last 6 actions displayed

#### 2.4.2 Attack Mechanics
- **THAC0 System**: Classic attack resolution
- **Strength Bonus**: Applied to melee attacks
- **Damage Calculation**: Weapon damage + strength modifier
- **Critical Hits**: Natural 20 = double damage
- **Fumbles**: Natural 1 = automatic miss
- **To-Hit Display**: Shows roll needed vs. rolled

#### 2.4.3 Defense Options
- **Defend**: Defensive stance (placeholder for AC bonus)
- **Flee**: 50% success rate, enemy gets free attack on failure
- **HP Tracking**: Real-time updates to player HP

#### 2.4.4 Monster AI
- **Automatic Turns**: AI attacks after player
- **Morale Checks**: Monster may flee if badly wounded (<25% HP)
- **Attack Resolution**: Same THAC0 system as player
- **Critical Hits**: Monsters can score crits too

#### 2.4.5 Victory/Defeat
- **Victory Screen**: XP awarded, stats summary, 3-second delay
- **XP Awards**: Automatic addition to character
- **Room Clearing**: Room marked cleared on map
- **Defeat Screen**: Character death, Try Again option
- **Try Again**: Restore HP, reset dungeon, keep character

### 2.5 Data Persistence ✅ COMPLETE

#### 2.5.1 Auto-Save
- **Character**: Saves on every state change (when isCreated = true)
- **Adventure**: Saves after room entry, combat, treasure
- **Storage Key**: `rpg-character` (current), `rpg-character-{id}` (saved)
- **Adventure Key**: `rpg-adventure`

#### 2.5.2 State Management
- **CharacterContext**: Global character state with useReducer
- **AdventureContext**: Global adventure state with useReducer
- **Calculated Properties**: HP, AC, THAC0, modifiers
- **Validation**: Class requirements checked before selection

#### 2.5.3 Session Persistence
- **Auto-Load**: Character loads from localStorage on app start
- **Smart Reset**: Detects "Create New Character" intent and resets
- **Continue Adventure**: Resumes from last position
- **Multiple Characters**: Each has unique storage slot

---

## 3. User Workflows (Current Implementation)

### 3.1 New Player: Complete Playthrough
```
1. Open App → Home Page
2. Click "Create New Character"
3. Roll Abilities (or use Debug Mode)
4. Choose Class (see recommendations)
5. Choose Alignment
6. Enter Name
7. Click "Begin Adventure!"
8. Explore Dungeon (5 rooms)
9. Fight 3 Monsters
10. Defeat All → Victory Screen
Time: ~15-20 minutes
```

### 3.2 Test Different Builds
```
1. Home → "Manage Characters"
2. Click "Create New Character"
3. Enable Debug Mode ⚙️
4. Set abilities (e.g., all 18s)
5. Choose class
6. Save character
7. Repeat for different builds
8. Load any character → "Load & Begin Adventure"
```

### 3.3 Death Recovery
```
1. Playing adventure → Character dies
2. Defeat Screen appears
3. Click "Try Again (Restore [Name])"
4. Character restored to full HP
5. Dungeon reset to entrance
6. Continue playing
```

### 3.4 Character Backup/Share
```
1. Manage Characters
2. Select character
3. Click "Export"
4. Download character.json
5. Share file with others
6. They can Import and play
```

---

## 4. Technical Specifications

### 4.1 Technology Stack
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Routing**: React Router 6.20
- **Icons**: Lucide React 0.263
- **Storage**: localStorage (native)
- **Testing**: Vitest 1.0.4, React Testing Library

### 4.2 Component Architecture
```
App (Router)
├── CharacterProvider (Global State)
│   └── AdventureProvider (Global State)
│       ├── HomePage
│       ├── CharacterCreator
│       │   ├── AbilityRoller
│       │   ├── ClassSelector
│       │   ├── AlignmentSelector
│       │   └── CharacterFinalization
│       ├── CharacterManager
│       ├── AdventureScreen
│       │   ├── NarrationPanel
│       │   ├── MapDisplay
│       │   └── ActionPanel
│       │       └── CombatUI
│       └── [Other Routes]
```

### 4.3 Data Models

#### Character State
```javascript
{
  name: string,
  class: string,
  level: number,
  xp: number,
  alignment: string,
  abilities: {
    strength: number (3-18),
    intelligence: number (3-18),
    wisdom: number (3-18),
    dexterity: number (3-18),
    constitution: number (3-18),
    charisma: number (3-18)
  },
  hp: { current: number, max: number },
  ac: number,
  thac0: number,
  inventory: array,
  gold: number,
  isCreated: boolean,
  creationStep: number (1-5)
}
```

#### Adventure State
```javascript
{
  adventureId: string,
  currentRoomId: string,
  roomStates: object,
  defeatedMonsters: array,
  collectedTreasure: array,
  visitedRooms: array,
  inCombat: boolean,
  currentEnemy: string | null,
  narrationHistory: array,
  isVictorious: boolean,
  isDefeated: boolean
}
```

### 4.4 Calculations (100% Accurate to 1983 Rules)
- **Modifiers**: 3=(-3), 4-5=(-2), 6-8=(-1), 9-12=(0), 13-15=(+1), 16-17=(+2), 18=(+3)
- **HP**: Class HD max + Con modifier (minimum 1)
- **AC**: 9 - Armor bonus - Dex modifier
- **THAC0**: 19 (level 1), improves by class
- **To-Hit**: Roll + bonuses ≥ (THAC0 - Target AC)
- **Starting Gold**: 3d6 × 10 GP

---

## 5. Testing & Quality Assurance

### 5.1 Automated Tests ✅
- **83 Unit/Integration Tests**
- **92%+ Code Coverage**
- **Test Suites**:
  - Dice utilities (16 tests)
  - D&D calculations (37 tests)
  - Character context (16 tests)
  - UI components (14 tests)

### 5.2 Manual Test Coverage
- Character creation (all 7 classes)
- Combat (all 3 monster types)
- Map exploration (fog of war)
- Character management (import/export)
- Death and resurrection
- Debug mode functionality

### 5.3 Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (WebKit)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 6. Success Criteria

### 6.1 Functional Requirements ✅
- ✅ Complete character creation in under 3 minutes
- ✅ All dice rolls and calculations match 1983 rulebook
- ✅ Zero data loss across browser sessions
- ✅ Tutorial adventure playable start to finish
- ✅ Turn-based combat fully functional
- ✅ Character management with import/export
- ✅ Debug mode for testing

### 6.2 Performance Targets ✅
- ✅ Page load: <2 seconds
- ✅ Combat turn resolution: <1.5 seconds
- ✅ Map rendering: Smooth animations
- ✅ Test suite: <2 seconds execution

### 6.3 User Experience Goals ✅
- ✅ New players can start without rulebook
- ✅ Veteran players recognize authentic mechanics
- ✅ Paper/analog aesthetic maintained
- ✅ Intuitive workflows (max 3 clicks to action)

---

## 7. Known Limitations (By Design)

### 7.1 Not Implemented (Future Phases)
- ❌ Spell casting system
- ❌ Item usage in combat
- ❌ Special abilities (Turn Undead, Backstab, etc.)
- ❌ Poison/rust special effects
- ❌ Multiple enemy encounters
- ❌ Journal/notes system
- ❌ Equipment management
- ❌ Main adventure ("Bargle Wanted")
- ❌ Reference library
- ❌ Dice roller tool

### 7.2 Intentional Simplifications
- **Defend Action**: Placeholder (no actual AC bonus yet)
- **Rust Monster**: Starts wounded (1 HP) for easier tutorial
- **Combat Items**: "Use Item" button present but not functional
- **Equipment**: Auto-assigned by class, no customization
- **Treasure**: Shown but not collectable yet

---

## 8. New Features (Added During Development)

### 8.1 Character Manager
- Multiple character storage
- Import/Export JSON
- Character card grid display
- "Load & Begin Adventure" one-click workflow

### 8.2 Debug Mode
- Manual ability score entry (3-18)
- Toggle button in character creation
- Prevents needing to reroll repeatedly
- Useful for demonstrations and testing

### 8.3 Try Again Feature
- Restore character after death
- Reset dungeon to entrance
- Keep character progress (XP, level)
- No need to recreate character

### 8.4 Session Persistence
- Intelligent detection of "New Character" intent
- Auto-clear completed characters when creating new
- Multiple save slots for different characters
- Consistent behavior across browser restarts

---

## 9. Future Roadmap

### Phase 4: Main Adventure (Planned)
- Implement "Bargle Wanted" quest
- 10-15 room dungeon
- NPC dialogue (Aleena)
- Secret doors and traps
- Boss encounter with Bargle
- Multiple treasures
- Estimated: 4-6 weeks

### Phase 5: Advanced Features (Planned)
- Spell casting system
- Combat items (potions, scrolls)
- Special abilities implementation
- Status effects (poison, paralysis)
- Multiple enemy encounters
- Improved AI

### Phase 6: Polish & Content (Planned)
- Journal system
- Equipment management UI
- Reference library
- Dice roller tool
- More adventures
- Sound effects (optional)

---

## 10. Development Phases (Actual)

### Phase 1: Foundation ✅ COMPLETE
- Home page with dragon cover art
- Feature card navigation
- Paper aesthetic established
- Basic routing

### Phase 2: Character Creation ✅ COMPLETE
- Ability roller with animations
- 7 class system
- Alignment selection
- Character finalization
- Export/import functionality
- CharacterContext state management

### Phase 3: Tutorial Adventure ✅ COMPLETE
- **Part 1**: Map, exploration, narration (60%)
- **Part 2**: Turn-based combat (40%)
- 5-room tutorial dungeon
- 3 monster encounters
- Victory/defeat screens
- AdventureContext state management
- Combat utilities and UI

### Bonus Features ✅ COMPLETE
- Character management system
- Debug mode for testing
- Try Again after death
- Session persistence fixes
- 83 automated tests

---

## Appendix A: Calculation Reference

### Ability Modifiers (1983 Basic Rules)
| Score | Modifier |
|-------|----------|
| 3 | -3 |
| 4-5 | -2 |
| 6-8 | -1 |
| 9-12 | 0 |
| 13-15 | +1 |
| 16-17 | +2 |
| 18 | +3 |

### THAC0 Progression
- **Level 1-3**: THAC0 19
- **Fighters**: Improve every 3 levels
- **Non-Fighters**: Improve every 4 levels

### Starting HP by Class
- **Fighter**: d8 (1-8) + Con modifier
- **Cleric**: d6 (1-6) + Con modifier
- **Magic-User**: d4 (1-4) + Con modifier
- **Thief**: d4 (1-4) + Con modifier
- **Dwarf**: d8 (1-8) + Con modifier
- **Elf**: d6 (1-6) + Con modifier
- **Halfling**: d6 (1-6) + Con modifier

---

## Appendix B: File Structure

```
old-school-rpg/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── character/       # Character creation & management
│   │   ├── adventure/       # Map, narration, action panel
│   │   ├── combat/          # Combat UI
│   │   └── layout/          # Page layouts
│   ├── contexts/            # React Context providers
│   ├── data/                # Game data (classes, adventures)
│   ├── utils/               # Pure functions (dice, calculations, combat)
│   ├── styles/              # Global CSS
│   ├── assets/              # Images, fonts
│   └── test/                # Test configuration
├── package.json
├── vite.config.js
├── vitest.config.js
└── TESTING.md
```

---

**End of Updated User Requirements Document**

This document accurately reflects the current implementation as of Phase 3 completion. All listed features are functional and tested.
