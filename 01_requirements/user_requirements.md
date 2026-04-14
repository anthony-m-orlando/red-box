Based on the updated roadmap and the synthesis of the existing beta requirements and the target goals for the "Red Box" release, here is the new **User Requirements Document for Version 1.0.0**.

This document removes the "Trapper Keeper" UI constraints, incorporates the cloud-based persistence model, and integrates the specific gameplay needs for the **B1 - In Search of the Unknown** module.

---

# 📜 User Requirements: Version 1.0.0 (The Red Box Edition)

## 1. Project Vision & Architecture

* **Vision**: A persistent, browser-based recreation of the 1981 D&D Basic Set, transitioning from a local-only tool to a cloud-synced RPG service.
* **Architecture**:
* **Cloud Persistence**: Migration from `localStorage` to a centralized database (e.g., Netlify DB or PostgreSQL).
* **Cross-Device Support**: Users must be able to access their characters and world state from any modern browser via secure login.
* **Invite-Only Access**: Initial Version 1 access will be managed via Admin-controlled invites to ensure server stability.



## 2. Authentication & Identity (Phase 4 Integration)

* **Secure Accounts**: Implementation of user authentication (OAuth or Email/Password).
* **PII Normalization**: To ensure privacy, all usernames and emails must be normalized and hashed (SHA-256) before database storage.
* **Character Chronicles**: The system must track and store a persistent history of "Heroic Deeds," monsters slain, and total gold earned across the account’s lifetime.

## 3. The Threshold Hub (Phase 1 Integration)

* **Interactive Town Map**: A central navigation hub for the "Town of Threshold" featuring at least 7 interactive locations.
* **The Threshold Arms (Inn)**: A primary recovery location where players can rest to restore HP and spells.
* **NPC Interaction**:
* **Branching Dialogue**: NPCs must support complex dialogue trees for rumors, bribes, and hiring.
* **Persistence**: NPC "Attitude" (Friendly, Neutral, Hostile) must persist based on previous player interactions.


* **The Temple Loop**: A "safety net" mechanic where a character who dies (with a hireling present) wakes at the Town Temple at coordinates (10,10) with their loot, minus a 15% tithe and the permanent loss of that hireling.

## 4. Exploration & Cartography (Phase 2 & 3 Integration)

* **The Quasqueton Engine**: Full implementation of the **B1 - In Search of the Unknown** module.
* **Enhanced Maps**:
* **Parchment Rendering**: Dungeon maps must utilize a high-fidelity, weathered paper aesthetic.
* **Annotation System**: Players must be able to mark maps with custom notes or discover automated annotations for secret doors.


* **Procedural Hazards**: Implementation of traps and hazards described in Module B1, including pits, poison gas, and interactive room features like the "Pool of Wonders".
* **Auto-Mapper**: A real-time mini-map that tracks player position and updates the "Fog of War" as rooms are explored.

## 5. Combat & Advanced Mechanics

* **Tactical AI**:
* **Morale Checks**: All entities (monsters and hirelings) must perform 2d6 Morale checks when under stress (e.g., leader death or 50% HP loss).
* **Surrender Logic**: Surrendered units must switch to a "Pass-through" collision state, allowing the player to move through their space.


* **Hirelings**:
* **Recruitment**: Hirelings can be found in the Threshold Arms.
* **Control Modes**: Players can toggle between full manual control or an autonomous "Protector" AI mode for hirelings in combat.



## 6. Technical Requirements

* **JSON Serialization**: All game data—including inventory, spellbooks, and world flags—must be serialized into JSON format for cloud syncing.
* **Performance**: The engine must support large-scale dungeons (40+ rooms) with no degradation in browser performance.
* **E2E Gameplay Flow**: The system must support a seamless transition from the initial Tutorial through the Town of Threshold and into the Caverns of Quasqueton.

---

**Document Version**: 2.0 (Post-Trapper Keeper Pivot)

**Status**: Approved for Version 1 Development

**Last Updated**: March 5, 2026