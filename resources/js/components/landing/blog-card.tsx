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
        <Card className="border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-md">
            <CardHeader className="space-y-2">
                <Badge
                    variant="outline"
                    className="w-fit border-orange-500/30 text-orange-700"
                >
                    Article
                </Badge>
                <CardTitle className="text-base leading-snug text-slate-900">
                    {blog.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="line-clamp-3 text-sm text-slate-600">
                    {blog.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{blog.author_name}</span>
                    <span>{blog.published_at}</span>
                </div>
                <Link
                    href={`/blog/${blog.slug}`}
                    className="text-sm font-semibold text-orange-600 hover:underline"
                >
                    Read More →
                </Link>
            </CardContent>
        </Card>
    );
}
