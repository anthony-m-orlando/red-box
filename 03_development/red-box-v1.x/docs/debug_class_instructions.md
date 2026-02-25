# 🔍 DEBUG VERSION - Find Out Why Button Isn't Showing

## What This Does

This version adds console logging to see EXACTLY what `character.class` contains.

## Instructions

1. Extract `old-school-rpg-DEBUG-CLASS.zip`
2. Hard refresh (Ctrl+Shift+R)
3. Load your "Testy testy" character
4. Enter the dungeon
5. **Open browser console** (F12 → Console tab)
6. **Look for these lines**:

```
=== CAST SPELL BUTTON DEBUG ===
character.class: [something here]
Is cleric? false
Is magic-user? [true or false]
Is elf? false
Should show? [true or false]
```

## What to Tell Me

**Copy and paste the EXACT output** from the console showing:
- What `character.class` equals
- Whether each condition is true/false

This will tell us EXACTLY what the problem is!

---

## Most Likely Issues

### Issue 1: Character class is an object
If you see: `character.class: {id: 'magic-user', name: 'Magic-User', ...}`

Then the class IS stored as an object, not a string!

### Issue 2: Character class is undefined
If you see: `character.class: undefined`

Then the class isn't being saved at all!

### Issue 3: Character class is a different string
If you see: `character.class: "Magic-User"` (with capital M and U)

Then it's using the display name instead of the ID!

---

**Please send me the console output and I'll fix it immediately!** 🔍
