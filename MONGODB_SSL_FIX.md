# 🔧 MongoDB SSL/TLS Connection Error - SOLUTION GUIDE

## 🚨 Error Diagnosticado

```
MongoNetworkError: CC200000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
Cause: ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR
```

**Traducción**: El servidor de MongoDB rechazó la conexión por un problema SSL/TLS.

---

## 🔍 POSIBLES CAUSAS (en orden de probabilidad)

### 1. ❌ IP No está en Whitelist (MÁS PROBABLE)
- Tu IP actual no está autorizada en MongoDB Atlas
- MongoDB Atlas bloqueó la conexión por seguridad

### 2. ❌ String de Conexión Incorrecto
- MONGODB_URI está mal copiado
- Contraseña con caracteres especiales sin escapar
- Username/password incorrectos

### 3. ❌ TLS/SSL Deshabilitado
- Necesitas especificar el certificado correcto
- O deshabilitar TLS para desarrollo local

### 4. ❌ Versión de OpenSSL antigua
- Tu Node.js tiene OpenSSL viejo que no soporta TLS 1.2+

---

## ✅ SOLUCIONES (En orden - intenta una por una)

### SOLUCIÓN 1: Verificar y Agregar IP a Whitelist (RECOMENDADO)

#### Paso 1: Encontrar tu IP actual
```bash
# En PowerShell, ejecuta:
$response = Invoke-WebRequest -Uri 'https://api.ipify.org?format=json'
$ip = ($response.Content | ConvertFrom-Json).ip
Write-Host "Tu IP es: $ip"
```

O ve a: https://www.whatismyipaddress.com/

#### Paso 2: Agregar a MongoDB Atlas

1. Login a https://www.mongodb.com/cloud/atlas
2. Selecciona tu cluster
3. Haz click en **"Network Access"** (lado izquierdo)
4. Haz click en **"Add IP Address"**
5. Ingresa tu IP (del paso 1)
6. Haz click en **"Confirm"**
7. **ESPERA 1-2 MINUTOS** para que se propague

#### Paso 3: Prueba la conexión
```bash
cd backend
npm start
# Debe conectar ahora
```

---

### SOLUCIÓN 2: Usar String de Conexión Correcto

#### Verificar MONGODB_URI en tu `.env`

El formato debe ser:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Dónde obtenerlo**:
1. Ve a MongoDB Atlas → Tu Cluster
2. Haz click en **"Connect"**
3. Selecciona **"Drivers"**
4. Elige **"Node.js"**
5. Copia la connection string
6. Reemplaza `<password>` con tu contraseña
7. Reemplaza `<database>` con `greentech-hub`

**Ejemplo**:
```
MONGODB_URI=mongodb+srv://myuser:myPassword123@greentech.mongodb.net/greentech-hub?retryWrites=true&w=majority
```

⚠️ **IMPORTANTE**: Si tu contraseña tiene caracteres especiales:
- `@` → `%40`
- `:` → `%3A`
- `#` → `%23`

Ejemplo: Si contraseña es `pass@word#123`, úsala como: `pass%40word%23123`

---

### SOLUCIÓN 3: Deshabilitar SSL para Desarrollo Local

Si solo estás desarrollando localmente, puedes deshabilitar la validación SSL (NO para producción):

**Opción A**: En `.env`
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/greentech-hub?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true
```

**Opción B**: En `backend/src/index.js`
```javascript
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/greentech-hub';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  tls: false,  // ← AGREGAR ESTO
  tlsAllowInvalidCertificates: true  // ← Y ESTO
});
```

---

### SOLUCIÓN 4: Usar MongoDB Local en lugar de Atlas

Si no quieres lidiar con Atlas, usa MongoDB localmente:

#### Paso 1: Instalar MongoDB Community
- Descarga desde: https://www.mongodb.com/try/download/community
- Instala normalmente
- Arranca el servicio

#### Paso 2: Actualizar `.env`
```
MONGODB_URI=mongodb://localhost:27017/greentech-hub
SKIP_DB=false
```

#### Paso 3: Prueba
```bash
cd backend
npm start
```

---

## 🧪 PRUEBAS DE DIAGNÓSTICO

### Test 1: Verificar Conectividad de Red

```bash
# PowerShell
$cluster = "greentech"  # Reemplaza con tu cluster
$server = "$cluster.mongodb.net"
Test-NetConnection -ComputerName $server -Port 27017
```

**Esperado**: Si dice "TcpTestSucceeded: True", la red OK

### Test 2: Revisar String de Conexión

```bash
# PowerShell - Mostrar tu MONGODB_URI
$env:MONGODB_URI
```

**Debe verse como**:
```
mongodb+srv://username:password@cluster.mongodb.net/greentech-hub?retryWrites=true&w=majority
```

### Test 3: Probar Conexión Directamente

Crea un archivo `test-mongo.js`:
```javascript
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/greentech-hub';

console.log('Intentando conectar a:', uri.replace(/:[^:]*@/, ':***@'));

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  tls: false,
  tlsAllowInvalidCertificates: true
}).then(() => {
  console.log('✅ Conexión exitosa!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
```

Ejecuta:
```bash
node test-mongo.js
```

---

## 📋 CHECKLIST DE SOLUCIÓN

```
¿Intentaste?

[ ] 1. Agregar IP a MongoDB Atlas Whitelist
      └─ Esperar 1-2 minutos
      
[ ] 2. Verificar MONGODB_URI en .env
      └─ Comparar con el string correcto de Atlas
      
[ ] 3. Si contraseña tiene caracteres especiales
      └─ Escaparlos: @=%40, #=%23, etc
      
[ ] 4. Deshabilitar SSL (solo para desarrollo)
      └─ Agregar tlsAllowInvalidCertificates=true
      
[ ] 5. Usar MongoDB local en lugar de Atlas
      └─ Cambiar MONGODB_URI a mongodb://localhost:27017/greentech-hub
      
[ ] 6. Ejecutar test-mongo.js para diagnóstico
      └─ Ver si conecta directamente
```

---

## 🚀 PRÓXIMOS PASOS

### Si Solución 1 funciona (IP Whitelist):
```bash
cd backend
npm start
# Debe conectar ahora
```

### Si ninguna solución funciona:

**OPCIÓN A**: Reintentar con MongoDB local (RECOMENDADO para desarrollo)
```bash
# Instala MongoDB Community
# Luego cambia .env a:
MONGODB_URI=mongodb://localhost:27017/greentech-hub
SKIP_DB=false
```

**OPCIÓN B**: Revisar las credenciales en MongoDB Atlas
- Cambiar contraseña en Atlas
- Actualizar .env con nueva contraseña
- Volver a intentar

---

## 🔐 SEGURIDAD - IMPORTANTE

### Para Producción:
```javascript
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,  // ✅ HABILITAR
  tlsAllowInvalidCertificates: false,  // ✅ DESHABILITAR (requiere cert válido)
});
```

### Para Desarrollo Local:
```javascript
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: false,  // ✅ OK para desarrollo
  tlsAllowInvalidCertificates: true,  // ✅ OK para desarrollo
});
```

---

## 📞 SI NADA FUNCIONA

1. Verifica MongoDB Atlas Dashboard → Conectivity Issues
2. Revisa el error exacto en MongoDB Atlas
3. Prueba con MongoDB local mientras debuggeas
4. Contacta a MongoDB Support si persiste

---

## ✅ COMANDO RÁPIDO PARA EMPEZAR

Si quieres empezar rápido con MongoDB local:

```bash
# 1. Instalar MongoDB Community (una sola vez)
# Descarga de: https://www.mongodb.com/try/download/community

# 2. Actualizar .env
echo "MONGODB_URI=mongodb://localhost:27017/greentech-hub" >> .env
echo "SKIP_DB=false" >> .env

# 3. Iniciar servidor
cd backend
npm start
```

---

**Status**: 🔴 BLOCKED (conexión MongoDB)  
**Próximo paso**: Intenta Solución 1 (Agregar IP a whitelist) primero

