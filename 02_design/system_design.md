This revised **System Design Document** consolidates the pivot from the "Trapper Keeper" UI to a professional, cloud-based architecture. It integrates the **Identity & Persistence (Phase 4)** requirements, the **Quasqueton Engine** logic for Module B1, and the future-proofing needed for **AI Integration**.

---

# 🏗️ System Design Document: Version 1.0.0 (The Gold Box)

**Project**: Old School RPG Service

**Version**: 1.0.0 (Unified Specification)

**Last Updated**: March 5, 2026

**Status**: Finalized for Implementation

---

## 1. Architectural Evolution

The system is transitioning from a **Client-Side SPA** (v0.1.0) to a **Cloud-Synced Service**.

* **v0.1.0 Architecture**: React + LocalStorage (Decoupled & Ephemeral).
* **v1.0.0 Architecture**: React + Node/Serverless + Cloud Database (Identity-Centric & Persistent).

### 1.1 High-Level Data Flow

1. **Auth Layer**: User authenticates via Netlify Identity/OAuth.
2. **State Hydration**: On login, the system fetches the User Profile and active Character JSON from the cloud database.
3. **The "Quasqueton" Loop**:
* Player actions trigger local state updates.
* Significant events (Combat end, Room discovery, Resting) trigger an asynchronous "Save Sync" to the database.
* The engine checks for "Wandering Monster" and "Torch Depletion" every 2 exploration turns.



---

## 2. Database Schema (Persistence Layer)

We will utilize a relational structure (PostgreSQL) with JSONB columns to allow for the flexible expansion of D&D rulesets.

### 2.1 Users Table

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `username_hash` | CHAR(64) | Normalized SHA-256 hash for privacy |
| `email_hash` | CHAR(64) | Normalized SHA-256 hash for privacy |
| `role` | TEXT | Admin, Player, or Beta_Tester |

### 2.2 Characters Table

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key (Users) |
| `data_json` | JSONB | Stats, Class, HP, XP, and Spells |
| `inventory_json` | JSONB | Current equipment, equipped weapon/shield state, item quantities, and AC modifiers |
| `is_alive` | BOOLEAN | If false, triggers the "Temple Loop" logic |

### 2.3 Adventure_State Table (World State)

| Column | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary Key |
| `character_id` | UUID | Foreign Key (Characters) |
| `module_id` | TEXT | e.g., "B1_QUASQUETON" |
| `fog_of_war` | JSONB | Map coordinates revealed by player |
| `stocking_map` | JSONB | Dynamic placement of monsters/treasure for this instance |

---

## 3. The Quasqueton Engine (Module B1 Logic)

### 3.1 Dynamic Stocking Logic

The engine must implement a `DungeonPopulator` service that runs once per adventure start:

* **Input**: `B1_Master_Tables.json` (Monsters and Treasures).
* **Logic**: Iterates through all "Unkeyed" rooms in the B1 Map JSON.
* **Output**: A `stocking_map` object saved to the database.

### 3.2 Environmental Event System

A centralized `TimeManager` tracks "Turns" (100 tiles moved or 1 combat encounter).

* **Turn % 2 == 0**: Trigger `WanderingMonsterCheck` (1-in-6).
* **Torch State**: Reduce `active_light_duration`. At 0, vision radius drops to 1 tile unless the player has *Infravision*.
* **Special Triggers**: Room-specific scripts (e.g., Room 38 "Pool of Wonders") are handled via a `RoomEffectContainer` that updates character stats directly.

---

## 4. UI & Presentation Layer

*Removing the folder/skeuomorphic UI in favor of a clean, high-contrast professional RPG interface.*

### 4.1 The "Tabbed" Interface

1. **Town/Adventure Tab**: High-fidelity map rendering using HTML5 Canvas or SVG.
2. **Character Tab**: Modernized "Stat Block" view with interactive equipment toggles.
3. **Reference Tab**: Searchable rules for THAC0, Saving Throws, and Monster Manual.

### 4.2 Visual Standards

* **Map Aesthetic**: Weathered parchment textures with hand-drawn tile overlays.
* **Typography**: Serif fonts for narrative/descriptions; Monospace for combat logs and stats.
* **Animations**: CSS typewriter effects for DM descriptions; subtle "flicker" on the Fog of War edges.

### 4.3 Inventory & Equipment UI

* **Unified Inventory Access**: The player may open the `Inventory` interface from Town, Dungeon, and Combat screens.
* **Equipment Toggles**: The Character Tab includes interactive equipment toggles for weapons, shields, and armor.
* **D&D Equip Rules**: Shield and two-handed weapon logic must be enforced by the UI, with incompatible off-hand gear disabled and AC recalculated immediately when equipment changes.

---

## 5. Future AI Integration Spec (v2.0 Preview)

The system is designed to support the following hooks for OpenAI/LLM integration:

* **`NarrativeService`**: A middleware that sends `[Room_ID, Stocking_Data, Character_History]` to an API to generate a unique sensory description (Smell, Sound, Visual).
* **`NPCDialogueService`**: Context-aware chat with NPCs in the Town of Threshold based on the player's current gold, class, and dungeon progress.
* **`TacticalAIService`**: API-driven decision making for boss-level monsters (e.g., Zelligar).

---

## 6. Security & Infrastructure

* **Identity Provider**: Netlify Identity (using JWT for session security).
* **API Layer**: Netlify Functions (Serverless) to handle database R/W and prevent client-side data manipulation.
* **Hosting**: Netlify (Frontend) + Supabase (Database).

---

**Document Version**: 2.0

**Next Review**: Implementation of Phase 4 (Cloud Sync)

**Approved By**: Lead Dev

**Date**: March 5, 2026