import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Overlay de transición tipo "cargando" (patrón tomado de la referencia QUIK:
 * círculo con anillo animado + emoji + texto de estado, ej. "Configurando
 * dirección..."). Es puramente visual/mock — no espera ninguna respuesta real
 * de backend todavía; se usa con un `setTimeout` en quien lo invoca para
 * simular el tiempo de "proceso".
 */
export function TransitionOverlay({
  visible,
  icon,
  label,
}: {
  visible: boolean;
  icon: string;
  label: string;
}) {
  const theme = useTheme();
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    spin.setValue(0);
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, spin]);

  if (!visible) return null;

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <View style={[StyleSheet.absoluteFillObject, styles.backdrop]} />
      <View style={styles.center}>
        <View style={styles.ringWrapper}>
          <View style={[styles.ringTrack, { borderColor: 'rgba(250, 243, 231, 0.35)' }]} />
          <Animated.View
            style={[
              styles.ringTrack,
              styles.ringActive,
              { borderTopColor: theme.accent, borderRightColor: theme.accent },
              { transform: [{ rotate }] },
            ]}
          />
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.icon}>{icon}</ThemedText>
          </View>
        </View>
        <ThemedText type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
}

const RING_SIZE = 96;

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  ringActive: {
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  iconCircle: {
    width: RING_SIZE - 24,
    height: RING_SIZE - 24,
    borderRadius: (RING_SIZE - 24) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  label: {
    color: '#FAF3E7',
  },
});
