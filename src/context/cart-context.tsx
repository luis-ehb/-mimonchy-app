import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { extraPriceForSize, type MenuExtra, type MenuItem, type PizzaSize } from '@/constants/mock-data';

export type CartLine = {
  key: string;
  item: MenuItem;
  quantity: number;
  notes?: string;
  extras?: MenuExtra[];
  size?: PizzaSize;
  /** Precio unitario ya calculado (base según tamaño + adicionales) al momento de agregar. */
  unitPrice: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (
    item: MenuItem,
    quantity?: number,
    notes?: string,
    extras?: MenuExtra[],
    size?: PizzaSize,
  ) => void;
  decrementItem: (itemId: string, notes?: string, extras?: MenuExtra[], size?: PizzaSize) => void;
  /**
   * Reemplaza una línea existente (identificada por su `key` actual) con
   * nuevos datos — se usa al editar un producto ya agregado desde el carrito
   * (cambiar tamaño, adicionales, notas o cantidad). Si los nuevos datos
   * generan una `key` que ya coincide con otra línea del carrito, se fusionan
   * sumando cantidades en vez de dejar dos líneas iguales.
   */
  replaceLine: (
    oldKey: string,
    item: MenuItem,
    quantity: number,
    notes?: string,
    extras?: MenuExtra[],
    size?: PizzaSize,
  ) => void;
  removeLine: (key: string) => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Dos líneas son "la misma" solo si coinciden producto + tamaño + notas + el
// mismo conjunto exacto de adicionales (por eso se ordenan los ids: el orden
// en que se marcaron no debería crear una línea distinta).
function buildLineKey(itemId: string, notes?: string, extras?: MenuExtra[], size?: PizzaSize) {
  const extrasKey = (extras ?? [])
    .map((extra) => extra.id)
    .sort()
    .join(',');
  return `${itemId}::${size ?? ''}::${notes ?? ''}::${extrasKey}`;
}

function computeUnitPrice(item: MenuItem, extras?: MenuExtra[], size?: PizzaSize) {
  const basePrice = item.isPizza && item.sizePrices && size ? item.sizePrices[size] : item.price;
  const extrasTotal = (extras ?? []).reduce((sum, extra) => sum + extraPriceForSize(extra, size), 0);
  return basePrice + extrasTotal;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addItem = (
    item: MenuItem,
    quantity = 1,
    notes?: string,
    extras?: MenuExtra[],
    size?: PizzaSize,
  ) => {
    setLines((prev) => {
      const key = buildLineKey(item.id, notes, extras, size);
      const existing = prev.find((line) => line.key === key);

      if (existing) {
        return prev.map((line) =>
          line.key === key ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }

      const unitPrice = computeUnitPrice(item, extras, size);
      return [...prev, { key, item, quantity, notes, extras, size, unitPrice }];
    });
  };

  const decrementItem = (itemId: string, notes?: string, extras?: MenuExtra[], size?: PizzaSize) => {
    setLines((prev) => {
      const key = buildLineKey(itemId, notes, extras, size);
      const existing = prev.find((line) => line.key === key);

      if (!existing) {
        return prev;
      }

      if (existing.quantity <= 1) {
        return prev.filter((line) => line.key !== key);
      }

      return prev.map((line) =>
        line.key === key ? { ...line, quantity: line.quantity - 1 } : line,
      );
    });
  };

  const removeLine = (key: string) => {
    setLines((prev) => prev.filter((line) => line.key !== key));
  };

  const replaceLine = (
    oldKey: string,
    item: MenuItem,
    quantity: number,
    notes?: string,
    extras?: MenuExtra[],
    size?: PizzaSize,
  ) => {
    setLines((prev) => {
      const withoutOld = prev.filter((line) => line.key !== oldKey);
      const newKey = buildLineKey(item.id, notes, extras, size);
      const existing = withoutOld.find((line) => line.key === newKey);

      if (existing) {
        return withoutOld.map((line) =>
          line.key === newKey ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }

      const unitPrice = computeUnitPrice(item, extras, size);
      return [...withoutOld, { key: newKey, item, quantity, notes, extras, size, unitPrice }];
    });
  };

  const totalCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);
  const totalPrice = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({ lines, addItem, decrementItem, replaceLine, removeLine, totalCount, totalPrice }),
    [lines, totalCount, totalPrice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return ctx;
}