4. Core Engines & Algorithms
4.1 B1 Random Stocking Algorithm
Stocking occurs once upon first entry to B1.

Rules (B1 p. 25-26):

30% Chance: Monster (Table 4.2).

30% Chance: Treasure (Table 4.3).

25% Chance (if Monster): Monster also has Treasure.

40% Chance: Empty or Special (Atmospheric/Traps).

4.2 Recovery & Spell Logic
Resting: Restores 1d3 HP and resets all spellSlots.

Ration Check: If character has rations < 1, HP recovery is disabled.

Inn Bonus: Resting at the Gold Dragon Inn (5gp) grants +1 to the HP recovery roll.

4.3 Threshold "Duke's Law"
Logic: Any weapon with isIllegal: true must be flagged as status: "stashed" while location === "THRESHOLD_TOWN".

5. Master Content Data (JSON Structures)
5.1 B1 Room Connection Manifest (44 Rooms)
Used for cardinal directional navigation (N/S/E/W).

JSON
[
  { "id": "R1", "name": "Entry Passage", "exits": { "N": "R2", "W": "R3" }, "type": "FIXED" },
  { "id": "R12", "name": "Room of Pools", "exits": { "W": "R11", "E": "R13" }, "type": "SPECIAL" },
  { "id": "R15", "name": "Grand Staircase", "exits": { "S": "R14", "D": "LOWER_LEVEL" }, "type": "FIXED" }
]
5.2 Threshold Merchant Catalog
Includes coin-weight for encumbrance calculations (10 coins = 1 lb).

JSON
{
  "catalog": [
    { "id": "torch", "name": "Torches (6)", "cost": 1, "weight": 60 },
    { "id": "rations", "name": "Rations (7 days)", "cost": 5, "weight": 200 },
    { "id": "long_sword", "name": "Long Sword", "cost": 10, "weight": 60, "isIllegal": true }
  ]
}
6. Combat & Hazard Systems
6.1 Wandering Monsters (B1 p. 8)
Trigger: Check every 3 exploration turns.

Roll: 1-in-6 chance on a d6.

Table: Giant Rats (1d10), Goblins (1d6), Orcs (1d4), Troglodyte (1).

6.2 Secret Doors & Search Action
Logic: Character clicks "Search."

Roll: 1-in-6 for most classes; 2-in-6 for Elves.

Outcome: If successful, hidden exits in the current room ID are added to the exits object.

7. Implementation Roadmap
Refactor Storage: Implement versioned migration for beta saves.

Tabbed Shell: Implement the "Trapper Keeper" UI based on the index.html prototype.

Town Integration: Create the Threshold menu and Merchant modal.

Dungeon Engine: Connect the B1 JSON and implement the Stocking/Wandering Monster logic.