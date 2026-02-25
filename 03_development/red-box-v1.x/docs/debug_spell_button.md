# 🔍 Cast Spell Button Debug Version

## What I Changed

### 1. Button Now Always Shows (If Character Has Spells)
**Before**: Button hidden if no spell slots available  
**After**: Button always visible but disabled if no slots

This means you should **always see** the "Cast Spell" button if your Magic-User has any spells selected.

### 2. Added Debug Info Panel
A yellow debug panel will appear at the top showing:
- Whether character has spells
- How many spells
- Which spells (by name)
- Spell slots available
- Spell slots used
- Whether slots are available

---

## 🧪 Testing Instructions

### Step 1: Create Fresh Magic-User
1. Delete any existing characters
2. Create brand new Magic-User
3. **During spell selection**, pick ANY spell (Light, Magic Missile, Shield, etc.)
4. Complete character creation

### Step 2: Start Adventure
1. Go to adventure selection
2. Pick any adventure
3. Enter first room

### Step 3: Check Debug Panel
Look for **yellow debug panel** at top of screen showing:
```
DEBUG:
Has spells: YES/NO
Spell count: 1
Spells: Light (or whichever you picked)
Spell slots: {"1":1}
Slots used: {"1":0}
Has slots available: YES
```

### Step 4: Check Cast Spell Button
Below the debug panel, look for action buttons:
- Search Room
- Use Item
- **Cast Spell** ← Should be visible!

---

## 📊 What to Tell Me

Please screenshot or copy the debug info and tell me:

1. **Debug Panel Shows**:
   - Has spells: ?
   - Spell count: ?
   - Spells: ?
   - Spell slots: ?
   - Slots used: ?
   - Has slots available: ?

2. **Cast Spell Button**:
   - Is it visible? YES/NO
   - If visible, is it enabled or grayed out?
   - If not visible, what buttons DO you see?

3. **Character Info**:
   - Class: Magic-User
   - Level: 1
   - Which spell did you select during creation?

---

## 🎯 Expected Behavior

### For a Fresh Level 1 Magic-User:
```
Has spells: YES
Spell count: 1
Spells: [whichever you picked]
Spell slots: {"1":1}
Slots used: {"1":0}
Has slots available: YES
```

**Cast Spell button should be**: ✅ **VISIBLE and ENABLED**

---

## 🔧 Possible Issues & Solutions

### Issue 1: "Has spells: NO"
**Means**: Character doesn't have any spells saved
**Cause**: Spell selection didn't save properly
**Solution**: Try creating character again, make sure to click spell during selection

### Issue 2: "Spell count: 0"
**Means**: Spells array is empty
**Cause**: Similar to Issue 1
**Solution**: Recreate character

### Issue 3: "Spell slots: {}"
**Means**: No spell slots defined
**Cause**: Character creation didn't set up spell slots
**Solution**: This would be a bug in character creation - let me know!

### Issue 4: "Slots used: {"1":1}"
**Means**: Spell slot already used
**Cause**: Already cast a spell, or spell slot marked as used on creation
**Solution**: Try resting or creating fresh character

### Issue 5: Button visible but grayed out
**Means**: Button is showing but disabled
**Cause**: hasSpellsAvailable() returning false
**Check**: Look at "Has slots available" in debug panel

---

## 💡 Most Likely Cause

Based on the issue, I suspect one of these:

### Theory 1: Spell Not Saving During Creation
The spell selection during character creation might not be saving to the character object.

**Test**: Look at "Spell count" in debug panel
- If 0: This is the problem
- If 1+: Not this issue

### Theory 2: Spell Slots Not Initialized
Character might be created without spell slots.

**Test**: Look at "Spell slots" in debug panel
- If {}: This is the problem
- If {"1":1}: Not this issue

### Theory 3: Conditional Logic Too Strict
The button visibility condition might be wrong.

**Fixed**: Button now always shows if character has spells

---

## 📸 Screenshot Request

Please take a screenshot showing:
1. The yellow debug panel
2. The action buttons below it
3. The entire game screen

This will help me see exactly what's happening!

---

## 🚀 Quick Test

If you want to test right now:

1. Extract `old-school-rpg-DEBUG-SPELLS.zip`
2. Run `npm install` (if fresh extract)
3. Run `npm run dev`
4. **Hard refresh browser** (Ctrl+Shift+R)
5. Create fresh Magic-User
6. Pick a spell during creation (IMPORTANT!)
7. Start adventure
8. Look for debug panel and Cast Spell button

---

## 📋 Checklist

- [ ] Extracted new debug version
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Created fresh Magic-User
- [ ] Selected a spell during creation
- [ ] Started adventure
- [ ] Can see yellow debug panel
- [ ] Checked if Cast Spell button is visible
- [ ] Ready to report findings

---

**The debug panel will tell us exactly what's wrong!** 🔍✨
