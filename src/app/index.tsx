import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { menu, testRestaurant } from '@/constants/mock-data';
import type { Fulfillment } from '@/types/menu';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/context/cart-context';
import { useFulfillment } from '@/context/fulfillment-context';

const ALL_CATEGORY = 'all';

// Tamaño del logo en la barra superior y alto real que ocupa la barra
// (más allá del área segura del sistema) para reservarle ese espacio al
// contenido del scroll — así la portada nunca queda tapada detrás de la
// barra, sin importar qué tan grande sea el logo.
const TOP_BAR_LOGO_SIZE = 56;
const TOP_BAR_GAP_TOP = Spacing.one;
const TOP_BAR_GAP_BOTTOM = Spacing.two;
const TOP_BAR_CONTENT_HEIGHT = TOP_BAR_GAP_TOP + TOP_BAR_LOGO_SIZE + TOP_BAR_GAP_BOTTOM;

const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  delivery: 'Solo Delivery',
  pickup: 'Solo Pickup',
  delivery_pickup: 'Delivery y Pickup',
};

const FULFILLMENT_ICON: Record<Fulfillment, string> = {
  delivery: '🛵',
  pickup: '🏪',
  delivery_pickup: '🛵',
};

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { addItem, decrementItem, totalCount, totalPrice, lines } = useCart();
  const { currentAddress, openAddressModal } = useFulfillment();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY);
  const [isFavorite, setIsFavorite] = useState(false);

  const visibleMenu = useMemo(() => {
    const query = search.trim().toLowerCase();

    return menu
      .filter((category) => selectedCategory === ALL_CATEGORY || category.id === selectedCategory)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.name.toLowerCase().includes(query)),
      }))
      .filter((category) => category.items.length > 0);
  }, [search, selectedCategory]);

  const insets = {
    ...safeAreaInsets,
    top: safeAreaInsets.top + TOP_BAR_CONTENT_HEIGHT,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentInset={insets}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        {/* Portada del restaurante */}
        <View style={[styles.cover, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.coverEmoji}>🍕</ThemedText>
          <ThemedText type="small" style={styles.coverCaption}>
            Foto del restaurante próximamente
          </ThemedText>

          <Pressable
            onPress={() => setIsFavorite((current) => !current)}
            style={[styles.favoriteButton, { backgroundColor: theme.background }]}>
            <ThemedText style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</ThemedText>
          </Pressable>

          <View style={[styles.logoAvatar, { backgroundColor: theme.primary, borderColor: theme.background }]}>
            <ThemedText style={styles.logoEmoji}>🍕</ThemedText>
          </View>
        </View>

        {/* Nombre, rating y tagline */}
        <View style={styles.headerBlock}>
          <View style={styles.nameRow}>
            <ThemedText type="subtitle" style={styles.restaurantName}>
              {testRestaurant.name}
            </ThemedText>
            <View style={[styles.ratingPill, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">⭐ {testRestaurant.rating}</ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {testRestaurant.tagline}
          </ThemedText>

          {/* Contacto */}
          <View style={styles.contactRow}>
            <ThemedText type="small" themeColor="textSecondary">
              📞 {testRestaurant.phone}
            </ThemedText>
          </View>
        </View>

        {/* Info: distancia, horario/estado, delivery-pickup */}
        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">
              📍 Distancia
            </ThemedText>
            <ThemedText type="smallBold">{testRestaurant.distance}</ThemedText>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">
              🕒 Horario
            </ThemedText>
            <ThemedText type="smallBold">Cierra {testRestaurant.openUntil}</ThemedText>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: testRestaurant.isOpen ? theme.accent : theme.textSecondary },
              ]}>
              <ThemedText type="small" style={styles.statusPillText}>
                {testRestaurant.isOpen ? 'Abierto' : 'Cerrado'}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {FULFILLMENT_ICON[testRestaurant.fulfillment]} Modalidad
            </ThemedText>
            <ThemedText type="smallBold">{FULFILLMENT_LABEL[testRestaurant.fulfillment]}</ThemedText>
          </View>
        </View>

        {/* Buscador */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBar, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Buscar en ${testRestaurant.name}`}
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
        </View>

        {/* Chips de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsRow}>
          <CategoryChip
            label="Todas"
            active={selectedCategory === ALL_CATEGORY}
            onPress={() => setSelectedCategory(ALL_CATEGORY)}
          />
          {menu.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.title}
              active={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>

        {/* Menú */}
        <View style={styles.menuWrapper}>
          {visibleMenu.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyState}>
              No encontramos productos con ese nombre 🔍
            </ThemedText>
          )}

          {visibleMenu.map((category) => (
            <View key={category.id} style={styles.category}>
              <ThemedText type="subtitle" style={styles.categoryTitle}>
                {category.title}
              </ThemedText>

              {category.items.map((item) => {
                // Para pizzas, una misma sumatoria puede repartirse en varias
                // líneas distintas (tamaño/adicionales/notas diferentes), así
                // que se suman todas las coincidencias por id solo para mostrar
                // el total en el carrito — no se puede saber cuál línea +/-
                // debe modificar, por eso las pizzas no usan el stepper rápido.
                const quantityInCart = lines
                  .filter((line) => line.item.id === item.id)
                  .reduce((sum, line) => sum + line.quantity, 0);

                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantityInCart={quantityInCart}
                    onOpen={() => router.push(`/item/${item.id}`)}
                    onAdd={() => addItem(item)}
                    onDecrement={() => decrementItem(item.id)}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Redes sociales (footer) */}
        <View style={styles.socialFooter}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.socialFooterLabel}>
            Síguenos
          </ThemedText>
          <View style={styles.socialRow}>
            <Pressable style={[styles.socialButton, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.socialIcon}>📷</ThemedText>
            </Pressable>
            <Pressable style={[styles.socialButton, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.socialIcon}>💬</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
      </ScrollView>

      {/* Barra superior: logo + dirección + carrito */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.background, paddingTop: safeAreaInsets.top + TOP_BAR_GAP_TOP },
        ]}>
        <Image source={require('@/assets/images/logo.png')} style={styles.topBarLogo} contentFit="contain" />

        <View style={styles.topBarAddress}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.topBarAddressLabel}>
            Enviando a
          </ThemedText>
          <Pressable onPress={openAddressModal} hitSlop={8}>
            <ThemedText type="smallBold">{currentAddress.label} ⌄</ThemedText>
          </Pressable>
        </View>

        <Pressable style={styles.topBarButton} onPress={() => router.push('/cart')}>
          <ThemedText style={[styles.topBarIcon, { color: theme.text }]}>🛒</ThemedText>
          {totalCount > 0 && (
            <View style={styles.cartBadge}>
              <ThemedText style={styles.cartBadgeText}>{totalCount}</ThemedText>
            </View>
          )}
        </Pressable>
      </View>

      {/* Barra flotante: ver carrito */}
      {totalCount > 0 && (
        <Pressable
          onPress={() => router.push('/cart')}
          style={[
            styles.cartFloatingBar,
            {
              backgroundColor: theme.primary,
              bottom: safeAreaInsets.bottom + Spacing.three,
            },
          ]}>
          <View style={styles.cartFloatingLeft}>
            <ThemedText style={styles.cartFloatingIcon}>🛒</ThemedText>
            <ThemedText type="smallBold" style={styles.cartFloatingText}>
              {totalCount}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={styles.cartFloatingText}>
            VER CARRITO
          </ThemedText>
          <ThemedText type="smallBold" style={styles.cartFloatingText}>
            ${totalPrice.toFixed(2)}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.backgroundElement,
        },
      ]}>
      <ThemedText
        type="smallBold"
        style={active ? styles.chipTextActive : undefined}
        themeColor={active ? undefined : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: TOP_BAR_GAP_BOTTOM,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  topBarLogo: {
    width: TOP_BAR_LOGO_SIZE,
    height: TOP_BAR_LOGO_SIZE,
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarIcon: {
    fontSize: 20,
  },
  topBarAddress: {
    flex: 1,
    alignItems: 'center',
  },
  topBarAddressLabel: {
    opacity: 0.8,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#D64545',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FAF3E7',
    fontSize: 10,
    fontWeight: '700',
  },
  cartFloatingBar: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    height: 52,
    borderRadius: Spacing.five,
  },
  cartFloatingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  cartFloatingIcon: {
    fontSize: 18,
  },
  cartFloatingText: {
    color: '#FAF3E7',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    alignSelf: 'stretch',
  },
  cover: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  coverEmoji: {
    fontSize: 56,
  },
  coverCaption: {
    color: '#FAF3E7',
    opacity: 0.85,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.six,
    right: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  logoAvatar: {
    position: 'absolute',
    bottom: -28,
    left: Spacing.four,
    width: 64,
    height: 64,
    borderRadius: Spacing.three,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 28,
  },
  headerBlock: {
    paddingTop: Spacing.six,
    paddingHorizontal: Spacing.four,
    gap: Spacing.one,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  restaurantName: {
    flexShrink: 1,
  },
  ratingPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  socialButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
  },
  infoCard: {
    flex: 1,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.half,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.five,
    marginTop: Spacing.half,
  },
  statusPillText: {
    color: '#FAF3E7',
    fontWeight: '700',
    fontSize: 11,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.four,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 46,
    borderRadius: Spacing.five,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  chipsScroll: {
    marginTop: Spacing.three,
  },
  chipsRow: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  chipTextActive: {
    color: '#FAF3E7',
  },
  menuWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: Spacing.six,
  },
  socialFooter: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  socialFooterLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  category: {
    gap: Spacing.three,
  },
  categoryTitle: {
    fontSize: 22,
    lineHeight: 28,
    paddingHorizontal: Spacing.one,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  itemImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 28,
  },
  promoBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Spacing.one,
  },
  promoBadgeText: {
    color: '#FAF3E7',
    fontSize: 9,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: Spacing.half,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemStepperValue: {
    minWidth: 16,
    textAlign: 'center',
  },
  addButtonText: {
    color: '#FAF3E7',
    fontSize: 18,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
});
