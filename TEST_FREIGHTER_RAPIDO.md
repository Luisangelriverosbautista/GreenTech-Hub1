# 🧪 TEST RÁPIDO - Verifica tu Configuración

## COPIA Y PEGA ESTO EN LA CONSOLA

Abre tu app en `http://localhost:5173`, presiona **F12**, ve a la pestaña **Console** y copia-pega esto:

### TEST 1: ¿Está Freighter inyectado?
```javascript
console.log('=== TEST 1: ¿Está Freighter inyectado? ===');
console.log('window.freighter:', window.freighter);
console.log('¿Es undefined?:', window.freighter === undefined);
console.log('Tipo:', typeof window.freighter);
```

**Resultado esperado:**
- ✅ Si ves un objeto: `Freighter { ... }` → **Los permisos están configurados**
- ❌ Si ves: `undefined` → **Los permisos NO están configurados**

---

### TEST 2: ¿Hay otras propiedades de extensiones?
```javascript
console.log('=== TEST 2: Propiedades de extensiones ===');
const extensionKeys = Object.keys(window).filter(k => 
  k.toLowerCase().includes('freighter') || 
  k.toLowerCase().includes('stellar') ||
  k.toLowerCase().includes('extension') ||
  k.toLowerCase().includes('chrome')
);
console.log('Encontradas:', extensionKeys.length);
extensionKeys.forEach(k => console.log('  -', k));
```

**Resultado esperado:**
- ✅ Si ves `freighter` en la lista → **Los permisos funcionan**
- ❌ Si la lista está vacía → **No hay permisos para localhost**

---

### TEST 3: ¿Puedo llamar a Freighter?
```javascript
console.log('=== TEST 3: ¿Puedo llamar a Freighter? ===');
if (window.freighter) {
  window.freighter.isConnected()
    .then(isConn => console.log('¿Conectado?:', isConn))
    .catch(err => console.log('Error al verificar:', err.message));
} else {
  console.log('❌ Freighter no está disponible (undefined)');
}
```

**Resultado esperado:**
- ✅ Si ves: `¿Conectado?: true` o `¿Conectado?: false` → **¡Funciona!**
- ❌ Si ves: `❌ Freighter no está disponible` → **Sin permisos**

---

## ¿QUÉ HACER CON LOS RESULTADOS?

### Si todos los tests muestran ✅
```
✅ window.freighter = Freighter {...}
✅ extensionKeys incluye 'freighter'
✅ ¿Conectado?: true (o false)
```

**Significa:** ¡Los permisos están correctos! 
- Recarga la página (F5)
- Haz clic en "Conectar Wallet"
- Debería funcionar

---

### Si ves ❌ en el TEST 1
```
❌ window.freighter = undefined
❌ extensionKeys no incluye 'freighter'
```

**Significa:** Los permisos NO están configurados
- Lee: `CONFIGURAR_FREIGHTER_COMPLETO.md`
- Sigue los 7 pasos
- Repite el TEST 1

---

### Si ves ❌ en el TEST 3 pero ✅ en TEST 1-2
```
✅ window.freighter = Freighter {...}
✅ extensionKeys incluye 'freighter'
❌ Error al verificar: ...
```

**Significa:** Hay un problema con la extensión misma
- Intenta TEST 3 después de esperar 2 segundos
- Si aún da error, reinstala Freighter

---

## VERSIÓN SIMPLE (SI NO QUIERES COPIAR TODO)

Solo copia y pega esto:
```javascript
console.log(window.freighter)
```

- Si ves un objeto → ✅ Funciona
- Si ves `undefined` → ❌ Sin permisos

---

## COPIAR-PEGAR PASO A PASO

1. **Abre tu app:** `http://localhost:5173`
2. **Presiona F12** (DevTools se abre)
3. **Busca la pestaña "Console"** (si no la ves, haz clic en ella)
4. **Haz clic en el campo de entrada** (donde pone ">>")
5. **Copia todo el código del TEST 1 o TEST 2**
6. **Pega con Ctrl+V** (botón derecho → pegar)
7. **Presiona Enter**
8. **Mira el resultado**

---

## ENVÍAME TUS RESULTADOS

Para que pueda ayudarte mejor, envíame:

1. El resultado del TEST 1:
   ```
   window.freighter: _______________
   ¿Es undefined?: _______________
   ```

2. El resultado del TEST 3 (si Freighter mostró un objeto):
   ```
   ¿Conectado?: _______________
   O Error: _______________
   ```

---

**Esto te tomará menos de 1 minuto y sabremos exactamente cuál es el problema.** ⏱️
