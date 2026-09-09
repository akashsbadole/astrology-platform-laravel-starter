import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Product', href: '/shop' }];

export default function ShopShow({
    product,
}: {
    product: {
        id: number;
        name: string;
        description: string | null;
        price: number;
        mrp: number | null;
        stock: number;
    };
}) {
    return (
        <>
            <Head title={product.name} />
            <div className="mx-auto max-w-xl space-y-4 p-4">
                <Heading
                    title={product.name}
                    description={`₹${product.price} · stock ${product.stock}`}
                />
                <Card>
                    <CardContent className="py-4 text-sm whitespace-pre-wrap">
                        {product.description ??
                            'Original, energised. Consult astrologer for suitability.'}
                    </CardContent>
                </Card>
                <Button
                    onClick={() =>
                        router.post('/shop/cart', { product_id: product.id })
                    }
                >
                    Add to cart
                </Button>
            </div>
        </>
    );
}

ShopShow.layout = { breadcrumbs };
