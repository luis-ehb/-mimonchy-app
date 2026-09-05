import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Address, FulfillmentMode } from '@/context/fulfillment-context';

type FulfillmentToggleProps = {
  fulfillment: FulfillmentMode;
  currentAddress: Address;
  onSelect: (mode: FulfillmentMode) => void;
  onOpenAddressModal: () => void;
};

/** Barra Delivery/Pickup del carrito, con la dirección activa bajo "Delivery". */
export function FulfillmentToggle({
  fulfillment,
  currentAddress,
  onSelect,
  onOpenAddressModal,
}: FulfillmentToggleProps) {
  const theme = useTheme();
  const isDelivery = fulfillment === 'delivery';
  const isPickup = fulfillment === 'pickup';

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onSelect('delivery')}
        style={[styles.button, { backgroundColor: isDelivery ? theme.accent : theme.backgroundElement }]}>
        <View style={styles.top}>
          <ThemedText style={styles.icon}>🛵</ThemedText>
          <ThemedText type="smallBold" style={isDelivery ? styles.textActive : undefined} themeColor={isDelivery ? undefined : 'textSecondary'}>
            Delivery
          </ThemedText>
        </View>

        {isDelivery ? (
          <Pressable onPress={onOpenAddressModal} hitSlop={8}>
            <ThemedText type="small" style={styles.textActive}>
              {currentAddress.label} ⌄
            </ThemedText>
          </Pressable>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            {currentAddress.label}
          </ThemedText>
        )}
      </Pressable>

      <Pressable
        onPress={() => onSelect('pickup')}
        style={[styles.button, { backgroundColor: isPickup ? theme.accent : theme.backgroundElement }]}>
        <View style={styles.top}>
          <ThemedText style={styles.icon}>🏪</ThemedText>
          <ThemedText type="smallBold" style={isPickup ? styles.textActive : undefined} themeColor={isPickup ? undefined : 'textSecondary'}>
            Pickup
          </ThemedText>
        </View>
        <ThemedText type="small" style={isPickup ? styles.textActive : undefined} themeColor={isPickup ? undefined : 'textSecondary'}>
          Retirar en el local
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  button: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  icon: {
    fontSize: 16,
  },
  textActive: {
    color: '#FAF3E7',
  },
});
