import { expect } from 'vitest';
import * as DungeonEngine from './DungeonEngine';

/**
 * DungeonEngine Unit Tests
 * Tests core dungeon state queries and room/exit/monster logic
 */

describe('DungeonEngine', () => {

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const mockModule = {
  rooms: {
    1: {
      'q1_1': {
        id: 'q1_1',
        title: 'Entrance',
        isCheckpoint: true,
        exits: [
          { targetRoomId: 'q1_2', doorType: 'normal', direction: 'north' }
        ],
        contents: {
          monsters: ['m1_1']
        }
      },
      'q1_2': {
        id: 'q1_2',
        title: 'Corridor',
        exits: [
          { targetRoomId: 'q1_1', doorType: 'normal', direction: 'south' },
          { targetRoomId: 'q1_3', doorType: 'normal', direction: 'west' },
          { targetRoomId: 'q1_4', doorType: 'secret', secretDoorId: 'secret_1', direction: 'east' }
        ],
        contents: {
          monsters: []
        }
      },
      'q1_3': {
        id: 'q1_3',
        title: 'Locked Room',
        exits: [
          { targetRoomId: 'q1_2', doorType: 'locked', direction: 'east' }
        ],
        contents: { monsters: [] }
      },
      'q1_4': {
        id: 'q1_4',
        title: 'Secret Chamber',
        exits: [],
        contents: {
          monsters: ['m1_2', 'm1_3']
        }
      }
    },
    2: {
      'q2_1': {
        id: 'q2_1',
        title: 'Lower Level',
        exits: [{ targetRoomId: 'q1_1', doorType: 'stair', direction: 'up' }],
        contents: { monsters: [] }
      }
    }
  },
  // Monster instances indexed by level and instanceId
  monsterInstances: {
    1: {
      'm1_1': { instanceId: 'm1_1', typeId: 'goblin', hp: { current: 3, max: 5 } },
      'm1_2': { instanceId: 'm1_2', typeId: 'orc', hp: { current: 6, max: 6 } },
      'm1_3': { instanceId: 'm1_3', typeId: 'orc', hp: { current: 6, max: 6 } }
    },
    2: {}
  }
};

const initialDungeonState = {
  moduleId: 'quasqueton',
  currentLevel: 1,
  currentRoomId: 'q1_1',
  previousRoomId: null,
  roomStates: {
    1: {
      'q1_1': 'entered',
      'q1_2': 'unexplored',
      'q1_3': 'unexplored',
      'q1_4': 'unexplored'
    },
    2: {
      'q2_1': 'unexplored'
    }
  },
  visitedRooms: { 1: ['q1_1'], 2: [] },
  defeatedMonsters: [],
  collectedTreasure: [],
  searchedRooms: [],
  discoveredSecretDoors: [],
  turnCount: 0,
  wanderingMonsterDue: false,
  inCombat: false,
  currentEnemy: null,
  narrationHistory: [],
  isVictorious: false,
  isDefeated: false,
  hasLight: true,
  lightSource: 'torch',
  lightDuration: 6
};

// ─────────────────────────────────────────────────────────────────────────────
// Room Queries
// ─────────────────────────────────────────────────────────────────────────────

describe('DungeonEngine - Room Queries', () => {
  let state;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialDungeonState));
  });

  describe('getRoom', () => {
    it('should return room object for valid level and roomId', () => {
      const room = DungeonEngine.getRoom(mockModule, 1, 'q1_1');
      expect(room).toBeDefined();
      expect(room.title).toBe('Entrance');
    });

    it('should return null for non-existent room', () => {
      const room = DungeonEngine.getRoom(mockModule, 1, 'doesnt_exist');
      expect(room).toBeNull();
    });

    it('should return null for non-existent level', () => {
      const room = DungeonEngine.getRoom(mockModule, 99, 'q1_1');
      expect(room).toBeNull();
    });
  });

  describe('getCurrentRoom', () => {
    it('should return the current room based on dungeonState', () => {
      const room = DungeonEngine.getCurrentRoom(mockModule, state);
      expect(room.id).toBe('q1_1');
    });

    it('should return null if current room invalid', () => {
      state.currentRoomId = 'invalid';
      const room = DungeonEngine.getCurrentRoom(mockModule, state);
      expect(room).toBeNull();
    });
  });

  describe('getRoomState', () => {
    it('should return unexplored for unvisited room', () => {
      const roomState = DungeonEngine.getRoomState(state, 1, 'q1_2');
      expect(roomState).toBe('unexplored');
    });

    it('should return actual state for visited room', () => {
      state.roomStates[1]['q1_1'] = 'entered';
      const roomState = DungeonEngine.getRoomState(state, 1, 'q1_1');
      expect(roomState).toBe('entered');
    });

    it('should return unexplored as default for missing entry', () => {
      delete state.roomStates[1]['q1_1'];
      const roomState = DungeonEngine.getRoomState(state, 1, 'q1_1');
      expect(roomState).toBe('unexplored');
    });
  });

  describe('hasVisited', () => {
    it('should return true for visited room', () => {
      const visited = DungeonEngine.hasVisited(state, 1, 'q1_1');
      expect(visited).toBe(true);
    });

    it('should return false for unvisited room', () => {
      const visited = DungeonEngine.hasVisited(state, 1, 'q1_2');
      expect(visited).toBe(false);
    });

    it('should return false if visitedRooms is missing', () => {
      delete state.visitedRooms;
      const visited = DungeonEngine.hasVisited(state, 1, 'q1_1');
      expect(visited).toBe(false);
    });
  });

  describe('isRoomCleared', () => {
    it('should return true for cleared room', () => {
      state.roomStates[1]['q1_2'] = 'cleared';
      const cleared = DungeonEngine.isRoomCleared(mockModule, state, 1, 'q1_2');
      expect(cleared).toBe(true);
    });

    it('should return true for looted room', () => {
      state.roomStates[1]['q1_2'] = 'looted';
      const cleared = DungeonEngine.isRoomCleared(mockModule, state, 1, 'q1_2');
      expect(cleared).toBe(true);
    });

    it('should return true if all monsters defeated', () => {
      // Room q1_4 has 2 orcs (m1_2, m1_3), mark both defeated
      state.defeatedMonsters = ['m1_2', 'm1_3'];
      const cleared = DungeonEngine.isRoomCleared(mockModule, state, 1, 'q1_4');
      expect(cleared).toBe(true);
    });

    it('should return false if monsters remain', () => {
      // Room q1_4 has 2 orcs, only 1 defeated
      state.defeatedMonsters = ['m1_2'];
      const cleared = DungeonEngine.isRoomCleared(mockModule, state, 1, 'q1_4');
      expect(cleared).toBe(false);
    });

    it('should return false for unexplored room with monsters', () => {
      const cleared = DungeonEngine.isRoomCleared(mockModule, state, 1, 'q1_1');
      expect(cleared).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Exit & Movement Queries
// ─────────────────────────────────────────────────────────────────────────────

describe('DungeonEngine - Exit & Movement', () => {
  let state;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialDungeonState));
  });

  describe('getVisibleExits', () => {
    it('should return all normal exits', () => {
      const exits = DungeonEngine.getVisibleExits(mockModule, 1, 'q1_2', []);
      const normalExits = exits.filter(e => e.doorType !== 'secret');
      expect(normalExits.length).toBeGreaterThan(0);
    });

    it('should exclude undiscovered secret exits', () => {
      const exits = DungeonEngine.getVisibleExits(mockModule, 1, 'q1_2', []);
      const secretExits = exits.filter(e => e.doorType === 'secret');
      expect(secretExits.length).toBe(0);
    });

    it('should include discovered secret exits', () => {
      const exits = DungeonEngine.getVisibleExits(mockModule, 1, 'q1_2', ['secret_1']);
      const secretExits = exits.filter(e => e.secretDoorId === 'secret_1');
      expect(secretExits.length).toBe(1);
    });

    it('should return empty array for non-existent room', () => {
      const exits = DungeonEngine.getVisibleExits(mockModule, 1, 'doesnt_exist', []);
      expect(exits).toEqual([]);
    });
  });

  describe('canEnterRoom', () => {
    it('should allow entry to adjacent accessible room', () => {
      const result = DungeonEngine.canEnterRoom(
        mockModule,
        state,
        1,
        'q1_2',
        'q1_1'
      );
      expect(result.allowed).toBe(true);
    });

    it('should block entry while in combat', () => {
      state.inCombat = true;
      const result = DungeonEngine.canEnterRoom(
        mockModule,
        state,
        1,
        'q1_2',
        'q1_1'
      );
      expect(result.allowed).toBe(false);
    });

    it('should block entry through locked door', () => {
      const result = DungeonEngine.canEnterRoom(
        mockModule,
        state,
        1,
        'q1_2',
        'q1_3'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('locked');
    });

    it('should block entry through undiscovered secret door', () => {
      state.currentRoomId = 'q1_2';
      const result = DungeonEngine.canEnterRoom(
        mockModule,
        state,
        1,
        'q1_4',
        'q1_2'
      );
      expect(result.allowed).toBe(false);
    });

    it('should allow entry through discovered secret door', () => {
      state.currentRoomId = 'q1_2';
      state.discoveredSecretDoors = ['secret_1'];
      const result = DungeonEngine.canEnterRoom(
        mockModule,
        state,
        1,
        'q1_4',
        'q1_2'
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('findExit', () => {
    it('should find exit to adjacent room', () => {
      const exit = DungeonEngine.findExit(mockModule, 1, 'q1_1', 'q1_2', []);
      expect(exit).toBeDefined();
      expect(exit.targetRoomId).toBe('q1_2');
    });

    it('should find discovered secret exit', () => {
      const exit = DungeonEngine.findExit(mockModule, 1, 'q1_2', 'q1_4', ['secret_1']);
      expect(exit).toBeDefined();
      expect(exit.secretDoorId).toBe('secret_1');
    });

    it('should not find undiscovered secret exit', () => {
      const exit = DungeonEngine.findExit(mockModule, 1, 'q1_2', 'q1_4', []);
      expect(exit).toBeNull();
    });

    it('should return null for non-existent room connection', () => {
      const exit = DungeonEngine.findExit(mockModule, 1, 'q1_1', 'q1_3', []);
      expect(exit).toBeNull();
    });
  });

  describe('getStairExit', () => {
    it('should return stair exit if present', () => {
      const room = mockModule.rooms[2]['q2_1'];
      const stair = DungeonEngine.getStairExit(room);
      expect(stair).toBeDefined();
      expect(stair.doorType).toBe('stair');
    });

    it('should return null if no stair exit', () => {
      const room = mockModule.rooms[1]['q1_1'];
      const stair = DungeonEngine.getStairExit(room);
      expect(stair).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Monster Queries
// ─────────────────────────────────────────────────────────────────────────────

describe('DungeonEngine - Monster Queries', () => {
  let state;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialDungeonState));
  });

  describe('getLivingMonstersInRoom', () => {
    it('should return live monsters in room', () => {
      const living = DungeonEngine.getLivingMonstersInRoom(mockModule, state, 1, 'q1_1');
      expect(living.length).toBeGreaterThan(0);
    });

    it('should exclude defeated monsters', () => {
      state.defeatedMonsters = ['m1_1'];
      const living = DungeonEngine.getLivingMonstersInRoom(mockModule, state, 1, 'q1_1');
      expect(living.length).toBe(0);
    });

    it('should handle multiple monsters in room', () => {
      const living = DungeonEngine.getLivingMonstersInRoom(mockModule, state, 1, 'q1_4');
      expect(living.length).toBe(2);
    });

    it('should return empty array for room with no monsters', () => {
      const living = DungeonEngine.getLivingMonstersInRoom(mockModule, state, 1, 'q1_2');
      expect(living).toEqual([]);
    });

    it('should return empty array for non-existent room', () => {
      const living = DungeonEngine.getLivingMonstersInRoom(mockModule, state, 1, 'doesnt_exist');
      expect(living).toEqual([]);
    });
  });

  describe('getMonsterInstance', () => {
    it('should return monster instance by ID', () => {
      const monster = DungeonEngine.getMonsterInstance(mockModule, 'm1_1');
      expect(monster).toBeDefined();
      expect(monster.typeId).toBe('goblin');
    });

    it('should return null for non-existent instance', () => {
      const monster = DungeonEngine.getMonsterInstance(mockModule, 'doesnt_exist');
      expect(monster).toBeNull();
    });
  });

  describe('isMonsterDefeated', () => {
    it('should return false for live monster', () => {
      const defeated = DungeonEngine.isMonsterDefeated(state, 'm1_1');
      expect(defeated).toBe(false);
    });

    it('should return true for defeated monster', () => {
      state.defeatedMonsters = ['m1_1'];
      const defeated = DungeonEngine.isMonsterDefeated(state, 'm1_1');
      expect(defeated).toBe(true);
    });
  });

  describe('isTreasureCollected', () => {
    let state;

    beforeEach(() => {
      state = JSON.parse(JSON.stringify(initialDungeonState));
    });

    it('should return false for uncollected treasure', () => {
      expect(DungeonEngine.isTreasureCollected(state, 'treasure_1')).toBe(false);
    });

    it('should return true for collected treasure', () => {
      state.collectedTreasure = ['treasure_1'];
      expect(DungeonEngine.isTreasureCollected(state, 'treasure_1')).toBe(true);
    });
  });
});
});

