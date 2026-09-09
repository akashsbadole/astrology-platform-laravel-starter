import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function OtpVerify({ identifier }: { identifier: string }) {
    return (
        <>
            <Head title="Enter OTP" />
            <Form
                method="post"
                action="/login/otp/verify"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <input
                            type="hidden"
                            name="identifier"
                            value={identifier}
                        />
                        <div className="grid gap-2">
                            <Label htmlFor="code">
                                6-digit code sent to {identifier || 'you'}
                            </Label>
                            <Input
                                id="code"
                                name="code"
                                required
                                autoFocus
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="123456"
                            />
                            <InputError
                                message={errors.code ?? errors.identifier}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Verify and log in
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

OtpVerify.layout = {
    title: 'Enter your code',
    description: 'Check your SMS or email for the 6-digit code',
};
