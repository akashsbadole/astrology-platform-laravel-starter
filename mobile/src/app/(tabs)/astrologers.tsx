import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import AstrologerCard from '@/components/AstrologerCard';
import Chip from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import type { Astrologer } from '@/lib/mock';

const FILTERS = ['All', 'Online', 'Vedic', 'Tarot', 'Love', 'Career'] as const;
const SORTS = ['Rating', 'Price'] as const;

export default function AstrologersScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
    const [sort, setSort] = useState<(typeof SORTS)[number]>('Rating');
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);

    useEffect(() => {
        void loadAstrologers();
    }, [filter]);

    const loadAstrologers = async () => {
        try {
            const params: Record<string, unknown> = { per_page: 50 };
            if (filter === 'Online') params.online = 1;
            else if (filter !== 'All') params.specialization = filter;

            const { data } = await api.get('/astrologers', { params });
            setAstrologers(data?.data ?? []);
        } catch (e) {
            console.warn('Astrologers load:', apiErrorMessage(e));
        }
    };

    const results = (() => {
        let list = [...astrologers];
        if (query.trim())
            list = list.filter((a) =>
                a.name.toLowerCase().includes(query.trim().toLowerCase()),
            );
        list.sort((a, b) =>
            sort === 'Rating'
                ? b.rating_avg - a.rating_avg
                : (a.rate_chat_per_min ?? 0) - (b.rate_chat_per_min ?? 0),
        );
        return list;
    })();

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Find your astrologer
            </Text>
            <Text
                style={[
                    typography.small,
                    { color: colors.textDim, marginTop: 2 },
                ]}
            >
                Chat, call or video — first 5 minutes free
            </Text>

            <View style={styles.searchWrap}>
                <Search color={colors.textFaint} size={18} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search by name…"
                    placeholderTextColor={colors.textFaint}
                    style={styles.searchInput}
                />
            </View>

            <View style={styles.chipsRow}>
                {FILTERS.map((f) => (
                    <Chip
                        key={f}
                        label={f}
                        active={filter === f}
                        onPress={() => setFilter(f)}
                    />
                ))}
            </View>
            <View style={styles.sortRow}>
                <Text style={[typography.tiny, { color: colors.textFaint }]}>
                    SORT BY
                </Text>
                {SORTS.map((s) => (
                    <Chip
                        key={s}
                        label={s}
                        active={sort === s}
                        onPress={() => setSort(s)}
                    />
                ))}
            </View>

            <FlatList
                data={results}
                keyExtractor={(a) => String(a.id)}
                contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <AstrologerCard
                        astrologer={item}
                        onPress={() => router.push(`/astrologer/${item.id}`)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState
                        title="No astrologers found"
                        message="Try a different filter or search term."
                    />
                }
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 12,
    },
    searchInput: { flex: 1, color: colors.text, fontSize: 14 },
    chipsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        marginBottom: 4,
    },
});
