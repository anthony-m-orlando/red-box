# System Design Document: Old School RPG Game
## Version 0.1.0 - Production Release

**Project**: Dungeons & Dragons Basic Set Recreation  
**Version**: 0.1.0 (Beta Release)  
**Last Updated**: February 23, 2026  
**Status**: ✅ Production Ready

---

## 1. Executive Summary

### 1.1 System Overview
This document describes the complete system design for a browser-based, single-player recreation of the 1980s Dungeons & Dragons Basic Set. The application faithfully implements classic D&D mechanics including THAC0 combat, spell casting, character progression, and dungeon exploration, while providing a modern, accessible user interface.

### 1.2 Current State (v0.1.0)
- **Status**: Production-ready beta release
- **Features**: Complete character creation, 3 adventures, 10 monsters, turn-based combat, spell system
- **Technology**: React 18 SPA with localStorage persistence
- **Deployment**: Static web application
- **Playtime**: 2-4 hours of content

### 1.3 System Goals
1. **Authenticity**: Faithful implementation of 1981 D&D Basic rules
2. **Accessibility**: Easy-to-use interface for solo play
3. **Performance**: Smooth, responsive gameplay
4. **Reliability**: Robust save system with data integrity
5. **Maintainability**: Clean, modular codebase for future expansion

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  (React Components: Character, Adventure, Combat, Tools)    │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                   Application Logic Layer                    │
│    (Contexts: Character, Adventure, Game State Management)  │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│     (Utils: Combat, Dice, Spells, Items, Calculations)     │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                       Data Layer                             │
│   (Static Data: Classes, Monsters, Adventures, Spells)     │
│        (Storage: localStorage for save data)                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

**Core Framework**:
- React 18.2.0 (Component-based UI)
- React Router 6.x (Client-side routing)
- JavaScript ES2020+ (Modern language features)

**Build & Development**:
- Vite 5.x (Fast build tool and dev server)
- ESLint (Code quality)
- PostCSS (CSS processing)

**Storage**:
- Browser localStorage API (Save data persistence)
- JSON serialization (Data format)
- Version checking (Data migration)

**Audio**:
- Web Audio API (Procedural sound generation)
- No external audio files

**Deployment**:
- Static file hosting (Netlify, Vercel, GitHub Pages compatible)
- No backend required
- CDN-friendly

### 2.3 Project Structure

```
/old-school-rpg
├── /public
│   └── favicon.ico
├── /src
│   ├── /components
│   │   ├── /adventure
│   │   │   ├── ActionPanel.jsx          # Exploration actions
│   │   │   ├── AdventureScreen.jsx      # Main adventure container
│   │   │   ├── AdventureSelection.jsx   # Choose adventure
│   │   │   ├── MapDisplay.jsx           # Dungeon map grid
│   │   │   ├── NarrationPanel.jsx       # DM text display
│   │   │   └── ItemMenu.jsx             # Use items interface
│   │   ├── /character
│   │   │   ├── CharacterCreator.jsx     # Creation wizard
│   │   │   ├── CharacterManager.jsx     # Load/save/delete
│   │   │   ├── AbilityRoller.jsx        # Roll 3d6
│   │   │   ├── ClassSelector.jsx        # Choose class
│   │   │   ├── ClassDetails.jsx         # Class information
│   │   │   ├── AlignmentSelector.jsx    # Choose alignment
│   │   │   ├── SpellSelector.jsx        # Choose starting spell
│   │   │   └── CharacterSummary.jsx     # Final review
│   │   ├── /combat
│   │   │   ├── CombatUI.jsx             # Combat interface
│   │   │   ├── SpellMenu.jsx            # Cast spell dialog
│   │   │   └── VictoryScreen.jsx        # Combat victory
│   │   ├── /common
│   │   │   ├── Button.jsx               # Reusable button
│   │   │   ├── PaperContainer.jsx       # Parchment panels
│   │   │   └── Modal.jsx                # Dialog windows
│   │   ├── /layout
│   │   │   └── HomePage.jsx             # Main menu
│   │   └── /tools
│   │       ├── DiceRoller.jsx           # Dice utility
│   │       └── Bestiary.jsx             # Monster reference
│   ├── /contexts
│   │   ├── CharacterContext.jsx         # Character state
│   │   └── AdventureContext.jsx         # Adventure state
│   ├── /data
│   │   ├── classes.js                   # 7 class definitions
│   │   ├── monsters.js                  # 10 monster stats
│   │   ├── spells.js                    # 10 level 1 spells
│   │   ├── tutorialAdventure.js         # Tutorial module
│   │   ├── goblinWarren.js              # Goblin adventure
│   │   └── hauntedCrypt.js              # Undead adventure
│   ├── /utils
│   │   ├── calculations.js              # Stat calculations
│   │   ├── combat.js                    # Combat resolution
│   │   ├── dice.js                      # Random number generation
│   │   ├── spells.js                    # Spell mechanics
│   │   ├── items.js                     # Item effects
│   │   ├── treasure.js                  # Loot generation
│   │   ├── sound.js                     # Audio system
│   │   └── handleCastSpell.js           # Shared spell casting
│   ├── /styles
│   │   └── global.css                   # Global styles
│   ├── App.jsx                          # Root component
│   └── main.jsx                         # Entry point
├── package.json
├── vite.config.js
└── README.md
```

### 2.4 Component Architecture

**Component Hierarchy**:
```
App
├── CharacterProvider
│   └── AdventureProvider
│       └── Router
│           ├── HomePage
│           ├── CharacterCreator
│           │   ├── AbilityRoller
│           │   ├── ClassSelector
│           │   ├── AlignmentSelector
│           │   ├── SpellSelector
│           │   └── CharacterSummary
│           ├── CharacterManager
│           ├── AdventureSelection
│           ├── AdventureScreen
│           │   ├── NarrationPanel
│           │   ├── MapDisplay
│           │   └── ActionPanel
│           │       ├── CombatUI
│           │       ├── ItemMenu
│           │       └── SpellMenu
│           ├── DiceRoller
│           └── Bestiary
```

**Design Patterns**:
- **Context Providers**: Global state management
- **Compound Components**: Related UI elements grouped
- **Render Props**: Flexible component composition
- **Custom Hooks**: Reusable logic extraction
- **Container/Presenter**: Separation of logic and display

---

## 3. Core System Modules

### 3.1 Character Management System

#### 3.1.1 Character Creation Flow

**State Machine**:
```
[Start] → Roll Abilities → Choose Class → Choose Alignment 
     → Choose Spell (if caster) → Name Character → [Complete]
```

**Data Model**:
```javascript
{
  name: string,
  class: string,              // 'fighter', 'cleric', etc.
  level: number,              // Always 1 in v0.1.0
  alignment: string,          // 'lawful', 'neutral', 'chaotic'
  abilities: {
    strength: number,         // 3-18
    intelligence: number,
    wisdom: number,
    dexterity: number,
    constitution: number,
    charisma: number
  },
  hp: {
    current: number,
    max: number
  },
  ac: number,                 // Armor Class (lower is better)
  thac0: number,              // To Hit AC 0
  gold: number,
  xp: number,
  inventory: Array<Item>,
  spells: Array<string>,      // Spell IDs
  spellSlots: Object,         // { 1: 1 } for level 1
  spellSlotsUsed: Object,     // { 1: 0 }
  buffs: Array<Buff>,         // Active spell effects
  savingThrows: Object,       // Five categories
  isCreated: boolean,
  creationStep: number        // Wizard progress
}
```

#### 3.1.2 Ability Score System

**Generation Method**: 3d6 rolled in order

**Modifiers Table** (1981 Basic Rules):
| Score | Modifier | Effects |
|-------|----------|---------|
| 3     | -3       | Severe penalty |
| 4-5   | -2       | Major penalty |
| 6-8   | -1       | Minor penalty |
| 9-12  | 0        | No adjustment |
| 13-15 | +1       | Minor bonus |
| 16-17 | +2       | Major bonus |
| 18    | +3       | Maximum bonus |

**Ability Applications**:
- **Strength**: Melee attack/damage bonus, open doors
- **Intelligence**: Languages known, bonus spells (Magic-User)
- **Wisdom**: Saving throws vs magic, bonus spells (Cleric)
- **Dexterity**: AC adjustment, missile attack bonus, initiative
- **Constitution**: HP adjustment per level
- **Charisma**: Reaction rolls, hirelings, morale

**Implementation**:
```javascript
function rollAbilities() {
  return {
    strength: roll3d6(),
    intelligence: roll3d6(),
    wisdom: roll3d6(),
    dexterity: roll3d6(),
    constitution: roll3d6(),
    charisma: roll3d6()
  };
}

function calculateModifier(score) {
  if (score === 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3;
}
```

#### 3.1.3 Class System

**Class Definitions**:

1. **Fighter**
   - HD: d8
   - Prime Requisite: Strength
   - Requirements: None
   - Abilities: Best attack progression
   - Starting Equipment: Armor, weapons, basic gear

2. **Cleric**
   - HD: d6
   - Prime Requisite: Wisdom
   - Requirements: None
   - Abilities: Turn Undead, divine spells
   - Starting Equipment: Holy symbol, blunt weapons, basic gear

3. **Magic-User**
   - HD: d4
   - Prime Requisite: Intelligence
   - Requirements: None
   - Abilities: Arcane spells, spell research
   - Starting Equipment: Spellbook, dagger, basic gear

4. **Thief**
   - HD: d4
   - Prime Requisite: Dexterity
   - Requirements: None
   - Abilities: Thief skills (climb, hide, backstab, detect traps)
   - Starting Equipment: Thieves' tools, leather armor, basic gear

5. **Elf**
   - HD: d6
   - Prime Requisite: Intelligence & Strength
   - Requirements: INT 9+
   - Abilities: Fighter/Magic-User combo, infravision 60'
   - Starting Equipment: Weapons, armor, spells, basic gear

6. **Dwarf**
   - HD: d8
   - Prime Requisite: Strength
   - Requirements: CON 9+
   - Abilities: Tough, detect traps/construction, infravision 60'
   - Starting Equipment: Weapons, armor, basic gear

7. **Halfling**
   - HD: d6
   - Prime Requisite: Dexterity & Strength
   - Requirements: DEX 9+, CON 9+
   - Abilities: Stealth, missile bonus, small size bonuses
   - Starting Equipment: Sling, leather armor, basic gear

**Class Selection Logic**:
```javascript
function getEligibleClasses(abilities) {
  const eligible = ['fighter', 'cleric', 'magic-user', 'thief'];
  
  if (abilities.intelligence >= 9) eligible.push('elf');
  if (abilities.constitution >= 9) eligible.push('dwarf');
  if (abilities.dexterity >= 9 && abilities.constitution >= 9) {
    eligible.push('halfling');
  }
  
  return eligible;
}
```

#### 3.1.4 Derived Statistics

**Hit Points**:
```javascript
function calculateMaxHP(className, constitution, level) {
  const hitDice = {
    'fighter': 8,
    'cleric': 6,
    'magic-user': 4,
    'thief': 4,
    'elf': 6,
    'dwarf': 8,
    'halfling': 6
  };
  
  const roll = rollDice(1, hitDice[className]);
  const conMod = calculateModifier(constitution);
  return Math.max(1, roll + conMod); // Minimum 1 HP
}
```

**Armor Class**:
```javascript
function calculateAC(baseAC, dexterity, armorBonus = 0) {
  const dexMod = calculateModifier(dexterity);
  return baseAC - dexMod - armorBonus; // Lower AC is better
}
```

**THAC0** (To Hit AC 0):
```javascript
function calculateTHAC0(className, level, strength) {
  const baseTHAC0 = {
    'fighter': 19,
    'cleric': 19,
    'magic-user': 19,
    'thief': 19,
    'elf': 19,
    'dwarf': 19,
    'halfling': 19
  };
  
  // Level 1 only in v0.1.0
  return baseTHAC0[className];
}
```

**Saving Throws** (by class, level 1):
```javascript
const savingThrows = {
  fighter: {
    deathRay: 12,
    magicWands: 13,
    paralysis: 14,
    dragonBreath: 15,
    spells: 16
  },
  cleric: {
    deathRay: 11,
    magicWands: 12,
    paralysis: 14,
    dragonBreath: 16,
    spells: 15
  },
  // ... etc for each class
};
```

### 3.2 Combat System

#### 3.2.1 Combat Flow

**Turn Sequence**:
```
1. Roll Initiative (1d6 each side)
2. Higher initiative acts first
3. Player Turn:
   - Choose action (Attack/Spell/Defend/Flee/Item)
   - Resolve action
   - Apply effects
4. Enemy Turn:
   - AI chooses action
   - Resolve action
   - Apply effects
5. Check victory/defeat conditions
6. If combat continues, goto step 3
```

**State Machine**:
```
[Encounter] → Roll Initiative → [Player Turn] ⇄ [Enemy Turn]
                                     ↓              ↓
                                 [Victory]     [Defeat]
```

#### 3.2.2 Attack Resolution

**To-Hit Calculation**:
```javascript
function rollAttack(thac0, targetAC, attackBonus = 0) {
  const roll = rollDice(1, 20);
  const targetNumber = thac0 - targetAC;
  const totalRoll = roll + attackBonus;
  
  return {
    roll: roll,
    success: totalRoll >= targetNumber || roll === 20,
    critical: roll === 20,
    fumble: roll === 1
  };
}
```

**THAC0 Table** (Level 1):
| Character Class | THAC0 | To hit AC 9 | To hit AC 5 | To hit AC 0 |
|----------------|-------|-------------|-------------|-------------|
| Fighter        | 19    | 10+         | 14+         | 19+         |
| Cleric         | 19    | 10+         | 14+         | 19+         |
| Magic-User     | 19    | 10+         | 14+         | 19+         |
| Thief          | 19    | 10+         | 14+         | 19+         |
| Demi-humans    | 19    | 10+         | 14+         | 19+         |

**Damage Resolution**:
```javascript
function rollDamage(weaponDamage, strengthModifier = 0) {
  // weaponDamage is string like '1d8' or '1d6+1'
  const damage = parseDiceFormula(weaponDamage);
  return Math.max(0, damage + strengthModifier);
}
```

**Attack Modifiers**:
- Strength modifier (melee only)
- Dexterity modifier (missile only)
- Magic weapon bonus
- Situational bonuses (flanking, etc.)
- Darkness penalty (-4 without light/infravision)

#### 3.2.3 Combat Actions

**Available Actions**:

1. **Attack**
   - Standard melee or ranged attack
   - Uses equipped weapon
   - Triggers enemy turn on completion

2. **Cast Spell**
   - Opens spell menu
   - Consumes spell slot
   - Various effects (damage, heal, buff, condition)
   - Triggers enemy turn

3. **Defend**
   - +2 AC for this round
   - No attack made
   - Triggers enemy turn

4. **Flee**
   - 50% success chance (2-in-6)
   - Success: Combat ends, player moves back
   - Failure: Enemy gets free attack

5. **Use Item**
   - Healing potion, etc.
   - Triggers enemy turn

#### 3.2.4 Enemy AI

**AI Decision Tree**:
```javascript
function enemyAI(enemy, player) {
  // Check if asleep
  if (enemy.conditions.includes('asleep')) {
    return 'skip_turn';
  }
  
  // Check morale
  if (enemy.hp < enemy.maxHP * 0.25) {
    if (checkMorale(enemy.morale)) {
      return 'flee';
    }
  }
  
  // Default: Attack
  return 'attack';
}
```

**Morale System**:
- Morale score (2-12)
- Check when HP < 25%
- 2d6 roll, success if ≤ morale
- Success: Continue fighting
- Failure: Enemy flees

#### 3.2.5 Special Combat Mechanics

**Critical Hits** (Natural 20):
- Automatic hit regardless of AC
- Double damage (future enhancement)
- Special narration

**Fumbles** (Natural 1):
- Automatic miss
- No additional effects in v0.1.0

**Darkness Penalties**:
- -4 to attack rolls
- Applied if no light source AND no infravision
- Visual warning displayed

### 3.3 Spell System

#### 3.3.1 Spell Mechanics

**Spell Casting Requirements**:
1. Character must know the spell
2. Must have available spell slot
3. Must be appropriate situation (combat/exploration)

**Spell Slot System**:
```javascript
// Level 1 characters get 1 spell slot
spellSlots: { 1: 1 }      // One 1st-level slot
spellSlotsUsed: { 1: 0 }  // None used yet
```

**Spell Usage Flow**:
```
1. Check if spell slots available
2. Player selects spell from menu
3. Validate spell can be cast
4. Apply spell effect
5. Consume spell slot
6. Update UI
```

#### 3.3.2 Implemented Spells (8/10)

**Cleric Spells**:

1. **Cure Light Wounds** ✅
   - Level: 1
   - Range: Touch
   - Duration: Instant
   - Effect: Heal 1d6+1 HP
   - Implementation: Adds HP, capped at max

2. **Detect Evil** ✅
   - Level: 1
   - Range: 60 feet
   - Duration: 6 turns
   - Effect: Sense evil creatures/objects
   - Implementation: Checks enemy alignment

3. **Light** ✅
   - Level: 1
   - Range: 120 feet
   - Duration: 6 turns (60 minutes)
   - Effect: Creates light equivalent to torch
   - Implementation: Sets hasLight flag, duration counter

4. **Protection from Evil** ✅
   - Level: 1
   - Range: Self
   - Duration: 12 rounds
   - Effect: +1 AC, +1 saves vs evil
   - Implementation: Adds buff to character

**Magic-User/Elf Spells**:

5. **Magic Missile** ✅
   - Level: 1
   - Range: 150 feet
   - Duration: Instant
   - Effect: 1d6+1 automatic damage
   - Implementation: No attack roll, direct HP reduction

6. **Shield** ✅
   - Level: 1
   - Range: Self
   - Duration: 2 turns
   - Effect: +4 AC
   - Implementation: Adds buff, modifies AC calculation

7. **Sleep** ✅
   - Level: 1
   - Range: 240 feet
   - Duration: 4d4 turns
   - Effect: Affects 2d8 HD of creatures
   - Implementation: Adds 'asleep' condition, enemy skips turns

8. **Detect Magic** ✅
   - Level: 1
   - Range: 60 feet
   - Duration: 2 turns
   - Effect: Sense magical items/effects
   - Implementation: Special narration

**Not Yet Implemented**:

9. **Charm Person** ⏸️
   - Requires: NPC system (Phase 4)
   - Effect: Make humanoid friendly

10. **Read Magic** ⏸️
    - Requires: Scroll system
    - Effect: Read magical writing

#### 3.3.3 Spell Effect System

**Effect Types**:
```javascript
const spellEffects = {
  healing: (amount, target) => {
    target.hp = Math.min(target.hp + amount, target.maxHP);
  },
  
  damage: (amount, target) => {
    target.hp -= amount;
  },
  
  buff: (stat, bonus, duration, target) => {
    target.buffs.push({ stat, bonus, duration, turnsRemaining: duration });
  },
  
  condition: (conditionType, target) => {
    target.conditions.push(conditionType);
  },
  
  utility: (effect, context) => {
    // Special effects like light, detect magic
    applyUtilityEffect(effect, context);
  }
};
```

**Buff System**:
```javascript
{
  spellId: 'shield',
  stat: 'ac',
  bonus: -4,          // Negative because lower AC is better
  duration: 2,        // In turns
  turnApplied: 1
}
```

### 3.4 Adventure System

#### 3.4.1 Adventure Structure

**Adventure Data Model**:
```javascript
{
  id: 'tutorial_adventure',
  name: 'Your First Adventure',
  subtitle: 'A Tutorial Adventure',
  difficulty: 'beginner',
  recommendedLevel: 1,
  description: 'Adventure description...',
  features: ['5 rooms', '3 monsters', 'Treasure chest'],
  startingRoomId: 'entrance',
  victoryConditions: ['defeat_all_monsters'],
  rooms: {
    room_id: {
      id: 'room_id',
      name: 'Room Name',
      description: 'Room description...',
      exits: [
        { direction: 'east', targetRoomId: 'other_room' }
      ],
      contents: {
        monsters: ['monster_id'],
        treasure: ['treasure_id'],
        traps: [{
          id: 'trap_1',
          detected: false,
          detectChance: { default: 0.167, thief: 1.0, dwarf: 1.0 },
          description: 'Trap description...',
          damage: '1d6'
        }]
      },
      gridPosition: { x: 2, y: 3 }
    }
  },
  monsters: {
    monster_id: {
      // Monster definition
    }
  }
}
```

#### 3.4.2 Room System

**Room States**:
- **Unvisited**: Not yet explored
- **Explored**: Player has entered
- **Cleared**: All monsters defeated
- **Looted**: Treasure collected

**Room Navigation**:
```javascript
function getAvailableExits(roomId) {
  const room = getCurrentRoom(roomId);
  return room.exits.filter(exit => {
    // All exits visible in v0.1.0 (no secret doors yet)
    return true;
  });
}
```

#### 3.4.3 Map System

**Grid Layout**:
- Rooms positioned on X/Y grid
- Each room occupies 1 grid cell
- Connections shown between adjacent rooms

**Map Rendering**:
```javascript
function renderMap(adventure) {
  const grid = createEmptyGrid(8, 8);
  
  Object.values(adventure.rooms).forEach(room => {
    const { x, y } = room.gridPosition;
    grid[y][x] = {
      id: room.id,
      visited: adventure.visitedRooms.includes(room.id),
      current: adventure.currentRoomId === room.id,
      cleared: adventure.roomStates[room.id] === 'cleared'
    };
  });
  
  return grid;
}
```

#### 3.4.4 Exploration Mechanics

**Available Actions**:
1. **Move** - Navigate to adjacent room
2. **Search Room** - Look for hidden items/features
3. **Search for Traps** - Actively detect traps
4. **Use Item** - Consume items
5. **Cast Spell** - Use spells for exploration
6. **Rest** - Recover HP (once per adventure)

**Trap Detection**:
```javascript
function detectTrap(trap, character, hasLight) {
  const classId = character.class;
  let baseChance = trap.detectChance.default;
  
  // Class bonuses
  if (classId === 'thief' || classId === 'dwarf') {
    baseChance = trap.detectChance[classId] || 1.0;
  }
  
  // Darkness penalty
  const classData = getClassById(classId);
  if (!hasLight && !classData.infravision) {
    baseChance *= 0.25; // 75% reduction
  }
  
  return Math.random() < baseChance;
}
```

### 3.5 Data Persistence

#### 3.5.1 Save System Architecture

**Storage Keys**:
- `rpg-character`: Character data
- `rpg-adventure`: Adventure state
- `rpg-settings`: User preferences

**Data Versioning**:
```javascript
{
  version: '1.0',
  data: {
    // Actual save data
  }
}
```

**Auto-Save Strategy**:
- Character: On every state change
- Adventure: On every state change
- Settings: On user modification

#### 3.5.2 Character Persistence

**Save Format**:
```javascript
{
  version: '1.0',
  character: {
    name: 'Thorin',
    class: 'dwarf',
    level: 1,
    // ... all character data
  },
  savedAt: 1708704000000 // timestamp
}
```

**Load Process**:
1. Check localStorage for saved data
2. Validate version compatibility
3. Parse JSON data
4. Validate data integrity
5. Restore character state

**Migration Strategy**:
```javascript
function loadCharacter() {
  const saved = localStorage.getItem('rpg-character');
  if (!saved) return null;
  
  const data = JSON.parse(saved);
  
  // Check version
  if (!data.version || data.version !== '1.0') {
    console.log('Incompatible save data version');
    localStorage.removeItem('rpg-character');
    return null;
  }
  
  return data.character;
}
```

#### 3.5.3 Adventure State Persistence

**Tracked State**:
- Current room ID
- Visited rooms
- Defeated monsters
- Collected treasure
- Room states (cleared, looted)
- Light status and duration
- Has rested flag
- Combat state
- Narration history

**Reset Conditions**:
- New character loaded
- Different character enters adventure
- Player explicitly restarts

---

## 4. Data Models

### 4.1 Character Data Model

See section 3.1.1 for complete character schema.

### 4.2 Monster Data Model

```javascript
{
  id: 'goblin_1',
  name: 'Goblin',
  type: 'goblin',
  hitDice: '1',              // String: '1', '1+1', '1-1', etc.
  hp: {
    current: 4,
    max: 4
  },
  ac: 6,
  thac0: 19,
  damage: '1d6',             // Dice formula
  xp: 10,
  morale: 7,
  alignment: 'Chaotic',
  movement: 60,              // Feet per turn
  description: 'A small, grotesque humanoid...',
  tactics: 'Goblins attack in groups...',
  defeatedText: 'The goblin falls defeated!',
  specialAbilities: [
    {
      id: 'ability_id',
      name: 'Ability Name',
      description: 'What it does',
      effect: 'game_effect'
    }
  ],
  treasure: {
    coins: { min: 1, max: 6, type: 'gp' },
    items: ['healing_potion']
  }
}
```

### 4.3 Spell Data Model

```javascript
{
  id: 'cure_light_wounds',
  name: 'Cure Light Wounds',
  level: 1,
  school: 'Healing',
  classes: ['cleric'],
  range: 'Touch',
  duration: 'Instant',
  description: 'This spell heals 1d6+1 hit points of damage...',
  implementation: {
    type: 'healing',
    formula: '1d6+1',
    target: 'self',
    usableIn: ['combat', 'exploration']
  }
}
```

### 4.4 Item Data Model

```javascript
{
  id: 'healing_potion',
  name: 'Healing Potion',
  type: 'consumable',
  weight: 1,                 // In coins (10 coins = 1 lb)
  quantity: 1,
  effect: {
    type: 'healing',
    formula: '1d8',
    narrative: 'You drink the potion and feel your wounds close.'
  },
  usableIn: ['combat', 'exploration']
}
```

---

## 5. User Interface Design

### 5.1 Visual Design System

**Color Palette**:
```css
:root {
  --color-background: #F5E6D3;      /* Aged parchment */
  --color-text: #2C1810;            /* Dark brown */
  --color-accent: #B22222;          /* Firebrick red */
  --color-highlight: #DAA520;       /* Goldenrod */
  --color-success: #228B22;         /* Forest green */
  --color-danger: #DC143C;          /* Crimson */
  --color-border: #8B4513;          /* Saddle brown */
}
```

**Typography**:
- Headers: "Cinzel" (serif, medieval style)
- Body: "Crimson Text" (readable serif)
- Monospace: "Courier New" (for stats)

**Spacing System**:
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

### 5.2 Component Library

**Common Components**:
- Button (primary, secondary, danger, ghost variants)
- PaperContainer (aged parchment panels)
- Modal (dialog overlays)
- Card (content containers)
- Badge (status indicators)
- ProgressBar (HP, XP bars)

### 5.3 Layout Patterns

**Home Screen**:
```
┌─────────────────────────────────────────┐
│            [Dragon Logo]                 │
│         "Old School RPG"                 │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │  Create  │  │  Manage  │            │
│  │Character │  │Characters│            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │Continue  │  │   Dice   │            │
│  │Adventure │  │  Roller  │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐                           │
│  │Reference │                           │
│  │ Library  │                           │
│  └──────────┘                           │
└─────────────────────────────────────────┘
```

**Adventure Screen**:
```
┌─────────────────────────────────────────┐
│         Narration Panel                  │
│  (DM text, scrolling)                   │
│  [Collapse button]                       │
├───────────────────┬─────────────────────┤
│    Dungeon Map    │   Action Panel      │
│                   │                     │
│   [Grid layout]   │  Character Status   │
│   [Room icons]    │  HP: ▮▮▮▮▮▯▯▯▯▯    │
│   [Current pos]   │  AC: 7   Gold: 120  │
│                   │                     │
│                   │  Available Actions: │
│                   │  [Move North]       │
│                   │  [Search Room]      │
│                   │  [Use Item]         │
│                   │  [Cast Spell]       │
└───────────────────┴─────────────────────┘
```

---

## 6. Performance & Optimization

### 6.1 Performance Targets

**Load Time**:
- Initial load: < 3 seconds
- Route transitions: < 100ms
- Component renders: < 16ms (60fps)

**Runtime**:
- Memory usage: < 100MB
- CPU idle: < 5%
- Smooth animations: 60fps

### 6.2 Optimization Strategies

**Code Splitting**:
- Route-based splitting (not implemented in v0.1.0)
- Lazy loading for large components
- Dynamic imports for tools

**React Optimization**:
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for event handlers
- Key props for list rendering

**Data Optimization**:
- Normalized state shape
- Derived state computation
- Efficient localStorage usage
- JSON serialization optimization

### 6.3 Browser Compatibility

**Minimum Requirements**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used**:
- ES2020 JavaScript
- CSS Grid and Flexbox
- localStorage API
- Web Audio API
- Modern React features

---

## 7. Security & Data Integrity

### 7.1 Data Validation

**Input Validation**:
- Character name: Max 30 characters, no special chars
- Ability scores: 3-18 range enforced
- HP: Cannot exceed maximum
- Gold: Non-negative
- Spell slots: Cannot exceed available

**State Validation**:
```javascript
function validateCharacter(character) {
  if (!character.name || character.name.length > 30) return false;
  if (character.level < 1 || character.level > 14) return false;
  if (character.hp.current > character.hp.max) return false;
  if (character.gold < 0) return false;
  // ... more validations
  return true;
}
```

### 7.2 Save Data Integrity

**Version Checking**:
- All saves tagged with version
- Incompatible versions rejected
- Automatic cleanup of old data

**Corruption Prevention**:
- Try/catch on all localStorage operations
- Validation before save
- Validation after load
- Fallback to defaults on corruption

### 7.3 Client-Side Security

**No Sensitive Data**:
- No user credentials
- No payment information
- No personally identifiable information

**localStorage Security**:
- Same-origin policy enforced by browser
- No XSS vulnerabilities (React escaping)
- No eval() or dangerous patterns

---

## 8. Testing Strategy

### 8.1 Testing Approach (Future)

**Unit Tests**:
- Utility functions (dice, calculations, combat)
- Pure functions (modifiers, formulas)
- Data transformations

**Integration Tests**:
- Character creation flow
- Combat system
- Spell casting
- Save/load cycle

**E2E Tests**:
- Complete adventure playthrough
- Character lifecycle
- Error recovery

### 8.2 Manual Testing

**Test Cases**:
1. Create character of each class
2. Complete each adventure
3. Test all spells
4. Trigger all traps
5. Fight all monsters
6. Use all items
7. Save and load
8. Browser refresh
9. Different browsers

---

## 9. Deployment

### 9.1 Build Process

**Production Build**:
```bash
npm run build
```

**Output**:
- `/dist` folder with optimized assets
- Minified JavaScript bundles
- Optimized CSS
- Static HTML entry point

### 9.2 Hosting Options

**Static Hosting**:
- Netlify (recommended)
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static web server

**Requirements**:
- HTTPS (for service workers in future)
- SPA routing support (redirect all to index.html)
- CORS headers (if using CDN)

### 9.3 Environment Configuration

**Development**:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
```

**Production**:
- Minification enabled
- Source maps optional
- Cache busting via hashed filenames

---

## 10. Future Enhancements

### 10.1 Version 0.2.0 - Trapper Keeper UI
- Complete UI redesign
- Binder-style navigation
- Tabbed interface
- Page-flip animations

### 10.2 Version 0.3.0 - Town of Threshold
- Town hub system
- Shops and services
- NPC interactions (basic)
- Economy system

### 10.3 Version 0.4.0 - B1 Module
- Large dungeon (40+ rooms)
- Advanced exploration
- Procedural elements
- Enhanced combat

### 10.4 Long-term Roadmap
See Implementation Roadmap document for full details.

---

## 11. Document Control

**Version**: 1.0 (Updated for v0.1.0 release)  
**Last Updated**: February 23, 2026  
**Updated By**: Development Team  
**Next Review**: March 1, 2026  
**Status**: Current and Accurate

**Changes from Original**:
- Updated all component names and structure
- Documented actual implementation details
- Added complete data models
- Updated file structure to match reality
- Removed speculative features
- Added actual code examples
- Updated technology decisions
- Added save system documentation

---

**Document Approved**: Version 0.1.0 Release  
**Release Status**: Production Ready ✅
