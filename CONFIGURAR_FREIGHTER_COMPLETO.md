# 🚀 SOLUCIÓN COMPLETA: Conectar Freighter

## ⚠️ PROBLEMA ACTUAL
Tu extensión Freighter está instalada, pero **NO tiene permiso para acceder a localhost:5173**.

**Por eso ves:**
```
window.freighter: undefined
```

## ✅ SOLUCIÓN EN 7 PASOS

### PASO 1: Abre la Administración de Freighter
1. Busca el icono de **Freighter** en la esquina superior derecha de Chrome
2. Haz **clic DERECHO** en él
3. Selecciona **"Administrar extensión"**

**Si no ves el icono:**
- Haz clic en el icono de "extensiones" (pieza de puzzle)
- Busca Freighter
- Haz clic DERECHO y selecciona "Administrar extensión"

### PASO 2: Busca la Sección de Permisos
En la página de Freighter que se abre, busca:
- **"Acceso a sitios web"** (texto que diga esto)
- O en el lado izquierdo: **"En sitios especificados"** o similar

### PASO 3: Dale Permiso a localhost:5173
Tienes 2 opciones (elige UNA):

**OPCIÓN A - MÁS FÁCIL (Recomendado):**
- Busca donde dice algo como "En sitios especificados" o "En todos los sitios"
- Cambia a **"En todos los sitios"** o **"Allow in all sites"**
- Haz clic en **"Guardar"** o espera a que se guarde automáticamente

**OPCIÓN B - MÁS SEGURO:**
- Busca un botón que diga **"Agregar sitio"** o **"Add website"**
- Haz clic en él
- En el campo de texto, escribe: `http://localhost:5173`
- O escribe: `http://localhost` (para todos los puertos)
- Presiona **Enter** o haz clic en **"Agregar"**

### PASO 4: Recarga la Extensión
1. Ve a `chrome://extensions/` (cópialo en la barra de direcciones)
2. Busca **Freighter** en la lista
3. Haz clic en el botón **↻ (circular con flechas)** que está a la derecha
4. **Espera 2-3 segundos** a que se recargue

### PASO 5: Recarga tu App
1. Vuelve a tu app: `http://localhost:5173`
2. Presiona **F5** en el teclado para recargar
3. **Espera** a que cargue completamente (2-3 segundos)

### PASO 6: Abre DevTools y Verifica
1. Presiona **F12** en el teclado (DevTools se abre abajo)
2. Haz clic en la pestaña **"Console"** (si no está visible)
3. En el campo de entrada, copia y pega esto:
```javascript
console.log(window.freighter)
```
4. Presiona **Enter**

### PASO 7: Interpreta el Resultado

**✅ SI VES ALGO COMO ESTO (Tiene permisos):**
```
Freighter {
  isConnected: ƒ isConnected(),
  getPublicKey: ƒ getPublicKey(),
  signTransaction: ƒ signTransaction(),
  ...
}
```

**Significa:** ¡Los permisos funcionan! Ve a la siguiente sección.

**❌ SI VES ESTO (No tiene permisos):**
```
undefined
```

**Significa:** Los permisos no funcionaron. Intenta:
- Vuelve al PASO 3 y elige la OPCIÓN B (agregar manualmente)
- Recarga de nuevo (PASO 4 y 5)
- Intenta en modo Incógnito (Ctrl+Shift+N)

---

## 🎯 UNA VEZ QUE `window.freighter` MUESTRE UN OBJETO

### Conecta tu Wallet:
1. En tu app, haz clic en el botón **"Conectar Wallet"**
2. **Debería aparecer un popup de Freighter** con un botón para autorizar
3. Haz clic en **"Autorizar"** o **"Permitir"** en el popup
4. **¡Listo!** Tu wallet está conectada 🎉

### Si el popup NO aparece:
- Verifica que hayas cerrado DevTools completamente (F12 de nuevo para cerrar)
- Intenta de nuevo desde el botón "Conectar Wallet"
- Si aún no aparece, recarga la página (F5) y intenta de nuevo

---

## 📝 TABLA DE REFERENCIA RÁPIDA

| # | Acción | Resultado Esperado |
|---|--------|-------------------|
| 1-2 | Abre administración de Freighter | Ves página de configuración |
| 3 | Agreg permiso a localhost:5173 | Se guarda el permiso |
| 4 | Recarga Freighter (↻) | El botón se presiona |
| 5 | Recarga página (F5) | Tu app se recarga |
| 6 | Abre Console (F12) | Ves la consola |
| 7 | Ejecutas console.log(window.freighter) | ✓ Ves el objeto O ❌ undefined |

---

## 🆘 SI AÚN NO FUNCIONA

### Opción 1: Reinicia el Navegador
1. Cierra **completamente** Chrome (no solo la ventana)
2. Espera 5 segundos
3. Abre Chrome de nuevo
4. Intenta los pasos 5-7 nuevamente

### Opción 2: Reinstala Freighter
1. Ve a `chrome://extensions/`
2. Busca Freighter
3. Haz clic en **"Eliminar"** (aparece un popup confirmando)
4. Confirma que deseas eliminar
5. Ve a https://freighter.app
6. Haz clic en **"Instalar"** o **"Descargar"**
7. Una vez instalado, configura permisos nuevamente (PASO 3)

### Opción 3: Modo Incógnito
1. Presiona **Ctrl+Shift+N** para abrir ventana incógnito
2. Ve a `http://localhost:5173`
3. Intenta conectar wallet
4. Si funciona en incógnito pero no en normal, hay un conflicto con otra extensión

### Opción 4: Desactiva Otras Extensiones
Si tienes otras extensiones de wallet (MetaMask, Phantom, etc.):
1. Ve a `chrome://extensions/`
2. Desactiva temporalmente otras extensiones de wallet
3. Intenta los pasos 5-7 nuevamente
4. Si funciona, hay un conflicto (elige una)

---

## ✨ RESULTADO FINAL ESPERADO

Una vez que todo funciona:

1. ✅ `console.log(window.freighter)` muestra un objeto
2. ✅ El botón "Conectar Wallet" abre un popup
3. ✅ Después de autorizar, ves tu dirección de wallet
4. ✅ Tu wallet está conectada a la app

---

**¿Aún tiene problemas? Envía el resultado de:**
```javascript
console.log(window.freighter)
console.log(navigator.userAgent)
```

**Eso me ayudará a identificar exactamente el problema.**
