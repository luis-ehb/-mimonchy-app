# Estructura del proyecto — mimonchy-app

Generado a partir de un árbol de directorios real del proyecto (se excluyen `node_modules`, `.expo` y `.git`).

```
mimonchy-app/
├── AGENTS.md
├── CLAUDE.md                      → apunta a AGENTS.md
├── README.md
├── LICENSE
├── app.json                       → config de Expo (SDK 57)
├── package.json
├── package-lock.json
├── tsconfig.json
├── expo-env.d.ts
├── .gitignore
├── .claude/
│   └── settings.json
├── .vscode/
│   ├── extensions.json
│   └── settings.json
├── scripts/
│   └── reset-project.js
├── assets/
│   ├── expo.icon/
│   └── images/
│       └── tabIcons/               → íconos PNG de tabs (legacy, ya no se usan: ahora es expo-symbols)
└── src/
    ├── global.css
    ├── app/                         → RUTAS (expo-router: cada archivo = una pantalla)
    │   ├── _layout.tsx              → raíz: providers (Cart, Fulfillment) + AppTabs + overlays
    │   ├── index.tsx                → Inicio: perfil del restaurante + menú
    │   ├── mi-casa.tsx               → tab "Mi casa" (placeholder)
    │   ├── cupones.tsx               → tab "Cupones" (placeholder)
    │   ├── ayuda.tsx                  → tab "Ayuda" (placeholder)
    │   ├── perfil.tsx                 → tab "Perfil" (placeholder)
    │   ├── explore.tsx                → scaffold de Expo, oculto de la barra de tabs
    │   ├── cart.tsx                   → pantalla del carrito (fuera de la barra de tabs)
    │   └── item/
    │       └── [id].tsx               → detalle de producto (tamaño, adicionales, notas)
    │
    ├── components/                  → piezas de UI reutilizables
    │   ├── app-tabs.tsx               → barra de tabs flotante (nativo)
    │   ├── app-tabs.web.tsx           → misma barra, versión web
    │   ├── fulfillment-overlays.tsx   → modal de direcciones + overlay de carga Delivery/Pickup
    │   ├── transition-overlay.tsx     → overlay de transición (revisar propósito exacto)
    │   ├── themed-text.tsx / themed-view.tsx → wrappers con la paleta de mimonchy
    │   ├── animated-icon.tsx (+ .web.tsx, .module.css) → ícono animado del splash
    │   ├── external-link.tsx, hint-row.tsx, web-badge.tsx
    │   └── ui/
    │       └── collapsible.tsx
    │
    ├── constants/                   → datos y configuración estática
    │   ├── mock-data.ts               → menú, restaurante de prueba, tipos (MenuItem, PizzaSize, etc.)
    │   ├── theme.ts                    → colores, spacing, fuentes
    │   └── logo.ts                     → logo en base64
    │
    ├── context/                     → estado global (React Context)
    │   ├── cart-context.tsx           → carrito: líneas, cantidades, precio total
    │   └── fulfillment-context.tsx    → Delivery/Pickup, direcciones guardadas
    │
    └── hooks/
        ├── use-theme.ts                → siempre tema claro (decisión del dueño del proyecto)
        ├── use-color-scheme.ts
        └── use-color-scheme.web.ts
```

## Notas sobre el estado actual (para quien lea esto por primera vez)

- **Todo vive en `src/`**, sin separación por "feature" todavía — `constants/mock-data.ts` mezcla tipos, datos mock y lógica de precios (`extraPriceForSize`); `context/` tiene el estado de carrito y de fulfillment por separado, correctamente.
- **`src/app/`** son las rutas (expo-router) — no deberían tener lógica de negocio pesada, solo UI + llamadas a los contexts. Hoy `index.tsx`, `item/[id].tsx` y `cart.tsx` son archivos grandes que mezclan bastante UI y lógica.
- Este archivo se actualiza cada vez que la estructura de carpetas cambie de forma significativa (no en cada commit).
