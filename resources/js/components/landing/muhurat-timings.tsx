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
        <Card className="border-slate-200 bg-white text-slate-900 shadow-lg">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">
                    Inauspicious Muhurat Timings
                </CardTitle>
                <p className="text-sm text-slate-500">
                    Avoid important activities during these periods
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {periods.map((period) => {
                    const timing = map[period.data];
                    return (
                        <div
                            key={period.data}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    {period.label}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {period.description}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-orange-600">
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
