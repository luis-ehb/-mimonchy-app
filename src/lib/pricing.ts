/**
 * Lógica de precios del menú. Separada de los datos (mock-data.ts) y de la
 * UI, para poder testear los cálculos y reutilizarlos entre pantallas
 * (detalle de producto, carrito) sin duplicar fórmulas.
 */
import type { MenuExtra, MenuItem, PizzaSize } from '@/types/menu';

/** Precio de un adicional según el tamaño de pizza elegido. */
export function extraPriceForSize(extra: MenuExtra, size?: PizzaSize) {
  return size === 'familiar' ? extra.priceFamiliar : extra.priceSmall;
}

/** Precio base del producto: si es pizza, depende del tamaño elegido. */
export function basePriceForItem(item: MenuItem, size?: PizzaSize) {
  return item.isPizza && item.sizePrices && size ? item.sizePrices[size] : item.price;
}

/** Suma de los adicionales seleccionados, según el tamaño (si aplica). */
export function extrasTotal(extras: MenuExtra[], isPizza: boolean, size?: PizzaSize) {
  return extras.reduce((sum, extra) => sum + extraPriceForSize(extra, isPizza ? size : undefined), 0);
}

/** Precio unitario final: base + adicionales. */
export function unitPriceForItem(
  item: MenuItem,
  options: { size?: PizzaSize; extras?: MenuExtra[] } = {},
) {
  const { size, extras = [] } = options;
  return basePriceForItem(item, size) + extrasTotal(extras, Boolean(item.isPizza), size);
}

/**
 * El precio tachado (promo) de un producto solo corresponde al precio de
 * mediana, así que se muestra únicamente cuando ese es el tamaño
 * seleccionado (o si el producto no es pizza y no tiene tamaños).
 */
export function shouldShowOldPrice(item: MenuItem, size?: PizzaSize) {
  return Boolean(item.oldPrice) && (!item.isPizza || size === 'mediana');
}
