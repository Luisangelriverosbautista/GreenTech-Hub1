# 🎯 GUÍA VISUAL RÁPIDA - CONFIGURAR FREIGHTER

## PASO 1: PERMISOS

```
Chrome/Brave → Clic DERECHO en Freighter
                    ↓
            "Administrar extensión"
                    ↓
         Busca: "Acceso a sitios web"
                    ↓
      Cambia a: "En todos los sitios"
                    ↓
                 ✅ LISTO
```

## PASO 2: RECARGA

```
chrome://extensions/ 
    ↓
Encuentra Freighter
    ↓
Clic en ↻ (botón de recarga)
    ↓
Espera 2-3 segundos
    ↓
     ✅ LISTO
```

## PASO 3: RECARGA TU APP

```
http://localhost:5173
    ↓
Presiona F5
    ↓
Espera a que cargue
    ↓
     ✅ LISTO
```

## PASO 4: VERIFICA

```
Presiona F12 → Console
    ↓
Escribe: console.log(window.freighter)
    ↓
Presiona Enter
    ↓
¿Ves Freighter {...}?
    ✅ SÍ → Ve al Paso 5
    ❌ NO → Repite Paso 1-3
```

## PASO 5: CONECTA

```
Haz clic en "Conectar Wallet"
    ↓
Debería aparecer popup de Freighter
    ↓
Haz clic en "Autorizar"
    ↓
✅ ¡Wallet conectada!
```

---

## IMÁGENES/UBICACIONES CLAVE

### Ubicación del Icono de Freighter
```
Chrome barra de direcciones → 🧩 extensiones → Freighter
                         ↓
                   Clic DERECHO
```

### Dónde Ver Permisos
```
chrome://extensions/ 
    ↓
Busca Freighter
    ↓
Haz clic en ella
    ↓
Ve a: "En sitios especificados" o "Acceso a sitios web"
    ↓
Ahí está la opción
```

### Dónde Ver Console
```
Tu App (http://localhost:5173)
    ↓
Presiona F12
    ↓
Arriba hay tabs: Elements, Console, Network, etc.
    ↓
Haz clic en "Console"
    ↓
Abajo hay campo de texto para escribir
    ↓
Ahí ejecutas: console.log(window.freighter)
```

---

## CHECKLIST

- [ ] Abrí permisos de Freighter
- [ ] Cambié a "En todos los sitios" (o agregué localhost)
- [ ] Recargué la extensión (↻)
- [ ] Recargué mi app (F5)
- [ ] Ejecuté `console.log(window.freighter)` en Console
- [ ] Vi un objeto (no undefined)
- [ ] Hice clic en "Conectar Wallet"
- [ ] Aparició popup de Freighter
- [ ] Hice clic en "Autorizar"
- [ ] ✅ ¡Wallet conectada!

---

## RESULTADO FINAL

```
Dashboard
    ↓
Ves tu dirección de wallet
    ↓
Tu perfil muestra wallet conectada
    ↓
✅ TODO FUNCIONA
```

---

## TIMEOUTS (TIEMPOS MÁXIMOS)

| Acción | Tiempo |
|--------|--------|
| Recarga extensión | 5 seg |
| Recarga página | 5 seg |
| console.log(window.freighter) | Inmediato |
| Popup de Freighter | 2 seg |
| Autorización | Hasta que hagas clic |

---

## ERRORES COMUNES

### ❌ "Freighter no está instalado"
**Solución:** Tienes permisos mal configurados
- Ve a `chrome://extensions/`
- Recarga Freighter (↻)
- Recarga tu app (F5)

### ❌ "undefined" en console.log
**Solución:** Permisos no están aplicados
- Repite PASO 1 (permisos)
- Asegúrate de cambiar a "En todos los sitios"
- Recarga extensión y página

### ❌ Popup no aparece
**Solución:** DevTools interfiere
- Cierra DevTools (presiona F12 de nuevo para cerrar)
- Intenta de nuevo

### ❌ "User denied"
**Solución:** Rechazaste el popup
- Solo haz clic en "Permitir" o "Autorizar" en el próximo popup
- Si lo rechazaste de nuevo, intenta en modo Incógnito

---

## MODO INCÓGNITO (Si nada funciona)

```
Presiona Ctrl+Shift+N
    ↓
Ve a http://localhost:5173
    ↓
¿Funciona aquí?
    ✅ SÍ → Hay conflicto con otra extensión
    ❌ NO → Problema con Freighter
```

---

## RESUMEN

**Todo lo que haces es darle PERMISOS a Freighter para localhost:5173.**

Es como decirle a la extensión: "Sí, puedes acceder a esta página local."

Una vez que hagas eso, todo funciona automáticamente. ✨

---

**¿Necesitas más help? Lee los archivos en este orden:**
1. **COMIENZA_AQUI.md** (este es un buen inicio rápido)
2. **CONFIGURAR_FREIGHTER_COMPLETO.md** (instrucciones detalladas)
3. **TEST_FREIGHTER_RAPIDO.md** (si necesitas verificar algo)
