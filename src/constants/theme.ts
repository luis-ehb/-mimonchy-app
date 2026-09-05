/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2B2320',
    background: '#FAF3E7',
    backgroundElement: '#F0E4D0',
    backgroundSelected: '#F5D6D0',
    textSecondary: '#8A7A66',
    primary: '#D64545',
    accent: '#6B8E4E',
  },
  dark: {
    text: '#FAF3E7',
    background: '#2B2320',
    backgroundElement: '#3A3028',
    backgroundSelected: '#4A3B30',
    textSecondary: '#B8A98F',
    primary: '#E06565',
    accent: '#89AD6A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Altura reservada para la barra flotante (pill) + su separación del borde inferior.
export const BottomTabInset = Platform.select({ ios: 96, android: 104 }) ?? 0;
export const MaxContentWidth = 800;
