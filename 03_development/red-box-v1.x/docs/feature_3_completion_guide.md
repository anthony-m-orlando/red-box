# Feature 3: Enhanced Spells - Completion Guide

**Status**: 40% Complete  
**Remaining**: 60% (approximately 2-3 hours)  

---

## ✅ Completed So Far (40%)

1. ✅ Added `activeBuffs` array to CharacterContext initial state
2. ✅ Added buff management actions (ADD_BUFF, DECREMENT_BUFF_DURATIONS, REMOVE_BUFF, CLEAR_BUFFS)
3. ✅ Added buff helper functions to CharacterContext value
4. ✅ Updated CombatUI to apply buffs when Shield/Protection cast
5. ✅ Spell implementations already configured in spells.js

---

## 🔧 Remaining Work (60%)

### Step 1: Apply Buffs to AC Calculation (30 minutes)

**File**: `src/components/combat/CombatUI.jsx`

**Problem**: Buffs are tracked but not applied to AC during combat

**Solution**: Calculate effective AC including active buffs

Find where AC is used in attack calculations (around line 70-100):

```javascript
// Add this helper function at top of CombatUI component:
const getEffectiveAC = () => {
  let effectiveAC = character.ac;
  
  // Apply AC buffs
  character.activeBuffs.forEach(buff => {
    if (buff.stat === 'ac') {
      effectiveAC -= buff.bonus; // Lower is better for AC
    }
  });
  
  return effectiveAC;
};

// Then use getEffectiveAC() instead of character.ac in attack rolls:
const attackRoll = rollAttack(character.thac0, getEffectiveAC(), strBonus);
```

---

### Step 2: Display Active Buffs in Combat UI (30 minutes)

**File**: `src/components/combat/CombatUI.jsx`

Add buff display in the character status section (around line 350):

```javascript
{/* Active Buffs */}
{character.activeBuffs.length > 0 && (
  <div className="active-buffs">
    <h4>Active Effects:</h4>
    {character.activeBuffs.map((buff, index) => (
      <div key={index} className="buff-indicator">
        <Shield size={14} />
        <span>{buff.spellId.replace('_', ' ')}: +{buff.bonus} {buff.stat.toUpperCase()}</span>
        <span className="buff-duration">({buff.duration} turns)</span>
      </div>
    ))}
  </div>
)}
```

**CSS** (add to `CombatUI.css`):

```css
.active-buffs {
  margin-top: var(--space-md);
  padding: var(--space-sm);
  background-color: rgba(44, 74, 124, 0.1);
  border-left: 3px solid var(--ink-blue);
  border-radius: var(--radius-sm);
}

.active-buffs h4 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 0.875rem;
  color: var(--ink-blue);
}

.buff-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.8125rem;
  color: var(--ink-brown);
  margin-bottom: var(--space-xs);
}

.buff-duration {
  margin-left: auto;
  font-weight: 700;
  color: var(--ink-blue);
}
```

---

### Step 3: Implement Sleep Spell (1 hour)

**Challenge**: Requires enemy condition tracking

**File**: `src/components/combat/CombatUI.jsx`

Add state for enemy conditions:

```javascript
const [enemyConditions, setEnemyConditions] = useState([]); // ['asleep', 'charmed', etc.]
```

Update `handleCastSpell` to handle Sleep:

```javascript
case 'condition':
  if (spell.id === 'sleep') {
    const hdAffected = result.hdAffected;
    const enemyHD = parseInt(enemy.hitDice) || 1;
    
    if (enemyHD <= hdAffected) {
      setEnemyConditions([...enemyConditions, 'asleep']);
      addLogEntry(`💤 ${enemy.name} falls asleep!`);
      addNarration('combat_action', `${spell.name} causes the ${enemy.name} to fall into a deep slumber!`);
    } else {
      addLogEntry(`✨ ${spell.name} fails to affect the ${enemy.name}.`);
      addNarration('combat_action', `${spell.name} has no effect on a creature of such strength.`);
    }
  }
  break;
```

Skip enemy turn if asleep:

```javascript
const handleEnemyTurn = () => {
  // Check if enemy is asleep
  if (enemyConditions.includes('asleep')) {
    addLogEntry(`💤 ${enemy.name} is asleep...`);
    addNarration('combat_action', `The ${enemy.name} slumbers peacefully.`);
    setRound(round + 1);
    setCombatState('playerTurn');
    return;
  }
  
  // ... rest of enemy turn logic
};
```

Wake on damage:

```javascript
// In handleAttack, after dealing damage:
if (enemyConditions.includes('asleep')) {
  setEnemyConditions(enemyConditions.filter(c => c !== 'asleep'));
  addLogEntry(`The ${enemy.name} wakes up!`);
}
```

---

### Step 4: Implement Detect Evil (30 minutes)

**File**: `src/utils/spells.js`

Add Detect Evil special handling in `castUtilitySpell`:

```javascript
export function castUtilitySpell(spell, caster, context) {
  const { effect } = spell.implementation;
  
  let message = '';
  switch (effect) {
    case 'detect_magic':
      message = 'You sense the presence of magical energies nearby...';
      break;
      
    case 'detect_evil':
      // This needs to be handled in the component with access to adventure state
      message = 'You focus your divine senses...';
      break;
      
    case 'light':
      message = 'Brilliant light fills the area!';
      break;
      
    default:
      message = `You cast ${spell.name}.`;
  }
  
  return {
    effect,
    message
  };
}
```

**File**: `src/components/combat/CombatUI.jsx`

Add special handling for Detect Evil:

```javascript
case 'utility':
  if (spell.id === 'detect_evil') {
    // Check if there are evil enemies nearby
    if (enemy && enemy.alignment === 'Chaotic') {
      addLogEntry(`👁️ You sense evil coming from the ${enemy.name}!`);
      addNarration('dm_note', `Your divine senses detect a malevolent presence - the ${enemy.name} radiates chaotic evil!`);
    } else {
      addLogEntry(`✨ You sense no evil nearby.`);
      addNarration('dm_note', 'Your senses detect no evil in the immediate area.');
    }
  } else {
    addLogEntry(`✨ ${result.message}`);
    addNarration('combat_action', result.message);
  }
  break;
```

---

### Step 5: Add Fizzle Narration for Other Spells (15 minutes)

**File**: `src/data/spells.js`

Update Charm Person and Read Magic implementations:

```javascript
charm_person: {
  // ... existing properties
  implementation: {
    type: 'utility',
    effect: 'fizzle', // Mark as fizzle
    message: 'The spell weaves through the air but finds no purchase in combat.'
  }
},

read_magic: {
  // ... existing properties
  implementation: {
    type: 'utility',
    effect: 'fizzle',
    message: 'The arcane runes shimmer briefly but reveal nothing useful here.'
  }
}
```

**File**: `src/utils/spells.js`

Handle fizzle in `castUtilitySpell`:

```javascript
case 'fizzle':
  message = spell.implementation.message || `${spell.name} fizzles without useful effect here.`;
  break;
```

---

### Step 6: Decrement Buff Durations (15 minutes)

**File**: `src/components/combat/CombatUI.jsx`

Add buff duration decrement at end of each round:

```javascript
// In handleEndTurn or after player/enemy turns:
useEffect(() => {
  if (combatState === 'playerTurn') {
    // Decrement buff durations at start of each player turn
    character.decrementBuffDurations();
  }
}, [round]);
```

Or manually in the round increment:

```javascript
const startNewRound = () => {
  setRound(round + 1);
  character.decrementBuffDurations(); // Decrement all buff durations
  setCombatState('playerTurn');
};
```

---

## 📋 Testing Checklist for Feature 3

### Shield Spell
- [ ] Cast Shield as Magic-User
- [ ] Verify +4 AC applies (check effective AC)
- [ ] Verify lasts 2 turns
- [ ] Verify disappears after duration
- [ ] Verify buff shows in UI

### Protection from Evil
- [ ] Cast Protection from Evil as Cleric
- [ ] Verify +1 AC applies
- [ ] Verify lasts longer than Shield
- [ ] Verify shows in active buffs

### Sleep Spell
- [ ] Cast Sleep on Goblin (1 HD)
- [ ] Verify Goblin falls asleep
- [ ] Verify Goblin skips turn
- [ ] Attack sleeping Goblin
- [ ] Verify Goblin wakes up
- [ ] Try on Rust Monster (5 HD)
- [ ] Verify Sleep fails (too many HD)

### Detect Evil
- [ ] Cast Detect Evil in combat
- [ ] Verify shows evil creature detected
- [ ] Cast outside combat (if possible)
- [ ] Verify appropriate message

### Fizzle Spells
- [ ] Cast Charm Person
- [ ] Verify fizzle message shows
- [ ] Cast Read Magic
- [ ] Verify fizzle message shows

---

## 🎯 Priority Order

1. **Step 1: Apply Buffs to AC** (Most important - makes Shield/Protection actually work)
2. **Step 6: Decrement Buffs** (Required for duration tracking)
3. **Step 2: Display Buffs** (Visual feedback)
4. **Step 4: Detect Evil** (Simple, quick win)
5. **Step 5: Fizzle Narration** (Simple, quick win)
6. **Step 3: Sleep Spell** (Most complex, save for last)

---

## 📊 Estimated Time Remaining

| Step | Complexity | Time |
|------|------------|------|
| Step 1: Apply Buffs to AC | Easy | 30 min |
| Step 2: Display Buffs | Easy | 30 min |
| Step 3: Sleep Spell | Hard | 1 hour |
| Step 4: Detect Evil | Easy | 30 min |
| Step 5: Fizzle Narration | Easy | 15 min |
| Step 6: Decrement Buffs | Easy | 15 min |
| **TOTAL** | | **3 hours** |

---

## 🚀 Quick Start

To complete Feature 3, work through the steps in priority order. Each step has exact code provided above. Copy, paste, test, repeat.

**Most Critical**: Step 1 (Apply Buffs) and Step 6 (Decrement Buffs) make the buff system actually functional.

**Quick Wins**: Steps 4 and 5 are fast and show immediate results.

**Save for Last**: Step 3 (Sleep) is most complex but also most impressive.

---

## 💡 Alternative: Simplified Feature 3

If time is limited, implement **only** Steps 1, 2, and 6:

**Result**: Shield and Protection from Evil work perfectly (1.5 hours)  
**Skip**: Sleep, Detect Evil, Fizzle messages  
**Status**: 80% of gameplay value, 50% of work

---

**Current Package**: `old-school-rpg-progress-feature-3-started.zip`  
**Contains**: Buff tracking system foundation (40% of Feature 3)  
**Next**: Implement Steps 1-6 above to complete Feature 3
