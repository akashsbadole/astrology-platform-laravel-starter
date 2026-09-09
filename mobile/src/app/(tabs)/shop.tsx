import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import { inr } from '@/lib/format';
import { mockProducts } from '@/lib/mock';

export default function ShopScreen() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const addToCart = (name: string) => {
    setCartCount((c) => c + 1);
    Alert.alert('Added to cart 🛒', `${name} added.\nCart & checkout screens arrive with tracker §4.2.`);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>AstroMall</Text>
          <Text style={[typography.small, { color: colors.textDim }]}>Gemstones, rudraksha & remedies</Text>
        </View>
        <Pressable onPress={() => router.push('/cart')} style={styles.cartBtn}>
          <Text style={{ color: colors.gold, fontWeight: '800' }}>🛒 {cartCount}</Text>
        </Pressable>
      </View>

      <FlatList
        data={mockProducts}
        keyExtractor={(p) => p.slug}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 24, marginTop: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.product}>
            <View style={styles.emojiWrap}>
              <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
              {item.tag ? <Badge label={item.tag} tone="gold" style={styles.tag} /> : null}
            </View>
            <Text style={[typography.small, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[typography.subtitle, { color: colors.gold }]}>{inr(item.price)}</Text>
              {item.mrp ? <Text style={styles.mrp}>{inr(item.mrp)}</Text> : null}
            </View>
            <Pressable onPress={() => addToCart(item.name)} style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.addText}>Add</Text>
            </Pressable>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartBtn: {
    backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8,
  },
  product: { flex: 1, gap: 8 },
  emojiWrap: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 18,
    backgroundColor: colors.bg3, borderRadius: radius.md,
  },
  tag: { position: 'absolute', top: 8, right: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mrp: { color: colors.textFaint, textDecorationLine: 'line-through', fontSize: 12 },
  addBtn: {
    backgroundColor: colors.violet, borderRadius: radius.sm,
    alignItems: 'center', paddingVertical: 9,
  },
  addText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
