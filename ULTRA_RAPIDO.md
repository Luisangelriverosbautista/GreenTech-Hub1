# ⚡ RESUMEN ULTRA-RÁPIDO

## EL PROBLEMA
```
window.freighter = undefined
```
Freighter no tiene permiso para localhost:5173

## LA SOLUCIÓN (Literalmente 5 minutos)

### 1. Clic derecho en Freighter
```
Icono Freighter arriba a la derecha
    ↓
Clic DERECHO
    ↓
"Administrar extensión"
```

### 2. Permisos
```
Busca: "Acceso a sitios" o "En sitios especificados"
    ↓
Cambia a: "En todos los sitios"
    ↓
O agrega manualmente: http://localhost:5173
```

### 3. Recarga 2 veces
```
chrome://extensions/ → Botón ↻ en Freighter → Espera 2 seg
    ↓
Tu app (localhost:5173) → Presiona F5 → Espera 2 seg
```

### 4. Verifica
```
F12 → Console → console.log(window.freighter) → Enter
    ↓
¿Ves Freighter {...}? → ✅ FUNCIONA
¿Ves undefined? → ❌ Repite pasos
```

### 5. Conecta
```
Haz clic en "Conectar Wallet"
    ↓
Autoriza en popup
    ↓
✅ ¡LISTO!
```

## ARCHIVOS A LEER

| Archivo | Usa si... |
|---------|-----------|
| **COMIENZA_AQUI.md** | Quieres empezar ahora |
| **PASOS_VISUALES_FREIGHTER.md** | Quieres pasos con diagramas |
| **CONFIGURAR_FREIGHTER_COMPLETO.md** | Necesitas detalles |
| **TEST_FREIGHTER_RAPIDO.md** | Quieres verificar con tests |

## INDICADORES

**✅ TODO CORRECTO** (ves esto):
```javascript
Freighter {
  isConnected: ƒ,
  getPublicKey: ƒ,
  signTransaction: ƒ,
  ...
}
```

**❌ REQUIERE PERMISOS** (ves esto):
```javascript
undefined
```

## TIEMPO TOTAL
⏱️ **5-10 minutos máximo**

---

**¡Eso es todo! Configura permisos y wallet conectada.** 🚀
