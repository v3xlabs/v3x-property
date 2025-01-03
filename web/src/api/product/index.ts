/* eslint-disable sonarjs/no-duplicate-string */
import {
    queryOptions,
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query';

import { useAuth } from '../auth';
import { apiRequest, BASE_URL, getHttp } from '../core';
import { paths } from '../schema.gen';

export const getProducts = (token: string | undefined) =>
    queryOptions({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await apiRequest('/product', 'get', {});

            return response.data;
        },
        enabled: !!token,
    });

export const useProducts = () => {
    const { token } = useAuth();

    return useQuery(getProducts(token));
};

export const getProductsSlim = () =>
    queryOptions({
        queryKey: ['products', 'slim'],
        queryFn: async () => {
            const response = await apiRequest('/product/slim', 'get', {});

            return response.data;
        },
    });

export const useProductsSlim = () => useQuery(getProductsSlim());

export const getProductById = (product_id: number) =>
    queryOptions({
        queryKey: ['product', '{product_id}', product_id],
        queryFn: async () => {
            const response = await apiRequest('/product/{product_id}', 'get', {
                path: { product_id },
            });

            return response.data;
        },
        retry: false,
    });

export const useProductById = (product_id: number) => {
    return useQuery(getProductById(product_id));
};

export const getProductMedia = (product_id: number) =>
    queryOptions({
        queryKey: ['product', product_id, 'media'],
        queryFn: getHttp<number[]>('/api/product/' + product_id + '/media', {
            auth: 'include',
        }),
    });

export const useProductMedia = (product_id: number) => {
    return useQuery(getProductMedia(product_id));
};

export type ApiProductLogResponse =
    paths['/product/{product_id}/logs']['get']['responses']['200']['content']['application/json; charset=utf-8'];

export const getProductLogs = (
    product_id: number
): UseQueryOptions<ApiProductLogResponse> => ({
    queryKey: ['product', product_id, 'logs'],
    queryFn: getHttp('/api/product/' + product_id + '/logs', {
        auth: 'include',
    }),
});

export const useProductLogs = (product_id: number) => {
    return useQuery(getProductLogs(product_id));
};

// Create product
// This endpoint provisions the desired product_id with a placeholder product
export const useCreateProduct = () => {
    return useMutation({
        mutationFn: async (name: string) =>
            fetch(BASE_URL + 'product?name=' + name, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
            }).then((response) => response.ok),
    });
};

// Delete product
// This endpoint deletes the product from the database and the search index.
export const useDeleteProduct = (
    options?: UseMutationOptions<boolean, Error, number>
) => {
    const { clearAuthToken } = useAuth();

    return useMutation({
        mutationFn: async (product_id: number) => {
            const response = await fetch(BASE_URL + 'product/' + product_id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
            });

            if (response.status === 401) {
                console.log('Token expired, clearing token');
                clearAuthToken();

                throw new Error('Token expired');
            }

            return response.ok;
        },
        ...options,
    });
};

// Edit product
export const useEditProduct = () => {
    return useMutation({
        mutationFn: async ({
            product_id,
            data,
        }: {
            product_id: number;
            data: paths['/product/{product_id}']['patch']['requestBody']['content']['application/json; charset=utf-8'];
        }) => {
            const response = await fetch(BASE_URL + 'product/' + product_id, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + useAuth.getState().token,
                },
                body: JSON.stringify(data),
            });

            return response.ok;
        },
    });
};
