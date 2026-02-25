# Adventure Engine Design Document
## Old School RPG Demo

**Date**: February 13, 2026  
**Purpose**: Define the system that drives adventure gameplay, room progression, and story flow

---

## 1. Overview

The Adventure Engine is the core system that manages:
- Room-by-room exploration and progression
- Event triggering (combat, NPCs, traps, treasure)
- Story state and narrative flow
- Victory/defeat conditions
- Save/checkpoint management

---

## 2. Adventure Structure

### 2.1 Two-Phase Approach

**Phase 1: Tutorial Adventure - "Your First Adventure"**
- Location: Pages 16-22 of Players Manual
- Purpose: Teach basic mechanics (combat, movement, treasure)
- Structure: Linear sequence of 3 encounters
- Estimated Duration: 15-20 minutes
- Victory Condition: Complete all 3 encounters and return to town

**Phase 2: Main Adventure - "Bargle Wanted"**
- Location: Dungeon Master's Guide (page 9+)
- Purpose: Full dungeon exploration experience
- Structure: Multi-room dungeon with non-linear exploration
- Estimated Duration: 1-2 hours
- Victory Condition: Defeat Bargle and rescue Aleena

### 2.2 Adventure Data Structure

```typescript
interface Adventure {
  id: string;                    // "tutorial" | "bargle-wanted"
  title: string;                 // "Your First Adventure"
  description: string;           // Brief overview
  startingRoom: string;          // Room ID where adventure begins
  victoryConditions: VictoryCondition[];
  rooms: Record<string, Room>;   // All rooms in adventure
  npcs: Record<string, NPC>;     // All NPCs in adventure
  monsters: Record<string, Monster>; // All monsters
  items: Record<string, Item>;   // All discoverable items
}

interface VictoryCondition {
  type: 'defeat_enemy' | 'reach_location' | 'obtain_item' | 'rescue_npc';
  targetId: string;
  description: string;
}
```

---

## 3. Room System

### 3.1 Room States

Each room progresses through states:

```
UNEXPLORED → REVEALED → ENTERED → CLEARED
```

- **UNEXPLORED**: Player hasn't discovered this room (fog of war)
- **REVEALED**: Player can see room on map but hasn't entered
- **ENTERED**: Player has stepped into room, narration displays
- **CLEARED**: All encounters resolved, room is safe

### 3.2 Room Data Structure

```typescript
interface Room {
  id: string;                    // "tutorial_room_1", "bargle_lair"
  name: string;                  // "Dark Corridor", "The Vault"
  coordinates: {x: number, y: number}; // Map position
  description: string;           // Boxed text narration
  exits: Exit[];                 // Connected rooms/doors
  contents: RoomContents;        // What's in the room
  state: RoomState;              // Current state
  requirements?: Requirement[];  // Conditions to enter
}

interface Exit {
  direction: 'north' | 'south' | 'east' | 'west';
  targetRoomId: string;
  doorType: 'open' | 'closed' | 'locked' | 'secret';
  keyRequired?: string;          // Item ID if locked
  discovered: boolean;           // For secret doors
}

interface RoomContents {
  monsters?: string[];           // Monster IDs
  npcs?: string[];               // NPC IDs
  treasure?: TreasureDefinition[];
  traps?: TrapDefinition[];
  searchableObjects?: SearchableObject[];
}

type RoomState = 'unexplored' | 'revealed' | 'entered' | 'cleared';
```

### 3.3 Room Entry Flow

```
1. Player clicks adjacent room on map
2. Check if room is accessible (door unlocked, etc.)
3. If accessible:
   a. Update room state to ENTERED
   b. Display narration text in narration panel
   c. Trigger any automatic events (traps, ambushes)
   d. If monsters present → initiate combat
   e. If NPC present → show dialogue options
   f. Otherwise → allow player actions (search, examine, move on)
4. Auto-save game state
```

---

## 4. Event Trigger System

### 4.1 Event Types

```typescript
type EventType = 
  | 'combat'           // Monster encounter
  | 'trap'             // Pit, poison dart, etc.
  | 'treasure'         // Chest, coins, items
  | 'npc_dialogue'     // Conversation with NPC
  | 'story_progression' // Quest update
  | 'room_effect';     // Environmental (darkness, etc.)

interface Event {
  id: string;
  type: EventType;
  trigger: TriggerCondition;
  action: EventAction;
  oneTime: boolean;              // Can only happen once
  triggered: boolean;            // Has it been triggered?
}
```

### 4.2 Trigger Conditions

```typescript
interface TriggerCondition {
  type: 'on_enter' | 'on_search' | 'on_interact' | 'on_defeat' | 'conditional';
  roomId?: string;               // Specific room
  objectId?: string;             // Specific object/door
  conditions?: Condition[];      // Additional requirements
}

interface Condition {
  type: 'has_item' | 'monster_defeated' | 'hp_below' | 'quest_state';
  value: string | number | boolean;
}
```

### 4.3 Event Actions

```typescript
interface EventAction {
  type: 'show_narration' | 'spawn_monster' | 'start_combat' | 
        'show_dialogue' | 'add_item' | 'apply_damage' | 'update_quest';
  data: any;                     // Type-specific data
}
```

---

## 5. Combat Integration

### 5.1 Combat Initiation

When player enters room with monsters:

```
1. Room narration displays: "You see a GOBLIN!"
2. System checks for surprise (Initiative roll)
3. Narration panel shows combat start message
4. Combat UI overlays appear (enemy status, action buttons)
5. Turn-based combat begins
```

### 5.2 Combat State Machine

```
COMBAT_START
  ↓
ROLL_INITIATIVE
  ↓
DETERMINE_TURN_ORDER
  ↓
PLAYER_TURN (if player wins initiative)
  ↓
PLAYER_SELECTS_ACTION (attack, cast spell, use item, flee)
  ↓
RESOLVE_PLAYER_ACTION
  ↓
CHECK_COMBAT_END (enemy defeated? player fled?)
  ↓
MONSTER_TURN (if combat continues)
  ↓
MONSTER_AI_DECIDES
  ↓
RESOLVE_MONSTER_ACTION
  ↓
CHECK_COMBAT_END (player defeated?)
  ↓
NEXT_ROUND (loop back to PLAYER_TURN)
  ↓
COMBAT_END
  ↓
AWARD_XP_AND_TREASURE (if victory)
  ↓
UPDATE_ROOM_STATE (mark as CLEARED)
```

### 5.3 Monster AI Decision Logic

```typescript
function monsterTurn(monster: Monster, player: Character): CombatAction {
  // Simple AI for Basic D&D
  
  // 1. Check morale if badly wounded
  if (monster.currentHP < monster.maxHP * 0.25) {
    const moraleCheck = rollD6() + rollD6();
    if (moraleCheck < monster.morale) {
      return { type: 'flee' };
    }
  }
  
  // 2. Use special ability if available
  if (monster.specialAbilities && Math.random() < 0.3) {
    return {
      type: 'special',
      abilityId: selectRandomAbility(monster.specialAbilities)
    };
  }
  
  // 3. Default: Attack
  return {
    type: 'attack',
    targetId: player.id
  };
}
```

---

## 6. NPC Dialogue System

### 6.1 Dialogue Tree Structure

```typescript
interface DialogueTree {
  npcId: string;
  initialNodeId: string;
  nodes: Record<string, DialogueNode>;
}

interface DialogueNode {
  id: string;
  text: string;                  // What NPC says
  options: DialogueOption[];     // Player's response choices
  conditions?: Condition[];      // Requirements to see this node
  effects?: Effect[];            // What happens after this node
}

interface DialogueOption {
  id: string;
  text: string;                  // What player says
  nextNodeId: string | null;     // null = end conversation
  requiresCheck?: AbilityCheck;  // Optional skill check
  showIf?: Condition[];          // Only show if conditions met
}

interface AbilityCheck {
  ability: 'strength' | 'intelligence' | 'wisdom' | 'dexterity' | 'constitution' | 'charisma';
  target: number;                // Target number to beat
  successNodeId: string;         // Where to go if check succeeds
  failureNodeId: string;         // Where to go if check fails
}
```

### 6.2 Dialogue Flow Example (Aleena the Cleric)

```typescript
const aleenaDialogue: DialogueTree = {
  npcId: "aleena",
  initialNodeId: "greeting",
  nodes: {
    greeting: {
      id: "greeting",
      text: "Greetings, friend! I'm Aleena, a cleric. Looking for the goblin?",
      options: [
        {
          id: "yes",
          text: "Yes, I'm here to stop it!",
          nextNodeId: "offer_help"
        },
        {
          id: "negotiate",
          text: "Perhaps we can reach an agreement?",
          nextNodeId: "negotiation_attempt",
          requiresCheck: {
            ability: "charisma",
            target: 12,
            successNodeId: "negotiation_success",
            failureNodeId: "negotiation_failure"
          }
        },
        {
          id: "leave",
          text: "I'll come back when I'm better prepared.",
          nextNodeId: null
        }
      ]
    },
    offer_help: {
      id: "offer_help",
      text: "I can help! Together we'll defeat it. Let me join you.",
      options: [
        {
          id: "accept",
          text: "Yes, let's work together!",
          nextNodeId: null
        }
      ],
      effects: [
        { type: "add_party_member", value: "aleena" },
        { type: "update_quest", questId: "defeat_goblin", state: "aleena_joined" }
      ]
    }
  }
};
```

---

## 7. Narration Display System

### 7.1 UI Layout (Option B from clarifications)

```
┌────────────────────────────────────────────┐
│  NARRATION PANEL  [↕ Collapse]            │
│  ════════════════════════════════════      │
│  You enter a dark corridor. The walls     │
│  are damp and covered in moss. Ahead,     │
│  you hear a faint scratching sound...     │
│                                            │
│  A GOBLIN jumps out!                       │
│  Roll for initiative...                    │
└────────────────────────────────────────────┘
┌──────────────────┬─────────────────────────┐
│      MAP         │      ACTIONS            │
│   (Visual Grid)  │   [⚔ Attack]           │
│                  │   [🪄 Cast Spell]      │
│                  │   [🎒 Use Item]        │
│                  │   [🏃 Flee]            │
└──────────────────┴─────────────────────────┘
```

### 7.2 Narration Text Types

```typescript
type NarrationStyle = 
  | 'room_description'   // Boxed text when entering room
  | 'combat_action'      // "You swing at the goblin..."
  | 'dialogue'           // NPC speech
  | 'system_message'     // "You found 50 gold pieces!"
  | 'dm_note';           // Italicized hints/flavor

interface NarrationEntry {
  id: string;
  timestamp: number;
  style: NarrationStyle;
  text: string;
  speaker?: string;            // For dialogue
  emphasis?: boolean;          // For important text (ALL CAPS GOBLIN)
}
```

### 7.3 Narration Auto-Scrolling

- New messages append to bottom
- Panel auto-scrolls to show latest message
- Collapsed state shows only last message
- History preserved for scrollback
- Maximum 100 messages in history

---

## 8. Save System & Checkpoints

### 8.1 Auto-Save Triggers

```typescript
const AUTO_SAVE_EVENTS = [
  'room_entered',        // Every new room
  'combat_ended',        // After defeating monsters
  'level_up',            // Character gains level
  'treasure_collected',  // Major treasure found
  'npc_dialogue_completed', // After important conversation
  'quest_updated'        // Story progression
];
```

### 8.2 Save Data Structure

```json
{
  "saveVersion": "1.0",
  "timestamp": "2026-02-13T10:30:00Z",
  "character": {
    // Full character state from Character context
  },
  "adventure": {
    "currentAdventureId": "tutorial",
    "currentRoomId": "tutorial_room_2",
    "roomStates": {
      "tutorial_room_1": "cleared",
      "tutorial_room_2": "entered"
    },
    "defeatedMonsters": ["goblin_1"],
    "collectedTreasure": ["treasure_chest_1"],
    "questProgress": {
      "tutorial_complete": false
    },
    "eventHistory": [
      {
        "eventId": "goblin_encounter_1",
        "triggered": true,
        "timestamp": "2026-02-13T10:25:00Z"
      }
    ]
  },
  "journal": [
    // All journal entries
  ],
  "narrationHistory": [
    // Last 20 narration messages for continuity
  ]
}
```

### 8.3 Checkpoint System

- **Checkpoint**: Safe point where player can rest and save
- **Locations**: Town, cleared rooms with no monsters
- **Recovery**: Resting at checkpoint restores HP (with rations)
- **Fast Travel**: Can teleport between discovered checkpoints (town only in demo)

---

## 9. Victory & Defeat Conditions

### 9.1 Victory Conditions

**Tutorial Adventure:**
```typescript
{
  conditions: [
    { type: 'defeat_enemy', targetId: 'goblin_1' },
    { type: 'defeat_enemy', targetId: 'snake_1' },
    { type: 'defeat_enemy', targetId: 'rust_monster_1' },
    { type: 'reach_location', targetId: 'town_entrance' }
  ],
  all_required: true
}
```

**Bargle Wanted:**
```typescript
{
  conditions: [
    { type: 'defeat_enemy', targetId: 'bargle' },
    { type: 'rescue_npc', targetId: 'aleena' }
  ],
  all_required: true
}
```

### 9.2 Defeat Conditions

```typescript
function checkDefeat(character: Character): DefeatReason | null {
  if (character.currentHP <= 0) {
    return 'death';
  }
  
  // Future: Other defeat conditions (cursed, lost, etc.)
  return null;
}
```

### 9.3 Game Over Screen

When defeated:
- Display "Game Over" message
- Show final statistics (rooms explored, monsters defeated, XP earned)
- Options:
  - Load last checkpoint (restore from auto-save)
  - Return to town (penalty: lose collected treasure, keep XP)
  - Create new character (restart adventure)

---

## 10. Implementation Phases

### Phase 1: Tutorial Adventure (Week 3-4)
1. Implement room system (3 rooms from tutorial)
2. Create combat integration with goblin encounter
3. Build basic narration display
4. Add treasure system
5. Implement victory condition checking

### Phase 2: Main Adventure (Week 5-8)
1. Expand room system to handle full dungeon
2. Add NPC dialogue system (Aleena)
3. Implement secret doors and searching
4. Add trap system
5. Create boss encounter (Bargle)
6. Polish narration and story flow

### Phase 3: Enhancement (Week 9+)
1. Add more adventures from other modules
2. Implement random encounters
3. Add weather/environmental effects
4. Create side quests
5. Build adventure editor (stretch goal)

---

## 11. Integration with Existing Systems

### 11.1 Character Context
- Adventure engine reads character state for combat
- Updates character HP, XP, inventory
- Checks character abilities for dialogue requirements

### 11.2 Combat System
- Adventure engine initiates combat
- Combat system returns results (victory/defeat/flee)
- Adventure engine updates room state based on outcome

### 11.3 Map System
- Adventure engine provides room data
- Map displays room states (fog of war)
- Player clicks trigger adventure engine room transitions

### 11.4 Journal System
- Adventure engine logs all events automatically
- Manual entries allowed from any screen
- Journal displays chronological event history

---

**End of Adventure Engine Design Document**

This system provides the foundation for story-driven dungeon exploration while maintaining the authentic 1980s D&D Basic Rules experience.
