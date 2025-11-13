# 🔍 DIAGNÓSTICA AVANZADA - FREIGHTER NO SE INYECTA

## DATO IMPORTANTE DEL LOG

```
[waitForFreighter] Propiedades de extensión encontradas: 
['chrome']
```

**Esto significa:**
- ✅ Chrome API está disponible
- ❌ Pero Freighter NO está inyectado
- ❌ Ni siquiera aparece como propiedad

## CASOS POSIBLES

### Caso 1: Freighter Completamente Deshabilitado ⚠️

**Señal:** `chrome` existe pero `freighter` no

**Verificación:**
1. Ve a `chrome://extensions/`
2. Busca Freighter
3. ¿Ves un **switch gris** en la esquina superior derecha?

**Solución si el switch está gris:**
1. Haz clic en el switch para habilitarlo (debe ponerse AZUL)
2. Espera 2 segundos
3. Recarga tu app (F5)
4. Abre DevTools (F12) y ejecuta: `console.log(window.freighter)`

### Caso 2: Conflicto con Otra Extensión 🔀

**Señal:** Freighter habilitado pero aún no se inyecta

**Extensiones que pueden conflictuar:**
- MetaMask
- Phantom
- Coinbase Wallet
- Keplr
- Leap
- Cualquier otra de crypto

**Verificación y Solución:**
1. Ve a `chrome://extensions/`
2. Busca TODAS las extensiones de wallet
3. Desactiva TODAS EXCEPTO Freighter
4. Recarga Freighter (botón ↻)
5. Recarga tu app (F5)
6. Abre DevTools (F12) y ejecuta: `console.log(window.freighter)`

**Si ahora funciona:**
- Reactiva las otras extensiones UNA POR UNA
- Prueba después de cada una
- Identifica cuál causa el conflicto
- Mantén esa desactivada

### Caso 3: Permisos Insuficientes 🔐

**Señal:** Permisos no se aplicaron correctamente

**Verificación completa:**
1. Ve a `chrome://extensions/`
2. Busca Freighter y abre "Detalles"
3. Verifica TODAS estas secciones:
   - **"Acceso a sitios web"** → Debe estar en "En todos los sitios"
   - O busca "Administrar permisos en sitios"
   - Debe incluir:
     - `http://localhost:5173`
     - `http://localhost`
     - O `*://localhost/*`

**Solución:**
1. Si dice "En sitios especificados":
   - Haz clic en el dropdown
   - Elige "En todos los sitios"
   - Confirma
2. O agrega sitios manualmente:
   - Busca "Agregar sitio" o "Add website"
   - Ingresa: `http://localhost:5173`
   - Ingresa: `http://localhost`
   - Presiona Enter en cada uno
3. Recarga Freighter (↻)
4. Recarga tu app (F5)

### Caso 4: Modo Incógnito 👻

**Señal:** Freighter solo funciona en incógnito

**Verificación:**
1. Presiona Ctrl+Shift+N (abre ventana incógnito)
2. Ve a `http://localhost:5173`
3. ¿Funciona aquí?

**Si SÍ funciona en incógnito:**
- Hay un conflicto específico en modo normal
- Ve a chrome://extensions/Freighter
- Busca "Modo incógnito"
- Cambia a "Permitido en ventanas incógnito"
- O habilita "en navegación normal"

**Si NO funciona ni en incógnito:**
- Es un problema con Freighter mismo

---

## 🧪 TEST DE DIAGNÓSTICA PASO A PASO

### Test 1: ¿Está Chrome API disponible?

En DevTools (F12) → Console:
```javascript
console.log('Chrome API:', typeof chrome);
console.log('Chrome extension:', typeof chrome.extension);
```

**Esperado:**
```
Chrome API: object
Chrome extension: object
```

### Test 2: ¿Freighter está en window?

En DevTools → Console:
```javascript
console.log('Freighter:', window.freighter);
console.log('Tipo:', typeof window.freighter);
console.log('Es undefined?', window.freighter === undefined);
```

**Esperado:**
```
Freighter: Freighter {isConnected: ƒ, getPublicKey: ƒ, ...}
Tipo: object
Es undefined? false
```

**SI VES `undefined`:**
- Freighter NO está inyectado (problema de permisos o deshabilitado)

### Test 3: ¿Qué propiedades de window contienen "chrome" o "extension"?

En DevTools → Console:
```javascript
const allProps = Object.keys(window);
const relevant = allProps.filter(p => 
  /chrome|extension|freighter|stellar|wallet/i.test(p)
);
console.log('Propiedades relevantes:', relevant);
```

**Si ves:**
```
Propiedades relevantes: ["chrome"]
```

Significa que Freighter definitivamente NO está inyectado.

### Test 4: ¿Freighter está habilitado en Chrome?

**No se puede hacer en código, pero:**
1. Ve a `chrome://extensions/`
2. Busca Freighter
3. ¿Ves un **switch AZUL**?
   - ✅ SÍ → Está habilitado
   - ❌ NO (switch gris) → Haz clic para habilitarlo

---

## 📋 CHECKLIST DE SOLUCIÓN

Intenta CADA cosa en este orden exacto:

- [ ] **Paso 1:** Verifica que Freighter tiene el switch AZUL habilitado
  - Si está gris → Haz clic para habilitar
  - Recarga app (F5)
  - Test: `console.log(window.freighter)`

- [ ] **Paso 2:** Ve a detalles de Freighter
  - Busca "Acceso a sitios web"
  - Cambia a "En todos los sitios"
  - Recarga Freighter (↻)
  - Recarga app (F5)
  - Test: `console.log(window.freighter)`

- [ ] **Paso 3:** Agrega permisos manualmente
  - En detalles de Freighter
  - Busca "Agregar sitio"
  - Agrega: `http://localhost:5173`
  - Agrega: `http://localhost`
  - Recarga Freighter (↻)
  - Recarga app (F5)
  - Test: `console.log(window.freighter)`

- [ ] **Paso 4:** Desactiva otras extensiones
  - Ve a chrome://extensions/
  - Desactiva: MetaMask, Phantom, etc.
  - Recarga Freighter (↻)
  - Recarga app (F5)
  - Test: `console.log(window.freighter)`

- [ ] **Paso 5:** Reinicia el navegador
  - Cierra Chrome completamente
  - Espera 10 segundos
  - Abre Chrome
  - Ve a tu app
  - Test: `console.log(window.freighter)`

- [ ] **Paso 6:** Prueba en incógnito
  - Ctrl+Shift+N
  - Ve a http://localhost:5173
  - Test: `console.log(window.freighter)`
  - ¿Funciona aquí?
    - SÍ → Hay conflicto con otra extensión
    - NO → Problema con Freighter mismo

- [ ] **Paso 7:** Reinstala Freighter (última opción)
  - Ve a chrome://extensions/
  - Haz clic en "Eliminar" en Freighter
  - Confirma
  - Ve a https://freighter.app
  - Instala de nuevo
  - Crea/importa cuenta con testnet
  - Repite Pasos 1-3

---

## 🆘 SI NADA FUNCIONA

Abre DevTools (F12) y ejecuta esto en Console:

```javascript
console.log('=== DIAGNÓSTICA COMPLETA ===');
console.log('window.freighter:', window.freighter);
console.log('navigator.userAgent:', navigator.userAgent);
console.log('window.location.href:', window.location.href);

// Propiedades de window con "chrome"
const chromeProps = Object.keys(window).filter(k => k.includes('chrome'));
console.log('Propiedades chrome:', chromeProps);

// Prueba Chrome API
try {
  console.log('chrome.runtime:', typeof chrome.runtime);
  console.log('chrome.extension:', typeof chrome.extension);
} catch (e) {
  console.log('Error accediendo chrome:', e.message);
}

// Todas las propiedades relevantes
const allRelevant = Object.keys(window).filter(p => 
  /chrome|extension|freighter|stellar|wallet|provider/i.test(p)
);
console.log('Todas propiedades relevantes:', allRelevant);
```

**Copia el resultado completo y envía** para ayuda adicional.

---

## 📞 CONTACTO FREIGHTER

Si después de TODO esto aún no funciona, puede ser un bug de Freighter:

**Opciones:**
1. Ve a https://freighter.app
2. Busca "Support" o "Discord"
3. Reporta que en `localhost:5173` no se inyecta
4. Incluye:
   - Tu navegador (Chrome/Brave/Edge)
   - Versión de Freighter
   - Resultado del test de diagnóstica

---

## RESUMEN

Si `window.freighter` sigue siendo `undefined` después de TODOS estos pasos, es probable que:

1. **Freighter está corrompido** → Reinstala
2. **Tu versión de Chrome es muy antigua** → Actualiza
3. **Hay un bug de Freighter en tu setup** → Contacta soporte Freighter

Pero 99% de las veces, el problema es **Caso 1, 2 o 3 arriba**.

Intenta TODOS los pasos de forma ordenada.
