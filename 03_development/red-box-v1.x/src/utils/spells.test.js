import { describe, it, expect } from 'vitest';
import {
  canCastSpell,
  castHealingSpell,
  castDamageSpell,
  castBuffSpell,
  castUtilitySpell,
  applySpellEffect,
  getAvailableSpells,
  getSpellSlotsText,
  hasSpellsAvailable,
  formatSpellCastMessage
} from './spells';

describe('Spell Utilities', () => {
  // Mock character
  const mockCharacter = {
    spells: ['cure_light_wounds', 'magic_missile'],
    spellSlots: { 1: 1, 2: 0, 3: 0 },
    spellSlotsUsed: { 1: 0, 2: 0, 3: 0 },
    hp: { current: 5, max: 10 }
  };

  const mockSpell = {
    id: 'cure_light_wounds',
    name: 'Cure Light Wounds',
    level: 1,
    implementation: {
      type: 'healing',
      formula: '1d6+1'
    }
  };

  describe('canCastSpell', () => {
    it('returns true when character knows spell and has slots', () => {
      const result = canCastSpell(mockCharacter, 'cure_light_wounds', 1);
      expect(result.canCast).toBe(true);
    });

    it('returns false when character does not know spell', () => {
      const result = canCastSpell(mockCharacter, 'unknown_spell', 1);
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain("don't know");
    });

    it('returns false when no spell slots remaining', () => {
      const noSlotsChar = {
        ...mockCharacter,
        spellSlotsUsed: { 1: 1, 2: 0, 3: 0 }
      };
      const result = canCastSpell(noSlotsChar, 'cure_light_wounds', 1);
      expect(result.canCast).toBe(false);
      expect(result.reason).toContain('No spell slots');
    });
  });

  describe('castHealingSpell', () => {
    it('returns healing amount and new HP', () => {
      const result = castHealingSpell(mockSpell, mockCharacter);
      expect(result.healAmount).toBeGreaterThanOrEqual(0);
      expect(result.healAmount).toBeLessThanOrEqual(5); // Max heal is 5 (current 5, max 10)
      expect(result.newHP).toBeGreaterThanOrEqual(mockCharacter.hp.current);
      expect(result.newHP).toBeLessThanOrEqual(mockCharacter.hp.max);
    });

    it('caps healing at max HP', () => {
      const fullHealthChar = { hp: { current: 10, max: 10 } };
      const result = castHealingSpell(mockSpell, fullHealthChar);
      expect(result.newHP).toBe(10);
      expect(result.healAmount).toBe(0);
    });
  });

  describe('castDamageSpell', () => {
    const damageSpell = {
      name: 'Magic Missile',
      implementation: {
        type: 'damage',
        formula: '1d4+1',
        autoHit: true
      }
    };

    const mockEnemy = {
      hp: { current: 10, max: 10 }
    };

    it('returns damage amount and new HP', () => {
      const result = castDamageSpell(damageSpell, mockEnemy);
      expect(result.damage).toBeGreaterThanOrEqual(2); // 1d4+1 = 2-5
      expect(result.damage).toBeLessThanOrEqual(5);
      expect(result.newHP).toBe(mockEnemy.hp.current - result.damage);
    });

    it('indicates auto-hit for Magic Missile', () => {
      const result = castDamageSpell(damageSpell, mockEnemy);
      expect(result.autoHit).toBe(true);
    });

    it('does not allow negative HP', () => {
      const weakEnemy = { hp: { current: 1, max: 10 } };
      const result = castDamageSpell(damageSpell, weakEnemy);
      expect(result.newHP).toBeGreaterThanOrEqual(0);
    });
  });

  describe('castBuffSpell', () => {
    const buffSpell = {
      name: 'Shield',
      implementation: {
        type: 'buff',
        stat: 'ac',
        bonus: 4,
        duration: 2
      }
    };

    const mockTarget = { ac: 5 };

    it('returns buff details', () => {
      const result = castBuffSpell(buffSpell, mockTarget);
      expect(result.stat).toBe('ac');
      expect(result.bonus).toBe(4);
      expect(result.duration).toBe(2);
    });

    it('calculates new AC value (lower is better)', () => {
      const result = castBuffSpell(buffSpell, mockTarget);
      expect(result.newValue).toBe(1); // 5 - 4 = 1
    });
  });

  describe('getAvailableSpells', () => {
    it('returns spells character knows', () => {
      const spells = getAvailableSpells(mockCharacter);
      expect(spells.length).toBeGreaterThan(0);
    });

    it('marks spells as castable when slots available', () => {
      const spells = getAvailableSpells(mockCharacter);
      const castableSpell = spells.find(s => s.canCast);
      expect(castableSpell).toBeDefined();
    });
  });

  describe('getSpellSlotsText', () => {
    it('returns formatted slot text', () => {
      const text = getSpellSlotsText(mockCharacter, 1);
      expect(text).toBe('1/1');
    });

    it('shows used slots', () => {
      const usedChar = {
        ...mockCharacter,
        spellSlotsUsed: { 1: 1, 2: 0, 3: 0 }
      };
      const text = getSpellSlotsText(usedChar, 1);
      expect(text).toBe('0/1');
    });
  });

  describe('hasSpellsAvailable', () => {
    it('returns true when character has unused spell slots', () => {
      expect(hasSpellsAvailable(mockCharacter)).toBe(true);
    });

    it('returns false when all slots used', () => {
      const noSlotsChar = {
        ...mockCharacter,
        spellSlots: { 1: 1, 2: 0, 3: 0 },
        spellSlotsUsed: { 1: 1, 2: 0, 3: 0 }
      };
      expect(hasSpellsAvailable(noSlotsChar)).toBe(false);
    });
  });
});
