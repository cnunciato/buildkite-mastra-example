import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { mcp } from "../mcp";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Pipeline } from "@buildkite/buildkite-sdk";

const execFileAsync = promisify(execFile);

const determineTestTypes = createStep({
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

        const { stdout: log } = await execFileAsync("git", ["show", sha], {
            cwd: path,
        });

        const prompt = `
            Analyze the following Git log and diff and decide whether to run either the 'unit' tests,
            end-to-end ('e2e') tests, or both, for the application that lives at './apps/web':

            ${log}

            Return your results as an object containing a list of strings consisting of only "unit"
            or "e2e" — no other options are valid — along with a brief explanation of your reasoning.

            Examples:
            {
                categories: [
                    "unit",
                    "e2e"
                ],
                reason: "I chose to run both unit and e2e tests because I saw that the shared module 'src/content/site.ts' was included in the change."
            }

            Guidelines:
            - Disregard code comments and changes to READMEs entirely. When deciding whether to run tests,
              only consider changes made to actual program code.
            - If the commit makes no changes any code files in the './apps/web' folder, return an empty list.
        `;

        const agent = mastra.getAgent("changeAnalyst");
        const response = await agent.generate(prompt.trim(), {
            output: z.object({
                categories: z
                    .array(z.string())
                    .describe(
                        "The list of test categories that should be run, based on the supplied Git metadata.",
                    ),
                reason: z
                    .string()
                    .describe("A brief explanation as to why these categories were chosen"),
            }),
            toolsets: await mcp.getToolsets(),
        });

        console.log(`--- :teacher: Explain reasoning`);
        console.log(response.object.reason);
        console.log();

        return {
            categories: response.object.categories,
        };
    },
});

const generatePipeline = createStep({
    id: "generate-pipeline",
    description: "Generates the Buildkite pipeline to run the unit or e2e tests.",
    inputSchema: z.object({
        categories: z.array(z.string().describe("The list of test categories to be run")),
        reason: z.string().describe("A brief explanation as to why these categories were chosen"),
    }),
    outputSchema: z.object({
        pipeline: z.string().describe("The Buildkite pipeline YAML"),
    }),
    execute: async ({ inputData }) => {
        const { categories } = inputData;

        const pipeline = new Pipeline();
        const emojis: { [key: string]: string } = {
            unit: ":vitest:",
            e2e: ":playwright:",
        };

        if (categories.length > 0) {
            pipeline.addStep({
                group: ":test_tube: Run the tests",
                steps: categories.map(category => {
                    return {
                        label: `${emojis[category]} Run ${category} tests`,
                        commands: ["npm install", `npm -w web run test:${category}`],
                    };
                }),
            });
        }

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
    .then(determineTestTypes)
    .then(generatePipeline)
    .commit();
