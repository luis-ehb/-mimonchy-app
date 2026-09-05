import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type QuantityStepperProps = {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** 'sm' = botones pequeños (fila de menú/carrito), 'lg' = detalle de producto. */
  size?: 'sm' | 'lg';
};

/**
 * Stepper de cantidad (−  N  +) reutilizado en la fila de menú, la línea de
 * carrito y el detalle de producto. Antes estaba duplicado con estilos
 * ligeramente distintos en cada pantalla.
 */
export function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
  size = 'sm',
}: QuantityStepperProps) {
  const theme = useTheme();
  const buttonSize = size === 'lg' ? 32 : 28;

  return (
    <View style={[styles.row, { gap: size === 'lg' ? Spacing.three : Spacing.two }]}>
      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onDecrement();
        }}
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          { backgroundColor: theme.backgroundSelected },
        ]}>
        <ThemedText type="smallBold">−</ThemedText>
      </Pressable>
      <ThemedText type="smallBold" style={styles.value}>
        {quantity}
      </ThemedText>
      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onIncrement();
        }}
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          { backgroundColor: theme.primary },
        ]}>
        <ThemedText type="smallBold" style={styles.addText}>
          +
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 16,
    textAlign: 'center',
  },
  addText: {
    color: '#FAF3E7',
  },
});
