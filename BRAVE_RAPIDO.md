# 🦁 BRAVE - SOLUCIÓN RÁPIDA

## ¡AH! ¡ESTÁS EN BRAVE!

**Eso explica TODO.**

Brave es **MUCHO más restrictivo** que Chrome.

---

## CONFIGURACIÓN BRAVE (5 MINUTOS)

### 1. Abre Configuración
```
brave://settings/extensions
```

### 2. Busca Freighter y abre Detalles

### 3. CAMBIOS IMPORTANTES:

**"Acceso a sitios":**
- Cambia de "En sitios especificados" a **"En todos los sitios"**

**"Administrar permisos en sitios":**
- Agrega: `http://localhost:5173`
- Agrega: `http://localhost`

**Escudos de Brave:**
- Ve a tu app
- Haz clic en el escudo 🛡️ en la barra de direcciones
- Desbloquea todo lo que veas

### 4. Recarga Todo
- Recarga Freighter (↻ en brave://extensions)
- Recarga tu app (F5)

### 5. Test
```javascript
console.log(window.freighter)
```

**Debe mostrar un objeto, no `undefined`**

---

## SI BRAVE SIGUE BLOQUEANDO

1. Ve a: `brave://settings/privacy`
2. Desactiva temporalmente:
   - Bloqueador de anuncios
   - Bloqueador de rastreadores
   - Otras protecciones
3. Recarga tu app (F5)
4. Test nuevamente

---

## SI AÚN NO FUNCIONA EN BRAVE

**Prueba en Chrome puro** para confirmar:
1. Descarga Chrome desde https://www.google.com/chrome
2. Instala Freighter en Chrome
3. Ve a tu app en Chrome
4. Test: `console.log(window.freighter)`
5. ¿Funciona en Chrome?
   - ✅ SÍ → Brave es muy restrictivo, usa Chrome
   - ❌ NO → El problema es de otra cosa

---

## LEE ESTO:

`BRAVE_CONFIGURACION.md` - Guía completa para Brave

---

**¡Esto debería resolver todo!** 🎉

Brave necesita permisos más explícitos que Chrome.
