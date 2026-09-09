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
        <Card className="border-vedic-border bg-vedic-card transition-transform hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <Badge
                        variant="outline"
                        className="border-vedic-border text-vedic-fg"
                    >
                        Festival
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                        {festival.date}
                    </span>
                </div>
                <CardTitle className="text-vedic-fg text-lg font-bold">
                    {festival.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">
                    {festival.description}
                </p>
            </CardContent>
        </Card>
    );
}
