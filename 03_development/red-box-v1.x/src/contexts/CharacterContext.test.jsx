import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CharacterProvider, useCharacter } from '../contexts/CharacterContext';

describe('CharacterContext', () => {
  const wrapper = ({ children }) => <CharacterProvider>{children}</CharacterProvider>;

  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide initial character state', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    expect(result.current.character).toBeDefined();
    expect(result.current.character.name).toBe('');
    expect(result.current.character.class).toBeNull();
    expect(result.current.character.level).toBe(1);
    expect(result.current.character.isCreated).toBe(false);
  });

  it('should set abilities', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    const abilities = {
      strength: 15,
      intelligence: 12,
      wisdom: 10,
      dexterity: 14,
      constitution: 13,
      charisma: 11
    };

    act(() => {
      result.current.setAbilities(abilities);
    });

    expect(result.current.character.abilities).toEqual(abilities);
    expect(result.current.character.creationStep).toBe(2);
  });

  it('should set class and calculate stats', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    // First set abilities
    act(() => {
      result.current.setAbilities({
        strength: 15,
        intelligence: 12,
        wisdom: 10,
        dexterity: 14,
        constitution: 13,
        charisma: 11
      });
    });

    // Then set class
    act(() => {
      result.current.setClass('fighter');
    });

    expect(result.current.character.class).toBe('fighter');
    expect(result.current.character.hp.max).toBeGreaterThan(0);
    expect(result.current.character.ac).toBeDefined();
    expect(result.current.character.thac0).toBe(19);
    expect(result.current.character.creationStep).toBe(3);
  });

  it('should set alignment', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.setAlignment('lawful');
    });

    expect(result.current.character.alignment).toBe('lawful');
    expect(result.current.character.creationStep).toBe(4);
  });

  it('should set name', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.setName('Thorin');
    });

    expect(result.current.character.name).toBe('Thorin');
  });

  it('should finalize character', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.finalizeCharacter();
    });

    expect(result.current.character.isCreated).toBe(true);
  });

  it('should handle damage', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    // Setup character with HP
    act(() => {
      result.current.setAbilities({
        strength: 10, intelligence: 10, wisdom: 10,
        dexterity: 10, constitution: 10, charisma: 10
      });
      result.current.setClass('fighter');
    });

    const initialHP = result.current.character.hp.current;

    act(() => {
      result.current.takeDamage(3);
    });

    expect(result.current.character.hp.current).toBe(initialHP - 3);
  });

  it('should handle healing', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    // Setup and damage character
    act(() => {
      result.current.setAbilities({
        strength: 10, intelligence: 10, wisdom: 10,
        dexterity: 10, constitution: 10, charisma: 10
      });
      result.current.setClass('fighter');
      result.current.takeDamage(3);
    });

    const damagedHP = result.current.character.hp.current;

    act(() => {
      result.current.heal(2);
    });

    expect(result.current.character.hp.current).toBe(damagedHP + 2);
  });

  it('should not heal above max HP', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.setAbilities({
        strength: 10, intelligence: 10, wisdom: 10,
        dexterity: 10, constitution: 10, charisma: 10
      });
      result.current.setClass('fighter');
    });

    const maxHP = result.current.character.hp.max;

    act(() => {
      result.current.heal(100);
    });

    expect(result.current.character.hp.current).toBe(maxHP);
  });

  it('should add XP', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.addXP(100);
    });

    expect(result.current.character.xp).toBe(100);

    act(() => {
      result.current.addXP(50);
    });

    expect(result.current.character.xp).toBe(150);
  });

  it('should add and remove items', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    const item = { id: 'sword', name: 'Sword', weight: 10 };

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.character.inventory).toContainEqual(item);

    act(() => {
      result.current.removeItem('sword');
    });

    expect(result.current.character.inventory).not.toContainEqual(item);
  });

  it('should update gold', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.setAbilities({
        strength: 10, intelligence: 10, wisdom: 10,
        dexterity: 10, constitution: 10, charisma: 10
      });
      result.current.setClass('fighter');
    });

    const initialGold = result.current.character.gold;

    act(() => {
      result.current.updateGold(50);
    });

    expect(result.current.character.gold).toBe(initialGold + 50);

    act(() => {
      result.current.updateGold(-30);
    });

    expect(result.current.character.gold).toBe(initialGold + 20);
  });

  it('should not allow negative gold', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.updateGold(-100);
    });

    expect(result.current.character.gold).toBe(0);
  });

  it('should reset character', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    // Create a character
    act(() => {
      result.current.setName('Test');
      result.current.setAbilities({
        strength: 15, intelligence: 12, wisdom: 10,
        dexterity: 14, constitution: 13, charisma: 11
      });
      result.current.setClass('fighter');
    });

    expect(result.current.character.name).toBe('Test');

    // Reset
    act(() => {
      result.current.resetCharacter();
    });

    expect(result.current.character.name).toBe('');
    expect(result.current.character.class).toBeNull();
    expect(result.current.character.isCreated).toBe(false);
  });

  it('should calculate ability modifiers', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    act(() => {
      result.current.setAbilities({
        strength: 18,  // +3
        intelligence: 8,  // -1
        wisdom: 10,  // 0
        dexterity: 16,  // +2
        constitution: 13,  // +1
        charisma: 5  // -2
      });
    });

    expect(result.current.getModifier('strength')).toBe(3);
    expect(result.current.getModifier('intelligence')).toBe(-1);
    expect(result.current.getModifier('wisdom')).toBe(0);
    expect(result.current.getModifier('dexterity')).toBe(2);
    expect(result.current.getModifier('constitution')).toBe(1);
    expect(result.current.getModifier('charisma')).toBe(-2);
  });

  it('should check class requirements', () => {
    const { result } = renderHook(() => useCharacter(), { wrapper });
    
    // Good abilities for fighter
    act(() => {
      result.current.setAbilities({
        strength: 15,
        intelligence: 10,
        wisdom: 10,
        dexterity: 10,
        constitution: 10,
        charisma: 10
      });
    });

    const fighterCheck = result.current.canChooseClass('fighter');
    expect(fighterCheck.allowed).toBe(true);

    // Bad abilities for dwarf (needs Con 9+ and Str 9+)
    act(() => {
      result.current.setAbilities({
        strength: 8,  // Too low
        intelligence: 10,
        wisdom: 10,
        dexterity: 10,
        constitution: 10,
        charisma: 10
      });
    });

    const dwarfCheck = result.current.canChooseClass('dwarf');
    expect(dwarfCheck.allowed).toBe(false);
  });
});
