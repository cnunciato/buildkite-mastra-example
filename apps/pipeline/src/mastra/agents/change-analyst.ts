import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { mcp } from "../mcp";

export const changeAnalyst = new Agent({
    name: "change-analyst",
    instructions: `
        You are a senior-level software engineer whose job is to analyze the changes being introduced into
        a software system and deliver useful information about them. Given a Git SHA and the source tree
        associated with it, your role is to examine the files that comprise the change and understand how
        they impact the tree as a whole.

        You should use the 'git' and 'filesystem' tools to do your work.
    `.trim(),
    model: anthropic("claude-4-sonnet-20250514"),
    tools: await mcp.getTools(),
});
