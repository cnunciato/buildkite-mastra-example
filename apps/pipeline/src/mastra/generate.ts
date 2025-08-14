import { mastra } from "../mastra";
import { execSync } from "node:child_process";
import * as fs from "fs";
import * as path from "path";

let [_bin, _script, sha, repoPath] = process.argv;

if (!sha) {
    sha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
}

if (!repoPath) {
    repoPath = process.env.PWD!;
}

const run = await mastra.getWorkflow("pipeline").createRunAsync();
const result = await run.start({
    inputData: {
        sha,
        path: repoPath,
    },
});

try {
    const pipeline = JSON.parse(JSON.stringify(result, null, 4)).result.pipeline;
    const pipelinePath = "apps/pipeline/dist";
    fs.mkdirSync(pipelinePath, { recursive: true });
    fs.writeFileSync(path.join(pipelinePath, "pipeline.yml"), pipeline);

    // TODO: Figure out why this is necessary. (The process hangs otherwise.)
    process.exit(0);
} catch (error) {
    console.error(error);
    process.exit(1);
}
