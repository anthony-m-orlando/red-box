# 🗺️ Old School RPG: Unified Implementation Roadmap

**Project**: Classic D&D-Inspired Web RPG  
**Current Version**: 0.1.0 (Beta)  
**Last Updated**: March 5, 2026  
**Status**: Transitioning to Cloud Architecture & Expanded Content  

---

## 📜 Executive Summary
This roadmap outlines the evolution of the platform from a local-storage web application to a persistent, cloud-based RPG service. We have officially deprecated the "Trapper Keeper UI" (v0.2.0-alt) in favor of deep gameplay mechanics, user identity, and an eventual expansion into the **Expert Set (Blue Box)** ruleset.

---

## 🛡️ Version 1: The Core Experience (Red Box Era)
*Focus: Deepening the "Basic" ruleset, establishing persistence, and enriching the UI.*

### Phase 1: Town of Threshold (v0.2.0)
**Objective**: Replace static menus with a functional, interactive hub.
* **The Threshold Arms (Inn)**: Mechanics for HP/Spell recovery and a "Rumor Table" for quest hooks.
* **Economic Hub**: Blacksmith and General Store for equipment scaling and inventory management.
* **The Vault**: A banking system to manage gold and transition wealth between characters.
* **Dynamic State**: A simple Day/Night cycle affecting town NPC availability and lighting.

### Phase 2: B1 - In Search of the Unknown (v0.3.0)
**Objective**: Implement a large-scale, classic dungeon module to test engine limits.
* **Module Integration**: 40+ room dungeon with branching paths.
* **Procedural Content**: Randomized monster and treasure placement within defined parameters.
* **Environmental Interaction**: Pits, poison gas, sliding walls, and puzzles requiring ability checks.
* **Tactical Combat**: Implementation of party "Marching Orders" and Monster Morale checks.

### Phase 3: Visual Enrichment & Cartography (v0.4.0)
**Objective**: Enhance immersion through "Professional UI" polish rather than skeuomorphic gimmicks.
* **Enhanced Dungeon Maps**: High-fidelity, parchment-style maps with room annotations.
* **Advanced Auto-Mapper**: Real-time mini-map with Fog of War and discovery tracking.
* **Narrative "Typewriter" Effect**: Atmospheric delivery of DM descriptions and combat logs.
* **Atmospheric Audio**: Dynamic ambient soundscapes that change based on dungeon depth.

### Phase 4: Identity & Persistence (v0.5.0)
**Objective**: Transition to a modern SaaS architecture for player data.
* **Cloud Backend**: Migration from `localStorage` to a hosted database (PostgreSQL/NoSQL).
* **User Accounts**: Secure authentication (OAuth/Email) to enable cross-device play.
* **JSON Persistence**: All game states, character sheets, and world flags stored as cloud-synced JSON.
* **Character Chronicles**: A persistent "Hall of Fame" tracking deeds and stats across a user's account history.

---

## 📘 Version 2: The Expert Expansion (Blue Box)
*Focus: Wilderness exploration, advanced AI, and community tools.*

### Key Goals for Version 2.0.0
* **Expert Set Integration**: 
    * Expansion of level caps from 3 to 14.
    * Introduction of Wilderness/Hex-crawl navigation mechanics.
    * Waterborne and Aerial combat systems.
* **AI Integration (LLM/API)**:
    * **Generative Narrative**: Integration with OpenAI/Anthropic APIs to generate unique, context-aware room descriptions and NPC dialogue.
    * **Neural Enemy AI**: Utilizing APIs to drive complex, unpredictable monster behaviors and tactical retreats.
* **Dynamic Lighting Engine**: Implementation of a "True Vision" system where light sources (torches/lanterns) cast dynamic shadows and affect monster detection.
* **Modding Support**: A public-facing JSON framework allowing users to build, upload, and share their own dungeon modules.
* **Stronghold Management**: High-level gameplay mechanics for building keeps, sanctums, and groves.

---

## 🛠️ Technical Stack & Principles

### The Stack
* **Frontend**: React / TypeScript (Current)
* **Backend**: Node.js / Express or Supabase
* **Database**: PostgreSQL for structured data; JSONB for flexible game states.
* **Hosting**: Netlify (Frontend) / AWS or Railway (Backend)

### Development Principles
1.  **Gameplay First**: Focus on mechanics over UI fluff (No Trapper Keeper UI).
2.  **Data Integrity**: Cloud saves must be atomic and redundant.
3.  **Authenticity**: Retain the "lethality" and "wonder" of 1980s tabletop gaming.
4.  **Extensibility**: Code must support the jump from "Basic" to "Expert" rules without a total rewrite.

---

## ⚠️ Risk Management
* **API Costs**: AI-generated content will be togglable or rate-limited to manage API overhead.
* **Scale**: Transitioning to Version 2 (Expert) requires a significant refactor of the travel engine to handle outdoor maps.
* **Legal**: Maintain "Original Interpretation" status to stay clear of copyright issues while honoring the spirit of the 1981/1983 sets.

---
**End of Document**