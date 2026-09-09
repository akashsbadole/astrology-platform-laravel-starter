import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

export default function KundliCreateScreen() {
    const [form, setForm] = useState({
        profile_name: '',
        gender: 'male',
        date_of_birth: '',
        time_of_birth: '',
        birth_place: '',
        utc_offset_hours: '5.5',
    });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/kundli', form);
            Alert.alert('Success', 'Kundli created', [
                { text: 'OK', onPress: () => {} },
            ]);
        } catch (e) {
            Alert.alert('Error', apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={[
                        typography.hero,
                        { color: colors.text, fontSize: 24 },
                    ]}
                >
                    Create Kundli
                </Text>
                <Card>
                    <Text style={[typography.body, { color: colors.text }]}>
                        Profile Name
                    </Text>
                    <TextInput
                        value={form.profile_name}
                        onChangeText={(text) =>
                            setForm({ ...form, profile_name: text })
                        }
                        placeholder="e.g. Self, Partner"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                    <Text
                        style={[
                            typography.body,
                            { color: colors.text, marginTop: 12 },
                        ]}
                    >
                        Date of Birth
                    </Text>
                    <TextInput
                        value={form.date_of_birth}
                        onChangeText={(text) =>
                            setForm({ ...form, date_of_birth: text })
                        }
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                    <Text
                        style={[
                            typography.body,
                            { color: colors.text, marginTop: 12 },
                        ]}
                    >
                        Time of Birth
                    </Text>
                    <TextInput
                        value={form.time_of_birth}
                        onChangeText={(text) =>
                            setForm({ ...form, time_of_birth: text })
                        }
                        placeholder="HH:MM"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                    <Text
                        style={[
                            typography.body,
                            { color: colors.text, marginTop: 12 },
                        ]}
                    >
                        Birth Place
                    </Text>
                    <TextInput
                        value={form.birth_place}
                        onChangeText={(text) =>
                            setForm({ ...form, birth_place: text })
                        }
                        placeholder="City, Country"
                        placeholderTextColor={colors.textFaint}
                        style={styles.input}
                    />
                </Card>
                <Button
                    title="Generate Kundli"
                    loading={loading}
                    onPress={submit}
                />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    input: {
        marginTop: 8,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 14,
    },
});
