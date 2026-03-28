import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const outDir = resolve(__dirname, "../prj-backend-eval-desempenno/wwwroot/js/home");

  return {
    root: resolve(__dirname, "src"),
    envDir: __dirname,
    publicDir: false,
    plugins: [
      react({reactCompiler: true}),
      tailwindcss(),
    ],
    build: {
      outDir,
      manifest: "manifest.json",
      cssCodeSplit: true,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          home: resolve(__dirname, "src/home/index.jsx"),
        },
        output: {
          entryFileNames: "[name].[hash].js",
          chunkFileNames: "chunks/[name].[hash].js",
          assetFileNames: "assets/[name].[hash].[ext]",
        },
      },
    },
    server: {
      port: 5120,
      strictPort: true,
      hmr: {
        host: "localhost",
        protocol: "ws",
      },
      proxy: isDev
        ? {
            "/llamada": {
              target: "http://localhost:5220",
              changeOrigin: true,
              secure: false,
            }
          }
        : undefined,
    },
    base: isDev ? "/" : "/evaluacion/js/home/",
  };
});
