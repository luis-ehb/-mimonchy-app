import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { FulfillmentOverlays } from '@/components/fulfillment-overlays';
import { CartProvider } from '@/context/cart-context';
import { FulfillmentProvider } from '@/context/fulfillment-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // Siempre tema claro (ver src/hooks/use-theme.ts) — se ignora el modo
  // oscuro del sistema a propósito.
  return (
    <ThemeProvider value={DefaultTheme}>
      <CartProvider>
        <FulfillmentProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
          <FulfillmentOverlays />
        </FulfillmentProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
