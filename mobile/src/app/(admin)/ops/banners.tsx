import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Banner = { id: number; title: string | null; link: string | null; slot: string; is_active: boolean };

export default function AdminBannersScreen() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const { data } = await api.get('/admin/ops/banners');
            setBanners(data?.banners ?? []);
        } catch (e) {
            console.warn('Banners load:', apiErrorMessage(e));
        }
    };

    const add = async () => {
        Alert.prompt('New banner', 'title,link,slot', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Add',
                onPress: async (text) => {
                    if (!text) return;
                    const [title, link, slot] = text.split(',');
                    try {
                        await api.post('/admin/ops/banners', {
                            title: title?.trim() || null,
                            link: link?.trim() || null,
                            slot: slot?.trim() || 'home',
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

    useEffect(() => { void load(); }, []);

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Banners</Text>
            <FlatList
                data={banners}
                keyExtractor={(b) => String(b.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.title || 'Untitled'}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.slot} · {item.is_active ? 'Active' : 'Inactive'}
                        </Text>
                    </Card>
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>No banners yet.</Text>
                    </Card>
                }
            />
            <Button title="Add Banner" icon={<Plus color="#1A1408" size={16} />} onPress={add} />
        </Screen>
    );
}
