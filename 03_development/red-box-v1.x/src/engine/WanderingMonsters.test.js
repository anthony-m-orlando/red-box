import { expect } from 'vitest';
import * as WanderingMonsters from './WanderingMonsters';

/**
 * Wandering Monsters System Tests
 * Tests spawn conditions, encounter generation, and surprise mechanics
 */

describe('WanderingMonsters - Spawn Guard Conditions', () => {
  const mockModule = {
    rooms: {
      1: {
        'q1_1': { id: 'q1_1', isCheckpoint: true },
        'q1_2': { id: 'q1_2', exits: [] },
        'q1_entrance': {
          id: 'q1_entrance',
          exits: [{ isExit: true }]
        }
      }
    }
  };

  const baseState = {
    currentLevel: 1,
    currentRoomId: 'q1_2',
    inCombat: false
  };

  describe('shouldSuppressWanderingMonster', () => {
    it('should suppress when already in combat', () => {
      const state = { ...baseState, inCombat: true };
      const result = WanderingMonsters.shouldSuppressWanderingMonster(mockModule, state);
      
      expect(result.suppressed).toBe(true);
      expect(result.reason).toContain('combat');
    });

    it('should suppress in checkpoint rooms', () => {
      const state = { ...baseState, currentRoomId: 'q1_1' };
      const result = WanderingMonsters.shouldSuppressWanderingMonster(mockModule, state);
      
      expect(result.suppressed).toBe(true);
    });

    it('should suppress at dungeon entrance/exit', () => {
      const state = { ...baseState, currentRoomId: 'q1_entrance' };
      const result = WanderingMonsters.shouldSuppressWanderingMonster(mockModule, state);
      
      expect(result.suppressed).toBe(true);
    });

    it('should allow in normal rooms', () => {
      const result = WanderingMonsters.shouldSuppressWanderingMonster(mockModule, baseState);
      
      expect(result.suppressed).toBe(false);
      expect(result.reason).toBeNull();
    });

    it('should return object with suppressed flag', () => {
      const result = WanderingMonsters.shouldSuppressWanderingMonster(mockModule, baseState);
      expect(result).toHaveProperty('suppressed');
      expect(result).toHaveProperty('reason');
    });
  });
});

