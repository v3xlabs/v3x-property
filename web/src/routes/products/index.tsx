import { createFileRoute } from '@tanstack/react-router';

import { useProducts } from '@/api/product';
import { SCPage } from '@/layouts/SimpleCenterPage';

export const Route = createFileRoute('/products/')({
    component: () => {
        const { data: products } = useProducts();

        return (
            <SCPage title="Products" width="2xl">
                <div className="card">
                    <p>All Products go here</p>
                    <ul>
                        {products?.map((product) => (
                            <li key={product.product_id}>{product.name}</li>
                        ))}
                    </ul>
                </div>
            </SCPage>
        );
    },
});
