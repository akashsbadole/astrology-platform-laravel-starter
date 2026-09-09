import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';

type BlogPost = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    published_at: string;
    author_name: string;
};

export default function BlogListScreen() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        void loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const { data } = await api.get('/blog');
            setPosts(data?.data ?? []);
        } catch (e) {
            console.warn('Blog load:', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Blog
            </Text>
            <FlatList
                data={posts}
                keyExtractor={(p) => String(p.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <Card onPress={() => router.push(`/blog/${item.slug}`)}>
                        <Text
                            style={[
                                typography.subtitle,
                                { color: colors.text },
                            ]}
                            numberOfLines={2}
                        >
                            {item.title}
                        </Text>
                        <Text
                            style={[
                                typography.small,
                                { color: colors.textDim, marginTop: 4 },
                            ]}
                            numberOfLines={2}
                        >
                            {item.excerpt}
                        </Text>
                        <Text
                            style={[
                                typography.tiny,
                                { color: colors.textFaint, marginTop: 6 },
                            ]}
                        >
                            {item.author_name} · {timeAgo(item.published_at)}
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
                            No posts yet.
                        </Text>
                    </Card>
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({});
