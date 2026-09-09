import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CalendarWidgetProps {
    todayFormatted: string;
    weekday: string;
    moonRashi: string;
    lunarPhase: string;
    tithi: { name: string; paksha: string; number: number };
    nakshatra: { name: string; pada: number };
    sunrise: string;
    sunset: string;
}

export default function CalendarWidget({
    todayFormatted,
    weekday,
    moonRashi,
    lunarPhase,
    tithi,
    nakshatra,
    sunrise,
    sunset,
}: CalendarWidgetProps) {
    const items = [
        { label: 'Moon Rashi', value: moonRashi, icon: '🌙' },
        { label: 'Lunar Phase', value: lunarPhase, icon: '🌕' },
        {
            label: 'Tithi',
            value: `${tithi.name} (${tithi.paksha} #${tithi.number})`,
            icon: '📅',
        },
        {
            label: 'Nakshatra',
            value: `${nakshatra.name} Pada ${nakshatra.pada}`,
            icon: '⭐',
        },
        { label: 'Sunrise', value: sunrise, icon: '🌅' },
        { label: 'Sunset', value: sunset, icon: '🌇' },
    ];

    return (
        <Card className="border-white/10 bg-white/5 text-white shadow-xl backdrop-blur-sm">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white">
                        Today&apos;s Calendar
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="border-white/20 text-yellow-400"
                    >
                        {weekday}
                    </Badge>
                </div>
                <p className="text-sm text-white/70">{todayFormatted}</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <div className="min-w-0">
                                <p className="text-xs tracking-wider text-white/50 uppercase">
                                    {item.label}
                                </p>
                                <p className="truncate text-sm font-semibold text-white">
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
