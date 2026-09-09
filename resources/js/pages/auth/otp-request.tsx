import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';

export default function OtpRequest() {
    return (
        <>
            <Head title="Login with OTP" />
            <Form
                method="post"
                action="/login/otp"
                resetOnSuccess
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="identifier">Phone or email</Label>
                            <Input
                                id="identifier"
                                name="identifier"
                                required
                                autoFocus
                                placeholder="+919876543210 or you@example.com"
                            />
                            <InputError message={errors.identifier} />
                            <p className="text-muted-foreground text-xs">
                                We will send a 6-digit code valid for 5 minutes.
                                New users get an account automatically.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            Send code
                        </Button>
                        <div className="text-muted-foreground text-center text-sm">
                            <TextLink href={login()}>
                                Back to password login
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

OtpRequest.layout = {
    title: 'Login with OTP',
    description: 'Enter your phone or email to receive a one-time code',
};
