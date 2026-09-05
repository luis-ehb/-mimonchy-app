import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CartLineCard } from '@/components/cart/cart-line-card';
import { FulfillmentToggle } from '@/components/cart/fulfillment-toggle';
import { OrderSummaryCard } from '@/components/cart/order-summary-card';
import { ProductSuggestionCard } from '@/components/menu/product-suggestion-card';
import { menu, testRestaurant } from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/context/cart-context';
import { useFulfillment } from '@/context/fulfillment-context';

// Mock: costo de delivery fijo mientras no exista el módulo de mapa/logística
// (Fase 3 del proyecto). Cuando eso exista, este valor se calcula por distancia real.
// No aplica en modo Pickup (el cliente retira en el local, sin costo de envío).
const MOCK_DELIVERY_FEE = 1.5;
const MOCK_SERVICE_FEE = 0;

export default function CartScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { lines, addItem, decrementItem, totalPrice } = useCart();
  const { fulfillment, currentAddress, selectFulfillment, openAddressModal } = useFulfillment();

  const isPickup = fulfillment === 'pickup';
  const deliveryFee = isPickup ? 0 : MOCK_DELIVERY_FEE;

  // Sugerencias ("¿Tienes un último antojo?"): dos opciones de bebidas +
  // el resto de comida del mismo local, ambas excluyendo lo que ya está en
  // el carrito. Patrón tomado de la referencia QUIK.
  const suggestions = useMemo(() => {
    const inCart = new Set(lines.map((line) => line.item.id));

    const bebidas = (menu.find((category) => category.id === 'bebidas')?.items ?? [])
      .filter((item) => !inCart.has(item.id))
      .slice(0, 2);

    const comida = menu
      .filter((category) => category.id !== 'bebidas')
      .flatMap((category) => category.items)
      .filter((item) => !inCart.has(item.id));

    return [...bebidas, ...comida];
  }, [lines]);

  const grandTotal = totalPrice + deliveryFee + MOCK_SERVICE_FEE;

  const summaryRows = [
    { label: 'Total Productos', value: totalPrice },
    ...(!isPickup ? [{ label: 'Total Delivery', value: deliveryFee }] : []),
    { label: 'Service Fee', value: MOCK_SERVICE_FEE },
    { label: 'Total', value: grandTotal, bold: true },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Tu carrito
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <FulfillmentToggle
        fulfillment={fulfillment}
        currentAddress={currentAddress}
        onSelect={selectFulfillment}
        onOpenAddressModal={openAddressModal}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        keyboardShouldPersistTaps="handled">
        {lines.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary }]}>
              <ThemedText style={styles.emptyIconEmoji}>🛒</ThemedText>
            </View>
            <ThemedText type="subtitle" themeColor="primary" style={styles.emptyTitle}>
              Tu carrito se siente muy vacío
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCaption}>
              ¡Explora entre nuestras opciones{'\n'}y llénalo con lo que quieras!
            </ThemedText>
            <Pressable
              onPress={() => router.push('/')}
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={styles.emptyButtonText}>
                VOLVER AL MENÚ PRINCIPAL
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.linesWrapper}>
            {lines.map((line) => (
              <CartLineCard
                key={line.key}
                line={line}
                onPress={() =>
                  router.push({
                    pathname: '/item/[id]',
                    params: {
                      id: line.item.id,
                      editKey: line.key,
                      qty: String(line.quantity),
                      notes: line.notes ?? '',
                      size: line.size ?? '',
                      extras: (line.extras ?? []).map((extra) => extra.id).join(','),
                    },
                  })
                }
                onDecrement={() => decrementItem(line.item.id, line.notes, line.extras, line.size)}
                onIncrement={() => addItem(line.item, 1, line.notes, line.extras, line.size)}
              />
            ))}
          </View>
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionsWrapper}>
            <ThemedText type="smallBold" style={styles.suggestionsTitle}>
              ¿Tienes un último antojo? 😏
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}>
              {suggestions.map((item) => (
                <ProductSuggestionCard
                  key={item.id}
                  item={item}
                  onPress={() => (item.isPizza ? router.push(`/item/${item.id}`) : addItem(item, 1))}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {lines.length > 0 && (
          <>
            {/* Tarjeta de delivery: patrón tomado de la referencia QUIK (comercio +
                método + costo + nota de distancia). El costo es un mock fijo por ahora.
                No se muestra en modo Pickup, ya que no hay envío que cobrar. */}
            {!isPickup && (
              <ThemedView type="backgroundElement" style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <View style={[styles.deliveryLogo, { backgroundColor: theme.primary }]}>
                    <ThemedText style={styles.deliveryLogoEmoji}>🍕</ThemedText>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <ThemedText type="smallBold">{testRestaurant.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Delivery en moto enviado a {currentAddress.label}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold" themeColor="primary">
                    ${deliveryFee.toFixed(2)}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.deliveryNote}>
                  Está a {testRestaurant.distance} de ti · Llega en {testRestaurant.deliveryTime}
                </ThemedText>
              </ThemedView>
            )}

            {/* Tarjeta de retiro en el local: solo visible en modo Pickup, en vez
                de la tarjeta de delivery. */}
            {isPickup && (
              <ThemedView type="backgroundElement" style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <View style={[styles.deliveryLogo, { backgroundColor: theme.accent }]}>
                    <ThemedText style={styles.deliveryLogoEmoji}>🏪</ThemedText>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <ThemedText type="smallBold">{testRestaurant.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      Retiras tu pedido en el local
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.deliveryNote}>
                  Está a {testRestaurant.distance} de ti
                </ThemedText>
              </ThemedView>
            )}

            <OrderSummaryCard rows={summaryRows} />

            {/* Puntos + botón de pago: antes vivían en una barra fija fuera
                del ScrollView (se veía "anclada" tapando parte del pedido);
                ahora es una tarjeta más dentro del scroll normal, al final
                del resumen. */}
            <ThemedView style={[styles.payCard, { backgroundColor: theme.primary }]}>
              <View style={styles.pointsPill}>
                <ThemedText type="small" style={styles.pointsText}>
                  Puntos actuales:
                </ThemedText>
                <ThemedText type="smallBold" style={styles.pointsText}>
                  0.00 pts
                </ThemedText>
              </View>

              {/* Pendiente: todavía no hay pantalla/flujo de checkout — este
                  botón queda listo visualmente para cuando se aborde el pago real. */}
              <Pressable style={[styles.payButton, { backgroundColor: theme.background }]}>
                <ThemedText type="smallBold">IR A PAGAR</ThemedText>
              </Pressable>
            </ThemedView>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.two,
  },
  emptyState: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
  },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyIconEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyCaption: {
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: Spacing.four,
    alignSelf: 'stretch',
    height: 52,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: '#FAF3E7',
  },
  linesWrapper: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  suggestionsWrapper: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  suggestionsTitle: {
    paddingHorizontal: Spacing.three,
  },
  suggestionsRow: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  deliveryCard: {
    marginTop: Spacing.five,
    marginHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  deliveryLogo: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryLogoEmoji: {
    fontSize: 18,
  },
  deliveryInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  deliveryNote: {
    lineHeight: 18,
  },
  payCard: {
    marginTop: Spacing.three,
    marginHorizontal: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    borderRadius: Spacing.three,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(250, 243, 231, 0.5)',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pointsText: {
    color: '#FAF3E7',
  },
  payButton: {
    height: 52,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
