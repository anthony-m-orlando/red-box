import { describe, it, expect } from 'vitest';
import {
  calculateModifier,
  calculateMaxHP,
  calculateAC,
  getArmorAC,
  calculateTHAC0,
  calculateToHit,
  getPrimeRequisite,
  calculateXPBonus,
  meetsClassRequirements,
  getStartingGold,
  calculateEncumbrance,
  getMovementRate
} from '../utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateModifier', () => {
    it('should return -3 for score 3', () => {
      expect(calculateModifier(3)).toBe(-3);
    });

    it('should return -2 for scores 4-5', () => {
      expect(calculateModifier(4)).toBe(-2);
      expect(calculateModifier(5)).toBe(-2);
    });

    it('should return -1 for scores 6-8', () => {
      expect(calculateModifier(6)).toBe(-1);
      expect(calculateModifier(8)).toBe(-1);
    });

    it('should return 0 for scores 9-12', () => {
      expect(calculateModifier(9)).toBe(0);
      expect(calculateModifier(12)).toBe(0);
    });

    it('should return +1 for scores 13-15', () => {
      expect(calculateModifier(13)).toBe(1);
      expect(calculateModifier(15)).toBe(1);
    });

    it('should return +2 for scores 16-17', () => {
      expect(calculateModifier(16)).toBe(2);
      expect(calculateModifier(17)).toBe(2);
    });

    it('should return +3 for score 18', () => {
      expect(calculateModifier(18)).toBe(3);
    });
  });

  describe('calculateMaxHP', () => {
    it('should calculate HP for fighter at level 1', () => {
      const hp = calculateMaxHP('fighter', 10, 1);
      expect(hp).toBe(8); // d8 max + 0 modifier
    });

    it('should add constitution modifier', () => {
      const hp = calculateMaxHP('fighter', 16, 1); // +2 Con
      expect(hp).toBe(10); // 8 + 2
    });

    it('should have minimum 1 HP', () => {
      const hp = calculateMaxHP('magic-user', 3, 1); // d4, -3 Con
      expect(hp).toBe(1);
    });

    it('should calculate correct HP for different classes', () => {
      expect(calculateMaxHP('cleric', 10, 1)).toBe(6);
      expect(calculateMaxHP('magic-user', 10, 1)).toBe(4);
      expect(calculateMaxHP('thief', 10, 1)).toBe(4);
    });
  });

  describe('calculateAC', () => {
    it('should calculate AC 9 for no armor, no dex', () => {
      expect(calculateAC(9, 10, 0)).toBe(9);
    });

    it('should improve AC with positive dex modifier', () => {
      expect(calculateAC(9, 16, 0)).toBe(7); // 9 - 2 (dex mod)
    });

    it('should worsen AC with negative dex modifier', () => {
      expect(calculateAC(9, 8, 0)).toBe(10); // 9 - (-1)
    });
  });

  describe('getArmorAC', () => {
    it('should return AC 9 for no armor', () => {
      expect(getArmorAC('none', false)).toBe(9);
    });

    it('should return AC 7 for leather', () => {
      expect(getArmorAC('leather', false)).toBe(7);
    });

    it('should return AC 5 for chain mail', () => {
      expect(getArmorAC('chain mail', false)).toBe(5);
    });

    it('should improve AC by 1 with shield', () => {
      expect(getArmorAC('chain mail', true)).toBe(4);
    });
  });

  describe('calculateTHAC0', () => {
    it('should return 19 for level 1 characters', () => {
      expect(calculateTHAC0('fighter', 1)).toBe(19);
      expect(calculateTHAC0('cleric', 1)).toBe(19);
    });

    it('should improve faster for fighters', () => {
      // Fighters improve every 3 levels
      expect(calculateTHAC0('fighter', 3)).toBe(19);
      expect(calculateTHAC0('fighter', 4)).toBe(18);
    });

    it('should improve slower for non-fighters', () => {
      // Non-fighters improve every 4 levels
      expect(calculateTHAC0('cleric', 4)).toBe(19);
      expect(calculateTHAC0('cleric', 5)).toBe(18);
    });
  });

  describe('calculateToHit', () => {
    it('should calculate roll needed to hit', () => {
      expect(calculateToHit(19, 5)).toBe(14); // THAC0 19 vs AC 5
      expect(calculateToHit(19, 0)).toBe(19); // THAC0 19 vs AC 0
    });
  });

  describe('getPrimeRequisite', () => {
    it('should return correct prime requisite for each class', () => {
      expect(getPrimeRequisite('fighter')).toEqual(['strength']);
      expect(getPrimeRequisite('cleric')).toEqual(['wisdom']);
      expect(getPrimeRequisite('magic-user')).toEqual(['intelligence']);
      expect(getPrimeRequisite('thief')).toEqual(['dexterity']);
    });

    it('should return multiple for demi-humans', () => {
      expect(getPrimeRequisite('elf')).toEqual(['strength', 'intelligence']);
      expect(getPrimeRequisite('halfling')).toEqual(['strength', 'dexterity']);
    });
  });

  describe('calculateXPBonus', () => {
    it('should return 0% for low prime requisite', () => {
      const abilities = { strength: 10, intelligence: 10, wisdom: 10 };
      expect(calculateXPBonus('fighter', abilities)).toBe(0);
    });

    it('should return 5% for 13-15 prime requisite', () => {
      const abilities = { strength: 14, intelligence: 10, wisdom: 10 };
      expect(calculateXPBonus('fighter', abilities)).toBe(5);
    });

    it('should return 10% for 16+ prime requisite', () => {
      const abilities = { strength: 17, intelligence: 10, wisdom: 10 };
      expect(calculateXPBonus('fighter', abilities)).toBe(10);
    });

    it('should use lowest for multiple prime requisites', () => {
      const abilities = { strength: 16, intelligence: 13, wisdom: 10 };
      expect(calculateXPBonus('elf', abilities)).toBe(5); // Lower of 16 and 13
    });
  });

  describe('meetsClassRequirements', () => {
    it('should allow fighter with strength 9+', () => {
      const abilities = { strength: 9, constitution: 10 };
      const result = meetsClassRequirements('fighter', abilities);
      expect(result.allowed).toBe(true);
    });

    it('should reject fighter with low strength', () => {
      const abilities = { strength: 8, constitution: 10 };
      const result = meetsClassRequirements('fighter', abilities);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Strength');
    });

    it('should check multiple requirements for demi-humans', () => {
      const goodAbilities = { strength: 9, constitution: 9, intelligence: 9 };
      expect(meetsClassRequirements('dwarf', goodAbilities).allowed).toBe(true);

      const badAbilities = { strength: 9, constitution: 8, intelligence: 9 };
      expect(meetsClassRequirements('dwarf', badAbilities).allowed).toBe(false);
    });
  });

  describe('getStartingGold', () => {
    it('should return a value between 30 and 180', () => {
      const gold = getStartingGold('fighter');
      expect(gold).toBeGreaterThanOrEqual(30);  // 3 * 10
      expect(gold).toBeLessThanOrEqual(180);     // 18 * 10
    });
  });

  describe('calculateEncumbrance', () => {
    it('should return 0 for empty inventory', () => {
      expect(calculateEncumbrance([])).toBe(0);
    });

    it('should calculate total weight', () => {
      const items = [
        { weight: 10, quantity: 1 },
        { weight: 5, quantity: 2 }
      ];
      expect(calculateEncumbrance(items)).toBe(20); // 10 + (5*2)
    });
  });

  describe('getMovementRate', () => {
    it('should return base rate for light load', () => {
      expect(getMovementRate(400, 120)).toBe(120);
    });

    it('should reduce movement for heavier loads', () => {
      expect(getMovementRate(600, 120)).toBe(90);
      expect(getMovementRate(1000, 120)).toBe(60);
      expect(getMovementRate(1400, 120)).toBe(30);
    });

    it('should return 0 for over-encumbered', () => {
      expect(getMovementRate(1700, 120)).toBe(0);
    });
  });
});
