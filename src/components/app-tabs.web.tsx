import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

const ACTIVE_TINT = '#FAF3E7';
const INACTIVE_TINT = 'rgba(250, 243, 231, 0.65)';

type TabIcon = SymbolViewProps['name'];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton label="Inicio" icon={{ ios: 'house.fill', android: 'home', web: 'home' }} />
          </TabTrigger>
          <TabTrigger name="mi-casa" href="/mi-casa" asChild>
            <TabButton
              label="Mi casa"
              icon={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
            />
          </TabTrigger>
          <TabTrigger name="cupones" href="/cupones" asChild>
            <TabButton
              label="Cupones"
              icon={{ ios: 'ticket.fill', android: 'confirmation_number', web: 'confirmation_number' }}
            />
          </TabTrigger>
          <TabTrigger name="ayuda" href="/ayuda" asChild>
            <TabButton
              label="Ayuda"
              icon={{ ios: 'questionmark.bubble.fill', android: 'help', web: 'help' }}
            />
          </TabTrigger>
          <TabTrigger name="perfil" href="/perfil" asChild>
            <TabButton label="Perfil" icon={{ ios: 'person.fill', android: 'person', web: 'person' }} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: TabIcon;
};

export function TabButton({ label, icon, isFocused, ...props }: TabButtonProps) {
  const tint = isFocused ? ACTIVE_TINT : INACTIVE_TINT;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView name={icon} tintColor={tint} size={20} />
      <ThemedText type="small" style={[styles.tabLabel, { color: tint }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={[styles.innerContainer, { backgroundColor: colors.primary }]}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
