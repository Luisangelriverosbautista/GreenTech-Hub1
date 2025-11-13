# 🦁 SOLUCIÓN PARA BRAVE - Freighter en Brave Browser

## ¡ENCONTRAMOS EL PROBLEMA!

Estás en **Brave**, no en Chrome.

Brave tiene **permisos diferentes** y **más restrictivos** que Chrome.

---

## SOLUCIÓN PARA BRAVE - PASO A PASO

### PASO 1: Abre Configuración de Brave

**Opción A - Más fácil:**
1. En la barra de direcciones, copia y pega:
```
brave://settings/extensions
```
2. Presiona Enter

**Opción B - Desde menú:**
1. Haz clic en el menú ≡ (tres líneas) arriba a la derecha
2. Ve a **Configuración**
3. En la izquierda, busca **Extensiones**

### PASO 2: Busca Freighter

En la lista de extensiones, busca **Freighter**

Haz clic en ella o en **"Detalles"**

### PASO 3: Configuración de Permisos en Brave

Busca estas opciones en la página de Freighter:

**Opción 1: "Acceso a sitios" o "On these sites"**
- Si dice **"En sitios especificados"** o **"On specified sites"**
- **Cámbialo a:** "En todos los sitios" o "On all sites"
- Confirma

**Opción 2: "Acceso al contenido de la página"**
- Asegúrate de que está **HABILITADO** (toggle azul)

**Opción 3: "Acceso a localhost"**
- Algunos navegadores requieren permisos especiales para localhost
- Busca si hay una opción específica para localhost
- Habilítala si existe

### PASO 4: Permisos Manuales para Localhost (Si lo anterior no funciona)

1. Aún en la página de detalles de Freighter
2. Busca **"Administrar permisos en sitios"** o **"Manage site access"**
3. Haz clic en **"Agregar"** o **"Add"**
4. Ingresa: `http://localhost:5173`
5. Presiona Enter
6. Repite con: `http://localhost`
7. Haz clic en Guardar o confirma

### PASO 5: Recarga Freighter

1. Vuelve a `brave://extensions`
2. Busca Freighter
3. Haz clic en el botón ↻ (reload/recarga)
4. Espera 3 segundos

### PASO 6: Recarga tu App

1. Ve a `http://localhost:5173`
2. Presiona **F5** para recargar completamente
3. Si tienes cache, usa **Ctrl+Shift+R** para limpiar caché
4. Espera a que cargue

### PASO 7: Verifica en DevTools

1. Presiona **F12** (DevTools se abre)
2. Busca la pestaña **Console** (o **Consola**)
3. Ejecuta:
```javascript
console.log(window.freighter)
```
4. Presiona Enter

**Resultado esperado:**
```
Freighter {
  isConnected: ƒ isConnected(),
  getPublicKey: ƒ getPublicKey(),
  signTransaction: ƒ signTransaction(),
  ...
}
```

**NO debe ser `undefined`**

### PASO 8: Si Ahora Funciona

¡Excelente! Ahora:
1. Haz clic en **"Conectar Wallet"** en tu app
2. Debería aparecer un popup de Freighter
3. Haz clic en **"Autorizar"** o **"Permitir"**
4. ✅ **¡Wallet conectada!**

---

## CONFIGURACIÓN ESPECÍFICA DE BRAVE

### Si Brave Sigue Bloqueando

Brave tiene **Escudos** que pueden bloquear extensiones.

**Verifica esto:**

1. Ve a tu app: `http://localhost:5173`
2. Busca el icono del **Escudo de Brave** 🛡️ en la barra de direcciones (lado derecho)
3. Haz clic en él
4. Busca una sección que diga:
   - **"Extensiones bloqueadas"** o **"Blocked scripts"**
   - **"Contenido bloqueado"** o **"Blocked content"**
5. **Desbloquea todo** lo que veas ahí
6. Recarga la página (F5)

### Configuración Global de Brave para Localhost

**Si aún no funciona:**

1. Abre: `brave://settings/privacy`
2. Busca: **"Protecciones de Sitio"** o **"Site shields"**
3. Desactiva temporalmente:
   - Bloqueador de rastreadores
   - Bloqueador de anuncios
   - Cualquier otro bloqueador
4. Ve a tu app (F5)
5. Test: `console.log(window.freighter)`

### Permisos de Localhost en Brave

Algunos navegadores Brave requieren configuración especial para localhost:

1. Ve a: `brave://settings/content/siteData`
2. Busca **"localhost"** o **"http://localhost"**
3. Si está en la lista, haz clic en el X para eliminar restricciones
4. O agrega permiso manualmente:
   - Busca "Agregar" o "Add"
   - Ingresa: `http://localhost:5173`

---

## 🧪 TEST ESPECÍFICO PARA BRAVE

Ejecuta esto en DevTools Console:

```javascript
console.log('=== TEST PARA BRAVE ===');
console.log('window.freighter:', window.freighter);
console.log('Tipo:', typeof window.freighter);

// Verifica si Brave bloqueó extensiones
console.log('chrome.extension:', typeof chrome?.extension);
console.log('chrome.runtime:', typeof chrome?.runtime);

// Busca cualquier propiedad bloqueada
const allProps = Object.keys(window).filter(p => 
  /extension|freighter|brave|shield/i.test(p)
);
console.log('Propiedades encontradas:', allProps);
```

---

## DIFERENCIAS BRAVE vs CHROME

| Feature | Chrome | Brave |
|---------|--------|-------|
| Permisos de extensión | Estándar | Más restrictivos |
| Localhost | Automático | Necesita configuración |
| Escudos de bloqueo | No | SÍ (puede bloquear) |
| Cache/Storage | Normal | Más agresivo |
| Inyección de scripts | Automática | Puede estar bloqueada |

---

## SOLUCIÓN RÁPIDA SI NADA FUNCIONA

**Intenta esto:**

1. Desinstala Freighter de Brave
2. Limpia toda la cache de Brave:
   - `Ctrl+Shift+Supr`
   - Selecciona "Todo el tiempo"
   - Haz clic en "Borrar datos"
3. Reinicia Brave
4. Vuelve a instalar Freighter desde https://freighter.app
5. Configura permisos nuevamente (PASOS 1-3)
6. Recarga tu app

---

## SI BRAVE NO FUNCIONA

**Prueba en Chrome puro:**

Si Brave no permite que Freighter funcione, prueba:

1. Descarga Chrome desde https://www.google.com/chrome/
2. Instala Freighter en Chrome
3. Ve a `http://localhost:5173` en Chrome
4. Test: `console.log(window.freighter)`
5. ¿Funciona en Chrome?
   - ✅ SÍ → El problema es Brave
   - ❌ NO → El problema es de otra cosa

---

## 📝 CHECKLIST BRAVE ESPECÍFICO

- [ ] Freighter instalado en Brave ✓
- [ ] Switch de Freighter está AZUL en brave://extensions
- [ ] Acceso a sitios: "En todos los sitios" (o permisos manuales agregados)
- [ ] Escudos de Brave: Desbloqueado para localhost:5173
- [ ] Protecciones de sitio: Desactivadas temporalmente
- [ ] Cache: Limpiado (Ctrl+Shift+Supr)
- [ ] Brave: Reiniciado después de cambios
- [ ] App: Recargada (F5 o Ctrl+Shift+R)
- [ ] Test: `console.log(window.freighter)` muestra objeto (no undefined)

---

## RESULTADO ESPERADO

Después de TODOS estos pasos en Brave:

```javascript
Freighter {
  isConnected: ƒ,
  getPublicKey: ƒ,
  signTransaction: ƒ,
  submitTransaction: ƒ,
  ...
}
```

**No `undefined`**

---

## 🎯 TU ACCIÓN INMEDIATA

1. Abre: `brave://settings/extensions`
2. Busca Freighter
3. Cambia "Acceso a sitios" a "En todos los sitios"
4. Recarga Freighter (↻)
5. Recarga tu app (F5)
6. Abre DevTools (F12)
7. Test: `console.log(window.freighter)`
8. **Dime el resultado**

---

**¡Esto fue probablemente lo que faltaba!** 🎉

Brave es mucho más restrictivo que Chrome. Con esta configuración debería funcionar.
