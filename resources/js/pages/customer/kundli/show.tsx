import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

type Placement = {
    longitude: number;
    rashi: string;
    rashi_index: number;
    nakshatra: string;
    pada: number;
    house: number;
};

type KundliInfo = {
    id: number;
    profile_name: string;
    date_of_birth: string;
    time_of_birth: string;
    birth_place: string;
    ascendant_rashi: string;
    ascendant_rashi_index: number;
    ayanamsa: number;
};

type Antardasha = { lord: string; starts_at: string; ends_at: string };

type MahadashaPeriod = {
    lord: string;
    starts_at: string;
    ends_at: string;
    years: number;
    antardashas: Antardasha[];
};

type Props = {
    kundli: KundliInfo;
    placements: Record<string, Placement>;
    dashaTimeline: MahadashaPeriod[];
};

const RASHI_SHORT = [
    'Ari',
    'Tau',
    'Gem',
    'Can',
    'Leo',
    'Vir',
    'Lib',
    'Sco',
    'Sag',
    'Cap',
    'Aqu',
    'Pis',
];

const PLANET_ABBR: Record<string, string> = {
    sun: 'Su',
    moon: 'Mo',
    mars: 'Ma',
    mercury: 'Me',
    jupiter: 'Ju',
    venus: 'Ve',
    saturn: 'Sa',
    rahu: 'Ra',
    ketu: 'Ke',
};

// Fixed South Indian chart layout: sign index per grid cell, null = center (unused).
const GRID_RASHI: (number | null)[] = [
    11,
    0,
    1,
    2,
    10,
    null,
    null,
    3,
    9,
    null,
    null,
    4,
    8,
    7,
    6,
    5,
];

function isCurrentPeriod(startsAt: string, endsAt: string) {
    const today = new Date().toISOString().slice(0, 10);
    return startsAt <= today && today <= endsAt;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
    { title: 'Kundli', href: '/customer/kundli' },
    { title: 'Chart', href: '#' },
];

export default function KundliShow({
    kundli,
    placements,
    dashaTimeline,
}: Props) {
    const [expandedMahadasha, setExpandedMahadasha] = useState<number | null>(
        null,
    );

    const planetsByRashi = (rashiIndex: number) =>
        Object.entries(placements)
            .filter(([, p]) => p.rashi_index === rashiIndex)
            .map(([planet]) => planet);

    return (
        <>
            <Head title={`${kundli.profile_name}'s Kundli`} />
            <div className="grid gap-6 rounded-xl p-4 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Heading
                        title={`${kundli.profile_name}'s Kundli`}
                        description={`Born ${kundli.date_of_birth} at ${kundli.time_of_birth} · ${kundli.birth_place}`}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Birth chart (Rashi / South Indian style)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid aspect-square max-w-md grid-cols-4 grid-rows-4 gap-1">
                                {GRID_RASHI.map((rashiIndex, cellIndex) => {
                                    if (rashiIndex === null) {
                                        if (cellIndex === 5) {
                                            return (
                                                <div
                                                    key={cellIndex}
                                                    className="bg-muted/30 col-span-2 row-span-2 flex items-center justify-center rounded-md p-2 text-center text-xs font-medium"
                                                >
                                                    {kundli.profile_name}
                                                    <br />
                                                    Asc:{' '}
                                                    {kundli.ascendant_rashi}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }

                                    const planets = planetsByRashi(rashiIndex);
                                    const isAscendant =
                                        rashiIndex ===
                                        kundli.ascendant_rashi_index;

                                    return (
                                        <div
                                            key={cellIndex}
                                            className={`flex flex-col items-center justify-center rounded-md border p-1 text-center ${
                                                isAscendant
                                                    ? 'border-primary bg-primary/5'
                                                    : ''
                                            }`}
                                        >
                                            <span className="text-muted-foreground text-[10px]">
                                                {RASHI_SHORT[rashiIndex]}
                                                {isAscendant && ' (Asc)'}
                                            </span>
                                            <span className="text-xs leading-tight font-medium">
                                                {planets
                                                    .map((p) => PLANET_ABBR[p])
                                                    .join(' ')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Planetary placements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead className="text-muted-foreground text-left text-xs">
                                    <tr>
                                        <th className="pb-2">Planet</th>
                                        <th className="pb-2">Rashi</th>
                                        <th className="pb-2">House</th>
                                        <th className="pb-2">Nakshatra</th>
                                        <th className="pb-2">Pada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {Object.entries(placements).map(
                                        ([planet, p]) => (
                                            <tr key={planet}>
                                                <td className="py-1.5 capitalize">
                                                    {planet}
                                                </td>
                                                <td className="py-1.5">
                                                    {p.rashi}
                                                </td>
                                                <td className="py-1.5">
                                                    {p.house}
                                                </td>
                                                <td className="py-1.5">
                                                    {p.nakshatra}
                                                </td>
                                                <td className="py-1.5">
                                                    {p.pada}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Vimshottari Dasha
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm">
                            {dashaTimeline.map((period, index) => {
                                const current = isCurrentPeriod(
                                    period.starts_at,
                                    period.ends_at,
                                );
                                const expanded = expandedMahadasha === index;

                                return (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedMahadasha(
                                                    expanded ? null : index,
                                                )
                                            }
                                            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left ${
                                                current
                                                    ? 'bg-primary/10'
                                                    : 'hover:bg-accent'
                                            }`}
                                        >
                                            <span className="font-medium">
                                                {period.lord}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {period.starts_at} –{' '}
                                                {period.ends_at}
                                            </span>
                                            {current && (
                                                <Badge className="ml-2">
                                                    Current
                                                </Badge>
                                            )}
                                        </button>
                                        {expanded && (
                                            <ul className="border-muted ml-4 space-y-0.5 border-l pl-3 text-xs">
                                                {period.antardashas.map(
                                                    (sub, subIndex) => (
                                                        <li
                                                            key={subIndex}
                                                            className={`flex justify-between py-0.5 ${
                                                                isCurrentPeriod(
                                                                    sub.starts_at,
                                                                    sub.ends_at,
                                                                )
                                                                    ? 'text-primary font-medium'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        >
                                                            <span>
                                                                {sub.lord}
                                                            </span>
                                                            <span>
                                                                {sub.starts_at}{' '}
                                                                – {sub.ends_at}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

KundliShow.layout = { breadcrumbs };
