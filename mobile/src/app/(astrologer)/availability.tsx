import { Calendar, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type Slot = {
    id: number;
    day_of_week: number;
    day_label: string;
    start_time: string;
    end_time: string;
};

export default function AstrologerAvailabilityScreen() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [days, setDays] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/astrologer/availability');
            setSlots(data?.slots ?? []);
            setDays(data?.days ?? []);
        } catch (e) {
            console.warn('Availability load:', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const addSlot = async () => {
        if (days.length === 0) return;
        try {
            await api.post('/astrologer/availability', {
                day_of_week: 0,
                start_time: '09:00',
                end_time: '17:00',
            });
            loadAvailability();
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        }
    };

    const deleteSlot = async (id: number) => {
        try {
            await api.delete(`/astrologer/availability/${id}`);
            setSlots((prev) => prev.filter((s) => s.id !== id));
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        }
    };

    return (
        <Screen>
            <Text
                style={[typography.hero, { color: colors.text, fontSize: 24 }]}
            >
                Availability
            </Text>
            <Text
                style={[
                    typography.small,
                    { color: colors.textDim, marginTop: 2 },
                ]}
            >
                Set your weekly schedule
            </Text>
            <FlatList
                data={slots}
                keyExtractor={(s) => String(s.id)}
                contentContainerStyle={{
                    gap: 12,
                    paddingTop: 16,
                    paddingBottom: 24,
                }}
                renderItem={({ item }) => (
                    <Card>
                        <View style={styles.slotRow}>
                            <View style={styles.slotInfo}>
                                <Calendar color={colors.gold} size={18} />
                                <View>
                                    <Text
                                        style={[
                                            typography.subtitle,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {item.day_label}
                                    </Text>
                                    <Text
                                        style={[
                                            typography.small,
                                            { color: colors.textDim },
                                        ]}
                                    >
                                        {item.start_time} – {item.end_time}
                                    </Text>
                                </View>
                            </View>
                            <Pressable onPress={() => deleteSlot(item.id)}>
                                <Trash2 color={colors.danger} size={18} />
                            </Pressable>
                        </View>
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
                            No slots set. Add your availability.
                        </Text>
                    </Card>
                }
            />
            <Button
                title="Add Slot"
                icon={<Plus color="#1A1408" size={16} />}
                onPress={addSlot}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    slotInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
