import { describe, it, expect, vi } from 'vitest';
import {
  rollDie,
  rollDice,
  rollDiceSum,
  roll3d6,
  rollAbilityScores,
  rollD6,
  rollD20,
  parseDiceNotation,
  formatDiceRoll
} from '../utils/dice';

describe('Dice Utilities', () => {
  describe('rollDie', () => {
    it('should return a number between 1 and the number of sides', () => {
      const result = rollDie(6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('should work with different die sizes', () => {
      const d20Result = rollDie(20);
      expect(d20Result).toBeGreaterThanOrEqual(1);
      expect(d20Result).toBeLessThanOrEqual(20);
    });
  });

  describe('rollDice', () => {
    it('should return an array of the correct length', () => {
      const result = rollDice(3, 6);
      expect(result).toHaveLength(3);
    });

    it('should return values in the correct range', () => {
      const result = rollDice(3, 6);
      result.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('rollDiceSum', () => {
    it('should return a sum of multiple dice', () => {
      const result = rollDiceSum(3, 6);
      expect(result).toBeGreaterThanOrEqual(3); // Minimum: 1+1+1
      expect(result).toBeLessThanOrEqual(18);   // Maximum: 6+6+6
    });
  });

  describe('roll3d6', () => {
    it('should return an object with rolls and total', () => {
      const result = roll3d6();
      expect(result).toHaveProperty('rolls');
      expect(result).toHaveProperty('total');
      expect(result.rolls).toHaveLength(3);
    });

    it('should have correct total', () => {
      const result = roll3d6();
      const sum = result.rolls.reduce((a, b) => a + b, 0);
      expect(result.total).toBe(sum);
    });

    it('should have total between 3 and 18', () => {
      const result = roll3d6();
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeLessThanOrEqual(18);
    });
  });

  describe('rollAbilityScores', () => {
    it('should return all six ability scores', () => {
      const result = rollAbilityScores();
      expect(result).toHaveProperty('strength');
      expect(result).toHaveProperty('intelligence');
      expect(result).toHaveProperty('wisdom');
      expect(result).toHaveProperty('dexterity');
      expect(result).toHaveProperty('constitution');
      expect(result).toHaveProperty('charisma');
    });

    it('should have valid ranges for all abilities', () => {
      const result = rollAbilityScores();
      Object.values(result).forEach(ability => {
        expect(ability.total).toBeGreaterThanOrEqual(3);
        expect(ability.total).toBeLessThanOrEqual(18);
      });
    });
  });

  describe('Standard die shortcuts', () => {
    it('rollD6 should return 1-6', () => {
      const result = rollD6();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    });

    it('rollD20 should return 1-20', () => {
      const result = rollD20();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    });
  });

  describe('parseDiceNotation', () => {
    it('should parse standard notation', () => {
      // Note: This is random, so we test the range
      const result = parseDiceNotation('2d6');
      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(12);
    });

    it('should parse notation with modifiers', () => {
      const result = parseDiceNotation('1d6+3');
      expect(result).toBeGreaterThanOrEqual(4);  // 1+3
      expect(result).toBeLessThanOrEqual(9);     // 6+3
    });

    it('should throw error for invalid notation', () => {
      expect(() => parseDiceNotation('invalid')).toThrow();
    });
  });

  describe('formatDiceRoll', () => {
    it('should format rolls correctly', () => {
      const result = formatDiceRoll([4, 3, 5], 12);
      expect(result).toBe('[4, 3, 5] = 12');
    });
  });
});
