import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

/** In-app screen header: back chevron + title + optional right slot (bell, avatar...). */
export default function Header({ title, subtitle, showBack = false, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <ChevronLeft color={colors.text} size={24} />
          </Pressable>
        )}
        <View>
          <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[typography.small, { color: colors.textDim }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
