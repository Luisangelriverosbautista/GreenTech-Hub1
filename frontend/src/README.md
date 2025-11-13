# Estructura del Frontend

## Carpetas

```
src/
├── components/     # Componentes reutilizables
├── contexts/      # Context API providers
├── hooks/         # Custom hooks
├── pages/         # Componentes de página/ruta
├── services/      # Servicios de API
├── types/         # TypeScript interfaces/types
├── utils/         # Funciones utilitarias
└── router/        # Configuración de rutas
```

## Convenciones

### Nombres de Archivo
- Componentes: PascalCase (ej: `Button.tsx`)
- Hooks: camelCase con prefix use (ej: `useAuth.ts`)
- Servicios: camelCase con suffix service (ej: `auth.service.ts`)
- Contextos: PascalCase con suffix Context/Provider (ej: `AuthContext.tsx`)
- Types: camelCase (ej: `types.ts`, `auth.types.ts`)

### Imports
- Usar imports absolutos cuando sea posible (`@/components/Button` en lugar de `../../components/Button`)
- Ordenar imports: React, externos, internos, estilos

### TypeScript
- No usar `any`
- Interfaces sobre types cuando sea posible
- Exportar tipos desde `types/index.ts`

### Context/Hooks
- Un Provider por contexto
- Hooks simples y con propósito único
- useCallback para funciones en deps
- useMemo para cálculos costosos

### Componentes
- Props tipadas con interfaces
- Destructuring de props
- memo() para optimización cuando sea necesario
- Evitar props drilling - usar Context