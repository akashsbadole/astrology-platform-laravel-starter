import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Props = {
    stats: {
        code: string;
        link: string;
        points: number;
        balance: number;
        total_referred: number;
        rewarded: number;
    };
    history: {
        data: Array<{
            id: number;
            points: number;
            type: string;
            description: string | null;
            created_at: string;
        }>;
    };
    referrals: {
        data: Array<{
            id: number;
            status: string;
            referred: { name: string } | null;
        }>;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Referrals', href: '/referrals' },
];

export default function ReferralsIndex({ stats, history, referrals }: Props) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(stats.link);
        } catch {
            // clipboard unavailable
        }
    };

    return (
        <>
            <Head title="Referrals & Loyalty" />
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 rounded-xl p-4">
                <Heading
                    title="Referrals & Loyalty"
                    description="Invite friends, earn points on every booking"
                />

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                        <CardContent className="py-4">
                            <p className="text-muted-foreground text-xs">
                                Your code
                            </p>
                            <p className="text-xl font-bold tracking-widest">
                                {stats.code}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={copy}
                            >
                                Copy link
                            </Button>
                            <p className="text-muted-foreground mt-1 text-[11px] break-all">
                                {stats.link}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4">
                            <p className="text-muted-foreground text-xs">
                                Points balance
                            </p>
                            <p className="text-xl font-bold">
                                {stats.balance} pts
                            </p>
                            <p className="text-muted-foreground text-xs">
                                1 pt = ₹1 off
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-4">
                            <p className="text-muted-foreground text-xs">
                                Referred
                            </p>
                            <p className="text-xl font-bold">
                                {stats.rewarded}/{stats.total_referred}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                rewarded / total
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Redeem points</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            method="post"
                            action="/referrals/redeem"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <div className="grid flex-1 gap-2">
                                        <Label htmlFor="points">
                                            Points (min 10)
                                        </Label>
                                        <Input
                                            id="points"
                                            name="points"
                                            type="number"
                                            min={10}
                                            max={stats.balance}
                                            defaultValue={100}
                                        />
                                    </div>
                                    <Button type="submit" className="self-end">
                                        Redeem
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Points history</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {history.data.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                No activity yet. Book a consultation to earn 5%
                                back.
                            </p>
                        )}
                        {history.data.map((h) => (
                            <div
                                key={h.id}
                                className="flex justify-between border-b py-1 last:border-0"
                            >
                                <span>
                                    {h.description ?? h.type}{' '}
                                    <span className="text-muted-foreground text-xs">
                                        {new Date(
                                            h.created_at,
                                        ).toLocaleDateString()}
                                    </span>
                                </span>
                                <span
                                    className={
                                        h.points >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }
                                >
                                    {h.points >= 0 ? `+${h.points}` : h.points}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invited friends</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {referrals.data.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                No referrals yet. Share your code above.
                            </p>
                        )}
                        {referrals.data.map((r) => (
                            <div
                                key={r.id}
                                className="flex justify-between border-b py-1 last:border-0"
                            >
                                <span>{r.referred?.name ?? 'New member'}</span>
                                <span className="text-muted-foreground text-xs capitalize">
                                    {r.status}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ReferralsIndex.layout = { breadcrumbs };
