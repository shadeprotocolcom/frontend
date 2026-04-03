import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  timeout: 30000,
  use: {
    headless: true,
    baseURL: "http://localhost:3060",
  },
});
