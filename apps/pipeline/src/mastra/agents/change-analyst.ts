import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { mcp } from "../mcp";

export const changeAnalyst = new Agent({
    name: "change-analyst",
    instructions: `
        You are a senior-level software engineer whose job is to analyze the changes introduced into
        a codebase and make decisions about how best to test it. Given the content of a Git commit (e.g., a diff)
        and access to the full source tree at a given path, you use your expert knowledge of Git and understanding
        of the codebase to recommend which tests to run.

        Your job is to ensure that ONLY the tests that NEED to be run get run.

        You should use the 'filesystem' tool as needed for this.
    `.trim(),
    model: anthropic("claude-4-sonnet-20250514"),
    tools: await mcp.getTools(),
});
