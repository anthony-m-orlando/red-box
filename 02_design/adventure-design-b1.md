To finalize the documentation for your Version 1.0.0 release, we need to create the **Adventure Design Specification (ADS)**. This document acts as the "Source of Truth" for the developers and the engine, detailing exactly how the digitized version of *B1: In Search of the Unknown* functions.

Below is the complete **Adventure Design Specification** for the "Quasqueton Engine."

---

# 🏰 Adventure Design Specification: The Quasqueton Engine (B1)

**Target Module**: B1 - In Search of the Unknown

**Engine Version**: 1.0.0 (Cloud-Ready)

**Status**: Specification Finalized

---

## 1. World & Narrative Logic

### 1.1 The Threshold Hook

Before entering the dungeon, the player must interact with the **Town of Threshold**.

* **Rumor Table Integration**: Upon starting the module, the engine must roll 1d20 three times to pull from the "Background Rumors" table (B1, Page 4).
* **Rumor Integrity**: Rumors marked as "False" must be presented with the same UI weight as "True" rumors.

### 1.2 The Legend of Quasqueton

The transition from Town to Dungeon must display the introductory text regarding **Rogahn the Fearless** and **Zelligar the Unknown**. This text should utilize the "Typewriter" effect defined in the Phase 3 UI requirements.

---

## 2. The Stocking Engine (Dynamic Population)

*B1 is a non-keyed module. The engine must handle the logic of "stocking" the dungeon.*

### 2.1 Entity Distribution Logic

When a new adventure instance is generated:

1. **Monster Placement**: Select 1d10+10 monsters from the *Monsters List* (B1, Pages 25-27). Randomly assign them to rooms marked as "Stocker-Eligible."
2. **Treasure Placement**: Select 1d12+8 treasures from the *Treasure List* (B1, Pages 28-31). Randomly assign them to rooms, ensuring some correlate with monster placement and others are hidden/guarded by traps.
3. **Persistence**: Once a room is stocked, its contents are saved to the User's Cloud JSON. Re-entering the room will not re-roll the stocking logic.

### 2.2 Monster Morale & Surrender

* **Trigger**: Morale checks (2d6) occur when a monster reaches 50% HP or their leader is slain.
* **Outcome**: If the check fails, the monster enters "Flee" state (moves toward the nearest exit) or "Surrender" state (becomes non-hostile and allows pass-through movement).

---

## 3. Special Room Mechanics (Upper & Lower Levels)

*Certain rooms require custom code beyond standard exploration.*

| Room # | Feature | Technical Requirement |
| --- | --- | --- |
| **1** | The Mouths | Trigger audio/text popup: "Who goes there?" and "Who are you?" |
| **7** | Mist Room | Implement a "Fog of War" reset. Player vision radius reduced to 1 tile. |
| **11** | Trapdoor | Ability check (Save vs. Paralysis) or player is moved to Lower Level (Room 42). |
| **38** | Pool of Wonders | Interactive UI with 15+ "Drink" outcomes (Permanent Stat +/- or Temporary Buffs). |
| **47** | Web Room | Movement speed reduced by 75%; 1-in-6 chance of attracting spiders per turn. |

---

## 4. Exploration Rulesets

### 4.1 Time & Wandering Monsters

* **The Turn Tracker**: One "Turn" is 10 rounds or 100 tiles moved.
* **Wandering Checks**: Every 2 turns, roll 1d6. On a **1**, spawn an encounter from the "Wandering Monster Table" (B1, Page 25).

### 4.2 Light & Hazards

* **Wind Corridors**: In specific hallway segments (see B1 Map), roll 1d6. On a 1-2, non-magical light sources (torches) are extinguished.
* **Secret Doors**: Detectable only if a player is adjacent and triggers a "Search" action (1-in-6 chance for most classes; 2-in-6 for Elves).

---

## 5. Mapping & UI Specifications

### 5.1 The Parchment Auto-Mapper

* **Fog of War**: Rooms remain pitch black until the player's light radius touches a tile.
* **Annotations**: Discovered secret doors and traps must be rendered with specific "old-map" icons (e.g., 'S' for secret door, 'X' for trap).

### 5.2 Navigation Transitions

* **Level Linking**: The engine must support vertical transitions (Stairs at Room 11, 26, 35) that hot-swap the active JSON map layout without breaking user session state.

---

## 6. Data Schema (JSON Structure)

*Every adventure instance will be saved in the cloud using the following structure:*

```json
{
  "adventure_id": "B1_QUASQUETON",
  "status": "active",
  "current_level": "Upper",
  "player_coords": {"x": 10, "y": 10},
  "stocking_data": {
    "room_14": {"monster": "Orcs", "treasure": "Gold Pouch", "looted": false},
    "room_38": {"pools_remaining": 14}
  },
  "map_discovery": [
    {"x": 10, "y": 11, "revealed": true, "note": "Safe"}
  ],
  "log": ["Entered the dungeon", "Found rumor about Zelligar"]
}

```

---

## 7. Quality Assurance Checklist

* [ ] Verify that all 14 pools in Room 38 have unique, functioning scripts.
* [ ] Ensure "The Mouths" in Room 1 trigger only once per session.
* [ ] Validate that the "Wind" mechanic does not extinguish magical *Light* spells.
* [ ] Confirm that "Surrendered" monsters do not block movement in narrow 1-tile hallways.

---

**Document End**