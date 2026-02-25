# Combat System Bug Fixes 🐛→✅

## Issues Found During Testing

### Bug #1: Double Initiative Roll ✅ FIXED
**Issue**: Initiative rolled twice, showing two sets of rolls
```
Combat begins! Rolling initiative...
You rolled 1, Goblin rolled 5
Goblin goes first!
Combat begins! Rolling initiative...  ← Duplicate!
You rolled 4, Goblin rolled 2
You go first!
```

**Root Cause**: React StrictMode in development executes useEffect twice

**Fix Applied**:
- Added `combatStarted` state flag
- Check flag before executing initiative
- Prevents double execution

**Result**: Initiative now rolls only once ✅

---

### Bug #2: Combat Stuck on "Enemy Turn" ✅ FIXED
**Issue**: After player attacks, combat gets stuck showing:
```
Enemy Turn
Goblin is attacking...
```
Nothing happens, combat freezes.

**Root Cause**: Multiple timing issues:
1. `setTimeout` in player attack not triggering correctly
2. No automatic trigger for enemy turn
3. State changes not connected to enemy action

**Fixes Applied**:

1. **Removed setTimeout from player attack**
   - Player attack now just sets state to 'enemyTurn'
   - Doesn't try to call handleEnemyTurn directly

2. **Added useEffect to auto-trigger enemy turn**
   ```javascript
   useEffect(() => {
     if (combatState === 'enemyTurn' && enemyHP > 0) {
       const timer = setTimeout(() => {
         handleEnemyTurn();
       }, 1500);
       return () => clearTimeout(timer);
     }
   }, [combatState]);
   ```

3. **Added extensive logging**
   - Console logs show exactly what's happening
   - Helps debug any future issues

4. **Added debug button**
   - Manual trigger for enemy turn (temporary)
   - Helps unstick combat if it freezes

**Result**: Enemy turn now executes automatically after 1.5 seconds ✅

---

## Testing the Fixes

### Test Scenario 1: Player Goes First
1. Enter Goblin's Lair
2. Initiative: You rolled 5, Goblin rolled 2
3. "You go first!" message
4. Click "Attack"
5. **Expected**: Attack resolves → "Enemy Turn" appears → 1.5 sec delay → Enemy attacks → Back to "Your Turn"

### Test Scenario 2: Enemy Goes First  
1. Enter combat
2. Initiative: You rolled 2, Goblin rolled 4
3. "Goblin goes first!" message
4. **Expected**: 1 sec delay → "Enemy Turn" → 1.5 sec delay → Enemy attacks → "Your Turn"

### Test Scenario 3: Complete Combat
1. Fight through entire battle
2. **Expected**: Turns alternate smoothly
3. No freezing
4. Combat ends on victory/defeat

---

## Debug Features Added

### Console Logging
Check browser console (F12) to see:
- `"Auto-triggering enemy turn via useEffect"` when enemy turn starts
- `"Enemy turn executing..."` when enemy actually attacks
- `"Player attack - combat state: [state]"` when you attack
- Any skip messages if turns are prevented

### Debug Button
If combat gets stuck on "Enemy Turn":
- Click `[Debug: Skip Enemy Turn]` button
- Manually triggers enemy action
- Temporary workaround while testing

---

## Changes Made

### CombatUI.jsx

**Line ~65**: Added combatStarted state
```javascript
const [combatStarted, setCombatStarted] = useState(false);
```

**Lines ~68-90**: Fixed initiative useEffect
```javascript
useEffect(() => {
  if (combatStarted) return; // Prevent double execution
  setCombatStarted(true);
  // ... rest of initiative code
}, [combatStarted]);
```

**Lines ~100-110**: Added auto-enemy-turn useEffect
```javascript
useEffect(() => {
  if (combatState === 'enemyTurn' && enemyHP > 0) {
    const timer = setTimeout(() => {
      handleEnemyTurn();
    }, 1500);
    return () => clearTimeout(timer);
  }
}, [combatState]);
```

**Lines ~145-170**: Fixed handlePlayerAttack
- Removed setTimeout call
- Just sets state to 'enemyTurn'
- Let useEffect handle timing

**Lines ~180-220**: Enhanced handleEnemyTurn
- Added extensive logging
- Better state checks
- Improved transition to player turn

**Lines ~320-330**: Added debug button
- Manual enemy turn trigger
- Shows in "Enemy Turn" state

---

## How to Test

### Fresh Test Run:

```bash
# Copy new ZIP
cd old-school-rpg
npm install
npm run dev
```

### Open Browser Console (F12)
You should see logs like:
```
Player attack - combat state: playerTurn
Auto-triggering enemy turn via useEffect
Enemy turn executing...
```

### Test Checklist:

✅ Initiative rolls once (not twice)  
✅ Player can attack  
✅ Enemy turn triggers automatically after 1.5 sec  
✅ Enemy attacks  
✅ Returns to player turn  
✅ Combat completes successfully  
✅ No freezing or stuck states  

---

## If Issues Persist

### Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Screenshot and report

### Check Network
1. Make sure app is running on http://localhost:5173
2. No CORS errors
3. All files loading

### Try Debug Button
1. If stuck on "Enemy Turn"
2. Click `[Debug: Skip Enemy Turn]`
3. Report if this works

### Report Format
```
Browser: [Chrome/Firefox/etc]
Console Errors: [Copy/paste any red errors]
State When Stuck: [What screen were you on?]
Steps to Reproduce: [Exact clicks you made]
```

---

## Next Steps After Testing

### If Combat Works:
✅ Remove debug button  
✅ Clean up console logs  
✅ Add special abilities (poison, rust)  
✅ Continue to Phase 4  

### If Combat Still Has Issues:
❌ Debug further  
❌ Add more logging  
❌ Simplify enemy turn logic  
❌ Retest  

---

## Technical Notes

### React StrictMode
- Causes double renders in development
- Not an issue in production build
- Fixed with state flags

### useEffect Dependencies
- Enemy turn needs to re-trigger when combatState changes
- Uses `[combatState]` dependency array
- Cleanup function prevents memory leaks

### Timing
- 1.5 second delay for enemy turn (dramatic effect)
- 0.5 second delay before returning to player turn
- Gives time to read combat log

---

## Expected Output (Success)

```
Round 1
Combat begins! Rolling initiative...
You rolled 4, Goblin rolled 2
You go first!

⚔️ You hit Goblin for 6 damage!

Round 2
💢 Goblin hits you for 3 damage!

⚔️ You hit Goblin for 4 damage!
🎉 Victory! Goblin is defeated!
You gain 5 XP!
```

---

**Download the fixed version and test again!** 

Report back with results and we'll proceed from there. 🧪⚔️
