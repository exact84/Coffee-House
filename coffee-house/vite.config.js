import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        menu: resolve(__dirname, 'menu.html'),
        cart: resolve(__dirname, 'cart.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo?.name ?? '';

          if (/\.(woff2?|ttf|otf)$/.test(name)) {
            return 'assets/fonts/[name][extname]';
          }
          if (/\.(png|jpe?g|gif|svg)$/.test(name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    open: 'index.html',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  publicDir: 'public',
});
