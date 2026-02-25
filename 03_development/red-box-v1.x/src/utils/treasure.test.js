import { describe, it, expect } from 'vitest';
import {
  generateTreasure,
  formatTreasureMessage,
  getTreasureTable,
  calculateTreasureValue
} from './treasure';

describe('Treasure Utilities', () => {
  describe('generateTreasure', () => {
    it('generates treasure for goblin', () => {
      const treasure = generateTreasure('goblin_1', 'goblin');
      expect(treasure.gold).toBeGreaterThanOrEqual(1);
      expect(treasure.gold).toBeLessThanOrEqual(6);
      expect(treasure.items).toBeDefined();
      expect(Array.isArray(treasure.items)).toBe(true);
    });

    it('generates treasure for snake', () => {
      const treasure = generateTreasure('snake_1', 'snake');
      expect(treasure.gold).toBeGreaterThanOrEqual(2);
      expect(treasure.gold).toBeLessThanOrEqual(12);
      expect(treasure.items).toBeDefined();
    });

    it('generates treasure for rust monster', () => {
      const treasure = generateTreasure('rust_monster_1', 'rust_monster');
      expect(treasure.gold).toBeGreaterThanOrEqual(3);
      expect(treasure.gold).toBeLessThanOrEqual(30);
      expect(treasure.items).toBeDefined();
    });

    it('includes monster ID and type in treasure', () => {
      const treasure = generateTreasure('goblin_1', 'goblin');
      expect(treasure.monsterId).toBe('goblin_1');
      expect(treasure.monsterType).toBe('goblin');
    });

    it('uses default table for unknown monster', () => {
      const treasure = generateTreasure('unknown_1', 'unknown');
      expect(treasure.gold).toBeGreaterThanOrEqual(0);
      expect(treasure.items).toBeDefined();
    });
  });

  describe('formatTreasureMessage', () => {
    it('formats gold only treasure', () => {
      const treasure = { gold: 5, items: [] };
      const message = formatTreasureMessage(treasure);
      expect(message).toContain('5 gold pieces');
      expect(message).not.toContain('Items found');
    });

    it('formats items only treasure', () => {
      const treasure = {
        gold: 0,
        items: [{ name: 'Rusty Dagger' }]
      };
      const message = formatTreasureMessage(treasure);
      expect(message).toContain('Items found');
      expect(message).toContain('Rusty Dagger');
      expect(message).not.toContain('gold pieces');
    });

    it('formats gold and items treasure', () => {
      const treasure = {
        gold: 10,
        items: [{ name: 'Healing Potion' }]
      };
      const message = formatTreasureMessage(treasure);
      expect(message).toContain('10 gold pieces');
      expect(message).toContain('Items found');
      expect(message).toContain('Healing Potion');
    });

    it('formats empty treasure', () => {
      const treasure = { gold: 0, items: [] };
      const message = formatTreasureMessage(treasure);
      expect(message).toBe('No treasure found.');
    });
  });

  describe('getTreasureTable', () => {
    it('returns goblin treasure table', () => {
      const table = getTreasureTable('goblin');
      expect(table.gold).toBeDefined();
      expect(table.gold.dice).toBe('1d6');
      expect(table.items).toBeDefined();
    });

    it('returns snake treasure table', () => {
      const table = getTreasureTable('snake');
      expect(table.gold.dice).toBe('2d6');
    });

    it('returns rust monster treasure table', () => {
      const table = getTreasureTable('rust_monster');
      expect(table.gold.dice).toBe('3d10');
    });

    it('returns default table for unknown monster', () => {
      const table = getTreasureTable('unknown');
      expect(table).toBeDefined();
      expect(table.gold).toBeDefined();
    });
  });

  describe('calculateTreasureValue', () => {
    it('calculates gold only value', () => {
      const treasure = { gold: 10, items: [] };
      const value = calculateTreasureValue(treasure);
      expect(value).toBe(10);
    });

    it('adds weapon value', () => {
      const treasure = {
        gold: 5,
        items: [{ type: 'weapon' }]
      };
      const value = calculateTreasureValue(treasure);
      expect(value).toBe(15); // 5 + 10
    });

    it('adds armor value', () => {
      const treasure = {
        gold: 5,
        items: [{ type: 'armor' }]
      };
      const value = calculateTreasureValue(treasure);
      expect(value).toBe(25); // 5 + 20
    });

    it('adds consumable value', () => {
      const treasure = {
        gold: 5,
        items: [{ type: 'consumable' }]
      };
      const value = calculateTreasureValue(treasure);
      expect(value).toBe(55); // 5 + 50
    });

    it('calculates multiple items', () => {
      const treasure = {
        gold: 10,
        items: [
          { type: 'weapon' },
          { type: 'consumable' }
        ]
      };
      const value = calculateTreasureValue(treasure);
      expect(value).toBe(70); // 10 + 10 + 50
    });
  });
});
