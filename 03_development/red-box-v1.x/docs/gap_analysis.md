# Gap Analysis: Minimum Viable Adventure
## Old School RPG Demo

**Date**: February 13, 2026  
**Purpose**: Validate that all documentation supports the minimum adventure experience

---

## Vision Requirements (from your clarifications)

### ✅ Core Requirements
1. **Demo Scope**: Create character → Play mini adventure → Complete/fail
2. **Adventure Flow**: Dungeon unfolds in sections with DM narration text
3. **Text Display**: Flavor text, monster actions, NPC dialogue in dedicated section
4. **Persistence**: Browser-based storage (IndexedDB/localStorage), no server costs
5. **Long-term**: Expandable to add more adventure modules

---

## Document Coverage Analysis

### 1. ✅ Character Creation (COMPLETE)

**User Requirements Coverage:**
- ✅ Class selection (7 classes)
- ✅ Ability score generation (3d6 in order)
- ✅ Derived stats (HP, AC, saves, THAC0)
- ✅ Starting equipment

**System Design Coverage:**
- ✅ Detailed ability score modifiers table
- ✅ Saving throw calculations
- ✅ Equipment & encumbrance system
- ✅ XP progression tables

**Technical Architecture Coverage:**
- ✅ Character creation wizard component
- ✅ Character data schema
- ✅ Storage system (IndexedDB + localStorage)
- ✅ Auto-save triggers

**Status**: ✅ FULLY DOCUMENTED

---

### 2. ⚠️ Adventure Flow & Narration (GAPS IDENTIFIED)

**User Requirements Coverage:**
- ✅ Map tab with room-by-room exploration
- ✅ Room descriptions as "boxed text"
- ✅ "In Search of the Unknown" as starting adventure
- ⚠️ **GAP**: No detailed specification for narration text display
- ⚠️ **GAP**: No mockup showing where flavor text appears during gameplay

**System Design Coverage:**
- ✅ Monster reference system
- ⚠️ **GAP**: No adventure progression engine specified
- ⚠️ **GAP**: No room state machine (unexplored → entered → cleared)
- ⚠️ **GAP**: No trigger system for events (traps, encounters, discoveries)

**Technical Architecture Coverage:**
- ✅ RoomDescription.jsx component mentioned
- ✅ Adventure context for state management
- ⚠️ **GAP**: No detailed UI layout showing narration + map + actions simultaneously
- ⚠️ **GAP**: No specification for text rendering with formatting (bold, italic, etc.)
- ⚠️ **GAP**: Missing adventure.json data schema example

**Required Additions:**
1. **Adventure Engine Specification**
   - Room state transitions
   - Event trigger system
   - Story progression tracking
   - Victory/defeat conditions

2. **Narration Display UI Mockup**
   - Where does DM text appear?
   - How does it integrate with map?
   - Does it replace tabs or appear alongside?
   - Text formatting options (emphasis, dialogue, actions)

3. **Adventure Data Schema**
   - Room definitions
   - Event triggers
   - Narration text blocks
   - Monster/NPC placement

---

### 3. ⚠️ Combat System (PARTIALLY COMPLETE)

**User Requirements Coverage:**
- ✅ Turn-based combat interface
- ✅ Initiative system
- ✅ Attack resolution
- ✅ Combat log display
- ✅ Victory/defeat/flee outcomes
- ✅ XP award system

**System Design Coverage:**
- ✅ Attack resolution formulas
- ✅ Damage calculations
- ✅ THAC0 tables
- ⚠️ **GAP**: Monster AI decision-making not specified
- ⚠️ **GAP**: Special abilities/spells during combat

**Technical Architecture Coverage:**
- ✅ CombatScreen component
- ✅ MonsterCard component
- ✅ CombatLog component
- ✅ useCombat hook for state
- ⚠️ **GAP**: Combat state machine not detailed (initiative → turns → resolution)
- ⚠️ **GAP**: Monster AI logic not specified

**Required Additions:**
1. **Combat State Machine**
   - Initiative phase
   - Player turn (action selection)
   - Monster turn (AI logic)
   - Resolution phase
   - End combat transitions

2. **Monster AI Specification**
   - Simple attack priority
   - Flee conditions
   - Special ability usage rules

---

### 4. ✅ Persistence (COMPLETE)

**User Requirements Coverage:**
- ✅ IndexedDB primary storage
- ✅ localStorage fallback
- ✅ Auto-save triggers
- ✅ Character export (JSON)
- ✅ Journal export (TXT)
- ✅ Import with validation

**System Design Coverage:**
- ✅ Character object schema
- ✅ Import/export functionality
- ✅ Data validation

**Technical Architecture Coverage:**
- ✅ Storage strategy (3-tier)
- ✅ Auto-save event triggers
- ✅ Export format specification
- ✅ No server costs (all client-side)

**Status**: ✅ FULLY DOCUMENTED - Aligns perfectly with your "no storage cost" requirement

---

### 5. ⚠️ NPC System (PARTIALLY COMPLETE)

**User Requirements Coverage:**
- ✅ NPCs mentioned in adventure
- ⚠️ **GAP**: No dialogue tree implementation details
- ⚠️ **GAP**: No specification for ability checks during dialogue

**System Design Coverage:**
- ⚠️ **MISSING**: No NPC system in original system design document

**Technical Architecture Coverage:**
- ✅ NPCCard component added (from your feedback)
- ✅ DialogueTree component added
- ✅ NPC data schema with dialogue options
- ✅ Ability check requirements in dialogue
- ⚠️ **GAP**: No UI mockup showing how dialogue appears
- ⚠️ **GAP**: No specification for dialogue state management

**Required Additions:**
1. **Dialogue UI Mockup**
   - How dialogue options are presented
   - Where NPC responses appear
   - Integration with narration text area

2. **Dialogue State Management**
   - Track conversation progress
   - Handle branching paths
   - Resolve ability checks
   - Trigger combat/items/quest updates from dialogue

---

### 6. ⚠️ Map & Exploration (PARTIALLY COMPLETE)

**User Requirements Coverage:**
- ✅ Grid-based map with fog of war
- ✅ Character token and position
- ✅ Room labels
- ✅ Door/trap/monster markers
- ✅ Click to move/interact

**System Design Coverage:**
- ⚠️ **GAP**: No map data structure specified
- ⚠️ **GAP**: No fog of war algorithm
- ⚠️ **GAP**: No pathfinding or movement validation

**Technical Architecture Coverage:**
- ✅ MapView component
- ✅ Graph paper texture for maps
- ⚠️ **GAP**: No map rendering implementation details
- ⚠️ **GAP**: No room transition system
- ⚠️ **GAP**: No coordinate system specification

**Required Additions:**
1. **Map Data Schema**
   - Grid coordinates
   - Room boundaries
   - Door/connection definitions
   - Feature placement

2. **Exploration System**
   - Movement validation
   - Fog of war reveal logic
   - Room entry triggers
   - Search/detect mechanics

---

### 7. ✅ UI/UX Design (COMPLETE)

**User Requirements Coverage:**
- ✅ Tabbed interface
- ✅ Paper textures
- ✅ Mobile-first responsive
- ✅ Offline-capable

**System Design Coverage:**
- ✅ nes.css referenced (but you chose analog paper instead)

**Technical Architecture Coverage:**
- ✅ Analog paper aesthetic defined
- ✅ Color palette specified
- ✅ Typography stack chosen
- ✅ Component visual patterns
- ✅ Home page mockup with cover art
- ✅ Breakpoint strategy
- ✅ Touch optimizations

**Status**: ✅ FULLY DOCUMENTED with your analog paper preference

---

## Critical Missing Pieces for Minimum Adventure

### 🚨 HIGH PRIORITY (Blocks minimum adventure)

#### 1. Adventure Engine Specification
**What's Missing:**
- Room-by-room progression system
- Event trigger architecture
- Story state machine
- Win/loss condition tracking

**Why It's Critical:**
Without this, we can't actually run an adventure - we can only display static content.

**Recommended Solution:**
Create an "Adventure Engine Design" document that specifies:
- How rooms are loaded and displayed
- How player actions trigger events
- How narration unfolds based on player choices
- How the adventure tracks completion

---

#### 2. Narration Display Integration
**What's Missing:**
- UI layout showing narration + map + actions together
- Text rendering component specification
- How narration updates during gameplay
- Scrollback/history for re-reading text

**Why It's Critical:**
This is the primary way players experience the story. Without clear specs, we won't know where/how to display the DM text.

**Recommended Solution:**
Create mockups showing:
- Desktop: 3-column layout (narration | map | actions)?
- Mobile: Stacked panels with swipe navigation?
- Text formatting: Plain text, markdown, or custom syntax?

---

#### 3. Adventure Data Format
**What's Missing:**
- Complete adventure.json schema
- Example rooms with narration, monsters, NPCs
- Trigger definitions
- Conditional branching

**Why It's Critical:**
We need a concrete data format to build the adventure engine against.

**Recommended Solution:**
Create example adventure data showing:
- 3-5 sample rooms with complete data
- Combat encounter example
- NPC dialogue example
- Trap/treasure example
- Victory condition definition

---

### ⚠️ MEDIUM PRIORITY (Needed for polish)

#### 4. Combat State Machine Details
**What's Missing:**
- Step-by-step combat flow
- Monster AI decision logic
- Special ability handling

**Recommended Solution:**
Add detailed combat flowchart and monster AI pseudocode.

---

#### 5. Dialogue System Implementation
**What's Missing:**
- UI for presenting choices
- State management for conversation trees
- Integration with adventure progression

**Recommended Solution:**
Create dialogue system specification with examples.

---

#### 6. Map Rendering & Exploration
**What's Missing:**
- Coordinate system
- Fog of war algorithm
- Room transition animations

**Recommended Solution:**
Define map data structure and rendering approach.

---

## Recommended Next Steps

### Option A: Fill Critical Gaps Before Coding
**Approach:**
1. I create "Adventure Engine Design" document
2. I create "Narration Display UI" mockups
3. I create example adventure data (3-5 rooms)
4. You review and approve
5. Then we start coding with complete specs

**Pros:**
- No ambiguity during implementation
- Faster coding once we start
- Fewer refactors/rework

**Cons:**
- More upfront planning time
- No working prototype yet

---

### Option B: Build with Placeholder Adventure
**Approach:**
1. Build character creation + home page now
2. Create simple 3-room placeholder adventure
3. Implement basic narration display
4. Test the flow end-to-end
5. Refine based on what we learn
6. Then expand to full adventure

**Pros:**
- See working prototype faster
- Learn by doing
- Can adjust based on actual UX

**Cons:**
- May require refactoring
- Risk of building wrong thing
- Slower overall if we rebuild

---

### Option C: Hybrid Approach (RECOMMENDED)
**Approach:**
1. I create minimal adventure specs (just what's needed)
   - Simple adventure data schema
   - Basic narration display mockup
   - 3-room example adventure
2. We build Phase 1 (home + character creation)
3. We build Phase 2 (adventure engine with 3 rooms)
4. We test and refine
5. We expand to full adventure content

**Pros:**
- Best of both worlds
- Working prototype in ~2 weeks
- Documented enough to avoid major rewrites
- Can expand incrementally

**Cons:**
- Still requires some upfront design work

---

## Your Decision Needed

Before we proceed, please confirm:

1. **Which approach do you prefer?** (A, B, or C)

2. **Narration Display Question:**
   - Should narration appear in a dedicated "text box" that's always visible?
   - Or should it be part of a tabbed interface?
   - Or should it overlay the map when triggered?

3. **Adventure Data:**
   - Do you have "In Search of the Unknown" content ready in any format?
   - Or should I create a simplified 3-5 room starter dungeon?
   - Or should we work together to structure the real adventure data?

4. **Technology Confirmation:**
   - You mentioned "json or other simplified file format" - JSON is perfect for this
   - Confirm: All state stored in browser (IndexedDB + localStorage), zero server costs ✅
   - Confirm: User can export entire save as downloadable JSON file ✅

Once you answer these, I'll either:
- Fill the critical gaps in documentation (Option A/C)
- Or start building immediately with a minimal adventure (Option B)

What's your preference?
