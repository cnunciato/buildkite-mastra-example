import { MCPClient, MastraMCPServerDefinition } from "@mastra/mcp";
import * as path from "path";

let servers: Record<string, MastraMCPServerDefinition> = {};

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

// servers["git"] = {
//     command: "uvx",
//     args: ["mcp-server-git"],
// };

if (process.env.PWD) {
    servers["filesystem"] = {
        command: "npx",
        args: [
            "-y",
            "@modelcontextprotocol/server-filesystem",
            path.join(process.env.PWD, "..", ".."),
        ],
    };
}

// if (process.env.GITHUB_TOKEN) {
//     servers["github"] = {
//         url: new URL("https://api.githubcopilot.com/mcp/"),
//         requestInit: {
//             headers: {
//                 Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
//             },
//         },
//     };
// }

// servers["fetch"] = {
//     command: "docker",
//     args: ["run", "-i", "--rm", "mcp/fetch"],
// };

export const mcp = new MCPClient({
    servers,
});
