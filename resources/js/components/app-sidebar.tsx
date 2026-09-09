import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    CalendarClock,
    CalendarDays,
    Flame,
    Gift,
    LayoutGrid,
    MessagesSquare,
    Newspaper,
    ShieldCheck,
    Sparkles,
    Star,
    UserCog,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth, NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Blog',
        href: '/blog',
        icon: Newspaper,
    },
    {
        title: 'Forum',
        href: '/forum',
        icon: MessagesSquare,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Panchang',
            href: '/panchang',
            icon: CalendarClock,
        },
        {
            title: 'Blog',
            href: '/blog',
            icon: Newspaper,
        },
        {
            title: 'Forum',
            href: '/forum',
            icon: MessagesSquare,
        },
        {
            title: 'Referrals',
            href: '/referrals',
            icon: Gift,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
        },
    ];

    if (auth.user.role === 'customer') {
        mainNavItems.push(
            {
                title: 'Find astrologers',
                href: '/customer/astrologers',
                icon: Sparkles,
            },
            {
                title: 'My bookings',
                href: '/customer/bookings',
                icon: CalendarDays,
            },
            {
                title: 'Pooja bookings',
                href: '/customer/pooja-bookings',
                icon: CalendarDays,
            },
            {
                title: 'Kundli',
                href: '/customer/kundli',
                icon: Star,
            },
            {
                title: 'Poojas',
                href: '/customer/poojas',
                icon: Flame,
            },
        );
    }

    if (auth.user.role === 'astrologer') {
        mainNavItems.push(
            {
                title: 'My profile',
                href: '/astrologer/profile',
                icon: UserCog,
            },
            {
                title: 'Availability',
                href: '/astrologer/availability',
                icon: CalendarClock,
            },
            {
                title: 'My bookings',
                href: '/astrologer/bookings',
                icon: CalendarDays,
            },
        );
    }

    if (auth.user.role === 'admin') {
        mainNavItems.push(
            {
                title: 'Astrologers',
                href: '/admin/astrologers',
                icon: ShieldCheck,
            },
            {
                title: 'Taxonomies',
                href: '/admin/taxonomies',
                icon: Sparkles,
            },
            {
                title: 'Poojas',
                href: '/admin/poojas',
                icon: Flame,
            },
            {
                title: 'Posts',
                href: '/admin/posts',
                icon: BookOpen,
            },
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
