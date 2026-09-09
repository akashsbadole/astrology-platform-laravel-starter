import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors, radius, typography } from '@/constants/theme';

type Tone = 'gold' | 'violet' | 'success' | 'danger' | 'neutral';

const toneStyle: Record<Tone, { bg: string; fg: string }> = {
  gold: { bg: colors.goldSoft, fg: colors.gold },
  violet: { bg: colors.violetSoft, fg: '#A79BFF' },
  success: { bg: colors.successSoft, fg: colors.success },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  neutral: { bg: colors.surfaceStrong, fg: colors.textDim },
};

type Props = { label: string; tone?: Tone; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> };

export default function Badge({ label, tone = 'neutral', style, textStyle }: Props) {
  const t = toneStyle[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, style]}>
      <Text style={[typography.tiny, { color: t.fg }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});
