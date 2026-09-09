import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Products', href: '#' }];

export default function Products({
    products,
}: {
    products: {
        data: Array<{
            id: number;
            name: string;
            price_paise: number;
            stock: number;
        }>;
    };
}) {
    return (
        <>
            <Head title="Products" />
            <div className="space-y-3 p-4">
                <Heading title="AstroMall products" />
                <Card>
                    <CardContent className="py-3">
                        <Form
                            method="post"
                            action="/admin/ops/products"
                            className="flex gap-2"
                        >
                            {() => (
                                <>
                                    <Input
                                        name="name"
                                        placeholder="Yellow Sapphire 5ct"
                                        required
                                    />
                                    <Input
                                        name="price"
                                        type="number"
                                        placeholder="₹"
                                        required
                                    />
                                    <Input
                                        name="stock"
                                        type="number"
                                        placeholder="stock"
                                    />
                                    <Button size="sm" type="submit">
                                        Create
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                {products.data.map((p) => (
                    <Card key={p.id}>
                        <CardContent className="py-2 text-sm">
                            {p.name} · ₹{(p.price_paise / 100).toFixed(0)} ·
                            stock {p.stock}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
Products.layout = { breadcrumbs };
