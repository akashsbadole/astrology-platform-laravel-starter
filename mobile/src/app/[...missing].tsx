import { useLocalSearchParams, usePathname } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/constants/theme';

/**
 * Catch-all screen — any route that doesn't exist yet renders here.
 * Lets navigation stay functional while screens are built out (tracker §4).
 */
export default function MissingScreen() {
  const params = useLocalSearchParams<{ missing?: string | string[] }>();
  const pathname = usePathname();
  const segments = ([] as string[])
    .concat(params.missing ?? [])
    .filter((s) => s !== 'missing');
  const where = segments.length ? `/${segments.join('/')}` : pathname;

  return (
    <View style={styles.wrap}>
      <Compass color={colors.gold} size={56} />
      <Text style={[typography.title, styles.title]}>Charting this screen…</Text>
      <Text style={[typography.body, styles.body]}>
        The {where} screen is on the roadmap (see mobile/APP_TRACKER.md §4).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, backgroundColor: colors.bg },
  title: { color: colors.text, textAlign: 'center' },
  body: { color: colors.textDim, textAlign: 'center' },
});
