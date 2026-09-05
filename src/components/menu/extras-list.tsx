import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { extraPriceForSize } from '@/lib/pricing';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MenuExtra, PizzaSize } from '@/types/menu';

type ExtrasListProps = {
  extras: MenuExtra[];
  selectedExtras: MenuExtra[];
  onToggle: (extra: MenuExtra) => void;
  /** Si el producto es pizza, el precio del adicional depende del tamaño elegido. */
  isPizza?: boolean;
  size?: PizzaSize;
};

/** Lista de checkboxes de adicionales (extra queso, aceitunas, etc.) en el detalle de producto. */
export function ExtrasList({ extras, selectedExtras, onToggle, isPizza, size }: ExtrasListProps) {
  const theme = useTheme();

  return (
    <View>
      {extras.map((extra) => {
        const isSelected = selectedExtras.some((selected) => selected.id === extra.id);
        const price = extraPriceForSize(extra, isPizza ? size : undefined);
        return (
          <Pressable
            key={extra.id}
            onPress={() => onToggle(extra)}
            style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.left}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected ? theme.primary : 'transparent',
                    borderColor: isSelected ? theme.primary : theme.textSecondary,
                  },
                ]}>
                {isSelected && <ThemedText style={styles.checkboxMark}>✓</ThemedText>}
              </View>
              <ThemedText type="small">{extra.name}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              +${price.toFixed(2)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Spacing.one,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: {
    color: '#FAF3E7',
    fontSize: 13,
    lineHeight: 15,
  },
});
