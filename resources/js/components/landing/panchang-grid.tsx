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
                    className="border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-md"
                >
                    <CardHeader>
                        <CardTitle className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                            {item.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold text-slate-900">
                            {item.name}
                        </p>
                        <p className="text-sm text-slate-600">{item.extra}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
