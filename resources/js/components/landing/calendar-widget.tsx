import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        { label: "Moon Rashi", value: moonRashi, icon: "🌙" },
        { label: "Lunar Phase", value: lunarPhase, icon: "🌕" },
        {
            label: "Tithi",
            value: `${tithi.name} (${tithi.paksha} #${tithi.number})`,
            icon: "📅",
        },
        {
            label: "Nakshatra",
            value: `${nakshatra.name} Pada ${nakshatra.pada}`,
            icon: "⭐",
        },
        { label: "Sunrise", value: sunrise, icon: "🌅" },
        { label: "Sunset", value: sunset, icon: "🌇" },
    ];

    return (
        <Card className="border-slate-200 bg-white text-slate-900 shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-900">
                        Today&apos;s Calendar
                    </CardTitle>
                    <Badge
                        variant="outline"
                        className="border-orange-200 text-orange-700"
                    >
                        {weekday}
                    </Badge>
                </div>
                <p className="text-sm text-slate-500">{todayFormatted}</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <div className="min-w-0">
                                <p className="text-xs tracking-wider text-slate-500 uppercase">
                                    {item.label}
                                </p>
                                <p className="truncate text-sm font-semibold text-slate-900">
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
