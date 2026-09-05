import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuantityStepper } from '@/components/quantity-stepper';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MenuItem } from '@/types/menu';

type MenuItemCardProps = {
  item: MenuItem;
  quantityInCart: number;
  onOpen: () => void;
  onAdd: () => void;
  onDecrement: () => void;
};

/**
 * Fila de producto en la pantalla principal (imagen, nombre, precio y
 * botón de agregar o stepper). Las pizzas siempre navegan al detalle,
 * porque necesitan elegir tamaño/adicionales antes de agregarse.
 */
export function MenuItemCard({ item, quantityInCart, onOpen, onAdd, onDecrement }: MenuItemCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onOpen}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.emoji}>{item.emoji ?? '🍕'}</ThemedText>
          {item.oldPrice && (
            <View style={[styles.promoBadge, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.promoBadgeText}>PROMO</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <ThemedText type="smallBold">{item.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {item.description}
          </ThemedText>
          <View style={styles.priceRow}>
            {item.oldPrice && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.oldPrice}>
                ${item.oldPrice.toFixed(2)}
              </ThemedText>
            )}
            <ThemedText type="smallBold" themeColor="primary">
              ${item.price.toFixed(2)}
            </ThemedText>
          </View>
        </View>

        {item.isPizza ? (
          // Las pizzas necesitan elegir tamaño/adicionales, así que el "+" lleva
          // al detalle en vez de agregar directo con un tamaño adivinado.
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={styles.addButtonText}>
              {quantityInCart > 0 ? quantityInCart : '+'}
            </ThemedText>
          </Pressable>
        ) : quantityInCart > 0 ? (
          <QuantityStepper quantity={quantityInCart} onDecrement={onDecrement} onIncrement={onAdd} />
        ) : (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold" style={styles.addButtonText}>
              +
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  promoBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  promoBadgeText: {
    color: '#FAF3E7',
    fontSize: 9,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: Spacing.half,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FAF3E7',
    fontSize: 18,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
