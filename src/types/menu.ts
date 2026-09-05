/**
 * Tipos del dominio "menú" de mimonchy.
 * Separados de los datos (mock-data.ts) para que cuando se conecte el
 * backend real (Supabase), solo cambien los datos y no los tipos.
 */

/** Tamaños de pizza disponibles. Solo aplica a productos con `isPizza: true`. */
export type PizzaSize = 'personal' | 'mediana' | 'familiar';

export const PIZZA_SIZES: PizzaSize[] = ['personal', 'mediana', 'familiar'];

export const PIZZA_SIZE_LABELS: Record<PizzaSize, string> = {
  personal: 'Personal',
  mediana: 'Mediana',
  familiar: 'Familiar',
};

export type MenuExtra = {
  id: string;
  name: string;
  /**
   * Precio del adicional cuando la pizza es personal o mediana.
   * Cada comercio define su propio precio; por defecto en mimonchy se
   * sugiere $1 para este tramo.
   */
  priceSmall: number;
  /**
   * Precio del adicional cuando la pizza es familiar. Por defecto en
   * mimonchy se sugiere $1.50, pero cada comercio puede marcar el suyo.
   */
  priceFamiliar: number;
};

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
   * Cada comercio define los suyos; cuando haya multi-comercio (Fase 2),
   * cada uno tendrá la propia lista.
   */
  extras?: MenuExtra[];
  /**
   * Marca este producto como pizza: indica que se debe mostrar el selector
   * de tamaño (Personal/Mediana/Familiar) en el detalle. Se activa por
   * producto: hoy Pizzería Bella Napoli es 100% pizzería, pero en
   * multi-comercio (Fase 2) cada producto de cada comercio marcará el suyo.
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

export type Restaurant = {
  name: string;
  type: RestaurantType;
  tagline: string;
  rating: number;
  distance: string;
  isOpen: boolean;
  openUntil: string;
  deliveryTime: string;
  phone: string;
  instagram: string;
  whatsapp: string;
  fulfillment: Fulfillment;
};
