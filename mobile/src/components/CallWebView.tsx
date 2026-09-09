import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, typography } from '@/constants/theme';
import api, { apiErrorMessage } from '@/lib/api';

type CallWebViewProps = {
    consultationId: number;
    visible: boolean;
    onClose: () => void;
    onEnded?: () => void;
};

export function CallWebView({ consultationId, visible, onClose, onEnded }: CallWebViewProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [webUrl, setWebUrl] = useState<string>('');

    useEffect(() => {
        if (!visible) return;
        (async () => {
            try {
                const { data } = await api.get(`/consult/${consultationId}`);
                const token = (globalThis as any).__AUTH_TOKEN__;
                const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, '') ?? 'http://10.0.2.2:8000';
                const url = `${baseUrl}/consult/${consultationId}?token=${token}`;
                setWebUrl(url);
            } catch (e) {
                setError(apiErrorMessage(e));
            } finally {
                setLoading(false);
            }
        })();
    }, [visible, consultationId]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'call-ended' || data.type === 'consultation-ended') {
                onEnded?.();
                onClose();
            }
        } catch {
            // ignore non-JSON messages
        }
    };

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.gold} />
                    <Text style={[typography.small, { color: colors.textDim, marginTop: 12 }]}>
                        Connecting call…
                    </Text>
                </View>
            )}
            {error && (
                <View style={styles.errorWrap}>
                    <Text style={[typography.subtitle, { color: colors.danger }]}>Call Error</Text>
                    <Text style={[typography.body, { color: colors.textDim, marginTop: 8 }]}>{error}</Text>
                </View>
            )}
            {webUrl && !error && (
                <WebView
                    source={{ uri: webUrl }}
                    onMessage={handleMessage}
                    onLoadEnd={() => setLoading(false)}
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    mixedContentMode="compatibility"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
