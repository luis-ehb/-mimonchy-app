import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SummaryRowData = {
  label: string;
  value: number;
  bold?: boolean;
};

type OrderSummaryCardProps = {
  rows: SummaryRowData[];
};

/** Tarjeta "Resumen de tu compra": desglose de productos, delivery, service fee y total. */
export function OrderSummaryCard({ rows }: OrderSummaryCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold" style={styles.title}>
        Resumen de tu compra
      </ThemedText>

      {rows.map((row, index) => (
        <View key={row.label}>
          {row.bold && <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />}
          <SummaryRow {...row} />
        </View>
      ))}
    </ThemedView>
  );
}

function SummaryRow({ label, value, bold }: SummaryRowData) {
  return (
    <View style={styles.row}>
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
  card: {
    marginTop: Spacing.three,
    marginHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    marginBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
});
