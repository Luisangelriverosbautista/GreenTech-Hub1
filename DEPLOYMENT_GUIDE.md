# Guía de Deployment - GreenTech Hub

## 📋 Resumen del Proyecto

- **Frontend**: React + TypeScript + Vite (Vercel)
- **Backend**: Node.js + Express (Render, Railway o similar)
- **Base de datos**: MongoDB Atlas (Cloud)
- **Autenticación**: JWT
- **Blockchain**: Stellar/Soroban

---

## 🚀 Paso 1: Desplegar Frontend en Vercel

### Requisitos:
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub (ya está sincronizado)

### Pasos:

1. **Ir a Vercel Dashboard**
   - URL: https://vercel.com/dashboard

2. **Crear nuevo proyecto**
   - Click en "Add New..." → "Project"
   - Selecciona `GreenTech-Hub1`

3. **Configurar proyecto**
   - **Project Name**: `greentech-hub` (o tu preferencia)
   - **Framework**: Vite
   - **Root Directory**: `frontend`

4. **Build Settings** (deben estar así):
   ```
   Build Command: cd frontend && npm run build
   Output Directory: frontend/dist
   Install Command: npm install
   ```

5. **Environment Variables**
   - Agrega una variable:
     - **Name**: `VITE_API_URL`
     - **Value**: (dejar vacío por ahora, lo cambiaremos después)

6. **Deploy**
   - Click en "Deploy"
   - Espera 2-5 minutos
   - Verá una URL tipo: `https://greentech-hub-xxx.vercel.app`

### ✅ Frontend estará listo en Vercel

---

## 🗄️ Paso 2: Configurar MongoDB Atlas

### Requisitos:
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Pasos:

1. **Ir a MongoDB Atlas**
   - URL: https://account.mongodb.com/account/login

2. **Crear/Seleccionar Cluster**
   - Si no tienes cluster, crea uno (gratis)
   - Nombre recomendado: `greentech-hub`

3. **Obtener Connection String**
   - Click en "Connect"
   - Selecciona "Connect your application"
   - Elige "Node.js" como driver
   - Copia la cadena de conexión (algo como):
     ```
     mongodb+srv://username:password@cluster.mongodb.net/greentech-hub?retryWrites=true&w=majority
     ```

4. **Crear usuario de base de datos**
   - Username: `greentech_user`
   - Password: (genera uno seguro)
   - Reemplaza `username:password` en la cadena de conexión

5. **Whitelist IPs**
   - Ve a "Network Access"
   - Click en "Add IP Address"
   - Selecciona "Allow access from anywhere" (0.0.0.0/0) para desarrollo
   - O agrega IPs específicas después

6. **Copia la Connection String**
   - Deberá verse así:
     ```
     mongodb+srv://greentech_user:TuContraseña@cluster.mongodb.net/greentech-hub?retryWrites=true&w=majority
     ```

---

## 🖥️ Paso 3: Desplegar Backend en Render

### Requisitos:
- Cuenta en [Render](https://render.com)

### Pasos:

1. **Ir a Render Dashboard**
   - URL: https://dashboard.render.com

2. **Crear nuevo servicio**
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio GitHub
   - Selecciona `GreenTech-Hub1`

3. **Configurar servicio**
   - **Name**: `greentech-hub-backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Region**: Elige la más cercana

4. **Environment Variables**
   - Agrega las siguientes:
     
     | Variable | Valor |
     |----------|-------|
     | `MONGODB_URI` | `mongodb+srv://greentech_user:TuContraseña@cluster.mongodb.net/greentech-hub?retryWrites=true&w=majority` |
     | `PORT` | `3001` |
     | `NODE_ENV` | `production` |
     | `JWT_SECRET` | Genera uno seguro (ej: `your-secret-key-here-min-32-chars`) |
     | `CORS_ORIGINS` | `https://greentech-hub-xxx.vercel.app` (reemplaza xxx) |
     | `FRONTEND_URL` | `https://greentech-hub-xxx.vercel.app` |

5. **Deploy**
   - Click en "Create Web Service"
   - Render comenzará a hacer deploy automáticamente
   - Espera 5-10 minutos
   - Te dará una URL tipo: `https://greentech-hub-backend.onrender.com`

---

## 🔗 Paso 4: Conectar Frontend con Backend

### En Vercel Dashboard:

1. **Ve a tu proyecto en Vercel**
2. **Settings** → **Environment Variables**
3. **Edita** `VITE_API_URL`
   - **Nuevo valor**: `https://greentech-hub-backend.onrender.com/api` (reemplaza con tu URL de Render)
4. **Redeploy**
   - Verá dice "Redeploying..." automáticamente

---

## ✅ Checklist Final

- [ ] Frontend deployado en Vercel (puedes acceder a la URL)
- [ ] Backend deployado en Render (verifica visitando `/api/health` si existe)
- [ ] MongoDB Atlas configurado y accesible
- [ ] CORS configurado (backend permite requests de Vercel)
- [ ] JWT_SECRET configurado en backend
- [ ] VITE_API_URL apuntando al backend en Vercel
- [ ] Base de datos inicializada con datos de prueba

---

## 🐛 Troubleshooting

### El frontend muestra "Cannot GET /api/..."
- Verifica que `VITE_API_URL` esté correctamente configurado en Vercel
- Verifica que el backend esté corriendo en Render

### MongoDB connection error
- Revisa las credenciales en `MONGODB_URI`
- Verifica que el IP esté en Network Access de Atlas
- Verifica que el cluster está activo

### CORS error en consola del navegador
- Actualiza `CORS_ORIGINS` en backend para incluir tu URL de Vercel
- Redeploy el backend después

---

## 📞 URLs Importantes

- Frontend Vercel: `https://greentech-hub-xxx.vercel.app`
- Backend Render: `https://greentech-hub-backend.onrender.com`
- MongoDB Atlas: `https://account.mongodb.com/account/login`
- GitHub Repo: `https://github.com/Luisangelriverosbautista/GreenTech-Hub1`

