# 🧪 TESTING GUIDE - Quick Steps

## ✅ Pre-Testing Checklist

```bash
# 1. Build frontend
cd frontend
npm run build

# Expected: ✓ built in ~11 seconds (no errors)

# 2. Start backend (if needed)
cd ../backend
npm run dev

# Expected: Server running on http://localhost:5000

# 3. Start frontend dev server
cd ../frontend
npm run dev

# Expected: App running on http://localhost:5173
```

---

## 🧪 Test 1: No Loading Spinner on App Load

**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Reload page (Ctrl+R)
4. Watch console output

**Expected Result:**
- ✅ Page loads normally
- ✅ Dashboard loads without spinner
- ✅ NO "ENTERING CONNECT" message
- ✅ NO Soroban messages

**If Failed:**
- Check if SorobanProvider still in main.tsx
- Search console for "ENTERING CONNECT"

---

## 🧪 Test 2: Login Flow

**Steps:**
1. Navigate to Login page
2. Verify you see:
   - Email input field
   - Password input field
   - "Iniciar Sesión" button
   - **NO "Iniciar Sesión con Wallet" button**
3. Enter test credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Iniciar Sesión"

**Expected Result:**
- ✅ Loading spinner appears briefly
- ✅ No errors in console
- ✅ Redirects to Dashboard
- ✅ User name/email displayed

**If Failed:**
- Check backend is running
- Check email/password are correct
- Check console for API errors

---

## 🧪 Test 3: Wallet Connection

**Prerequisites:**
- Freighter extension installed and unlocked
- Wallet funded with XLM (or just approved in Freighter)

**Steps:**
1. On Dashboard, look for "Conectar Wallet Freighter" button
2. Click the button
3. Freighter popup should appear
4. In Freighter, authorize the connection
5. Click approve

**Expected Result:**
- ✅ Freighter popup appears
- ✅ No console errors
- ✅ Wallet address displays (like "GBUQWP...")
- ✅ "✓ Wallet Conectada" message shows
- ✅ Can see "Copiar" and "Desconectar" buttons

**If Stuck at Loading:**
- Check console for errors
- Verify Freighter is installed: `console.log(window.freighter)`
- Check if wallet is already connected
- Try authorizing again in Freighter

**If Freighter Popup Doesn't Appear:**
- Verify Freighter extension is installed
- Check if popup is behind the main window
- Try clicking button again

---

## 🧪 Test 4: Wallet Persistence

**Steps:**
1. Connect wallet (from Test 3)
2. Reload page (Ctrl+R)
3. Check if wallet still shows connected

**Expected Result:**
- ✅ Wallet address still displays after reload
- ✅ No need to reconnect
- ✅ Shows "Copiar" and "Desconectar" buttons

**If Failed:**
- Check browser DevTools → Application → localStorage
- Verify `walletAddress` is in user object
- Check backend saved it: call GET /auth/profile

---

## 🧪 Test 5: Disconnect Wallet

**Steps:**
1. With wallet connected, click "Desconectar" button
2. Confirm action if prompted

**Expected Result:**
- ✅ Wallet address disappears
- ✅ Button changes to "Conectar Wallet Freighter" again
- ✅ No errors in console

---

## 🧪 Test 6: Console Output

**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Connect wallet and watch for logs

**Expected Logs:**
```
[connectFreighterWallet] Starting connection process...
[connectFreighterWallet] Freighter detectado
[connectFreighterWallet] isConnected = true
[connectFreighterWallet] ✓ Conexión exitosa
[AuthProvider.connectFreighter] ✓ Conexión completada exitosamente
```

**Should NOT See:**
```
❌ ENTERING CONNECT
❌ Error: Wallet login no está implementado
❌ Soroban messages
```

---

## 🧪 Test 7: No TypeScript Errors

**Steps:**
1. Open DevTools (F12)
2. Go to Console tab
3. Scroll through console
4. Search for red error messages

**Expected Result:**
- ✅ No red error boxes
- ✅ No "Uncaught" errors
- ✅ Only info/warning messages (yellow)

---

## 📊 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Page stuck loading | Clear cache: DevTools → Settings → Disable cache + Ctrl+Shift+R |
| "ENTERING CONNECT" appears | Remove SorobanProvider from main.tsx |
| Freighter popup doesn't appear | Check extension installed: `window.freighter` in console |
| Wallet not saved | Check backend /auth/connect-wallet endpoint |
| Build fails | Run `npm install` and try again |

---

## ✅ Full Flow Test (End-to-End)

**Total time: ~2 minutes**

```
1. Navigate to app                           [10 seconds]
   ✓ Should load without "ENTERING CONNECT"

2. Go to Login                               [5 seconds]
   ✓ Should show email/password form

3. Enter credentials and login               [20 seconds]
   ✓ Should redirect to Dashboard

4. On Dashboard, look for wallet button      [5 seconds]
   ✓ Should see "Conectar Wallet Freighter"

5. Click wallet button                       [30 seconds]
   ✓ Freighter popup appears
   ✓ Authorize connection
   ✓ Return to app

6. Verify wallet connected                   [10 seconds]
   ✓ Wallet address displayed
   ✓ Can copy address
   ✓ Can disconnect

7. Reload page                               [5 seconds]
   ✓ Wallet still shows (persisted)

8. Disconnect wallet                         [5 seconds]
   ✓ Wallet disappears
   ✓ Button reappears

✅ All tests passed!
```

---

## 🎯 Success Criteria

- [x] No loading spinner on app init
- [x] No "ENTERING CONNECT" in console
- [x] Login works with email/password
- [x] Can connect Freighter wallet
- [x] Wallet address displays
- [x] Wallet persists after reload
- [x] Can disconnect wallet
- [x] No TypeScript errors
- [x] Build completes in ~11 seconds

---

**If All Tests Pass:** ✅ Application is ready for production!
