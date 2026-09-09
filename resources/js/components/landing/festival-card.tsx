import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Festival {
    name: string;
    date: string;
    description: string;
}

interface FestivalCardProps {
    festival: Festival;
}

export default function FestivalCard({ festival }: FestivalCardProps) {
    return (
        <Card className="border-orange-200 bg-white text-slate-900 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-md">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <Badge
                        variant="outline"
                        className="border-orange-500/30 text-orange-700"
                    >
                        Festival
                    </Badge>
                    <span className="text-xs text-slate-500">
                        {festival.date}
                    </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">
                    {festival.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600">{festival.description}</p>
            </CardContent>
        </Card>
    );
}
