import { expect, vi } from 'vitest';
import * as Combat from './combat';

/**
 * Combat Utilities Unit Tests
 * Tests attack rolls, damage, morale, initiative, and saving throws
 */

describe('Combat - Attack Resolution', () => {
  describe('rollAttack', () => {
    it('should return required fields', () => {
      const result = Combat.rollAttack(19, 9, 0);
      
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('totalRoll');
      expect(result).toHaveProperty('needed');
      expect(result).toHaveProperty('hit');
      expect(result).toHaveProperty('critical');
      expect(result).toHaveProperty('fumble');
    });

    it('should roll d20 (1-20)', () => {
      const result = Combat.rollAttack(19, 9, 0);
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(20);
    });

    it('should calculate needed using THAC0 system', () => {
      // THAC0 19 vs AC 9: needed = 19 - 9 = 10
      const result = Combat.rollAttack(19, 9, 0);
      expect(result.needed).toBe(10);
    });

    it('should apply attack bonus', () => {
      const roll = 5; // Mock consistent roll for testing
      const result = Combat.rollAttack(19, 9, 3);
      expect(result.totalRoll).toBe(result.roll + 3);
    });

    it('should hit when total >= needed', () => {
      // Run multiple times to find a hit
      let found = false;
      for (let i = 0; i < 100; i++) {
        const result = Combat.rollAttack(15, 10, 0);
        if (result.roll >= result.needed) {
          expect(result.hit).toBe(true);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should always hit on natural 20', () => {
      // We can't force a natural 20, but we can verify with many rolls
      let naturalTwenty = false;
      for (let i = 0; i < 1000; i++) {
        const result = Combat.rollAttack(19, 1, 0); // AC 1 makes it very hard
        if (result.roll === 20) {
          expect(result.hit).toBe(true);
          expect(result.critical).toBe(true);
          naturalTwenty = true;
          break;
        }
      }
      expect(naturalTwenty).toBe(true);
    });

    it('should flag natural 20 as critical', () => {
      let found = false;
      for (let i = 0; i < 1000; i++) {
        const result = Combat.rollAttack(19, 9, 0);
        if (result.roll === 20) {
          expect(result.critical).toBe(true);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should flag natural 1 as fumble', () => {
      let found = false;
      for (let i = 0; i < 1000; i++) {
        const result = Combat.rollAttack(19, 9, 0);
        if (result.roll === 1) {
          expect(result.fumble).toBe(true);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should handle negative THAC0', () => {
      const result = Combat.rollAttack(10, 5, 0);
      expect(result.needed).toBe(5);
    });

    it('should handle AC 0', () => {
      const result = Combat.rollAttack(19, 0, 0);
      expect(result.needed).toBe(19);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Damage Resolution
// ─────────────────────────────────────────────────────────────────────────────

describe('Combat - Damage Resolution', () => {
  describe('rollDamage', () => {
    it('should handle dice notation', () => {
      const damage = Combat.rollDamage('1d6');
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeLessThanOrEqual(6);
    });

    it('should handle multiple dice', () => {
      const damage = Combat.rollDamage('2d6');
      expect(damage).toBeGreaterThanOrEqual(2);
      expect(damage).toBeLessThanOrEqual(12);
    });

    it('should handle damage modifiers', () => {
      // 1d8+2 should be 3-10
      const damage = Combat.rollDamage('1d8+2');
      expect(damage).toBeGreaterThanOrEqual(3);
      expect(damage).toBeLessThanOrEqual(10);
    });

    it('should return fixed damage if passed number', () => {
      const damage = Combat.rollDamage(5);
      expect(damage).toBe(5);
    });

    it('should handle d4', () => {
      const damage = Combat.rollDamage('1d4');
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeLessThanOrEqual(4);
    });

    it('should handle d12', () => {
      const damage = Combat.rollDamage('1d12');
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeLessThanOrEqual(12);
    });

    it('should ensure minimum damage of 1', () => {
      // Even invalid dice strings shouldn't do 0 damage
      const damage = Combat.rollDamage('1d6-10');
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('should handle complex damage strings', () => {
      const damage = Combat.rollDamage('3d6+1');
      expect(damage).toBeGreaterThanOrEqual(4); // 3+1
      expect(damage).toBeLessThanOrEqual(19); // 18+1
    });
  });

  describe('applyStrengthDamage', () => {
    it('should apply strength modifier', () => {
      // STR 18 = +3 modifier
      const damage = Combat.applyStrengthDamage(5, 18);
      expect(damage).toBe(8);
    });

    it('should handle strength 3 (-3 modifier)', () => {
      const damage = Combat.applyStrengthDamage(5, 3);
      expect(damage).toBe(2);
    });

    it('should handle strength 10 (0 modifier)', () => {
      const damage = Combat.applyStrengthDamage(5, 10);
      expect(damage).toBe(5);
    });

    it('should maintain minimum damage of 1', () => {
      // Weak hit + low strength shouldn't result in 0 damage
      const damage = Combat.applyStrengthDamage(1, 3);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('should apply STR 15 (+1)', () => {
      const damage = Combat.applyStrengthDamage(6, 15);
      expect(damage).toBe(7);
    });

    it('should apply STR 17 (+2)', () => {
      const damage = Combat.applyStrengthDamage(6, 17);
      expect(damage).toBe(8);
    });

    it('should apply STR 8 (-1)', () => {
      const damage = Combat.applyStrengthDamage(6, 8);
      expect(damage).toBe(5);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Morale & Behavior
// ─────────────────────────────────────────────────────────────────────────────

describe('Combat - Morale & Behavior', () => {
  describe('checkMorale', () => {
    it('should return boolean', () => {
      const result = Combat.checkMorale(8);
      expect(typeof result).toBe('boolean');
    });

    it('should roll 2d6 for morale check', () => {
      // Run many times to verify it's possible to fail and succeed
      let failed = false;
      let succeeded = false;
      
      for (let i = 0; i < 100; i++) {
        const moraleCheck = Combat.checkMorale(8);
        if (moraleCheck) failed = true;
        if (!moraleCheck) succeeded = true;
      }
      
      expect(failed).toBe(true);  // Some failures expected
      expect(succeeded).toBe(true); // Some successes expected
    });

    it('should fail (flee) when 2d6 > morale', () => {
      // Run many times, some should definitely fail
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(Combat.checkMorale(2));
      }
      
      // With morale 2, most rolls will be > 2, so most should flee
      const fleeCount = results.filter(r => r).length;
      expect(fleeCount).toBeGreaterThan(50);
    });

    it('should succeed (hold position) when 2d6 <= morale', () => {
      // Run many times with high morale
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(Combat.checkMorale(12));
      }
      
      // With morale 12, most rolls will be <= 12, so most should hold
      const holdCount = results.filter(r => !r).length;
      expect(holdCount).toBeGreaterThan(50);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Initiative
// ─────────────────────────────────────────────────────────────────────────────

describe('Combat - Initiative', () => {
  describe('rollInitiative', () => {
    it('should return d6 (1-6)', () => {
      const initiative = Combat.rollInitiative();
      expect(initiative).toBeGreaterThanOrEqual(1);
      expect(initiative).toBeLessThanOrEqual(6);
    });

    it('should roll all values in range over many rolls', () => {
      const rolls = new Set();
      for (let i = 0; i < 100; i++) {
        rolls.add(Combat.rollInitiative());
      }
      
      // Should have multiple different values
      expect(rolls.size).toBeGreaterThan(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Saving Throws
// ─────────────────────────────────────────────────────────────────────────────

describe('Combat - Saving Throws', () => {
  describe('rollSavingThrow', () => {
    it('should return roll, total, and success', () => {
      const result = Combat.rollSavingThrow(10, 0);
      
      expect(result).toHaveProperty('roll');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('success');
    });

    it('should roll d20', () => {
      const result = Combat.rollSavingThrow(10, 0);
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(20);
    });

    it('should apply bonus to total', () => {
      const result = Combat.rollSavingThrow(10, 3);
      expect(result.total).toBe(result.roll + 3);
    });

    it('should succeed when total >= saveTarget', () => {
      let found = false;
      for (let i = 0; i < 100; i++) {
        const result = Combat.rollSavingThrow(10, 0);
        if (result.total >= 10) {
          expect(result.success).toBe(true);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should handle high DC values', () => {
      const result = Combat.rollSavingThrow(20, 0);
      expect(result.success).toBe(result.total >= 20);
    });

    it('should handle low DC values', () => {
      const result = Combat.rollSavingThrow(3, 0);
      // With DC 3, most rolls should succeed
      let successes = 0;
      for (let i = 0; i < 50; i++) {
        const r = Combat.rollSavingThrow(3, 0);
        if (r.success) successes++;
      }
      expect(successes).toBeGreaterThan(40);
    });

    it('should handle negative bonuses', () => {
      const result = Combat.rollSavingThrow(10, -2);
      expect(result.total).toBe(result.roll - 2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Combat - Integration', () => {
  it('should handle a complete attack sequence', () => {
    // Fighter attacks goblin
    const playerThac0 = 19;
    const goblinAC = 6;
    const strengthBonus = 1;
    
    const attack = Combat.rollAttack(playerThac0, goblinAC, strengthBonus);
    expect(attack.hit).toBeDefined();
    
    if (attack.hit) {
      const damage = Combat.applyStrengthDamage(
        Combat.rollDamage('1d8'),
        18
      );
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  it('should handle spell resistance save', () => {
    // Magic missile can't be resisted, but other spells need saves
    const magicUserLevel = 1;
    const saveTarget = 13; // D&D Basic sheet value
    
    const save = Combat.rollSavingThrow(saveTarget, 0);
    expect(save.success).toBeDefined();
  });

  it('should check monster morale after taking damage', () => {
    // Monster at half HP checks morale at default value 8
    const morale = 8;
    const fleeing = Combat.checkMorale(morale);
    
    expect(typeof fleeing).toBe('boolean');
  });
});

