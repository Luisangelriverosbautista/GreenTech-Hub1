# 🔍 QUICK FIX - Freighter No Se Detecta

## El Problema
```
[connectFreighterWallet] Freighter no está instalado
```

Pero ¡Freighter SÍ está instalado! Solo necesita permisos en localhost.

---

## ✅ LA SOLUCIÓN (3 pasos)

### **PASO 1: Abre DevTools (F12)**

Presiona `F12` en tu navegador

```
┌─────────────────────────────────────────┐
│ GreenTech Hub                           │
├─────────────────────────────────────────┤
│                                          │
│  [DevTools abre aquí abajo]              │
│  ┌────────────────────────────────────┐ │
│  │ Console  Sources  Network ...      │ │
│  ├────────────────────────────────────┤ │
│  │ > _                                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### **PASO 2: En la Console, copia y ejecuta esto:**

```javascript
console.log(window.freighter)
```

**¿QUÉ VES?**

- **Option A: Un OBJETO** (con métodos como `getPublicKey`, etc.)
  → ✅ Freighter SÍ está detectado
  → Ve a PASO 3

- **Option B: `undefined`**
  → ❌ Freighter NO está detectado
  → Sigue las Soluciones de Permisos abajo

---

### **PASO 3: Si viste un OBJETO, intenta esto en Console:**

```javascript
window.freighter.getPublicKey()
```

**¿QUÉ PASA?**

- **Se abre popup de Freighter pidiendo autorización**
  → ✅ ¡ESTÁ FUNCIONANDO!
  → Dale permiso en Freighter
  → Vuelve al dashboard y haz click nuevamente

- **Error o nada**
  → ❌ Hay un problema con Freighter
  → Ve a "Soluciones de Permisos"

---

## 🔐 Si PASO 2 devuelve `undefined`

**Freighter no tiene permisos en localhost. Sigue esto:**

### Opción 1: Chrome/Edge

1. **Click derecho** en icono de Freighter (arriba a la derecha)

```
┌─────────────────┐
│ Freighter 🪐    │
│ Administrar ext.│  ← Click aquí
└─────────────────┘
```

2. **Se abre la página de detalles**

3. **Busca "Acceso a sitios web"** y elige:
   - `☑️ En todos los sitios` (más fácil)
   - O agrega `localhost:5173` manualmente

4. **Recarga la página (Ctrl+R)**

5. **Vuelve a DevTools (F12) y repite PASO 2**

---

### Opción 2: Firefox

1. **Ve a:** `about:addons`

2. **Busca Freighter**

3. **Haz click en Freighter → Permisos**

4. **Marca "En sitios web" o similar**

5. **Recarga la página**

6. **Repite PASO 2 en DevTools**

---

## 🔄 Si Sigue Sin Funcionar

### Recarga la Extensión

1. **Abre:** `chrome://extensions/` (Chrome) o `about:addons` (Firefox)

2. **Busca Freighter**

3. **Haz click en icono de reload ↺** (esquina abajo a la derecha del tile)

4. **Espera a que recargue**

5. **Vuelve al navegador y recarga (Ctrl+R)**

6. **Repite PASO 2**

---

## ✨ Si Ya Funciona en Console

**Ahora intenta en la app:**

1. **Cierra DevTools (F12)**
2. **Recarga página (Ctrl+R)**
3. **Login con email/contraseña**
4. **Click en "Conectar Wallet Freighter"**
5. **Se debe abrir popup de Freighter automáticamente**
6. **Dale permiso**
7. **✅ ¡Wallet conectada!**

---

## 📋 Quick Checklist

```
☐ Freighter instalado
☐ Freighter ENABLED (no gris)
☐ window.freighter devuelve OBJETO (no undefined)
☐ window.freighter.getPublicKey() funciona
☐ Se abre popup de Freighter
☐ Autorizo en Freighter
☐ Vuelvo al app y hago click en "Conectar Wallet"
☐ ✅ FUNCIONA!
```

---

## 🆘 Aún No Funciona?

**Cuéntame:**
1. ¿En PASO 2, `window.freighter` es un objeto o `undefined`?
2. ¿Qué navegador usas? (Chrome, Firefox, Edge, Safari)
3. ¿De dónde instalaste Freighter?
4. ¿Hay error en console? ¿Cuál es?

---

**Status:** 🔧 DEBUGGING  
**Siguiente:** Intenta PASO 1-2 ahora mismo
