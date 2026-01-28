import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Helper to copy and transform manifest.json
const copyManifest = (env: Record<string, string>) => {
    return {
        name: 'copy-manifest',
        writeBundle() {
            const manifestPath = resolve(__dirname, 'src/manifest.json');
            let manifest = fs.readFileSync(manifestPath, 'utf-8');

            // Replace the placeholder with the actual client ID from .env
            if (env.VITE_GOOGLE_CLIENT_ID) {
                manifest = manifest.replace(
                    'PASTE_YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com',
                    `${env.VITE_GOOGLE_CLIENT_ID}.apps.googleusercontent.com`
                );
            }

            fs.writeFileSync(resolve(__dirname, 'dist/manifest.json'), manifest);
        }
    };
};

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [copyManifest(env)],
        build: {
            rollupOptions: {
                input: {
                    popup: resolve(__dirname, 'src/popup/popup.html'),
                    background: resolve(__dirname, 'src/background/background.ts'),
                    habiticaContent: resolve(__dirname, 'src/content/habitica-detector.ts'),
                    googleContent: resolve(__dirname, 'src/content/google-detector.ts'),
                },
                output: {
                    entryFileNames: 'assets/[name].js',
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name].[ext]'
                }
            },
            outDir: 'dist',
            emptyOutDir: true
        }
    };
});
