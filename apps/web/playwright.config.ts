import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./test/e2e",
    reporter: "list",
    use: {
        baseURL: "http://localhost:4321",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
    ],
    webServer: {
        command: "npm run dev",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
    },
});
