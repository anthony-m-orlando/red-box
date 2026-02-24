# Updated Version 1.0 Roadmap: "The Threshold of Quasqueton"

## Sprint 1: The Tactical Folder UI (Dynamic N-Tab Foundation)
Transition from a single-screen scaffold to a scalable "Trapper Keeper" interface supporting a dynamic number of tabs.

* **The Folder Shell**: A persistent UI wrapper mimicking a physical folder with weathered paper textures.
* **The N-Tab Navigation System**:
    1. **Characters**: A paged sub-navigation view for managing the active hero.
        * **Page 1: Sheet**: Interactive ability scores and class-based saving throws.
        * **Page 2: Inventory**: Weight-based tracking (Gold vs. Gear).
        * **Page 3: Spells**: Spellbook management and slot tracking.
    2. **Adventures**: The primary gateway to the game world.
        * **Map Tab**: Enriched 10' per square graph paper view with Fog of War.
        * **Journal Tab**: Automated log for exploration and quest events.
    3. **Dice Roller**: A dedicated tactical utility for manual and automated rolls.
    4. **Reference**: A searchable archive for quick-lookup during play.
        * **Rules**: Basic combat maneuvers, movement, and THAC0 tables.
        * **Bestiary**: Data-driven stats and descriptions for encountered creatures.

---

## Sprint 2: The Town of Threshold (Non-Combat Hub)
Establishing the town as the primary gateway within the **Adventures** tab.

* **The "Go To Town" Bridge**: Logic to move the character from the Tutorial's end into the Town of Threshold.
* **Threshold Locations**:
    * **The Gold Dragon Inn**: Resting to recover HP and Spells (with night-stay costs).
    * **The Shop**: Buying essential B1 gear (10' poles, spikes, oil, torches).
* **NPC Interactions**: Dialogue with local residents to uncover the legend of Rogahn the Fearless and Zelligar the Unknown.
* **The Hook**: A rumor found in town that points the character toward the hidden entrance of Quasqueton.

---

## Sprint 3: Module B1 - In Search of the Unknown
Developing core dungeon content with enhanced visual fidelity in the **Adventures** tab.

* **Quasqueton Dungeon Engine**: Implementing specific room-based logic for the upper level of the B1 module.
* **Mystery Mechanics**: Searching for secret doors and investigating the weird laboratories of Zelligar.
* **Bestiary Expansion**: Populating the **Reference** tab with B1-specific monsters (Orcs, Troglodytes, Giant Rats) including AC, HD, and XP values.
* **High-Fidelity Map Rendering**:
    * **Architectural Weight**: CSS logic to distinguish between thick 4px "Outer Foundation" walls and thin 1px "Inner Partition" dividers.
    * **Environmental Texturing**: "Stippled Rock" CSS classes to represent solid earth surrounding corridors.
    * **Integrated Annotations**: Support for room-numbering and tactical labels that scale with the grid.
    * **Dynamic Lighting**: CSS-driven gradients to simulate torchlight falloff within the Fog of War.

---

## Sprint 4: Campaign Systems & Polish
Finalizing technical requirements for public launch.

* **Progression**: Finalizing Level 1-10 XP curves and level-up utilities within the **Characters** tab.
* **Save State v2**: Ensuring all town progress, paged character data, and dungeon exploration are saved to `localStorage`.
* **Soundscape**: Integrating dice-roll clicks and "ambient dungeon" sounds to enhance immersion.
* **E2E Testing**: Verifying the full flow: Tutorial → Threshold → Quasqueton Entry.

---

## Summary of the "Threshold to B1" Loop
* **Tutorial**: Learn the basics (Current v0.1.0 state).
* **Transition**: Character survives and heads to Threshold.
* **Preparation**: Character visits the Shop and Inn to gear up for a long expedition.
* **Adventure**: Player travels to the Caverns of Quasqueton (B1) to find the lost riches of Rogahn and Zelligar.