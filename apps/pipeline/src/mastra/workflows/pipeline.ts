import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { mcp } from "../mcp";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Pipeline } from "@buildkite/buildkite-sdk";

const execFileAsync = promisify(execFile);

const getAffectedPaths = createStep({
    id: "get-affected-paths",
    description: "Lists the files that were changed in a given Git commit.",
    inputSchema: z.object({
        sha: z.string().describe("The Git SHA of the commit to examine"),
        path: z.string().describe("The fully qualified path to the Git repository"),
    }),
    outputSchema: z.object({
        affected: z.array(z.string()).describe("The list of affected projects."),
    }),
    execute: async ({ inputData, mastra }) => {
        const { sha, path } = inputData;
        const agent = mastra.getAgent("changeAnalyst");

        const { stdout } = await execFileAsync(
            "git",
            ["show", "--name-only", "--pretty=format:", sha],
            { cwd: path },
        );

        console.log(stdout.trim());

        console.log();

        const prompt = `
            Using the git_git_show tool, list the filenames that were changed in the Git SHA '${sha}'
            in the current Git repository.
        `;

        const response = await agent.generate(prompt.trim(), {
            output: z.object({
                affected: z
                    .array(z.string())
                    .describe("The list of files that were changed in the specified Git commit."),
            }),
            toolsets: await mcp.getToolsets(),
        });

        return {
            affected: response.object.affected,
        };
    },
});

export const pipeline = createWorkflow({
    id: "pipeline",
    inputSchema: z.object({
        sha: z.string().describe("The Git SHA to examine"),
        path: z.string().describe("The Git repository path"),
    }),
    outputSchema: z
        .array(z.string())
        .describe("The list of files that were changed in the specified Git commit."),
})
    .then(getAffectedPaths)
    .commit();
