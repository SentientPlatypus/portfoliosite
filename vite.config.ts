import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Set base for GitHub Pages deployment
// Use repository name as base path for production (GitHub Pages), '/' for development
function getBase(mode: string) {
  return mode === "production" ? "/" : "/";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: getBase(mode),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
