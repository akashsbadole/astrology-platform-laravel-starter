import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface CtaButtonProps {
    href: NonNullable<InertiaLinkProps['href']>;
    children: React.ReactNode;
    variant?: Variant;
    size?: Size;
    className?: string;
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-vedic-primary text-white shadow-lg shadow-orange-500/20 hover:bg-vedic-primary/90',
    secondary:
        'bg-vedic-secondary text-white shadow-lg shadow-purple-500/20 hover:bg-vedic-secondary/90',
    outline: 'border border-vedic-border text-vedic-fg hover:bg-vedic-muted',
};

const sizeClasses: Record<Size, string> = {
    sm: 'rounded-full px-4 py-2 text-sm',
    md: 'rounded-full px-6 py-3 text-base font-semibold',
    lg: 'rounded-full px-8 py-4 text-lg font-bold',
};

export default function CtaButton({
    href,
    children,
    variant = 'primary',
    size = 'md',
    className,
}: CtaButtonProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center justify-center transition-all duration-300',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
        >
            {children}
        </Link>
    );
}
