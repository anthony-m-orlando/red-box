import { describe, it, expect } from 'vitest';
import {
  canUseItem,
  useHealingItem,
  useLightSource,
  useUtilityItem,
  applyItemEffect,
  getItemIcon,
  getStartingItems
} from './items';

describe('Item Utilities', () => {
  describe('canUseItem', () => {
    const healingPotion = {
      name: 'Healing Potion',
      type: 'consumable',
      usableIn: ['exploration', 'combat']
    };

    it('returns true when item can be used in context', () => {
      const result = canUseItem(healingPotion, 'exploration');
      expect(result.canUse).toBe(true);
    });

    it('returns false when item cannot be used in context', () => {
      const combatOnlyItem = {
        name: 'Sword',
        usableIn: ['combat']
      };
      const result = canUseItem(combatOnlyItem, 'exploration');
      expect(result.canUse).toBe(false);
    });

    it('returns false for null item', () => {
      const result = canUseItem(null, 'exploration');
      expect(result.canUse).toBe(false);
    });
  });

  describe('useHealingItem', () => {
    const healingPotion = {
      name: 'Healing Potion',
      type: 'consumable',
      effect: {
        type: 'healing',
        formula: '1d8'
      }
    };

    const character = {
      hp: { current: 5, max: 10 }
    };

    it('heals character HP', () => {
      const result = useHealingItem(healingPotion, character);
      expect(result.healAmount).toBeGreaterThanOrEqual(0);
      expect(result.healAmount).toBeLessThanOrEqual(5); // Max heal to 10
      expect(result.newHP).toBeGreaterThanOrEqual(character.hp.current);
    });

    it('caps healing at max HP', () => {
      const fullHealth = { hp: { current: 10, max: 10 } };
      const result = useHealingItem(healingPotion, fullHealth);
      expect(result.newHP).toBe(10);
      expect(result.healAmount).toBe(0);
    });

    it('marks consumable items as consumed', () => {
      const result = useHealingItem(healingPotion, character);
      expect(result.consumed).toBe(true);
    });
  });

  describe('useLightSource', () => {
    const lantern = {
      name: 'Lantern',
      type: 'tool',
      effect: {
        type: 'light',
        duration: '6 hours'
      }
    };

    it('returns illumination effect', () => {
      const result = useLightSource(lantern);
      expect(result.effect).toBe('illumination');
      expect(result.message).toContain('light');
    });

    it('does not consume permanent light sources', () => {
      const result = useLightSource(lantern);
      expect(result.consumed).toBe(false);
    });

    it('consumes temporary light sources', () => {
      const torch = {
        ...lantern,
        type: 'consumable'
      };
      const result = useLightSource(torch);
      expect(result.consumed).toBe(true);
    });
  });

  describe('useUtilityItem', () => {
    const rope = {
      name: 'Rope',
      type: 'tool',
      effect: {
        type: 'utility'
      }
    };

    it('returns utility effect', () => {
      const result = useUtilityItem(rope);
      expect(result.effect).toBeDefined();
      expect(result.message).toContain('Rope');
    });

    it('does not consume utility items', () => {
      const result = useUtilityItem(rope);
      expect(result.consumed).toBe(false);
    });
  });

  describe('applyItemEffect', () => {
    const character = { hp: { current: 5, max: 10 } };

    it('applies healing effect', () => {
      const potion = {
        type: 'consumable',
        effect: { type: 'healing', formula: '1d8' }
      };
      const result = applyItemEffect(potion, character, 'exploration');
      expect(result.type).toBe('healing');
      expect(result.healAmount).toBeDefined();
    });

    it('applies light effect', () => {
      const lantern = {
        type: 'tool',
        effect: { type: 'light' }
      };
      const result = applyItemEffect(lantern, character, 'exploration');
      expect(result.type).toBe('light');
      expect(result.effect).toBe('illumination');
    });

    it('applies utility effect', () => {
      const rope = {
        type: 'tool',
        effect: { type: 'utility' }
      };
      const result = applyItemEffect(rope, character, 'exploration');
      expect(result.type).toBe('utility');
    });
  });

  describe('getItemIcon', () => {
    it('returns potion icon for healing items', () => {
      const icon = getItemIcon({ effect: { type: 'healing' } });
      expect(icon).toBe('🧪');
    });

    it('returns light icon for light sources', () => {
      const icon = getItemIcon({ effect: { type: 'light' } });
      expect(icon).toBe('🔦');
    });

    it('returns weapon icon for weapons', () => {
      const icon = getItemIcon({ effect: { type: 'weapon' } });
      expect(icon).toBe('⚔️');
    });

    it('returns generic icon for unknown types', () => {
      const icon = getItemIcon({ type: 'unknown' });
      expect(icon).toBe('📦');
    });
  });

  describe('getStartingItems', () => {
    it('returns items for Fighter', () => {
      const items = getStartingItems('fighter');
      expect(items.length).toBeGreaterThan(0);
      expect(items.some(i => i.id === 'backpack')).toBe(true);
      expect(items.some(i => i.id === 'healing_potion')).toBe(true);
    });

    it('returns items for Cleric', () => {
      const items = getStartingItems('cleric');
      expect(items.some(i => i.id === 'holy_symbol')).toBe(true);
    });

    it('returns items for Magic-User', () => {
      const items = getStartingItems('magic-user');
      expect(items.some(i => i.id === 'spellbook')).toBe(true);
      expect(items.some(i => i.id === 'lantern')).toBe(true);
    });

    it('returns items for Thief', () => {
      const items = getStartingItems('thief');
      expect(items.some(i => i.id === 'thieves_tools')).toBe(true);
      expect(items.some(i => i.id === 'rope')).toBe(true);
    });

    it('all classes get base items', () => {
      const classes = ['fighter', 'cleric', 'magic-user', 'thief', 'dwarf', 'elf', 'halfling'];
      classes.forEach(className => {
        const items = getStartingItems(className);
        expect(items.some(i => i.id === 'backpack')).toBe(true);
        expect(items.some(i => i.id === 'waterskin')).toBe(true);
        expect(items.some(i => i.id === 'ration')).toBe(true); // Changed from 'rations' to 'ration'
      });
    });
  });
});
