import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

// Colores fijos (no dependen del theme claro/oscuro): el pill siempre usa el
// rojo primario de mimonchy como fondo, así que el contenido va en cream/blanco.
const ACTIVE_TINT = '#FAF3E7';
const INACTIVE_TINT = 'rgba(250, 243, 231, 0.55)';
const BAR_HEIGHT = 64;

function icon(name: SymbolViewProps['name']) {
  return ({ color, size }: { color: string; size: number }) => (
    <SymbolView name={name} tintColor={color} size={size} />
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: INACTIVE_TINT,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingTop: Spacing.half,
        },
        tabBarStyle: {
          position: 'absolute',
          left: Spacing.four,
          right: Spacing.four,
          bottom: insets.bottom + Spacing.two,
          height: BAR_HEIGHT,
          borderRadius: BAR_HEIGHT / 2,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: icon({ ios: 'house.fill', android: 'home', web: 'home' }),
        }}
      />

      <Tabs.Screen
        name="mi-casa"
        options={{
          title: 'Mi casa',
          tabBarIcon: icon({
            ios: 'location.fill',
            android: 'location_on',
            web: 'location_on',
          }),
        }}
      />

      <Tabs.Screen
        name="cupones"
        options={{
          title: 'Cupones',
          tabBarIcon: icon({
            ios: 'ticket.fill',
            android: 'confirmation_number',
            web: 'confirmation_number',
          }),
        }}
      />

      <Tabs.Screen
        name="ayuda"
        options={{
          title: 'Ayuda',
          tabBarIcon: icon({
            ios: 'questionmark.bubble.fill',
            android: 'help',
            web: 'help',
          }),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: icon({ ios: 'person.fill', android: 'person', web: 'person' }),
        }}
      />

      {/* Pantalla de ejemplo del starter de Expo: se mantiene en el proyecto pero
          fuera de la barra de tabs, que ya tiene sus 5 secciones definidas. */}
      <Tabs.Screen name="explore" options={{ href: null }} />

      {/* Rutas que se navegan por fuera de la barra (detalle de producto, carrito):
          si no se declaran con href: null, expo-router las agrega solas como
          una pestaña extra (por eso aparecía "item/id" al lado de Perfil).
          También se oculta la pill en estas dos pantallas (tabBarStyle: display none):
          son vistas de detalle a pantalla completa, no seccciones de la barra, y si
          se deja visible tapa el botón de "Agregar"/el resumen del carrito. */}
      <Tabs.Screen name="item/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="cart" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
