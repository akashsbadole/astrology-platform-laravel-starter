import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import blog from '@/routes/blog';
import RashiOrbit from '@/components/landing/rashi-orbit';
import CalendarWidget from '@/components/landing/calendar-widget';
import PanchangGrid from '@/components/landing/panchang-grid';
import MuhuratTimings from '@/components/landing/muhurat-timings';
import FestivalCard from '@/components/landing/festival-card';
import BlogCard from '@/components/landing/blog-card';
import CtaButton from '@/components/landing/cta-button';

type Blog = {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    published_at: string;
    author_name: string;
};

type Period = { starts_at: string; ends_at: string };

type InauspiciousPeriods = {
    rahu_kalam: Period;
    yamaganda: Period;
    gulika_kalam: Period;
};

type Props = {
    auth: { user: { name: string } | null };
    today: string;
    todayFormatted: string;
    place: string;
    weekday: string;
    sunrise: string;
    sunset: string;
    moonRashi: string;
    lunarPhase: string;
    tithi: { name: string; paksha: string; number: number };
    nakshatra: { name: string; pada: number };
    yoga: { name: string; number: number };
    karana: { name: string; number: number };
    inauspiciousPeriods: InauspiciousPeriods;
    festivals: Array<{ name: string; date: string; description: string }>;
    regionalHolidays: Array<{ state: string; holidays: string[] }>;
    blogs: Blog[];
};

export default function Welcome() {
    const {
        auth,
        todayFormatted,
        weekday,
        moonRashi,
        lunarPhase,
        tithi,
        nakshatra,
        yoga,
        karana,
        sunrise,
        sunset,
        festivals,
        regionalHolidays,
        blogs,
        inauspiciousPeriods,
    } = usePage<Props>().props;

    const panchangItems = [
        {
            label: 'Tithi',
            name: tithi.name,
            extra: `${tithi.paksha} Paksha #${tithi.number}`,
        },
        {
            label: 'Nakshatra',
            name: nakshatra.name,
            extra: `Pada ${nakshatra.pada}`,
        },
        { label: 'Yoga', name: yoga.name, extra: `#${yoga.number}` },
        { label: 'Karana', name: karana.name, extra: `#${karana.number}` },
    ];

    return (
        <>
            <Head title="AstroClone — Vedic Astrology, Kundli & Panchang" />
            <div className="bg-vedic-bg text-vedic-fg min-h-screen">
                {/* Header */}
                <header className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:p-6">
                    <p className="text-vedic-fg text-xl font-bold">
                        🔮 AstroClone
                    </p>
                    <nav className="flex flex-wrap gap-2 text-sm">
                        <Link
                            href="/astrologers"
                            className="text-vedic-fg hover:text-vedic-accent transition-colors"
                        >
                            Astrologers
                        </Link>
                        <Link
                            href="/horoscope"
                            className="text-vedic-fg hover:text-vedic-accent transition-colors"
                        >
                            Horoscope
                        </Link>
                        <Link
                            href="/shop"
                            className="text-vedic-fg hover:text-vedic-accent transition-colors"
                        >
                            AstroMall
                        </Link>
                        <Link
                            href="/live"
                            className="text-vedic-fg hover:text-vedic-accent transition-colors"
                        >
                            Live
                        </Link>
                        <Link
                            href="/blog"
                            className="text-vedic-fg hover:text-vedic-accent transition-colors"
                        >
                            Blog
                        </Link>
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="text-vedic-accent font-semibold hover:underline"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-vedic-fg hover:text-vedic-accent transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="text-vedic-accent font-semibold hover:underline"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-7xl space-y-12 p-4 sm:p-6">
                    {/* Hero Banner */}
                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0f0c29] py-12 sm:py-20">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12)_0,transparent_70%)]" />

                        <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:gap-12 lg:text-left">
                            <div className="flex-1 space-y-4 sm:space-y-6">
                                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                                    Discover Your{' '}
                                    <span className="bg-gradient-to-r from-orange-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                                        Cosmic Destiny
                                    </span>
                                </h1>
                                <p className="text-muted-foreground mx-auto max-w-2xl">
                                    Explore ancient Vedic wisdom with accurate
                                    Panchang, personalized Kundli, daily
                                    horoscopes, and live consultations with
                                    expert astrologers.
                                </p>
                                <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                                    <CtaButton
                                        href={register()}
                                        variant="primary"
                                        size="lg"
                                    >
                                        Get Your Free Kundli
                                    </CtaButton>
                                    <CtaButton
                                        href="/panchang"
                                        variant="secondary"
                                        size="lg"
                                    >
                                        Explore Today&apos;s Panchang
                                    </CtaButton>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <RashiOrbit />
                            </div>
                        </div>
                    </section>

                    {/* Today's Calendar Widget */}
                    <section className="space-y-4">
                        <CalendarWidget
                            todayFormatted={todayFormatted}
                            weekday={weekday}
                            moonRashi={moonRashi}
                            lunarPhase={lunarPhase}
                            tithi={tithi}
                            nakshatra={nakshatra}
                            sunrise={sunrise}
                            sunset={sunset}
                        />
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <CtaButton
                                href="/panchang"
                                variant="primary"
                                size="md"
                                className="flex-1"
                            >
                                Explore Full Panchang →
                            </CtaButton>
                            <CtaButton
                                href={register()}
                                variant="outline"
                                size="md"
                                className="flex-1"
                            >
                                Sign Up for Daily Horoscope
                            </CtaButton>
                        </div>
                    </section>

                    {/* Full Hindu Calendar Section */}
                    <section className="border-vedic-border bg-vedic-card space-y-8 rounded-3xl border p-6 sm:p-8">
                        <div className="space-y-2 text-center">
                            <h2 className="text-vedic-fg text-2xl font-bold sm:text-3xl">
                                Hindu (Vedic) Calendar
                            </h2>
                            <p className="text-muted-foreground">
                                Tithi, Nakshatra, Yoga, Karana, and auspicious
                                timings for {todayFormatted}
                            </p>
                        </div>

                        <PanchangGrid items={panchangItems} />

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-vedic-fg text-lg font-semibold">
                                    Upcoming Festivals
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {festivals.slice(0, 4).map((festival) => (
                                        <FestivalCard
                                            key={festival.name}
                                            festival={festival}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-vedic-fg text-lg font-semibold">
                                    Regional Holiday Markers
                                </h3>
                                <div className="space-y-3">
                                    {regionalHolidays.map((region) => (
                                        <div
                                            key={region.state}
                                            className="border-vedic-border bg-vedic-muted/40 rounded-lg border p-3"
                                        >
                                            <p className="text-vedic-fg text-sm font-semibold">
                                                {region.state}
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {region.holidays.map(
                                                    (holiday) => (
                                                        <span
                                                            key={holiday}
                                                            className="bg-vedic-primary/10 text-vedic-primary rounded-full px-2 py-0.5 text-xs"
                                                        >
                                                            {holiday}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <MuhuratTimings
                            rahuKalam={inauspiciousPeriods.rahu_kalam}
                            yamaganda={inauspiciousPeriods.yamaganda}
                            gulikaKalam={inauspiciousPeriods.gulika_kalam}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <CtaButton
                                href="/customer/poojas"
                                variant="primary"
                                size="md"
                                className="flex-1"
                            >
                                Book Pooja / Consult Astrologer
                            </CtaButton>
                            <CtaButton
                                href="/customer/kundli/create"
                                variant="secondary"
                                size="md"
                                className="flex-1"
                            >
                                Create Your Kundli
                            </CtaButton>
                        </div>
                    </section>

                    {/* About Us Section */}
                    <section className="bg-vedic-card space-y-8 rounded-3xl p-6 sm:p-8">
                        <div className="space-y-2 text-center">
                            <h2 className="text-vedic-fg text-2xl font-bold sm:text-3xl">
                                About AstroClone
                            </h2>
                            <p className="text-muted-foreground mx-auto max-w-2xl">
                                Bridging ancient Vedic astrology with modern
                                technology to deliver accurate predictions,
                                personalized remedies, and meaningful spiritual
                                guidance.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    title: 'Expert Vedic Astrologers',
                                    description:
                                        'Verified astrologers with deep knowledge of Vedic scriptures and predictive techniques.',
                                    icon: '🧘',
                                },
                                {
                                    title: 'Accurate Panchang & Muhurat',
                                    description:
                                        'Real-time Panchang calculations for any location with precise muhurat timings.',
                                    icon: '📿',
                                },
                                {
                                    title: 'Personalized Kundli & Remedies',
                                    description:
                                        'Detailed birth chart analysis with dosha remedies, gemstone, and ritual suggestions.',
                                    icon: '🔮',
                                },
                                {
                                    title: 'Live Consultation',
                                    description:
                                        'Chat, call, or video consult with astrologers anytime, anywhere.',
                                    icon: '📞',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="border-vedic-border bg-vedic-muted/40 rounded-xl border p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <span className="text-4xl">
                                        {item.icon}
                                    </span>
                                    <h3 className="text-vedic-fg mt-3 text-base font-bold">
                                        {item.title}
                                    </h3>
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { value: '15+', label: 'Years Expertise' },
                                { value: '50K+', label: 'Happy Users' },
                                { value: '200+', label: 'Expert Astrologers' },
                                { value: '1M+', label: 'Consultations' },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="border-vedic-border bg-vedic-muted/40 rounded-xl border p-4 text-center"
                                >
                                    <p className="text-vedic-accent text-2xl font-bold">
                                        {stat.value}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <CtaButton
                                href={register()}
                                variant="primary"
                                size="lg"
                            >
                                Start Your Journey
                            </CtaButton>
                        </div>
                    </section>

                    {/* Blogs Section */}
                    <section className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-vedic-fg text-2xl font-bold sm:text-3xl">
                                Latest from Our Blog
                            </h2>
                            <p className="text-muted-foreground">
                                Rashi insights, festival guides, astrology tips,
                                and spiritual wellness.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <CtaButton
                                href={blog.index()}
                                variant="secondary"
                                size="lg"
                            >
                                Explore All Articles →
                            </CtaButton>
                        </div>
                    </section>

                    {/* Bottom CTA Strip */}
                    <section className="from-vedic-primary to-vedic-secondary rounded-3xl bg-gradient-to-r p-8 text-center sm:p-12">
                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            Join AstroClone Today
                        </h2>
                        <p className="mt-2 text-white/80">
                            Sign up for free and unlock personalized Vedic
                            astrology insights.
                        </p>
                        <div className="mt-6">
                            <CtaButton
                                href={register()}
                                variant="primary"
                                size="lg"
                                className="text-vedic-primary bg-white hover:bg-white/90"
                            >
                                Create Free Account
                            </CtaButton>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-vedic-border bg-vedic-card mt-12 border-t">
                    <div className="mx-auto max-w-7xl p-6 sm:p-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="text-vedic-fg font-bold">
                                🔮 AstroClone
                            </p>
                            <p className="text-muted-foreground text-sm">
                                © {new Date().getFullYear()} AstroClone. All
                                rights reserved.
                            </p>
                            <div className="text-muted-foreground flex gap-4 text-sm">
                                <Link
                                    href="/blog"
                                    className="hover:text-vedic-accent transition-colors"
                                >
                                    Blog
                                </Link>
                                <Link
                                    href="/horoscope"
                                    className="hover:text-vedic-accent transition-colors"
                                >
                                    Horoscope
                                </Link>
                                <Link
                                    href="/panchang"
                                    className="hover:text-vedic-accent transition-colors"
                                >
                                    Panchang
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
