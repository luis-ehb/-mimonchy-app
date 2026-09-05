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
    │   ├── index.tsx                → Inicio: perfil del restaurante + menú (usa MenuItemCard)
    │   ├── mi-casa.tsx               → tab "Mi casa" (placeholder)
    │   ├── cupones.tsx               → tab "Cupones" (placeholder)
    │   ├── ayuda.tsx                  → tab "Ayuda" (placeholder)
    │   ├── perfil.tsx                 → tab "Perfil" (placeholder)
    │   ├── explore.tsx                → scaffold de Expo, oculto de la barra de tabs
    │   ├── cart.tsx                   → pantalla del carrito (compone componentes de components/cart)
    │   └── item/
    │       └── [id].tsx               → detalle de producto (usa SizeSelector, ExtrasList, QuantityStepper)
    │
    ├── components/                  → piezas de UI reutilizables
    │   ├── app-tabs.tsx               → barra de tabs flotante (nativo)
    │   ├── app-tabs.web.tsx           → misma barra, versión web
    │   ├── fulfillment-overlays.tsx   → modal de direcciones + overlay de carga Delivery/Pickup
    │   ├── transition-overlay.tsx     → overlay de transición (revisar propósito exacto)
    │   ├── quantity-stepper.tsx       → stepper (−  N  +) reutilizado en menú, carrito y detalle
    │   ├── themed-text.tsx / themed-view.tsx → wrappers con la paleta de mimonchy
    │   ├── animated-icon.tsx (+ .web.tsx, .module.css) → ícono animado del splash
    │   ├── external-link.tsx, hint-row.tsx, web-badge.tsx
    │   ├── menu/                       → piezas del dominio "menú"
    │   │   ├── menu-item-card.tsx        → fila de producto en Inicio
    │   │   ├── size-selector.tsx         → chips Personal/Mediana/Familiar
    │   │   ├── extras-list.tsx           → checkboxes de adicionales
    │   │   └── product-suggestion-card.tsx → tarjeta de sugerencia (bebidas/antojo)
    │   ├── cart/                        → piezas del dominio "carrito"
    │   │   ├── cart-line-card.tsx         → fila de producto dentro del carrito
    │   │   ├── fulfillment-toggle.tsx     → barra Delivery/Pickup del carrito
    │   │   └── order-summary-card.tsx     → resumen de compra (subtotal, delivery, total)
    │   └── ui/
    │       └── collapsible.tsx
    │
    ├── types/                        → tipos del dominio, sin lógica ni datos
    │   └── menu.ts                     → MenuItem, MenuExtra, PizzaSize, Fulfillment, Restaurant, etc.
    │
    ├── lib/                          → lógica de negocio pura (testeable, sin UI)
    │   └── pricing.ts                  → extraPriceForSize, unitPriceForItem, shouldShowOldPrice
    │
    ├── constants/                   → datos y configuración estática
    │   ├── mock-data.ts               → menú y restaurante de prueba (solo datos; tipos en src/types)
    │   ├── theme.ts                    → colores, spacing, fuentes
    │   └── logo.ts                     → logo en base64
    │
    ├── context/                     → estado global (React Context)
    │   ├── cart-context.tsx           → carrito: líneas, cantidades, precio total (usa lib/pricing)
    │   └── fulfillment-context.tsx    → Delivery/Pickup, direcciones guardadas
    │
    └── hooks/
        ├── use-theme.ts                → siempre tema claro (decisión del dueño del proyecto)
        ├── use-color-scheme.ts
        └── use-color-scheme.web.ts
```

## Notas sobre el estado actual (para quien lea esto por primera vez)

- **Ya se hizo el primer paso de modularización**: los tipos viven en `src/types/`, la lógica de precios en `src/lib/pricing.ts`, y la UI repetida (stepper, selector de tamaño, adicionales, tarjetas de sugerencia, fila de carrito, toggle de fulfillment, resumen de orden) se extrajo a componentes en `src/components/menu/` y `src/components/cart/`. Las pantallas en `src/app/` ahora son mayormente composición de esos componentes, no lógica mezclada con UI.
- `src/constants/mock-data.ts` ya solo contiene datos (menú, restaurante de prueba); cuando se conecte Supabase, este archivo es el que se reemplaza.
- Este archivo se actualiza cada vez que la estructura de carpetas cambie de forma significativa (no en cada commit).
