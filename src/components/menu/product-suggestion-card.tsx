import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MenuItem } from '@/types/menu';

type ProductSuggestionCardProps = {
  item: MenuItem;
  onPress: () => void;
  /** Emoji de respaldo si el producto no tiene uno propio. */
  fallbackEmoji?: string;
};

/**
 * Tarjeta pequeña usada en los carruseles de sugerencias ("¿Algo para
 * tomar?" en el detalle de producto, "¿Último antojo?" en el carrito).
 * Antes estaba duplicada casi idéntica en ambas pantallas.
 */
export function ProductSuggestionCard({ item, onPress, fallbackEmoji = '🥤' }: ProductSuggestionCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundSelected }]}>
        <ThemedText style={styles.emoji}>{item.emoji ?? fallbackEmoji}</ThemedText>
      </View>
      <ThemedText type="small" numberOfLines={1} style={styles.name}>
        {item.name}
      </ThemedText>
      <View style={styles.footer}>
        <ThemedText type="smallBold" themeColor="primary">
          ${item.price.toFixed(2)}
        </ThemedText>
        <Pressable onPress={onPress} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={styles.addText}>
            +
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 128,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  imagePlaceholder: {
    height: 72,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    marginTop: Spacing.half,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.half,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#FAF3E7',
    fontSize: 14,
    lineHeight: 16,
  },
});
