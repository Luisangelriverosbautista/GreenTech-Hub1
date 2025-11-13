# 🧪 Testing Guide - Separación de Datos por Rol

## Estado: ✅ Build Exitoso - Listo para Browser Testing

**Compilación**: 7.54s sin errores  
**Build Date**: Hoy  
**Status**: READY

---

## 📋 Pre-Testing Checklist

- [ ] Hard refresh del navegador: **Ctrl+Shift+R** (Windows)
- [ ] Borrar cache si es necesario: **Ctrl+Shift+Del** → Cache
- [ ] Abrir Console de Developer: **F12**
- [ ] Pestaña Network abierta para ver requests
- [ ] Tener dos usuarios de prueba listos:
  - Usuario con rol "donor"
  - Usuario con rol "creator"

---

## 🧬 Test 1: DONOR DASHBOARD

### Paso 1: Login como Donor

```
1. Abrir app en localhost
2. Login con usuario que tenga rol "donor"
3. Navegar a /dashboard
```

### Paso 2: Verificar Estructura

**Esperado en pantalla**:
```
┌─────────────────────────────────────────────────────┐
│ DASHBOARD - PERFIL DONADOR                          │
│                                                     │
│ [Stats Cards]                                       │
│ ┌────────┬────────┬────────┬────────────────────┐  │
│ │Proyectos│ Wallet │ Donaciones│ Transacciones │  │
│ │Visitados│Balance │ Realizadas│ Confirmadas  │  │
│ └────────┴────────┴────────┴────────────────────┘  │
│                                                     │
│ Mis Donaciones Realizadas                           │
│ ═════════════════════════════════════              │
│                                                     │
│ Total Donado: XXX XLM                               │
│ Promedio por Donación: YYY XLM                      │
│ Proyectos Apoyados: Z                               │
│                                                     │
│ ┌─────────┬─────────┬─────────┬─────────┬────────┐ │
│ │Para     │Proyecto │Monto    │Status   │Fecha   │ │
│ ├─────────┼─────────┼─────────┼─────────┼────────┤ │
│ │Project 1│Project 1│100 XLM  │✅      │HH:MM   │ │
│ │Project 2│Project 2│50 XLM   │✅      │HH:MM   │ │
│ │Project 3│Project 3│75 XLM   │✅      │HH:MM   │ │
│ └─────────┴─────────┴─────────┴─────────┴────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Test Checklist - DONOR

- [ ] **Encabezado correcto**: "Mis Donaciones Realizadas" (NO "Donaciones Recibidas")
- [ ] **Columna "Para"**: Visible (NO "De")
- [ ] **Stats correctos**:
  - [ ] "Total Donado" = suma de amounts correcta
  - [ ] "Promedio" = Total ÷ cantidad correcta
  - [ ] "Proyectos Apoyados" = cantidad de proyectos
- [ ] **Tabla visible**: Si hay donaciones, mostrarlas
- [ ] **Proyectos en tabla**: Mostrar nombre del proyecto
- [ ] **Amounts correctos**: XLM mostrado correctamente
- [ ] **Status badges**: Verde para "completed", amarillo para "pending"
- [ ] **Mensaje vacío**: Si NO hay donaciones, mostrar "No has realizado donaciones aún"
- [ ] **Responsive**: En mobile se ve bien comprimido

### Network Check - DONOR

Abrir Developer Tools → Network:
```
1. Buscar request: GET /api/my-transactions
2. Response debe ser:
   {
     "made": [
       { "from": {...}, "to": {...}, "amount": "100", ... },
       { "from": {...}, "to": {...}, "amount": "50", ... }
     ],
     "received": []  ← VACÍO para donor
   }
3. El hook debe usar "made" array
4. El componente debe renderizar con type="made"
```

### Console Check - DONOR

Abrir Developer Tools → Console:
```
❌ NO debe haber errores como:
  - "Cannot read property 'slice' of undefined"
  - "donation.amount is not a function"
  - "DonationList is not defined"
  - Type errors

✅ Debe estar limpia o solo warnings normales
```

---

## 🎨 Test 2: CREATOR DASHBOARD

### Paso 1: Logout y Login como Creator

```
1. Logout del usuario donor
2. Login con usuario que tenga rol "creator"
3. Navegar a /dashboard
```

### Paso 2: Verificar Estructura

**Esperado en pantalla**:
```
┌─────────────────────────────────────────────────────┐
│ DASHBOARD - PERFIL CREATOR                          │
│                                                     │
│ [Stats de Proyectos]                                │
│ ┌────────┬────────┬───────────┬──────────────────┐ │
│ │Proyectos│ Wallet │Total      │Proyectos         │ │
│ │Activos │Balance │Recaudado  │Completados       │ │
│ └────────┴────────┴───────────┴──────────────────┘ │
│                                                     │
│ [Mis Proyectos Grid]                                │
│ ...                                                 │
│                                                     │
│ Donaciones Recibidas                                │
│ ════════════════════════════════════               │
│                                                     │
│ Total en Donaciones: XXX XLM                        │
│ Promedio por Donación: YYY XLM                      │
│ Donaciones Recibidas: Z                             │
│                                                     │
│ ┌─────────┬─────────┬─────────┬─────────┬────────┐ │
│ │De       │Proyecto │Monto    │Status   │Fecha   │ │
│ ├─────────┼─────────┼─────────┼─────────┼────────┤ │
│ │User A   │Project A│100 XLM  │✅      │HH:MM   │ │
│ │User B   │Project A│50 XLM   │✅      │HH:MM   │ │
│ │User C   │Project B│75 XLM   │✅      │HH:MM   │ │
│ └─────────┴─────────┴─────────┴─────────┴────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Test Checklist - CREATOR

- [ ] **Encabezado correcto**: "Donaciones Recibidas" (NO "Mis Donaciones Realizadas")
- [ ] **Columna "De"**: Visible (NO "Para")
- [ ] **Sección Proyectos**: Mostrada antes de donaciones
- [ ] **Stats correctos**:
  - [ ] "Total en Donaciones" = suma de amounts recibidos
  - [ ] "Promedio por Donación" = Total ÷ cantidad
  - [ ] "Donaciones Recibidas" = cantidad de donaciones
- [ ] **Tabla visible**: Si hay donaciones recibidas
- [ ] **Nombres de donadores**: Mostrar usuario (truncado)
- [ ] **Amounts correctos**: XLM mostrado correctamente
- [ ] **Status badges**: Verde para "completed", amarillo para "pending"
- [ ] **Mensaje vacío**: Si NO hay, mostrar "Aún no tienes donaciones"
- [ ] **Responsive**: En mobile se ve bien

### Network Check - CREATOR

Abrir Developer Tools → Network:
```
1. Buscar request: GET /api/my-transactions
2. Response debe ser:
   {
     "made": [],  ← VACÍO para creator
     "received": [
       { "from": {...}, "to": {...}, "amount": "100", ... },
       { "from": {...}, "to": {...}, "amount": "50", ... }
     ]
   }
3. El hook debe usar "received" array
4. El componente debe renderizar con type="received"
```

### Console Check - CREATOR

```
❌ NO debe haber errores
✅ Debe estar limpia o solo warnings normales
```

---

## 🔄 Test 3: COMPARATIVA (Side by Side)

### En DOS navegadores diferentes

**Navegador 1**: Logged in como DONOR
**Navegador 2**: Logged in como CREATOR

Lado a lado:

```
┌─────────────────────────┬─────────────────────────┐
│    DONOR (Left)         │    CREATOR (Right)      │
├─────────────────────────┼─────────────────────────┤
│ Mis Donaciones          │ Donaciones Recibidas    │
│ Realizadas              │                         │
│                         │                         │
│ Para: Project A         │ De: User X              │
│ Monto: 100 XLM          │ Monto: 100 XLM          │
│ ✅ Datos diferentes     │ ✅ Datos diferentes     │
│ ✅ Contexto claro       │ ✅ Contexto claro       │
└─────────────────────────┴─────────────────────────┘
```

Validar:
- [ ] **Encabezados diferentes**: "Mis Donaciones..." vs "Donaciones Recibidas"
- [ ] **Columnas diferentes**: "Para" vs "De"
- [ ] **Stats diferentes**: Donor muestra totales enviados, Creator recibidos
- [ ] **Datos no duplicados**: NO son exactamente iguales

---

## 🚨 Test 4: EDGE CASES

### Caso 1: Usuario sin Donaciones (Donor)

```
Login como donor que NO ha donado
Navegar a Dashboard
```

**Esperado**:
```
Mis Donaciones Realizadas
═════════════════════════

[Mensaje en box azul]
"No has realizado donaciones aún. 
¡Encuentra un proyecto y realiza tu primera donación!"

[Tabla vacía O no visible]
```

Validar:
- [ ] Mensaje de estado vacío aparece
- [ ] NO hay tabla visible
- [ ] Stats muestran 0 o no aparecen
- [ ] NO hay errores en console

### Caso 2: Usuario sin Donaciones (Creator)

```
Login como creator que NO ha recibido donaciones
Navegar a Dashboard
```

**Esperado**:
```
Donaciones Recibidas
════════════════════

[Mensaje en box azul]
"Aún no tienes donaciones. 
¡Comparte tu proyecto con la comunidad!"

[Tabla vacía O no visible]
```

Validar:
- [ ] Mensaje de estado vacío aparece
- [ ] NO hay tabla visible
- [ ] Stats muestran 0 o no aparecen
- [ ] NO hay errores en console

### Caso 3: Error de API

```
Desactivar red (DevTools → Offline)
O
Backend está down
```

**Esperado**:
```
Mis Donaciones Realizadas
═════════════════════════

[Mensaje en box amarillo]
"No se pudieron cargar las donaciones. [Error message]"
```

Validar:
- [ ] Mensaje de error aparece
- [ ] UI no se quiebra
- [ ] NO hay valores undefined
- [ ] Console muestra error manejado

### Caso 4: Loading State

```
Con Network throttling (DevTools → Slow 3G)
```

**Esperado mientras carga**:
```
[Spinner animado]
"Cargando tus donaciones..."
```

Validar:
- [ ] Spinner aparece
- [ ] Mensaje de loading visible
- [ ] Espera la respuesta antes de renderizar tabla
- [ ] Después desaparece spinner y muestra datos

---

## 📱 Test 5: RESPONSIVE DESIGN

### Desktop (1920px)
- [ ] Tabla tiene todas las columnas
- [ ] Layout de dos columnas si aplica
- [ ] Stats en 2 filas

### Tablet (768px)
- [ ] Tabla se adapta
- [ ] Columnas no se sobrelapan
- [ ] Scroll horizontal si necesario
- [ ] Stats en 1 o 2 columnas

### Mobile (360px)
- [ ] Tabla es compacta (compact prop)
- [ ] Stack vertical
- [ ] Legible sin scroll horizontal
- [ ] Botones clickeables

---

## 💾 Test 6: DATA PERSISTENCE

### Session Refresh

```
1. Login como donor
2. Realizar donación (simular)
3. Recargar página (F5)
```

**Esperado**:
- [ ] Datos persisten después del refresh
- [ ] Estado de login mantiene
- [ ] Hook re-fetches y muestra datos actualizados
- [ ] NO hay duplicados

### Multiple Tabs

```
1. Abrir dos pestañas del dashboard (mismo usuario)
2. Hacer cambios en una pestaña
3. Verificar la otra pestaña
```

**Esperado**:
- [ ] Ambas tabs muestran datos consistentes
- [ ] Auto-refresh cada 30s aplica en ambas
- [ ] NO hay desfase entre tabs

---

## ✅ CHECKLIST FINAL DE ACEPTACIÓN

### Donor Dashboard
- [ ] Encabezado dice "Mis Donaciones Realizadas"
- [ ] Columna tabla dice "Para"
- [ ] Stats muestran totales ENVIADOS (no recibidos)
- [ ] Cada fila muestra proyecto destino
- [ ] Datos son solo del array "made"
- [ ] Promedio calculado correctamente
- [ ] Responsive en mobile
- [ ] No hay console errors

### Creator Dashboard
- [ ] Encabezado dice "Donaciones Recibidas"
- [ ] Columna tabla dice "De"
- [ ] Stats muestran totales RECIBIDOS (no enviados)
- [ ] Cada fila muestra nombre donador
- [ ] Datos son solo del array "received"
- [ ] Promedio calculado correctamente
- [ ] Responsive en mobile
- [ ] No hay console errors

### General
- [ ] Build compiló sin errores (7.54s)
- [ ] TypeScript validado
- [ ] Network requests a /api/my-transactions correctas
- [ ] Datos separados correctamente en respuesta
- [ ] Hook separa made/received correctamente
- [ ] Componente renderiza según type prop
- [ ] Edge cases manejados (sin datos, errores, loading)

---

## 🔍 Si Algo Falla

### Síntoma: "Mismo contenido en ambos dashboards"

**Diagnóstico**:
1. Abrir DevTools → Network
2. Buscar GET `/api/my-transactions`
3. Ver si response tiene `{made: [], received: []}`

**Soluciones**:
- [ ] Backend está devolviendo arrays separados? ✅
- [ ] Hook está usando ambos arrays? ✅
- [ ] Dashboard está pasando tipo correcto a componente? ✅
- [ ] type prop en DonationList está siendo usado? ✅

### Síntoma: "TypeScript errors en build"

**Verificar**:
```bash
cd frontend
npm run build
```
- [ ] Should show: `built in 7.54s`
- [ ] NOT show: `error TS****`

Si hay error:
- [ ] Verificar interfaz Donation tiene `amount: string`
- [ ] Verificar parseFloat usage en DonationList
- [ ] Verificar imports de useDonationsByRole

### Síntoma: "Console errors sobre undefined"

```
❌ "Cannot read property 'toFixed' of undefined"
```

**Fix**: 
- Verificar que `parseFloat(donation.amount || '0')` está usado

```
❌ "useDonationsByRole is not a function"
```

**Fix**:
- Verificar que `frontend/src/hooks/useDonationsByRole.ts` existe
- Verificar import en Dashboard.tsx

---

## 📊 Testing Report Template

Cuando completes los tests, copia esto:

```markdown
# ✅ Testing Complete

## Donor Dashboard
- [x] Encabezado correcto
- [x] Datos mostrados correctamente
- [x] Stats calculados bien
- [x] No hay errores

## Creator Dashboard
- [x] Encabezado correcto
- [x] Datos mostrados correctamente
- [x] Stats calculados bien
- [x] No hay errores

## Network
- [x] /api/my-transactions devuelve datos separados
- [x] Hook usando made/received correctamente

## Responsive
- [x] Desktop OK
- [x] Tablet OK
- [x] Mobile OK

## Status: ✅ ACEPTADO
```

---

**Cuando completes todos los tests, avísame para documentar el resultado final.**
