import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Thread = {
    id: number;
    title: string;
    replies_count: number;
    created_at: string;
};

export default function ForumCategoryScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [threads, setThreads] = useState<Thread[]>([]);

    useEffect(() => {
        if (slug) void loadThreads();
    }, [slug]);

    const loadThreads = async () => {
        try {
            const { data } = await api.get(`/forum/category/${slug}`);
            setThreads(data?.threads ?? []);
        } catch (e) {
            console.warn('Forum category:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                {slug?.toUpperCase()}
            </Text>
            <FlatList
                data={threads}
                keyExtractor={(t) => String(t.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            {item.replies_count} replies · {item.created_at}
                        </Text>
                    </Card>
                )}
                ListEmptyComponent={
                    <Card>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim },
                            ]}
                        >
                            No threads yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
