/**
 * The Goblin Warren
 * A second adventure for level 1 characters
 * Difficulty: Easy-Medium
 */

export const goblinWarrenAdventure = {
  id: 'goblin_warren',
  name: 'The Goblin Warren',
  description: 'A network of tunnels infested with goblins and their kin. The local village has offered a reward for clearing out this menace.',
  recommendedLevel: 1,
  recommendedPartySize: 1,
  
  startingRoom: 'warren_entrance',
  
  rooms: {
    warren_entrance: {
      id: 'warren_entrance',
      name: 'Warren Entrance',
      coordinates: { x: 1, y: 1 },
      description: `You stand at the mouth of a dark cave. The smell of unwashed goblin-kind wafts out from within. Crude symbols are scratched into the stone around the entrance.
      
Tunnels lead deeper into the warren to the north and east.`,
      exits: [
        {
          direction: 'north',
          targetRoomId: 'guard_post',
          doorType: 'open',
          discovered: false
        },
        {
          direction: 'east',
          targetRoomId: 'storage_cave',
          doorType: 'open',
          discovered: false
        }
      ],
      contents: {
        monsters: [],
        npcs: [],
        treasure: [],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: false
    },
    
    guard_post: {
      id: 'guard_post',
      name: 'Guard Post',
      coordinates: { x: 1, y: 0 },
      description: `A crude guard chamber. Sleeping mats and gnawed bones litter the floor. An old barrel serves as a table, with dice and coppers scattered across it.
      
A tunnel continues north, and you can return south to the entrance.`,
      exits: [
        {
          direction: 'south',
          targetRoomId: 'warren_entrance',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'north',
          targetRoomId: 'chieftain_hall',
          doorType: 'closed',
          discovered: false
        }
      ],
      contents: {
        monsters: ['goblin_guard_1', 'goblin_guard_2'],
        npcs: [],
        treasure: ['goblin_coppers'],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true
    },
    
    storage_cave: {
      id: 'storage_cave',
      name: 'Storage Cave',
      coordinates: { x: 2, y: 1 },
      description: `A natural cave used as a storage area. Crates and barrels are stacked haphazardly. Most contain spoiled food and worthless junk, but something might be worth salvaging.
      
A passage leads north, and you can return west to the entrance.`,
      exits: [
        {
          direction: 'west',
          targetRoomId: 'warren_entrance',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'north',
          targetRoomId: 'rat_den',
          doorType: 'open',
          discovered: false
        }
      ],
      contents: {
        monsters: [],
        npcs: [],
        treasure: ['storage_goods'],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: false
    },
    
    rat_den: {
      id: 'rat_den',
      name: 'Rat Den',
      coordinates: { x: 2, y: 0 },
      description: `The stench here is overwhelming. Giant rats have made a nest in this cave, gnawing through the goblins' supplies. Their chittering echoes off the walls.
      
Passages lead south and west.`,
      exits: [
        {
          direction: 'south',
          targetRoomId: 'storage_cave',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'west',
          targetRoomId: 'chieftain_hall',
          doorType: 'open',
          discovered: false
        }
      ],
      contents: {
        monsters: ['giant_rat_pack'],
        npcs: [],
        treasure: [],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true
    },
    
    chieftain_hall: {
      id: 'chieftain_hall',
      name: 'Chieftain\'s Hall',
      coordinates: { x: 1, y: -1 },
      description: `A larger chamber that serves as the goblin chieftain's throne room. A crude wooden throne sits on a raised platform. Trophies from raids hang on the walls.
      
The chieftain and his best warriors are here! Exits lead south and east.`,
      exits: [
        {
          direction: 'south',
          targetRoomId: 'guard_post',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'east',
          targetRoomId: 'rat_den',
          doorType: 'open',
          discovered: false
        }
      ],
      contents: {
        monsters: ['goblin_chieftain'],
        npcs: [],
        treasure: ['chieftain_hoard'],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true,
      isBossRoom: true
    }
  },
  
  monsters: {
    goblin_guard_1: {
      id: 'goblin_guard_1',
      name: 'Goblin Guard',
      hp: { current: 4, max: 4 },
      hitDice: '1-1',
      ac: 6,
      thac0: 19,
      damage: '1d6',
      xp: 5,
      morale: 7,
      alignment: 'Chaotic'
    },
    goblin_guard_2: {
      id: 'goblin_guard_2',
      name: 'Goblin Guard',
      hp: { current: 4, max: 4 },
      hitDice: '1-1',
      ac: 6,
      thac0: 19,
      damage: '1d6',
      xp: 5,
      morale: 7,
      alignment: 'Chaotic'
    },
    giant_rat_pack: {
      id: 'giant_rat_pack',
      name: 'Giant Rat Pack',
      hp: { current: 3, max: 3 },
      hitDice: '1/2',
      ac: 7,
      thac0: 19,
      damage: '1d3',
      xp: 5,
      morale: 8,
      alignment: 'Neutral'
    },
    goblin_chieftain: {
      id: 'goblin_chieftain',
      name: 'Goblin Chieftain',
      hp: { current: 7, max: 7 },
      hitDice: '1+1',
      ac: 5,
      thac0: 18,
      damage: '1d6+1',
      xp: 15,
      morale: 9,
      alignment: 'Chaotic',
      special: ['Leader (+1 morale to nearby goblins)', 'Better equipment']
    }
  },
  
  treasure: {
    goblin_coppers: {
      id: 'goblin_coppers',
      description: 'A small pile of copper pieces and gaming dice',
      gold: 5,
      items: []
    },
    storage_goods: {
      id: 'storage_goods',
      description: 'Salvageable goods from the storage',
      gold: 10,
      items: [
        {
          id: 'healing_potion',
          name: 'Healing Potion',
          type: 'consumable',
          effect: { type: 'healing', formula: '1d8' }
        }
      ]
    },
    chieftain_hoard: {
      id: 'chieftain_hoard',
      description: 'The chieftain\'s treasure hoard',
      gold: 50,
      items: [
        {
          id: 'silver_dagger',
          name: 'Silver Dagger',
          type: 'weapon',
          description: 'A well-crafted silver dagger'
        }
      ]
    }
  }
};

/**
 * Get room by ID
 */
export function getWarrenRoom(roomId) {
  return goblinWarrenAdventure.rooms[roomId];
}

/**
 * Get monster by ID
 */
export function getWarrenMonster(monsterId) {
  return goblinWarrenAdventure.monsters[monsterId];
}

/**
 * Check if warren is complete
 */
export function checkWarrenVictory(defeatedMonsters) {
  const requiredDefeats = ['goblin_chieftain'];
  return requiredDefeats.every(monster => defeatedMonsters.includes(monster));
}

export default goblinWarrenAdventure;
