# 🎬 GUÍA PASO A PASO CON IMÁGENES - CONFIGURAR FREIGHTER

## SITUACIÓN ACTUAL

```
Tu App (localhost:5173)
        ↓
    [Login]
        ↓
    [Dashboard] ✅
        ↓
[Botón "Conectar Wallet"] ✅
        ↓
[Espera por Freighter...]
        ↓
❌ window.freighter = undefined
        ↓
Error: "Freighter no está instalado"
```

**Razón:** Freighter no tiene permiso para localhost

---

## SOLUCIÓN: 6 PASOS SIMPLES

### PASO 1: Haz clic derecho en Freighter

```
    Chrome barra superior
    ↓
    [🧩] ← Haz clic en extensiones
    ↓
    Freighter aparece en la lista
    ↓
    CLIC DERECHO en Freighter
    ↓
    "Administrar extensión"
```

### PASO 2: Busca "Acceso a sitios"

```
Página de Freighter se abre
    ↓
Busca en la izquierda o centro:
    - "Acceso a sitios web"
    - "En sitios especificados"
    - "Site access"
    ↓
Encontraste: ✅
```

### PASO 3: Agrega permiso para localhost

```
Opción A - MÁS FÁCIL:
    Cambia dropdown a: "En todos los sitios"
    ↓
    Guardar (o se guarda solo)
    ↓
    ✅ LISTO

Opción B - MÁS SEGURO:
    Busca: "Agregar sitio" / "Add website"
    ↓
    Escribe: http://localhost:5173
    ↓
    Presiona Enter
    ↓
    ✅ LISTO
```

### PASO 4: Recarga Freighter

```
Abre: chrome://extensions/
    ↓
Busca: Freighter
    ↓
Haz clic en el botón ↻ (circular)
    ↓
Espera 2-3 segundos
    ↓
✅ COMPLETADO
```

### PASO 5: Recarga tu App

```
Vuelve a: http://localhost:5173
    ↓
Presiona: F5
    ↓
Espera a que cargue (2-3 seg)
    ↓
✅ COMPLETADO
```

### PASO 6: Verifica & Conecta

```
Presiona: F12
    ↓
Haz clic en: "Console"
    ↓
Escribe: console.log(window.freighter)
    ↓
Presiona: Enter
    ↓
¿Ves algo como: Freighter { ... }?
    ✅ SÍ → Ve al Paso 6b
    ❌ NO → Repite Paso 1-5

PASO 6b: Conecta Wallet
    Haz clic en: "Conectar Wallet"
    ↓
    Popup de Freighter aparece
    ↓
    Haz clic en: "Autorizar" / "Permitir"
    ↓
    Espera 2 segundos
    ↓
    ✅ ¡Wallet Conectada!
```

---

## RESULTADO ESPERADO EN CADA PASO

| Paso | Qué Ves | Significado |
|------|---------|------------|
| 1 | "Administrar extensión" opción | ✅ Estás en el lugar correcto |
| 2 | Campo de "Acceso a sitios" | ✅ Encontraste la configuración |
| 3 | Dropdown cambiado a "En todos los sitios" | ✅ Permiso agregado |
| 4 | Botón ↻ se presiona en Freighter | ✅ Se recarga la extensión |
| 5 | Tu app se recarga en navegador | ✅ Página actualizada |
| 6 | `Freighter { isConnected: ƒ, ... }` | ✅ ¡FUNCIONA! |
| 6b | Popup de Freighter | ✅ Autoriza ahí |
| Final | Wallet mostrada en Dashboard | ✅ ¡TODO FUNCIONA! |

---

## TROUBLESHOOTING - SI FALLA

### ❌ Después del Paso 6 aún ves `undefined`

**Intenta esto:**
1. Cierra Chrome **completamente** (no solo la ventana)
2. Espera 5 segundos
3. Abre Chrome
4. Repite Paso 5-6
5. Si aún es undefined → Lee "FREIGHTER_INJECTION_ISSUE.md"

### ❌ No encuentras "Acceso a sitios"

**Intenta esto:**
1. Asegúrate de estar en página de **administración de Freighter**
2. Busca en la izquierda o en el centro principal
3. A veces dice "On specified sites" (en inglés)
4. Si no lo ves, intenta Paso 3 Opción B (agregar manualmente)

### ❌ El popup no aparece después de Paso 6

**Intenta esto:**
1. Cierra DevTools (presiona F12 de nuevo)
2. Haz clic en "Conectar Wallet" nuevamente
3. Si aún no aparece → Lee "FREIGHTER_INJECTION_ISSUE.md"

### ❌ `console.log(window.freighter)` da error

**Significa:** Algo está mal en la sintaxis
- Asegúrate de copiar exactamente: `console.log(window.freighter)`
- Presiona Enter (no Shift+Enter)
- Si da error de otra forma → Lee los logs en la consola

---

## CHECKLIST FINAL

Antes de decir que no funciona, verifica:

- [ ] ¿Abriste permisos de Freighter? (clic derecho → Administrar)
- [ ] ¿Encontraste "Acceso a sitios"? (mira bien toda la página)
- [ ] ¿Cambiaste a "En todos los sitios"? (o agregaste http://localhost:5173)
- [ ] ¿Recargaste Freighter? (botón ↻)
- [ ] ¿Recargaste tu app? (F5)
- [ ] ¿Abriste DevTools? (F12)
- [ ] ¿Ejecutaste el console.log exactamente? (copia y pega)
- [ ] ¿Viste que dice `Freighter {` (no undefined)?

Si todas son SÍ pero aún no funciona → Lee "FREIGHTER_INJECTION_ISSUE.md"

---

## MODO INCÓGNITO (Última opción de test)

```
Presiona: Ctrl+Shift+N (Incógnito)
    ↓
Ve a: http://localhost:5173
    ↓
¿Funciona aquí?
    ✅ SÍ → Hay conflicto con otra extensión
    ❌ NO → Freighter necesita desinstalación/reinstalación
```

---

## ÉXITO

**Cuando veas:**
```javascript
Freighter {
  isConnected: ƒ isConnected(),
  getPublicKey: ƒ getPublicKey(),
  signTransaction: ƒ signTransaction(),
  submitTransaction: ƒ submitTransaction(),
  ...
}
```

**No:**
```javascript
undefined
```

**¡Entonces todo está funcionando! ✨**

Recarga la página y haz clic en "Conectar Wallet" para completar.

---

**TIEMPO TOTAL:** 5-10 minutos  
**DIFICULTAD:** ⭐ Muy Fácil  
**RESULTADO:** 🎉 Wallet Conectada
