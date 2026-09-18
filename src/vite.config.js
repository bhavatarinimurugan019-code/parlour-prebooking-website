const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  root: path.resolve(__dirname, "frontend"),
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: path.resolve(__dirname, "frontend/index.html"),
        booking: path.resolve(__dirname, "frontend/booking.html"),
        admin: path.resolve(__dirname, "frontend/admin.html"),
        success: path.resolve(__dirname, "frontend/success.html")
      }
    }
  }
});