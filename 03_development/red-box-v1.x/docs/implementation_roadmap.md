# Implementation Roadmap
## Old School RPG Demo - Ready to Build

**Status**: ✅ All architecture complete, ready for implementation

---

## 📋 Completed Documentation

### 1. User Requirements ✅
- Solo adventure experience definition
- Folder/document UI metaphor
- 5 main tabs (Character Sheet, Inventory, Journal, Map, Reference)
- Complete feature specifications

### 2. System Design ✅  
- Class selection system (7 classes)
- Combat mechanics (THAC0, saving throws, damage)
- Monster reference system
- XP progression tables
- Equipment & encumbrance

### 3. Technical Architecture ✅
- React 18 + Vite build system
- Analog paper aesthetic (cream/aged paper, graph paper for maps, lined for journal)
- Component hierarchy fully defined
- Context API state management
- IndexedDB + localStorage persistence (zero server costs)
- Home page with red dragon cover art + feature grid

### 4. Gap Analysis ✅
- Identified all missing pieces
- Validated complete coverage for minimum adventure
- Confirmed data format (JSON in browser storage)

### 5. Adventure Engine Design ✅
- Room state machine (unexplored → revealed → entered → cleared)
- Event trigger system
- Combat integration with Monster AI
- NPC dialogue trees with ability checks
- Narration display (collapsible top panel)
- Save/checkpoint system
- Victory/defeat conditions
- Two adventures defined:
  - Tutorial: "Your First Adventure" (Players Manual p.16-22)
  - Main: "Bargle Wanted" (DM Guide p.9+)

---

## 🎯 Design Decisions Confirmed

### UI Layout
```
┌────────────────────────────────────────┐
│ NARRATION PANEL [↕ Collapse]          │
│ Paper texture background               │
│ Scrollable history                     │
└────────────────────────────────────────┘
┌──────────────────┬─────────────────────┐
│ MAP (Graph Paper)│ ACTIONS (Buttons)   │
│ Grid with fog    │ Context-sensitive   │
└──────────────────┴─────────────────────┘
```

### Aesthetics
- **Colors**: Cream/aged paper backgrounds, ink black/blue/red
- **Fonts**: 
  - Courier Prime (body text)
  - Caveat (headings - handwritten)
  - Special Elite (numbers)
  - IM Fell English (flavor text)
- **Textures**:
  - Cream/aged paper (general)
  - Graph paper (maps only)
  - Lined paper (journal only)

### Technical Choices
- No UI framework (custom components)
- CSS Modules for styling
- Browser-only storage (no backend)
- Downloadable JSON save files
- PWA for offline support

---

## 🚀 Next Steps: Phase 1 Implementation

### Week 1: Project Setup & Foundation (Days 1-2)

#### Day 1: Project Scaffold
1. Create Vite + React project structure
2. Set up folder hierarchy
3. Install dependencies:
   ```json
   {
     "dependencies": {
       "react": "^18.2.0",
       "react-dom": "^18.2.0",
       "react-router-dom": "^6.20.0"
     },
     "devDependencies": {
       "vite": "^5.0.0",
       "@vitejs/plugin-react": "^4.2.0"
     }
   }
   ```
4. Copy red dragon cover art to `/src/assets/images/home_image.png`
5. Create basic file structure

#### Day 2: Base Styling System
1. Create `/src/styles/global.css` with CSS custom properties
2. Load Google Fonts (Courier Prime, Caveat, Special Elite, IM Fell English)
3. Create `/src/styles/typography.css`
4. Create `/src/components/common/PaperContainer.jsx`
5. Create `/src/components/common/Button.jsx`

### Week 1: Home Page (Days 3-5)

#### Day 3: Home Page Layout
1. Create `/src/components/layout/HomePage.jsx`
2. Display red dragon cover art
3. Create title overlay
4. Set up basic routing (React Router)

#### Day 4: Feature Grid
1. Create feature card component
2. Implement 2x2 grid:
   - Create New Character
   - Continue Adventure
   - Dice Roller Tools
   - Reference Library
3. Add icons (using Lucide React)
4. Make cards responsive

#### Day 5: Context & Storage Setup
1. Create `/src/contexts/CharacterContext.jsx`
2. Create `/src/contexts/SettingsContext.jsx`
3. Create `/src/utils/storage.js` (IndexedDB wrapper with idb-keyval)
4. Implement basic auto-save

### Week 2: Character Creation (Days 1-7)

This will be the next phase after Week 1 is complete.

---

## 📦 Assets Needed

### Images
- ✅ `home_image.png` - Red dragon cover art (already provided)
- ⏳ Graph paper texture (can generate with CSS or SVG)
- ⏳ Lined paper texture (can generate with CSS)
- ⏳ Cream paper texture (can generate with CSS)

### Icons
- Install `lucide-react` for icons
- Dice, sword, book, map symbols

---

## 🔧 Build Commands (Once Setup)

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 📁 Project Structure (To Create)

```
old-school-rpg/
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   └── home_image.png ✅
│   │   ├── textures/
│   │   └── icons/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── HomePage.jsx
│   │   │   ├── FolderTabs.jsx
│   │   │   └── PaperContainer.jsx
│   │   ├── character/
│   │   ├── adventure/
│   │   ├── combat/
│   │   ├── tools/
│   │   └── common/
│   │       ├── Button.jsx
│   │       └── Input.jsx
│   ├── contexts/
│   │   ├── CharacterContext.jsx
│   │   ├── AdventureContext.jsx
│   │   └── SettingsContext.jsx
│   ├── hooks/
│   ├── utils/
│   │   ├── calculations.js
│   │   ├── storage.js
│   │   └── dice.js
│   ├── data/
│   │   ├── rules.json
│   │   ├── monsters.json
│   │   └── npcs.json
│   ├── styles/
│   │   ├── global.css
│   │   ├── typography.css
│   │   └── textures.css
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
├── package.json
├── vite.config.js
└── index.html
```

---

## ✅ Ready to Code!

All architecture and design decisions are complete. The project is fully specified and ready for implementation. Begin with Phase 1, Day 1: Project Scaffold.

**Current Status**: Documentation phase complete. Implementation can begin immediately.

**Estimated Timeline**: 
- Phase 1 (Foundation + Home): 1 week
- Phase 2 (Character System): 1 week  
- Phase 3 (Tutorial Adventure): 2 weeks
- Phase 4 (Main Adventure): 4 weeks

Total: ~8 weeks to fully functional demo with both adventures.
