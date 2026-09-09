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
                    className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-white/10"
                >
                    <CardHeader>
                        <CardTitle className="text-xs font-medium tracking-wider text-white/50 uppercase">
                            {item.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold text-white">
                            {item.name}
                        </p>
                        <p className="text-sm text-white/70">{item.extra}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
