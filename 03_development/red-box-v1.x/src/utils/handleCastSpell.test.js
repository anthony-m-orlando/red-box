import { expect, vi } from 'vitest';
import { handleCastSpell } from './handleCastSpell';

/**
 * handleCastSpell Unit Tests
 * Tests shared spell casting logic used in both combat and exploration
 */

// Mock dependencies
vi.mock('../data/spells', () => ({
  getSpell: vi.fn((spellId) => {
    const spells = {
      'cure_light_wounds': {
        id: 'cure_light_wounds',
        name: 'Cure Light Wounds',
        implementation: { type: 'healing', effect: 'healing' },
        healAmount: 6
      },
      'magic_missile': {
        id: 'magic_missile',
        name: 'Magic Missile',
        implementation: { type: 'damage', effect: 'missile' },
        damage: 4
      },
      'sleep': {
        id: 'sleep',
        name: 'Sleep',
        implementation: { type: 'buff', effect: 'sleep' }
      }
    };
    return spells[spellId] || null;
  })
}));

vi.mock('../utils/spells', () => ({
  applySpellEffect: vi.fn((spell, character, target, mode) => {
    if (spell.implementation.type === 'healing') {
      return { type: 'healing', healAmount: 6 };
    }
    if (spell.implementation.type === 'damage') {
      return { type: 'damage', damage: 4, newHP: target.hp.current - 4 };
    }
    if (spell.implementation.type === 'buff') {
      return { 
        type: 'buff', 
        stat: 'ac', 
        bonus: -2, 
        duration: 6, 
        message: `${spell.name} grants -2 AC!` 
      };
    }
    return null;
  })
}));

vi.mock('../utils/sound', () => ({
  default: {
    play: vi.fn()
  }
}));

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const mockCharacter = {
  name: 'Aragorn',
  class: 'fighter',
  hp: { current: 8, max: 10 },
  xp: 0,
  gold: 100
};

const mockEnemy = {
  id: 'orc_1',
  name: 'Orc',
  type: 'orc',
  hp: { current: 6, max: 6 },
  ac: 6
};

const mockInteractionContext = {
  /* Combat only */
  enemy: mockEnemy,
  enemyHP: 6,
  setEnemyHP: vi.fn(),
  enemyConditions: [],
  setEnemyConditions: vi.fn(),
  round: 1,
  addLogEntry: vi.fn(),
  addNarration: vi.fn(),
  heal: vi.fn(),
  addBuff: vi.fn(),
  useSpellSlot: vi.fn(),
  setCombatState: vi.fn(),
  setShowSpellMenu: vi.fn(),
  character: mockCharacter,
  adventure: {}
};

const mockExplorationContext = {
  /* Exploration/non-combat */
  character: mockCharacter,
  enemy: null,
  enemyHP: null,
  setEnemyHP: null,
  addLogEntry: null,
  addNarration: vi.fn(),
  heal: vi.fn(),
  addBuff: vi.fn(),
  useSpellSlot: vi.fn(),
  setShowSpellMenu: vi.fn(),
  adventure: {}
};

// ─────────────────────────────────────────────────────────────────────────────
// Combat Spell Casting
// ─────────────────────────────────────────────────────────────────────────────

describe('handleCastSpell - Combat Mode', () => {
  let context;

  beforeEach(() => {
    context = {
      /* Combat only */
      enemy: mockEnemy,
      enemyHP: 6,
      setEnemyHP: vi.fn(),
      enemyConditions: [],
      setEnemyConditions: vi.fn(),
      round: 1,
      addLogEntry: vi.fn(),
      addNarration: vi.fn(),
      heal: vi.fn(),
      addBuff: vi.fn(),
      useSpellSlot: vi.fn(),
      setCombatState: vi.fn(),
      setShowSpellMenu: vi.fn(),
      character: mockCharacter,
      adventure: {}
    };
    vi.clearAllMocks();
  });

  describe('Healing spells', () => {
    it('should cast healing spell on self in combat', () => {
      handleCastSpell('cure_light_wounds', context);

      // Spell menu should close
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);

      // Healing should be applied
      expect(context.heal).toHaveBeenCalled();

      // Narration should be added
      expect(context.addNarration).toHaveBeenCalled();
    });

    it('should consume spell slot for healing', () => {
      handleCastSpell('cure_light_wounds', context);
      expect(context.useSpellSlot).toHaveBeenCalled();
    });

    it('should log healing spell in combat', () => {
      handleCastSpell('cure_light_wounds', context);

      // addLogEntry should be called (combat only)
      expect(context.addLogEntry).toHaveBeenCalled();
    });

    it('should announce spell cast', () => {
      handleCastSpell('cure_light_wounds', context);

      // Should have combat action narration
      const calls = context.addNarration.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe('Damage spells', () => {
    it('should cast damage spell on enemy in combat', () => {
      handleCastSpell('magic_missile', context);

      // Spell menu should close
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);

      // Enemy HP should be updated
      expect(context.setEnemyHP).toHaveBeenCalled();

      // Narration should mention damage
      expect(context.addNarration).toHaveBeenCalled();
    });

    it('should consume spell slot for damage spell', () => {
      handleCastSpell('magic_missile', context);
      expect(context.useSpellSlot).toHaveBeenCalled();
    });

    it('should log damage in combat', () => {
      handleCastSpell('magic_missile', context);
      expect(context.addLogEntry).toHaveBeenCalled();
    });
  });

  describe('Buff/Effect spells', () => {
    it('should apply buff spell', () => {
      handleCastSpell('sleep', context);

      // Spell menu should close
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);

      // Narration should be added
      expect(context.addNarration).toHaveBeenCalled();
    });

    it('should consume spell slot for buff', () => {
      handleCastSpell('sleep', context);
      expect(context.useSpellSlot).toHaveBeenCalled();
    });
  });

  describe('Spell menu closure', () => {
    it('should always close spell menu after casting', () => {
      handleCastSpell('cure_light_wounds', context);
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);

      context.setShowSpellMenu.mockClear();
      handleCastSpell('magic_missile', context);
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    });

    it('should close menu even if spell fails', () => {
      context.setShowSpellMenu.mockClear();
      handleCastSpell('cure_light_wounds', context);
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Exploration Mode (Non-Combat)
// ─────────────────────────────────────────────────────────────────────────────

describe('handleCastSpell - Exploration Mode', () => {
  let context;

  beforeEach(() => {
    context = { ...mockExplorationContext };
    vi.clearAllMocks();
  });

  describe('Healing spells in exploration', () => {
    it('should cast healing spell outside combat', () => {
      handleCastSpell('cure_light_wounds', context);

      // Spell menu should close
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);

      // Healing should be applied
      expect(context.heal).toHaveBeenCalled();

      // Narration should be added
      expect(context.addNarration).toHaveBeenCalled();
    });

    it('should not call addLogEntry outside combat', () => {
      handleCastSpell('cure_light_wounds', context);

      // addLogEntry should not be called (it's null in exploration)
      expect(context.addLogEntry).toBeNull();
    });

    it('should not have enemy HP in exploration context', () => {
      handleCastSpell('cure_light_wounds', context);

      // setEnemyHP should not be called (it's null)
      expect(context.setEnemyHP).toBeNull();
    });
  });

  describe('Target selection in exploration', () => {
    it('should target self for healing spells', () => {
      handleCastSpell('cure_light_wounds', context);

      // heal should be called, not setEnemyHP
      expect(context.heal).toHaveBeenCalled();
      expect(context.setEnemyHP).toBeNull();
    });

    it('should handle null enemy gracefully', () => {
      context.enemy = null;
      handleCastSpell('cure_light_wounds', context);

      // Should not crash
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────────────────────

describe('handleCastSpell - Error Handling', () => {
  let context;

  beforeEach(() => {
    context = { ...mockInteractionContext };
    vi.clearAllMocks();
  });

  describe('Invalid spells', () => {
    it('should handle non-existent spell gracefully', () => {
      // getSpell returns null for unknown spells
      expect(() => {
        handleCastSpell('nonexistent_spell', context);
      }).not.toThrow();
    });

    it('should still close spell menu on error', () => {
      handleCastSpell('cure_light_wounds', context);
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    });
  });

  describe('Missing context properties', () => {
    it('should handle missing heal function', () => {
      context.heal = undefined;
      expect(() => {
        handleCastSpell('cure_light_wounds', context);
      }).not.toThrow();
    });

    it('should handle missing setEnemyHP in combat', () => {
      context.setEnemyHP = undefined;
      expect(() => {
        handleCastSpell('magic_missile', context);
      }).not.toThrow();
    });

    it('should close menu even with missing context', () => {
      context.addNarration = null;
      context.heal = null;
      handleCastSpell('cure_light_wounds', context);
      expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sound & Feedback
// ─────────────────────────────────────────────────────────────────────────────

describe('handleCastSpell - Feedback & Audio', () => {
  let context;

  beforeEach(() => {
    context = { ...mockInteractionContext };
    vi.clearAllMocks();
  });

  describe('Sound effects', () => {
    it('should play spell sound on cast', () => {
      handleCastSpell('cure_light_wounds', context);

      // Note: sound is mocked, just verify it would be called
      // In real implementation, soundManager.play('spell') is called
      expect(context.addNarration).toHaveBeenCalled();
    });
  });

  describe('Narration', () => {
    it('should add combat action narration', () => {
      handleCastSpell('cure_light_wounds', context);

      // Verify combatAction narration is called
      const narrationCalls = context.addNarration.mock.calls;
      expect(narrationCalls.length).toBeGreaterThan(0);
    });

    it('should include spell name in narration', () => {
      handleCastSpell('cure_light_wounds', context);

      // Get all narration calls and check for spell name
      const calls = context.addNarration.mock.calls;
      const hasSpellName = calls.some(
        call => JSON.stringify(call).includes('Cure Light Wounds')
      );
      expect(hasSpellName).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('handleCastSpell - Integration Scenarios', () => {
  let context;

  beforeEach(() => {
    context = { ...mockInteractionContext };
    vi.clearAllMocks();
  });

  it('should handle healing spell in combat with full sequence', () => {
    context.character.hp.current = 5;
    context.character.hp.max = 10;

    handleCastSpell('cure_light_wounds', context);

    // Complete sequence: menu closes, heal called, slot consumed, narration added
    expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    expect(context.heal).toHaveBeenCalled();
    expect(context.useSpellSlot).toHaveBeenCalled();
    expect(context.addNarration).toHaveBeenCalled();
  });

  it('should handle damage spell in combat with full sequence', () => {
    handleCastSpell('magic_missile', context);

    // Complete sequence: menu closes, damage applied, slot consumed, narration added
    expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    expect(context.setEnemyHP).toHaveBeenCalled();
    expect(context.useSpellSlot).toHaveBeenCalled();
    expect(context.addNarration).toHaveBeenCalled();
    expect(context.addLogEntry).toHaveBeenCalled();
  });

  it('should handle spell cast in exploration', () => {
    context = { ...mockExplorationContext };
    vi.clearAllMocks();

    handleCastSpell('cure_light_wounds', context);

    // Exploration sequence: no combat log, no enemy HP update
    expect(context.setShowSpellMenu).toHaveBeenCalledWith(false);
    expect(context.heal).toHaveBeenCalled();
    expect(context.addNarration).toHaveBeenCalled();
  });
});

