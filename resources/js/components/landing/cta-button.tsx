import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 focus:ring-offset-white focus:outline-none',
    {
        variants: {
            variant: {
                primary:
                    'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/40',
                secondary:
                    'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:from-orange-700 hover:to-amber-700 hover:shadow-orange-500/40',
                outline:
                    'border border-orange-500 bg-white text-orange-700 hover:border-orange-600 hover:bg-orange-50',
            },
            size: {
                sm: 'px-4 py-2 text-sm',
                md: 'px-6 py-3 text-base',
                lg: 'px-8 py-4 text-lg',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

interface CtaButtonProps {
    href: NonNullable<InertiaLinkProps['href']>;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function CtaButton({
    href,
    children,
    variant,
    size,
    className,
}: CtaButtonProps) {
    return (
        <Link
            href={href}
            className={cn(buttonVariants({ variant, size, className }))}
        >
            {children}
        </Link>
    );
}
