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
        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-white/10">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <Badge
                        variant="outline"
                        className="border-yellow-500/30 text-yellow-400"
                    >
                        Festival
                    </Badge>
                    <span className="text-xs text-white/60">
                        {festival.date}
                    </span>
                </div>
                <CardTitle className="text-lg font-bold text-white">
                    {festival.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-white/70">{festival.description}</p>
            </CardContent>
        </Card>
    );
}
