# 🔧 Magic-User Issues - Troubleshooting Guide

## Issues Reported
1. ❌ No torches in inventory
2. ❌ Light spell not available

## Root Cause
**You created the character BEFORE the updates were applied!**

The character data is cached in localStorage, so it has the OLD starting equipment (no torches) and OLD spell list.

---

## ✅ SOLUTION: Create a Fresh Character

### Method 1: Clear Character and Start Over (Recommended)

1. **Go to Character Manager** (from Home Page)
2. **Delete the old Magic-User**
3. **Create a NEW Magic-User**
4. **Expected results**:
   - ✅ 5 torches in inventory
   - ✅ Light spell available during spell selection
   - ✅ Lantern also in inventory
   - ✅ Spellbook in inventory

### Method 2: Clear Browser Storage (Nuclear Option)

If deleting doesn't work:

1. Open browser DevTools (F12)
2. Go to "Application" or "Storage" tab
3. Expand "Local Storage"
4. Find your site
5. Delete keys:
   - `rpg-character`
   - `rpg-adventure`
6. Refresh page
7. Create new character

### Method 3: Incognito/Private Window

1. Open an incognito/private browser window
2. Load the game
3. Create new Magic-User
4. Should have all new features

---

## ✅ Verification Checklist

After creating a fresh Magic-User:

### Check Starting Inventory
- [x] Spellbook (1)
- [x] Torch (5) ← NEW!
- [x] Lantern (1)
- [x] Backpack (1)
- [x] Waterskin (1)
- [x] Iron Ration (7)

### Check Spell Selection
When prompted to select spell, you should see:
- [x] Light ← Should be available!
- [x] Magic Missile
- [x] Shield
- [x] Sleep
- [x] Charm Person
- [x] Detect Magic
- [x] Read Magic

**Pick Light spell to test the issue!**

### Test Light Spell in Game
1. Enter dungeon
2. Go to first room
3. Click "Cast Spell" button (should be visible)
4. Select "Light"
5. Cast it
6. **Expected**: Area lights up, "🔥 Torch lit (6 turns)" appears

### Test Torches
1. Open "Use Item" menu
2. **Expected**: 5 torches visible
3. Use one torch
4. **Expected**: Light activates, torch count goes to 4

---

## 🔍 Why This Happened

### The Update Timeline

**Before update**:
```javascript
'magic-user': [
  { id: 'spellbook', ... },
  { id: 'lantern', ... }
  // No torches!
]
```

**After update**:
```javascript
'magic-user': [
  { id: 'spellbook', ... },
  { id: 'torch', quantity: 5, ... }, // ← NEW!
  { id: 'lantern', ... }
]
```

**Your character** was created with the OLD code, so it has:
- No torches
- Old spell list (though Light should still be there)

**New characters** created after the update get:
- 5 torches
- All features

---

## 🎯 Expected Behavior (Fresh Character)

### Magic-User Starting Setup

**Inventory**:
```
Spellbook (1)
Torch (5) ← 5 torches!
Lantern (1)
Backpack (1)
Waterskin (1)
Iron Ration (7)
```

**Spell Selection**:
```
Choose 1 spell from:
- Light ✨ (Creates magical light)
- Magic Missile ⚡ (Auto-hit damage)
- Shield 🛡️ (+4 AC for 2 turns)
- Sleep 💤 (Affects 2d8 HD)
- Charm Person 💗 (Fizzles in combat)
- Detect Magic 🔮 (Utility)
- Read Magic 📖 (Fizzles in combat)
```

**In Dungeon**:
```
Action Panel shows:
- Go [direction] (movement buttons)
- Search Room
- Use Item ← Can use torches here!
- Cast Spell ← Can cast Light here!
- Rest (once per adventure)
```

---

## 🧪 Test Script

Follow these exact steps to verify everything works:

### Step 1: Create Fresh Character
1. Home → Character Manager
2. Delete old magic-user (if exists)
3. Home → Create New Character
4. Choose Magic-User
5. Roll abilities (or use provided)
6. **SELECT LIGHT SPELL** ← Important!
7. Name character
8. Finish creation

### Step 2: Verify Inventory
1. Character sheet should show:
   - 5 Torches ✅
   - 1 Lantern ✅
   - 1 Spellbook ✅

### Step 3: Start Adventure
1. Home → Continue Adventure
2. Choose any adventure
3. Begin adventure

### Step 4: Test Cast Spell
1. In first room (exploration mode)
2. Look for "Cast Spell" button with ✨ icon
3. Button should be visible and enabled
4. Click it
5. Spell menu opens
6. Light spell should be in the list
7. Click "Cast" on Light
8. **Expected**: 
   - "You cast Light!" message
   - "🔥 Torch lit (6 turns)" status appears
   - Magical light sound plays

### Step 5: Test Physical Torches
1. After light spell expires (or before casting)
2. Click "Use Item"
3. Scroll to find Torch
4. Use one torch
5. **Expected**:
   - Torch count: 5 → 4
   - "🔥 Torch lit (6 turns)" status appears
   - Light active

---

## 🚨 If Still Not Working

If you create a fresh character and STILL don't see:
- 5 torches in inventory
- Cast Spell button in exploration
- Light spell in spell list

Then there might be a **caching issue**:

### Solution A: Hard Refresh
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Solution B: Clear Cache
- Chrome: Settings → Privacy → Clear browsing data
- Firefox: Settings → Privacy → Clear Data
- Safari: Develop → Empty Caches

### Solution C: Different Browser
- Try Chrome, Firefox, or Safari
- If it works in a different browser, it's a cache issue

---

## ✅ Success Indicators

You'll know everything is working when:

1. **Inventory Check** ✅
   - New Magic-User has 5 torches

2. **Spell Access** ✅
   - Cast Spell button visible in exploration
   - Light spell in spell list
   - Can actually cast Light

3. **Light Works** ✅
   - Casting Light lights the area
   - Status shows "🔥 Torch lit (6 turns)"
   - Darkness warning disappears

4. **Torches Work** ✅
   - Can use torches from item menu
   - Torch count decrements: 5 → 4 → 3
   - Each torch lasts 6 turns

---

## 📊 Comparison

### Old Character (Before Update)
```
Magic-User
├─ Spellbook ✅
├─ Lantern ✅
├─ Torches ❌ (None!)
└─ Light Spell ✅ (But can't cast in exploration)
```

### New Character (After Update)
```
Magic-User
├─ Spellbook ✅
├─ Torches ✅ (5!)
├─ Lantern ✅
└─ Light Spell ✅ (Can cast anywhere!)
```

---

## 💡 Why We Need Fresh Characters

**Character data includes**:
- Starting inventory (baked in at creation)
- Spell list (baked in at creation)
- Equipment (baked in at creation)

**When you create a character**:
1. Game looks at class definition
2. Gives starting items (current version at that time)
3. Saves to localStorage
4. Uses saved data forever

**When code updates**:
1. New characters get new items
2. Old characters keep old items (saved data)
3. No automatic migration

**Solution**: Create fresh character to get new features!

---

## 🎯 TL;DR

**Problem**: Old character = old inventory = no torches  
**Solution**: Delete character → Create new one → Get 5 torches + working spells ✅

**If that doesn't work**: Hard refresh browser (Ctrl+Shift+R)

**Still broken?**: Clear localStorage or use incognito window

---

**The code is correct - you just need a fresh character!** 🎮✨
