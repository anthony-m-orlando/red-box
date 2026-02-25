# Technical Architecture Document
## Old School RPG Demo - Analog Paper Aesthetic

---

## 1. Application Structure Overview

### 1.1 Site Map
```
/
├── Home (Landing/Dashboard)
│   ├── Welcome Section
│   ├── Character Quick View Cards
│   ├── Feature Navigation Grid
│   └── Quick Actions Bar
│
├── /character
│   ├── /new (Character Creation Wizard)
│   ├── /sheet/:id (Character Sheet View)
│   └── /manage (Character List & Import/Export)
│
├── /adventure
│   ├── /map (Dungeon Map Interface)
│   ├── /journal (Adventure Log)
│   └── /combat (Combat Screen)
│
├── /tools
│   ├── /dice (Dice Roller)
│   └── /reference (Monster/Spell/Equipment Reference)
│
└── /settings
    ├── Data Management
    └── Preferences
```

### 1.2 Navigation Philosophy
- **No traditional nav bar**: Use breadcrumbs and contextual back buttons
- **Home as hub**: Always accessible via "folder tab" metaphor
- **Deep linking**: All major views have URLs for bookmarking
- **Mobile-first**: Bottom navigation on mobile, sidebar on desktop

---

## 2. Visual Design System

### 2.1 Core Aesthetic: Analog Documents

**Primary Metaphors:**
- Manila folders with tabs
- Graph paper for maps
- Typewriter/handwritten text
- Aged paper textures
- Pencil sketches for illustrations

### 2.2 Design Principles

**Quality Standards:**
- Full test coverage from the start (unit, integration, E2E)
- Polished animations and transitions (smooth, purposeful)
- Accessibility built-in (WCAG 2.1 AA compliance)
- Performance optimization (60fps, <3s load time)

**Visual Approach:**
- Minimal animations, focus on readability
- Paper textures: cream/aged for general use
- Graph paper: maps only
- Lined paper: journal entries only
- Handwritten elements: readable but slightly hand-drawn feel
- No fancy decorative elements that distract from content

### 2.3 Color Palette
```css
:root {
  /* Paper tones */
  --paper-cream: #f4f1e8;
  --paper-aged: #e8e3d3;
  --paper-shadow: #d4cfc0;
  
  /* Ink colors */
  --ink-black: #2b2b2b;
  --ink-blue: #1a5490;
  --ink-red: #8b2e2e;
  --pencil-gray: #6b6b6b;
  
  /* Accent colors */
  --folder-tan: #c9b896;
  --graph-blue: #a8c5dd;
  --highlight-yellow: #fff4b3;
  
  /* Functional states */
  --success-green: #4a7856;
  --warning-orange: #b86f3f;
  --danger-red: #a23c3c;
}
```

### 2.4 Typography Stack
```css
/* Primary reading text - typewriter aesthetic */
--font-body: 'Courier Prime', 'Courier New', monospace;

/* Headings - handwritten feel */
--font-heading: 'Caveat', 'Patrick Hand', cursive;

/* Numbers/stats - clear and legible */
--font-numbers: 'Special Elite', 'Courier Prime', monospace;

/* Flavor text - old book style */
--font-flavor: 'IM Fell English', 'Garamond', serif;
```

### 2.5 Component Visual Patterns

#### Folder Tab Pattern
```
┌─────┐┌─────┐┌─────────────────┐
│ TAB1││ TAB2││    ACTIVE TAB   │
└─────┘└─────┘                   │
┌─────────────────────────────────┐
│                                 │
│      CONTENT AREA               │
│      (paper texture bg)         │
│                                 │
└─────────────────────────────────┘
```

#### Paper Document Pattern
```
╔═══════════════════════════════╗
║ ┌─ Title (handwritten) ─────┐ ║
║ │                            │ ║
║ │  Content on aged paper     │ ║
║ │  with subtle texture       │ ║
║ │  and torn edge effect      │ ║
║ └────────────────────────────┘ ║
╚═══════════════════════════════╝
  (shadow/depth effect)
```

#### Graph Paper (Maps)
```
┌─┬─┬─┬─┬─┬─┬─┬─┐
├─┼─┼─┼─┼─┼─┼─┼─┤
├─┼─┼█┼█┼─┼─┼─┼─┤  (Blue grid lines)
├─┼─┼█┼█┼─┼─┼─┼─┤  (Pencil-drawn rooms)
├─┼─┼─┼─┼─┼─┼─┼─┤  (Eraser marks for fog)
└─┴─┴─┴─┴─┴─┴─┴─┘
```

---

## 3. Technology Stack (Refined)

### 3.1 Core Framework
```json
{
  "framework": "React 18.2+",
  "buildTool": "Vite 5+",
  "routing": "React Router v6",
  "stateManagement": "React Context API + useReducer",
  "styling": "CSS Modules + Custom Properties"
}
```

### 3.2 Key Libraries
```json
{
  "ui": {
    "none": "Custom components only - no UI framework",
    "icons": "Lucide React (minimal, sketch-style when possible)"
  },
  "utilities": {
    "dice": "Custom implementation",
    "storage": "idb-keyval (IndexedDB wrapper)",
    "export": "file-saver (JSON/TXT downloads)"
  },
  "fonts": [
    "Google Fonts: Courier Prime, Caveat, IM Fell English",
    "Special Elite (typewriter)"
  ]
}
```

### 3.3 Build Configuration
```javascript
// vite.config.js priorities
{
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0, // Keep textures as separate files
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'data': ['./src/data/rules.json', './src/data/monsters.json']
        }
      }
    }
  },
  
  // PWA for offline support
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ]
}
```

---

## 4. Component Architecture

### 4.1 Directory Structure
```
/src
  /components
    /layout
      HomePage.jsx          # Main dashboard/hub
      FolderTabs.jsx        # Tab navigation component
      PaperContainer.jsx    # Reusable paper document wrapper
      GraphPaper.jsx        # Grid background for maps
      
    /character
      CharacterCard.jsx     # Home page character preview
      CharacterCreator.jsx  # Multi-step wizard
      CharacterSheet.jsx    # Full sheet view
      AbilityScore.jsx      # Ability score display widget
      SavingThrows.jsx      # Saving throw table
      
    /adventure
      MapView.jsx           # Dungeon map renderer
      RoomDescription.jsx   # Boxed text display
      JournalEntry.jsx      # Individual log entry
      JournalView.jsx       # Full journal interface
      MonsterCard.jsx       # Monster stat block display
      NPCCard.jsx           # NPC stat block and dialogue
      DialogueTree.jsx      # NPC conversation interface
      
    /combat
      CombatScreen.jsx      # Combat interface
      MonsterCard.jsx       # Enemy status display
      CombatLog.jsx         # Action history feed
      
    /tools
      DiceRoller.jsx        # Dice rolling widget
      MonsterReference.jsx  # Monster lookup
      SpellBook.jsx         # Spell reference
      EquipmentList.jsx     # Equipment reference
      
    /common
      Button.jsx            # Styled button variants
      Input.jsx             # Styled input fields
      Modal.jsx             # Dialog/modal component
      Tooltip.jsx           # Hover explanations
      
  /hooks
    useCharacter.js         # Character CRUD operations
    useStorage.js           # IndexedDB/localStorage abstraction
    useDice.js              # Dice rolling logic
    useCombat.js            # Combat state management
    useAdventure.js         # Adventure progress tracking
    
  /contexts
    CharacterContext.jsx    # Active character state
    AdventureContext.jsx    # Current adventure state
    SettingsContext.jsx     # User preferences
    
  /data
    rules.json              # Core game mechanics
    monsters.json           # Monster stat blocks
    npcs.json               # NPC stat blocks and dialogue
    equipment.json          # Items and costs
    spells.json             # Spell descriptions
    adventures/
      search-unknown.json   # Adventure content (includes NPCs)
      
  /utils
    calculations.js         # Game mechanic formulas
    validators.js           # Data validation
    generators.js           # Random generation (stats, treasure)
    formatters.js           # Display formatting helpers
    
  /styles
    global.css              # CSS custom properties
    typography.css          # Font definitions
    textures.css            # Background patterns
    animations.css          # Minimal transition effects
    
  /assets
    /textures
      paper-cream.png       # General backgrounds
      paper-aged.png        # Alternative background
      graph-paper.png       # Map backgrounds only
      lined-paper.png       # Journal backgrounds
      folder-tab.png        # Tab interface elements
    /icons
      dice-*.svg
      class-*.svg
    /images
      home_image.png        # Red dragon cover art for home page
      
  App.jsx
  main.jsx
  router.jsx
```

### 4.2 Component Patterns

#### Smart vs Presentational
```javascript
// Smart Component (Connected to Context/State)
const CharacterSheetContainer = () => {
  const { character, updateCharacter } = useCharacter();
  const { rollDice } = useDice();
  
  return <CharacterSheet 
    character={character}
    onUpdate={updateCharacter}
    onRoll={rollDice}
  />;
};

// Presentational Component (Pure UI)
const CharacterSheet = ({ character, onUpdate, onRoll }) => {
  return (
    <PaperContainer title={character.name}>
      <AbilityScores scores={character.abilities} onRoll={onRoll} />
      {/* ... */}
    </PaperContainer>
  );
};
```

#### Compound Components
```javascript
// Flexible composition pattern
<FolderTabs>
  <FolderTabs.Tab id="sheet" label="Character Sheet">
    <CharacterSheet />
  </FolderTabs.Tab>
  <FolderTabs.Tab id="inventory" label="Inventory">
    <InventoryView />
  </FolderTabs.Tab>
</FolderTabs>
```

---

## 5. State Management Strategy

### 5.1 Context Hierarchy
```
App
 ├─ SettingsProvider (global preferences)
 │   └─ theme, accessibility, dice animations
 │
 ├─ CharacterProvider (character management)
 │   ├─ activeCharacter
 │   ├─ characterList
 │   └─ CRUD operations
 │
 └─ AdventureProvider (adventure state)
     ├─ currentDungeon
     ├─ exploredRooms
     ├─ combatState
     └─ journalEntries
```

### 5.2 Local State Rules
- Use `useState` for UI-only state (modals, form inputs, animations)
- Use `useReducer` for complex state transitions (combat turns, character creation wizard)
- Avoid prop drilling beyond 2 levels - lift to Context instead

### 5.3 Data Flow Example
```
User Action (roll attack)
      ↓
Component Handler (onClick)
      ↓
Context Action (dispatch ATTACK_ROLL)
      ↓
Reducer Logic (calculate result)
      ↓
Update Context State
      ↓
Storage Layer (persist if needed)
      ↓
Re-render Affected Components
```

---

## 6. Data Persistence Architecture

### 6.1 Storage Strategy
```javascript
// Three-tier approach
const storage = {
  // Tier 1: IndexedDB (primary)
  indexedDB: {
    stores: ['characters', 'adventures', 'settings'],
    versioning: true,
    fallback: 'localStorage'
  },
  
  // Tier 2: localStorage (fallback)
  localStorage: {
    keys: ['character-cache', 'settings', 'journal'],
    maxSize: '5MB',
    compression: false
  },
  
  // Tier 3: SessionStorage (temporary)
  sessionStorage: {
    keys: ['combat-state', 'form-drafts'],
    clearOnExit: true
  }
};
```

### 6.2 Auto-Save Triggers
```javascript
const AUTO_SAVE_EVENTS = [
  'CHARACTER_STAT_CHANGE',
  'INVENTORY_UPDATE',
  'ROOM_EXPLORED',
  'COMBAT_COMPLETE',
  'LEVEL_UP',
  'JOURNAL_ENTRY_ADDED'
];

const DEBOUNCE_MS = 1000; // Wait 1s after last change
```

### 6.3 Import/Export Format
```javascript
// Export structure
{
  "exportVersion": "1.0",
  "exportDate": "2025-02-13T...",
  "type": "character" | "save" | "journal",
  "data": {
    // Character or full game state
  },
  "metadata": {
    "appVersion": "1.0.0",
    "checksum": "sha256..."
  }
}
```

---

## 7. Routing Structure

### 7.1 Route Definitions
```javascript
// router.jsx
const routes = [
  {
    path: '/',
    element: <HomePage />,
    handle: { title: 'Old School RPG' }
  },
  {
    path: '/character',
    element: <CharacterLayout />,
    children: [
      { path: 'new', element: <CharacterCreator /> },
      { path: 'sheet/:id', element: <CharacterSheet /> },
      { path: 'manage', element: <CharacterManager /> }
    ]
  },
  {
    path: '/adventure',
    element: <AdventureLayout />,
    children: [
      { path: 'map', element: <MapView /> },
      { path: 'journal', element: <JournalView /> },
      { path: 'combat', element: <CombatScreen /> }
    ]
  },
  {
    path: '/tools',
    element: <ToolsLayout />,
    children: [
      { path: 'dice', element: <DiceRoller /> },
      { path: 'reference', element: <Reference /> }
    ]
  }
];
```

### 7.2 Navigation Guards
```javascript
// Protect adventure routes if no active character
const AdventureGuard = ({ children }) => {
  const { activeCharacter } = useCharacter();
  
  if (!activeCharacter) {
    return <Navigate to="/character/new" replace />;
  }
  
  return children;
};
```

---

## 8. Performance Optimization

### 8.1 Code Splitting
```javascript
// Lazy load heavy features
const MapView = lazy(() => import('./components/adventure/MapView'));
const CombatScreen = lazy(() => import('./components/combat/CombatScreen'));
const Reference = lazy(() => import('./components/tools/Reference'));
```

### 8.2 Asset Strategy
- **Paper textures**: Inline small (<10KB), load large separately
- **Fonts**: Subset to used characters, preload critical fonts
- **Icons**: Inline SVG for common icons, lazy load rare ones
- **JSON data**: Split by feature (rules, monsters, spells)

### 8.3 Rendering Optimizations
```javascript
// Memoize expensive calculations
const attackBonus = useMemo(() => 
  calculateThac0(character.class, character.level),
  [character.class, character.level]
);

// Virtualize long lists (journal entries, monster reference)
import { FixedSizeList } from 'react-window';
```

---

## 9. Mobile Responsiveness

### 9.1 Breakpoint System
```css
/* Mobile-first approach */
:root {
  --bp-mobile: 320px;   /* min */
  --bp-tablet: 640px;   /* landscape phones, small tablets */
  --bp-desktop: 1024px; /* laptops and up */
  --bp-wide: 1440px;    /* large monitors */
}
```

### 9.2 Layout Adaptations
```
Mobile (<640px):
- Single column, full width
- Bottom tab navigation
- Collapsible sections
- Touch-friendly targets (44x44px min)

Tablet (640-1024px):
- Two-column grids
- Sidebar navigation option
- Expanded stat displays

Desktop (>1024px):
- Three-column layouts
- Persistent sidebar
- Hover tooltips
- Keyboard shortcuts
```

### 9.3 Touch Interactions
```javascript
// Swipe between tabs
const useSwipeNavigation = (onSwipe) => {
  const [touchStart, setTouchStart] = useState(null);
  
  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const diff = e.touches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      onSwipe(diff > 0 ? 'right' : 'left');
    }
  };
  
  return { onTouchStart, onTouchMove };
};
```

---

## 10. Accessibility Standards

### 10.1 Semantic HTML
- Use `<button>` for actions, not `<div onClick>`
- Proper heading hierarchy (h1 → h2 → h3)
- `<table>` for data tables (saving throws, stats)
- ARIA labels for icon-only buttons

### 10.2 Keyboard Navigation
```javascript
const KEYBOARD_SHORTCUTS = {
  'r': 'Roll dice',
  'd': 'Open dice roller',
  'c': 'View character sheet',
  'j': 'Open journal',
  'm': 'View map',
  'Escape': 'Close modal/return to home'
};
```

### 10.3 Screen Reader Support
- Alt text for all images
- Live regions for dice rolls and combat results
- Skip links for navigation

---

## 11. Testing Strategy

### 11.1 Unit Tests (Vitest)
```
/src/__tests__
  /utils
    calculations.test.js
    dice.test.js
    validators.test.js
  /hooks
    useCharacter.test.js
    useCombat.test.js
```

### 11.2 Integration Tests (React Testing Library)
```
/src/__tests__/integration
  character-creation.test.jsx
  combat-flow.test.jsx
  data-persistence.test.jsx
```

### 11.3 E2E Tests (Playwright)
```
/tests/e2e
  home-navigation.spec.js
  character-lifecycle.spec.js
  adventure-playthrough.spec.js
```

---

## 12. Deployment Configuration

### 12.1 Build Outputs
```
/dist
  index.html
  /assets
    index-[hash].js
    index-[hash].css
    /textures
    /fonts
  /data
    rules.json
    monsters.json
    spells.json
  manifest.json (PWA)
  service-worker.js
```

### 12.2 Hosting Options
1. **GitHub Pages**: Zero config, free
2. **Netlify**: With redirects for SPA routing
3. **Local**: Open `index.html` directly (file:// protocol)

### 12.3 Service Worker Strategy
```javascript
// Cache-first for assets, network-first for data
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/data/')) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});
```

---

## 13. Development Workflow

### 13.1 Git Branch Strategy
```
main            (production-ready releases)
  └─ develop    (integration branch)
       ├─ feature/home-page
       ├─ feature/character-creation
       ├─ feature/combat-system
       └─ bugfix/*
```

### 13.2 Commit Convention
```
feat: Add character creation wizard
fix: Correct THAC0 calculation for fighters
docs: Update architecture document
style: Apply paper texture to all containers
refactor: Extract dice logic to custom hook
test: Add combat resolution tests
```

### 13.3 Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run lint         # ESLint check
```

---

## 14. Phase 1 Implementation Priority

### Week 1: Foundation & Home Page
1. **Day 1-2**: Project setup + base styling system
   - Vite config
   - CSS custom properties
   - Typography setup
   - Paper texture components

2. **Day 3-5**: Home Page Implementation
   - Landing layout
   - Character card previews
   - Feature navigation grid
   - Basic routing

3. **Day 6-7**: Storage & Context Setup
   - IndexedDB wrapper
   - Character context
   - Settings context
   - Auto-save logic

### Week 2: Character System
1. **Day 1-3**: Character Creation Wizard
   - Class selection
   - Ability rolling
   - Starting equipment

2. **Day 4-7**: Character Sheet View
   - Full stat display
   - Ability scores
   - Saving throws
   - Equipment list

---

## 15. Home Page Specifications

### 15.1 Layout Mockup (Desktop)
```
╔════════════════════════════════════════════════╗
║                                                ║
║    ┌────────────────────────────────────┐     ║
║    │                                    │     ║
║    │   [RED DRAGON COVER ART]           │     ║
║    │   Classic D&D Basic Set artwork    │     ║
║    │                                    │     ║
║    └────────────────────────────────────┘     ║
║                                                ║
║         OLD SCHOOL RPG DEMO                    ║
║         (handwritten subtitle)                 ║
║                                                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Feature Grid (Large Visual Cards):            ║
║  ┌──────────────┐  ┌──────────────┐           ║
║  │   [ICON]     │  │   [ICON]     │           ║
║  │  Create      │  │  Continue    │           ║
║  │  Character   │  │  Adventure   │           ║
║  └──────────────┘  └──────────────┘           ║
║                                                ║
║  ┌──────────────┐  ┌──────────────┐           ║
║  │   [ICON]     │  │   [ICON]     │           ║
║  │  Dice        │  │  Reference   │           ║
║  │  Roller      │  │  Guides      │           ║
║  └──────────────┘  └──────────────┘           ║
║                                                ║
║  Recent Activity (if characters exist):        ║
║  • Ragnar defeated 3 goblins (2 hours ago)    ║
║  • Created new character: Elara (Yesterday)   ║
║                                                ║
╚════════════════════════════════════════════════╝
```

### 15.2 Home Page Features
1. **Hero Section**
   - Full-width cover art (red dragon artwork)
   - Title overlay: "Old School RPG Demo"
   - Subtitle: handwritten-style tagline

2. **Feature Grid**
   - 2x2 grid on desktop, 1 column on mobile
   - Large touch targets (200x200px minimum)
   - Icon + label + short description
   - Main options:
     - Create New Character
     - Continue Adventure (if character exists)
     - Dice Roller Tools
     - Reference Library

3. **Recent Activity Feed** (conditional)
   - Only shows if user has characters
   - Last 5 journal entries across all characters
   - Timestamps in relative format ("2 hours ago")
   - Click to jump to relevant character/adventure

4. **Quick Access**
   - Character selector dropdown (if multiple characters)
   - Settings icon in corner
   - About/Help link

---

## Appendix A: Data Structure Examples

### NPC Data Schema
```json
{
  "npcId": "bargle-the-magician",
  "name": "Bargle",
  "title": "The Infamous",
  "type": "hostile",
  "combatStats": {
    "class": "Magic-User",
    "level": 3,
    "hitDice": "3d4",
    "armorClass": 9,
    "hitPoints": 12,
    "attacks": "1 dagger or spell",
    "damage": "1d4",
    "spells": ["magic-missile", "sleep", "shield"]
  },
  "dialogue": {
    "initial": "So, another fool comes to challenge me!",
    "options": [
      {
        "id": 1,
        "text": "I'm here to stop your evil plans!",
        "response": "You and what army?",
        "nextState": "combat",
        "requireCheck": null
      },
      {
        "id": 2,
        "text": "Perhaps we can reach an agreement?",
        "response": "Interesting... I'm listening.",
        "nextState": "negotiate",
        "requireCheck": {"ability": "charisma", "target": 12}
      }
    ]
  },
  "treasure": "chest-bargle",
  "xpValue": 135
}
```

### Monster Data Schema
```json
{
  "monsterId": "goblin",
  "name": "Goblin",
  "hitDice": "1-1",
  "armorClass": 6,
  "move": "60' (20')",
  "attacks": "1 weapon",
  "damage": "1d6",
  "numberAppearing": "2d4",
  "saveAs": "Normal Man",
  "morale": 7,
  "treasureType": "R",
  "alignment": "Chaotic",
  "xpValue": 5,
  "specialAbilities": [],
  "description": "Small, malicious humanoids with green skin."
}
```

---

**End of Technical Architecture Document**

This architecture provides a complete technical blueprint for implementation. Next steps:
1. Review and approve architecture
2. Set up project scaffold
3. Implement Home Page (Phase 1, Week 1)
