Gemini said
Markdown
# Red Box: Comprehensive System Design & Data Specification (v1.0)

## 1. Architectural Vision
**Red Box** is a high-fidelity, client-side web application designed to emulate the tactile experience of a 1980s "Trapper Keeper" adventure folder. The system uses an **N-Tab Modular Architecture**, allowing for independent scaling of the Character, Adventure, and Reference engines.

---

## 2. Global UI & Navigation (The Folder Shell)
### N-Tab Layout
* **Characters**: Paged sub-view (Sheet → Inventory → Spells).
* **Adventures**: Dual-mode view (Town Hub / Dungeon Explorer).
* **Dice Roller**: Global utility overlay or dedicated tab.
* **Reference**: Searchable archive (Rules & Bestiary).

### Visual Standards
* **Architectural Weighting**: 
    * `border-outer`: 4px solid #1a1a1a (Foundation walls).
    * `border-inner`: 1px solid #4a4a4a (Room partitions).
* **Environmental FX**: CSS `mask-image` with noise textures for "Stippled Rock" cavern edges.
* **Dynamic Lighting**: Radial CSS gradients centered on player coordinates to simulate torchlight falloff (radius: 30ft/3 squares).

---

## 3. Data Schemas (JSON Specification)

### A. Bestiary (Module B1 Specific)
```json
[
  {
    "id": "orc",
    "name": "Orc",
    "description": "Nasty, nocturnal humanoids that hate light.",
    "stats": {
      "ac": 6,
      "hd": "1",
      "hp_range": [1, 8],
      "atk": 1,
      "damage": "1d8",
      "move": 120,
      "save": "F1"
    },
    "xp": 10
  },
  {
    "id": "troglodyte",
    "name": "Troglodyte",
    "description": "Reptilian sub-humans with a sickening stench.",
    "stats": {
      "ac": 5,
      "hd": "2",
      "hp_range": [2, 16],
      "atk": 3,
      "damage": "1d4/1d4/1d4",
      "move": 120,
      "save": "F2"
    },
    "special": "Stench: Save vs Poison or lose 2 points of Strength.",
    "xp": 20
  },
  {
    "id": "giant_rat",
    "name": "Giant Rat",
    "description": "Three-foot long rodents with filthy fur.",
    "stats": {
      "ac": 7,
      "hd": "1/2",
      "hp_range": [1, 4],
      "atk": 1,
      "damage": "1d3",
      "move": 120,
      "save": "F1"
    },
    "special": "5% chance of disease on successful bite.",
    "xp": 5
  }
]
B. Standard Equipment & Inventory
JSON
{
  "weapons": [
    {"id": "sword", "name": "Sword", "damage": "1d8", "weight": 60, "cost": 10},
    {"id": "dagger", "name": "Dagger", "damage": "1d4", "weight": 10, "cost": 3}
  ],
  "gear": [
    {"id": "pole_10", "name": "10' Pole", "weight": 100, "cost": 1, "desc": "Used to poke ceilings and floors."},
    {"id": "spikes_iron", "name": "Iron Spikes (12)", "weight": 60, "cost": 1, "desc": "Used to wedge doors shut."},
    {"id": "torch", "name": "Torch (6)", "weight": 20, "cost": 1, "desc": "Provides light for 6 turns each."},
    {"id": "oil_flask", "name": "Flask of Oil", "weight": 10, "cost": 2, "desc": "Fuel for lanterns or fire traps."}
  ]
}
C. Combat & THAC0 Reference
JSON
{
  "thac0_tables": {
    "fighter": [19, 19, 19, 17, 17, 17, 14, 14, 14, 12],
    "cleric": [20, 20, 20, 20, 18, 18, 18, 18, 16, 16],
    "magic_user": [20, 20, 20, 20, 20, 19, 19, 19, 19, 19]
  },
  "attack_matrix": "Target AC = THAC0 - Roll"
}
4. Adventure Engine Logic (Module B1)
The "Threshold to B1" Loop
Town State: Initialize NPC dialogue nodes for "The Gold Dragon Inn."

Dungeon Transition: Map coordinates shift to the Caverns of Quasqueton.

Room Discovery Logic:

Every movement step checks exploredCoordinates.

If coordinate has room_id, fetch description from B1 room database.

Roll for secret_doors based on Character Wisdom/Class.

Map Tile Schema
JSON
{
  "x": 10,
  "y": 20,
  "type": "room",
  "room_id": "36",
  "wall_top": "foundation",
  "wall_left": "partition",
  "has_stairs": true,
  "label": "Laboratory"
}
5. Persistence & State Management
The system must serialize the following state to localStorage on every meaningful action:

JavaScript
const redBoxState = {
  character: {
    name: "Orlando the Bold",
    class: "Fighter",
    level: 1,
    hp: { current: 8, max: 8 },
    inventory: ["sword", "pole_10", "spikes_iron"],
    xp: 0
  },
  adventure: {
    currentLocation: "Quasqueton_Level_1",
    playerPos: { x: 5, y: 5 },
    mapHistory: ["5,5", "5,6", "6,6"],
    journal: ["Entered the caverns.", "Heard orcs in the distance."]
  }
};


Markdown# Red Box: Module B1 - In Search of the Unknown
## Development Specification & Comprehensive Data Asset Pack

This document contains the full structural logic, JSON datasets, and CSS implementation instructions required to build the Module B1 expansion within the **Red Box** application.

---

## 1. Development Instructions: "The Enriched Explorer"

### A. Architectural Weighting (CSS)
To match the "Enriched State" map requirements, implement the following CSS logic in your grid component. This distinguishes between the thick outer foundations and thin interior walls seen in classic TSR modules.

```css
/* Container for the 10' Square Grid */
.dungeon-grid {
  display: grid;
  grid-template-columns: repeat(var(--map-width), 40px);
  background-image: 
    linear-gradient(to right, #d1d5db 1px, transparent 1px),
    linear-gradient(to bottom, #d1d5db 1px, transparent 1px);
  background-size: 40px 40px; /* Represents 10' scale */
  background-color: #fdfaf3; /* Aged paper hex */
}

/* Wall Fidelity Logic */
.cell-border-foundation { border: 4px solid #1a1a1a; }
.cell-border-partition { border: 1px solid #4a4a4a; }

/* Environmental Stippling (Solid Earth) */
.rock-fill {
  background-color: #e5e7eb;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='[http://www.w3.org/2000/svg'%3E%3Cfilter](http://www.w3.org/2000/svg'%3E%3Cfilter) id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.4;
}
B. Dynamic Fog of War (Torchlight Falloff)Instead of a binary "on/off" visibility, use a radial gradient mask centered on the playerPos coordinates.Full Visibility: 2-cell radius (20').Dim Light (Partial Fog): 3-cell radius (30').Total Darkness: Beyond 3 cells.2. Core JSON Data AssetsA. The B1 BestiaryPopulate the Reference Tab with these entries. These stats include THAC0-compliant AC and XP values for progression.JSON{
  "bestiary": [
    {
      "id": "orc",
      "name": "Orc",
      "ac": 6,
      "hd": "1",
      "hp": 5,
      "atk": "1 weapon",
      "dmg": "1d8",
      "thac0": 19,
      "xp": 10,
      "description": "Nasty, nocturnal humanoids. They prefer attacking in darkness and hate the light."
    },
    {
      "id": "troglodyte",
      "name": "Troglodyte",
      "ac": 5,
      "hd": "2",
      "hp": 9,
      "atk": "2 claws/1 bite",
      "dmg": "1d4/1d4/1d4",
      "thac0": 18,
      "xp": 20,
      "special": "Stench: Save vs Poison or lose 2 Strength points due to nausea.",
      "description": "Reptilian sub-humans. They can change color to hide in the shadows of Quasqueton."
    },
    {
      "id": "giant_rat",
      "name": "Giant Rat",
      "ac": 7,
      "hd": "1/2",
      "hp": 3,
      "atk": "1 bite",
      "dmg": "1d3",
      "thac0": 20,
      "xp": 5,
      "special": "5% chance of disease on hit.",
      "description": "Filthy, three-foot long rodents that swarm in the lower corridors."
    }
  ]
}
B. Inventory & Gear (The Threshold Shop)Data for the Inventory sub-page within the Characters tab.JSON{
  "shop_inventory": [
    {"id": "pole_10", "name": "10' Pole", "cost": 1, "weight": 100, "type": "gear"},
    {"id": "iron_spikes", "name": "Iron Spikes (12)", "cost": 1, "weight": 60, "type": "gear"},
    {"id": "torch_bundle", "name": "Torches (6)", "cost": 1, "weight": 20, "type": "light"},
    {"id": "lantern", "name": "Lantern", "cost": 10, "weight": 30, "type": "light"},
    {"id": "oil_flask", "name": "Oil Flask", "cost": 2, "weight": 10, "type": "fuel"},
    {"id": "rations_standard", "name": "Rations (7 days)", "cost": 5, "weight": 70, "type": "food"}
  ]
}
C. Dungeon Room Logic (Sample Set)Use this schema to drive the Journal Tab updates when a user enters a specific coordinate in the Adventures tab.JSON{
  "quasqueton_rooms": [
    {
      "room_id": "1",
      "name": "Entry Alcove",
      "description": "Steps lead down into a cold, damp alcove. The air smells of wet stone and ancient dust.",
      "entities": [],
      "features": ["Secret door on North wall (DC 15 Wisdom check)"]
    },
    {
      "room_id": "36",
      "name": "The Laboratory",
      "description": "Benches are covered in cracked glass vials and stained parchment. A faint chemical odor lingers.",
      "entities": ["giant_rat", "giant_rat"],
      "loot": ["20gp", "Silver Stirring Rod (15gp)"]
    }
  ]
}
3. System Logic ImplementationsA. THAC0 Calculation (Reference Tab Utility)Use this lookup table to automate the Dice Roller success/fail feedback during combat.Attacker LevelFighter/Dwarf/ElfCleric/HalflingMagic-User/ThiefLevel 1-3192020Level 4172020Level 5171820Formula: Target AC Hit = THAC0 - Roll.Example: A Level 1 Fighter (THAC0 19) rolls a 14. They hit AC 5 or higher.B. Encumbrance Logic (Inventory Page)The system must calculate a "Movement Rate" penalty based on total weight in the Inventory page:0 - 400 coins: 120' per turn.401 - 600 coins: 90' per turn.601 - 800 coins: 60' per turn.801+ coins: 30' per turn (Overencumbered).4. End-to-End Persistence StateWhen saving to localStorage, the data must follow this structure to ensure the N-Tab System reloads the correct "Paged View."JSON{
  "session": {
    "activeTab": "Adventures",
    "activePage": "Map",
    "lastSaved": "2026-02-23T20:30:00Z"
  },
  "characterState": {
    "hp": 8,
    "xp": 45,
    "inventoryIds": ["sword", "torch_bundle", "pole_10"]
  },
  "mapState": {
    "currentModule": "B1",
    "exploredTiles": ["10,10", "10,11", "10,12"],
    "playerPos": {"x": 10, "y": 12}
  }
}

# System Design: Red Box Technical Spec

## 1. Data Hierarchy
**User (Hashed PII) -> Character (Stats/Inventory) -> Adventure (World State)**

## 2. Database Schema (Netlify DB / Postgres)
* **Users**: `id (UUID), username_hash (CHAR64), email_hash (CHAR64), role (TEXT)`
* **Characters**: `id, user_id, name, stats_json, inventory_json`
* **Adventure_States**: `id, character_id, location_id, world_state_json`

## 3. AI Behavioral Logic
* **Monster AI**: Priority: Nearest Target. Morale: 2d6 vs ML. On Fail: Disposition (Flee/Surrender).
* **Hireling AI**: Priority: Player Protection. Use "Cure Light Wounds" if Player HP < 30%.
* **Loyalty**: Persistent variable (+/- modifiers) influencing the 2d6 Morale roll.

## 4. Interaction Engine
* **Dialogue Schema**: Recursive JSON structure supporting `label`, `requirement`, `success_chance`, and `on_success`.
* **The Tithe**: `gold = Math.floor(gold * 0.85)` upon Temple Resurrection.