import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AstrologerProfile, BreadcrumbItem } from '@/types';

type Props = {
    profile: AstrologerProfile | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/astrologer/dashboard' },
];

const statusMeta = {
    pending: {
        icon: Clock,
        title: 'Profile under review',
        description:
            "Your profile is awaiting admin approval. You'll be listed to customers once it's approved.",
    },
    approved: {
        icon: CheckCircle2,
        title: 'Profile approved',
        description:
            'Your profile is live and visible to customers looking for a consultation.',
    },
    rejected: {
        icon: XCircle,
        title: 'Profile needs changes',
        description:
            'An admin rejected your profile. Update it and resubmit for review.',
    },
} as const;

export default function AstrologerDashboard({ profile }: Props) {
    const status = profile?.status ?? 'pending';
    const meta = statusMeta[status];
    const Icon = meta.icon;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Astrologer dashboard"
                        description="Manage your public profile and consultation rates"
                    />
                    <Button asChild>
                        <Link href="/astrologer/profile">Edit profile</Link>
                    </Button>
                </div>

                <Alert>
                    <Icon />
                    <AlertTitle>{meta.title}</AlertTitle>
                    <AlertDescription>
                        {meta.description}
                        {status === 'rejected' && profile?.rejection_reason && (
                            <p className="text-foreground mt-1">
                                Reason: {profile.rejection_reason}
                            </p>
                        )}
                    </AlertDescription>
                </Alert>

                {profile && (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-muted-foreground text-sm font-normal">
                                    Chat rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {profile.rate_chat_per_min
                                    ? `₹${profile.rate_chat_per_min}/min`
                                    : '—'}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-muted-foreground text-sm font-normal">
                                    Call rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {profile.rate_call_per_min
                                    ? `₹${profile.rate_call_per_min}/min`
                                    : '—'}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-muted-foreground text-sm font-normal">
                                    Video rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {profile.rate_video_per_min
                                    ? `₹${profile.rate_video_per_min}/min`
                                    : '—'}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {profile && profile.specializations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Specializations</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-1.5">
                            {profile.specializations.map((specialization) => (
                                <Badge key={specialization} variant="secondary">
                                    {specialization}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AstrologerDashboard.layout = { breadcrumbs };
