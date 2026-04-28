import { expect } from 'vitest';
import * as SecretDoorResolver from './SecretDoorResolver';

/**
 * SecretDoorResolver Unit Tests
 * Tests secret door detection, trap detection, and search mechanics
 */

const mockModule = {
  rooms: {
    1: {
      'empty_room': {
        id: 'empty_room',
        title: 'Empty Room',
        exits: []
      },
      'secret_room': {
        id: 'secret_room',
        title: 'Room with Secrets',
        exits: [
          { targetRoomId: 'adjacent', doorType: 'normal', direction: 'north' },
          { targetRoomId: 'hidden', doorType: 'secret', secretDoorId: 'secret_1', direction: 'east' }
        ],
        secretDoors: [
          { id: 'secret_1', description: 'Well-hidden passage', difficulty: 'normal' }
        ],
        traps: [
          { id: 'trap_1', type: 'pit', description: 'Deep pit', difficulty: 'easy' }
        ],
        hiddenFeatures: [
          { id: 'feature_1', description: 'Golden statue', value: 1000 }
        ]
      }
    }
  }
};

const baseState = {
  currentLevel: 1,
  currentRoomId: 'secret_room',
  hasLight: true,
  searchedRooms: [],
  discoveredSecretDoors: []
};

const baseCharacter = {
  class: 'fighter',
  name: 'Strongarm'
};

// ─────────────────────────────────────────────────────────────────────────────
// Secret Door Detection Chances
// ─────────────────────────────────────────────────────────────────────────────

describe('SecretDoorResolver - Secret Door Detection', () => {
  describe('getSecretDoorChance', () => {
    it('should return 1/6 for fighter active search', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('fighter', true);
      expect(chance).toBe(1 / 6);
      expect(chance).toBeCloseTo(0.1667, 4);
    });

    it('should return 0 for fighter passive', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('fighter', false);
      expect(chance).toBe(0);
    });

    it('should return 2/6 for elf active search', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('elf', true);
      expect(chance).toBe(2 / 6);
      expect(chance).toBeCloseTo(0.3333, 4);
    });

    it('should return 1/6 for elf passive (while moving)', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('elf', false);
      expect(chance).toBe(1 / 6);
    });

    it('should return 2/6 for dwarf search', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('dwarf', true);
      expect(chance).toBe(2 / 6);
    });

    it('should return 2/6 for dwarf passive (stonework)', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('dwarf', false);
      expect(chance).toBe(2 / 6);
    });

    it('should return 0 for non-elf/dwarf passive', () => {
      const chance = SecretDoorResolver.getSecretDoorChance('thief', false);
      expect(chance).toBe(0);
    });

    it('should handle case-insensitivity', () => {
      expect(SecretDoorResolver.getSecretDoorChance('FIGHTER', true))
        .toBe(SecretDoorResolver.getSecretDoorChance('fighter', true));
      
      expect(SecretDoorResolver.getSecretDoorChance('ELF', true))
        .toBe(SecretDoorResolver.getSecretDoorChance('elf', true));
      
      expect(SecretDoorResolver.getSecretDoorChance('Dwarf', true))
        .toBe(SecretDoorResolver.getSecretDoorChance('dwarf', true));
    });

    it('should handle null class gracefully', () => {
      const chance = SecretDoorResolver.getSecretDoorChance(null, true);
      expect(chance).toBe(1 / 6); // Default
    });

    it('should treat unknown classes as fighters', () => {
      const unknown = SecretDoorResolver.getSecretDoorChance('barbarian', true);
      const fighter = SecretDoorResolver.getSecretDoorChance('fighter', true);
      expect(unknown).toBe(fighter);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Trap Detection Chances
// ─────────────────────────────────────────────────────────────────────────────

describe('SecretDoorResolver - Trap Detection', () => {
  describe('getTrapDetectionChance', () => {
    it('should give thief 100% with light', () => {
      const chance = SecretDoorResolver.getTrapDetectionChance('thief', true);
      expect(chance).toBe(1.0);
    });

    it('should apply 75% dark penalty to thief', () => {
      const light = SecretDoorResolver.getTrapDetectionChance('thief', true);
      const dark = SecretDoorResolver.getTrapDetectionChance('thief', false);
      expect(dark).toBe(light * 0.25);
      expect(dark).toBe(0.25);
    });

    it('should give dwarf 100% with light', () => {
      const chance = SecretDoorResolver.getTrapDetectionChance('dwarf', true);
      expect(chance).toBe(1.0);
    });

    it('should give dwarf 25% in darkness', () => {
      const chance = SecretDoorResolver.getTrapDetectionChance('dwarf', false);
      expect(chance).toBe(0.25);
    });

    it('should give fighter 1/6 with light', () => {
      const chance = SecretDoorResolver.getTrapDetectionChance('fighter', true);
      expect(chance).toBeCloseTo(1 / 6, 4);
    });

    it('should apply dark penalty to all classes', () => {
      const lightChance = SecretDoorResolver.getTrapDetectionChance('fighter', true);
      const darkChance = SecretDoorResolver.getTrapDetectionChance('fighter', false);
      
      expect(darkChance).toBe(lightChance * 0.25);
    });

    it('should handle case-insensitivity', () => {
      const upper = SecretDoorResolver.getTrapDetectionChance('THIEF', true);
      const lower = SecretDoorResolver.getTrapDetectionChance('thief', true);
      const mixed = SecretDoorResolver.getTrapDetectionChance('Thief', true);
      
      expect(upper).toBe(lower);
      expect(lower).toBe(mixed);
    });

    it('should default to 1/6 for unknown class', () => {
      const chance = SecretDoorResolver.getTrapDetectionChance('wizard', true);
      expect(chance).toBeCloseTo(1 / 6, 4);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Search Resolution
// ─────────────────────────────────────────────────────────────────────────────

describe('SecretDoorResolver - Search Resolution', () => {
  let state;
  let character;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(baseState));
    character = JSON.parse(JSON.stringify(baseCharacter));
  });

  describe('resolveSearch', () => {
    it('should return search result object', () => {
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      expect(result).toHaveProperty('narration');
      expect(result).toHaveProperty('secretDoorsFound');
      expect(result).toHaveProperty('trapsDetected');
      expect(result).toHaveProperty('featuresFound');
    });

    it('should return arrays for results', () => {
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      expect(Array.isArray(result.secretDoorsFound)).toBe(true);
      expect(Array.isArray(result.trapsDetected)).toBe(true);
      expect(Array.isArray(result.featuresFound)).toBe(true);
    });

    it('should return narration string', () => {
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      expect(typeof result.narration).toBe('string');
      expect(result.narration.length).toBeGreaterThan(0);
    });

    it('should handle empty room', () => {
      state.currentRoomId = 'empty_room';
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      expect(result.secretDoorsFound.length).toBe(0);
    });

    it('should handle already-searched room', () => {
      state.searchedRooms = ['secret_room'];
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      expect(result.narration.toLowerCase()).toContain('already');
    });

    it('should track search in state patch', () => {
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      expect(result).toHaveProperty('statePatch');
      if (result.statePatch.searchedRooms) {
        expect(result.statePatch.searchedRooms).toContain('secret_room');
      }
    });

    it('should add discovered secret doors to state patch', () => {
      const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
      
      if (result.secretDoorsFound.length > 0 && result.statePatch.discoveredSecretDoors) {
        expect(Array.isArray(result.statePatch.discoveredSecretDoors)).toBe(true);
      }
    });

    it('should favor elf for secret door detection', () => {
      // Elf should have 2x chance (2/6 vs 1/6)
      const elfChance = SecretDoorResolver.getSecretDoorChance('elf', true);
      const fighterChance = SecretDoorResolver.getSecretDoorChance('fighter', true);
      
      expect(elfChance).toBe(2 * fighterChance);
    });

    it('should favor thief for trap detection', () => {
      // Thief should have 6x chance (1.0 vs 1/6)
      const thiefChance = SecretDoorResolver.getTrapDetectionChance('thief', true);
      const fighterChance = SecretDoorResolver.getTrapDetectionChance('fighter', true);
      
      expect(thiefChance).toBe(6 * fighterChance);
    });
  });

  describe('Search in darkness', () => {
    it('should apply light penalty for trap detection', () => {
      const light = SecretDoorResolver.getTrapDetectionChance('fighter', true);
      const dark = SecretDoorResolver.getTrapDetectionChance('fighter', false);
      
      expect(dark).toBe(light * 0.25);
    });

    it('should apply light penalty to all classes', () => {
      const classes = ['fighter', 'thief', 'dwarf', 'elf'];
      
      for (const cls of classes) {
        const light = SecretDoorResolver.getTrapDetectionChance(cls, true);
        const dark = SecretDoorResolver.getTrapDetectionChance(cls, false);
        
        expect(dark).toBe(light * 0.25);
      }
    });

    it('should not penalize dwarf for stonework in darkness', () => {
      // Dwarf gets 2/6 both light and dark for doors
      const doorLight = SecretDoorResolver.getSecretDoorChance('dwarf', true);
      const doorDark = SecretDoorResolver.getSecretDoorChance('dwarf', false);
      
      expect(doorLight).toBe(doorDark);
    });
  });

  describe('Class-based detection', () => {
    it('elf should detect passive secret doors', () => {
      const elfPassive = SecretDoorResolver.getSecretDoorChance('elf', false);
      const fighterPassive = SecretDoorResolver.getSecretDoorChance('fighter', false);
      
      expect(elfPassive).toBeGreaterThan(fighterPassive);
    });

    it('dwarf should detect stonework secrets', () => {
      const dwarf = SecretDoorResolver.getSecretDoorChance('dwarf', true);
      const elf = SecretDoorResolver.getSecretDoorChance('elf', true);
      
      expect(dwarf).toBe(elf);
    });

    it('fighter should have lowest detection rates', () => {
      const fighterDoors = SecretDoorResolver.getSecretDoorChance('fighter', true);
      const fighterTraps = SecretDoorResolver.getTrapDetectionChance('fighter', true);
      
      const elfDoors = SecretDoorResolver.getSecretDoorChance('elf', true);
      const thiefTraps = SecretDoorResolver.getTrapDetectionChance('thief', true);
      
      expect(fighterDoors).toBeLessThanOrEqual(elfDoors);
      expect(fighterTraps).toBeLessThanOrEqual(thiefTraps);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases
// ─────────────────────────────────────────────────────────────────────────────

describe('SecretDoorResolver - Edge Cases', () => {
  it('should handle null character gracefully', () => {
    const result = SecretDoorResolver.resolveSearch(mockModule, baseState, null);
    expect(result).toBeDefined();
  });

  it('should handle missing room', () => {
    const state = { ...baseState, currentRoomId: 'nonexistent' };
    const result = SecretDoorResolver.resolveSearch(mockModule, state, baseCharacter);
    
    expect(result.narration).toBeDefined();
  });

  it('should handle state without searchedRooms', () => {
    const state = { currentLevel: 1, currentRoomId: 'secret_room', hasLight: true };
    const result = SecretDoorResolver.resolveSearch(mockModule, state, baseCharacter);
    
    expect(result).toBeDefined();
  });

  it('should handle all class names safely', () => {
    const classes = [
      'fighter', 'cleric', 'magic-user', 'thief',
      'dwarf', 'elf', 'halfling',
      'unknown', null, undefined, ''
    ];
    
    for (const cls of classes) {
      // Should not throw
      expect(() => {
        SecretDoorResolver.getSecretDoorChance(cls, true);
        SecretDoorResolver.getTrapDetectionChance(cls, true);
      }).not.toThrow();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('SecretDoorResolver - Integration', () => {
  it('complete search scenario: fighter in lit room', () => {
    const state = {
      currentLevel: 1,
      currentRoomId: 'secret_room',
      hasLight: true,
      searchedRooms: [],
      discoveredSecretDoors: []
    };
    const character = { class: 'fighter' };
    
    const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
    
    expect(result.secretDoorsFound).toBeDefined();
    expect(result.trapsDetected).toBeDefined();
    expect(result.narration).toBeDefined();
  });

  it('complete search scenario: elf in darkness', () => {
    const state = {
      currentLevel: 1,
      currentRoomId: 'secret_room',
      hasLight: false,
      searchedRooms: [],
      discoveredSecretDoors: []
    };
    const character = { class: 'elf' };
    
    const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
    
    // Elf has better chances even in dark
    expect(result).toBeDefined();
  });

  it('complete search scenario: thief in trap-filled room', () => {
    const state = {
      currentLevel: 1,
      currentRoomId: 'secret_room',
      hasLight: true,
      searchedRooms: [],
      discoveredSecretDoors: []
    };
    const character = { class: 'thief' };
    
    const result = SecretDoorResolver.resolveSearch(mockModule, state, character);
    
    // Thief should excel at trap detection
    expect(result.trapsDetected).toBeDefined();
  });
});

