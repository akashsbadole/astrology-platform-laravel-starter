import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { colors, typography, gradient } from '@/constants/theme';
import api from '@/lib/api';
import { RASHIS, RASHI_EMOJI } from '@/lib/mock';

export default function HoroscopeScreen() {
    const rashis = useMemo(() => {
        return RASHIS.map((name, i) => ({
            id: i + 1,
            rashi: name,
            emoji: RASHI_EMOJI[name] ?? '♈',
            lord: 'Shiva',
            element: ['Fire', 'Earth', 'Air', 'Water'][i % 4],
            positive: ['Courageous', 'Steady', 'Wise', 'Calm'][i % 4],
            negative: ['Impulsive', 'Stubborn', 'Restless', 'Emotional'][i % 4],
            daily: [
                'A good day to begin new work.',
                'Stay patient with family matters.',
                'Financial gains likely this week.',
                'Avoid heavy decisions today.',
                'Health needs attention — hydrate.',
                'A meeting could change your path.',
                'Creative energy is high — use it.',
                'Travel plans may shift unexpectedly.',
                'Focus on long-term goals today.',
                'An old friend may reconnect.',
                'Trust your instinct in love matters.',
                'Finish pending paperwork before Friday.',
            ][i],
            weekly: [
                'Career Breakthrough',
                'Family Harmony',
                'Financial Growth',
                'Relationship Deepening',
                'Health & Vitality',
                'New Beginnings',
                'Spiritual Turn',
                'Learning Opportunity',
                'Social Expansion',
                'Stability Returns',
                'Passion Ignites',
                'Recognition Ahead',
            ][i],
            monthly: [
                'A major planetary shift favors Saturn-ruled rashis — delays may clear by mid-month.',
                'Jupiter transit brightens luck and learning — ideal for education or travel plans.',
                'Mars energy is strong — channel it into fitness, ambitions, or disciplined work.',
                'Venus period supports relationships and art — expect harmony in close bonds.',
                'Rahu’s influence asks for caution in speculation — rely on research over impulse.',
                'Sun strengthens confidence — great window for leadership or public-facing work.',
                'Mercury speeds up communication — clear misunderstandings early.',
                'Ketu brings introspection — old patterns may resurface for release.',
                'Saturn’s discipline rewards consistent effort — routines pay off.',
                'Jupiter expands opportunities — say yes to growth, no to clutter.',
                'Mars tests patience — breathe before reacting, especially at home.',
                'Venus softens the month — romance, beauty, and comfort are highlighted.',
            ][i],
        }));
    }, []);

    return (
        <Screen padded={false}>
            <View style={styles.hero}>
                <Text
                    style={[typography.hero, styles.heroTitle, { color: '#fff' }]}
                >
                    Horoscope
                </Text>
                <Text
                    style={[
                        typography.body,
                        { color: 'rgba(255,255,255,0.7)' },
                    ]}
                >
                    Your daily cosmic guidance
                </Text>
            </View>