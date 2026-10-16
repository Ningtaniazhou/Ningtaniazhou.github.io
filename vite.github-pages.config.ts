import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { BASE_PATH } from "./app/asset-path";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(projectRoot, "github-pages"),
  publicDir: path.join(projectRoot, "public"),
  base: BASE_PATH,
  plugins: [react()],
  build: {
    rollupOptions: { input: { zh: path.join(projectRoot, "github-pages/index.html"), pt: path.join(projectRoot, "github-pages/pt/index.html") } },
    outDir: path.join(projectRoot, "dist", "github-pages"),
    emptyOutDir: true,
  },
});
