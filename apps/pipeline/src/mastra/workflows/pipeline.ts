import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { mcp } from "../mcp";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Pipeline } from "@buildkite/buildkite-sdk";

const execFileAsync = promisify(execFile);

const getTestCategories = createStep({
    id: "get-test-categories",
    description: "Lists the files that were changed in a given Git commit.",
    inputSchema: z.object({
        sha: z.string().describe("The Git SHA of the commit to examine"),
        path: z.string().describe("The fully qualified path to the Git repository"),
    }),
    outputSchema: z.object({
        categories: z.array(z.string()).describe("The list of test categories to be run."),
    }),
    execute: async ({ inputData, mastra }) => {
        const { sha, path } = inputData;

        const { stdout: log } = await execFileAsync("git", ["show", sha], { cwd: path });

        const prompt = `
            Analyze the the following Git log and diff and decide whether to run either the 'unit' tests, 'e2e' tests, or both for the application at 'apps/web':

            ${log}

            Return your results as a list of strings consisting of only "unit" or "e2e". No other options are valid.

            If the commit indicates no changes were made to 'apps/web', return an empty list.
        `.trim();

        const agent = mastra.getAgent("changeAnalyst");
        const response = await agent.generate(prompt.trim(), {
            output: z.object({
                categories: z
                    .array(z.string())
                    .describe(
                        "The list of test categories that should be run, based on the supplied Git metadata.",
                    ),
            }),
            toolsets: await mcp.getToolsets(),
        });

        return {
            categories: response.object.categories,
        };
    },
});

const generatePipeline = createStep({
    id: "get-affected-paths",
    description: "Lists the files that were changed in a given Git commit.",
    inputSchema: z.object({
        categories: z.array(z.string().describe("The list of test categories to be run")),
    }),
    outputSchema: z.object({
        pipeline: z.string().describe("The Buildkite pipeline YAML"),
    }),
    execute: async ({ inputData, mastra }) => {
        const { categories } = inputData;

        const pipeline = new Pipeline();

        categories.forEach(category => {
            pipeline.addStep({
                label: ":rocket: Do stuff!",
                command: `npm run test:${category}`,
            });
        });

        return {
            pipeline: pipeline.toYAML(),
        };
    },
});

export const pipeline = createWorkflow({
    id: "pipeline",
    inputSchema: z.object({
        sha: z.string().describe("The Git SHA to examine"),
        path: z.string().describe("The Git repository path"),
    }),
    outputSchema: z.array(z.string()).describe("The Buildkite pipeline YAML"),
})
    .then(getTestCategories)
    .then(generatePipeline)
    .commit();
