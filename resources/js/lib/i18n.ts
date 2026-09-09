import { router, usePage } from '@inertiajs/react';

export const SUPPORTED_LOCALES = ['en', 'hi', 'mr', 'ta', 'te'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
    en: 'English',
    hi: 'हिन्दी',
    mr: 'मराठी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
};

export function useLocale() {
    const { locale, translations } = usePage<{
        locale?: string;
        translations?: Record<string, string>;
    }>().props;

    const current = locale ?? 'en';
    const dict = translations ?? {};
    const t = (key: string): string => dict[key] ?? key;

    const setLocale = (next: string) => {
        router.post(
            '/locale',
            { locale: next },
            { preserveScroll: true, preserveState: false },
        );
    };

    return { locale: current, t, setLocale };
}
