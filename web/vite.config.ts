import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [TanStackRouterVite(), react()],
    resolve: {
        alias: {
            '@': new URL('src', import.meta.url).pathname,
        },
    },
    server: {
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
