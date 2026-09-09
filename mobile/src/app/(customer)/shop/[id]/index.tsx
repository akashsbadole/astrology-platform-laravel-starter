import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadowCard, typography } from '@/constants/theme';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import { inr } from '@/lib/format';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [product, setProduct] = useState<{ id: number; slug: string; name: string; description: string; price: number; mrp: number | null; stock: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        api.get(`/shop/${id}`)
            .then((res) => {
                if (!cancelled) setProduct(res.data.product);
            })
            .catch(() => {
                if (!cancelled) setError('Couldn’t load product.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <Screen>
                <View style={styles.loader}>
                    <ActivityIndicator color={colors.gold} />
                </View>
            </Screen>
        );
    }

    if (error || !product) {
        return (
            <Screen>
                <View style={styles.loader}>
                    <Text style={[typography.body, { color: colors.textFaint }]}>{error ?? 'Product not found.'}</Text>
                    <Button title="Retry" onPress={() => router.replace(`/shop/${id}`)} />
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.hero, { backgroundColor: colors.bg3 }]}>
                    <Text style={styles.emoji}>🛍️</Text>
                </View>
                <View style={styles.body}>
                    <Text style={[typography.hero, { color: colors.text }]}>{product.name}</Text>
                    {product.description ? (
                        <Text style={[typography.body, { color: colors.textDim, marginTop: 8 }]}>{product.description}</Text>
                    ) : null}
                    <View style={styles.priceRow}>
                        <Text style={[typography.subtitle, { color: colors.gold }]}>{inr(product.price)}</Text>
                        {product.mrp ? <Text style={styles.mrp}>{inr(product.mrp)}</Text> : null}
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={[typography.small, { color: colors.textFaint }]}>
                            {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
                        </Text>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.footer}>
                <Button
                    title="Add to cart"
                    onPress={() => router.push({ pathname: '/cart', params: { product_id: String(product.id) } })}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scroll: { padding: 16, paddingBottom: 24 },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    hero: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        borderRadius: radius.lg,
    },
    emoji: { fontSize: 72 },
    body: { marginTop: 16, gap: 12 },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mrp: {
        color: colors.textFaint,
        textDecorationLine: 'line-through',
        fontSize: 14,
    },
    metaRow: { marginTop: 4 },
    footer: {
        padding: 16,
        paddingBottom: 24,
        backgroundColor: colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
});
