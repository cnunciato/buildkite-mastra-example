import { mastra } from "./";
import * as fs from "fs";

const [_bin, _script, sha, path] = process.argv;

const run = await mastra.getWorkflow("pipeline").createRunAsync();

const result = await run.start({
    inputData: {
        sha,
        path,
    },
});

const pipeline = JSON.parse(JSON.stringify(result, null, 4)).result.pipeline;

fs.mkdirSync(".buildkite", { recursive: true });
fs.writeFileSync(".buildkite/pipeline.yml", pipeline);
process.exit(0);
