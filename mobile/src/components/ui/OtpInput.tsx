import { useRef } from 'react';
import { StyleSheet, TextInput, View, type ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';

type Props = {
    code: string;
    onChange: (code: string) => void;
    length?: number;
    style?: ViewStyle;
};

/** 6-digit OTP boxes with auto-advance and backspace. */
export default function OtpInput({ code, onChange, length = 6, style }: Props) {
    const refs = useRef<Array<TextInput | null>>([]);

    const setDigit = (index: number, digit: string) => {
        const clean = digit.replace(/\D/g, '');
        if (!clean) {
            const next = code.split('');
            next[index] = '';
            onChange(next.join('').padEnd(length, ' ').replace(/\s+$/, ''));
            return;
        }
        const next = code.split('');
        next[index] = clean[clean.length - 1];
        onChange(next.join('').padEnd(length, ' ').replace(/\s+$/, ''));
        if (clean && index < length - 1) refs.current[index + 1]?.focus();
    };

    return (
        <View style={[styles.row, style]}>
            {Array.from({ length }).map((_, i) => (
                <TextInput
                    key={i}
                    ref={(r) => {
                        refs.current[i] = r;
                    }}
                    style={[styles.box, code[i] ? styles.filled : null]}
                    value={code[i] ?? ''}
                    onChangeText={(t) => setDigit(i, t)}
                    onKeyPress={({ nativeEvent }) => {
                        if (
                            nativeEvent.key === 'Backspace' &&
                            !code[i] &&
                            i > 0
                        )
                            refs.current[i - 1]?.focus();
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
    box: {
        width: 46,
        height: 54,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    filled: { borderColor: colors.gold, backgroundColor: colors.goldSoft },
});
