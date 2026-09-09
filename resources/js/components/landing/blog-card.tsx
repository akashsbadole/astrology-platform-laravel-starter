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
        <Card className="border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-white/10">
            <CardHeader className="space-y-2">
                <Badge
                    variant="outline"
                    className="w-fit border-yellow-500/30 text-yellow-400"
                >
                    Article
                </Badge>
                <CardTitle className="text-base leading-snug text-white">
                    {blog.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-white/70">
                    {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{blog.author_name}</span>
                    <span>{blog.published_at}</span>
                </div>
                <Link
                    href={`/blog/${blog.slug}`}
                    className="text-sm font-semibold text-yellow-400 hover:underline"
                >
                    Read More →
                </Link>
            </CardContent>
        </Card>
    );
}
