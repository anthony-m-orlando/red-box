# Project Redbox: Production Roadmap

## Sprint 1: The Tactical Folder UI (Foundation)
* **The Folder Shell**: Persistent UI wrapper with weathered textures.
* **N-Tab System**: Scalable navigation (Characters, Adventures, Dice, Reference).
* **Beta Milestone**: Basic character sheet and tutorial dungeon movement.

## Sprint 2: The Threshold Hub (Expansion)
* **Town Map**: 20x20 grid view with 7 key locations (Temple, Tavern, Blacksmith, etc.).
* **Social Engine**: JSON-driven dialogue trees with NPC persistence.
* **Hireling System**: Recruitment logic and the "Temple Resurrection" safety net.
* **Economic Loop**: Implementation of the 15% Tithe and shop inventories.

## Sprint 3: Infrastructure & Security (Production Transition)
* **Netlify Identity**: Secure login (Invite-only) with SHA-256 PII hashing.
* **Netlify DB (Neon)**: Migration from localStorage to a Postgres/JSONB backend.
* **Git-Ops**: Automated DB provisioning via `@netlify/neon` and GitHub integration.

## Sprint 4: The Quasqueton Engine (B1 Dungeon)
* **Tactical AI**: Morale (2d6) and Loyalty checks for NPCs and Monsters.
* **Combat Logic**: THAC0 automation and "Surrender/Flee" state management.
* **End-to-End Persistence**: Synchronizing Town and Dungeon states across devices.