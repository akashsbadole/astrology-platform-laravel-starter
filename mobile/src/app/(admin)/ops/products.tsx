import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { inr } from '@/lib/format';

type Product = { id: number; name: string; price_paise: number; stock: number };

export default function AdminProductsScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/products');
            setProducts(data?.products ?? []);
        } catch (e) {
            console.warn('Products load:', apiErrorMessage(e));
        }
    };

    const add = async () => {
        Alert.prompt('New product', 'name,price,stock', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Add',
                onPress: async (text: string | undefined) => {
                    if (!text) return;
                    const [name, price, stock] = text.split(',');
                    try {
                        await api.post('/admin/ops/products', {
                            name: name?.trim(),
                            price: Number(price?.trim() || 0),
                            stock: Number(stock?.trim() || 0),
                        });
                        void load();
                    } catch (e) {
                        Alert.alert('Error', apiErrorMessage(e));
                    }
                },
            },
        ]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    useEffect(() => {
        void load();
    }, []);

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Products
            </Text>
            <FlatList
                data={products}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.row}>
                            <Text
                                style={[
                                    typography.subtitle,
                                    { color: colors.text },
                                ]}
                            >
                                {item.name}
                            </Text>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text
                                    style={[
                                        typography.subtitle,
                                        { color: colors.gold },
                                    ]}
                                >
                                    {inr(item.price_paise / 100)}
                                </Text>
                                <Text
                                    style={[
                                        typography.small,
                                        { color: colors.textDim },
                                    ]}
                                >
                                    Stock: {item.stock}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.gold}
                    />
                }
                ListEmptyComponent={
                    <Card>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            No products yet.
                        </Text>
                    </Card>
                }
            />
            <Button
                title="Add Product"
                icon={<Plus color="#1A1408" size={16} />}
                onPress={add}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
