import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://127.0.0.1:5000";
  const aiServiceTarget = env.VITE_AI_SERVICE_TARGET || "http://127.0.0.1:8003";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/uploads": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/ai": {
          target: aiServiceTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
