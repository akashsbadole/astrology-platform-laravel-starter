import { LifeBuoy, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import { colors, radius, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';

type Ticket = { id: number; subject: string; body: string | null; status: string; created_at: string };
type Dispute = { id: number; subject: string; description: string | null; status: string; created_at: string };

export default function SupportScreen() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSupport(); }, []);

    const loadSupport = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/support');
            setTickets(data?.tickets?.data ?? []);
            setDisputes(data?.disputes?.data ?? []);
        } catch (e) { console.warn('Support load:', apiErrorMessage(e)); }
        finally { setLoading(false); }
    };

    const createTicket = () => {
        Alert.prompt?.('Support Ticket', 'Enter your subject:', async (subject) => {
            if (!subject) return;
            try {
                await api.post('/support/tickets', { subject, body: '' });
                Alert.alert('Success', 'Ticket raised successfully!');
                loadSupport();
            } catch (e) { Alert.alert('Error', apiErrorMessage(e)); }
        });
    };

    return (
        <Screen>
            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                <Text style={[typography.hero, { color: colors.text, fontSize: 24 }]}>Support</Text>
                <View style={styles.actionsRow}>
                    <Button title="New Ticket" icon={<MessageCircle color="#1A1408" size={16} />} onPress={createTicket} />
                </View>
                <Text style={[typography.title, { color: colors.text }]}>Tickets</Text>
                {tickets.length === 0 ? (
                    <Card><Text style={[typography.small, { color: colors.textDim }]}>No tickets yet.</Text></Card>
                ) : tickets.map((t) => (
                    <Card key={t.id}>
                        <View style={styles.itemRow}>
                            <Text style={[typography.subtitle, { color: colors.text }]}>{t.subject}</Text>
                            <Text style={[typography.tiny, { color: colors.textFaint }]}>{t.status}</Text>
                        </View>
                        {t.body && <Text style={[typography.small, { color: colors.textDim }]}>{t.body}</Text>}
                        <Text style={[typography.tiny, { color: colors.textFaint }]}>{timeAgo(t.created_at)}</Text>
                    </Card>
                ))}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    actionsRow: { flexDirection: 'row', gap: 12 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
