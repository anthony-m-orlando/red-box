# System Design Document: "The Old School RPG Demo"

## 1. Executive Summary

This document expands the original User Requirements into a comprehensive system design for a browser-based, offline-capable D&D Basic Rules utility. The application will faithfully implement the 1980s ruleset mechanics while providing modern conveniences like character persistence, dice rolling, and combat simulation.

## 2. System Architecture

### 2.1 Technology Stack
- **Frontend Framework**: React (client-side only)
- **UI Library**: nes.css v2.3+ for retro 8-bit aesthetics
- **State Management**: React Context API + localStorage
- **Data Storage**: IndexedDB (primary) with localStorage fallback
- **Build Tool**: Vite for development and production builds
- **Deployment**: Static hosting (GitHub Pages, Netlify, or local file system)

### 2.2 Application Structure
```
/src
  /components
    CharacterSheet/
    DiceRoller/
    CombatSimulator/
    MonsterReference/
  /data
    rules.json
    monsters.json
    equipment.json
  /utils
    calculations.js
    storage.js
    dice.js
  /hooks
    useCharacter.js
    useCombat.js
  App.jsx
  main.jsx
```

## 3. Core Functional Modules

### 3.1 Character Creator Module

#### 3.1.1 Class Selection System
**Supported Classes:**
- Cleric (combat-capable divine caster)
- Fighter (martial specialist)
- Magic-User (arcane caster)
- Thief (skill specialist)
- Dwarf (demi-human warrior)
- Elf (demi-human fighter/magic-user)
- Halfling (demi-human specialist)

#### 3.1.2 Ability Score Generation
**Method**: 3d6 in order (Strength, Intelligence, Wisdom, Dexterity, Constitution, Charisma)

**Modifiers Table:**
| Score | Adjustment |
|-------|-----------|
| 3     | -3        |
| 4-5   | -2        |
| 6-8   | -1        |
| 9-12  | 0         |
| 13-15 | +1        |
| 16-17 | +2        |
| 18    | +3        |

**Class-Specific Applications:**
- Strength: Melee attack/damage (Fighter, Dwarf, Elf)
- Intelligence: Number of languages, magical research
- Wisdom: Saving throws vs magic (Cleric bonus spells)
- Dexterity: Missile attack, Armor Class adjustment, Initiative
- Constitution: Hit point adjustment per level
- Charisma: Reaction rolls, maximum retainers, morale bonus

#### 3.1.3 Saving Throws System
**Five Categories:**
1. Death Ray or Poison
2. Magic Wands
3. Paralysis or Turn to Stone
4. Dragon Breath
5. Rods, Staves, or Spells

**Implementation:** Auto-calculated based on character class and level using predefined tables.

### 3.2 Combat Engine

#### 3.2.1 Attack Resolution
**To-Hit Matrix** (Level 1 baseline):
- AC 9 requires roll of 10+
- AC 7 requires roll of 12+
- AC 5 requires roll of 14+
- AC 2 requires roll of 17+
- AC -1 requires roll of 20

**THAC0 Equivalent:**
- Normal Man: 19
- Fighter 1-3: 19
- Cleric/Thief 1-4: 19
- Magic-User 1-5: 19

#### 3.2.2 Damage System
**Variable Weapon Damage:**
| Weapon Type | Damage | Notes |
|------------|--------|-------|
| Dagger | 1d4 | Melee/Missile |
| Hand Axe | 1d6 | Melee/Missile |
| Short Sword | 1d6 | Melee only |
| Battle Axe | 1d8 | Two-handed |
| Sword | 1d8 | Standard weapon |
| Two-Handed Sword | 1d10 | Requires both hands |

**Special Combat Options:**
- Set spear vs charge (double damage)
- Lance on horseback (double damage on charge)
- Silver weapons (required vs some monsters)

#### 3.2.3 Initiative & Movement
- Roll 1d6 per side
- Winning side acts first
- Movement rates: 60'/90'/120' per turn based on encumbrance

### 3.3 Monster Reference System

#### 3.3.1 Core Monster Stats
**Data Structure:**
```json
{
  "name": "Goblin",
  "hitDice": "1-1",
  "armorClass": 7,
  "move": "60' (20')",
  "attacks": "1 weapon",
  "damage": "1-6 or by weapon",
  "numberAppearing": "2-8 (4-24)",
  "saveAs": "Normal Man",
  "morale": 7,
  "treasureType": "R (C)",
  "alignment": "Chaotic",
  "xpValue": 5
}
```

#### 3.3.2 Quick Reference Categories
- **Dungeon Dwellers**: Goblins, Kobolds, Orcs, Gnolls
- **Undead**: Skeletons, Zombies, Ghouls, Wights
- **Giant Animals**: Giant Rats, Giant Bats, Giant Beetles
- **Classic Threats**: Carrion Crawlers, Gelatinous Cubes, Harpies

### 3.4 Experience & Advancement

#### 3.4.1 XP Progression Tables
**Fighter Example:**
| Level | XP Required | Hit Dice |
|-------|------------|----------|
| 1 | 0 | 1d8 |
| 2 | 2,000 | 2d8 |
| 3 | 4,000 | 3d8 |

**XP Bonuses:**
- Prime Requisite 13-15: +5%
- Prime Requisite 16-18: +10%

#### 3.4.2 Level Benefits
- Hit point increases
- Improved saving throws
- Spell acquisition (casters)
- Special abilities (Thief skills, Elf detection, Dwarf stonework)

### 3.5 Equipment & Encumbrance

#### 3.5.1 Starting Equipment
**Fighter Package (40gp)**:
- Chainmail armor (AC 5)
- Sword (1d8)
- Shield (improves AC by 1)
- Standard adventuring gear

#### 3.5.2 Encumbrance Rules
**Coin-Based System:**
- 1 coin = basic unit of weight
- 400 coins = Light Load (90' movement)
- 800 coins = Heavy Load (60' movement)
- 1,200+ coins = Maximum Load (30' movement)

**Equipment Weights:**
- Armor: 400 coins (leather) to 600 coins (plate)
- Weapons: 10-150 coins
- Treasure: 1 coin per gp/sp/cp

## 4. Data Persistence Architecture

### 4.1 Storage Schema

#### 4.1.1 Character Object
```javascript
{
  characterId: "uuid-v4",
  name: "Ragnar the Bold",
  class: "Fighter",
  level: 1,
  xp: 0,
  abilities: {
    strength: 16,
    intelligence: 10,
    wisdom: 12,
    dexterity: 14,
    constitution: 15,
    charisma: 9
  },
  hitPoints: {
    max: 8,
    current: 8
  },
  armorClass: 5,
  savingThrows: {
    deathRayPoison: 12,
    magicWands: 13,
    paralysisStone: 14,
    dragonBreath: 15,
    rodsStavesSpells: 16
  },
  equipment: [...],
  treasure: {
    copper: 0,
    silver: 0,
    electrum: 0,
    gold: 40,
    platinum: 0
  },
  notes: "",
  createdAt: "2025-02-13T...",
  lastModified: "2025-02-13T..."
}
```

### 4.2 Import/Export Functionality
- **Export**: Serialize character to JSON with metadata
- **Import**: Validate schema version and migrate if needed
- **Format**: RFC 8259 compliant JSON with .json extension

## 5. User Interface Design

### 5.1 Layout Hierarchy
1. **Navigation Bar** (nes-container)
   - Character selector dropdown
   - New character button
   - Import/Export controls

2. **Main View** (tabbed interface)
   - Character Sheet tab
   - Combat Simulator tab
   - Dice Roller tab
   - Monster Reference tab

3. **Character Sheet Sections**
   - Header (name, class, level, XP)
   - Ability Scores grid
   - Combat stats (AC, HP, THAC0)
   - Saving Throws table
   - Equipment list
   - Notes textarea

### 5.2 Component Examples

#### Ability Score Display
```jsx
<div className="nes-container with-title">
  <p className="title">Strength</p>
  <div className="score-display">
    <span className="nes-text is-primary">{score}</span>
    <span className="modifier">({modifier >= 0 ? '+' : ''}{modifier})</span>
  </div>
</div>
```

#### Dice Roller Interface
```jsx
<button className="nes-btn is-primary" onClick={() => roll(20)}>
  <i className="nes-icon trophy"></i> d20
</button>
```

## 6. Calculation Utilities

### 6.1 Core Functions
```javascript
// Calculate ability modifier
function getModifier(score) {
  if (score === 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return +1;
  if (score <= 17) return +2;
  return +3;
}

// Determine if attack hits
function resolveAttack(attackerLevel, targetAC, roll, modifiers = 0) {
  const baseThac0 = 19; // Adjust per class/level
  const requiredRoll = baseThac0 - targetAC;
  return (roll + modifiers) >= requiredRoll;
}

// Calculate encumbrance movement
function getMovementRate(totalCoins, baseMove = 120) {
  if (totalCoins <= 400) return baseMove;
  if (totalCoins <= 800) return Math.floor(baseMove * 2/3);
  if (totalCoins <= 1200) return Math.floor(baseMove / 2);
  return Math.floor(baseMove / 4);
}
```

## 7. Mobile Responsiveness

### 7.1 Breakpoint Strategy
- **Mobile** (<640px): Single-column layout, collapsible sections
- **Tablet** (640-1024px): Two-column layout for ability scores
- **Desktop** (>1024px): Full grid layout with sidebar

### 7.2 Touch Optimizations
- Minimum touch target: 44×44px
- Dice roller with haptic feedback simulation
- Swipe navigation between tabs

## 8. Testing Requirements

### 8.1 Unit Tests
- Ability modifier calculations
- Attack resolution logic
- XP progression validation
- Saving throw lookups

### 8.2 Integration Tests
- Character creation workflow
- Data persistence across sessions
- JSON import/export integrity

### 8.3 Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 9. Future Enhancements (Out of Scope v1.0)

- Party management (multiple characters)
- Initiative tracker with turn order
- Spell book with casting tracker
- Random dungeon generator
- PDF character sheet export
- Multiplayer combat via WebRTC

## 10. Success Metrics

- Character creation completes in <2 minutes
- All calculations match rulebook tables
- Zero data loss across browser sessions
- Application loads in <3 seconds on 3G
- Fully functional offline after first load

---

## Appendix A: Rules Data Schema

### rules.json Structure
```json
{
  "version": "1980-basic-rules",
  "classes": {
    "fighter": {
      "hitDie": "d8",
      "primeRequisite": "strength",
      "savingThrows": [...],
      "xpProgression": [...]
    }
  },
  "attackMatrix": [...],
  "spellLists": {...},
  "equipmentCosts": {...}
}
```

This design document provides a complete blueprint for implementation while respecting the mechanical integrity of the source material without reproducing copyrighted explanatory text.