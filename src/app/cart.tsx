import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { menu, PIZZA_SIZE_LABELS, testRestaurant } from '@/constants/mock-data';
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
  const { lines, addItem, decrementItem, totalCount, totalPrice } = useCart();
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

      {/* Toggle Delivery/Pickup + dirección de entrega, patrón tomado de la
          referencia QUIK. Predeterminado en Delivery. Tocar la dirección bajo
          "Delivery" abre el selector de direcciones guardadas (estado compartido
          con la pantalla principal vía FulfillmentProvider). */}
      <View style={styles.fulfillmentBar}>
        <Pressable
          onPress={() => selectFulfillment('delivery')}
          style={[
            styles.fulfillmentButton,
            { backgroundColor: fulfillment === 'delivery' ? theme.accent : theme.backgroundElement },
          ]}>
          <View style={styles.fulfillmentButtonTop}>
            <ThemedText style={styles.fulfillmentIcon}>🛵</ThemedText>
            <ThemedText
              type="smallBold"
              style={fulfillment === 'delivery' ? styles.fulfillmentTextActive : undefined}
              themeColor={fulfillment === 'delivery' ? undefined : 'textSecondary'}>
              Delivery
            </ThemedText>
          </View>

          {fulfillment === 'delivery' ? (
            <Pressable onPress={openAddressModal} hitSlop={8}>
              <ThemedText type="small" style={styles.fulfillmentTextActive}>
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
          onPress={() => selectFulfillment('pickup')}
          style={[
            styles.fulfillmentButton,
            { backgroundColor: fulfillment === 'pickup' ? theme.accent : theme.backgroundElement },
          ]}>
          <View style={styles.fulfillmentButtonTop}>
            <ThemedText style={styles.fulfillmentIcon}>🏪</ThemedText>
            <ThemedText
              type="smallBold"
              style={fulfillment === 'pickup' ? styles.fulfillmentTextActive : undefined}
              themeColor={fulfillment === 'pickup' ? undefined : 'textSecondary'}>
              Pickup
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={fulfillment === 'pickup' ? styles.fulfillmentTextActive : undefined}
            themeColor={fulfillment === 'pickup' ? undefined : 'textSecondary'}>
            Retirar en el local
          </ThemedText>
        </Pressable>
      </View>

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
            {lines.map((line) => {
              // Descripción de la línea: tamaño de pizza (si aplica) + adicionales elegidos.
              const details = [
                line.size ? PIZZA_SIZE_LABELS[line.size] : null,
                line.extras && line.extras.length > 0
                  ? `Adicionales: ${line.extras.map((extra) => extra.name).join(', ')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <Pressable
                  key={line.key}
                  disabled={!line.item.isPizza}
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
                  }>
                  <ThemedView type="backgroundElement" style={styles.lineCard}>
                    <View
                      style={[
                        styles.lineImagePlaceholder,
                        { backgroundColor: theme.backgroundSelected },
                      ]}>
                      <ThemedText style={styles.lineEmoji}>{line.item.emoji ?? '🍕'}</ThemedText>
                    </View>

                    <View style={styles.lineInfo}>
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
                      <ThemedText type="smallBold" themeColor="primary" style={styles.lineSubtotal}>
                        ${(line.unitPrice * line.quantity).toFixed(2)}
                      </ThemedText>
                      {line.item.isPizza && (
                        <ThemedText type="small" themeColor="primary" style={styles.lineEditHint}>
                          Toca para editar
                        </ThemedText>
                      )}
                    </View>

                    <View style={styles.stepper}>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          decrementItem(line.item.id, line.notes, line.extras, line.size);
                        }}
                        style={[styles.stepperButton, { backgroundColor: theme.backgroundSelected }]}>
                        <ThemedText type="smallBold">−</ThemedText>
                      </Pressable>
                      <ThemedText type="smallBold" style={styles.stepperValue}>
                        {line.quantity}
                      </ThemedText>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          addItem(line.item, 1, line.notes, line.extras, line.size);
                        }}
                        style={[styles.stepperButton, { backgroundColor: theme.primary }]}>
                        <ThemedText type="smallBold" style={styles.stepperButtonAddText}>
                          +
                        </ThemedText>
                      </Pressable>
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
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
                <ThemedView key={item.id} type="backgroundElement" style={styles.suggestionCard}>
                  <View
                    style={[
                      styles.suggestionImagePlaceholder,
                      { backgroundColor: theme.backgroundSelected },
                    ]}>
                    <ThemedText style={styles.suggestionEmoji}>{item.emoji ?? '🥤'}</ThemedText>
                  </View>
                  <ThemedText type="small" numberOfLines={1} style={styles.suggestionName}>
                    {item.name}
                  </ThemedText>
                  <View style={styles.suggestionFooter}>
                    <ThemedText type="smallBold" themeColor="primary">
                      ${item.price.toFixed(2)}
                    </ThemedText>
                    <Pressable
                      onPress={() =>
                        item.isPizza ? router.push(`/item/${item.id}`) : addItem(item, 1)
                      }
                      style={[styles.suggestionAddButton, { backgroundColor: theme.primary }]}>
                      <ThemedText type="smallBold" style={styles.suggestionAddText}>
                        +
                      </ThemedText>
                    </Pressable>
                  </View>
                </ThemedView>
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

            {/* Resumen de compra: desglose de productos, delivery, service fee y total.
                La línea de delivery se omite en modo Pickup. */}
            <ThemedView type="backgroundElement" style={styles.summaryCard}>
              <ThemedText type="smallBold" style={styles.summaryCardTitle}>
                Resumen de tu compra
              </ThemedText>

              <SummaryRow label="Total Productos" value={totalPrice} />
              {!isPickup && <SummaryRow label="Total Delivery" value={deliveryFee} />}
              <SummaryRow label="Service Fee" value={MOCK_SERVICE_FEE} />

              <View style={[styles.summaryDivider, { backgroundColor: theme.backgroundSelected }]} />

              <SummaryRow label="Total" value={grandTotal} bold />
            </ThemedView>

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

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? undefined : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? 'primary' : undefined}>
        ${value.toFixed(2)}
      </ThemedText>
    </View>
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
  fulfillmentBar: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  fulfillmentButton: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  fulfillmentButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  fulfillmentIcon: {
    fontSize: 16,
  },
  fulfillmentTextActive: {
    color: '#FAF3E7',
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
  lineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  lineImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineEmoji: {
    fontSize: 24,
  },
  lineInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  lineSubtotal: {
    marginTop: Spacing.half,
  },
  lineEditHint: {
    marginTop: Spacing.half,
    fontSize: 11,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonAddText: {
    color: '#FAF3E7',
  },
  stepperValue: {
    minWidth: 16,
    textAlign: 'center',
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
  suggestionCard: {
    width: 128,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  suggestionImagePlaceholder: {
    height: 72,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionEmoji: {
    fontSize: 32,
  },
  suggestionName: {
    marginTop: Spacing.half,
  },
  suggestionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.half,
  },
  suggestionAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionAddText: {
    color: '#FAF3E7',
    fontSize: 14,
    lineHeight: 16,
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
  summaryCard: {
    marginTop: Spacing.three,
    marginHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  summaryCardTitle: {
    marginBottom: Spacing.one,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryDivider: {
    height: 1,
    marginVertical: Spacing.one,
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
