import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Flame, Heart, MessageCircle, Moon, Phone, Scroll, Sparkles, Video } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AstrologerCard from '@/components/AstrologerCard';
import Screen from '@/components/ui/Screen';
import { colors, gradient, radius, shadowCard, typography } from '@/constants/theme';
import { mockAstrologers } from '@/lib/mock';

const QUICK_ACTIONS = [
  { icon: MessageCircle, label: 'Chat', to: '/astrologers' },
  { icon: Phone, label: 'Call', to: '/astrologers' },
  { icon: Video, label: 'Video', to: '/astrologers' },
  { icon: Scroll, label: 'Kundli', to: '/kundli' },
  { icon: Heart, label: 'Milan', to: '/milan' },
  { icon: Sparkles, label: 'Pooja', to: '/poojas' },
  { icon: Flame, label: 'Live', to: '/live' },
  { icon: Moon, label: 'Horoscope', to: '/horoscope' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const featured = mockAstrologers.filter((a) => a.is_online);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.hi}>Namaste 🙏</Text>
            <Text style={[typography.small, { color: colors.textDim }]}>Your cosmic guide awaits</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications')} style={styles.bell}>
            <Bell color={colors.gold} size={20} />
            <View style={styles.dot} />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/wallet')}>
          <LinearGradient colors={gradient.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.balanceCard, shadowCard]}>
            <Text style={styles.balanceLabel}>WALLET BALANCE</Text>
            <Text style={styles.balanceAmount}>₹850.00</Text>
            <Text style={styles.balanceHint}>Tap to recharge · first consult gets 5 min free</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.actionsWrap}>
          {QUICK_ACTIONS.map(({ icon: Icon, label, to }) => (
            <Pressable key={label} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.7 : 1 }]} onPress={() => router.push(to)}>
              <View style={styles.actionIcon}>
                <Icon color={colors.gold} size={20} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push('/live')}>
          <LinearGradient colors={gradient.violet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.liveCard, shadowCard]}>
            <View style={styles.livePill}>
              <Flame color="#fff" size={12} />
              <Text style={styles.livePillText}>LIVE</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.liveTitle}>Astrologers are live now</Text>
              <Text style={styles.liveSub}>Join sessions, ask questions, send gifts</Text>
            </View>
            <Text style={styles.liveArrow}>→</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.sectionRow}>
          <Text style={[typography.title, { color: colors.text }]}>Top Astrologers</Text>
          <Pressable onPress={() => router.push('/astrologers')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={featured}
          keyExtractor={(a) => String(a.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 16 }}
          renderItem={({ item }) => (
            <View style={{ width: 260 }}>
              <AstrologerCard astrologer={item} onPress={() => router.push(`/astrologer/${item.id}`)} />
            </View>
          )}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 18 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  hi: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  bell: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  dot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  balanceCard: { borderRadius: radius.xl, padding: 20, gap: 4 },
  balanceLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: 'rgba(26,20,8,0.7)' },
  balanceAmount: { fontSize: 34, fontWeight: '900', color: '#1A1408' },
  balanceHint: { fontSize: 11, fontWeight: '600', color: 'rgba(26,20,8,0.65)' },
  actionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  action: { width: '23%', alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 52, height: 52, borderRadius: 18,
    backgroundColor: colors.violetSoft, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.textDim },
  liveCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.lg, padding: 16 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
  livePillText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  liveTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  liveSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  liveArrow: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  seeAll: { color: colors.gold, fontWeight: '700', fontSize: 13 },
});

