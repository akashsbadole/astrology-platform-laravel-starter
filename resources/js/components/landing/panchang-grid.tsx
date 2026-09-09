import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PanchangItem {
    label: string;
    name: string;
    extra: string;
}

interface PanchangGridProps {
    items: PanchangItem[];
}

export default function PanchangGrid({ items }: PanchangGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card
                    key={item.label}
                    className="border-vedic-border bg-vedic-card transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                    <CardHeader>
                        <CardTitle className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                            {item.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-vedic-fg text-lg font-bold">
                            {item.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {item.extra}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
