# 🔍 DEBUGGING - Freighter No Se Detecta

## ❌ Problema Actual

```
[connectFreighterWallet] Freighter no está instalado
Error: Freighter no está instalado. Por favor instala la extensión...
```

**Pero:** ¡Freighter ESTÁ instalado! Solo no se detecta `window.freighter`.

---

## 🔧 Causas Posibles

1. **Extensión no está activa en localhost**
   - Freighter por defecto solo funciona en sitios https
   - localhost:5173 podría estar bloqueado

2. **Extensión instalada pero no inyectó el código**
   - A veces necesita recarga de página o reload de extensión

3. **Otra extensión bloqueando Freighter**
   - Conflicto con otra extensión de wallet

4. **Navegador no soportado**
   - Freighter solo soporta Chrome, Edge, Firefox

---

## ✅ SOLUCIONES - Intenta Estas en Orden

### **Solución 1: Verificar en Console**

1. **Abre DevTools (F12)**
2. **Ve a Console tab**
3. **Copia y pega esto:**

```javascript
console.log('window.freighter:', window.freighter);
console.log('Keys con "freighter":', Object.keys(window).filter(k => k.toLowerCase().includes('freighter')));
console.log('Keys con "stellar":', Object.keys(window).filter(k => k.toLowerCase().includes('stellar')));
```

4. **¿Qué ves?**
   - Si ves un **OBJETO** → Freighter SÍ está instalado. Ve a Solución 2.
   - Si ves **undefined** → Freighter NO se inyectó. Ve a Solución 3.

---

### **Solución 2: Permite Freighter en localhost**

1. **Click derecho** en icono de Freighter (arriba a la derecha)
2. **"Administrar extensión"**
3. **En "Acceso a sitios web"** elige:
   - "En todos los sitios" O
   - "En sitios específicos" → Agrega `localhost:5173`

4. **IMPORTANTE:** Si pone "Solo en incógnito", CÁMBIALO

5. **Recarga la página (Ctrl+R)**

---

### **Solución 3: Recarga la Extensión**

1. **Ve a:** `chrome://extensions/` (Chrome) o `about:addons` (Firefox)
2. **Busca Freighter**
3. **Click en icono de "reload" (círculo ↺)**
4. **Recarga la página web (Ctrl+R)**

---

### **Solución 4: Desactiva Otras Extensiones**

Si tienes otras extensiones de wallet (MetaMask, Phantom, etc.):

1. **Desactívalas temporalmente**
2. **Recarga página**
3. **Intenta conectar Freighter**

Si ahora funciona → Hay conflicto con otra extensión.

---

### **Solución 5: Limpia Caché**

1. **DevTools (F12) → Gear ⚙️ (Settings)**
2. **En "Preferences" → busca "cache"**
3. **Marca "Disable cache (while DevTools is open)"**
4. **Cierra DevTools (F12) y abre de nuevo**
5. **Recarga página (Ctrl+Shift+R hard reload)**

---

## 🧪 Pasos de Testing

### **Paso 1: Verifica que Freighter esté inyectado**

En Console (F12):
```javascript
console.log(window.freighter)
```

- **✅ Si ves un objeto:** Freighter SÍ está. Ve a Paso 2.
- **❌ Si ves undefined:** Ve a Soluciones arriba.

---

### **Paso 2: Intenta conectar manualmente**

En Console:
```javascript
window.freighter.getPublicKey()
  .then(pk => console.log('✓ Success! Public key:', pk))
  .catch(e => console.log('✗ Error:', e.message))
```

- **✅ Si ves popup de Freighter:** Dale permiso. Ve a Paso 3.
- **❌ Si no ves popup:** Freighter tiene un problema.

---

### **Paso 3: Intenta en la App**

1. **Recarga página**
2. **Login (email + contraseña)**
3. **Click "Conectar Wallet Freighter"**

- **✅ Si ves popup:** Dale permiso → Debe funcionar
- **❌ Si sigue diciendo "No detectado":** Sigue debugging

---

## 📋 Checklist

- [ ] Freighter está instalado (check en extensions)
- [ ] Freighter está **ENABLED** (no está gris)
- [ ] Freighter tiene permisos en localhost:5173
- [ ] `window.freighter` aparece en Console
- [ ] `window.freighter.getPublicKey()` funciona y abre popup
- [ ] Se abre popup de Freighter pidiendo autorización
- [ ] Autorizo en Freighter
- [ ] Vuelvo al dashboard y dice "Wallet conectada"

---

## 📝 Info Técnica

**Mejoras Agregadas al Código:**
- Reintentos automáticos 3 veces (cada 500ms)
- Logging detallado de keys de `window`
- Mensajes de error más descriptivos
- Sugiere pasos para resolver

---

## 🆘 Si Aún No Funciona

**En DevTools Console, ejecuta esto y copia el resultado:**

```javascript
console.log({
  freighter_available: !!window.freighter,
  navegador: navigator.userAgent,
  url: window.location.href,
  freighter_keys: Object.getOwnPropertyNames(window.freighter || {})
})
```

**Y cuéntame:**
1. ¿Qué navegador usas?
2. ¿Dónde instalaste Freighter? (Chrome Web Store, etc.)
3. ¿Cuál fue el resultado del comando arriba?

---

**Status:** 🔍 En Debugging  
**Próximo:** Intenta Solución 1 → reporta si `window.freighter` es un objeto o undefined


### Paso 2: Haz clic en "Conectar Wallet"
- Observa los logs en la consola
- El flujo debería ser:
  1. `[connectFreighterWallet] Starting connection process...`
  2. `[connectFreighterWallet] Freighter detectado` ← Si no aparece, Freighter no está instalado
  3. `[connectFreighterWallet] Verificando si la wallet está conectada...`
  4. `[connectFreighterWallet] isConnected = true` ← Si es `false`, aprueba el acceso en Freighter
  5. `[connectFreighterWallet] Obteniendo clave pública...`
  6. `[connectFreighterWallet] Clave pública obtenida: GBUQWP...`
  7. `[AuthProvider.connectFreighter] Step 2: Guardando en backend...`
  8. `[saveWalletToProfile] Respuesta del servidor:...` ← Aquí llega la respuesta del backend

### Paso 3: Identifica dónde se queda
- Si se queda después de "Starting connection process"
  - Freighter no está instalado
  - Solución: Instala desde https://freighter.app

- Si se queda en "isConnected = false"
  - La wallet Freighter existe pero no está conectada
  - Solución: Abre Freighter, verifica que está conectada a Stellar, y autoriza el acceso a la app

- Si se queda en "Obteniendo clave pública"
  - Freighter está conectado pero `getPublicKey()` demora o falla
  - Intenta: Recarga la página y vuelve a intentar

- Si se queda en "Guardando en backend"
  - El backend no responde rápidamente
  - Verifica que el backend está corriendo: `npm run dev` en `backend/`
  - Revisa los logs del backend

---

## 🚀 Verificación Rápida

### ¿Freighter está instalado?
Ejecuta esto en la consola del navegador:
```javascript
console.log(window.freighter);
```
- Si aparece un objeto: ✓ Freighter está instalado
- Si aparece `undefined`: ✗ Freighter no está instalado

### ¿Freighter está conectado?
Ejecuta esto:
```javascript
window.freighter.isConnected().then(isConnected => {
  console.log('isConnected:', isConnected);
});
```
- Si retorna `true`: ✓ Wallet está conectada
- Si retorna `false`: ✗ Necesitas conectar la wallet

### ¿Puedes obtener la clave pública?
Ejecuta esto:
```javascript
window.freighter.getPublicKey().then(pk => {
  console.log('Public Key:', pk);
});
```
- Si retorna una dirección tipo `GBUQWP...`: ✓ Todo funciona
- Si retorna error: ✗ Freighter no tiene acceso

---

## 📝 Checklist de Verificación

- [ ] Freighter está instalado en el navegador
- [ ] Freighter está conectado a Stellar mainnet
- [ ] Freighter tiene acceso autorizado a la aplicación
- [ ] El backend está corriendo (`npm run dev` en `/backend`)
- [ ] El endpoint `POST /auth/connect-wallet` está funcionando
- [ ] El token JWT es válido (usuario autenticado)
- [ ] El navegador puede contactar al backend (sin errores CORS)

---

## 🐛 Si Aún Hay Problemas

### Opción 1: Verifica los logs del backend
En la terminal de backend, deberías ver:
```
POST /auth/connect-wallet
Body: { walletAddress: "GBUQWP3..." }
Response: { message: "Wallet conectada correctamente", user: {...} }
```

### Opción 2: Verifica los errores de red
En DevTools → Network:
- Busca la request `connect-wallet`
- Haz clic para ver detalles
- Status debería ser `200`
- Response debería incluir el usuario actualizado

### Opción 3: Recarga la aplicación
A veces los cambios recientes no se cargan bien:
```bash
# En frontend/
npm run build
# Luego recarga el navegador (Ctrl+Shift+R para limpiar caché)
```

---

## 📞 Información a Proporcionar si Necesitas Ayuda

Cuando reportes el problema, proporciona:
1. **Captura de pantalla de la consola** (F12) mostrando los logs
2. **Captura del Network tab** mostrando la request `connect-wallet`
3. **Logs del backend** mostrando qué recibe el servidor
4. **Confirmación de que**:
   - [ ] Freighter está instalado
   - [ ] Freighter muestra estado: "conectado"
   - [ ] Backend está corriendo

---

**Última actualización:** 11 de Noviembre de 2025
**Estado:** ✅ Debugging implementado - Ready para testear
