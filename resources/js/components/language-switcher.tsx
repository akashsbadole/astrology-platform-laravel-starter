import { router, usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@/lib/i18n';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function LanguageSwitcher({
    compact = false,
}: {
    compact?: boolean;
}) {
    const { locale } = usePage<{ locale?: string }>().props;

    return (
        <div className="flex items-center gap-2">
            {!compact && <Languages className="text-muted-foreground size-4" />}
            <Select
                value={locale ?? 'en'}
                onValueChange={(value) =>
                    router.post(
                        '/locale',
                        { locale: value },
                        { preserveScroll: true },
                    )
                }
            >
                <SelectTrigger className={compact ? 'h-8 w-28' : 'h-9 w-36'}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {SUPPORTED_LOCALES.map((code) => (
                        <SelectItem key={code} value={code}>
                            {LOCALE_LABELS[code]} ({code})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
