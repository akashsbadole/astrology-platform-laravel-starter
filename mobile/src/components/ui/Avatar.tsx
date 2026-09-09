import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { gradient } from '@/constants/theme';
import { initials } from '@/lib/format';

type Props = {
    name: string;
    size?: number;
    online?: boolean;
};

/** Gradient circle with initials + optional online dot. */
export default function Avatar({ name, size = 48, online }: Props) {
    return (
        <LinearGradient
            colors={gradient.violet}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.circle,
                { width: size, height: size, borderRadius: size / 2 },
            ]}
        >
            <Text style={[{ fontSize: size * 0.36 }, styles.initials]}>
                {initials(name)}
            </Text>
            {online ? (
                <View
                    style={[
                        styles.dot,
                        {
                            width: size * 0.26,
                            height: size * 0.26,
                            borderRadius: size * 0.13,
                            right: -1,
                            bottom: -1,
                        },
                    ]}
                />
            ) : null}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    circle: { alignItems: 'center', justifyContent: 'center' },
    initials: { color: '#fff', fontWeight: '800' },
    dot: {
        position: 'absolute',
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: '#0B0C1A',
    },
});
