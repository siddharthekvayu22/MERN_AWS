import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    SERVER_URL: JSON.stringify(
      process.env.NODE_ENV === "production" 
        ? "http://13.204.66.128:5000" 
        : "http://localhost:5000"
    ),
  },
});
