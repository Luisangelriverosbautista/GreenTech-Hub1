# Freighter Extension Not Injecting - Complete Diagnostic Guide

## Problem Confirmed
- ✅ Extension installed: YES (user confirmed)
- ✅ Extension has account: YES (testnet account created)
- ❌ Extension injecting into page: **NO** (`window.freighter` is undefined)

## Root Cause
The Freighter extension is not injecting its API into the `window` object. This happens when:

### Reason 1: Missing Site Permissions (MOST LIKELY ⭐)
The extension needs explicit permission to access localhost:5173.

**Fix:**
1. **Right-click** the Freighter extension icon in the top-right corner
2. Select **"Administrar extensión"** (Manage extension)
3. Look for **"Acceso a sitios web"** (Site access) section
4. Change to **"En todos los sitios"** (On all sites) OR
5. Add specific permission:
   - Click "Agregar sitio" (Add site)
   - Enter: `http://localhost:5173`
   - Confirm
6. **Reload the page** (F5)
7. Open DevTools (F12) and test: `console.log(window.freighter)`
   - Should show: **[Object Freighter]** (not undefined)

### Reason 2: Chrome Extension Incognito Mode Only
The extension might be configured for incognito-only mode.

**Fix:**
1. Right-click Freighter extension icon
2. Select **"Administrar extensión"**
3. Look for **"Modo incógnito"** setting
4. Ensure it's set to **"Permitido"** (Allowed) or **"En todos los sitios"**
5. Reload page

### Reason 3: Extension Cache Issue
The extension might need to reload.

**Fix:**
1. Go to `chrome://extensions/`
2. Find **Freighter** extension
3. Click the **↻ (reload)** button
4. Reload your app page (F5)
5. Test in console: `console.log(window.freighter)`

### Reason 4: Conflicting Extensions
Another wallet extension might be blocking Freighter.

**Fix:**
1. Temporarily disable other wallet extensions:
   - MetaMask
   - Phantom
   - Coinbase Wallet
   - Any other blockchain extensions
2. Reload Freighter extension (↻ on chrome://extensions)
3. Reload page
4. Test in console: `console.log(window.freighter)`

## Verification Steps (Do in Order)

### Step 1: Check Current Permission Status
```javascript
// In browser DevTools Console (F12):
console.log('Freighter object:', window.freighter);
console.log('Type:', typeof window.freighter);
console.log('Is it undefined?', window.freighter === undefined);
```

**Expected output if working:**
```
Freighter object: Freighter {isConnected: ƒ, getPublicKey: ƒ, signTransaction: ƒ, ...}
Type: object
Is it undefined? false
```

**Current output (from your logs):**
```
Freighter object: undefined
Type: undefined
Is it undefined? true
```

### Step 2: After Making Permission Changes
1. Go to extension settings
2. Change permissions to **"En todos los sitios"**
3. Reload extension (↻)
4. Reload page (F5)
5. Run console test again
6. **Expected output:** Should show Freighter object, NOT undefined

## If Still Not Working After Steps 1-4

### Advanced Diagnostics

**Check if ANY extensions are loaded:**
```javascript
// In console:
Object.keys(window).filter(k => 
  k.includes('chrome') || 
  k.includes('extension') || 
  k.includes('freighter')
).forEach(k => console.log(k, ':', window[k]))
```

**Check manifest version:**
```javascript
// In console:
console.log('Chrome version:', /Chrome\/(\d+)/.exec(navigator.userAgent)[1]);
```

### Nuclear Option: Full Browser Reset
If none of above works:
1. Uninstall Freighter completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart browser
4. Reinstall Freighter from https://freighter.app
5. Create/import testnet account
6. Set permissions to "En todos los sitios"
7. Reload your app

## Expected Timeline

| Step | Time | Result |
|------|------|--------|
| Fix permissions | 2 min | Extension should inject |
| Reload Freighter | 1 min | Reset extension state |
| Test in console | 1 min | Verify `window.freighter` exists |
| Retry wallet connection | 1 min | Should now work |
| **Total** | **~5 min** | **Freighter connected** |

## Success Indicator

✅ **You'll know it's working when:**
1. Console shows: `Freighter object: Freighter { isConnected: ƒ, ... }`
2. Clicking "Conectar Wallet" shows authorization popup
3. After authorizing, wallet displays in app
4. Wallet address persists on page reload

## Next Steps After Fix

Once `window.freighter` is available:
1. Reload page
2. Click "Conectar Wallet" button
3. Freighter popup should appear
4. Click "Authorize" 
5. Wallet should connect ✅

---

**Status:** ⏳ Waiting for permission configuration and console verification

**Contact Point:** If `window.freighter` is still undefined after all steps, check:
- Browser compatibility (Chrome/Brave/Edge recommended)
- Extension version (must be latest)
- Firewall/VPN blocking extensions
