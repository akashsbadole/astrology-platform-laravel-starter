import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type ForumCategory = { id: number; slug: string; name: string; description: string; threads_count: number };

export default function ForumIndexScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<ForumCategory[]>([]);

    useEffect(() => {
        void loadForum();
    }, []);

    const loadForum = async () => {
        try {
            const { data } = await api.get('/forum');
            setCategories(data?.categories ?? []);
        } catch (e) {
            console.warn('Forum load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>
                Forum
            </Text>
            <FlatList
                data={categories}
                keyExtractor={(c) => String(c.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/forum/${item.slug}`)}>
                        <Text style={[typography.subtitle, { color: colors.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            {item.description}
                        </Text>
                        <Text style={[typography.tiny, { color: colors.textFaint, marginTop: 4 }]}>
                            {item.threads_count} threads
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text style={[typography.small, { color: colors.textDim }]}>
                            No categories yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
