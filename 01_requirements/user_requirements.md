# User Requirements Document: Version 1.0
**Project**: Red Box Beta (Old School RPG Demo)
**Status**: Hand-off Ready for Version 1.0 Production
**Target Framework**: React 18 / Vite / LocalStorage

## 1. Vision & Scope
Version 1.0 transforms the "tutorial scaffold" into a persistent campaign experience. The interface must move from a standard web layout to a tactile "Trapper Keeper" folder metaphor, supporting a loop of exploration, survival, and town-based recovery.

## 2. Core Feature Requirements

### 2.1 The "Trapper Keeper" Interface
- **Analog Aesthetic**: The UI must mimic physical artifacts (looseleaf paper, weathered maps, handwritten fonts).
- **Tabbed Navigation**:
    - **Home/Town**: Current hub status, NPC interactions, and "Duke's Law" alerts.
    - **Chars**: Dynamic character sheet with XP tracking and level-up capabilities (Levels 1-10).
    - **Maps**: 10' per square graph paper grid with "Fog of War."
    - **Journal**: A persistent, append-only log of every room discovery, dice roll, and rumor learned.
    - **Bestiary**: A reference guide for encountered monsters.

### 2.2 The Town of Threshold (Hub)
- **Transition Logic**: Upon completing the Haunted Crypt (Tutorial), the user is presented with a "Go to Town" button.
- **The Duke's Law**: Strict enforcement in town. Large weapons (swords, axes) must be flagged as "Stashed" and are unavailable for combat while in the Town view.
- **The Gold Dragon Inn**: Provides HP and Spell recovery. 
    - Cost: 5gp per night.
    - Requirement: Character must possess at least 1 unit of Rations.
- **Merchant System**: Full equipment list from the 1983 Basic Set. Purchases must accurately calculate "Coin Weight" (10 coins = 1 lb).

### 2.3 Module B1: In Search of the Unknown
- **Dynamic Stocking**: The 44 rooms of the Upper Level must be stocked *once* per playthrough using the Mike Carr random distribution (30% Monsters, 30% Treasure, 40% Special/Empty).
- **Exploration Mechanics**:
    - **Searching**: Manual action to reveal secret doors (1-in-6 chance for non-elves).
    - **Resource Management**: Tracking turn-based consumption of torches and lanterns.
    - **Wandering Monsters**: A 1-in-6 chance check every 3