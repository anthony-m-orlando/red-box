/**
 * The Haunted Crypt
 * A second adventure for level 1 characters
 * Difficulty: Medium (undead theme)
 * Focus: Undead enemies, Cleric abilities shine
 */

export const hauntedCryptAdventure = {
  id: 'haunted_crypt',
  name: 'The Haunted Crypt',
  description: 'An ancient burial site has become restless. The dead walk, and dark magic permeates the air. A cleric\'s skills will be especially valuable here.',
  recommendedLevel: 1,
  recommendedPartySize: 1,
  
  startingRoom: 'crypt_entrance',
  
  rooms: {
    crypt_entrance: {
      id: 'crypt_entrance',
      name: 'Crypt Entrance',
      coordinates: { x: 1, y: 1 },
      description: `You stand before a stone archway leading into an ancient crypt. Faded carvings of death gods adorn the entrance. A chill wind blows from within, carrying whispers of the dead.
      
Stone steps descend north into darkness.`,
      exits: [
        {
          direction: 'north',
          targetRoomId: 'burial_hall',
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
    
    burial_hall: {
      id: 'burial_hall',
      name: 'Burial Hall',
      coordinates: { x: 1, y: 0 },
      description: `A long hall lined with burial alcoves. Ancient bones rest in each niche. Some of the skeletons are not as peaceful as they should be...
      
Passages lead west to a side chamber and north deeper into the crypt. You can return south to the entrance.`,
      exits: [
        {
          direction: 'south',
          targetRoomId: 'crypt_entrance',
          doorType: 'open',
          discovered: true
        },
        {
          direction: 'west',
          targetRoomId: 'offering_chamber',
          doorType: 'closed',
          discovered: false
        },
        {
          direction: 'north',
          targetRoomId: 'tomb_of_ancients',
          doorType: 'closed',
          discovered: false
        }
      ],
      contents: {
        monsters: ['skeleton_guardian_1', 'skeleton_guardian_2'],
        npcs: [],
        treasure: [],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true
    },
    
    offering_chamber: {
      id: 'offering_chamber',
      name: 'Offering Chamber',
      coordinates: { x: 0, y: 0 },
      description: `A small chamber where offerings were once made to the dead. A stone altar stands in the center, covered in dust and cobwebs. Ancient coins and trinkets lie scattered about.
      
The only exit leads east back to the burial hall.`,
      exits: [
        {
          direction: 'east',
          targetRoomId: 'burial_hall',
          doorType: 'open',
          discovered: true
        }
      ],
      contents: {
        monsters: [],
        npcs: [],
        treasure: ['offering_coins'],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: false
    },
    
    tomb_of_ancients: {
      id: 'tomb_of_ancients',
      name: 'Tomb of the Ancients',
      coordinates: { x: 1, y: -1 },
      description: `The deepest part of the crypt, where the most important dead were laid to rest. Stone sarcophagi line the walls. The largest tomb in the center has been disturbed - its lid lies broken on the floor.
      
Something unholy lurks here! The only exit leads south.`,
      exits: [
        {
          direction: 'south',
          targetRoomId: 'burial_hall',
          doorType: 'open',
          discovered: true
        }
      ],
      contents: {
        monsters: ['zombie_lord'],
        npcs: [],
        treasure: ['ancient_relics'],
        traps: []
      },
      state: 'unexplored',
      autoStartCombat: true,
      isBossRoom: true
    }
  },
  
  monsters: {
    skeleton_guardian_1: {
      id: 'skeleton_guardian_1',
      name: 'Skeleton Guardian',
      hp: { current: 4, max: 4 },
      hitDice: '1',
      ac: 7,
      thac0: 19,
      damage: '1d6',
      xp: 10,
      morale: 12,
      alignment: 'Chaotic',
      special: ['Undead (immune to sleep, charm)']
    },
    skeleton_guardian_2: {
      id: 'skeleton_guardian_2',
      name: 'Skeleton Guardian',
      hp: { current: 4, max: 4 },
      hitDice: '1',
      ac: 7,
      thac0: 19,
      damage: '1d6',
      xp: 10,
      morale: 12,
      alignment: 'Chaotic',
      special: ['Undead (immune to sleep, charm)']
    },
    zombie_lord: {
      id: 'zombie_lord',
      name: 'Zombie Lord',
      hp: { current: 12, max: 12 },
      hitDice: '2+2',
      ac: 7,
      thac0: 18,
      damage: '1d8+1',
      xp: 30,
      morale: 12,
      alignment: 'Chaotic',
      special: ['Undead (immune to sleep, charm)', 'Tough (extra HP)', 'Relentless (always fights to destruction)']
    }
  },
  
  treasure: {
    offering_coins: {
      id: 'offering_coins',
      description: 'Ancient coins and small trinkets left as offerings',
      gold: 25,
      items: []
    },
    ancient_relics: {
      id: 'ancient_relics',
      description: 'Valuable relics from the tomb',
      gold: 75,
      items: [
        {
          id: 'holy_symbol',
          name: 'Silver Holy Symbol',
          type: 'equipment',
          description: 'A blessed silver holy symbol (+1 to Turn Undead)'
        },
        {
          id: 'healing_potion',
          name: 'Healing Potion',
          type: 'consumable',
          effect: { type: 'healing', formula: '1d8' }
        }
      ]
    }
  }
};

/**
 * Get room by ID
 */
export function getCryptRoom(roomId) {
  return hauntedCryptAdventure.rooms[roomId];
}

/**
 * Get monster by ID
 */
export function getCryptMonster(monsterId) {
  return hauntedCryptAdventure.monsters[monsterId];
}

/**
 * Check if crypt is complete
 */
export function checkCryptVictory(defeatedMonsters) {
  const requiredDefeats = ['zombie_lord'];
  return requiredDefeats.every(monster => defeatedMonsters.includes(monster));
}

export default hauntedCryptAdventure;
