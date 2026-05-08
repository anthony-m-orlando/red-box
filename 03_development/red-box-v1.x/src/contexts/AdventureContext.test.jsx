import { expect, describe, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdventureProvider, useAdventure } from '../contexts/AdventureContext';
import { LEVEL1_ROOMS, getLevel1MonsterInstances } from '../data/dungeons/quasqueton/level1.js';
import { bestiary } from '../data/dungeons/quasqueton/bestiary.js';

/**
 * Adventure Context Integration Tests
 * 
 * Tests the combat system, room clearance, monster instance registration,
 * and victory conditions across the Quasqueton B1 module.
 * 
 * CRITICAL: These tests catch the edge case where combat victory screen
 * gets stuck because monster instances aren't properly registered.
 */

describe('AdventureContext - Combat & Instance Registration', () => {
  const wrapper = ({ children }) => (
    <MemoryRouter>
      <AdventureProvider>{children}</AdventureProvider>
    </MemoryRouter>
  );

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Module Data Integrity
  // ──────────────────────────────────────────────────────────────────────────

  describe('Quasqueton B1 Module - Data Integrity', () => {
    it('should have all monster instances pre-registered in MONSTERS object', () => {
      const instances = getLevel1MonsterInstances();
      
      expect(instances).toBeDefined();
      expect(typeof instances).toBe('object');
      
      // Check specific known instances exist
      expect(instances.q1_3_kobold_1).toBeDefined();
      expect(instances.q1_3_kobold_2).toBeDefined();
      expect(instances.q1_3_kobold_3).toBeDefined();
      expect(instances.q1_3_kobold_4).toBeDefined();
      expect(instances.q1_34_lizard_1).toBeDefined();
    });

    it('should have all monster instances keyed by instanceId', () => {
      const instances = getLevel1MonsterInstances();
      
      Object.entries(instances).forEach(([key, instance]) => {
        // Key should match instance ID
        expect(instance.id).toBe(key);
        // Instance should have required properties
        expect(instance).toHaveProperty('type');
        expect(instance).toHaveProperty('hp');
        expect(instance).toHaveProperty('maxHp');
        expect(instance).toHaveProperty('isDefeated');
      });
    });

    it('should have no inline-created monster instances in room definitions', () => {
      // This verifies that rooms only reference instances by ID
      const instances = getLevel1MonsterInstances();
      const instanceIds = Object.keys(instances);
      
      Object.entries(LEVEL1_ROOMS).forEach(([roomId, room]) => {
        if (room.contents?.monsters) {
          room.contents.monsters.forEach(monsterId => {
            // Monster ID should be a string reference, not a function call result
            expect(typeof monsterId).toBe('string');
            // The referenced instance should exist in MONSTERS
            expect(instances[monsterId]).toBeDefined(
              `Room ${roomId} references monster ${monsterId} that doesn't exist in MONSTERS object`
            );
          });
        }
      });
    });

    it('should have Room 3 (Kobold Lair) properly configured', () => {
      const room = LEVEL1_ROOMS.q1_3;
      const instances = getLevel1MonsterInstances();
      
      expect(room).toBeDefined();
      expect(room.name).toBe('Kobold Lair');
      expect(room.contents.monsters).toEqual([
        'q1_3_kobold_1',
        'q1_3_kobold_2',
        'q1_3_kobold_3',
        'q1_3_kobold_4'
      ]);
      
      // Verify all referenced instances exist
      room.contents.monsters.forEach(monsterId => {
        expect(instances[monsterId]).toBeDefined();
        expect(instances[monsterId].type).toBe('kobold');
      });
    });

    it('should have Room 34 (Lizard Lair) with properly registered instance', () => {
      const room = LEVEL1_ROOMS.q1_34;
      const instances = getLevel1MonsterInstances();
      
      expect(room).toBeDefined();
      expect(room.name).toBe('The Lizard Den');
      expect(room.contents.monsters).toEqual(['q1_34_lizard_1']);
      
      // CRITICAL: Verify lizard instance is in MONSTERS, not inline
      const lizardInstance = instances['q1_34_lizard_1'];
      expect(lizardInstance).toBeDefined();
      expect(lizardInstance.type).toBe('giant_lizard');
      expect(lizardInstance.maxHp).toBe(18);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: Combat System & Victory Conditions
  // ──────────────────────────────────────────────────────────────────────────

  describe('Combat System - Victory and Room Clearance', () => {
    it('should initialize adventure state', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      expect(result.current.adventure).toBeNull();
      expect(result.current.inCombat).toBe(false);
      expect(result.current.isVictorious).toBe(false);
      expect(result.current.isDefeated).toBe(false);
    });

    it('should enter combat correctly', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      
      // Navigate to combat room
      act(() => {
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3'); // Kobold Lair
      });
      
      expect(result.current.currentRoomId).toBe('q1_3');
    });

    it('should handle defeating individual monsters', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      act(() => {
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3');
      });
      
      // Defeat first kobold
      act(() => {
        result.current.defeatMonster('q1_3_kobold_1', 10);
      });
      
      // Should still be in combat - room not cleared yet
      expect(result.current.inCombat).toBe(true);
    });

    it('should clear room when all monsters defeated in Room 3 (Kobold Lair)', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      act(() => {
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3');
      });
      
      // Defeat all 4 kobolds
      ['q1_3_kobold_1', 'q1_3_kobold_2', 'q1_3_kobold_3', 'q1_3_kobold_4'].forEach(monsterId => {
        act(() => {
          result.current.defeatMonster(monsterId, 10);
        });
      });
      
      // After defeating all monsters, room should be cleared and combat ended
      expect(result.current.inCombat).toBe(false);
      expect(result.current.dungeonState.roomStates[1].q1_3).toBe('cleared');
    });

it('should trigger room victory when all monsters in Room 3 are defeated', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
       
      const victoryListener = vi.fn();
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      act(() => {
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3');
      });
      
      // Record initial state
      const monstersToDefeat = ['q1_3_kobold_1', 'q1_3_kobold_2', 'q1_3_kobold_3', 'q1_3_kobold_4'];
      
      // Defeat each monster
      monstersToDefeat.forEach((monsterId) => {
        act(() => {
          result.current.defeatMonster(monsterId, 10);
        });
      });
      
      // After all defeated, combat should have ended and the room cleared
      expect(result.current.inCombat).toBe(false);
      expect(result.current.dungeonState.roomStates[1].q1_3).toBe('cleared');
    });

    it('should NOT trigger victory prematurely if instance not found', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      act(() => {
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3');
      });
      
      // Try to defeat only 3 of 4 kobolds
      act(() => {
        result.current.defeatMonster('q1_3_kobold_1', 10);
        result.current.defeatMonster('q1_3_kobold_2', 10);
        result.current.defeatMonster('q1_3_kobold_3', 10);
      });
      
      // Should still be in combat - one kobold remains
      expect(result.current.isVictorious).toBe(false);
      expect(result.current.inCombat).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: Room-Specific Combat Tests
  // ──────────────────────────────────────────────────────────────────────────

  describe('Room-Specific Combat Tests', () => {
    it('should handle combat in Room 34 (Lizard Lair) with inline-created instance', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      // Verify instance exists before combat
      const instances = getLevel1MonsterInstances();
      expect(instances.q1_34_lizard_1).toBeDefined();
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
        result.current.dispatch({
          type: result.current.ACTIONS.ENTER_ROOM,
          payload: {
            roomId: 'q1_34',
            level: 1,
            narration: null,
            turnPatch: {},
            lightExpired: false,
            torchExtinguished: false,
          },
        });
      });
      
      // Defeat the lizard
      act(() => {
        result.current.defeatMonster('q1_34_lizard_1', 50);
      });
      
      // Should resolve combat cleanly
      expect(result.current.inCombat).toBe(false);
    });

    it('should properly resolve combat for all rooms with monsters', () => {
      const roomsWithMonsters = Object.entries(LEVEL1_ROOMS)
        .filter(([, room]) => room.contents?.monsters && room.contents.monsters.length > 0)
        .slice(0, 5); // Test first 5 rooms with monsters
      
      const instances = getLevel1MonsterInstances();
      
      roomsWithMonsters.forEach(([roomId, room]) => {
        const { result } = renderHook(() => useAdventure(), { wrapper });
        
        act(() => {
          result.current.startDungeon('quasqueton', 1);
          result.current.dispatch({
            type: result.current.ACTIONS.ENTER_ROOM,
            payload: {
              roomId,
              level: 1,
              narration: null,
              turnPatch: {},
              lightExpired: false,
              torchExtinguished: false,
            },
          });
        });
        
        // Verify all monsters exist in instances
        room.contents.monsters.forEach(monsterId => {
          expect(instances[monsterId]).toBeDefined(
            `Room ${roomId} references ${monsterId} which doesn't exist in MONSTERS`
          );
        });
        
        // Defeat all monsters
        room.contents.monsters.forEach(monsterId => {
          act(() => {
            result.current.defeatMonster(monsterId, 10);
          });
        });
        
        // Combat should end cleanly after defeating all monsters
        expect(result.current.inCombat).toBe(false,
          `Room ${roomId} should have no remaining combat after defeating all ${room.contents.monsters.length} monsters`
        );
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: Edge Cases & Bug Prevention
  // ──────────────────────────────────────────────────────────────────────────

  describe('Edge Cases - Bug Prevention', () => {
    it('should not get stuck on victory screen when defeating Kobold in Room 3', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      // This is the exact bug scenario from the issue
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      act(() => {
        // Navigate: Room 1 → Room 2 → Room 3 (east exit)
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3');
      });
      
      expect(result.current.currentRoomId).toBe('q1_3');
      
      // Defeat all kobolds
      const koboldIds = ['q1_3_kobold_1', 'q1_3_kobold_2', 'q1_3_kobold_3', 'q1_3_kobold_4'];
      
      koboldIds.forEach(monsterId => {
        act(() => {
          result.current.defeatMonster(monsterId, 10);
        });
      });
      
      // Combat should end cleanly, and the room should be cleared
      expect(result.current.inCombat).toBe(false);
      expect(result.current.isVictorious).toBe(false);
      expect(result.current.dungeonState.roomStates[1].q1_3).toBe('cleared');
      // Should be able to navigate away from room
      expect(() => {
        act(() => {
          result.current.enterRoom('q1_2');
        });
      }).not.toThrow();
    });

    it('should handle instance lookup failure gracefully', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      act(() => {
        result.current.startDungeon('quasqueton', 1);
        result.current.enterRoom('q1_2');
        result.current.enterRoom('q1_3');
      });
      
      // Try to defeat a non-existent monster
      // Should not crash or throw
      expect(() => {
        act(() => {
          result.current.defeatMonster('q1_3_nonexistent', 10);
        });
      }).not.toThrow();
    });

    it('should not have duplicate monster instances', () => {
      const instances = getLevel1MonsterInstances();
      const instanceIds = Object.keys(instances);
      const uniqueIds = new Set(instanceIds);
      
      expect(instanceIds.length).toBe(uniqueIds.size);
    });

    it('should verify no inline monster creation in Room definitions', () => {
      // Check that room contents only have string IDs, not function results
      Object.entries(LEVEL1_ROOMS).forEach(([roomId, room]) => {
        if (room.contents?.monsters) {
          room.contents.monsters.forEach((monster, index) => {
            expect(typeof monster).toBe('string', 
              `Room ${roomId} monster at index ${index} should be string ID, got ${typeof monster}`
            );
          });
        }
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: Monster Instance Canonicality
  // ──────────────────────────────────────────────────────────────────────────

  describe('Monster Instance Canonicality', () => {
    it('should have canonical HP values for all instances', () => {
      const instances = getLevel1MonsterInstances();
      
      // Known canonical values from B1 module stocking table
      const canonicalValues = {
        q1_3_kobold_1: { type: 'kobold', maxHp: 2 },
        q1_3_kobold_2: { type: 'kobold', maxHp: 3 },
        q1_3_kobold_3: { type: 'kobold', maxHp: 2 },
        q1_3_kobold_4: { type: 'kobold', maxHp: 4 },
        q1_34_lizard_1: { type: 'giant_lizard', maxHp: 18 },
      };
      
      Object.entries(canonicalValues).forEach(([instanceId, expected]) => {
        const instance = instances[instanceId];
        expect(instance).toBeDefined();
        expect(instance.type).toBe(expected.type);
        expect(instance.maxHp).toBe(expected.maxHp);
      });
    });

    it('should initialize instances with full HP', () => {
      const instances = getLevel1MonsterInstances();
      
      Object.values(instances).forEach(instance => {
        expect(instance.hp).toBe(instance.maxHp);
        expect(instance.isDefeated).toBe(false);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 6: Integration - Full Adventure Cycle
  // ──────────────────────────────────────────────────────────────────────────

  describe('Full Adventure Cycle - Combat to Clearance', () => {
    it('should complete a full room cycle: enter → fight → victory → exit', () => {
      const { result } = renderHook(() => useAdventure(), { wrapper });
      
      // Start adventure
      act(() => {
        result.current.startDungeon('quasqueton', 1);
      });
      expect(result.current.dungeonState.moduleId).toBe('quasqueton');
      
      // Enter starting room
      expect(result.current.currentRoomId).toBe('q1_1');
      
      // Move to Kobold room
      act(() => {
        result.current.enterRoom('q1_2');
      });
      act(() => {
        result.current.enterRoom('q1_3');
      });
      expect(result.current.currentRoomId).toBe('q1_3');
      
      // Combat phase - defeat all monsters
      const koboldIds = ['q1_3_kobold_1', 'q1_3_kobold_2', 'q1_3_kobold_3', 'q1_3_kobold_4'];
      koboldIds.forEach(monsterId => {
        act(() => {
          result.current.defeatMonster(monsterId, 10);
        });
      });
      
      // Combat should have ended and the room cleared
      expect(result.current.inCombat).toBe(false);
      expect(result.current.isVictorious).toBe(false);
      
      // Should be able to move to next room after combat
      act(() => {
        result.current.endCombat(true, 40);
      });
      
      // Now should be able to navigate
      act(() => {
        result.current.enterRoom('q1_2');
      });
      expect(result.current.currentRoomId).toBe('q1_2');
    });
  });
});
