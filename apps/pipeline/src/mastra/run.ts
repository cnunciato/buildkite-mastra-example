import { mastra } from "./";
import { execSync } from "node:child_process";
import * as fs from "fs";

const [_bin, _script, sha, path] = process.argv;

const run = await mastra.getWorkflow("pipeline").createRunAsync();

const result = await run.start({
    inputData: {
        sha: sha || execSync("git rev-parse HEAD", { encoding: "utf8" }).trim(),
        path: path || process.env.PWD!,
    },
});

const pipeline = JSON.parse(JSON.stringify(result, null, 4)).result.pipeline;

fs.mkdirSync(".buildkite", { recursive: true });
fs.writeFileSync(".buildkite/pipeline.yml", pipeline);
process.exit(0);
