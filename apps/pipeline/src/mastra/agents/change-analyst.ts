import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { mcp } from "../mcp";

export const changeAnalyst = new Agent({
    name: "change-analyst",
    instructions: `
        You are a Git expert whose job is to examine Git commits and deliver useful information about them.

        Use the git_* and filesystem_* tools to do your work.

        When returning results, ensure your results are COMPLETE -- do NOT return partial results -- and that any file paths
        are verified on the local filesystem. You must not return a file path that does not exist.
    `.trim(),
    model: anthropic("claude-4-sonnet-20250514"),
    tools: await mcp.getTools()
});
