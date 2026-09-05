import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PIZZA_SIZE_LABELS, PIZZA_SIZES, type PizzaSize } from '@/types/menu';

type SizeSelectorProps = {
  selectedSize: PizzaSize;
  onSelect: (size: PizzaSize) => void;
  pricesBySize: Record<PizzaSize, number>;
};

/** Chips "Personal / Mediana / Familiar" con su precio, usado en el detalle de pizza. */
export function SizeSelector({ selectedSize, onSelect, pricesBySize }: SizeSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {PIZZA_SIZES.map((size) => {
        const active = selectedSize === size;
        return (
          <Pressable
            key={size}
            onPress={() => onSelect(size)}
            style={[styles.chip, { backgroundColor: active ? theme.primary : theme.backgroundElement }]}>
            <ThemedText
              type="smallBold"
              style={active ? styles.textActive : undefined}
              themeColor={active ? undefined : 'text'}>
              {PIZZA_SIZE_LABELS[size]}
            </ThemedText>
            <ThemedText
              type="small"
              style={active ? styles.textActive : undefined}
              themeColor={active ? undefined : 'textSecondary'}>
              ${pricesBySize[size].toFixed(2)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  textActive: {
    color: '#FAF3E7',
  },
});
