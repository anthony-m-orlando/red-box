```markdown
# User Requirements Document: "The Old School RPG Demo" (Revised)

## 1. Project Overview

### 1.1 Vision
Create a browser-based, single-player experience that recreates the feeling of solo D&D Basic gameplay from the 1980s. The interface should evoke the physical artifacts of tabletop gaming: character sheets, handwritten notes, and dungeon maps spread across a desk.

### 1.2 Core Principles
- **Solo Experience**: Single player controlling one character through a guided adventure
- **Analog Aesthetics**: UI metaphor of paper documents, folders, and hand-drawn maps
- **Faithful Mechanics**: Strict adherence to 1980s Basic Rules calculations and procedures
- **Offline-First**: Fully functional without internet connection after initial load

### 1.3 Technical Constraints
- **Infrastructure**: Purely client-side (HTML/JS/CSS)
- **No Backend**: No server-side processing or external databases
- **Mobile-First**: Responsive design optimized for touch interfaces
- **Deployment**: Single folder that can be hosted statically or run locally

---

## 2. User Interface Paradigm

### 2.1 The "Folder" Metaphor
The application presents as a collection of **tabbed documents** representing physical game materials:

#### Primary Tabs:
1. **Character Sheet** - Current stats, abilities, and equipment
2. **Inventory** - Detailed equipment list with encumbrance tracking
3. **Journal** - Adventure log and notes (user-editable text area)
4. **Map** - Top-down dungeon view showing explored areas and current position
5. **Reference** - Quick lookup for monsters, spells, and rules

### 2.2 Visual Design Goals
- Paper texture backgrounds
- Handwritten-style fonts for flavor text
- Graph paper aesthetic for maps
- Tabbed interface reminiscent of manila folder tabs
- Minimal animations; static, document-like presentation

---

## 3. Functional Requirements

### 3.1 Character Creation & Management

#### 3.1.1 Class Selection
- Support for 7 classic classes: Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling
- Display class requirements (minimum ability scores) during selection
- Show class features and restrictions before confirmation

#### 3.1.2 Ability Score Generation
- **Method**: 3d6 rolled in order (Strength, Intelligence, Wisdom, Dexterity, Constitution, Charisma)
- Auto-calculate modifiers based on 1980s table (-3 to +3)
- Display prime requisite and XP bonus percentage
- Option to "re-roll all" if stats don't qualify for any class

#### 3.1.3 Derived Statistics
- **Hit Points**: Auto-roll based on class Hit Die + Constitution modifier
- **Armor Class**: Base 9, adjusted by armor and Dexterity
- **Saving Throws**: Auto-populate from class/level table
- **THAC0**: Calculate attack bonus based on class and level

#### 3.1.4 Starting Equipment
- Pre-defined equipment packages by class (matching rulebook suggestions)
- Option for custom equipment selection within starting gold budget
- Automatic encumbrance calculation in coins

### 3.2 Character Sheet Tab

#### Display Elements:
- **Header Section**: Character name, class, level, XP (current/next)
- **Ability Scores Grid**: All six scores with modifiers displayed
- **Combat Stats Box**: 
  - Armor Class
  - Hit Points (current/max)
  - Attack Bonus (THAC0-derived)
- **Saving Throws Table**: Five categories with target numbers
- **Movement Rate**: Adjusted for encumbrance
- **Notes Field**: Free-text area for player notes

#### Interactive Elements:
- Click ability scores to see detailed modifier explanations
- Click HP to open healing/damage dialog
- Click XP to show progress bar to next level

### 3.3 Inventory Tab

#### Features:
- **Equipment List**: Item name, weight (in coins), quantity
- **Treasure Section**: Separate tracking for cp/sp/ep/gp/pp
- **Encumbrance Meter**: Visual indicator showing current load vs. capacity
- **Movement Adjustment**: Display how current weight affects movement rate
- **Item Actions**: 
  - Equip/unequip armor (adjusts AC)
  - Select weapon (sets damage for combat)
  - Consume items (rations, potions)

### 3.4 Journal Tab

#### Purpose:
Record-keeping for adventure events, discoveries, and personal notes.

#### Features:
- **Auto-Logged Entries**: System generates timestamped entries for:
  - Combats (opponent, outcome, damage dealt/taken)
  - Level gains
  - Treasure found
  - Significant events (doors opened, traps triggered)
- **Manual Entry Field**: Player can add custom notes
- **Search/Filter**: Find entries by keyword or date
- **Export**: Download journal as .txt file

### 3.5 Map Tab

#### Display:
- **Grid-Based Map**: 10-foot squares on graph paper background
- **Fog of War**: Only explored areas visible
- **Character Token**: Icon showing current position and facing
- **Room Labels**: Numbers or letters for identified rooms
- **Legend**: 
  - Doors (standard, secret, locked)
  - Stairs
  - Traps (if detected)
  - Monsters (if still alive)

#### Interactions:
- Click adjacent squares to move character
- Click doors to open/search/bash attempts
- Click room features to trigger descriptions or actions
- Toggle between "Exploration Mode" and "Combat Mode"

### 3.6 Combat System

#### Combat Interface:
When combat begins, the Map tab transforms into a **Combat Screen**:

1. **Enemy Status Box**:
   - Monster name and illustration (if available)
   - Armor Class
   - Hit Points (remaining)
   - Current status effects

2. **Character Action Panel**:
   - **Attack Button**: Uses equipped weapon, rolls to-hit and damage
   - **Cast Spell Button**: Opens spell selection (if applicable)
   - **Use Item Button**: Access to potions, scrolls, etc.
   - **Flee Button**: Attempt to escape (morale check)

3. **Combat Log**:
   - Scrolling text feed of actions and results
   - Example: "You swing your sword at the Goblin. Roll: 14 vs AC 7 - HIT! Damage: 6"

#### Turn Sequence:
1. **Initiative Roll** (1d6 per side, automatic)
2. **Player Turn** (if won initiative):
   - Select action from Character Action Panel
   - System resolves action and displays result
3. **Monster Turn**:
   - System automatically resolves monster action
   - Display attack roll and damage (if hit)
4. **Repeat** until combat ends (flee, victory, or defeat)

#### Resolution:
- **Victory**: XP awarded (auto-calculated from monster HD), treasure distributed, return to Map
- **Defeat**: "Game Over" screen with option to load last save or create new character
- **Flee Success**: Return to Map with notation in Journal

### 3.7 Starting Adventure: "In Search of the Unknown"

#### Implementation:
Package the introductory dungeon from the Basic Set rulebook as the default adventure:

**Adventure Structure:**
- Pre-mapped dungeon with 30+ rooms
- Mix of empty rooms, monster encounters, and traps
- Treasure placement randomized on each playthrough
- Victory condition: Defeat Bargle the Magician and rescue Aleena

**Narrative Delivery:**
- **Room Descriptions**: Display boxed text when entering new areas
- **Choice Points**: Present dialog options for key encounters
- **Environmental Clues**: Highlight searchable objects in text

**Progression Tracking:**
- Auto-save after each room cleared
- Update Journal with major events
- Quest objectives listed in Journal tab

---

## 4. Data Persistence

### 4.1 Storage Requirements

#### Character Data:
- All character sheet values
- Current inventory and treasure
- Journal entries
- Map exploration state (which rooms visited)
- Combat state (if mid-encounter)

#### Storage Method:
- **Primary**: IndexedDB for structured data
- **Fallback**: localStorage if IndexedDB unavailable
- **Auto-Save**: After every significant action (combat, room entry, level gain)
- **Manual Save**: Button in Character Sheet to force save

### 4.2 Import/Export System

#### Export Features:
- **Character Export**: Download character.json with full state
- **Journal Export**: Download journal.txt as plain text
- **Save Slot Export**: Export entire game state (character + adventure progress)

#### Import Features:
- **Character Import**: Upload character.json to restore character
- **Validation**: Check JSON schema version and migrate if needed
- **Conflict Resolution**: Prompt user if importing over existing character

---

## 5. Dice Rolling System

### 5.1 Dice Roller Widget
A **persistent mini-panel** accessible from any tab:

**Features:**
- Buttons for d4, d6, d8, d10, d12, d20
- "Roll" button with last result displayed
- History of last 10 rolls
- Modifier input field (+/- adjustment)

**Use Cases:**
- Manual ability checks
- Random encounter rolls
- Damage verification
- General play utility

### 5.2 Integrated Rolling
- Combat attacks: Auto-roll to-hit and damage
- Saving throws: One-click resolution with target number shown
- Ability checks: Click ability score to roll d20 under/over check

---

## 6. Reference Tab

### 6.1 Monster Quick Reference

**Data Display:**
- Alphabetical list of common monsters
- Expandable entries showing:
  - Hit Dice
  - Armor Class
  - Attacks and Damage
  - Special Abilities
  - XP Value

**Monsters to Include (Minimum):**
- Goblin, Kobold, Orc, Gnoll
- Skeleton, Zombie, Ghoul
- Giant Rat, Giant Bat, Giant Centipede
- Carrion Crawler, Gelatinous Cube
- Harpy, Medusa, Minotaur

### 6.2 Spell Lists
(For Magic-Users and Clerics)

**Display:**
- Spells grouped by level
- Expandable entries showing:
  - Range
  - Duration
  - Effect description

**Spell Selection:**
- Click to add to "Prepared Spells" section of Character Sheet
- Track spell slots (e.g., 1st level Magic-User has one spell per day)

### 6.3 Equipment Reference

**Categories:**
- Weapons (damage, cost, weight)
- Armor (AC, cost, weight)
- Adventuring Gear (cost, weight)
- Treasure conversion rates

---

## 7. Mobile Optimization

### 7.1 Responsive Layout
- **Portrait Mode**: Single-column, full-width tabs
- **Landscape Mode**: Two-column where appropriate (e.g., Character Sheet + Map)
- **Touch Targets**: Minimum 44x44px for all interactive elements

### 7.2 Swipe Navigation
- Swipe left/right to switch between tabs
- Swipe up on combat log to see full history

### 7.3 Offline Capability
- Service Worker to cache all assets
- "Add to Home Screen" prompt for mobile users
- Local-only operation after initial download

---

## 8. Success Criteria

### 8.1 Functional Requirements
- ✅ Complete character creation in under 3 minutes
- ✅ All dice rolls and calculations match rulebook tables
- ✅ Zero data loss across browser sessions
- ✅ Full adventure playable from start to finish

### 8.2 Performance Targets
- Page load: <3 seconds on 3G connection
- Combat turn resolution: <500ms
- Map rendering: 60fps on mid-range mobile devices

### 8.3 User Experience Goals
- New players can start adventuring with no external rulebook
- Veteran players recognize authentic Basic Set mechanics
- Interface feels like reviewing physical game materials

---

## 9. Out of Scope (Future Versions)

The following features are **not** included in v1.0:

- Multiple character party management
- Multiplayer or shared sessions
- Character portrait uploads
- Custom adventure creation tools
- Audio/music/sound effects
- Animated combat visualizations
- Integration with virtual tabletops
- PDF character sheet generation

---

## 10. Development Roadmap Suggestion

**Phase 1: Foundation (Weeks 1-2)**
- Character creation flow
- Character sheet display and editing
- Data persistence (IndexedDB + localStorage)

**Phase 2: Adventure Engine (Weeks 3-4)**
- Map rendering and exploration
- Room description system
- Inventory management

**Phase 3: Combat System (Weeks 5-6)**
- Turn-based combat interface
- Attack resolution
- Monster AI (basic)

**Phase 4: Content & Polish (Weeks 7-8)**
- Implement starting adventure
- Journal auto-logging
- Reference tab population
- Mobile testing and optimization

---

## Appendix: Data Structure Examples

### Character Save Format
```json
{
  "schema": "basic-dnd-v1",
  "character": {
    "name": "Ragnar",
    "class": "Fighter",
    "level": 1,
    "xp": 0,
    "abilities": {
      "strength": 16,
      "intelligence": 10,
      "wisdom": 12,
      "dexterity": 14,
      "constitution": 15,
      "charisma": 9
    },
    "hitPoints": {"max": 9, "current": 9},
    "armorClass": 5,
    "saves": [12, 13, 14, 15, 16],
    "equipment": [...],
    "treasure": {"gp": 40, "sp": 0, "cp": 0}
  },
  "adventure": {
    "dungeonId": "search-unknown",
    "currentRoom": 1,
    "exploredRooms": [1],
    "defeatedMonsters": [],
    "foundTreasure": []
  },
  "journal": [
    {"timestamp": "2025-02-13T10:00:00Z", "entry": "Entered the dungeon..."}
  ]
}
```

### Map Data Format
```json
{
  "roomId": 27,
  "coordinates": {"x": 5, "y": 3},
  "description": "This large chamber echoes...",
  "exits": {
    "north": {"type": "door", "locked": false, "leads": 28},
    "east": {"type": "secret", "discovered": false, "leads": 30}
  },
  "contents": {
    "monster": "goblin",
    "treasure": "chest-A",
    "trap": null
  }
}
```

---

**End of User Requirements Document**

This revised specification focuses on delivering an intimate, solo dungeon-crawling experience through a document-based interface that respects the source material while providing modern conveniences.
```