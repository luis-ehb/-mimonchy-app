import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuantityStepper } from '@/components/quantity-stepper';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PIZZA_SIZE_LABELS } from '@/types/menu';
import type { CartLine } from '@/context/cart-context';

type CartLineCardProps = {
  line: CartLine;
  onPress: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
};

/** Fila de producto dentro del carrito, con detalle de tamaño/adicionales/notas y stepper. */
export function CartLineCard({ line, onPress, onDecrement, onIncrement }: CartLineCardProps) {
  const theme = useTheme();

  const details = [
    line.size ? PIZZA_SIZE_LABELS[line.size] : null,
    line.extras && line.extras.length > 0
      ? `Adicionales: ${line.extras.map((extra) => extra.name).join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable disabled={!line.item.isPizza} onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.emoji}>{line.item.emoji ?? '🍕'}</ThemedText>
        </View>

        <View style={styles.info}>
          <ThemedText type="smallBold">{line.item.name}</ThemedText>
          {details.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {details}
            </ThemedText>
          )}
          {line.notes && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {line.notes}
            </ThemedText>
          )}
          <ThemedText type="smallBold" themeColor="primary" style={styles.subtotal}>
            ${(line.unitPrice * line.quantity).toFixed(2)}
          </ThemedText>
          {line.item.isPizza && (
            <ThemedText type="small" themeColor="primary" style={styles.editHint}>
              Toca para editar
            </ThemedText>
          )}
        </View>

        <QuantityStepper quantity={line.quantity} onDecrement={onDecrement} onIncrement={onIncrement} />
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
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  subtotal: {
    marginTop: Spacing.half,
  },
  editHint: {
    marginTop: Spacing.half,
    fontSize: 11,
  },
});
