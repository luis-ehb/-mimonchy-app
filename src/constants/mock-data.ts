/**
 * Datos de prueba (mock) para la Fase 1 de mimonchy.
 * Restaurante ficticio usado mientras no hay un aliado real integrado.
 * Cuando se conecte Supabase, esto se reemplaza por datos reales del backend.
 */

export type MenuExtra = {
  id: string;
  name: string;
  /**
   * Precio del adicional cuando la pizza es personal o mediana.
   * Cada comercio define su propio precio (este es el de Pizzería Bella
   * Napoli); por defecto en mimonchy se sugiere $1 para este tramo.
   */
  priceSmall: number;
  /**
   * Precio del adicional cuando la pizza es familiar. Por defecto en
   * mimonchy se sugiere $1.50, pero cada comercio puede marcar el suyo.
   */
  priceFamiliar: number;
};

/** Tamaños de pizza disponibles. Solo aplica a productos con `isPizza: true`. */
export type PizzaSize = 'personal' | 'mediana' | 'familiar';

export const PIZZA_SIZES: PizzaSize[] = ['personal', 'mediana', 'familiar'];

export const PIZZA_SIZE_LABELS: Record<PizzaSize, string> = {
  personal: 'Personal',
  mediana: 'Mediana',
  familiar: 'Familiar',
};

/** Precio de un adicional según el tamaño de pizza elegido. */
export function extraPriceForSize(extra: MenuExtra, size?: PizzaSize) {
  return size === 'familiar' ? extra.priceFamiliar : extra.priceSmall;
}

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  /** Emoji usado como placeholder de foto mientras no hay fotos reales del producto. */
  emoji?: string;
  /**
   * Adicionales que el comercio ofrece para este producto (ej. extra queso).
   * Cada comercio define los suyos — esta lista es la del restaurante de
   * prueba; cuando haya multi-comercio (Fase 2), cada uno tendrá la propia.
   */
  extras?: MenuExtra[];
  /**
   * Marca este producto como pizza: internamente le indica a la app que debe
   * mostrar el selector de tamaño (Personal/Mediana/Familiar) en el detalle.
   * Se activa por producto: hoy Pizzería Bella Napoli es 100% pizzería, pero
   * en multi-comercio (Fase 2) cada producto de cada comercio marcará el suyo.
   */
  isPizza?: boolean;
  /**
   * Precio de este producto según el tamaño, cuando `isPizza` es true.
   * `price` (arriba) se mantiene igual al precio de la mediana, para no
   * romper las pantallas que todavía muestran un precio único (ej. listado).
   */
  sizePrices?: Record<PizzaSize, number>;
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type Fulfillment = 'delivery' | 'pickup' | 'delivery_pickup';

/** Rubro del comercio. Hoy solo existe 'pizzeria'; se amplía en Fase 2 (multi-comercio). */
export type RestaurantType = 'pizzeria';

export const testRestaurant = {
  name: 'Pizzería Bella Napoli',
  type: 'pizzeria' as RestaurantType,
  tagline: 'Pizza artesanal al horno de leña',
  rating: 4.8,
  distance: '850 m',
  isOpen: true,
  openUntil: '10:00 PM',
  deliveryTime: '30-40 min',
  phone: '+58 412-123 4567',
  instagram: '@bellanapoli.ve',
  whatsapp: '+58 412-123 4567',
  fulfillment: 'delivery_pickup' as Fulfillment,
};

// Adicionales del restaurante de prueba. Precio según el tramo de tamaño:
// personal/mediana $1, familiar $1.50 (a definir por cada comercio en
// Fase 2 — este set y estos precios son solo los de Pizzería Bella Napoli).
const PIZZA_EXTRAS: MenuExtra[] = [
  { id: 'extra-queso', name: 'Extra queso', priceSmall: 1, priceFamiliar: 1.5 },
  { id: 'extra-pepperoni', name: 'Extra pepperoni', priceSmall: 1, priceFamiliar: 1.5 },
  { id: 'aceitunas', name: 'Aceitunas', priceSmall: 1, priceFamiliar: 1.5 },
  { id: 'champinones', name: 'Champiñones', priceSmall: 1, priceFamiliar: 1.5 },
];

export const menu: MenuCategory[] = [
  {
    id: 'clasicas',
    title: 'Clásicas',
    items: [
      {
        id: '1',
        name: 'Margarita',
        description: 'Salsa de tomate, mozzarella fresca, albahaca',
        price: 8,
        emoji: '🍕',
        extras: PIZZA_EXTRAS,
        isPizza: true,
        sizePrices: { personal: 5, mediana: 8, familiar: 12 },
      },
      {
        id: '2',
        name: 'Pepperoni',
        description: 'Salsa de tomate, mozzarella, pepperoni',
        price: 9,
        oldPrice: 11,
        emoji: '🍕',
        extras: PIZZA_EXTRAS,
        isPizza: true,
        sizePrices: { personal: 6, mediana: 9, familiar: 13 },
      },
      {
        id: '3',
        name: 'Hawaiana',
        description: 'Jamón, piña, mozzarella',
        price: 9,
        emoji: '🍕',
        extras: PIZZA_EXTRAS,
        isPizza: true,
        sizePrices: { personal: 6, mediana: 9, familiar: 13 },
      },
    ],
  },
  {
    id: 'especiales',
    title: 'Especiales de la casa',
    items: [
      {
        id: '4',
        name: 'Cuatro Quesos',
        description: 'Mozzarella, gorgonzola, parmesano, provolone',
        price: 11,
        emoji: '🍕',
        extras: PIZZA_EXTRAS,
        isPizza: true,
        sizePrices: { personal: 7, mediana: 11, familiar: 16 },
      },
      {
        id: '5',
        name: 'Bella Napoli',
        description: 'Prosciutto, rúgula, tomates cherry, parmesano',
        price: 13,
        emoji: '🍕',
        extras: PIZZA_EXTRAS,
        isPizza: true,
        sizePrices: { personal: 9, mediana: 13, familiar: 18 },
      },
    ],
  },
  {
    id: 'bebidas',
    title: 'Bebidas',
    items: [
      {
        id: '6',
        name: 'Nestea',
        description: 'Té helado, 500ml',
        price: 2,
        emoji: '🧃',
      },
      {
        id: '7',
        name: 'Cerveza',
        description: 'Cerveza nacional, 355ml',
        price: 2.5,
        emoji: '🍺',
      },
      {
        id: '8',
        name: 'Refresco 2lt',
        description: 'Refresco familiar, 2 litros',
        price: 3.5,
        emoji: '🥤',
      },
    ],
  },
];