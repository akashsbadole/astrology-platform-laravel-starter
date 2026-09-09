import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'AstroMall', href: '/shop' }];

export default function ShopIndex({
    products,
}: {
    products: {
        data: Array<{
            id: number;
            slug: string;
            name: string;
            price: number;
            mrp: number | null;
            stock: number;
        }>;
    };
}) {
    return (
        <>
            <Head title="AstroMall" />
            <div className="mx-auto max-w-4xl space-y-4 p-4">
                <Heading
                    title="AstroMall"
                    description="Gemstones, yantras, remedies — wallet or UPI"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                    {products.data.map((p) => (
                        <Card key={p.id}>
                            <CardContent className="space-y-1 py-4">
                                <Link
                                    href={`/shop/${p.slug}`}
                                    className="font-medium underline"
                                >
                                    {p.name}
                                </Link>
                                <p className="text-sm">
                                    ₹{p.price}
                                    {p.mrp ? (
                                        <span className="text-muted-foreground ml-2 text-xs line-through">
                                            ₹{p.mrp}
                                        </span>
                                    ) : null}
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() =>
                                        router.post('/shop/cart', {
                                            product_id: p.id,
                                        })
                                    }
                                >
                                    Add
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Link href="/shop/cart" className="text-sm underline">
                    Go to cart
                </Link>
            </div>
        </>
    );
}

ShopIndex.layout = { breadcrumbs };
