import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import type { AstrologerProfile, BreadcrumbItem } from '@/types';

type Props = {
    profile: AstrologerProfile | null;
    specializationOptions: string[];
    languageOptions: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/astrologer/dashboard' },
    { title: 'Edit profile', href: '/astrologer/profile' },
];

export default function AstrologerProfileEdit({
    profile,
    specializationOptions,
    languageOptions,
}: Props) {
    return (
        <>
            <Head title="Edit profile" />
            <div className="max-w-2xl space-y-6 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Edit profile"
                        description="Customers see this information when browsing astrologers"
                    />
                    {profile?.status && (
                        <Badge
                            variant={
                                profile.status === 'approved'
                                    ? 'default'
                                    : profile.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                            }
                            className="capitalize"
                        >
                            {profile.status}
                        </Badge>
                    )}
                </div>

                <Form
                    action="/astrologer/profile"
                    method="put"
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors, wasSuccessful }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    rows={5}
                                    placeholder="Tell customers about your experience and approach"
                                    defaultValue={profile?.bio ?? ''}
                                />
                                <InputError message={errors.bio} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Specializations</Label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {specializationOptions.map((option) => (
                                        <label
                                            key={option}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                name="specializations[]"
                                                value={option}
                                                defaultChecked={profile?.specializations.includes(
                                                    option,
                                                )}
                                                className="accent-primary size-4"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.specializations} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Languages</Label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {languageOptions.map((option) => (
                                        <label
                                            key={option}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                name="languages[]"
                                                value={option}
                                                defaultChecked={profile?.languages.includes(
                                                    option,
                                                )}
                                                className="accent-primary size-4"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.languages} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="experience_years">
                                    Years of experience
                                </Label>
                                <Input
                                    id="experience_years"
                                    name="experience_years"
                                    type="number"
                                    min={0}
                                    max={80}
                                    required
                                    defaultValue={
                                        profile?.experience_years ?? 0
                                    }
                                    className="max-w-40"
                                />
                                <InputError message={errors.experience_years} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="rate_chat_per_min">
                                        Chat rate (₹/min)
                                    </Label>
                                    <Input
                                        id="rate_chat_per_min"
                                        name="rate_chat_per_min"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        defaultValue={
                                            profile?.rate_chat_per_min ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.rate_chat_per_min}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="rate_call_per_min">
                                        Call rate (₹/min)
                                    </Label>
                                    <Input
                                        id="rate_call_per_min"
                                        name="rate_call_per_min"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        defaultValue={
                                            profile?.rate_call_per_min ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.rate_call_per_min}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="rate_video_per_min">
                                        Video rate (₹/min)
                                    </Label>
                                    <Input
                                        id="rate_video_per_min"
                                        name="rate_video_per_min"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        defaultValue={
                                            profile?.rate_video_per_min ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.rate_video_per_min}
                                    />
                                </div>
                            </div>

                            {profile?.status === 'approved' && (
                                <p className="text-muted-foreground text-sm">
                                    Saving changes will send your profile back
                                    for admin review before it's visible to
                                    customers again.
                                </p>
                            )}

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Save profile
                                </Button>
                                {wasSuccessful && (
                                    <p className="text-sm text-green-600 dark:text-green-500">
                                        Saved.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AstrologerProfileEdit.layout = { breadcrumbs };
