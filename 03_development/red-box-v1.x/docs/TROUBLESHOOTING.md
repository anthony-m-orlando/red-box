# Troubleshooting Guide

## Issue: "useAdventure must be used within AdventureProvider"

### Solution Steps:

1. **Clear Browser Cache & Refresh**
   ```bash
   # In browser: Ctrl+Shift+R (hard refresh)
   # Or Clear cache and hard refresh
   ```

2. **Restart Dev Server**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

3. **Clear Node Modules (if needed)**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

4. **Check Package Extraction**
   - Make sure you extracted the full ZIP
   - All files should be present
   - No partial extraction

### The Error Explained:

The error `"useAdventure must be used within AdventureProvider"` typically occurs when:
- Old cached files are being used
- The dev server needs a restart
- Browser has cached an old version

### React Router Warnings (Safe to Ignore):

The warnings about:
- `v7_startTransition`
- `v7_relativeSplatPath`

These are just future React Router v7 compatibility warnings. They don't affect functionality and can be safely ignored for now.

### Verification:

After fixing, you should be able to:
1. Create a character
2. Enter the adventure
3. See the adventure screen without errors

### If Error Persists:

The application structure is correct:
```
App
 └─ CharacterProvider
     └─ AdventureProvider
         └─ Router
             └─ Routes (all routes here)
```

This structure ensures all routes have access to both contexts.

If you still see the error:
1. Check the console for any other errors that might be the real cause
2. Verify all imports are correct
3. Make sure you're running from the correct directory
4. Try deleting `.vite` cache: `rm -rf node_modules/.vite`

---

## Common Development Issues:

### Issue: Features not showing up
**Solution**: Hard refresh browser (Ctrl+Shift+R)

### Issue: Torch/Light buttons not appearing
**Solution**: Create a character without infravision (Fighter, Cleric, Magic-User, Thief, Halfling)

### Issue: Trap not triggering
**Solution**: Don't search for it first - the trap only triggers if undetected

### Issue: Buffs not showing
**Solution**: Cast Shield or Protection from Evil - buffs only show when active

---

## Quick Start Checklist:

- [ ] Extract full ZIP
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Hard refresh browser
- [ ] Create new character
- [ ] Start adventure

---

## Success Indicators:

✅ No console errors (except React Router v7 warnings)
✅ Can create characters
✅ Can enter adventure
✅ Combat works
✅ Rest button appears
✅ Torch button appears (for non-infravision classes)

---

If you still have issues after trying these steps, the most likely cause is cached files. A complete restart usually fixes it:

```bash
# Kill dev server
# Clear browser completely
# Restart dev server
# Open in new incognito window
```
