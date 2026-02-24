Updated Version 1.0 Roadmap: "The Threshold of Quasqueton"
Sprint 1: The Tactical Folder UI (Structural Foundation)
The goal is to transition from the current single-screen "scaffold" to the tactile "Trapper Keeper" interface.

The Folder Shell: A persistent UI wrapper mimicking a physical folder with weathered paper textures.

The 5-Tab System:

Character: Interactive sheet with ability scores and class-based saving throws.

Inventory: Weight-based tracking (Gold vs. Gear).

Journal: Automated log for "B1" exploration events.

Map: A 10' per square graph paper view with Fog of War.

Reference: Quick-lookup for THAC0 and basic combat maneuvers.

Sprint 2: The Town of Threshold (Non-Combat Hub)
Establishing the town as the gateway to the dungeon.

The "Go To Town" Bridge: Logic to move the character from the Tutorial's end into the Town of Threshold.

Threshold Locations:

The Gold Dragon Inn: Resting to recover HP and Spells (with night-stay costs).

The Shop: Buying essential B1 gear (10' poles, spikes, oil, torches).

NPC Interactions: Dialogue with local residents to uncover the legend of Rogahn the Fearless and Zelligar the Unknown.

The Hook: A rumor or specific lead found in town that points the character toward the hidden entrance of Quasqueton.

Sprint 3: Module B1 - In Search of the Unknown
Developing the "Meat" of the version 1 content.

Quasqueton Dungeon Engine: Implementing the specific room-based logic for the upper level of the B1 module.

Mystery Mechanics: Handling the unique features of B1, such as searching for secret doors and investigating the weird laboratories of Zelligar.

Bestiary Expansion: Adding monsters specific to the B1 module (e.g., Orcs, Troglodytes, Giant Rats).

Treasure & XP: Implementing the random treasure placement and experience point rewards that define the B1 experience.

Sprint 4: Campaign Systems & Polish
Finalizing the technical requirements for a public launch.

Progression: Finalizing Level 1-10 XP curves and level-up utilities.

Save State v2: Ensuring all town progress, inventory purchases, and B1 dungeon exploration are saved to localStorage.

Soundscape: Integrating dice-roll clicks and "ambient dungeon" sounds to enhance the immersion.

E2E Testing: Verifying the full flow: Tutorial → Threshold → Quasqueton Entry.

Summary of the "Threshold to B1" Loop
Tutorial: Learn the basics (Current v0.1.0 state).

Transition: Character survives and heads to Threshold.

Preparation: Character visits the Shop and Inn to gear up for a long expedition.

Adventure: Player travels to the Caverns of Quasqueton (B1) to find the lost riches of Rogahn and Zelligar.
