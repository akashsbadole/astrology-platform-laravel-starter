import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: { name: string } | null } }>()
        .props as unknown as { auth: { user: { name: string } | null } };

    return (
        <>
            <Head title="AstroTalk Clone — Chat, Call, Kundli, Pooja" />
            <div className="min-h-screen bg-orange-50 text-stone-900">
                <header className="mx-auto flex max-w-5xl items-center justify-between p-4">
                    <p className="text-xl font-bold">🔮 AstroClone</p>
                    <nav className="flex gap-2 text-sm">
                        <Link href="/astrologers" className="underline">
                            Astrologers
                        </Link>
                        <Link href="/horoscope" className="underline">
                            Horoscope
                        </Link>
                        <Link href="/shop" className="underline">
                            AstroMall
                        </Link>
                        <Link href="/live" className="underline">
                            Live
                        </Link>
                        <Link href="/blog" className="underline">
                            Blog
                        </Link>
                        {auth.user ? (
                            <Link href={dashboard()} className="underline">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="underline">
                                    Log in
                                </Link>
                                <Link href={register()} className="underline">
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <main className="mx-auto max-w-5xl space-y-6 p-4">
                    <div className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white">
                        <h1 className="text-3xl font-bold">
                            Chat / Call with astrologers — first 5 min free
                        </h1>
                        <p className="mt-2">
                            Wallet per-minute billing · Kundli & Milan free ·
                            Daily horoscope · Pooja & AstroMall · Live sessions
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Link
                                href="/astrologers"
                                className="rounded bg-white px-4 py-2 text-sm font-bold text-orange-600"
                            >
                                Chat Now
                            </Link>
                            <Link
                                href="/horoscope"
                                className="rounded border border-white px-4 py-2 text-sm"
                            >
                                Today's horoscope
                            </Link>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            [
                                'Wallet billing',
                                '/wallet',
                                'Recharge once, pay per minute. Auto-cut at ₹0.',
                            ],
                            [
                                'Kundli Milan 36 guna',
                                '/customer/milan',
                                'Match + Manglik check, then discuss.',
                            ],
                            [
                                'Live + AstroMall',
                                '/live',
                                'Join live rooms, gifts, remedies shop.',
                            ],
                        ].map(([t, h, d]) => (
                            <Link
                                key={t}
                                href={h}
                                className="rounded border bg-white p-4"
                            >
                                <p className="font-bold">{t}</p>
                                <p className="text-muted-foreground text-sm">
                                    {d}
                                </p>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
