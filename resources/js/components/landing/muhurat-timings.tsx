import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Period {
    starts_at: string;
    ends_at: string;
}

interface MuhuratTimingsProps {
    rahuKalam: Period;
    yamaganda: Period;
    gulikaKalam: Period;
}

const periods = [
    {
        label: 'Rahu Kalam',
        data: 'rahuKalam' as const,
        description: 'Avoid new beginnings',
    },
    {
        label: 'Yamaganda',
        data: 'yamaganda' as const,
        description: 'Inauspicious for important tasks',
    },
    {
        label: 'Gulika Kalam',
        data: 'gulikaKalam' as const,
        description: 'Unfavorable for auspicious work',
    },
];

export default function MuhuratTimings({
    rahuKalam,
    yamaganda,
    gulikaKalam,
}: MuhuratTimingsProps) {
    const map = { rahuKalam, yamaganda, gulikaKalam };

    return (
        <Card className="border-vedic-border bg-vedic-card">
            <CardHeader>
                <CardTitle className="text-vedic-fg text-base font-semibold">
                    Inauspicious Muhurat Timings
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                    Avoid important activities during these periods
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {periods.map((period) => {
                    const timing = map[period.data];
                    return (
                        <div
                            key={period.data}
                            className="border-vedic-border bg-vedic-muted/40 flex items-center justify-between rounded-lg border p-3"
                        >
                            <div>
                                <p className="text-vedic-fg text-sm font-semibold">
                                    {period.label}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {period.description}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-vedic-fg text-sm font-medium">
                                    {timing.starts_at} – {timing.ends_at}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
