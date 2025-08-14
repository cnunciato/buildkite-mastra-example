import { MCPClient, MastraMCPServerDefinition } from "@mastra/mcp";

let servers: Record<string, MastraMCPServerDefinition> = {};
const rootPath = "/Users/cnunciato/Projects/cnunciato/buildkite-mastra-example";

if (process.env.BUILDKITE_API_TOKEN) {
    servers["buildkite"] = {
        command: "docker",
        args: [
            "run",
            "-i",
            "--rm",
            "-e",
            `BUILDKITE_API_TOKEN`,
            "ghcr.io/buildkite/buildkite-mcp-server",
            "stdio",
        ],
        env: {
            BUILDKITE_API_TOKEN: process.env.BUILDKITE_API_TOKEN,
        },
    };
}

servers["git"] = {
    command: "docker",
    args: [
        "run",
        "-i",
        "--rm",
        "--mount",
        `type=bind,src=${rootPath},dst=${rootPath}`,
        "mcp/git",
    ],
};

servers["filesystem"] = {
    command: "npx",
    args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        rootPath,
    ],
};

if (process.env.GITHUB_TOKEN) {
    servers["github"] = {
        url: new URL("https://api.githubcopilot.com/mcp/"),
        requestInit: {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
        },
    };
}

servers["fetch"] = {
    command: "docker",
    args: ["run", "-i", "--rm", "mcp/fetch"],
};

export const mcp = new MCPClient({
    servers,
});
