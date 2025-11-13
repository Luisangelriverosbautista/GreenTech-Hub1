# 🔧 Freighter Quick Fix - 5 Minutes

## What's Wrong
Your Freighter extension is installed but NOT injecting into localhost:5173.
**Status:** `window.freighter` = `undefined` ❌

## Fix (Pick ONE Based on Your Browser)

### For Chrome/Brave/Edge
1. Click Freighter extension icon (top-right)
2. Click ⚙️ **gear icon** or **three dots** → "Administrar extensión"
3. In the left sidebar, find: **"Acceso a sitios web"** 
4. Change dropdown to: **"En todos los sitios"** or
5. Manual add:
   - Click **"Agregar URL"**
   - Type: `http://localhost:5173`
   - Press Enter
6. **Reload your app** (F5)

### For Firefox
1. Click **≡ Menu** (top-right)
2. Go to **"Extensiones y temas"**
3. Find **Freighter**, click **⚙️**
4. Select **"Permitir en localhost"** or
5. Go to **"Permisos"** → Add localhost:5173
6. **Reload your app** (F5)

## Verify the Fix Worked

**Open DevTools (F12) → Console tab and paste:**
```javascript
console.log(window.freighter)
```

### ✅ If Fixed (Should show):
```
Freighter {
  isConnected: ƒ,
  getPublicKey: ƒ,
  signTransaction: ƒ,
  ...
}
```

### ❌ If Still Broken (Shows):
```
undefined
```

## If Console Still Shows undefined

### Try This:
1. Go to `chrome://extensions/`
2. Find **Freighter**
3. Click the **↻ reload** button
4. Close and reopen DevTools (F12)
5. Test again in console

### If STILL undefined:
1. Disable other wallet extensions (MetaMask, Phantom, etc.)
2. Reload Freighter (step above)
3. Reload page
4. Test in console again

## Once console.log Shows Freighter Object

✅ You're done with permissions!

Now:
1. Reload your app page
2. Click **"Conectar Wallet"** button
3. Freighter popup should appear
4. Click **Authorize** in Freighter
5. Wallet should connect ✅

---

**Still stuck?** Run the full diagnostic: See `FREIGHTER_INJECTION_ISSUE.md` for complete troubleshooting
