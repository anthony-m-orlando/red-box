# User Requirements: Red Box (v1.0)

## 1. Navigation & UI Architecture (The "N-Tab" System)
* **Tactile Folder Shell:** The application must utilize a persistent UI wrapper mimicking a physical "Trapper Keeper" or weathered folder, featuring paper textures and tactile tab-based navigation.
* **Dynamic Tab Logic:** The UI must support a scalable "N-tab" system to allow for the dynamic addition of future modules or gameplay tools.
* **Home Page Arrangement:** The primary navigation must be organized into the following tabs:
    1.  **Characters:** Central management for all player heroes.
    2.  **Adventures:** The active gateway to the game world (Town and Dungeon).
    3.  **Dice Roller:** Dedicated utility for tactical rolls.
    4.  **Reference:** Comprehensive library for rules and creature data.

## 2. Character Management
* **Paged Character View:** Within the Characters tab, data must be organized into distinct pages:
    * **Sheet:** Interactive display of ability scores, hit points, and saving throws.
    * **Inventory:** List-based tracking for gear with automated weight and encumbrance calculations.
    * **Spells:** A "Spellbook" interface for managing known spells and tracking daily slots.
* **Persistence:** Character states, including HP and equipment changes, must be saved to `localStorage` to persist between sessions.

## 3. Adventures & Exploration (The Quasqueton Engine)
* **High-Fidelity Map Rendering:** The dungeon explorer must utilize modern CSS to mimic classic module cartography:
    * **Architectural Weight:** Use visual logic to distinguish between 4px "Outer Foundation" walls and 1px "Inner Partition" dividers.
    * **Environmental Texturing:** Implementation of "Stippled Rock" effects and cavernous edge rendering to represent solid earth.
    * **Tactical Annotations:** Scaling room numbers and descriptive labels (e.g., "Dungeon Entrance") integrated directly onto the grid.

* **Dynamic Fog of War:** Visibility must transition from a binary "hidden/revealed" state to a gradient-driven system that simulates torchlight falloff.
* **The "Threshold" Loop:** The Adventures tab must support a non-combat hub featuring:
    * **The Gold Dragon Inn:** For recovery of HP and spells.
    * **The Shop:** For purchasing expedition-critical gear (oil, spikes, 10' poles).

## 4. Tactical Utilities & Reference
* **Integrated Dice Roller:** A functional utility supporting standard RPG dice (d4, d6, d8, d10, d12, d20, d100) with a results history log.
* **Searchable Reference Archive:**
    * **Rules:** Quick access to combat maneuvers, movement rates, and THAC0 (To Hit Armor Class 0) reference tables.
    * **Bestiary:** A data-driven archive of creatures (e.g., Orcs, Troglodytes, Giant Rats) including Armor Class, Hit Dice, and XP values.

## 5. Campaign Systems
* **XP & Progression:** The system must automate experience point tracking and provide level-up utilities supporting a Level 1-10 progression curve.
* **E2E Gameplay Flow:** The application must support a seamless transition from the initial Tutorial through the Town of Threshold and into the Caverns of Quasqueton.

# User Requirements: Project Redbox v1.0

## 1. Authentication & Privacy
* **Invite-Only Login**: Users must be added by a designated Admin via Netlify Identity.
* **PII Protection**: Username and Email must be normalized and hashed (SHA-256) before storage.

## 2. Threshold Hub Requirements
* **Town Map View**: A central map in the Adventures tab with 7 interactive locations.
* **NPCS & Dialogue**: 
    * NPCs must support branching dialogue for rumors, bribes, and recruitment.
    * NPC "Attitude" must persist based on player interactions.
* **The Temple Loop**: If a character dies with a hireling present, they wake at the Temple (10,10) with all loot/XP, minus a 15% tithe and the loss of the hireling.

## 3. Combat & AI
* **Hirelings**: Must be fully controllable in combat or follow autonomous "Protector" AI.
* **Morale**: Entities check morale (2d6) under stress. Failed checks result in Fleeing or Surrendering.
* **Collision**: Surrendered units must allow "Pass-through" movement for the player.

## 4. Technical Persistence
* **Cloud Sync**: All character and world data must sync to Netlify DB.
* **Admin Role**: Only users with "admin" metadata can modify other user profiles.