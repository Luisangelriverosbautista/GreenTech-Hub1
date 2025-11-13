# 🔧 SOLUCIÓN: Freighter No Se Inyecta - Permisos de localhost

## El Problema Real
Tu Freighter está instalado, pero **no tiene permisos para acceder a localhost:5173**.

Las extensiones de navegador necesitan permiso explícito para cada dominio.

## SOLUCIÓN PASO A PASO

### Paso 1: Abre los Permisos de Freighter
1. Haz clic derecho en el icono de **Freighter** (arriba a la derecha del navegador)
2. Selecciona **"Administrar extensión"**

### Paso 2: Busca "Acceso a Sitios"
En la página de administración de Freighter:
- Mira en el lado izquierdo: **"En sitios especificados"** o similar
- O en la sección principal: **"Acceso a sitios web"**

### Paso 3: Agrega Permiso para localhost
Tienes DOS opciones:

**Opción A: Permitir en TODOS los sitios (MÁS FÁCIL)**
- Cambia a: **"En todos los sitios"**
- Confirma
- Ve al Paso 5

**Opción B: Agregar solo localhost (MÁS SEGURO)**
- Haz clic en **"Agregar sitio"** o **"Administrar permisos"**
- Ingresa: `http://localhost:5173`
- O ingresa: `http://localhost:*` (para todos los puertos)
- Confirma

### Paso 4: Recarga la Extensión
1. Vuelve a la página de `chrome://extensions/`
2. Encuentra **Freighter**
3. Haz clic en el botón **↻ (Recargar)** a la derecha
4. Espera 2-3 segundos

### Paso 5: Recarga tu App
1. Vuelve a tu app: `http://localhost:5173`
2. Presiona **F5** para recargar completamente
3. Abre **DevTools** con **F12**

### Paso 6: Verifica que Freighter Está Inyectado
En la **Console del DevTools**, copia y pega:
```javascript
console.log(window.freighter)
```

**Si ves algo como:**
```
Freighter {isConnected: ƒ, getPublicKey: ƒ, signTransaction: ƒ, ...}
```
✅ **¡FUNCIONA! Ve al Paso 7**

**Si ves:**
```
undefined
```
❌ Los permisos no funcionaron. Intenta:
- Opción B (agregar manualmente localhost)
- Desinstala y reinstala Freighter
- Prueba en incógnito (Ctrl+Shift+N)

### Paso 7: Intenta Conectar la Wallet
1. En tu app, haz clic en **"Conectar Wallet"**
2. Debería aparecer un popup de Freighter
3. Haz clic en **"Autorizar"** o **"Permitir"**
4. ¡Listo! Tu wallet está conectada

## Si Aún No Funciona

### Intenta Esto:
```javascript
// En la console:
console.log('Freighter:', window.freighter)
console.log('Todas las propiedades:', Object.getOwnPropertyNames(window).filter(x => x.includes('freighter') || x.includes('stellar')))
```

### Verifica en Chrome://extensions/
- ¿Freighter está HABILITADO? (debe tener un botón azul)
- ¿Tiene permiso para localhost? (revisa la sección de permisos)
- ¿Es la versión más nueva? (busca actualizaciones)

### Última Opción: Reinicia Todo
1. Desinstala Freighter
2. Limpia la caché del navegador (Ctrl+Shift+Supr)
3. Reinicia Chrome completamente
4. Instala Freighter nuevamente desde https://freighter.app
5. Crea tu cuenta con testnet
6. Configura permisos para localhost:5173
7. Intenta conectar

## Referencia Rápida

| Paso | Lo que ves | Acción |
|------|-----------|--------|
| 1 | DevTools → window.freighter = undefined | Agrega permiso a localhost |
| 2 | Recarga Freighter (↻) | Espera 2-3 segundos |
| 3 | Recarga página (F5) | Devtools de nuevo |
| 4 | window.freighter = Freighter {...} | Intenta conectar wallet |
| 5 | Popup de Freighter | Haz clic "Autorizar" |
| 6 | Wallet conectada ✓ | ¡Éxito! |

---

**IMPORTANTE:** Los permisos de extensión en Chrome tardan a veces en tomar efecto. Si recargaste pero aún no funciona:
1. Recarga la extensión nuevamente (↻ en chrome://extensions/)
2. Cierra DevTools completamente
3. Abre DevTools nuevamente
4. Intenta en la console nuevamente
