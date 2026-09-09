import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
    referralCode?: string;
};

export default function Register({ passwordRules, referralCode }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label>I am joining as a</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="customer"
                                            defaultChecked
                                            className="sr-only"
                                            tabIndex={1}
                                        />
                                        Customer
                                    </label>
                                    <label className="has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex cursor-pointer items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="astrologer"
                                            className="sr-only"
                                            tabIndex={2}
                                        />
                                        Astrologer
                                    </label>
                                </div>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={3}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={4}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    Phone (for SMS + OTP, optional)
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={5}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="+919876543210"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="referral_code_input">
                                    Referral code (optional)
                                </Label>
                                <Input
                                    id="referral_code_input"
                                    type="text"
                                    name="referral_code_input"
                                    defaultValue={referralCode ?? ''}
                                    placeholder="e.g. A1B2C3D4"
                                />
                                <InputError
                                    message={errors.referral_code_input}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={7}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-muted-foreground text-center text-sm">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={8}>
                                Log in
                            </TextLink>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" asChild>
                                <a href="/auth/google/redirect">Google</a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="/auth/facebook/redirect">Facebook</a>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
