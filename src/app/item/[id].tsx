import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  extraPriceForSize,
  menu,
  PIZZA_SIZE_LABELS,
  PIZZA_SIZES,
  type MenuExtra,
  type PizzaSize,
} from '@/constants/mock-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/context/cart-context';

export default function ItemDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    editKey?: string;
    qty?: string;
    notes?: string;
    size?: string;
    extras?: string;
  }>();
  const { id, editKey } = params;
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addItem, replaceLine, lines } = useCart();

  const item = useMemo(() => {
    for (const category of menu) {
      const found = category.items.find((menuItem) => menuItem.id === id);
      if (found) return found;
    }
    return undefined;
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('mediana');
  const [selectedExtras, setSelectedExtras] = useState<MenuExtra[]>([]);

  // Si viene de "editar" desde el carrito (tocó un plato ya agregado), se
  // precargan cantidad/notas/tamaño/adicionales de esa línea. Si no, o si se
  // navega a otro producto distinto, se reinician los valores por defecto.
  useEffect(() => {
    if (editKey && item) {
      setQuantity(Number(params.qty) > 0 ? Number(params.qty) : 1);
      setNotes(params.notes ?? '');
      setSelectedSize((params.size as PizzaSize) || 'mediana');
      const extraIds = params.extras ? params.extras.split(',').filter(Boolean) : [];
      setSelectedExtras((item.extras ?? []).filter((extra) => extraIds.includes(extra.id)));
      return;
    }
    setQuantity(1);
    setNotes('');
    setSelectedSize('mediana');
    setSelectedExtras([]);
  }, [id, editKey]);

  // Bebidas del menú que aún no están en el carrito y que no son el propio
  // producto que se está viendo (por si alguien abre el detalle de una bebida).
  const drinkSuggestions = useMemo(() => {
    const bebidas = menu.find((category) => category.id === 'bebidas')?.items ?? [];
    const inCart = new Set(lines.map((line) => line.item.id));
    return bebidas.filter((bebida) => bebida.id !== item?.id && !inCart.has(bebida.id));
  }, [lines, item]);

  if (!item) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
        <ThemedText>No encontramos este producto.</ThemedText>
      </ThemedView>
    );
  }

  const toggleExtra = (extra: MenuExtra) => {
    setSelectedExtras((current) =>
      current.some((selected) => selected.id === extra.id)
        ? current.filter((selected) => selected.id !== extra.id)
        : [...current, extra],
    );
  };

  // Precio base: si es pizza, depende del tamaño elegido; si no, el precio fijo del producto.
  const basePrice = item.isPizza && item.sizePrices ? item.sizePrices[selectedSize] : item.price;
  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + extraPriceForSize(extra, item.isPizza ? selectedSize : undefined),
    0,
  );
  const unitPrice = basePrice + extrasTotal;
  // El precio tachado (promo) solo corresponde al precio de mediana, así que
  // se muestra únicamente cuando ese es el tamaño seleccionado (o si el
  // producto no es pizza y no tiene tamaños).
  const showOldPrice = Boolean(item.oldPrice) && (!item.isPizza || selectedSize === 'mediana');
  const total = unitPrice * quantity;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.photoPlaceholder, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.photoEmoji}>{item.emoji ?? '🍕'}</ThemedText>
        </View>

        <View style={styles.content}>
          <ThemedText type="subtitle">{item.name}</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.description}>
            {item.description}
          </ThemedText>

          <View style={styles.priceRow}>
            {showOldPrice && (
              <ThemedText type="default" themeColor="textSecondary" style={styles.oldPrice}>
                ${item.oldPrice!.toFixed(2)}
              </ThemedText>
            )}
            <ThemedText type="subtitle" themeColor="primary">
              ${unitPrice.toFixed(2)}
            </ThemedText>
          </View>

          {item.isPizza && item.sizePrices && (
            <View style={styles.sizeSection}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Elige el tamaño
              </ThemedText>
              <View style={styles.sizeRow}>
                {PIZZA_SIZES.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <Pressable
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.sizeChip,
                        { backgroundColor: active ? theme.primary : theme.backgroundElement },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={active ? styles.sizeChipTextActive : undefined}
                        themeColor={active ? undefined : 'text'}>
                        {PIZZA_SIZE_LABELS[size]}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={active ? styles.sizeChipTextActive : undefined}
                        themeColor={active ? undefined : 'textSecondary'}>
                        ${item.sizePrices![size].toFixed(2)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {item.extras && item.extras.length > 0 && (
            <View style={styles.extrasSection}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Adicionales
              </ThemedText>
              {item.extras.map((extra) => {
                const isSelected = selectedExtras.some((selected) => selected.id === extra.id);
                const price = extraPriceForSize(extra, item.isPizza ? selectedSize : undefined);
                return (
                  <Pressable
                    key={extra.id}
                    onPress={() => toggleExtra(extra)}
                    style={[
                      styles.extraRow,
                      { backgroundColor: theme.backgroundElement },
                    ]}>
                    <View style={styles.extraRowLeft}>
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
          )}

          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Instrucciones especiales (opcional)
          </ThemedText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Ej: sin cebolla, poca sal..."
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[
              styles.notesInput,
              { backgroundColor: theme.backgroundElement, color: theme.text },
            ]}
          />

          <View style={styles.quantityRow}>
            <ThemedText type="smallBold">Cantidad</ThemedText>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">−</ThemedText>
              </Pressable>
              <ThemedText type="smallBold" style={styles.stepperValue}>
                {quantity}
              </ThemedText>
              <Pressable
                onPress={() => setQuantity((current) => current + 1)}
                style={[styles.stepperButton, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">+</ThemedText>
              </Pressable>
            </View>
          </View>

          {drinkSuggestions.length > 0 && (
            <View style={styles.drinksSection}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                ¿Algo para tomar? 🥤
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.drinksRow}>
                {drinkSuggestions.map((bebida) => (
                  <ThemedView key={bebida.id} type="backgroundElement" style={styles.drinkCard}>
                    <View
                      style={[
                        styles.drinkImagePlaceholder,
                        { backgroundColor: theme.backgroundSelected },
                      ]}>
                      <ThemedText style={styles.drinkEmoji}>{bebida.emoji ?? '🥤'}</ThemedText>
                    </View>
                    <ThemedText type="small" numberOfLines={1} style={styles.drinkName}>
                      {bebida.name}
                    </ThemedText>
                    <View style={styles.drinkFooter}>
                      <ThemedText type="smallBold" themeColor="primary">
                        ${bebida.price.toFixed(2)}
                      </ThemedText>
                      <Pressable
                        onPress={() => addItem(bebida, 1)}
                        style={[styles.drinkAddButton, { backgroundColor: theme.primary }]}>
                        <ThemedText type="smallBold" style={styles.drinkAddText}>
                          +
                        </ThemedText>
                      </Pressable>
                    </View>
                  </ThemedView>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => {
          if (editKey) {
            replaceLine(
              editKey,
              item,
              quantity,
              notes.trim() || undefined,
              selectedExtras.length > 0 ? selectedExtras : undefined,
              item.isPizza ? selectedSize : undefined,
            );
          } else {
            addItem(
              item,
              quantity,
              notes.trim() || undefined,
              selectedExtras.length > 0 ? selectedExtras : undefined,
              item.isPizza ? selectedSize : undefined,
            );
          }
          router.canGoBack() ? router.back() : router.replace('/');
        }}
        style={[
          styles.addButton,
          { backgroundColor: theme.primary, marginBottom: insets.bottom + Spacing.three },
        ]}>
        <ThemedText type="smallBold" style={styles.addButtonText}>
          {editKey ? 'Guardar cambios' : 'Agregar'} · ${total.toFixed(2)}
        </ThemedText>
      </Pressable>
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
  scrollContent: {
    flexGrow: 1,
  },
  photoPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 64,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.one,
  },
  description: {
    marginTop: Spacing.one,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  sectionLabel: {
    marginTop: Spacing.five,
  },
  sizeSection: {
    gap: Spacing.two,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  sizeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  sizeChipTextActive: {
    color: '#FAF3E7',
  },
  extrasSection: {
    gap: Spacing.two,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  extraRowLeft: {
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
  notesInput: {
    marginTop: Spacing.two,
    minHeight: 72,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.five,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    marginHorizontal: Spacing.three,
    height: 52,
    borderRadius: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FAF3E7',
  },
  drinksSection: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  drinksRow: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  drinkCard: {
    width: 128,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.one,
  },
  drinkImagePlaceholder: {
    height: 72,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkEmoji: {
    fontSize: 32,
  },
  drinkName: {
    marginTop: Spacing.half,
  },
  drinkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.half,
  },
  drinkAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkAddText: {
    color: '#FAF3E7',
    fontSize: 14,
    lineHeight: 16,
  },
});
