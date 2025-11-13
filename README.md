# 🪴 GreenTech Hub: Comunidad Digital de Innovación Sostenible

Una plataforma blockchain para impulsar y reconocer iniciativas sostenibles usando Stellar y Soroban.

## 🎯 Objetivos

1. Crear una plataforma en línea para difundir iniciativas sostenibles
2. Desarrollar artículos, podcasts y videos educativos sobre tecnología verde
3. Implementar un sistema de insignias (badges) usando contratos inteligentes en Soroban

## 🚀 Tecnologías

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Blockchain: Stellar (Testnet) + Soroban
- Smart Contracts: Rust
- Wallet: Freighter

## 📦 Estructura del Proyecto

```
GreenTech-Hub1/
├── backend/         # Servidor Express + integración Stellar/Soroban
├── contracts/       # Contratos inteligentes en Soroban/Rust
└── frontend/        # Aplicación React + Vite
```

## 🛠 Instalación

### Prerequisitos

1. Node.js v16 o superior
2. Rust y cargo
3. Soroban CLI
4. Freighter Wallet (extensión del navegador)

### Configuración

1. Clonar el repositorio
```bash
git clone <repository-url>
cd GreenTech-Hub1
```

2. Instalar dependencias del backend
```bash
cd backend
npm install
```

3. Instalar dependencias del frontend
```bash
cd ../frontend
npm install
```

4. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus claves de Stellar
```

5. Compilar y desplegar el contrato Soroban
```bash
cd ../contracts/insignia
cargo build --target wasm32-unknown-unknown --release
```

## 🚀 Uso

1. Iniciar el backend
```bash
cd backend
npm run dev
```

2. Iniciar el frontend
```bash
cd frontend
npm run dev
```

3. Abrir http://localhost:5173 en tu navegador

## 🔑 Configuración de Stellar

1. Crear cuenta de prueba en [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Guardar las claves en el archivo .env
3. Obtener fondos de prueba del [Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

## 📝 Licencia

MIT

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios que te gustaría hacer.