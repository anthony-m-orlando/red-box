# Technical Architecture Document
## Old School RPG Game - Version 0.1.0

**Project**: Dungeons & Dragons Basic Set Recreation  
**Version**: 0.1.0 (Beta Release)  
**Last Updated**: February 23, 2026  
**Status**: ✅ Production Ready

---

## 1. Architecture Overview

### 1.1 System Architecture Pattern

**Architecture Type**: Single-Page Application (SPA)  
**Pattern**: Component-Based Architecture with Context API  
**Deployment**: Static Web Application (JAMstack)

**High-Level Architecture**:
```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│          (React Components + CSS)                    │
├─────────────────────────────────────────────────────┤
│                 Application Layer                    │
│     (React Router + Context Providers)               │
├─────────────────────────────────────────────────────┤
│                 Business Logic Layer                 │
│    (Utils: Combat, Spells, Items, Calculations)     │
├─────────────────────────────────────────────────────┤
│                   Data Layer                         │
│  (Static JSON + localStorage persistence)            │
└─────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Frontend Framework**:
- **React 18.2.0** - Component library
- **React Router 6.x** - Client-side routing
- **JavaScript ES2020+** - Modern language features
- **CSS3** - Styling with custom properties

**Build Tools**:
- **Vite 5.x** - Build tool and dev server
  - Hot Module Replacement (HMR)
  - Fast builds
  - ES module support
  - Optimized production bundles

**Development Tools**:
- **ESLint** - Code quality
- **Prettier** - Code formatting (future)
- **Git** - Version control

**Runtime APIs**:
- **localStorage** - Client-side persistence
- **Web Audio API** - Sound generation
- **Fetch API** - Future network requests

### 1.3 Application Structure

```
old-school-rpg/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # React components
│   │   ├── adventure/       # Adventure gameplay
│   │   ├── character/       # Character creation
│   │   ├── combat/          # Combat system
│   │   ├── common/          # Reusable UI
│   │   ├── layout/          # Layout components
│   │   └── tools/           # Utility tools
│   ├── contexts/            # React Context providers
│   │   ├── CharacterContext.jsx
│   │   └── AdventureContext.jsx
│   ├── data/                # Static game data
│   │   ├── classes.js
│   │   ├── monsters.js
│   │   ├── spells.js
│   │   ├── tutorialAdventure.js
│   │   ├── goblinWarren.js
│   │   └── hauntedCrypt.js
│   ├── utils/               # Business logic
│   │   ├── calculations.js
│   │   ├── combat.js
│   │   ├── dice.js
│   │   ├── spells.js
│   │   ├── items.js
│   │   ├── treasure.js
│   │   ├── sound.js
│   │   └── handleCastSpell.js
│   ├── styles/              # Global styles
│   │   └── global.css
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
App (Root)
│
├── CharacterProvider (Context)
│   └── AdventureProvider (Context)
│       └── BrowserRouter
│           │
│           ├── HomePage
│           │   └── Feature Cards
│           │
│           ├── CharacterCreator
│           │   ├── AbilityRoller
│           │   ├── ClassSelector
│           │   │   └── ClassDetails
│           │   ├── AlignmentSelector
│           │   ├── SpellSelector
│           │   └── CharacterSummary
│           │
│           ├── CharacterManager
│           │   └── Character Cards
│           │
│           ├── AdventureSelection
│           │   └── Adventure Cards
│           │
│           ├── AdventureScreen
│           │   ├── NarrationPanel
│           │   ├── MapDisplay
│           │   └── ActionPanel
│           │       ├── CombatUI
│           │       │   └── SpellMenu
│           │       ├── ItemMenu
│           │       └── SpellMenu
│           │
│           ├── DiceRoller
│           │
│           └── Bestiary
│               └── Monster Cards
```

### 2.2 Component Categories

**Layout Components**:
- `HomePage` - Main menu
- `AdventureScreen` - Adventure container

**Character Components**:
- `CharacterCreator` - Creation wizard
- `AbilityRoller` - 3d6 rolling interface
- `ClassSelector` - Class selection grid
- `ClassDetails` - Class information panel
- `AlignmentSelector` - Alignment choice
- `SpellSelector` - Spell selection
- `CharacterSummary` - Final review
- `CharacterManager` - Load/save interface

**Adventure Components**:
- `AdventureSelection` - Adventure chooser
- `NarrationPanel` - DM text display
- `MapDisplay` - Dungeon grid
- `ActionPanel` - Exploration actions

**Combat Components**:
- `CombatUI` - Combat interface
- `SpellMenu` - Spell casting dialog
- `VictoryScreen` - Combat victory
- `DefeatScreen` - Player death

**Common Components**:
- `Button` - Styled button
- `PaperContainer` - Parchment panel
- `Modal` - Dialog overlay
- `Card` - Content container

**Tool Components**:
- `DiceRoller` - Dice utility
- `Bestiary` - Monster reference
- `ItemMenu` - Item usage

### 2.3 Component Design Patterns

**Container/Presenter Pattern**:
```javascript
// Container (logic)
function CharacterCreatorContainer() {
  const { character, createCharacter } = useCharacter();
  const [step, setStep] = useState(1);
  
  const handleNext = () => setStep(step + 1);
  
  return (
    <CharacterCreatorPresenter
      character={character}
      step={step}
      onNext={handleNext}
    />
  );
}

// Presenter (display)
function CharacterCreatorPresenter({ character, step, onNext }) {
  return (
    <div>
      {step === 1 && <AbilityRoller />}
      {step === 2 && <ClassSelector />}
      <Button onClick={onNext}>Next</Button>
    </div>
  );
}
```

**Compound Components**:
```javascript
// Parent provides context to children
function SpellMenu({ children }) {
  const [selectedSpell, setSelectedSpell] = useState(null);
  
  return (
    <SpellMenuContext.Provider value={{ selectedSpell, setSelectedSpell }}>
      {children}
    </SpellMenuContext.Provider>
  );
}

SpellMenu.List = function SpellList() {
  const { setSelectedSpell } = useSpellMenuContext();
  return <div>...</div>;
};

SpellMenu.Details = function SpellDetails() {
  const { selectedSpell } = useSpellMenuContext();
  return <div>...</div>;
};
```

**Custom Hooks**:
```javascript
// Reusable state logic
function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) throw new Error('useCharacter must be within provider');
  return context;
}

function useAdventure() {
  const context = useContext(AdventureContext);
  if (!context) throw new Error('useAdventure must be within provider');
  return context;
}
```

---

## 3. State Management

### 3.1 State Architecture

**Global State**: React Context API
**Local State**: useState/useReducer hooks
**Persistence**: localStorage

**State Layers**:
```
┌─────────────────────────────────────┐
│     Component Local State           │  (UI state, forms)
├─────────────────────────────────────┤
│     Context State                   │  (Character, Adventure)
├─────────────────────────────────────┤
│     localStorage                    │  (Persistence)
└─────────────────────────────────────┘
```

### 3.2 CharacterContext

**Responsibilities**:
- Character creation wizard state
- Character data (abilities, class, HP, etc.)
- Character persistence (save/load)
- Character actions (heal, rest, level up)

**State Shape**:
```javascript
{
  // Character data
  name: string,
  class: string,
  level: number,
  alignment: string,
  abilities: {
    strength: number,
    intelligence: number,
    wisdom: number,
    dexterity: number,
    constitution: number,
    charisma: number
  },
  hp: { current: number, max: number },
  ac: number,
  thac0: number,
  gold: number,
  xp: number,
  inventory: Array<Item>,
  spells: Array<string>,
  spellSlots: { [level]: count },
  spellSlotsUsed: { [level]: count },
  buffs: Array<Buff>,
  savingThrows: Object,
  
  // Creation wizard state
  isCreated: boolean,
  creationStep: number
}
```

**Actions**:
```javascript
// Creation actions
ROLL_ABILITIES
SET_CLASS
SET_ALIGNMENT
SET_SPELLS
SET_NAME
COMPLETE_CREATION
GO_TO_STEP

// Character actions
HEAL
TAKE_DAMAGE
REST
USE_ITEM
CAST_SPELL
ADD_BUFF
REMOVE_BUFF
GAIN_XP
LEVEL_UP

// Persistence
SAVE_CHARACTER
LOAD_CHARACTER
DELETE_CHARACTER
```

**Implementation**:
```javascript
const CharacterContext = createContext();

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(characterReducer, initialState);
  
  // Auto-save on changes
  useEffect(() => {
    localStorage.setItem('rpg-character', JSON.stringify(state));
  }, [state]);
  
  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem('rpg-character');
    if (saved) {
      dispatch({ type: 'LOAD_CHARACTER', payload: JSON.parse(saved) });
    }
  }, []);
  
  const value = {
    character: state,
    rollAbilities: () => dispatch({ type: 'ROLL_ABILITIES' }),
    setClass: (className) => dispatch({ type: 'SET_CLASS', payload: className }),
    // ... other actions
  };
  
  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}
```

### 3.3 AdventureContext

**Responsibilities**:
- Adventure state (current room, defeated monsters)
- Combat state (in combat, enemy HP)
- Dungeon exploration state
- Narration history
- Adventure persistence

**State Shape**:
```javascript
{
  // Adventure metadata
  currentAdventure: string,
  currentRoomId: string,
  visitedRooms: Array<string>,
  defeatedMonsters: Array<string>,
  collectedTreasure: Array<string>,
  roomStates: { [roomId]: 'explored' | 'cleared' | 'looted' },
  
  // Combat state
  inCombat: boolean,
  currentEnemy: string,
  
  // Light system
  hasLight: boolean,
  lightDuration: number,
  lightSource: 'torch' | 'lantern' | 'spell' | null,
  
  // Adventure progress
  hasRested: boolean,
  isVictorious: boolean,
  isDefeated: boolean,
  
  // Narration
  narrationHistory: Array<{
    id: string,
    timestamp: number,
    style: string,
    text: string,
    emphasis: boolean
  }>
}
```

**Actions**:
```javascript
// Navigation
ENTER_ROOM
EXIT_ROOM
MOVE_TO_ROOM

// Combat
START_COMBAT
END_COMBAT
DEFEAT_MONSTER

// Items
COLLECT_TREASURE
USE_ITEM

// Light
LIGHT_TORCH
LIGHT_LANTERN
DECREMENT_LIGHT
EXTINGUISH_LIGHT

// Progress
REST
SET_VICTORY
SET_DEFEAT
RESET_ADVENTURE

// Narration
ADD_NARRATION
CLEAR_NARRATION

// Persistence
LOAD_ADVENTURE
SAVE_ADVENTURE
```

### 3.4 State Flow

**Data Flow Pattern**:
```
User Action
    ↓
Event Handler
    ↓
Dispatch Action
    ↓
Reducer
    ↓
New State
    ↓
React Re-render
    ↓
UI Update
    ↓
localStorage Save
```

**Example Flow** (Casting Spell):
```javascript
// 1. User clicks "Cast Spell"
<Button onClick={() => setShowSpellMenu(true)}>Cast Spell</Button>

// 2. User selects spell from menu
<SpellMenu onCastSpell={handleCastSpell} />

// 3. Handler processes spell
function handleCastSpell(spellId) {
  // Business logic
  const spell = getSpell(spellId);
  const result = applySpellEffect(spell, character, target);
  
  // Update character state
  useSpellSlot(spell.level);
  
  // Update adventure state
  addNarration('combat_action', `You cast ${spell.name}!`);
}

// 4. Context dispatches actions
function useSpellSlot(level) {
  dispatch({
    type: 'USE_SPELL_SLOT',
    payload: { level }
  });
}

// 5. Reducer updates state
case 'USE_SPELL_SLOT':
  return {
    ...state,
    spellSlotsUsed: {
      ...state.spellSlotsUsed,
      [action.payload.level]: state.spellSlotsUsed[action.payload.level] + 1
    }
  };

// 6. useEffect saves to localStorage
useEffect(() => {
  localStorage.setItem('rpg-character', JSON.stringify(state));
}, [state]);

// 7. Component re-renders with new state
```

---

## 4. Routing Architecture

### 4.1 Route Structure

**React Router v6 Configuration**:
```javascript
<BrowserRouter>
  <Routes>
    {/* Home */}
    <Route path="/" element={<HomePage />} />
    
    {/* Character */}
    <Route path="/character/create" element={<CharacterCreator />} />
    <Route path="/character/manage" element={<CharacterManager />} />
    
    {/* Adventure */}
    <Route path="/adventure/select" element={<AdventureSelection />} />
    <Route path="/adventure" element={<AdventureScreen />} />
    
    {/* Tools */}
    <Route path="/tools/dice" element={<DiceRoller />} />
    <Route path="/reference" element={<Bestiary />} />
  </Routes>
</BrowserRouter>
```

### 4.2 Navigation Patterns

**Programmatic Navigation**:
```javascript
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();
  
  const handleAction = () => {
    navigate('/adventure');
  };
  
  return <Button onClick={handleAction}>Start Adventure</Button>;
}
```

**Protected Routes**:
```javascript
function AdventureScreen() {
  const { character } = useCharacter();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!character.isCreated) {
      navigate('/character/create');
    }
  }, [character.isCreated, navigate]);
  
  return <div>...</div>;
}
```

---

## 5. Data Layer

### 5.1 Static Data Structure

**Classes Data** (`/src/data/classes.js`):
```javascript
export const classes = {
  'fighter': {
    id: 'fighter',
    name: 'Fighter',
    description: '...',
    hitDie: 'd8',
    primeRequisite: ['strength'],
    requirements: {},
    weapons: ['Any'],
    armor: ['Any armor', 'Any shield'],
    specialAbilities: ['...'],
    xpTable: { 2: 2000, 3: 4000, ... },
    savingThrows: { ... },
    infravision: 0
  },
  // ... other classes
};

export function getClassById(id) {
  return classes[id] || null;
}
```

**Monsters Data** (`/src/data/monsters.js`):
```javascript
export const monsters = {
  'goblin': {
    id: 'goblin',
    name: 'Goblin',
    hitDice: '1',
    hp: { min: 1, max: 8 },
    ac: 6,
    thac0: 19,
    damage: '1d6',
    movement: 60,
    alignment: 'Chaotic',
    xp: 10,
    morale: 7,
    description: '...',
    specialAbilities: []
  },
  // ... other monsters
};

export function getMonsterById(id) {
  return monsters[id] || null;
}
```

**Spells Data** (`/src/data/spells.js`):
```javascript
export const spells = [
  {
    id: 'cure_light_wounds',
    name: 'Cure Light Wounds',
    level: 1,
    school: 'Healing',
    classes: ['cleric'],
    range: 'Touch',
    duration: 'Instant',
    description: '...',
    implementation: {
      type: 'healing',
      formula: '1d6+1',
      target: 'self',
      usableIn: ['combat', 'exploration']
    }
  },
  // ... other spells
];

export function getSpell(spellId) {
  return spells.find(s => s.id === spellId);
}
```

**Adventures Data** (`/src/data/tutorialAdventure.js`):
```javascript
export const tutorialAdventure = {
  id: 'tutorial_adventure',
  name: 'Your First Adventure',
  startingRoomId: 'entrance',
  rooms: {
    'entrance': {
      id: 'entrance',
      name: 'Dungeon Entrance',
      description: '...',
      exits: [
        { direction: 'east', targetRoomId: 'corridor_1' }
      ],
      contents: {
        monsters: [],
        treasure: [],
        traps: []
      },
      gridPosition: { x: 0, y: 0 }
    },
    // ... other rooms
  },
  monsters: {
    'goblin_1': {
      id: 'goblin_1',
      name: 'Goblin Guard',
      type: 'goblin',
      hp: { current: 4, max: 4 },
      // ... monster stats
    }
  }
};
```

### 5.2 localStorage Schema

**Character Save**:
```javascript
{
  version: '1.0',
  character: { /* full character object */ },
  savedAt: 1708704000000
}
```

**Adventure Save**:
```javascript
{
  version: '1.0',
  adventure: { /* adventure state */ },
  savedAt: 1708704000000
}
```

**Settings Save**:
```javascript
{
  version: '1.0',
  settings: {
    soundEnabled: true,
    soundVolume: 0.3
  }
}
```

### 5.3 Data Validation

**Version Checking**:
```javascript
function loadCharacter() {
  const saved = localStorage.getItem('rpg-character');
  if (!saved) return null;
  
  const data = JSON.parse(saved);
  
  // Version check
  if (!data.version || data.version !== '1.0') {
    console.log('Incompatible save version');
    localStorage.removeItem('rpg-character');
    return null;
  }
  
  return data.character;
}
```

**Data Integrity**:
```javascript
function validateCharacter(char) {
  if (!char.name || typeof char.name !== 'string') return false;
  if (!char.class || !classes[char.class]) return false;
  if (char.level < 1 || char.level > 14) return false;
  if (char.hp.current > char.hp.max) return false;
  if (char.gold < 0) return false;
  return true;
}
```

---

## 6. Business Logic Layer

### 6.1 Utility Modules

**Calculations** (`/src/utils/calculations.js`):
```javascript
// Ability score modifiers
export function calculateModifier(score) {
  if (score === 3) return -3;
  if (score <= 5) return -2;
  if (score <= 8) return -1;
  if (score <= 12) return 0;
  if (score <= 15) return 1;
  if (score <= 17) return 2;
  return 3;
}

// Max HP calculation
export function calculateMaxHP(className, constitution, level) {
  const hitDice = getHitDieForClass(className);
  const roll = rollDice(1, hitDice);
  const conMod = calculateModifier(constitution);
  return Math.max(1, roll + conMod);
}

// AC calculation
export function calculateAC(baseAC, dexterity, armorBonus = 0) {
  const dexMod = calculateModifier(dexterity);
  return baseAC - dexMod - armorBonus;
}

// THAC0 calculation
export function calculateTHAC0(className, level, strength) {
  const baseTHAC0 = getBaseTHAC0(className);
  // Future: subtract level progression
  return baseTHAC0;
}
```

**Combat** (`/src/utils/combat.js`):
```javascript
// Attack roll
export function rollAttack(thac0, targetAC, attackBonus = 0) {
  const roll = rollDice(1, 20);
  const targetNumber = thac0 - targetAC;
  const totalRoll = roll + attackBonus;
  
  return {
    roll,
    targetNumber,
    success: totalRoll >= targetNumber || roll === 20,
    critical: roll === 20,
    fumble: roll === 1
  };
}

// Damage roll
export function rollDamage(formula, bonus = 0) {
  const damage = parseDiceFormula(formula);
  return Math.max(0, damage + bonus);
}

// Initiative
export function rollInitiative() {
  return rollDice(1, 6);
}

// Morale check
export function checkMorale(morale) {
  const roll = rollDice(2, 6);
  return roll <= morale;
}

// Strength bonuses
export function getStrengthAttackBonus(strength) {
  return calculateModifier(strength);
}

export function applyStrengthDamage(damage, strength) {
  return damage + calculateModifier(strength);
}
```

**Dice** (`/src/utils/dice.js`):
```javascript
// Roll dice
export function rollDice(count, sides) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

// Parse formula like "1d8+1"
export function parseDiceFormula(formula) {
  const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return 0;
  
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;
  
  return rollDice(count, sides) + bonus;
}

// Roll 3d6
export function roll3d6() {
  return rollDice(3, 6);
}
```

**Spells** (`/src/utils/spells.js`):
```javascript
// Apply spell effect
export function applySpellEffect(spell, caster, target, context) {
  const impl = spell.implementation;
  
  switch (impl.type) {
    case 'healing':
      return {
        type: 'healing',
        healAmount: parseDiceFormula(impl.formula),
        message: `Healed ${amount} HP`
      };
      
    case 'damage':
      return {
        type: 'damage',
        damage: parseDiceFormula(impl.formula),
        newHP: Math.max(0, target.hp.current - damage)
      };
      
    case 'buff':
      return {
        type: 'buff',
        stat: impl.stat,
        bonus: impl.bonus,
        duration: impl.duration
      };
      
    // ... other types
  }
}

// Check spell availability
export function hasSpellsAvailable(character) {
  const slots = character.spellSlots;
  const used = character.spellSlotsUsed;
  
  for (let level in slots) {
    if (used[level] < slots[level]) {
      return true;
    }
  }
  return false;
}
```

**Items** (`/src/utils/items.js`):
```javascript
// Apply item effect
export function applyItemEffect(item, character, context) {
  switch (item.effect.type) {
    case 'healing':
      return {
        type: 'healing',
        healAmount: parseDiceFormula(item.effect.formula),
        message: item.effect.narrative
      };
      
    case 'light':
      return {
        type: 'light',
        duration: 6, // turns
        message: item.effect.narrative
      };
      
    // ... other types
  }
}

// Get starting items
export function getStartingItems(className) {
  const baseItems = [
    { id: 'backpack', name: 'Backpack', ... },
    { id: 'waterskin', name: 'Waterskin', ... },
    { id: 'iron_ration', name: 'Iron Ration', quantity: 7, ... }
  ];
  
  const classItems = {
    'fighter': [
      { id: 'healing_potion', ... },
      { id: 'torch', quantity: 6, ... }
    ],
    // ... other classes
  };
  
  return [...baseItems, ...classItems[className]];
}
```

**Sound** (`/src/utils/sound.js`):
```javascript
class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    this.context = null;
  }
  
  init() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  play(soundType) {
    if (!this.enabled || !this.context) return;
    
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    switch (soundType) {
      case 'hit':
        oscillator.frequency.value = 300;
        gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.1);
        break;
        
      case 'spell':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, this.context.currentTime + 0.3);
        gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.3);
        break;
        
      // ... other sounds
    }
  }
}

export default new SoundManager();
```

---

## 7. Performance Architecture

### 7.1 Rendering Optimization

**React Optimization Techniques**:

1. **Memoization**:
```javascript
// Expensive component
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive render */}</div>;
});

// Expensive calculation
function Component() {
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data);
  }, [data]);
  
  return <div>{expensiveValue}</div>;
}
```

2. **Callback Optimization**:
```javascript
function Component() {
  // Stable callback reference
  const handleClick = useCallback(() => {
    doSomething();
  }, []);
  
  return <Button onClick={handleClick} />;
}
```

3. **List Rendering**:
```javascript
// Proper key usage
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

### 7.2 Build Optimization

**Vite Configuration**:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    minify: 'terser',
    sourcemap: false // Disable in production
  }
});
```

**Code Splitting** (Future):
```javascript
// Lazy load routes
const DiceRoller = lazy(() => import('./components/tools/DiceRoller'));
const Bestiary = lazy(() => import('./components/tools/Bestiary'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/tools/dice" element={<DiceRoller />} />
    <Route path="/reference" element={<Bestiary />} />
  </Routes>
</Suspense>
```

### 7.3 Performance Metrics

**Target Metrics**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

**Monitoring** (Future):
```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 8. Security Architecture

### 8.1 Client-Side Security

**Input Validation**:
```javascript
// Sanitize character name
function sanitizeCharacterName(name) {
  return name
    .replace(/[<>]/g, '') // Remove HTML chars
    .substring(0, 30)      // Max length
    .trim();
}

// Validate ability score
function validateAbilityScore(score) {
  return typeof score === 'number' && score >= 3 && score <= 18;
}
```

**localStorage Security**:
- No sensitive data stored
- Version-checked data
- Validated on load
- Same-origin policy enforced by browser

**XSS Prevention**:
- React auto-escaping
- No dangerouslySetInnerHTML usage
- No eval() or Function()
- Sanitized user inputs

### 8.2 Data Integrity

**Save Data Validation**:
```javascript
function validateSaveData(data) {
  // Check structure
  if (!data.version) return false;
  if (!data.character) return false;
  
  // Validate character
  const char = data.character;
  if (char.hp.current > char.hp.max) return false;
  if (char.gold < 0) return false;
  if (char.level < 1 || char.level > 14) return false;
  
  return true;
}
```

---

## 9. Error Handling

### 9.1 Error Boundaries

**React Error Boundary** (Future):
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 9.2 Error Handling Patterns

**Try/Catch Usage**:
```javascript
// localStorage operations
try {
  localStorage.setItem('key', JSON.stringify(data));
} catch (error) {
  console.error('Failed to save:', error);
  // Fallback or notify user
}

// Data parsing
try {
  const data = JSON.parse(saved);
  return data;
} catch (error) {
  console.error('Failed to parse save data:', error);
  localStorage.removeItem('key');
  return null;
}
```

**Graceful Degradation**:
```javascript
// Sound system fallback
function initSound() {
  try {
    const context = new AudioContext();
    return context;
  } catch (error) {
    console.warn('Web Audio not supported, sound disabled');
    return null;
  }
}
```

---

## 10. Deployment Architecture

### 10.1 Build Process

**Production Build**:
```bash
npm run build
```

**Build Output**:
```
/dist
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── favicon.ico
```

**Build Optimizations**:
- Minification (Terser)
- Tree shaking
- Code splitting
- Asset optimization
- Hash-based cache busting

### 10.2 Hosting Configuration

**Static Hosting Requirements**:
- HTTPS required
- SPA routing support (rewrite all to index.html)
- Proper MIME types
- Gzip/Brotli compression

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 10.3 CDN Strategy

**Asset Delivery**:
- Static assets served from CDN
- Long cache times (1 year) for hashed assets
- Short cache (5 min) for index.html

**Cache Headers**:
```
# Hashed assets (aggressive caching)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# HTML (short cache)
/index.html
  Cache-Control: public, max-age=300
```

---

## 11. Monitoring & Analytics (Future)

### 11.1 Performance Monitoring

**Web Vitals**:
- Core Web Vitals tracking
- Custom performance marks
- Resource timing

**Error Tracking**:
- JavaScript error logging
- Network error tracking
- User flow tracking

### 11.2 User Analytics

**Events to Track**:
- Character creation completed
- Adventure started/completed
- Character death
- Spell cast
- Combat victories
- Session duration

---

## 12. Development Workflow

### 12.1 Development Server

**Start Development**:
```bash
npm run dev
```

**Features**:
- Hot Module Replacement
- Fast refresh
- Error overlay
- Port: 5173

### 12.2 Code Quality

**Linting**:
```bash
npm run lint
```

**Type Safety** (Future):
- TypeScript migration
- PropTypes validation

### 12.3 Version Control

**Git Workflow**:
- Feature branches
- Semantic versioning
- Conventional commits

**Commit Message Format**:
```
<type>(<scope>): <subject>

feat(combat): add spell casting in combat
fix(character): resolve HP calculation bug
docs(readme): update installation instructions
```

---

## 13. Future Architecture

### 13.1 Planned Improvements

**Phase 1 (v0.2.0)**: Trapper Keeper UI
- Component restructure for tabs
- New layout system
- Animation framework

**Phase 2 (v0.3.0)**: Town of Threshold
- Town state management
- Shop systems
- NPC interactions

**Phase 3 (v0.4.0)**: B1 Module
- Large dungeon system
- Procedural generation
- Advanced exploration

### 13.2 Scalability Considerations

**Code Organization**:
- Feature-based folder structure
- Shared component library
- Utility function library
- Domain-driven design

**State Management**:
- Consider Redux for complex state
- Normalized state shape
- Selector patterns
- State machines for complex flows

**Performance**:
- Virtual scrolling for large lists
- Image lazy loading
- Route-based code splitting
- Service worker for offline support

---

## Document Control

**Version**: 1.0 (Updated for v0.1.0)  
**Last Updated**: February 23, 2026  
**Next Review**: March 1, 2026  
**Status**: Current

**Changes from Original**:
- Complete rewrite for actual implementation
- Added all current components
- Documented state management
- Added code examples
- Included performance considerations
- Added deployment details

---

**Document Approved**: Version 0.1.0 Release  
**Technical Status**: Production Ready ✅
