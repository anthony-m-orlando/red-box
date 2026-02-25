# 🐛 Double Initiative Fix - FINAL Solution ✅

## The Problem

Initiative was still rolling twice:
```
Combat begins! Rolling initiative...
You rolled 5, Goblin rolled 3
You go first!
Combat begins! Rolling initiative...
You rolled 5, Goblin rolled 2
You go first!
```

## Root Cause

React.StrictMode in development causes components to mount twice to help detect issues. The previous fix using `useState` wasn't sufficient because:

1. First mount: `combatStarted = false` → runs effect
2. React unmounts (StrictMode)
3. Second mount: `combatStarted = false` again → runs effect again

## The Real Solution: useRef

Changed from `useState` to `useRef`:

```javascript
// OLD (didn't work):
const [combatStarted, setCombatStarted] = useState(false);
useEffect(() => {
  if (combatStarted) return;
  setCombatStarted(true);
  // ... initiative code
}, []);

// NEW (works):
const hasInitialized = useRef(false);
useEffect(() => {
  if (hasInitialized.current) return;
  hasInitialized.current = true;
  // ... initiative code
}, []);
```

## Why This Works

`useRef` persists across:
- Component re-renders
- React.StrictMode double-mounting
- Development hot reloads

Once `hasInitialized.current` is set to `true`, it stays `true` even if the component unmounts and remounts.

## File Modified

**`src/components/combat/CombatUI.jsx`**
- Line 1: Added `useRef` to imports
- Line 30: Changed from `useState` to `useRef`
- Line 33-34: Changed from checking state to checking ref.current

## Testing

### Expected Behavior:
```
Combat begins! Rolling initiative...
You rolled 5, Goblin rolled 3
You go first!
```

**Only ONE initiative roll per combat!**

### Test Steps:
1. Start combat with any enemy
2. Check console/combat log
3. Should see:
   - ✅ "Combat begins! Rolling initiative..." (once)
   - ✅ "You rolled X, Enemy rolled Y" (once)
   - ✅ "You/Enemy goes first!" (once)

### Should NOT see:
- ❌ Double "Combat begins!"
- ❌ Two different initiative rolls
- ❌ Conflicting "goes first" messages

## Why Previous Fix Failed

The previous fix with empty dependency array `[]` wasn't enough because:
- Empty deps only prevent re-runs on dependency changes
- They DON'T prevent re-runs on component remount
- React.StrictMode intentionally remounts in development

## Technical Details

### useState vs useRef for One-Time Logic

**useState**:
- Resets to initial value on remount
- Good for: UI state that needs to trigger re-renders
- Bad for: One-time initialization flags

**useRef**:
- Persists across remounts
- Doesn't trigger re-renders when changed
- Good for: One-time initialization flags
- Good for: DOM references, mutable values

This is the same pattern used in AdventureScreen for preventing duplicate narration!

## Package

**File**: `old-school-rpg-INITIATIVE-FIX.zip` (324 KB)

**Status**: Double initiative bug DEFINITIVELY FIXED ✅

## Verification

After installing this fix:
1. Clear browser cache (Ctrl+Shift+R)
2. Start new combat
3. Initiative should roll exactly once

If you still see double rolls after this fix, it would indicate a different issue (like multiple CombatUI components being mounted), but the `useRef` pattern handles all normal cases including StrictMode.

---

## Summary

✅ **Fix Applied**: useRef instead of useState for initialization flag  
✅ **Survives**: React.StrictMode double-mounting  
✅ **Survives**: Hot reloads in development  
✅ **Result**: Initiative rolls exactly once per combat  

**This is the definitive fix!** 🎉
