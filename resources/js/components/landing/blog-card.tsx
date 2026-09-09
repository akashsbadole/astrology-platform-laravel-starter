import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Blog {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    published_at: string;
    author_name: string;
}

interface BlogCardProps {
    blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
    return (
        <Card className="border-vedic-border bg-vedic-card transition-transform hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="space-y-2">
                <Badge
                    variant="outline"
                    className="border-vedic-border text-vedic-fg w-fit"
                >
                    Article
                </Badge>
                <CardTitle className="text-vedic-fg text-base leading-snug">
                    {blog.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-muted-foreground line-clamp-3 text-sm">
                    {blog.excerpt}
                </p>
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>{blog.author_name}</span>
                    <span>{blog.published_at}</span>
                </div>
                <Link
                    href={`/blog/${blog.slug}`}
                    className="text-vedic-primary text-sm font-semibold hover:underline"
                >
                    Read More →
                </Link>
            </CardContent>
        </Card>
    );
}
