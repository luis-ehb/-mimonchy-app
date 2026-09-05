import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SizeSelector } from '@/components/menu/size-selector';
import { ExtrasList } from '@/components/menu/extras-list';
import { ProductSuggestionCard } from '@/components/menu/product-suggestion-card';
import { QuantityStepper } from '@/components/quantity-stepper';
import { menu } from '@/constants/mock-data';
import { shouldShowOldPrice, unitPriceForItem } from '@/lib/pricing';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/context/cart-context';
import type { MenuExtra, PizzaSize } from '@/types/menu';

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

  const unitPrice = unitPriceForItem(item, { size: selectedSize, extras: selectedExtras });
  const showOldPrice = shouldShowOldPrice(item, selectedSize);
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
            <View>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Elige el tamaño
              </ThemedText>
              <SizeSelector
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
                pricesBySize={item.sizePrices}
              />
            </View>
          )}

          {item.extras && item.extras.length > 0 && (
            <View>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Adicionales
              </ThemedText>
              <ExtrasList
                extras={item.extras}
                selectedExtras={selectedExtras}
                onToggle={toggleExtra}
                isPizza={item.isPizza}
                size={selectedSize}
              />
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
            <QuantityStepper
              quantity={quantity}
              onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
              onIncrement={() => setQuantity((current) => current + 1)}
              size="lg"
            />
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
                  <ProductSuggestionCard key={bebida.id} item={bebida} onPress={() => addItem(bebida, 1)} />
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
});
