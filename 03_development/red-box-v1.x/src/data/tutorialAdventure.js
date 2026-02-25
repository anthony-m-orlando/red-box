/**
 * Tutorial Adventure: "Your First Adventure"
 * From D&D Basic Rules Players Manual (pages 16-22)
 * 
 * A simple 3-encounter tutorial teaching:
 * - Movement and exploration
 * - Combat mechanics
 * - Treasure collection
 * - Character death and survival
 */

export const tutorialAdventure = {
  id: 'tutorial',
  title: 'Your First Adventure',
  description: 'A beginner adventure to learn the basics of dungeon exploration.',
  startingRoomId: 'tutorial_entrance',
  
  // Victory condition: Complete all 3 encounters and return to entrance
  victoryConditions: [
    {
      type: 'defeat_enemy',
      targetId: 'goblin_1',
      description: 'Defeat the goblin'
    },
    {
      type: 'defeat_enemy',
      targetId: 'snake_1',
      description: 'Defeat the snake'
    },
    {
      type: 'defeat_enemy',
      targetId: 'rust_monster_1',
      description: 'Defeat the rust monster'
    }
  ],
  
  // Rooms in the tutorial adventure
  rooms: {
    tutorial_entrance: {
      id: 'tutorial_entrance',
      name: 'Dungeon Entrance',
      coordinates: { x: 1, y: 1 },
      description: `You stand at the entrance to your first dungeon. The stone walls are damp and covered in moss. A narrow corridor stretches ahead into darkness.
      
This is where your adventure begins!`,
      exits: [
        {
          direction: 'east',
          targetRoomId: 'tutorial_corridor',
          doorType: 'open',
          discovered: true
        }
      ],
      contents: {
        monsters: [],
        npcs: [],
        treasure: [],
        traps: []
      },
      state: 'entered', // Player starts here
      isCheckpoint: true // Safe rest area
    },
    
    tutorial_corridor: {
      id: 'tutorial_corridor',
      name: 'Dark Corridor',
      coordinates: { x: 2, y: 1 },
      description: `A long, dark corridor stretches before you. You hear the faint sound of dripping water echoing off the stone walls. The air is musty and stale.
      
In the dim light, you see passages leading north and south.`,
      exits: [
        {
          direction: 'west',
          targetRoomId: 'tutorial_entrance',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'north',
          targetRoomId: 'goblin_room',
          doorType: 'open',
          discovered: false
        },
        {
          direction: 'south',
          targetRoomId: 'snake_room',
          doorType: 'open',
          discovered: false
        }
      ],
      contents: {
        monsters: [],
        npcs: [],
        treasure: [],
        traps: [
          {
            id: 'pit_trap',
            type: 'pit',
            detected: false,
            triggered: false,
            damage: '1d6',
            saveType: 'death', // Death Ray save
            description: 'A concealed pit trap!',
            detectChance: {
              dwarf: 1.0, // Automatic detection for dwarves
              thief: 1.0, // Automatic detection for thieves
              default: 1/6 // 1 in 6 for others
            }
          }
        ]
      },
      state: 'unexplored'
    },
    
    goblin_room: {
      id: 'goblin_room',
      name: 'Goblin\'s Lair',
      coordinates: { x: 2, y: 0 },
      description: `You enter a small chamber littered with bones and refuse. The stench is overwhelming.
      
A GOBLIN crouches in the corner, its yellow eyes gleaming with malice. It notices you and reaches for its crude weapon!`,
      exits: [
        {
          direction: 'south',
          targetRoomId: 'tutorial_corridor',
          doorType: 'open',
          discovered: true
        }
      ],
      contents: {
        monsters: ['goblin_1'],
        npcs: [],
        treasure: [
          {
            id: 'goblin_treasure',
            type: 'coins',
            amount: 10,
            description: '10 gold pieces scattered among the refuse'
          }
        ],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true // Combat starts immediately on entry
    },
    
    snake_room: {
      id: 'snake_room',
      name: 'Snake Pit',
      coordinates: { x: 2, y: 2 },
      description: `You step into a dank chamber. The floor is slick with moisture, and you hear a low hissing sound.
      
Coiled in the center of the room is a large SNAKE, its forked tongue tasting the air. It regards you with cold, unblinking eyes!`,
      exits: [
        {
          direction: 'north',
          targetRoomId: 'tutorial_corridor',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'east',
          targetRoomId: 'treasure_room',
          doorType: 'open',
          discovered: false
        }
      ],
      contents: {
        monsters: ['snake_1'],
        npcs: [],
        treasure: [],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true
    },
    
    treasure_room: {
      id: 'treasure_room',
      name: 'Treasure Chamber',
      coordinates: { x: 3, y: 2 },
      description: `You enter a small chamber with higher ceilings than the previous rooms. Against the far wall sits an old wooden chest.
      
But wait! A bizarre creature scuttles toward you—a RUST MONSTER! Its antennae wave menacingly, seeking metal to corrode!`,
      exits: [
        {
          direction: 'west',
          targetRoomId: 'snake_room',
          doorType: 'open',
          discovered: true
        }
      ],
      contents: {
        monsters: ['rust_monster_1'],
        npcs: [],
        treasure: [
          {
            id: 'wooden_chest',
            type: 'chest',
            contents: [
              {
                type: 'coins',
                amount: 50,
                description: '50 gold pieces'
              },
              {
                type: 'item',
                id: 'healing_potion',
                name: 'Potion of Healing',
                description: 'Restores 1d6+1 hit points'
              }
            ],
            description: 'An old wooden chest bound with iron straps'
          }
        ],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true
    }
  },
  
  // Monster definitions for this adventure
  monsters: {
    goblin_1: {
      id: 'goblin_1',
      name: 'Goblin',
      type: 'goblin',
      hp: { current: 4, max: 4 },
      ac: 6,
      thac0: 19,
      damage: '1d6',
      xp: 5,
      morale: 7,
      description: 'A small, evil humanoid with yellowed skin and sharp teeth',
      tactics: 'The goblin attacks with its short sword, fighting to the death to protect its lair.',
      defeatedText: 'The goblin falls with a final shriek. Its treasure is now yours!'
    },
    
    snake_1: {
      id: 'snake_1',
      name: 'Giant Snake',
      type: 'snake',
      hp: { current: 6, max: 6 },
      ac: 7,
      thac0: 19,
      damage: '1d4',
      xp: 10,
      morale: 8,
      description: 'A large constrictor snake, over 8 feet long',
      tactics: 'The snake strikes with its venomous bite, then tries to coil around its prey.',
      defeatedText: 'The snake goes limp and slides to the floor. The path east is now clear.',
      specialAbilities: [
        {
          id: 'poison',
          name: 'Poison Bite',
          description: 'On a successful hit, save vs. Poison or take 1d4 additional damage',
          trigger: 'on_hit'
        }
      ]
    },
    
    rust_monster_1: {
      id: 'rust_monster_1',
      name: 'Rust Monster',
      type: 'rust_monster',
      hp: { current: 10, max: 10 }, // Full health now that players can rest
      ac: 2,
      thac0: 19,
      damage: '0', // Doesn't do HP damage, ruins metal
      xp: 50,
      morale: 12,
      description: 'A rust monster with armadillo-like plating and long, feathery antennae.',
      tactics: 'The rust monster seeks metal to corrode.',
      defeatedText: 'The rust monster collapses! The treasure chest is safe!',
      specialAbilities: [
        {
          id: 'rust_metal',
          name: 'Rust Metal',
          description: 'Any metal that touches the antennae turns to rust. Save armor/weapons each hit!',
          trigger: 'on_hit'
        }
      ]
    }
  },
  
  // NPCs (none in tutorial, but structure for future)
  npcs: {},
  
  // Items that can be found
  items: {
    healing_potion: {
      id: 'healing_potion',
      name: 'Potion of Healing',
      type: 'potion',
      description: 'A small vial filled with red liquid that glows faintly',
      effect: {
        type: 'heal',
        amount: '1d6+1'
      },
      usable: true,
      consumable: true,
      value: 50
    }
  }
};

/**
 * Get starting room for tutorial
 */
export function getTutorialStartingRoom() {
  return tutorialAdventure.rooms[tutorialAdventure.startingRoomId];
}

/**
 * Get room by ID
 */
export function getTutorialRoom(roomId) {
  return tutorialAdventure.rooms[roomId];
}

/**
 * Get monster by ID
 */
export function getTutorialMonster(monsterId) {
  return tutorialAdventure.monsters[monsterId];
}

/**
 * Check if victory conditions are met
 */
export function checkTutorialVictory(defeatedMonsters) {
  const requiredDefeats = tutorialAdventure.victoryConditions
    .filter(c => c.type === 'defeat_enemy')
    .map(c => c.targetId);
  
  return requiredDefeats.every(monsterId => defeatedMonsters.includes(monsterId));
}

export default tutorialAdventure;
