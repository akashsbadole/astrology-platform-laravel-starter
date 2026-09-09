import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type BlogPost = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    body: string;
    published_at: string;
    author_name: string;
};

export default function BlogDetailScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        if (slug) void loadPost();
    }, [slug]);

    const loadPost = async () => {
        try {
            const { data } = await api.get(`/blog/${slug}`);
            setPost(data?.post ?? null);
        } catch (e) {
            console.warn('Blog detail:', apiErrorMessage(e));
        }
    };

    if (!post) {
        return (
            <Screen>
                <Text style={[typography.small, { color: colors.textDim }]}>
                    Loading…
                </Text>
            </Screen>
        );
    }

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={[
                        typography.hero,
                        { color: colors.text, fontSize: 24 },
                    ]}
                >
                    {post.title}
                </Text>
                <Text style={[typography.small, { color: colors.textFaint }]}>
                    {post.author_name} · {post.published_at}
                </Text>
                <Card>
                    <Text
                        style={[
                            typography.body,
                            { color: colors.text, lineHeight: 22 },
                        ]}
                    >
                        {post.body}
                    </Text>
                </Card>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({});
