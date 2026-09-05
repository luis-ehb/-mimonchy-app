import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useFulfillment } from '@/context/fulfillment-context';
import { useTheme } from '@/hooks/use-theme';

function LoadingRing({ color }: { color: string }) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.loadingRing,
        {
          borderColor: 'rgba(250, 243, 231, 0.25)',
          borderTopColor: color,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
}

/**
 * Modal "Elige la dirección de entrega" + overlay de carga simulada
 * (Seleccionando/Configurando/Cambiando dirección). Se monta una sola vez a
 * nivel global (ver `_layout.tsx`) y se controla desde cualquier pantalla a
 * través de `useFulfillment()`, así el estado de Delivery/Pickup y la
 * dirección activa son consistentes entre la pantalla principal y el carrito.
 */
export function FulfillmentOverlays() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addresses, currentAddress, showAddressModal, loadingOverlay, closeAddressModal, selectAddress } =
    useFulfillment();

  return (
    <>
      <Modal
        visible={showAddressModal}
        transparent
        animationType="slide"
        onRequestClose={closeAddressModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeAddressModal} />
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.four },
          ]}>
          <View style={[styles.modalHandle, { backgroundColor: theme.backgroundSelected }]} />
          <ThemedText type="subtitle" style={styles.modalTitle}>
            Elige la dirección de entrega
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.modalSubtitle}>
            Las opciones y precio del delivery pueden variar según la dirección de entrega.
          </ThemedText>

          <View style={styles.modalAddressList}>
            {addresses.map((address) => {
              const isCurrent = address.id === currentAddress.id;
              return (
                <Pressable
                  key={address.id}
                  onPress={() => selectAddress(address.id)}
                  style={[
                    styles.addressCard,
                    {
                      backgroundColor: isCurrent ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: isCurrent ? theme.primary : 'transparent',
                    },
                  ]}>
                  <View style={styles.addressCardHeader}>
                    <ThemedText type="smallBold">📍 {address.label.toUpperCase()}</ThemedText>
                    {isCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: theme.primary }]}>
                        <ThemedText type="small" style={styles.currentBadgeText}>
                          ✓ Actual
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {address.addressLine}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Pendiente: todavía no hay pantalla de gestión de direcciones — este
              botón queda listo visualmente para cuando se construya ese flujo. */}
          <Pressable style={[styles.editAddressesButton, { borderColor: theme.primary }]}>
            <ThemedText type="smallBold" themeColor="primary">
              EDITAR TUS DIRECCIONES
            </ThemedText>
          </Pressable>
        </View>
      </Modal>

      {loadingOverlay && (
        <View style={styles.overlayBackdrop}>
          <View style={styles.overlayCenter}>
            <View style={styles.loadingOrbWrapper}>
              <LoadingRing color={theme.accent} />
              <View style={[styles.loadingOrb, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.loadingOrbIcon}>{loadingOverlay.icon}</ThemedText>
              </View>
            </View>
            <ThemedText type="smallBold" style={styles.overlayText}>
              {loadingOverlay.message}
            </ThemedText>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 35, 32, 0.55)',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Spacing.five,
    borderTopRightRadius: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: Spacing.half,
    alignSelf: 'center',
    marginBottom: Spacing.two,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.two,
  },
  modalAddressList: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  addressCard: {
    borderRadius: Spacing.three,
    borderWidth: 2,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  currentBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.five,
  },
  currentBadgeText: {
    color: '#FAF3E7',
    fontSize: 11,
    fontWeight: '700',
  },
  editAddressesButton: {
    marginTop: Spacing.two,
    height: 52,
    borderRadius: Spacing.five,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(43, 35, 32, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    elevation: 50,
  },
  overlayCenter: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingOrbWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
  },
  loadingOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOrbIcon: {
    fontSize: 30,
  },
  overlayText: {
    color: '#FAF3E7',
  },
});
