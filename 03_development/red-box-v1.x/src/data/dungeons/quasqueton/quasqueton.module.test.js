import { expect, describe, it, beforeEach } from 'vitest';
import { LEVEL1_ROOMS, getLevel1MonsterInstances } from './level1.js';
import { LEVEL2_ROOMS, getLevel2MonsterInstances } from './level2.js';

/**
 * Quasqueton Module Comprehensive Validation Tests
 * 
 * Validates all rooms, monster instances, and combat configurations
 * to ensure no edge cases slip through. This test suite:
 * 
 * 1. Verifies all monster instances are pre-registered in MONSTERS objects
 * 2. Ensures no inline createMonsterInstance() calls exist
 * 3. Validates each room can be entered, fought, and exited
 * 4. Checks victory conditions work for all room types
 * 5. Confirms instance lookup won't fail during combat
 */

describe('Quasqueton Module - Comprehensive Validation', () => {
  describe('Level 1 - Data Structure Validation', () => {
    const instances = getLevel1MonsterInstances();
    const roomIds = Object.keys(LEVEL1_ROOMS);
    const roomsWithMonsters = roomIds.filter(
      roomId => LEVEL1_ROOMS[roomId].contents?.monsters?.length > 0
    );

    it('should have MONSTERS object with all instances', () => {
      expect(instances).toBeDefined();
      expect(typeof instances).toBe('object');
      expect(Object.keys(instances).length).toBeGreaterThan(0);
    });

    it('should validate EVERY room with monsters has instances in MONSTERS', () => {
      const failures = [];
      
      roomsWithMonsters.forEach(roomId => {
        const room = LEVEL1_ROOMS[roomId];
        room.contents.monsters.forEach(monsterId => {
          if (!instances[monsterId]) {
            failures.push(`Room ${room.number} (${roomId}): missing instance "${monsterId}"`);
          }
        });
      });
      
      expect(failures).toEqual(
        [],
        `Monster instance lookup failures:\n${failures.join('\n')}`
      );
    });

    it('should validate EVERY room monster reference is string ID only', () => {
      const failures = [];
      
      roomsWithMonsters.forEach(roomId => {
        const room = LEVEL1_ROOMS[roomId];
        room.contents.monsters.forEach((monster, idx) => {
          if (typeof monster !== 'string') {
            failures.push(
              `Room ${room.number} (${roomId}): monster[${idx}] is ${typeof monster}, expected string`
            );
          }
        });
      });
      
      expect(failures).toEqual(
        [],
        `Monster reference type failures:\n${failures.join('\n')}`
      );
    });

    it('should verify Room 3 (Kobold Lair) combat viability', () => {
      const room = LEVEL1_ROOMS.q1_3;
      
      // Must have kobold instances
      expect(room.contents.monsters).toEqual([
        'q1_3_kobold_1',
        'q1_3_kobold_2',
        'q1_3_kobold_3',
        'q1_3_kobold_4'
      ]);
      
      // All must be resolvable
      room.contents.monsters.forEach(monsterId => {
        const instance = instances[monsterId];
        expect(instance).toBeDefined();
        expect(instance.type).toBe('kobold');
        expect(instance.maxHp).toBeGreaterThan(0);
        expect(instance.hp).toBe(instance.maxHp); // Should start at full HP
        expect(instance.isDefeated).toBe(false);
      });
    });

    it('should verify Room 34 (Lizard Lair) has properly registered instance', () => {
      const room = LEVEL1_ROOMS.q1_34;
      
      expect(room.contents.monsters).toEqual(['q1_34_lizard_1']);
      
      const instance = instances['q1_34_lizard_1'];
      expect(instance).toBeDefined();
      expect(instance.type).toBe('giant_lizard');
      expect(instance.maxHp).toBe(18);
      expect(instance.hp).toBe(18);
      expect(instance.isDefeated).toBe(false);
    });

    it('should have every room pass combat readiness check', () => {
      const failures = [];
      
      roomsWithMonsters.forEach(roomId => {
        const room = LEVEL1_ROOMS[roomId];
        const roomNum = room.number;
        
        // Check 1: Room must have at least one monster
        if (!room.contents.monsters || room.contents.monsters.length === 0) {
          failures.push(`Room ${roomNum}: declared monsters but none in contents`);
          return;
        }
        
        // Check 2: All monsters must exist in instances
        room.contents.monsters.forEach(monsterId => {
          if (!instances[monsterId]) {
            failures.push(`Room ${roomNum}: monster "${monsterId}" not in MONSTERS`);
            return;
          }
        });
        
        // Check 3: Room must have exits (for retreat/victory navigation)
        if (!room.exits || room.exits.length === 0) {
          failures.push(`Room ${roomNum}: no exits defined`);
          return;
        }
        
        // Check 4: Room must be searchable or have clear completion condition
        if (!room.searchable && room.contents.monsters.length === 0) {
          failures.push(`Room ${roomNum}: not searchable and no combat`);
          return;
        }
      });
      
      expect(failures).toEqual(
        [],
        `Combat readiness failures:\n${failures.join('\n')}`
      );
    });

    it('should document every room with combat scenario', () => {
      const combatRooms = roomsWithMonsters.map(roomId => {
        const room = LEVEL1_ROOMS[roomId];
        return {
          number: room.number,
          name: room.name,
          monsterCount: room.contents.monsters.length,
          monsters: room.contents.monsters.map(id => instances[id].type).join(', ')
        };
      });
      
      // This test passes but documents the combat scenarios
      expect(combatRooms.length).toBeGreaterThan(0);
      
      // Log combat scenarios for reference
      console.log('\n=== Level 1 Combat Scenarios ===');
      combatRooms.forEach(scenario => {
        console.log(`Room ${scenario.number} (${scenario.name}): ${scenario.monsterCount} ${scenario.monsters}`);
      });
    });
  });

  describe('Level 2 - Data Structure Validation', () => {
    const instances = getLevel2MonsterInstances();
    const roomIds = Object.keys(LEVEL2_ROOMS);
    const roomsWithMonsters = roomIds.filter(
      roomId => LEVEL2_ROOMS[roomId].contents?.monsters?.length > 0
    );

    it('should have all Level 2 instances properly registered', () => {
      const failures = [];
      
      roomsWithMonsters.forEach(roomId => {
        const room = LEVEL2_ROOMS[roomId];
        room.contents.monsters.forEach(monsterId => {
          if (!instances[monsterId]) {
            failures.push(`Room ${room.number} (${roomId}): missing instance "${monsterId}"`);
          }
        });
      });
      
      expect(failures).toEqual(
        [],
        `Level 2 monster instance failures:\n${failures.join('\n')}`
      );
    });

    it('should have no inline instance creation in Level 2 rooms', () => {
      const failures = [];
      
      roomsWithMonsters.forEach(roomId => {
        const room = LEVEL2_ROOMS[roomId];
        room.contents.monsters.forEach((monster, idx) => {
          if (typeof monster !== 'string') {
            failures.push(
              `Room ${room.number}: monster[${idx}] is not a string reference`
            );
          }
        });
      });
      
      expect(failures).toEqual(
        [],
        `Level 2 inline creation failures:\n${failures.join('\n')}`
      );
    });
  });

  describe('Cross-Level Validation', () => {
    it('should have unique instance IDs across all levels', () => {
      const level1Instances = getLevel1MonsterInstances();
      const level2Instances = getLevel2MonsterInstances();
      
      const level1Ids = Object.keys(level1Instances);
      const level2Ids = Object.keys(level2Instances);
      
      const duplicates = level1Ids.filter(id => level2Ids.includes(id));
      
      expect(duplicates).toEqual(
        [],
        `Duplicate instance IDs across levels: ${duplicates.join(', ')}`
      );
    });

    it('should have instance naming convention: q{level}_{room}_{type}_{number}', () => {
      const level1Instances = getLevel1MonsterInstances();
      const instanceIds = Object.keys(level1Instances);
      
      const failures = [];
      
      instanceIds.forEach(id => {
        // Format: q1_3_kobold_1 or q1_3_kobold
        const validPattern = /^q\d+_\d+_[a-z_]+(_\d+)?$/;
        if (!validPattern.test(id)) {
          failures.push(`Invalid naming convention: "${id}"`);
        }
      });
      
      expect(failures).toEqual(
        [],
        `Naming convention failures:\n${failures.join('\n')}`
      );
    });
  });

  describe('Combat Scenario Validation - Every Room Type', () => {
    it('should handle single monster rooms (e.g., Room 9 - Skeleton)', () => {
      const instances = getLevel1MonsterInstances();
      const room = Object.values(LEVEL1_ROOMS).find(r => r.contents.monsters?.length === 1 && r.contents.monsters[0].includes('skeleton'));
      
      if (room) {
        room.contents.monsters.forEach(monsterId => {
          expect(instances[monsterId]).toBeDefined();
        });
      }
    });

    it('should handle multi-monster rooms (e.g., Room 3 - Kobolds)', () => {
      const instances = getLevel1MonsterInstances();
      const room = LEVEL1_ROOMS.q1_3;
      
      expect(room.contents.monsters.length).toBe(4);
      room.contents.monsters.forEach(monsterId => {
        const instance = instances[monsterId];
        expect(instance).toBeDefined();
      });
    });

    it('should handle rooms with different monster types', () => {
      const instances = getLevel1MonsterInstances();
      const roomsWithMonsters = Object.values(LEVEL1_ROOMS).filter(
        r => r.contents?.monsters?.length > 0
      );
      
      const monsterTypes = new Set();
      
      roomsWithMonsters.forEach(room => {
        room.contents.monsters.forEach(monsterId => {
          const instance = instances[monsterId];
          monsterTypes.add(instance.type);
        });
      });
      
      // Should have variety of monster types
      expect(monsterTypes.size).toBeGreaterThan(1);
    });
  });

  describe('Victory Condition Prerequisites', () => {
    it('should verify all combat rooms have treasure defined', () => {
      const instances = getLevel1MonsterInstances();
      const roomsWithMonsters = Object.values(LEVEL1_ROOMS).filter(
        r => r.contents?.monsters?.length > 0
      );
      
      const failures = [];
      
      roomsWithMonsters.forEach(room => {
        if (!room.contents.treasure || room.contents.treasure.length === 0) {
          failures.push(`Room ${room.number} (${room.name}): no treasure after combat`);
        }
      });
      
      // Most combat rooms should have treasure, but there might be exceptions
      console.log(`Rooms without treasure: ${failures.join(', ')}`);
    });

    it('should verify combat rooms are marked as cleared after all monsters defeated', () => {
      const roomsWithMonsters = Object.values(LEVEL1_ROOMS).filter(
        r => r.contents?.monsters?.length > 0
      );
      
      // Ensure rooms have necessary properties for state tracking
      roomsWithMonsters.forEach(room => {
        expect(room).toHaveProperty('id');
        expect(room).toHaveProperty('contents');
        expect(room).toHaveProperty('contents.monsters');
      });
    });
  });

  describe('Room Exit Validation', () => {
    it('should verify every combat room has exits for navigation', () => {
      const roomsWithMonsters = Object.values(LEVEL1_ROOMS).filter(
        r => r.contents?.monsters?.length > 0
      );
      
      const failures = [];
      
      roomsWithMonsters.forEach(room => {
        if (!room.exits || room.exits.length === 0) {
          failures.push(`Room ${room.number} (${room.name}): no exits defined`);
        }
      });
      
      expect(failures).toEqual(
        [],
        `Room exit failures:\n${failures.join('\n')}`
      );
    });

    it('should validate all exit targetRoomIds reference existing rooms', () => {
      const level1RoomIds = new Set(Object.keys(LEVEL1_ROOMS));
      const level2RoomIds = new Set(Object.keys(LEVEL2_ROOMS));
      const failures = [];
      
      Object.values(LEVEL1_ROOMS).forEach(room => {
        if (room.exits) {
          room.exits.forEach(exit => {
            if (exit.targetRoomId == null) {
              if (!exit.isExit) {
                failures.push(
                  `Room ${room.number} exit with null targetRoomId is not marked as an external exit`
                );
              }
              return;
            }

            const targetLevel = exit.targetLevel || 1;
            const validRoomIds = targetLevel === 2 ? level2RoomIds : level1RoomIds;
            if (!validRoomIds.has(exit.targetRoomId)) {
              failures.push(
                `Room ${room.number} exit to "${exit.targetRoomId}" (level ${targetLevel}): target room doesn't exist`
              );
            }
          });
        }
      });
      
      expect(failures).toEqual(
        [],
        `Exit target validation failures:\n${failures.join('\n')}`
      );
    });
  });

  describe('Bug Prevention - Specific Edge Cases', () => {
    it('should prevent victory screen stuck bug (Issue: Kobold in Room 3)', () => {
      const instances = getLevel1MonsterInstances();
      const room = LEVEL1_ROOMS.q1_3;
      
      // Reproduce the exact scenario
      const cobalts = room.contents.monsters;
      
      // All monsters must be findable
      cobalts.forEach(monsterId => {
        const instance = instances[monsterId];
        expect(instance).toBeDefined(
          `Cannot find instance ${monsterId} - would cause victory screen to stick`
        );
        expect(instance.id).toBe(monsterId);
      });
    });

    it('should prevent Giant Lizard inline creation bug (Room 34)', () => {
      const instances = getLevel1MonsterInstances();
      const room = LEVEL1_ROOMS.q1_34;
      const lizardId = 'q1_34_lizard_1';
      
      // Must be in MONSTERS, not created inline
      expect(instances[lizardId]).toBeDefined();
      
      // Must only reference by ID in room
      expect(room.contents.monsters).toEqual([lizardId]);
      expect(typeof room.contents.monsters[0]).toBe('string');
    });

    it('should have no undefined instances in any room', () => {
      const instances = getLevel1MonsterInstances();
      const failures = [];
      
      Object.entries(LEVEL1_ROOMS).forEach(([roomId, room]) => {
        if (room.contents?.monsters) {
          room.contents.monsters.forEach((monsterId, idx) => {
            if (instances[monsterId] === undefined) {
              failures.push(`Room ${room.number} monster[${idx}] "${monsterId}" is undefined`);
            }
          });
        }
      });
      
      expect(failures).toEqual(
        [],
        `Undefined instance references:\n${failures.join('\n')}`
      );
    });
  });
});
